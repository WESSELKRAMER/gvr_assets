document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("interactive-map");
  const mapOverlay = document.querySelector(".map-overlay");
  const mapCloseBtn = document.querySelector(".map-close");

  if (!mapEl || !mapOverlay || typeof maplibregl === "undefined") return;

  const DEFAULT_CENTER = [5.50, 52.50];
  const DEFAULT_ZOOM = 9.5;

  const CATEGORY_SVGS = {
  "eilanden": `
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 19V7M16 10H19.25C19.25 15.1086 15.1086 19.25 10 19.25C4.89137 19.25 0.75 15.1086 0.75 10H4M12.75 3.5C12.75 5.01878 11.5188 6.25 10 6.25C8.4812 6.25 7.25 5.01878 7.25 3.5C7.25 1.98122 8.4812 0.75 10 0.75C11.5188 0.75 12.75 1.98122 12.75 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
    </svg>
  `,

  "fietsen-wandelen": `
    <svg viewBox="0 0 24 16" fill="none" aria-hidden="true">
      <path d="M19 11L16 0.75H13.75M6.75 2.75H9.75M10.9643 7.575L7.85714 3.25M16.6607 4.95L5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
      <path d="M19 15.25C21.3472 15.25 23.25 13.3472 23.25 11C23.25 8.65279 21.3472 6.75 19 6.75C16.6528 6.75 14.75 8.65279 14.75 11C14.75 13.3472 16.6528 15.25 19 15.25Z" stroke="currentColor" stroke-width="1.5"/>
      <path d="M5 15.25C7.34721 15.25 9.25 13.3472 9.25 11C9.25 8.65279 7.34721 6.75 5 6.75C2.65279 6.75 0.75 8.65279 0.75 11C0.75 13.3472 2.65279 15.25 5 15.25Z" stroke="currentColor" stroke-width="1.5"/>
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

  "routes-kaarten": `
    <!-- unchanged -->
  `
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
          title: item.getAttribute("data-title") || "Untitled",
          category: normalizeCategory(item.getAttribute("data-category")),
          lat,
          lng,
          url: item.getAttribute("data-url") || "#",
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

  function buildPopupHtml(item) {
    const title = escapeHtml(item.title);
    const description = escapeHtml(item.description);

    return `
      <div class="map-popup-card" style="min-width:220px;">
        ${
          item.image
            ? `<img src="${item.image}" alt="${title}" style="width:100%;height:auto;border-radius:8px;margin-bottom:10px;display:block;">`
            : ""
        }
        <strong style="display:block;margin-bottom:6px;">${title}</strong>
        ${
          description
            ? `<p style="margin:0 0 10px 0;">${description}</p>`
            : ""
        }
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">
          Bekijk locatie
        </a>
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

    const popup = new maplibregl.Popup({
      offset: 18,
      closeButton: false
    }).setHTML(buildPopupHtml(item));

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

  function renderMarkers() {
    removeAllMarkers();

    const activeCats = getActiveCategories();

    const visibleItems = mapLocations.filter((item) => {
      return activeCats.includes(item.category);
    });

    visibleItems.forEach((item) => {
      markers.push(makeMarker(item));
    });
  }

  function openMapOverlay() {
    mapOverlay.classList.remove("is-hidden");

    requestAnimationFrame(() => {
      map.resize();
      map.easeTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 600
      });
    });

    document.body.style.overflow = "hidden";
  }

  function closeMapOverlay() {
    mapOverlay.classList.add("is-hidden");
    document.body.style.overflow = "";
  }

  map.on("load", () => {
    renderMarkers();
  });

  document.querySelectorAll('.map-filters input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", () => {
      renderMarkers();
      map.resize();
    });
  });

  document.querySelectorAll("[data-map-open]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openMapOverlay();
    });
  });

  mapCloseBtn?.addEventListener("click", () => {
    closeMapOverlay();
  });

  mapOverlay.addEventListener("click", (event) => {
    if (event.target === mapOverlay) {
      closeMapOverlay();
    }
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

  function isMobile() {
    return window.innerWidth <= mobileBreakpoint;
  }

  function setArrow(isOpen, animate = true) {
    gsap.killTweensOf(arrow);

    if (animate) {
      gsap.to(arrow, {
        scaleY: isOpen ? 1 : -1,
        duration: 0.2,
        ease: "power2.out",
        overwrite: true
      });
    } else {
      gsap.set(arrow, {
        scaleY: isOpen ? 1 : -1
      });
    }
  }

  function setState(isOpen, animateArrow = false) {
    filtersBox.classList.toggle("is-open", isOpen);
    filtersToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    setArrow(isOpen, animateArrow);
  }

  function setDefaultState() {
    const shouldBeOpen = window.innerWidth > mobileBreakpoint;
    setState(shouldBeOpen, false);
  }

  filtersToggle.addEventListener("click", () => {
    const isOpen = !filtersBox.classList.contains("is-open");
    setState(isOpen, true);
  });

  window.addEventListener("resize", setDefaultState);

  setDefaultState();
});
