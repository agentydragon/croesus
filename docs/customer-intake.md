# Customer Intake

Use this when a prospect responds or pays.

## Payment

Current Bitcoin receiving address:

```text
13pQjTm4ESjPKMA9a5gQF4H1CH561axzqk
```

Check for transactions:

```sh
curl -sS https://blockstream.info/api/address/13pQjTm4ESjPKMA9a5gQF4H1CH561axzqk
```

Record confirmed payment in `ops/revenue-proof.csv`.

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
