// ==============================================================================
// SRI YN TRADING COMPANY — ACCESSIBLE TOAST NOTIFICATIONS
// High-visibility, large text alerts with icons and high contrast
// ==============================================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const success = (message, title = 'విజయం • Success') => addToast(message, 'success', title);
  const error = (message, title = 'గమనిక • Alert') => addToast(message, 'error', title);
  const info = (message, title = 'సమాచారం • Note') => addToast(message, 'info', title);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      {/* Toast container on top right */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-3 pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-white border-slate-300 text-slate-900';
          let icon = <Info className="w-6 h-6 text-blue-600 shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-emerald-50 border-emerald-400 text-emerald-950';
            icon = <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-red-50 border-red-400 text-red-950';
            icon = <AlertCircle className="w-7 h-7 text-red-600 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border-2 shadow-2xl flex items-start gap-3.5 transition transform animate-in slide-in-from-top duration-200 ${bg}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="font-extrabold text-base tracking-tight mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-sm font-medium leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-black/5"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
