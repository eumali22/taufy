import * as dotenv from 'dotenv';
import { getAllBudgets, postTransaction } from './ynab.js';

dotenv.config();

console.log('Hello world!');

const ynabToken = process.env.YNAB_TOKEN || '';

// (async function() {
//   const budgets = await getAllBudgets(ynabToken);
//   for (let b of budgets) {
//     console.log(b);
//   }
// })();

/*
(async function() {
  const eToroPayload = {
    "transaction": {
      "account_id": process.env.ETORO_ACCT_ID,
      "date": "2022-11-24",
      "amount": 10000,
      // "payee_id": "string",
      // "payee_name": "string",
      // "category_id": "string",
      // "memo": "string",
      "cleared": "cleared",
      "approved": true,
      // "flag_color": "red",
      // "import_id": "string",
      // "subtransactions": [
      //   {
      //     "amount": 0,
      //     "payee_id": "string",
      //     "payee_name": "string",
      //     "category_id": "string",
      //     "memo": "string"
      //   }
      // ]
    },
  }

  const response = await postTransaction(ynabToken, process.env.BUDGET_ID || '', eToroPayload);
  if (response.status !== 201) {
    console.log(`Create transaction failed: ${response.status} ${response.statusText}`);
  } else {
    console.log(`Create transaction success: ${response.status} ${response.statusText}`);
  }
})();
*/