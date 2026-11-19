import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Printer, 
  Save, 
  RefreshCw, 
  User, 
  Phone, 
  Warehouse, 
  Layers, 
  Scale, 
  IndianRupee, 
  FileText, 
  CheckCircle, 
  AlertTriangle 
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
  createSaleBill, 
  fetchMasterTransactions 
} from '../lib/api';
import { generateBillPdf } from '../lib/pdfBill';

export default function BillingPage({ onNavigateToMaster }) {
  const { t, lang } = useLang();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lots, setLots] = useState([]);
  const [storages, setStorages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [recentBills, setRecentBills] = useState([]);

  // Form State
  const [billNo, setBillNo] = useState(generateBillNumber('SALE'));
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [itemName, setItemName] = useState('Red Chilli Teja (S17)');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedLot, setSelectedLot] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [ratePerKg, setRatePerKg] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [remarks, setRemarks] = useState('');

  // Selected Lot Details
  const currentLotObj = lots.find((l) => (l.lot_number || l.lot_no) === selectedLot);
  const availableStockKg = currentLotObj ? Number(currentLotObj.current_stock_kg) : 0;

  // Auto Calculations
  const qtyNum = parseFloat(quantityKg) || 0;
  const rateNum = parseFloat(ratePerKg) || 0;
  const totalAmount = Math.round(qtyNum * rateNum);
  const paidNum = parseFloat(paidAmount) || 0;
  const balanceAmount = Math.max(0, totalAmount - paidNum);

  const isExceedingStock = selectedLot && qtyNum > availableStockKg;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [lotsData, storageData, partiesData, recentTxns] = await Promise.all([
        fetchActiveLots(),
        fetchColdStorages(),
        fetchParties('customer'),
        fetchMasterTransactions({ type: 'SALE', limit: 8 }),
      ]);
      setLots(lotsData || []);
      setStorages(storageData || []);
      setCustomers(partiesData || []);
      setRecentBills(recentTxns.transactions || []);

      if (storageData && storageData.length > 0 && !selectedStorage) {
        setSelectedStorage(storageData[0].name);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load inventory lots or storages.');
    } finally {
      setLoading(false);
    }
  }

  function handleCustomerSelect(e) {
    const name = e.target.value;
    setCustomerName(name);
    const found = customers.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (found && found.phone) {
      setCustomerPhone(found.phone);
    }
  }

  function handleLotSelect(e) {
    const lotNum = e.target.value;
    setSelectedLot(lotNum);
    const found = lots.find((l) => (l.lot_number || l.lot_no) === lotNum);
    if (found) {
      if (found.cold_storage_name || found.cold_storage) {
        setSelectedStorage(found.cold_storage_name || found.cold_storage);
      }
      if (found.item_name) {
        setItemName(found.item_name);
      }
    }
  }

  function handlePaidFull() {
    setPaidAmount(String(totalAmount));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!customerName.trim()) {
      showWarning('Please enter customer name');
      return;
    }
    if (!qtyNum || qtyNum <= 0) {
      showWarning('Please enter valid quantity in kg');
      return;
    }
    if (!rateNum || rateNum <= 0) {
      showWarning('Please enter rate per kg');
      return;
    }
    if (isExceedingStock) {
      showError(`Quantity (${qtyNum} kg) exceeds available lot stock (${availableStockKg} kg)!`);
      return;
    }

    setSubmitting(true);
    try {
      const billData = {
        bill_number: billNo,
        transaction_date: billDate,
        party_name: customerName.trim(),
        party_phone: customerPhone.trim(),
        item_name: itemName,
        cold_storage_name: selectedStorage,
        lot_number: selectedLot,
        quantity_kg: qtyNum,
        rate_per_kg: rateNum,
        total_amount: totalAmount,
        paid_amount: paidNum,
        balance_amount: balanceAmount,
        payment_mode: paymentMode,
        remarks: remarks.trim(),
      };

      const result = await createSaleBill(billData);

      if (result.success) {
        showSuccess(`Bill ${billNo} generated & saved successfully!`);

        // Ask or automatically trigger PDF invoice
        try {
          generateBillPdf(billData);
        } catch (pdfErr) {
          console.warn('PDF auto-print note:', pdfErr);
        }

        // Reset Form
        setBillNo(generateBillNumber('SALE'));
        setCustomerName('');
        setCustomerPhone('');
        setQuantityKg('');
        setRatePerKg('');
        setPaidAmount('');
        setRemarks('');

        // Reload data
        loadData();
      } else {
        showError(result.error || 'Failed to save bill.');
      }
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error saving bill');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-700/80 rounded-xl">
              <Receipt className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {lang === 'te' ? 'క్రొత్త అమ్మకం బిల్లు (New Sale Bill)' : 'New Sale Bill Generation'}
              </h1>
              <p className="text-red-100 text-sm mt-1">
                {lang === 'te' 
                  ? 'రైతులు మరియు కొనుగోలుదారులకు సులభమైన బిల్లింగ్ — ఆటోమేటిక్ లెక్కలు & స్టాక్ తగ్గింపు' 
                  : 'Fast, automated red chilli billing with live stock check & instant PDF printing'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-red-950/60 hover:bg-red-950 text-white rounded-xl font-semibold flex items-center gap-2 text-sm border border-red-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bill Form (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bill Header Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'బిల్లు నంబర్ (Bill No)' : 'Bill Number'}
                </label>
                <input
                  type="text"
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  className="w-full bg-slate-100 border-2 border-slate-300 rounded-xl px-4 py-3 font-mono font-bold text-slate-800 text-lg focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'తేదీ (Date)' : 'Bill Date'}
                </label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 font-semibold text-slate-800 text-lg focus:outline-none focus:border-red-600"
                  required
                />
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-red-700" />
                  {lang === 'te' ? 'కొనుగోలుదారుని పేరు (Customer Name) *' : 'Customer Name *'}
                </label>
                <input
                  type="text"
                  list="customerList"
                  value={customerName}
                  onChange={handleCustomerSelect}
                  placeholder="e.g. Sri Rama Traders, Guntur"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-lg font-medium text-slate-900 focus:outline-none focus:border-red-600"
                  required
                />
                <datalist id="customerList">
                  {customers.map((c, i) => (
                    <option key={i} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {lang === 'te' ? 'ఫోన్ నంబర్ (Phone Number)' : 'Customer Phone'}
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9848012345"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-lg font-medium text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Chilli Variety & Storage Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'మిర్చి రకం (Item Variety)' : 'Chilli Variety'}
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
                >
                  <option value="">-- Direct Mandi / Yard --</option>
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
                  {lang === 'te' ? 'లాట్ నంబర్ (Lot No) & స్టాక్' : 'Lot No & Stock'}
                </label>
                <select
                  value={selectedLot}
                  onChange={handleLotSelect}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
                >
                  <option value="">-- Select Inventory Lot --</option>
                  {lots.map((l, i) => {
                    const lNum = l.lot_number || l.lot_no;
                    const stock = Number(l.current_stock_kg) || 0;
                    return (
                      <option key={i} value={lNum}>
                        {lNum} ({formatWeight(stock)})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Live Stock Indicator if Lot Selected */}
            {selectedLot && (
              <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-bold border-2 ${
                isExceedingStock 
                  ? 'bg-red-50 text-red-900 border-red-300' 
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}>
                <div className="flex items-center gap-2">
                  {isExceedingStock ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                  <span>
                    {lang === 'te' ? 'ఎంచుకున్న లాట్ అందుబాటు స్టాక్:' : 'Available Lot Stock:'}
                  </span>
                  <span className="text-base underline">{formatWeight(availableStockKg)}</span>
                </div>
                {isExceedingStock && (
                  <span className="text-red-700 font-extrabold">
                    ⚠️ {lang === 'te' ? 'స్టాక్ కంటే ఎక్కువ!' : 'Exceeds Stock!'}
                  </span>
                )}
              </div>
            )}

            {/* Quantity and Rate Input (Large & Clear) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-amber-50/60 p-6 rounded-2xl border-2 border-amber-200">
              <div>
                <label className="block text-base font-extrabold text-amber-950 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-5 h-5 text-amber-700" />
                    {lang === 'te' ? 'పరిమాణం కిలోలలో (Quantity in KG) *' : 'Quantity in KG *'}
                  </span>
                  {qtyNum > 0 && (
                    <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                      {(qtyNum / 100).toFixed(2)} Quintals
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-white border-2 border-amber-400 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-900 focus:outline-none focus:border-red-600 shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-extrabold text-amber-950 mb-1 flex items-center gap-1.5">
                  <IndianRupee className="w-5 h-5 text-amber-700" />
                  {lang === 'te' ? 'ధర / కిలో (Rate per KG in ₹) *' : 'Rate per KG (₹) *'}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={ratePerKg}
                  onChange={(e) => setRatePerKg(e.target.value)}
                  placeholder="e.g. 210"
                  className="w-full bg-white border-2 border-amber-400 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-900 focus:outline-none focus:border-red-600 shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Total Amount Big Banner */}
            <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-red-200 font-bold block">
                  {lang === 'te' ? 'మొత్తం బిల్లు మొత్తం (Automatic Total)' : 'Total Bill Amount (Qty × Rate)'}
                </span>
                <span className="text-3xl md:text-4xl font-black tracking-tight text-amber-300">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="text-right text-xs text-red-200 hidden sm:block">
                <span>{qtyNum} kg × ₹{rateNum}/kg</span>
              </div>
            </div>

            {/* Payment Received & Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{lang === 'te' ? 'చెల్లించిన మొత్తం (Paid)' : 'Paid Amount (₹)'}</span>
                  {totalAmount > 0 && (
                    <button
                      type="button"
                      onClick={handlePaidFull}
                      className="text-xs text-red-700 hover:underline font-bold"
                    >
                      {lang === 'te' ? 'పూర్తి చెల్లింపు' : 'Full Paid'}
                    </button>
                  )}
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
                  {lang === 'te' ? 'బాకీ మొత్తం (Remaining Balance)' : 'Remaining Balance (₹)'}
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
                  <option value="Cash">Cash (నగదు)</option>
                  <option value="UPI / PhonePe">UPI / PhonePe / GPay</option>
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit (Pending)">Credit (బాకీ)</option>
                </select>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'వాహనం నంబర్ / వివరాలు (Remarks / Vehicle No)' : 'Remarks / Vehicle No / Hamali'}
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Lorry AP-07-TJ-1234, Weighbridge slip #412"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting || isExceedingStock}
                className="flex-1 py-4 px-6 bg-red-800 hover:bg-red-900 disabled:bg-slate-400 text-white rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <Save className="w-6 h-6" />
                {submitting
                  ? (lang === 'te' ? 'భద్రపరుస్తోంది...' : 'Saving Bill...')
                  : (lang === 'te' ? '💾 బిల్లును సేవ్ చేయి & ప్రింట్ తీయి' : '💾 Save & Print Bill')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomerName('');
                  setQuantityKg('');
                  setRatePerKg('');
                  setPaidAmount('');
                  setRemarks('');
                }}
                className="py-4 px-6 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-lg transition"
              >
                {lang === 'te' ? 'రద్దు చేయి' : 'Clear Form'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Recent Bills Stream (1 Column) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-700" />
                {lang === 'te' ? 'ఇటీవలి బిల్లులు' : 'Recent Bills'}
              </h2>
              {onNavigateToMaster && (
                <button
                  type="button"
                  onClick={onNavigateToMaster}
                  className="text-xs font-bold text-red-700 hover:underline"
                >
                  {lang === 'te' ? 'మాస్టర్ షీట్ చూడండి' : 'View Master Sheet'}
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 mt-2 max-h-[520px] overflow-y-auto">
              {recentBills.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  {lang === 'te' ? 'ఇంకా బిల్లులు లేవు' : 'No bills recorded yet'}
                </div>
              ) : (
                recentBills.map((b, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-lg transition">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {b.party_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {b.bill_number || b.bill_no} • {formatDateIndian(b.transaction_date || b.date)}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">
                        {formatWeight(b.quantity_kg)} @ ₹{b.rate_per_kg}/kg
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-red-900 text-sm">
                        {formatCurrency(b.total_amount)}
                      </div>
                      <button
                        type="button"
                        onClick={() => generateBillPdf(b)}
                        className="mt-1 px-2.5 py-1 bg-slate-100 hover:bg-red-100 text-red-800 text-xs font-bold rounded flex items-center gap-1 border border-slate-200 transition ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        PDF
                      </button>
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
