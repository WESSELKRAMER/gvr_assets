document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("interactive-map");
  const mapOverlay = document.querySelector(".map-overlay");
  const mapCloseBtn = document.querySelector(".map-close");

  if (!mapEl || !mapOverlay || typeof maplibregl === "undefined") return;

  const DEFAULT_CENTER = [5.50, 52.50];
  const DEFAULT_ZOOM = 9.5;
  const MINIMAP_ZOOM = 7.5;
  const MINIMAP_SINGLE_ZOOM = 11;

  const CATEGORY_URL_PREFIXES = {
    "eilanden": "/beleven/eilanden/",
    "horeca": "/beleven/horeca/",
    "overnachten": "/beleven/overnachten/",
    "varen-watersport": "/beleven/varen-watersport/",
    "fietsen-wandelen": "/beleven/fietsen-wandelen/"
  };

  const CATEGORY_SVGS = {
    "eilanden": `
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 19V7M16 10H19.25C19.25 15.1086 15.1086 19.25 10 19.25C4.89137 19.25 0.75 15.1086 0.75 10H4M12.75 3.5C12.75 5.01878 11.5188 6.25 10 6.25C8.4812 6.25 7.25 5.01878 7.25 3.5C7.25 1.98122 8.4812 0.75 10 0.75C11.5188 0.75 12.75 1.98122 12.75 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
      </svg>
    `,
    "fietsen-wandelen": `
      <svg viewBox="0 0 22 18" fill="none" aria-hidden="true">
        <path d="M10.918 13.25V17.25M10.918 13.25H3.91803L0.91803 9L3.91803 4.75H10.918V13.25ZM10.918 0.75H17.918L20.918 5L17.918 9.25H10.918V0.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
      </svg>
    `,
    "horeca": `
      <svg viewBox="0 0 16 18" fill="none" aria-hidden="true">
        <path d="M0.75 0.75V7.9688L2.25 9.5156V17.25H5.25V9.5156L6.75 7.9688V0.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
        <path d="M3.75 0.75V6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
        <path d="M15.25 17.25V0.75C14.4541 0.75 10.2083 4 9.75 12.25H12.25V17.25H15.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
      </svg>
    `,
    "overnachten": `
      <svg viewBox="0 0 22 20" fill="none" aria-hidden="true">
        <path d="M3.29639 6.67239V18.4224M17.7964 18.4224V6.67239" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
        <path d="M1.04639 7.72358L10.5464 0.922394L20.0464 7.72358" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
        <rect x="6.01746" y="14.2559" width="9.05792" height="3.91654" stroke="currentColor" stroke-width="1.5"/>
        <rect x="7.01434" y="10.9644" width="7.06403" height="3.29144" stroke="currentColor" stroke-width="1.5"/>
        <line x1="10.4158" y1="11.0628" x2="10.4158" y2="13.6876" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `,
    "varen-watersport": `
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M15.5 3C15.5 4.24264 14.4926 5.25 13.25 5.25C12.0074 5.25 11 4.24264 11 3C11 1.75736 12.0074 0.75 13.25 0.75C14.4926 0.75 15.5 1.75736 15.5 3Z" stroke="currentColor" stroke-width="1.5"/>
        <path d="M7.70313 11.7187C7.93229 10.7604 8.475 8.74999 8.8125 8.37499C9.23438 7.90624 6.28125 8.85937 5.53125 8.65624C4.78125 8.45312 2.95313 6.68749 5.53125 5.78124C8.10938 4.87499 10.25 3.89064 12.4219 5.37502C14.5938 6.85939 16.6575 8.34673 17.375 8.65624C18.1719 9 19.0408 9.5614 18.3906 10.6875C17.892 11.5512 16.8865 11.257 16.3895 10.974C16.348 10.9503 16.3062 10.9279 16.2624 10.9088L14.5332 10.1529C14.0687 9.94986 13.5258 10.1265 13.2697 10.564L12.9385 11.1298C12.7306 11.485 12.7615 11.9313 13.0165 12.2544L14.1056 13.6348C14.1497 13.6906 14.1876 13.751 14.2189 13.8148L14.6793 14.7562C14.8039 15.0108 14.8145 15.3064 14.7085 15.5693L14.0312 17.25" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2.74968 18.5864C-1.34459 5.52439 11.1127 12.6888 14.7497 18.75" stroke="currentColor" stroke-width="1.5"/>
        <path d="M0 19.2C1.5 19.2 2.5 19.5 4 18C5.5 19.66 8.5 19.66 10 18C11.5 19.66 14.5 19.66 16 18C17.5 19.5 18.5 19.2 20 19.2" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `,
    "routes-kaarten": ``
  };

  function normalizeCategory(value) {
    return (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, "en")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/_/g, "-")
      .replace(/-+/g, "-");
  }

  function escapeHtml(value) {
    return (value || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getMapLocationsFromCMS() {
    return [...document.querySelectorAll(".map-data-item")]
      .map((item, index) => {
        const lat = parseFloat(item.getAttribute("data-lat"));
        const lng = parseFloat(item.getAttribute("data-lng"));

        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

        return {
          id: item.getAttribute("data-id") || `map-item-${index}`,
          mapId: (item.getAttribute("data-map-id") || "").trim().toLowerCase(),
          title: item.getAttribute("data-title") || "Untitled",
          category: normalizeCategory(item.getAttribute("data-category")),
          verhuur: item.getAttribute("data-verhuur") === "true",
          lat,
          lng,
          url: (() => {
            const raw = item.getAttribute("data-url") || "#";
            const cat = normalizeCategory(item.getAttribute("data-category"));
            const prefix = CATEGORY_URL_PREFIXES[cat];
            if (prefix && raw !== "#" && !raw.startsWith("/") && !raw.startsWith("http")) {
              return prefix + raw;
            }
            return raw;
          })(),
          image: item.getAttribute("data-image") || "",
          description: item.getAttribute("data-description") || ""
        };
      })
      .filter(Boolean);
  }

  const mapLocations = getMapLocationsFromCMS();
  if (!mapLocations.length) {
    console.warn("No valid map locations found in .map-data-item");
    return;
  }

  const map = new maplibregl.Map({
    container: "interactive-map",
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM
  });

  map.addControl(new maplibregl.NavigationControl(), "bottom-right");

  const markers = [];
  let activeSingleId = null;

  function buildPopupHtml(item) {
    const title = escapeHtml(item.title);
    const description = escapeHtml(item.description);

    return `
      <div class="map-popup-card" style="min-width:220px;">
        ${item.image ? `<img src="${item.image}" alt="${title}" style="width:100%;height:auto;border-radius:8px;margin-bottom:10px;display:block;">` : ""}
        <strong style="display:block;margin-bottom:6px;">${title}</strong>
        ${description ? `<p style="margin:0 0 10px 0;">${description}</p>` : ""}
        <a href="${item.url}" ${item.url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}>Bekijk locatie</a>
      </div>
    `;
  }

  function createMarkerElement(item) {
    const el = document.createElement("button");
    el.className = "map-marker";
    el.type = "button";
    el.dataset.cat = item.category;
    el.setAttribute("aria-label", item.title);

    const iconSvg = CATEGORY_SVGS[item.category];
    if (iconSvg) {
      el.innerHTML = `<span class="map-marker-icon" aria-hidden="true">${iconSvg}</span>`;
    }

    return el;
  }

  function makeMarker(item) {
    const el = createMarkerElement(item);

    const popup = new maplibregl.Popup({ offset: 18, closeButton: false })
      .setHTML(buildPopupHtml(item));

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([item.lng, item.lat])
      .setPopup(popup)
      .addTo(map);

    return { marker, data: item, el };
  }

  function removeAllMarkers() {
    markers.forEach(({ marker }) => marker.remove());
    markers.length = 0;
  }

  function getActiveCategories() {
    return [...document.querySelectorAll('.map-filters input[type="checkbox"]:checked')]
      .map((input) => normalizeCategory(input.value));
  }

  function renderMarkers(singleId) {
    const id = singleId !== undefined ? singleId : activeSingleId;
    removeAllMarkers();

    if (id) {
      mapLocations
        .filter((item) => item.mapId === id.trim().toLowerCase())
        .forEach((item) => markers.push(makeMarker(item)));
      return;
    }

    const activeCats = getActiveCategories();
    const showVaren = activeCats.includes("varen-watersport");
    const showVerhuur = activeCats.includes("verhuurlocaties");

    mapLocations
      .filter((item) => {
        if (item.category === "varen-watersport") {
          return item.verhuur ? showVerhuur : showVaren;
        }
        return activeCats.includes(item.category);
      })
      .forEach((item) => markers.push(makeMarker(item)));
  }

  function applyPreFilter(filterAttr) {
    const checkboxes = document.querySelectorAll('.map-filters input[type="checkbox"]');

    if (filterAttr) {
      const requestedCats = filterAttr.split(",").map((s) => normalizeCategory(s.trim()));

      // if verhuurlocaties is requested, varen-watersport must also be active
      // so the parent checkbox doesn't block rendering
      if (requestedCats.includes("verhuurlocaties") && !requestedCats.includes("varen-watersport")) {
        requestedCats.push("varen-watersport");
      }

      checkboxes.forEach((input) => {
        input.checked = requestedCats.includes(normalizeCategory(input.value));
      });
    } else {
      checkboxes.forEach((input) => { input.checked = true; });
    }
  }

  function openMapOverlay() {
    mapOverlay.classList.remove("is-hidden");

    requestAnimationFrame(() => {
      map.resize();
      map.easeTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 600 });
    });

    document.body.style.overflow = "hidden";
  }

  function openMapOverlayAtItem(item) {
    mapOverlay.classList.remove("is-hidden");

    requestAnimationFrame(() => {
      map.resize();
      map.easeTo({ center: [item.lng, item.lat], zoom: 12, duration: 600 });
    });

    document.body.style.overflow = "hidden";
  }

  function closeMapOverlay() {
    mapOverlay.classList.add("is-hidden");
    document.body.style.overflow = "";
    activeSingleId = null;
    renderMarkers();
  }

  function createMinimapMarkerElement(item) {
    const el = document.createElement("div");
    el.className = "map-marker";
    el.dataset.cat = item.category;
    el.setAttribute("aria-label", item.title);
    el.style.cssText = "transform:scale(0.7);transform-origin:center;pointer-events:none;";

    const iconSvg = CATEGORY_SVGS[item.category];
    if (iconSvg) {
      el.innerHTML = `<span class="map-marker-icon" aria-hidden="true">${iconSvg}</span>`;
    }

    return el;
  }

  function getMinimapVisibleItems(filterAttr, singleId) {
    if (singleId) {
      return mapLocations.filter((item) => item.mapId === singleId.trim().toLowerCase());
    }

    const activeCats = filterAttr
      ? filterAttr.split(",").map((s) => normalizeCategory(s.trim()))
      : null;

    if (activeCats && activeCats.includes("verhuurlocaties") && !activeCats.includes("varen-watersport")) {
      activeCats.push("varen-watersport");
    }

    const showVaren = !activeCats || activeCats.includes("varen-watersport");
    const showVerhuur = !activeCats || activeCats.includes("verhuurlocaties");

    return mapLocations.filter((item) => {
      if (item.category === "varen-watersport") {
        return item.verhuur ? showVerhuur : showVaren;
      }
      return !activeCats || activeCats.includes(item.category);
    });
  }

  function initMinimaps() {
    document.querySelectorAll("[data-minimap]").forEach((el) => {
      if (el.dataset.minimapReady) return;
      el.dataset.minimapReady = "true";

      el.style.cursor = "pointer";

      const singleId = el.getAttribute("data-map-single") || null;

      function getFilter() {
        if (el.hasAttribute("data-map-filter")) {
          return el.getAttribute("data-map-filter") || null;
        }
        const ancestor = el.closest("[data-map-open]");
        return ancestor ? (ancestor.getAttribute("data-map-filter") || null) : null;
      }

      const visibleItems = getMinimapVisibleItems(getFilter(), singleId);
      const isSingle = singleId && visibleItems.length === 1;

      const initialCenter = isSingle
        ? [visibleItems[0].lng, visibleItems[0].lat]
        : DEFAULT_CENTER;

      const initialZoom = isSingle ? MINIMAP_SINGLE_ZOOM : MINIMAP_ZOOM;

      const minimap = new maplibregl.Map({
        container: el,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: initialCenter,
        zoom: initialZoom,
        interactive: false,
        attributionControl: false
      });

      minimap.on("load", () => {
        minimap.resize();

        visibleItems.forEach((item) => {
          const markerEl = createMinimapMarkerElement(item);
          new maplibregl.Marker({ element: markerEl })
            .setLngLat([item.lng, item.lat])
            .addTo(minimap);
        });
      });

      el.addEventListener("click", (e) => {
        e.preventDefault();

        if (isSingle) {
          console.log("[map] single mode, singleId:", singleId);
          activeSingleId = singleId;
          renderMarkers(singleId);
          openMapOverlayAtItem(visibleItems[0]);
        } else {
          applyPreFilter(getFilter());
          renderMarkers();
          openMapOverlay();
        }
      });
    });
  }

  map.on("load", () => {
    renderMarkers();
    initMinimaps();
  });

  document.querySelectorAll('.map-filters input[type="checkbox"]').forEach((input) => {
    if (input.closest(".map-filter-item--sub")) {
      input.addEventListener("click", (e) => e.stopPropagation());
    }

    input.addEventListener("change", () => {
      renderMarkers();
      map.resize();
    });
  });

  document.querySelectorAll(".map-filter-sub-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sub = btn.closest(".map-filter-item").querySelector(".map-filter-sub");
      const isOpen = !sub.classList.contains("is-hidden");
      sub.classList.toggle("is-hidden", isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  document.querySelectorAll("[data-map-open]").forEach((trigger) => {
    if (trigger.hasAttribute("data-minimap")) return;

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const filterAttr = trigger.getAttribute("data-map-filter");
      applyPreFilter(filterAttr);
      renderMarkers();
      openMapOverlay();
    });
  });

  mapCloseBtn?.addEventListener("click", () => closeMapOverlay());

  mapOverlay.addEventListener("click", (event) => {
    if (event.target === mapOverlay) closeMapOverlay();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mapOverlay.classList.contains("is-hidden")) {
      closeMapOverlay();
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const filtersBox = document.querySelector(".map-filters");
  const filtersToggle = document.querySelector(".map-filters-toggle");
  const arrow = document.querySelector(".map-filters-arrow svg");

  if (!filtersBox || !filtersToggle || !arrow || typeof gsap === "undefined") return;

  const mobileBreakpoint = 991;

  function setArrow(isOpen, animate = true) {
    gsap.killTweensOf(arrow);

    if (animate) {
      gsap.to(arrow, { scaleY: isOpen ? 1 : -1, duration: 0.2, ease: "power2.out", overwrite: true });
    } else {
      gsap.set(arrow, { scaleY: isOpen ? 1 : -1 });
    }
  }

  function setState(isOpen, animateArrow = false) {
    filtersBox.classList.toggle("is-open", isOpen);
    filtersToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    setArrow(isOpen, animateArrow);
  }

  function setDefaultState() {
    setState(window.innerWidth > mobileBreakpoint, false);
  }

  filtersToggle.addEventListener("click", () => {
    setState(!filtersBox.classList.contains("is-open"), true);
  });

  window.addEventListener("resize", setDefaultState);
  setDefaultState();
});
