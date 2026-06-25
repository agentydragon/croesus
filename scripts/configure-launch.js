#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = parseArgs(process.argv.slice(2));
const configPath = path.join(__dirname, "..", "site", "config.js");

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

function usage() {
  return [
    "Usage:",
    "  node scripts/configure-launch.js --payment=https://buy.stripe.com/... --email=sales@example.com --site=https://example.com",
    "",
    "Optional:",
    "  --booking=https://cal.com/...",
    "  --crypto=ethereum:0x..."
  ].join("\n");
}

function assertValid() {
  if (!args.payment && !args.crypto) {
    throw new Error("Provide --payment or --crypto.\n\n" + usage());
  }
  if (!args.email && !args.booking) {
    throw new Error("Provide --email or --booking.\n\n" + usage());
  }
  if (!args.site) {
    throw new Error("Provide --site.\n\n" + usage());
  }
}

assertValid();

const config = {
  stripePaymentLink: args.payment || "",
  cryptoPaymentUri: args.crypto || "",
  contactEmail: args.email || "",
  bookingUrl: args.booking || "",
  siteUrl: args.site || ""
};

const body = "window.CROESUS_CONFIG = " + JSON.stringify(config, null, 2) + ";\n";
fs.writeFileSync(configPath, body);
console.log("Updated site/config.js");
