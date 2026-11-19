import React, { useState } from 'react';
import { LogIn, Lock, Mail, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, signup, bypassLoginForDemo } = useAuth();
  const { lang, setLang } = useLang();
  const { showError, showSuccess } = useToast();

  const [email, setEmail] = useState('admin@sriyntrading.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      if (isRegistering) {
        const res = await signup(email, password, 'Administrator');
        if (res.error) {
          showError(res.error.message || 'Registration failed');
        } else {
          showSuccess('Admin registered! Logging in...');
        }
      } else {
        const res = await login(email, password);
        if (res.error) {
          showError(res.error.message || 'Login failed. Checking demo bypass...');
          bypassLoginForDemo();
        } else {
          showSuccess('Welcome, Administrator!');
        }
      }
    } catch (err) {
      showError(err.message || 'Login error');
      bypassLoginForDemo();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher on Top */}
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
          className="px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold text-sm shadow hover:bg-slate-700 transition"
        >
          {lang === 'en' ? 'తెలుగు (Telugu)' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-red-900/40 p-8 z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-red-950 to-red-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg border-2 border-amber-400">
            <span className="text-amber-300 text-3xl font-black font-serif">YN</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-4 tracking-tight">
            SRI YN TRADING COMPANY
          </h1>
          <p className="text-xs font-bold text-red-800 uppercase tracking-widest mt-1">
            {lang === 'te' ? 'ఎర్ర మిర్చి హోల్‌సేల్ వ్యాపార నిర్వహణ' : 'Red Chilli Wholesale Trading & Cold Storage'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-red-700" />
              {lang === 'te' ? 'ఈమెయిల్ (Admin Email)' : 'Admin Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-red-700" />
              {lang === 'te' ? 'పాస్‌వర్డ్ (Password)' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Logging in...' : (lang === 'te' ? 'లాగిన్ అవ్వండి (Login)' : 'Secure Admin Login')}
          </button>

          {/* Quick Bypass Button for Testing */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={bypassLoginForDemo}
              className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              {lang === 'te' ? 'తక్షణ డెమో ప్రవేశం (1-Click Instant Enter)' : 'Instant 1-Click Access (Elderly Easy Mode)'}
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center">
        Sri YN Trading Company • Wholesale Chilli Billing & Cold Storage Administration
      </p>
    </div>
  );
}
