// ==============================================================================
// SRI YN TRADING COMPANY — CENTRAL DATABASE & API LAYER
// Handles Master Sheet, Billing, Purchases, Inventory, Payments & Storages
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';

// ==============================================================================
// 1. DASHBOARD METRICS
// ==============================================================================
export async function fetchDashboardMetrics() {
  if (!isSupabaseConfigured()) {
    return {
      todaySales: 0,
      totalPurchases: 0,
      availableStockKg: 0,
      pendingCustomerBalance: 0,
      totalBillsCount: 0,
      activeLotsCount: 0,
      recentTransactions: [],
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Available Stock from active lots
  const { data: lots, error: lotsErr } = await supabase
    .from('inventory_lots')
    .select('id, current_stock_kg, lot_number, item_name, purchase_rate')
    .eq('is_archived', false);

  if (lotsErr) console.warn('Lots metric error:', lotsErr);

  let totalStockKg = 0;
  (lots || []).forEach((lot) => {
    totalStockKg += Number(lot.current_stock_kg) || 0;
  });

  // 2. Transactions summary
  const { data: txns, error: txnErr } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(100);

  if (txnErr) console.warn('Transactions metric error:', txnErr);

  let todaySales = 0;
  let totalPurchases = 0;
  let pendingCustomerBalance = 0;
  let totalBillsCount = 0;

  (txns || []).forEach((t) => {
    const amt = Number(t.total_amount) || 0;
    const bal = Number(t.balance_amount) || 0;

    if (t.transaction_type === 'SALE') {
      totalBillsCount += 1;
      if (t.transaction_date === todayStr) {
        todaySales += amt;
      }
      pendingCustomerBalance += bal;
    } else if (t.transaction_type === 'PURCHASE') {
      totalPurchases += amt;
    }
  });

  return {
    todaySales,
    totalPurchases,
    availableStockKg: totalStockKg,
    pendingCustomerBalance,
    totalBillsCount,
    activeLotsCount: (lots || []).length,
    recentTransactions: (txns || []).slice(0, 8),
  };
}

// ==============================================================================
// 2. COMBINED MASTER TRANSACTIONS SHEET API
// Single source of truth for all business activities
// ==============================================================================
export async function fetchMasterTransactions({
  search = '',
  type = 'ALL',
  startDate = '',
  endDate = '',
  lotNumber = '',
  page = 1,
  limit = 100,
} = {}) {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (type && type !== 'ALL') {
    query = query.eq('transaction_type', type);
  }

  if (startDate) {
    query = query.gte('transaction_date', startDate);
  }

  if (endDate) {
    query = query.lte('transaction_date', endDate);
  }

  if (lotNumber) {
    query = query.eq('lot_number', lotNumber);
  }

  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(
      `party_name.ilike.%${s}%,bill_number.ilike.%${s}%,transaction_id.ilike.%${s}%,lot_number.ilike.%${s}%,item_name.ilike.%${s}%`
    );
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    transactions: data || [],
    totalCount: count || 0,
  };
}

// ==============================================================================
// 3. PROCESS BUSINESS TRANSACTION (ATOMIC FUNCTION CALL WITH FALLBACK)
// ==============================================================================
export async function recordBusinessTransaction(txnData, userEmail) {
  // First attempt atomic database stored procedure
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('process_business_transaction', {
      p_type: txnData.transaction_type,
      p_date: txnData.transaction_date,
      p_bill_number: txnData.bill_number,
      p_party_name: txnData.party_name,
      p_party_phone: txnData.party_phone || null,
      p_item_name: txnData.item_name || null,
      p_cold_storage_id: txnData.cold_storage_id || null,
      p_lot_id: txnData.lot_id || null,
      p_quantity_kg: Number(txnData.quantity_kg) || 0,
      p_rate_per_kg: Number(txnData.rate_per_kg) || 0,
      p_total_amount: Number(txnData.total_amount) || 0,
      p_paid_amount: Number(txnData.paid_amount) || 0,
      p_payment_method: txnData.payment_method || 'CASH',
      p_remarks: txnData.remarks || null,
      p_user_email: userEmail || 'admin',
    });

    if (!rpcError && rpcData) {
      return rpcData;
    }
  } catch (rpcEx) {
    console.warn('RPC process_business_transaction exception, using direct fallback:', rpcEx);
  }

  // Fallback: Direct table operations if RPC not executed in Supabase SQL editor yet
  const qty = Number(txnData.quantity_kg) || 0;
  const total = Number(txnData.total_amount) || 0;
  const paid = Number(txnData.paid_amount) || 0;
  const balance = Math.max(0, total - paid);

  let lotNumber = txnData.lot_number || '';
  let storageName = txnData.cold_storage_name || '';

  // 1. If Lot linked, update lot stock
  if (txnData.lot_id) {
    const { data: lot, error: fetchErr } = await supabase
      .from('inventory_lots')
      .select('*')
      .eq('id', txnData.lot_id)
      .single();

    if (!fetchErr && lot) {
      lotNumber = lot.lot_number;
      if (lot.cold_storage_id && !storageName) {
        const { data: cs } = await supabase.from('cold_storages').select('name').eq('id', lot.cold_storage_id).maybeSingle();
        if (cs) storageName = cs.name;
      }

      if (txnData.transaction_type === 'SALE') {
        if (lot.current_stock_kg < qty) {
          throw new Error(`Insufficient stock in lot ${lot.lot_number}! Available: ${lot.current_stock_kg} kg, Requested: ${qty} kg.`);
        }
        await supabase
          .from('inventory_lots')
          .update({ current_stock_kg: lot.current_stock_kg - qty, updated_at: new Date().toISOString() })
          .eq('id', txnData.lot_id);
      } else if (txnData.transaction_type === 'PURCHASE') {
        await supabase
          .from('inventory_lots')
          .update({ current_stock_kg: lot.current_stock_kg + qty, updated_at: new Date().toISOString() })
          .eq('id', txnData.lot_id);
      }
    }
  }

  // 2. Generate unique Transaction ID
  const typeChar = (txnData.transaction_type || 'T').charAt(0).toUpperCase();
  const dateNum = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const txnId = `YN-${typeChar}-${dateNum}-${randNum}`;

  // 3. Insert into Master Transactions Sheet
  const insertPayload = {
    transaction_id: txnId,
    transaction_type: txnData.transaction_type,
    transaction_date: txnData.transaction_date || new Date().toISOString().split('T')[0],
    bill_number: txnData.bill_number,
    party_name: txnData.party_name.trim(),
    party_phone: txnData.party_phone?.trim() || null,
    item_name: txnData.item_name || null,
    cold_storage_name: storageName || null,
    lot_number: lotNumber || null,
    quantity_kg: qty,
    rate_per_kg: Number(txnData.rate_per_kg) || 0,
    total_amount: total,
    paid_amount: paid,
    balance_amount: balance,
    payment_method: txnData.payment_method || 'CASH',
    remarks: txnData.remarks?.trim() || null,
    lot_id: txnData.lot_id || null,
    cold_storage_id: txnData.cold_storage_id || null,
    created_by: userEmail || 'admin',
  };

  const { data: inserted, error: insertError } = await supabase
    .from('transactions')
    .insert([insertPayload])
    .select()
    .single();

  if (insertError) throw insertError;
  return inserted;
}

// ==============================================================================
// 4. INVENTORY LOTS API
// ==============================================================================
export async function fetchInventoryLots(includeArchived = false) {
  let query = supabase
    .from('inventory_lots')
    .select(`
      *,
      cold_storage:cold_storages (id, name, location)
    `)
    .order('lot_number', { ascending: true });

  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createInventoryLot(lotData, userEmail) {
  const openQty = Number(lotData.opening_stock_kg) || 0;
  const insertPayload = {
    lot_number: lotData.lot_number.trim().toUpperCase(),
    item_name: lotData.item_name.trim(),
    chilli_variety: lotData.chilli_variety || 'Teja',
    cold_storage_id: lotData.cold_storage_id,
    supplier_name: lotData.supplier_name.trim(),
    purchase_date: lotData.purchase_date || new Date().toISOString().split('T')[0],
    opening_stock_kg: openQty,
    current_stock_kg: openQty,
    purchase_rate: Number(lotData.purchase_rate) || 0,
    bill_reference: lotData.bill_reference?.trim() || null,
    remarks: lotData.remarks?.trim() || null,
  };

  const { data, error } = await supabase
    .from('inventory_lots')
    .insert([insertPayload])
    .select()
    .single();

  if (error) throw error;

  // Auto record initial purchase transaction in Master Sheet if opening stock > 0
  if (openQty > 0) {
    const rate = Number(lotData.purchase_rate) || 0;
    await recordBusinessTransaction(
      {
        transaction_type: 'PURCHASE',
        transaction_date: lotData.purchase_date,
        bill_number: lotData.bill_reference || `PUR-${lotData.lot_number}`,
        party_name: lotData.supplier_name,
        item_name: lotData.item_name,
        cold_storage_id: lotData.cold_storage_id,
        lot_id: data.id,
        lot_number: data.lot_number,
        quantity_kg: openQty,
        rate_per_kg: rate,
        total_amount: openQty * rate,
        paid_amount: openQty * rate,
        payment_method: 'CASH',
        remarks: `Initial stock intake for lot ${data.lot_number}`,
      },
      userEmail
    ).catch((e) => console.warn('Auto txn note:', e));
  }

  return data;
}

export async function deleteInventoryLot(lotId) {
  const { error } = await supabase.from('inventory_lots').delete().eq('id', lotId);
  if (error) throw error;
  return true;
}

// ==============================================================================
// 5. COLD STORAGES API
// ==============================================================================
export async function fetchColdStorages() {
  const { data, error } = await supabase
    .from('cold_storages')
    .select('*')
    .eq('is_archived', false)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createColdStorage(storageData) {
  const insertPayload = {
    name: storageData.name.trim(),
    location: storageData.location.trim(),
    contact_person: storageData.contact_person?.trim() || null,
    phone: storageData.phone?.trim() || null,
    capacity_kg: Number(storageData.capacity_kg) || 0,
    remarks: storageData.remarks?.trim() || null,
  };

  const { data, error } = await supabase
    .from('cold_storages')
    .insert([insertPayload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==============================================================================
// 6. CUSTOMERS & SUPPLIERS DIRECTORY
// ==============================================================================
export async function fetchParties(type = 'ALL') {
  let query = supabase.from('customers_suppliers').select('*').order('name', { ascending: true });
  if (type !== 'ALL') {
    query = query.or(`party_type.eq.${type},party_type.eq.BOTH`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createParty(partyData) {
  const { data, error } = await supabase
    .from('customers_suppliers')
    .insert([
      {
        party_type: partyData.party_type || 'CUSTOMER',
        name: partyData.name.trim(),
        phone: partyData.phone?.trim() || null,
        address: partyData.address?.trim() || null,
        current_balance: Number(partyData.current_balance) || 0,
        remarks: partyData.remarks?.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==============================================================================
// 7. BILL & DOCUMENT STORAGE API
// ==============================================================================
export async function uploadBillDocument(file, billNumber, partyName, userEmail) {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `bills/${Date.now()}_${cleanName}`;

  const { data: storageData, error: storageError } = await supabase.storage
    .from('bills')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (storageError) throw storageError;

  // Insert into uploaded_bills table
  const { data: billRecord, error: recordError } = await supabase
    .from('uploaded_bills')
    .insert([
      {
        bill_number: billNumber || `BILL-${Date.now()}`,
        party_name: partyName || 'Mandi Supplier',
        storage_path: storageData.path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: userEmail || 'admin',
      },
    ])
    .select()
    .single();

  if (recordError) console.warn('Bill record note:', recordError.message);
  return billRecord || storageData;
}

export async function fetchUploadedBills() {
  const { data, error } = await supabase
    .from('uploaded_bills')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBillFileUrl(storagePath) {
  if (!storagePath) return null;
  const { data } = supabase.storage.from('bills').getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

// ==============================================================================
// 8. CLIENT HANDOVER RESET (ZERO EVERY COLUMN)
// ==============================================================================
export async function clearAllSystemData() {
  await supabase.from('uploaded_bills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('inventory_lots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('cold_storages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('customers_suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  return true;
}
