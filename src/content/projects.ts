/**
 * Contenido de Proyectos/Obras - CINCEL CONSTRUCCIONES
 * 
 * Portfolio de proyectos realizados.
 * NO incluye fotos falsas - preparado para cargar imágenes reales.
 * Para agregar un proyecto, copiar el formato y agregar al array.
 */

export interface Project {
  slug: string;
  title: string;
  type: 'obra-nueva' | 'reforma' | 'mantenimiento' | 'comercial';
  city: 'Montevideo' | 'Maldonado';
  neighborhood?: string;
  year?: number;
  shortDescription: string;
  fullDescription: string;
  workDone: string[];
  duration?: string;
  surface?: string;
  image?: string; // Path a imagen real cuando esté disponible
  featured: boolean; // Si se destaca en home
}

export const projects: Project[] = [
  {
    slug: 'casa-familiar-carrasco',
    title: 'Casa Familiar en Carrasco',
    type: 'obra-nueva',
    city: 'Montevideo',
    neighborhood: 'Carrasco',
    shortDescription: 'Construcción de vivienda unifamiliar de dos plantas con terminaciones de primera calidad.',
    fullDescription: 'Obra nueva de vivienda familiar en zona residencial. Coordinación integral desde proyecto hasta entrega de llaves, cumpliendo plazos acordados y presupuesto inicial.',
    workDone: [
      'Construcción de estructura completa en hormigón armado',
      'Instalaciones sanitarias, eléctricas y de gas certificadas',
      'Carpintería de aluminio con DVH',
      'Pisos porcelanato y cerámicos de primera línea',
      'Pintura interior y exterior',
      'Paisajismo y veredas perimetrales',
    ],
    duration: '12 meses',
    surface: '180 m²',
    featured: true,
    image: '', // Dejar vacío hasta tener foto real
  },
  {
    slug: 'reforma-apartamento-pocitos',
    title: 'Reforma Integral Apartamento en Pocitos',
    type: 'reforma',
    city: 'Montevideo',
    neighborhood: 'Pocitos',
    shortDescription: 'Renovación completa de apartamento de 3 dormitorios con redistribución de ambientes.',
    fullDescription: 'Reforma integral que incluyó demolición de tabiques, nueva distribución, actualización total de instalaciones y terminaciones modernas manteniendo el presupuesto acordado.',
    workDone: [
      'Demolición controlada y retiro de escombros',
      'Nueva distribución de ambientes',
      'Renovación completa de baño y cocina',
      'Actualización de instalaciones eléctricas',
      'Instalación de aire acondicionado',
      'Pisos de madera en dormitorios',
      'Pintura y terminaciones completas',
    ],
    duration: '3 meses',
    surface: '95 m²',
    featured: true,
    image: '',
  },
  {
    slug: 'local-comercial-centro',
    title: 'Acondicionamiento Local Comercial Centro',
    type: 'comercial',
    city: 'Montevideo',
    neighborhood: 'Centro',
    shortDescription: 'Adaptación de local para oficinas con intervención en instalaciones y terminaciones.',
    fullDescription: 'Proyecto comercial que requería cumplir normativa específica y plazos ajustados. Obra ejecutada en horarios coordinados para no interferir con locales contiguos.',
    workDone: [
      'Adecuación sanitaria según normativa comercial',
      'Instalación eléctrica reforzada para equipamiento',
      'Divisiones internas en durlock',
      'Cielorrasos con iluminación LED empotrada',
      'Pisos flotantes vinílicos',
      'Pintura y señalética',
    ],
    duration: '6 semanas',
    surface: '120 m²',
    featured: false,
    image: '',
  },
  {
    slug: 'casa-playa-punta-del-este',
    title: 'Casa de Playa Punta del Este',
    type: 'obra-nueva',
    city: 'Maldonado',
    neighborhood: 'Punta del Este',
    shortDescription: 'Construcción de casa de veraneo con diseño moderno y materiales resistentes a ambiente costero.',
    fullDescription: 'Obra nueva en zona costera con especial atención a materiales y terminaciones aptas para la humedad y salitre. Coordinación con arquitecto del cliente para cumplir diseño específico.',
    workDone: [
      'Cimientos reforzados para terreno arenoso',
      'Estructura de hormigón con tratamientos especiales',
      'Carpintería de PVC apta para zona costera',
      'Instalaciones con materiales resistentes a corrosión',
      'Deck exterior en madera tratada',
      'Terminaciones exteriores con productos marítimos',
    ],
    duration: '10 meses',
    surface: '150 m²',
    featured: true,
    image: '',
  },
  {
    slug: 'mantenimiento-edificio-buceo',
    title: 'Mantenimiento Preventivo Edificio en Buceo',
    type: 'mantenimiento',
    city: 'Montevideo',
    neighborhood: 'Buceo',
    shortDescription: 'Contrato de mantenimiento anual con trabajos preventivos y correctivos programados.',
    fullDescription: 'Servicio de mantenimiento continuo para edificio residencial de 12 unidades. Incluye revisiones programadas y atención de urgencias reportadas por administración.',
    workDone: [
      'Impermeabilización de azotea',
      'Reparación de fisuras en fachada',
      'Mantenimiento de instalaciones comunes',
      'Pintura de áreas comunes',
      'Reparación de humedades en unidades',
      'Mantenimiento de sistema de desagües',
    ],
    duration: 'Contrato anual',
    featured: false,
    image: '',
  },
  {
    slug: 'ampliacion-casa-malvin',
    title: 'Ampliación de Vivienda en Malvín',
    type: 'reforma',
    city: 'Montevideo',
    neighborhood: 'Malvín',
    shortDescription: 'Ampliación de segundo piso y renovación de planta baja en vivienda existente.',
    fullDescription: 'Proyecto de ampliación vertical coordinando con estudio estructural. Obra ejecutada sin que la familia tuviera que mudarse, organizando etapas por sectores.',
    workDone: [
      'Refuerzo estructural de planta baja',
      'Construcción de segunda planta completa',
      'Nueva escalera interior',
      'Ampliación de instalaciones a segunda planta',
      'Renovación de baño en planta baja',
      'Terminaciones completas en ambas plantas',
    ],
    duration: '8 meses',
    surface: '70 m² (ampliación)',
    featured: false,
    image: '',
  },
];

/**
 * Función helper para obtener un proyecto por su slug
 */
export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find(project => project.slug === slug);
};

/**
 * Función helper para obtener proyectos destacados
 */
export const getFeaturedProjects = (): Project[] => {
  return projects.filter(project => project.featured);
};

/**
 * Función helper para obtener proyectos por ciudad
 */
export const getProjectsByCity = (city: 'Montevideo' | 'Maldonado'): Project[] => {
  return projects.filter(project => project.city === city);
};

/**
 * Función helper para obtener proyectos por tipo
 */
export const getProjectsByType = (type: Project['type']): Project[] => {
  return projects.filter(project => project.type === type);
};

/**
 * Función helper para obtener todos los slugs
 */
export const getAllProjectSlugs = (): string[] => {
  return projects.map(project => project.slug);
};
