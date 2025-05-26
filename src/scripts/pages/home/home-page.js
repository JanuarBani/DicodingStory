import { 
  generateLoaderAbsoluteTemplate,
  generateStoryListTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from "../../templates";

import HomePresenter from "./home-presenter";
import * as StoryAPI from "../../data/api";

export default class HomePage {
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <h1 class="section-title">Cerita Terbaru</h1>
        <div id="stories-list-container"></div>
        <div id="stories-list-loading-container" class="mt-3"></div>
      </section>
    `;
  }

  async afterRender() {
    try {
      this.showLoading();

      this.#presenter = new HomePresenter({
        view: this,
        model: StoryAPI,
      });

      await this.#presenter.initialGallery();
    } catch (error) {
      console.error("afterRender: error saat inisialisasi:", error);
      this.populateStoriesListError(
        "Gagal memuat data awal. Silakan coba lagi nanti."
      );
    } finally {
      this.hideLoading();
    }
  }

  populateStoriesList(message, stories) {
    const container = document.getElementById("stories-list-container");

    if (!container) {
      console.error("Elemen #stories-list-container tidak ditemukan");
      return;
    }

    if (!Array.isArray(stories) || stories.length === 0) {
      this.populateStoriesListEmpty();
      return;
    }

    container.innerHTML = generateStoryListTemplate(stories);

    window.scrollStoryCarousel = function (direction) {
      const carousel = document.querySelector(".story-carousel");
      if (carousel) {
        carousel.scrollBy({ left: 300 * direction, behavior: "smooth" });
      }
    };

    const addButton = document.getElementById("add-story-button");
    if (addButton) {
      addButton.addEventListener("click", () => {
        location.hash = "/new";
      });
    } else {
      console.warn("❗️ Tombol #add-story-button tidak ditemukan.");
    }
  }

  populateStoriesListEmpty() {
    const container = document.getElementById("stories-list-container");
    if (container) {
      container.innerHTML = generateReportsListEmptyTemplate();
    }
  }

  populateStoriesListError(message) {
    const container = document.getElementById("stories-list-container");
    if (!container) {
      console.error("Element #stories-list-container tidak ditemukan");
      return;
    }

    container.innerHTML = generateReportsListErrorTemplate(message);
  }

  showLoading() {
    const container = document.getElementById("stories-list-loading-container");
    if (container) {
      container.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideLoading() {
    const container = document.getElementById("stories-list-loading-container");
    if (container) {
      container.innerHTML = "";
    }
  }
}
