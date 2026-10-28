/* ==========================================================================
   GreenBits — Home page logic
   Hero slider, impact numbers, featured lots carousel and simulated forms.
   ========================================================================== */
window.GB = window.GB || {};
GB.pages = GB.pages || {};

(function (GB) {
  "use strict";
  const { $, $$, icon, formatCRC, formatNumber, escapeHtml } = GB.utils;

  /** Hero slides: edit texts here. `lotId` = lot shown in the floating card */
  const SLIDES = [
    {
      kicker: "Lo que", line1: "SOBRA,", line2: "BROTA.",
      text: "GreenBits conecta a productores de San Carlos con compradores locales para darle salida a los productos de segunda y a la biomasa que hoy se bota.",
      cta: { label: "Explorar lotes", href: "catalogo.html" },
      lotId: "L-001",
    },
    {
      kicker: "De segunda,", line1: "PERO", line2: "PERFECTA.",
      text: "Fruta y verdura fuera del estándar de tamaño o de aspecto, con el mismo sabor. Ideal para sodas, jugos, salsas y repostería.",
      cta: { label: "Ver productos de segunda", href: "catalogo.html?tipo=segunda" },
      lotId: "L-002",
    },
    {
      kicker: "Biomasa:", line1: "NADA SE", line2: "BOTA.",
      text: "Cáscaras, bagazo, hojas y podas con uso real en compost, alimentación animal y cosmética natural.",
      cta: { label: "Ver biomasa", href: "catalogo.html?tipo=biomasa" },
      lotId: "L-003",
    },
  ];

  const AUTOPLAY_MS = 7000;

  // ---------- Hero slider ----------
  const initHero = () => {
    const hero = $(".hero");
    const titleWrap = $("[data-hero-title]", hero);
    const textEl = $("[data-hero-text]", hero);
    const ctaEl = $("[data-hero-cta]", hero);
    const cardEl = $("[data-hero-card]", hero);
    const dotsEl = $("[data-hero-dots]", hero);
    const pauseBtn = $("[data-hero-pause]", hero);
    const contentEl = $("[data-hero-content]", hero);
    let current = 0;
    let timer;
    let paused = GB.a11y.prefersReducedMotion(); // no autoplay with reduced motion
    let interacting = false;                     // pointer or keyboard focus inside the hero

    $("[data-hero-prev]", hero).innerHTML = icon("arrowLeft");
    $("[data-hero-next]", hero).innerHTML = icon("arrowRight");

    dotsEl.innerHTML = SLIDES.map(
      (_, i) => `<button class="hero__dot" type="button" aria-label="Diapositiva ${i + 1} de ${SLIDES.length}" data-index="${i}"></button>`
    ).join("");

    /** Restarts a CSS animation by toggling the class */
    const replay = (el, className = "is-entering") => {
      el.classList.remove(className);
      void el.offsetWidth; // force reflow
      el.classList.add(className);
    };

    const renderCard = (lot) => {
      const product = GB.lotCard.productOf(lot);
      cardEl.dataset.lotId = lot.id;
      cardEl.setAttribute("aria-label", `Ver lote destacado: ${lot.title}`);
      cardEl.innerHTML = `
        <span class="hero__card-media tone-${product.tone}">${GB.illustrations.render(product.art)}</span>
        <span>
          <span class="hero__card-tag">Lote destacado</span>
          <span class="hero__card-title" style="display:block">${escapeHtml(lot.title)}</span>
          <span class="hero__card-meta">${formatNumber(lot.qty)} ${product.unit} · ${escapeHtml(lot.zone)} · <strong>${formatCRC(lot.price)}/${product.unit}</strong></span>
        </span>`;
    };

    const goTo = (index) => {
      current = (index + SLIDES.length) % SLIDES.length;
      const slide = SLIDES[current];

      $$("[data-hero-kicker]", hero).forEach((el) => (el.textContent = slide.kicker));
      $$("[data-hero-l1]", hero).forEach((el) => (el.textContent = slide.line1));
      $$("[data-hero-l2]", hero).forEach((el) => (el.textContent = slide.line2));
      $("[data-hero-a11y]", hero).textContent = `${slide.kicker} ${slide.line1} ${slide.line2}`;
      textEl.textContent = slide.text;
      ctaEl.textContent = slide.cta.label;
      ctaEl.href = slide.cta.href;

      const lot = GB.store.getLotById(slide.lotId);
      if (lot) renderCard(lot);

      $$(".hero__dot", dotsEl).forEach((dot, i) => {
        dot.classList.toggle("is-active", i === current);
        if (i === current) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });

      [titleWrap, textEl, cardEl].forEach((el) => replay(el));
    };

    const restartAutoplay = () => {
      clearInterval(timer);
      if (!paused && !interacting) timer = setInterval(() => goTo(current + 1), AUTOPLAY_MS);
    };

    /** Visible pause/play control (WCAG 2.2.2). Slide changes are announced only while paused. */
    const setPaused = (value) => {
      paused = value;
      pauseBtn.innerHTML = icon(paused ? "play" : "pause");
      pauseBtn.setAttribute("aria-label", paused ? "Reanudar carrusel" : "Pausar carrusel");
      contentEl.setAttribute("aria-live", paused ? "polite" : "off");
      restartAutoplay();
    };

    const setInteracting = (value) => {
      interacting = value;
      restartAutoplay();
    };

    $("[data-hero-prev]", hero).addEventListener("click", () => { goTo(current - 1); restartAutoplay(); });
    $("[data-hero-next]", hero).addEventListener("click", () => { goTo(current + 1); restartAutoplay(); });
    pauseBtn.addEventListener("click", () => setPaused(!paused));
    dotsEl.addEventListener("click", (e) => {
      const dot = e.target.closest("[data-index]");
      if (dot) { goTo(Number(dot.dataset.index)); restartAutoplay(); }
    });
    cardEl.addEventListener("click", () => GB.lotDetail.open(cardEl.dataset.lotId));

    // Pause while the user interacts with the hero (mouse or keyboard)
    hero.addEventListener("mouseenter", () => setInteracting(true));
    hero.addEventListener("mouseleave", () => setInteracting(hero.contains(document.activeElement)));
    hero.addEventListener("focusin", () => setInteracting(true));
    hero.addEventListener("focusout", (e) => !hero.contains(e.relatedTarget) && setInteracting(hero.matches(":hover")));

    // Turning "Reducir animaciones" on stops the autoplay right away
    GB.a11y.onChange(() => GB.a11y.prefersReducedMotion() && !paused && setPaused(true));

    goTo(0);
    setPaused(paused);
  };

  // ---------- Impact numbers ----------
  const initStats = () => {
    $("[data-stats]").innerHTML = GB.data.impact
      .map(
        (s) => `
        <div class="stat reveal">
          <p class="stat__value" data-count="${s.value}" data-suffix="${s.suffix}" data-decimals="${s.decimals || 0}">0${s.suffix}</p>
          <p class="stat__label">${s.label}</p>
        </div>`
      )
      .join("");
  };

  // ---------- Story phone mockup ----------
  const initStory = () => {
    const lot = GB.store.getLotById("L-001");
    $("[data-story-card]").innerHTML = GB.lotCard.render(lot);
  };

  // ---------- Buyers chips ----------
  const initBuyers = () => {
    $("[data-buyers]").innerHTML = GB.data.buyerTypes.map((b) => `<span class="chip">${b}</span>`).join("");
  };

  // ---------- Featured carousel ----------
  const initFeatured = () => {
    const track = $("[data-featured-track]");
    const lots = GB.store
      .getAllLots()
      .filter((lot) => !lot.soldOut)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    track.innerHTML = lots.map(GB.lotCard.render).join("");
    GB.lotDetail.bindClicks(track);

    const scrollByCard = (direction) => {
      const card = track.querySelector(".lot-card");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: GB.a11y.scrollBehavior() });
    };
    $("[data-featured-prev]").addEventListener("click", () => scrollByCard(-1));
    $("[data-featured-next]").addEventListener("click", () => scrollByCard(1));
  };

  // ---------- Simulated forms ----------
  const initForms = () => {
    // WhatsApp alerts sign-up
    const joinForm = $("[data-join-form]");
    const joinError = $("[data-join-error]");
    const joinInput = joinForm.querySelector("input");
    const setJoinError = (invalid) => {
      joinError.hidden = !invalid;
      GB.utils.setInvalid(joinInput, joinError, invalid);
    };
    joinInput.addEventListener("input", () => setJoinError(false));
    joinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = joinInput;
      const digits = input.value.replace(/\D/g, "");
      setJoinError(digits.length !== 8);
      if (digits.length !== 8) {
        input.focus();
        return;
      }
      GB.ui.toast(`¡Listo! Te escribiremos al ${digits.slice(0, 4)}-${digits.slice(4)} (simulado).`, "whatsapp");
      joinForm.reset();
    });

    // Product alert box
    const alertForm = $("[data-alert-form]");
    const select = $("[data-alert-product]", alertForm);
    select.innerHTML = Object.entries(GB.data.products)
      .map(([key, p]) => `<option value="${key}">${p.name}</option>`)
      .join("");
    alertForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = GB.data.products[select.value].name;
      GB.ui.toast(`Alerta activada: te avisamos cuando haya ${name.toLowerCase()}.`, "clock");
    });
  };

  GB.pages.home = {
    init() {
      initHero();
      initStats();
      initStory();
      initBuyers();
      initFeatured();
      initForms();
    },
  };
})(window.GB);
