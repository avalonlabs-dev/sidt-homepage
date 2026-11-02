# CLAUDE.md

Guía para Claude Code (claude.ai/code) en este repositorio.

## Qué es

Landing comercial de SIDT (Servicios Integrales de Tesis), en español, para Ecuador (`asesoriasidt.com`; `lsec.asesoriasidt.com` sirve el mismo build para los anuncios) y Perú (`ls.asesoriasidt.com`). Astro con salida estática: **una base, dos builds** (`PAIS=ec|pe`). Sin Bootstrap; movimiento con GSAP + ScrollTrigger; fuente Poppins autoalojada con `@fontsource` (300, 400, 600, 800 y 800 itálica); iconos Phosphor (`Icono.astro`, solo los usados como SVG en línea).

La dirección de diseño es obligatoria y está en [docs/diseno-landing.md](docs/diseno-landing.md) (v2: la identidad publicada llevada a otro nivel; tokens, secciones y movimiento). Antes de tocar la interfaz, léela y carga el skill `frontend-design`.

## Comandos

```bash
npm run dev            # PAIS=ec, proxy de /public/landing a API_URL (por defecto http://localhost:3030)
PAIS=pe npm run dev
npm run build          # dist/ec y dist/pe
npm run build:ec | build:pe
```

No hay runner de pruebas: se verifica con el build, `grep` sobre `dist/*/index.html` y revisión en navegador (`python3 -m http.server` sobre `dist/ec`).

## Estructura

```
astro.config.mjs        outDir dist/<PAIS>, build.format 'file' (existe /gracias.html), CSS en línea, proxy de dev
src/config/             tipos, ec.ts, pe.ts (dominio, idioma, título y descripción por país), comun.ts (ids de medición, DOMINIOS_SIDT, VERSIONES hreflang), media.ts (manifest, video), seo.ts (canónica, hreflang, JSON-LD)
src/data/               contenido.ts (cifras, pasos, beneficios, disclaimer), servicios.ts (serviceOptions, categorías con frases, iconos por servicio), redes.ts (redes permitidas y su validación)
src/layouts/Base.astro  <head>: canónica, hreflang, OG/Twitter, JSON-LD, favicons (?v=3), precarga de fuente, gtag AW-17358320939, GTM-58XGL24S, G-Z7C0M4QVTV comentado, conversión de gracias
src/pages/              index.astro, gracias.astro (noindex), robots.txt.ts, sitemap.xml.ts, llms.txt.ts (uno por país en cada build)
src/components/         una pieza por sección (Hero, Cifras, Nosotros con video, Testimonios, Pasos, Beneficios, Servicios...), Forma (piezas de marca), Topografia, Icono
src/scripts/            whatsapp.ts, chat.ts, formularios.ts, contenido.ts, carrusel.ts, servicios.ts (pestañas y autoavance, sin GSAP), video.ts (dialog), movimiento.ts (GSAP, import dinámico tras la primera pintura)
src/styles/             tokens.css (colores, degradados, tipografía, espacio) y base.css/sitio.css
public/                 favicons (ico 16/32/48, png 32/192/512, apple-touch 180), site.webmanifest, og-sidt.jpg (1200x630)
public/media/           medios, video/about01.mp4 y manifest.json (los escribe otro proceso; no editar a mano salvo bytes/audio del video)
scripts/podar-media.mjs deja en cada build solo los medios de su país
deploy/                 desplegar.sh (corre en el servidor), nginx-sidt-landing.conf y nginx-sidt-landing-comun.conf
docs/                   diseno-landing.md, deploy-landing.md, SIDT-CRO.pdf
```

## Reglas que no se rompen

- **Toda diferencia entre países vive en `src/config/{ec,pe}.ts`**: razón social, dominio, código de país, placeholder, número y mensaje de WhatsApp, mensaje de "Ana", universidades y direcciones por defecto. Nunca un número o dominio escrito en componentes: los enlaces salen de `whatsappHref(...)`.
- **Formularios** (dos instancias: `<Formulario compacto />` en el hero y `<Formulario sufijo="-about" compacto />` en Nosotros): `action` a FormSubmit, `_captcha=false`, `_next` de respaldo `https://<dominio del build>/gracias.html`, que `formularios.ts` cambia en el navegador a `location.origin + '/gracias.html'` si el origen es uno de `DOMINIOS_SIDT`, honeypot `_honey`. Los nombres de campo son los mismos; el sufijo `-about` solo afecta a los `id`. En menos de 768 px quedan Nombre, WhatsApp y Carrera/Universidad: los campos con clase `form-row-optional-mobile` se ocultan y `formularios.ts` les quita `required` (un campo `required` oculto bloquea el envío sin mostrar error).
- **WhatsApp**: cada CTA es un `<a data-wa href="https://wa.me/...">` que funciona sin JS. `whatsapp.ts` registra la conversión de Google Ads: en escritorio abre pestaña nueva de forma síncrona; en móvil redirige tras la conversión (con respaldo de 1,2 s). `window.gtag_report_conversion()` sigue disponible.
- **Medición**: no cambiar los ids. `gracias.astro` dispara la conversión con `send_to` `AW-17358320939/Ka2OCL2mr_EaEKvqi9VA`. Cualquier página nueva que reciba envíos necesita ese evento.
- **Widget de "Ana"** (`ChatAna.astro`, `chat.ts`): solo escritorio, a los 8 s, se descarta por `sessionStorage` (`sidtChatClosed`), promo 2x1. La foto es un placeholder (si no hay imagen se muestra la inicial).
- **Contenido administrable** (`contenido.ts`): pide `/public/landing/<pais>` con timeout de 3 s y actualiza WhatsApp, "Dónde estamos" y testimonios (avisa con `contenido:testimonios` y `contenido:listo` para reconstruir el carrusel y recalcular ScrollTrigger). Valida todo, crea nodos con `textContent` (nunca `innerHTML`), solo acepta números de dígitos y rutas de imagen `/public/landing/<pais>/testimonios/<id>/imagen`. Los CTA con `data-wa-sufijo` (categorías de Servicios) conservan el mensaje base y le agregan su sufijo. Si `sucursales` o `testimonios` llegan vacíos, se mantiene lo del build; sin direcciones, la sección "Dónde estamos" queda oculta. El HTML sale completo del build: sin API todo funciona. Contrato en `sidt-app/docs/plan-trabajo/2026-11-02-landings-centralizadas.md`.
- **Estilos**: colores solo como variables de `tokens.css`; el verde de WhatsApp solo en CTA de WhatsApp. Toda sección lleva forma o color de marca de fondo (`.fondo`).
- **Movimiento**: `movimiento.ts` (GSAP) va por import dinámico y dentro de `gsap.matchMedia()`: si no carga o hay `prefers-reduced-motion`, todo queda visible. Solo `transform` y `opacity` (excepción: el trazo `stroke-dashoffset` de la ruta). Las animaciones continuas (formas, líneas, tira) son CSS. Lo que GSAP mueve es el contenedor `.forma`; lo que anima CSS es la imagen de dentro. La clase `pre-anim` la pone un script en línea de `Base.astro` y se retira sola a los 1,5 s.
- **Medios**: se leen de `public/media/manifest.json` con guardas (`config/media.ts`; `hero.estudiante`, `hero.nosotros`, `marca.*`). Si falta algo, compila igual: los logos caen a texto, los testimonios se ocultan y las formas se dibujan en línea. Las fotos son 448×797 y 570×836: no mostrarlas más grandes.

- **SEO**: la canónica de `ec` es `https://asesoriasidt.com/` y la de `pe` `https://ls.asesoriasidt.com/`; hreflang `es-EC`, `es-PE` y `x-default` (raíz) en ambas. `gracias` lleva `noindex`, sin hreflang y fuera del sitemap. El JSON-LD (`config/seo.ts`) solo usa datos presentes en la página: sin reseñas, puntuaciones, direcciones, horarios ni preguntas frecuentes; un `Service` por cada entrada de `serviceOptions`. Si cambian los servicios o el WhatsApp, el JSON-LD y `llms.txt` se actualizan solos desde la configuración.
- **Servicios**: `Servicios.astro` pinta `serviceOptions` como texto visible, en un selector de tres categorías con panel. Sin JS se ven las tres apiladas; `servicios.ts` activa las pestañas y no depende de GSAP. Las claves de `serviceOptions` no se tocan (son de los formularios): lo de presentación va en `detalleServicio`.
- **Redes del pie**: la lista `redes` de la API manda y reemplaza a `config.redes` (vacía por defecto). `leerRed` (`data/redes.ts`) aplica el mismo criterio que la API: `https`, sin credenciales, dominio de esa red. Sin redes válidas no hay contenedor. Los iconos salen de `<template id="redes-iconos">` en `Pie.astro`.
- **Video** (Nosotros): botón "Ver video" (`.etiqueta--video`) que abre un `<dialog>` modal; `video.ts` asigna `src` solo al abrir (`preload="none"`) y lo libera al cerrar. Antes del clic se descargan 0 bytes de video. Nginx debe servir rangos de bytes (lo hace por defecto).
- **Favicons**: con `?v=3`; si cambian, sube la versión en `Base.astro` y `site.webmanifest`.

## Deploy

Lo hace el usuario: ver [docs/deploy-landing.md](docs/deploy-landing.md). En el servidor corre `deploy/desplegar.sh` (`--solo-build`, `--rollback`); nginx con `deploy/nginx-sidt-landing*.conf`. No se ejecuta nada contra producción desde aquí.
