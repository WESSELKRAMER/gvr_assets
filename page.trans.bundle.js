// Page transition - first visit only
function initShutterPageTransition() {
  if (typeof gsap === "undefined") return;

  const overlay = document.querySelector("[data-page-shutter]");
  const panel = document.querySelector("[data-page-shutter-panel]");
  if (!overlay || !panel) return;

  const seenKey = "vdj_shutter_seen";

  const colors = {
    sky: ["#94B8E9", "#3B7AFD", "#1D438F", "#001E5E"],
    sand: ["#E1BF73", "#BA9B56", "#785B1A", "#4F3806"],
    moss: ["#B8B455", "#828C44", "#64701A", "#3A4A24"],
    leaves: ["#75C87E", "#369340", "#0E871A", "#005B09"],
    sunset: ["#EEBE89", "#FBB66A", "#F09A3A", "#F58911"]
  };

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function pickTwoSeparatedShades() {
    const pairs = [
      [0, 2],
      [0, 3],
      [1, 3]
    ];

    return pairs[Math.floor(Math.random() * pairs.length)];
  }

  function generateColors() {
    const hueNames = Object.keys(colors);
    const repeatedHue = hueNames[Math.floor(Math.random() * hueNames.length)];
    const repeatedShades = pickTwoSeparatedShades();

    const remainingHues = shuffle(
      hueNames.filter((hue) => hue !== repeatedHue)
    ).slice(0, 3);

    const picked = [
      colors[repeatedHue][repeatedShades[0]],
      colors[repeatedHue][repeatedShades[1]],
      ...remainingHues.map((hue) => {
        const shade = Math.floor(Math.random() * colors[hue].length);
        return colors[hue][shade];
      })
    ];

    return shuffle(picked);
  }

  function hasThreeSimilarHeights(heights) {
    for (let i = 0; i < heights.length; i++) {
      const similar = heights.filter((h) => Math.abs(h - heights[i]) < 5);
      if (similar.length >= 3) return true;
    }
    return false;
  }

  function generateHeights() {
    for (let attempt = 0; attempt < 100; attempt++) {
      const big = 60 + Math.random() * 10;
      const small = 5 + Math.random() * 2;

      const remaining = 100 - big - small;

      const a = 8 + Math.random() * 12;
      const b = 8 + Math.random() * 12;
      const c = remaining - a - b;

      let heights = [big, small, a, b, c];

      const valid =
        heights.every((h) => h >= 5) &&
        !hasThreeSimilarHeights(heights) &&
        heights.every((h, i) =>
          heights.every(
            (other, j) => i === j || Math.abs(h - other) >= 5
          )
        );

      if (!valid) continue;

      heights = shuffle(heights);

      const biggestIndex = heights.indexOf(Math.max(...heights));

      if (biggestIndex === 2) {
        [heights[2], heights[1]] = [heights[1], heights[2]];
      }

      return heights;
    }

    return shuffle([62, 6, 9, 15, 8]);
  }

  function buildBlocks() {
    panel.innerHTML = "";

    const blockColors = generateColors();
    const blockHeights = generateHeights();

    blockColors.forEach((color, index) => {
      const block = document.createElement("div");
      block.classList.add("page_shutter_row");
      block.style.backgroundColor = color;
      block.style.height = `${blockHeights[index]}vh`;
      panel.appendChild(block);
    });

    return Array.from(panel.children);
  }

  function playIntro() {
    const rows = buildBlocks();

    return gsap
      .timeline()
      .set(overlay, {
        visibility: "visible",
        pointerEvents: "auto"
      })
      .set(rows, {
        scaleY: 1,
        transformOrigin: "top center"
      })
      .to(rows, {
        scaleY: 0,
        duration: 1,
        stagger: {
          each: 0.08,
          from: "end",
          ease: "power2.inOut"
        },
        ease: "expo.inOut"
      })
      .set(overlay, {
        visibility: "hidden",
        pointerEvents: "none"
      })
      .call(() => {
        document.documentElement.classList.remove("is_transitioning");
        sessionStorage.setItem(seenKey, "true");
      });
  }

  function resetToIdle() {
    document.documentElement.classList.remove("is_transitioning");
    gsap.set(overlay, {
      visibility: "hidden",
      pointerEvents: "none"
    });
  }

  if (sessionStorage.getItem(seenKey) === "true") {
    resetToIdle();
    return;
  }

  document.documentElement.classList.add("is_transitioning");
  playIntro();
}

document.addEventListener("DOMContentLoaded", initShutterPageTransition);
