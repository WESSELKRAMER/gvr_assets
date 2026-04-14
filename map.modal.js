document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("interactive-map");
  const mapOverlay = document.querySelector(".map-overlay");
  const mapCloseBtn = document.querySelector(".map-close");

  if (!mapEl || !mapOverlay || typeof maplibregl === "undefined") return;

  const DEFAULT_CENTER = [5.50, 52.50];
  const DEFAULT_ZOOM = 9.5;

  function normalizeCategory(value) {
    return (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/_/g, "-");
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
  Bekijk locatie ↗
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

  // TEMP placeholder SVG (replace later per category)
  el.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
    </svg>
  `;

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
