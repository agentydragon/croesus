# Outreach

Use short, concrete messages. The ask is a paid audit, not a vague demo.

## Founder DM

Subject: quick AI spend check?

Hi {{name}},

I built a small AI spend audit for teams with OpenAI/Anthropic usage in
production. It looks for expensive model routing, oversized prompts, missing
prompt caching, and usage spikes.

Launch price is $100/month. If I cannot find at least that much in savings or
risk reduction from your usage export, I refund the first month.

Worth sending over last month's usage CSV?

{{signature}}

## Render First Batch

```sh
npm run outreach:batch
```

This renders up to 10 unsent prospects from `ops/prospects.csv`.

## CTO Email

Subject: find waste in {{company}}'s LLM bill

Hi {{name}},

Noticed {{company_signal}}. If your team is already paying for LLM APIs, I can
run a monthly Croesus audit against your usage export and send back the concrete
cuts: model routing, prompt trimming, cache fixes, retry loops, and budget
guards.

The first 5 customers are $100/month. The target is to find more than the fee in
avoidable spend during the first review.

Payment link: {{payment_link}}

If you prefer, reply with a redacted usage CSV and I will tell you whether the
audit is worth paying for.

{{signature}}

## Community Post

I am looking for 5 small teams already spending money on OpenAI, Anthropic, or
other LLM APIs.

I built Croesus, a monthly AI spend leak review. You send usage or billing CSVs;
I send back specific cuts for model routing, prompt size, caching, runaway
agent loops, and spend guards.

Launch price: $100/month. Refund if I cannot find savings or risk reduction
worth the first-month fee.

Payment/contact: {{payment_or_site_url}}

## Follow-Up

Subject: Re: AI spend check

Quick follow-up. If AI spend is not a problem yet, no worries.

If it is, the easiest next step is a redacted export with date, model, tokens,
request count, cost, and feature/team. I will run it through Croesus and send
the first findings.

{{signature}}
