# GreenBits · *Lo que sobra, brota*

Demo web de **GreenBits**: una plataforma que conecta a productores de San Carlos con compradores locales para darle salida a los **productos de segunda** y a la **biomasa** (cáscaras, bagazo, hojas, podas).

> Es un **prototipo de demostración**: los lotes, nombres y precios son de ejemplo y no hay backend. Las acciones (reservar, publicar, alertas) están **simuladas** y se guardan en el navegador (`localStorage`).

---

## Cómo correrlo

No necesita instalar nada: es HTML, CSS y JavaScript puro (sin build).

**Opción A: VS Code + Live Server (recomendada)**
1. Abrí la carpeta del repo en VS Code.
2. Instalá la extensión **Live Server** (Ritwick Dey).
3. Clic derecho sobre `index.html` → **Open with Live Server**.

**Opción B: servidor de Python**
```bash
python -m http.server 5500
# abrir http://localhost:5500
```

**Opción C:** doble clic en `index.html` (también funciona, pero Live Server recarga solo al guardar).

## Publicar en GitHub Pages

1. Subí el contenido a la rama `main` (con `index.html` en la raíz).
2. En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Elegí `main` y la carpeta `/ (root)` → **Save**.
4. En 1–2 minutos queda en `https://<usuario>.github.io/GreenBits/`.

Todas las rutas son relativas, así que funciona igual en local y en Pages. El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

---

## Páginas

| Página | Qué muestra | Qué se simula |
|---|---|---|
| `index.html` | Landing: hero con carrusel, impacto, misión, caso de Eduardo, cómo funciona, lotes destacados | Registro de WhatsApp, alertas por producto |
| `catalogo.html` | Catálogo con búsqueda, pestañas (segunda / biomasa), filtros por producto, zona, precio y entrega, orden | Reserva de un lote → el productor “confirma” a los ~4 s |
| `publicar.html` | Formulario de 4 pasos para productores con vista previa en vivo | Publicación del lote (aparece en el catálogo con etiqueta NUEVO) |

Extras: carrito **“Mis reservas”** (ícono de canasta en el menú) y enlace **“Reiniciar datos del demo”** en el footer para dejar todo limpio antes de presentar.

Enlaces útiles para la presentación:
- `catalogo.html?tipo=biomasa` abre directo la pestaña Biomasa.
- `catalogo.html?q=piña` abre con una búsqueda.
- `catalogo.html?lote=L-001` abre directo el detalle del tomate de Eduardo.

---

## Estructura

```
GreenBits/
├── index.html            # Inicio
├── catalogo.html         # Catálogo de lotes
├── publicar.html         # Publicar un lote
└── assets/
    ├── css/
    │   ├── base.css          # Paleta, tipografías, reset, utilidades
    │   ├── components.css    # Botones, navbar, tarjetas, modal, formularios, footer
    │   ├── a11y.css          # Panel de accesibilidad y modos (alto contraste, etc.)
    │   └── pages/            # Estilos propios de cada página
    ├── img/                  # Logos, isotipos y patrón de la marca
    └── js/
        ├── core/
        │   ├── utils.js      # Helpers ($, formato ₡, íconos SVG…)
        │   └── store.js      # "Backend" simulado con localStorage
        ├── data/lots.js      # Datos de ejemplo (productos, zonas, lotes)
        ├── components/       # Piezas reutilizables (layout, tarjeta, detalle, modal…)
        ├── pages/            # Lógica de cada página (home, catalog, publish)
        └── main.js           # Arranque: arma el layout y llama a la página activa
```

### Convenciones
- Todo el JS cuelga del objeto global `GB` (`GB.utils`, `GB.store`, `GB.pages.catalog`…). Así funciona con `<script>` normales, sin módulos ni bundler.
- El **orden de los scripts** en cada HTML importa: `core → data → components → pages → main`.
- Cada HTML marca su página con `<body data-page="...">`; `main.js` ejecuta `GB.pages[data-page].init()`.
- Navbar y footer se generan desde `assets/js/components/layout.js` (un solo lugar para editarlos).
- Los íconos se escriben en HTML como `<i class="i" data-icon="leaf"></i>` y `main.js` los cambia por SVG.
- Comentarios del código en inglés; textos de la interfaz en español.

### ¿Dónde cambio…?
- **Lotes, productores, zonas o cifras de impacto:** `assets/js/data/lots.js`
- **Textos del carrusel del inicio:** arreglo `SLIDES` en `assets/js/pages/home.js`
- **Colores y tipografías:** variables al inicio de `assets/css/base.css`
- **Menú y footer:** `assets/js/components/layout.js`

### Identidad visual
- Paleta: verde `#034e2f`, naranja `#d07e42`, verde claro `#07945a`, salvia `#c2bb87`, crema `#f8f7f3`, café `#853800`, carbón `#2e332f`.
- Tipografías: **Fraunces** (títulos y productos), **DM Sans** (interfaz y texto), **Cormorant Garamond** (slogan y citas), **Bree Serif** (etiquetas).
- Las imágenes de producto son ilustraciones SVG (`components/illustrations.js`). Si un lote tiene `photo`, la tarjeta muestra la foto.

## Accesibilidad

El botón flotante de abajo a la izquierda abre el **panel de accesibilidad**, disponible en las tres páginas:

- **Tema:** Claro / Oscuro / Sistema (también con el botón sol/luna del menú).
- **Tamaño de texto:** de 90 % a 175 %.
- **Leer en voz alta** (Web Speech API): leer la página o la selección, pausar, detener, elegir la voz y la velocidad (0.5×–2×), y leer al enfocar. En el detalle de cada lote está el botón "Escuchar este lote".
- **Otras opciones:** reducir animaciones (por defecto sigue la configuración del sistema), alto contraste, fuente legible, subrayar enlaces, espaciado de texto ampliado y cursor grande.

Las preferencias se guardan en `localStorage` (`gb.a11y`) y se aplican antes de pintar la página. El sitio apunta a **WCAG 2.2 AA**: enlace "Saltar al contenido", foco visible, navegación completa por teclado y botón para pausar el carrusel.

## Contexto para IA

`CLAUDE.md` y [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md) reúnen las reglas de trabajo, la arquitectura, la identidad visual y el registro de decisiones del proyecto. Si trabajás con un asistente de IA, que los lea antes de cambiar algo y que actualice el registro al terminar.

## Próximos pasos (cuando haya backend)
Reemplazar las funciones de `assets/js/core/store.js` por llamadas `fetch` a la API; el resto del front no necesita cambiar.

---
Prototipo académico del equipo **VerdeBits** · UTN Sede San Carlos.
