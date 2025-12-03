import React, { useEffect } from 'react';

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  productData?: {
    name: string;
    image: string[];
    description: string;
    sku: string;
    price: number;
    currency: string;
    brand: string;
    availability: string;
  };
  articleData?: {
    headline: string;
    image: string[];
    datePublished: string;
    author: string;
  };
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  productData,
  articleData
}) => {
  const siteName = "Muni Moldes";
  const defaultDescription = "Catálogo digital de moldes de silicone de alta performance para artesanato e confeitaria.";
  const baseUrl = window.location.origin;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og-default.jpg`;
  
  const pageTitle = `${title} | ${siteName}`;
  const finalDescription = description || defaultDescription;

  useEffect(() => {
    // 1. Basic Meta Tags
    document.title = pageTitle;
    setMeta('description', finalDescription);

    // 2. Open Graph (Facebook, WhatsApp, LinkedIn)
    setMeta('og:site_name', siteName);
    setMeta('og:title', pageTitle);
    setMeta('og:description', finalDescription);
    setMeta('og:type', type);
    setMeta('og:url', fullUrl);
    setMeta('og:image', fullImage);
    setMeta('og:locale', 'pt_BR');

    // 3. Twitter Cards
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', finalDescription);
    setMeta('twitter:image', fullImage);

    // 4. Canonical URL
    let linkCanonical = document.querySelector("link[rel='canonical']");
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullUrl);

    // 5. Structured Data (JSON-LD) for Google Rich Snippets
    let jsonLd: StructuredData | null = null;

    if (type === 'product' && productData) {
      jsonLd = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productData.name,
        image: productData.image,
        description: productData.description,
        sku: productData.sku,
        brand: {
          '@type': 'Brand',
          name: productData.brand,
        },
        offers: {
          '@type': 'Offer',
          url: fullUrl,
          priceCurrency: productData.currency,
          price: productData.price,
          availability: productData.availability, // e.g., "https://schema.org/InStock"
          itemCondition: "https://schema.org/NewCondition"
        },
      };
    } else if (type === 'article' && articleData) {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: articleData.headline,
        image: articleData.image,
        datePublished: articleData.datePublished,
        author: [{
            '@type': 'Organization',
            name: articleData.author,
            url: baseUrl
        }]
      };
    } else {
       // Default Organization Schema
       jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Muni Moldes",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-11-99999-9999",
            "contactType": "sales",
            "areaServed": "BR",
            "availableLanguage": "Portuguese"
        }
       }
    }

    // Inject JSON-LD
    if (jsonLd) {
      let scriptTag = document.getElementById('json-ld-data');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-data';
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }

    window.scrollTo(0, 0);
  }, [title, description, image, url, type, productData, articleData, fullUrl, fullImage, pageTitle, finalDescription, baseUrl]);

  return null;
};

// Helper to safely set meta tags
function setMeta(name: string, content: string) {
  let element = document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:')) {
        element.setAttribute('property', name);
    } else {
        element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}