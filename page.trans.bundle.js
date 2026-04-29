//Page transition
function initShutterPageTransition() {
  const defaultRows = 6;
  const defaultDuration = 0.43;
  const defaultStagger = 0.075;
  const defaultEase = "expo.inOut";

  const homepageIntroRows = 6;
  const homepageIntroDuration = 0.7;
  const homepageIntroStagger = 0.1;
  const homepageIntroEase = "expo.inOut";

  const transitionFlagKey = "shutter_transition";
  const transitionColorsKey = "shutter_transition_colors";
  const homepageIntroSeenKey = "homepage_intro_seen";

  const colorPalette = [
    "#06246f",
    "#d7d86a",
    "#6b4a00",
    "#8b9444",
    "#d9be72",
    "#F09A3A",
    "#1d1d1d"
  ];

  const overlay = document.querySelector("[data-page-shutter]");
  const panel = document.querySelector("[data-page-shutter-panel]");

  if (!overlay || !panel) return null;

  function createRow(color) {
    const row = document.createElement("div");
    row.classList.add("page_shutter_row");
    row.style.backgroundColor = color;
    return row;
  }

  function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function generateRowColors(rowCount) {
    if (!colorPalette.length) return Array(rowCount).fill("#000000");
    if (colorPalette.length === 1) return Array(rowCount).fill(colorPalette[0]);

    const colors = [];
    let lastColor = null;
    let pool = shuffleArray(colorPalette);

    for (let i = 0; i < rowCount; i++) {
      if (!pool.length) {
        pool = shuffleArray(colorPalette);
      }

      let color = pool.find((item) => item !== lastColor);

      if (!color) color = pool[0];

      const index = pool.indexOf(color);
      if (index > -1) {
        pool.splice(index, 1);
      }

      colors.push(color);
      lastColor = color;
    }

    return colors;
  }

  function saveTransitionColors(colors) {
    sessionStorage.setItem(transitionColorsKey, JSON.stringify(colors));
  }

  function getSavedTransitionColors() {
    const raw = sessionStorage.getItem(transitionColorsKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function clearSavedTransitionColors() {
    sessionStorage.removeItem(transitionColorsKey);
  }

  function buildRows(colors, rowCount) {
    panel.innerHTML = "";

    const targetCount = rowCount || defaultRows;
    const rowColors =
      Array.isArray(colors) && colors.length
        ? colors.slice(0, targetCount)
        : generateRowColors(targetCount);

    while (rowColors.length < targetCount) {
      rowColors.push(colorPalette[rowColors.length % colorPalette.length] || "#000000");
    }

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < targetCount; i++) {
      const row = createRow(rowColors[i]);
      fragment.appendChild(row);
    }

    panel.appendChild(fragment);
    return Array.from(panel.children);
  }

  function ensureRowsExist(colors, rowCount) {
    if (panel.children.length) return Array.from(panel.children);
    return buildRows(colors, rowCount);
  }

  function cover() {
    const rowColors = generateRowColors(defaultRows);
    saveTransitionColors(rowColors);

    const rows = buildRows(rowColors, defaultRows);

    return gsap
      .timeline()
      .set(overlay, { visibility: "visible", pointerEvents: "auto" })
      .set(rows, {
        scaleY: 0,
        transformOrigin: "bottom center"
      })
      .to(rows, {
        scaleY: 1,
        duration: defaultDuration,
        stagger: { each: defaultStagger, from: "end" },
        ease: defaultEase
      });
  }

  function reveal() {
    const savedColors = getSavedTransitionColors();
    const rows = ensureRowsExist(savedColors, defaultRows);

    return gsap
      .timeline()
      .set(overlay, { visibility: "visible", pointerEvents: "auto" })
      .set(rows, {
        scaleY: 1,
        transformOrigin: "top center"
      })
      .to(rows, {
        scaleY: 0,
        duration: defaultDuration,
        stagger: { each: defaultStagger, from: "end" },
        ease: defaultEase
      })
      .set(overlay, { pointerEvents: "none", visibility: "hidden" })
      .call(() => {
        document.documentElement.classList.remove("is_transitioning");
        clearSavedTransitionColors();
      });
  }

  function playHomepageIntro() {
    const introColors = generateRowColors(homepageIntroRows);
    const rows = buildRows(introColors, homepageIntroRows);

    return gsap
      .timeline()
      .set(overlay, { visibility: "visible", pointerEvents: "auto" })
      .set(rows, {
        scaleY: 1,
        transformOrigin: "top center"
      })
      .to(rows, {
        scaleY: 0,
        duration: homepageIntroDuration,
        stagger: { each: homepageIntroStagger, from: "end" },
        ease: homepageIntroEase
      })
      .set(overlay, { pointerEvents: "none", visibility: "hidden" })
      .call(() => {
        document.documentElement.classList.remove("is_transitioning");
        sessionStorage.setItem(homepageIntroSeenKey, "true");
      });
  }

  function resetToIdle() {
    document.documentElement.classList.remove("is_transitioning");
    gsap.set(overlay, { pointerEvents: "none", visibility: "hidden" });
  }

  function isHomepage() {
    const path = window.location.pathname;
    return path === "/" || path === "/index.html";
  }

  function hasSeenHomepageIntro() {
    return sessionStorage.getItem(homepageIntroSeenKey) === "true";
  }

  return {
    cover,
    reveal,
    playHomepageIntro,
    resetToIdle,
    isHomepage,
    hasSeenHomepageIntro,
    transitionFlagKey
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const shutter = initShutterPageTransition();
  if (!shutter) return;

  const navEntry = performance.getEntriesByType("navigation")[0];
  const isBackForwardNavigation = navEntry && navEntry.type === "back_forward";
  const shouldRevealFromLink =
    sessionStorage.getItem(shutter.transitionFlagKey) === "true";

  if (shouldRevealFromLink) {
    sessionStorage.removeItem(shutter.transitionFlagKey);
    shutter.reveal();
  } else if (isBackForwardNavigation) {
    shutter.reveal();
  } else if (shutter.isHomepage() && !shutter.hasSeenHomepageIntro()) {
    document.documentElement.classList.add("is_transitioning");
    shutter.playHomepageIntro();
  } else {
    shutter.resetToIdle();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    const isAnchor = href.startsWith("#");
    const isMailto = href.startsWith("mailto:");
    const isTel = href.startsWith("tel:");
    const isJavascript = href.startsWith("javascript:");
    const isBlank = link.target === "_blank";
    const isDownload = link.hasAttribute("download");
    const isExternal = link.origin !== window.location.origin;

    if (
      isAnchor ||
      isMailto ||
      isTel ||
      isJavascript ||
      isBlank ||
      isDownload ||
      isExternal
    ) {
      return;
    }

    event.preventDefault();
    sessionStorage.setItem(shutter.transitionFlagKey, "true");
    document.documentElement.classList.add("is_transitioning");

    shutter.cover().eventCallback("onComplete", () => {
      window.location.href = href;
    });
  });
});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;

  const shutter = initShutterPageTransition();
  if (!shutter) return;

  shutter.reveal();
});
