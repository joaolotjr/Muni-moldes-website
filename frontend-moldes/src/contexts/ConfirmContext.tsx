import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
  };

  const handleConfirm = () => {
    if (options) {
      options.onConfirm();
      setOptions(null);
    }
  };

  const handleCancel = () => {
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleCancel}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{options.title}</h3>
            <p className="text-slate-600 mb-6">{options.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {options.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm shadow-rose-600/20"
              >
                {options.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
}
