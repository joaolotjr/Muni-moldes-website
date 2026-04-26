import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-in slide-in-from-bottom-4 fade-in duration-300 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 pointer-events-auto ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white'
                : toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 opacity-90" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 opacity-90" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
            <p className="font-medium text-sm">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
