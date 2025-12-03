import { DEFAULT_COLLECTIONS, type Product, type NewsArticle} from '../types';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Molde Papai Noel Clássico',
    slug: 'molde-papai-noel-classico',
    collection: 'Natal',
    description: 'Molde de silicone de alta resistência para reprodução de peças em resina, gesso ou sabonete. Detalhes precisos da barba e vestimenta.',
    price: 45.90,
    images: [
      'https://picsum.photos/seed/noel1/600/600',
      'https://picsum.photos/seed/noel2/600/600',
      'https://picsum.photos/seed/noel3/600/600'
    ],
    dimensions: '12cm x 8cm',
    weight: '200g',
    material: 'Silicone Elastomérico',
    active: true,
    isNew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Vaso Geométrico Minimalista',
    slug: 'vaso-geometrico-minimalista',
    collection: 'Geométricos',
    description: 'Design moderno para decoração de interiores. Ideal para cimento e gesso.',
    price: 89.90,
    images: [
      'https://picsum.photos/seed/vaso1/600/600',
      'https://picsum.photos/seed/vaso2/600/600'
    ],
    dimensions: '15cm x 15cm',
    weight: '450g',
    material: 'Silicone Platinum',
    active: true,
    isNew: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    name: 'Rosa Realista Grande',
    slug: 'rosa-realista-grande',
    collection: 'Florais',
    description: 'Pétalas com texturas naturais. O campeão de vendas para saboaria.',
    price: 32.50,
    images: [
      'https://picsum.photos/seed/rosa1/600/600',
      'https://picsum.photos/seed/rosa2/600/600',
      'https://picsum.photos/seed/rosa3/600/600',
      'https://picsum.photos/seed/rosa4/600/600'
    ],
    dimensions: '8cm x 8cm',
    weight: '120g',
    material: 'Silicone Alimentício',
    active: true,
    isNew: false,
    createdAt: new Date(Date.now() - 100000000).toISOString()
  },
  {
    id: '4',
    name: 'Coelhinho da Páscoa Vintage',
    slug: 'coelhinho-pascoa-vintage',
    collection: 'Páscoa',
    description: 'Estilo retrô, perfeito para chocolates e velas decorativas.',
    price: 38.00,
    images: [
      'https://picsum.photos/seed/coelho1/600/600'
    ],
    dimensions: '10cm x 6cm',
    weight: '180g',
    material: 'Silicone Alimentício',
    active: true,
    isNew: false,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Muni Moldes na Mega Artesanal 2024',
    slug: 'muni-moldes-mega-artesanal-2024',
    summary: 'Confira os destaques da nossa participação na maior feira de artesanato da América Latina.',
    content: 'Foi um sucesso absoluto! Recebemos mais de 5000 visitantes em nosso estande. Lançamos a nova coleção Geométricos que já está disponível no site. Agradecemos a todos os parceiros e clientes que foram nos prestigiar.',
    image: 'https://picsum.photos/seed/feira/800/400',
    publishedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Dicas para conservar seu molde de silicone',
    slug: 'dicas-conservar-molde',
    summary: 'Aumente a vida útil do seu material com esses cuidados simples.',
    content: '1. Lave sempre com água morna e sabão neutro. 2. Não utilize objetos cortantes para desmoldar. 3. Guarde em local seco e longe da luz solar direta. Seguindo estas dicas, seus moldes Muni durarão muito mais!',
    image: 'https://picsum.photos/seed/dicas/800/400',
    publishedAt: new Date(Date.now() - 604800000).toISOString()
  }
];

// Helper to manage LocalStorage
const STORAGE_KEYS = {
  PRODUCTS: 'muni_products',
  NEWS: 'muni_news',
  AUTH: 'muni_auth',
  COLLECTIONS: 'muni_collections'
};

export const db = {
  // Products
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  },
  
  getProductBySlug: (slug: string): Product | undefined => {
    const products = db.getProducts();
    return products.find(p => p.slug === slug);
  },

  saveProduct: (product: Product): void => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: (id: string): void => {
    const products = db.getProducts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // News
  getNews: (): NewsArticle[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.NEWS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
      return INITIAL_NEWS;
    }
    return JSON.parse(stored);
  },

  getNewsBySlug: (slug: string): NewsArticle | undefined => {
    const news = db.getNews();
    return news.find(n => n.slug === slug);
  },

  saveNews: (article: NewsArticle): void => {
    const news = db.getNews();
    const index = news.findIndex(n => n.id === article.id);
    if (index >= 0) {
      news[index] = article;
    } else {
      news.push(article);
    }
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
  },

  deleteNews: (id: string): void => {
    const news = db.getNews().filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
  },

  // Collections (New)
  getCollections: (): string[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(DEFAULT_COLLECTIONS));
      return DEFAULT_COLLECTIONS;
    }
    return JSON.parse(stored);
  },

  addCollection: (name: string): void => {
    const collections = db.getCollections();
    if (!collections.includes(name)) {
      collections.push(name);
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    }
  },

  updateCollection: (oldName: string, newName: string): void => {
    let collections = db.getCollections();
    const index = collections.indexOf(oldName);
    
    if (index !== -1) {
      // 1. Update collection list
      collections[index] = newName;
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));

      // 2. Update all products associated with this collection
      const products = db.getProducts();
      let productsChanged = false;
      
      products.forEach(p => {
        if (p.collection === oldName) {
          p.collection = newName;
          productsChanged = true;
        }
      });

      if (productsChanged) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      }
    }
  },

  removeCollection: (name: string): void => {
    const collections = db.getCollections().filter(c => c !== name);
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  },

  // Auth (Mock)
  isAuthenticated: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  login: (password: string): boolean => {
    if (password === 'admin123') {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      return true;
    }
    return false;
  },

  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};