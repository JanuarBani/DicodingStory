import { getAccessToken } from "../../utils/auth";

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialGallery() {
    this.#view.showLoading();
    try {
      const token = getAccessToken();
      const response = await this.#model.getAllStories(1, 50, 1, token);

      if (response.error) {
        this.#view.populateStoriesListError(response.message);
        return;
      }

      this.#view.populateStoriesList(response.message, response.listStory);
    } catch (error) {
      console.error("initialGallery: error:", error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
