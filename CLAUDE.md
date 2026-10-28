# GreenBits · Instrucciones para Claude

Demo web estático de **GreenBits** (*Lo que sobra, brota*): conecta a productores de San Carlos con compradores locales para vender productos de segunda y biomasa. Es HTML + CSS + JS puro, sin build ni dependencias, publicado en **GitHub Pages**. Todo lo que hace el "backend" (reservas, publicar lotes) está simulado con `localStorage`.

**Antes de cualquier cambio, leé `docs/AI_CONTEXT.md` completo.**

## Reglas de trabajo

- **No hagas commits.** No uses `git commit`, `push`, `add`, `stash`, `reset`, `checkout`, `rebase` ni nada que toque el historial o el staging. Solo lectura: `git status`, `git diff`, `git log`.
- **Al terminar, sugerí la división en commits**: lista ordenada con archivos y mensaje en Conventional Commits en español (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`). Cada commit tiene que dejar el sitio funcionando.
- **No cambies lo que no se pidió** (archivos, carpetas, textos, colores de marca, contenido, comportamiento). Lo que convenga mejorar fuera del alcance va a "Pendientes e ideas" en `docs/AI_CONTEXT.md`.
- **Respetá la arquitectura:** todo el JS en el namespace global `GB`, sin módulos ni bundler. El orden de scripts es `core → data → components → pages → main`, igual en `index.html`, `catalogo.html` y `publicar.html`. Navbar, footer y drawer se generan en `assets/js/components/layout.js`. Diseño basado en tokens de `assets/css/base.css`. Rutas siempre relativas. `localStorage` siempre dentro de `try/catch`.
- **Idiomas:** comentarios del código en inglés y cortos; textos de la interfaz en español con voseo costarricense.
- **Accesibilidad:** WCAG 2.2 AA. Usá los tokens semánticos (nunca colores a mano) y `rem` para tamaños, para que funcionen el modo oscuro y la escala de texto.
- Antes de editar, presentá un plan breve.

**Al terminar cada tarea, agregá una entrada al registro de decisiones en `docs/AI_CONTEXT.md`.**
