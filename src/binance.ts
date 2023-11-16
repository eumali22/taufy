import * as dotenv from 'dotenv';
import Binance from 'binance-api-node';
import crypto from 'crypto';

dotenv.config();

const apiKey = process.env.BINANCE_API_KEY || '';
const apiSecret = process.env.BINANCE_SECRET_KEY || '';


export const generateSignature = (stringToSign: string) => {
  var hash = crypto.createHmac('sha256', apiSecret).update(stringToSign).digest('hex');
  return hash;
}

export const getFundingWalletAsset = async (asset: string) => {
  const BinanceClient = (Binance as any).default;

  const client = BinanceClient({ apiKey, apiSecret });
  const response = await client.fundingWallet({
    needBtcValuation: true,
    useServerTime: true
  });

  console.log(response);
  
}

const publicCall = async (url: string) => {
  const response = await fetch(url, {
    'method': 'GET',
    'headers': {
      'Content-Type': 'application/json'
    }
  });
  return response;
}

type PriceJson = {
  symbol: string,
  price: number
}

export const getPrice = async (sym: string) => {
  const response = await publicCall(`https://www.binance.com/api/v3/ticker/price?symbol=${sym}`);
  const json: PriceJson = await response.json();
  return json.price;
}

export const getAllCoinsInfo = async () => {
  const timestamp = new Date().getTime();
  console.log(timestamp);
  const hmacParam = `timestamp=${timestamp}&recvWindow=10000`;
  console.log(hmacParam);
  const signature = generateSignature(hmacParam);
  console.log(signature);
  const response = await fetch(`https://api.binance.com/sapi/v1/capital/config/getall?${hmacParam}&signature=${signature}`, {
    'method': 'GET',
    'headers': {
      'Content-Type': 'application/json',
      'X-MBX-APIKEY': apiKey
    }
  });

  const json = await response.json();
  console.log(json);
}

type Asset = {
  asset: string,
  free: string,
  locked: string,
  freeze: string,
  withdrawing: string,
  ipoable: string,
  btcValuation: string
}

export const getAllUserAssets = async () => {
  const timestamp = new Date().getTime() - 1000; // hack. this worked before but stopped altogether. probably due to Binance server time
  const hmacParam = `timestamp=${timestamp}&recvWindow=10000&needBtcValuation=true`;
  const signature = generateSignature(hmacParam);
  const response = await fetch(`https://api.binance.com/sapi/v3/asset/getUserAsset?${hmacParam}&signature=${signature}`, {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
      'X-MBX-APIKEY': apiKey
    }
  });

  const json: Array<Asset> | {code: number, msg: string} = await response.json();
  return json;
}

export const getServerTime = async () => {
  const response = await publicCall('https://api.binance.com/api/v1/time');
  const json = await response.json();
  return json.serverTime;
}

export const getAllAssetsValueInBTC = async () => {
  const assets = await getAllUserAssets();
  if (!Array.isArray(assets) && assets.msg) {
    throw new Error(assets.msg);
  } else {
    return (assets as Array<Asset>).reduce((pVal, cVal) => {
      return pVal + parseFloat(cVal.btcValuation);
    }, 0.0);
  }
}

// this function contains expensive calls. to be deprecated
export async function getBTCBalance() {
  // console.log((Binance as any).default);
  const BinanceClient = (Binance as any).default;

  const client = BinanceClient({ apiKey, apiSecret });
  let accountInfo;
  let prices;

  try {
    accountInfo = await client.accountInfo({ useServerTime: true });
    
    prices = await client.prices();
  } catch (e) {
    console.log('Error connecting to Binance');
    return;
  }

  // console.log(accountInfo);

  const btcBalance = await calculateBTCBalance(accountInfo.balances, prices);

  console.log(
    `BTC: ${btcBalance.toFixed(5)
    } ($${(btcBalance * (prices as any).BTCUSDT).toFixed(2)})`,
  );
}

async function calculateBTCBalance(balances: Array<{ free: string, locked: string, asset: string }>, prices: any) {
  let totalBTCBalance = 0.0;

  for (let i = 0; i < balances.length; i++) {
    let balance = balances[i];
    let assetBtcValue = 0;

    const assetTotalBalance = parseFloat(balance.free) + parseFloat(balance.locked);

    if (assetTotalBalance > 0) {
      if (balance.asset === 'BTC') {
        assetBtcValue = assetTotalBalance;
      } else if (['USDT', 'BUSD'].includes(balance.asset)) {
        const assetPriceInBTC = prices[`BTC${balance.asset}`] ? prices[`BTC${balance.asset}`] : '0.0';
        assetBtcValue = assetTotalBalance / parseFloat(assetPriceInBTC ?? 0);
      } else {
        const assetPriceInBTC = prices[`${balance.asset}BTC`] ? prices[`${balance.asset}BTC`] : '0.0';
        // const assetPriceInBTC = await getPrice(`${balance.asset}BTC`);
        assetBtcValue = assetTotalBalance * parseFloat(assetPriceInBTC ?? 0);
      }

      console.log(`${balance.asset} in account: ${assetTotalBalance} | BTC value: ${assetBtcValue}`);
    }

    totalBTCBalance += assetBtcValue;
  }

  return totalBTCBalance;
}

