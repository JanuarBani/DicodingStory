import { getAccessToken } from "../../utils/auth";
import { subscribe } from "../../utils/notification-helper";

export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showNewFormMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, photos, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();

    try {
      const token = getAccessToken();
      if (!token) {
        this.#view.storeFailed("Token otentikasi tidak ditemukan.");
        return;
      }

      if (!photos || photos.length === 0) {
        this.#view.storeFailed("Minimal satu foto harus disertakan.");
        return;
      }

      const response = await this.#model.addStory(
        description,
        photos[0],
        token,
        latitude,
        longitude
      );

      if (response && response.message) {
        this.#view.storeSuccessfully(response.message);

        // Panggil notifikasi web push
        await this.#notifyStoryCreated(description);
      } else {
        this.#view.storeFailed("Gagal menyimpan cerita.");
      }
    } catch (error) {
      console.error("postNewStory: error:", error);
      this.#view.storeFailed(error.message || "Terjadi kesalahan.");
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async #notifyStoryCreated(description) {
    // Minta izin notifikasi jika belum diberikan
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    }

    // Tampilkan notifikasi
    new Notification("Story berhasil dibuat", {
      body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
    });
  }
}
