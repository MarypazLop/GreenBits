/* ==========================================================================
   GreenBits — App bootstrap
   Loaded last on every page. Builds the shared layout, then runs the
   page-specific module registered in GB.pages[<data-page>].
   ========================================================================== */
(function (GB) {
  "use strict";

  /** Replaces <i data-icon="name"></i> placeholders written in the HTML with SVG icons */
  const hydrateIcons = () => {
    GB.utils.$$("i[data-icon]").forEach((el) => {
      el.outerHTML = GB.utils.icon(el.dataset.icon);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    hydrateIcons();
    GB.layout.init();

    const page = document.body.dataset.page;
    if (GB.pages && GB.pages[page]) GB.pages[page].init();

    // Run after page modules so dynamically rendered content is observed too
    GB.reveal.init();
  });
})(window.GB);
