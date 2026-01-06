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
    title: 'Obra Nueva y Estructuras',
    shortDescription: 'Construcción integral de estructuras de hormigón para casas, piscinas y edificios.',
    fullDescription: 'Realizamos construcciones desde cero con estructuras de hormigón armado de alta calidad. Desde cimentaciones profundas hasta estructuras completas, garantizamos solidez y durabilidad en cada proyecto.',
    scope: [
      'Cimentaciones profundas y superficiales',
      'Estructuras de hormigón para casas, piscinas y edificios',
      'Plateas y losas',
      'Construcción de muros portantes',
      'Supervisión técnica y control de calidad',
      'Gestión de permisos y trámites municipales',
    ],
    targetAudience: [
      'Particulares que quieren construir su casa',
      'Inversores en desarrollo inmobiliario',
      'Proyectos de piscinas residenciales',
    ],
    ctaText: 'Solicitar presupuesto para obra nueva',
    iconType: 'hardhat',
  },
  {
    slug: 'albanileria-mamposteria',
    title: 'Albañilería y Mampostería',
    shortDescription: 'Trabajos especializados de albañilería, mampostería en yeso y revestimientos.',
    fullDescription: 'Servicio completo de albañilería general y trabajos de mampostería en yeso. Realizamos desde construcción de muros hasta revestimientos de alta calidad para interiores y exteriores.',
    scope: [
      'Albañilería general',
      'Mampostería en yeso y durlock',
      'Revestimientos cerámicos y porcelanato',
      'Revoques interiores y exteriores',
      'Contrapisos y nivelaciones',
      'Trabajos de terminación',
    ],
    targetAudience: [
      'Construcciones nuevas en etapa de terminación',
      'Reformas de espacios interiores',
      'Actualización de revestimientos',
    ],
    ctaText: 'Consultar por albañilería',
    iconType: 'ruler',
  },
  {
    slug: 'pavimentaciones-exteriores',
    title: 'Pavimentaciones y Trabajos Exteriores',
    shortDescription: 'Pavimentación de accesos, patios, cercados y trabajos en azoteas.',
    fullDescription: 'Especialistas en trabajos de pavimentación y acondicionamiento de espacios exteriores. Realizamos desde veredas y accesos vehiculares hasta impermeabilización de azoteas.',
    scope: [
      'Pavimentaciones de hormigón',
      'Accesos vehiculares',
      'Patios y veredas',
      'Cercados perimetrales',
      'Azoteas transitables',
      'Impermeabilizaciones de cubiertas',
    ],
    targetAudience: [
      'Viviendas que necesitan accesos',
      'Propiedades con espacios exteriores',
      'Edificios con problemas de filtraciones',
    ],
    ctaText: 'Solicitar presupuesto',
    iconType: 'hardhat',
  },
  {
    slug: 'instalaciones-sanitarias',
    title: 'Instalaciones Sanitarias',
    shortDescription: 'Instalación y reparación de sistemas sanitarios certificados.',
    fullDescription: 'Servicio completo de instalaciones sanitarias con profesionales capacitados. Realizamos instalaciones nuevas, reparaciones y actualización de sistemas existentes cumpliendo todas las normativas.',
    scope: [
      'Instalación de cañerías de agua',
      'Sistemas de desagües',
      'Reparación de filtraciones',
      'Actualización de instalaciones antiguas',
      'Instalación de artefactos sanitarios',
      'Certificaciones técnicas',
    ],
    targetAudience: [
      'Obras nuevas',
      'Reformas de baños y cocinas',
      'Reparaciones urgentes',
    ],
    ctaText: 'Consultar por instalaciones',
    iconType: 'wrench',
  },
  {
    slug: 'reformas-mantenimiento',
    title: 'Reformas y Mantenimiento',
    shortDescription: 'Renovación integral de espacios y mantenimiento preventivo.',
    fullDescription: 'Realizamos reformas completas o parciales de viviendas y locales comerciales. También ofrecemos servicio de mantenimiento continuo para conservar las propiedades en óptimas condiciones.',
    scope: [
      'Reformas integrales',
      'Redistribución de ambientes',
      'Renovación de baños y cocinas',
      'Ampliaciones',
      'Mantenimiento preventivo',
      'Reparaciones en general',
    ],
    targetAudience: [
      'Propietarios que quieren renovar su vivienda',
      'Locales comerciales que necesitan actualización',
      'Propiedades que requieren mantenimiento regular',
    ],
    ctaText: 'Solicitar presupuesto para reforma',
    iconType: 'hammer',
  },
  {
    slug: 'herreria-aberturas',
    title: 'Herrería y Colocación de Aberturas',
    shortDescription: 'Fabricación e instalación de rejas, portones y colocación de aberturas.',
    fullDescription: 'Servicio especializado en trabajos de herrería y carpintería metálica. Fabricamos e instalamos rejas de seguridad, portones y nos encargamos de la colocación profesional de todo tipo de aberturas.',
    scope: [
      'Rejas de seguridad',
      'Portones de acceso',
      'Colocación de puertas',
      'Colocación de ventanas',
      'Herrería a medida',
      'Ajuste y nivelación de aberturas',
    ],
    targetAudience: [
      'Obras nuevas',
      'Mejoras de seguridad',
      'Reemplazo de aberturas antiguas',
    ],
    ctaText: 'Consultar por herrería',
    iconType: 'wrench',
  },
  {
    slug: 'impermeabilizaciones',
    title: 'Impermeabilizaciones',
    shortDescription: 'Soluciones profesionales para eliminar filtraciones y humedades.',
    fullDescription: 'Especialistas en impermeabilización de cubiertas, azoteas, terrazas y medianeras. Utilizamos materiales de primera calidad con garantía para eliminar definitivamente problemas de humedad.',
    scope: [
      'Impermeabilización de azoteas',
      'Impermeabilización de terrazas',
      'Tratamiento de medianeras',
      'Sellado de juntas',
      'Sistemas de drenaje',
      'Garantía de trabajos realizados',
    ],
    targetAudience: [
      'Propiedades con filtraciones',
      'Edificios con humedades',
      'Mantenimiento preventivo de cubiertas',
    ],
    ctaText: 'Solicitar diagnóstico',
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
