import CONFIG from "../config";

export const VAPID_PUBLIC_KEY = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

/**
 * Schema Notifikasi untuk story baru.
 * Ini adalah struktur JSON untuk push notification yang akan dikirim ke browser.
 *
 * {
 *   "title": "Story berhasil dibuat",
 *   "options": {
 *     "body": "Anda telah membuat story baru dengan deskripsi: <story description>"
 *   }
 * }
 */
export const STORY_NOTIFICATION_SCHEMA = {
  title: "Story berhasil dibuat",
  options: {
    body: "Anda telah membuat story baru dengan deskripsi: <story description>",
  },
};


// Endpoints untuk berbagai aksi
const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  GET_STORY_DETAIL: `${CONFIG.BASE_URL}/stories/`,
  SUBSCRIBE_NOTIFICATIONS: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE_NOTIFICATIONS: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function registerUser(name, email, password) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Terjadi kesalahan pada server kami"
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error during registration:", error);
  }
}

export async function loginUser(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  return data;
}

export async function addStory(
  description,
  photoFile,
  token,
  lat = null,
  lon = null
) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photoFile);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  const response = await fetch(ENDPOINTS.ADD_STORY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await response.json();
  return data;
}

export async function addStoryGuest(
  description,
  photoFile,
  lat = null,
  lon = null
) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photoFile);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  const response = await fetch(ENDPOINTS.ADD_STORY_GUEST, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  return data;
}

export async function getAllStories(page = 1, size = 50, location = 0, token) {
  const response = await fetch(
    `${ENDPOINTS.GET_ALL_STORIES}?page=${page}&size=${size}&location=${location}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  return data;
}

export async function getStoryDetail(id, token) {
  const response = await fetch(`${ENDPOINTS.GET_STORY_DETAIL}${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
}

export async function subscribeNotifications(endpoint, p256dh, auth, token) {
  const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATIONS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint,
      keys: {
        p256dh,
        auth,
      },
    }),
  });
  const data = await response.json();
  return data;
}


export async function unsubscribeNotifications(endpoint, token) {
  const response = await fetch(ENDPOINTS.UNSUBSCRIBE_NOTIFICATIONS, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });
  const data = await response.json();
  return data;
}

