/* ==========================================================================
   GreenBits — Lot card component
   Returns the HTML for a catalog card. Used on the home page and catalog.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";
  const { formatCRC, formatNumber, escapeHtml, icon, timeAgo } = GB.utils;

  /** Product info (name, art, tone, category) for a lot */
  const productOf = (lot) => GB.data.products[lot.product] || GB.data.products.tomate;

  /** Picture area: real photo if the lot has one, otherwise the illustration */
  const media = (lot) => {
    const product = productOf(lot);
    const visual = lot.photo
      ? `<img src="${lot.photo}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">`
      : GB.illustrations.render(product.art);
    return { html: visual, tone: `tone-${product.tone}` };
  };

  const render = (lot) => {
    const product = productOf(lot);
    const category = product.category;
    const { html, tone } = media(lot);
    const isNew = lot.isUserLot || (Date.now() - new Date(lot.createdAt)) < 86400000;

    return `
      <button class="lot-card ${lot.soldOut ? "is-sold-out" : ""}" type="button" data-lot-id="${lot.id}"
              aria-label="Ver ${escapeHtml(lot.title)}">
        <div class="lot-card__media ${tone}">
          ${html}
          <span class="lot-card__tag ${category === "biomasa" ? "lot-card__tag--biomasa" : ""}">
            ${GB.data.categories[category].short}
          </span>
          ${lot.soldOut ? '<span class="lot-card__new" style="background:#455048">AGOTADO</span>' : isNew ? '<span class="lot-card__new">NUEVO</span>' : ""}
        </div>
        <div class="lot-card__body">
          <h3 class="lot-card__title">${escapeHtml(lot.title)}</h3>
          <div class="lot-card__meta">
            <span>${icon("scale")} ${formatNumber(lot.qty)} ${product.unit}</span>
            <span>${icon("pin")} ${escapeHtml(lot.zone)}</span>
            <span>${icon("clock")} ${timeAgo(lot.createdAt)}</span>
          </div>
          <div class="lot-card__meta"><span>${icon("user")} ${escapeHtml(lot.producer)}</span></div>
          <div class="lot-card__footer">
            <p class="lot-card__price">${formatCRC(lot.price)}<small>/${product.unit}</small></p>
            <span class="lot-card__cta">${icon("arrowRight")}</span>
          </div>
        </div>
      </button>`;
  };

  GB.lotCard = { render, productOf, media };
})(window.GB);
