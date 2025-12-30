/**
 * Página Home - Inicio
 * 
 * Página principal con hero, servicios, valores, proyectos y llamadas a la acción.
 */

import { Link } from 'react-router-dom';
import { SEO, getHomeSchema } from '../components/SEO';
import { brandConfig } from '../config/brand';
import { services } from '../content/services';
import { getFeaturedProjects } from '../content/projects';
import { generateWhatsAppLink, getGeneralWhatsAppMessage } from '../lib/whatsapp';
import { trackWhatsAppClick, trackCTAClick, trackServiceClick, trackProjectClick } from '../lib/analytics';
import { 
  HammerIcon, 
  CheckShieldIcon, 
  ClockIcon, 
  DocumentIcon,
  TeamIcon,
  CameraIcon,
  RulerIcon
} from '../components/Icons';
import { PlaceholderImage } from '../components/PlaceholderImage';

export const Home: React.FC = () => {
  const featuredServices = services.slice(0, 3);
  const featuredProjects = getFeaturedProjects().slice(0, 3);

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('hero');
    const message = getGeneralWhatsAppMessage();
    const link = generateWhatsAppLink(message);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCTAClick = (location: string) => {
    trackCTAClick('Ver servicios completos', location);
  };

  return (
    <>
      <SEO
        title="Inicio"
        description={brandConfig.description}
        canonical="/"
        schema={getHomeSchema()}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cincel-black via-cincel-darkgray to-cincel-black text-white" style={{ backgroundColor: '#1A1A1A', backgroundImage: 'linear-gradient(to bottom right, #1A1A1A, #2D2D2D, #1A1A1A)' }}>
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge circular */}
            <div className="inline-flex items-center justify-center w-20 h-20 border-3 border-cincel-gold rounded-full bg-cincel-black mb-6">
              <span className="text-cincel-gold font-bold text-3xl">C</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              {brandConfig.companyName}
            </h1>
            
            <p className="text-xl md:text-2xl text-cincel-gold font-medium mb-4">
              {brandConfig.tagline}
            </p>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Servicios profesionales de construcción en todo Uruguay.
              Experiencia, calidad y cumplimiento garantizado.
            </p>

            {/* Badge Cotización Gratuita */}
            <div className="inline-block bg-white text-cincel-gold px-6 py-3 rounded-full font-bold text-lg mb-8 shadow-lg border-2 border-cincel-gold">
              ✓ Cotización 100% Gratuita
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cotizar"
                className="btn-primary text-lg"
                onClick={() => handleCTAClick('hero')}
              >
                Solicitar Cotización Gratis
              </Link>
              <button
                onClick={handleWhatsAppClick}
                className="btn-outline text-lg"
              >
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes Somos - Breve */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-title">Quiénes Somos</h2>
            <p className="section-subtitle">
              Una empresa constructora con presencia consolidada en todo el país
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <TeamIcon className="text-cincel-gold" size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2">Equipo Profesional</h3>
                <p className="text-cincel-gray">
                  Personal capacitado y con años de experiencia en el sector de la construcción
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <HammerIcon className="text-cincel-gold" size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2">Obras Realizadas</h3>
                <p className="text-cincel-gray">
                  Decenas de proyectos completados en Montevideo, Maldonado y todo Uruguay
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckShieldIcon className="text-cincel-gold" size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2">Calidad Garantizada</h3>
                <p className="text-cincel-gray">
                  Materiales de primera, supervisión constante y garantía en todos los trabajos
                </p>
              </div>
            </div>
            <div className="mt-10">
              <Link to="/empresa" className="link-gold text-lg font-semibold">
                Conocé más sobre nosotros →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Galería Visual de Procesos */}
      <section className="section bg-cincel-black text-white" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Nuestro Trabajo</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Desde la planificación hasta la entrega final, cada proyecto es supervisado con profesionalismo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <PlaceholderImage type="blueprint" alt="Planificación y diseño de proyectos" className="rounded-lg" />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <PlaceholderImage type="construction" alt="Obra en construcción" className="rounded-lg" />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <PlaceholderImage type="team" alt="Equipo profesional trabajando" className="rounded-lg" />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <PlaceholderImage type="renovation" alt="Proceso de reforma" className="rounded-lg" />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <PlaceholderImage type="building" alt="Proyecto completado" className="rounded-lg" />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <PlaceholderImage type="process" alt="Control de calidad" className="rounded-lg" />
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm italic">
              * Imágenes ilustrativas del proceso. Fotos reales de proyectos disponibles bajo solicitud.
            </p>
          </div>
        </div>
      </section>

      {/* Servicios Destacados */}
      <section className="section bg-cincel-lightgray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Nuestros Servicios</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Soluciones integrales en construcción, reformas y mantenimiento con
              supervisión profesional permanente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredServices.map((service, idx) => {
              // Asignar iconos rotativos
              const IconComponent = idx === 0 ? HammerIcon : idx === 1 ? RulerIcon : CameraIcon;
              
              return (
                <Link
                  key={service.slug}
                  to={`/servicios/${service.slug}`}
                  className="card p-6 group focus:outline-none focus:ring-2 focus:ring-cincel-gold bg-white"
                  onClick={() => trackServiceClick(service.slug, service.title)}
                >
                  <div className="mb-4 flex justify-center">
                    <IconComponent className="text-cincel-gold" size={56} />
                  </div>
                  <h3 className="text-xl font-bold text-cincel-black mb-3 group-hover:text-cincel-gold transition-colors text-center">
                    {service.title}
                  </h3>
                  <p className="text-cincel-gray mb-4 leading-relaxed text-center">
                    {service.shortDescription}
                  </p>
                  <span className="link-gold font-medium block text-center">
                    Ver detalles →
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to="/servicios"
              className="btn-secondary"
              onClick={() => handleCTAClick('servicios-home')}
            >
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Valores que nos distinguen */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">¿Por qué elegirnos?</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Nos comprometemos con cada proyecto como si fuera nuestro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandConfig.values.map((value, idx) => {
              const icons = [CheckShieldIcon, ClockIcon, DocumentIcon, CheckShieldIcon];
              const IconComponent = icons[idx];
              
              return (
                <div key={value.id} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-cincel-lightgray flex items-center justify-center">
                      <IconComponent className="text-cincel-gold" size={48} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-cincel-black mb-2">{value.title}</h3>
                  <p className="text-cincel-gray text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nuestro Proceso de Trabajo */}
      <section className="section bg-cincel-lightgray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Cómo Trabajamos</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Un proceso ordenado que garantiza resultados de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-cincel-gold text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-cincel-black mb-2">Consulta Inicial</h3>
              <p className="text-cincel-gray text-sm">
                Visitamos la obra, entendemos tus necesidades y tomamos medidas. <strong>Sin costo.</strong>
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-cincel-gold text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-cincel-black mb-2">Presupuesto Detallado</h3>
              <p className="text-cincel-gray text-sm">
                Recibís un presupuesto completo con materiales, plazos y costos. <strong>Todo claro.</strong>
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-cincel-gold text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-cincel-black mb-2">Ejecución</h3>
              <p className="text-cincel-gray text-sm">
                Nuestro equipo trabaja en tu proyecto con supervisión constante y comunicación permanente.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-cincel-gold text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg font-bold text-cincel-black mb-2">Entrega</h3>
              <p className="text-cincel-gray text-sm">
                Recibís tu obra terminada en el plazo acordado, con garantía y documentación completa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proyectos Destacados */}
      {featuredProjects.length > 0 && (
        <section className="section bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="section-title">Proyectos Realizados</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Obras ejecutadas con planificación profesional y cumplimiento de plazos acordados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProjects.map((project) => (
                <Link
                  key={project.slug}
                  to={`/obras/${project.slug}`}
                  className="card overflow-hidden group focus:outline-none focus:ring-2 focus:ring-cincel-gold"
                  onClick={() => trackProjectClick(project.slug, project.title)}
                >
                  {/* Placeholder para imagen real */}
                  <div className="w-full h-48 bg-gradient-to-br from-cincel-lightgray to-gray-200 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cincel-black opacity-10"></div>
                    <CameraIcon className="text-cincel-gold opacity-40" size={80} />
                    <div className="absolute bottom-2 right-2 bg-cincel-gold text-white text-xs px-2 py-1 rounded">
                      Foto referencial
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2 text-sm text-cincel-gray">
                      <span className="px-2 py-1 bg-cincel-lightgray rounded text-xs font-medium">
                        {project.city}
                      </span>
                      {project.neighborhood && (
                        <span className="text-xs">• {project.neighborhood}</span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-cincel-black mb-3 group-hover:text-cincel-gold transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-cincel-gray mb-4 leading-relaxed">
                      {project.shortDescription}
                    </p>
                    
                    <span className="link-gold font-medium">
                      Ver proyecto completo →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/obras"
                className="btn-secondary"
                onClick={() => handleCTAClick('obras-home')}
              >
                Ver todas las obras
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Zonas de Trabajo */}
      <section className="section bg-cincel-black text-white" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Cobertura Nacional</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Atendemos proyectos en todo Uruguay, con presencia permanente en Montevideo y Maldonado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {brandConfig.workZones.map((zone) => (
              <Link
                key={zone.id}
                to={zone.id === 'nacional' ? '/contacto' : `/zonas#${zone.id}`}
                className="bg-cincel-darkgray p-8 rounded-lg hover:bg-cincel-gray transition-colors group focus:outline-none focus:ring-2 focus:ring-cincel-gold"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-cincel-gold flex items-center justify-center text-white font-bold text-xl">
                    {zone.id === 'montevideo' ? 'M' : zone.id === 'maldonado' ? 'D' : 'UY'}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-cincel-gold transition-colors text-center text-white">
                  {zone.name}
                </h3>
                <p className="text-gray-300 leading-relaxed text-center">
                  {zone.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/zonas"
              className="btn-outline text-white border-white hover:bg-white hover:text-cincel-black"
            >
              Ver información detallada de zonas
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section bg-cincel-gold" style={{ backgroundColor: '#D4AF37' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-white text-cincel-gold px-6 py-2 rounded-full font-bold text-lg mb-6 shadow-lg">
              ✓ Cotización 100% Gratuita
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Tenés un proyecto en mente?
            </h2>
            <p className="text-xl text-cincel-black mb-8">
              Conversemos. Te brindamos un presupuesto claro, sin sorpresas, y un cronograma realista.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cotizar"
                className="btn-secondary text-lg"
              >
                Solicitar Cotización Gratis
              </Link>
              <Link
                to="/contacto"
                className="btn-outline text-cincel-black border-cincel-black hover:bg-cincel-black hover:text-white text-lg"
              >
                Formulario de Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
