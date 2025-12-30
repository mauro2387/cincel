/**
 * ScrollToTop - Scroll automático al cambiar de página
 * 
 * Componente que asegura que al navegar a una nueva página,
 * el scroll siempre comience desde arriba.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      // Si hay hash, hacer scroll al elemento
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }, [pathname, hash]);

  return null;
};
