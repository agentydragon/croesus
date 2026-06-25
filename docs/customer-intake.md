# Customer Intake

Use this when a prospect responds or pays.

## Payment

Current Bitcoin receiving address:

```text
13pQjTm4ESjPKMA9a5gQF4H1CH561axzqk
```

Generate a current `$100` payment URI:

```sh
npm run payment:quote
```

Check for transactions:

```sh
npm run revenue:check
```

Record confirmed payment in `ops/revenue-proof.csv`.

Public intake links:

- Checkout/contact issue: https://github.com/agentydragon/croesus/issues/1
- Launch discussion: https://github.com/agentydragon/croesus/discussions/2
- Launch release: https://github.com/agentydragon/croesus/releases/tag/launch-2026-06-25

## Data Request

Ask for a redacted CSV with these columns:

```csv
date,project,model,input_tokens,output_tokens,cached_tokens,requests,cost_usd,latency_ms
```

## Fulfillment

Generate a report:

```sh
node scripts/audit-csv.js customer.csv --customer=CustomerName --month=2026-06 --spend=2500 --fee=100
```

Send the report within 24 hours. Ask for permission to reuse anonymized savings
numbers in future outreach.
