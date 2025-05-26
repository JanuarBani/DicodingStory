import NewPresenter from "./new-presenter";
import { convertBase64ToBlob } from "../../utils";
import * as StoryAPI from "../../data/api";
import { generateLoaderAbsoluteTemplate } from "../../templates";
import Camera from "../../utils/camera";
import Map from "../../utils/map";

export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #map = null;

  async render() {
    return `
      <section class="story-header py-5 bg-light">
        <div class="container text-center">
          <h1 class="story-header__title">Buat Cerita Baru</h1>
          <p class="story-header__description">
            Tambahkan foto, deskripsi, dan lokasi untuk berbagi cerita kamu.
          </p>
        </div>
      </section>
  
      <section class="container py-4">
        <div class="mb-3">
          <a href="#/" class="btn btn-outline-secondary btn-sm">
            <i class="fas fa-arrow-left"></i> Kembali ke Beranda
          </a>
        </div>
  
        <div class="card shadow-sm">
          <div class="card-body">
            <form id="story-form" class="story-form">
  
              <!-- Dokumentasi Foto -->
              <div class="mb-4">
                <label class="form-label">Foto Dokumentasi</label>
                <div class="d-flex flex-column flex-md-row gap-2 mb-2">
                  <button id="open-camera-button" class="btn btn-primary" type="button">Buka Kamera</button>
                  <button id="upload-photo-button" class="btn btn-secondary" type="button">Unggah dari Penyimpanan</button>
                  <input id="photo-input" name="photos" type="file" accept="image/*" hidden multiple />
                </div>
  
                <!-- Kamera dan Preview -->
                <div id="camera-container" class="mb-3" style="display: none;">
                  <video id="camera-video" autoplay class="w-100 mb-2" style="max-height: 300px;"></video>
                  <canvas id="camera-canvas" style="display: none;"></canvas>
                  <div class="d-flex justify-content-between align-items-center">
                    <select id="camera-select" class="form-select w-auto"></select>
                    <button id="camera-take-button" class="btn btn-success">Ambil Gambar</button>
                  </div>
                </div>
  
                <!-- Preview Foto -->
                <div id="photos-preview" class="row row-cols-2 row-cols-md-4 g-2"></div>
              </div>
  
              <!-- Deskripsi Section -->
              <div class="mb-3">
                <label for="description-input" class="form-label">Deskripsi Cerita</label>
                <textarea id="description-input" name="description" class="form-control" placeholder="Tuliskan cerita kamu di sini." required></textarea>
              </div>
  
              <!-- Lokasi Section -->
              <div class="mb-3">
                <label class="form-label">Lokasi</label>
                <div id="map" class="story-form__location__map" style="height: 500px; border: 1px solid #ddd;"></div>
                <div id="map-loading-container" class="text-center mt-2"></div>
                <input type="hidden" name="latitude" />
                <input type="hidden" name="longitude" />

                <!-- Informasi Alamat -->
                <div id="location-details" class="mt-3">
                  <p><strong>Kelurahan/Desa:</strong> <span id="alamat-desa">-</span></p>
                  <p><strong>Kota/Kabupaten:</strong> <span id="alamat-kota">-</span></p>
                  <p><strong>Provinsi:</strong> <span id="alamat-provinsi">-</span></p>
                </div>

              </div>
  
              <!-- Submit Button -->
              <div class="d-flex justify-content-center" id="submit-button-container">
                <button type="submit" class="btn btn-success">Buat Cerita</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoryAPI,
    });
    this.#takenDocumentations = [];

    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById("story-form");

    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = {
        description: this.#form.elements.namedItem("description").value,
        photos: this.#takenDocumentations.map((photo) => photo.blob),
        latitude: this.#form.elements.namedItem("latitude").value,
        longitude: this.#form.elements.namedItem("longitude").value,
      };
      await this.#presenter.postNewStory(data);
    });

    document
      .getElementById("upload-photo-button")
      .addEventListener("click", () => {
        document.getElementById("photo-input").click();
      });

    document
      .getElementById("photo-input")
      .addEventListener("change", async (event) => {
        const files = Array.from(event.target.files);
        for (const file of files) {
          await this.#addTakenPhoto(file);
        }
        await this.#populateTakenPhotos();
      });

    const cameraButton = document.getElementById("open-camera-button");
    const cameraContainer = document.getElementById("camera-container");

    cameraButton.addEventListener("click", async () => {
      this.#isCameraOpen = !this.#isCameraOpen;

      if (this.#isCameraOpen) {
        cameraButton.textContent = "Tutup Kamera";
        cameraContainer.style.display = "block";
        this.#setupCamera();
        await this.#camera.launch();
      } else {
        cameraButton.textContent = "Buka Kamera";
        cameraContainer.style.display = "none";
        this.#camera.stop();
      }
    });
  }

  async #getAddressFromCoordinates(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "CeritaApp/1.0 (admin@ceritaapp.local)",
        },
      });

      if (!response.ok) throw new Error("Gagal fetch data");

      const data = await response.json();
      const address = data.address;

      return {
        desa:
          address.village ||
          address.hamlet ||
          address.suburb ||
          address.neighbourhood ||
          address.quarter ||
          "-",
        kota: address.city || address.town || address.county || "-",
        provinsi: address.state || "-",
      };
    } catch (err) {
      return { desa: "-", kota: "-", provinsi: "-" };
    }
  }

  async #handleMapUpdate(lat, lng) {
    this.#updateLatLngInput(lat, lng);
    const alamat = await this.#getAddressFromCoordinates(lat, lng);
    document.getElementById("alamat-desa").textContent = alamat.desa;
    document.getElementById("alamat-kota").textContent = alamat.kota;
    document.getElementById("alamat-provinsi").textContent = alamat.provinsi;
  }

  async initialMap() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      console.error("Map container not found");
      return;
    }

    this.#map = await Map.build("#map", {
      zoom: 15,
      locate: true,
    });

    const centerCoordinate = this.#map.getCenter();
    const lat = centerCoordinate.latitude;
    const lng = centerCoordinate.longitude;

    const initialAddress = await this.#getAddressFromCoordinates(lat, lng);
    await this.#handleMapUpdate(lat, lng);

    const draggableMarker = this.#map.addMarker([lat, lng], {
      draggable: true,
    });

    const initialPopupContent = `
      <strong>${initialAddress.desa}</strong><br>
      ${initialAddress.kota}, ${initialAddress.provinsi}
    `;
    draggableMarker.bindPopup(initialPopupContent).openPopup();

    // Update popup saat marker diklik
    draggableMarker.on("click", async () => {
      draggableMarker.setPopupContent("Memuat alamat...");
      draggableMarker.openPopup();

      const { lat, lng } = draggableMarker.getLatLng();
      const alamat = await this.#getAddressFromCoordinates(lat, lng);
      const popupContent = `
        <strong>${alamat.desa}</strong><br>
        ${alamat.kota}, ${alamat.provinsi}
      `;
      draggableMarker.setPopupContent(popupContent);
    });

    // Update koordinat saat marker digeser
    draggableMarker.addEventListener("move", (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    // Update marker & popup saat peta diklik
    this.#map.addMapEventListener("click", async (event) => {
      const { lat, lng } = event.latlng;
      draggableMarker.setLatLng([lat, lng]);
      event.sourceTarget.flyTo([lat, lng]);

      draggableMarker.setPopupContent("Memuat alamat...");
      draggableMarker.openPopup();

      const alamat = await this.#getAddressFromCoordinates(lat, lng);
      const popupContent = `
        <strong>${alamat.desa}</strong><br>
        ${alamat.kota}, ${alamat.provinsi}
      `;
      draggableMarker.setPopupContent(popupContent);

      await this.#handleMapUpdate(lat, lng);
    });
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem("latitude").value = latitude;
    this.#form.elements.namedItem("longitude").value = longitude;
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-video"),
        cameraSelect: document.getElementById("camera-select"),
        canvas: document.getElementById("camera-canvas"),
      });
    }

    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPhoto(image);
      await this.#populateTakenPhotos();
    });
  }

  async #addTakenPhoto(image) {
    let blob = image;

    if (typeof image === "string") {
      blob = await convertBase64ToBlob(image, "image/png");
    }

    const compressedBlob = await compressImage(blob, 1024, 1024);

    const newPhoto = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: compressedBlob,
    };
    this.#takenDocumentations = [...this.#takenDocumentations, newPhoto];
  }

  async #populateTakenPhotos() {
    const container = document.getElementById("photos-preview");
    container.innerHTML = "";

    this.#takenDocumentations.forEach((photo, index) => {
      const imageUrl = URL.createObjectURL(photo.blob);

      const col = document.createElement("div");
      col.className = "col";

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${imageUrl}" class="card-img-top" alt="Dokumentasi ${
        index + 1
      }">
        <div class="card-body p-2 text-center">
          <button class="btn btn-sm btn-danger" data-id="${
            photo.id
          }">Hapus</button>
        </div>
      `;

      col.appendChild(card);
      container.appendChild(col);

      card.querySelector("button").addEventListener("click", () => {
        this.#removePhoto(photo.id);
        this.#populateTakenPhotos();
      });
    });
  }

  #removePhoto(id) {
    const selectedPhoto = this.#takenDocumentations.find(
      (photo) => photo.id === id
    );
    if (!selectedPhoto) return null;

    this.#takenDocumentations = this.#takenDocumentations.filter(
      (photo) => photo.id !== selectedPhoto.id
    );
    return selectedPhoto;
  }

  storeSuccessfully(message) {
    alert(message);
    this.clearForm();
    location.hash = "/";
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = ` 
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Buat Cerita
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = ` 
      <button class="btn" type="submit">Buat Cerita</button>
    `;
  }

  destroy() {
    // Hentikan kamera jika masih aktif
    if (this.#camera && this.#isCameraOpen) {
      this.#camera.stop();
      this.#isCameraOpen = false;
    }
  }
}

function compressImage(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, "image/jpeg", 0.7);
    };
  });
}
