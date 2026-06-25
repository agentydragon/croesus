#!/usr/bin/env node

const https = require("https");

const address = "13pQjTm4ESjPKMA9a5gQF4H1CH561axzqk";
const launchUsd = Number(process.argv[2] || 100);

function requestJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`HTTP ${response.statusCode}: ${body}`));
            return;
          }
          resolve(JSON.parse(body));
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const quote = await requestJson("https://api.coinbase.com/v2/prices/BTC-USD/spot");
  const btcUsd = Number(quote.data.amount);
  if (!btcUsd) {
    throw new Error("Coinbase response did not include a BTC-USD amount");
  }

  const btcAmount = launchUsd / btcUsd;
  const uri = `bitcoin:${address}?amount=${btcAmount.toFixed(8)}&label=Croesus%20AI%20Spend%20Review&message=Croesus%20monthly%20AI%20spend%20review`;

  console.log(`btc_usd=${btcUsd.toFixed(2)}`);
  console.log(`usd_amount=${launchUsd.toFixed(2)}`);
  console.log(`btc_amount=${btcAmount.toFixed(8)}`);
  console.log(`bitcoin_address=${address}`);
  console.log(`payment_uri=${uri}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
