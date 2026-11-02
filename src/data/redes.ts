/**
 * Redes sociales del pie. Los dominios y el criterio son los del contrato de la API
 * (`DOMINIOS_RED` y `validarRedes` en sidt-api); aquí se repiten porque es la salida al navegador.
 */
export const REDES: Record<string, { nombre: string; icono: string; dominios: string[] }> = {
  facebook: { nombre: 'Facebook', icono: 'facebook-logo', dominios: ['facebook.com'] },
  instagram: { nombre: 'Instagram', icono: 'instagram-logo', dominios: ['instagram.com'] },
  tiktok: { nombre: 'TikTok', icono: 'tiktok-logo', dominios: ['tiktok.com'] },
  youtube: { nombre: 'YouTube', icono: 'youtube-logo', dominios: ['youtube.com', 'youtu.be'] },
  linkedin: { nombre: 'LinkedIn', icono: 'linkedin-logo', dominios: ['linkedin.com'] },
  x: { nombre: 'X', icono: 'x-logo', dominios: ['x.com', 'twitter.com'] },
};

/** Devuelve la red con su URL normalizada, o null si no cumple el contrato. */
export function leerRed(v: unknown): { red: string; url: string } | null {
  const { red, url } = (v ?? {}) as { red?: unknown; url?: unknown };
  if (typeof red !== 'string' || !Object.hasOwn(REDES, red)) return null;
  if (typeof url !== 'string' || url.length > 300) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase();
  const dominioOk = REDES[red].dominios.some((d) => host === d || host.endsWith(`.${d}`));
  return u.protocol === 'https:' && !u.username && !u.password && dominioOk ? { red, url: u.href } : null;
}
