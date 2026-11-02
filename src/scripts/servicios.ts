/**
 * Selector de "Nuestros servicios". Sin este script se ven las tres categorías apiladas.
 * No usa GSAP: la cascada y el progreso son CSS, así que todo funciona aunque GSAP no cargue.
 * El tiempo del autoavance lo lleva la animación CSS de progreso: al terminar, pasa a la siguiente.
 */
const raiz = document.querySelector<HTMLElement>('[data-serv]');
if (raiz) iniciar(raiz);

function iniciar(raiz: HTMLElement) {
  const lista = raiz.querySelector<HTMLElement>('[role="tablist"]')!;
  const tabs = [...lista.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const paneles = [...raiz.querySelectorAll<HTMLElement>('[data-serv-panel]')];
  const marco = raiz.querySelector<HTMLElement>('.serv-marco')!;
  const linea = raiz.querySelector<SVGSVGElement>('[data-serv-linea]')!;
  const trazo = linea.querySelector('path')!;
  const [nodoInicio, nodoFin] = linea.querySelectorAll('circle');
  const escritorio = matchMedia('(min-width: 1100px)');
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
  let activa = 0;

  /** Dibuja la línea desde la categoría activa hasta el panel, en píxeles de la propia sección. */
  function trazar(animar: boolean) {
    const r = raiz.getBoundingClientRect();
    const t = tabs[activa].getBoundingClientRect();
    const m = marco.getBoundingClientRect();
    let d: string, x0: number, y0: number, x1: number, y1: number;
    if (escritorio.matches) {
      [x0, y0, x1, y1] = [t.right - r.left, t.top + t.height / 2 - r.top, m.left - r.left, m.top + m.height / 2 - r.top];
      const c = (x1 - x0) / 2;
      d = `M${x0} ${y0}C${x0 + c} ${y0} ${x1 - c} ${y1} ${x1} ${y1}`;
    } else {
      [x0, y0, x1, y1] = [t.left + t.width / 2 - r.left, t.bottom - r.top, m.left + m.width / 2 - r.left, m.top - r.top];
      const c = (y1 - y0) / 2;
      d = `M${x0} ${y0}C${x0} ${y0 + c} ${x1} ${y1 - c} ${x1} ${y1}`;
    }
    linea.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    trazo.setAttribute('d', d);
    nodoInicio.style.transform = `translate(${x0}px, ${y0}px)`;
    nodoFin.style.transform = `translate(${x1}px, ${y1}px)`;
    lista.setAttribute('aria-orientation', escritorio.matches ? 'vertical' : 'horizontal');
    if (animar && !sinMovimiento.matches) {
      trazo.animate({ strokeDashoffset: [1, 0] }, { duration: 550, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    }
  }

  function seleccionar(i: number) {
    activa = i;
    tabs.forEach((t, n) => {
      t.setAttribute('aria-selected', String(n === i));
      t.tabIndex = n === i ? 0 : -1;
    });
    paneles.forEach((p, n) => p.classList.toggle('activo', n === i));
    raiz.style.setProperty('--activa', String(i));
    trazar(true);
  }

  // Estado de pausa: cursor, foco, sección fuera de vista o pestaña del navegador oculta.
  const pausa = { cursor: false, foco: false, fuera: true };
  const actualizarPausa = () =>
    raiz.classList.toggle('serv--pausa', pausa.cursor || pausa.foco || pausa.fuera || document.hidden);
  const detener = () => raiz.classList.remove('serv--auto');

  // El primer gesto detiene el autoavance para siempre.
  raiz.addEventListener('pointerdown', detener);
  raiz.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') detener();
  });
  raiz.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { pausa.cursor = true; actualizarPausa(); } });
  raiz.addEventListener('pointerleave', () => { pausa.cursor = false; actualizarPausa(); });
  raiz.addEventListener('focusin', () => { pausa.foco = true; actualizarPausa(); });
  raiz.addEventListener('focusout', (e) => {
    pausa.foco = raiz.contains(e.relatedTarget as Node | null);
    actualizarPausa();
  });
  document.addEventListener('visibilitychange', actualizarPausa);
  lista.addEventListener('animationend', (e) => {
    if (e.animationName === 'serv-avance') seleccionar((activa + 1) % tabs.length);
  });

  tabs.forEach((t, i) => t.addEventListener('click', () => seleccionar(i)));
  lista.addEventListener('keydown', (e) => {
    const destino: Record<string, number> = {
      ArrowRight: activa + 1, ArrowDown: activa + 1, ArrowLeft: activa - 1, ArrowUp: activa - 1, Home: 0, End: tabs.length - 1,
    };
    if (!(e.key in destino)) return;
    e.preventDefault();
    const i = (destino[e.key] + tabs.length) % tabs.length;
    seleccionar(i);
    tabs[i].focus();
  });

  // Activación: a partir de aquí el HTML pasa de lista apilada a pestañas.
  paneles.forEach((p, i) => {
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', tabs[i].id);
  });
  lista.hidden = false;
  linea.removeAttribute('hidden');
  raiz.classList.add('serv--pestanas');
  seleccionar(0);
  if (!sinMovimiento.matches) raiz.classList.add('serv--auto');
  actualizarPausa();

  new ResizeObserver(() => trazar(false)).observe(raiz);
  new IntersectionObserver(
    ([e]) => {
      pausa.fuera = !e.isIntersecting;
      if (e.isIntersecting) raiz.classList.add('serv--vista'); // la primera cascada espera a que se vea
      actualizarPausa();
    },
    { rootMargin: '0px 0px -25% 0px' }
  ).observe(marco);
}
