import LoginPresenter from "./login-presenter";
import * as STORYAPI from "../../data/api";
import * as AuthModel from "../../utils/auth";

export default class LoginPage {
  #presenter = null;

  async render() {
    // Cegah akses jika sudah login
    if (AuthModel.isLoggedIn && AuthModel.isLoggedIn()) {
      alert("Anda sudah login. Mengarahkan ke beranda...");
      location.hash = "/";
      return ""; // Jangan render apapun
    }

    return `
      <section class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="card shadow p-4" style="max-width: 600px; min-width: 320px; width: 100%;">
          <h2 class="text-center mb-4">Masuk Akun</h2>
          <form id="login-form">
            <div class="mb-3">
              <label for="email-input" class="form-label">Email</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                <input
                  id="email-input"
                  type="email"
                  name="email"
                  class="form-control"
                  placeholder="Contoh: nama@email.com"
                  required
                >
              </div>
            </div>
            <div class="mb-3">
              <label for="password-input" class="form-label">Password</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                <input
                  id="password-input"
                  type="password"
                  name="password"
                  class="form-control"
                  placeholder="Masukkan password Anda"
                  required
                >
              </div>
            </div>
            <div class="d-grid mb-3" id="submit-button-container">
              <button type="submit" class="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                <i class="fas fa-sign-in-alt"></i> Masuk
              </button>
            </div>
            <p class="text-center mb-0">
              Belum punya akun? <a href="#/register">Daftar</a>
            </p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: STORYAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("login-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email-input").value;
        const password = document.getElementById("password-input").value;

        this.#presenter.getLogin({ email, password });
      });
  }

  loginFailed(message) {
    alert(message || "Login gagal. Cek email atau password Anda.");
  }

  loginSuccessfully(message, loginResult) {
    alert(message || "Login berhasil!");
    location.hash = "/";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Masuk
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn btn-primary d-flex align-items-center justify-content-center gap-2" type="submit">
        <i class="fas fa-sign-in-alt"></i> Masuk
      </button>
    `;
  }
}
