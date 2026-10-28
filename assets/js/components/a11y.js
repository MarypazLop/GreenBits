/* ==========================================================================
   GreenBits — Accessibility preferences + panel
   - Every preference lives in one localStorage key (gb.a11y) and is applied
     to <html>: data-theme, font-size and a few classes. The inline script in
     each page <head> applies the same values before the first paint.
   - Builds the floating "Opciones de accesibilidad" button + dialog and wires
     the dark-mode toggle that layout.js renders in the navbar.
   - Speech controls inside the panel are handled by components/speech.js.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";
  const { $, $$, icon, trapFocus } = GB.utils;

  const STORAGE_KEY = "gb.a11y";
  const FONT_STEPS = [90, 100, 112.5, 125, 150, 175];
  const DEFAULTS = {
    theme: "system",      // "light" | "dark" | "system"
    fontScale: 100,       // one of FONT_STEPS (%)
    reduceMotion: null,   // null = follow prefers-reduced-motion
    contrast: false,
    readableFont: false,
    underlineLinks: false,
    textSpacing: false,
    bigCursor: false,
    readOnFocus: false,   // speech: read elements on focus / hover
    voice: "",            // speech: voiceURI
    rate: 1,              // speech: 0.5 – 2
  };
  /** Boolean prefs mapped to a class on <html> (same map as the inline <head> script) */
  const CLASS_FLAGS = {
    contrast: "a11y-contrast",
    readableFont: "a11y-readable-font",
    underlineLinks: "a11y-underline-links",
    textSpacing: "a11y-text-spacing",
    bigCursor: "a11y-big-cursor",
  };

  const root = document.documentElement;
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const darkQuery = matchMedia("(prefers-color-scheme: dark)");
  const listeners = new Set();
  let prefs = load();
  let panel;
  let fab;

  // ---------- Storage ----------
  function load() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      /* Storage unavailable: prefs still apply to the current page view */
    }
  };

  // ---------- Public getters ----------
  const get = (key) => prefs[key];

  const prefersReducedMotion = () =>
    typeof prefs.reduceMotion === "boolean" ? prefs.reduceMotion : motionQuery.matches;

  /** "smooth" or "auto", for scrollTo / scrollIntoView calls */
  const scrollBehavior = () => (prefersReducedMotion() ? "auto" : "smooth");

  const resolvedTheme = () =>
    prefs.theme === "system" ? (darkQuery.matches ? "dark" : "light") : prefs.theme;

  const onChange = (fn) => listeners.add(fn);

  // ---------- Apply ----------
  const apply = () => {
    if (prefs.theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", prefs.theme);
    root.style.fontSize = prefs.fontScale === 100 ? "" : `${prefs.fontScale}%`;
    root.classList.toggle("a11y-text-lg", prefs.fontScale >= 150); // only used by JS-rendered lot cards
    root.classList.toggle("reduce-motion", prefersReducedMotion());
    Object.entries(CLASS_FLAGS).forEach(([key, className]) => root.classList.toggle(className, Boolean(prefs[key])));
  };

  const update = () => {
    apply();
    syncControls();
    listeners.forEach((fn) => fn(prefs));
  };

  const set = (changes) => {
    prefs = { ...prefs, ...changes };
    save();
    update();
  };

  const reset = () => {
    prefs = { ...DEFAULTS };
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* ignore */ }
    update();
  };

  // ---------- Panel markup ----------
  const switchRow = (key, label, hint) => `
    <div class="a11y-switch">
      <input class="a11y-switch__input" type="checkbox" role="switch" id="a11y-${key}" data-pref="${key}" aria-describedby="a11y-${key}-hint">
      <label class="a11y-switch__label" for="a11y-${key}">${label}</label>
      <small class="a11y-switch__hint" id="a11y-${key}-hint">${hint}</small>
    </div>`;

  const themeOption = (value, label) => `
    <input type="radio" name="a11y-theme" id="a11y-theme-${value}" value="${value}" data-theme-option>
    <label for="a11y-theme-${value}">${label}</label>`;

  const speechSection = () => `
    <div class="a11y-group" role="group" aria-labelledby="a11y-speech-title">
      <h3 class="a11y-group__title" id="a11y-speech-title">Leer en voz alta</h3>
      <p class="a11y-note" data-speech-unsupported hidden>Este navegador no permite leer en voz alta. Probá con Chrome, Edge o Safari.</p>
      <div class="a11y-speech" data-speech-controls>
        <div class="a11y-row">
          <button class="btn btn--primary btn--sm" type="button" data-speech="page">${icon("volume")} Leer página</button>
          <button class="btn btn--ghost btn--sm" type="button" data-speech="selection">Leer selección</button>
        </div>
        <div class="a11y-row">
          <button class="btn btn--ghost btn--sm" type="button" data-speech="toggle">${icon("play")} <span>Reproducir</span></button>
          <button class="btn btn--ghost btn--sm" type="button" data-speech="stop">${icon("stop")} Detener</button>
        </div>
        <p class="a11y-status" role="status" data-speech-status></p>
        <div class="field">
          <label class="field__label" for="a11y-voice">Voz</label>
          <select class="select" id="a11y-voice" data-speech-voice></select>
        </div>
        <div class="field">
          <label class="field__label" for="a11y-rate">Velocidad: <output for="a11y-rate" data-speech-rate-value>1×</output></label>
          <input class="range" id="a11y-rate" type="range" min="0.5" max="2" step="0.25" data-speech-rate>
          <div class="a11y-range-labels" aria-hidden="true"><span>Más lento</span><span>Más rápido</span></div>
        </div>
        ${switchRow("readOnFocus", "Leer al enfocar o pasar el cursor", "Lee tarjetas, botones y enlaces cuando los recorrés.")}
      </div>
    </div>`;

  const panelTemplate = () => `
    <button class="a11y-fab" type="button" aria-label="Opciones de accesibilidad" aria-expanded="false" aria-controls="a11y-panel" data-a11y-open>
      ${icon("accessibility")}
    </button>
    <div class="a11y-panel" id="a11y-panel" role="dialog" aria-modal="true" aria-labelledby="a11y-title" hidden data-a11y-panel>
      <div class="a11y-panel__head">
        <h2 id="a11y-title">Accesibilidad</h2>
        <button class="icon-btn" type="button" aria-label="Cerrar" data-a11y-close>${icon("close")}</button>
      </div>
      <div class="a11y-panel__body">
        <fieldset class="a11y-group">
          <legend class="a11y-group__title">Tema de color</legend>
          <div class="segmented a11y-theme">
            ${themeOption("light", "Claro")}${themeOption("dark", "Oscuro")}${themeOption("system", "Sistema")}
          </div>
        </fieldset>

        <div class="a11y-group" role="group" aria-labelledby="a11y-size-title">
          <h3 class="a11y-group__title" id="a11y-size-title">Tamaño de texto</h3>
          <div class="a11y-size">
            <button class="a11y-size__btn" type="button" data-font-step="-1" aria-label="Achicar texto">A−</button>
            <button class="a11y-size__btn" type="button" data-font-step="0" aria-label="Tamaño de texto normal">A</button>
            <button class="a11y-size__btn a11y-size__btn--lg" type="button" data-font-step="1" aria-label="Agrandar texto">A+</button>
            <output class="a11y-size__value" aria-live="polite" data-font-value>100 %</output>
          </div>
        </div>

        ${GB.speech ? speechSection() : ""}

        <fieldset class="a11y-group">
          <legend class="a11y-group__title">Lectura y movimiento</legend>
          ${switchRow("reduceMotion", "Reducir animaciones", "Detiene el carrusel y las animaciones decorativas.")}
          ${switchRow("contrast", "Alto contraste", "Refuerza bordes y texto, y quita transparencias.")}
          ${switchRow("readableFont", "Fuente legible", "Títulos en DM Sans con más espacio entre letras y líneas.")}
          ${switchRow("underlineLinks", "Subrayar enlaces", "Marca todos los enlaces con un subrayado.")}
          ${switchRow("textSpacing", "Espaciado de texto ampliado", "Más espacio entre líneas, letras y palabras.")}
          ${switchRow("bigCursor", "Cursor grande", "Agranda la flecha del mouse.")}
        </fieldset>

        <button class="btn btn--ghost btn--block" type="button" data-a11y-reset>Restablecer</button>
      </div>
    </div>`;

  // ---------- Sync controls with prefs ----------
  const formatPercent = (value) => `${value.toLocaleString("es-CR")} %`;

  const syncControls = () => {
    if (panel) {
      $$("[data-theme-option]", panel).forEach((radio) => (radio.checked = radio.value === prefs.theme));
      $$("[data-pref]", panel).forEach((input) => {
        const key = input.dataset.pref;
        input.checked = key === "reduceMotion" ? prefersReducedMotion() : Boolean(prefs[key]);
      });
      const step = FONT_STEPS.indexOf(prefs.fontScale);
      $("[data-font-value]", panel).textContent = formatPercent(prefs.fontScale);
      $('[data-font-step="-1"]', panel).disabled = step <= 0;
      $('[data-font-step="1"]', panel).disabled = step >= FONT_STEPS.length - 1;
    }
    $$("[data-theme-toggle]").forEach((btn) => {
      const dark = resolvedTheme() === "dark";
      btn.setAttribute("aria-pressed", String(dark));
      btn.innerHTML = icon(dark ? "sun" : "moon");
    });
  };

  // ---------- Panel behaviour ----------
  const isOpen = () => panel && !panel.hidden;

  const openPanel = () => {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    $("[data-a11y-close]", panel).focus();
  };

  const closePanel = () => {
    if (!isOpen()) return;
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    if (GB.speech) GB.speech.stop();
    fab.focus();
  };

  const changeFontSize = (direction) => {
    if (direction === 0) return set({ fontScale: 100 });
    const current = Math.max(0, FONT_STEPS.indexOf(prefs.fontScale));
    const next = Math.min(FONT_STEPS.length - 1, Math.max(0, current + direction));
    set({ fontScale: FONT_STEPS[next] });
  };

  /** Another dialog (lot modal, drawer) on top takes over the keyboard */
  const otherDialogOpen = () => Boolean($(".modal:not([hidden]), .drawer:not([hidden])"));

  const bindPanel = () => {
    fab.addEventListener("click", () => (isOpen() ? closePanel() : openPanel()));
    $("[data-a11y-close]", panel).addEventListener("click", closePanel);
    $("[data-a11y-reset]", panel).addEventListener("click", () => {
      reset();
      if (GB.speech) GB.speech.stop();
      GB.ui.toast("Preferencias de accesibilidad restablecidas.", "accessibility");
    });

    panel.addEventListener("change", (e) => {
      const input = e.target;
      if (input.matches("[data-theme-option]")) set({ theme: input.value });
      if (input.matches("[data-pref]")) set({ [input.dataset.pref]: input.checked });
    });
    panel.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-font-step]");
      if (btn) changeFontSize(Number(btn.dataset.fontStep));
    });

    document.addEventListener("keydown", (e) => {
      if (!isOpen() || otherDialogOpen()) return;
      if (e.key === "Escape") closePanel();
      else trapFocus(e, panel);
    });
  };

  const bindThemeToggle = () => {
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-theme-toggle]")) return;
      set({ theme: resolvedTheme() === "dark" ? "light" : "dark" });
    });
  };

  const init = () => {
    document.body.insertAdjacentHTML("beforeend", panelTemplate());
    fab = $("[data-a11y-open]");
    panel = $("[data-a11y-panel]");
    bindPanel();
    bindThemeToggle();

    // Follow OS changes while the matching pref is still on "system"
    motionQuery.addEventListener("change", () => prefs.reduceMotion === null && update());
    darkQuery.addEventListener("change", () => prefs.theme === "system" && update());

    if (GB.speech) GB.speech.bindPanel(panel);
    update();
  };

  GB.a11y = { init, get, set, reset, onChange, prefersReducedMotion, scrollBehavior, resolvedTheme };
})(window.GB);
