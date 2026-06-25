# Croesus

Croesus is a small, self-contained AI spend audit tool and service wrapper.
It helps teams paste or upload LLM usage CSVs, find waste patterns, and buy a
monthly optimization review.

Revenue target: two customers at $100/month, or one customer at $200/month.

## Run

Open `site/index.html` in a browser. No build step or server is required.

For a local HTTP preview:

```sh
npm run serve
```

Then open `http://localhost:8123`.

## Configure Payments

Set at least one payment destination in `site/config.js`:

```js
window.CROESUS_CONFIG = {
  stripePaymentLink: "https://buy.stripe.com/...",
  cryptoPaymentUri: "ethereum:0x...",
  contactEmail: "you@example.com",
  bookingUrl: "",
  siteUrl: "https://example.com"
};
```

Payment links, booking URLs, and crypto receiving addresses are public checkout
details, so publishing them with the site is expected. Do not put API keys or
processor secrets in this repo.

Check whether the project is launch-ready:

```sh
npm run launch:check
```

The check intentionally fails until a real checkout/contact path, live site URL,
30 prospects, and revenue proof are present.

## Offer

The current productized service is:

- $100/month AI spend leak review
- Monthly usage review
- Concrete routing, caching, and prompt-trimming recommendations
- Cancellation anytime

The first milestone is not a polished platform. It is money received for an
audit offer with a useful artifact attached.
