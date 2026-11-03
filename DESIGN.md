---
name: CrediTrack
description: Modern Credit Card Billing Cycle Intelligence & Perks Tracker
colors:
  primary: "#d4af37"
  primary-hover: "#e5c04b"
  primary-deep: "#997722"
  surface-obsidian: "#08090d"
  surface-graphite: "rgba(18, 21, 29, 0.70)"
  surface-glass-card: "rgba(26, 31, 44, 0.65)"
  text-primary: "#f8fafc"
  text-secondary: "#a1a1aa"
  text-muted: "#94a3b8"
  border-glass: "rgba(255, 255, 255, 0.08)"
  border-glass-gold: "rgba(212, 175, 55, 0.25)"
  status-due: "#f43f5e"
  status-float: "#f59e0b"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface-obsidian}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface-obsidian}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  card-credit:
    backgroundColor: "{colors.surface-glass-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: CrediTrack

## Overview

**Creative North Star: "The Obsidian Vault"**

CrediTrack's design system evokes the tactile, secure atmosphere of an executive private banking vault combined with the fluid precision of Apple Wallet. Surfaces are carved out of deep obsidian black glass, suspended over ambient dark gradients, and accentuated with chamfered champagne gold highlights. The visual language conveys high-conviction luxury, mathematical clarity, and absolute discretion.

Rather than flat SaaS dashboards or cluttered banking portals, CrediTrack presents credit cards as physical digital artifacts. Each card honors the ISO/IEC 7810 ID-1 standard ratio (~1.586:1) with specular rim lighting, realistic EMV chips, contactless telemetry, and curated benefit pills. On mobile devices, cards layer within a tactile gesture-driven deck; on desktop screens, they distribute cleanly across a multi-column responsive grid.

**Key Characteristics:**
- **Obsidian Specular Glass:** Translucent dark materials (`rgba(18, 21, 29, 0.70)`) with 24px backdrop blur and inset 1px specular highlight rims.
- **Champagne Gold Accents:** Warm metallic gold (`#d4af37`) reserved strictly for high-value affordances, primary triggers, and active card states.
- **Physical Card Fidelity:** ISO/IEC 7810 ID-1 proportioned cards with EMV chip geometry, masked digits, and metallic gradients.
- **Zero Emoji Vector Purity:** 100% SVG vector iconography (Lucide) ensuring crisp rendering on Retina and OLED displays.
- **Indian Financial Fluency:** Native typography formatting for Indian currency (`en-IN` separators, Lakhs, Crores).

## Colors

The palette is anchored in an ultra-deep obsidian canvas with warm champagne gold and high-contrast cool typography.

### Primary
- **Champagne Gold** (`#d4af37`): Primary brand action color, active selection indicator, and metallic pill borders.
- **Champagne Light** (`#e5c04b`): Hover and specular reflection state for gold buttons.
- **Champagne Deep** (`#997722`): Darker gradient terminus for metallic gold buttons.

### Secondary
- **Optimal Float Amber** (`#f59e0b`): Signals maximum interest-free float windows (40+ days).
- **Urgent Due Crimson** (`#f43f5e`): Signals urgent payment deadlines (due in 3 days or less).
- **RuPay Electric Blue** (`#38bdf8`): Reserved for UPI payment badges and RuPay network tags.

### Neutral
- **Obsidian Canvas** (`#08090d`): Deep foundational background color across the entire viewport.
- **Graphite Glass Surface** (`rgba(18, 21, 29, 0.70)`): Primary container and card modal background.
- **Card Glass Backing** (`rgba(26, 31, 44, 0.65)`): Secondary backdrop for elevated card surfaces.
- **Specular Glass Border** (`rgba(255, 255, 255, 0.08)`): Hairline structural divider across panels and tabs.
- **Text Primary** (`#f8fafc`): Crisp white for headlines, card names, and primary metrics.
- **Text Secondary** (`#a1a1aa`): High-contrast cool zinc for body copy and metadata.
- **Text Muted** (`#94a3b8`): WCAG-compliant slate for secondary labels, hints, and denominators.

### Named Rules
**The Rarity of Gold Rule.** Champagne gold is strictly limited to <= 10% of any screen surface. It denotes actionable currency and active states; it is never used for decorative wallpaper.

**The No Watermark Collision Rule.** Card text (numbers, dates, limits) must never overlap background watermarks. Card networks are displayed via dedicated crisp corner badges.

## Typography

**Display Font:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif`  
**Body Font:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`  
**Label/Mono Font:** `"SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace`

**Character:** Modern San Francisco system typography engineered for maximum legibility on high-DPI glass surfaces, paired with SF Mono tabular numerals for financial data alignment.

### Hierarchy
- **Display** (800 weight, 2.0rem / 32px, line-height 1.15, tracking -0.02em): Hero page titles and top modal headers.
- **Headline** (700 weight, 1.5rem / 24px, line-height 1.25, tracking -0.015em): Section titles, bank names, and prominent float numbers.
- **Title** (600 weight, 1.125rem / 18px, line-height 1.35, tracking -0.01em): Card face titles, group titles, and modal subheadings.
- **Body** (400 weight, 0.875rem / 14px, line-height 1.5, tracking 0em): Descriptive paragraphs, benefit explanations, and policy details.
- **Label** (600 weight, 0.75rem / 12px, line-height 1.4, tracking 0.05em uppercase): Status pills, cut dates, grace badges, and category chips.
- **Tabular Numerals** (700 weight, `font-variant-numeric: tabular-nums`): All monetary amounts, interest rates, day counts, and dates.

### Named Rules
**The Tabular Currency Rule.** Every monetary amount (e.g. `Limit: ₹5,00,000`), percentage (e.g. `1.5%`), and countdown timer (`48d Float`) must use monospace tabular numbers to eliminate layout jitter.

**The Indian Denomination Rule.** Large limits must include explicit Indian comma separators (`₹12,50,000`) and live conversational previews (`₹12.5 Lakh`) to guarantee immediate readability.

## Layout

The spatial model uses an 8px grid with responsive dual-mode presentation.

- **Mobile Viewport (`< 768px`):** Single-column focus. Top smart float maximizer card followed by an interactive Apple-style card deck with tactile horizontal swipe tracking and vertical sheet expansion.
- **Desktop Viewport (`>= 768px`):** Multi-column structured grid (`grid-cols-2 lg:grid-cols-3 gap-6`). The stack deck view is completely omitted on desktop to maximize scanability and multi-card comparison.
- **Maximum Container Width:** Main workspace constrained to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Vertical Spacing Rhythm:** 16px (`gap-4`) between sibling items; 24px (`gap-6`) between major visual sections.

## Elevation & Depth

CrediTrack relies on **Specular Tonal Glass** rather than muddy drop shadows. Depth is established through multi-layer Gaussian backdrop blurs, top-edge specular rim lighting, and subtle dark ambient grounding.

### Shadow Vocabulary
- **Glass Panel Elevation** (`box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`): Primary container depth on dashboards and floating modal dialogs.
- **Physical Card Lift** (`box-shadow: 0 16px 48px -8px rgba(0, 0, 0, 0.50), inset 0 1px 1px 0 rgba(255, 255, 255, 0.14)`): Applied to individual credit cards to simulate a physical card hovering above the glass surface.
- **Gold Action Glow** (`box-shadow: 0 4px 20px rgba(212, 175, 55, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.35)`): Used on primary metallic buttons to communicate tactility and active affordance.

### Named Rules
**The Rim Light Rule.** Every elevated glass surface must feature an `inset 0 1px 0 rgba(255, 255, 255, 0.10)` top highlight, simulating light refracting through the top edge of polished glass.

## Shapes

- **Credit Card Aspect Ratio:** Strictly adheres to ISO/IEC 7810 ID-1 standard (`aspect-[1.586/1]`).
- **Corner Radii Hierarchy:**
  - Full Credit Cards: 24px (`rounded-3xl` / `rounded-2xl` on mobile).
  - Modal Containers & Floating Panels: 24px (`rounded-3xl`).
  - Action Buttons & Form Inputs: 12px (`rounded-xl`).
  - Status Badges & Quick Filter Pills: 9999px (`rounded-full`).
  - EMV Chip: 6px (`rounded-md`) with gold brushed metallic gradient.

## Components

Tactile, physical, and executive feel across all controls.

### Buttons
- **Primary Metallic Gold (`btn-gold`):**
  - Shape: Rounded rectangular (12px radius, `rounded-xl`), minimum height 44px.
  - Background: Linear metallic gradient (`#d4af37 0%, #b8932e 50%, #997722 100%`).
  - Typography: Dark obsidian text (`#08090d`), 700 bold weight.
  - States: Hover lifts by -1px with intensified gold aura (`0 6px 24px rgba(212, 175, 55, 0.40)`); active scales to 95% (`active:scale-95`).
- **Glass Secondary Button:**
  - Shape: 12px radius (`rounded-xl`), translucent white backing (`rgba(255, 255, 255, 0.05)`).
  - States: Hover shifts to `rgba(255, 255, 255, 0.10)` with hairline white border.

### Credit Card Item
- **Shape:** Universal ISO ID-1 physical aspect ratio (~1.586:1).
- **Face Elements:**
  - Top Row: Issuer bank name in bold tracking, favorite star, network pill (Visa, Mastercard, RuPay, Amex).
  - Middle Row: Brushed gold EMV chip, contactless wave icon, card model title.
  - Perk Badges: Sleek frosted-glass pills with vector icons (`Plane` for Lounge, `Zap` for UPI, `Gift` for Cashback, `Globe` for Forex).
  - Bottom Row: Billing cut day (`Cut: 15th`), grace days (`+20d`), credit limit badge (`Limit: ₹5,00,000`), and masked digits (`•••• 8842`).

### Chips & Filter Pills
- **Shape:** Fully rounded capsule (9999px radius, `rounded-full`).
- **Active State:** Champagne gold gradient fill (`from-amber-500 to-amber-400`), obsidian text (`text-slate-950`), bold weight.
- **Rest State:** Dark glass backing (`bg-white/[0.04]`), muted zinc label (`text-slate-400`), hairline border (`border-white/10`).

### Form Inputs
- **Shape:** 12px radius (`rounded-xl`), minimum 44px height.
- **Material:** Dark tinted glass (`rgba(10, 13, 19, 0.75)`) with 20px blur.
- **Focus:** Champagne gold ring (`outline: 2px solid #d4af37`), glow aura (`0 0 20px rgba(212, 175, 55, 0.20)`).
- **Behavior:** No auto-opening dropdowns or mobile keyboard popups when opening in edit mode.

### Modals & Bottom Sheets
- **Mobile:** Fluid bottom sheet docking to the bottom edge with swipe-down dismissal and safe-area padding.
- **Desktop:** Centered floating glass dialog (`max-w-2xl mx-auto`) with backdrop blur (`backdrop-blur-xl bg-black/80`).

## Do's and Don'ts

### Do:
- **Do** format all credit limits with standard Indian comma grouping (e.g. `Limit: ₹5,00,000`).
- **Do** enforce `whitespace-nowrap shrink-0` on credit limit and category multiplier badges to prevent ugly line wrapping.
- **Do** preserve strictly monotonic `zIndex: idx + 1` in card stack decks so cards overlap with uniform mathematical exposure.
- **Do** maintain a strict minimum 44x44px touch target on all clickable controls.
- **Do** use vector Lucide SVG icons exclusively for all perks, categories, and controls.

### Don't:
- **Don't** include emojis in any part of the UI, data schemas, perk badges, or notifications.
- **Don't** display background text watermarks behind card numbers, cut dates, or limits.
- **Don't** render the stack deck switcher or deck view on desktop screens (`>= 768px`).
- **Don't** auto-focus form inputs when editing an existing card or on mobile touchscreens.
- **Don't** request or collect 16-digit card numbers, CVVs, expiration dates, or bank login credentials.

