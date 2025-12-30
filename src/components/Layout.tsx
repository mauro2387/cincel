/**
 * Layout principal - Estructura compartida de todas las páginas
 * 
 * Incluye Header, Footer y outlet para el contenido de cada página.
 */

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};
