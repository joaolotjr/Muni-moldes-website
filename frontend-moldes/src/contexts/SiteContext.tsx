import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import { buildSite, mergeSettings, type Site, type SiteSettings } from '../config/site';

const CACHE_KEY = 'site_settings';

interface SiteContextType {
  site: Site;
  settings: SiteSettings;
  /** Falso só na primeira visita, enquanto as configurações ainda não chegaram. */
  ready: boolean;
  /** Aplica o que o painel acabou de salvar, sem precisar recarregar a página. */
  applySettings: (stored: unknown) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

function readCache(): unknown {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Carrega contato e textos do site (Painel > Configurações). A última resposta fica guardada
 * no navegador, então nas visitas seguintes a página abre na hora e é atualizada em seguida.
 */
export function SiteProvider({ children }: { children: ReactNode }) {
  const [cached] = useState(readCache);
  const [settings, setSettings] = useState<SiteSettings>(() => mergeSettings(cached));
  const [ready, setReady] = useState(cached !== null);

  const applySettings = useCallback((stored: unknown) => {
    setSettings(mergeSettings(stored));
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(stored));
    } catch {
      // Sem espaço ou navegação privada: segue sem guardar.
    }
  }, []);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => applySettings(res.data))
      .catch((error) => console.error('Error fetching site settings', error))
      // Se a API falhar, o site abre com os dados guardados ou com os padrões.
      .finally(() => setReady(true));
  }, [applySettings]);

  const value = useMemo(
    () => ({ site: buildSite(settings), settings, ready, applySettings }),
    [settings, ready, applySettings],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteContext() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSiteContext must be used within SiteProvider');
  return context;
}

/** Contato, textos e links de WhatsApp do site. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSite(): Site {
  return useSiteContext().site;
}
