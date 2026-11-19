// ==============================================================================
// SRI YN TRADING COMPANY — MAIN DASHBOARD
// Large Metric Cards, Touch-Friendly Action Buttons, Recent Feed
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { fetchDashboardMetrics } from '../lib/api';
import { formatINR, formatNumber, formatDate } from '../lib/formatters';
import {
  TrendingUp,
  ShoppingCart,
  Boxes,
  AlertCircle,
  Receipt,
  Layers,
  PlusCircle,
  CreditCard,
  Camera,
  TableProperties,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage({ onNavigate, onQuickAction }) {
  const navigate = onNavigate || onQuickAction || (() => {});
  const { lang, t } = useLang();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Metrics fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cards = [
    {
      id: 'today_sales',
      title: t('todaySales'),
      value: metrics ? formatINR(metrics.todaySales) : '...',
      subText: lang === 'te' ? 'ఈ రోజు నమోదైన బిల్లుల మొత్తం' : "Total invoiced value today",
      icon: TrendingUp,
      color: 'from-emerald-600 to-emerald-800',
      badge: lang === 'te' ? 'ఈ రోజు' : 'TODAY',
      actionTab: 'billing',
    },
    {
      id: 'total_purchases',
      title: t('totalPurchases'),
      value: metrics ? formatINR(metrics.totalPurchases) : '...',
      subText: lang === 'te' ? 'మొత్తం కొనుగోలు ఖర్చు' : 'Total procurement cost',
      icon: ShoppingCart,
      color: 'from-blue-600 to-blue-800',
      badge: lang === 'te' ? 'కొనుగోళ్లు' : 'INTAKE',
      actionTab: 'purchases',
    },
    {
      id: 'available_stock',
      title: t('availableStock'),
      value: metrics ? `${formatNumber(metrics.availableStockKg, 0)} kg` : '...',
      subText: metrics
        ? `${formatNumber(metrics.availableStockKg / 100, 2)} ${lang === 'te' ? 'క్వింటాళ్లు (Qtl)' : 'Quintals'}`
        : '...',
      icon: Boxes,
      color: 'from-red-700 to-red-900',
      badge: lang === 'te' ? 'గోడౌన్ నిల్వ' : 'WAREHOUSE',
      actionTab: 'stock',
    },
    {
      id: 'pending_balance',
      title: t('pendingCustomerPayments'),
      value: metrics ? formatINR(metrics.pendingCustomerBalance) : '...',
      subText: lang === 'te' ? 'కస్టమర్ల నుండి రావలసిన మొత్తం' : 'Receivables from buyers',
      icon: AlertCircle,
      color: 'from-amber-600 to-amber-800',
      badge: lang === 'te' ? 'బాకీ' : 'DUE',
      actionTab: 'payments',
    },
    {
      id: 'total_bills',
      title: t('totalBillsCount'),
      value: metrics ? formatNumber(metrics.totalBillsCount, 0) : '...',
      subText: lang === 'te' ? 'జారీ చేసిన సేల్స్ ఇన్వాయిస్‌లు' : 'Invoices registered',
      icon: Receipt,
      color: 'from-purple-600 to-purple-800',
      badge: lang === 'te' ? 'ఇన్వాయిస్‌లు' : 'BILLS',
      actionTab: 'master',
    },
    {
      id: 'active_lots',
      title: t('activeLotsCount'),
      value: metrics ? formatNumber(metrics.activeLotsCount, 0) : '...',
      subText: lang === 'te' ? 'కోల్డ్ స్టోరేజీలలో ఉన్న లాట్లు' : 'Preserved Chilli Lots',
      icon: Layers,
      color: 'from-slate-700 to-slate-900',
      badge: lang === 'te' ? 'లాట్లు' : 'LOTS',
      actionTab: 'stock',
    },
  ];

  return (
    <div className="space-y-7 pb-10">
      {/* Top Banner with Big Action Buttons */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-900 font-extrabold text-xs uppercase tracking-wider mb-2">
              <span>SRI YN TRADING COMPANY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'te' ? 'వ్యాపార నిర్వహణ డ్యాష్‌బోర్డ్' : 'Business Management Dashboard'}
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-1">
              {lang === 'te'
                ? 'కింద ఉన్న బటన్లపై నొక్కి సులభంగా కొత్త బిల్లు లేదా కొనుగోలు నమోదు చేయండి.'
                : 'Click any large action button below to create a bill, record purchase or open the central master sheet.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm border border-slate-300 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-red-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('refresh')}</span>
          </button>
        </div>

        {/* Big Touch-Friendly Action Buttons (Designed for Elderly Operator) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Action 1: New Bill */}
          <button
            type="button"
            onClick={() => navigate('billing')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg shadow-red-950/20 transition transform active:scale-95 cursor-pointer group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <Receipt className="w-7 h-7 text-amber-300" />
            </div>
            <span className="font-black text-sm sm:text-base leading-tight">
              {lang === 'te' ? 'కొత్త బిల్లు' : 'New Sale Bill'}
            </span>
            <span className="text-[11px] font-semibold text-amber-200 mt-0.5">
              + SALE
            </span>
          </button>

          {/* Action 2: Add Purchase */}
          <button
            type="button"
            onClick={() => navigate('purchases')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white shadow-lg shadow-blue-950/20 transition transform active:scale-95 cursor-pointer group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <ShoppingCart className="w-7 h-7 text-blue-200" />
            </div>
            <span className="font-black text-sm sm:text-base leading-tight">
              {lang === 'te' ? 'కొనుగోలు' : 'Add Purchase'}
            </span>
            <span className="text-[11px] font-semibold text-blue-200 mt-0.5">
              + INTAKE
            </span>
          </button>

          {/* Action 3: Add Stock Lot */}
          <button
            type="button"
            onClick={() => navigate('stock')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white shadow-lg shadow-emerald-950/20 transition transform active:scale-95 cursor-pointer group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <Boxes className="w-7 h-7 text-emerald-200" />
            </div>
            <span className="font-black text-sm sm:text-base leading-tight">
              {lang === 'te' ? 'స్టాక్ లాట్లు' : 'Add Stock Lot'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-200 mt-0.5">
              + LOT
            </span>
          </button>

          {/* Action 4: Record Payment */}
          <button
            type="button"
            onClick={() => navigate('payments')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white shadow-lg shadow-purple-950/20 transition transform active:scale-95 cursor-pointer group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <CreditCard className="w-7 h-7 text-purple-200" />
            </div>
            <span className="font-black text-sm sm:text-base leading-tight">
              {lang === 'te' ? 'చెల్లింపులు' : 'Record Payment'}
            </span>
            <span className="text-[11px] font-semibold text-purple-200 mt-0.5">
              RECEIPT
            </span>
          </button>

          {/* Action 5: Upload Bill Photo */}
          <button
            type="button"
            onClick={() => navigate('upload')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-teal-700 to-teal-900 hover:from-teal-800 hover:to-teal-950 text-white shadow-lg shadow-teal-950/20 transition transform active:scale-95 cursor-pointer group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <Camera className="w-7 h-7 text-teal-200" />
            </div>
            <span className="font-black text-sm sm:text-base leading-tight">
              {lang === 'te' ? 'బిల్లు ఫోటో' : 'Upload Bill'}
            </span>
            <span className="text-[11px] font-semibold text-teal-200 mt-0.5">
              CAMERA
            </span>
          </button>

          {/* Action 6: Open Central Master Sheet (Highlighted) */}
          <button
            type="button"
            onClick={() => navigate('master')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 shadow-lg shadow-amber-950/20 transition transform active:scale-95 cursor-pointer group text-center ring-2 ring-amber-400"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-950/15 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
              <TableProperties className="w-7 h-7 text-slate-950" />
            </div>
            <span className="font-black text-sm sm:text-base leading-tight text-slate-950">
              {lang === 'te' ? 'ప్రధాన రిజిస్టర్' : 'Master Sheet'}
            </span>
            <span className="text-[11px] font-black text-red-950 mt-0.5 uppercase tracking-wider">
              ★ ALL DATA
            </span>
          </button>
        </div>
      </div>

      {/* 6 High-Visibility Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.actionTab)}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-xl hover:border-red-400 transition transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </h3>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  {card.value}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{card.subText}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions in Combined Register */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {lang === 'te' ? 'ఇటీవలి లావాదేవీల రికార్డులు' : 'Recent Master Register Activity'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {lang === 'te'
                ? 'అన్ని సేల్స్, పర్చేజ్‌లు మరియు పేమెంట్స్ ఇక్కడ స్వయంచాలకంగా కనిపిస్తాయి'
                : 'Every sale bill, purchase and payment automatically logs into this single sheet'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('master')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer"
          >
            <span>{lang === 'te' ? 'మొత్తం రిజిస్టర్ చూడండి' : 'Open Full Master Sheet'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
            <span>Loading records...</span>
          </div>
        ) : !metrics?.recentTransactions?.length ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm font-medium">
            {lang === 'te'
              ? 'ఇంకా ఎటువంటి లావాదేవీలు లేవు. పైనున్న "కొత్త బిల్లు" లేదా "కొనుగోలు" బటన్ నొక్కండి.'
              : 'No transactions recorded yet. Click "New Sale Bill" or "Add Purchase" above to begin.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">Bill No</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {metrics.recentTransactions.map((t) => {
                  let badge = 'bg-slate-100 text-slate-800';
                  let typeLabel = t.transaction_type;

                  if (t.transaction_type === 'SALE') {
                    badge = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
                    typeLabel = lang === 'te' ? 'అమ్మకం (SALE)' : 'SALE';
                  } else if (t.transaction_type === 'PURCHASE') {
                    badge = 'bg-blue-100 text-blue-900 border border-blue-300';
                    typeLabel = lang === 'te' ? 'కొనుగోలు (PURCHASE)' : 'PURCHASE';
                  } else if (t.transaction_type.includes('PAYMENT')) {
                    badge = 'bg-purple-100 text-purple-900 border border-purple-300';
                    typeLabel = lang === 'te' ? 'చెల్లింపు (PAYMENT)' : 'PAYMENT';
                  }

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {formatDate(t.transaction_date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badge}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {t.party_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-red-900 font-bold">
                        {t.bill_number || t.transaction_id}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                        {t.quantity_kg > 0 ? `${formatNumber(t.quantity_kg, 0)} kg` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {t.total_amount > 0 ? formatINR(t.total_amount) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-red-700">
                        {t.balance_amount > 0 ? formatINR(t.balance_amount) : <span className="text-emerald-700">PAID</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
