/**
 * Movimiento de la página con GSAP. Se carga aparte (import dinámico): si falla, la página sigue
 * entera y funcional. Con prefers-reduced-motion no se crea nada y todo queda estático.
 * Las animaciones continuas (formas, tira, líneas) son CSS.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });

const raiz = document.documentElement;
const todos = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s);

/** Una sola secuencia de entrada: mancha, persona, titular, formulario, etiquetas. Menos de 1,2 s. */
function entradaHero(movil: boolean) {
  const conEntrada = raiz.classList.contains('pre-anim');
  raiz.classList.remove('pre-anim');
  if (!conEntrada) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.55 } });
  tl.from('.hero-mancha', { scale: 0.55, opacity: 0, transformOrigin: '50% 50%', duration: 0.6 }, 0)
    .from('.hero-disco', { scale: 0.7, opacity: 0, transformOrigin: '50% 100%' }, 0.05)
    .from('.hero-persona', { y: movil ? 28 : 70, opacity: 0 }, 0.12);
  if (movil) tl.from('.hero-titulo', { y: 18, opacity: 0, duration: 0.45 }, 0.1);
  else tl.from('.linea-int', { yPercent: 110, stagger: 0.07, duration: 0.5 }, 0.2);
  tl.from('.hero-bajada, .hero-acciones', { y: 16, opacity: 0, stagger: 0.06, duration: 0.4 }, 0.42)
    // Opacidad y no visibilidad: el formulario acepta foco desde el primer momento.
    .from('.hero-form .formulario', { y: 26, opacity: 0, duration: 0.5 }, 0.4)
    .from('.hero .etiqueta', { scale: 0.6, opacity: 0, stagger: 0.09, duration: 0.35, ease: 'back.out(2)', clearProps: 'transform,opacity' }, 0.76);
}

function contadores() {
  const lista = todos('[data-contador]').map((el) => {
    const m = (el.textContent ?? '').trim().match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
    return m ? { el, final: el.textContent ?? '', pre: m[1], n: parseFloat(m[2]), suf: m[3], dec: (m[2].split('.')[1] ?? '').length } : null;
  }).filter((x): x is NonNullable<typeof x> => !!x);

  lista.forEach((c) => { c.el.textContent = `${c.pre}${(0).toFixed(c.dec)}${c.suf}`; });
  ScrollTrigger.create({
    trigger: '.franja',
    start: 'top 92%',
    once: true,
    onEnter: () => lista.forEach((c, i) => {
      const estado = { v: 0 };
      gsap.to(estado, {
        v: c.n, duration: 1.5, delay: i * 0.12, ease: 'power2.out',
        onUpdate: () => { c.el.textContent = `${c.pre}${estado.v.toFixed(c.dec)}${c.suf}`; },
        onComplete: () => { c.el.textContent = c.final; },
      });
    }),
  });
  return () => lista.forEach((c) => { c.el.textContent = c.final; });
}

function parallax(movil: boolean) {
  todos<HTMLElement>('[data-velocidad]').forEach((el) => {
    const v = parseFloat(el.dataset.velocidad ?? '0');
    const esCirculo = el.classList.contains('forma--circulo');
    if (!v || (movil && !esCirculo)) return;
    gsap.fromTo(el, { y: -v * (movil ? 50 : 120) }, {
      y: v * (movil ? 50 : 120),
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section, footer') ?? el, start: 'top bottom', end: 'bottom top', scrub: movil ? true : 0.6 },
    });
  });
}

/** La línea de la ruta se dibuja con el scroll y activa cada paso al llegar. */
function ruta(movil: boolean) {
  const contenedor = document.querySelector('.ruta');
  if (!contenedor) return;
  const pasos = todos('.paso');
  raiz.classList.add('anim');
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: contenedor,
      start: movil ? 'top 75%' : 'top 62%',
      end: movil ? 'bottom 70%' : 'bottom 75%',
      scrub: 0.4,
      onUpdate: (st) => pasos.forEach((p, i) => p.classList.toggle('activo', st.progress >= (i + 0.1) / pasos.length - 0.02)),
    },
  });
  tl.fromTo('.ruta-avance', { strokeDashoffset: 1 }, { strokeDashoffset: 0 }, 0)
    .fromTo('.ruta-vertical-avance', { scaleY: 0 }, { scaleY: 1 }, 0);
}

function revelaciones(movil: boolean) {
  ScrollTrigger.batch('[data-revela]', {
    start: 'top 88%',
    once: true,
    onEnter: (lote) => gsap.fromTo(lote, { y: movil ? 18 : 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08, overwrite: true, clearProps: 'transform,opacity' }),
  });
  gsap.set('[data-revela]', { opacity: 0 });
  ScrollTrigger.batch('.beneficio', {
    start: 'top 90%',
    once: true,
    onEnter: (lote) => {
      gsap.fromTo(lote, { y: 44, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(1.5)', stagger: 0.09, clearProps: 'transform,opacity' });
      gsap.fromTo(lote.map((b) => b.querySelector('.beneficio-icono')), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, delay: 0.2, ease: 'back.out(2.4)', stagger: 0.09, clearProps: 'transform' });
    },
  });
  gsap.set('.beneficio', { opacity: 0 });
  gsap.from('.nosotros-persona', { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.nosotros-figura', start: 'top 80%', once: true } });
}

/** Brillo que sigue al cursor en las tarjetas de beneficios. */
function brillo() {
  const tarjetas = todos('.beneficio');
  const mover = (e: PointerEvent) => {
    const t = e.currentTarget as HTMLElement;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--x', `${e.clientX - r.left}px`);
    t.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  tarjetas.forEach((t) => t.addEventListener('pointermove', mover, { passive: true }));
  return () => tarjetas.forEach((t) => t.removeEventListener('pointermove', mover));
}

const mm = gsap.matchMedia();
mm.add(
  {
    escritorio: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
    movil: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
  },
  (ctx) => {
    const movil = !!ctx.conditions?.movil;
    entradaHero(movil);
    const quitarContadores = contadores();
    parallax(movil);
    ruta(movil);
    revelaciones(movil);
    const quitarBrillo = movil ? undefined : brillo();
    return () => {
      quitarContadores();
      quitarBrillo?.();
      raiz.classList.remove('anim');
    };
  }
);
// Sin movimiento (o al cambiar la preferencia) nada puede quedar oculto.
raiz.classList.remove('pre-anim');

document.addEventListener('contenido:listo', () => ScrollTrigger.refresh());
