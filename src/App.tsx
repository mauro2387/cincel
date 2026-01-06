import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { Empresa } from './pages/Empresa';
import { Servicios } from './pages/Servicios';
import { ServicioDetalle } from './pages/ServicioDetalle';
import { Obras } from './pages/Obras';
import { ObraDetalle } from './pages/ObraDetalle';
import { Zonas } from './pages/Zonas';
import { Contacto } from './pages/Contacto';
import { Cotizar } from './pages/Cotizar';

// Admin
import {
  AdminLayout,
  LoginPage,
  DashboardPage,
  LeadsPage,
  ObrasPage as AdminObrasPage,
  ClientesPage,
} from './admin';
import { PipelinePage } from './admin/pages/PipelinePage';
import { PresupuestosPageV2 } from './admin/pages/PresupuestosPageV2';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="empresa" element={<Empresa />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="servicios/:slug" element={<ServicioDetalle />} />
          <Route path="obras" element={<Obras />} />
          <Route path="obras/:slug" element={<ObraDetalle />} />
          <Route path="zonas" element={<Zonas />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="cotizar" element={<Cotizar />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="obras" element={<AdminObrasPage />} />
          <Route path="cotizaciones" element={<PresupuestosPageV2 />} />
        </Route>
      </Routes>

      {/* Vercel Analytics & Speed Insights */}
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;

