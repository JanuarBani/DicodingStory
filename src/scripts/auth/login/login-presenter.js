import { loginUser } from "../../data/api";

export default class LoginPresenter {
  #view;
  #authModel;

  constructor({ view, authModel }) {
    this.#view = view;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();

    try {
      const response = await loginUser(email, password);

      if (response.error) {
        console.error("getLogin: error response:", response);
        this.#view.loginFailed(response.message);
        return;
      }

      this.#authModel.putAccessToken(response.loginResult.token);

      this.#view.loginSuccessfully(response.message, response.loginResult);
    } catch (error) {
      console.error("getLogin: error:", error);
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
