document.addEventListener("DOMContentLoaded", function () {
  const sidemenu = document.getElementById("sidemenu");
  const menuToggle = document.querySelector(".menu-toggle");
  const mainContent = document.getElementById("main-content");

  window.toggleMenu = function () {
    sidemenu.classList.toggle("active");
    menuToggle.classList.toggle("open");
  };

  window.loadContent = function (page) {
    sidemenu.classList.remove("active");
    menuToggle.classList.remove("open");

    const loader = document.createElement("div");
    loader.className = "loader";
    mainContent.innerHTML = "";
    mainContent.appendChild(loader);

    setTimeout(() => {
      let content = "";
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
        case "game":
          content = `<section class="content-section"><h2>Game</h2><p>Konten halaman Game.</p></section>`;
          break;
        case "catur":
          content = `
            <section class="content-section">
              <h2>Catur Online</h2>
              <label for="difficulty">Pilih Mode:</label>
              <select id="difficulty">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
              <div id="chess-board" style="margin-top: 20px;"></div>
              <p style="margin-top: 1rem; color: #aaa;">Powered by <a href="https://github.com/jhlywa/chess.js" target="_blank" style="color:#0ff">chess.js</a> & <a href="https://github.com/niklasf/chessboardjs" target="_blank" style="color:#0ff">chessboard.js</a></p>
            </section>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/chessboard.js/1.0.0/css/chessboard.min.css">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/chessboard.js/1.0.0/js/chessboard.min.js"></script>
            <script>
              const game = new Chess();
              const board = Chessboard('chess-board', {
                draggable: true,
                position: 'start',
                onDrop: function (source, target) {
                  const move = game.move({ from: source, to: target, promotion: 'q' });
                  if (move === null) return 'snapback';
                  setTimeout(makeRandomMove, 250);
                }
              });
              function makeRandomMove() {
                const possibleMoves = game.moves();
                if (game.game_over()) return;
                const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                game.move(move);
                board.position(game.fen());
              }
            </script>
          `;
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

  // Klik di luar menu untuk menutup
  document.addEventListener("click", function (e) {
    if (!sidemenu.contains(e.target) && !menuToggle.contains(e.target)) {
      sidemenu.classList.remove("active");
      menuToggle.classList.remove("open");
    }
  });
});
