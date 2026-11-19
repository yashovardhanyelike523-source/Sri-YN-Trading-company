import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useToast } from '../context/ToastContext';
import { formatDateIndian } from '../lib/formatters';
import { fetchUploadedBills, uploadBillDocument } from '../lib/api';

export default function BillUploadPage() {
  const { lang } = useLang();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bills, setBills] = useState([]);

  // Form State
  const [billNo, setBillNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchUploadedBills();
      setBills(data || []);
    } catch (err) {
      console.error(err);
      showError('Failed to load uploaded documents.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) {
      showWarning('Please select or capture a bill image');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadBillDocument({
        file: selectedFile,
        bill_number: billNo.trim() || `DOC-${Date.now()}`,
        remarks: remarks.trim(),
      });

      if (res.success) {
        showSuccess('Bill document uploaded successfully!');
        setSelectedFile(null);
        setPreviewUrl(null);
        setBillNo('');
        setRemarks('');
        loadData();
      } else {
        showError(res.error || 'Failed to upload bill.');
      }
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error during file upload');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-900 via-stone-900 to-amber-950 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-800 rounded-xl">
            <Camera className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === 'te' ? 'బిల్లులు & కాటా రసీదుల అప్‌లోడ్ (Bill Uploads)' : 'Mandi Bills & Weighbridge Slips'}
            </h1>
            <p className="text-slate-200 text-sm mt-1">
              {lang === 'te' 
                ? 'మొబైల్ కెమెరా లేదా ఫైల్ ద్వారా మార్కెట్ యార్డ్ రసీదులు మరియు లారీ కాటా రసీదుల భద్రపరిచే కేంద్రం' 
                : 'Upload or capture physical bills, mandi receipts, and weighbridge slips'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold flex items-center gap-2 border border-stone-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {lang === 'te' ? 'రిఫ్రెష్' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-red-700" />
            {lang === 'te' ? 'క్రొత్త రసీదు అప్‌లోడ్ చేయండి' : 'Upload Document'}
          </h2>

          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'బిల్లు / రసీదు నంబర్' : 'Bill or Slip Number'}
              </label>
              <input
                type="text"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                placeholder="e.g. MANDI-2026-904"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-bold text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* File Capture / Drag area */}
            <div className="border-2 border-dashed border-red-300 rounded-2xl p-6 text-center bg-red-50/30 hover:bg-red-50/50 transition relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg border border-slate-300 object-contain shadow-sm"
                  />
                  <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Ready to upload
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 text-red-700 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-red-950 block">
                      {lang === 'te' ? 'కెమెరాతో ఫోటో తీయండి లేదా ఫైల్ ఎంచుకోండి' : 'Capture photo or choose file'}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      Camera, JPG, PNG, PDF up to 20MB
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {lang === 'te' ? 'వివరాలు (Remarks)' : 'Remarks / Vehicle / Mandi Details'}
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Weighbridge gross 14,200 kg"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-4 px-6 bg-red-800 hover:bg-red-900 disabled:bg-slate-300 text-white rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              {uploading
                ? 'Uploading to Storage...'
                : (lang === 'te' ? '📤 రసీదును భద్రపరచు' : '📤 Upload Document')}
            </button>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-700" />
            {lang === 'te' ? 'భద్రపరిచిన రసీదులు' : 'Stored Bills & Slips'}
            <span className="text-xs font-bold text-slate-500 ml-2">
              ({bills.length} files)
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto">
            {bills.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-600">No documents uploaded yet</p>
              </div>
            ) : (
              bills.map((b, idx) => (
                <div key={idx} className="border-2 border-slate-200 rounded-xl p-4 hover:shadow-sm transition bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-mono font-bold text-sm text-slate-900 truncate">
                        {b.bill_number || b.bill_no || 'Document'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDateIndian(b.created_at || b.uploaded_at || new Date().toISOString())}
                      </span>
                    </div>

                    {b.remarks && (
                      <p className="text-xs text-slate-600 mt-2 font-medium">
                        {b.remarks}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-400 truncate max-w-[120px]">
                      {b.file_name}
                    </span>
                    <a
                      href={b.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Slip
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
