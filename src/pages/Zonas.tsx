/**
 * Página Zonas - Montevideo y Maldonado
 */

import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { brandConfig } from '../config/brand';

export const Zonas: React.FC = () => {
  return (
    <>
      <SEO
        title="Zonas de Trabajo"
        description="Cincel Construcciones atiende proyectos en Montevideo y Maldonado. Servicios profesionales de construcción en ambas zonas."
        canonical="/zonas"
      />

      {/* Hero */}
      <section className="bg-cincel-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Zonas de Trabajo
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Atendemos proyectos en {brandConfig.workZones.map(z => z.name).join(' y ')} con el mismo nivel de profesionalismo
            </p>
          </div>
        </div>
      </section>

      {/* Montevideo */}
      <section id="montevideo" className="section bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                M
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-cincel-black">Montevideo</h2>
                <p className="text-cincel-dark">Área metropolitana completa</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-cincel-dark leading-relaxed">
                Atendemos todas las zonas de Montevideo y área metropolitana. Desde el Centro hasta
                las zonas residenciales costeras (Carrasco, Pocitos, Malvín, Buceo) y zonas residenciales
                del interior (Tres Cruces, Cordón, Parque Rodó, entre otras).
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-cincel-lightgray p-6 rounded-lg">
                  <h3 className="font-bold text-cincel-black mb-3">Servicios Disponibles</h3>
                  <ul className="space-y-2 text-sm text-cincel-dark">
                    <li>• Obra nueva completa</li>
                    <li>• Reformas integrales y parciales</li>
                    <li>• Mantenimiento edilicio</li>
                    <li>• Dirección de obra</li>
                    <li>• Albañilería e instalaciones</li>
                    <li>• Terminaciones</li>
                  </ul>
                </div>

                <div className="bg-cincel-lightgray p-6 rounded-lg">
                  <h3 className="font-bold text-cincel-black mb-3">Zonas Principales</h3>
                  <ul className="space-y-2 text-sm text-cincel-dark">
                    <li>• Centro y Ciudad Vieja</li>
                    <li>• Pocitos, Buceo, Malvín, Carrasco</li>
                    <li>• Punta Carretas, Parque Rodó</li>
                    <li>• Tres Cruces, Cordón, Palermo</li>
                    <li>• Prado, La Blanqueada, La Comercial</li>
                    <li>• Otras zonas bajo consulta</li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary bg-opacity-10 border-l-4 border-primary p-6 rounded">
                <p className="text-cincel-dark">
                  <strong className="text-cincel-black">Cobertura total:</strong> Trabajamos en toda el área metropolitana.
                  Si tu proyecto está en Canelones o San José (áreas cercanas), consultanos disponibilidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maldonado */}
      <section id="maldonado" className="section bg-cincel-lightgray scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                D
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-cincel-black">Maldonado</h2>
                <p className="text-cincel-dark">Punta del Este y toda la zona</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-cincel-dark leading-relaxed">
                Atendemos proyectos en Punta del Este, Maldonado ciudad, La Barra, José Ignacio,
                Piriápolis y zonas aledañas. Experiencia en construcción y reformas en zona costera
                con materiales apropiados para ambiente marítimo.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-bold text-cincel-black mb-3">Servicios Disponibles</h3>
                  <ul className="space-y-2 text-sm text-cincel-dark">
                    <li>• Construcción de casas de playa</li>
                    <li>• Reformas en zona costera</li>
                    <li>• Mantenimiento de propiedades</li>
                    <li>• Impermeabilizaciones especiales</li>
                    <li>• Terminaciones resistentes</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-bold text-cincel-black mb-3">Zonas Principales</h3>
                  <ul className="space-y-2 text-sm text-cincel-dark">
                    <li>• Punta del Este</li>
                    <li>• La Barra</li>
                    <li>• José Ignacio</li>
                    <li>• Maldonado ciudad</li>
                    <li>• Piriápolis</li>
                    <li>• Otras zonas del departamento</li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary bg-opacity-10 border-l-4 border-primary p-6 rounded">
                <p className="text-cincel-dark">
                  <strong className="text-cincel-black">Especialización costera:</strong> Conocemos los desafíos
                  de construir en zona de playa: humedad, salitre, vientos. Usamos materiales y técnicas
                  apropiadas para garantizar durabilidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-cincel-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Tu proyecto está en alguna de estas zonas?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Conversemos sin compromiso. Evaluamos tu proyecto y te enviamos un presupuesto detallado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cotizar" className="btn-primary text-lg">
                Solicitar Cotización
              </Link>
              <Link to="/contacto" className="btn-outline text-white border-white hover:bg-white hover:text-cincel-black text-lg">
                Formulario de Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
