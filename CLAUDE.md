# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Landing page estática (sin build, sin package.json, sin tests) para SIDT — Servicios Integrales de Tesis. Dos páginas: [index.html](index.html) (home de una sola página, con anclas) y [gracias.html](gracias.html) (página de agradecimiento post-envío del formulario). Todo el contenido está en español.

## Desarrollo

No hay toolchain: se edita HTML/CSS/JS a mano y se sirve como archivos estáticos.

```bash
python3 -m http.server 8000   # abrir http://localhost:8000/index.html
```

El deploy es subir los archivos al host de `https://lsec.asesoriasidt.com/`.

## Trampa principal: index.html carga sus assets desde producción

`index.html` referencia CSS y JS por URL absoluta a `https://lsec.asesoriasidt.com/css/custom.css` y `https://lsec.asesoriasidt.com/js/*.js` ([index.html:16](index.html#L16), [index.html:1264-1268](index.html#L1264-L1268)), **no** las copias locales en [css/](css/) y [js/](js/). Editar `js/slider.js` localmente no cambia nada en el navegador hasta que ese archivo se sube al host.

Al trabajar en cambios de CSS/JS: cambiar temporalmente esas URLs a rutas relativas (`./css/custom.css`, `./js/...`) para probar, o revertirlas antes de commitear según cómo se despliegue. `gracias.html` sí usa rutas relativas (`./css/custom.css`, `./js/...`), por lo que las dos páginas se comportan distinto en local.

Nota: `gracias.html` carga `./js/menu-handler.js`, que no existe en el repo.

Las imágenes/videos sí son locales: [src/images/](src/images/) y [src/videos/](src/videos/). [src/images_old/](src/images_old/) es material obsoleto — no agregar nada ahí.

## Arquitectura del JS

Scripts globales sin módulos ni bundler; cada uno se auto-inicializa en `DOMContentLoaded` y hace guard por `getElementById`/`querySelector` para poder cargarse en ambas páginas.

- [js/slider.js](js/slider.js) — el contenido vive en el JS, no en el HTML: `slidesData` (hero: título en array de líneas con HTML inline, descripción, imagen) y `testimonialsData` (grupos de 3 testimonios). `SliderContent` y `TestimonialsSlider` renderizan a partir de esos arrays. Para cambiar el hero o los testimonios se editan estos arrays, no el markup.
- [js/form-services.js](js/form-services.js) — selects dependientes categoría → servicio específico vía `serviceOptions` (`titulacion`, `examen_complexivo`, `academico`). Se instancia dos veces, para el formulario del hero (`serviceCategory`/`specificService`) y el de la sección "about" (sufijo `-about`).
- [js/form-validation.js](js/form-validation.js) — validación Bootstrap-style (`is-valid`/`is-invalid`) sobre `form.needs-validation`, más reglas de WhatsApp por código de país (Ecuador/Perú: 9 dígitos empezando en 9; Colombia: 10 empezando en 3).
- [js/whatsapp-handler.js](js/whatsapp-handler.js) y [js/VideoControl.js](js/VideoControl.js) — botones flotantes de WhatsApp y play/pause de los tres videos (`video01`–`video03` con `playButton01`–`03`, IDs cableados).

Hay un segundo slider de testimonios y un `WHATSAPP_LINK` duplicados en el `<script>` inline al final de [index.html](index.html#L1270). El número de WhatsApp y el mensaje están hardcodeados en varios lugares (`js/whatsapp-handler.js`, script inline de index, `gracias.html`) — al cambiarlo, buscarlo en todo el repo.

## Formularios

Ambos formularios de `index.html` postean a `https://formsubmit.co/sidtasesoria.tesis@gmail.com` con `_captcha=false` y `_next=https://lsec.asesoriasidt.com/gracias.html`. No hay backend propio. Los dos formularios comparten nombres de campo salvo por el sufijo `-about` del segundo — mantener esa convención al agregar campos.

El anti-spam es un honeypot: `<input type="text" name="_honey" style="display:none">` en cada `<form>`. FormSubmit descarta el envío si viene relleno. Al agregar un formulario nuevo hay que incluirlo.

En pantallas <768px el formulario se reduce a Nombre, WhatsApp y Carrera/Universidad: las filas con clase `form-row-optional-mobile` se ocultan por CSS y un script inline de `index.html` les quita `required` (un campo `required` oculto bloquea el submit de forma silenciosa). Si se agrega un campo secundario, marcarlo con esa clase.

## Analytics

Google Ads/GTM `AW-17358320939` (y GA `G-Z7C0M4QVTV`, actualmente comentado) en el `<head>` de ambas páginas. La conversión se dispara en `gracias.html` (`gtag('event','conversion', ...)`) y vía `gtag_report_conversion()` en los CTA de `index.html`. Cualquier página nueva que reciba envíos de formulario necesita ese snippet.

## Bloques CRO (junio 2026)

Los cambios de conversión viven **inline en `index.html`** (CSS en el `<style>` del `<head>`, JS en el `<script>` final), a propósito: así funcionan al subir solo esa página, sin depender de los archivos remotos de `lsec.asesoriasidt.com`.

- `gtag_report_conversion()` abre WhatsApp en pestaña nueva en escritorio y redirige en la misma pestaña en móvil. La apertura es síncrona dentro del clic para no ser bloqueada por el navegador.
- Widget de chat `#sidtChatWidget`: solo escritorio, aparece a los 8s, se descarta por sesión con `sessionStorage`. La foto (`avatar01.png`) y el nombre "Ana" son placeholder.
- Sello Turnitin (`.turnitin-badge`) junto a los dos CTA de WhatsApp.
- Sección `.prueba-social` (reels verticales + capturas de WhatsApp) está **comentada** a la espera del material real; sus estilos ya existen y las rutas de archivos esperadas están en el comentario.

## Estilos

[css/custom.css](css/custom.css) es la hoja principal. Además hay bloques `<style>` grandes embebidos en el `<head>` de cada HTML (slider de testimonios, botón flotante de WhatsApp, override global de Poppins con `!important`, breakpoints en 768px/576px). Al ajustar estilos, revisar primero el `<style>` inline: suele ganar sobre `custom.css` por especificidad e `!important`. Bootstrap 5.3.3 llega por CDN.
