import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEO_API_KEY || '';

export const convertUSDtoPHP = async (usdVal: number) => {
  const response = await fetch(`https://api.getgeoapi.com/v2/currency/convert?api_key=${apiKey}&format=json&from=USD&to=PHP`);
  const json = await response.json();

  return json.rates.PHP.rate * usdVal;
}
