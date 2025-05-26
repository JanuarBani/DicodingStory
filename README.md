# Dicoding Story 📖

**Dicoding Story** adalah aplikasi berbasis web yang dibuat untuk **berbagi cerita seputar Dicoding**. Konsepnya mirip seperti post Instagram, namun khusus untuk komunitas Dicoding.

Aplikasi ini merupakan proyek submission akhir dari kelas **Belajar Pengembangan Web Intermediate** di Dicoding.

---

## 🌐 Endpoint API

Aplikasi menggunakan API Dicoding Story sebagai sumber data utama. Endpoint resmi dan dokumentasi dapat ditemukan di halaman kelas submission.

---

## ✨ Fitur Utama

- ✅ Menggunakan **Single Page Application (SPA)**
- ✅ Mengonsumsi dan menampilkan data dari API
- ✅ Fitur **tambah cerita (post story)** dengan foto & deskripsi
- ✅ Push Notification menggunakan **VAPID public key**
- ✅ Progressive Web App (**PWA**):
  - Installable
  - Offline ready
- ✅ Penyimpanan data offline menggunakan **IndexedDB**
- ✅ Halaman **Not Found (404)** untuk rute tidak dikenal
- ✅ Aksesibilitas sesuai standar:
  - Skip link
  - Navigasi keyboard
- ✅ Autentikasi:
  - Halaman login/logout
  - Proteksi halaman berdasarkan status login

---

## 📦 Deployment

Aplikasi dapat langsung diakses melalui GitHub Pages:

🔗 **[https://username.github.io/project-name/](https://username.github.io/project-name/)**

> URL juga tersedia dalam `STUDENT.txt` di root repository.

---

## 🛠️ Teknologi

- JavaScript (Vanilla)
- Webpack 5
- Service Worker (manual dan via Workbox)
- IndexedDB dengan bantuan [idb](https://www.npmjs.com/package/idb)
- Web Push API
- Manifest.json + Shortcut PWA

---

## 🧪 Cara Menjalankan Proyek Ini

```bash
# Install dependency
npm install

# Build project untuk production
npm run build

# Jalankan server development
npm run start-dev
