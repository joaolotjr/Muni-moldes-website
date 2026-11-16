import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Factory, MessagesSquare, Package } from 'lucide-react';
import { api } from '../../services/api';
import { useSite } from '../../contexts/SiteContext';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { ProductCard } from '../../components/public/ProductCard';
import { QuoteBand } from '../../components/public/QuoteBand';
import type { Collection, Product } from '../../types';

const differentials = [
  {
    icon: Factory,
    tone: 'bg-secondary-soft/50 text-secondary',
    title: 'Fabricação própria',
    text: 'Os moldes são produzidos na nossa fábrica, com acabamento conferido peça a peça.',
  },
  {
    icon: Package,
    tone: 'bg-primary-soft/25 text-primary',
    title: 'Pedidos em quantidade',
    text: 'Atendemos confeitarias, lojas e revendedores que precisam de volume e reposição.',
  },
  {
    icon: MessagesSquare,
    tone: 'bg-surface-high text-ink-soft',
    title: 'Orçamento direto',
    text: 'Você fala com a fábrica pelo WhatsApp e recebe o orçamento da sua lista de moldes.',
  },
];

const steps = [
  { title: 'Escolha os moldes', text: 'Navegue pelo catálogo e anote os modelos que interessam.' },
  { title: 'Envie sua lista', text: 'Mande os modelos e as quantidades pelo WhatsApp.' },
  { title: 'Receba o orçamento', text: 'Retornamos com valores e prazo de produção.' },
  { title: 'Produção e envio', text: 'Com o pedido confirmado, produzimos e despachamos.' },
];

// Fundos alternados dos cartões de linha, nos tons do logo.
const collectionTones = [
  'bg-primary-pale text-primary-dark',
  'bg-secondary-soft text-secondary-dark',
  'bg-surface-high text-ink',
];

export function Home() {
  const site = useSite();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, productsRes] = await Promise.all([
          api.get<Collection[]>('/collections?public=true'),
          api.get<Product[]>('/products?public=true'),
        ]);
        setCollections(collectionsRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching data for home', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const countByCollection = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      if (product.collection) {
        counts.set(product.collection.id, (counts.get(product.collection.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [products]);

  const latestProducts = useMemo(() => [...products].reverse().slice(0, 6), [products]);

  return (
    <div className="flex-1">
      {/* Abertura */}
      <section className="overflow-hidden bg-surface-low">
        <div className="container-page grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            {site.heroBadge && (
              <span className="chip bg-secondary-soft px-4 py-1.5 text-[11px] text-secondary-dark">
                {site.heroBadge}
              </span>
            )}
            <h1 className="heading-1 mt-5 sm:mt-6">
              {site.heroTitle}{' '}
              <span className="font-normal italic text-primary">{site.heroHighlight}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              {site.heroText}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link to="/catalogo" className="btn btn-primary sm:px-10 sm:py-4">
                Explorar catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={site.quoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline sm:px-10 sm:py-4"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Solicitar orçamento
              </a>
            </div>
          </div>

          {/* Selo da marca com amostras de cor, a partir do tablet */}
          <div className="relative mx-auto hidden h-80 w-80 md:block lg:h-[26rem] lg:w-[26rem]" aria-hidden="true">
            <div className="absolute inset-6 flex items-center justify-center rounded-full bg-white shadow-soft">
              <img src="/logo.png" alt="" className="h-3/4 w-3/4 object-contain" />
            </div>
            <div className="absolute right-0 top-2 h-20 w-20 rounded-full bg-linear-to-br from-primary-soft to-primary shadow-lift" />
            <div className="absolute bottom-4 left-0 h-14 w-14 rounded-full bg-linear-to-br from-[#accec5] to-secondary shadow-lift" />
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="container-page py-14 sm:py-24">
        <div className="text-center">
          <h2 className="heading-2">Por que comprar da fábrica</h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary-soft" />
        </div>
        <div className="mt-10 grid gap-4 sm:mt-16 md:grid-cols-3 md:gap-8">
          {differentials.map((item) => (
            <div key={item.title} className="card flex gap-4 p-5 md:block md:p-10">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full md:mb-6 md:h-14 md:w-14 ${item.tone}`}>
                <item.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="heading-3">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft md:mt-4 md:text-base">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como comprar */}
      <section className="bg-surface-high/40">
        <div className="container-page py-14 sm:py-24">
          <div className="text-center">
            <h2 className="heading-2">Como funciona</h2>
            <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
              Do catálogo ao pedido em quatro etapas, sempre falando direto com a fábrica.
            </p>
          </div>
          <ol className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4 sm:block sm:text-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-xl font-semibold text-white sm:mx-auto sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold sm:text-xl">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft sm:mt-3">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Linhas e últimos moldes */}
      {(loading || collections.length > 0 || latestProducts.length > 0) && (
        <section className="bg-surface-low">
          <div className="container-page py-14 sm:py-24">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="heading-2">Linhas em destaque</h2>
                <p className="mt-2 text-ink-soft">Moldes organizados por linha de produto.</p>
              </div>
              <Link
                to="/catalogo"
                className="group hidden shrink-0 items-center gap-1 border-b border-primary-soft pb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-primary sm:flex"
              >
                Ver catálogo completo
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {loading ? (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-6 lg:grid-cols-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-high sm:h-44" />
                ))}
              </div>
            ) : (
              <>
                {collections.length > 0 && (
                  <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-6 lg:grid-cols-3">
                    {collections.slice(0, 6).map((collection, index) => {
                      const count = countByCollection.get(collection.id) ?? 0;
                      return (
                        <li key={collection.id}>
                          <Link
                            to={`/catalogo?colecao=${collection.slug}`}
                            className={`group flex h-32 flex-col justify-between rounded-2xl p-4 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:h-44 sm:p-7 ${collectionTones[index % collectionTones.length]}`}
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80">
                              {count} {count === 1 ? 'molde' : 'moldes'}
                            </span>
                            <span className="flex items-end justify-between gap-2">
                              <span className="font-serif text-lg font-semibold leading-tight sm:text-2xl">
                                {collection.name}
                              </span>
                              <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {latestProducts.length > 0 && (
                  <>
                    <h3 className="heading-3 mt-12 sm:mt-16">Últimos moldes adicionados</h3>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 lg:grid-cols-3">
                      {latestProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            <Link to="/catalogo" className="btn btn-outline mt-8 w-full sm:hidden">
              Ver catálogo completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Nossa história */}
      <section className="container-page py-14 sm:py-24 lg:py-32">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-20">
          <div className="lg:w-5/12">
            <div className="mx-auto flex aspect-[4/3] max-w-md items-center justify-center rounded-2xl bg-white shadow-soft lg:aspect-square">
              <img src="/logo.png" alt="Selo Muni Moldes, fábrica de moldes" className="h-3/5 object-contain" />
            </div>
          </div>
          <div className="lg:w-7/12">
            <p className="eyebrow">Nossa história</p>
            <h2 className="heading-2 mt-4">
              Nascida na <span className="italic">confeitaria</span>
            </h2>
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink-soft sm:text-lg">
              {site.homeStoryText}
            </p>
            <Link
              to="/sobre"
              className="group mt-8 inline-flex items-center gap-1 border-b border-primary-soft pb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-primary"
            >
              Conheça a fábrica
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <QuoteBand />
    </div>
  );
}
