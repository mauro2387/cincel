/**
 * Datos de ubicaciones de Uruguay
 * Departamentos y sus ciudades/zonas principales
 */

export const departamentosUruguay = {
  'Montevideo': [
    'Pocitos',
    'Carrasco',
    'Punta Carretas',
    'Centro',
    'Ciudad Vieja',
    'Malvín',
    'Buceo',
    'Cordón',
    'Parque Rodó',
    'Tres Cruces',
    'La Blanqueada',
    'Punta Gorda',
    'Parque Batlle',
    'Aguada',
    'Cerro',
    'La Teja',
    'Sayago',
    'Paso de la Arena',
    'Colón',
    'Maroñas'
  ],
  'Canelones': [
    'Ciudad de la Costa',
    'Las Piedras',
    'Pando',
    'Canelones (Ciudad)',
    'Santa Lucía',
    'Paso Carrasco',
    'La Paz',
    'Progreso',
    'Atlántida',
    'Parque del Plata',
    'Salinas',
    'Solymar',
    'Shangrilá',
    'San José de Carrasco'
  ],
  'Maldonado': [
    'Punta del Este',
    'Maldonado (Ciudad)',
    'San Carlos',
    'Piriápolis',
    'La Barra',
    'José Ignacio',
    'Manantiales',
    'Playa Verde',
    'Ocean Park',
    'Pinares',
    'Solanas',
    'Bella Vista'
  ],
  'Colonia': [
    'Colonia del Sacramento',
    'Carmelo',
    'Nueva Helvecia',
    'Juan Lacaze',
    'Rosario',
    'Tarariras',
    'Ombúes de Lavalle'
  ],
  'Salto': [
    'Salto (Ciudad)',
    'Termas del Arapey',
    'Belén',
    'Constitución'
  ],
  'Paysandú': [
    'Paysandú (Ciudad)',
    'Guichón',
    'Quebracho',
    'Termas de Almirón'
  ],
  'Rivera': [
    'Rivera (Ciudad)',
    'Tranqueras',
    'Vichadero',
    'Minas de Corrales'
  ],
  'Rocha': [
    'Rocha (Ciudad)',
    'La Paloma',
    'La Pedrera',
    'Chuy',
    'Castillos',
    'Cabo Polonio',
    'Punta del Diablo',
    'Valizas',
    'Barra de Valizas',
    'Aguas Dulces'
  ],
  'San José': [
    'San José de Mayo',
    'Ciudad del Plata',
    'Libertad',
    'Ecilda Paullier',
    'Rafael Perazza',
    'Rodríguez'
  ],
  'Artigas': [
    'Artigas (Ciudad)',
    'Bella Unión',
    'Tomás Gomensoro'
  ],
  'Cerro Largo': [
    'Melo',
    'Río Branco',
    'Fraile Muerto',
    'Isidoro Noblía'
  ],
  'Durazno': [
    'Durazno (Ciudad)',
    'Sarandí del Yí',
    'Villa del Carmen'
  ],
  'Flores': [
    'Trinidad',
    'Ismael Cortinas'
  ],
  'Florida': [
    'Florida (Ciudad)',
    'Sarandí Grande',
    'Fray Marcos',
    'Casupá'
  ],
  'Lavalleja': [
    'Minas',
    'José Pedro Varela',
    'Solís de Mataojo'
  ],
  'Río Negro': [
    'Fray Bentos',
    'Young',
    'San Javier',
    'Nuevo Berlín'
  ],
  'Soriano': [
    'Mercedes',
    'Dolores',
    'Cardona',
    'Palmitas'
  ],
  'Tacuarembó': [
    'Tacuarembó (Ciudad)',
    'Paso de los Toros',
    'San Gregorio de Polanco',
    'Ansina'
  ],
  'Treinta y Tres': [
    'Treinta y Tres (Ciudad)',
    'Vergara',
    'Santa Clara de Olimar'
  ]
};

export const getDepartamentos = (): string[] => {
  return Object.keys(departamentosUruguay).sort();
};

export const getCiudadesByDepartamento = (departamento: string): string[] => {
  return departamentosUruguay[departamento as keyof typeof departamentosUruguay] || [];
};
