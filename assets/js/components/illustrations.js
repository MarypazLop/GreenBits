/* ==========================================================================
   GreenBits — Product illustrations
   Lightweight flat SVG drawings used as placeholders for lot photos.
   When real photos exist, the card can show an <img> instead (see lot-card.js).
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";

  // Shared leaf shape reused by several drawings
  const leaf = (x, y, r, fill = "#07945a") =>
    `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0c10-14 26-14 34-2-10 12-24 14-34 2Z" fill="${fill}"/><path d="M2 0c10 0 20-1 30-2" stroke="#034e2f" stroke-width="1.2" fill="none" opacity=".5"/></g>`;

  const art = {
    tomato: `
      <ellipse cx="60" cy="68" rx="40" ry="35" fill="#d9472b"/>
      <ellipse cx="60" cy="68" rx="40" ry="35" fill="url(#gTomato)"/>
      <path d="M44 44c5-8 27-8 32 0" stroke="#b33520" stroke-width="2" fill="none" opacity=".4"/>
      <ellipse cx="45" cy="58" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-25 45 58)"/>
      <path d="M60 36l-6-10 6 5 6-6-3 10 12-2-11 6 7 5-11-2-1 9-2-9-11 3 8-6-10-5 12 1Z" fill="#07945a"/>
      <defs><radialGradient id="gTomato" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff7a52" stop-opacity=".6"/><stop offset="1" stop-color="#9c2a17" stop-opacity=".4"/></radialGradient></defs>`,

    banana: `
      <path d="M22 40c4 34 34 56 72 44-8 16-40 28-64 8-14-12-16-36-8-52Z" fill="#f2c230"/>
      <path d="M30 34c2 34 30 54 66 46-6 10-34 18-54 2-14-12-16-30-12-48Z" fill="#ffd84d"/>
      <path d="M24 30c4-6 8-6 10-2l-4 8Z" fill="#6b5317"/>
      <path d="M94 82l8-2-2 6Z" fill="#6b5317"/>
      <circle cx="58" cy="78" r="1.6" fill="#8a6a18"/><circle cx="46" cy="66" r="1.3" fill="#8a6a18"/><circle cx="70" cy="84" r="1.4" fill="#8a6a18"/>`,

    pineapple: `
      <g fill="#07945a">
        <path d="M60 46c-4-14-2-26 0-34 4 10 6 22 0 34Z"/>
        <path d="M58 48c-12-8-20-20-22-28 10 6 20 14 22 28Z"/>
        <path d="M62 48c12-8 20-20 22-28-10 6-20 14-22 28Z"/>
        <path d="M58 50c-14-2-24-8-30-14 12 2 22 6 30 14Z" fill="#034e2f"/>
        <path d="M62 50c14-2 24-8 30-14-12 2-22 6-30 14Z" fill="#034e2f"/>
      </g>
      <ellipse cx="60" cy="80" rx="27" ry="33" fill="#e8a628"/>
      <g stroke="#b5741a" stroke-width="2" fill="none" opacity=".75">
        <path d="M40 60l40 40M36 74l30 30M48 52l36 36M80 60l-40 40M84 74l-30 30M72 52l-36 36"/>
      </g>
      <ellipse cx="50" cy="72" rx="6" ry="10" fill="#fff" opacity=".22"/>`,

    orange: `
      <circle cx="60" cy="66" r="38" fill="#f08a1c"/>
      <circle cx="60" cy="66" r="38" fill="url(#gOrange)"/>
      <g fill="#c96a0c" opacity=".45"><circle cx="48" cy="80" r="1.5"/><circle cx="70" cy="56" r="1.5"/><circle cx="76" cy="82" r="1.5"/><circle cx="56" cy="92" r="1.5"/><circle cx="84" cy="68" r="1.5"/></g>
      <ellipse cx="46" cy="52" rx="10" ry="6" fill="#fff" opacity=".35" transform="rotate(-30 46 52)"/>
      <path d="M60 30v-8" stroke="#6b4a1a" stroke-width="3" stroke-linecap="round"/>
      ${leaf(60, 24, -20)}
      <defs><radialGradient id="gOrange" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffc06b" stop-opacity=".55"/><stop offset="1" stop-color="#b45a05" stop-opacity=".35"/></radialGradient></defs>`,

    papaya: `
      <path d="M60 14c22 0 34 28 34 54 0 26-15 40-34 40S26 94 26 68c0-26 12-54 34-54Z" fill="#f5a142"/>
      <path d="M60 30c14 0 22 20 22 38 0 18-9 28-22 28S38 86 38 68c0-18 8-38 22-38Z" fill="#f26b3a"/>
      <g fill="#2e332f"><circle cx="54" cy="58" r="2.6"/><circle cx="64" cy="60" r="2.6"/><circle cx="58" cy="68" r="2.6"/><circle cx="66" cy="72" r="2.6"/><circle cx="54" cy="76" r="2.6"/><circle cx="61" cy="82" r="2.6"/></g>
      <path d="M60 14c22 0 34 28 34 54" stroke="#7aa13c" stroke-width="4" fill="none" opacity=".55"/>`,

    pepper: `
      <path d="M36 50c-6 18 0 46 18 52 6 2 10-2 12-2 4 2 12 4 18-4 12-16 8-40 2-48-8-6-42-8-50 2Z" fill="#d93a26"/>
      <path d="M44 54c-4 14 0 34 10 40" stroke="#ff7a5c" stroke-width="5" stroke-linecap="round" fill="none" opacity=".55"/>
      <path d="M60 50c-1 10 0 36 4 48" stroke="#a82313" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M46 48c4-6 22-6 30 0-6 4-24 4-30 0Z" fill="#07945a"/>
      <path d="M61 46c0-8 4-14 10-16" stroke="#034e2f" stroke-width="5" stroke-linecap="round" fill="none"/>`,

    cassava: `
      <path d="M18 72c12-22 52-36 80-26 8 3 6 10-2 14-26 14-58 26-74 22-6-2-6-6-4-10Z" fill="#8a5a2b"/>
      <path d="M26 74c14-14 46-24 66-20" stroke="#a87545" stroke-width="3" fill="none"/>
      <path d="M30 86c16-16 50-26 72-20 6 2 4 8-2 10-24 10-52 18-66 16-6-1-6-4-4-6Z" fill="#7a4d22"/>
      <ellipse cx="96" cy="52" rx="6" ry="7" fill="#f3e6c8" transform="rotate(-20 96 52)"/>
      <ellipse cx="100" cy="72" rx="5" ry="6" fill="#f3e6c8" transform="rotate(-15 100 72)"/>
      <g stroke="#5a3814" stroke-width="1.4" opacity=".6"><path d="M40 70l4 4M56 62l4 4M72 56l4 4M48 84l4 4M66 78l4 4"/></g>`,

    pineapplePeel: `
      <path d="M18 88c8-20 30-30 46-24-14 8-28 20-36 34Z" fill="#e8a628"/>
      <path d="M50 96c4-24 28-38 50-30-18 4-34 18-40 36Z" fill="#d18e1c"/>
      <path d="M30 70c10-16 32-22 44-14-16 2-30 10-38 22Z" fill="#c99230"/>
      <g stroke="#9c6512" stroke-width="1.6" opacity=".7" fill="none"><path d="M26 86l8-6M34 92l8-8M60 92l8-8M70 88l10-8M38 72l8-6"/></g>
      <g fill="#07945a"><path d="M78 50c-2-12 2-22 6-28 2 10 2 20-6 28Z"/><path d="M76 52c-10-4-16-14-16-22 8 6 14 12 16 22Z"/><path d="M80 52c10-6 16-14 18-22-8 4-14 12-18 22Z" fill="#034e2f"/></g>`,

    bagasse: `
      <g stroke-linecap="round">
        <path d="M18 90 L96 44" stroke="#c9b27c" stroke-width="8"/>
        <path d="M22 98 L102 60" stroke="#b39a62" stroke-width="7"/>
        <path d="M30 80 L90 34" stroke="#dcc792" stroke-width="6"/>
        <path d="M28 104 L94 82" stroke="#c9b27c" stroke-width="6"/>
      </g>
      <g stroke="#8b7444" stroke-width="1.5" opacity=".7"><path d="M40 78l2 4M60 66l2 4M78 56l2 4M48 90l2 4M72 80l2 4"/></g>
      <path d="M14 104c20-6 70-8 96-2" stroke="#8b7444" stroke-width="2" fill="none" opacity=".5"/>`,

    leaf: `
      <path d="M20 96C24 54 54 22 100 16 98 60 70 94 20 96Z" fill="#07945a"/>
      <path d="M20 96C46 70 72 44 100 16" stroke="#034e2f" stroke-width="3" fill="none"/>
      <g stroke="#034e2f" stroke-width="1.5" opacity=".55" fill="none"><path d="M36 80l-6-18M48 68l-6-20M60 56l-4-20M72 44l-2-18M44 76l20 4M56 64l22 2M68 52l20 0"/></g>
      <path d="M30 98C40 74 52 64 64 58" stroke="#5fbf73" stroke-width="2" fill="none" opacity=".5"/>`,

    coffee: `
      ${leaf(22, 50, -30)}${leaf(80, 36, 30, "#034e2f")}
      <g><circle cx="48" cy="70" r="15" fill="#b3261e"/><circle cx="72" cy="66" r="15" fill="#c8352a"/><circle cx="60" cy="88" r="15" fill="#9c1f18"/></g>
      <g fill="#fff" opacity=".35"><ellipse cx="43" cy="64" rx="4" ry="2.5"/><ellipse cx="67" cy="60" rx="4" ry="2.5"/><ellipse cx="55" cy="82" rx="4" ry="2.5"/></g>
      <g stroke="#5e120d" stroke-width="1.6" fill="none"><path d="M48 66v8M72 62v8M60 84v8"/></g>`,

    branches: `
      <path d="M16 100C40 80 70 60 104 22" stroke="#7a5a32" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M50 74c-8-12-10-24-6-36M70 56c10-4 20-2 30 4M34 88c-12-2-20-8-24-16" stroke="#7a5a32" stroke-width="3" stroke-linecap="round" fill="none"/>
      ${leaf(40, 36, -80)}${leaf(96, 58, 20, "#034e2f")}${leaf(8, 70, 10)}${leaf(72, 40, -40, "#5aa65c")}${leaf(90, 22, -10)}`,

    orangePeel: `
      <path d="M22 70c0-22 18-40 40-40 6 0 12 1 17 4-18 2-36 18-38 40Z" fill="#f08a1c"/>
      <path d="M44 98c-8-20 0-42 20-50 6-2 12-3 18-2-14 10-24 30-20 54Z" fill="#f59a32"/>
      <path d="M74 94c4-18 18-32 36-32-4 18-18 32-36 32Z" fill="#e57b12"/>
      <path d="M41 74c2-20 18-36 36-40" stroke="#fff3df" stroke-width="3" fill="none" opacity=".8"/>
      <path d="M62 98c-4-20 4-40 20-52" stroke="#fff3df" stroke-width="3" fill="none" opacity=".8"/>`,
  };

  /** Returns a full <svg> for a given product key (falls back to a leaf) */
  const render = (artKey) =>
    `<svg viewBox="0 0 120 120" aria-hidden="true">${art[artKey] || art.leaf}</svg>`;

  GB.illustrations = { render };
})(window.GB);
