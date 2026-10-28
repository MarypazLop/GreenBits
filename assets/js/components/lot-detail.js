/* ==========================================================================
   GreenBits — Lot detail + reservation flow (SIMULATED)
   Opens a modal with the lot info and a reservation form. Submitting it:
     1. "sends" the request to the producer (fake delay),
     2. saves it in localStorage (GB.store),
     3. a few seconds later the producer "confirms" it.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";
  const { $, formatCRC, formatNumber, escapeHtml, icon, wait, randomCode, timeAgo } = GB.utils;

  const DELIVERY_FEE = 2500; // flat simulated delivery fee in colones

  /** Next N days as <option> elements for the pickup/delivery date */
  const dateOptions = (days = 5) => {
    const formatter = new Intl.DateTimeFormat("es-CR", { weekday: "long", day: "numeric", month: "short" });
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() + (i + 1) * 86400000);
      const label = formatter.format(date);
      return `<option value="${date.toISOString().slice(0, 10)}">${label.charAt(0).toUpperCase() + label.slice(1)}</option>`;
    }).join("");
  };

  /** "Eduardo Solís" -> "Eduardo", but keeps business names like "Finca Los Laureles" */
  const firstName = (name) =>
    /^(finca|cooperativa|trapiche|beneficio|invernadero|hermanos|soda)\b/i.test(name) ? name : name.split(" ")[0];

  // ---------- Templates ----------
  const detailTemplate = (lot) => {
    const product = GB.lotCard.productOf(lot);
    const category = GB.data.categories[product.category];
    const { html, tone } = GB.lotCard.media(lot);
    const minQty = Math.min(10, lot.qty);

    return `
      <div class="lot-detail">
        <div class="lot-detail__media ${tone}">
          ${html}
          <span class="lot-card__tag ${product.category === "biomasa" ? "lot-card__tag--biomasa" : ""}">${category.short}</span>
        </div>

        <div class="lot-detail__info">
          <p class="lot-detail__producer">${icon("user")} ${escapeHtml(lot.producer)}
            <span class="lot-detail__rating">${icon("star")} ${lot.rating.toFixed(1)}</span>
          </p>
          <h2 class="lot-detail__title">${escapeHtml(lot.title)}</h2>
          <p class="lot-detail__note">${escapeHtml(lot.note)}</p>
          ${GB.speech.isSupported() ? `<button class="btn btn--ghost btn--sm lot-detail__listen" type="button" data-listen-lot>${icon("volume")} Escuchar este lote</button>` : ""}

          <dl class="lot-detail__facts">
            <div><dt>Disponible</dt><dd>${formatNumber(lot.qty)} ${product.unit}</dd></div>
            <div><dt>Precio</dt><dd>${formatCRC(lot.price)}/${product.unit}</dd></div>
            <div><dt>Zona</dt><dd>${escapeHtml(lot.zone)}</dd></div>
            <div><dt>Publicado</dt><dd>${timeAgo(lot.createdAt)}</dd></div>
          </dl>

          <p class="field__label">Usos sugeridos</p>
          <div class="lot-detail__uses">${lot.uses.map((u) => `<span class="chip">${escapeHtml(u)}</span>`).join("")}</div>

          ${lot.soldOut ? `
            <div class="lot-detail__soldout">${icon("info")} Este lote ya fue reservado por completo. Activá una alerta para ${escapeHtml(product.name.toLowerCase())} en ${escapeHtml(lot.zone)}.</div>
            <button class="btn btn--ghost btn--block" type="button" data-alert>${icon("clock")} Avisarme cuando haya otro lote</button>
          ` : `
          <form class="reserve-form" novalidate>
            <div class="reserve-form__row">
              <div class="field">
                <span class="field__label">Cantidad (${product.unit})</span>
                <div class="stepper">
                  <button type="button" data-step="-1" aria-label="Menos">−</button>
                  <input type="number" name="qty" value="${minQty}" min="1" max="${lot.qty}" aria-label="Cantidad">
                  <button type="button" data-step="1" aria-label="Más">+</button>
                </div>
              </div>
              <label class="field">
                <span class="field__label">Fecha</span>
                <select class="select" name="date">${dateOptions()}</select>
              </label>
            </div>

            <div class="segmented" role="radiogroup" aria-label="Forma de entrega">
              <input type="radio" id="m-pickup" name="method" value="pickup" checked>
              <label for="m-pickup">Retiro en finca</label>
              <input type="radio" id="m-delivery" name="method" value="delivery" ${lot.delivery ? "" : "disabled"}>
              <label for="m-delivery" ${lot.delivery ? "" : 'style="opacity:.4;cursor:not-allowed" title="Este productor solo permite retiro"'}>Entrega ${lot.delivery ? "" : "(no disponible)"}</label>
            </div>

            <div class="reserve-form__total">
              <span>Total estimado</span>
              <strong data-total>${formatCRC(minQty * lot.price)}</strong>
            </div>
            <button class="btn btn--accent btn--block" type="submit">${icon("basket")} Reservar con ${escapeHtml(firstName(lot.producer))}</button>
            <p class="field__hint" style="text-align:center">Se paga al retirar o recibir. Sin intermediarios.</p>
          </form>`}
        </div>
      </div>`;
  };

  const successTemplate = (reservation, lot) => `
    <div class="reserve-success">
      <div class="reserve-success__icon">${icon("check")}</div>
      <p class="eyebrow">Solicitud enviada</p>
      <h2>¡Listo! Tu reserva está en camino</h2>
      <p class="section-lead">Le avisamos a ${escapeHtml(lot.producer)}. Te confirmará por WhatsApp en minutos.</p>
      <div class="reserve-success__code">
        <span>Código de reserva</span>
        <strong>${reservation.code}</strong>
      </div>
      <ol class="reserve-success__steps">
        <li class="is-done">${icon("check")} Reserva creada · ${formatNumber(reservation.qty)} ${reservation.unit} de ${escapeHtml(lot.title.toLowerCase())}</li>
        <li class="is-current" data-confirm-step>${icon("clock")} Esperando confirmación del productor…</li>
        <li>${icon(reservation.method === "delivery" ? "truck" : "pin")} ${reservation.method === "delivery" ? "Entrega" : "Retiro"} el ${reservation.dateLabel}</li>
      </ol>
      <div class="reserve-success__actions">
        <button class="btn btn--primary" type="button" data-open-reservations>Ver mis reservas</button>
        <button class="btn btn--ghost" type="button" data-close>Seguir explorando</button>
      </div>
    </div>`;

  /** Text read by "Escuchar este lote" (prices/units are made speakable by GB.speech) */
  const spokenSummary = (lot) => {
    const product = GB.lotCard.productOf(lot);
    return [
      `${lot.title}.`,
      `Productor: ${lot.producer}.`,
      `Disponible: ${formatNumber(lot.qty)} ${product.unit}.`,
      `Precio: ${formatCRC(lot.price)}/${product.unit}.`,
      `Zona: ${lot.zone}.`,
      lot.uses.length ? `Usos sugeridos: ${lot.uses.join(", ")}.` : "",
      lot.soldOut ? "Este lote ya fue reservado por completo." : "",
    ].join(" ");
  };

  // ---------- Behaviour ----------
  const open = (lotId) => {
    const lot = GB.store.getLotById(lotId);
    if (!lot) return;
    const content = GB.ui.openModal(detailTemplate(lot), lot.title);

    const listenBtn = $("[data-listen-lot]", content);
    if (listenBtn) {
      listenBtn.addEventListener("click", () => GB.speech.speak(spokenSummary(lot), $(".lot-detail__info", content), "modal"));
    }

    const alertBtn = $("[data-alert]", content);
    if (alertBtn) {
      alertBtn.addEventListener("click", () => {
        GB.ui.toast("Alerta activada. Te avisaremos por WhatsApp (simulado).", "clock");
        GB.ui.closeModal();
      });
    }

    const form = $(".reserve-form", content);
    if (form) bindForm(form, lot, content);
  };

  const bindForm = (form, lot, content) => {
    const qtyInput = form.elements.qty;
    const totalEl = $("[data-total]", form);

    const calcTotal = () => {
      const qty = clampQty(Number(qtyInput.value));
      const fee = form.elements.method.value === "delivery" ? DELIVERY_FEE : 0;
      totalEl.textContent = formatCRC(qty * lot.price + fee) + (fee ? " (incluye envío)" : "");
    };

    const clampQty = (value) => Math.max(1, Math.min(lot.qty, Math.round(value) || 1));

    form.addEventListener("click", (e) => {
      const step = e.target.closest("[data-step]");
      if (!step) return;
      const delta = Number(step.dataset.step) * (lot.qty > 100 ? 10 : 1);
      qtyInput.value = clampQty(Number(qtyInput.value) + delta);
      calcTotal();
    });
    form.addEventListener("input", calcTotal);
    form.addEventListener("change", () => {
      qtyInput.value = clampQty(Number(qtyInput.value));
      calcTotal();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Enviando al productor…";

      await wait(1100); // simulated network request

      const product = GB.lotCard.productOf(lot);
      const dateSelect = form.elements.date;
      const qty = clampQty(Number(qtyInput.value));
      const method = form.elements.method.value;
      const reservation = GB.store.addReservation({
        code: randomCode(),
        lotId: lot.id,
        title: lot.title,
        producer: lot.producer,
        art: product.art,
        tone: product.tone,
        unit: product.unit,
        qty,
        method,
        total: qty * lot.price + (method === "delivery" ? DELIVERY_FEE : 0),
        dateLabel: dateSelect.options[dateSelect.selectedIndex].text,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      content.innerHTML = successTemplate(reservation, lot);
      content.querySelector("[data-open-reservations]").addEventListener("click", () => {
        GB.ui.closeModal();
        GB.layout.openReservations();
      });

      simulateProducerConfirmation(reservation, lot, content);
    });
  };

  /** After a short wait the producer "accepts" the reservation */
  const simulateProducerConfirmation = (reservation, lot, content) => {
    setTimeout(() => {
      GB.store.confirmReservation(reservation.code);
      const step = content.querySelector("[data-confirm-step]");
      if (step && document.body.contains(step)) {
        step.classList.remove("is-current");
        step.classList.add("is-done");
        step.innerHTML = `${icon("check")} ${escapeHtml(firstName(lot.producer))} confirmó tu reserva`;
      }
      GB.ui.toast(`${escapeHtml(firstName(lot.producer))} confirmó la reserva ${reservation.code}`, "whatsapp");
    }, 4500);
  };

  /** Opens the detail when any element with [data-lot-id] inside `root` is clicked */
  const bindClicks = (root) => {
    root.addEventListener("click", (e) => {
      const card = e.target.closest("[data-lot-id]");
      if (card) open(card.dataset.lotId);
    });
  };

  GB.lotDetail = { open, bindClicks };
})(window.GB);
