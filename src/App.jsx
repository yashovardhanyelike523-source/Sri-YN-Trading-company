import React, { useState } from 'react';
import Header from './components/common/Header';
import NavigationTabs from './components/common/NavigationTabs';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

// Pages
import DashboardPage from './pages/DashboardPage';
import MasterSheetPage from './pages/MasterSheetPage';
import BillingPage from './pages/BillingPage';
import PurchasePage from './pages/PurchasePage';
import InventoryPage from './pages/InventoryPage';
import PaymentsPage from './pages/PaymentsPage';
import ColdStoragePage from './pages/ColdStoragePage';
import PartiesPage from './pages/PartiesPage';
import BillUploadPage from './pages/BillUploadPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <p className="font-bold text-lg">Loading Sri YN Trading System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  function handleNavigate(target) {
    if (!target) return;
    if (target === 'master' || target === 'master_sheet') setActiveTab('master_sheet');
    else if (target === 'billing' || target === 'new_bill') setActiveTab('billing');
    else if (target === 'purchases' || target === 'add_purchase') setActiveTab('purchases');
    else if (target === 'stock' || target === 'inventory' || target === 'add_stock') setActiveTab('inventory');
    else if (target === 'payments' || target === 'record_payment') setActiveTab('payments');
    else if (target === 'upload' || target === 'bill_upload' || target === 'upload_bill') setActiveTab('bill_upload');
    else if (target === 'cold_storage') setActiveTab('cold_storage');
    else if (target === 'parties') setActiveTab('parties');
    else if (target === 'reports') setActiveTab('reports');
    else if (target === 'settings') setActiveTab('settings');
    else setActiveTab(target);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-12">
      {/* Top Header */}
      <Header />

      {/* Navigation Bar with Large Touch Buttons */}
      <NavigationTabs activeTab={activeTab} onSelectTab={handleNavigate} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} onQuickAction={handleNavigate} />
        )}
        {activeTab === 'master_sheet' && (
          <MasterSheetPage />
        )}
        {activeTab === 'billing' && (
          <BillingPage onNavigateToMaster={() => setActiveTab('master_sheet')} />
        )}
        {activeTab === 'purchases' && (
          <PurchasePage onNavigateToMaster={() => setActiveTab('master_sheet')} />
        )}
        {activeTab === 'inventory' && (
          <InventoryPage />
        )}
        {activeTab === 'payments' && (
          <PaymentsPage onNavigateToMaster={() => setActiveTab('master_sheet')} />
        )}
        {activeTab === 'cold_storage' && (
          <ColdStoragePage />
        )}
        {activeTab === 'parties' && (
          <PartiesPage />
        )}
        {activeTab === 'bill_upload' && (
          <BillUploadPage />
        )}
        {activeTab === 'reports' && (
          <ReportsPage />
        )}
        {activeTab === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Elderly-friendly Quick Master Sheet Pill on Mobile */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('master_sheet')}
          className="py-3 px-5 bg-red-900 text-amber-300 font-extrabold text-sm rounded-full shadow-2xl border-2 border-amber-400 flex items-center gap-2"
        >
          <span>📑 Master Sheet</span>
        </button>
      </div>
    </div>
  );
}
