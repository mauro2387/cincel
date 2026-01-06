/**
 * Configuración central de marca - CINCEL CONSTRUCCIONES
 * 
 * Este archivo centraliza toda la información de la empresa.
 * Cualquier cambio aquí se refleja automáticamente en toda la web.
 */

export const brandConfig = {
  // Información básica
  companyName: 'CINCEL CONSTRUCCIONES',
  tagline: 'Cimentamos tu futuro',
  legalName: 'Cincel Construcciones',
  
  // Colores corporativos
  colors: {
    primary: '#c08826',    // Dorado corporativo - color principal
    dark: '#373535',       // Gris oscuro
    blue: '#183950',       // Azul oscuro
    brown: '#342f1f',      // Marrón oscuro
    navy: '#132531',       // Azul marino
    gold: '#5a4e24',       // Dorado/marrón
    black: '#000000',      // Negro
    white: '#ffffff',      // Blanco
  },
  
  // Contacto
  whatsappNumber: '59894741808', // Formato: código país + número (sin espacios ni guiones)
  whatsappNumberDisplay: '+598 94 741 808', // Formato para mostrar
  email: 'contacto@cincelconstrucciones.com',
  phone: '+598 94 741 808',
  
  // Ubicación y zonas de trabajo
  address: {
    street: '',
    city: 'Montevideo',
    country: 'Uruguay',
  },
  
  // Cobertura nacional con énfasis en Montevideo y Maldonado
  workZones: [
    {
      id: 'montevideo',
      name: 'Montevideo',
      description: 'Atendemos todas las zonas de Montevideo y área metropolitana con presencia permanente',
    },
    {
      id: 'maldonado',
      name: 'Maldonado',
      description: 'Servicios en Punta del Este, Maldonado y toda la zona costera',
    },
    {
      id: 'nacional',
      name: 'Todo el País',
      description: 'Realizamos proyectos en todo Uruguay. Consulte disponibilidad para su zona.',
    },
  ],
  
  // Valores de la empresa - Los principios que guían cada obra que realizamos
  values: [
    {
      id: 'profesionalismo',
      title: 'Profesionalismo',
      description: 'Trabajamos con planificación, criterio técnico y responsabilidad en cada proyecto.',
    },
    {
      id: 'cumplimiento',
      title: 'Cumplimiento',
      description: 'Respetamos plazos, acuerdos y compromisos. Nuestra palabra tiene valor.',
    },
    {
      id: 'calidad',
      title: 'Calidad constructiva',
      description: 'Priorizamos buena ejecución, materiales adecuados y terminaciones prolijas.',
    },
    {
      id: 'transparencia',
      title: 'Transparencia',
      description: 'Comunicación clara y honesta durante todo el proceso de obra.',
    },
    {
      id: 'experiencia',
      title: 'Experiencia',
      description: 'Aplicamos años de trayectoria para anticipar problemas y ofrecer soluciones eficientes.',
    },
    {
      id: 'confianza',
      title: 'Confianza',
      description: 'Construimos relaciones basadas en hechos, resultados y satisfacción real.',
    },
  ],
  
  // Redes sociales (agregar cuando estén disponibles)
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },
  
  // Horarios de atención
  businessHours: {
    weekdays: 'Lunes a Viernes: 9:00 - 18:00',
    saturday: 'Sábados: 9:00 - 13:00',
    sunday: 'Domingos: Cerrado',
  },
  
  // Mensajes base para WhatsApp
  whatsappMessages: {
    general: (name: string = '') => 
      `Hola${name ? ' ' + name : ''}, quisiera más información sobre los servicios de Cincel Construcciones.`,
    
    service: (serviceName: string, name: string = '') => 
      `Hola${name ? ' ' + name : ''}, estoy interesado en el servicio de ${serviceName}. Me gustaría recibir más información.`,
    
    quote: (formData: Record<string, string>) => {
      let message = `Hola, solicito una cotización:\n\n`;
      Object.entries(formData).forEach(([key, value]) => {
        if (value) message += `${key}: ${value}\n`;
      });
      return message;
    },
    
    project: (projectName: string) => 
      `Hola, vi el proyecto "${projectName}" y me gustaría más información sobre trabajos similares.`,
  },
  
  // URLs útiles (para sitemap y SEO)
  siteUrl: 'https://cincelconstrucciones.com.uy', // Cambiar cuando tengas dominio real
  
  // SEO - Keywords principales
  keywords: [
    'constructora montevideo',
    'constructora maldonado',
    'construcción uruguay',
    'obra nueva uruguay',
    'reformas montevideo',
    'mantenimiento edilicio',
    'albañilería montevideo',
    'construcción punta del este',
    'constructora confiable uruguay',
    'presupuesto construcción gratis',
  ],
  
  // Descripción general del negocio (para SEO)
  description: 'Cincel Construcciones ofrece servicios profesionales de construcción, reformas y mantenimiento edilicio en todo Uruguay, con énfasis en Montevideo y Maldonado. Cotización gratuita, presupuestos claros y cumplimiento garantizado.',
} as const;

export type WorkZone = typeof brandConfig.workZones[number];
