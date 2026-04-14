document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("interactive-map");
  const mapOverlay = document.querySelector(".map-overlay");
  const mapCloseBtn = document.querySelector(".map-close");

  if (!mapEl || !mapOverlay || typeof maplibregl === "undefined") return;

  const DEFAULT_CENTER = [5.50, 52.50];
  const DEFAULT_ZOOM = 9.5;

  const CATEGORY_SVGS = {
    "eilanden": `
      <svg viewBox="0 0 70 70" aria-hidden="true">
        <path d="M68.83,32.53c-.74-.6-1.72-.84-2.66-.65-.04,0-3.8.79-9.35,1.58-1.74.25-2.95,1.86-2.7,3.6s1.86,2.95,3.6,2.7c2.28-.32,4.25-.65,5.82-.92-.9,16.97-8.13,23.98-25.36,24.72v-22.08c2.12-.05,4.3-.15,6.59-.31,1.75-.13,3.07-1.65,2.95-3.4-.12-1.75-1.59-3.07-3.4-2.95-2.14.15-4.16.24-6.14.29v-9.9c6.41-.97,9.55-5.07,9.55-12.49,0-8.56-4.16-12.73-12.73-12.73s-12.73,4.16-12.73,12.73c0,7.42,3.14,11.52,9.55,12.49v9.9c-1.98-.05-3.99-.14-6.14-.29-1.76-.1-3.28,1.19-3.4,2.95-.13,1.75,1.19,3.27,2.95,3.4,2.29.17,4.47.25,6.59.31v22.08c-17.23-.74-24.46-7.74-25.36-24.72,1.57.27,3.54.59,5.82.92,1.71.24,3.35-.96,3.6-2.7s-.96-3.35-2.7-3.6c-5.55-.79-9.31-1.57-9.34-1.58C1.92,31.44-.05,33.04,0,35,0,59.53,10.47,70,35,70s35-10.47,35-35c0-.96-.43-1.86-1.17-2.47h0ZM28.64,12.73c0-5.06,1.31-6.36,6.36-6.36s6.36,1.31,6.36,6.36-1.31,6.36-6.36,6.36-6.36-1.31-6.36-6.36Z"/>
      </svg>
    `,
    "fietsen-en-wandelen": `
      <svg viewBox="0 0 73.04 70" aria-hidden="true">
        <path d="M15.22,39.57c-8.4,0-15.22,6.81-15.22,15.22s6.81,15.22,15.22,15.22,15.22-6.81,15.22-15.22c-.01-8.4-6.82-15.21-15.22-15.22ZM15.22,63.91c-5.04,0-9.13-4.09-9.13-9.13s4.09-9.13,9.13-9.13,9.13,4.09,9.13,9.13-4.09,9.13-9.13,9.13ZM57.83,39.57c-8.4,0-15.22,6.81-15.22,15.22s6.81,15.22,15.22,15.22,15.22-6.81,15.22-15.22c-.01-8.4-6.82-15.21-15.22-15.22ZM57.83,63.91c-5.04,0-9.13-4.09-9.13-9.13s4.09-9.13,9.13-9.13,9.13,4.09,9.13,9.13-4.09,9.13-9.13,9.13ZM31.54,34.32c-1.26-1.08-1.41-2.98-.34-4.24.06-.07.12-.13.18-.2.51-.49,8.07-7.43,8.07-7.43l10.13,10.13c1.21,1.17,3.14,1.13,4.3-.07,1.14-1.18,1.14-3.05,0-4.23l-12.17-12.17c-.12-.12-.24-.23-.38-.33-3.26-2.31-7.15-3.57-11.14-3.61-4.27,0-14.98,3.62-14.98,12.17,0,5.04,4.09,9.13,9.13,9.13.07,0,.14-.02.21-.02.33,2.13,1.4,4.07,3.02,5.48l5.9,5.07v10.78c0,1.68,1.36,3.04,3.04,3.04s3.04-1.36,3.04-3.04v-12.17c0-.89-.39-1.73-1.06-2.31l-6.96-5.98ZM21.3,24.35c0-3.69,6.61-6.09,8.9-6.09,1.39,0,2.76.24,4.08.69,0,0-7.05,6.49-7.13,6.57-1.16,1.1-2.11,1.87-2.8,1.87-1.68,0-3.04-1.36-3.04-3.04ZM42.61,7.61c0-4.2,3.41-7.61,7.61-7.61s7.61,3.41,7.61,7.61-3.41,7.61-7.61,7.61-7.61-3.41-7.61-7.61Z"/>
      </svg>
    `,
    "horeca": `
      <svg viewBox="0 0 58.34 70" aria-hidden="true">
        <path d="M29.17,2.92v17.5c0,6.93-4.88,12.9-11.67,14.29v32.38c0,1.61-1.31,2.92-2.92,2.92s-2.92-1.31-2.92-2.92v-32.38C4.88,33.31,0,27.34,0,20.42V2.92C0,1.31,1.31,0,2.92,0s2.92,1.31,2.92,2.92v17.5c.02,3.69,2.35,6.98,5.83,8.21V2.92c0-1.61,1.31-2.92,2.92-2.92s2.92,1.31,2.92,2.92v25.71c3.48-1.23,5.82-4.52,5.83-8.21V2.92c0-1.61,1.31-2.92,2.92-2.92s2.92,1.31,2.92,2.92ZM58.33,29.17c-.26,11.23-5.63,21.72-14.58,28.51v9.41c0,1.61-1.31,2.92-2.92,2.92s-2.92-1.31-2.92-2.92V5.83c-.05-2.24,1.25-4.29,3.3-5.2,2.35-.96,5.05-.43,6.87,1.34,6.76,7.42,10.43,17.15,10.25,27.2ZM52.5,29.17c.08-8.54-3.04-16.8-8.75-23.15v43.77c5.47-5.49,8.6-12.88,8.75-20.62Z"/>
      </svg>
    `,
    "overnachten": `
      <svg viewBox="0 0 84 70" aria-hidden="true">
        <path d="M66.5,0H17.5C7.85,0,0,7.85,0,17.5v49c0,1.94,1.57,3.5,3.5,3.5s3.5-1.56,3.5-3.5v-7h70v7c0,1.94,1.56,3.5,3.5,3.5s3.5-1.56,3.5-3.5V17.5c0-9.65-7.85-17.5-17.5-17.5ZM17.5,7h49c5.79,0,10.5,4.71,10.5,10.5v21h-7c0-7.72-6.28-14-14-14h-3.5c-4.18,0-7.93,1.84-10.5,4.75-2.57-2.91-6.32-4.75-10.5-4.75h-3.5c-7.72,0-14,6.28-14,14h-7v-21c0-5.79,4.71-10.5,10.5-10.5ZM45.5,38.5c0-3.86,3.14-7,7-7h3.5c3.86,0,7,3.14,7,7h-17.5ZM21,38.5c0-3.86,3.14-7,7-7h3.5c3.86,0,7,3.14,7,7h-17.5ZM7,52.5v-7h70v7H7Z"/>
      </svg>
    `,
    "varen-en-watersport": `
      <svg viewBox="0 0 70 70" aria-hidden="true">
        <path d="M67.72,46.46c1.33-.3,2.28-1.48,2.28-2.85h0C70,15.95,41.94,0,33.03,0h0c-1.84,0-3.22,1.68-2.86,3.49l9.43,47.03c.23,1.16,1.38,1.91,2.54,1.65l25.58-5.71ZM64.09,41.29l-19.52,4.36-7.81-38.97c8.88,3.24,26.02,15.68,27.33,34.61h0ZM.14,11.64C-.84,6.5,3.58,2.08,8.72,3.05c2.87.54,5.19,2.86,5.73,5.73.97,5.14-3.45,9.56-8.58,8.58-2.87-.54-5.19-2.86-5.73-5.73ZM70,66.01c-2.22,2.54-5.39,3.99-8.75,3.99s-6.61-1.53-8.75-3.96c-2.14,2.43-5.27,3.96-8.75,3.96s-6.61-1.53-8.75-3.96c-2.14,2.43-5.27,3.96-8.75,3.96S2.21,68.54,0,66.01l4.37-3.84c1.11,1.27,2.71,2,4.38,2,3.22,0,5.83-2.62,5.83-5.83h5.83c0,3.22,2.62,5.83,5.83,5.83s5.83-2.62,5.83-5.83h5.83c0,3.22,2.62,5.83,5.83,5.83s5.83-2.62,5.83-5.83h5.83c0,3.22,2.62,5.83,5.83,5.83,1.68,0,3.28-.73,4.38-2l4.37,3.83ZM.14,29.73c-.09-.46-.14-.92-.14-1.37,0-4.13,2.41-6.92,6.11-7.62,2.52-.47,4.45.28,6.5,1.09l5.89,2.11c.47.17.97.21,1.45.11l7.2-1.37c.72-.14,1.42.34,1.56,1.06l.59,3.11c.14.72-.34,1.42-1.06,1.56l-8.45,1.6c-.69.13-1.39.07-2.05-.16l-7.17-2.57c-1.87-.74-2.53-.96-3.35-.82-1.09.21-1.49,1.25-1.32,2.18l1.28,6.74c.32,1.69,1.32,3.56,2.84,3.94l14.72,3.09,2.29,12.06c.14.72-.34,1.42-1.06,1.56l-3.11.59c-.72.14-1.42-.34-1.56-1.06l-1.57-8.24-11.03-2.32c-4.39-1.11-6.61-5.13-7.26-8.54L.14,29.73Z"/>
      </svg>
    `,
    "routes-en-kaarten": `
      <svg viewBox="0 0 69.97 70" aria-hidden="true">
        <path d="M14.58,70c-1.6,0-3.2-.58-4.44-1.74l-5.8-5.39c-5.76-5.76-5.76-15.01-.08-20.69,2.76-2.75,6.42-4.27,10.31-4.27s7.56,1.52,10.31,4.27h0c2.76,2.75,4.27,6.42,4.27,10.31s-1.52,7.56-4.27,10.31l-5.83,5.46c-1.25,1.17-2.85,1.75-4.46,1.75h0ZM14.56,43.74c-2.34,0-4.53.91-6.19,2.56-3.41,3.41-3.41,8.96,0,12.37l5.73,5.32c.27.25.68.25.95,0l5.76-5.39c1.58-1.58,2.49-3.78,2.49-6.12s-.91-4.53-2.56-6.19h0c-1.65-1.65-3.85-2.56-6.18-2.56h0ZM55.4,32.09c-1.6,0-3.2-.58-4.44-1.74l-5.8-5.39c-5.76-5.76-5.76-15.01-.08-20.69,2.75-2.75,6.42-4.27,10.31-4.27s7.55,1.52,10.31,4.27h0c5.69,5.69,5.69,14.94,0,20.62l-5.83,5.46c-1.25,1.17-2.85,1.75-4.46,1.75h0ZM55.39,5.83c-2.34,0-4.53.91-6.19,2.56-3.41,3.41-3.41,8.96,0,12.37l5.72,5.32c.27.25.69.24.95,0l5.76-5.39c3.34-3.34,3.34-8.89-.07-12.3h0c-1.65-1.65-3.85-2.56-6.18-2.56h0ZM69.97,58.32c0-6.43-5.23-11.66-11.66-11.66h-14.58c-3.22,0-5.83-2.62-5.83-5.83,0-2.47,1.56-4.68,3.89-5.5,1.52-.54,2.32-2.2,1.78-3.72s-2.2-2.32-3.72-1.78c-4.65,1.64-7.78,6.07-7.78,11,0,6.43,5.23,11.66,11.66,11.66h14.58c3.22,0,5.83,2.62,5.83,5.83s-2.62,5.83-5.83,5.83h-26.24c-1.61,0-2.92,1.31-2.92,2.92s1.31,2.92,2.92,2.92h26.24c6.43,0,11.66-5.23,11.66-11.66h0Z"/>
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
