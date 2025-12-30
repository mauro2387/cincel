/**
 * Contenido de Servicios - CINCEL CONSTRUCCIONES
 * 
 * Estructura editable de todos los servicios ofrecidos.
 * Para agregar un servicio nuevo, copiar el formato y agregar al array.
 */

export interface Service {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  scope: string[];
  targetAudience: string[];
  ctaText: string;
  iconType: 'hammer' | 'wrench' | 'hardhat' | 'blueprint' | 'ruler' | 'paintbrush';
}

export const services: Service[] = [
  {
    slug: 'obra-nueva',
    title: 'Obra Nueva',
    shortDescription: 'Construcción integral de viviendas y locales comerciales desde cero.',
    fullDescription: 'Nos encargamos de todo el proceso de construcción de obra nueva, desde el proyecto inicial hasta la entrega de llaves. Coordinamos arquitectos, ingenieros y todos los oficios necesarios para cumplir con plazos y presupuestos acordados.',
    scope: [
      'Gestión de permisos y trámites municipales',
      'Coordinación de proyecto arquitectónico y estructural',
      'Construcción de estructura (cimientos, muros, losas)',
      'Instalaciones (electricidad, agua, saneamiento, gas)',
      'Terminaciones completas (pisos, revestimientos, pintura)',
      'Supervisión y control de calidad permanente',
    ],
    targetAudience: [
      'Particulares que quieren construir su casa',
      'Inversores en desarrollo inmobiliario',
      'Empresas que necesitan locales comerciales',
    ],
    ctaText: 'Solicitar presupuesto para obra nueva',
    iconType: 'hardhat',
  },
  {
    slug: 'reformas',
    title: 'Reformas',
    shortDescription: 'Renovación y ampliación de espacios residenciales y comerciales.',
    fullDescription: 'Transformamos espacios existentes adaptándolos a nuevas necesidades. Realizamos reformas parciales o integrales con planificación detallada para minimizar molestias y cumplir tiempos de entrega.',
    scope: [
      'Demoliciones controladas y retiro de escombros',
      'Redistribución de ambientes',
      'Renovación de baños y cocinas',
      'Ampliaciones horizontales y verticales',
      'Actualización de instalaciones',
      'Terminaciones y detalles de calidad',
    ],
    targetAudience: [
      'Propietarios que quieren renovar su vivienda',
      'Locales comerciales que necesitan actualización',
      'Edificios que requieren modernización de unidades',
    ],
    ctaText: 'Consultar por reforma',
    iconType: 'hammer',
  },
  {
    slug: 'mantenimiento-edilicio',
    title: 'Mantenimiento Edilicio',
    shortDescription: 'Mantenimiento preventivo y correctivo para propiedades residenciales y comerciales.',
    fullDescription: 'Servicio de mantenimiento continuo o puntual para conservar las propiedades en óptimas condiciones. Atendemos urgencias y realizamos tareas programadas de prevención.',
    scope: [
      'Reparación de humedades y filtraciones',
      'Mantenimiento de fachadas y medianeras',
      'Reparación de cubiertas y azoteas',
      'Trabajos de albañilería menor',
      'Pintura y mantenimiento general',
      'Atención de urgencias',
    ],
    targetAudience: [
      'Propietarios de viviendas',
      'Administradores de edificios',
      'Empresas con locales comerciales',
      'Propiedades de alquiler',
    ],
    ctaText: 'Contratar mantenimiento',
    iconType: 'wrench',
  },
  {
    slug: 'direccion-gestion-obra',
    title: 'Dirección y Gestión de Obra',
    shortDescription: 'Supervisión técnica y administrativa de proyectos de construcción.',
    fullDescription: 'Nos encargamos de coordinar y supervisar todas las etapas de la obra, aunque no ejecutemos directamente. Ideal para clientes que ya tienen proyecto y necesitan control profesional.',
    scope: [
      'Planificación y cronograma de obra',
      'Coordinación de contratistas y proveedores',
      'Control de calidad de materiales y ejecución',
      'Seguimiento de presupuesto y pagos',
      'Gestión de permisos y habilitaciones',
      'Informes periódicos al cliente',
    ],
    targetAudience: [
      'Clientes con proyecto propio',
      'Inversores que necesitan control',
      'Obras que requieren supervisión técnica',
    ],
    ctaText: 'Consultar por dirección de obra',
    iconType: 'blueprint',
  },
  {
    slug: 'albanileria-instalaciones',
    title: 'Albañilería e Instalaciones',
    shortDescription: 'Trabajos especializados de albañilería y actualización de instalaciones.',
    fullDescription: 'Ejecución de trabajos específicos de albañilería y actualización o reparación de instalaciones sanitarias, eléctricas y de gas, con profesionales matriculados.',
    scope: [
      'Construcción y reparación de muros',
      'Contrapisos y nivelaciones',
      'Instalaciones sanitarias (agua, desagües)',
      'Instalaciones eléctricas certificadas',
      'Instalaciones de gas con matriculado',
      'Certificaciones y trámites ante organismos',
    ],
    targetAudience: [
      'Propiedades que necesitan trabajos puntuales',
      'Actualización por normativa',
      'Reparaciones urgentes de instalaciones',
    ],
    ctaText: 'Solicitar presupuesto',
    iconType: 'ruler',
  },
  {
    slug: 'terminaciones-detalles',
    title: 'Terminaciones y Detalles',
    shortDescription: 'Acabados finales y detalles de calidad para dar valor a tu propiedad.',
    fullDescription: 'Nos especializamos en las terminaciones que marcan la diferencia: desde la colocación perfecta de revestimientos hasta los detalles de pintura y carpintería que valorizan cada espacio.',
    scope: [
      'Colocación de pisos (cerámicos, porcelanatos, maderas)',
      'Revestimientos de paredes',
      'Pintura interior y exterior',
      'Instalación de aberturas',
      'Carpintería a medida',
      'Detalles en durlock y molduras',
    ],
    targetAudience: [
      'Obras en etapa final',
      'Renovación de terminaciones antiguas',
      'Mejora de valor de propiedad para venta o alquiler',
    ],
    ctaText: 'Consultar por terminaciones',
    iconType: 'paintbrush',
  },
];

/**
 * Función helper para obtener un servicio por su slug
 */
export const getServiceBySlug = (slug: string): Service | undefined => {
  return services.find(service => service.slug === slug);
};

/**
 * Función helper para obtener todos los slugs (útil para routing)
 */
export const getAllServiceSlugs = (): string[] => {
  return services.map(service => service.slug);
};
