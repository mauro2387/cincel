/**
 * Página Servicio Detalle - Página dinámica por slug
 */

import { Link, useParams, Navigate } from 'react-router-dom';
import { SEO, getServiceSchema } from '../components/SEO';
import { getServiceBySlug } from '../content/services';
import { generateWhatsAppLink, getServiceWhatsAppMessage } from '../lib/whatsapp';
import { trackWhatsAppClick } from '../lib/analytics';
import { HammerIcon, WrenchIcon, HardHatIcon, BlueprintIcon, RulerIcon, PaintBrushIcon } from '../components/Icons';

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

export const ServicioDetalle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : undefined;

  // Si no existe el servicio, redirigir a servicios
  if (!service) {
    return <Navigate to="/servicios" replace />;
  }

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('service_detail', service.title);
    const message = getServiceWhatsAppMessage(service.title);
    const link = generateWhatsAppLink(message);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SEO
        title={service.title}
        description={service.fullDescription}
        canonical={`/servicios/${service.slug}`}
        schema={getServiceSchema(service.title, service.fullDescription)}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-cincel-black to-cincel-darkgray text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/servicios"
              className="inline-flex items-center gap-2 text-cincel-gold hover:text-gold-400 mb-6 focus:outline-none focus:underline"
            >
              ← Volver a servicios
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex justify-center">
                {(() => {
                  const IconComponent = getIconComponent(service.iconType);
                  return <IconComponent className="text-cincel-gold" size={72} />;
                })()}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {service.title}
                </h1>
                <p className="text-xl text-gray-300">
                  {service.shortDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Columna principal */}
              <div className="md:col-span-2 space-y-8">
                {/* Descripción completa */}
                <div>
                  <h2 className="text-2xl font-bold text-cincel-black mb-4">
                    Descripción del Servicio
                  </h2>
                  <p className="text-cincel-gray text-lg leading-relaxed">
                    {service.fullDescription}
                  </p>
                </div>

                {/* Alcance */}
                <div>
                  <h2 className="text-2xl font-bold text-cincel-black mb-4">
                    ¿Qué Incluye?
                  </h2>
                  <ul className="space-y-3">
                    {service.scope.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-cincel-gold rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-cincel-gray leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Para quién es */}
                <div>
                  <h2 className="text-2xl font-bold text-cincel-black mb-4">
                    ¿Para Quién es Este Servicio?
                  </h2>
                  <div className="grid gap-3">
                    {service.targetAudience.map((audience, index) => (
                      <div key={index} className="flex items-start gap-3 bg-cincel-lightgray p-4 rounded-lg">
                        <span className="text-cincel-gold text-xl">→</span>
                        <span className="text-cincel-gray">{audience}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="sticky top-24 space-y-4">
                  {/* Card de cotización */}
                  <div className="card p-6 border-2 border-cincel-gold">
                    <h3 className="text-xl font-bold text-cincel-black mb-4">
                      Cotizá este Servicio
                    </h3>
                    <p className="text-sm text-cincel-gray mb-6">
                      Conversemos sobre tu proyecto y recibí un presupuesto detallado
                    </p>
                    <div className="space-y-3">
                      <Link
                        to="/cotizar"
                        className="btn-primary w-full text-center block"
                      >
                        Solicitar Cotización
                      </Link>
                      <button
                        onClick={handleWhatsAppClick}
                        className="btn-outline w-full"
                      >
                        Consultar por WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div className="bg-cincel-lightgray p-6 rounded-lg">
                    <h4 className="font-bold text-cincel-black mb-3">
                      📋 Presupuestos sin cargo
                    </h4>
                    <p className="text-sm text-cincel-gray mb-4">
                      Evaluamos tu proyecto y entregamos presupuesto detallado sin compromiso
                    </p>
                    
                    <h4 className="font-bold text-cincel-black mb-3">
                      ⏱️ Respuesta en 48hs
                    </h4>
                    <p className="text-sm text-cincel-gray mb-4">
                      Respondemos consultas en menos de 48 horas hábiles
                    </p>

                    <h4 className="font-bold text-cincel-black mb-3">
                      📍 Montevideo y Maldonado
                    </h4>
                    <p className="text-sm text-cincel-gray">
                      Atendemos proyectos en ambas zonas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section bg-cincel-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para comenzar tu proyecto?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Contanos qué necesitás y armamos un plan de trabajo a medida
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cotizar"
                className="btn-primary text-lg"
              >
                Solicitar Cotización
              </Link>
              <Link
                to="/servicios"
                className="btn-outline text-white border-white hover:bg-white hover:text-cincel-black text-lg"
              >
                Ver Otros Servicios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
