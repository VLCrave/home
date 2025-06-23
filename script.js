// === script.js ===

function toggleSidebar() {
      document.getElementById("sidebar").classList.toggle("active");
    }

    function toggleSubmenu(el) {
      const li = el.parentElement;
      li.classList.toggle("open");
    }

    function loadContent(page) {
      const main = document.getElementById("main-content");
      main.innerHTML = `
        <section style="padding: 4rem 2rem; animation: fadeIn 1.5s ease-in-out;">
          <h2 style="font-size: 2rem; color: var(--text-color);">Halaman: ${page}</h2>
          <p style="color:#777;">Konten dari halaman <b>${page}</b> akan dimuat di sini...</p>
        </section>
        <footer>
          <p>&copy; 2025 VL Personal Profile. All Rights Reserved.</p>
        </footer>
      `;
      // Tutup sidebar otomatis jika terbuka
      document.getElementById("sidebar").classList.remove("active");
    }

    function toggleTheme() {
      document.body.classList.toggle("light");
    }

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
