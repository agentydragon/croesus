#!/usr/bin/env node

const https = require("https");
const fs = require("fs");
const path = require("path");

const address = "13pQjTm4ESjPKMA9a5gQF4H1CH561axzqk";
const proofPath = path.join(__dirname, "..", "ops", "revenue-proof.csv");

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

function parseProofCsv() {
  const text = fs.readFileSync(proofPath, "utf8").trim();
  const lines = text ? text.split(/\r?\n/) : [];
  if (lines.length < 2) {
    return [];
  }
  const headers = lines[0].split(",");
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

async function main() {
  const wallet = await requestJson(`https://blockstream.info/api/address/${address}`);
  const fundedSats = wallet.chain_stats.funded_txo_sum + wallet.mempool_stats.funded_txo_sum;
  const txCount = wallet.chain_stats.tx_count + wallet.mempool_stats.tx_count;
  const proofRows = parseProofCsv();
  const loggedUsd = proofRows.reduce((sum, row) => sum + (Number(row.amount_usd) || 0), 0);

  console.log(`bitcoin_address=${address}`);
  console.log(`bitcoin_funded_sats=${fundedSats}`);
  console.log(`bitcoin_tx_count=${txCount}`);
  console.log(`logged_revenue_usd=${loggedUsd}`);
  console.log(`logged_payment_rows=${proofRows.length}`);

  if (fundedSats === 0 && loggedUsd === 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
