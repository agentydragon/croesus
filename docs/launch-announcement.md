# Croesus AI Spend Audit is open for the first 5 customers

Croesus is a monthly AI spend leak review for teams already paying for OpenAI,
Anthropic, or other LLM APIs.

You send a redacted usage or billing CSV. I send back a one-page report with
specific cuts for:

- premium model routing
- oversized prompts
- prompt caching gaps
- retry loops
- spend spikes
- missing budget guards

Launch price: `$100/month` for the first 5 customers. Standard price after the
launch cohort is `$200/month`.

Refund rule: if the first review cannot identify savings or risk reduction worth
at least the first-month fee, refund the first month.

Checkout/contact:

```text
https://github.com/agentydragon/croesus/issues/1
```

Bitcoin payment URI:

```text
bitcoin:13pQjTm4ESjPKMA9a5gQF4H1CH561axzqk?label=Croesus%20AI%20Spend%20Review&message=Croesus%20monthly%20AI%20spend%20review
```

Sample report:

```text
https://github.com/agentydragon/croesus/blob/main/docs/sample-audit-report.md
```

Useful CSV columns:

```csv
date,project,model,input_tokens,output_tokens,cached_tokens,requests,cost_usd,latency_ms
```
