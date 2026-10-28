/* ==========================================================================
   GreenBits — Catalog page logic
   Holds the filter state, filters/sorts the lots and re-renders the grid.
   The state is mirrored in the URL (?tipo=biomasa&q=piña) so links can be shared.
   ========================================================================== */
window.GB = window.GB || {};
GB.pages = GB.pages || {};

(function (GB) {
  "use strict";
  const { $, $$, icon, escapeHtml, formatCRC, debounce } = GB.utils;

  const MAX_PRICE = 800;

  /** Single source of truth for the filters */
  const state = {
    type: "all",            // "all" | "segunda" | "biomasa"
    query: "",
    products: new Set(),    // product keys
    zones: new Set(),
    maxPrice: MAX_PRICE,
    deliveryOnly: false,
    hideSoldOut: true,
    sort: "recent",
  };

  // ---------- Filtering ----------
  /** Lowercase + remove accents so "pina" matches "Piña" */
  const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const matches = (lot, ignore = {}) => {
    const product = GB.data.products[lot.product];
    if (!ignore.type && state.type !== "all" && product.category !== state.type) return false;
    if (state.products.size && !state.products.has(lot.product)) return false;
    if (state.zones.size && !state.zones.has(lot.zone)) return false;
    if (lot.price > state.maxPrice) return false;
    if (state.deliveryOnly && !lot.delivery) return false;
    if (state.hideSoldOut && lot.soldOut) return false;
    if (state.query) {
      const haystack = normalize([lot.title, product.name, lot.zone, lot.producer, ...lot.uses].join(" "));
      if (!normalize(state.query).split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  };

  const sorters = {
    recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "qty-desc": (a, b) => b.qty - a.qty,
  };

  const getResults = () => GB.store.getAllLots().filter((lot) => matches(lot)).sort(sorters[state.sort]);

  // ---------- Rendering ----------
  const renderFilterOptions = () => {
    const lots = GB.store.getAllLots();
    const countBy = (fn) => lots.reduce((acc, lot) => ((acc[fn(lot)] = (acc[fn(lot)] || 0) + 1), acc), {});
    const productCounts = countBy((l) => l.product);
    const zoneCounts = countBy((l) => l.zone);

    const option = (name, value, label, count, checked) => `
      <label class="check">
        <input type="checkbox" name="${name}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}>
        ${escapeHtml(label)} <small>${count || 0}</small>
      </label>`;

    // Products grouped by category; only the active type is shown
    const groups = Object.entries(GB.data.categories)
      .filter(([key]) => state.type === "all" || state.type === key)
      .map(([key, category]) => {
        const items = Object.entries(GB.data.products)
          .filter(([, p]) => p.category === key)
          .map(([pKey, p]) => option("product", pKey, p.name, productCounts[pKey], state.products.has(pKey)))
          .join("");
        return `<p class="filters__subtitle">${category.short}</p>${items}`;
      });
    $("[data-filter-products]").innerHTML = groups.join("");

    $("[data-filter-zones]").innerHTML = GB.data.zones
      .map((zone) => option("zone", zone, zone, zoneCounts[zone], state.zones.has(zone)))
      .join("");
  };

  const renderTabs = () => {
    const lots = GB.store.getAllLots().filter((lot) => matches(lot, { type: true }));
    const count = (type) => lots.filter((l) => type === "all" || GB.data.products[l.product].category === type).length;
    ["all", "segunda", "biomasa"].forEach((type) => {
      $(`[data-count-${type}]`).textContent = count(type);
    });
    $$("[data-type]").forEach((tab) => {
      const active = tab.dataset.type === state.type;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active);
    });
  };

  const renderActiveChips = () => {
    const chips = [];
    const chip = (label, kind, value) =>
      chips.push(`<span class="chip">${escapeHtml(label)}<button type="button" aria-label="Quitar ${escapeHtml(label)}" data-remove="${kind}" data-value="${escapeHtml(value)}">${icon("close")}</button></span>`);

    if (state.query) chip(`“${state.query}”`, "query", "");
    state.products.forEach((p) => chip(GB.data.products[p].name, "product", p));
    state.zones.forEach((z) => chip(z, "zone", z));
    if (state.maxPrice < MAX_PRICE) chip(`Hasta ${formatCRC(state.maxPrice)}`, "price", "");
    if (state.deliveryOnly) chip("Con entrega", "delivery", "");
    $("[data-active-filters]").innerHTML = chips.join("");
  };

  const renderResults = () => {
    const results = getResults();
    const grid = $("[data-results]");
    grid.innerHTML = results.map(GB.lotCard.render).join("");
    // Small stagger so cards appear one after another (none with reduced motion)
    if (!GB.a11y.prefersReducedMotion()) {
      $$(".lot-card", grid).forEach((card, i) => (card.style.animationDelay = `${Math.min(i, 8) * 40}ms`));
    }

    $("[data-results-count]").innerHTML = `<strong>${results.length}</strong> ${results.length === 1 ? "lote disponible" : "lotes disponibles"}`;
    $("[data-empty]").hidden = results.length > 0;
  };

  const render = () => {
    renderTabs();
    renderActiveChips();
    renderResults();
    syncUrl();
  };

  // ---------- URL <-> state ----------
  const readUrl = () => {
    const params = new URLSearchParams(location.search);
    const type = params.get("tipo");
    if (type === "segunda" || type === "biomasa") state.type = type;
    state.query = params.get("q") || "";
    const zone = params.get("zona");
    if (zone && GB.data.zones.includes(zone)) state.zones.add(zone);
    return params.get("lote"); // lot id to open directly, if any
  };

  const syncUrl = () => {
    const params = new URLSearchParams();
    if (state.type !== "all") params.set("tipo", state.type);
    if (state.query) params.set("q", state.query);
    const query = params.toString();
    history.replaceState(null, "", query ? `?${query}` : location.pathname);
  };

  // ---------- Events ----------
  const bindEvents = () => {
    const searchInput = $("[data-search]");
    searchInput.value = state.query;
    const applySearch = () => { state.query = searchInput.value.trim(); render(); };
    searchInput.addEventListener("input", debounce(applySearch, 250));
    $("[data-search-form]").addEventListener("submit", (e) => { e.preventDefault(); applySearch(); });

    $("[data-type-tabs]").addEventListener("click", (e) => {
      const tab = e.target.closest("[data-type]");
      if (!tab) return;
      state.type = tab.dataset.type;
      // Drop selected products that don't belong to the new type
      state.products.forEach((p) => {
        if (state.type !== "all" && GB.data.products[p].category !== state.type) state.products.delete(p);
      });
      renderFilterOptions();
      render();
    });

    const filters = $("[data-filters]");
    filters.addEventListener("change", (e) => {
      const input = e.target;
      if (input.name === "product") input.checked ? state.products.add(input.value) : state.products.delete(input.value);
      if (input.name === "zone") input.checked ? state.zones.add(input.value) : state.zones.delete(input.value);
      if (input.matches("[data-filter-delivery]")) state.deliveryOnly = input.checked;
      if (input.matches("[data-filter-available]")) state.hideSoldOut = input.checked;
      render();
    });

    const priceInput = $("[data-filter-price]");
    priceInput.addEventListener("input", () => {
      state.maxPrice = Number(priceInput.value);
      $("[data-price-label]").textContent = formatCRC(state.maxPrice);
      render();
    });

    $("[data-sort]").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

    // Remove a single active filter chip
    $("[data-active-filters]").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      const { remove, value } = btn.dataset;
      if (remove === "query") { state.query = ""; searchInput.value = ""; }
      if (remove === "product") state.products.delete(value);
      if (remove === "zone") state.zones.delete(value);
      if (remove === "price") { state.maxPrice = MAX_PRICE; priceInput.value = MAX_PRICE; $("[data-price-label]").textContent = formatCRC(MAX_PRICE); }
      if (remove === "delivery") { state.deliveryOnly = false; $("[data-filter-delivery]").checked = false; }
      renderFilterOptions();
      render();
    });

    // Clear everything
    $$("[data-clear-filters]").forEach((btn) =>
      btn.addEventListener("click", () => {
        Object.assign(state, { query: "", maxPrice: MAX_PRICE, deliveryOnly: false });
        state.products.clear();
        state.zones.clear();
        searchInput.value = "";
        priceInput.value = MAX_PRICE;
        $("[data-price-label]").textContent = formatCRC(MAX_PRICE);
        $("[data-filter-delivery]").checked = false;
        renderFilterOptions();
        render();
      })
    );

    // Mobile off-canvas filters (focus moves in on open and back on close)
    const openFiltersBtn = $("[data-open-filters]");
    const setFiltersOpen = (open) => {
      filters.classList.toggle("is-open", open);
      openFiltersBtn.setAttribute("aria-expanded", open);
      if (open) $(".filters__close", filters).focus();
      else openFiltersBtn.focus();
    };
    openFiltersBtn.addEventListener("click", () => setFiltersOpen(true));
    $$("[data-close-filters]").forEach((btn) => btn.addEventListener("click", () => setFiltersOpen(false)));
    filters.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && filters.classList.contains("is-open")) setFiltersOpen(false);
    });

    $("[data-empty-alert]").addEventListener("click", () =>
      GB.ui.toast("Alerta creada: te avisamos cuando haya lotes con estos filtros (simulado).", "clock")
    );

    GB.lotDetail.bindClicks($("[data-results]"));

    // Re-render if a lot is published in another tab or the demo is reset
    // (only when the number of lots changes, not on every reservation update)
    let knownLots = GB.store.getAllLots().length;
    GB.store.subscribe(() => {
      const total = GB.store.getAllLots().length;
      if (total === knownLots) return;
      knownLots = total;
      renderFilterOptions();
      render();
    });
  };

  GB.pages.catalog = {
    init() {
      const lotToOpen = readUrl();
      $("[data-empty-art]").innerHTML = GB.illustrations.render("leaf");
      renderFilterOptions();
      bindEvents();
      render();
      if (lotToOpen) GB.lotDetail.open(lotToOpen);
    },
  };
})(window.GB);
