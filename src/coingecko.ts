
type BTCPHP = {
  bitcoin: {
    php: number
  }
}

export const convertBTCtoPHP = async (btcVal: number) => {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=php', {
    'method': 'GET',
    'headers': {
      'Content-Type': 'application/json'
    }
  });
  const json: BTCPHP = await response.json();
  return json.bitcoin.php * btcVal;
}