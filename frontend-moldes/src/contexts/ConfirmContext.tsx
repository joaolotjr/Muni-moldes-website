import { createContext, useContext, useState, type ReactNode } from 'react';

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
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={handleCancel}
          ></div>
          <div role="alertdialog" aria-modal="true" className="relative w-full max-w-md rounded-xl bg-white p-6 font-sans text-ink shadow-xl">
            <h3 className="mb-2 font-serif text-xl font-semibold">{options.title}</h3>
            <p className="mb-6 text-ink-soft">{options.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="btn btn-plain min-h-11 px-4 text-ink-soft hover:bg-surface-low hover:text-ink"
              >
                {options.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-plain min-h-11 bg-[#ba1a1a] px-5 text-white hover:bg-[#93000a]"
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

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
}
