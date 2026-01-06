/**
 * Página Obras - Portfolio de proyectos
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { projects, type Project } from '../content/projects';
import { trackProjectClick } from '../lib/analytics';

export const Obras: React.FC = () => {
  const [filterCity, setFilterCity] = useState<'all' | 'Montevideo' | 'Maldonado'>('all');
  const [filterType, setFilterType] = useState<'all' | Project['type']>('all');

  const filteredProjects = projects.filter(project => {
    const cityMatch = filterCity === 'all' || project.city === filterCity;
    const typeMatch = filterType === 'all' || project.type === filterType;
    return cityMatch && typeMatch;
  });

  return (
    <>
      <SEO
        title="Obras Realizadas"
        description="Portfolio de proyectos realizados por Cincel Construcciones en Montevideo y Maldonado. Obra nueva, reformas, mantenimiento y proyectos comerciales."
        canonical="/obras"
      />

      {/* Hero */}
      <section className="bg-cincel-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Proyectos Realizados
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Obras ejecutadas con planificación profesional y cumplimiento de plazos acordados
            </p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-cincel-lightgray py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div>
              <label htmlFor="city-filter" className="sr-only">Filtrar por ciudad</label>
              <select
                id="city-filter"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value as typeof filterCity)}
                className="input-field"
              >
                <option value="all">Todas las ciudades</option>
                <option value="Montevideo">Montevideo</option>
                <option value="Maldonado">Maldonado</option>
              </select>
            </div>
            <div>
              <label htmlFor="type-filter" className="sr-only">Filtrar por tipo</label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="input-field"
              >
                <option value="all">Todos los tipos</option>
                <option value="obra-nueva">Obra Nueva</option>
                <option value="reforma">Reformas</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de proyectos */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <Link
                  key={project.slug}
                  to={`/obras/${project.slug}`}
                  className="card overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => trackProjectClick(project.slug, project.title)}
                >
                  {/* Placeholder para imagen */}
                  <div className="w-full h-56 bg-gradient-to-br from-cincel-lightgray to-gray-200 flex items-center justify-center">
                    <span className="text-7xl opacity-30">
                      {project.type === 'obra-nueva' ? '🏗️' : project.type === 'reforma' ? '🔨' : '🛠️'}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <span className="px-2 py-1 bg-primary text-white rounded text-xs font-medium">
                        {project.city}
                      </span>
                      {project.neighborhood && (
                        <span className="text-xs text-cincel-dark">• {project.neighborhood}</span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-cincel-black mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h2>
                    
                    <p className="text-sm text-cincel-dark mb-4">
                      {project.shortDescription}
                    </p>

                    {project.surface && (
                      <p className="text-xs text-cincel-dark mb-2">📐 {project.surface}</p>
                    )}
                    {project.duration && (
                      <p className="text-xs text-cincel-dark mb-4">⏱️ {project.duration}</p>
                    )}
                    
                    <span className="link-gold font-medium text-sm">
                      Ver proyecto completo →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-cincel-dark">No hay proyectos con estos filtros</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Tu proyecto puede ser el próximo?
            </h2>
            <p className="text-xl text-cincel-black mb-8">
              Trabajemos juntos para convertir tu idea en realidad
            </p>
            <Link to="/cotizar" className="btn-secondary text-lg">
              Solicitar Cotización
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
