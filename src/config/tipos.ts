export type Pais = 'ec' | 'pe';

export interface Whatsapp {
  /** Solo dígitos, con prefijo de país (sin +). */
  numero: string;
  mensaje: string;
}

export interface Sucursal {
  nombre: string;
  ciudad: string;
  provincia?: string;
  direccion: string;
  telefono?: string;
  /** Si falta, hereda el WhatsApp del país. */
  whatsapp?: Whatsapp;
}

export interface Universidad {
  /** Nombre del archivo sin extensión en public/media (p. ej. college01). */
  archivo: string;
  nombre: string;
}

export interface RedSocial {
  /** Clave de `src/data/redes.ts`. */
  red: string;
  url: string;
}

export interface PaisConfig {
  pais: Pais;
  /** "Tesis S.A." / "Tesis S.A.C": va tras "Servicios Integrales de". */
  razonSocial: string;
  /** Texto de <title> y og:title del inicio (menciona el país). */
  titulo: string;
  /** Descripción para meta, Open Graph, JSON-LD y llms.txt (menciona el país). */
  descripcion: string;
  /** Dominio propio de este build y de su canónica (ec: raíz; pe: ls). Los anuncios de Ecuador llegan a lsec, que sirve el mismo build. */
  dominio: string;
  /** "es-EC" / "es-PE": atributo lang y hreflang. */
  idioma: string;
  /** "es_EC" / "es_PE": og:locale. */
  localeOg: string;
  /** Nombre del país y código ISO 3166-1 alfa-2. */
  nombrePais: string;
  codigoIso: string;
  /** Código de país marcado por defecto en el formulario. */
  codigoPais: string;
  /** Etiqueta del código por defecto (la bandera va en la lista). */
  paisSeleccionado: { codigo: string; etiqueta: string };
  placeholderWhatsapp: string;
  whatsapp: Whatsapp;
  /** Mensaje del widget de "Ana" (promo 2x1). */
  mensajeWidget: string;
  universidades: Universidad[];
  /** Direcciones por defecto del build. Vacío = la sección se oculta hasta que la API las entregue. */
  sucursales: Sucursal[];
  /** Redes del pie por defecto. Vacío = el pie no muestra redes. Lo que entrega la API reemplaza a esto. */
  redes: RedSocial[];
}
