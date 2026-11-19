import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Warehouse, 
  Layers, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Scale 
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { formatWeight, formatCurrency, formatDateIndian } from '../lib/formatters';
import { fetchActiveLots, fetchColdStorages, createLot, deleteLot } from '../lib/api';
import Modal from '../components/common/Modal';

export default function InventoryPage() {
  const { lang } = useLang();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [lots, setLots] = useState([]);
  const [storages, setStorages] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStorage, setFilterStorage] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lotNo, setLotNo] = useState('');
  const [storageName, setStorageName] = useState('');
  const [itemName, setItemName] = useState('Red Chilli Teja (S17)');
  const [initialStockKg, setInitialStockKg] = useState('');
  const [purchaseRate, setPurchaseRate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [lotsData, storagesData] = await Promise.all([
        fetchActiveLots(),
        fetchColdStorages(),
      ]);
      setLots(lotsData || []);
      setStorages(storagesData || []);
      if (storagesData && storagesData.length > 0 && !storageName) {
        setStorageName(storagesData[0].name);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load inventory lots.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal() {
    const autoLot = `LOT-YN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    setLotNo(autoLot);
    setInitialStockKg('');
    setPurchaseRate('');
    setRemarks('');
    setIsModalOpen(true);
  }

  async function handleCreateLot(e) {
    e.preventDefault();
    if (!lotNo.trim()) {
      showWarning('Please enter Lot Number');
      return;
    }
    const stockNum = parseFloat(initialStockKg) || 0;
    if (stockNum < 0) {
      showWarning('Stock cannot be negative');
      return;
    }

    setSaving(true);
    try {
      const res = await createLot({
        lot_number: lotNo.trim(),
        lot_no: lotNo.trim(),
        cold_storage_name: storageName,
        cold_storage: storageName,
        item_name: itemName,
        current_stock_kg: stockNum,
        initial_stock_kg: stockNum,
        purchase_rate: parseFloat(purchaseRate) || 0,
        remarks: remarks.trim(),
      });

      if (res.success) {
        showSuccess(`Lot ${lotNo} created successfully!`);
        setIsModalOpen(false);
        loadData();
      } else {
        showError(res.error || 'Failed to create lot.');
      }
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error creating lot');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lot) {
    const lotIdent = lot.lot_number || lot.lot_no;
    const confirmed = window.confirm(
      lang === 'te'
        ? `మీరు ఖచ్చితంగా లాట్ "${lotIdent}" ను తొలగించాలనుకుంటున్నారా?`
        : `Are you sure you want to remove Lot "${lotIdent}" from inventory?`
    );
    if (!confirmed) return;

    try {
      const res = await deleteLot(lot.id || lot.$id);
      if (res.success) {
        showSuccess(`Lot ${lotIdent} removed.`);
        loadData();
      } else {
        showError(res.error || 'Failed to delete lot.');
      }
    } catch (err) {
      showError(err.message || 'Error removing lot');
    }
  }

  const filteredLots = lots.filter((lot) => {
    const lNum = (lot.lot_number || lot.lot_no || '').toLowerCase();
    const lStorage = (lot.cold_storage_name || lot.cold_storage || '').toLowerCase();
    const lItem = (lot.item_name || '').toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = !q || lNum.includes(q) || lStorage.includes(q) || lItem.includes(q);
    const matchesStorage = filterStorage === 'ALL' || (lot.cold_storage_name || lot.cold_storage) === filterStorage;
    return matchesSearch && matchesStorage;
  });

  const totalStockKg = filteredLots.reduce((sum, l) => sum + (Number(l.current_stock_kg) || 0), 0);
  const totalValuation = filteredLots.reduce((sum, l) => sum + ((Number(l.current_stock_kg) || 0) * (Number(l.purchase_rate) || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-800 rounded-xl">
            <Package className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'te' ? 'ఎర్ర మిర్చి స్టాక్ & లాట్లు (Chilli Inventory)' : 'Chilli Inventory & Lot Management'}
            </h1>
            <p className="text-red-100 text-sm mt-1">
              {lang === 'te' 
                ? 'కోల్డ్ స్టోరేజ్ ప్రకారం అందుబాటులో ఉన్న మిర్చి నిల్వలు మరియు లాట్ నంబర్లు' 
                : 'Track cold storage balances, individual lots in kg & quintals, and lot valuations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-3 bg-red-900/80 hover:bg-red-950 text-white rounded-xl font-bold flex items-center gap-2 border border-red-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={handleOpenModal}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-base shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            {lang === 'te' ? '+ క్రొత్త లాట్ జోడించు' : '+ Add New Lot'}
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
              {lang === 'te' ? 'మొత్తం నిల్వ (Total Stock)' : 'Total Stock (KG & Qtl)'}
            </span>
            <div className="text-2xl font-black text-red-900 mt-1">
              {formatWeight(totalStockKg)}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">
              {(totalStockKg / 100).toFixed(2)} Quintals
            </div>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
              {lang === 'te' ? 'యాక్టివ్ లాట్లు (Active Lots)' : 'Active Lots'}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {filteredLots.length} {lang === 'te' ? 'లాట్లు' : 'Lots'}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">
              Across {storages.length} cold storages
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
              {lang === 'te' ? 'స్టాక్ విలువ (Stock Valuation)' : 'Stock Valuation'}
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              {formatCurrency(totalValuation)}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">
              At purchase cost
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Warehouse className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'te' ? 'లాట్ నంబర్, మిర్చి రకం లేదా కోల్డ్ స్టోరేజ్ వెతకండి...' : 'Search lot no, variety or cold storage...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterStorage}
            onChange={(e) => setFilterStorage(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-red-600"
          >
            <option value="ALL">
              {lang === 'te' ? '-- అన్ని కోల్డ్ స్టోరేజ్‌లు --' : '-- All Cold Storages --'}
            </option>
            {storages.map((s, idx) => (
              <option key={idx} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lots Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLots.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">
              {lang === 'te' ? 'లాట్లు కనుగొనబడలేదు' : 'No lots found'}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'te' ? 'పైనున్న "+ క్రొత్త లాట్ జోడించు" బటన్‌పై నొక్కండి.' : 'Click "+ Add New Lot" above to create an inventory record.'}
            </p>
          </div>
        ) : (
          filteredLots.map((lot, idx) => {
            const stock = Number(lot.current_stock_kg) || 0;
            const initStock = Number(lot.initial_stock_kg) || stock;
            const rate = Number(lot.purchase_rate) || 0;
            const isOutOfStock = stock <= 0;

            return (
              <div 
                key={idx}
                className={`bg-white rounded-2xl border-2 transition hover:shadow-md p-5 flex flex-col justify-between ${
                  isOutOfStock ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {lot.lot_number || lot.lot_no}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1.5">
                        {lot.item_name || 'Red Chilli (Standard)'}
                      </h3>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isOutOfStock 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isOutOfStock ? (lang === 'te' ? 'స్టాక్ ముగిసింది' : 'Nil Stock') : (lang === 'te' ? 'అందుబాటులో ఉంది' : 'In Stock')}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <Warehouse className="w-4 h-4 text-slate-400" />
                    <span>{lot.cold_storage_name || lot.cold_storage || 'General Mandi'}</span>
                  </div>

                  {/* Stock Digits */}
                  <div className="mt-4 bg-amber-50/70 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-amber-800 block">
                        {lang === 'te' ? 'మిగిలిన నిల్వ' : 'Available Stock'}
                      </span>
                      <span className="text-2xl font-black text-amber-950">
                        {formatWeight(stock)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-600 block">
                        {(stock / 100).toFixed(2)} Qtl
                      </span>
                      {rate > 0 && (
                        <span className="text-xs text-slate-500">
                          ₹{rate}/kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Initial: {formatWeight(initStock)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(lot)}
                    className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Delete Lot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Lot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={lang === 'te' ? 'క్రొత్త లాట్ సృష్టించండి (Create New Lot)' : 'Create New Chilli Inventory Lot'}
      >
        <form onSubmit={handleCreateLot} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {lang === 'te' ? 'లాట్ నంబర్ (Lot No) *' : 'Lot Number *'}
            </label>
            <input
              type="text"
              value={lotNo}
              onChange={(e) => setLotNo(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 font-mono font-bold text-slate-900 text-lg focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {lang === 'te' ? 'కోల్డ్ స్టోరేజ్ (Cold Storage) *' : 'Cold Storage Warehouse *'}
            </label>
            <select
              value={storageName}
              onChange={(e) => setStorageName(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
              required
            >
              {storages.map((s, i) => (
                <option key={i} value={s.name}>
                  {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {lang === 'te' ? 'మిర్చి రకం (Chilli Variety)' : 'Chilli Variety'}
            </label>
            <select
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 focus:outline-none focus:border-red-600"
            >
              <option value="Red Chilli Teja (S17)">Teja (S17) Best Quality</option>
              <option value="Red Chilli Byadgi (5531)">Byadgi (5531 / Deluxe)</option>
              <option value="Red Chilli Guntur Sannam (S4)">Guntur Sannam (S4)</option>
              <option value="Red Chilli 334 / S10">334 / S10 Grade A</option>
              <option value="Red Chilli 273 (Wrinkle)">273 Wrinkle Quality</option>
              <option value="Red Chilli Fatki / Phatki">Fatki (Seedless/Stemless)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'ప్రారంభ స్టాక్ కిలోలలో (Initial KG)' : 'Initial Stock in KG'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={initialStockKg}
                onChange={(e) => setInitialStockKg(e.target.value)}
                placeholder="0"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-xl font-bold text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'కొనుగోలు రేటు (Purchase Rate ₹)' : 'Purchase Rate / KG (₹)'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(e.target.value)}
                placeholder="190"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-xl font-bold text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {lang === 'te' ? 'వివరాలు (Remarks)' : 'Remarks'}
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Farmer direct purchase, chamber 4"
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 px-4 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black text-lg shadow transition"
            >
              {saving ? 'Saving...' : (lang === 'te' ? 'లాట్ సేవ్ చేయి' : 'Save Lot')}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition"
            >
              {lang === 'te' ? 'రద్దు' : 'Cancel'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
