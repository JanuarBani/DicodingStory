import "tiny-slider/dist/tiny-slider.css";
import "leaflet/dist/leaflet.css";

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export async function createCarousel(containerElement, options = {}) {
  const { tns } = await import("tiny-slider");

  return tns({
    container: containerElement,
    mouseDrag: true,
    swipeAngle: false,
    speed: 600,

    nav: true,
    navPosition: "bottom",

    autoplay: false,
    controls: false,

    ...options,
  });
}

/**
 * Ref: https://stackoverflow.com/questions/18650168/convert-blob-to-base64
 */
export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Ref: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 */
export function convertBase64ToBlob(
  base64Data,
  contentType = "",
  sliceSize = 512
) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export function convertBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function setupSkipToContent(button, mainContent) {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    if (!mainContent.hasAttribute("tabindex")) {
      mainContent.setAttribute("tabindex", "-1");
    }

    mainContent.focus();

    mainContent.scrollIntoView({ behavior: "smooth" });
  });
}

export function transitionHelper({ skipTransition = false, updateDOM }) {
  if (
    skipTransition ||
    !document.startViewTransition ||
    document.visibilityState !== "visible"
  ) {
    const updateCallbackDone = Promise.resolve().then(() => {
      updateDOM();
    });

    return {
      ready: Promise.resolve(),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  const transition = document.startViewTransition(() => {
    updateDOM();
  });

  transition.ready.then(() => {
    const oldPage = document.querySelector(".active");
    if (oldPage) oldPage.classList.add("fade-out");
  });

  transition.finished
    .then(() => {
      const newPage = document.querySelector(".active");
      if (newPage) newPage.classList.add("fade-in");
    })
    .catch((error) => {
      console.error("Error during transition:", error);
    });

  return transition;
}
export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.warn("Service Worker API tidak didukung oleh browser.");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const swPath = `${window.location.origin}${
        window.location.pathname.replace(/\/[^/]*$/, "/") + "sw.bundle.js"
      }`;

      const registration = await navigator.serviceWorker.register(swPath);
      console.log("✅ Service Worker berhasil didaftarkan:", registration);
    } catch (error) {
      console.error("❌ Gagal memasang Service Worker:", error);
    }
  });
}
