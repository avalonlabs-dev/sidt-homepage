# Dirección de diseño de la landing (v2)

La v1 ("hoja corregida", sobria) se descartó: el usuario la vio plana y más pobre que la web publicada. **Esta dirección manda sobre cualquier versión anterior.**

Referencia obligatoria: abre https://lsec.asesoriasidt.com/ y compáralo con tu resultado al mismo tamaño. La nueva debe superarla claramente en riqueza visual, nunca verse más simple.

## Sujeto, público y tarea

SIDT asesora tesis en Ecuador y Perú. Quien llega viene de un anuncio de Google, casi siempre desde el móvil, agobiado. La página tiene una tarea: que escriba por WhatsApp o llene el formulario. Debe sentirse enérgica, cercana y confiable, con gente real y color, no como un documento académico.

## Concepto: la identidad publicada, llevada a otro nivel

Se conserva lo que hace reconocible a SIDT y se le agrega movimiento y acabado. No se inventa otra marca.

### Lo que debe volver

| Elemento | En la web actual | En la nueva |
|---|---|---|
| Personas | Recortes grandes de estudiantes | Protagonistas del hero y de Nosotros, grandes, saliendo de su forma de fondo |
| Formas amarillas | Mancha orgánica tras el formulario, círculos en bordes | Mancha que cambia de forma lentamente; círculos que se mueven con el scroll |
| Destellos violetas | Estrella de rayos en esquinas | Giran lento, varios tamaños |
| Logo en marca de agua | Mano y libro en el borde | Más presente, con parallax suave |
| Franja de cifras | Degradado Añil a Tinta con líneas topográficas | Igual, con líneas animadas y contadores que suben al entrar |
| Formulario en el hero | Visible al llegar | Visible al llegar en escritorio; en móvil, justo bajo el CTA |
| Beneficios | Tarjetas violetas con icono en círculo amarillo | Tarjetas con degradado, icono animado y brillo que sigue al cursor |
| Pasos | Tarjetas numeradas | Ruta conectada: una línea que se dibuja con el scroll y activa cada paso |
| Testimonios | Carrusel con flechas y puntos | Carrusel con flechas y puntos, tarjetas en tres dimensiones suaves |
| Logos de universidades | Tira en movimiento | Tira infinita, con pausa al pasar el cursor |

Toda sección debe tener algo de color o forma de marca de fondo. Ninguna sección plana sobre lila.

## Tokens

| Nombre | Hex | Uso |
|---|---|---|
| Tinta | `#27005C` | Marca, títulos, pie |
| Añil | `#525FE1` | Degradados con Tinta, enlaces |
| Violeta vivo | `#7B2FFF` | Degradados de tarjetas |
| Amarillo | `#FFC500` | Formas, iconos, acentos |
| Blanco | `#FFFFFF` | Fondo principal |
| Lila | `#F5F3FF` | Bloques alternos |
| Grafito | `#2E2A3A` | Texto |
| WhatsApp | `#25D366` | CTA de WhatsApp |

Tipografía: **Poppins** autoalojada con `@fontsource` (300, 400, 600, 800), la fuente de la web actual. El titular mezcla pesos ligeros y negros como hoy: "Estás a **un paso** de dejar de sentirte **solo** frente a la ***TESIS***." Retira Literata y Caveat.

## Hero en escritorio

```
┌──────────────────────────────────────────────────────────┐
│ logo + razón social                        [WhatsApp]    │
│ ✺                                                     ✺  │
│ Estás a un paso     ╭ mancha ───────╮        persona     │
│ de dejar de         │ ┌ formulario ┐│        recorte     │
│ sentirte solo       │ └────────────┘│        grande      │
│ frente a la TESIS.  ╰───────────────╯   [Tesis 100%]     │
│ [WhatsApp] sello                         [+2K graduados] │
├──────────────────────────────────────────────────────────┤
│ franja degradada: +15   +2K   +2.5K con contadores       │
└──────────────────────────────────────────────────────────┘
```

Secuencia de entrada, una sola y orquestada con un timeline de GSAP: mancha crece, persona sube, titular entra por líneas, formulario aparece, etiquetas flotantes. Menos de 1,2 s. El formulario debe poder usarse desde el primer momento.

## Orden de secciones

1. Hero con formulario.
2. Franja de cifras.
3. Tira de universidades.
4. Nosotros: persona + segundo formulario (`-about`) + CTA.
5. Servicios: selector de categorías con panel protagonista (ver "Nuestros servicios").
6. Testimonios.
7. Pasos.
8. Beneficios.
9. Dónde estamos: tarjetas con icono de ubicación, oculta si no hay sucursales.
10. Disclaimer y pie oscuro, con iconos de redes si el país las tiene configuradas.

Son **dos** formularios, como en producción. Quita el tercero. El video de Nosotros no se muestra en línea: va detrás de la etiqueta flotante "Ver video" (sobre la foto), que abre un `<dialog>` y solo entonces descarga el archivo.

## Movimiento

- **GSAP + ScrollTrigger**, con `gsap.matchMedia()`. Con `prefers-reduced-motion` todo queda estático y visible.
- Consulta la guía oficial con Context7: biblioteca `/greensock/gsap-skills`.
- Solo `transform` y `opacity`; sin saltos de diseño. Si GSAP no carga, todo debe verse y funcionar.
- En móvil, efectos reducidos: sin parallax pesado.
- Contenido siempre visible para quien no ejecuta JS: las revelaciones parten de una clase que agrega el script.

## Iconos

Librería con estilo coherente (Phosphor, duotone o fill), importando solo los usados como SVG en línea.

## Piso de calidad

Primero móvil, sin desbordes. Foco visible. Contraste AA. Imágenes con `width` y `height`, `loading="lazy"` bajo el pliegue; la persona del hero con `fetchpriority="high"`. JS total comprimido menor a 90 KB.

## Nuestros servicios

La versión de tres tarjetas blancas fue rechazada: "se ve muy vacio y muerto". Titulación tiene 9 servicios y las otras dos categorías 3, así que tres tarjetas iguales siempre dejarán huecos. Debe tener tracción comercial, con la misma energía de "Pasos después de contratar".

Dirección: un selector de tres categorías con panel protagonista. Va más arriba en la página, entre Nosotros y Testimonios.

```
Escritorio
┌────────────────────┬─────────────────────────────────────┐
│ Titulación   ●─────┤ Panel con degradado Tinta a Añil    │
│ Examen complexivo  │ título, frase, servicios en fichas  │
│ Trabajos académicos│ con icono propio, forma amarilla    │
│                    │ [Cotizar Titulación por WhatsApp]   │
└────────────────────┴─────────────────────────────────────┘
```

- Una línea conecta la categoría activa con el panel y se mueve al cambiar, en el lenguaje de la ruta de Pasos.
- Las fichas entran en cascada al cambiar de categoría. Cada servicio lleva su icono Phosphor.
- Cambia sola cada pocos segundos mientras nadie interactúe y se pausa al primer gesto, con indicador de progreso en la categoría activa. Sin autoavance con `prefers-reduced-motion`.
- Cada panel tiene un CTA propio a WhatsApp, que usa `gtag_report_conversion()` y menciona la categoría en el mensaje.
- Accesible como pestañas: teclado, `aria-selected`, foco visible.
- Móvil: categorías como pastillas deslizables o acordeón, sin huecos.
- **SEO:** todo el texto de las tres categorías está en el HTML y es visible sin JS.

Implementado así:

- Sin JS las tres categorías se ven apiladas dentro del panel. `servicios.ts` activa las pestañas al cargar. Los paneles comparten celda de rejilla, por eso cambiar de categoría no mueve la página.
- Selector, línea, cascada y progreso no dependen de GSAP: son CSS y JS propio. El tiempo del autoavance (7 s) lo lleva la animación CSS de progreso; se pausa con cursor, foco o sección fuera de vista, y se detiene al primer toque, clic o tecla.
- Las categorías cortas (3 servicios) usan fichas grandes con frase de apoyo que ocupan el alto del panel. Titulación usa fichas compactas. En móvil, las tres categorías caben en una fila de tres pastillas, sin deslizar.
