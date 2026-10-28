/* ==========================================================================
   GreenBits — Shared layout (navbar, footer, "Mis reservas" drawer)
   Injected by JS so every page shares the same markup.
   Each page only declares placeholders:
     <div data-layout="header" data-variant="transparent|solid"></div>
     <div data-layout="footer"></div>
   and sets <body data-page="home|catalog|publish">.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";
  const { $, $$, icon, escapeHtml, formatCRC, formatNumber, trapFocus } = GB.utils;

  const COMPACT_MAX_WIDTH = 900; // px: below this the menu is always off-canvas

  const NAV_LINKS = [
    { href: "index.html", label: "Inicio", page: "home" },
    { href: "catalogo.html", label: "Catálogo", page: "catalog" },
    { href: "index.html#como-funciona", label: "Cómo funciona" },
    { href: "index.html#impacto", label: "Impacto" },
    { href: "publicar.html", label: "Publicar lote", page: "publish" },
  ];

  // ---------- Templates ----------
  /** Light wordmark on the hero; on solid bars it follows the theme (see .only-dark in base.css) */
  const logoTemplate = (variant) =>
    variant === "transparent"
      ? '<img src="assets/img/logo-wordmark-light.png" alt="GreenBits" data-logo>'
      : `<img class="only-light" src="assets/img/logo-wordmark.png" alt="GreenBits" data-logo>
         <img class="only-dark" src="assets/img/logo-wordmark-light.png" alt="GreenBits">`;

  const headerTemplate = (variant, currentPage) => {
    const links = NAV_LINKS.map((l) => {
      const active = l.page === currentPage;
      return `<a class="navbar__link ${active ? "is-active" : ""}" href="${l.href}"${active ? ' aria-current="page"' : ""}>${l.label}</a>`;
    }).join("");

    return `
      <a class="skip-link" href="#contenido">Saltar al contenido</a>
      <div class="demo-banner">
        <strong>Prototipo de demostración</strong><span class="demo-banner__extra"> · Los lotes, nombres y precios son de ejemplo.</span>
      </div>
      <nav class="navbar navbar--${variant}" aria-label="Principal">
        <div class="container navbar__inner">
          <a class="navbar__logo" href="index.html" aria-label="GreenBits, inicio">
            ${logoTemplate(variant)}
          </a>
          <div class="navbar__links" id="nav-links">${links}</div>
          <div class="navbar__actions">
            <button class="icon-btn navbar__theme" type="button" data-theme-toggle aria-label="Modo oscuro" aria-pressed="false">${icon("moon")}</button>
            <button class="icon-btn navbar__cart" type="button" data-open-reservations aria-label="Mis reservas">
              ${icon("basket")}<span class="navbar__badge" data-res-count hidden>0</span>
            </button>
            <a class="btn btn--accent btn--sm navbar__cta-desktop" href="catalogo.html">Ver lotes</a>
            <button class="icon-btn navbar__toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav-links">${icon("menu")}</button>
          </div>
        </div>
      </nav>`;
  };

  const footerTemplate = () => `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <img src="assets/img/logo-wordmark-light.png" alt="GreenBits">
            <p class="footer__slogan">“Lo que sobra, brota”</p>
            <p>Conectamos a productores de San Carlos con compradores locales para darle salida a los productos de segunda y a la biomasa.</p>
          </div>
          <div>
            <h3>Explorar</h3>
            <ul class="footer__list">
              <li><a href="catalogo.html?tipo=segunda">Productos de segunda</a></li>
              <li><a href="catalogo.html?tipo=biomasa">Biomasa</a></li>
              <li><a href="catalogo.html">Todos los lotes</a></li>
            </ul>
          </div>
          <div>
            <h3>Productores</h3>
            <ul class="footer__list">
              <li><a href="publicar.html">Publicar un lote</a></li>
              <li><a href="index.html#como-funciona">Cómo funciona</a></li>
              <li><a href="index.html#impacto">Impacto</a></li>
            </ul>
          </div>
          <div>
            <h3>Contacto</h3>
            <ul class="footer__list">
              <li>San Carlos, Alajuela</li>
              <li>hola@greenbits.cr</li>
              <li><button type="button" class="footer__reset" data-reset-demo style="background:none;border:0;padding:0;color:inherit;text-decoration:underline;opacity:.7">Reiniciar datos del demo</button></li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <p>© ${new Date().getFullYear()} GreenBits · Prototipo académico del equipo VerdeBits · UTN San Carlos</p>
          <div class="footer__socials">
            <a href="#" aria-label="Instagram">${icon("instagram")}</a>
            <a href="#" aria-label="Facebook">${icon("facebook")}</a>
            <a href="#" aria-label="WhatsApp">${icon("whatsapp")}</a>
          </div>
        </div>
      </div>
    </footer>`;

  const drawerTemplate = () => `
    <div class="drawer" hidden data-drawer>
      <div class="modal__backdrop" data-close-drawer></div>
      <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="Mis reservas">
        <div class="drawer__head">
          <h2>Mis reservas</h2>
          <button class="icon-btn" type="button" data-close-drawer aria-label="Cerrar">${icon("close")}</button>
        </div>
        <div class="drawer__body" data-res-list></div>
      </aside>
    </div>`;

  const reservationItem = (r) => `
    <article class="reservation">
      <div class="reservation__thumb tone-${r.tone}">${GB.illustrations.render(r.art)}</div>
      <div>
        <p class="reservation__title">${escapeHtml(r.title)}</p>
        <p class="reservation__meta">${formatNumber(r.qty)} ${r.unit} · ${formatCRC(r.total)} · ${escapeHtml(r.producer)}</p>
        <p class="reservation__meta">${r.method === "delivery" ? "Entrega" : "Retiro"} · ${escapeHtml(r.dateLabel)} · ${r.code}</p>
        <span class="reservation__status ${r.status === "confirmed" ? "status--confirmed" : "status--pending"}">
          ${r.status === "confirmed" ? "Confirmada" : "Esperando productor"}
        </span>
      </div>
    </article>`;

  // ---------- Behaviour ----------
  const renderReservations = () => {
    const list = GB.store.getReservations();
    const count = $("[data-res-count]");
    if (count) {
      count.textContent = list.length;
      count.hidden = list.length === 0;
    }
    const body = $("[data-res-list]");
    if (!body) return;
    body.innerHTML = list.length
      ? list.map(reservationItem).join("")
      : `<div class="drawer__empty">${GB.illustrations.render("leaf")}<p>Todavía no tenés reservas. Explorá el catálogo y apartá tu primer lote.</p><br><a class="btn btn--primary btn--sm" href="catalogo.html">Ir al catálogo</a></div>`;
  };

  let drawerOpener = null;

  const openReservations = () => {
    const drawer = $("[data-drawer]");
    drawerOpener = document.activeElement;
    renderReservations();
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
    $("[data-close-drawer].icon-btn", drawer).focus();
  };

  const closeReservations = () => {
    $("[data-drawer]").hidden = true;
    document.body.style.overflow = "";
    if (drawerOpener && document.body.contains(drawerOpener)) drawerOpener.focus();
  };

  /** Transparent navbar turns solid after scrolling past the top */
  const bindScroll = (navbar) => {
    if (!navbar.classList.contains("navbar--transparent")) return;
    const onScroll = () => navbar.classList.toggle("is-scrolled", window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  const bindMobileMenu = (navbar) => {
    const toggle = $(".navbar__toggle", navbar);
    const setOpen = (open) => {
      navbar.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      toggle.innerHTML = icon(open ? "close" : "menu");
    };
    toggle.addEventListener("click", () => setOpen(!navbar.classList.contains("is-open")));
    $$(".navbar__link", navbar).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !navbar.classList.contains("is-open")) return;
      setOpen(false);
      toggle.focus();
    });
    return setOpen;
  };

  /** Off-canvas menu on small screens or whenever the links don't fit
      (e.g. with a large text size from the a11y panel) */
  const bindCompactMode = (navbar, setOpen) => {
    const inner = $(".navbar__inner", navbar);
    const check = () => {
      navbar.classList.remove("is-compact");
      const compact = window.innerWidth <= COMPACT_MAX_WIDTH || inner.scrollWidth > inner.clientWidth;
      navbar.classList.toggle("is-compact", compact);
      if (!compact) setOpen(false);
    };
    window.addEventListener("resize", check);
    window.addEventListener("load", check);
    if (GB.a11y) GB.a11y.onChange(check);
    if (document.fonts) document.fonts.ready.then(check); // web fonts change the link widths
    $$(".navbar__logo img", navbar).forEach((img) => img.addEventListener("load", check)); // width is 0 until loaded
    check();
  };

  const init = () => {
    const page = document.body.dataset.page;
    const header = $('[data-layout="header"]');
    const footer = $('[data-layout="footer"]');

    if (header) header.outerHTML = headerTemplate(header.dataset.variant || "solid", page);
    if (footer) footer.outerHTML = footerTemplate();
    document.body.insertAdjacentHTML("beforeend", drawerTemplate());

    const navbar = $(".navbar");
    bindScroll(navbar);
    bindCompactMode(navbar, bindMobileMenu(navbar));

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-reservations]")) openReservations();
      if (e.target.closest("[data-close-drawer]")) closeReservations();
      if (e.target.closest("[data-reset-demo]")) {
        GB.store.reset();
        GB.ui.toast("Datos del demo reiniciados.", "recycle");
      }
    });
    document.addEventListener("keydown", (e) => {
      const drawer = $("[data-drawer]");
      if (drawer.hidden) return;
      if (e.key === "Escape") closeReservations();
      trapFocus(e, drawer);
    });

    GB.store.subscribe(renderReservations);
    renderReservations();
  };

  GB.layout = { init, openReservations };
})(window.GB);
