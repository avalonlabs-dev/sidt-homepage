/**
 * Contenido administrable desde el portal. El HTML sale completo del build con los datos por
 * defecto; esto solo lo actualiza si la API responde. Sin API, todo sigue funcionando.
 * Todo se valida y los nodos se crean con textContent, nunca con innerHTML.
 */
import { leerRed, REDES } from '../data/redes';

const pais = document.body.dataset.pais ?? 'ec';
const TIMEOUT_MS = 3000;

interface Wa { numero: string; mensaje: string }

const soloDigitos = (v: unknown): v is string => typeof v === 'string' && /^\d{8,15}$/.test(v);
const texto = (v: unknown, max = 300): string | null =>
  typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null;
const hrefWa = (w: Wa) => `https://wa.me/${w.numero}?text=${encodeURIComponent(w.mensaje)}`;

function leerWa(v: any, respaldo?: Wa): Wa | null {
  if (!v || typeof v !== 'object' || !soloDigitos(v.numero)) return null;
  return { numero: v.numero, mensaje: texto(v.mensaje, 500) ?? respaldo?.mensaje ?? '' };
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, clase?: string, contenido?: string) {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (contenido !== undefined) n.textContent = contenido;
  return n;
}

function actualizarWhatsapp(wa: Wa) {
  document.body.dataset.waNumero = wa.numero;
  document.body.dataset.waMensaje = wa.mensaje;
  document.querySelectorAll<HTMLAnchorElement>('a[data-wa]:not([data-wa-propio])').forEach((a) => {
    // Los CTA de categoría conservan el mensaje base y le agregan su sufijo.
    const sufijo = a.dataset.waSufijo;
    a.href = hrefWa(sufijo ? { numero: wa.numero, mensaje: `${wa.mensaje} ${sufijo}` } : wa);
  });
  const widget = document.getElementById('sidtChatWidget');
  if (widget) {
    widget.dataset.link = `https://wa.me/${wa.numero}?text=${encodeURIComponent(widget.dataset.mensaje ?? '')}`;
  }
}

function pintarSucursales(lista: any[], general: Wa) {
  const sedes = lista
    .map((s) => ({
      nombre: texto(s?.nombre, 120),
      ciudad: texto(s?.ciudad, 80),
      direccion: texto(s?.direccion, 200),
      provincia: texto(s?.provincia, 80),
      telefono: texto(s?.telefono, 30),
      wa: leerWa(s?.whatsapp, general),
    }))
    .filter((s) => s.nombre && s.ciudad && s.direccion);
  const contenedor = document.getElementById('donde-lista');
  const seccion = document.getElementById('donde-estamos');
  if (!sedes.length || !contenedor || !seccion) return; // se mantienen los del build

  const nodos = sedes.map((s) => {
    const sede = el('article', 'sede');
    const pin = el('span', 'sede-pin');
    pin.append(iconoPin());
    sede.append(pin, el('p', 'sede-ciudad', s.ciudad!), el('h3', 'sede-nombre', s.nombre!));
    sede.append(el('p', 'sede-dir', s.provincia ? `${s.direccion}, ${s.provincia}` : s.direccion!));
    if (s.telefono) {
      const p = el('p', 'sede-tel');
      const tel = el('a', undefined, s.telefono);
      tel.href = `tel:${s.telefono.replace(/[^\d+]/g, '')}`;
      p.append(tel);
      sede.append(p);
    }
    const wa = s.wa ?? general;
    const btn = el('a', 'btn-wa btn-wa--chico');
    btn.href = hrefWa(wa);
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.setAttribute('data-wa', '');
    if (s.wa) btn.setAttribute('data-wa-propio', '');
    btn.append(icono(), document.createTextNode('Escribir por WhatsApp'));
    sede.append(btn);
    return sede;
  });
  contenedor.replaceChildren(...nodos);
  seccion.hidden = false;
}

function icono(): SVGElement {
  // Se clona el ícono ya presente en la página (mismo trazo que el resto de CTA).
  const base = document.querySelector('a[data-wa] svg');
  return (base ? base.cloneNode(true) : document.createElementNS('http://www.w3.org/2000/svg', 'svg')) as SVGElement;
}

function iconoPin(): SVGElement {
  const base = document.querySelector('#icono-pin svg');
  return (base ? base.cloneNode(true) : document.createElementNS('http://www.w3.org/2000/svg', 'svg')) as SVGElement;
}

function pintarTestimonios(lista: any[]) {
  const items = lista
    .map((t) => ({
      url: typeof t?.imagenUrl === 'string' && /^\/public\/landing\/[a-z]{2}\/testimonios\/[\w-]+\/imagen$/.test(t.imagenUrl) ? t.imagenUrl : null,
      alt: texto(t?.alt, 200) ?? 'Captura de WhatsApp de un estudiante agradeciendo a SIDT',
    }))
    .filter((t) => t.url);
  const carril = document.getElementById('testimonios-lista');
  const seccion = document.getElementById('testimonios');
  if (!items.length || !carril || !seccion) return; // se mantienen los del build

  carril.replaceChildren(
    ...items.map((t) => {
      const li = el('li', 'carrusel-item');
      const img = document.createElement('img');
      img.src = t.url;
      img.alt = t.alt;
      img.width = 270;
      img.height = 480;
      img.loading = 'lazy';
      img.decoding = 'async';
      li.append(img);
      return li;
    })
  );
  seccion.hidden = false;
  document.dispatchEvent(new CustomEvent('contenido:testimonios'));
}

/** La lista de la API manda: vacía o sin ninguna red válida, el pie queda sin redes. */
function pintarRedes(lista: unknown[]) {
  document.getElementById('pie-redes')?.remove();
  const vistas = new Set<string>();
  const redes = lista.flatMap((r) => {
    const valida = leerRed(r);
    if (!valida || vistas.has(valida.red)) return [];
    vistas.add(valida.red);
    return [valida];
  });
  const marca = document.querySelector('.pie-marca');
  const iconos = document.querySelector<HTMLTemplateElement>('#redes-iconos')?.content;
  if (!redes.length || !marca || !iconos) return;

  const ul = el('ul', 'pie-redes');
  ul.id = 'pie-redes';
  ul.setAttribute('aria-label', 'Redes sociales');
  ul.append(
    ...redes.map((r) => {
      const a = el('a');
      a.href = r.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', REDES[r.red].nombre);
      const svg = iconos.querySelector(`[data-red="${r.red}"] svg`);
      if (svg) a.append(svg.cloneNode(true));
      const li = el('li');
      li.append(a);
      return li;
    })
  );
  marca.append(ul);
}

async function cargar() {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`/public/landing/${pais}`, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) return;
    const d = await r.json();
    if (!d || typeof d !== 'object' || d.pais !== pais) return;
    const actual: Wa = { numero: document.body.dataset.waNumero ?? '', mensaje: document.body.dataset.waMensaje ?? '' };
    const general = leerWa(d.whatsapp, actual) ?? actual;
    if (general.numero !== actual.numero || general.mensaje !== actual.mensaje) actualizarWhatsapp(general);
    if (Array.isArray(d.sucursales)) pintarSucursales(d.sucursales, general);
    if (Array.isArray(d.testimonios)) pintarTestimonios(d.testimonios);
    if (Array.isArray(d.redes)) pintarRedes(d.redes);
  } catch {
    /* sin API o respuesta inválida: se queda lo del build, sin errores visibles */
  } finally {
    clearTimeout(t);
    // Las secciones pueden haber cambiado de alto: el movimiento recalcula sus disparadores.
    document.dispatchEvent(new CustomEvent('contenido:listo'));
  }
}
cargar();
