/**
 * Componente SEO - Meta tags y Schema.org
 * 
 * Componente para gestionar SEO de cada página con:
 * - Title y meta description
 * - Open Graph para redes sociales
 * - Schema.org JSON-LD
 * - Canonical URLs
 */

import { useEffect } from 'react';
import { brandConfig } from '../config/brand';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noindex?: boolean;
  schema?: Record<string, unknown>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  noindex = false,
  schema,
}) => {
  const fullTitle = `${title} | ${brandConfig.companyName}`;
  const url = canonical ? `${brandConfig.siteUrl}${canonical}` : brandConfig.siteUrl;
  const defaultOgImage = `${brandConfig.siteUrl}/og-image.jpg`; // Crear esta imagen

  useEffect(() => {
    // Actualizar title
    document.title = fullTitle;

    // Meta description
    updateMetaTag('name', 'description', description);

    // Robots
    if (noindex) {
      updateMetaTag('name', 'robots', 'noindex,nofollow');
    } else {
      updateMetaTag('name', 'robots', 'index,follow');
    }

    // Canonical
    updateLinkTag('canonical', url);

    // Open Graph
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', url);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:image', ogImage || defaultOgImage);
    updateMetaTag('property', 'og:site_name', brandConfig.companyName);

    // Twitter Card
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage || defaultOgImage);

    // Schema.org JSON-LD
    if (schema) {
      updateSchema(schema);
    }
  }, [title, description, canonical, ogType, ogImage, noindex, schema, fullTitle, url, defaultOgImage]);

  return null;
};

/**
 * Helper para actualizar meta tags
 */
const updateMetaTag = (attribute: string, key: string, content: string): void => {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

/**
 * Helper para actualizar link tags
 */
const updateLinkTag = (rel: string, href: string): void => {
  let element = document.querySelector(`link[rel="${rel}"]`);
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
};

/**
 * Helper para actualizar Schema.org JSON-LD
 */
const updateSchema = (schema: Record<string, unknown>): void => {
  const scriptId = 'schema-org';
  let element = document.getElementById(scriptId) as HTMLScriptElement | null;
  
  if (!element) {
    element = document.createElement('script');
    element.id = scriptId;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  
  element.textContent = JSON.stringify(schema);
};

/**
 * Schema.org para página de inicio (LocalBusiness)
 */
export const getHomeSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'GeneralContractor',
  name: brandConfig.companyName,
  description: brandConfig.description,
  url: brandConfig.siteUrl,
  telephone: brandConfig.phone,
  email: brandConfig.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: brandConfig.address.city,
    addressCountry: brandConfig.address.country,
  },
  areaServed: brandConfig.workZones.map(zone => ({
    '@type': 'City',
    name: zone.name,
  })),
  slogan: brandConfig.tagline,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de Construcción',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Obra Nueva',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Reformas',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Mantenimiento Edilicio',
        },
      },
    ],
  },
});

/**
 * Schema.org para página de servicio
 */
export const getServiceSchema = (serviceName: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: serviceName,
  description: description,
  provider: {
    '@type': 'GeneralContractor',
    name: brandConfig.companyName,
    url: brandConfig.siteUrl,
  },
  areaServed: brandConfig.workZones.map(zone => ({
    '@type': 'City',
    name: zone.name,
  })),
});

/**
 * Schema.org para página de proyecto
 */
export const getProjectSchema = (projectTitle: string, description: string, city: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: projectTitle,
  description: description,
  author: {
    '@type': 'GeneralContractor',
    name: brandConfig.companyName,
  },
  locationCreated: {
    '@type': 'City',
    name: city,
  },
});
