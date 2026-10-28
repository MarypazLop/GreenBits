/* ==========================================================================
   GreenBits — Read aloud (Web Speech API)
   - Reads <main> block by block, the current text selection, a lot detail
     or (optionally) whatever gets focus / hover.
   - Text is split into short sentences (Chrome cuts long utterances) and
     the block being read gets .is-reading.
   - Rate and voice come from GB.a11y prefs, read again for every sentence,
     so a change applies from the next one.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";
  const { $, $$, icon, escapeHtml } = GB.utils;

  const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const synth = supported ? window.speechSynthesis : null;

  /** Elements read as one block (nested matches are skipped) */
  const BLOCKS = "h1, h2, h3, h4, p, li, dt, dd, legend, label, blockquote, figcaption, a, button, .chip";
  /** Elements announced by "read on focus / hover" */
  const FOCUSABLE = ".lot-card, a[href], button, [role='button']";
  const VOICE_ORDER = ["es-cr", "es-419", "es-mx", "es-us"];
  const MAX_CHUNK = 220;
  const HOVER_DELAY = 400;

  let queue = [];          // [{ text, el }]
  let index = 0;
  let runId = 0;           // invalidates callbacks of cancelled utterances
  let state = "idle";      // "idle" | "speaking" | "paused"
  let source = null;       // "page" | "selection" | "modal" | "focus"
  let highlighted = null;
  let lastSelection = null; // { text, el }
  let panel;

  // ---------- Text helpers ----------
  const clean = (text) => text.replace(/\s+/g, " ").trim();

  /** Visible text of a node, skipping aria-hidden, hidden and form controls */
  const textOf = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if (node.hidden || node.getAttribute("aria-hidden") === "true") return "";
    if (/^(script|style|svg|input|select|textarea|output)$/i.test(node.tagName)) return "";
    if (node.tagName === "IMG") return node.alt || "";
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return "";
    return Array.from(node.childNodes).map(textOf).join(" ");
  };

  /** Makes prices and units sound natural: "₡1 200/kg" -> "1200 colones por kilo" */
  const speakable = (text) =>
    text
      .replace(/(\d)[\s  ](?=\d{3}\b)/g, "$1")
      .replace(/₡\s?(\d+)/g, "$1 colones")
      .replace(/\/\s?kg\b/g, " por kilo")
      .replace(/\/\s?unid\./g, " por unidad")
      .replace(/\bkg\b/g, "kilos")
      .replace(/\bunid\./g, "unidades")
      .replace(/[→←·•]/g, ", ");

  /** Splits text into sentences no longer than MAX_CHUNK characters */
  const splitText = (text) => {
    const chunks = [];
    (speakable(text).match(/[^.!?…]+[.!?…]*/g) || []).forEach((sentence) => {
      let rest = sentence.trim();
      while (rest.length > MAX_CHUNK) {
        const cut = rest.lastIndexOf(" ", MAX_CHUNK);
        const at = cut > 40 ? cut : MAX_CHUNK;
        chunks.push(rest.slice(0, at));
        rest = rest.slice(at).trim();
      }
      if (rest) chunks.push(rest);
    });
    return chunks;
  };

  const isHidden = (el) => Boolean(el.closest('[aria-hidden="true"], [hidden]')) || !el.getClientRects().length;

  /** Readable blocks of `scope` in document order */
  const collectBlocks = (scope) => {
    const blocks = [];
    $$(BLOCKS, scope).forEach((el) => {
      if (blocks.some((block) => block.el.contains(el)) || isHidden(el)) return;
      const text = clean(textOf(el));
      if (text) blocks.push({ el, text });
    });
    return blocks;
  };

  const toQueue = (blocks) => blocks.flatMap(({ el, text }) => splitText(text).map((chunk) => ({ el, text: chunk })));

  // ---------- Voices ----------
  const normLang = (voice) => voice.lang.replace("_", "-").toLowerCase();

  const voiceRank = (voice) => {
    const i = VOICE_ORDER.indexOf(normLang(voice));
    return i === -1 ? VOICE_ORDER.length : i;
  };

  /** Spanish voices, preferring es-CR, then es-419 / es-MX, then any es-* */
  const spanishVoices = () =>
    synth.getVoices()
      .filter((voice) => /^es(-|$)/.test(normLang(voice)))
      .sort((a, b) => voiceRank(a) - voiceRank(b));

  const pickVoice = () => {
    const voices = spanishVoices();
    return voices.find((v) => v.voiceURI === GB.a11y.get("voice")) || voices[0] || null;
  };

  // ---------- Highlight ----------
  const highlight = (el) => {
    if (highlighted) highlighted.classList.remove("is-reading");
    highlighted = el && el.classList.contains("visually-hidden") ? el.parentElement : el;
    if (!highlighted) return;
    highlighted.classList.add("is-reading");
    const rect = highlighted.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      highlighted.scrollIntoView({ block: "center", behavior: GB.a11y.scrollBehavior() });
    }
  };

  // ---------- Playback ----------
  const stateListeners = new Set();
  const setState = (next) => {
    state = next;
    stateListeners.forEach((fn) => fn(state));
  };

  const finish = () => {
    highlight(null);
    source = null;
    setState("idle");
  };

  const speakNext = (id) => {
    if (id !== runId) return;
    if (index >= queue.length) return finish();
    const item = queue[index];
    if (source !== "focus") highlight(item.el);

    const utterance = new SpeechSynthesisUtterance(item.text);
    const voice = pickVoice();
    utterance.lang = voice ? voice.lang : "es-CR";
    if (voice) utterance.voice = voice;
    utterance.rate = GB.a11y.get("rate");
    const next = () => {
      if (id !== runId) return;
      index += 1;
      speakNext(id);
    };
    utterance.onend = next;
    utterance.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled") next();
    };
    synth.speak(utterance);
  };

  const stop = () => {
    if (!supported) return;
    runId += 1;
    queue = [];
    synth.cancel();
    if (synth.paused) synth.resume(); // Chrome keeps the paused flag after cancel()
    if (state !== "idle") finish();
  };

  const start = (items, from) => {
    if (!supported) return;
    stop();
    if (!items.length) return;
    queue = items;
    index = 0;
    source = from;
    setState("speaking");
    const id = runId;
    setTimeout(() => speakNext(id), 60); // Chrome may drop speak() right after cancel()
  };

  const pause = () => {
    if (state !== "speaking") return;
    synth.pause();
    setState("paused");
  };

  const resume = () => {
    if (state !== "paused") return;
    synth.resume();
    setState("speaking");
  };

  // ---------- Public actions ----------
  const readPage = () => start(toQueue(collectBlocks($("main"))), "page");

  /** Reads `text`, highlighting `el` (used by the lot detail modal) */
  const speak = (text, el, from = "modal") => start(splitText(text).map((chunk) => ({ el, text: chunk })), from);

  const readSelection = () => {
    if (!lastSelection) return false;
    start(splitText(lastSelection.text).map((chunk) => ({ el: lastSelection.el, text: chunk })), "selection");
    return true;
  };

  const toggle = () => {
    if (state === "speaking") pause();
    else if (state === "paused") resume();
    else readPage();
  };

  // ---------- Selection tracking (clicking a panel button may clear it) ----------
  const trackSelection = () => {
    let clickingPanel = false; // a press inside the panel may clear the selection: keep the last one
    document.addEventListener("pointerdown", (e) => {
      clickingPanel = Boolean(panel && panel.contains(e.target));
    }, true);
    document.addEventListener("selectionchange", () => {
      const selection = window.getSelection();
      const text = clean(selection.toString());
      const anchor = selection.anchorNode;
      const inPanel = panel && anchor && panel.contains(anchor);
      if (text && !inPanel) {
        const node = selection.getRangeAt(0).commonAncestorContainer;
        lastSelection = { text, el: node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement };
      } else if (!text && !clickingPanel) {
        lastSelection = null;
      }
    });
  };

  // ---------- Read on focus / hover ----------
  const readTarget = (target) => {
    if (!GB.a11y.get("readOnFocus") || !(target instanceof Element)) return;
    const el = target.closest(FOCUSABLE);
    if (!el || el.closest(".a11y-panel") || isHidden(el)) return;
    if (state !== "idle" && source !== "focus") return; // don't cut a page reading
    const label = el.classList.contains("lot-card") ? textOf(el) : el.getAttribute("aria-label") || textOf(el);
    if (clean(label)) speak(clean(label), el, "focus");
  };

  const bindFocusReading = () => {
    let hoverTimer;
    document.addEventListener("focusin", (e) => readTarget(e.target));
    document.addEventListener("mouseover", (e) => {
      clearTimeout(hoverTimer);
      const target = e.target;
      hoverTimer = setTimeout(() => readTarget(target), HOVER_DELAY);
    });
  };

  // ---------- Panel UI ----------
  const rateLabel = (rate) => `${rate.toLocaleString("es-CR")}×`;

  const renderVoices = () => {
    const select = $("[data-speech-voice]", panel);
    const voices = spanishVoices();
    const current = pickVoice();
    select.innerHTML = voices.length
      ? voices.map((v) => `<option value="${escapeHtml(v.voiceURI)}">${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`).join("")
      : '<option value="">Voz predeterminada del sistema</option>';
    if (current) select.value = current.voiceURI;
  };

  const syncPanel = () => {
    const rate = GB.a11y.get("rate");
    const input = $("[data-speech-rate]", panel);
    input.value = rate;
    input.setAttribute("aria-valuetext", `${rate.toLocaleString("es-CR")} veces`);
    $("[data-speech-rate-value]", panel).textContent = rateLabel(rate);
    const voice = pickVoice();
    if (voice) $("[data-speech-voice]", panel).value = voice.voiceURI;
  };

  const STATUS = {
    idle: "",
    speaking: "Leyendo…",
    paused: "Lectura en pausa.",
  };

  const syncState = () => {
    const toggleBtn = $('[data-speech="toggle"]', panel);
    const playing = state === "speaking";
    toggleBtn.innerHTML = `${icon(playing ? "pause" : "play")} <span>${playing ? "Pausar" : state === "paused" ? "Continuar" : "Reproducir"}</span>`;
    $('[data-speech="stop"]', panel).disabled = state === "idle";
    $("[data-speech-status]", panel).textContent = source === "focus" ? "" : STATUS[state];
  };

  const bindPanel = (container) => {
    panel = container;
    if (!$("[data-speech-controls]", panel)) return;
    if (!supported) {
      $("[data-speech-controls]", panel).hidden = true;
      $("[data-speech-unsupported]", panel).hidden = false;
      return;
    }

    panel.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-speech]");
      if (!btn) return;
      const action = btn.dataset.speech;
      if (action === "page") readPage();
      if (action === "toggle") toggle();
      if (action === "stop") stop();
      if (action === "selection" && !readSelection()) {
        $("[data-speech-status]", panel).textContent = "Primero seleccioná un texto de la página.";
      }
    });
    $("[data-speech-voice]", panel).addEventListener("change", (e) => GB.a11y.set({ voice: e.target.value }));
    $("[data-speech-rate]", panel).addEventListener("input", (e) => GB.a11y.set({ rate: Number(e.target.value) }));

    renderVoices();
    synth.addEventListener("voiceschanged", renderVoices); // voices load asynchronously
    GB.a11y.onChange(syncPanel);
    stateListeners.add(syncState);
    syncPanel();
    syncState();
  };

  const init = () => {
    if (!supported) return;
    synth.cancel(); // Chrome can keep speaking after navigating to another page
    window.addEventListener("pagehide", () => synth.cancel());
    document.addEventListener("gb:modal-close", () => source === "modal" && stop());
    trackSelection();
    bindFocusReading();
  };

  GB.speech = {
    init,
    bindPanel,
    isSupported: () => supported,
    speak,
    readPage,
    readSelection,
    stop,
    pause,
    resume,
  };
})(window.GB);
