// ==============================================================================
// SRI YN TRADING COMPANY — COMBINED MASTER TRANSACTIONS SHEET
// THE CENTRAL SPREADSHEET REGISTER — ALL SALES, PURCHASES & PAYMENTS IN ONE SHEET
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { fetchMasterTransactions } from '../lib/api';
import { formatINR, formatNumber, formatDate } from '../lib/formatters';
import { generatePdfBill } from '../lib/pdfBill';
import {
  TableProperties,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  FileText,
  Calendar,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function MasterSheetPage({ onNavigate }) {
  const { lang } = useLang();
  const { success, error: toastError } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lotFilter, setLotFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetchMasterTransactions({
        search,
        type: typeFilter,
        startDate,
        endDate,
        lotNumber: lotFilter,
        page,
        limit,
      });
      setTransactions(res.transactions);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Master sheet fetch error:', err);
      toastError(err.message || 'Unable to fetch master register data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [typeFilter, startDate, endDate, lotFilter, page]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setLotFilter('');
    setPage(1);
  };

  // Summary totals for current view
  const summary = useMemo(() => {
    let totalQty = 0;
    let totalAmt = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    transactions.forEach((t) => {
      totalQty += Number(t.quantity_kg) || 0;
      totalAmt += Number(t.total_amount) || 0;
      totalPaid += Number(t.paid_amount) || 0;
      totalBalance += Number(t.balance_amount) || 0;
    });

    return { totalQty, totalAmt, totalPaid, totalBalance };
  }, [transactions]);

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (!transactions.length) {
      toastError('No records available to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Date',
      'Transaction Type',
      'Party Name (Customer/Supplier)',
      'Phone Number',
      'Item Description',
      'Cold Storage Facility',
      'Lot Number',
      'Quantity (kg)',
      'Rate per kg (INR)',
      'Total Amount (INR)',
      'Paid Amount (INR)',
      'Remaining Balance (INR)',
      'Bill Number',
      'Payment Mode',
      'Remarks',
    ];

    const rows = transactions.map((t) => [
      `"${t.transaction_id || ''}"`,
      `"${t.transaction_date || ''}"`,
      `"${t.transaction_type || ''}"`,
      `"${(t.party_name || '').replace(/"/g, '""')}"`,
      `"${t.party_phone || ''}"`,
      `"${(t.item_name || '').replace(/"/g, '""')}"`,
      `"${(t.cold_storage_name || '').replace(/"/g, '""')}"`,
      `"${t.lot_number || ''}"`,
      t.quantity_kg || 0,
      t.rate_per_kg || 0,
      t.total_amount || 0,
      t.paid_amount || 0,
      t.balance_amount || 0,
      `"${t.bill_number || ''}"`,
      `"${t.payment_method || ''}"`,
      `"${(t.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SRI_YN_TRADING_MASTER_SHEET_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success(
      lang === 'te'
        ? 'ప్రధాన రిజిస్టర్ ఎక్సెల్ ఫైల్ డౌన్‌లోడ్ చేయబడింది!'
        : 'Master register spreadsheet exported successfully!'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="no-print bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider mb-2">
            <TableProperties className="w-3.5 h-3.5 text-red-700" />
            <span>CENTRAL MASTER REGISTER • ప్రధాన రికార్డు</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {lang === 'te' ? 'కంబైన్డ్ మాస్టర్ షీట్ (అన్ని లావాదేవీలు)' : 'Combined Master Register'}
          </h2>
          <p className="text-sm font-semibold text-slate-600 mt-1 max-w-2xl">
            {lang === 'te'
              ? 'మీ వ్యాపారంలోని అన్ని అమ్మకాలు (Sales), కొనుగోళ్లు (Purchases) మరియు చెల్లింపులు (Payments) ఈ ఒకే షీట్‌లో స్వయంచాలకంగా నమోదు చేయబడతాయి.'
              : 'One central spreadsheet containing all sales bills, purchases, payments and balances. No duplicate data entry required.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>{lang === 'te' ? 'ఎక్సెల్ డౌన్‌లోడ్' : 'Export Excel/CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>{lang === 'te' ? 'ప్రింట్ తీయండి' : 'Print Sheet'}</span>
          </button>

          <button
            type="button"
            onClick={loadTransactions}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition active:scale-95 cursor-pointer"
            title="Reload data"
          >
            <RefreshCw className={`w-5 h-5 text-red-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Non-Printable) */}
      <div className="no-print bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                lang === 'te'
                  ? 'కస్టమర్ పేరు, బిల్లు నంబర్, లాట్ నంబర్ ద్వారా వెతకండి...'
                  : 'Search by Customer, Supplier, Bill Number, Lot, or Item...'
              }
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-300 text-sm sm:text-base font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-black text-sm rounded-2xl shadow-sm transition active:scale-95 cursor-pointer"
          >
            {lang === 'te' ? 'వెతకండి (Search)' : 'Search'}
          </button>
        </form>

        {/* Quick Filter Buttons & Date Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === 'te' ? 'రకం:' : 'Type:'}</span>
            </span>

            {[
              { id: 'ALL', en: 'All Records', te: 'అన్నీ (All)' },
              { id: 'SALE', en: 'Sales (Bills)', te: 'అమ్మకాలు (Sales)' },
              { id: 'PURCHASE', en: 'Purchases', te: 'కొనుగోళ్లు (Purchases)' },
              { id: 'PAYMENT_RECEIVED', en: 'Receipts', te: 'వసూళ్లు (Receipts)' },
              { id: 'PAYMENT_MADE', en: 'Payments', te: 'చెల్లింపులు' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setTypeFilter(btn.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  typeFilter === btn.id
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lang === 'te' ? btn.te : btn.en}
              </button>
            ))}
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold focus:outline-none cursor-pointer"
              />
            </div>

            {(search || typeFilter !== 'ALL' || startDate || endDate || lotFilter) && (
              <button
                type="button"
                onClick={resetFilters}
                className="p-1.5 rounded-xl text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                title="Reset all filters"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-black uppercase text-slate-500">
            {lang === 'te' ? 'మొత్తం పరిమాణం' : 'Total Quantity'}
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {formatNumber(summary.totalQty, 0)} kg
          </div>
          <span className="text-xs font-semibold text-slate-500">
            ({formatNumber(summary.totalQty / 100, 2)} Qtl)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-black uppercase text-slate-500">
            {lang === 'te' ? 'మొత్తం వ్యాపార విలువ' : 'Total Invoiced Value'}
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {formatINR(summary.totalAmt)}
          </div>
          <span className="text-xs font-semibold text-emerald-700 font-bold">
            All filtered transactions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-black uppercase text-slate-500">
            {lang === 'te' ? 'చెల్లించిన / వసూలైన మొత్తం' : 'Total Paid / Received'}
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
            {formatINR(summary.totalPaid)}
          </div>
          <span className="text-xs font-semibold text-slate-500">Settled receipts</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-black uppercase text-slate-500">
            {lang === 'te' ? 'మొత్తం మిగిలిన బాకీ' : 'Remaining Balance Due'}
          </span>
          <div className="text-xl sm:text-2xl font-black text-red-700 mt-0.5">
            {formatINR(summary.totalBalance)}
          </div>
          <span className="text-xs font-semibold text-red-600 font-bold">Outstanding</span>
        </div>
      </div>

      {/* SPREADSHEET TABLE: THE COMBINED MASTER REGISTER */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-lg overflow-hidden">
        {/* Printable Letterhead (Only visible when printing) */}
        <div className="hidden print:block p-6 text-center border-b-2 border-slate-800">
          <h1 className="text-2xl font-black text-red-950 uppercase">SRI YN TRADING COMPANY</h1>
          <p className="text-xs font-bold text-slate-600">Wholesale Red Chilli Traders & Commission Agents</p>
          <div className="mt-2 text-sm font-black text-slate-900 uppercase">
            Official Master Business Register Statement • Date: {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap border-collapse">
            {/* Table Header */}
            <thead className="bg-slate-900 text-white font-black uppercase tracking-wider text-xs sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="py-4 px-3.5 border-r border-slate-800"># TXN ID</th>
                <th className="py-4 px-3.5 border-r border-slate-800">Date</th>
                <th className="py-4 px-3.5 border-r border-slate-800">Type</th>
                <th className="py-4 px-4 border-r border-slate-800">Customer / Supplier</th>
                <th className="py-4 px-3.5 border-r border-slate-800">Phone</th>
                <th className="py-4 px-4 border-r border-slate-800">Item Description</th>
                <th className="py-4 px-3.5 border-r border-slate-800">Cold Storage</th>
                <th className="py-4 px-3.5 border-r border-slate-800">Lot Number</th>
                <th className="py-4 px-3.5 text-right border-r border-slate-800">Qty (kg)</th>
                <th className="py-4 px-3.5 text-right border-r border-slate-800">Rate (₹/kg)</th>
                <th className="py-4 px-3.5 text-right border-r border-slate-800">Total (₹)</th>
                <th className="py-4 px-3.5 text-right border-r border-slate-800">Paid (₹)</th>
                <th className="py-4 px-3.5 text-right border-r border-slate-800">Balance (₹)</th>
                <th className="py-4 px-3.5 border-r border-slate-800">Bill No</th>
                <th className="py-4 px-3.5 border-r border-slate-800">Mode</th>
                <th className="no-print py-4 px-3.5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={16} className="py-16 text-center text-slate-500 font-bold">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-red-700" />
                    <p className="text-base">Loading Master Register...</p>
                  </td>
                </tr>
              ) : !transactions.length ? (
                <tr>
                  <td colSpan={16} className="py-16 text-center text-slate-500">
                    <TableProperties className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <p className="text-base font-bold text-slate-700">No transactions found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Transactions will automatically appear here as you create Bills, Purchases, or Payments.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((t, index) => {
                  let badge = 'bg-slate-100 text-slate-800';
                  let typeLabel = t.transaction_type;

                  if (t.transaction_type === 'SALE') {
                    badge = 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-black';
                    typeLabel = 'SALE';
                  } else if (t.transaction_type === 'PURCHASE') {
                    badge = 'bg-blue-100 text-blue-950 border border-blue-300 font-black';
                    typeLabel = 'PURCHASE';
                  } else if (t.transaction_type === 'PAYMENT_RECEIVED') {
                    badge = 'bg-purple-100 text-purple-950 border border-purple-300 font-black';
                    typeLabel = 'RECEIPT';
                  } else if (t.transaction_type === 'PAYMENT_MADE') {
                    badge = 'bg-rose-100 text-rose-950 border border-rose-300 font-black';
                    typeLabel = 'PAYMENT';
                  }

                  const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

                  return (
                    <tr key={t.id} className={`${rowBg} hover:bg-amber-50/80 transition`}>
                      {/* Transaction ID */}
                      <td className="py-3.5 px-3.5 font-mono text-xs font-bold text-slate-700 border-r border-slate-200">
                        {t.transaction_id}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3.5 font-bold text-slate-900 border-r border-slate-200">
                        {formatDate(t.transaction_date)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-3.5 border-r border-slate-200">
                        <span className={`px-2 py-0.5 rounded-lg text-xs tracking-wider uppercase ${badge}`}>
                          {typeLabel}
                        </span>
                      </td>

                      {/* Party Name */}
                      <td className="py-3.5 px-4 font-black text-slate-950 border-r border-slate-200">
                        {t.party_name}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3.5 font-mono text-xs text-slate-600 border-r border-slate-200">
                        {t.party_phone || '—'}
                      </td>

                      {/* Item */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 border-r border-slate-200">
                        {t.item_name || '—'}
                      </td>

                      {/* Cold Storage */}
                      <td className="py-3.5 px-3.5 text-xs text-slate-700 border-r border-slate-200">
                        {t.cold_storage_name || '—'}
                      </td>

                      {/* Lot Number */}
                      <td className="py-3.5 px-3.5 font-mono text-xs font-bold text-amber-800 border-r border-slate-200">
                        {t.lot_number || '—'}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-3.5 text-right font-bold text-slate-900 border-r border-slate-200">
                        {t.quantity_kg > 0 ? `${formatNumber(t.quantity_kg, 0)} kg` : '—'}
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-3.5 text-right font-medium text-slate-700 border-r border-slate-200">
                        {t.rate_per_kg > 0 ? `₹ ${formatNumber(t.rate_per_kg, 2)}` : '—'}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3.5 text-right font-black text-slate-950 border-r border-slate-200">
                        {t.total_amount > 0 ? formatINR(t.total_amount) : '—'}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3.5 px-3.5 text-right font-bold text-emerald-800 border-r border-slate-200">
                        {t.paid_amount > 0 ? formatINR(t.paid_amount) : '₹0'}
                      </td>

                      {/* Balance Amount */}
                      <td className="py-3.5 px-3.5 text-right font-black border-r border-slate-200">
                        {t.balance_amount > 0 ? (
                          <span className="text-red-700">{formatINR(t.balance_amount)}</span>
                        ) : (
                          <span className="text-emerald-700 text-xs font-black">PAID</span>
                        )}
                      </td>

                      {/* Bill Number */}
                      <td className="py-3.5 px-3.5 font-mono text-xs font-bold text-slate-800 border-r border-slate-200">
                        {t.bill_number || '—'}
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-3.5 text-xs text-slate-600 font-semibold border-r border-slate-200">
                        {t.payment_method || 'CASH'}
                      </td>

                      {/* Actions */}
                      <td className="no-print py-3.5 px-3.5 text-center">
                        {t.transaction_type === 'SALE' ? (
                          <button
                            type="button"
                            onClick={() => generatePdfBill(t)}
                            className="px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer mx-auto"
                            title="Download PDF Bill"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer: Grand Totals */}
            <tfoot className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider sticky bottom-0 z-20">
              <tr>
                <td colSpan={8} className="py-4 px-4 text-amber-300">
                  GRAND TOTALS (CURRENT VIEW)
                </td>
                <td className="py-4 px-3.5 text-right text-amber-300">
                  {formatNumber(summary.totalQty, 0)} kg
                </td>
                <td className="py-4 px-3.5 text-right text-slate-400">—</td>
                <td className="py-4 px-3.5 text-right text-amber-300 text-sm">
                  {formatINR(summary.totalAmt)}
                </td>
                <td className="py-4 px-3.5 text-right text-emerald-400">
                  {formatINR(summary.totalPaid)}
                </td>
                <td className="py-4 px-3.5 text-right text-rose-400">
                  {formatINR(summary.totalBalance)}
                </td>
                <td colSpan={3} className="py-4 px-4 text-slate-400">
                  {totalCount} total entries
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <div>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1 rounded-lg bg-slate-200 text-slate-900">
              Page {page}
            </span>
            <button
              type="button"
              disabled={page * limit >= totalCount}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
