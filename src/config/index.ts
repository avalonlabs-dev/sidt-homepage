import ec from './ec';
import pe from './pe';
import type { PaisConfig } from './tipos';

const porPais: Record<string, PaisConfig> = { ec, pe };

/** País del build: PAIS=ec|pe (por defecto ec). */
export const config: PaisConfig = porPais[(process.env.PAIS || 'ec').toLowerCase()] ?? ec;

export function whatsappHref(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
export * from './comun';
export type { PaisConfig } from './tipos';
