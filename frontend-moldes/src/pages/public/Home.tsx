import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { defaultQuoteMessage, whatsappLink } from '../../config/site';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { ProductCard } from '../../components/public/ProductCard';
import { QuoteBand } from '../../components/public/QuoteBand';
import type { Collection, Product } from '../../types';

const differentials = [
  {
    title: 'Fabricação própria',
    text: 'Os moldes são produzidos na nossa fábrica, com acabamento conferido peça a peça.',
  },
  {
    title: 'Pedidos em quantidade',
    text: 'Atendemos confeitarias, lojas e revendedores que precisam de volume e reposição.',
  },
  {
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

export function Home() {
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

  const latestProducts = useMemo(() => [...products].reverse().slice(0, 8), [products]);

  return (
    <div className="flex-1">
      {/* Abertura */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">Fábrica de moldes · Atacado e revenda</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.04]">
              Moldes para chocolate e confeitaria, direto da fábrica.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              Catálogo completo para confeitarias, lojistas e revendedores. Escolha os modelos e
              peça o orçamento da quantidade que você precisa.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/catalogo" className="btn btn-primary">
                Ver catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink(defaultQuoteMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Solicitar orçamento
              </a>
            </div>
          </div>

          {/* Índice de linhas */}
          <div className="self-center border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="eyebrow">Linhas de produto</p>
              <p className="font-mono text-xs text-ink-soft">
                {loading ? '' : `${products.length} ${products.length === 1 ? 'molde' : 'moldes'}`}
              </p>
            </div>
            {loading ? (
              <div className="space-y-px">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-[53px] animate-pulse border-b border-line bg-white/60 last:border-b-0" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <p className="px-5 py-10 text-sm text-ink-soft">
                O catálogo está sendo atualizado. Fale com a gente para receber a lista de moldes.
              </p>
            ) : (
              <ul>
                {collections.slice(0, 6).map((collection, index) => (
                  <li key={collection.id} className="border-b border-line last:border-b-0">
                    <Link
                      to={`/catalogo?colecao=${collection.slug}`}
                      className="group flex items-center gap-4 bg-white px-5 py-3.5 transition-colors hover:bg-ink hover:text-white"
                    >
                      <span className="font-mono text-xs text-ink-soft group-hover:text-white/60">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 font-medium">{collection.name}</span>
                      <span className="font-mono text-xs text-ink-soft group-hover:text-white/60">
                        {countByCollection.get(collection.id) ?? 0}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {collections.length > 6 && (
              <Link
                to="/catalogo"
                className="block border-t border-line px-5 py-3.5 text-sm font-semibold hover:underline"
              >
                Ver todas as {collections.length} linhas
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="border-b border-line">
        <div className="container-page grid md:grid-cols-3">
          {differentials.map((item, index) => (
            <div
              key={item.title}
              className={`py-8 md:px-8 md:py-10 ${index > 0 ? 'border-t border-line md:border-l md:border-t-0' : 'md:pl-0'}`}
            >
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lançamentos */}
      {(loading || latestProducts.length > 0) && (
        <section className="border-b border-line bg-white">
          <div className="container-page py-16">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Catálogo</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Últimos moldes adicionados
                </h2>
              </div>
              <Link to="/catalogo" className="hidden items-center gap-2 text-sm font-semibold hover:underline sm:flex">
                Ver catálogo completo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse border border-line bg-paper" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {latestProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <Link to="/catalogo" className="btn btn-outline mt-8 w-full sm:hidden">
              Ver catálogo completo
            </Link>
          </div>
        </section>
      )}

      {/* Como comprar */}
      <section className="border-b border-line">
        <div className="container-page py-16">
          <p className="eyebrow">Como comprar</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Do catálogo ao pedido em quatro etapas
          </h2>
          <ol className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="bg-paper p-6">
                <span className="font-mono text-sm text-rose">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* A fábrica */}
      <section className="bg-white">
        <div className="container-page grid gap-8 py-16 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <p className="eyebrow">A fábrica</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Nascida na confeitaria
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-ink-soft">
              A Muni Moldes começou com a Mariluci, confeiteira que passou a fabricar os próprios
              moldes por não encontrar no mercado a qualidade que precisava. Hoje a fábrica produz
              para quem vive da confeitaria e conhece a diferença que um bom molde faz na produção.
            </p>
            <Link to="/sobre" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
              Conheça a fábrica
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <QuoteBand />
    </div>
  );
}
