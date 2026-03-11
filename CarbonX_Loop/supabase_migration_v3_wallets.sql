-- ============================================================
-- CarbonX — Migration V3: Wallet System
-- Run this in Supabase SQL Editor AFTER migration V2.
-- ============================================================

-- 1. Wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL UNIQUE,
  balance        numeric DEFAULT 0 CHECK (balance >= 0),
  account_type   text DEFAULT 'buyer',
  created_at     timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
  ON public.wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow reading any wallet by address (needed for checkout to look up seller wallets)
CREATE POLICY "Anyone can read wallets by address"
  ON public.wallets FOR SELECT
  USING (true);


-- 2. Wallet Transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id      uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type           text NOT NULL CHECK (type IN ('deposit', 'withdraw', 'purchase', 'sale')),
  amount         numeric NOT NULL,
  description    text DEFAULT '',
  tx_hash        text DEFAULT '',
  from_address   text DEFAULT '',
  to_address     text DEFAULT '',
  order_id       uuid DEFAULT NULL,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet transactions"
  ON public.wallet_transactions FOR SELECT
  USING (
    wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own wallet transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (
    wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
  );


-- 3. Add wallet columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buyer_wallet_address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'carbonx_wallet';

-- 4. Add farmer wallet address to order items
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS farmer_wallet_address text DEFAULT '';


-- 5. RPC to transfer funds between wallets (atomic)
CREATE OR REPLACE FUNCTION public.wallet_transfer(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount numeric,
  p_description text DEFAULT '',
  p_order_id uuid DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_from_wallet public.wallets%ROWTYPE;
  v_to_wallet   public.wallets%ROWTYPE;
  v_tx_hash     text;
BEGIN
  -- Lock both wallets to prevent race conditions
  SELECT * INTO v_from_wallet FROM public.wallets WHERE user_id = p_from_user_id FOR UPDATE;
  SELECT * INTO v_to_wallet FROM public.wallets WHERE user_id = p_to_user_id FOR UPDATE;

  IF v_from_wallet IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Sender wallet not found');
  END IF;

  IF v_to_wallet IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Receiver wallet not found');
  END IF;

  IF v_from_wallet.balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Generate a pseudo tx hash
  v_tx_hash := '0x' || encode(gen_random_bytes(32), 'hex');

  -- Deduct from sender
  UPDATE public.wallets SET balance = balance - p_amount WHERE id = v_from_wallet.id;

  -- Add to receiver
  UPDATE public.wallets SET balance = balance + p_amount WHERE id = v_to_wallet.id;

  -- Log sender side
  INSERT INTO public.wallet_transactions (wallet_id, type, amount, description, tx_hash, from_address, to_address, order_id)
  VALUES (v_from_wallet.id, 'purchase', p_amount, p_description, v_tx_hash, v_from_wallet.wallet_address, v_to_wallet.wallet_address, p_order_id);

  -- Log receiver side
  INSERT INTO public.wallet_transactions (wallet_id, type, amount, description, tx_hash, from_address, to_address, order_id)
  VALUES (v_to_wallet.id, 'sale', p_amount, p_description, v_tx_hash, v_from_wallet.wallet_address, v_to_wallet.wallet_address, p_order_id);

  RETURN json_build_object(
    'success', true,
    'tx_hash', v_tx_hash,
    'from_address', v_from_wallet.wallet_address,
    'to_address', v_to_wallet.wallet_address
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
