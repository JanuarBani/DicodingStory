import { showFormattedDate } from "./utils";

export function generateReportsListErrorTemplate(message) {
  return `
      <div id="reports-list-error" class="reports-list__error">
        <h2>Terjadi kesalahan pengambilan daftar laporan</h2>
        <p>${
          message ? message : "Gunakan jaringan lain atau laporkan error ini."
        }</p>
      </div>
    `;
}

export function generateMainNavigationListTemplate() {
  return `
    <li><a id="report-list-button" class="report-list-button" href="#/">Daftar Laporan</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Laporan Tersimpan</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="new-report-button" class="btn new-report-button" href="#/new">Buat Laporan <i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
      <div class="position-absolute top-50 start-50 translate-middle">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
}

export function generateReportsListEmptyTemplate() {
  return `
    <div id="reports-list-empty" class="reports-list__empty">
      <h2>Tidak ada laporan yang tersedia</h2>
      <p>Saat ini, tidak ada laporan kerusakan fasilitas umum yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateStoryListTemplate(stories) {
  const addStoryCard = ` 
  <article class="story-card me-3 add-story-card text-center" id="add-story-button">
    <div class="add-story-image-container mb-3">
      <div class="story-image bg-yan rounded-circle border border-primary"></div>
      <div class="add-icon">
        <i class="fas fa-plus-circle fa-lg text-primary"></i>
      </div>
    </div>
    <div class="story-content">
      <strong>Tambah Cerita</strong>
    </div>
  </article>
`;

  const storyItems = stories
    .map((story) => {
      const labelsHtml =
        story.labels
          ?.map(
            (label) => `<span class="badge bg-primary me-1">${label}</span>`
          )
          .join(" ") || "";

      return `
      <article class="story-card me-3">
        <figure class="story-image-wrapper">
          <img src="${story.photoUrl}" class="story-image" alt="${story.name}">
        </figure>
        <div class="story-content text-center mt-2">
          <p class="p-name"><i class="fas fa-book icon-blue"></i> ${
            story.name
          }</p>
          <p class="mb-1"><i class="fas fa-info-circle icon-blue"></i> ${
            story.description
          }</p>
          <small class="text-muted">
            <i class="fas fa-calendar-alt icon-blue"></i> ${new Date(
              story.createdAt
            ).toLocaleDateString()}
          </small>

          <div class="labels mt-2">${labelsHtml}</div>
          <div class="mt-2">
            <a 
              href="${story.detailUrl || `#/detail/${story.id}`}" 
              class="btn btn-outline-primary btn-sm rounded-pill px-3"
              data-id="${story.id}"
            >
              <i class="fas fa-arrow-right"></i> Lihat Detail
            </a>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  return `
    <section class="story-carousel-wrapper position-relative" aria-label="Daftar Cerita Pengguna">
      <button class="carousel-nav left" onclick="scrollStoryCarousel(-1)" aria-label="Scroll kiri">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="story-carousel d-flex overflow-auto">
        ${addStoryCard}
        ${storyItems}
      </div>
      <button class="carousel-nav right" onclick="scrollStoryCarousel(1)" aria-label="Scroll kanan">
        <i class="fas fa-chevron-right"></i>
      </button>
    </section>
  `;
}


export function generateReportItemTemplate({
  id,
  name = "Anonim",
  description = "Deskripsi tidak tersedia",
  photoUrl = "images/default-image.jpg",
  createdAt,
  lat,
  lon,
  address = null,
}) {
  const formattedDate = createdAt
    ? showFormattedDate(createdAt, "id-ID")
    : "Tanggal tidak tersedia";

  const locationText =
    address ||
    (lat !== undefined && lon !== undefined
      ? `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`
      : "Lokasi tidak tersedia");

  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100 shadow-sm" data-reportid="${id}" tabindex="0">
        <img src="${photoUrl}" class="card-img-top" alt="Foto laporan oleh ${name}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">🗓️ ${formattedDate}</h6>
          <p class="card-text mb-1">📍 ${locationText}</p>
          <p class="card-text">${description}</p>
          <a href="#/detail/${id}" class="btn btn-primary mt-auto align-self-start">Selengkapnya →</a>
        </div>
      </div>
    </div>
  `;
}





