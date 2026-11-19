import React, { useState } from 'react';
import { LogIn, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { lang, setLang } = useLang();
  const { showError, showSuccess } = useToast();

  const [email, setEmail] = useState('yashovardhanyelike5@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      showError('Please enter admin email address');
      return;
    }
    if (!password) {
      showError('Please enter admin password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showSuccess('Welcome back, Administrator!');
    } catch (err) {
      console.error('Authentication rejected:', err);
      showError(err.message || 'Incorrect password or unauthorized access.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher on Top */}
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
          className="px-4 py-2 bg-slate-900 text-white border-2 border-slate-700 rounded-xl font-bold text-sm shadow hover:bg-slate-800 transition"
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
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Authorized Admin Portal</span>
          </div>
        </div>

        {/* Secure Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-red-700" />
              {lang === 'te' ? 'అడ్మిన్ ఈమెయిల్ (Admin Email)' : 'Admin Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600 shadow-inner"
              placeholder="admin@sriyntrading.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-red-700" />
              {lang === 'te' ? 'పాస్‌వర్డ్ (Password)' : 'Admin Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl pl-4 pr-12 py-3.5 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600 shadow-inner"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-red-800 hover:bg-red-900 disabled:bg-slate-400 text-white rounded-xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition cursor-pointer mt-2"
          >
            <LogIn className="w-5 h-5" />
            {loading 
              ? (lang === 'te' ? 'లాగిన్ అవుతోంది...' : 'Verifying Credentials...') 
              : (lang === 'te' ? 'లాగిన్ అవ్వండి (Secure Login)' : 'Secure Admin Login')}
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-500 mt-6 text-center">
        🔒 Protected by Appwrite Cloud Authentication • Sri YN Trading Company
      </p>
    </div>
  );
}
