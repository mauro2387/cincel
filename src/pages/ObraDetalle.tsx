/**
 * Página Obra Detalle - Detalle dinámico de proyecto
 */

import { Link, useParams, Navigate } from 'react-router-dom';
import { SEO, getProjectSchema } from '../components/SEO';
import { getProjectBySlug } from '../content/projects';
import { generateWhatsAppLink, getProjectWhatsAppMessage } from '../lib/whatsapp';
import { trackWhatsAppClick } from '../lib/analytics';

export const ObraDetalle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return <Navigate to="/obras" replace />;
  }

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('project_detail', project.title);
    const message = getProjectWhatsAppMessage(project.title);
    const link = generateWhatsAppLink(message);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const typeLabels = {
    'obra-nueva': 'Obra Nueva',
    'reforma': 'Reforma',
    'mantenimiento': 'Mantenimiento',
    'comercial': 'Comercial',
  };

  return (
    <>
      <SEO
        title={project.title}
        description={project.fullDescription}
        canonical={`/obras/${project.slug}`}
        schema={getProjectSchema(project.title, project.fullDescription, project.city)}
      />

      {/* Hero */}
      <section className="bg-cincel-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/obras"
              className="inline-flex items-center gap-2 text-primary hover:text-gold-400 mb-6 focus:outline-none focus:underline"
            >
              ← Volver a obras
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-3 py-1 bg-primary text-white rounded font-medium">
                {typeLabels[project.type]}
              </span>
              <span className="text-gray-300">📍 {project.city}</span>
              {project.neighborhood && (
                <span className="text-gray-300">• {project.neighborhood}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Columna principal */}
              <div className="md:col-span-2 space-y-8">
                {/* Imagen placeholder */}
                <div className="w-full h-80 bg-gradient-to-br from-cincel-lightgray to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-8xl mb-4">
                      {project.type === 'obra-nueva' ? '🏗️' : project.type === 'reforma' ? '🔨' : '🛠️'}
                    </div>
                    <p className="text-sm">Imagen del proyecto disponible próximamente</p>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <h2 className="text-2xl font-bold text-cincel-black mb-4">
                    Descripción del Proyecto
                  </h2>
                  <p className="text-cincel-dark text-lg leading-relaxed">
                    {project.fullDescription}
                  </p>
                </div>

                {/* Trabajos realizados */}
                <div>
                  <h2 className="text-2xl font-bold text-cincel-black mb-4">
                    Trabajos Realizados
                  </h2>
                  <ul className="space-y-3">
                    {project.workDone.map((work, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-cincel-dark leading-relaxed">{work}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="sticky top-24 space-y-4">
                  {/* Detalles */}
                  <div className="card p-6">
                    <h3 className="font-bold text-cincel-black mb-4">Detalles del Proyecto</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm text-cincel-dark">Tipo</dt>
                        <dd className="font-semibold text-cincel-black">{typeLabels[project.type]}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-cincel-dark">Ubicación</dt>
                        <dd className="font-semibold text-cincel-black">
                          {project.city}
                          {project.neighborhood && `, ${project.neighborhood}`}
                        </dd>
                      </div>
                      {project.surface && (
                        <div>
                          <dt className="text-sm text-cincel-dark">Superficie</dt>
                          <dd className="font-semibold text-cincel-black">{project.surface}</dd>
                        </div>
                      )}
                      {project.duration && (
                        <div>
                          <dt className="text-sm text-cincel-dark">Duración</dt>
                          <dd className="font-semibold text-cincel-black">{project.duration}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* CTA */}
                  <div className="card p-6 bg-cincel-lightgray">
                    <h3 className="font-bold text-cincel-black mb-3">
                      ¿Te interesa un proyecto similar?
                    </h3>
                    <p className="text-sm text-cincel-dark mb-4">
                      Consultanos sin compromiso
                    </p>
                    <div className="space-y-3">
                      <Link to="/cotizar" className="btn-primary w-full text-center block">
                        Solicitar Cotización
                      </Link>
                      <button onClick={handleWhatsAppClick} className="btn-outline w-full">
                        WhatsApp
                      </button>
                    </div>
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
              Ver Más Proyectos
            </h2>
            <Link to="/obras" className="btn-outline text-white border-white hover:bg-white hover:text-cincel-black text-lg">
              Volver al Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
