// === script.js ===

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("active");
}

// Tutup sidebar setelah klik menu
document.querySelectorAll("#sidebar nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("active");
  });
});

// Toggle submenu
function toggleSubmenu(element) {
  const parent = element.parentElement;
  parent.classList.toggle("open");
}

// Load konten dinamis berdasarkan halaman
function loadContent(page) {
  const main = document.getElementById("main-content");

  const contents = {
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
    asset: `
      <section style="padding: 2rem;">
        <h2>Asset</h2>
        <p>Daftar aset digital dan fisik yang dimiliki.</p>
      </section>
    `,
    service: `
      <section style="padding: 2rem;">
        <h2>Service</h2>
        <p>Layanan yang tersedia seperti desain grafis, video editing, dll.</p>
      </section>
    `,
    shop: `
      <section style="padding: 2rem;">
        <h2>Shop</h2>
        <p>Tempat menjual jasa dan produk digital.</p>
      </section>
    `,
    catur: `
      <section style="padding: 2rem;">
        <h2>Catur</h2>
        <p>Permainan catur online dengan berbagai tingkat kesulitan.</p>
      </section>
    `,
    submenu1: `
      <section style="padding: 2rem;">
        <h2>Submenu 1</h2>
        <p>Tools atau fitur kecil pertama.</p>
      </section>
    `,
    submenu2: `
      <section style="padding: 2rem;">
        <h2>Submenu 2</h2>
        <p>Tools atau fitur kecil kedua.</p>
      </section>
    `,
    submenu3: `
      <section style="padding: 2rem;">
        <h2>Submenu 3</h2>
        <p>Tools atau fitur kecil ketiga.</p>
      </section>
    `
  };

  main.innerHTML = contents[page] || `
    <section style="padding: 4rem 2rem;">
      <h2 style="font-size: 2rem; color: #00ffff;">Halaman tidak ditemukan</h2>
    </section>
  `;

  main.innerHTML += `
    <footer>
      <p>&copy; 2025 VL Personal Profile. All Rights Reserved.</p>
    </footer>
  `;
}
