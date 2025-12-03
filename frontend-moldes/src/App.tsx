import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/public/Home';
import { Catalog } from './pages/public/Catalog';
import { ProductDetail } from './pages/public/ProductDetail';
import { About } from './pages/public/About';
import { News } from './pages/public/News';
import { NewsDetail } from './pages/public/NewsDetail';
import { Contact } from './pages/public/Contact';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductManager } from './pages/admin/ProductManager';
import { CollectionManager } from './pages/admin/CollectionManager';
import { NewsManager } from './pages/admin/NewsManager';
import { db } from './services/db';

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const ProtectedRoute = () => {
  const isAuth = db.isAuthenticated();
  return isAuth ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/catalogo/:slug" element={<ProductDetail />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/noticias" element={<News />} />
          <Route path="/noticias/:slug" element={<NewsDetail />} />
          <Route path="/contato" element={<Contact />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/catalogo" element={<ProductManager />} />
          <Route path="/admin/colecoes" element={<CollectionManager />} />
          <Route path="/admin/noticias" element={<NewsManager />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;