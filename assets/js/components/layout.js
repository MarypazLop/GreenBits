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
  const { $, $$, icon, escapeHtml, formatCRC, formatNumber } = GB.utils;

  const NAV_LINKS = [
    { href: "index.html", label: "Inicio", page: "home" },
    { href: "catalogo.html", label: "Catálogo", page: "catalog" },
    { href: "index.html#como-funciona", label: "Cómo funciona" },
    { href: "index.html#impacto", label: "Impacto" },
    { href: "publicar.html", label: "Publicar lote", page: "publish" },
  ];

  // ---------- Templates ----------
  const headerTemplate = (variant, currentPage) => {
    const logo = variant === "transparent" ? "logo-wordmark-light.png" : "logo-wordmark.png";
    const links = NAV_LINKS.map(
      (l) => `<a class="navbar__link ${l.page === currentPage ? "is-active" : ""}" href="${l.href}">${l.label}</a>`
    ).join("");

    return `
      <div class="demo-banner">
        <strong>Prototipo de demostración</strong><span class="demo-banner__extra"> · Los lotes, nombres y precios son de ejemplo.</span>
      </div>
      <nav class="navbar navbar--${variant}" aria-label="Principal">
        <div class="container navbar__inner">
          <a class="navbar__logo" href="index.html" aria-label="GreenBits, inicio">
            <img src="assets/img/${logo}" alt="GreenBits" data-logo>
          </a>
          <div class="navbar__links" id="nav-links">${links}</div>
          <div class="navbar__actions">
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

  const openReservations = () => {
    const drawer = $("[data-drawer]");
    renderReservations();
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
    $("[data-close-drawer].icon-btn", drawer).focus();
  };

  const closeReservations = () => {
    $("[data-drawer]").hidden = true;
    document.body.style.overflow = "";
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
    toggle.addEventListener("click", () => {
      const open = navbar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
      toggle.innerHTML = icon(open ? "close" : "menu");
    });
    $$(".navbar__link", navbar).forEach((link) =>
      link.addEventListener("click", () => navbar.classList.remove("is-open"))
    );
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
    bindMobileMenu(navbar);

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-reservations]")) openReservations();
      if (e.target.closest("[data-close-drawer]")) closeReservations();
      if (e.target.closest("[data-reset-demo]")) {
        GB.store.reset();
        GB.ui.toast("Datos del demo reiniciados.", "recycle");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("[data-drawer]").hidden) closeReservations();
    });

    GB.store.subscribe(renderReservations);
    renderReservations();
  };

  GB.layout = { init, openReservations };
})(window.GB);
