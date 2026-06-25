# Croesus AI Spend Audit

Croesus is a monthly AI spend leak review for teams already paying for OpenAI,
Anthropic, or other LLM APIs.

Send a redacted usage CSV. Receive a one-page report with concrete cuts for
model routing, prompt size, cache misses, retry loops, and spend spikes.

## Launch Offer

- First 5 customers: `$100/month`
- Standard price after launch: `$200/month`
- Refund rule: if the first review cannot identify savings or risk reduction
  worth at least the first-month fee, refund the first month.

## Buy

Bitcoin payment URI:

```text
bitcoin:13pQjTm4ESjPKMA9a5gQF4H1CH561axzqk?label=Croesus%20AI%20Spend%20Review&message=Croesus%20monthly%20AI%20spend%20review
```

Generate a current `$100` BTC quote:

```sh
npm run payment:quote
```

Payment/contact issue:

```text
https://github.com/agentydragon/croesus/issues/1
```

Launch discussion:

```text
https://github.com/agentydragon/croesus/discussions/2
```

After payment, open an issue or comment with a redacted CSV containing:

- Date
- Feature or team
- Model
- Input tokens
- Output tokens
- Cached tokens
- Request count
- Cost

## What You Get

- Review of one month of usage exports or billing line items
- Estimated monthly savings and risk-reduction opportunities
- Specific first implementation step
- One-page report suitable for an engineering owner
- Optional monthly repeat review

Sample report:

```text
https://github.com/agentydragon/croesus/blob/main/docs/sample-audit-report.md
```

## Tool

The static audit tool is in `site/`. It runs locally and does not require a
server:

```sh
npm run serve
```

Then open `http://localhost:8123`.

Generate a sample report:

```sh
npm run audit:sample
```

## Operations

Check launch readiness:

```sh
npm run launch:check
```

Render the next outreach batch:

```sh
npm run outreach:batch
```

Check received revenue:

```sh
npm run revenue:check
```

The wallet private key is intentionally not committed. It is generated locally
under `.secrets/` and must be backed up before accepting funds.
