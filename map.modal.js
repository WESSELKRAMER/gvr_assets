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
    <path d="M10 19V7M16 10H19.25C19.25 15.1086 15.1086 19.25 10 19.25C4.89137 19.25 0.75 15.1086 0.75 10H4M12.75 3.5C12.75 5.01878 11.5188 6.25 10 6.25C8.4812 6.25 7.25 5.01878 7.25 3.5C7.25 1.98122 8.4812 0.75 10 0.75C11.5188 0.75 12.75 1.98122 12.75 3.5Z" stroke="black" stroke-width="1.5" stroke-linecap="square"/>
  </svg>
`,

"fietsen-wandelen": `
  <svg viewBox="0 0 24 16" fill="none" aria-hidden="true">
    <path d="M19 11L16 0.75H13.75M6.75 2.75H9.75M10.9643 7.575L7.85714 3.25M16.6607 4.95L5 11" stroke="black" stroke-width="1.5" stroke-linecap="square"/>
    <path d="M19 15.25C21.3472 15.25 23.25 13.3472 23.25 11C23.25 8.65279 21.3472 6.75 19 6.75C16.6528 6.75 14.75 8.65279 14.75 11C14.75 13.3472 16.6528 15.25 19 15.25Z" stroke="black" stroke-width="1.5"/>
    <path d="M5 15.25C7.34721 15.25 9.25 13.3472 9.25 11C9.25 8.65279 7.34721 6.75 5 6.75C2.65279 6.75 0.75 8.65279 0.75 11C0.75 13.3472 2.65279 15.25 5 15.25Z" stroke="black" stroke-width="1.5"/>
  </svg>
`,

"horeca": `
  <svg viewBox="0 0 16 18" fill="none" aria-hidden="true">
    <path d="M0.75 0.75V7.9688L2.25 9.5156V17.25H5.25V9.5156L6.75 7.9688V0.75" stroke="black" stroke-width="1.5" stroke-linecap="square"/>
    <path d="M3.75 0.75V6.75" stroke="black" stroke-width="1.5" stroke-linecap="square"/>
    <path d="M15.25 17.25V0.75C14.4541 0.75 10.2083 4 9.75 12.25H12.25V17.25H15.25Z" stroke="black" stroke-width="1.5" stroke-linecap="square"/>
  </svg>
`,

"overnachten": `
  <svg viewBox="0 0 22 20" fill="none" aria-hidden="true">
    <path d="M3.29639 6.67239V18.4224M17.7964 18.4224V6.67239" stroke="black" stroke-width="1.5" stroke-linecap="square"/>
    <path d="M1.04639 7.72358L10.5464 0.922394L20.0464 7.72358" stroke="black" stroke-width="1.5" stroke-linecap="square"/>
    <rect x="6.01746" y="14.2559" width="9.05792" height="3.91654" stroke="black" stroke-width="1.5"/>
    <rect x="7.01434" y="10.9644" width="7.06403" height="3.29144" stroke="black" stroke-width="1.5"/>
    <line x1="10.4158" y1="11.0628" x2="10.4158" y2="13.6876" stroke="black" stroke-width="1.5"/>
  </svg>
`,

"varen-watersport": `
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M15.5 3C15.5 4.24264 14.4926 5.25 13.25 5.25C12.0074 5.25 11 4.24264 11 3C11 1.75736 12.0074 0.75 13.25 0.75C14.4926 0.75 15.5 1.75736 15.5 3Z" stroke="black" stroke-width="1.5"/>
    <path d="M13.5 9.7062L13.7716 9.0071C13.4107 8.8669 13.0023 9.0245 12.8292 9.3708L13.5 9.7062ZM12.5 11.7062L11.8292 11.3708C11.6848 11.6596 11.7414 12.0083 11.9697 12.2366L12.5 11.7062ZM9 8.2062L9.6431 8.5921C9.7776 8.368 9.7857 8.0899 9.6644 7.85833C9.5431 7.62674 9.31 7.475 9.0492 7.45786L9 8.2062ZM12.5 5.20625L12.2104 5.89808C12.6683 6.08976 12.9675 6.33185 13.2882 6.64207C13.5999 6.94351 14.0015 7.38799 14.5452 7.80263L15 7.20625L15.4548 6.60986C15.0043 6.26637 14.7326 5.95223 14.3311 5.56391C13.9387 5.18436 13.485 4.80551 12.7896 4.51442L12.5 5.20625ZM15 7.20625L14.5452 7.80263C15.3734 8.4342 16.6149 9.0239 17.4975 9.4062L17.7956 8.718L18.0937 8.0298C17.2154 7.64934 16.1242 7.12031 15.4548 6.60986L15 7.20625ZM16.9184 11.0342L17.19 10.3351L13.7716 9.0071L13.5 9.7062L13.2284 10.4054L16.6468 11.7333L16.9184 11.0342ZM13.5 9.7062L12.8292 9.3708L11.8292 11.3708L12.5 11.7062L13.1708 12.0417L14.1708 10.0417L13.5 9.7062ZM12.5 11.7062L11.9697 12.2366L14.278 14.5449L14.8083 14.0146L15.3387 13.4842L13.0303 11.1759L12.5 11.7062ZM6.20117 8.5137L6.43664 9.2258C6.85242 9.0883 7.25354 8.9857 7.57717 8.9523L7.5 8.2062L7.42283 7.46023C6.94281 7.50989 6.42402 7.65008 5.9657 7.80164L6.20117 8.5137ZM7.5 8.2062L7.57717 8.9523C7.81834 8.9273 8.1535 8.926 8.4498 8.9334C8.5934 8.937 8.72 8.9424 8.8105 8.9469C8.8556 8.9491 8.8915 8.9511 8.9157 8.9525C8.9279 8.9532 8.937 8.9538 8.943 8.9541C8.946 8.9543 8.9481 8.9545 8.9495 8.9545C8.9501 8.9546 8.9506 8.9546 8.9508 8.9546C8.9508 8.9546 8.9508 8.9546 9 8.2062C9.0492 7.45786 9.0492 7.45787 9.0492 7.45786C9.0493 7.45787 9.0491 7.45785 9.0492 7.45786C9.049 7.45784 9.0482 7.4578 9.0479 7.45778C9.0472 7.45773 9.0463 7.45768 9.0452 7.45761C9.0431 7.45747 9.04 7.45727 9.0361 7.45703C9.0283 7.45655 9.0173 7.45587 9.0031 7.45505C8.9749 7.4534 8.9346 7.45116 8.8847 7.44869C8.7849 7.44375 8.6457 7.43783 8.4872 7.43388C8.1792 7.4262 7.76434 7.4249 7.42283 7.46023L7.5 8.2062ZM7.5 11.2602H6.75V11.7062H7.5H8.25V11.2602H7.5ZM9 8.2062L8.3569 7.82037L7.14189 9.8454L7.78501 10.2312L8.4281 10.6171L9.6431 8.5921L9 8.2062ZM15.3787 15.6769L14.6345 15.5838L14.3652 17.738L15.1094 17.831L15.8536 17.924L16.1229 15.7699L15.3787 15.6769ZM5.07869 6.38563L5.4318 7.0473C6.4998 6.47737 7.69331 5.96792 8.8827 5.716C10.072 5.46412 11.2097 5.4792 12.2104 5.89808L12.5 5.20625L12.7896 4.51442C11.419 3.94068 9.9491 3.95688 8.5719 4.24855C7.19495 4.54019 5.86343 5.11674 4.72559 5.72395L5.07869 6.38563ZM14.8083 14.0146L14.278 14.5449C14.5508 14.8177 14.6823 15.2011 14.6345 15.5838L15.3787 15.6769L16.1229 15.7699C16.2281 14.9278 15.9387 14.0843 15.3387 13.4842L14.8083 14.0146ZM18.4716 10.3942L17.7864 10.0894C17.685 10.3173 17.4225 10.4254 17.19 10.3351L16.9184 11.0342L16.6468 11.7333C17.6255 12.1135 18.7302 11.6583 19.1569 10.699L18.4716 10.3942ZM4.5 7.36823H3.75C3.75 8.7998 5.21896 9.6285 6.43664 9.2258L6.20117 8.5137L5.9657 7.80164C5.7952 7.85802 5.6072 7.82786 5.46131 7.73185C5.32004 7.63888 5.25 7.50839 5.25 7.36823H4.5ZM17.7956 8.718L17.4975 9.4062C17.7816 9.5293 17.8937 9.8481 17.7864 10.0894L18.4716 10.3942L19.1569 10.699C19.6216 9.6543 19.1011 8.4662 18.0937 8.0298L17.7956 8.718ZM7.5 11.2602H8.25C8.25 11.0337 8.3116 10.8114 8.4281 10.6171L7.78501 10.2312L7.14189 9.8454C6.88546 10.2727 6.75 10.7618 6.75 11.2602H7.5ZM4.5 7.36823H5.25C5.25 7.22197 5.32669 7.10339 5.4318 7.0473L5.07869 6.38563L4.72559 5.72395C4.10817 6.05344 3.75 6.69553 3.75 7.36823H4.5Z" fill="black"/>
    <path d="M2.74968 18.5864C-1.34459 5.52439 11.1127 12.6888 14.7497 18.75" stroke="black" stroke-width="1.5"/>
    <path d="M0 19.2C1.5 19.2 2.5 19.5 4 18C5.5 19.66 8.5 19.66 10 18C11.5 19.66 14.5 19.66 16 18C17.5 19.5 18.5 19.2 20 19.2" stroke="black" stroke-width="1.5"/>
  </svg>
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
