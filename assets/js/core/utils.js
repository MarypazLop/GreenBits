/* ==========================================================================
   GreenBits — Core utilities
   Every script attaches itself to the global `GB` namespace so the site works
   with plain <script> tags (no bundler needed, works on GitHub Pages and even
   when opening the HTML file directly).
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";

  /** Shorthand DOM helpers */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /** Formats a number as Costa Rican colones, e.g. 350 -> "₡350" */
  const formatCRC = (value) =>
    "₡" + Math.round(value).toLocaleString("es-CR", { maximumFractionDigits: 0 });

  /** Formats quantities with thousands separators, e.g. 1200 -> "1 200" */
  const formatNumber = (value) => Math.round(value).toLocaleString("es-CR");

  /** Escapes user-provided text before injecting it into HTML */
  const escapeHtml = (text = "") =>
    String(text).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  /** Delays a function call until the user stops typing */
  const debounce = (fn, wait = 200) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  /** Fake network latency, used to make simulated actions feel real */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /** Short random code for simulated reservations, e.g. "GB-4K7Q" */
  const randomCode = (prefix = "GB") =>
    prefix + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();

  /** Relative date in Spanish ("hoy", "hace 2 días") */
  const timeAgo = (isoDate) => {
    const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
    if (days <= 0) return "hoy";
    if (days === 1) return "ayer";
    return `hace ${days} días`;
  };

  /** Inline SVG icons used across the UI (Lucide-style strokes) */
  const icon = (name) => {
    const paths = {
      arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
      pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
      scale: '<path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0L5 7Zm14 0-3 7a4 4 0 0 0 6 0l-3-7Z"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      basket: '<path d="M5 10h14l-1.5 9a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 10Z"/><path d="m9 10 3-6 3 6M3 10h18"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      close: '<path d="M6 6l12 12M18 6 6 18"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
      check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
      leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-4 6-6 10-8"/>',
      sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6Zm0 0c0-4 3-7 7-7 0 4-3 7-7 7Z"/>',
      truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
      calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
      clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
      recycle: '<path d="M7 19H4.5a1.8 1.8 0 0 1-1.6-2.7L5 13M17 19h2.5a1.8 1.8 0 0 0 1.6-2.7L19 13M9.5 5.5l1-1.7a1.8 1.8 0 0 1 3 0l1 1.7"/><path d="m4 16 1-3 3 1M20 16l-1-3-3 1M13 3.5l1.5 2.5-3 .2"/>',
      upload: '<path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
      star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
      filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
      phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
      instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor"/>',
      facebook: '<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15Z"/>',
      whatsapp: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8L4 20Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2L9 9.5Z"/>',
      chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
  };

  GB.utils = { $, $$, formatCRC, formatNumber, escapeHtml, debounce, wait, randomCode, timeAgo, icon };
})(window.GB);
