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
