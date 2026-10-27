/* ==========================================================================
   GreenBits — Scroll animations
   - .reveal elements fade in when they enter the viewport.
   - [data-count] elements count up from 0 to their target number.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";
  const { $$ } = GB.utils;

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = (target * eased).toLocaleString("es-CR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const init = () => {
    const targets = $$(".reveal, [data-count]");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
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
  };

  GB.reveal = { init };
})(window.GB);
