export default class NotFoundPage {
  async render() {
    return `
      <div class="container my-5 text-center">
        <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 60vh;">
          <h1 class="display-1 fw-bold text-danger animate__animated animate__bounce">
            404
          </h1>
          <h2 class="mb-3">Halaman Tidak Ditemukan</h2>
          <p class="lead mb-4">Maaf, alamat yang Anda tuju tidak tersedia.</p>
          <a href="#/" class="btn btn-primary btn-lg shadow animate__animated animate__fadeInUp">
            <i class="fas fa-home me-2"></i> Kembali ke Beranda
          </a>
        </div>
      </div>
    `;
  }

  async afterRender() {
    // Tidak ada logika tambahan untuk halaman 404.
  }
}
