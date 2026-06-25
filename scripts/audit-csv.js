#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];

function parseArgs(argv) {
  const parsed = { _: [] };
  argv.forEach((arg) => {
    if (!arg.startsWith("--")) {
      parsed._.push(arg);
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

function usage() {
  return "Usage: node scripts/audit-csv.js assets/sample-usage.csv --customer=Acme --month=2026-06 --spend=2500 --fee=100";
}

if (!inputPath) {
  console.error(usage());
  process.exit(1);
}

function makeElement() {
  return {
    value: "",
    textContent: "",
    innerHTML: "",
    href: "",
    classList: { toggle() {} },
    setAttribute() {},
    addEventListener() {},
    getContext() {
      return {
        clearRect() {},
        fillRect() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        fillText() {},
        set fillStyle(value) {},
        set strokeStyle(value) {},
        set lineWidth(value) {},
        set font(value) {}
      };
    }
  };
}

function loadCroesus() {
  const source = fs.readFileSync(path.join(__dirname, "..", "site", "app.js"), "utf8");
  const elements = new Map();
  const sandbox = {
    console,
    window: {},
    document: {
      readyState: "loading",
      addEventListener() {},
      getElementById(id) {
        if (!elements.has(id)) {
          elements.set(id, makeElement());
        }
        return elements.get(id);
      }
    },
    Intl,
    Number,
    Math,
    Object,
    String,
    encodeURIComponent
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return sandbox.window.Croesus;
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Math.round(value || 0));
}

const Croesus = loadCroesus();
const csv = fs.readFileSync(inputPath, "utf8");
const rows = Croesus.normalizeRows(Croesus.parseCsv(csv));
const monthlySpend = Number(args.spend || 0);
const hourValue = Number(args.hourValue || 150);
const fee = Number(args.fee || 100);
const report = Croesus.analyze(rows, monthlySpend, hourValue, fee);
const customer = args.customer || "Customer";
const month = args.month || "Current month";

const lines = [
  `# AI Spend Audit Report: ${customer}`,
  "",
  `Month reviewed: ${month}`,
  `Rows analyzed: ${rows.length}`,
  `Estimated monthly waste: ${currency(report.estimatedWaste)}`,
  `Net first-month upside after ${currency(fee)} fee: ${currency(report.netUpside)}`,
  `Estimated payback: ${report.payback.toFixed(1)}x`,
  "",
  "## Findings",
  "",
  "| Priority | Finding | Estimated monthly impact | Recommendation |",
  "| --- | --- | ---: | --- |"
];

report.findings.forEach((finding, index) => {
  lines.push(`| P${index + 1} | ${finding.title} | ${currency(finding.value)} | ${finding.text} |`);
});

lines.push(
  "",
  "## First Implementation Step",
  "",
  report.findings[0] ? report.findings[0].text : "Segment usage by feature and owner, then rerun the audit.",
  "",
  "## Data Needed Next Month",
  "",
  "- Date",
  "- Feature or team",
  "- Model",
  "- Input tokens",
  "- Output tokens",
  "- Cached tokens",
  "- Request count",
  "- Cost"
);

console.log(lines.join("\n"));
