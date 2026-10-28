/* ==========================================================================
   GreenBits — Scroll animations
   - .reveal elements fade in when they enter the viewport.
   - [data-count] elements count up from 0 to their target number.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";
  const { $$ } = GB.utils;

  const formatCount = (el, value) =>
    value.toLocaleString("es-CR", {
      minimumFractionDigits: Number(el.dataset.decimals || 0),
      maximumFractionDigits: Number(el.dataset.decimals || 0),
    }) + (el.dataset.suffix || "");

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = formatCount(el, target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /** Everything visible at once, counters already at their final value */
  const showAll = (targets) =>
    targets.forEach((el) => {
      el.classList.add("is-visible");
      if (el.dataset.count) el.textContent = formatCount(el, Number(el.dataset.count));
    });

  const init = () => {
    const targets = $$(".reveal, [data-count]");
    if (!("IntersectionObserver" in window) || GB.a11y.prefersReducedMotion()) {
      showAll(targets);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          if (entry.target.dataset.count) animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => observer.observe(el));

    // Turning "Reducir animaciones" on reveals whatever is still pending
    GB.a11y.onChange(() => {
      if (!GB.a11y.prefersReducedMotion()) return;
      observer.disconnect();
      showAll(targets);
    });
  };

  GB.reveal = { init };
})(window.GB);
