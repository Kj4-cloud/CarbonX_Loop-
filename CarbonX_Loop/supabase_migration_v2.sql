-- ============================================================
-- CarbonX — Migration V2: Add missing columns to farmer_profiles
-- Run this in Supabase SQL Editor AFTER the initial migration.
-- Needed for BUG-08/09 fix: farm_size and primary_crop fields.
-- ============================================================

ALTER TABLE public.farmer_profiles
  ADD COLUMN IF NOT EXISTS farm_size numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primary_crop text DEFAULT '';
