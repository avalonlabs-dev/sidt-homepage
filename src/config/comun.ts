import type { PaisConfig } from './tipos';

export const MENSAJE_WHATSAPP =
  '¡Hola! Gracias por contactarnos a través de Google. 😊 ¿Qué tipo de trabajo deseas obtener más información y de qué carrera o especialidad es?';

export const MENSAJE_WIDGET =
  '¡Hola Ana! Vi la promo 2x1 en la web de SIDT y quiero información para mi tesis.';

/** Medición. Se conserva igual que en producción. */
export const GOOGLE_ADS_ID = 'AW-17358320939';
export const GTM_ID = 'GTM-58XGL24S';
export const GA_ID = 'G-Z7C0M4QVTV'; // comentado a propósito, como hoy
export const CONVERSION_GRACIAS = 'AW-17358320939/Ka2OCL2mr_EaEKvqi9VA';

export const FORMSUBMIT = 'https://formsubmit.co/sidtasesoria.tesis@gmail.com';

/** Dominios de SIDT: el `_next` de los formularios se ajusta en el navegador a cualquiera de ellos. */
export const DOMINIOS_SIDT = ['lsec.asesoriasidt.com', 'ls.asesoriasidt.com'];

/** Versiones por idioma/país (hreflang). La raíz es el sitio institucional (sidt-web), no la landing. */
export const VERSIONES = [
  { idioma: 'es-EC', url: 'https://lsec.asesoriasidt.com/' },
  { idioma: 'es-PE', url: 'https://ls.asesoriasidt.com/' },
] as const;
export const URL_POR_DEFECTO = 'https://lsec.asesoriasidt.com/';

export const NOMBRE_COMERCIAL = 'SIDT';
export const PALABRAS_CLAVE =
  'asesoría, tesis, normas APA, examen complexivo, servicios académicos, educación';

/** Países de la lista del formulario (se conserva la lista de producción). */
export const PAISES_FORMULARIO: { codigo: string; etiqueta: string; bandera: string }[] = [
  { codigo: '+54', etiqueta: 'Argentina', bandera: '🇦🇷' },
  { codigo: '+591', etiqueta: 'Bolivia', bandera: '🇧🇴' },
  { codigo: '+55', etiqueta: 'Brasil', bandera: '🇧🇷' },
  { codigo: '+56', etiqueta: 'Chile', bandera: '🇨🇱' },
  { codigo: '+57', etiqueta: 'Colombia', bandera: '🇨🇴' },
  { codigo: '+506', etiqueta: 'Costa Rica', bandera: '🇨🇷' },
  { codigo: '+53', etiqueta: 'Cuba', bandera: '🇨🇺' },
  { codigo: '+593', etiqueta: 'Ecuador', bandera: '🇪🇨' },
  { codigo: '+503', etiqueta: 'El Salvador', bandera: '🇸🇻' },
  { codigo: '+34', etiqueta: 'España', bandera: '🇪🇸' },
  { codigo: '+1', etiqueta: 'EE.UU.', bandera: '🇺🇸' },
  { codigo: '+502', etiqueta: 'Guatemala', bandera: '🇬🇹' },
  { codigo: '+504', etiqueta: 'Honduras', bandera: '🇭🇳' },
  { codigo: '+52', etiqueta: 'México', bandera: '🇲🇽' },
  { codigo: '+505', etiqueta: 'Nicaragua', bandera: '🇳🇮' },
  { codigo: '+507', etiqueta: 'Panamá', bandera: '🇵🇦' },
  { codigo: '+595', etiqueta: 'Paraguay', bandera: '🇵🇾' },
  { codigo: '+1', etiqueta: 'Puerto Rico', bandera: '🇵🇷' },
  { codigo: '+598', etiqueta: 'Uruguay', bandera: '🇺🇾' },
  { codigo: '+58', etiqueta: 'Venezuela', bandera: '🇻🇪' },
];

export type { PaisConfig };
