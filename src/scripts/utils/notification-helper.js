import { convertBase64ToUint8Array } from "./index";
import { VAPID_PUBLIC_KEY } from "../config";
import { subscribeNotifications, unsubscribeNotifications } from "../data/api";
import { getAccessToken } from "./auth";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    alert("Izin notifikasi ditolak.");
    return false;
  }

  if (status === "default") {
    alert("Izin notifikasi ditutup atau diabaikan.");
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.warn(
      "Service worker belum terdaftar saat getPushSubscription dipanggil."
    );
    return null; // atau undefined
  }
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert("Sudah berlangganan push notification.");
    return;
  }

  console.log("Mulai berlangganan push notification...");

  const failureSubscribeMessage =
    "Langganan push notification gagal diaktifkan.";
  const successSubscribeMessage =
    "Langganan push notification berhasil diaktifkan.";
  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error("Service worker belum terdaftar.");
      alert(failureSubscribeMessage);
      return;
    }

    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    const token = getAccessToken();

    const response = await subscribeNotifications(
      endpoint,
      keys.p256dh,
      keys.auth,
      token
    );

    if (!response || response.error) {
      console.error("subscribe: response:", response);
      alert(failureSubscribeMessage);
      await pushSubscription.unsubscribe();
      return;
    }

    alert(successSubscribeMessage);
  } catch (error) {
    console.error("subscribe: error:", error);
    alert(failureSubscribeMessage);

    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage =
    "Langganan push notification gagal dinonaktifkan.";
  const successUnsubscribeMessage =
    "Langganan push notification berhasil dinonaktifkan.";

  try {
    const token = getAccessToken();
    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      alert(
        "Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya."
      );
      return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribeNotifications(endpoint, token);

    if (response.error) {
      alert(failureUnsubscribeMessage);
      console.error("unsubscribe: response:", response);
      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();
    if (unsubscribed === false) {
      console.warn(
        "unsubscribe: pushSubscription.unsubscribe() returned false, but continuing anyway."
      );
    }

    alert(successUnsubscribeMessage);
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error("unsubscribe: error:", error);
  }
}
