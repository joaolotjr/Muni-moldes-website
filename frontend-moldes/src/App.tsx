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
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/public/Home';
import { Catalog } from './pages/public/Catalog';
import { ProductDetails } from './pages/public/ProductDetails';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';

export default function App() {
  return (
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
              <Route path="contato" element={<Contact />} />
            </Route>
            
            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />

            {/* Admin Area */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="produtos" element={<ProductsList />} />
              <Route path="produtos/novo" element={<ProductForm />} />
              <Route path="produtos/:id" element={<ProductForm />} />
              <Route path="colecoes" element={<CollectionsList />} />
              <Route path="colecoes/nova" element={<CollectionForm />} />
              <Route path="colecoes/:id" element={<CollectionForm />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  );
}