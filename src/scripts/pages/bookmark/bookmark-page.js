import {
  generateReportItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from "../../templates";
import BookmarkPresenter from "./bookmark-presenter";
import Database from "../../data/database";
import Map from "../../utils/map";

export default class BookmarkPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
    <section class="mb-5">
      <div class="container">
        <div class="row">
          <div class="col-12" style="height: 500px;">
            <div id="map" class="w-100 h-100"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="saved-stories-section">
      <div class="container">
        <div id="offline-indicator" class="alert alert-warning d-none" role="alert">
          Kamu sedang offline. Beberapa fitur mungkin tidak tersedia.
        </div>
        <h1 class="section-title mb-4">Daftar Story Tersimpan</h1>
        <div class="row" id="reports-list"></div>
      </div>
    </section>
    `;
  }

  async afterRender() {
    // Setup deteksi offline/online
    this.#setupOfflineIndicator();

    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  #setupOfflineIndicator() {
    const offlineEl = document.getElementById("offline-indicator");

    const updateStatus = () => {
      if (navigator.onLine) {
        offlineEl.classList.add("d-none");
      } else {
        offlineEl.classList.remove("d-none");
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {}
  hideMapLoading() {}
  showReportsListLoading() {}
  hideReportsListLoading() {}

  async populateBookmarkedReports(message, reports) {
    const reportsListEl = document.getElementById("reports-list");
    if (!reportsListEl) return;

    if (!reports || reports.length === 0) {
      this.populateBookmarkedReportsListEmpty();
      return;
    }

    let html = "";
    let lastCoordinate = null;

    for (const report of reports) {
      let address = null;

      if (
        this.#map &&
        report.location?.latitude &&
        report.location?.longitude
      ) {
        const lat = report.location.latitude;
        const lng = report.location.longitude;
        const coordinate = [lat, lng];
        lastCoordinate = coordinate;

        const markerOptions = { alt: report.title || "Laporan" };

        address = await this.#getAddressFromCoordinates(lat, lng);

        // Gunakan fallback jika alamat tidak tersedia
        if (!address || address === "Alamat tidak tersedia") {
          address = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }

        const popupContent = `<strong>${address}</strong>`;

        const marker = this.#map.addMarker(coordinate, markerOptions, {
          content: popupContent,
        });

        if (marker && typeof marker.openPopup === "function") {
          marker.openPopup();
        }
      }

      html += generateReportItemTemplate({
        ...report,
        lat: report.location?.latitude,
        lon: report.location?.longitude,
        address,
      });
    }

    if (
      lastCoordinate &&
      this.#map &&
      typeof this.#map.setView === "function"
    ) {
      this.#map.setView(lastCoordinate, 13);
    }

    reportsListEl.innerHTML = `<div class="reports-list">${html}</div>`;
  }

  populateBookmarkedReportsListEmpty() {
    const reportsListEl = document.getElementById("reports-list");
    if (!reportsListEl) return;

    reportsListEl.innerHTML = generateReportsListEmptyTemplate();
  }

  populateBookmarkedReportsError(message) {
    const reportsListEl = document.getElementById("reports-list");
    if (!reportsListEl) return;

    reportsListEl.innerHTML = generateReportsListErrorTemplate(message);
  }

  async #getAddressFromCoordinates(lat, lng) {
    const apiKey = "19bf24ae48734791bb2e2d5cf3e479f5";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=id`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const components = data.results[0].components;

        const desa =
          components.suburb ||
          components.village ||
          components.hamlet ||
          components.neighbourhood ||
          null;
        const kota =
          components.city ||
          components.town ||
          components.municipality ||
          components.county ||
          null;
        const provinsi = components.state || null;

        const parts = [];
        if (desa) parts.push(desa);
        if (kota && kota !== desa) parts.push(kota);
        if (provinsi) parts.push(provinsi);

        return parts.join(", ");
      } else {
        return null;
      }
    } catch (err) {
      console.error("Gagal mendapatkan alamat:", err);
      return "Alamat tidak tersedia";
    }
  }
}
