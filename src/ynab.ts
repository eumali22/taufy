// import fetch from 'node-fetch';

type BudgetJson = {
  data: {
    budgets: Array<object>,
    default_budget: unknown
  }
};

type AssertBudgetJsonFn = (value: unknown) => asserts value is BudgetJson;

const assertBudgetJson: AssertBudgetJsonFn = (value) => {
  if (!value || typeof value !== 'object' || (typeof (value as BudgetJson).data !== 'object')) {
    throw new Error('error in parsing fetched value to BudgetJson type');
  }
}

export const getAllBudgets = async (token: string) => {
  const response = await fetch('https://api.youneedabudget.com/v1/budgets', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  const json = await response.json();
  assertBudgetJson(json);
  return json.data.budgets;
}

export const postTransaction = async (token: string, budgetId: string, payload: object) => {
  const response = await fetch(`https://api.youneedabudget.com/v1/budgets/${budgetId}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  return response;
}

export const getLatestAccountTransactions = async (token: string, budgetId: string, accountId: string, sinceDate: string) => {
  const response = await fetch(`https://api.youneedabudget.com/v1/budgets/${budgetId}/accounts/${accountId}/transactions?since_date=${sinceDate}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await response.json();
  return json.data;
}

export const getAccountBalance = async (token: string, budgetId: string, accountId: string) => {
  const response = await fetch(`https://api.youneedabudget.com/v1/budgets/${budgetId}/accounts/${accountId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await response.json();
  return json.data.account.balance;
}