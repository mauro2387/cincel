/**
 * Página Servicios - Listado completo
 */

import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { services } from '../content/services';
import { trackServiceClick } from '../lib/analytics';
import { 
  HammerIcon, 
  WrenchIcon, 
  HardHatIcon, 
  BlueprintIcon, 
  RulerIcon, 
  PaintBrushIcon 
} from '../components/Icons';

const getIconComponent = (iconType: string) => {
  const icons = {
    hammer: HammerIcon,
    wrench: WrenchIcon,
    hardhat: HardHatIcon,
    blueprint: BlueprintIcon,
    ruler: RulerIcon,
    paintbrush: PaintBrushIcon,
  };
  return icons[iconType as keyof typeof icons] || HammerIcon;
};

export const Servicios: React.FC = () => {
  return (
    <>
      <SEO
        title="Servicios"
        description="Servicios profesionales de construcción: obra nueva, reformas, mantenimiento edilicio, dirección de obra, albañilería e instalaciones, terminaciones."
        canonical="/servicios"
      />

      {/* Hero */}
      <section className="bg-cincel-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Nuestros Servicios
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Soluciones integrales en construcción con supervisión profesional permanente
            </p>
          </div>
        </div>
      </section>

      {/* Listado de servicios */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = getIconComponent(service.iconType);
              
              return (
                <Link
                  key={service.slug}
                  to={`/servicios/${service.slug}`}
                  className="card p-6 group focus:outline-none focus:ring-2 focus:ring-cincel-gold"
                  onClick={() => trackServiceClick(service.slug, service.title)}
                >
                  <div className="mb-4 flex justify-center">
                    <IconComponent className="text-cincel-gold" size={64} />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-cincel-black mb-3 group-hover:text-cincel-gold transition-colors">
                    {service.title}
                  </h2>
                  
                  <p className="text-cincel-gray mb-6 leading-relaxed">
                    {service.shortDescription}
                  </p>

                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-semibold text-cincel-black">Incluye:</p>
                    <ul className="space-y-1">
                      {service.scope.slice(0, 3).map((item, index) => (
                        <li key={index} className="text-sm text-cincel-gray flex items-start gap-2">
                          <span className="text-cincel-gold mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span className="link-gold font-medium">
                    Ver detalles completos →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-cincel-gold">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿No estás seguro qué servicio necesitás?
            </h2>
            <p className="text-xl text-cincel-black mb-8">
              Contanos tu proyecto y te asesoramos sin compromiso
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cotizar"
                className="btn-secondary text-lg"
              >
                Solicitar Cotización
              </Link>
              <Link
                to="/contacto"
                className="btn-outline text-cincel-black border-cincel-black hover:bg-cincel-black hover:text-white text-lg"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
