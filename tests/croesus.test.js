const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(path.join(__dirname, "..", "site", "app.js"), "utf8");

function makeElement() {
  return {
    value: "",
    textContent: "",
    innerHTML: "",
    href: "",
    classList: {
      toggle() {}
    },
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

const csv = [
  "date,project,model,input_tokens,output_tokens,cached_tokens,requests,cost_usd,latency_ms",
  "2026-06-01,Agent,gpt-4.1,1000000,200000,10000,200,120,3000",
  "2026-06-02,Search,gpt-4.1-mini,800000,100000,300000,900,25,700",
  "2026-06-03,Sales,claude-sonnet-4,900000,300000,0,100,140,3100"
].join("\n");

const parsed = sandbox.window.Croesus.parseCsv(csv);
if (parsed.length !== 3) {
  throw new Error("expected three parsed rows");
}

const rows = sandbox.window.Croesus.normalizeRows(parsed);
if (rows[0].model !== "gpt-4.1" || rows[1].cost !== 25) {
  throw new Error("expected normalized model and cost fields");
}

const report = sandbox.window.Croesus.analyze(rows, 1000, 150, 100);
if (report.estimatedWaste <= 0) {
  throw new Error("expected positive estimated waste");
}
if (report.findings.length < 1) {
  throw new Error("expected audit findings");
}
if (report.payback <= 0) {
  throw new Error("expected positive payback");
}

console.log("croesus analysis tests passed");
