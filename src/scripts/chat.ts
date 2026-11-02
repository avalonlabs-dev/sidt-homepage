/** Widget de "Ana": solo escritorio, aparece a los 8 s, se descarta por sesión. */
import { reportarConversion } from './whatsapp';

const RETARDO_MS = 8000;
const CLAVE = 'sidtChatClosed';

function iniciar() {
  const widget = document.getElementById('sidtChatWidget');
  const cerrar = document.getElementById('sidtChatClose');
  const cta = document.getElementById('sidtChatCta');
  if (!widget || !cerrar || !cta) return;
  // En celulares queda solo el botón flotante verde.
  if (window.matchMedia('(max-width: 767.98px)').matches) return;

  let descartado = false;
  try { descartado = sessionStorage.getItem(CLAVE) === '1'; } catch { /* sessionStorage bloqueado: se muestra igual */ }
  if (!descartado) setTimeout(() => widget.classList.add('visible'), RETARDO_MS);

  cerrar.addEventListener('click', () => {
    widget.classList.remove('visible');
    try { sessionStorage.setItem(CLAVE, '1'); } catch { /* reaparece en la próxima carga */ }
  });

  cta.addEventListener('click', () => {
    // Apertura síncrona dentro del clic; usa el mismo evento de conversión.
    reportarConversion(widget.dataset.link ?? '#');
    widget.classList.remove('visible');
  });
}
iniciar();
