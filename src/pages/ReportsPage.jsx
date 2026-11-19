import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Calendar, 
  IndianRupee, 
  Printer, 
  RefreshCw, 
  Users, 
  Layers 
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { formatCurrency, formatWeight, formatDateIndian } from '../lib/formatters';
import { fetchMasterTransactions, fetchActiveLots, fetchParties } from '../lib/api';

export default function ReportsPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [txns, setTxns] = useState([]);
  const [lots, setLots] = useState([]);
  const [parties, setParties] = useState([]);

  // Time filter: today, this_month, all
  const [timeFilter, setTimeFilter] = useState('this_month');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [txnsData, lotsData, partiesData] = await Promise.all([
        fetchMasterTransactions({ limit: 1000 }),
        fetchActiveLots(),
        fetchParties('all'),
      ]);
      setTxns(txnsData.transactions || []);
      setLots(lotsData || []);
      setParties(partiesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  const filteredTxns = txns.filter((t) => {
    const d = (t.transaction_date || t.date || '').substring(0, 10);
    if (timeFilter === 'today') return d === todayStr;
    if (timeFilter === 'this_month') return d.startsWith(currentMonthStr);
    return true;
  });

  // Calculations
  let totalSales = 0;
  let totalPurchases = 0;
  let totalSalesKg = 0;
  let totalPurchasesKg = 0;

  filteredTxns.forEach((t) => {
    const type = (t.transaction_type || t.type || '').toUpperCase();
    const amt = Number(t.total_amount) || 0;
    const kg = Number(t.quantity_kg) || 0;

    if (type === 'SALE') {
      totalSales += amt;
      totalSalesKg += kg;
    } else if (type === 'PURCHASE') {
      totalPurchases += amt;
      totalPurchasesKg += kg;
    }
  });

  const grossProfitEstimate = totalSales > 0 ? (totalSales - (totalSalesKg * (totalPurchasesKg > 0 ? totalPurchases / totalPurchasesKg : 180))) : 0;
  const currentTotalStockKg = lots.reduce((sum, l) => sum + (Number(l.current_stock_kg) || 0), 0);
  const totalCustomerReceivables = parties
    .filter((p) => p.type === 'customer' || p.type === 'both')
    .reduce((sum, p) => sum + (Number(p.outstanding_balance) || 0), 0);
  const totalSupplierPayables = parties
    .filter((p) => p.type === 'supplier')
    .reduce((sum, p) => sum + (Number(p.outstanding_balance) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-800 rounded-xl">
            <BarChart3 className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'te' ? 'వ్యాపార నివేదికలు (Business Reports)' : 'Business Performance Reports'}
            </h1>
            <p className="text-slate-200 text-sm mt-1">
              {lang === 'te' 
                ? 'సేల్స్, కొనుగోళ్లు, స్టాక్ నిల్వ మరియు లాభనష్టాల విశ్లేషణ' 
                : 'Consolidated trade summary, P&L estimates, and party balances'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['today', 'this_month', 'all'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTimeFilter(k)}
              className={`px-3 py-2 rounded-xl font-bold text-xs border transition ${
                timeFilter === k
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {k === 'today' ? (lang === 'te' ? 'ఈ రోజు' : 'Today') : k === 'this_month' ? (lang === 'te' ? 'ఈ నెల' : 'This Month') : (lang === 'te' ? 'అన్నీ' : 'All Time')}
            </button>
          ))}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 hover:bg-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
          <span className="text-xs uppercase font-extrabold text-slate-500 block">
            {lang === 'te' ? 'మొత్తం అమ్మకాలు (Sales)' : 'Total Sales Turnover'}
          </span>
          <div className="text-2xl font-black text-red-900 mt-1">
            {formatCurrency(totalSales)}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-0.5 block">
            {formatWeight(totalSalesKg)} sold
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
          <span className="text-xs uppercase font-extrabold text-slate-500 block">
            {lang === 'te' ? 'మొత్తం కొనుగోళ్లు (Purchases)' : 'Total Purchases Cost'}
          </span>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {formatCurrency(totalPurchases)}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-0.5 block">
            {formatWeight(totalPurchasesKg)} procured
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
          <span className="text-xs uppercase font-extrabold text-slate-500 block">
            {lang === 'te' ? 'అంచనా స్థూల లాభం (Gross Margin)' : 'Est. Trading Margin'}
          </span>
          <div className={`text-2xl font-black mt-1 ${grossProfitEstimate >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(grossProfitEstimate)}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-0.5 block">
            Based on average rate
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
          <span className="text-xs uppercase font-extrabold text-slate-500 block">
            {lang === 'te' ? 'గోదాములలో మిర్చి నిల్వ' : 'Present Stock in Warehouses'}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatWeight(currentTotalStockKg)}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-0.5 block">
            {(currentTotalStockKg / 100).toFixed(2)} Quintals
          </span>
        </div>
      </div>

      {/* Party Balances Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-700" />
              {lang === 'te' ? 'ఖాతాదారుల నుండి రావాల్సిన బాకీలు' : 'Pending Customer Receivables'}
            </h3>
            <span className="text-lg font-black text-red-700">
              {formatCurrency(totalCustomerReceivables)}
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-3 max-h-[360px] overflow-y-auto">
            {parties.filter((p) => (Number(p.outstanding_balance) || 0) > 0 && p.type === 'customer').length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">All customer dues cleared!</p>
            ) : (
              parties
                .filter((p) => (Number(p.outstanding_balance) || 0) > 0 && p.type === 'customer')
                .map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.phone || p.village_city || 'Customer'}</div>
                    </div>
                    <div className="font-black text-red-800">
                      {formatCurrency(p.outstanding_balance)}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-700" />
              {lang === 'te' ? 'రైతులకు చెల్లించాల్సిన బాకీలు' : 'Payable to Farmers / Suppliers'}
            </h3>
            <span className="text-lg font-black text-amber-800">
              {formatCurrency(totalSupplierPayables)}
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-3 max-h-[360px] overflow-y-auto">
            {parties.filter((p) => (Number(p.outstanding_balance) || 0) > 0 && p.type === 'supplier').length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No pending supplier payables!</p>
            ) : (
              parties
                .filter((p) => (Number(p.outstanding_balance) || 0) > 0 && p.type === 'supplier')
                .map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.phone || p.village_city || 'Farmer / Supplier'}</div>
                    </div>
                    <div className="font-black text-amber-900">
                      {formatCurrency(p.outstanding_balance)}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
