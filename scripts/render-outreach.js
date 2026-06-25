#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith("--"));
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const onlyUnsent = args.includes("--only-unsent");
const prospectsPath = positional[0] || path.join("ops", "prospects.csv");
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;
const configPath = path.join("site", "config.js");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((cells) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = cells[index] || "";
    });
    return item;
  });
}

function readConfig() {
  if (!fs.existsSync(configPath)) {
    return {};
  }

  const source = fs.readFileSync(configPath, "utf8");
  const match = source.match(/window\.CROESUS_CONFIG\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    return {};
  }

  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch (error) {
    throw new Error(`Could not parse ${configPath}: ${error.message}`);
  }
}

function render(prospect, config) {
  const name = prospect.contact_name || "there";
  const company = prospect.company || "your team";
  const signal = prospect.signal || "you are shipping AI features";
  const paymentLink = prospect.payment_link || config.stripePaymentLink || config.cryptoPaymentUri || config.siteUrl || "[payment link]";
  const contact = config.contactEmail || config.bookingUrl || config.siteUrl || "[contact link]";
  const sourceLine = prospect.signal_url ? `Source signal: ${prospect.signal_url}` : "";

  const lines = [
    `Subject: find waste in ${company}'s LLM bill`,
    "",
    `Hi ${name},`,
    "",
    `I saw this signal: ${signal}. If ${company} is already paying for LLM APIs, I can run a monthly Croesus audit against your usage export and send back the concrete cuts: model routing, prompt trimming, cache fixes, retry loops, and budget guards.`,
    "",
    "The first 5 customers are $100/month. The target is to find more than the fee in avoidable spend during the first review.",
    "",
    `Checkout: ${paymentLink}`,
    "",
    "If you prefer, reply with a redacted usage CSV and I will tell you whether the audit is worth paying for.",
    "",
    `Contact: ${contact}`
  ];
  if (sourceLine) {
    lines.push("", sourceLine);
  }
  return lines.join("\n");
}

let prospects = parseCsv(fs.readFileSync(prospectsPath, "utf8"));
const config = readConfig();

if (onlyUnsent) {
  prospects = prospects.filter((prospect) => !prospect.message_sent_date);
}
if (limit > 0) {
  prospects = prospects.slice(0, limit);
}

if (prospects.length === 0) {
  console.error(`No prospects found in ${prospectsPath}`);
  process.exit(1);
}

prospects.forEach((prospect, index) => {
  console.log(`--- Prospect ${index + 1}: ${prospect.company || "Unknown"} ---`);
  console.log(render(prospect, config));
  console.log("");
});
