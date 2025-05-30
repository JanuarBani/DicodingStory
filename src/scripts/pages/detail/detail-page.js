import DetailPresenter from "./detail-presenter";
import * as StoryAPI from "../../data/api";
import Map from "../../utils/map";
import { generateLoaderAbsoluteTemplate } from "../../templates";
import Database from "../../data/database";

export default class DetailPage {
  #presenter;
  #map = null;

  async render() {
    return `
    <div class="container my-4">
      <section id="story-detail-container" class="text-center">
        ${generateLoaderAbsoluteTemplate()}
      </section>

      <div id="save-actions-container" class="text-center my-3">
        <!-- Tombol akan dirender di sini -->
      </div>

      <section id="story-detail-map-container" class="my-4" style="height: 600px;"></section>

      <div id="story-detail-map-loading"></div>

    </div>
  `;
  }

  async afterRender() {
    const hash = window.location.hash;
    const id = hash.split("/")[2];

    if (!id) {
      this.showError("ID cerita tidak ditemukan.");
      return;
    }

    this.#presenter = new DetailPresenter({
      view: this,
      model: StoryAPI,
      dbModel: Database,
    });

    await this.#presenter.loadDetail(id);
  }

  showLoading() {
    const container = document.getElementById("story-detail-container");
    if (container) {
      container.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideLoading() {
    const loading = document.getElementById("story-detail-map-loading");
    if (loading) loading.innerHTML = "";
  }

  showMapLoading() {
    const loading = document.getElementById("story-detail-map-loading");
    if (loading) {
      loading.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  renderStoryDetail(story) {
    const container = document.getElementById("story-detail-container");
    if (!container) return;

    container.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">

          <div class="mb-3 text-start">
            <a href="#/" class="btn btn-outline-secondary btn-sm">
              <i class="fas fa-arrow-left"></i> Kembali ke Beranda
            </a>
          </div>

          <article class="card shadow-sm text-center p-3">
            <img 
              src="${story.photoUrl}" 
              alt="${story.name}" 
              class="img-fluid rounded mb-3 mx-auto d-block" 
              style="max-height: 250px; object-fit: cover;"
            />
            <div class="card-body">
              <h4 class="card-title">${story.name}</h4>
              <p class="card-text">${story.description}</p>
              <p class="text-muted">
                <i class="fas fa-calendar-alt"></i> ${new Date(
                  story.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </article>

        </div>
      </div>
    `;

    this.#renderMap(story.lat, story.lon);
  }

  // async #getAddressFromCoordinates(lat, lng) {
  //   const apiKey = "19bf24ae48734791bb2e2d5cf3e479f5"; // Ganti dengan API key kamu
  //   const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=id`;

  //   try {
  //     const response = await fetch(url);
  //     const data = await response.json();
  //     if (data.results && data.results.length > 0) {
  //       const components = data.results[0].components;
  //       const city = components.city || components.town || components.village;
  //       const province = components.state;

  //       return `${city}, ${province}`;
  //     } else {
  //       return null;
  //     }
  //   } catch (err) {
  //     console.error("Gagal mendapatkan alamat:", err);
  //     return null;
  //   }
  // }

  async #getAddressFromCoordinates(lat, lng) {
    const apiKey = "19bf24ae48734791bb2e2d5cf3e479f5"; // Ganti dengan API key kamu
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=id`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const components = data.results[0].components;

        // Ambil tingkat desa/kelurahan (suburb, village, hamlet), kota/kabupaten, dan provinsi
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
          components.county || // Kabupaten sering di county
          null;
        const provinsi = components.state || null;

        // Format alamat, gabungkan hanya yang ada
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
      return null;
    }
  }

  async #renderMap(lat, lng) {
    if (!lat || !lng) {
      console.warn("❗ Lokasi tidak tersedia untuk cerita ini.");
      return;
    }

    this.showMapLoading();

    try {
      this.#map = await Map.build("#story-detail-map-container", {
        zoom: 13,
        center: [lat, lng],
      });

      const address = await this.#getAddressFromCoordinates(lat, lng);
      const popupContent = address
        ? `<strong>${address}</strong>`
        : `Koordinat: ${lat}, ${lng}`;

      const marker = this.#map.addMarker(
        [lat, lng],
        {},
        { content: popupContent }
      );
      marker.openPopup();
    } catch (error) {
      console.error("❗ Gagal menampilkan peta detail cerita:", error);
    } finally {
      this.hideLoading();
    }
  }

  renderSaveButton(id) {
    const container = document.getElementById("save-actions-container");
    if (!container) return;

    container.innerHTML = `
    <button id="report-detail-save" class="btn btn-primary">
      <i class="fas fa-bookmark"></i> Simpan Story
    </button>
  `;

    document
      .getElementById("report-detail-save")
      .addEventListener("click", async () => {
        await this.#presenter.saveReport(id);
        await this.#presenter.showSaveButton(id);
      });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }
  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton(id) {
    const container = document.getElementById("save-actions-container");
    if (!container) return;

    container.innerHTML = `
    <button id="report-detail-remove" class="btn btn-danger">
      <i class="fas fa-bookmark"></i> Hapus Bookmark
    </button>
  `;

    document
      .getElementById("report-detail-remove")
      .addEventListener("click", async () => {
        await this.#presenter.removeReport(id);
        await this.#presenter.showSaveButton(id);
      });
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }
  removeFromBookmarkFailed(message) {
    alert(message);
  }

  showError(message) {
    const container = document.getElementById("story-detail-container");
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Terjadi Kesalahan</h4>
          <p>${message}</p>
        </div>
      `;
    }
  }
}
