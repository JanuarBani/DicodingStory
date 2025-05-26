import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { getLogout } from "../utils/auth";
import {
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from "../utils";
import NotFoundPage from "./not-found/not-found-page";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

class App {
  #content;
  #skipLinkButton;
  #activePage = null;

  constructor({ content, skipLinkButton }) {
    this.#content = content;
    this.#skipLinkButton = skipLinkButton;

    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupLogout();
  }

  async #setupPushNotification() {
    let subscribeButton = document.getElementById("subscribe-button");

    // Pastikan tombol ada dan punya parentNode sebelum replace
    if (!subscribeButton || !subscribeButton.parentNode) return;

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    const clonedButton = subscribeButton.cloneNode(true);
    subscribeButton.parentNode.replaceChild(clonedButton, subscribeButton);
    subscribeButton = clonedButton;

    if (isSubscribed) {
      subscribeButton.classList.remove("btn-warning", "text-dark");
      subscribeButton.classList.add("btn-secondary", "text-white");
      subscribeButton.innerHTML = `<i class="fas fa-bell-slash"></i> Subscribed`;

      subscribeButton.addEventListener("click", async () => {
        await unsubscribe();
        this.#setupPushNotification();
      });
    } else {
      subscribeButton.classList.remove("btn-secondary", "text-white");
      subscribeButton.classList.add("btn-warning", "text-white");
      subscribeButton.innerHTML = `<i class="fas fa-bell"></i> Subscribe`;

      subscribeButton.addEventListener("click", async () => {
        await subscribe();
        this.#setupPushNotification();
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const pageFactory = routes[url];

    let page;
    if (!pageFactory || typeof pageFactory !== "function") {
      page = new NotFoundPage();
    } else {
      page = pageFactory();
    }

    if (this.#activePage?.destroy) {
      this.#activePage.destroy();
    }

    this.#activePage = page;
    if (page === null) {
      // Tidak render apa pun jika page null (misalnya karena redirect)
      return;
    }

    if (typeof page.render !== "function") {
      this.#content.innerHTML =
        '<p class="text-danger">Halaman tidak valid.</p>';
      return;
    }

    const html = await page.render();

    const previousPage = document.querySelector(".active");
    if (previousPage) {
      previousPage.classList.add("inactive");
      previousPage.classList.remove("active");
    }

    const transition = transitionHelper({
      updateDOM: () => {
        this.#content.innerHTML = html;

        const newPage = document.querySelector(".page");
        if (newPage) {
          newPage.classList.add("active");
          newPage.classList.remove("inactive");
        }
      },
    });

    transition.ready.catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Transition Ready Error:", error);
      }
    });

    transition.updateCallbackDone
      .then(() => {
        scrollTo({ top: 0, behavior: "instant" });
        page.afterRender();

        if (isServiceWorkerAvailable()) {
          this.#setupPushNotification(); // dipanggil setelah DOM selesai
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Transition Done Error:", error);
        }
      });
  }

  #setupLogout() {
    const logoutButton = document.getElementById("logout-button");
    if (!logoutButton) return;

    logoutButton.addEventListener("click", async (event) => {
      event.preventDefault();
      const confirmed = confirm("Apakah Anda yakin ingin keluar?");
      if (confirmed) {
        await getLogout();
        location.hash = "/login";
      }
    });
  }
}

export default App;
