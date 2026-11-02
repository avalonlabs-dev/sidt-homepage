import type { APIRoute } from 'astro';
import { alternativas, urlInicio } from '../config/seo';

/** Solo la portada; /gracias.html no entra. Cada versión declara a todas (y a sí misma) con hreflang. */
export const GET: APIRoute = () => {
  const enlaces = alternativas
    .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${urlInicio}</loc>
${enlaces}
  </url>
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
