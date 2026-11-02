import fs from 'node:fs';
import path from 'node:path';
import { config } from './index';

/**
 * Medios de public/media, descritos en public/media/manifest.json (lo escribe el proceso de
 * medios). Todo tiene guardas: si el manifest o un medio faltan, el build compila igual y las
 * secciones que dependen de ellos se ocultan o caen a texto.
 */
export interface Medio {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
}

const RAIZ = path.resolve(process.cwd(), 'public/media');

function leerManifest(): any {
  try {
    return JSON.parse(fs.readFileSync(path.join(RAIZ, 'manifest.json'), 'utf8'));
  } catch {
    return {};
  }
}
const manifest = leerManifest();

const existe = (m?: Medio | null): m is Medio =>
  !!m && typeof m.src === 'string' && fs.existsSync(path.join(RAIZ, m.src.replace(/^\/media\//, '')));

const lista = (v: unknown): Medio[] => (Array.isArray(v) ? (v as Medio[]).filter(existe) : []);

/** Capturas de testimonios del build para el país. */
export function testimoniosBuild(): Medio[] {
  return lista(manifest?.[config.pais]?.testimonios);
}

/** Logo de universidad por nombre (alt "Logo de <nombre>"); null si no está. */
export function logoUniversidad(nombre: string): Medio | null {
  const hallado = lista(manifest?.[config.pais]?.universidades).find((u) => u.alt === `Logo de ${nombre}`);
  return hallado ?? null;
}

/** Recortes de personas: el del hero y el de Nosotros. No se muestran más grandes que su tamaño real. */
export function foto(cual: 'estudiante' | 'nosotros'): Medio | null {
  const m = manifest?.hero?.[cual];
  return existe(m) ? m : null;
}

export type PiezaMarca =
  | 'mancha-amarilla'
  | 'mancha-amarilla-clara'
  | 'destello-violeta'
  | 'circulo-amarillo-grande'
  | 'circulo-amarillo-medio'
  | 'marca-agua-logo'
  | 'topografia-lineas'
  | 'figura-violeta-pasos';

/** Pieza gráfica de marca; null si falta, y Forma.astro dibuja su versión en línea. */
export function piezaMarca(nombre: PiezaMarca): Medio | null {
  const m = manifest?.marca?.[nombre];
  return existe(m) ? m : null;
}

export interface VideoNosotros {
  src: string;
  poster?: string;
  width: number;
  height: number;
  alt: string;
}

/** Video vertical de Nosotros. Solo se descarga al abrirlo; si falta el archivo, el botón no se pinta. */
export function videoNosotros(): VideoNosotros | null {
  const v = manifest?.video;
  if (!v || typeof v.src !== 'string' || !fs.existsSync(path.join(RAIZ, v.src.replace(/^\/media\//, '')))) return null;
  const poster = typeof v.poster === 'string' && fs.existsSync(path.join(RAIZ, v.poster.replace(/^\/media\//, ''))) ? v.poster : undefined;
  return { src: v.src, poster, width: v.width ?? 720, height: v.height ?? 1280, alt: v.alt ?? 'Video de presentación de SIDT' };
}
