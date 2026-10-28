# GreenBits · Contexto para IA

> Memoria viva del proyecto. Leela completa antes de trabajar y actualizala al terminar
> (sobre todo el **Registro de decisiones** y **Pendientes e ideas**).

## Resumen del proyecto

- **Qué es:** demo web de GreenBits (*Lo que sobra, brota*), una plataforma que conecta a productores de San Carlos (Alajuela, Costa Rica) con compradores locales para darle salida a **productos de segunda** (fruta y verdura fuera del estándar) y a la **biomasa** (cáscaras, bagazo, hojas, podas). Es un prototipo académico del equipo VerdeBits (UTN, Sede San Carlos).
- **Stack:** HTML + CSS + JavaScript puro, sin build, sin npm y sin CDNs de JS. Las únicas dependencias externas son las fuentes de Google Fonts.
- **Datos:** todo es de ejemplo (`assets/js/data/lots.js`). No hay backend: reservas, lotes publicados y preferencias se guardan en `localStorage`.
- **Cómo se corre:** Live Server de VS Code, `python -m http.server 5500` o doble clic en `index.html`.
- **Despliegue:** GitHub Pages desde `main` / root. Todas las rutas son relativas; `.nojekyll` evita el procesamiento con Jekyll.

## Arquitectura y convenciones

- **Páginas:** `index.html` (inicio), `catalogo.html`, `publicar.html`. Cada una marca `<body data-page="home|catalog|publish">` y `main.js` ejecuta `GB.pages[page].init()`.
- **Namespace global `GB`:** cada script es una IIFE que cuelga de `window.GB` (`GB.utils`, `GB.store`, `GB.data`, `GB.ui`, `GB.a11y`, `GB.speech`, `GB.layout`, `GB.lotCard`, `GB.lotDetail`, `GB.reveal`, `GB.pages.*`). No hay módulos ES.
- **Orden de scripts (igual en las 3 páginas):**
  `core/utils.js → data/lots.js → core/store.js → components/illustrations.js → components/ui.js → components/a11y.js → components/speech.js → components/lot-card.js → components/lot-detail.js → components/layout.js → components/reveal.js → pages/<página>.js → main.js`.
- **Arranque (`main.js`, en `DOMContentLoaded`):** hidrata íconos → `GB.layout.init()` → `GB.speech.init()` → `GB.a11y.init()` → página → `GB.reveal.init()`.
- **Layout compartido:** el skip link, el banner de demo, la navbar, el footer y el drawer "Mis reservas" se generan en `assets/js/components/layout.js`. Las páginas solo tienen `<div data-layout="header" data-variant="transparent|solid">` y `<div data-layout="footer">`.
- **Íconos:** en el HTML se escriben como `<i class="i" data-icon="nombre"></i>` y `main.js` los reemplaza por SVG (`GB.utils.icon`). Todos los SVG llevan `aria-hidden="true"`.
- **Ilustraciones de producto:** SVG en `components/illustrations.js`. Si un lote tiene `photo`, la tarjeta muestra la foto.
- **Store simulado (`core/store.js`):** claves `gb.reservations` y `gb.userLots`, con `try/catch` y un bus `subscribe` para reaccionar a cambios. "Reiniciar datos del demo" borra solo esas dos claves; las preferencias de accesibilidad (`gb.a11y`) se mantienen.
- **CSS:**
  - `base.css`: tokens (paleta de marca + tokens semánticos con `light-dark()`), reset, utilidades, `.skip-link`, `.only-light`/`.only-dark` y reglas de `.reduce-motion`.
  - `components.css`: botones, navbar, tarjetas, chips, formularios, modal, drawer, toasts, footer y detalle del lote.
  - `pages/*.css`: estilos de cada página.
  - `a11y.css`: panel de accesibilidad y modos opcionales. Se carga **último** en las 3 páginas.
- **Reglas para estilos nuevos:**
  - **Colores:** nunca a mano; usá tokens (`--bg`, `--bg-elevated`, `--bg-muted`, `--text`, `--text-muted`, `--text-strong`, `--border`, `--border-strong`, `--accent-text`, `--accent-display`, `--accent-strong`, `--warn-*`, `--ok-*`, `--danger`, `--on-dark*`, `--focus-ring`, etc.).
  - **Tamaños:** en `rem` (tipografía, espaciados, controles y anchos que contienen texto). Bordes, radios y sombras pueden quedar en `px`.
  - **Superficies verdes de marca** (hero, footer, bandas) usan texto crema en ambos temas.
- **Utilidades JS:** `GB.utils.trapFocus(event, container)`, `focusables(container)` y `setInvalid(input, errorEl, invalid)` (pone `aria-invalid` y `aria-describedby`).
- **Accesibilidad (`GB.a11y`):** `get(key)`, `set({...})`, `reset()`, `onChange(fn)`, `prefersReducedMotion()`, `scrollBehavior()` y `resolvedTheme()`. Cualquier animación o scroll nuevo hecho desde JS tiene que consultar `GB.a11y.prefersReducedMotion()` / `scrollBehavior()`.

## Identidad visual (no modificar sin pedirlo)

- **Paleta de marca:** verde `#034e2f` (principal), naranja `#d07e42` (acento), verde claro `#07945a`, naranja suave `#d79259`, salvia `#c2bb87`, crema `#f8f7f3`, café `#853800`, carbón `#2e332f` y pizarra `#455048`.
- **Variantes accesibles del naranja** (tokens, no reemplazan la marca):
  - `--accent-strong #b0612a`: fondo de los botones y badges naranjas con texto blanco.
  - `--accent-text #9c4f1a`: texto naranja chico.
  - `--accent-display #bf6d33`: texto naranja grande.

  El naranja de marca sobre crema da 2.9:1 y no cumple AA.
- **Tipografías:**
  - **Fraunces:** títulos y nombres de producto.
  - **DM Sans:** interfaz y texto.
  - **Cormorant Garamond:** slogan y citas.
  - **Bree Serif:** etiquetas como NUEVO/AGOTADO y el código de reserva.
- **Slogan:** "Lo que sobra, brota" (footer, banda CTA, pantalla de éxito al publicar y primera diapositiva del hero).
- **Logos** (`assets/img/`):
  - `logo-wordmark.png`: verde y naranja, para fondos claros.
  - `logo-wordmark-light.png`: crema y naranja, para fondos oscuros, el hero, el footer y la navbar sólida en modo oscuro.
  - `isotipo.png` (verde), `isotipo-orange.png` y `favicon.png`.
- **Patrón:** `pattern.jpg` / `pattern-sm.jpg` (hojas y piña). Se usa en el hero, las tarjetas de misión, la historia de Eduardo, el encabezado del catálogo y la banda CTA.
- **Efecto del hero:** el título gigante se dibuja dos veces y ambas capas se recortan con `clip-path` en `--split`:
  - a la izquierda, letras rellenas con el patrón (`background-clip: text`);
  - a la derecha, letras crema sólidas.

## Funcionalidades actuales

- **Inicio (`index.html`, `pages/home.js`):**
  - **Hero:** carrusel de 3 diapositivas (`SLIDES`) con kicker, título doble capa, texto y CTA. A la derecha, la tarjeta "Lote destacado" (abre el detalle) y los controles pausa ← →, más el indicador vertical de puntos. Autoplay cada 7 s, que se pausa con hover o foco y queda desactivado con movimiento reducido.
  - **Impacto:** cifras con contador animado (`data-count`) y el formulario de alertas por WhatsApp (simulado, con error asociado).
  - **Misión:** 3 tarjetas.
  - **Caso de Eduardo:** mockup de celular.
  - **Cómo funciona:** 3 pasos y tipos de compradores.
  - **Lotes frescos:** carrusel horizontal y el formulario "Avisame cuando haya…".
  - **Banda CTA** para productores.
- **Catálogo (`catalogo.html`, `pages/catalog.js`):**
  - Búsqueda sin acentos, pestañas Todos/Segunda/Biomasa con conteos y filtros por producto, zona, precio máximo, entrega y agotados.
  - Orden, chips de filtros activos, estado vacío y contador `aria-live`.
  - En ≤ 900 px los filtros pasan a un panel off-canvas.
  - Parámetros de URL: `?tipo=`, `?q=`, `?zona=`, `?lote=` (este último abre el detalle).
- **Detalle de lote (`components/lot-detail.js`):**
  - Modal con datos, botón "Escuchar este lote" y formulario de reserva (cantidad, fecha, retiro o entrega).
  - **Simulación:** la reserva se guarda y el productor la "confirma" a los ~4.5 s (toast y estado en "Mis reservas").
- **Publicar (`publicar.html`, `pages/publish.js`):**
  - Asistente de 4 pasos (qué, cuánto, precio y zona, contacto y foto) con vista previa en vivo y sugerencia de precio.
  - Al publicar, el lote se guarda en `gb.userLots` y aparece en el catálogo con la etiqueta NUEVO.
  - La foto se redimensiona con `<canvas>`.
- **Comunes:**
  - Drawer "Mis reservas" (canasta), toasts, "Reiniciar datos del demo" en el footer y banner de prototipo.
  - Botón sol/luna de la navbar: alterna entre claro y oscuro.
- **Accesibilidad:**
  - **Panel flotante** (abajo a la izquierda; `a11y.js`):
    - tema Claro/Oscuro/Sistema;
    - tamaño de texto 90–175 %;
    - lectura en voz alta (`speech.js`);
    - reducir animaciones, alto contraste, fuente legible, subrayar enlaces, espaciado de texto y cursor grande;
    - botón Restablecer.
  - **Persistencia:** todo se guarda en `gb.a11y` y un script inline en el `<head>` lo aplica antes de pintar.
  - **Base:**
    - skip link a `main#contenido`, foco visible con `--focus-ring` y trampas de foco en modal, drawer y panel;
    - `aria-current` en el menú, errores con `aria-invalid`/`aria-describedby` y áreas táctiles ≥ 24 px.

## Registro de decisiones (más reciente arriba)

### 2026-10-27 · Menú móvil oculto con `clip-path` en vez de `translateX`
- **Qué:** el menú off-canvas cerrado ahora se recorta con `clip-path: inset(0 0 0 100%)` + `visibility: hidden`, en vez de moverse fuera de pantalla.
- **Dónde:** `components.css` (`.navbar.is-compact .navbar__links`).
- **Por qué:** con `translateX(100%)`, el menú fijo ensanchaba el viewport de layout en móvil (`scrollWidth` 710 en un viewport de 390), lo que agrandaba la navbar fija y dejaba el botón de menú fuera de pantalla con texto grande. `clip-path` no afecta el layout. `visibility: hidden` saca los enlaces del orden de tabulación cuando el menú está cerrado.
- **Notas / impacto:** la animación ahora es un barrido (clip) en lugar de un deslizamiento.

### 2026-10-27 · Escala de texto: `rem` en todo el CSS + navbar compacta medida por JS
- **Qué:**
  - Todos los tamaños de texto, espaciados, controles y anchos con texto pasaron de `px` a `rem` (con un script; bordes, radios, sombras y media queries quedaron en `px`).
  - El panel cambia `html { font-size }` en pasos de 90, 100, 112.5, 125, 150 y 175 %.
- **Dónde:** todos los CSS, más `layout.js` (`bindCompactMode`), `a11y.js` (`apply`) y `home.css` (container query de `.stats`).
- **Por qué:** las media queries en `px` (o en `em`) no reaccionan al `font-size` de `html`. Para que no se rompa nada a 175 %:
  - la navbar pasa a menú compacto cuando los enlaces no entran (medido con `scrollWidth`) o con ≤ 900 px;
  - las grillas usan mínimos en `rem`;
  - las cifras de impacto usan una container query en `rem`;
  - `.a11y-text-lg` (≥ 150 %) permite títulos de 3 líneas en las tarjetas.

  Descarté `container-type` en `body`/`main` porque convierte a esos elementos en bloque contenedor de los `position: fixed` (rompería el modal, los filtros y el menú).
- **Notas / impacto:**
  - Los íconos de `.icon-btn` tienen tope de 52 px (no necesitan crecer con el texto).
  - El logo solo se encoge en modo compacto. Así la medición detecta cuando los enlaces no entran.
  - El título gigante del hero en móvil se limita con `16vw`; el `19vw` original ya cortaba "PERFECTA." 34 px.

### 2026-10-27 · Reducir animaciones con clase `.reduce-motion` en `<html>`
- **Qué:** la clase se pone desde `prefers-reduced-motion` o desde el panel. Con la clase activa:
  - **CSS:** las animaciones y transiciones duran 0.01 ms, el `scroll-behavior` pasa a `auto` y el fondo del hero pasa de `fixed` a `scroll`;
  - **JS:** sin autoplay del carrusel, contadores con el valor final, `.reveal` visible y carruseles y scroll sin `smooth`.
- **Dónde:**
  - **CSS:** `base.css` (`.reduce-motion`) y `a11y.css`.
  - **JS:** `GB.a11y.prefersReducedMotion()` / `scrollBehavior()` en `home.js`, `reveal.js`, `catalog.js` y `publish.js`.
- **Por qué:** una sola fuente de verdad, que además permite apagar la opción aunque el sistema la pida. Uso 0.01 ms en vez de `animation: none` porque los toasts se eliminan en `animationend`.
- **Notas / impacto:**
  - El hero tiene un botón de pausa visible (WCAG 2.2.2) y pausa al recibir foco. Con la pausa activa, el contenido del slide se anuncia (`aria-live="polite"`).
  - `lot-detail.js` no anima nada desde JS, así que no necesitó la consulta. El giro del ícono "esperando confirmación" lo cubre el CSS.

### 2026-10-27 · Lector en voz alta en `components/speech.js`
- **Qué:**
  - `GB.speech`: lee `<main>` por bloques, la selección, el detalle del lote o (si está activado) lo que recibe foco o hover.
  - Se elige la voz en español en este orden: es-CR, es-419, es-MX, es-US y luego cualquier `es-*`.
  - Controles de reproducir, pausar y detener, más velocidad de 0.5× a 2× (aplica desde la frase siguiente).
- **Dónde:** `speech.js`, sección "Leer en voz alta" del panel (`a11y.js`), `lot-detail.js` (`spokenSummary`), `ui.js` (evento `gb:modal-close`) y `a11y.css` (`.is-reading`).
- **Por qué:**
  - Las frases se parten en trozos de ≤ 220 caracteres porque Chrome corta las locuciones largas.
  - Un `runId` invalida los callbacks de locuciones canceladas.
  - Precios y unidades se normalizan ("₡1 200/kg" → "1200 colones por kilo").
  - Se saltan `aria-hidden`, `[hidden]` y lo no visible, así que en el hero se lee el `h1` accesible y no las dos capas del título.
  - La selección se recuerda en `selectionchange` porque al hacer clic en el panel puede perderse. Solo se conserva si quien la borró fue un `pointerdown` dentro del panel; si el usuario deselecciona, se olvida.
  - Se separó de `a11y.js` para mantener archivos chicos.
- **Notas / impacto:**
  - Como pidió la especificación, cerrar el panel o el modal detiene la lectura, y también se detiene al salir de la página (`pagehide`).
  - Lo probé con un `speechSynthesis` simulado (headless no tiene audio). Las voces reales hay que probarlas en Chrome, Edge o Safari.

### 2026-10-27 · Panel de accesibilidad: `a11y.js` + `a11y.css` separados
- **Qué:**
  - Botón flotante abajo a la izquierda (`aria-expanded`, `aria-controls`) que abre un `role="dialog"` con foco atrapado. Escape lo cierra y devuelve el foco al botón.
  - Botón sol/luna en la navbar (`aria-pressed`).
  - Preferencias en una sola clave, `gb.a11y`, y botón Restablecer.
- **Dónde:** `assets/js/components/a11y.js`, `assets/css/a11y.css`, `layout.js` (botón `data-theme-toggle`) y `main.js`.
- **Por qué:** un CSS propio, cargado al final, puede sobrescribir los estilos de cada página sin pelear la especificidad, y la funcionalidad queda aislada y fácil de quitar. Descarté una sección dentro de `components.css`, que ya es largo.
- **Notas / impacto:**
  - El panel no se cierra con clic afuera, para poder seleccionar texto y usar "Leer selección".
  - El botón flotante queda debajo del modal y el drawer (z-index 80/85).
  - **Si agregás una opción con clase en `<html>`,** actualizá `CLASS_FLAGS` en `a11y.js` **y** el script inline del `<head>` de las 3 páginas.

### 2026-10-27 · Modo oscuro con `light-dark()` + `color-scheme`
- **Qué:** los tokens semánticos se definen una sola vez como `light-dark(claro, oscuro)`.
  - **Sistema (por defecto):** `:root` tiene `color-scheme: light dark` y sigue `prefers-color-scheme`.
  - **Claro/Oscuro forzados:** `[data-theme="light|dark"]` fija `color-scheme`.
  - Se agregó `<meta name="color-scheme" content="light dark">`.
  - Se migraron a tokens todos los colores escritos a mano (`#fff`, `rgba(...)` de tarjetas, inputs, chips, modal, drawer, toasts, alert-box, stepper, segmented, switches, etc.).
- **Dónde:** `base.css`, `components.css`, `pages/*.css`, `lot-card.js` (`.lot-card__new--soldout` en vez del estilo inline) y `layout.js` (logos `.only-light` / `.only-dark`).
- **Por qué:** evita duplicar el bloque de tokens oscuros (uno bajo `[data-theme="dark"]` y otro bajo `@media (prefers-color-scheme: dark)`, que fue la alternativa descartada). Además, `color-scheme` adapta los controles nativos (selects, scrollbars).
- **Notas / impacto:**
  - **Compatibilidad:** `light-dark()` requiere Chrome/Edge 123+, Firefox 120+ o Safari 17.5+ (2024).
  - Los fondos pastel de las ilustraciones (`.tone-*`) y las etiquetas sobre ellos se mantienen claros a propósito en ambos temas. El texto encima usa colores fijos oscuros.
  - Se evita el FOUC con el script inline del `<head>`.

### 2026-10-27 · Contraste AA: variantes accesibles del naranja y foco
- **Qué:** se agregaron tokens `--accent-text`, `--accent-display`, `--accent-strong`, `--success-text` y `--focus-ring`.
  - Los botones y badges naranjas usan `#b0612a`; el hover pasó a `--c-brown`.
  - Los textos naranjas usan `#9c4f1a` (chico) o `#bf6d33` (grande).
  - El anillo de foco usa `#b0612a` sobre claro y `#d79259` sobre superficies verdes.
- **Dónde:** `base.css` y todos los CSS donde había `color: var(--c-orange)` o `background: var(--c-orange)` con texto blanco.
- **Por qué:** blanco sobre `#d07e42` da 3.11:1 y `#d07e42` sobre crema da 2.90:1, ambos por debajo de AA. Se mantuvo el tono de marca y solo se oscureció lo necesario. El naranja `#d07e42` sigue en logos, decoraciones, puntos y bordes.
- **Notas / impacto:** **cambio visible** en los CTA naranjas y en las palabras en itálica de los títulos (un naranja un poco más profundo). Si el equipo prefiere el tono original, se revierte cambiando esos tokens en `base.css`.

### 2026-10-27 · Base de accesibilidad (WCAG 2.2 AA)
- **Qué:**
  - **Navegación y foco:**
    - skip link "Saltar al contenido" (primer elemento enfocable) hacia `<main id="contenido" tabindex="-1">`;
    - `aria-current="page"` en el menú;
    - trampa de foco y retorno de foco en el modal y el drawer;
    - Escape cierra el menú móvil y los filtros off-canvas; los paneles cerrados quedan fuera del orden de tabulación (`visibility: hidden`) y los filtros usan `aria-expanded`.
  - **Carrusel del hero:** botón de pausa; los puntos pasaron de `role="tab"` sin panel a botones con "Diapositiva n de 3" y `aria-current`, con área de 24×24.
  - **Formularios:**
    - errores con `aria-invalid` + `aria-describedby` en el asistente de publicar (ids `err-*`; el paso 1 usa un `radiogroup` etiquetado);
    - error visible y asociado en el formulario de WhatsApp (reemplaza al toast de error).
  - **Áreas táctiles:** ≥ 24 px (chips, botón "Limpiar", quitar filtro); redes sociales a 44 px.
- **Dónde:** `layout.js`, `ui.js`, `utils.js` (`trapFocus`, `focusables`, `setInvalid`), `home.js`, `catalog.js`, `publish.js`, las 3 páginas HTML, `index.html` (`#join-error`) y `publicar.html`.
- **Por qué:** checklist de la sección 3.7 del pedido.
- **Notas / impacto:** `.btn` ya no usa `white-space: nowrap`, para que los botones puedan partirse a 175 % sin desbordar.

### 2026-10-27 · Tarjetas de lote alineadas
- **Qué:**
  - El título ocupa exactamente 2 líneas (`line-clamp: 2` y `min-height: 2 × line-height`).
  - La meta es una grilla fija de 2 columnas (kg | zona / fecha | productor).
  - La tarjeta ocupa el 100 % del alto de la fila; el precio y la flecha siguen abajo con `margin-top: auto`.
- **Dónde:** `components.css` (`.lot-card*`) y `lot-card.js` (las 4 metas en un solo contenedor).
- **Por qué:** con títulos de 2 líneas, la meta (que se partía distinto según el ancho) y los precios quedaban desalineados entre tarjetas vecinas.

### 2026-10-27 · Hero: flujo vertical, sin superposición, tarjeta en la fila de las flechas
- **Qué:**
  - El hero pasó de posiciones absolutas independientes (`top: 25%` / `bottom: 9%`) a un flujo flex vertical: título arriba y una fila inferior (`.hero__bottom`) con el texto y los CTA a la izquierda, y la tarjeta destacada, la pausa y las flechas a la derecha, todo sobre la misma base.
  - Hay más aire entre el kicker y el título (`0.45em`).
  - Tamaño del título: `clamp(3.75rem, min(11.5vw, 19vh), 11.25rem)`.
- **Dónde:** `index.html` (estructura del hero), `pages/home.css` (sección HERO) y `home.js`.
- **Por qué:** en 1850×845 el título se montaba sobre el párrafo. Ahora, si falta alto, el hero crece en vez de superponerse.
  - **Capa sólida:** está en el flujo.
  - **Capa de relleno:** es absoluta, cubre todo el hero con el mismo `padding` y lleva el `background-clip: text`. Por eso las dos quedan alineadas, y el patrón coincide con `.hero__bg` tanto con `background-attachment: fixed` como con `scroll` (necesario para reducir movimiento).
- **Notas / impacto:** verificado en 1850×845, 1440×900, 1366×768 y 390×844 (las capas difieren en < 0.5 px).

### 2026-10-27 · Creación del contexto para IA
- **Qué:** se crearon `CLAUDE.md` (lo lee Claude Code automáticamente) y este archivo.
- **Dónde:** raíz del repo y `docs/`.
- **Por qué:** dar continuidad entre sesiones: reglas de trabajo (sin commits, sugerir la división de commits, no tocar lo que no se pidió), arquitectura, identidad y decisiones.

## Pendientes e ideas

- **HTML inválido en tarjetas:** `<h3>` dentro de `<button class="lot-card">` (un botón solo admite contenido de frase). Además, el `aria-label="Ver …"` de la tarjeta oculta la meta y el precio a los lectores de pantalla. Opción: un `<article>` con un enlace o botón "Ver" estirado sobre la tarjeta.
- **Pestañas del catálogo:** usan `role="tab"` sin `tabpanel` y sin navegación con flechas. Convertirlas en botones con `aria-pressed` o completar el patrón de pestañas.
- **Nombre accesible del campo cantidad:** en `publicar.html` el `<label>` envuelve también el texto de error, así que con el error visible el nombre del campo lo incluye (y además está en `aria-describedby`). Conviene separar el label.
- **Breakpoints en `px`:** no reaccionan al tamaño de texto. Se mitigó (navbar medida por JS, grillas en `rem`, container query en las cifras de impacto), pero otras grillas de 2–4 columnas se mantienen en escritorio a 175 % (siguen sin overflow). Convertir más secciones a container queries si hace falta.
- **Botón "Reiniciar datos del demo":** tiene estilos inline (`opacity: .7`). Moverlos a una clase y verificar su contraste.
- **Otros detalles:**
  - Los enlaces de redes sociales apuntan a `#`.
  - Los toasts insertan el mensaje con `innerHTML` (algunos llamadores escapan y otros no).
  - El carrusel "Lotes frescos" no deshabilita las flechas en los extremos.
- **Compatibilidad de `light-dark()`:** en navegadores anteriores a 2024 los colores se pierden. Si hiciera falta soporte viejo, agregar valores de respaldo antes de cada token.
- **Lector de voz:**
  - Probarlo con voces reales en Chrome, Edge, Safari e iOS. Firefox en Windows suele tener pocas voces en español.
  - Evaluar un mini reproductor flotante para seguir leyendo con el panel cerrado (hoy cerrar el panel detiene la lectura, como pidió la especificación).
- **Animación `.reveal`:** el contenido con `.reveal` depende de JS para verse (no tiene respaldo sin JS). Esto ya pasaba antes de estos cambios.
- **Naranja más oscuro:** confirmar con el equipo de marca el uso de `#b0612a` en los CTA (ver la decisión de contraste AA).
