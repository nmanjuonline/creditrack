# CrediTrack (PWA)

CrediTrack is an offline-first Progressive Web App (PWA) designed to eliminate credit card billing cycle confusion, maximize interest-free credit float (up to 52 days), and track card perks, airport lounge limits, and reward structures.

---

## Key Features

1. **Billing Cycle & Float Engine (No More Early Bills)**
   * **Smart Float Maximizer**: Identifies which card to use on any given day for the longest interest-free payment runway (up to 52 days).
   * **Visual Billing Calendar**: Interactive monthly view highlighting Statement Cut dates, Due dates, and Optimal spending windows.
   * **Billing Reminders**: Real-time alerts for impending statement cuts and payment due dates.

2. **Privacy Preserving Architecture**
   * **No Card Numbers, No CVVs, No Expiry Dates**.
   * Only tracks card metadata: Issuer/Bank, Card Model/Name, Statement Day, and Grace Period.

3. **Live & Dynamic Benefits Fetching**
   * Automatically retrieves up-to-date card perks upon card creation, modification, or on demand via the **Refresh Benefits** action.
   * Powered by **Gemini 3.8 Flash** with web knowledge to reflect the latest devaluations, airport lounge spend criteria, reward multipliers, milestone vouchers, and fee waiver thresholds.
   * Pre-seeded with a comprehensive local catalog for top Indian and American Express cards for instant offline availability.

4. **Universal Benefit Search & Quick Filters**
   * Instant search across privileges: Lounge, Swiggy, Zomato, BookMyShow BOGO, Fuel surcharge waiver, Zero Forex, RuPay UPI, Priority Pass.
   * Quick filter pills: Airport Lounge, Cashback & Returns, Milestones, Fuel Surcharge, Low Forex Fee, RuPay UPI, Dining, and Movies & Events.
   * Sort by Longest Float Runway, Earliest Statement Cut, Urgent Due Date, Highest Base Reward %, or Card Name.

5. **Cloud Sync with Turso (libSQL)**
   * Pluggable storage adapter supporting serverless **Turso** SQLite (`@libsql/client/web`) to keep cards synced across devices.
   * Dual-mode local-first architecture: Works 100% offline via local storage cache and synchronizes seamlessly when online.

6. **Progressive Web App (PWA)**
   * Installable on Android, iOS, Windows, and macOS.
   * Service worker caching with offline functionality.
   * Browser push notification reminders for upcoming statement cuts and due dates.

---

## Getting Started

### 1. Install & Run Dev Server
```bash
npm install
npm run dev
```

### 2. Connect Turso Database (Optional)
In the app, click the **Settings** icon in the navigation bar:
* **Turso Database URL**: e.g., `libsql://your-db-org.turso.io`
* **Turso Auth Token**: your authentication token
* Click **Test Connection** & **Save & Apply**

### 3. Connect Gemini AI for Live Web Fetching (Optional)
In **Settings**, enter your **Gemini API Key** to enable live web retrieval with Gemini 3.8 Flash. CrediTrack also includes pre-populated verified data for top cards even without an API key.

---

## Tech Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
* **PWA**: `vite-plugin-pwa`, Web App Manifest, Service Worker
* **Database**: Turso (`@libsql/client/web`) with Local Storage fallback
* **AI Intelligence**: `@google/genai` (Gemini 3.8 Flash)
