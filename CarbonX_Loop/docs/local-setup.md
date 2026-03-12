# Local Setup Guide — From Scratch

> A complete, end-to-end guide to get CarbonX running on your local machine.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** ≥ 18 LTS — [Download](https://nodejs.org/)
- **npm** ≥ 9 (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)
- **A Supabase account** — [Sign up free](https://supabase.com/)

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd CarbonX_Loop
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install all packages listed in `package.json`, including React, Vite, Tailwind CSS, Supabase, ethers.js, Leaflet, and more.

---

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard).
2. Create a new project (choose any name and region).
3. Wait for the project to be provisioned.

### 3.2 Get Your API Keys

1. Navigate to **Settings → API** in the Supabase Dashboard.
2. Copy the **Project URL** and **anon public key**.

### 3.3 Run Database Migrations

Open **SQL Editor** in Supabase Dashboard and run the following files **in order**:

| Order | File                             | What it does                              |
|-------|----------------------------------|-------------------------------------------|
| 1st   | `supabase_migration.sql`         | Creates core tables (profiles, parcels, etc.) |
| 2nd   | `supabase_migration_v2.sql`      | Adds farm_size & primary_crop columns     |
| 3rd   | `supabase_migration_v3_wallets.sql` | Creates wallet & transaction tables     |

> Copy the contents of each `.sql` file, paste into the SQL Editor, and click **Run**.

### 3.4 Configure Auth Redirect

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to `http://localhost:5173`.
3. Add `http://localhost:5173/auth/callback` to **Redirect URLs**.

---

## Step 4: Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your values:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Sentinel Hub (for satellite imagery — optional for basic testing)
VITE_SH_CLIENT_ID=your-sentinel-hub-client-id
VITE_SH_CLIENT_SECRET=your-sentinel-hub-client-secret
```

> **Where to get these:**
> - Supabase keys: Dashboard → Settings → API
> - Sentinel Hub keys: [apps.sentinel-hub.com/dashboard](https://apps.sentinel-hub.com/dashboard/)

---

## Step 5: Start the Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## Step 6: Create Test Accounts

### Buyer Account

1. Open http://localhost:5173
2. Click **Get Started** → **Register**.
3. Select **Standard User** (Buyer).
4. Fill in the registration form and submit.
5. You'll be redirected to `/marketplace`.

### Farmer (Seller) Account

1. Open http://localhost:5173
2. Click **Get Started** → **Register**.
3. Select **Farmer** account type.
4. Fill in the registration form (including Aadhaar, location, etc.).
5. You'll be redirected to `/seller/dashboard`.

---

## Step 7: Verify Everything Works

Use this checklist to confirm the setup is correct:

- [ ] App loads at http://localhost:5173 without errors
- [ ] Can register a new Buyer account
- [ ] Can register a new Farmer account
- [ ] Farmer dashboard loads with sidebar navigation
- [ ] Marketplace page loads for Buyer accounts
- [ ] Wallet page shows balance (should be ₹0.00 initially)
- [ ] No console errors related to Supabase connection

---

## Optional: Blockchain Setup

If you need to test blockchain features (minting, transfers):

1. Deploy the CarbonCredit smart contract to **Polygon Amoy Testnet** via [Remix IDE](https://remix.ethereum.org/).
2. Update `src/blockchain/config.js` with the deployed contract address.
3. Get test POL tokens from the [Polygon Faucet](https://faucet.polygon.technology/).

See [backend-setup.md](./backend-setup.md#6-blockchain-setup-polygon-amoy-testnet) for detailed instructions.

---

## Common Issues & Fixes

| Problem | Cause | Solution |
|---------|-------|---------|
| **Blank page / white screen** | Missing `.env` configuration | Ensure `.env` exists with valid Supabase URL and key |
| **"⚠️ Supabase is not configured!"** | `.env` file not found or empty | Create `.env` from `.env.example` and fill in values |
| **"relation does not exist"** errors | Migrations not run | Run all 3 SQL migrations in order in Supabase SQL Editor |
| **Login works but dashboard is empty** | No data in database | This is normal for a fresh setup — create projects via the UI |
| **Port 5173 in use** | Another dev server running | Stop the other server or run: `npm run dev -- --port 3000` |
| **`npm install` fails** | Cached dependency issue | Delete `node_modules/` and `package-lock.json`, then retry |
| **Satellite view not loading** | Missing Sentinel Hub keys | Add `VITE_SH_CLIENT_ID` and `VITE_SH_CLIENT_SECRET` to `.env` |

---

## Quick Reference

| Command               | Description                    |
|-----------------------|--------------------------------|
| `npm install`         | Install all dependencies       |
| `npm run dev`         | Start dev server (port 5173)   |
| `npm run build`       | Build for production           |
| `npm run preview`     | Preview production build       |
| `npm run lint`        | Run ESLint                     |

---

## Next Steps

- 📖 [Frontend Setup](./frontend-setup.md) — Detailed frontend configuration & project structure
- 📖 [Backend Setup](./backend-setup.md) — Supabase, blockchain, and API details
