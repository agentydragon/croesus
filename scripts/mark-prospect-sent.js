#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = parseArgs(process.argv.slice(2));
const prospectsPath = path.join(__dirname, "..", "ops", "prospects.csv");

function parseArgs(argv) {
  const parsed = {};
  argv.forEach((arg) => {
    if (!arg.startsWith("--")) {
      return;
    }
    const index = arg.indexOf("=");
    if (index === -1) {
      parsed[arg.slice(2)] = "true";
    } else {
      parsed[arg.slice(2, index)] = arg.slice(index + 1);
    }
  });
  return parsed;
}

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
  return rows;
}

function writeCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell || "");
          if (/[",\n\r]/.test(text)) {
            return '"' + text.replace(/"/g, '""') + '"';
          }
          return text;
        })
        .join(",")
    )
    .join("\n") + "\n";
}

if (!args.company) {
  console.error("Usage: node scripts/mark-prospect-sent.js --company=Foyer [--date=2026-06-25] [--response=...] [--status=...]");
  process.exit(1);
}

const date = args.date || new Date().toISOString().slice(0, 10);
const rows = parseCsv(fs.readFileSync(prospectsPath, "utf8"));
const headers = rows[0];
const companyIndex = headers.indexOf("company");
const sentIndex = headers.indexOf("message_sent_date");
const responseIndex = headers.indexOf("response");
const statusIndex = headers.indexOf("payment_status");
const notesIndex = headers.indexOf("notes");
const target = args.company.toLowerCase();
let changed = false;

rows.slice(1).forEach((row) => {
  if (String(row[companyIndex] || "").toLowerCase() !== target) {
    return;
  }
  row[sentIndex] = date;
  if (args.response) {
    row[responseIndex] = args.response;
  }
  if (args.status) {
    row[statusIndex] = args.status;
  }
  if (args.notes) {
    row[notesIndex] = row[notesIndex] ? row[notesIndex] + " | " + args.notes : args.notes;
  }
  changed = true;
});

if (!changed) {
  console.error(`No prospect found for company: ${args.company}`);
  process.exit(1);
}

fs.writeFileSync(prospectsPath, writeCsv(rows));
console.log(`Marked ${args.company} sent on ${date}`);
