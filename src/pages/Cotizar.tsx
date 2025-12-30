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
    ciudad: '',
    urgencia: '',
    presupuesto: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (currentStep === 3 && !formData.ciudad) {
      newErrors.ciudad = 'Seleccioná una ciudad';
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

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
*Ciudad:* ${formData.ciudad}
*Urgencia:* ${formData.urgencia || 'No especificada'}
*Presupuesto Estimado:* ${formData.presupuesto || 'No especificado'}

Solicito cotización para este proyecto.
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
            <div className="inline-block bg-cincel-gold text-cincel-black px-6 py-2 rounded-full font-bold text-base mb-4">
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
                <span className="text-sm font-medium text-cincel-gray">
                  Paso {step} de {totalSteps}
                </span>
                <span className="text-sm font-medium text-cincel-gold">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-cincel-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                            ? 'border-cincel-gold bg-gold-50'
                            : 'border-gray-200 hover:border-cincel-gold'
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
                          <p className="text-sm text-cincel-gray">{service.shortDescription}</p>
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
                  <div>
                    <label htmlFor="ciudad" className="block text-sm font-semibold text-cincel-black mb-2">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      className={`input-field ${errors.ciudad ? 'input-error' : ''}`}
                    >
                      <option value="">Seleccioná una ciudad</option>
                      <option value="Montevideo">Montevideo</option>
                      <option value="Maldonado">Maldonado (Punta del Este, La Barra, etc.)</option>
                      <option value="Otra">Otra (consultar disponibilidad)</option>
                    </select>
                    {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
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
                        <option value="Menos de 5.000">Menos de 5.000</option>
                        <option value="5.000 - 15.000">5.000 - 15.000</option>
                        <option value="15.000 - 30.000">15.000 - 30.000</option>
                        <option value="30.000 - 50.000">30.000 - 50.000</option>
                        <option value="Más de 50.000">Más de 50.000</option>
                        <option value="No lo sé">No lo sé</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-cincel-lightgray p-6 rounded-lg mt-6">
                    <h3 className="font-bold text-cincel-black mb-3">Resumen de tu solicitud:</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-cincel-gray">Nombre:</dt>
                        <dd className="font-semibold text-cincel-black">{formData.nombre}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-cincel-gray">Teléfono:</dt>
                        <dd className="font-semibold text-cincel-black">{formData.telefono}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-cincel-gray">Proyecto:</dt>
                        <dd className="font-semibold text-cincel-black">{formData.tipoProyecto}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-cincel-gray">Ciudad:</dt>
                        <dd className="font-semibold text-cincel-black">{formData.ciudad}</dd>
                      </div>
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
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary flex-1"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Enviar por WhatsApp
                  </button>
                )}
              </div>

              {step === totalSteps && (
                <p className="text-sm text-cincel-gray text-center">
                  Al enviar, serás redirigido a WhatsApp con tu solicitud completa
                </p>
              )}
            </form>

            {/* Link alternativo */}
            <div className="mt-8 text-center">
              <p className="text-sm text-cincel-gray mb-2">¿Preferís el formulario completo?</p>
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
