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
      <section className="relative overflow-hidden text-white min-h-[600px] md:min-h-[700px] flex items-center" style={{ backgroundColor: '#183950' }}>
        {/* Video de fondo */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          style={{ minHeight: '100%', minWidth: '100%' }}
        >
          <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=165" type="video/mp4" />
        </video>
        
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute top-0 left-0 w-full h-full bg-opacity-50 z-10" style={{ backgroundColor: '#183950' }}></div>
        
        {/* Contenido */}
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center mb-6">
              <img 
                src="/IMG/LOGO GRANDE.png" 
                alt="Cincel Construcciones Logo" 
                className="h-20 w-auto drop-shadow-2xl"
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              {brandConfig.companyName}
            </h1>
            
            <p className="text-xl md:text-2xl text-primary font-medium mb-4 drop-shadow-lg">
              {brandConfig.tagline}
            </p>
            
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Servicios profesionales de construcción en todo Uruguay.
              Experiencia, calidad y cumplimiento garantizado.
            </p>

            {/* Badge Cotización Gratuita */}
            <div className="inline-block bg-primary text-white px-6 py-3 rounded-full font-bold text-lg mb-8 shadow-lg">
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
                className="btn-outline text-lg border-white text-white hover:bg-white hover:text-cincel-black"
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
              Una empresa constructora con presencia consolidada en Montevideo<br />
              que trabaja en todo el país
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <TeamIcon className="text-primary" size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2">Equipo Profesional</h3>
                <p className="text-cincel-dark">
                  Personal capacitado y con años de experiencia en el sector de la construcción
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <HammerIcon className="text-primary" size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2">Obras Realizadas</h3>
                <p className="text-cincel-dark">
                  Decenas de proyectos completados en Montevideo y el resto de Uruguay
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckShieldIcon className="text-primary" size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2">Calidad Garantizada</h3>
                <p className="text-cincel-dark">
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
      <section className="section text-white" style={{ backgroundColor: '#183950' }}>
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
                  className="card p-6 group focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  onClick={() => trackServiceClick(service.slug, service.title)}
                >
                  <div className="mb-4 flex justify-center">
                    <IconComponent className="text-primary" size={56} />
                  </div>
                  <h3 className="text-xl font-bold text-cincel-black mb-3 group-hover:text-primary transition-colors text-center">
                    {service.title}
                  </h3>
                  <p className="text-cincel-dark mb-4 leading-relaxed text-center">
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
                      <IconComponent className="text-primary" size={48} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-cincel-black mb-2">{value.title}</h3>
                  <p className="text-cincel-dark text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nuestro Proceso de Trabajo */}
      <section className="section text-white" style={{ backgroundColor: '#183950' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Cómo Trabajamos</h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Un proceso ordenado que garantiza resultados de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{ backgroundColor: '#c08826' }}>
                1
              </div>
              <h3 className="text-lg font-bold text-cincel-black mb-2">Consulta Inicial</h3>
              <p className="text-cincel-dark text-sm">
                Visitamos la obra, entendemos tus necesidades y tomamos medidas. <strong>Sin costo.</strong>
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{ backgroundColor: '#c08826' }}>
                2
              </div>
              <h3 className="text-lg font-bold text-cincel-black mb-2">Presupuesto Detallado</h3>
              <p className="text-cincel-dark text-sm">
                Recibís un presupuesto completo con materiales, plazos y costos. <strong>Todo claro.</strong>
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{ backgroundColor: '#c08826' }}>
                3
              </div>
              <h3 className="text-lg font-bold text-cincel-black mb-2">Ejecución</h3>
              <p className="text-cincel-dark text-sm">
                Nuestro equipo trabaja en tu proyecto con supervisión constante y comunicación permanente.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{ backgroundColor: '#c08826' }}>
                4
              </div>
              <h3 className="text-lg font-bold text-cincel-black mb-2">Entrega</h3>
              <p className="text-cincel-dark text-sm">
                Recibís tu obra terminada en el plazo acordado y con la mejor garantía.
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
                  className="card overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => trackProjectClick(project.slug, project.title)}
                >
                  {/* Placeholder para imagen real */}
                  <div className="w-full h-48 bg-gradient-to-br from-cincel-lightgray to-gray-200 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cincel-black opacity-10"></div>
                    <CameraIcon className="text-primary opacity-40" size={80} />
                    <div className="absolute bottom-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Foto referencial
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2 text-sm text-cincel-dark">
                      <span className="px-2 py-1 bg-cincel-lightgray rounded text-xs font-medium">
                        {project.city}
                      </span>
                      {project.neighborhood && (
                        <span className="text-xs">• {project.neighborhood}</span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-cincel-black mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-cincel-dark mb-4 leading-relaxed">
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
      <section className="section bg-cincel-black text-white" style={{ backgroundColor: '#183950' }}>
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
                className="bg-cincel-dark p-8 rounded-lg hover:bg-cincel-dark transition-colors group focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                    {zone.id === 'montevideo' ? 'M' : zone.id === 'maldonado' ? 'D' : 'UY'}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors text-center text-white">
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
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block text-white px-6 py-2 rounded-full font-bold text-lg mb-6 shadow-lg" style={{ backgroundColor: '#c08826' }}>
              ✓ Cotización 100% Gratuita
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#183950' }}>
              ¿Tenés un proyecto en mente?
            </h2>
            <p className="text-xl text-cincel-dark mb-8">
              Conversemos. Te brindamos un presupuesto claro, sin sorpresas, y un cronograma realista.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cotizar"
                className="btn-primary text-lg"
              >
                Solicitar Cotización Gratis
              </Link>
              <Link
                to="/contacto"
                className="btn-outline text-lg"
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
