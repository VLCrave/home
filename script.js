function toggleMenu() {
  const sidemenu = document.getElementById("sidemenu");
  sidemenu.classList.toggle("open");
}

function loadContent(sectionId) {
  const contentArea = document.getElementById("main-content");

  // Dummy data sementara untuk setiap section
  const sections = {
    dashboard: `
      <section class="dashboard">
        <div class="dashboard-content">
          <h2 class="nama-text">Vicky <span>Satria Lindy</span></h2>
          <p class="typing-desc animate">Seorang desainer grafis & kreator digital yang membentuk dan mengak.....</p>
          <a href="#kerjasama">HIRE ME</a>
        </div>
        <div class="photo-glow">
          <img src="https://i.ibb.co/6mNjg45/foto-vicky.png" alt="Foto Vicky">
        </div>
      </section>
    `,
    asset: `<section><h2>Asset</h2><p>Daftar aset akan ditampilkan di sini.</p></section>`,
    service: `<section><h2>Service</h2><p>Layanan yang tersedia akan muncul di sini.</p></section>`,
    shop: `<section><h2>Shop</h2><p>Belanja produk atau layanan digital di sini.</p></section>`,
    game: `<section><h2>Game</h2><p>Pilih permainan yang tersedia dari submenu.</p></section>`,
    catur: `<section><h2>Catur</h2><p>Mainkan permainan catur di sini.</p></section>`,
    submenu1: `<section><h2>Tools - Submenu 1</h2><p>Isi untuk tools submenu 1.</p></section>`,
    submenu2: `<section><h2>Tools - Submenu 2</h2><p>Isi untuk tools submenu 2.</p></section>`,
    submenu3: `<section><h2>Tools - Submenu 3</h2><p>Isi untuk tools submenu 3.</p></section>`
  };

  // Ganti isi dari main-content dengan section yang dipilih
  contentArea.innerHTML = sections[sectionId] || "<section><h2>404</h2><p>Halaman tidak ditemukan.</p></section>";

  // Tutup menu setelah klik jika layar kecil
  document.getElementById("sidemenu").classList.remove("open");
} 

// Tutup menu jika klik di luar
window.addEventListener('click', function(e) {
  const sidemenu = document.getElementById("sidemenu");
  const toggle = document.querySelector(".menu-toggle");
  if (!sidemenu.contains(e.target) && !toggle.contains(e.target)) {
    sidemenu.classList.remove("open");
  }
});
