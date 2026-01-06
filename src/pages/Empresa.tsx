/**
 * Página Empresa - Quiénes somos
 * 
 * Valores, historia, equipo y proceso de trabajo.
 */

import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { brandConfig } from '../config/brand';
import { 
  CheckShieldIcon,
  ClockIcon,
  DocumentIcon,
  TeamIcon,
  HammerIcon,
  HandshakeIcon
} from '../components/Icons';
import { PlaceholderImage } from '../components/PlaceholderImage';

export const Empresa: React.FC = () => {
  return (
    <>
      <SEO
        title="Empresa"
        description="Conocé quiénes somos y cómo trabajamos en Cincel Construcciones. Equipo profesional, planificación, cumplimiento y presupuestos claros."
        canonical="/empresa"
      />

      {/* Hero */}
      <section className="bg-cincel-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Quiénes Somos
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Una constructora con trayectoria y compromiso que trabaja en todo el Uruguay
            </p>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-cincel-black mb-6">
                  Experiencia que construye confianza
                </h2>
                <div className="space-y-4 text-cincel-dark leading-relaxed">
                  <p>
                    <strong className="text-cincel-black">Cincel Construcciones</strong> es una empresa constructora 
                    uruguaya con experiencia real en obras y reformas, enfocada en trabajar con seriedad, compromiso y 
                    atención al detalle. Comenzamos desarrollando proyectos residenciales en Montevideo y hoy acompañamos 
                    obras de distinta escala en diferentes puntos del país.
                  </p>
                  <p>
                    Contamos con mano de obra calificada y experiencia en distintos rubros de la construcción, lo que nos 
                    permite adaptarnos a cada proyecto y ejecutar las obras de forma responsable.
                  </p>
                  <p>
                    Trabajamos con <strong className="text-cincel-black">transparencia y comunicación constante</strong>, 
                    ofreciendo estimaciones claras y plazos realistas, para que cada cliente tenga la tranquilidad de saber 
                    cómo y cuándo se ejecuta su obra.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cincel-lightgray p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-cincel-dark">Proyectos Completados</div>
                </div>
                <div className="bg-cincel-lightgray p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-cincel-dark">Clientes Satisfechos</div>
                </div>
                <div className="bg-cincel-lightgray p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">15+</div>
                  <div className="text-sm text-cincel-dark">Profesionales</div>
                </div>
                <div className="bg-cincel-lightgray p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-cincel-dark">Disponibilidad</div>
                </div>
              </div>
            </div>

            {/* Misión y Visión */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-cincel-lightgray p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-cincel-black mb-4">Misión</h3>
                <div className="space-y-3 text-cincel-dark leading-relaxed">
                  <p>
                    Construir y reformar espacios con calidad, responsabilidad y compromiso, brindando soluciones 
                    constructivas sólidas y duraderas que superen las expectativas de nuestros clientes.
                  </p>
                  <p>
                    En Cincel Construcciones trabajamos con profesionalismo, experiencia y atención al detalle, 
                    asegurando obras bien hechas, procesos claros y resultados confiables, desde el primer contacto 
                    hasta la entrega final.
                  </p>
                </div>
              </div>

              <div className="bg-cincel-lightgray p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-cincel-black mb-4">Visión</h3>
                <div className="space-y-3 text-cincel-dark leading-relaxed">
                  <p>
                    Ser una empresa constructora referente en Uruguay, reconocida por su seriedad, cumplimiento y 
                    excelencia técnica, con fuerte presencia en Montevideo y Maldonado.
                  </p>
                  <p>
                    Buscamos crecer de forma ordenada y sostenible, liderando proyectos cada vez más importantes, 
                    posicionándonos como la primera opción para quienes buscan construir con confianza, respaldo y 
                    tranquilidad.
                  </p>
                </div>
              </div>
            </div>

            {/* Imágenes del equipo y proceso */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative h-48 rounded-lg overflow-hidden">
                <PlaceholderImage type="team" alt="Nuestro equipo profesional" className="rounded-lg" />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <PlaceholderImage type="construction" alt="Supervisión en obra" className="rounded-lg" />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <PlaceholderImage type="blueprint" alt="Planificación detallada" className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="section" style={{ backgroundColor: '#183950' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="section-title text-center !text-white">Nuestros Valores</h2>
            <p className="section-subtitle text-center max-w-2xl mx-auto !text-gray-200">
              Los principios que guían cada uno de nuestros proyectos
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brandConfig.values.map((value, idx) => {
                const icons = [CheckShieldIcon, ClockIcon, DocumentIcon, HandshakeIcon];
                const IconComponent = icons[idx] || HammerIcon;
                
                return (
                  <div key={value.id} className="bg-white rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <IconComponent style={{ color: '#c08826' }} size={56} />
                    </div>
                    <h3 className="text-xl font-bold text-cincel-black mb-3">{value.title}</h3>
                    <p className="text-cincel-dark leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de Trabajo Detallado */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title text-center">Nuestro proceso de trabajo</h2>
            <p className="section-subtitle text-center max-w-2xl mx-auto">
              Cada proyecto comienza con información clara y avanza paso a paso, con comunicación constante y criterios realistas, para que sepas siempre dónde estás parado.
            </p>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border-l-4 border-primary shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cincel-black mb-2">Formulario web</h3>
                    <p className="text-cincel-dark leading-relaxed">
                      El primer paso es completar el formulario de contacto con la información básica de tu proyecto. Esto nos permite entender tu idea antes del primer contacto y preparar mejor la conversación.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-primary shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cincel-black mb-2">Contacto por WhatsApp</h3>
                    <p className="text-cincel-dark leading-relaxed">
                      Nos comunicamos por WhatsApp para conversar sobre tu proyecto, aclarar dudas, profundizar en los detalles y coordinar los siguientes pasos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-primary shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cincel-black mb-2">Evaluación en el sitio</h3>
                    <p className="text-cincel-dark leading-relaxed">
                      Visitamos el lugar para evaluar el alcance real de los trabajos, tomar medidas y analizar las condiciones del espacio. En esta etapa identificamos posibles desafíos y soluciones.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-primary shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cincel-black mb-2">Presupuesto</h3>
                    <p className="text-cincel-dark leading-relaxed">
                      Te presentamos una estimación clara y por escrito, con materiales, mano de obra, plazos aproximados y condiciones de pago. Todo de forma transparente y sin sorpresas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-primary shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cincel-black mb-2">Ejecución de la obra</h3>
                    <p className="text-cincel-dark leading-relaxed">
                      Una vez aprobado el presupuesto, coordinamos y ejecutamos los trabajos, con seguimiento constante y comunicación durante todo el proceso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-primary shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    6
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cincel-black mb-2">Control y entrega final</h3>
                    <p className="text-cincel-dark leading-relaxed">
                      Realizamos una revisión completa del trabajo, cuidamos los detalles finales y hacemos la entrega de la obra. Quedamos disponibles para consultas y acompañamiento posterior.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Garantías y Certificaciones */}
      <section className="section bg-cincel-lightgray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title text-center">Garantías y Certificaciones</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-center mb-4">
                  <CheckShieldIcon style={{ color: '#c08826' }} size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2 text-center">Garantía de Obra</h3>
                <p className="text-cincel-dark leading-relaxed text-center">
                  Todos nuestros trabajos cuentan con garantía sobre mano de obra y materiales según tipo de servicio.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-center mb-4">
                  <ClockIcon style={{ color: '#c08826' }} size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2 text-center">Cumplimiento de Plazos</h3>
                <p className="text-cincel-dark leading-relaxed text-center">
                  Cronogramas realistas con compromisos escritos. Coordinamos todos los oficios necesarios.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg">
                <div className="flex justify-center mb-4">
                  <HandshakeIcon style={{ color: '#c08826' }} size={64} />
                </div>
                <h3 className="text-xl font-bold text-cincel-black mb-2 text-center">Soporte Post-Obra</h3>
                <p className="text-cincel-dark leading-relaxed text-center">
                  Seguimiento posterior a la entrega. Atendemos consultas y garantizamos nuestro trabajo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zonas de Trabajo */}
      <section className="section bg-cincel-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trabajamos en Todo Uruguay
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Presencia permanente en Montevideo y Maldonado. Proyectos en todo el país.
            </p>
            <Link
              to="/zonas"
              className="btn-outline text-white border-white hover:bg-white hover:text-cincel-black"
            >
              Ver información de zonas
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-cincel-black mb-6">
              ¿Querés saber más sobre cómo trabajamos?
            </h2>
            <p className="text-xl text-cincel-dark mb-8">
              Conversemos sobre tu proyecto sin compromiso
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cotizar"
                className="btn-primary text-lg"
              >
                Solicitar Cotización
              </Link>
              <Link
                to="/contacto"
                className="btn-secondary text-lg"
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
