// ==============================================================================
// SRI YN TRADING COMPANY — HEADER COMPONENT
// Large branding, language toggle, connection status, accessible sign out
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../context/ToastContext';
import { Flame, LogOut, Database, Languages, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { user, profile, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const { success } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'te' : 'en';
    setLang(next);
    success(next === 'te' ? 'తెలుగు భాష ఎంపిక చేయబడింది' : 'Switched to English');
  };

  const handleLogout = async () => {
    if (window.confirm(lang === 'te' ? 'మీరు ఖచ్చితంగా లాగ్ అవుట్ అవ్వాలనుకుంటున్నారా?' : 'Are you sure you want to sign out?')) {
      try {
        setLoggingOut(true);
        await logout();
        success(lang === 'te' ? 'విజయవంతంగా లాగ్ అవుట్ అయ్యారు' : 'Signed out successfully');
      } finally {
        setLoggingOut(false);
      }
    }
  };

  return (
    <header className="no-print bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white shadow-xl border-b-4 border-amber-500 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg ring-2 ring-amber-400/40 shrink-0">
            <Flame className="w-7 h-7 fill-amber-300 stroke-red-950" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                SRI YN TRADING COMPANY
              </h1>
              <span className="hidden md:inline-flex text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                PRO
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-amber-200/90 tracking-wide mt-0.5">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Right: Language Switcher, Database Status & User Controls */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          {/* Large Language Toggle Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer ring-2 ring-amber-300/60"
            title="Switch Language / భాష మార్చండి"
          >
            <Languages className="w-4 h-4 text-slate-950" />
            <span>{lang === 'en' ? 'తెలుగు (Telugu)' : 'English'}</span>
          </button>

          {/* Database Health Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5" />
            <span>{lang === 'te' ? 'డేటాబేస్ యాక్టివ్' : 'Cloud DB Active'}</span>
          </div>

          {/* Admin Info */}
          <div className="flex items-center gap-2 pl-2 sm:border-l border-white/20">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-red-950 font-black text-sm flex items-center justify-center shadow-md">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{profile?.full_name || 'Administrator'}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="text-[11px] text-amber-200/70 truncate max-w-[120px]">
                {user?.email}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800/80 hover:bg-red-800 text-white font-bold text-xs sm:text-sm border border-red-700 shadow-sm transition active:scale-95 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">{lang === 'te' ? 'లాగ్ అవుట్' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
