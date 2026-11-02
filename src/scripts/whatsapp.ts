/**
 * Enlaces de WhatsApp: cada CTA es un <a href="https://wa.me/..."> que funciona sin JS.
 * Con JS, el clic registra la conversión de Google Ads:
 *  - escritorio: abre WhatsApp en pestaña nueva, de forma síncrona dentro del clic
 *    (así el bloqueador de pop-ups no lo cancela);
 *  - móvil: redirige en la misma pestaña tras la conversión (la app de WhatsApp se abre
 *    por deep link y no deja una pestaña en blanco).
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    gtag_report_conversion?: (url?: string) => boolean;
  }
}

const esMovil = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Windows Phone|BlackBerry/i.test(navigator.userAgent);
const adsId = () => document.body.dataset.adsId ?? '';

export function reportarConversion(url: string): boolean {
  const gtag = window.gtag;
  if (!esMovil()) {
    window.open(url, '_blank', 'noopener');
    if (typeof gtag === 'function') gtag('event', 'conversion', { send_to: adsId() });
    return false;
  }
  let redirigido = false;
  const ir = () => {
    if (redirigido) return;
    redirigido = true;
    window.location.href = url;
  };
  if (typeof gtag === 'function') gtag('event', 'conversion', { send_to: adsId(), event_callback: ir });
  // Respaldo por si el callback nunca llega (bloqueador de anuncios, red lenta).
  setTimeout(ir, 1200);
  return false;
}

window.gtag_report_conversion = (url) =>
  reportarConversion(url ?? (document.querySelector<HTMLAnchorElement>('a[data-wa]')?.href ?? '#'));

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[data-wa]');
  if (!a) return;
  e.preventDefault();
  reportarConversion(a.href);
});
