# Money Handoff

The objective is not complete until money reaches an account or wallet the user
controls. The site and offer can be built without account access, but payment
collection cannot.

## Needed From User

Provide one of:

- Stripe Payment Link for a recurring $100/month product
- Gumroad, Lemon Squeezy, or Coinbase Commerce checkout URL
- Crypto payment URI for a wallet the user controls

Also provide:

- Sales contact email
- Optional booking URL
- Public name or brand to sign outreach with
- Authorization before sending messages through any account

## Revenue Proof

Record proof in `ops/revenue-proof.csv`.

Acceptable proof:

- Stripe/Gumroad/Lemon Squeezy receipt or dashboard payment link
- Bank deposit record
- Crypto transaction hash to the receiving address
- Signed monthly commitment plus first payment

## First Payment Path

1. Put payment and contact details in `site/config.js`.
2. Publish `site/` to a public URL.
3. Put the public URL in `site/config.js` as `siteUrl`.
4. Add 30 qualified prospects to `ops/prospects.csv`.
5. Run `npm run launch:check`.
6. Generate tailored outreach with `node scripts/render-outreach.js`.
7. Send 10 high-fit messages per day.
8. For interested prospects, ask for a redacted usage CSV.
9. Return an audit within 24 hours and ask them to start the $100/month plan.
10. Record payment proof in `ops/revenue-proof.csv`.
