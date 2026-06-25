#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const allowIncomplete = process.argv.includes("--allow-incomplete");
const root = path.join(__dirname, "..");

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseConfig() {
  const source = readFile(path.join("site", "config.js"));
  const match = source.match(/window\.CROESUS_CONFIG\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    throw new Error("site/config.js does not define window.CROESUS_CONFIG");
  }

  return Function(`"use strict"; return (${match[1]});`)();
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return [];
  }
  const headers = lines[0].split(",");
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function isRealUrl(value) {
  const text = String(value || "").trim();
  return /^https?:\/\//i.test(text) && !/example\.|\.{3}/i.test(text);
}

function isCryptoUri(value) {
  const text = String(value || "").trim();
  return /^(bitcoin|ethereum|litecoin|solana):/i.test(text) && !/\.{3}/.test(text);
}

function isRealEmail(value) {
  const text = String(value || "").trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text) && !/example\.com$/i.test(text);
}

function report(name, ok, detail) {
  console.log(`${ok ? "ok" : "missing"} ${name}${detail ? ` - ${detail}` : ""}`);
  return ok;
}

const config = parseConfig();
const prospects = parseCsv(readFile(path.join("ops", "prospects.csv")));
const revenueProof = parseCsv(readFile(path.join("ops", "revenue-proof.csv")));

const checks = [
  report(
    "payment destination",
    isRealUrl(config.stripePaymentLink) || isCryptoUri(config.cryptoPaymentUri),
    "Stripe/Gumroad/etc. URL or crypto URI in site/config.js"
  ),
  report("sales contact", isRealEmail(config.contactEmail) || isRealUrl(config.bookingUrl), "email or booking URL in site/config.js"),
  report("published site URL", isRealUrl(config.siteUrl), "siteUrl in site/config.js"),
  report("prospect queue", prospects.length >= 30, `${prospects.length}/30 prospects in ops/prospects.csv`),
  report("revenue proof", revenueProof.some((row) => Number(row.amount_usd) > 0), "money received and logged")
];

const ready = checks.every(Boolean);
if (!ready && !allowIncomplete) {
  process.exitCode = 1;
}

