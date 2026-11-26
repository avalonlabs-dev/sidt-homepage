/**
 * Cloudflare Turnstile perezoso: el script y el widget se activan al primer contacto con el formulario
 * (foco, clic o envío), no al abrir la página. Así cada token emitido corresponde a alguien que empezó
 * a llenar ese formulario y Cloudflare ve la validación (siteverify) de casi todos sus tokens.
 * El widget se marca con `.cf-turnstile` y sus `data-*` (sitekey, language, action, theme).
 */
type Turnstile = {
  render: (el: HTMLElement, opciones: Record<string, string | undefined>) => string | undefined;
  reset: (el: HTMLElement) => void;
};
const cf = () => (window as unknown as { turnstile?: Turnstile }).turnstile;

let api: Promise<void> | null = null;
function cargarApi(): Promise<void> {
  return (api ??= new Promise<void>((listo, fallo) => {
    (window as unknown as Record<string, () => void>).__turnstileListo = () => listo();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__turnstileListo';
    s.async = true;
    s.onerror = () => { api = null; s.remove(); fallo(new Error('turnstile')); };
    document.head.appendChild(s);
  }));
}

export type WidgetTurnstile = {
  /** Espera el token (hasta `ms`); cadena vacía si no hay widget o no llegó a tiempo. */
  token: (ms?: number) => Promise<string>;
  /** Pide un token nuevo (el anterior ya lo gastó la API). */
  reiniciar: () => void;
};

export function turnstilePerezoso(form: HTMLFormElement): WidgetTurnstile {
  const el = form.querySelector<HTMLElement>('.cf-turnstile');
  let renderizado = false;
  let activando: Promise<void> | null = null;

  const activar = () => {
    if (!el || renderizado) return Promise.resolve();
    return (activando ??= cargarApi()
      .then(() => {
        const d = el.dataset;
        cf()?.render(el, { sitekey: d.sitekey, language: d.language, action: d.action, theme: d.theme ?? 'auto' });
        renderizado = true;
      })
      .catch(() => { activando = null; }));
  };
  if (el) for (const ev of ['focusin', 'pointerdown']) form.addEventListener(ev, activar, { passive: true });

  const leer = () => form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value ?? '';
  return {
    async token(ms = 10000) {
      if (!el) return '';
      await activar();
      const limite = Date.now() + ms;
      while (!leer() && Date.now() < limite) await new Promise((r) => setTimeout(r, 200));
      return leer();
    },
    reiniciar() {
      if (el && renderizado) { try { cf()?.reset(el); } catch { /* widget retirado */ } }
    },
  };
}
