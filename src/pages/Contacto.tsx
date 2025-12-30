/**
 * Página Contacto - Formulario completo de contacto
 */

import { useState, type FormEvent } from 'react';
import { SEO } from '../components/SEO';
import { brandConfig } from '../config/brand';
import { services } from '../content/services';
import { trackContactSubmit } from '../lib/analytics';
import { generateWhatsAppLink } from '../lib/whatsapp';

export const Contacto: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    ciudad: '',
    barrio: '',
    servicio: '',
    urgencia: '',
    presupuesto: '',
    mensaje: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error al editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{8,15}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'Teléfono inválido (mínimo 8 dígitos)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.ciudad) {
      newErrors.ciudad = 'Seleccioná una ciudad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Track del envío
    trackContactSubmit({
      service: formData.servicio,
      city: formData.ciudad,
      urgency: formData.urgencia,
    });

    // Generar mensaje para WhatsApp
    const message = `
*CONSULTA WEB - CINCEL CONSTRUCCIONES*

*Nombre:* ${formData.nombre}
*Teléfono:* ${formData.telefono}
${formData.email ? `*Email:* ${formData.email}` : ''}
*Ciudad:* ${formData.ciudad}
${formData.barrio ? `*Barrio/Zona:* ${formData.barrio}` : ''}
${formData.servicio ? `*Servicio:* ${formData.servicio}` : ''}
${formData.urgencia ? `*Urgencia:* ${formData.urgencia}` : ''}
${formData.presupuesto ? `*Presupuesto estimado:* ${formData.presupuesto}` : ''}

*Mensaje:*
${formData.mensaje || 'Sin mensaje adicional'}
    `.trim();

    const link = generateWhatsAppLink(message);
    
    // Abrir WhatsApp
    window.open(link, '_blank', 'noopener,noreferrer');

    // Resetear formulario después de un breve delay
    setTimeout(() => {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        ciudad: '',
        barrio: '',
        servicio: '',
        urgencia: '',
        presupuesto: '',
        mensaje: '',
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <>
      <SEO
        title="Contacto"
        description="Contactá a Cincel Construcciones. Completá el formulario y recibí un presupuesto detallado para tu proyecto."
        canonical="/contacto"
      />

      {/* Hero */}
      <section className="bg-cincel-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-cincel-gold text-cincel-black px-6 py-2 rounded-full font-bold text-base mb-4">
              ✓ Cotización 100% Gratuita
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contacto
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Completá el formulario y recibí un presupuesto sin compromiso
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Formulario */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre */}
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

                  {/* Teléfono y Email */}
                  <div className="grid md:grid-cols-2 gap-4">
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
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-cincel-black mb-2">
                        Email (opcional)
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input-field ${errors.email ? 'input-error' : ''}`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Ciudad y Barrio */}
                  <div className="grid md:grid-cols-2 gap-4">
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
                        <option value="">Seleccioná</option>
                        <option value="Montevideo">Montevideo</option>
                        <option value="Maldonado">Maldonado</option>
                        <option value="Otra">Otra</option>
                      </select>
                      {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
                    </div>
                    <div>
                      <label htmlFor="barrio" className="block text-sm font-semibold text-cincel-black mb-2">
                        Barrio / Zona
                      </label>
                      <input
                        type="text"
                        id="barrio"
                        name="barrio"
                        value={formData.barrio}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ej: Pocitos, La Barra, etc."
                      />
                    </div>
                  </div>

                  {/* Servicio */}
                  <div>
                    <label htmlFor="servicio" className="block text-sm font-semibold text-cincel-black mb-2">
                      Tipo de Servicio
                    </label>
                    <select
                      id="servicio"
                      name="servicio"
                      value={formData.servicio}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Seleccioná un servicio</option>
                      {services.map(s => (
                        <option key={s.slug} value={s.title}>{s.title}</option>
                      ))}
                      <option value="No estoy seguro">No estoy seguro</option>
                    </select>
                  </div>

                  {/* Urgencia y Presupuesto */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="urgencia" className="block text-sm font-semibold text-cincel-black mb-2">
                        Urgencia
                      </label>
                      <select
                        id="urgencia"
                        name="urgencia"
                        value={formData.urgencia}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Seleccioná</option>
                        <option value="Urgente (menos de 1 mes)">Urgente (menos de 1 mes)</option>
                        <option value="Corto plazo (1-3 meses)">Corto plazo (1-3 meses)</option>
                        <option value="Mediano plazo (3-6 meses)">Mediano plazo (3-6 meses)</option>
                        <option value="Largo plazo (más de 6 meses)">Largo plazo (más de 6 meses)</option>
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
                        <option value="No lo sé aún">No lo sé aún</option>
                      </select>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-semibold text-cincel-black mb-2">
                      Mensaje / Descripción del Proyecto
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={5}
                      className="input-field resize-none"
                      placeholder="Contanos brevemente sobre tu proyecto..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full text-lg"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Consulta por WhatsApp'}
                  </button>

                  <p className="text-sm text-cincel-gray text-center">
                    Al enviar, serás redirigido a WhatsApp con tu consulta completa
                  </p>
                </form>
              </div>

              {/* Info de contacto */}
              <div className="md:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <div className="card p-6">
                    <h3 className="font-bold text-cincel-black mb-4">Información de Contacto</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-cincel-gray mb-1">WhatsApp</p>
                        <a href={`https://wa.me/${brandConfig.whatsappNumber}`} className="link-gold font-semibold">
                          {brandConfig.whatsappNumberDisplay}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-cincel-gray mb-1">Email</p>
                        <a href={`mailto:${brandConfig.email}`} className="link-gold font-semibold">
                          {brandConfig.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-cincel-gray mb-2">Horarios</p>
                        <p className="text-xs text-cincel-black">{brandConfig.businessHours.weekdays}</p>
                        <p className="text-xs text-cincel-black">{brandConfig.businessHours.saturday}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cincel-lightgray p-6 rounded-lg">
                    <h4 className="font-bold text-cincel-black mb-3">📋 Respuesta en 48hs</h4>
                    <p className="text-sm text-cincel-gray">
                      Respondemos todas las consultas en menos de 48 horas hábiles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
