import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import type { Collection, Product } from '../../types';

export function CollectionsList() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    Promise.all([api.get<Collection[]>('/collections'), api.get<Product[]>('/products')])
      .then(([collectionsRes, productsRes]) => {
        setCollections(collectionsRes.data);
        setProducts(productsRes.data);
      })
      .catch(() => showToast('Erro ao carregar as categorias.', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countByCollection = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      if (product.collection) counts.set(product.collection.id, (counts.get(product.collection.id) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const handleDelete = (collection: Collection) => {
    confirm({
      title: 'Excluir categoria',
      message: `Tem certeza que deseja excluir a categoria "${collection.name}"?`,
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/collections/${collection.id}`);
          setCollections((current) => current.filter((item) => item.id !== collection.id));
          showToast('Categoria excluída.', 'success');
        } catch (error) {
          showToast(apiErrorMessage(error, 'Erro ao excluir a categoria.'), 'error');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="heading-2">Gerenciamento de categorias</h1>
          <p className="mt-2 text-ink-soft">As categorias organizam os moldes; no site elas aparecem como linhas de produto.</p>
        </div>
        <Link to="/admin/colecoes/nova" className="btn btn-primary btn-plain w-full md:w-auto">
          <Plus className="h-5 w-5" />
          Nova categoria
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line bg-surface-low px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft sm:px-6">
          <div>Nome da categoria</div>
          <div className="text-right">Produtos</div>
          <div className="w-20 text-right">Ações</div>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-ink-soft">Carregando categorias...</p>
        ) : collections.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-serif text-lg font-semibold">Nenhuma categoria cadastrada ainda</p>
            <p className="mt-2 text-sm text-ink-soft">Crie a primeira em "Nova categoria".</p>
          </div>
        ) : (
          <ul>
            {collections.map((collection) => {
              const count = countByCollection.get(collection.id) ?? 0;
              const active = collection.is_active !== false;
              return (
                <li key={collection.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line px-4 py-4 transition-colors last:border-b-0 hover:bg-surface-mid sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-surface-mid text-primary">
                      <FolderTree className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <Link to={`/admin/colecoes/${collection.id}`} className="block truncate font-medium hover:text-primary">
                        {collection.name}
                      </Link>
                      <p className="truncate text-sm text-ink-soft">
                        /{collection.slug}
                        {!active && <span className="ml-2 font-semibold text-outline">· Inativa</span>}
                      </p>
                    </div>
                  </div>
                  <span className={`status-chip border border-line bg-surface ${count === 0 ? 'text-outline/70' : 'text-ink-soft'}`}>
                    {count} {count === 1 ? 'item' : 'itens'}
                  </span>
                  <div className="flex w-20 justify-end gap-1">
                    <Link to={`/admin/colecoes/${collection.id}`} aria-label={`Editar ${collection.name}`} title="Editar" className="icon-btn">
                      <Pencil className="h-5 w-5" />
                    </Link>
                    {/* Só categoria vazia pode ser excluída */}
                    <button
                      type="button"
                      onClick={() => handleDelete(collection)}
                      disabled={count > 0}
                      aria-label={`Excluir ${collection.name}`}
                      title={count > 0 ? 'Só é possível excluir categoria sem produtos' : 'Excluir categoria vazia'}
                      className="icon-btn hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
