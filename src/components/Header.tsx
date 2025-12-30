/**
 * Header - Navegación principal
 * 
 * Header responsive con navegación completa.
 * Mobile: menú hamburguesa
 * Desktop: navegación horizontal
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { brandConfig } from '../config/brand';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/empresa', label: 'Empresa' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/obras', label: 'Obras' },
    { path: '/zonas', label: 'Zonas' },
    { path: '/contacto', label: 'Contacto' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-4" aria-label="Navegación principal">
        <div className="flex items-center justify-between">
          {/* Logo y marca */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cincel-gold rounded-md"
            onClick={closeMobileMenu}
          >
            {/* Badge circular estilo logo */}
            <div className="w-12 h-12 border-2 border-cincel-gold rounded-full flex items-center justify-center bg-white group-hover:bg-cincel-gold transition-colors">
              <span className="text-cincel-gold group-hover:text-white font-bold text-xl">C</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-cincel-black leading-tight">
                {brandConfig.companyName}
              </div>
              <div className="text-xs text-cincel-gold">{brandConfig.tagline}</div>
            </div>
          </Link>

          {/* Navegación desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors hover:text-cincel-gold focus:outline-none focus:text-cincel-gold ${
                  isActivePath(link.path) ? 'text-cincel-gold' : 'text-cincel-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cotizar"
              className="btn-primary text-sm"
            >
              Cotizar
            </Link>
          </div>

          {/* Botón menú mobile */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-cincel-black hover:text-cincel-gold focus:outline-none focus:ring-2 focus:ring-cincel-gold rounded-md"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Menú mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`py-2 px-3 rounded-md font-medium transition-colors hover:bg-cincel-lightgray focus:outline-none focus:ring-2 focus:ring-cincel-gold ${
                    isActivePath(link.path) ? 'text-cincel-gold bg-cincel-lightgray' : 'text-cincel-black'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/cotizar"
                onClick={closeMobileMenu}
                className="btn-primary text-center text-sm mt-2"
              >
                Cotizar
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
