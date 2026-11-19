import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Save, 
  RefreshCw, 
  User, 
  IndianRupee, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDateIndian, generateBillNumber } from '../lib/formatters';
import { fetchParties, recordPayment, fetchMasterTransactions } from '../lib/api';

export default function PaymentsPage({ onNavigateToMaster }) {
  const { lang } = useLang();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [parties, setParties] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  // Form State
  const [txnType, setTxnType] = useState('RECEIPT'); // RECEIPT = Customer Paid Us, PAYMENT = We Paid Supplier
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI / PhonePe');
  const [referenceBillNo, setReferenceBillNo] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    loadData();
  }, [txnType]);

  async function loadData() {
    setLoading(true);
    try {
      const partyFilter = txnType === 'RECEIPT' ? 'customer' : 'supplier';
      const [partiesData, recentData] = await Promise.all([
        fetchParties(partyFilter),
        fetchMasterTransactions({ type: txnType, limit: 10 }),
      ]);
      setParties(partiesData || []);
      setRecentPayments(recentData.transactions || []);
    } catch (err) {
      console.error(err);
      showError('Failed to load payment parties.');
    } finally {
      setLoading(false);
    }
  }

  function handlePartySelect(e) {
    const name = e.target.value;
    setPartyName(name);
    const found = parties.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (found && found.phone) {
      setPartyPhone(found.phone);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!partyName.trim()) {
      showWarning('Please enter party name');
      return;
    }
    const amtNum = parseFloat(amount) || 0;
    if (amtNum <= 0) {
      showWarning('Please enter a valid payment amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await recordPayment({
        transaction_type: txnType,
        transaction_date: paymentDate,
        party_name: partyName.trim(),
        party_phone: partyPhone.trim(),
        amount: amtNum,
        payment_mode: paymentMode,
        reference_bill_no: referenceBillNo.trim(),
        remarks: remarks.trim(),
        bill_number: generateBillNumber(txnType === 'RECEIPT' ? 'RCT' : 'PMT'),
      });

      if (res.success) {
        showSuccess(
          txnType === 'RECEIPT'
            ? `Customer receipt of ${formatCurrency(amtNum)} recorded & balance updated!`
            : `Supplier payment of ${formatCurrency(amtNum)} recorded!`
        );

        setPartyName('');
        setPartyPhone('');
        setAmount('');
        setReferenceBillNo('');
        setRemarks('');

        loadData();
      } else {
        showError(res.error || 'Failed to record payment.');
      }
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error recording payment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-700/80 rounded-xl">
            <CreditCard className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'te' ? 'చెల్లింపుల నిర్వహణ (Payments & Receipts)' : 'Payments & Receipts Register'}
            </h1>
            <p className="text-slate-200 text-sm mt-1">
              {lang === 'te' 
                ? 'కొనుగోలుదారుల నుండి నగదు స్వీకరణ లేదా రైతులకు చెల్లింపులు — మాస్టర్ షీట్‌లో ఆటోమేటిక్ నమోదు' 
                : 'Record customer receipts or farmer payouts with live balance updates'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 md:p-8">
          {/* Big Toggle Buttons: Receipt vs Payment */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setTxnType('RECEIPT')}
              className={`p-4 rounded-2xl font-black text-lg border-2 transition flex items-center justify-center gap-2.5 cursor-pointer ${
                txnType === 'RECEIPT'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
              <span>
                {lang === 'te' ? 'నగదు స్వీకరణ (Customer Receipt)' : 'Customer Receipt (In)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTxnType('PAYMENT')}
              className={`p-4 rounded-2xl font-black text-lg border-2 transition flex items-center justify-center gap-2.5 cursor-pointer ${
                txnType === 'PAYMENT'
                  ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ArrowUpRight className="w-6 h-6 text-amber-600" />
              <span>
                {lang === 'te' ? 'చెల్లింపు (Farmer/Supplier Payment)' : 'Supplier Payment (Out)'}
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {lang === 'te' ? 'తేదీ (Payment Date)' : 'Payment Date'}
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 font-semibold text-slate-800 text-lg focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-red-700" />
                  {txnType === 'RECEIPT'
                    ? (lang === 'te' ? 'కొనుగోలుదారుని పేరు (Customer Name) *' : 'Customer Name *')
                    : (lang === 'te' ? 'రైతు / సరఫరాదారు పేరు (Supplier Name) *' : 'Farmer / Supplier Name *')}
                </label>
                <input
                  type="text"
                  list="paymentPartyList"
                  value={partyName}
                  onChange={handlePartySelect}
                  placeholder="e.g. Sri Balaji Traders"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-lg font-medium text-slate-900 focus:outline-none focus:border-red-600"
                  required
                />
                <datalist id="paymentPartyList">
                  {parties.map((p, i) => (
                    <option key={i} value={p.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Amount Big Input */}
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
              <label className="block text-base font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <IndianRupee className="w-6 h-6 text-red-700" />
                {lang === 'te' ? 'మొత్తం (Amount in ₹) *' : 'Payment Amount in ₹ *'}
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-4 text-3xl font-black text-slate-900 focus:outline-none focus:border-red-600 shadow-inner"
                required
              />
              {parseFloat(amount) > 0 && (
                <div className="text-right mt-2 text-sm font-black text-emerald-700">
                  {formatCurrency(parseFloat(amount))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'చెల్లింపు విధానం (Payment Mode)' : 'Payment Mode'}
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
                >
                  <option value="UPI / PhonePe">UPI / PhonePe / GPay</option>
                  <option value="Cash">Cash (నగదు)</option>
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {lang === 'te' ? 'బిల్లు / రసీదు రిఫరెన్స్ (Ref Bill No)' : 'Against Bill / Lot / Cheque No'}
                </label>
                <input
                  type="text"
                  value={referenceBillNo}
                  onChange={(e) => setReferenceBillNo(e.target.value)}
                  placeholder="e.g. BILL-20261114-1001"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'వివరాలు (Remarks / UTR Number)' : 'Remarks / Bank UTR / Note'}
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Bank UTR #123456789, payment for 10 bags chilli"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <Save className="w-6 h-6" />
                {submitting
                  ? 'Saving Payment...'
                  : (lang === 'te' ? '💰 చెల్లింపును నమోదు చేయి (Save Payment)' : '💰 Record Payment & Update Balance')}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Recent Payment Streams */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-700" />
                {lang === 'te' ? 'ఇటీవలి చెల్లింపులు' : 'Recent Transactions'}
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
              {recentPayments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  {lang === 'te' ? 'చెల్లింపుల రికార్డులు లేవు' : 'No payment records yet'}
                </div>
              ) : (
                recentPayments.map((p, idx) => {
                  const isReceipt = (p.transaction_type || p.type) === 'RECEIPT';
                  return (
                    <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-lg transition">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {p.party_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.payment_mode || 'Cash'} • {formatDateIndian(p.transaction_date || p.date)}
                        </div>
                        {p.remarks && (
                          <div className="text-xs text-slate-400 truncate max-w-[180px]">
                            {p.remarks}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className={`font-black text-sm ${isReceipt ? 'text-emerald-700' : 'text-amber-800'}`}>
                          {isReceipt ? '+' : '-'}{formatCurrency(p.paid_amount || p.total_amount)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {isReceipt ? 'Received' : 'Paid Out'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
