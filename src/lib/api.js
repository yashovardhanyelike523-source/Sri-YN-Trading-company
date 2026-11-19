// ==============================================================================
// SRI YN TRADING COMPANY — COMPLETE DATA & BACKEND API LAYER
// Handles Master Register, Billing, Procurement, Inventory, Payments & Backups
// Works with Appwrite Cloud Database & Persistent Browser Storage Fallback
// ==============================================================================

import { databases, storage, APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS, APPWRITE_BUCKET_ID, ID, Query } from './appwrite';

// Local Storage Keys for offline persistence & instant load
const LS_TXNS = 'sri_yn_txns_v1';
const LS_LOTS = 'sri_yn_lots_v1';
const LS_STORAGES = 'sri_yn_storages_v1';
const LS_PARTIES = 'sri_yn_parties_v1';
const LS_BILLS = 'sri_yn_bills_v1';

// Initial Demonstration Data for SRI YN TRADING COMPANY
const INITIAL_STORAGES = [
  {
    id: 'CS-01',
    name: 'Sri Venkateswara Cold Storage',
    location: 'Guntur - Miryalaguda Highway, AP',
    contact_person: 'Subba Rao (Manager)',
    phone: '9848011223',
    capacity_kg: 500000,
    remarks: 'Chamber 1 to 4 with humidity control',
  },
  {
    id: 'CS-02',
    name: 'Tirumala Agri Cold Storage',
    location: 'Chilakaluripet Road, Guntur',
    contact_person: 'Venkatesh',
    phone: '9848099887',
    capacity_kg: 350000,
    remarks: 'Chamber A & B (Premium Teja preservation)',
  },
  {
    id: 'CS-03',
    name: 'Bhavani Cold Storage & Warehousing',
    location: 'Khammam By-Pass Road',
    contact_person: 'Ramanaiah',
    phone: '9440155667',
    capacity_kg: 400000,
    remarks: 'Dedicated stemless chilli bay',
  },
];

const INITIAL_LOTS = [
  {
    id: 'LOT-01',
    lot_number: 'LOT-YN-2026-101',
    lot_no: 'LOT-YN-2026-101',
    cold_storage_name: 'Sri Venkateswara Cold Storage',
    cold_storage: 'Sri Venkateswara Cold Storage',
    item_name: 'Red Chilli Teja (S17)',
    current_stock_kg: 8500,
    initial_stock_kg: 10000,
    purchase_rate: 195,
    remarks: 'Prime deep red quality, moisture 10%',
    status: 'active',
  },
  {
    id: 'LOT-02',
    lot_number: 'LOT-YN-2026-102',
    lot_no: 'LOT-YN-2026-102',
    cold_storage_name: 'Tirumala Agri Cold Storage',
    cold_storage: 'Tirumala Agri Cold Storage',
    item_name: 'Red Chilli Byadgi (5531)',
    current_stock_kg: 5200,
    initial_stock_kg: 6000,
    purchase_rate: 240,
    remarks: 'High color oil value, deluxe grade',
    status: 'active',
  },
  {
    id: 'LOT-03',
    lot_number: 'LOT-YN-2026-103',
    lot_no: 'LOT-YN-2026-103',
    cold_storage_name: 'Sri Venkateswara Cold Storage',
    cold_storage: 'Sri Venkateswara Cold Storage',
    item_name: 'Red Chilli 334 / S10',
    current_stock_kg: 12000,
    initial_stock_kg: 15000,
    purchase_rate: 180,
    remarks: 'Medium pungency, standard market yard quality',
    status: 'active',
  },
  {
    id: 'LOT-04',
    lot_number: 'LOT-YN-2026-104',
    lot_no: 'LOT-YN-2026-104',
    cold_storage_name: 'Bhavani Cold Storage & Warehousing',
    cold_storage: 'Bhavani Cold Storage & Warehousing',
    item_name: 'Red Chilli Fatki / Phatki',
    current_stock_kg: 3400,
    initial_stock_kg: 4000,
    purchase_rate: 125,
    remarks: 'Powder blending grade',
    status: 'active',
  },
];

const INITIAL_PARTIES = [
  {
    id: 'P-01',
    name: 'Sri Rama Traders',
    type: 'customer',
    phone: '9848012345',
    village_city: 'Guntur APMC Yard',
    outstanding_balance: 45000,
  },
  {
    id: 'P-02',
    name: 'Balaji Spices & Export Ltd',
    type: 'customer',
    phone: '9849067890',
    village_city: 'Chennai Port Hub',
    outstanding_balance: 120000,
  },
  {
    id: 'P-03',
    name: 'Venkata Rao (Farmer)',
    type: 'supplier',
    phone: '9440188990',
    village_city: 'Miryalaguda, Nalgonda',
    outstanding_balance: 28000,
  },
  {
    id: 'P-04',
    name: 'Laxminarayana Chilli Farm',
    type: 'supplier',
    phone: '9440233445',
    village_city: 'Warangal Mandi',
    outstanding_balance: 0,
  },
];

const INITIAL_TXNS = [
  {
    id: 'TXN-01',
    transaction_id: 'YN-S-20261114-1001',
    transaction_date: '2026-11-14',
    date: '2026-11-14',
    transaction_type: 'SALE',
    type: 'SALE',
    party_name: 'Sri Rama Traders',
    party_phone: '9848012345',
    item_name: 'Red Chilli Teja (S17)',
    cold_storage_name: 'Sri Venkateswara Cold Storage',
    cold_storage: 'Sri Venkateswara Cold Storage',
    lot_number: 'LOT-YN-2026-101',
    lot_no: 'LOT-YN-2026-101',
    quantity_kg: 1500,
    rate_per_kg: 215,
    total_amount: 322500,
    paid_amount: 277500,
    balance_amount: 45000,
    bill_number: 'BILL-20261114-1001',
    bill_no: 'BILL-20261114-1001',
    payment_mode: 'UPI / PhonePe',
    remarks: 'Dispatched in Lorry AP-07-TJ-4455',
    status: 'active',
  },
  {
    id: 'TXN-02',
    transaction_id: 'YN-P-20261112-2001',
    transaction_date: '2026-11-12',
    date: '2026-11-12',
    transaction_type: 'PURCHASE',
    type: 'PURCHASE',
    party_name: 'Venkata Rao (Farmer)',
    party_phone: '9440188990',
    item_name: 'Red Chilli Teja (S17)',
    cold_storage_name: 'Sri Venkateswara Cold Storage',
    cold_storage: 'Sri Venkateswara Cold Storage',
    lot_number: 'LOT-YN-2026-101',
    lot_no: 'LOT-YN-2026-101',
    quantity_kg: 10000,
    rate_per_kg: 195,
    total_amount: 1950000,
    paid_amount: 1922000,
    balance_amount: 28000,
    bill_number: 'PUR-20261112-2001',
    bill_no: 'PUR-20261112-2001',
    payment_mode: 'Bank Transfer (NEFT/RTGS)',
    remarks: 'Direct farmer intake, weighbridge slip #882',
    status: 'active',
  },
  {
    id: 'TXN-03',
    transaction_id: 'YN-R-20261113-3001',
    transaction_date: '2026-11-13',
    date: '2026-11-13',
    transaction_type: 'RECEIPT',
    type: 'RECEIPT',
    party_name: 'Balaji Spices & Export Ltd',
    party_phone: '9849067890',
    item_name: 'Payment Receipt',
    cold_storage_name: '',
    cold_storage: '',
    lot_number: '',
    lot_no: '',
    quantity_kg: 0,
    rate_per_kg: 0,
    total_amount: 80000,
    paid_amount: 80000,
    balance_amount: 0,
    bill_number: 'RCT-20261113-3001',
    bill_no: 'RCT-20261113-3001',
    payment_mode: 'Bank Transfer (NEFT/RTGS)',
    remarks: 'Part payment against old balance',
    status: 'active',
  },
];

// Helper to get local data safely
function getLocal(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// Ensure default data exists
if (!localStorage.getItem(LS_TXNS)) setLocal(LS_TXNS, INITIAL_TXNS);
if (!localStorage.getItem(LS_LOTS)) setLocal(LS_LOTS, INITIAL_LOTS);
if (!localStorage.getItem(LS_STORAGES)) setLocal(LS_STORAGES, INITIAL_STORAGES);
if (!localStorage.getItem(LS_PARTIES)) setLocal(LS_PARTIES, INITIAL_PARTIES);
if (!localStorage.getItem(LS_BILLS)) setLocal(LS_BILLS, []);

// ==============================================================================
// 1. DASHBOARD METRICS
// ==============================================================================
export async function fetchDashboardMetrics() {
  const txns = getLocal(LS_TXNS, INITIAL_TXNS);
  const lots = getLocal(LS_LOTS, INITIAL_LOTS);
  const todayStr = new Date().toISOString().split('T')[0];

  let todaySales = 0;
  let totalPurchases = 0;
  let pendingCustomerBalance = 0;
  let totalBillsCount = 0;

  txns.forEach((t) => {
    const type = (t.transaction_type || t.type || '').toUpperCase();
    const amt = Number(t.total_amount) || 0;
    const bal = Number(t.balance_amount) || 0;
    const d = (t.transaction_date || t.date || '').substring(0, 10);

    if (type === 'SALE') {
      totalBillsCount += 1;
      if (d === todayStr) {
        todaySales += amt;
      }
      pendingCustomerBalance += bal;
    } else if (type === 'PURCHASE') {
      totalPurchases += amt;
    }
  });

  const availableStockKg = lots.reduce((sum, l) => sum + (Number(l.current_stock_kg) || 0), 0);

  return {
    todaySales,
    totalPurchases,
    availableStockKg,
    pendingCustomerBalance,
    totalBillsCount,
    activeLotsCount: lots.length,
    recentTransactions: txns.slice(0, 8),
  };
}

// ==============================================================================
// 2. COMBINED MASTER TRANSACTIONS SHEET API
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
  // Try remote Appwrite first
  try {
    const queries = [Query.orderDesc('$createdAt'), Query.limit(limit)];
    if (type && type !== 'ALL') queries.push(Query.equal('type', type.toLowerCase()));
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.TRANSACTIONS, queries);
    if (res.documents && res.documents.length > 0) {
      return { transactions: res.documents, totalCount: res.total };
    }
  } catch (err) {
    // Graceful fallback to persistent local master sheet
  }

  const txns = getLocal(LS_TXNS, INITIAL_TXNS);

  let filtered = txns.filter((t) => {
    const tType = (t.transaction_type || t.type || '').toUpperCase();
    const tDate = (t.transaction_date || t.date || '').substring(0, 10);
    const tLot = t.lot_number || t.lot_no || '';
    const tParty = (t.party_name || '').toLowerCase();
    const tBill = (t.bill_number || t.bill_no || '').toLowerCase();
    const tId = (t.transaction_id || '').toLowerCase();

    if (type && type !== 'ALL' && tType !== type.toUpperCase()) return false;
    if (startDate && tDate < startDate) return false;
    if (endDate && tDate > endDate) return false;
    if (lotNumber && tLot !== lotNumber) return false;

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const match = tParty.includes(q) || tBill.includes(q) || tId.includes(q) || tLot.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return {
    transactions: filtered,
    totalCount: filtered.length,
  };
}

// ==============================================================================
// 3. BILLING (SALE) API
// Automatically logs to Master Sheet & decrements lot stock
// ==============================================================================
export async function createSaleBill(billData) {
  const txns = getLocal(LS_TXNS, INITIAL_TXNS);
  const lots = getLocal(LS_LOTS, INITIAL_LOTS);
  const parties = getLocal(LS_PARTIES, INITIAL_PARTIES);

  const txnId = `YN-S-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTxn = {
    id: txnId,
    transaction_id: txnId,
    transaction_date: billData.transaction_date,
    date: billData.transaction_date,
    transaction_type: 'SALE',
    type: 'SALE',
    party_name: billData.party_name,
    party_phone: billData.party_phone || '',
    item_name: billData.item_name || 'Red Chilli',
    cold_storage_name: billData.cold_storage_name || '',
    cold_storage: billData.cold_storage_name || '',
    lot_number: billData.lot_number || '',
    lot_no: billData.lot_number || '',
    quantity_kg: Number(billData.quantity_kg) || 0,
    rate_per_kg: Number(billData.rate_per_kg) || 0,
    total_amount: Number(billData.total_amount) || 0,
    paid_amount: Number(billData.paid_amount) || 0,
    balance_amount: Number(billData.balance_amount) || 0,
    bill_number: billData.bill_number,
    bill_no: billData.bill_number,
    payment_mode: billData.payment_mode || 'Cash',
    remarks: billData.remarks || '',
    status: 'active',
  };

  // 1. Prepend to Master Sheet
  txns.unshift(newTxn);
  setLocal(LS_TXNS, txns);

  // 2. Decrement Stock from Lot
  if (billData.lot_number) {
    const lotIdx = lots.findIndex((l) => (l.lot_number || l.lot_no) === billData.lot_number);
    if (lotIdx !== -1) {
      const prevStock = Number(lots[lotIdx].current_stock_kg) || 0;
      lots[lotIdx].current_stock_kg = Math.max(0, prevStock - Number(billData.quantity_kg));
      setLocal(LS_LOTS, lots);
    }
  }

  // 3. Update customer outstanding balance if any
  if (billData.balance_amount > 0) {
    const partyIdx = parties.findIndex((p) => p.name.toLowerCase() === billData.party_name.toLowerCase());
    if (partyIdx !== -1) {
      parties[partyIdx].outstanding_balance = (Number(parties[partyIdx].outstanding_balance) || 0) + Number(billData.balance_amount);
    } else {
      parties.push({
        id: `P-${Date.now()}`,
        name: billData.party_name,
        type: 'customer',
        phone: billData.party_phone || '',
        village_city: 'APMC Market',
        outstanding_balance: Number(billData.balance_amount),
      });
    }
    setLocal(LS_PARTIES, parties);
  }

  // Attempt async sync to Appwrite (silent background)
  try {
    databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.TRANSACTIONS, ID.unique(), {
      transaction_id: txnId,
      date: billData.transaction_date,
      type: 'sale',
      party_name: billData.party_name,
      party_phone: billData.party_phone || '',
      item_name: billData.item_name || 'Red Chilli',
      cold_storage: billData.cold_storage_name || '',
      lot_no: billData.lot_number || '',
      quantity_kg: Number(billData.quantity_kg) || 0,
      rate_per_kg: Number(billData.rate_per_kg) || 0,
      total_amount: Number(billData.total_amount) || 0,
      paid_amount: Number(billData.paid_amount) || 0,
      balance_amount: Number(billData.balance_amount) || 0,
      bill_no: billData.bill_number,
      payment_mode: billData.payment_mode || 'Cash',
      remarks: billData.remarks || '',
      status: 'active',
    }).catch(() => {});
  } catch {}

  return { success: true, data: newTxn };
}

// ==============================================================================
// 4. PURCHASES (PROCUREMENT) API
// Automatically logs to Master Sheet & increments lot stock
// ==============================================================================
export async function createPurchase(purchaseData) {
  const txns = getLocal(LS_TXNS, INITIAL_TXNS);
  const lots = getLocal(LS_LOTS, INITIAL_LOTS);
  const parties = getLocal(LS_PARTIES, INITIAL_PARTIES);

  const txnId = `YN-P-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTxn = {
    id: txnId,
    transaction_id: txnId,
    transaction_date: purchaseData.transaction_date,
    date: purchaseData.transaction_date,
    transaction_type: 'PURCHASE',
    type: 'PURCHASE',
    party_name: purchaseData.party_name,
    party_phone: purchaseData.party_phone || '',
    item_name: purchaseData.item_name || 'Red Chilli',
    cold_storage_name: purchaseData.cold_storage_name || '',
    cold_storage: purchaseData.cold_storage_name || '',
    lot_number: purchaseData.lot_number,
    lot_no: purchaseData.lot_number,
    quantity_kg: Number(purchaseData.quantity_kg) || 0,
    rate_per_kg: Number(purchaseData.rate_per_kg) || 0,
    total_amount: Number(purchaseData.total_amount) || 0,
    paid_amount: Number(purchaseData.paid_amount) || 0,
    balance_amount: Number(purchaseData.balance_amount) || 0,
    bill_number: purchaseData.bill_number,
    bill_no: purchaseData.bill_number,
    payment_mode: purchaseData.payment_mode || 'Bank Transfer',
    remarks: purchaseData.remarks || '',
    status: 'active',
  };

  // 1. Add to Master Sheet
  txns.unshift(newTxn);
  setLocal(LS_TXNS, txns);

  // 2. Increase stock or create new Lot
  const lotIdx = lots.findIndex((l) => (l.lot_number || l.lot_no) === purchaseData.lot_number);
  if (lotIdx !== -1) {
    lots[lotIdx].current_stock_kg = (Number(lots[lotIdx].current_stock_kg) || 0) + Number(purchaseData.quantity_kg);
  } else {
    lots.push({
      id: `LOT-${Date.now()}`,
      lot_number: purchaseData.lot_number,
      lot_no: purchaseData.lot_number,
      cold_storage_name: purchaseData.cold_storage_name,
      cold_storage: purchaseData.cold_storage_name,
      item_name: purchaseData.item_name,
      current_stock_kg: Number(purchaseData.quantity_kg),
      initial_stock_kg: Number(purchaseData.quantity_kg),
      purchase_rate: Number(purchaseData.rate_per_kg),
      remarks: purchaseData.remarks || 'New purchase lot',
      status: 'active',
    });
  }
  setLocal(LS_LOTS, lots);

  // 3. Update Supplier balance
  if (purchaseData.balance_amount > 0) {
    const sIdx = parties.findIndex((p) => p.name.toLowerCase() === purchaseData.party_name.toLowerCase());
    if (sIdx !== -1) {
      parties[sIdx].outstanding_balance = (Number(parties[sIdx].outstanding_balance) || 0) + Number(purchaseData.balance_amount);
    } else {
      parties.push({
        id: `P-${Date.now()}`,
        name: purchaseData.party_name,
        type: 'supplier',
        phone: purchaseData.party_phone || '',
        village_city: 'Mandi / Farmer',
        outstanding_balance: Number(purchaseData.balance_amount),
      });
    }
    setLocal(LS_PARTIES, parties);
  }

  return { success: true, data: newTxn };
}

// ==============================================================================
// 5. PAYMENTS & RECEIPTS API
// ==============================================================================
export async function recordPayment(paymentData) {
  const txns = getLocal(LS_TXNS, INITIAL_TXNS);
  const parties = getLocal(LS_PARTIES, INITIAL_PARTIES);

  const isReceipt = paymentData.transaction_type === 'RECEIPT';
  const prefix = isReceipt ? 'R' : 'M';
  const txnId = `YN-${prefix}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTxn = {
    id: txnId,
    transaction_id: txnId,
    transaction_date: paymentData.transaction_date,
    date: paymentData.transaction_date,
    transaction_type: paymentData.transaction_type,
    type: paymentData.transaction_type,
    party_name: paymentData.party_name,
    party_phone: paymentData.party_phone || '',
    item_name: isReceipt ? 'Customer Receipt' : 'Supplier Payment',
    cold_storage_name: '',
    cold_storage: '',
    lot_number: '',
    lot_no: '',
    quantity_kg: 0,
    rate_per_kg: 0,
    total_amount: Number(paymentData.amount) || 0,
    paid_amount: Number(paymentData.amount) || 0,
    balance_amount: 0,
    bill_number: paymentData.bill_number,
    bill_no: paymentData.bill_number,
    payment_mode: paymentData.payment_mode || 'Cash',
    remarks: paymentData.remarks || '',
    status: 'active',
  };

  txns.unshift(newTxn);
  setLocal(LS_TXNS, txns);

  // Update party balance
  const pIdx = parties.findIndex((p) => p.name.toLowerCase() === paymentData.party_name.toLowerCase());
  if (pIdx !== -1) {
    const cur = Number(parties[pIdx].outstanding_balance) || 0;
    parties[pIdx].outstanding_balance = Math.max(0, cur - Number(paymentData.amount));
    setLocal(LS_PARTIES, parties);
  }

  return { success: true, data: newTxn };
}

// ==============================================================================
// 6. INVENTORY LOTS CRUD
// ==============================================================================
export async function fetchActiveLots() {
  return getLocal(LS_LOTS, INITIAL_LOTS);
}

export async function createLot(lotData) {
  const lots = getLocal(LS_LOTS, INITIAL_LOTS);
  const newLot = {
    id: `LOT-${Date.now()}`,
    ...lotData,
  };
  lots.unshift(newLot);
  setLocal(LS_LOTS, lots);
  return { success: true, data: newLot };
}

export async function deleteLot(lotId) {
  const lots = getLocal(LS_LOTS, INITIAL_LOTS);
  const filtered = lots.filter((l) => l.id !== lotId && l.lot_number !== lotId && l.lot_no !== lotId);
  setLocal(LS_LOTS, filtered);
  return { success: true };
}

// ==============================================================================
// 7. COLD STORAGES CRUD
// ==============================================================================
export async function fetchColdStorages() {
  return getLocal(LS_STORAGES, INITIAL_STORAGES);
}

export async function createColdStorage(storageData) {
  const storages = getLocal(LS_STORAGES, INITIAL_STORAGES);
  const newCs = {
    id: `CS-${Date.now()}`,
    ...storageData,
  };
  storages.push(newCs);
  setLocal(LS_STORAGES, storages);
  return { success: true, data: newCs };
}

export async function deleteColdStorage(storageId) {
  const storages = getLocal(LS_STORAGES, INITIAL_STORAGES);
  const filtered = storages.filter((s) => s.id !== storageId && s.name !== storageId);
  setLocal(LS_STORAGES, filtered);
  return { success: true };
}

// ==============================================================================
// 8. PARTIES CRUD
// ==============================================================================
export async function fetchParties(type = 'all') {
  const parties = getLocal(LS_PARTIES, INITIAL_PARTIES);
  if (type === 'all') return parties;
  return parties.filter((p) => p.type === type || p.type === 'both');
}

export async function createParty(partyData) {
  const parties = getLocal(LS_PARTIES, INITIAL_PARTIES);
  const newP = {
    id: `P-${Date.now()}`,
    ...partyData,
  };
  parties.push(newP);
  setLocal(LS_PARTIES, parties);
  return { success: true, data: newP };
}

export async function deleteParty(partyId) {
  const parties = getLocal(LS_PARTIES, INITIAL_PARTIES);
  const filtered = parties.filter((p) => p.id !== partyId && p.name !== partyId);
  setLocal(LS_PARTIES, filtered);
  return { success: true };
}

// ==============================================================================
// 9. BILL UPLOADS & STORAGE
// ==============================================================================
export async function uploadBillDocument({ file, bill_number, remarks }) {
  const bills = getLocal(LS_BILLS, []);
  let fileUrl = URL.createObjectURL(file);

  // Attempt Appwrite upload if possible
  try {
    const uploaded = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
    if (uploaded && uploaded.$id) {
      fileUrl = storage.getFileView(APPWRITE_BUCKET_ID, uploaded.$id).toString();
    }
  } catch (err) {
    console.warn('Appwrite file upload note:', err);
  }

  const record = {
    id: `DOC-${Date.now()}`,
    bill_number: bill_number || `DOC-${Date.now()}`,
    file_name: file.name,
    file_size: file.size,
    file_url: fileUrl,
    remarks: remarks || '',
    created_at: new Date().toISOString(),
  };

  bills.unshift(record);
  setLocal(LS_BILLS, bills);
  return { success: true, data: record };
}

export async function fetchUploadedBills() {
  return getLocal(LS_BILLS, []);
}

// ==============================================================================
// 10. SYSTEM RESET & EXPORT
// ==============================================================================
export async function resetAllDataToCleanSlate() {
  localStorage.setItem(LS_TXNS, JSON.stringify([]));
  localStorage.setItem(LS_LOTS, JSON.stringify([]));
  localStorage.setItem(LS_STORAGES, JSON.stringify([]));
  localStorage.setItem(LS_PARTIES, JSON.stringify([]));
  localStorage.setItem(LS_BILLS, JSON.stringify([]));
  return true;
}

export function exportFullBackupJson() {
  const backup = {
    company: 'SRI YN TRADING COMPANY',
    exported_at: new Date().toISOString(),
    transactions: getLocal(LS_TXNS, []),
    inventory_lots: getLocal(LS_LOTS, []),
    cold_storages: getLocal(LS_STORAGES, []),
    parties: getLocal(LS_PARTIES, []),
    uploaded_bills: getLocal(LS_BILLS, []),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SRI_YN_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
