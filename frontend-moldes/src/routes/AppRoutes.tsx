import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import CatalogPage from '../pages/CatalogPage';
import ContactPage from '../pages/ContactPage';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/sobre" element={<Layout><AboutPage /></Layout>} />
        <Route path="/catalogo" element={<Layout><CatalogPage /></Layout>} />
        <Route path="/contato" element={<Layout><ContactPage /></Layout>} />
        {/* Você pode adicionar uma rota 404 aqui se quiser */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;