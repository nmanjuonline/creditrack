# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Multi-card power users, rewards optimizers, and personal finance enthusiasts—primarily credit card holders in India managing multiple cards across issuers like HDFC, ICICI, SBI Card, Axis Bank, and American Express. They actively juggle varying statement cut dates, 45–52 day interest-free float windows, quarterly spend-based airport lounge criteria, RuPay UPI reward categories, and annual milestone fee waivers.

## Product Purpose

CrediTrack eliminates the cognitive overhead of managing multiple credit cards. It provides instant visibility into which card offers the longest interest-free float window for today's spend, clarifies complex lounge access rules, breaks down category multipliers, and tracks payment deadlines with precision. Success means the user always swipes the mathematically optimal card for any transaction and never misses a statement payment—all without logging into bank portals or sharing financial credentials.

## Positioning

Unlike conventional payment aggregator apps (CRED, CheQ) that demand SMS read permissions, bank logins, and card numbers to harvest financial transaction data, CrediTrack operates on a strict **zero-credential, local-first privacy model**. It provides deterministic billing cycle intelligence, real-time float optimization, and curated Indian card benefit intelligence with zero ads, zero trackers, and complete user autonomy.

## Operating Context

- **Daily Transaction Choice:** Quick 5-second check right before making a significant online or offline purchase ("Which card gives me the longest float today, or highest cashback on Swiggy/Amazon?").
- **Payment & Statement Tracking:** Periodic check of cut dates and due deadlines with visual color-coded float badges.
- **Travel Preparation:** Airport lounge access verification (checking quarterly spend thresholds, partner lounges, and international access rules).
- **Environment:** Run as an offline-capable Progressive Web App (PWA) on mobile smartphones (Android / iOS) via physical wallet carousel gestures, and on desktop browsers via an expansive multi-column grid.

## Capabilities and Constraints

- **Billing Cycle Intelligence:** Calculates real-time statement cut dates, grace periods (+18d to +25d), dynamic interest-free float days (up to 52 days), and urgency statuses (`Due Soon`, `Optimal Float`).
- **Curated Card Benefits:** Pre-populated catalog of popular Indian credit cards featuring base reward rates, category cashback, RuPay UPI scan-and-pay rates, milestone bonuses, and foreign currency markup percentages (+GST).
- **Dual-SDK AI Perk Engine:** Live benefit lookup and devaluation alerts powered by Google Gemini AI with automatic fallback across the modern interactions API and standard `generateContent` API.
- **Local-First & Optional Cloud Sync:** Stores all cards and benefits on-device in LocalStorage/IndexedDB by default; optional cloud backup and sync via Turso LibSQL.
- **Strict Data Constraints:** Zero financial identifiers collected (no 16-digit card numbers, CVVs, expiration dates, bank passwords, or SMS inbox scraping).

## Brand Commitments

- **Zero-Emoji Enforcement:** Strictly zero emojis across the entire UI, codebase, and perk badges. All visual symbols must use clean, vector-based Lucide SVG icons (`Plane`, `Zap`, `Gift`, `Star`, `Globe`).
- **Apple Wallet-Grade Aesthetics:** Dark mode glassmorphism adhering to the universal ISO/IEC 7810 ID-1 credit card aspect ratio (~1.586:1), specular foil finishes, and crisp typographic hierarchy.
- **Responsive Architecture:** Swipeable wallet carousel on mobile devices; strictly multi-column grid on desktop screens (`>= 768px`) with no stack deck toggle clutter.

## Evidence on Hand

- Verified card catalog and perk rule schemas in [`src/data/cardCatalog.ts`](file:///c:/Users/Admin/source/repos/nmanjuonline/creditrack/src/data/cardCatalog.ts).
- Deterministic float and billing cycle mathematics in [`src/utils/billingUtils.ts`](file:///c:/Users/Admin/source/repos/nmanjuonline/creditrack/src/utils/billingUtils.ts).
- High-contrast Apple design system implementation in [`src/index.css`](file:///c:/Users/Admin/source/repos/nmanjuonline/creditrack/src/index.css) and [`src/components/WalletStack.tsx`](file:///c:/Users/Admin/source/repos/nmanjuonline/creditrack/src/components/WalletStack.tsx).

## Product Principles

1. **Zero-Compromise Privacy:** Never request, store, or transmit sensitive financial credentials or transaction records.
2. **Actionable Mathematical Clarity:** Always highlight the actionable truth—days of float remaining and urgent payment countdowns—without financial jargon.
3. **Physical Metaphor with Precision Craft:** Model digital cards after real-world physical cards with accurate proportions, tactile states, and restrained vector accents.
4. **Offline Autonomy:** Core billing intelligence and saved cards must remain 100% accessible and operational without an active internet connection.

## Accessibility & Inclusion

- **WCAG 2.1 AA Contrast:** High-contrast text labels (`slate-400`, `zinc-200`, `amber-300`) on deep obsidian dark backdrops (`#090b10`).
- **Indian Locale Formatting:** Full native support for Indian currency denomination conventions (`en-IN` separators, Lakhs, Crores, e.g. `₹5,00,000`).
- **Touch & Keyboard Ergonomics:** Minimum 44x44px interactive tap targets, explicit Escape key and backdrop dismissal, and fluid bottom sheet modal sheets.
