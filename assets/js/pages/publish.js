/* ==========================================================================
   GreenBits — Publish page logic (4-step wizard)
   Validates each step, keeps a live preview card in sync and, on submit,
   saves the new lot in localStorage so it appears in the catalog.
   ========================================================================== */
window.GB = window.GB || {};
GB.pages = GB.pages || {};

(function (GB) {
  "use strict";
  const { $, $$, icon, formatCRC, escapeHtml, wait } = GB.utils;

  const TOTAL_STEPS = 4;
  const PHOTO_MAX_WIDTH = 640; // photos are resized so they fit in localStorage

  let currentStep = 1;
  let photoDataUrl = null;
  let form;

  // ---------- Helpers ----------
  const values = () => {
    const data = new FormData(form);
    return {
      category: data.get("category"),
      product: data.get("product"),
      qty: Number(data.get("qty")),
      title: (data.get("title") || "").trim(),
      note: (data.get("note") || "").trim(),
      price: Number(data.get("price")),
      zone: data.get("zone"),
      delivery: data.get("delivery") === "on",
      producer: (data.get("producer") || "").trim(),
      phone: (data.get("phone") || "").replace(/\D/g, ""),
    };
  };

  /** Builds a lot object from the form (used by the preview and on submit) */
  const buildLot = (v, id = "preview") => {
    const productKey = v.product || Object.keys(GB.data.products).find((k) => GB.data.products[k].category === v.category);
    const product = GB.data.products[productKey];
    return {
      id,
      product: productKey,
      title: v.title || (v.product ? `${product.name} ${v.category === "segunda" ? "de segunda" : ""}`.trim() : "Tu lote"),
      qty: v.qty || 0,
      price: v.price || 0,
      zone: v.zone || GB.data.zones[0],
      producer: v.producer || "Tu nombre",
      rating: 5,
      createdAt: new Date().toISOString(),
      delivery: v.delivery,
      uses: [],
      note: v.note || "Lote publicado desde GreenBits.",
      photo: photoDataUrl,
      isUserLot: true,
    };
  };

  /** Typical price range for a product, based on the existing lots */
  const priceRange = (productKey) => {
    const prices = GB.data.lots.filter((l) => l.product === productKey).map((l) => l.price);
    if (!prices.length) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  // ---------- Rendering ----------
  const renderProducts = () => {
    const { category, product } = values();
    $("[data-product-pick]").innerHTML = Object.entries(GB.data.products)
      .filter(([, p]) => p.category === category)
      .map(
        ([key, p]) => `
        <label class="product-tile">
          <input type="radio" name="product" value="${key}" ${key === product ? "checked" : ""}>
          <span class="product-tile__box tone-${p.tone}">${GB.illustrations.render(p.art)}${p.name}</span>
        </label>`
      )
      .join("");
  };

  const renderPreview = () => {
    $("[data-preview]").innerHTML = GB.lotCard.render(buildLot(values()));
  };

  const renderUnit = () => {
    const { product } = values();
    const unit = product ? GB.data.products[product].unit : "kg";
    $$("[data-unit-label]").forEach((el) => (el.textContent = unit));
  };

  const renderPriceHint = () => {
    const { product, price } = values();
    const hint = $("[data-price-hint]");
    const range = product && priceRange(product);
    if (!range) {
      hint.classList.remove("is-visible");
      return;
    }
    const name = GB.data.products[product].name.toLowerCase();
    let message = `Otros productores venden ${name} entre ${formatCRC(range.min)} y ${formatCRC(range.max)}.`;
    if (price && price > range.max * 1.3) message += " Tu precio está alto: podrías tardar más en vender.";
    hint.innerHTML = message;
    hint.classList.add("is-visible");
  };

  const renderProgress = () => {
    $$("[data-progress] li").forEach((li, i) => {
      li.classList.toggle("is-active", i + 1 === currentStep);
      li.classList.toggle("is-done", i + 1 < currentStep);
    });
    $$("[data-step]", form).forEach((step) => step.classList.toggle("is-active", Number(step.dataset.step) === currentStep));
    const nav = $(".wizard__nav", form);
    nav.classList.toggle("can-go-back", currentStep > 1);
    $("[data-next]", form).hidden = currentStep === TOTAL_STEPS;
    $("[data-submit]", form).hidden = currentStep !== TOTAL_STEPS;
  };

  // ---------- Validation ----------
  const setError = (input, hasError) => input.closest(".field").classList.toggle("has-error", hasError);

  const validateStep = (step) => {
    const v = values();
    if (step === 1) {
      const ok = Boolean(v.product);
      $('[data-step="1"]', form).classList.toggle("has-error", !ok);
      return ok;
    }
    if (step === 2) {
      const ok = v.qty > 0;
      setError(form.elements.qty, !ok);
      if (!ok) form.elements.qty.focus();
      return ok;
    }
    if (step === 3) {
      const ok = v.price > 0;
      setError(form.elements.price, !ok);
      if (!ok) form.elements.price.focus();
      return ok;
    }
    if (step === 4) {
      const nameOk = v.producer.length > 1;
      const phoneOk = v.phone.length === 8;
      setError(form.elements.producer, !nameOk);
      setError(form.elements.phone, !phoneOk);
      return nameOk && phoneOk;
    }
    return true;
  };

  const goToStep = (step) => {
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, step));
    renderProgress();
    $(".wizard").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ---------- Photo upload (resized with canvas) ----------
  const handlePhoto = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, PHOTO_MAX_WIDTH / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        photoDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        const preview = $("[data-photo-preview]");
        preview.src = photoDataUrl;
        preview.hidden = false;
        $("[data-photo-empty]").hidden = true;
        renderPreview();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const submit = $("[data-submit]", form);
    submit.disabled = true;
    submit.textContent = "Publicando…";
    await wait(1200); // simulated request

    const lot = buildLot(values(), "U-" + Date.now().toString(36).toUpperCase());
    // Reuse suggested uses from an existing lot of the same product, if any
    const similar = GB.data.lots.find((l) => l.product === lot.product);
    lot.uses = similar ? similar.uses : [GB.data.categories[GB.data.products[lot.product].category].short];
    try {
      GB.store.addUserLot(lot);
    } catch (error) {
      lot.photo = null; // photo too big for storage: keep the illustration
      GB.store.addUserLot(lot);
    }
    showSuccess(lot);
  };

  const showSuccess = (lot) => {
    form.hidden = true;
    $("[data-progress]").hidden = true;
    const success = $("[data-success]");
    success.hidden = false;
    success.innerHTML = `
      <img class="publish-success__mark" src="assets/img/isotipo.png" alt="">
      <p class="quote">“Lo que sobra, brota”</p>
      <h2>¡Tu lote ya está publicado!</h2>
      <p class="section-lead">“${escapeHtml(lot.title)}” aparece desde ahora en el catálogo. Cuando alguien reserve te avisamos por WhatsApp al ${lot.producer ? "número que nos diste" : "tu número"}.</p>
      <div class="publish-success__actions">
        <a class="btn btn--primary" href="catalogo.html?lote=${lot.id}">${icon("search")} Verlo en el catálogo</a>
        <a class="btn btn--ghost" href="publicar.html">Publicar otro lote</a>
      </div>`;
    GB.ui.toast("Lote publicado. ¡3 compradores de tu zona ya lo pueden ver!", "sprout");

    // Simulate a buyer reserving the new lot a few seconds later
    setTimeout(() => GB.ui.toast(`Soda El Puente está viendo tu lote de ${escapeHtml(lot.title.toLowerCase())}…`, "user"), 5000);
  };

  // ---------- Events ----------
  const bindEvents = () => {
    form.addEventListener("change", (e) => {
      if (e.target.name === "category") {
        renderProducts();
      }
      if (e.target.name === "product") {
        // Suggest a title when the producer picks a product
        const v = values();
        form.elements.title.value = buildLot({ ...v, title: "" }).title;
        $('[data-step="1"]', form).classList.remove("has-error");
        renderUnit();
      }
      if (e.target.name === "photo") handlePhoto(e.target.files[0]);
      renderPriceHint();
      renderPreview();
    });

    form.addEventListener("input", (e) => {
      if (e.target.closest(".field")) setError(e.target, false);
      renderPriceHint();
      renderPreview();
    });

    $("[data-presets]").addEventListener("click", (e) => {
      const preset = e.target.closest("[data-preset]");
      if (!preset) return;
      form.elements.qty.value = preset.dataset.preset;
      setError(form.elements.qty, false);
      renderPreview();
    });

    $("[data-next]", form).addEventListener("click", () => {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    });
    $("[data-prev]", form).addEventListener("click", () => goToStep(currentStep - 1));

    // Enter key moves forward instead of submitting early
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && currentStep < TOTAL_STEPS) {
        e.preventDefault();
        $("[data-next]", form).click();
      }
    });

    // Drag & drop photo
    const drop = $("[data-photo-drop]");
    ["dragenter", "dragover"].forEach((evt) =>
      drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.add("is-dragging"); })
    );
    ["dragleave", "drop"].forEach((evt) =>
      drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.remove("is-dragging"); })
    );
    drop.addEventListener("drop", (e) => handlePhoto(e.dataTransfer.files[0]));

    form.addEventListener("submit", handleSubmit);
  };

  GB.pages.publish = {
    init() {
      form = $("[data-wizard]");
      $("[data-zone-select]").innerHTML = GB.data.zones.map((z) => `<option>${z}</option>`).join("");
      renderProducts();
      renderUnit();
      renderPreview();
      renderProgress();
      bindEvents();
    },
  };
})(window.GB);
