import { serviceOptions } from '../data/servicios';

/* ===== Turnstile: el script se carga una sola vez, solo si el build trae clave (hay widgets) ===== */
type Turnstile = { reset: (el?: Element | string) => void };
const turnstile = () => (window as unknown as { turnstile?: Turnstile }).turnstile;
if (document.querySelector('.cf-turnstile')) {
  const t = document.createElement('script');
  t.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  t.async = true;
  t.defer = true;
  document.head.appendChild(t);
}

/* ===== Envío a la API (mismo origen; nginx lo reenvía) ===== */
const MSG_VERIFICACION = 'No pudimos verificar que eres una persona. Vuelve a intentarlo o escríbenos por WhatsApp.';
const MSG_DATOS = 'Revisa tu nombre y tu número de WhatsApp (solo números, de 6 a 15 dígitos).';
const MSG_ERROR = 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.';

function utmDeLaUrl(): Record<string, string> {
  const params = new URLSearchParams(location.search);
  const utm: Record<string, string> = {};
  for (const k of ['source', 'medium', 'campaign', 'term', 'content']) {
    const v = params.get(`utm_${k}`);
    if (v) utm[k] = v.slice(0, 100);
  }
  return utm;
}

document.querySelectorAll<HTMLFormElement>('form.formulario').forEach((form) => {
  const estado = form.querySelector<HTMLElement>('[data-estado]');
  const enlaceWa = form.querySelector<HTMLElement>('.formulario-wa');
  const boton = form.querySelector<HTMLInputElement>('.btn-enviar');
  const pais = form.dataset.pais;
  if (!estado || !boton || !pais) return;

  const mostrar = (texto: string, conWhatsapp: boolean) => {
    estado.textContent = texto;
    if (enlaceWa) enlaceWa.hidden = !conWhatsapp;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (boton.disabled) return;
    const campo = (n: string) => form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${n}"]`)?.value ?? '';
    const token = form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value ?? '';
    const cuerpo: Record<string, unknown> = {
      nombre: campo('name').trim(),
      codigoPais: campo('countryCode'),
      whatsapp: campo('whatsapp').replace(/\D/g, ''),
      pagina: '/landing',
      utm: utmDeLaUrl(),
      _honey: campo('_honey'),
    };
    if (token) cuerpo.turnstileToken = token;

    boton.disabled = true;
    mostrar('Enviando…', false);
    const reiniciar = () => {
      const w = form.querySelector('.cf-turnstile');
      if (w) turnstile()?.reset(w);
    };
    try {
      const r = await fetch(`/public/web/${pais}/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(cuerpo),
      });
      if (r.status === 201) {
        // La conversión de Google Ads la dispara gracias.html.
        location.href = '/gracias.html';
        return;
      }
      if (r.status === 403) {
        mostrar(MSG_VERIFICACION, true);
        reiniciar();
      } else if (r.status === 400) {
        mostrar(MSG_DATOS, false);
        reiniciar(); // la API ya gastó el token: el reintento necesita uno nuevo
      } else {
        mostrar(MSG_ERROR, true);
        reiniciar();
      }
    } catch {
      mostrar(MSG_ERROR, true);
      reiniciar();
    }
    boton.disabled = false;
  });
});

/* ===== WhatsApp: solo dígitos y regla por código de país ===== */
function reglaWhatsapp(codigo: string, numero: string): string {
  // Se tolera el 0 inicial con el que se escribe en Ecuador (0963875608).
  const n = numero.replace(/^0/, '');
  switch (codigo) {
    case '+593':
    case '+51':
      return /^9\d{8}$/.test(n) ? '' : 'Ingresa 9 dígitos que empiecen en 9.';
    case '+57':
      return /^3\d{9}$/.test(n) ? '' : 'Ingresa 10 dígitos que empiecen en 3.';
    default:
      return /^\d{8,12}$/.test(numero) ? '' : 'Ingresa entre 8 y 12 dígitos.';
  }
}

document.querySelectorAll<HTMLFormElement>('form.formulario').forEach((form) => {
  const tel = form.querySelector<HTMLInputElement>('input[name="whatsapp"]');
  const codigo = form.querySelector<HTMLSelectElement>('select[name="countryCode"]');
  if (!tel || !codigo) return;
  const validar = () => tel.setCustomValidity(tel.value ? reglaWhatsapp(codigo.value, tel.value) : '');
  tel.addEventListener('input', () => {
    tel.value = tel.value.replace(/[^0-9]/g, '');
    validar();
  });
  codigo.addEventListener('change', validar);
});

/* ===== Selects dependientes categoría -> servicio (si el formulario los trae) ===== */
function dependientes(idCategoria: string, idServicio: string) {
  const categoria = document.getElementById(idCategoria) as HTMLSelectElement | null;
  const servicio = document.getElementById(idServicio) as HTMLSelectElement | null;
  if (!categoria || !servicio) return;
  categoria.value = '';
  categoria.addEventListener('change', () => {
    servicio.innerHTML = '';
    const vacio = new Option('Selecciona un servicio específico', '', true, true);
    vacio.disabled = true;
    servicio.add(vacio);
    const lista = serviceOptions[categoria.value];
    servicio.disabled = !lista;
    lista?.forEach((s) => servicio.add(new Option(s.label, s.value)));
  });
}
dependientes('serviceCategory', 'specificService');
dependientes('serviceCategory-about', 'specificService-about');
