import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Search, 
  RefreshCw, 
  Trash2 
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../lib/formatters';
import { fetchParties, createParty, deleteParty } from '../lib/api';
import Modal from '../components/common/Modal';

export default function PartiesPage() {
  const { lang } = useLang();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // ALL, customer, supplier
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partyType, setPartyType] = useState('customer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageCity, setVillageCity] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchParties('all');
      setParties(data || []);
    } catch (err) {
      console.error(err);
      showError('Failed to load party directory.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      showWarning('Please enter party name');
      return;
    }

    setSaving(true);
    try {
      const res = await createParty({
        name: name.trim(),
        type: partyType,
        phone: phone.trim(),
        village_city: villageCity.trim(),
        outstanding_balance: parseFloat(initialBalance) || 0,
      });

      if (res.success) {
        showSuccess(`Party "${name}" added to directory!`);
        setIsModalOpen(false);
        setName('');
        setPhone('');
        setVillageCity('');
        setInitialBalance('');
        loadData();
      } else {
        showError(res.error || 'Failed to save party.');
      }
    } catch (err) {
      showError(err.message || 'Error creating party');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    const confirmed = window.confirm(`Remove ${p.name} from directory?`);
    if (!confirmed) return;

    try {
      const res = await deleteParty(p.id || p.$id);
      if (res.success) {
        showSuccess(`${p.name} removed.`);
        loadData();
      } else {
        showError(res.error || 'Failed to delete party');
      }
    } catch (err) {
      showError(err.message || 'Error deleting party');
    }
  }

  const filteredParties = parties.filter((p) => {
    const pType = (p.type || '').toLowerCase();
    const matchesFilter = 
      filterType === 'ALL' || 
      pType === filterType || 
      pType === 'both';
    
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      (p.name || '').toLowerCase().includes(q) || 
      (p.phone || '').includes(q) || 
      (p.village_city || '').toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-900 via-stone-900 to-amber-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-800 rounded-xl">
            <Users className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'te' ? 'ఖాతాదారులు & వ్యాపారులు (Customers & Suppliers)' : 'Customers & Farmers Directory'}
            </h1>
            <p className="text-slate-200 text-sm mt-1">
              {lang === 'te' 
                ? 'మిర్చి కొనుగోలుదారులు, రైతులు మరియు వారి బాకీ లెక్కల చిరునామా పుస్తకం' 
                : 'Customer and supplier profiles, contact numbers, and outstanding balances'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold flex items-center gap-2 border border-stone-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-base shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            {lang === 'te' ? '+ క్రొత్త ఖాతాదారుడు' : '+ Add Party'}
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'te' ? 'పేరు, ఫోన్ నంబర్ లేదా ఊరు వెతకండి...' : 'Search by name, phone or village...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['ALL', 'customer', 'supplier'].map((typeKey) => (
            <button
              key={typeKey}
              type="button"
              onClick={() => setFilterType(typeKey)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm border-2 transition ${
                filterType === typeKey
                  ? 'bg-red-800 text-white border-red-800'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {typeKey === 'ALL'
                ? (lang === 'te' ? 'అందరూ' : 'All')
                : typeKey === 'customer'
                ? (lang === 'te' ? 'కొనుగోలుదారులు' : 'Customers')
                : (lang === 'te' ? 'రైతులు / సప్లయర్స్' : 'Suppliers')}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredParties.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No parties found</h3>
            <p className="text-slate-400 text-sm mt-1">Click "+ Add Party" to register someone.</p>
          </div>
        ) : (
          filteredParties.map((p, idx) => {
            const isCust = p.type === 'customer';
            const bal = Number(p.outstanding_balance) || 0;

            return (
              <div key={idx} className="bg-white rounded-2xl border-2 border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">{p.name}</h3>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCust ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.type}
                      </span>
                    </div>

                    <span className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    {p.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-800">{p.phone}</span>
                      </div>
                    )}
                    {p.village_city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.village_city}</span>
                      </div>
                    )}
                  </div>

                  {/* Balance Strip */}
                  <div className="mt-4 bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      {isCust
                        ? (lang === 'te' ? 'రావాల్సిన బాకీ' : 'Receivable')
                        : (lang === 'te' ? 'చెల్లించాల్సిన బాకీ' : 'Payable')}
                    </span>
                    <span className={`text-base font-black ${bal > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                      {formatCurrency(bal)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Delete Party"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Party Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={lang === 'te' ? 'క్రొత్త వ్యక్తిని నమోదు చేయండి' : 'Add Customer / Farmer'}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Party Category
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPartyType('customer')}
                className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${
                  partyType === 'customer'
                    ? 'bg-red-50 border-red-600 text-red-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Customer (కొనుగోలుదారు)
              </button>
              <button
                type="button"
                onClick={() => setPartyType('supplier')}
                className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${
                  partyType === 'supplier'
                    ? 'bg-amber-50 border-amber-600 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Supplier / Farmer (రైతు)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sri Rama Traders or K. Venkateswarlu"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit mobile"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Village / City
              </label>
              <input
                type="text"
                value={villageCity}
                onChange={(e) => setVillageCity(e.target.value)}
                placeholder="e.g. Guntur"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0"
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 px-4 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black text-lg shadow transition"
            >
              {saving ? 'Saving...' : 'Save Party'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
