-- ==============================================================================
-- SRI YN TRADING COMPANY — INITIAL SEED DEMO DATA
-- Demonstration records for testing (can be cleared anytime via System Settings)
-- ==============================================================================

-- 1. Cold Storages
INSERT INTO public.cold_storages (id, name, location, contact_person, phone, capacity_kg, remarks)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Guntur Sri Lakshmi Cold Storage', 'Kakani Road, Guntur, AP - 522005', 'K. Venkat Rao', '9848011223', 250000.00, 'Main hub for Teja and Byadgi lots'),
    ('22222222-2222-2222-2222-222222222222', 'Khammam Agro Preservation Center', 'Industrial Estate, Khammam, TS - 507003', 'M. Srinivas', '9440122334', 180000.00, 'Specialized cold room for export chilli')
ON CONFLICT (name) DO NOTHING;

-- 2. Inventory Lots
INSERT INTO public.inventory_lots (
    id, lot_number, item_name, chilli_variety, cold_storage_id, 
    supplier_name, purchase_date, opening_stock_kg, current_stock_kg, purchase_rate, bill_reference, remarks
) VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'YN-2026-TEJA-01',
        'Teja Deluxe Stemless Chilli',
        'Teja',
        '11111111-1111-1111-1111-111111111111',
        'Khammam Farmers Mandi Agent',
        '2026-11-01',
        15000.00,
        12500.00,
        215.00,
        'PUR-YN-881',
        'A-Grade premium dried red chilli, moisture < 10%'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'YN-2026-BYAD-02',
        'Byadgi Deep Red Wrinkled',
        'Byadgi',
        '11111111-1111-1111-1111-111111111111',
        'Karnataka Spice Traders',
        '2026-11-05',
        8000.00,
        6500.00,
        340.00,
        'PUR-YN-890',
        'Super deep red color, mild pungency for masala powder'
    )
ON CONFLICT (lot_number) DO NOTHING;

-- 3. Customers & Suppliers
INSERT INTO public.customers_suppliers (party_type, name, phone, address, current_balance)
VALUES 
    ('CUSTOMER', 'Siva Reddy Traders', '9849055667', 'APMC Market Yard, Guntur', 45000.00),
    ('CUSTOMER', 'Ananya Spices & Exports', '9988776655', 'Balanagar, Hyderabad', 0.00),
    ('SUPPLIER', 'Khammam Farmers Mandi Agent', '9440122334', 'Mandi Road, Khammam', 0.00)
ON CONFLICT DO NOTHING;

-- 4. Initial Master Transactions
INSERT INTO public.transactions (
    transaction_id, transaction_type, transaction_date, bill_number,
    party_name, party_phone, item_name, cold_storage_name, lot_number,
    quantity_kg, rate_per_kg, total_amount, paid_amount, balance_amount,
    payment_method, remarks
) VALUES 
    (
        'YN-P-261101-0101', 'PURCHASE', '2026-11-01', 'PUR-YN-881',
        'Khammam Farmers Mandi Agent', '9440122334', 'Teja Deluxe Stemless Chilli',
        'Guntur Sri Lakshmi Cold Storage', 'YN-2026-TEJA-01',
        15000.00, 215.00, 3225000.00, 3225000.00, 0.00,
        'BANK_TRANSFER', 'Initial lot purchase entered into storage'
    ),
    (
        'YN-S-261110-0202', 'SALE', '2026-11-10', 'BILL-YN-001',
        'Siva Reddy Traders', '9849055667', 'Teja Deluxe Stemless Chilli',
        'Guntur Sri Lakshmi Cold Storage', 'YN-2026-TEJA-01',
        2500.00, 245.00, 612500.00, 567500.00, 45000.00,
        'UPI', 'First dispatch to Siva Reddy Traders. Balance ₹45,000 pending.'
    ),
    (
        'YN-R-261112-0303', 'PAYMENT_RECEIVED', '2026-11-12', 'RCPT-001',
        'Siva Reddy Traders', '9849055667', NULL,
        NULL, NULL,
        0, 0, 0, 25000.00, 20000.00,
        'CASH', 'Part payment received towards BILL-YN-001 balance'
    )
ON CONFLICT (transaction_id) DO NOTHING;
