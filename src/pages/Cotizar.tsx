/**
 * Página Cotizar - Mini embudo de cotización
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { services } from '../content/services';
import { trackQuoteSubmit } from '../lib/analytics';
import { generateWhatsAppLink } from '../lib/whatsapp';

export const Cotizar: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    tipoProyecto: '',
    departamento: '',
    ciudadZona: '',
    urgencia: '',
    presupuesto: '',
    detalles: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
      if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono es obligatorio';
      } else if (!/^\d{8,15}$/.test(formData.telefono.replace(/\D/g, ''))) {
        newErrors.telefono = 'Teléfono inválido';
      }
    }

    if (currentStep === 2 && !formData.tipoProyecto) {
      newErrors.tipoProyecto = 'Seleccioná un tipo de proyecto';
    }

    if (currentStep === 3 && !formData.departamento) {
      newErrors.departamento = 'Seleccioná un departamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevenir envío del formulario con Enter en pasos anteriores al 4
    if (e.key === 'Enter' && step < 4) {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // CRÍTICO: Solo abrir WhatsApp si estamos en el paso 4
    if (step !== 4) {
      console.log('Bloqueando submit - Paso actual:', step);
      return;
    }

    console.log('Enviando a WhatsApp - Paso 4 confirmado');

    trackQuoteSubmit({
      serviceType: formData.tipoProyecto,
      estimatedBudget: formData.presupuesto,
      urgency: formData.urgencia,
    });

    // Generar mensaje WhatsApp
    const message = `
*SOLICITUD DE COTIZACIÓN - CINCEL CONSTRUCCIONES*

*Nombre:* ${formData.nombre}
*Teléfono:* ${formData.telefono}
*Tipo de Proyecto:* ${formData.tipoProyecto}
*Departamento:* ${formData.departamento}
*Ciudad/Zona:* ${formData.ciudadZona || 'No especificada'}
*Urgencia:* ${formData.urgencia || 'No especificada'}
*Presupuesto Estimado:* ${formData.presupuesto || 'No especificado'}

${formData.detalles ? `*Detalles del Proyecto:*\n${formData.detalles}\n\n` : ''}Solicito cotización para este proyecto.
    `.trim();

    const link = generateWhatsAppLink(message);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <>
      <SEO
        title="Solicitar Cotización"
        description="Solicitá una cotización para tu proyecto de construcción. Completá 4 pasos simples y recibí un presupuesto personalizado."
        canonical="/cotizar"
      />

      {/* Hero */}
      <section className="bg-cincel-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary text-white px-6 py-2 rounded-full font-bold text-base mb-4">
              ✓ Cotización 100% Gratuita y Sin Compromiso
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Solicitar Cotización
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Completá este formulario en 4 pasos simples y recibí un presupuesto detallado para tu proyecto
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Barra de progreso */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-cincel-dark">
                  Paso {step} de {totalSteps}
                </span>
                <span className="text-sm font-medium text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
              {/* Paso 1: Datos de contacto */}
              {step === 1 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-cincel-black mb-6">
                    1. Datos de Contacto
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-semibold text-cincel-black mb-2">
                        Nombre y Apellido <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`input-field ${errors.nombre ? 'input-error' : ''}`}
                        placeholder="Ej: Juan Pérez"
                      />
                      {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                    </div>
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-semibold text-cincel-black mb-2">
                        Teléfono / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={`input-field ${errors.telefono ? 'input-error' : ''}`}
                        placeholder="099 123 456"
                      />
                      {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Tipo de proyecto */}
              {step === 2 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-cincel-black mb-6">
                    2. ¿Qué tipo de proyecto necesitás?
                  </h2>
                  <div className="space-y-3">
                    {services.map(service => (
                      <label
                        key={service.slug}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.tipoProyecto === service.title
                            ? 'border-primary bg-red-50'
                            : 'border-gray-200 hover:border-primary'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipoProyecto"
                          value={service.title}
                          checked={formData.tipoProyecto === service.title}
                          onChange={handleChange}
                          className="mt-1"
                        />
                        <div>
                          <span className="font-semibold text-cincel-black">{service.title}</span>
                          <p className="text-sm text-cincel-dark">{service.shortDescription}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.tipoProyecto && <p className="text-red-500 text-sm mt-2">{errors.tipoProyecto}</p>}
                </div>
              )}

              {/* Paso 3: Ubicación */}
              {step === 3 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-cincel-black mb-6">
                    3. ¿Dónde está ubicado tu proyecto?
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="departamento" className="block text-sm font-semibold text-cincel-black mb-2">
                        Departamento <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="departamento"
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleChange}
                        className={`input-field ${errors.departamento ? 'input-error' : ''}`}
                      >
                        <option value="">Seleccioná un departamento</option>
                        <option value="Artigas">Artigas</option>
                        <option value="Canelones">Canelones</option>
                        <option value="Cerro Largo">Cerro Largo</option>
                        <option value="Colonia">Colonia</option>
                        <option value="Durazno">Durazno</option>
                        <option value="Flores">Flores</option>
                        <option value="Florida">Florida</option>
                        <option value="Lavalleja">Lavalleja</option>
                        <option value="Maldonado">Maldonado</option>
                        <option value="Montevideo">Montevideo</option>
                        <option value="Paysandú">Paysandú</option>
                        <option value="Río Negro">Río Negro</option>
                        <option value="Rivera">Rivera</option>
                        <option value="Rocha">Rocha</option>
                        <option value="Salto">Salto</option>
                        <option value="San José">San José</option>
                        <option value="Soriano">Soriano</option>
                        <option value="Tacuarembó">Tacuarembó</option>
                        <option value="Treinta y Tres">Treinta y Tres</option>
                      </select>
                      {errors.departamento && <p className="text-red-500 text-sm mt-1">{errors.departamento}</p>}
                    </div>
                    <div>
                      <label htmlFor="ciudadZona" className="block text-sm font-semibold text-cincel-black mb-2">
                        Ciudad/Zona
                      </label>
                      <input
                        type="text"
                        id="ciudadZona"
                        name="ciudadZona"
                        value={formData.ciudadZona}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ej: Punta del Este, La Barra, Carrasco, etc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 4: Detalles adicionales */}
              {step === 4 && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-cincel-black mb-6">
                    4. Detalles Adicionales (opcional)
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="urgencia" className="block text-sm font-semibold text-cincel-black mb-2">
                        ¿Cuándo querés comenzar?
                      </label>
                      <select
                        id="urgencia"
                        name="urgencia"
                        value={formData.urgencia}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Seleccioná</option>
                        <option value="Lo antes posible">Lo antes posible</option>
                        <option value="Dentro de 1-3 meses">Dentro de 1-3 meses</option>
                        <option value="Dentro de 3-6 meses">Dentro de 3-6 meses</option>
                        <option value="Más de 6 meses">Más de 6 meses</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="presupuesto" className="block text-sm font-semibold text-cincel-black mb-2">
                        Presupuesto Estimado (USD)
                      </label>
                      <select
                        id="presupuesto"
                        name="presupuesto"
                        value={formData.presupuesto}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Seleccioná</option>
                        <option value="Menos de 1.000">Menos de 1.000</option>
                        <option value="1.000 - 3.000">1.000 - 3.000</option>
                        <option value="3.000 - 5.000">3.000 - 5.000</option>
                        <option value="5.000 - 10.000">5.000 - 10.000</option>
                        <option value="10.000 - 20.000">10.000 - 20.000</option>
                        <option value="20.000 - 50.000">20.000 - 50.000</option>
                        <option value="Más de 50.000">Más de 50.000</option>
                        <option value="No lo sé">No lo sé</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="detalles" className="block text-sm font-semibold text-cincel-black mb-2">
                        Descripción del Proyecto
                      </label>
                      <textarea
                        id="detalles"
                        name="detalles"
                        value={formData.detalles}
                        onChange={handleChange}
                        rows={5}
                        className="input-field resize-none"
                        placeholder="Ej: Necesito construir una casa de 120 m² con 3 dormitorios, 2 baños, cocina y living. Tengo el terreno y los planos."
                      />
                      <p className="text-xs text-cincel-dark mt-1">
                        Cuéntanos más sobre tu proyecto: dimensiones, materiales, plazos, o cualquier detalle que consideres importante.
                      </p>
                    </div>
                  </div>

                  <div className="bg-cincel-lightgray p-6 rounded-lg mt-6">
                    <h3 className="font-bold text-cincel-black mb-3">Resumen de tu solicitud:</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-cincel-dark">Nombre:</dt>
                        <dd className="font-semibold text-cincel-black">{formData.nombre}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-cincel-dark">Teléfono:</dt>
                        <dd className="font-semibold text-cincel-black">{formData.telefono}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-cincel-dark">Proyecto:</dt>
                        <dd className="font-semibold text-cincel-black">{formData.tipoProyecto}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-cincel-dark">Departamento:</dt>
                        <dd className="font-semibold text-cincel-black">{formData.departamento}</dd>
                      </div>
                      {formData.ciudadZona && (
                        <div className="flex justify-between">
                          <dt className="text-cincel-dark">Ciudad/Zona:</dt>
                          <dd className="font-semibold text-cincel-black">{formData.ciudadZona}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              )}

              {/* Botones de navegación */}
              <div className="flex gap-4 pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline flex-1"
                  >
                    ← Anterior
                  </button>
                )}
                {step < totalSteps && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary flex-1"
                  >
                    Siguiente →
                  </button>
                )}
                {step === totalSteps && (
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Enviar por WhatsApp
                  </button>
                )}
              </div>

              {step === totalSteps && (
                <p className="text-sm text-cincel-dark text-center">
                  Al enviar, serás redirigido a WhatsApp con tu solicitud completa
                </p>
              )}
            </form>

            {/* Link alternativo */}
            <div className="mt-8 text-center">
              <p className="text-sm text-cincel-dark mb-2">¿Preferís el formulario completo?</p>
              <Link to="/contacto" className="link-gold font-semibold">
                Ir al formulario de contacto →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
