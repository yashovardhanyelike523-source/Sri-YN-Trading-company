// ==============================================================================
// SRI YN TRADING COMPANY — ACCESSIBLE NAVIGATION TABS
// Large, high-visibility buttons for elderly business operators
// ==============================================================================

import React from 'react';
import { useLang } from '../../context/LangContext';
import {
  LayoutDashboard,
  TableProperties,
  Receipt,
  ShoppingCart,
  Boxes,
  CreditCard,
  Warehouse,
  Users,
  Camera,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function NavigationTabs({ currentTab, onSelectTab }) {
  const { lang, t } = useLang();

  const tabs = [
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelTe: 'హోమ్ పేజీ',
      icon: LayoutDashboard,
      badge: null,
      color: 'from-slate-800 to-slate-900',
    },
    {
      id: 'master',
      labelEn: 'Master Register',
      labelTe: 'ప్రధాన రిజిస్టర్ (అన్నీ ఒక్కచోటే)',
      icon: TableProperties,
      badge: 'MAIN',
      color: 'from-amber-600 to-amber-700',
    },
    {
      id: 'billing',
      labelEn: 'New Sale Bill',
      labelTe: 'కొత్త అమ్మకం బిల్లు',
      icon: Receipt,
      badge: '+ SALE',
      color: 'from-red-700 to-red-800',
    },
    {
      id: 'purchases',
      labelEn: 'Add Purchase',
      labelTe: 'కొనుగోలు నమోదు',
      icon: ShoppingCart,
      badge: '+ INTAKE',
      color: 'from-blue-700 to-blue-800',
    },
    {
      id: 'stock',
      labelEn: 'Chilli Stock',
      labelTe: 'మిర్చి స్టాక్ నిల్వ',
      icon: Boxes,
      badge: null,
      color: 'from-emerald-700 to-emerald-800',
    },
    {
      id: 'payments',
      labelEn: 'Payments & Balance',
      labelTe: 'వసూళ్లు & బాకీలు',
      icon: CreditCard,
      badge: null,
      color: 'from-purple-700 to-purple-800',
    },
    {
      id: 'storages',
      labelEn: 'Cold Storages',
      labelTe: 'కోల్డ్ స్టోరేజీలు',
      icon: Warehouse,
      badge: null,
      color: 'from-slate-700 to-slate-800',
    },
    {
      id: 'parties',
      labelEn: 'Customers & Agents',
      labelTe: 'ఖాతాదారులు',
      icon: Users,
      badge: null,
      color: 'from-indigo-700 to-indigo-800',
    },
    {
      id: 'upload',
      labelEn: 'Upload Mandi Bill',
      labelTe: 'మండి బిల్లు ఫోటో',
      icon: Camera,
      badge: 'CAM',
      color: 'from-teal-700 to-teal-800',
    },
    {
      id: 'reports',
      labelEn: 'Reports & P&L',
      labelTe: 'వ్యాపార నివేదికలు',
      icon: BarChart3,
      badge: null,
      color: 'from-rose-700 to-rose-800',
    },
    {
      id: 'settings',
      labelEn: 'System Settings',
      labelTe: 'సిస్టమ్ సెట్టింగ్స్',
      icon: Settings,
      badge: null,
      color: 'from-gray-700 to-gray-800',
    },
  ];

  return (
    <nav className="no-print bg-white border-b-2 border-slate-200 shadow-sm sticky top-[72px] z-30 overflow-x-auto py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const label = lang === 'te' ? tab.labelTe : tab.labelEn;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-red-800 to-red-950 text-amber-200 shadow-lg shadow-red-950/20 ring-2 ring-red-700 scale-[1.02]'
                  : 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
