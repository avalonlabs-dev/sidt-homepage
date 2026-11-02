/**
 * Carrusel de testimonios: desplazamiento nativo con scroll-snap, flechas y puntos. Funciona sin
 * GSAP. Si la API reemplaza las capturas, se reconstruye con el evento `contenido:testimonios`.
 */
const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function iniciar(raiz: HTMLElement) {
  const pista = raiz.querySelector<HTMLElement>('.carrusel-pista');
  const puntos = raiz.querySelector<HTMLElement>('.carrusel-puntos');
  const previo = raiz.querySelector<HTMLButtonElement>('[data-previo]');
  const siguiente = raiz.querySelector<HTMLButtonElement>('[data-siguiente]');
  if (!pista || !puntos || !previo || !siguiente) return;

  const items = () => Array.from(pista.children) as HTMLElement[];
  const irA = (i: number, suave = true) => {
    const item = items()[i];
    if (!item) return;
    const izquierda = item.offsetLeft - (pista.clientWidth - item.offsetWidth) / 2;
    pista.scrollTo({ left: izquierda, behavior: suave && !reducido() ? 'smooth' : 'auto' });
  };

  let actual = -1;
  const pintar = () => {
    const centro = pista.scrollLeft + pista.clientWidth / 2;
    let cerca = 0;
    let menor = Infinity;
    items().forEach((item, i) => {
      const ancho = item.offsetWidth || 1;
      const d = (item.offsetLeft + ancho / 2 - centro) / ancho;
      if (Math.abs(d) < menor) { menor = Math.abs(d); cerca = i; }
      if (!reducido()) {
        // Tres dimensiones suaves: las laterales giran hacia el centro.
        const limitado = Math.max(-2, Math.min(2, d));
        item.style.transform = `perspective(1000px) rotateY(${(-limitado * 15).toFixed(2)}deg) scale(${(1 - Math.abs(limitado) * 0.07).toFixed(3)})`;
        item.style.opacity = (1 - Math.abs(limitado) * 0.18).toFixed(2);
      }
    });
    if (cerca !== actual) {
      actual = cerca;
      Array.from(puntos.children).forEach((p, i) => p.toggleAttribute('data-activo', i === cerca));
      Array.from(puntos.children).forEach((p, i) => (i === cerca ? p.setAttribute('aria-current', 'true') : p.removeAttribute('aria-current')));
    }
    previo.disabled = cerca === 0;
    siguiente.disabled = cerca === items().length - 1;
  };

  const construir = () => {
    actual = -1;
    puntos.replaceChildren(
      ...items().map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'carrusel-punto';
        b.setAttribute('aria-label', `Ver testimonio ${i + 1}`);
        b.addEventListener('click', () => irA(i));
        return b;
      })
    );
    // Arranca en la tercera captura para que se vea el carrusel a ambos lados.
    irA(window.matchMedia('(min-width: 768px)').matches ? Math.min(2, items().length - 1) : 0, false);
    pintar();
  };

  // Las capturas fuera del carril no cargarían nunca solas: al acercarse la sección se piden todas.
  new IntersectionObserver((entradas, obs) => {
    if (!entradas.some((e) => e.isIntersecting)) return;
    pista.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    obs.disconnect();
  }, { rootMargin: '400px' }).observe(raiz);

  let pendiente = false;
  pista.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; pintar(); });
  }, { passive: true });
  previo.addEventListener('click', () => irA(actual - 1));
  siguiente.addEventListener('click', () => irA(actual + 1));
  window.addEventListener('resize', () => irA(Math.max(actual, 0), false));
  document.addEventListener('contenido:testimonios', construir);
  construir();
}

document.querySelectorAll<HTMLElement>('[data-carrusel]').forEach(iniciar);
