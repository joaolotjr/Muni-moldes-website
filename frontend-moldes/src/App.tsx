import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductsList } from './pages/admin/ProductsList';
import { ProductForm } from './pages/admin/ProductForm';

// Placeholder for public pages (Phase 4)
const PublicLayout = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Catálogo Muni Moldes</h1>
      <p className="text-slate-500">Página pública em construção (Fase 4)...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Area */}
        <Route path="/" element={<PublicLayout />} />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Area */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<ProductsList />} />
          <Route path="produtos/novo" element={<ProductForm />} />
          <Route path="produtos/:id" element={<ProductForm />} />
          {/* Placeholder for collections */}
          <Route path="colecoes" element={
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
              CRUD de Coleções (A implementar)
            </div>
          } />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}