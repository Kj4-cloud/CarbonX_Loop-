# Backend Setup Guide

> **CarbonX** uses **Supabase** as its Backend-as-a-Service (BaaS) for authentication, database, and storage. The blockchain layer runs on the **Polygon Amoy Testnet**.

---

## 1. Supabase Project Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose an organization, set a project name (e.g., `carbonx`), and a strong database password.
4. Select a region close to your users.
5. Click **Create new project** and wait for provisioning.

### 1.2 Get API Credentials

1. In the Supabase Dashboard, go to **Settings → API**.
2. Copy **Project URL** and **anon (public) key**.
3. Add them to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 2. Database Migrations

Run the following SQL files **in order** in the Supabase SQL Editor (**Dashboard → SQL Editor → New Query**):

### Migration 1: Core Tables (`supabase_migration.sql`)

Creates the foundational tables:

| Table                      | Purpose                                  |
|----------------------------|------------------------------------------|
| `farmer_profiles`          | Farmer user profiles with tier info      |
| `land_parcels`             | Registered land plots with GPS data      |
| `photo_verifications`      | Uploaded photo evidence for verification |
| `project_submissions`      | Carbon credit project submissions        |
| `sales_transactions`       | Records of credit sales                  |
| `blockchain_transactions`  | On-chain transaction logs                |

```bash
# Copy contents of supabase_migration.sql → paste into SQL Editor → Run
```

### Migration 2: Profile Fields (`supabase_migration_v2.sql`)

Adds `farm_size` and `primary_crop` columns to `farmer_profiles`.

```bash
# Copy contents of supabase_migration_v2.sql → paste into SQL Editor → Run
```

### Migration 3: Wallet System (`supabase_migration_v3_wallets.sql`)

Creates the wallet infrastructure:

| Table                  | Purpose                         |
|------------------------|---------------------------------|
| `wallets`              | User wallets with balances      |
| `wallet_transactions`  | Deposit, withdraw, purchase log |

Also creates:
- `wallet_transfer()` — atomic RPC function for fund transfers between wallets.
- Additional columns on `orders` and `order_items` tables.

```bash
# Copy contents of supabase_migration_v3_wallets.sql → paste into SQL Editor → Run
```

> **⚠️ Important:** Run migrations in sequence (v1 → v2 → v3). Each migration depends on the previous one.

---

## 3. Row Level Security (RLS)

All tables have RLS enabled with policies already defined in the migration files. Key policies:

- **Farmers** can only read/write their own data (profiles, parcels, submissions, etc.).
- **Wallet owners** can only access their own wallet and transactions.
- **Public read** is enabled on wallets by address (needed for checkout flows).

No additional RLS configuration is needed after running the migrations.

---

## 4. Supabase Authentication

CarbonX uses Supabase Auth with **email/password** authentication. The app supports two account types:

| Type     | Registration Route    | Dashboard Route       |
|----------|-----------------------|-----------------------|
| Buyer    | `/register/standard`  | `/marketplace`        |
| Farmer   | `/register/farmer`    | `/seller/dashboard`   |

### Enable Auth Providers (Optional)

1. Go to **Authentication → Providers** in Supabase Dashboard.
2. Enable **Email** (enabled by default).
3. Optionally enable Google, GitHub, etc. for social login.

### Configure Redirect URLs

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to: `http://localhost:5173`
3. Add to **Redirect URLs**: `http://localhost:5173/auth/callback`

---

## 5. Supabase Storage (Optional)

If the project uses file uploads (land images, photo evidence), create a storage bucket:

1. Go to **Storage** in the Supabase Dashboard.
2. Click **New Bucket**.
3. Name it `uploads` (or as referenced in the code).
4. Set it to **Public** if images need to be publicly accessible.

---

## 6. Blockchain Setup (Polygon Amoy Testnet)

### 6.1 Network Details

| Parameter          | Value                                         |
|--------------------|-----------------------------------------------|
| Network Name       | Polygon Amoy Testnet                          |
| Chain ID           | 80002                                         |
| RPC URL            | `https://polygon-amoy-bor-rpc.publicnode.com` |
| Block Explorer     | `https://amoy.polygonscan.com`                |
| Native Currency    | POL                                           |
| Token Standard     | ERC-1155 (Multi-Token)                        |

### 6.2 Deploy the Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/).
2. Load the CarbonCredit smart contract (ERC-1155).
3. Compile and deploy to **Polygon Amoy Testnet**.
4. Copy the deployed contract address.
5. Update `src/blockchain/config.js`:

```js
export const CARBON_CREDIT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 6.3 Get Test POL Tokens

- Use the [Polygon Amoy Faucet](https://faucet.polygon.technology/) to get free test POL tokens for gas fees.

---

## 7. Sentinel Hub (Satellite Imagery)

1. Register at [Sentinel Hub](https://www.sentinel-hub.com/).
2. Go to the [Dashboard](https://apps.sentinel-hub.com/dashboard/).
3. Create an **OAuth Client** and get the Client ID and Secret.
4. Add to your `.env`:

```env
VITE_SH_CLIENT_ID=your-client-id
VITE_SH_CLIENT_SECRET=your-client-secret
```

---

## 8. API Reference (Supabase Client)

The Supabase client is initialized in `src/lib/supabase.js`:

```js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

All database operations use the `supabase` client directly — there is no separate backend API server.

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `relation "farmer_profiles" does not exist` | Run Migration 1 first |
| `relation "orders" does not exist` | The `orders` table must exist before running Migration 3 |
| RLS blocks all queries | Ensure you're authenticated; check policies in Supabase Dashboard |
| Blockchain tx fails | Ensure you have test POL from the faucet and the contract address is correct |
| Sentinel Hub 401 error | Verify your OAuth Client ID and Secret are correct |
