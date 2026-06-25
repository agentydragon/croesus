#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const secretsDir = path.join(root, ".secrets");
const publicPath = path.join(root, "ops", "payment-addresses.md");
const privatePath = path.join(secretsDir, "croesus-bitcoin-wallet.json");

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
}

function hash160(buffer) {
  return crypto.createHash("ripemd160").update(sha256(buffer)).digest();
}

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58(buffer) {
  let value = BigInt("0x" + buffer.toString("hex"));
  let output = "";

  while (value > 0n) {
    const remainder = Number(value % 58n);
    output = alphabet[remainder] + output;
    value = value / 58n;
  }

  for (const byte of buffer) {
    if (byte === 0) {
      output = "1" + output;
    } else {
      break;
    }
  }

  return output || "1";
}

function base58Check(payload) {
  const checksum = sha256(sha256(payload)).subarray(0, 4);
  return base58(Buffer.concat([payload, checksum]));
}

function extractPublicPoint(spkiDer) {
  const point = spkiDer.subarray(-65);
  if (point.length !== 65 || point[0] !== 0x04) {
    throw new Error("Could not extract uncompressed secp256k1 public key point");
  }
  return point;
}

function extractPrivateScalar(sec1Der) {
  for (let i = 0; i < sec1Der.length - 34; i += 1) {
    if (sec1Der[i] === 0x04 && sec1Der[i + 1] === 0x20) {
      return sec1Der.subarray(i + 2, i + 34);
    }
  }
  throw new Error("Could not extract secp256k1 private scalar");
}

if (fs.existsSync(privatePath)) {
  console.error(`${privatePath} already exists; refusing to overwrite wallet private key`);
  process.exit(1);
}

fs.mkdirSync(secretsDir, { recursive: true, mode: 0o700 });

const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "secp256k1"
});

const publicPoint = extractPublicPoint(publicKey.export({ type: "spki", format: "der" }));
const x = publicPoint.subarray(1, 33);
const y = publicPoint.subarray(33, 65);
const compressedPublicKey = Buffer.concat([Buffer.from([y[31] % 2 === 0 ? 0x02 : 0x03]), x]);
const address = base58Check(Buffer.concat([Buffer.from([0x00]), hash160(compressedPublicKey)]));

const sec1Der = privateKey.export({ type: "sec1", format: "der" });
const privateScalar = extractPrivateScalar(sec1Der);
const wif = base58Check(Buffer.concat([Buffer.from([0x80]), privateScalar, Buffer.from([0x01])]));
const paymentUri = `bitcoin:${address}?label=Croesus%20AI%20Spend%20Review&message=Croesus%20monthly%20AI%20spend%20review`;

const secretPayload = {
  warning: "Private key material. Do not commit. Back this file up before receiving funds.",
  network: "bitcoin-mainnet",
  address,
  wif,
  privateKeyPem: privateKey.export({ type: "sec1", format: "pem" }),
  publicKeyCompressedHex: compressedPublicKey.toString("hex"),
  paymentUri,
  createdAt: new Date().toISOString()
};

fs.writeFileSync(privatePath, JSON.stringify(secretPayload, null, 2) + "\n", { mode: 0o600 });
fs.writeFileSync(
  publicPath,
  [
    "# Payment Addresses",
    "",
    "## Bitcoin",
    "",
    `Address: \`${address}\``,
    "",
    `Payment URI: \`${paymentUri}\``,
    "",
    "Private key material is stored locally in `.secrets/croesus-bitcoin-wallet.json` and is ignored by git.",
    "Back it up before accepting funds.",
    ""
  ].join("\n")
);

console.log(`Bitcoin address: ${address}`);
console.log(`Payment URI: ${paymentUri}`);
console.log(`Private key file: ${privatePath}`);
