import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Save, 
  RefreshCw, 
  User, 
  Phone, 
  Warehouse, 
  Layers, 
  Scale, 
  IndianRupee, 
  CheckCircle, 
  PlusCircle 
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { 
  formatCurrency, 
  formatWeight, 
  generateBillNumber, 
  formatDateIndian 
} from '../lib/formatters';
import { 
  fetchActiveLots, 
  fetchColdStorages, 
  fetchParties, 
  createPurchase, 
  fetchMasterTransactions 
} from '../lib/api';

export default function PurchasePage({ onNavigateToMaster }) {
  const { lang } = useLang();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lots, setLots] = useState([]);
  const [storages, setStorages] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);

  // Form State
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [itemName, setItemName] = useState('Red Chilli Teja (S17)');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedLot, setSelectedLot] = useState('');
  const [newLotNumber, setNewLotNumber] = useState('');
  const [isCreatingNewLot, setIsCreatingNewLot] = useState(true);
  const [quantityKg, setQuantityKg] = useState('');
  const [purchaseRate, setPurchaseRate] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer (NEFT/RTGS)');
  const [remarks, setRemarks] = useState('');

  // Auto Calculations
  const qtyNum = parseFloat(quantityKg) || 0;
  const rateNum = parseFloat(purchaseRate) || 0;
  const totalAmount = Math.round(qtyNum * rateNum);
  const paidNum = parseFloat(paidAmount) || 0;
  const balanceAmount = Math.max(0, totalAmount - paidNum);

  useEffect(() => {
    loadData();
    // Pre-generate a new lot number
    setNewLotNumber(`LOT-YN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [lotsData, storageData, partiesData, recentTxns] = await Promise.all([
        fetchActiveLots(),
        fetchColdStorages(),
        fetchParties('supplier'),
        fetchMasterTransactions({ type: 'PURCHASE', limit: 8 }),
      ]);
      setLots(lotsData || []);
      setStorages(storageData || []);
      setSuppliers(partiesData || []);
      setRecentPurchases(recentTxns.transactions || []);

      if (storageData && storageData.length > 0 && !selectedStorage) {
        setSelectedStorage(storageData[0].name);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load purchase reference data.');
    } finally {
      setLoading(false);
    }
  }

  function handleSupplierSelect(e) {
    const name = e.target.value;
    setSupplierName(name);
    const found = suppliers.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (found && found.phone) {
      setSupplierPhone(found.phone);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!supplierName.trim()) {
      showWarning('Please enter supplier/farmer name');
      return;
    }
    if (!qtyNum || qtyNum <= 0) {
      showWarning('Please enter quantity in kg');
      return;
    }
    if (!rateNum || rateNum <= 0) {
      showWarning('Please enter purchase rate per kg');
      return;
    }

    const finalLot = isCreatingNewLot ? newLotNumber.trim() : selectedLot;
    if (!finalLot) {
      showWarning('Please provide a valid Lot number');
      return;
    }

    setSubmitting(true);
    try {
      const purchaseData = {
        bill_number: generateBillNumber('PURCHASE'),
        transaction_date: purchaseDate,
        party_name: supplierName.trim(),
        party_phone: supplierPhone.trim(),
        item_name: itemName,
        cold_storage_name: selectedStorage,
        lot_number: finalLot,
        quantity_kg: qtyNum,
        rate_per_kg: rateNum,
        total_amount: totalAmount,
        paid_amount: paidNum,
        balance_amount: balanceAmount,
        payment_mode: paymentMode,
        remarks: remarks.trim(),
        is_new_lot: isCreatingNewLot,
      };

      const result = await createPurchase(purchaseData);

      if (result.success) {
        showSuccess(`Chilli purchase of ${formatWeight(qtyNum)} recorded & stock updated!`);

        // Reset
        setSupplierName('');
        setSupplierPhone('');
        setQuantityKg('');
        setPurchaseRate('');
        setPaidAmount('');
        setRemarks('');
        setNewLotNumber(`LOT-YN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);

        loadData();
      } else {
        showError(result.error || 'Failed to record purchase.');
      }
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error recording purchase');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-red-900 via-stone-800 to-amber-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-700/80 rounded-xl">
            <ShoppingBag className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'te' ? 'క్రొత్త కొనుగోలు (Chilli Purchase Intake)' : 'Chilli Purchase & Stock Intake'}
            </h1>
            <p className="text-amber-100 text-sm mt-1">
              {lang === 'te' 
                ? 'రైతుల నుండి సరుకు కొనుగోలు నమోదు — ఆటోమేటిక్ స్టాక్ పెంపు & మాస్టర్ షీట్ సింక్' 
                : 'Procure red chilli lots, automatically increment warehouse stock, and log into Master Register'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-stone-900/60 hover:bg-stone-950 text-white rounded-xl font-semibold flex items-center gap-2 text-sm border border-stone-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'తేదీ (Purchase Date)' : 'Purchase Date'}
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 font-semibold text-slate-800 text-lg focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'లాట్ రకం (Lot Allocation)' : 'Lot Allocation'}
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewLot(true)}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm border-2 transition flex items-center justify-center gap-1.5 ${
                      isCreatingNewLot
                        ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-amber-600" />
                    {lang === 'te' ? 'క్రొత్త లాట్ (New Lot)' : 'Create New Lot'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewLot(false)}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm border-2 transition flex items-center justify-center gap-1.5 ${
                      !isCreatingNewLot
                        ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-amber-600" />
                    {lang === 'te' ? 'ఉన్న లాట్ (Existing)' : 'Add to Existing'}
                  </button>
                </div>
              </div>
            </div>

            {/* Supplier / Farmer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-700" />
                  {lang === 'te' ? 'రైతు / సరఫరాదారు పేరు (Supplier / Farmer) *' : 'Supplier / Farmer Name *'}
                </label>
                <input
                  type="text"
                  list="supplierList"
                  value={supplierName}
                  onChange={handleSupplierSelect}
                  placeholder="e.g. Venkata Rao (Farmer), Warangal"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-lg font-medium text-slate-900 focus:outline-none focus:border-red-600"
                  required
                />
                <datalist id="supplierList">
                  {suppliers.map((s, i) => (
                    <option key={i} value={s.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {lang === 'te' ? 'ఫోన్ నంబర్ (Phone Number)' : 'Supplier Phone'}
                </label>
                <input
                  type="tel"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="e.g. 9440123456"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-lg font-medium text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Storage, Lot & Variety */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'మిర్చి రకం (Chilli Variety)' : 'Chilli Variety'}
                </label>
                <select
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
                >
                  <option value="Red Chilli Teja (S17)">Teja (S17) Best Quality</option>
                  <option value="Red Chilli Byadgi (5531)">Byadgi (5531 / Deluxe)</option>
                  <option value="Red Chilli Guntur Sannam (S4)">Guntur Sannam (S4)</option>
                  <option value="Red Chilli 334 / S10">334 / S10 Grade A</option>
                  <option value="Red Chilli 273 (Wrinkle)">273 Wrinkle Quality</option>
                  <option value="Red Chilli Fatki / Phatki">Fatki (Seedless/Stemless)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Warehouse className="w-4 h-4 text-slate-500" />
                  {lang === 'te' ? 'కోల్డ్ స్టోరేజ్ (Cold Storage)' : 'Cold Storage'}
                </label>
                <select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
                  required
                >
                  {storages.map((s, i) => (
                    <option key={i} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-500" />
                  {isCreatingNewLot
                    ? (lang === 'te' ? 'క్రొత్త లాట్ నంబర్' : 'New Lot Number')
                    : (lang === 'te' ? 'లాట్ ఎంచుకోండి' : 'Select Lot')}
                </label>
                {isCreatingNewLot ? (
                  <input
                    type="text"
                    value={newLotNumber}
                    onChange={(e) => setNewLotNumber(e.target.value)}
                    className="w-full bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-3 font-mono font-bold text-slate-900 text-base focus:outline-none focus:border-red-600"
                    required
                  />
                ) : (
                  <select
                    value={selectedLot}
                    onChange={(e) => setSelectedLot(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
                    required
                  >
                    <option value="">-- Select Existing Lot --</option>
                    {lots.map((l, i) => {
                      const lNum = l.lot_number || l.lot_no;
                      return (
                        <option key={i} value={lNum}>
                          {lNum} ({formatWeight(l.current_stock_kg)})
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            {/* Quantity and Purchase Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
              <div>
                <label className="block text-base font-extrabold text-slate-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-5 h-5 text-amber-700" />
                    {lang === 'te' ? 'కొనుగోలు పరిమాణం (Quantity in KG) *' : 'Quantity in KG *'}
                  </span>
                  {qtyNum > 0 && (
                    <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                      {(qtyNum / 100).toFixed(2)} Qtl
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-900 focus:outline-none focus:border-red-600 shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                  <IndianRupee className="w-5 h-5 text-amber-700" />
                  {lang === 'te' ? 'కొనుగోలు రేటు / కిలో (Purchase Rate ₹) *' : 'Purchase Rate / KG (₹) *'}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  placeholder="e.g. 185"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-900 focus:outline-none focus:border-red-600 shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Total Procurement Cost Banner */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                  {lang === 'te' ? 'మొత్తం కొనుగోలు ఖర్చు (Total Purchase Cost)' : 'Total Purchase Value (Qty × Rate)'}
                </span>
                <span className="text-3xl md:text-4xl font-black tracking-tight text-white">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="text-right text-xs text-stone-300 hidden sm:block">
                <span>{qtyNum} kg × ₹{rateNum}/kg</span>
              </div>
            </div>

            {/* Paid to Supplier & Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'రైతుకు చెల్లించిన మొత్తం (Paid)' : 'Paid to Farmer (₹)'}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-xl font-bold text-emerald-700 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'రైతుకు చెల్లించాల్సిన బాకీ (Balance)' : 'Payable Balance (₹)'}
                </label>
                <div className="w-full bg-slate-100 border-2 border-slate-300 rounded-xl px-4 py-3 text-xl font-bold text-red-700">
                  {formatCurrency(balanceAmount)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'చెల్లింపు విధానం (Payment Mode)' : 'Payment Mode'}
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
                >
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cash">Cash (నగదు)</option>
                  <option value="UPI / PhonePe">UPI / PhonePe / GPay</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Pending (Credit)">Pending to Farmer</option>
                </select>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'లారీ నంబర్ / కాటా రసీదు (Vehicle & Weighbridge Slip)' : 'Vehicle No / Weighbridge Slip / Hamali'}
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Mandi Gate Pass #982, AP-26-Y-7788"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <Save className="w-6 h-6" />
                {submitting
                  ? (lang === 'te' ? 'కొనుగోలు సేవ్ అవుతోంది...' : 'Saving Purchase...')
                  : (lang === 'te' ? '📥 కొనుగోలును నమోదు చేయి & స్టాక్ పెంచు' : '📥 Save Purchase & Increase Stock')}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Recent Purchases */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-700" />
                {lang === 'te' ? 'ఇటీవలి కొనుగోళ్లు' : 'Recent Purchases'}
              </h2>
              {onNavigateToMaster && (
                <button
                  type="button"
                  onClick={onNavigateToMaster}
                  className="text-xs font-bold text-red-700 hover:underline"
                >
                  {lang === 'te' ? 'మాస్టర్ షీట్' : 'Master Sheet'}
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 mt-2 max-h-[520px] overflow-y-auto">
              {recentPurchases.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  {lang === 'te' ? 'ఇంకా కొనుగోళ్లు లేవు' : 'No purchases recorded yet'}
                </div>
              ) : (
                recentPurchases.map((p, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-lg transition">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {p.party_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.lot_number || p.lot_no} • {formatDateIndian(p.transaction_date || p.date)}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">
                        {formatWeight(p.quantity_kg)} @ ₹{p.rate_per_kg}/kg
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-amber-900 text-sm">
                        {formatCurrency(p.total_amount)}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        +{formatWeight(p.quantity_kg)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
