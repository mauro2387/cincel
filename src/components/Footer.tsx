/**
 * Footer - Pie de página global
 * 
 * Footer con información de contacto, links rápidos y zonas de trabajo.
 */

import { Link } from 'react-router-dom';
import { brandConfig } from '../config/brand';
import { generateWhatsAppLink, getGeneralWhatsAppMessage } from '../lib/whatsapp';
import { trackWhatsAppClick } from '../lib/analytics';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('footer');
    const message = getGeneralWhatsAppMessage();
    const link = generateWhatsAppLink(message);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-cincel-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la empresa */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-cincel-gold rounded-full flex items-center justify-center bg-cincel-black">
                <span className="text-cincel-gold font-bold text-lg">C</span>
              </div>
              <div>
                <div className="font-bold text-white">{brandConfig.companyName}</div>
                <div className="text-xs text-cincel-gold">{brandConfig.tagline}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Servicios profesionales de construcción en Montevideo y Maldonado.
              Planificación, cumplimiento y presupuestos claros.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
              Navegación
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/empresa"
                  className="text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold"
                >
                  Empresa
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios"
                  className="text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  to="/obras"
                  className="text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold"
                >
                  Obras
                </Link>
              </li>
              <li>
                <Link
                  to="/zonas"
                  className="text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold"
                >
                  Zonas
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Zonas de trabajo */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
              Zonas de Trabajo
            </h3>
            <ul className="space-y-2">
              {brandConfig.workZones.map((zone) => (
                <li key={zone.id}>
                  <Link
                    to={`/zonas#${zone.id}`}
                    className="text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold"
                  >
                    {zone.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link to="/cotizar" className="btn-outline text-sm inline-block">
                Solicitar Cotización
              </Link>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold w-full text-left"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>{brandConfig.whatsappNumberDisplay}</span>
                </button>
              </li>
              <li>
                <a
                  href={`mailto:${brandConfig.email}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-cincel-gold transition-colors text-sm focus:outline-none focus:text-cincel-gold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{brandConfig.email}</span>
                </a>
              </li>
              <li className="pt-2">
                <div className="text-xs text-gray-500">
                  <p className="mb-1">{brandConfig.businessHours.weekdays}</p>
                  <p className="mb-1">{brandConfig.businessHours.saturday}</p>
                  <p>{brandConfig.businessHours.sunday}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>
              © {currentYear} {brandConfig.companyName}. Todos los derechos reservados.
            </p>
            <p className="text-xs">
              Hecho con profesionalismo y dedicación en Uruguay 🇺🇾
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
