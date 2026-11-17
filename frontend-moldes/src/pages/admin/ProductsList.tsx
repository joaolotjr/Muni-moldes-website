import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Image as ImageIcon, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import type { Collection, Product } from '../../types';

function StatusChip({ active }: { active: boolean }) {
  return active ? (
    <span className="status-chip bg-secondary-soft text-secondary-dark">Ativo</span>
  ) : (
    <span className="status-chip border border-line/40 bg-line-soft text-ink-soft">Inativo</span>
  );
}

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [status, setStatus] = useState('');
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    Promise.all([api.get<Product[]>('/products'), api.get<Collection[]>('/collections')])
      .then(([productsRes, collectionsRes]) => {
        setProducts(productsRes.data);
        setCollections(collectionsRes.data);
      })
      .catch(() => showToast('Erro ao carregar os produtos.', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(
      (product) =>
        (!term || product.name.toLowerCase().includes(term)) &&
        (!collectionId || (collectionId === 'none' ? !product.collection : product.collection?.id === collectionId)) &&
        (!status || (status === 'active') === (product.is_active !== false)),
    );
  }, [products, search, collectionId, status]);

  const handleDelete = (product: Product) => {
    confirm({
      title: 'Excluir produto',
      message: `Tem certeza que deseja excluir "${product.name}" e as fotos dele? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/products/${product.id}`);
          setProducts((current) => current.filter((item) => item.id !== product.id));
          showToast('Produto excluído.', 'success');
        } catch (error) {
          showToast(apiErrorMessage(error, 'Erro ao excluir o produto.'), 'error');
        }
      },
    });
  };

  const selectClass = 'input appearance-none bg-white py-2.5 pr-10';

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="heading-2">Gerenciamento de produtos</h1>
          <p className="mt-2 text-ink-soft">Gerencie os moldes que aparecem no catálogo do site.</p>
        </div>
        <Link to="/admin/produtos/novo" className="btn btn-primary btn-plain w-full md:w-auto">
          <Plus className="h-5 w-5" />
          Novo produto
        </Link>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-line/30 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft/70" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pelo nome do molde..."
            aria-label="Buscar pelo nome do molde"
            className="input py-2.5 pl-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:ml-auto sm:flex">
          <div className="relative sm:w-48">
            <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)} aria-label="Filtrar por categoria" className={selectClass}>
              <option value="">Todas as categorias</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>{collection.name}</option>
              ))}
              <option value="none">Sem categoria</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
          </div>
          <div className="relative sm:w-36">
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status" className={selectClass}>
              <option value="">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line/20 bg-white shadow-soft">
        <div className="hidden items-center border-b border-line/50 bg-surface-low px-6 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft md:flex">
          <div className="min-w-0 flex-grow">Produto</div>
          <div className="w-44">Categoria</div>
          <div className="hidden w-44 lg:block">Medidas</div>
          <div className="w-24">Status</div>
          <div className="w-24 text-right">Ações</div>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-ink-soft">Carregando produtos...</p>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-serif text-lg font-semibold">
              {products.length === 0 ? 'Nenhum produto cadastrado ainda' : 'Nenhum produto encontrado'}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              {products.length === 0 ? 'Cadastre o primeiro em "Novo produto".' : 'Tente outra busca ou outro filtro.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line-soft/70">
            {filtered.map((product) => {
              const active = product.is_active !== false;
              const cover = product.images?.[0]?.image_url;
              const measures = [product.dimensions, product.final_weight].filter(Boolean).join(' • ');
              return (
                <li key={product.id} className={`flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-surface-mid/40 md:flex-row md:items-center md:gap-0 md:px-6 ${active ? '' : 'bg-surface-low/40'}`}>
                  <div className="flex min-w-0 flex-grow items-center gap-4 md:pr-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-line/20 bg-surface-mid shadow-sm ${active ? '' : 'opacity-70 grayscale'}`}>
                      {cover ? (
                        <img src={`${API_URL}${cover}`} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-outline/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link to={`/admin/produtos/${product.id}`} className={`block truncate text-[15px] font-semibold hover:text-primary ${active ? '' : 'text-ink-soft'}`}>
                        {product.name}
                      </Link>
                      <p className="truncate text-sm text-ink-soft">/{product.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:contents">
                    <div className="min-w-0 truncate text-sm text-ink-soft md:w-44 md:shrink-0 md:pr-4 md:text-base md:text-ink">
                      {product.collection?.name ?? 'Sem categoria'}
                    </div>
                    <div className="hidden w-44 shrink-0 truncate pr-4 text-sm text-ink-soft lg:block">{measures || '–'}</div>
                    <div className="shrink-0 md:w-24">
                      <StatusChip active={active} />
                    </div>
                    <div className="ml-auto flex shrink-0 justify-end gap-1 md:ml-0 md:w-24">
                      <Link to={`/admin/produtos/${product.id}`} aria-label={`Editar ${product.name}`} title="Editar" className="icon-btn">
                        <Pencil className="h-5 w-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        aria-label={`Excluir ${product.name}`}
                        title="Excluir"
                        className="icon-btn hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && products.length > 0 && (
          <div className="border-t border-line/50 px-6 py-4 text-sm text-ink-soft">
            Mostrando {filtered.length} de {products.length} {products.length === 1 ? 'produto' : 'produtos'}
          </div>
        )}
      </div>
    </div>
  );
}
