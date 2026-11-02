import { config, whatsappHref } from './index';
import { NOMBRE_COMERCIAL, URL_POR_DEFECTO, VERSIONES } from './comun';
import { categoriasServicio, serviceOptions } from '../data/servicios';

/** Imagen para compartir (1200x630); la misma en ambos países. */
export const OG_IMAGEN = { ruta: '/og-sidt.jpg', ancho: 1200, alto: 630, alt: 'SIDT: logo y estudiante que señala hacia el formulario de cotización' };

export const origen = `https://${config.dominio}`;
export const urlInicio = `${origen}/`;
export const razonCompleta = `Servicios Integrales de ${config.razonSocial}`;
export const telefonoWhatsapp = `+${config.whatsapp.numero}`;

/** Alternativas de idioma/país; x-default apunta a la raíz. */
export const alternativas = [
  ...VERSIONES.map((v) => ({ hreflang: v.idioma, href: v.url })),
  { hreflang: 'x-default', href: URL_POR_DEFECTO },
];

/**
 * JSON-LD de la portada. Solo datos que ya están en la página: no hay reseñas, puntuaciones,
 * direcciones, horarios ni preguntas frecuentes. Las sucursales no se incluyen sin datos.
 */
export function grafoPortada() {
  const idOrg = `${origen}/#organizacion`;
  const idSitio = `${origen}/#sitio`;
  const idPagina = `${origen}/#pagina`;
  const pais = { '@type': 'Country', name: config.nombrePais };
  const categorias = Object.fromEntries(categoriasServicio.map((c) => [c.clave, c.nombre]));

  const servicios = Object.entries(serviceOptions).flatMap(([clave, lista]) =>
    lista.map((s) => ({
      '@type': 'Service',
      '@id': `${origen}/#servicio-${s.value}`,
      name: `${s.label} (${categorias[clave]})`,
      serviceType: s.label,
      category: categorias[clave],
      provider: { '@id': idOrg },
      areaServed: pais,
      availableLanguage: 'es',
      url: urlInicio,
    })),
  );

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': idOrg,
        name: NOMBRE_COMERCIAL,
        legalName: razonCompleta,
        url: urlInicio,
        logo: { '@type': 'ImageObject', url: `${origen}/media/logo.webp` },
        image: `${origen}${OG_IMAGEN.ruta}`,
        description: config.descripcion,
        areaServed: pais,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            telephone: telefonoWhatsapp,
            url: whatsappHref(config.whatsapp.numero, config.whatsapp.mensaje),
            areaServed: config.codigoIso,
            availableLanguage: 'es',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': idSitio,
        url: urlInicio,
        name: NOMBRE_COMERCIAL,
        inLanguage: config.idioma,
        publisher: { '@id': idOrg },
      },
      {
        '@type': 'WebPage',
        '@id': idPagina,
        url: urlInicio,
        name: config.titulo,
        description: config.descripcion,
        inLanguage: config.idioma,
        isPartOf: { '@id': idSitio },
        about: { '@id': idOrg },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${origen}${OG_IMAGEN.ruta}`, width: OG_IMAGEN.ancho, height: OG_IMAGEN.alto },
      },
      ...servicios,
    ],
  };
}
