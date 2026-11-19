import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  RotateCcw, 
  Download, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { resetAllDataToCleanSlate, exportFullBackupJson } from '../lib/api';
import { APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from '../lib/appwrite';

export default function SettingsPage() {
  const { lang, setLang } = useLang();
  const { showSuccess, showError, showWarning } = useToast();

  const [companyName, setCompanyName] = useState('SRI YN TRADING COMPANY');
  const [address, setAddress] = useState('Market Yard, Red Chilli Commercial Complex, Guntur - 522001, AP');
  const [phone, setPhone] = useState('+91 94401 23456');
  const [gstApmc, setGstApmc] = useState('APMC/GNT/2026/YN-482');
  const [resetting, setResetting] = useState(false);

  function handleSaveCompany(e) {
    e.preventDefault();
    localStorage.setItem('sri_yn_company_name', companyName);
    localStorage.setItem('sri_yn_company_address', address);
    localStorage.setItem('sri_yn_company_phone', phone);
    localStorage.setItem('sri_yn_company_gst', gstApmc);
    showSuccess('Company profile saved successfully!');
  }

  function handleExportBackup() {
    try {
      exportFullBackupJson();
      showSuccess('Backup JSON downloaded successfully!');
    } catch (err) {
      showError('Failed to export backup: ' + err.message);
    }
  }

  async function handleResetDatabase() {
    const confirm1 = window.confirm(
      lang === 'te'
        ? 'హెచ్చరిక: క్లయింట్ హ్యాండ్‌ఓవర్ కోసం మొత్తం డెమో డేటా తొలగించబడుతుంది. ఖచ్చితంగా 0 కి రీసెట్ చేయాలా?'
        : 'WARNING: This will clear all demo bills and reset the database to 0 for client handover. Continue?'
    );
    if (!confirm1) return;

    const confirm2 = window.prompt(
      'To confirm complete database reset, please type: RESET'
    );
    if (confirm2 !== 'RESET') {
      showWarning('Reset cancelled.');
      return;
    }

    setResetting(true);
    try {
      await resetAllDataToCleanSlate();
      showSuccess('Database reset to clean slate! Ready for client handover.');
      window.location.reload();
    } catch (err) {
      showError('Failed to reset: ' + err.message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white rounded-2xl p-6 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-800 rounded-xl">
            <Settings className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'te' ? 'సిస్టమ్ సెట్టింగ్‌లు (System Settings)' : 'System Settings & Handover'}
            </h1>
            <p className="text-slate-200 text-sm mt-1">
              Configure company branding, Appwrite cloud database, and clean slate client handover
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Database Status */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
          <Database className="w-5 h-5 text-red-700" />
          Appwrite Cloud Database Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 font-bold block">Appwrite Project ID:</span>
            <span className="font-mono font-bold text-slate-800">{APPWRITE_PROJECT_ID}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block">Region:</span>
            <span className="font-bold text-slate-800">Singapore (sgp)</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block">Endpoint:</span>
            <span className="font-mono text-xs text-slate-700">{APPWRITE_ENDPOINT}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block">Status:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-black">
              <CheckCircle className="w-4 h-4" /> Connected & Active
            </span>
          </div>
        </div>
      </div>

      {/* Company Branding & Bill Header */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-red-700" />
          Company Information (Printed on Bills)
        </h2>

        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Company Trade Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 font-extrabold text-slate-900 text-lg focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Market Yard / Office Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">APMC / GST / License No</label>
              <input
                type="text"
                value={gstApmc}
                onChange={(e) => setGstApmc(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-6 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black text-base shadow transition cursor-pointer"
          >
            Save Company Profile
          </button>
        </form>
      </div>

      {/* Data Backup & Client Handover Section */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-700" />
          Data Backup & Client Handover
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Export Full Database Backup</h3>
              <p className="text-xs text-slate-500 mt-1">
                Download all bills, inventory lots, storages and master transactions as an offline JSON backup.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Download JSON Backup
            </button>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-red-950 text-base flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                Reset Database for Client Handover
              </h3>
              <p className="text-xs text-red-800 mt-1">
                Wipes demonstration data and resets all stock and billing registers to zero clean slate for live business.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDatabase}
              disabled={resetting}
              className="mt-4 py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              {resetting ? 'Resetting...' : 'Reset Database to 0'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
