import { serviceOptions } from '../data/servicios';
import { DOMINIOS_SIDT } from '../config/comun';

/* ===== `_next`: la página de gracias del mismo dominio donde está la persona =====
   La raíz, www, lsec y ls sirven el mismo build; si no se ajustara, quien llega por lsec
   terminaría en otro dominio. El valor del build queda de respaldo (otro origen, desarrollo). */
if (DOMINIOS_SIDT.includes(location.hostname)) {
  document.querySelectorAll<HTMLInputElement>('form.formulario input[name="_next"]').forEach((campo) => {
    campo.value = `${location.origin}/gracias.html`;
  });
}

/* ===== Formulario reducido en móvil (<768 px): Nombre, WhatsApp y Carrera/Universidad =====
   A los campos ocultos hay que quitarles `required`: si no, el navegador bloquea el envío
   intentando enfocar un campo invisible y la persona no ve ningún error. */
const movil = window.matchMedia('(max-width: 767.98px)');
function aplicarCamposMovil() {
  document.querySelectorAll<HTMLElement>('.form-row-optional-mobile').forEach((fila) => {
    fila.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((campo) => {
      if (movil.matches) {
        if (campo.hasAttribute('required')) {
          campo.setAttribute('data-was-required', 'true');
          campo.removeAttribute('required');
        }
      } else if (campo.getAttribute('data-was-required') === 'true') {
        campo.setAttribute('required', 'required');
      }
    });
  });
}
aplicarCamposMovil();
movil.addEventListener('change', aplicarCamposMovil);

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
