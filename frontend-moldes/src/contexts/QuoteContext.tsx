import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clampQuantity, emptyCustomer, type QuoteCustomer, type QuoteItem } from '../utils/quote';
import { productCover } from '../utils/products';
import type { Product } from '../types';

const ITEMS_KEY = 'muni_quote_items';
const CUSTOMER_KEY = 'muni_quote_customer';

interface QuoteContextType {
  items: QuoteItem[];
  customer: QuoteCustomer;
  /** Quantidade de modelos diferentes na lista. */
  count: number;
  has: (productId: string) => boolean;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Atualiza nomes e códigos e tira o que saiu do catálogo. Devolve os removidos. */
  sync: (available: Product[]) => QuoteItem[];
  setCustomer: (changes: Partial<QuoteCustomer>) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Navegação privada sem armazenamento: a lista vale só enquanto a página estiver aberta.
  }
}

/** Lista de orçamento do visitante, guardada no navegador. Não exige cadastro. */
export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>(() => {
    const stored = read<QuoteItem[]>(ITEMS_KEY, []);
    return Array.isArray(stored) ? stored.filter((item) => item && item.productId) : [];
  });
  const [customer, setCustomerState] = useState<QuoteCustomer>(() => ({
    ...emptyCustomer,
    ...read<Partial<QuoteCustomer>>(CUSTOMER_KEY, {}),
  }));

  useEffect(() => write(ITEMS_KEY, items), [items]);
  useEffect(() => write(CUSTOMER_KEY, customer), [customer]);

  // Mantém abas abertas ao mesmo tempo com a mesma lista.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ITEMS_KEY) setItems(read<QuoteItem[]>(ITEMS_KEY, []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((product: Product, quantity?: number) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      // Já está na lista: com quantidade informada, ela substitui a anterior.
      if (existing) {
        if (quantity === undefined) return current;
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: clampQuantity(quantity) } : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          code: product.code ?? null,
          image: productCover(product),
          quantity: clampQuantity(quantity ?? product.min_order ?? 1),
          minOrder: product.min_order ?? null,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity: clampQuantity(quantity) } : item)),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const sync = useCallback(
    (available: Product[]) => {
      const byId = new Map(available.map((product) => [product.id, product]));
      const removed = items.filter((item) => !byId.has(item.productId));
      setItems((current) =>
        current
          .filter((item) => byId.has(item.productId))
          .map((item) => {
            const product = byId.get(item.productId)!;
            return {
              ...item,
              slug: product.slug,
              name: product.name,
              code: product.code ?? null,
              image: productCover(product) ?? item.image,
              minOrder: product.min_order ?? null,
            };
          }),
      );
      return removed;
    },
    [items],
  );

  const setCustomer = useCallback(
    (changes: Partial<QuoteCustomer>) => setCustomerState((current) => ({ ...current, ...changes })),
    [],
  );

  const value = useMemo(
    () => ({
      items,
      customer,
      count: items.length,
      has: (productId: string) => items.some((item) => item.productId === productId),
      add,
      setQuantity,
      remove,
      clear,
      sync,
      setCustomer,
    }),
    [items, customer, add, setQuantity, remove, clear, sync, setCustomer],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) throw new Error('useQuote must be used within QuoteProvider');
  return context;
}
