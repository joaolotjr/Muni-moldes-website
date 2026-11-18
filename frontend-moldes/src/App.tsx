import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductsList } from './pages/admin/ProductsList';
import { ProductForm } from './pages/admin/ProductForm';
import { CollectionsList } from './pages/admin/CollectionsList';
import { CollectionForm } from './pages/admin/CollectionForm';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { SiteProvider } from './contexts/SiteContext';
import { Settings } from './pages/admin/Settings';
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/public/Home';
import { Catalog } from './pages/public/Catalog';
import { ProductDetails } from './pages/public/ProductDetails';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { News } from './pages/public/News';
import { NewsArticle } from './pages/public/NewsArticle';
import { NewsList } from './pages/admin/NewsList';
import { NewsForm } from './pages/admin/NewsForm';
import { UsersList } from './pages/admin/UsersList';
import { UserForm } from './pages/admin/UserForm';
import { Account } from './pages/admin/Account';
import { ActivityLog } from './pages/admin/ActivityLog';
import { RequirePermission } from './components/admin/RequirePermission';
import { QuoteProvider } from './contexts/QuoteContext';
import { QuoteList } from './pages/public/QuoteList';

export default function App() {
  return (
    <SiteProvider>
    <QuoteProvider>
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Area */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="catalogo" element={<Catalog />} />
              <Route path="molde/:slug" element={<ProductDetails />} />
              <Route path="sobre" element={<About />} />
              <Route path="noticias" element={<News />} />
              <Route path="noticias/:slug" element={<NewsArticle />} />
              <Route path="contato" element={<Contact />} />
              <Route path="orcamento" element={<QuoteList />} />
            </Route>
            
            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />

            {/* Admin Area */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="produtos" element={<RequirePermission permission="products"><ProductsList /></RequirePermission>} />
              <Route path="produtos/novo" element={<RequirePermission permission="products"><ProductForm /></RequirePermission>} />
              <Route path="produtos/:id" element={<RequirePermission permission="products"><ProductForm /></RequirePermission>} />
              <Route path="colecoes" element={<RequirePermission permission="collections"><CollectionsList /></RequirePermission>} />
              <Route path="colecoes/nova" element={<RequirePermission permission="collections"><CollectionForm /></RequirePermission>} />
              <Route path="colecoes/:id" element={<RequirePermission permission="collections"><CollectionForm /></RequirePermission>} />
              <Route path="noticias" element={<RequirePermission permission="news"><NewsList /></RequirePermission>} />
              <Route path="noticias/nova" element={<RequirePermission permission="news"><NewsForm /></RequirePermission>} />
              <Route path="noticias/:id" element={<RequirePermission permission="news"><NewsForm /></RequirePermission>} />
              <Route path="configuracoes" element={<RequirePermission permission="settings"><Settings /></RequirePermission>} />
              <Route path="usuarios" element={<RequirePermission permission="users"><UsersList /></RequirePermission>} />
              <Route path="usuarios/novo" element={<RequirePermission permission="users"><UserForm /></RequirePermission>} />
              <Route path="usuarios/:id" element={<RequirePermission permission="users"><UserForm /></RequirePermission>} />
              <Route path="atividades" element={<RequirePermission permission="users"><ActivityLog /></RequirePermission>} />
              <Route path="minha-conta" element={<Account />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
    </QuoteProvider>
    </SiteProvider>
  );
}