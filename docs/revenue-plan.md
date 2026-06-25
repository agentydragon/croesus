# Croesus Revenue Plan

## Objective

Generate verified recurring or equivalent revenue controlled by the user:

- Target: $200/month
- Minimum proof: payment processor receipt, crypto transaction, bank deposit, or
  signed monthly commitment plus first payment
- Pricing path: 2 customers at $100/month or 1 customer at $200/month

## Offer

Croesus sells a monthly AI spend leak review for teams already paying for LLM
APIs.

Deliverables:

- Review one month of usage exports or billing line items
- Find model-mix, prompt-size, cache, retry, and spike-control savings
- Send a one-page recommendation report with owner, expected savings, and first
  implementation step
- Optional 30-minute walkthrough

Price:

- Launch: $100/month for first 5 customers
- Standard: $200/month after first 5 customers or if the customer spends more
  than $2,000/month on AI APIs

Refund rule:

- Refund the first month if the audit cannot identify savings or risk reduction
  worth at least the fee.

## Required Account Inputs

The repo cannot collect money until one payment destination is added:

- Stripe Payment Link for a recurring $100/month plan
- Gumroad/Lemon Squeezy recurring product URL
- Coinbase Commerce checkout
- Crypto payment URI controlled by the user

Configure it in `site/config.js`.

## Prospect Criteria

Best first customers:

- 5-100 employee SaaS or agency
- Has an AI feature in production or internal operations
- Mentions OpenAI, Anthropic, LangChain, LiteLLM, AI agents, RAG, support bot,
  AI sales tooling, or embeddings in public material
- Likely monthly AI spend above $500
- Founder, CTO, engineering lead, or ops lead is reachable

## Outreach Targets

Prioritize warm or semi-warm channels before cold email:

1. User's existing founder/operator contacts
2. GitHub projects using OpenAI/Anthropic where commercial support is plausible
3. LinkedIn posts from teams shipping AI features
4. Local founder Slack or Discord communities
5. Agencies building AI features for clients

## Launch Checklist

1. Add payment link or crypto URI to `site/config.js`.
2. Publish `site/` to a public URL.
3. Send 30 targeted messages.
4. Offer the first 5 customers the $100/month launch price.
5. Convert paid customer CSVs into one-page reports within 24 hours.
6. Ask paid customers for permission to reuse anonymized savings numbers.

## Proof Log

Record revenue proof here as it arrives:

| Date | Customer | Amount | Cadence | Payment proof | Notes |
| --- | --- | ---: | --- | --- | --- |
| TBD | TBD | $0 | TBD | TBD | Waiting for first payment destination |

