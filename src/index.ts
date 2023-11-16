import * as dotenv from 'dotenv';
import { generateSignature, getAllAssetsValueInBTC, getPrice, getServerTime } from './binance.js';
import { convertBTCtoPHP } from './coingecko.js';
import { getAccountBalance, getLatestAccountTransactions, postTransaction } from './ynab.js';
import * as core from '@actions/core';
import { convertUSDtoPHP } from './geo.js';

dotenv.config();

const ynabToken = process.env.YNAB_TOKEN || '';
const budgetId = process.env.BUDGET_ID || '';
const binanceAccountId = process.env.BINANCE_ACCT_ID || '';

(async function() {
  
  // const timestamp = new Date().getTime();
  // const hmacParam = `timestamp=${timestamp}&recvWindow=20000&needBtcValuation=true`;
  // const signature = generateSignature(hmacParam);
  // console.log(timestamp);
  // console.log(signature);
  
  // return;

  // const bal = await getBTCBalance();

  // const btcVal = await getAllAssetsValueInBTC();
  // console.log(`Total BTC Value of asset: ${btcVal}`);
  
  // const phpVal = await convertBTCtoPHP(btcVal);
  // console.log(`PHP Value of Total BTC: ${phpVal}`);

  // get all transactions this past week
  /*
  const numOfDays = 7;
  let lastWeek = new Date();
  lastWeek.setTime(lastWeek.getTime() - numOfDays * 24 * 60 * 60 * 1000);
  const lastWeekIsoFormat = lastWeek.toISOString().split('T')[0];
  console.log('lastWeekIsoFormat: ' + lastWeekIsoFormat);
  
  const transactions = await getLatestAccountTransactions(ynabToken, budgetId, binanceAccountId, lastWeekIsoFormat);
  console.log(transactions);
  */

  try {
    const binanceBalance = await getAccountBalance(ynabToken, budgetId, binanceAccountId);
    console.log(`YNAB Binance account balance: ${binanceBalance}`);
  
    const dateToday = new Date();
    const isoDateFormat = dateToday.toISOString().split('T')[0];
    console.log(`Transaction date: ${isoDateFormat}`);
    
    // console.log('server time: ' + await getServerTime());
    // console.log('system time: ' + new Date().getTime());
  
    /* Fetch Total Binance Spot Value */
    const btcVal = await getAllAssetsValueInBTC();
    console.log(`Total BTC Value of asset: ${btcVal}`);

    const btcRate = await getPrice('BTCUSDT');
    console.log(`Current BTC price (in USD): ${btcRate}`);

    const usdVal = btcRate * btcVal;
    console.log(`USD Value of Total BTC: ${usdVal}`);

    // const phpVal = await convertBTCtoPHP(btcVal);
    const phpVal = await convertUSDtoPHP(usdVal);
    console.log(`PHP Value of Total BTC: ${phpVal}`);
  
    const binanceNewBalance = Math.round(phpVal * 1000);
    console.log(`Today's binance balance after ynab translation: ${binanceNewBalance}`);
    
    const diff = binanceNewBalance - binanceBalance;
  
    const binancePayload = {
      "transaction": {
        "account_id": process.env.BINANCE_ACCT_ID || '',
        "date": isoDateFormat,
        "amount": diff,
        // "payee_id": "string",
        // "payee_name": "string",
        // "category_id": "string",
        "memo": "Auto-added by taufy",
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
  
    // console.log(binancePayload);
    
    // return; 

    const response = await postTransaction(ynabToken, process.env.BUDGET_ID || '', binancePayload);
    const msg = `Create transaction ${response.status === 201 ? 'success' : 'failed'}: ${response.status} ${response.statusText}`;
    console.log(msg);
    if (response.status !== 201) core.setFailed(msg);

  } catch (error: any) {
    console.log(error.message);
    core.setFailed(error.message);
  }

})();

