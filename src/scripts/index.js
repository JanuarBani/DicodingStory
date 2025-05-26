// CSS imports
import "../styles/styles.css";
import "../styles/responsive.css";

import App from "./pages/app";
import { registerServiceWorker } from "./utils";

document.addEventListener("DOMContentLoaded", async () => {
  // Ambil elemen DOM dengan aman
  const content = document.querySelector("#main-content");
  const skipLinkButton = document.getElementById("skip-link");

  if (!content || !skipLinkButton) {
    if (!content) console.error("Elemen 'main-content' tidak ditemukan di DOM.");
    if (!skipLinkButton) console.error("Elemen 'skip-link' tidak ditemukan di DOM.");
    return;
  }

  // Fungsi toggle navbar
  function toggleNavbar() {
    const hash = location.hash;
    const mainNavbar = document.getElementById("main-navbar");
    const authNavbar = document.getElementById("auth-navbar");

    if (!mainNavbar || !authNavbar) {
      console.warn("Navbar elements not found in DOM.");
      return;
    }

    if (hash === "#/login" || hash === "#/register") {
      mainNavbar.style.display = "none";
      authNavbar.style.display = "flex";
    } else {
      mainNavbar.style.display = "flex";
      authNavbar.style.display = "none";
    }
  }

  // Inisialisasi App (tanpa drawer)
  const app = new App({
    content,
    skipLinkButton,
  });

  // Daftarkan service worker
  await registerServiceWorker();

  // Render halaman awal
  await app.renderPage();

  // Tampilkan navbar sesuai halaman saat load
  toggleNavbar();

  // Re-render dan toggle navbar saat hash berubah
  window.addEventListener("hashchange", async () => {
    await app.renderPage();
    toggleNavbar();
  });

  // Scroll effect untuk header
  const header = document.querySelector("header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
    });
  }
});
