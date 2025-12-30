/**
 * Sistema de Analítica - CINCEL CONSTRUCCIONES
 * 
 * Sistema preparado para tracking de eventos importantes.
 * Actualmente registra en consola (desarrollo).
 * 
 * Para producción: integrar con Google Analytics, Meta Pixel, etc.
 * Sin dependencias externas por ahora.
 */

export type EventName =
  | 'click_whatsapp'
  | 'submit_contact'
  | 'submit_quote'
  | 'click_service'
  | 'click_project'
  | 'view_page'
  | 'click_cta'
  | 'click_phone'
  | 'click_email';

export interface EventPayload {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Función principal de tracking
 * @param eventName - Nombre del evento a trackear
 * @param payload - Datos adicionales del evento
 */
export const track = (eventName: EventName, payload?: EventPayload): void => {
  // En desarrollo: log a consola
  if (import.meta.env.DEV) {
    console.log(`📊 Analytics Event: ${eventName}`, payload);
  }

  // TODO: Integrar con servicios reales cuando estén configurados
  // Ejemplos:
  
  // Google Analytics 4
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', eventName, payload);
  // }

  // Meta Pixel
  // if (typeof fbq !== 'undefined') {
  //   fbq('track', eventName, payload);
  // }

  // También puedes enviar a tu propio backend
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify({ event: eventName, data: payload }),
  // });
};

/**
 * Tracking específico para clics en WhatsApp
 */
export const trackWhatsAppClick = (source: string, serviceName?: string): void => {
  track('click_whatsapp', {
    source,
    service: serviceName,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Tracking para envío de formulario de contacto
 */
export const trackContactSubmit = (data: {
  service?: string;
  city?: string;
  urgency?: string;
}): void => {
  track('submit_contact', {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Tracking para envío de cotización
 */
export const trackQuoteSubmit = (data: {
  serviceType?: string;
  estimatedBudget?: string;
  urgency?: string;
}): void => {
  track('submit_quote', {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Tracking para clic en servicio
 */
export const trackServiceClick = (serviceSlug: string, serviceName: string): void => {
  track('click_service', {
    slug: serviceSlug,
    name: serviceName,
  });
};

/**
 * Tracking para clic en proyecto
 */
export const trackProjectClick = (projectSlug: string, projectTitle: string): void => {
  track('click_project', {
    slug: projectSlug,
    title: projectTitle,
  });
};

/**
 * Tracking para vista de página
 */
export const trackPageView = (pagePath: string, pageTitle: string): void => {
  track('view_page', {
    path: pagePath,
    title: pageTitle,
  });
};

/**
 * Tracking para clics en CTAs generales
 */
export const trackCTAClick = (ctaText: string, location: string): void => {
  track('click_cta', {
    text: ctaText,
    location,
  });
};
