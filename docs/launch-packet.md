# Launch Packet

Use these posts manually in places where the user controls the account. Do not
post into communities that prohibit commercial launches.

## Primary Links

- Checkout/contact: https://github.com/agentydragon/croesus/issues/1
- Launch discussion: https://github.com/agentydragon/croesus/discussions/2
- Launch release: https://github.com/agentydragon/croesus/releases/tag/launch-2026-06-25
- Sample report: https://github.com/agentydragon/croesus/blob/main/docs/sample-audit-report.md

## One-Line Pitch

Croesus is a $100/month AI spend audit for teams already paying OpenAI,
Anthropic, or other LLM API bills.

## Short Post

I am looking for 5 teams already spending money on OpenAI, Anthropic, or other
LLM APIs.

I built Croesus, a monthly AI spend leak review. Send a redacted usage or billing
CSV and I will return a one-page report with concrete cuts for model routing,
prompt size, caching gaps, retry loops, spend spikes, and missing budget guards.

Launch price: $100/month. Refund if the first review cannot identify savings or
risk reduction worth at least the first-month fee.

Sample report: https://github.com/agentydragon/croesus/blob/main/docs/sample-audit-report.md
Checkout/contact: https://github.com/agentydragon/croesus/issues/1

## Direct Message

Subject: find waste in {{company}}'s LLM bill

Hi {{name}},

I saw {{specific_signal}}. If {{company}} is already paying for LLM APIs, I can
run a Croesus audit against a redacted usage export and send back concrete cuts:
model routing, prompt trimming, cache fixes, retry loops, spend spikes, and
budget guards.

Launch price is $100/month for the first 5 customers. Refund if I cannot find
savings or risk reduction worth the first-month fee.

Sample report:
https://github.com/agentydragon/croesus/blob/main/docs/sample-audit-report.md

Checkout/contact:
https://github.com/agentydragon/croesus/issues/1

## Community Post

Show HN style title:

```text
Show HN: Croesus - a monthly audit for AI API spend leaks
```

Body:

```text
I built a small AI spend audit workflow for teams already paying OpenAI,
Anthropic, or other LLM API bills.

The review looks for premium-model overuse, oversized prompts, missing prompt
caching, retry loops, spend spikes, and missing budget guards. The output is a
one-page report with estimated monthly impact and a first implementation step.

Launch price is $100/month for the first 5 customers. Refund if the first review
cannot identify savings or risk reduction worth the fee.

Sample report:
https://github.com/agentydragon/croesus/blob/main/docs/sample-audit-report.md

Checkout/contact:
https://github.com/agentydragon/croesus/issues/1
```

## Qualification

Good fit:

- Monthly LLM API spend above $500
- Production AI feature or internal AI automation
- Has model, token, request, cache, and cost data available
- Founder, CTO, engineering, or operations owner cares about spend

Poor fit:

- No usage export or billing line-item access
- No recurring AI API spend yet
- Needs implementation work rather than audit recommendations
