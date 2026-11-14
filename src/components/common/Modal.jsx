// ==============================================================================
// SRI YN TRADING COMPANY — ACCESSIBLE MODAL DIALOG
// Large close button, dark backdrop blur, high contrast
// ==============================================================================

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-red-950 to-red-900 text-white flex items-center justify-between border-b-2 border-amber-500 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm font-semibold text-amber-200/90 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 text-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}
