# Lanternfic

A webnovel reading & writing platform — discover stories, read chapters, track
your library, and write/publish your own, in a night-and-lantern themed UI.

## Getting started

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build a production version:

```bash
npm run build
npm run preview
```

## Project structure

```
├── index.html          # HTML entry point
├── src/
│   ├── main.jsx         # React root
│   └── App.jsx          # Entire app: all views, components, and mock data
├── package.json
└── vite.config.js
```

## What's included

- **Discover** — search, genre filters, trending rail, full story list
- **Library** — bookmarked stories with reading progress
- **Reader** — adjustable font size, day/night mode, chapter navigation, premium chapter paywall
- **Profile** — reading stats, badges, account settings, wallet summary
- **Author Studio** — manage your own stories, add/edit/delete chapters, and a
  distraction-free chapter editor with draft/publish states, plus earnings breakdown
- **Wallet & earnings** (mocked, real-money model) —
  - *Writers* earn from three sources: an ad-revenue share on views, reader tips,
    and premium chapter unlocks (chapters after #5 are paid by default)
  - *Readers* earn wallet credit by watching short rewarded ads (daily cap) and
    through a referral program (earn a bonus when someone joins with your code)
  - Wallet balance can be spent on tips or unlocking premium chapters, or
    "requested" as a payout (currently just a UI confirmation)

## Data

Everything currently runs on in-memory mock data defined at the top of
`App.jsx` (`NOVELS`, `initialAuthorWorks`, `initialWallet`, etc.) and React
state — nothing persists between page reloads yet. Natural next steps if you
want to take this further:

- Wire up a backend (e.g. Supabase, Firebase, or a small Express/Postgres API)
  for real accounts, stories, and chapters
- Add authentication so "Profile" and "Author Studio" reflect a real user
- Persist reading progress, library, and wallet state server-side
- **Real payouts require a licensed payment processor.** The wallet/earnings
  UI here is fully functional in-app logic, but actually moving real money
  (tips, ad-revenue share, payouts) needs integration with something like
  [Stripe Connect](https://stripe.com/connect) for payouts/KYC and a payment
  method (Stripe, PayPal) for reader-side charges — plus legal review for
  handling creator payouts, tax forms (e.g. 1099s in the US), and any
  region-specific money-transmission rules
- Add comments, ratings, and a follow/notifications system
