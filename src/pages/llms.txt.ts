import type { APIRoute } from 'astro';
import { config, whatsappHref } from '../config';
import { disclaimer } from '../data/contenido';
import { categoriasServicio, serviceOptions } from '../data/servicios';
import { razonCompleta, telefonoWhatsapp, urlInicio } from '../config/seo';
import { VERSIONES } from '../config/comun';

/**
 * Formato llms.txt (llmstxt.org, v2): H1 con el nombre, cita con el resumen, texto sin encabezados y
 * secciones H2 con listas de enlaces `- [nombre](url): notas`. Solo datos que ya están en la página.
 */
export const GET: APIRoute = () => {
  const servicios = categoriasServicio
    .map((c) => `- ${c.nombre}: ${serviceOptions[c.clave].map((s) => s.label).join(', ')}.`)
    .join('\n');
  const otra = VERSIONES.find((v) => v.idioma !== config.idioma)!;
  const nombreOtra = otra.idioma === 'es-PE' ? 'Perú' : 'Ecuador';

  const texto = `# SIDT, ${razonCompleta}

> ${config.descripcion}

Página de ${config.nombrePais} (idioma: español, ${config.idioma}). Está pensada para estudiantes universitarios que necesitan acompañamiento con su tesis o su trabajo de titulación. Pedir una cotización se hace por WhatsApp o con el formulario de la página.

Servicios que ofrece SIDT:

${servicios}

Aviso legal: ${disclaimer}

## Páginas

- [Inicio de SIDT ${config.nombrePais}](${urlInicio}): servicios, cifras, pasos para empezar, beneficios y formulario de cotización.

## Contacto

- [WhatsApp de SIDT ${config.nombrePais}](${whatsappHref(config.whatsapp.numero, config.whatsapp.mensaje)}): ${telefonoWhatsapp}, atención en español.

## Otras versiones

- [SIDT ${nombreOtra}](${otra.url}): misma oferta para estudiantes en ${nombreOtra}.
`;
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
