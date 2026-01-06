/**
 * Componente de imágenes placeholder generadas
 * Crea imágenes visuales con patrones hasta que se agreguen fotos reales
 */

interface PlaceholderImageProps {
  type: 'construction' | 'building' | 'renovation' | 'team' | 'process' | 'blueprint';
  className?: string;
  alt: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ type, className = '', alt }) => {
  const patterns = {
    construction: (
      <svg className={`w-full h-full ${className}`} viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-construction" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#c08826', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.9 }} />
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#grad-construction)"/>
        <rect width="400" height="300" fill="url(#grid)"/>
        {/* Estructura de edificio */}
        <rect x="100" y="180" width="80" height="100" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <rect x="200" y="140" width="100" height="140" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <line x1="100" y1="180" x2="180" y2="180" stroke="rgba(212,175,55,0.5)" strokeWidth="3"/>
        <line x1="200" y1="140" x2="300" y2="140" stroke="rgba(212,175,55,0.5)" strokeWidth="3"/>
        <text x="200" y="150" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="14" fontWeight="bold">
          OBRA EN CONSTRUCCIÓN
        </text>
      </svg>
    ),
    building: (
      <svg className={`w-full h-full ${className}`} viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-building" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#132531', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#c08826', stopOpacity: 0.7 }} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad-building)"/>
        {/* Edificio */}
        <rect x="150" y="100" width="100" height="180" fill="rgba(192,136,38,0.2)" stroke="rgba(192,136,38,0.6)" strokeWidth="2"/>
        {/* Ventanas */}
        {[...Array(4)].map((_, floor) => (
          <g key={floor}>
            {[...Array(3)].map((_, window) => (
              <rect 
                key={window}
                x={165 + window * 25} 
                y={120 + floor * 40} 
                width="15" 
                height="20" 
                fill="rgba(192,136,38,0.4)"
                stroke="rgba(192,136,38,0.8)"
                strokeWidth="1"
              />
            ))}
          </g>
        ))}
        <text x="200" y="50" textAnchor="middle" fill="rgba(192,136,38,1)" fontSize="16" fontWeight="bold">
          PROYECTO COMPLETADO
        </text>
      </svg>
    ),
    renovation: (
      <svg className={`w-full h-full ${className}`} viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-renovation" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#183950', stopOpacity: 0.95 }} />
            <stop offset="50%" style={{ stopColor: '#c08826', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#183950', stopOpacity: 0.95 }} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad-renovation)"/>
        {/* Herramientas */}
        <g transform="translate(150, 100)">
          <rect x="0" y="30" width="20" height="60" fill="rgba(192,136,38,0.6)" stroke="rgba(192,136,38,1)" strokeWidth="2"/>
          <rect x="-10" y="20" width="40" height="25" fill="rgba(192,136,38,0.8)" stroke="rgba(192,136,38,1)" strokeWidth="2"/>
        </g>
        <g transform="translate(230, 120) rotate(45)">
          <rect x="0" y="0" width="15" height="80" fill="rgba(192,136,38,0.6)" stroke="rgba(192,136,38,1)" strokeWidth="2"/>
          <circle cx="7.5" cy="-5" r="8" fill="rgba(192,136,38,0.8)" stroke="rgba(192,136,38,1)" strokeWidth="2"/>
        </g>
        <text x="200" y="250" textAnchor="middle" fill="rgba(192,136,38,1)" fontSize="16" fontWeight="bold">
          REFORMA EN PROCESO
        </text>
      </svg>
    ),
    team: (
      <svg className={`w-full h-full ${className}`} viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-team" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#c08826', stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: '#132531', stopOpacity: 0.9 }} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad-team)"/>
        {/* Siluetas de equipo */}
        {[100, 200, 300].map((x, i) => (
          <g key={i} transform={`translate(${x}, 120)`}>
            <circle cx="0" cy="0" r="25" fill="rgba(255,255,255,0.2)" stroke="rgba(192,136,38,0.8)" strokeWidth="2"/>
            <rect x="-20" y="30" width="40" height="60" fill="rgba(255,255,255,0.15)" stroke="rgba(192,136,38,0.6)" strokeWidth="2"/>
          </g>
        ))}
        <text x="200" y="250" textAnchor="middle" fill="rgba(192,136,38,1)" fontSize="16" fontWeight="bold">
          EQUIPO PROFESIONAL
        </text>
      </svg>
    ),
    process: (
      <svg className={`w-full h-full ${className}`} viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-process" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#342f1f', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#c08826', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad-process)"/>
        {/* Flechas de proceso */}
        <g>
          {[60, 160, 260].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy="150" r="30" fill="rgba(192,136,38,0.3)" stroke="rgba(192,136,38,1)" strokeWidth="3"/>
              <text x={x} y="157" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="20" fontWeight="bold">
                {i + 1}
              </text>
              {i < 2 && (
                <path 
                  d={`M ${x + 35} 150 L ${x + 85} 150`} 
                  stroke="rgba(192,136,38,0.8)" 
                  strokeWidth="3" 
                  markerEnd="url(#arrowhead)"
                />
              )}
            </g>
          ))}
        </g>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="rgba(192,136,38,0.8)" />
          </marker>
        </defs>
        <text x="200" y="250" textAnchor="middle" fill="rgba(192,136,38,1)" fontSize="16" fontWeight="bold">
          PROCESO ORDENADO
        </text>
      </svg>
    ),
    blueprint: (
      <svg className={`w-full h-full ${className}`} viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-blueprint" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1A3A52', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0D1F2D', stopOpacity: 1 }} />
          </linearGradient>
          <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(192,136,38,0.2)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#grad-blueprint)"/>
        <rect width="400" height="300" fill="url(#blueprint-grid)"/>
        {/* Plano */}
        <rect x="80" y="60" width="240" height="180" fill="none" stroke="rgba(192,136,38,0.8)" strokeWidth="2"/>
        <line x1="200" y1="60" x2="200" y2="240" stroke="rgba(192,136,38,0.5)" strokeWidth="1" strokeDasharray="5,5"/>
        <line x1="80" y1="150" x2="320" y2="150" stroke="rgba(192,136,38,0.5)" strokeWidth="1" strokeDasharray="5,5"/>
        <text x="200" y="270" textAnchor="middle" fill="rgba(192,136,38,1)" fontSize="14" fontWeight="bold">
          PLANIFICACIÓN DETALLADA
        </text>
      </svg>
    ),
  };

  return (
    <div className={`relative overflow-hidden bg-cincel-black ${className}`} role="img" aria-label={alt}>
      {patterns[type]}
    </div>
  );
};
