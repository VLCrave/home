
function toggleSubmenu(element) {
  const parentLi = element.parentElement;
  parentLi.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", function () {
  const sidemenu = document.getElementById("sidemenu");
  const menuToggle = document.querySelector(".menu-toggle");
  const mainContent = document.getElementById("main-content");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      sidemenu.classList.toggle("active");
      menuToggle.classList.toggle("open");
    });
  }

  window.loadContent = function (page) {
    sidemenu.classList.remove("active");
    menuToggle.classList.remove("open");

    const loader = document.createElement("div");
    loader.className = "loader";
    mainContent.innerHTML = "";
    mainContent.appendChild(loader);

    setTimeout(() => {
      let content = '';
      switch (page) {
        case "dashboard":
          content = `
            <section class="dashboard">
              <div class="dashboard-content">
                <h2 class="nama-text">Vicky <span>Satria Lindy</span></h2>
                <p class="typing-desc animate">Seorang desainer grafis & kreator digital yang membentuk dan mengak.....</p>
                <a href="#kerjasama">HIRE ME</a>
              </div>
              <div class="photo-glow">
                <img src="https://i.ibb.co/6mNjg45/foto-vicky.png" alt="Foto Vicky">
              </div>
            </section>`;
          break;
        case "asset":
          content = `<section class="content-section"><h2>Asset</h2><p>Konten halaman Asset.</p></section>`;
          break;
        case "service":
          content = `<section class="content-section"><h2>Service</h2><p>Konten halaman Service.</p></section>`;
          break;
        case "shop":
          content = `<section class="content-section"><h2>Shop</h2><p>Konten halaman Shop.</p></section>`;
          break;
        case "submenu1":
          content = `<section class="content-section"><h2>Tools - Submenu 1</h2><p>Konten tools submenu 1.</p></section>`;
          break;
        case "submenu2":
          content = `<section class="content-section"><h2>Tools - Submenu 2</h2><p>Konten tools submenu 2.</p></section>`;
          break;
        case "submenu3":
          content = `<section class="content-section"><h2>Tools - Submenu 3</h2><p>Konten tools submenu 3.</p></section>`;
          break;
      }
      mainContent.innerHTML = content;
    }, 500);
  };

  document.addEventListener("click", function (e) {
    if (!sidemenu.contains(e.target) && !menuToggle.contains(e.target)) {
      sidemenu.classList.remove("active");
      menuToggle.classList.remove("open");
    }
  });
});
