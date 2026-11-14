-- ==============================================================================
-- SRI YN TRADING COMPANY — COMPLETE POSTGRESQL SCHEMA
-- Simple, Robust, Atomic Business Management & Combined Master Register
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Admin verification)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Administrator',
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. COLD STORAGES TABLE
CREATE TABLE IF NOT EXISTS public.cold_storages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    capacity_kg NUMERIC(14, 2) NOT NULL DEFAULT 0,
    remarks TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INVENTORY LOTS TABLE (Stock tracked primarily in Kilograms for simplicity)
CREATE TABLE IF NOT EXISTS public.inventory_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_number TEXT NOT NULL UNIQUE,
    item_name TEXT NOT NULL,
    chilli_variety TEXT NOT NULL DEFAULT 'Teja',
    cold_storage_id UUID REFERENCES public.cold_storages(id) ON DELETE RESTRICT,
    supplier_name TEXT NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_stock_kg NUMERIC(12, 2) NOT NULL CHECK (opening_stock_kg >= 0),
    current_stock_kg NUMERIC(12, 2) NOT NULL CHECK (current_stock_kg >= 0),
    purchase_rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
    bill_reference TEXT,
    remarks TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CUSTOMERS & SUPPLIERS DIRECTORY
CREATE TABLE IF NOT EXISTS public.customers_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_type TEXT NOT NULL CHECK (party_type IN ('CUSTOMER', 'SUPPLIER', 'BOTH')),
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    current_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
    remarks TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. COMBINED MASTER TRANSACTIONS SHEET TABLE (Single Central Register!)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT NOT NULL UNIQUE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('SALE', 'PURCHASE', 'PAYMENT_RECEIVED', 'PAYMENT_MADE', 'STOCK_ADJUSTMENT')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bill_number TEXT,
    party_name TEXT NOT NULL,
    party_phone TEXT,
    item_name TEXT,
    cold_storage_name TEXT,
    lot_number TEXT,
    quantity_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
    rate_per_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    balance_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT')),
    remarks TEXT,
    lot_id UUID REFERENCES public.inventory_lots(id) ON DELETE SET NULL,
    cold_storage_id UUID REFERENCES public.cold_storages(id) ON DELETE SET NULL,
    party_id UUID REFERENCES public.customers_suppliers(id) ON DELETE SET NULL,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. UPLOADED BILLS & DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.uploaded_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number TEXT NOT NULL,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    party_name TEXT NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    remarks TEXT,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR INSTANT QUERIES
CREATE INDEX IF NOT EXISTS idx_yn_trans_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_yn_trans_type ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_yn_trans_party ON public.transactions(party_name);
CREATE INDEX IF NOT EXISTS idx_yn_trans_bill ON public.transactions(bill_number);
CREATE INDEX IF NOT EXISTS idx_yn_trans_lot ON public.transactions(lot_number);
CREATE INDEX IF NOT EXISTS idx_yn_lots_num ON public.inventory_lots(lot_number);
CREATE INDEX IF NOT EXISTS idx_yn_storage_name ON public.cold_storages(name);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_storages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_bills ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full operational access
CREATE POLICY "Full access for authenticated users on profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on cold_storages" ON public.cold_storages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on inventory_lots" ON public.inventory_lots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on customers_suppliers" ON public.customers_suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on uploaded_bills" ON public.uploaded_bills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STORAGE BUCKET FOR BILLS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bills', 'bills', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload bills" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bills');
CREATE POLICY "Authenticated users can read bills" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'bills');
CREATE POLICY "Authenticated users can delete bills" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'bills');

-- ==============================================================================
-- ATOMIC TRANSACTION FUNCTION: PROCESS BUSINESS TRANSACTION SAFELY
-- Automatically adjusts stock and handles balance calculations
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_business_transaction(
    p_type TEXT,
    p_date DATE,
    p_bill_number TEXT,
    p_party_name TEXT,
    p_party_phone TEXT,
    p_item_name TEXT,
    p_cold_storage_id UUID,
    p_lot_id UUID,
    p_quantity_kg NUMERIC,
    p_rate_per_kg NUMERIC,
    p_total_amount NUMERIC,
    p_paid_amount NUMERIC,
    p_payment_method TEXT,
    p_remarks TEXT,
    p_user_email TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_txn_code TEXT;
    v_lot RECORD;
    v_storage_name TEXT := '';
    v_lot_number TEXT := '';
    v_balance NUMERIC := 0;
    v_inserted_txn RECORD;
    v_party_id UUID;
    v_num_qty NUMERIC := COALESCE(p_quantity_kg, 0);
    v_num_total NUMERIC := COALESCE(p_total_amount, 0);
    v_num_paid NUMERIC := COALESCE(p_paid_amount, 0);
BEGIN
    -- Calculate balance
    v_balance := v_num_total - v_num_paid;
    IF v_balance < 0 THEN
        v_balance := 0;
    END IF;

    -- Generate unique Transaction ID: YN-TXN-YYMMDD-XXXX
    v_txn_code := 'YN-' || UPPER(SUBSTRING(p_type, 1, 1)) || '-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- If linked to a lot, verify and adjust stock atomically
    IF p_lot_id IS NOT NULL THEN
        SELECT * INTO v_lot FROM public.inventory_lots WHERE id = p_lot_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Inventory lot not found.';
        END IF;

        v_lot_number := v_lot.lot_number;

        -- Fetch cold storage name
        IF v_lot.cold_storage_id IS NOT NULL THEN
            SELECT name INTO v_storage_name FROM public.cold_storages WHERE id = v_lot.cold_storage_id;
        END IF;

        -- SALE TRANSACTION: Deduct stock and prevent negative inventory
        IF p_type = 'SALE' THEN
            IF v_lot.current_stock_kg < v_num_qty THEN
                RAISE EXCEPTION 'Insufficient stock! Lot % only has % kg available. Requested % kg.', v_lot.lot_number, v_lot.current_stock_kg, v_num_qty;
            END IF;
            UPDATE public.inventory_lots 
            SET current_stock_kg = current_stock_kg - v_num_qty, updated_at = NOW() 
            WHERE id = p_lot_id;
        
        -- PURCHASE TRANSACTION: Increase stock
        ELSIF p_type = 'PURCHASE' THEN
            UPDATE public.inventory_lots 
            SET current_stock_kg = current_stock_kg + v_num_qty, updated_at = NOW() 
            WHERE id = p_lot_id;
        END IF;
    END IF;

    -- If cold storage specified directly
    IF p_cold_storage_id IS NOT NULL AND (v_storage_name IS NULL OR v_storage_name = '') THEN
        SELECT name INTO v_storage_name FROM public.cold_storages WHERE id = p_cold_storage_id;
    END IF;

    -- Insert into Combined Master Transactions Sheet
    INSERT INTO public.transactions (
        transaction_id,
        transaction_type,
        transaction_date,
        bill_number,
        party_name,
        party_phone,
        item_name,
        cold_storage_name,
        lot_number,
        quantity_kg,
        rate_per_kg,
        total_amount,
        paid_amount,
        balance_amount,
        payment_method,
        remarks,
        lot_id,
        cold_storage_id,
        created_by
    ) VALUES (
        v_txn_code,
        p_type,
        COALESCE(p_date, CURRENT_DATE),
        p_bill_number,
        TRIM(p_party_name),
        p_party_phone,
        p_item_name,
        v_storage_name,
        v_lot_number,
        v_num_qty,
        COALESCE(p_rate_per_kg, 0),
        v_num_total,
        v_num_paid,
        v_balance,
        COALESCE(p_payment_method, 'CASH'),
        p_remarks,
        p_lot_id,
        p_cold_storage_id,
        p_user_email
    )
    RETURNING * INTO v_inserted_txn;

    RETURN to_jsonb(v_inserted_txn);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
