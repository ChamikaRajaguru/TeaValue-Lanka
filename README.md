# TeaValue Lanka (තේ අගය ලංකා)

> **Transparent, Explainable Raw Green Tea Leaf Price Estimation for Sri Lankan Smallholders.**

TeaValue Lanka empowers Sri Lankan smallholder tea growers to calculate and verify fair selling price ranges for their **freshly harvested raw green tea leaves** before delivering crops to tea processing factories.

---

## 🍃 1. Crucial Product Distinction

| Product | Description | Relevance to TeaValue Lanka |
| :--- | :--- | :--- |
| **Raw Green Leaf (අමු තේ දළු)** | Freshly plucked leaves & tender buds supplied by farmers to factories. Benchmark in 2026: **Rs. 210 – 290 / kg**. | **✅ EXCLUSIVELY CALCULATED BY THIS APP** |
| **Manufactured Made Tea (නිමි තේ)** | Processed, withered, rolled, dried, and graded black tea. | ❌ Never used as raw leaf price |
| **Colombo Tea Auction Averages** | Wholesale made tea prices (Rs. 1,200 – 1,800/kg). Requires ~4.5 to 5 kg of green leaf per kg of made tea. | ❌ Excluded from farmer gate prices |
| **Retail / Export Packaged Tea** | Commercial retail tea bags, tins, and consumer products. | ❌ Excluded |

> **Notice:** TeaValue Lanka calculates **advisory estimates** based on dated, verified factory intake notices and TSHDA benchmarks. It is not a guaranteed binding factory purchase contract. Final payable weight is determined at the receiving factory weighbridge after moisture/water deduction inspection.

---

## 🛠️ 2. Technology Stack

- **Framework**: Next.js 15 (App Router, Node.js Server Runtime, React 19)
- **Styling**: Tailwind CSS with custom Ceylon agricultural theme (Deep tea green, sprout green, warm cream, restrained amber)
- **Icons**: Lucide React
- **Validation**: Zod & typed assessment schemas
- **Database**: MongoDB Atlas via official Node.js driver (`mongodb`) with in-memory persistence fallback for zero-dependency local development
- **Authentication**: Secure cryptographic salted sessions with role-based access control (`farmer` & `admin`)
- **Arithmetic**: Decimal.js for floating-point error-free currency and weight calculations
- **Price Discovery**: Google GenAI SDK (`@google/genai`) for discovering published green leaf quotes (candidates require Admin verification)
- **Testing**: Vitest for unit & end-to-end integration workflows

---

## 🌐 3. Localization (Bilingual English & Sinhala)

TeaValue Lanka includes bilingual support covering all visible labels, form instructions, validation warnings, and result explanations.

- **English (EN)**: Standard agricultural terminology.
- **සිංහල (Sinhala)**: Simple, farmer-friendly terms (e.g., ළපටි දළු ප්‍රතිශතය, රළු දළු, ශුද්ධ ආදායම).

Switch languages seamlessly via the navigation toggle button (`EN` / `සිං`).

---

## 📐 4. Price Estimation Engine Architecture

The engine is implemented as a pure, deterministic TypeScript module (`src/lib/engine/calculator.ts`):

```
Farmer Assessment Input
         │
         ▼
[Step A: Location & Factory Matching]
  • Exact factory quote > Locality match > District benchmark > Regional fallback
         │
         ▼
[Step B: Deterministic Verified Rule Application]
  1. Base price selection (Generic / Factory-base / Quality-specific)
  2. Fixed adjustments in LKR/kg (e.g. +12 Rs/kg for >= 70% tender flush)
  3. Percentage adjustments (e.g. +5% bonus)
  * Strict constraint: Quality-specific records are never double-adjusted!
  * Unsupported quality inputs produce advisory guidance without altering price.
         │
         ▼
[Step C: Revenue & Net Deduction Calculation]
  • Gross Range = Payable Weight × Estimated Price Range
  • Deductions = Transport hire (fixed or per-kg) + Factory deductions
  • Net Range = Gross - Total Deductions (Negative net revenue preserved!)
         │
         ▼
[Step D: Traceability & Snapshot Preservation]
  • Explanation returned with records used, disclaimers, and rules applied.
  • Stored as an immutable snapshot in MongoDB.
```

---

## 🚀 5. Getting Started & Installation

### Prerequisites
- Node.js v20+ or v24+
- npm v10+

### 1. Clone & Install
```bash
git clone https://github.com/ChamikaRajaguru/TeaValue-Lanka.git
cd TeaValue-Lanka
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `APP_URL` | Base application URL | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb://localhost:27017/teavalue_lanka` |
| `BETTER_AUTH_SECRET` | 32+ character random secret string | Required in production |
| `DEMO_MODE` | Set `true` to use synthetic seed records | `true` (local dev) |
| `GEMINI_API_KEY` | Google Gemini API key (optional discovery) | Optional |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 6. Default Demo Credentials & Admin Promotion

When running with default seed data or demo mode:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@teavalue.lk` | `AdminPass2026!` |
| **Farmer** | `farmer@teavalue.lk` | `FarmerPass2026!` |

### Promoting an Existing User to Administrator
Public registration always creates a **farmer** account. To promote an existing registered user to an administrator:
```bash
npm run promote-admin <email@example.com>
```

### Seeding Demo Data to MongoDB
```bash
npm run seed:demo
```

---

## 🧪 7. Running Tests

Run the complete Vitest test suite covering calculation logic, unit edge cases, and end-to-end workflows:
```bash
npm test
```

Run test suite in watch mode:
```bash
npm run test:watch
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Build production bundle:
```bash
npm run build
```

---

## 🏛️ 8. How Raw Leaf Price Data Is Obtained & Verified

1. **Factory Gate Circulars**: Tea processing factories issue monthly or bi-weekly circulars specifying the base green leaf price (Rs./kg) paid to smallholders.
2. **TSHDA Regional Benchmarks**: The Tea Small Holdings Development Authority of Sri Lanka publishes regional average minimum prices.
3. **Gemini Price Discovery (Optional)**: Administrators can query Gemini to discover published raw green leaf price notices. Discovered records enter a strictly **Pending** state and must be manually inspected and verified before entering the calculation engine.
4. **Administrative Verification**: Administrators review source URLs, document reference codes, and text excerpts before changing record status to `verified`.

---

## 📦 9. Deployment Instructions (Node.js / Vercel / Docker)

### Vercel / Node.js Host
1. Connect your repository to Vercel or your Node.js hosting platform (e.g., Render, Railway, AWS ECS).
2. Set environment variables in your hosting dashboard:
   - `MONGODB_URI`
   - `BETTER_AUTH_SECRET`
   - `APP_URL`
   - `DEMO_MODE=false` (for production)
3. Build command: `npm run build`
4. Start command: `npm run start`

---

## 📄 License
MIT License. Built for the advancement of Sri Lankan smallholder agriculture.