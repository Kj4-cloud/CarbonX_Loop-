-- ============================================================
-- CarbonX Seller Module — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  email         text NOT NULL,
  mobile_number text,
  aadhaar_number text,
  location      text DEFAULT '',
  bio           text DEFAULT '',
  avatar_url    text DEFAULT '',
  tier_level    int DEFAULT 1,
  tier_name     text DEFAULT 'Starter',
  tier_progress int DEFAULT 0,
  portfolio_credits int DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  farm_id       text DEFAULT 'FC-' || substr(md5(random()::text), 1, 5),
  account_type  text DEFAULT 'farmer',
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own profile"
  ON public.farmer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Farmers can update own profile"
  ON public.farmer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Farmers can insert own profile"
  ON public.farmer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- 2. Land Parcels
CREATE TABLE IF NOT EXISTS public.land_parcels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id   uuid NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  acres       numeric NOT NULL,
  crop        text NOT NULL,
  status      text DEFAULT 'pending',
  badge       text DEFAULT 'Pending Review',
  suggestion  text DEFAULT 'Action: Upload Soil Report',
  suggestion_icon text DEFAULT 'priority_high',
  latitude    text DEFAULT '',
  longitude   text DEFAULT '',
  soil_type   text DEFAULT '',
  description text DEFAULT '',
  image_url   text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.land_parcels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own parcels"
  ON public.land_parcels FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own parcels"
  ON public.land_parcels FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own parcels"
  ON public.land_parcels FOR UPDATE
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own parcels"
  ON public.land_parcels FOR DELETE
  USING (auth.uid() = farmer_id);


-- 3. Photo Verifications
CREATE TABLE IF NOT EXISTS public.photo_verifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id    uuid NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  title        text NOT NULL,
  image_url    text DEFAULT '',
  file_size    text DEFAULT '',
  capture_time text DEFAULT '',
  direction    text DEFAULT '',
  gps_fix      boolean DEFAULT false,
  status       text DEFAULT 'pending',
  coordinates  text DEFAULT '',
  capture_date date DEFAULT CURRENT_DATE,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.photo_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own photos"
  ON public.photo_verifications FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own photos"
  ON public.photo_verifications FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own photos"
  ON public.photo_verifications FOR UPDATE
  USING (auth.uid() = farmer_id);


-- 4. Project Submissions
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id              uuid NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  land_mapping_status    text DEFAULT 'Pending',
  verification_status    text DEFAULT 'Pending',
  photo_evidence_status  text DEFAULT 'Pending',
  marketplace_status     text DEFAULT 'Optional',
  auto_sell              boolean DEFAULT true,
  price_floor            numeric DEFAULT 24.50,
  land_map_image         text DEFAULT '',
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own submissions"
  ON public.project_submissions FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own submissions"
  ON public.project_submissions FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own submissions"
  ON public.project_submissions FOR UPDATE
  USING (auth.uid() = farmer_id);


-- 5. Sales Transactions
CREATE TABLE IF NOT EXISTS public.sales_transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id         uuid NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  buyer_name        text NOT NULL,
  credits           int NOT NULL,
  amount            numeric NOT NULL,
  transaction_date  date DEFAULT CURRENT_DATE,
  status            text DEFAULT 'Pending',
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own sales"
  ON public.sales_transactions FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own sales"
  ON public.sales_transactions FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);


-- 6. Blockchain Transactions
CREATE TABLE IF NOT EXISTS public.blockchain_transactions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id            uuid NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  tx_hash              text DEFAULT '',
  network              text DEFAULT 'Polygon PoS',
  staking_status       text DEFAULT 'Success',
  status_message       text DEFAULT '',
  minting_event        text DEFAULT '',
  tx_timestamp         text DEFAULT '',
  gas_consumed         text DEFAULT '',
  token_id             text DEFAULT '',
  token_standard       text DEFAULT 'ERC-1155 (Multi-Token)',
  contract_address     text DEFAULT '',
  impact_image         text DEFAULT '',
  coordinates          text DEFAULT '',
  project_id           text DEFAULT '',
  verified_tonnes      numeric DEFAULT 0,
  methodology          text DEFAULT '',
  cert_type            text DEFAULT '',
  network_load_label   text DEFAULT 'Optimal',
  network_load_percent int DEFAULT 35,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own blockchain txs"
  ON public.blockchain_transactions FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own blockchain txs"
  ON public.blockchain_transactions FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);


-- ============================================================
-- Seed data (optional demo data for testing)
-- You can run this AFTER registering a farmer account.
-- Replace '<FARMER_USER_ID>' with the actual UUID from auth.users.
-- ============================================================

-- To insert demo data, uncomment and update the lines below:
-- INSERT INTO public.land_parcels (farmer_id, name, acres, crop, status, badge, suggestion, suggestion_icon, image_url)
-- VALUES
--   ('<FARMER_USER_ID>', 'North Ridge Field', 42.5, 'Regenerative Corn', 'high-yield', 'High Yield', 'Suggested: Add Cover Crop', 'bolt', ''),
--   ('<FARMER_USER_ID>', 'East Willow Plot', 18.2, 'Soybeans', 'pending', 'Pending Review', 'Action: Upload Soil Report', 'priority_high', '');
