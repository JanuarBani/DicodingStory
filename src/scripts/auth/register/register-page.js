import RegisterPresenter from "./register-presenter";
import { registerUser } from "../../data/api";
import * as AuthModel from "../../utils/auth";

export default class RegisterPage {
  #presenter = null;

  async render() {
    // Cegah akses jika sudah login
    if (AuthModel.isLoggedIn && AuthModel.isLoggedIn()) {
      alert("Anda sudah login. Mengarahkan ke beranda...");
      location.hash = "/";
      return "";
    }

    return `
      <section class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow p-4">
              <h1 class="mb-4 text-center">Daftar Akun</h1>

              <form id="register-form" novalidate>
                <div class="mb-3">
                  <label for="name-input" class="form-label">Nama Lengkap</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                    <input
                      id="name-input"
                      type="text"
                      name="name"
                      class="form-control"
                      placeholder="Masukkan nama lengkap Anda"
                      required
                    >
                  </div>
                </div>

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
                  <div id="email-validation" class="form-text text-danger d-none">Email tidak valid</div>
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
                      placeholder="Masukkan password baru"
                      required
                    >
                  </div>
                  <div id="password-validation" class="form-text text-danger d-none">Password harus minimal 8 karakter.</div>
                </div>

                <div class="mb-3" id="submit-button-container">
                  <button
                    type="submit"
                    id="submit-button"
                    class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled
                  >
                    <i class="fas fa-user-plus"></i> Daftar Akun
                  </button>
                </div>

                <p class="text-center">
                  Sudah punya akun? <a href="#/login">Masuk</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      registerUser,
    });

    this.#setupForm();
  }

  #setupForm() {
    const emailInput = document.getElementById("email-input");
    const passwordInput = document.getElementById("password-input");
    const submitButton = document.getElementById("submit-button");

    emailInput.addEventListener("input", () => {
      this.#validateEmail(emailInput.value);
      this.#toggleSubmitButton();
    });

    passwordInput.addEventListener("input", () => {
      this.#validatePassword(passwordInput.value);
      this.#toggleSubmitButton();
    });

    document
      .getElementById("register-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name-input").value;
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!name || !email || !password) {
          alert("Semua field harus diisi.");
          return;
        }

        const data = { name, email, password };
        await this.#presenter.getRegistered(data);
      });
  }

  #validateEmail(email) {
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    const emailValidation = document.getElementById("email-validation");

    if (emailPattern.test(email)) {
      emailValidation.classList.add("d-none");
    } else {
      emailValidation.classList.remove("d-none");
    }
  }

  #validatePassword(password) {
    const passwordValidation = document.getElementById("password-validation");

    if (password.length < 8) {
      passwordValidation.classList.remove("d-none");
    } else {
      passwordValidation.classList.add("d-none");
    }
  }

  #toggleSubmitButton() {
    const emailInput = document.getElementById("email-input");
    const passwordInput = document.getElementById("password-input");
    const submitButton = document.getElementById("submit-button");

    const isEmailValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(
      emailInput.value
    );
    const isPasswordValid = passwordInput.value.length >= 8;

    submitButton.disabled = !(isEmailValid && isPasswordValid);
  }

  registeredSuccessfully(message) {
    alert("Registrasi berhasil!");
    location.hash = "/login";
  }

  registeredFailed(message) {
    alert(message || "Registrasi gagal.");
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Daftar akun
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" type="submit" id="submit-button" disabled>
        <i class="fas fa-user-plus"></i> Daftar Akun
      </button>
    `;
  }
}
