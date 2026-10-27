/* ==========================================================================
   GreenBits — UI helpers: toast notifications and modal dialogs
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";
  const { icon } = GB.utils;

  // ---------- Toasts ----------
  let stack;

  /** Shows a small notification at the bottom of the screen */
  const toast = (message, iconName = "check", duration = 3800) => {
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("role", "status");
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${icon(iconName)}<span>${message}</span>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, duration);
  };

  // ---------- Modal ----------
  let modalEl;
  let lastFocused;

  const ensureModal = () => {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.className = "modal";
    modalEl.hidden = true;
    modalEl.innerHTML = `
      <div class="modal__backdrop" data-close></div>
      <div class="modal__dialog" role="dialog" aria-modal="true" aria-label="Detalle">
        <button class="icon-btn modal__close" type="button" aria-label="Cerrar" data-close>${icon("close")}</button>
        <div class="modal__content"></div>
      </div>`;
    document.body.appendChild(modalEl);
    modalEl.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modalEl.hidden) closeModal();
    });
    return modalEl;
  };

  /** Opens the modal with the given HTML and returns its content element */
  const openModal = (html, label = "Detalle") => {
    const modal = ensureModal();
    lastFocused = document.activeElement;
    modal.querySelector(".modal__dialog").setAttribute("aria-label", label);
    const content = modal.querySelector(".modal__content");
    content.innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal__close").focus();
    return content;
  };

  const closeModal = () => {
    if (!modalEl) return;
    modalEl.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  GB.ui = { toast, openModal, closeModal };
})(window.GB);
