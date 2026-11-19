import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Plus, 
  MapPin, 
  Phone, 
  User, 
  Layers, 
  Scale, 
  RefreshCw, 
  Trash2 
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { formatWeight } from '../lib/formatters';
import { fetchColdStorages, fetchActiveLots, createColdStorage, deleteColdStorage } from '../lib/api';
import Modal from '../components/common/Modal';

export default function ColdStoragePage() {
  const { lang } = useLang();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [storages, setStorages] = useState([]);
  const [lots, setLots] = useState([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [capacityKg, setCapacityKg] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [storageData, lotsData] = await Promise.all([
        fetchColdStorages(),
        fetchActiveLots(),
      ]);
      setStorages(storageData || []);
      setLots(lotsData || []);
    } catch (err) {
      console.error(err);
      showError('Failed to load cold storage facilities.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      showWarning('Please enter cold storage name');
      return;
    }
    if (!location.trim()) {
      showWarning('Please enter storage location');
      return;
    }

    setSaving(true);
    try {
      const res = await createColdStorage({
        name: name.trim(),
        location: location.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        capacity_kg: parseFloat(capacityKg) || 0,
        remarks: remarks.trim(),
      });

      if (res.success) {
        showSuccess(`Cold Storage "${name}" registered!`);
        setIsModalOpen(false);
        setName('');
        setLocation('');
        setContactPerson('');
        setPhone('');
        setCapacityKg('');
        setRemarks('');
        loadData();
      } else {
        showError(res.error || 'Failed to add storage.');
      }
    } catch (err) {
      showError(err.message || 'Error creating cold storage');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(storage) {
    const confirmed = window.confirm(
      lang === 'te'
        ? `మీరు "${storage.name}" కోల్డ్ స్టోరేజ్‌ను తొలగించాలనుకుంటున్నారా?`
        : `Are you sure you want to delete "${storage.name}"?`
    );
    if (!confirmed) return;

    try {
      const res = await deleteColdStorage(storage.id || storage.$id);
      if (res.success) {
        showSuccess(`Cold storage ${storage.name} removed.`);
        loadData();
      } else {
        showError(res.error || 'Failed to delete storage');
      }
    } catch (err) {
      showError(err.message || 'Error removing storage');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-800 rounded-xl">
            <Warehouse className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'te' ? 'కోల్డ్ స్టోరేజ్ గోదాములు (Cold Storages)' : 'Cold Storage Warehouses'}
            </h1>
            <p className="text-slate-200 text-sm mt-1">
              {lang === 'te' 
                ? 'మిర్చి నిల్వ కేంద్రాలు, స్థానాలు మరియు అందుబాటులో ఉన్న లాట్ల పర్యవేక్షణ' 
                : 'Manage cold storage facilities, capacities and assigned chilli lots'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-base shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            {lang === 'te' ? '+ క్రొత్త స్టోరేజ్ జోడించు' : '+ Add Cold Storage'}
          </button>
        </div>
      </div>

      {/* Grid of Cold Storages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storages.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
            <Warehouse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Cold Storages registered</h3>
            <p className="text-slate-400 text-sm mt-1">Click "+ Add Cold Storage" above.</p>
          </div>
        ) : (
          storages.map((s, idx) => {
            // Find lots stored here
            const storageLots = lots.filter(
              (l) => (l.cold_storage_name || l.cold_storage) === s.name
            );
            const totalStock = storageLots.reduce((sum, l) => sum + (Number(l.current_stock_kg) || 0), 0);

            return (
              <div key={idx} className="bg-white rounded-2xl border-2 border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{s.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span>{s.location}</span>
                      </div>
                    </div>
                    <span className="p-2 bg-red-50 text-red-700 rounded-xl">
                      <Warehouse className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="mt-5 bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-500 block">
                        {lang === 'te' ? 'ఇక్కడి నిల్వ' : 'Present Stock'}
                      </span>
                      <span className="text-2xl font-black text-red-950">
                        {formatWeight(totalStock)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-600">
                        {storageLots.length} {lang === 'te' ? 'లాట్లు' : 'Lots'}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {(totalStock / 100).toFixed(2)} Qtl
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    {s.contact_person && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Manager: <b>{s.contact_person}</b></span>
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Phone: <b>{s.phone}</b></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Capacity: {s.capacity_kg ? formatWeight(s.capacity_kg) : 'Standard'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Delete Storage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Cold Storage Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={lang === 'te' ? 'క్రొత్త కోల్డ్ స్టోరేజ్ నమోదు' : 'Register Cold Storage Facility'}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {lang === 'te' ? 'స్టోరేజ్ పేరు (Storage Name) *' : 'Storage Name *'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sri Venkateswara Cold Storage"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {lang === 'te' ? 'స్థానం / ఊరు (Location / Village) *' : 'Location / Village / Highway *'}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Guntur - Miryalaguda Highway, AP"
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'మేనేజర్ పేరు' : 'Contact Person'}
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Manager name"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'ఫోన్ నంబర్' : 'Phone'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {lang === 'te' ? 'నిల్వ సామర్థ్యం కిలోలలో (Capacity KG)' : 'Total Storage Capacity in KG'}
            </label>
            <input
              type="number"
              value={capacityKg}
              onChange={(e) => setCapacityKg(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 px-4 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black text-lg shadow transition"
            >
              {saving ? 'Saving...' : (lang === 'te' ? 'స్టోరేజ్ సేవ్ చేయి' : 'Save Cold Storage')}
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
