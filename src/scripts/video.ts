/**
 * Video de Nosotros en un <dialog> modal. Hasta pulsar "Ver video" no se asigna ningún src
 * (el <video> lleva preload="none"): cero bytes de video al cargar la página.
 * Esc cierra (nativo), el foco queda dentro mientras está abierto y vuelve al botón al cerrar.
 */
const dialogo = document.getElementById('video-dialogo') as HTMLDialogElement | null;
const abrir = document.querySelector<HTMLButtonElement>('[data-video-abrir]');
const video = dialogo?.querySelector('video');

if (dialogo && abrir && video && typeof dialogo.showModal === 'function') {
  abrir.hidden = false; // sin JS el botón no se muestra
  const cerrarBoton = dialogo.querySelector<HTMLButtonElement>('[data-video-cerrar]');

  abrir.addEventListener('click', () => {
    if (dialogo.dataset.poster) video.poster = dialogo.dataset.poster;
    video.src = dialogo.dataset.src ?? '';
    dialogo.showModal();
    cerrarBoton?.focus();
    video.play().catch(() => { /* el navegador exige gesto o está sin audio: quedan los controles */ });
  });

  cerrarBoton?.addEventListener('click', () => dialogo.close());
  // Clic en el fondo oscuro (fuera de la caja) también cierra.
  dialogo.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.video-caja')) dialogo.close();
  });
  // Cualquier cierre (Esc, botón, fondo): pausa, libera el archivo y devuelve el foco.
  dialogo.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.removeAttribute('poster');
    video.load();
    abrir.focus();
  });
}
