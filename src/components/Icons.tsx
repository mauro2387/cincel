/**
 * Iconos SVG personalizados - CINCEL CONSTRUCCIONES
 * Todos los iconos usan el color dorado corporativo por defecto
 */

interface IconProps {
  className?: string;
  size?: number;
}

export const HammerIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M13.5 3L4 12.5L7.5 16L17 6.5L13.5 3Z" 
      fill="currentColor" 
      opacity="0.3"
    />
    <path 
      d="M20.49 8.51L15.49 3.51C15.11 3.13 14.49 3.13 14.11 3.51L12.7 4.92L17.08 9.3L18.49 7.89C19.26 7.12 20.49 8.51 20.49 8.51Z" 
      fill="currentColor"
    />
    <path 
      d="M3.51 12.49L8.51 17.49C8.89 17.87 9.51 17.87 9.89 17.49L11.3 16.08L6.92 11.7L5.51 13.11C4.74 13.88 3.51 12.49 3.51 12.49Z" 
      fill="currentColor"
    />
    <rect x="11" y="11" width="10" height="3" rx="1.5" transform="rotate(45 11 11)" fill="currentColor"/>
  </svg>
);

export const BlueprintIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M7 7H17M7 11H14M7 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.3"/>
  </svg>
);

export const WrenchIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 0.6 4.7 1.7L9 6L6 9L1.6 4.7C0.4 7.1 0.9 10.1 2.9 12.1C4.8 14 7.5 14.5 9.8 13.6L18.9 22.7C19.3 23.1 19.9 23.1 20.3 22.7L22.6 20.4C23.1 20 23.1 19.3 22.7 19Z" 
      fill="currentColor"
    />
  </svg>
);

export const HardHatIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 3C7.58 3 4 6.58 4 11V14H20V11C20 6.58 16.42 3 12 3Z" 
      fill="currentColor" 
      opacity="0.3"
    />
    <rect x="2" y="14" width="20" height="4" rx="1" fill="currentColor"/>
    <rect x="11" y="3" width="2" height="4" fill="currentColor"/>
  </svg>
);

export const PaintBrushIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M18 2C17.45 2 17 2.45 17 3V7C17 7.55 17.45 8 18 8C18.55 8 19 7.55 19 7V3C19 2.45 18.55 2 18 2Z" 
      fill="currentColor"
    />
    <path 
      d="M20 7H16C15.45 7 15 7.45 15 8V10C15 10.55 14.55 11 14 11H10C8.9 11 8 11.9 8 13V16C8 17.66 6.66 19 5 19C3.34 19 2 17.66 2 16V15C2 14.45 1.55 14 1 14C0.45 14 0 14.45 0 15V16C0 18.76 2.24 21 5 21C7.76 21 10 18.76 10 16V13H14C15.66 13 17 11.66 17 10V9H20C20.55 9 21 8.55 21 8C21 7.45 20.55 7 20 7Z" 
      fill="currentColor"
    />
  </svg>
);

export const RulerIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect 
      x="3" 
      y="6" 
      width="18" 
      height="12" 
      rx="2" 
      fill="currentColor" 
      opacity="0.3"
    />
    <line x1="6" y1="12" x2="6" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="9" y1="12" x2="9" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="15" y1="12" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="12" x2="18" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const CheckShieldIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 2L4 6V11C4 16.55 7.84 21.74 13 23C18.16 21.74 22 16.55 22 11V6L12 2Z" 
      fill="currentColor" 
      opacity="0.3"
    />
    <path 
      d="M10 14.17L7.83 12L7.12 12.71L10 15.59L16.88 8.71L16.17 8L10 14.17Z" 
      fill="currentColor"
    />
  </svg>
);

export const ClockIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3"/>
    <path 
      d="M12 6V12L16 14" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const DocumentIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z" 
      fill="currentColor" 
      opacity="0.3"
    />
    <path d="M8 12H16M8 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 2V8H20" fill="currentColor"/>
  </svg>
);

export const HandshakeIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M8.5 4C7.67 4 7 4.67 7 5.5V8H2V20H9L11 18L13 20H22V8H17V5.5C17 4.67 16.33 4 15.5 4H8.5Z" 
      fill="currentColor" 
      opacity="0.3"
    />
    <path 
      d="M11 10L8 13L10 15L13 12L11 10Z" 
      fill="currentColor"
    />
  </svg>
);

export const CameraIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="6" width="20" height="14" rx="2" fill="currentColor" opacity="0.3"/>
    <circle cx="12" cy="13" r="3" fill="currentColor"/>
    <path d="M9 6L10 4H14L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const TeamIcon = ({ className = '', size = 48 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="8" r="3" fill="currentColor" opacity="0.5"/>
    <circle cx="6" cy="10" r="2" fill="currentColor" opacity="0.3"/>
    <circle cx="18" cy="10" r="2" fill="currentColor" opacity="0.3"/>
    <path 
      d="M12 13C9.33 13 4 14.34 4 17V19H20V17C20 14.34 14.67 13 12 13Z" 
      fill="currentColor"
    />
  </svg>
);
