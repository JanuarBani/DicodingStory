import { getAccessToken } from "../../utils/auth";

export default class DetailPresenter {
  #view;
  #model;
  #dbModel;

  constructor({ view, model, dbModel }) {
    this.#view = view;
    this.#model = model;
    this.#dbModel = dbModel;
  }

  async loadDetail(id) {
    const token = getAccessToken();

    if (!id || !token) {
      console.warn("❗ ID cerita atau token tidak tersedia");
      this.#view.showError(
        "Detail cerita tidak bisa dimuat: ID atau token hilang."
      );
      return;
    }

    try {
      this.#view.showLoading();

      const response = await this.#model.getStoryDetail(id, token);

      if (response.error) {
        throw new Error(response.message || "Gagal memuat detail cerita");
      }

      this.#view.renderStoryDetail(response.story);

      // Setelah render detail, tampilkan tombol simpan/hapus sesuai status
      await this.showSaveButton(id);
    } catch (error) {
      console.error("Error fetching story detail:", error);
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async saveReport(id) {
    try {
      const token = getAccessToken();
      const response = await this.#model.getStoryDetail(id, token);

      if (response.error) {
        throw new Error(response.message || "Gagal mengambil cerita");
      }

      await this.#dbModel.putReport(response.story);
      this.#view.saveToBookmarkSuccessfully("Berhasil menyimpan ke bookmark");
    } catch (error) {
      console.error("saveReport: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeReport(id) {
    try {
      await this.#dbModel.removeReport(id);
      this.#view.removeFromBookmarkSuccessfully("Berhasil menghapus dari bookmark");
    } catch (error) {
      console.error("removeReport: error:", error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton(id) {
    const saved = await this.#dbModel.getReportById(id);

    if (saved) {
      this.#view.renderRemoveButton(id);
    } else {
      this.#view.renderSaveButton(id);
    }
  }
}
