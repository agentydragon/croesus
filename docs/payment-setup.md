# Payment Setup

Recommended path: Stripe Payment Links with a recurring subscription price.

Stripe's Payment Links docs describe this as a no-code hosted checkout page that
can sell products or subscriptions:

- Overview: https://docs.stripe.com/payment-links
- Create link: https://docs.stripe.com/payment-links/create

## Stripe Subscription Link

1. Open https://dashboard.stripe.com/payment-links/create/standard-pricing.
2. Create or select product: `Croesus AI Spend Review`.
3. Set recurring price: `$100 USD / month`.
4. Create the payment link.
5. Put the resulting URL in `site/config.js`:

```js
window.CROESUS_CONFIG = {
  stripePaymentLink: "https://buy.stripe.com/...",
  cryptoPaymentUri: "",
  contactEmail: "sales@example.com",
  bookingUrl: "",
  siteUrl: "https://example.com"
};
```

## Crypto Fallback

If Stripe is not available, provide a public wallet payment URI controlled by
the user:

```js
window.CROESUS_CONFIG = {
  stripePaymentLink: "",
  cryptoPaymentUri: "ethereum:0x...",
  contactEmail: "sales@example.com",
  bookingUrl: "",
  siteUrl: "https://example.com"
};
```

Record any received transaction hash in `ops/revenue-proof.csv`.
