// === Data akses & IP yang diizinkan ===
const accessCodes = {
  "PREMIUM": ["111.111.111.111","125.167.48.16"],
  "TESTER": ["111.111.111.112"],
  "VICKY": ["111.111.111.112"],
  "TRIAL": ["111.111.111.112"],
  "ADMIN": ["123.123.123.123"]
};

const chatId = "6046360096"; // VL
const botToken = "7989080902:AAGd4PZjKZGlaqtad3VEo11M-krHUNGNgp4";

// === Session Timeout (30 Menit) ===
const SESSION_EXPIRE_TIME = 30 * 60 * 1000;
const REQUEST_IP_COOLDOWN = 24 * 60 * 60 * 1000; // 24 jam

function isSessionValid() {
  const savedTime = localStorage.getItem("sessionStartTime");
  const accessCode = localStorage.getItem("userAccessCode");
  const userIP = localStorage.getItem("userIP");

  if (!savedTime || !accessCode || !userIP) return false;

  const now = Date.now();
  return now - parseInt(savedTime) < SESSION_EXPIRE_TIME;
}

function clearSession() {
  localStorage.removeItem("userAccessCode");
  localStorage.removeItem("userIP");
  localStorage.removeItem("sessionStartTime");
}

// === Blokir klik kanan dan shortcut umum ===
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && ['U', 'S'].includes(e.key.toUpperCase()))
  ) {
    e.preventDefault();
  }
});

// === Deteksi DevTools ===
setInterval(() => {
  const before = new Date().getTime();
  debugger;
  const after = new Date().getTime();
  if (after - before > 100) {
    document.body.innerHTML = "<h1 style='color: red; text-align: center;'>Akses Diblokir!</h1>";
  }
}, 1000);

// === Kirim Permintaan Request IP Baru ===
async function sendRequestIPToTelegram(ip, kode) {
  const now = new Date();
  const time = now.toLocaleString();
  const message = `🔴 *Permintaan Request IP Baru*\nKode Akses : \`${kode}\`\nIP: \`${ip}\`\nWaktu: \`${time}\``;

  const telegramURL = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(telegramURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    })
  });
  localStorage.setItem("lastRequestIPTime", Date.now().toString());
}

function canRequestIP() {
  const lastTime = localStorage.getItem("lastRequestIPTime");
  if (!lastTime) return true;
  return Date.now() - parseInt(lastTime) > REQUEST_IP_COOLDOWN;
}

// === Login & Session Validation ===
window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup-greeting");
  const overlay = document.getElementById("popup-overlay");
  const closeBtn = document.getElementById("close-popup");
  const accessCodeInput = document.getElementById("access-code");
  const spinner = document.getElementById("loading-spinner");
  const checkIcon = document.getElementById("checkmark");
  const crossIcon = document.getElementById("crossmark");
  const purchaseLink = document.getElementById("purchase-link");
  const requestIPBtn = document.getElementById("request-ip");
  const requestIPContainer = document.getElementById("request-ip-container");

  if (!isSessionValid()) {
    clearSession();
    document.body.classList.add("popup-active");
    popup.style.display = "block";
    overlay.style.display = "block";
  } else {
    popup.style.display = "none";
    overlay.style.display = "none";
    document.body.classList.remove("popup-active");
    return;
  }

  closeBtn.addEventListener("click", async () => {
    const kode = accessCodeInput.value.trim().toUpperCase();

    spinner.style.display = "block";
    checkIcon.style.display = "none";
    crossIcon.style.display = "none";
    purchaseLink.style.display = "none";
    requestIPContainer.style.display = "none";
    closeBtn.disabled = true;

    let userIP = '';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      userIP = data.ip;
    } catch (err) {
      spinner.style.display = "none";
      alert("❌ Gagal mendeteksi IP. Pastikan kamu terhubung ke internet.");
      closeBtn.disabled = false;
      return;
    }

    setTimeout(async () => {
      spinner.style.display = "none";

      if (accessCodes[kode]) {
        if (accessCodes[kode].includes(userIP)) {
          localStorage.setItem("userAccessCode", kode);
          localStorage.setItem("userIP", userIP);
          localStorage.setItem("sessionStartTime", Date.now().toString());

          checkIcon.style.display = "block";
          setTimeout(() => {
            popup.style.display = "none";
            overlay.style.display = "none";
            document.body.classList.remove("popup-active");
          }, 1000);
        } else {
          alert("🔒 IP Anda belum didaftarkan untuk kode ini, Silahkan Request IP Terlebih dahulu.");
          requestIPContainer.style.display = canRequestIP() ? "block" : "none";
          requestIPBtn.disabled = !canRequestIP();
          purchaseLink.style.display = "none";
        }
      } else {
        alert("❌ Kode akses tidak terdaftar.");
        purchaseLink.style.display = "inline-block";
        requestIPContainer.style.display = "none";
      }

      closeBtn.disabled = false;
    }, 2000);
  });

  requestIPBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const kode = accessCodeInput.value.trim().toUpperCase();

    if (!canRequestIP()) {
      const lastTime = parseInt(localStorage.getItem("lastRequestIPTime"));
      const nextTime = new Date(lastTime + REQUEST_IP_COOLDOWN).toLocaleString();
      alert(`⏳ Anda sudah mengirim request IP. Coba lagi setelah: ${nextTime}`);
      return;
    }

    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const ip = data.ip;

      await sendRequestIPToTelegram(ip, kode);
      alert("✅ Permintaan IP Anda telah dikirim, Mohon ditunggu!.");
      requestIPBtn.disabled = true;
      requestIPContainer.style.display = "none";
    } catch (err) {
      alert("❌ Gagal mengirim permintaan IP.");
    }
  });
});


    function toggleSidebar() {
      document.getElementById("sidebar").classList.toggle("active");
    }

    function toggleSubmenu(el) {
      el.parentElement.classList.toggle("open");
    }

    function toggleTheme() {
      document.body.classList.toggle("light");
    }

    function loadContent(page) {
      const main = document.getElementById("main-content");
      let content = '';

      if (page === 'dashboard') {
  content = `<section style="padding: 2rem;"><h2 style="font-size: 2rem; color: var(--text-color);">Dashboard</h2>
  <section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);"></h2>
    <div class="info-boxes">
      <div class="info-box">
        <h4><i class="fas fa-puzzle-piece"></i> Total Fitur</h4>
        <p id="totalFitur">--</p>
      </div>
 <div class="info-box">
  <h4><i class="fas fa-users"></i> Total User</h4>
  <p id="totalUser"></p>
</div>
      <div class="info-box">
        <h4><i class="fas fa-sync-alt"></i> Last Update</h4>
        <p id="lastUpdate">--</p>
      </div>
      <div class="info-box">
        <h4><i class="fas fa-clock"></i> Last Visit</h4>
        <p id="lastVisit">--</p>
      </div>
    </div>
    <h3><i class="fas fa-bullhorn"></i> Pengumuman</h3>
<table class="announcement-table">
  <thead>
    <tr>
      <th><i class="fas fa-calendar-alt"></i> Tanggal</th>
      <th><i class="fas fa-info-circle"></i> Deskripsi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="Tanggal">25-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <i class="fas fa-book"></i> Prompt Gemini VEO3 <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">25-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <i class="fas fa-book"></i> Prompt ChatGPT <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">25-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>Gemini VEO3</b> pada Menu <i class="fas fa-book"></i> Tips <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">25-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>Ucapan Generator</b> pada Menu <i class="fas fa-gift"></i> Ucapan Generator <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">25-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>Short URL Generator</b> pada Menu <i class="fas fa-tools"></i> Tools <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">25-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>Room Bot Alltier</b> pada Menu <i class="fas fa-gamepad"></i> Special MLBB <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">25-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>Room Wangi</b> pada Menu <i class="fas fa-gamepad"></i> Special MLBB <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">25-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>Bug Room Wangi</b> pada Menu <i class="fas fa-gamepad"></i> Special MLBB <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">24-06-2025</td>
      <td data-label="Deskripsi">Penambahan Menu <i class="fas fa-gift"></i> DANA KAGET Akan aktif setiap seminggu sekali. <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">24-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>Jualan Dalam 3 Menit</b> pada Menu <i class="fas fa-book"></i> Edukasi <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">24-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>Membangun Personal Branding</b> pada Menu <i class="fas fa-book"></i> Edukasi <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">24-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>6 Bulan Jadi Konten Kreator</b> pada Menu <i class="fas fa-book"></i> Edukasi <span class="badge new">NEW</span></td>
    </tr>
    <tr>
      <td data-label="Tanggal">24-06-2025</td>
      <td data-label="Deskripsi">Penambahan Fitur <b>3 Bulan Jadi Affiliator</b> pada Menu <i class="fas fa-book"></i> Edukasi <span class="badge new">NEW</span></td>
    </tr>
  </tbody>
</table>

  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");

  // Fungsi-fungsi untuk last visit dan last update

 // Set jumlah user awal dan waktu mulai (misalnya 1 Januari 2024)
  const baseUser = 1000;
  const startTime = new Date('2025-06-26T00:00:00');

  function updateUserCount() {
    const now = new Date();
    const diffMs = now - startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const currentUser = baseUser + diffHours;

    document.getElementById('totalUser').textContent = currentUser.toLocaleString('id-ID');
  }

  // Update saat halaman dimuat
  updateUserCount();

  // Cek dan update setiap 1 menit (opsional, agar lebih dinamis)
  setInterval(updateUserCount, 60000);


  function updateLastVisit() {
    const now = new Date();
    const waktu = now.toLocaleString("id-ID", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const el = document.getElementById("lastVisit");
    if (el) el.textContent = waktu;
  }

  function updateLastUpdate() {
    const now = new Date();
    const updateTime = new Date(now);
    updateTime.setHours(15, 0, 0, 0);

    // Jika sekarang sebelum jam 15.00, ambil hari sebelumnya
    if (now < updateTime) {
      updateTime.setDate(updateTime.getDate() - 1);
    }

    const formatted = updateTime.toLocaleDateString("id-ID", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const el = document.getElementById("lastUpdate");
    if (el) el.textContent = `${formatted} 15:00 WIB`;
  }

  // Tunggu DOM elemen muncul dulu
  setTimeout(() => {
    const sidebar = document.querySelectorAll('#sidebar nav ul li');
    let totalFitur = 0;
    sidebar.forEach(li => {
      const submenu = li.querySelector('ul');
      if (submenu) {
        totalFitur += submenu.querySelectorAll('li').length;
      } else {
        totalFitur++;
      }
    });
    document.getElementById("totalFitur").textContent = totalFitur;

    // Jalankan fungsi ini setelah elemen sudah dimuat
    updateLastVisit();
    updateLastUpdate();
  }, 10); // Delay kecil untuk memastikan elemen ter-render
}


      if (page === 'submenu1') {
        content = `
          <section style="padding: 2rem;">
            <section class="calculator">
              <center><h3>Penghitung Winrate Mobile Legends</h3>
              <input type="number" id="matches" placeholder="Pertandingan Saat Ini">
              <input type="number" id="currentWR" placeholder="Winrate Saat Ini (%)">
              <input type="number" id="desiredWR" placeholder="Winrate yang Diinginkan (%)">
              <button onclick="calculateWinrate()">Hitung</button></center>
              <p id="result"></p>
            </section>
          </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
      }
	
	if (page === 'submenu2') {
  content = `
    <section style="padding: 2rem;">
      <h2 style="font-size: 2rem; color: var(--text-color);">BMI Calculator</h2>
      <section class="bmi-calculator">
        <h3><i class="fas fa-weight"></i> Hitung BMI Anda</h3>
        <select id="gender">
          <option value="">Pilih Jenis Kelamin</option>
          <option value="male">♂ Laki-laki</option>
          <option value="female">♀ Perempuan</option>
        </select>
        <input type="number" id="height" placeholder="Tinggi Badan (cm)">
        <input type="number" id="weight" placeholder="Berat Badan (kg)">
        <button onclick="calculateBMI()">Hitung</button>
        <p id="bmiResult"></p>
      </section>
    </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
      }

	if (page === 'submenu3') {
  content = `
  <section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">HPP Calculator (Detail Bahan Baku)</h2>
    <section class="hpp-calculator">
      <h3><i class="fas fa-calculator"></i> Input Bahan Baku</h3>
      <input type="text" id="namaBahan" placeholder="Nama Bahan Baku">
<input type="text" id="jenisBahan" placeholder="Jenis">
<input type="number" id="qtyBahan" placeholder="Jumlah">
<select id="satuanBahan">
  <option value="kg">kg</option>
  <option value="gram">gram</option>
  <option value="liter">liter</option>
  <option value="ml">ml</option>
  <option value="pcs">pcs</option>
  <option value="unit">unit</option>
</select>
<input type="number" id="hargaBahan" placeholder="Harga per Satuan">
<button onclick="tambahBahanBaku()">Tambah</button>


      <table class="announcement-table" style="margin-top:1rem;">
        <thead>
  <tr>
    <th>Nama</th>
    <th>Jenis</th>
    <th>Qty</th>
    <th>Harga per Satuan</th>
    <th>Aksi</th>
  </tr>
</thead>


        <tbody id="tabelBahanBakuBody"></tbody>
        </tbody>
      </table>

      <input type="number" id="jumlahProduk" placeholder="Jumlah Produk yang dihasilkan">
<input type="number" id="marginPersen" placeholder="Margin (%) default 40%">
<input type="number" id="persenPajak" placeholder="Persentase Pajak (%) (Opsional)">
<button onclick="hitungHPP()">Hitung HPP & Keuntungan</button>
<div id="hppResult" style="margin-top: 1rem;"></div>

    </section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'appspremium') {
  content = ` 
    <section style="padding: 2rem;">
      <h3>📦 100+ Aplikasi Streaming, AI, & Musik Premium</h3>
      <table class="announcement-table">
        <thead>
          <tr><th>Last Updated</th><th>Deskripsi</th><th>Link</th></tr>
        </thead>
        <tbody>
          ${[
            ["23-06-2025", "Capcut Premium v10.2.0", "capcut"],
            ["23-06-2025", "YouTube Premium v18.21.37", "youtube"],
            ["23-06-2025", "Spotify Premium v8.8.50.466", "spotify"],
            ["23-06-2025", "Netflix Mod v8.90.0", "netflix"],
            ["23-06-2025", "ChatGPT Pro v1.2025.06", "chatgpt"],
            ["23-06-2025", "Disney+ Hotstar v23.05.0", "hotstar"],
            ["23-06-2025", "Canva Pro v2.216.0", "canva"],
            ["23-06-2025", "AI Blackbox v5.3.0", "blackbox"],
            ["23-06-2025", "AI Claude v2.1.4", "claude-ai"],
            ["23-06-2025", "AI Jarvis v4.0.1", "jarvis-ai"],
            ["23-06-2025", "Zoom Premium v6.0.3", "zoom-cloud-meetings"],
            ["23-06-2025", "Loklok Mod v1.11.0", "loklok"],
            ["23-06-2025", "WeTV Premium v5.9.5", "wetv"],
            ["23-06-2025", "HBO Max v56.10.0", "hbo-max"],
            ["23-06-2025", "AI Freepik Premium v1.3.9", "freepik"],
            ["23-06-2025", "AI Consensus v2.4.8", "consensus"],
            ["23-06-2025", "AI IAsk v3.2.1", "iask"],
            ["23-06-2025", "TeraBox Premium v3.16.2", "terabox"],
            ["23-06-2025", "IQIYI VIP v4.10.6", "iqiyi"],
            ["23-06-2025", "MovieBox v9.3.2", "moviebox"],
            ["23-06-2025", "Dramabox Mod v1.6.0", "dramabox"],
            ["23-06-2025", "Shortmax v1.9.1", "shortmax"],
            ["23-06-2025", "TradingView Pro v2.73.1", "tradingview"],
            ["23-06-2025", "Alight Motion Pro v5.1.0", "alight-motion"],
            ["23-06-2025", "Apple Music Mod v4.2.0", "apple-music"],
            ["23-06-2025", "Brainly Plus v5.130.0", "brainly"],
            ["23-06-2025", "BStation (Bilibili) v3.20.2", "bilibili"],
            ["23-06-2025", "Drakor.id+ v7.4.2", "drakor-id"],
            ["23-06-2025", "Fizzo Novel v3.0.0", "fizzo-novel"],
            ["23-06-2025", "Scribd Premium v11.6.2", "scribd"],
            ["23-06-2025", "Youku VIP v10.3.0", "youku"],
            ["23-06-2025", "MX Player Pro v1.70.2", "mx-player-pro"],
            ["23-06-2025", "Reface Pro v3.42.1", "reface"],
            ["23-06-2025", "PicsArt Premium v24.4.3", "picsart"],
            ["23-06-2025", "InShot Pro v1.962.1411", "inshot"],
            ["23-06-2025", "Photoleap Pro v1.3.5", "photoleap"],
            ["23-06-2025", "Remini Premium v3.7.358", "remini"],
            ["23-06-2025", "Snapseed Pro v2.20.0.526438279", "snapseed"],
            ["23-06-2025", "VivaVideo Pro v9.10.0", "vivavideo"],
            ["23-06-2025", "Truecaller Pro v19.9.9", "truecaller"],
            ["23-06-2025", "KineMaster Pro v7.2.4", "kinemaster"]
          ].map(item => `
          <tr>
            <td>${item[0]}</td>
	<td>${item[1]}</td> 
            <td>
              <a href="https://apkdone.com/${item[2]}/" class="download-btn" target="_blank">
                  <i class="fas fa-download"></i> Download
                </a>
		<button class="report-btn" onclick="laporkanKeTelegram('${item[1]}', '${item[2]}', 'slug')">⚠️ Laporkan</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'appsoriginal') {
  content = `<section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">Dashboard</h2>
    <section style="padding: 2rem;">
      <h3>🎮 100 Game Teratas Play Store (Gratis & Premium)</h3>
      <table class="announcement-table">
        <thead>
          <tr>
            <th>Last Updated</th>
            <th>Deskripsi</th>
            <th>Link Download</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ["26-05-2025", "Call of Duty: Mobile v1.0.51", "https://apkpure.com/call-of-duty-mobile/com.activision.callofduty.shooter"],
            ["26-05-2025", "Call of Duty: Mobile – Garena v1.6.51", "https://apkpure.com/call-of-duty-mobile-garena/com.garena.game.codm"],
            ["23-06-2025", "PUBG Mobile v2.9.0", "https://apkpure.com/pubg-mobile/com.tencent.ig"],
            ["17-06-2025", "Minecraft v1.21.81 ⭐ Premium", "https://apkpure.com/minecraft/com.mojang.minecraftpe"],
            ["15-06-2025", "Genshin Impact v4.7.0", "https://apkpure.com/genshin-impact/com.miHoYo.GenshinImpact"],
            ["20-05-2025", "Free Fire v1.104.1", "https://apkpure.com/free-fire/com.dts.freefireth"],
            ["10-04-2025", "Mobile Legends: Bang Bang v1.8.72.955.1", "https://apkpure.com/mobile-legends/com.mobile.legends"],
            ["05-06-2025", "Roblox v2.627.599", "https://apkpure.com/roblox/com.roblox.client"],
            ["01-03-2025", "Subway Surfers v3.31.0", "https://apkpure.com/subway-surfers/com.kiloo.subwaysurf"],
            ["02-04-2025", "Candy Crush Saga v1.270.0.2", "https://apkpure.com/candy-crush-saga/com.king.candycrushsaga"],
            ["30-05-2025", "Clash of Clans v15.547.4", "https://apkpure.com/clash-of-clans/com.supercell.clashofclans"],
            ["30-05-2025", "Clash Royale v3.3186.6", "https://apkpure.com/clash-royale/com.supercell.clashroyale"],
            ["15-05-2025", "Among Us v2024.6.12", "https://apkpure.com/among-us/com.innersloth.spacemafia"],
            ["28-05-2025", "Brawl Stars v57.255", "https://apkpure.com/brawl-stars/com.supercell.brawlstars"],
            ["21-05-2025", "Geometry Dash v2.211 ⭐ Premium", "https://apkpure.com/geometry-jump/com.robtopx.geometryjump"],
            ["12-05-2025", "Terraria v1.4.4.9 ⭐ Premium", "https://apkpure.com/terraria/com.and.games505.TerrariaPaid"],
            ["14-05-2025", "Stardew Valley v1.5.6.52 ⭐ Premium", "https://apkpure.com/stardew-valley/com.chucklefish.stardewvalley"],
            ["25-05-2025", "The Room v1.10 ⭐ Premium", "https://apkpure.com/the-room/com.fireproofstudios.theroom"],
            ["27-05-2025", "Plague Inc. v1.19.10 ⭐ Premium", "https://apkpure.com/plague-inc/com.miniclip.plagueinc"],
            ["18-05-2025", "Mini Metro v2.52.0 ⭐ Premium", "https://apkpure.com/mini-metro/nz.co.codepoint.minimetro"],
            ["26-05-2025", "Dead Cells v3.3.2 ⭐ Premium", "https://apkpure.com/dead-cells/com.playdigious.deadcells.mobile"],
            ["23-05-2025", "Slay the Spire v2.2.8 ⭐ Premium", "https://apkpure.com/slay-the-spire/com.humble.SlayTheSpire"],
            ["29-05-2025", "Shadow Fight 4 v1.7.4", "https://apkpure.com/shadow-fight-4/com.nekki.shadowfightarena"],
            ["22-05-2025", "Angry Birds 2 v3.19.2", "https://apkpure.com/angry-birds-2/com.rovio.baba"],
            ["16-05-2025", "Kingdom Rush Origins v5.8.08 ⭐ Premium", "https://apkpure.com/kingdom-rush-origins/com.ironhidegames.android.kingdomrushorigins"],
            ["13-05-2025", "Rebel Inc. v1.13.2 ⭐ Premium", "https://apkpure.com/rebel-inc/com.ndemiccreations.rebelinc"],
            ["19-05-2025", "Into the Dead 2 v1.68.0", "https://apkpure.com/into-the-dead-2/com.pikpok.dr2.play"],
            ["24-05-2025", "Plants vs Zombies 2 v10.8.1", "https://apkpure.com/plants-vs-zombies-2/com.ea.game.pvz2_na"],
            ["23-05-2025", "My Talking Tom v7.7.0.4073", "https://apkpure.com/my-talking-tom/com.outfit7.mytalkingtomfree"],
            ["21-05-2025", "Hay Day v1.59.188", "https://apkpure.com/hay-day/com.supercell.hayday"],
            ["20-05-2025", "FarmVille 3 v1.48.36042", "https://apkpure.com/farmville-3/com.zynga.farmville3"],
            ["19-05-2025", "The Sims Mobile v40.0.0.139564", "https://apkpure.com/the-sims-mobile/com.ea.gp.simsmobile"],
            ["15-05-2025", "SimCity BuildIt v1.51.1.119508", "https://apkpure.com/simcity-buildit/com.ea.game.simcitymobile_row"],
            ["10-05-2025", "8 Ball Pool v5.15.0", "https://apkpure.com/8-ball-pool/com.miniclip.eightballpool"],
            ["09-05-2025", "Real Racing 3 v12.0.2", "https://apkpure.com/real-racing-3/com.ea.games.r3_row"],
            ["08-05-2025", "Subway Princess Runner v1.5.5", "https://apkpure.com/subway-princess-runner/com.yodo1games.subwayprincess"],
            ["07-05-2025", "CarX Drift Racing 2 v1.46", "https://apkpure.com/carx-drift-racing-2/com.carxtech.carxdr2"],
            ["06-05-2025", "Asphalt 9: Legends v3.7.1", "https://apkpure.com/asphalt-9-legends/com.gameloft.android.ANMP.GloftA9HM"],
            ["05-05-2025", "Terraria v1.4.4.9 ⭐ Premium", "https://apkpure.com/terraria/com.and.games505.TerrariaPaid"],
            ["04-05-2025", "Mario Kart Tour v3.6.0", "https://apkpure.com/mario-kart-tour/com.nintendo.zaka"],
            ["03-05-2025", "Among Us v2024.6.12", "https://apkpure.com/among-us/com.innersloth.spacemafia"],
            ["02-05-2025", "Brawl Stars v57.255", "https://apkpure.com/brawl-stars/com.supercell.brawlstars"],
            ["01-05-2025", "Fortnite v18.30.0", "https://apkpure.com/fortnite/com.epicgames.fortnite"],
            ["30-04-2025", "Plants vs Zombies Garden Warfare v1.0.1", "https://apkpure.com/plants-vs-zombies-garden-warfare/com.popcap.pvzgw"],
            ["29-04-2025", "SimCity BuildIt v1.51.1.119508", "https://apkpure.com/simcity-buildit/com.ea.game.simcitymobile_row"],
            ["28-04-2025", "Pokemon Go v1.223.1", "https://apkpure.com/pokemon-go/com.nianticlabs.pokemongo"],
            ["27-04-2025", "Clash of Kings v8.2.8", "https://apkpure.com/clash-of-kings/com.gamelord.cok.gp"],
            ["26-04-2025", "Lords Mobile v1.88", "https://apkpure.com/lords-mobile/com.igg.android"],
            ["25-04-2025", "Dragon Ball Legends v5.12.0", "https://apkpure.com/dragon-ball-legends/com.bandainamcoent.dblegends_ww"],
            ["24-04-2025", "Summoners War v6.5.6", "https://apkpure.com/summoners-war/com.com2us.smon.normal.freefull.google.kr.android.common"],
            ["23-04-2025", "Lineage 2 Revolution v2.0.114", "https://apkpure.com/lineage-2-revolution/com.netmarble.lin2"],
            ["22-04-2025", "Dragon Raja v1.5.152", "https://apkpure.com/dragon-raja/com.zloong.eu.dragonraja"],
            ["21-04-2025", "Rules of Survival v1.332028.332245", "https://apkpure.com/rules-of-survival/com.netease.lztgglobal"],
            ["20-04-2025", "Shadowgun Legends v1.11.0", "https://apkpure.com/shadowgun-legends/com.madfingergames.legends"],
            ["19-04-2025", "Among Trees v1.2 ⭐ Premium", "https://apkpure.com/among-trees/com.fjolnirsoft.amongtrees"],
            ["18-04-2025", "Dead by Daylight Mobile v1.0.16", "https://apkpure.com/dead-by-daylight-mobile/com.bhvr.deadbydaylight"],
            ["17-04-2025", "The Witcher: Monster Slayer v1.0.3", "https://apkpure.com/the-witcher-monster-slayer/com.spokko.witcher"],
            ["16-04-2025", "Terraria v1.4.3 ⭐ Premium", "https://apkpure.com/terraria/com.and.games505.TerrariaPaid"],
            ["15-04-2025", "Among Us v2024.5.18", "https://apkpure.com/among-us/com.innersloth.spacemafia"],
            ["14-04-2025", "Candy Crush Soda Saga v1.185.4", "https://apkpure.com/candy-crush-soda-saga/com.king.candycrushsodasaga"],
            ["13-04-2025", "Gardenscapes v5.9.2", "https://apkpure.com/gardenscapes/com.playrix.gardenscapes"],
            ["12-04-2025", "Toon Blast v5946", "https://apkpure.com/toon-blast/com.peakgames.toonblast"],
            ["11-04-2025", "Homescapes v5.9.2", "https://apkpure.com/homescapes/com.playrix.homescapes"],
            ["10-04-2025", "AFK Arena v1.70.14", "https://apkpure.com/afk-arena/com.lilithgame.hgame.gp"],
            ["09-04-2025", "Rise of Kingdoms v1.0.97.35", "https://apkpure.com/rise-of-kingdoms-combat-heroes/com.lilithgames.roc.gp"],
            ["08-04-2025", "Clash of Kings v8.2.7", "https://apkpure.com/clash-of-kings/com.gamelord.cok.gp"],
            ["07-04-2025", "State of Survival v1.16.23", "https://apkpure.com/state-of-survival-zombie-war/com.kingsgroup.sos"],
            ["06-04-2025", "Call of Duty: Mobile v1.0.48", "https://apkpure.com/call-of-duty-mobile/com.activision.callofduty.shooter"],
            ["05-04-2025", "Marvel Contest of Champions v28.1.1", "https://apkpure.com/marvel-contest-of-champions/com.kabam.marvelbattle"],
            ["04-04-2025", "Roblox v2.624.673", "https://apkpure.com/roblox/com.roblox.client"],
            ["03-04-2025", "GTA San Andreas v2.00 ⭐ Premium", "https://apkpure.com/grand-theft-auto-san-andreas/com.rockstargames.gtasa"],
            ["02-04-2025", "Pokémon UNITE v2.0.0", "https://apkpure.com/pokemon-unite/com.pokemon.unite"],
            ["01-04-2025", "Subway Surfers v3.30.2", "https://apkpure.com/subway-surfers/com.kiloo.subwaysurf"]
          ].map(item => `
          <tr>
    <td>${item[0]}</td>
    <td>${item[1]}</td>
            <td><a href="${item[2]}" class="download-btn" target="_blank">
              <i class="fas fa-download"></i> Download
                </a>
		<button class="report-btn" onclick="laporkanKeTelegram('${item[1]}', '${item[2]}', 'link')">⚠️ Laporkan</button>
          </tr>`).join("")}

        </tbody>
      </table>
    </section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}


if (page === 'promosiapk') {
  content = `<section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">📢 Dashboard Promosi</h2>
    <section style="padding: 2rem; overflow-x: auto;">
      <h3>📱 50+ Teks Promosi Aplikasi Premium</h3>
      <table class="announcement-table" style="min-width: 1000px;">
        <thead>
          <tr>
            <th>No</th>
            <th>Jenis Promosi</th>
            <th>Deskripsi</th>
            <th>Salin</th>
          </tr>
        </thead>
        <tbody>
          ${[
             ["📱 CapCut Pro", "🎬 Capek dengan watermark yang ganggu hasil editanmu?\n✨ CapCut Pro hadir dengan fitur transisi sinematik, efek premium, dan export 1080p!\n🔥 Bikin konten viral jadi makin gampang!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Lightroom Premium", "📷 Hasil fotomu gelap, pucat, dan kurang menarik?\n🎨 Lightroom Premium hadir dengan preset profesional untuk editing cepat!\n💫 Bikin feed kamu sekelas selebgram!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 VN Pro", "📉 Transisi video kamu terasa patah dan kurang halus?\n🛠️ VN Pro hadir dengan timeline profesional dan export 4K!\n🚀 Editing jadi ringan, hasil memukau!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Canva Premium", "🎨 Bingung bikin desain estetik tanpa skill desain?\n📚 Canva Premium hadir dengan ribuan template & elemen grafis premium!\n🌟 Cocok untuk konten kreator, UMKM, hingga pelajar!\n💸 Harga: Rp30.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Alight Motion Pro", "🎞️ Animasi kamu patah dan efek terbatas?\n🌀 Alight Motion Pro tanpa watermark dan fitur full animasi keyframe!\n💡 Tunjukkan kreativitasmu seperti animator profesional!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Spotify Premium", "🔇 Musik berhenti karena iklan? Gak bisa putar offline?\n🎵 Spotify Premium hadir tanpa iklan, bebas skip, dan bisa download lagu!\n🎧 Dengarkan musik tanpa gangguan kapan saja!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 InShot Pro", "✂️ Video kamu masih pakai watermark dan efeknya terbatas?\n⚙️ InShot Pro hadir dengan semua fitur efek, transisi, dan filter premium!\n🎥 Cocok untuk konten harian, reels, atau vlog!\n💸 Harga: Rp18.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Kinemaster Diamond", "📼 Masih pake Kinemaster gratisan yang ada watermark?\n🔓 Dengan versi Diamond, kamu dapat akses tanpa batas + fitur premium!\n🌠 Buat video profesional dari HP kamu!\n💸 Harga: Rp22.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 PicsArt Gold", "🖼️ Bosan dengan editor foto biasa?\n✨ PicsArt Gold hadir dengan efek, stiker, dan alat edit tanpa batas!\n🌈 Ubah foto jadi karya seni dalam sekejap!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Adobe Express Premium", "🧾 Bikin poster promosi tapi hasilnya kurang meyakinkan?\n📐 Adobe Express Premium bantu kamu desain profesional dengan cepat!\n💼 Cocok untuk pebisnis dan pekerja kreatif!\n💸 Harga: Rp35.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 FilmoraGo Pro", "🎥 Mau hasil video seperti YouTuber tapi nggak punya laptop?\n📹 FilmoraGo Pro punya efek cinematic, audio mixer, dan tanpa watermark!\n🚀 Editing langsung dari HP, anti ribet!\n💸 Harga: Rp28.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Remini Premium", "🖼️ Foto lama kamu buram dan pecah?\n✨ Remini Premium menggunakan teknologi AI untuk menjernihkan foto dengan instan!\n📸 Bikin kenangan lama jadi hidup kembali!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 StoryArt Premium", "📲 Story IG kamu terlihat biasa dan nggak menonjol?\n🖌️ StoryArt Premium punya template yang kekinian dan aesthetic!\n🎉 Tampil beda dan lebih profesional di setiap story!\n💸 Harga: Rp15.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Mojo Pro", "📺 Story kamu datar dan nggak gerak?\n🎞️ Mojo Pro hadir dengan animasi dinamis dan text movement keren!\n📈 Boost engagement IG-mu dalam sekejap!\n💸 Harga: Rp18.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Motionleap Pro", "🌁 Foto pemandangan kamu statis dan kurang hidup?\n💫 Motionleap Pro bisa bikin langit bergerak, air mengalir, awan melayang!\n🎇 Foto kamu jadi bercerita lebih banyak!\n💸 Harga: Rp22.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Prequel Premium", "📽️ Filter videomu itu-itu aja?\n🧚‍♀️ Prequel Premium punya efek dreamy, vintage, dan aesthetic kekinian!\n🎀 Jadiin videomu lebih artistik dan viral-ready!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Facetune 2 Pro", "🤳 Selfie kurang glowing dan penuh noda?\n💆‍♀️ Facetune 2 Pro bantu kamu tampil flawless tanpa terlihat editan!\n📸 Percaya diri upload foto kapan pun!\n💸 Harga: Rp23.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 YouTube Premium", "📢 Lagi nonton tiba-tiba iklan? Ngeselin?\n📴 YouTube Premium hadir tanpa iklan, bisa play di background & download video!\n🍿 Nonton jadi lebih nyaman & fokus!\n💸 Harga: Rp29.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Truecaller Premium", "📞 Capek di-spam nomor nggak dikenal?\n🚫 Truecaller Premium otomatis mendeteksi & blokir nomor spam!\n🔒 Privasi kamu lebih aman dan tenang!\n💸 Harga: Rp18.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Telegram Premium", "📤 Kirim file besar sering gagal?\n📁 Telegram Premium support upload sampai 4GB, animasi unik, dan no iklan!\n💬 Chat makin cepat dan maksimal!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 TikTok Mod Pro", "📹 Mau simpan video TikTok tanpa watermark?\n🧼 TikTok Mod Pro bantu kamu download bersih dan cepat!\n🧡 Simpan video viral tanpa batas!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Netflix Mod Premium", "🍿 Film favorit terkunci karena biaya langganan mahal?\n🎬 Netflix Mod Premium hadir gratis dan tanpa batas!\n🌃 Temani waktu santai kamu kapan saja!\n💸 Harga: Rp0 (khusus offline APK)\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Google One 100GB", "💾 Penyimpanan Google Drive kamu penuh terus?\n🔓 Upgrade ke Google One 100GB untuk data lebih aman dan lega!\n📥 Cocok untuk pelajar & pebisnis!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 WPS Office Premium", "📑 Sering kerja dokumen tapi terganggu iklan?\n📊 WPS Premium hadir tanpa iklan, bisa scan PDF, tanda tangan digital, dll!\n📌 Nyaman untuk pelajar dan karyawan!\n💸 Harga: Rp18.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 ZArchiver Pro", "📂 Susah buka file .zip, .rar, dan file terenkripsi?\n🧰 ZArchiver Pro bisa semua format dan no iklan!\n🪄 Proses cepat, tanpa ribet!\n💸 Harga: Rp12.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Nova Launcher Prime", "📱 Bosan tampilan Android gitu-gitu aja?\n🌠 Nova Launcher Prime bikin HP kamu jadi aesthetic dan smooth!\n✨ Bebas kustomisasi penuh!\n💸 Harga: Rp15.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 KWGT Pro", "🎛️ Widget bawaan HP terlalu standar?\n🌈 KWGT Pro hadir dengan ribuan widget custom keren!\n📱 Bikin tampilan layar jadi beda dan stylish!\n💸 Harga: Rp10.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 iFont Premium", "🔤 Mau font lucu, elegan, atau kaligrafi untuk Androidmu?\n🖋️ iFont Premium punya ribuan koleksi tanpa root!\n📖 Bikin ngetik jadi lebih menyenangkan!\n💸 Harga: Rp13.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 PowerDirector Premium", "📼 Edit video sering lag dan terbatas efek?\n🖥️ PowerDirector Premium hadir dengan fitur profesional & render cepat!\n🎬 Cocok untuk vlog & review!\n💸 Harga: Rp22.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Lensa AI Premium", "🤖 Mau potret AI keren untuk profil kamu?\n🎭 Lensa AI Premium buat foto wajahmu jadi seperti ilustrasi futuristik!\n🖼️ Keren untuk branding & konten!\n💸 Harga: Rp25.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Linktree Pro", "🔗 Link di bio Instagram terbatas?\n🧾 Linktree Pro bisa gabungkan semua link penting kamu di satu halaman!\n🌐 Cocok untuk pebisnis dan kreator!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 CapCut Template Premium", "🧩 Template CapCut kamu terkunci?\n🎞️ Versi premium buka semua template viral dan efek transisi!\n🚀 Bikin video trending makin cepat!\n💸 Harga: Rp18.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Fotor Premium", "🖼️ Foto kamu buram dan detail kurang tajam?\n🧠 Fotor Premium hadir dengan AI-enhance & retouching canggih!\n🎯 Hasil editan jadi lebih profesional!\n💸 Harga: Rp23.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Kawaii Photo Editor Pro", "🍬 Suka gaya imut dan pastel?\n🎀 Kawaii Photo Editor punya stiker, frame lucu, dan filter manis!\n💖 Bikin foto kamu super gemesin!\n💸 Harga: Rp15.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Meitu Premium", "📸 Selfie kamu masih kurang glowing?\n💅 Meitu Premium punya fitur beautify otomatis dan makeup AI!\n👑 Tampil glowing tanpa effort!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 VSCO Premium", "📷 Filter VSCO standar kurang aesthetic?\n🧩 Upgrade ke Premium dan unlock semua preset klasik, film, dan grainy!\n🌙 Bikin feed kamu lebih clean dan classy!\n💸 Harga: Rp30.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Snapseed Pro", "🧪 Butuh kontrol lebih saat edit foto?\n🖍️ Snapseed Pro punya fitur kurva warna, selective, dan brush detail!\n🎨 Cocok untuk editor serius!\n💸 Harga: Rp20.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Pixellab Premium", "🔤 Suka bikin quote dan desain teks?\n🖌️ Pixellab Premium hadir dengan font, shape, dan efek tanpa batas!\n💥 Kuat untuk desain cepat!\n💸 Harga: Rp17.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 AZ Screen Recorder Pro", "🎞️ Mau rekam layar tanpa watermark?\n🎥 AZ Pro hadir tanpa batas waktu, tanpa iklan, dan full fitur!\n📚 Cocok untuk tutorial, review, atau gameplay!\n💸 Harga: Rp20.000\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 Notion Pro", "📒 Catatanmu berantakan dan tidak sinkron?\n🧠 Notion Pro support workspace, kanban, link database, dan block tak terbatas!\n🧩 Bikin hidup dan kerja lebih rapi!\n💸 Harga: Rp30.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 MindMaster Premium", "🗺️ Susah bikin mindmap dan struktur ide?\n🧭 MindMaster Premium bantu kamu bikin peta konsep profesional dengan mudah!\n🧠 Visualisasi ide jadi lebih jelas!\n💸 Harga: Rp22.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🤖 ChatGPT Pro", "🧠 Butuh jawaban cepat, akurat, dan tanpa batas?\n💬 ChatGPT Pro hadir tanpa delay, bisa akses GPT-4, dan support coding, ide kreatif, & konten!\n🚀 Cocok untuk pelajar, kreator, dan profesional!\n💸 Harga: Rp49.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🎬 MovieBox Premium", "🎥 Film kesukaan kamu terkunci dan kualitasnya rendah?\n📺 MovieBox Premium hadir dengan ribuan film HD & subtitle lengkap!\n🍿 Nikmati nonton bebas iklan dan tanpa buffering!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📺 Loklok Premium", "⏳ Nonton drama & film ngebuffer terus?\n🌟 Loklok Premium punya tayangan update cepat dan kualitas HD!\n💖 Cocok untuk pecinta drama Asia & movie freak!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📱 iQIYI VIP", "🎞️ Film & drama favorit kamu terkunci VIP?\n🎫 iQIYI VIP hadir bebas iklan, kualitas Full HD, dan subtitle lengkap!\n📡 Streaming lancar tanpa hambatan!\n💸 Harga: Rp28.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🎥 ShortMax Premium", "⏱️ Suka nonton film pendek atau series eksklusif?\n📦 ShortMax Premium hadir tanpa iklan, tayangan eksklusif, dan full HD!\n🎯 Hiburan padat berkualitas!\n💸 Harga: Rp18.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📚 Scribd Premium", "📖 Buku & eBook favoritmu hanya bisa dibaca sebagian?\n📘 Scribd Premium buka semua akses buku, jurnal, dan audiobook!\n🧠 Baca tanpa batas, kapan pun kamu mau!\n💸 Harga: Rp27.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["☁️ Terabox Premium", "💾 Penyimpanan penuh terus?\n🚀 Terabox Premium hadir dengan 2TB cloud storage, bebas iklan, & backup otomatis!\n🔒 Data kamu aman dan mudah diakses kapan saja!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📊 TradingView Premium", "📈 Chart kamu selalu delay dan terbatas fitur?\n💹 TradingView Premium hadir dengan alert tak terbatas, layout ganda, dan data real-time!\n💡 Cocok untuk trader pemula & pro!\n💸 Harga: Rp30.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📺 Youku VIP", "🎬 Sering kelewatan update drama China?\n🎫 Youku VIP hadir tanpa iklan, full episode, dan subtitle resmi!\n💖 Temani waktu santaimu dengan tayangan berkualitas!\n💸 Harga: Rp22.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🎥 Zoom Premium", "⛔ Meeting dibatasi 40 menit?\n🎦 Zoom Premium hadir dengan durasi tanpa batas, fitur rekam cloud, dan room besar!\n👨‍🏫 Cocok untuk bisnis, kelas online, & presentasi!\n💸 Harga: Rp35.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📺 WeTV VIP", "📉 Episode terbaru drama kamu terkunci?\n🎫 WeTV VIP hadir tanpa iklan, episode cepat update, dan kualitas Full HD!\n📲 Streaming jadi lebih nyaman!\n💸 Harga: Rp23.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📽️ DramaBox Premium", "📦 Koleksi drama kamu terbatas dan penuh iklan?\n🧾 DramaBox Premium hadir dengan semua drama Asia lengkap dan tanpa gangguan!\n🎞️ Update cepat dan kualitas HD!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🤖 AI Blackbox", "⌨️ Bingung debug dan pahami kode?\n🧠 AI Blackbox bantu kamu memahami baris kode, auto-complete, dan refactor dengan AI!\n💻 Wajib bagi programmer modern!\n💸 Harga: Rp29.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🧠 AI Claude", "📚 Mau AI pintar untuk nulis panjang, dialog, atau artikel?\n✍️ Claude AI hadir dengan gaya bahasa natural dan bisa membaca dokumen besar!\n🚀 Alternatif keren selain ChatGPT!\n💸 Harga: Rp32.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📖 AI Consensus", "🔍 Susah cari referensi ilmiah akurat?\n📑 AI Consensus bantu kamu cari, rangkum, dan kutip paper ilmiah secara otomatis!\n🎓 Cocok untuk mahasiswa & dosen!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🎨 AI Freepik Generator", "🖼️ Stok gambar terbatas dan mahal?\n🌟 AI Freepik Generator bantu kamu buat gambar, vektor, dan mockup otomatis sesuai prompt!\n💼 Cocok untuk desainer & UMKM!\n💸 Harga: Rp28.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🗣️ AI iAsk", "❓ Mau tanya soal berat atau soal harian?\n💬 AI iAsk bantu jawab semua pertanyaan kamu dengan ringkas & akurat!\n📚 Teman belajar dan diskusi yang seru!\n💸 Harga: Rp19.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🤖 AI Jarvis", "🧰 Mau AI asisten pribadi yang bantu kerja harian?\n📂 AI Jarvis bisa nulis, balas email, atur jadwal, bahkan buat presentasi!\n⚡ Hidup lebih efisien, kerja lebih cepat!\n💸 Harga: Rp35.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🗺️ AI MyMap", "📌 Mau buat peta interaktif & lokasi bisnis dengan AI?\n🧭 MyMap bantu buat peta khusus, rute promosi, dan visual lokasi unik!\n📍 Cocok untuk wisata, UMKM, dan event!\n💸 Harga: Rp22.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🌍 AI MyWorld", "🌐 Mau dunia 3D atau virtual map personal?\n🪐 AI MyWorld bantu buat dunia digital dari konsep, AI map, & simulasi!\n🕹️ Cocok untuk game, dunia RP, atau edukasi!\n💸 Harga: Rp30.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🎬 Alight Motion", "🌀 Editing animasi HP kamu mentok fitur gratisan?\n🎞️ Alight Motion versi Pro hadir dengan efek lengkap, tanpa watermark, dan export HD!\n🎨 Cocok untuk konten kreator & animator!\n💸 Harga: Rp25.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🎵 Apple Music", "🔒 Lagu favorit kamu tidak bisa diputar offline?\n🎧 Apple Music hadir dengan jutaan lagu bebas iklan dan bisa offline!\n🎶 Cocok untuk pengguna iOS & Android!\n💸 Harga: Rp30.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📚 Brainly Plus", "📓 Jawaban Brainly sering terkunci?\n🧠 Brainly Plus hadir tanpa batas pencarian, tanpa iklan, dan support cepat!\n📈 Bantu kamu belajar lebih cepat dan mandiri!\n💸 Harga: Rp18.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📺 Bstation (Bilibili)", "🎌 Suka anime, game & budaya Jepang?\n📺 Bstation Premium hadir bebas iklan, episode update cepat, dan subtitle multi bahasa!\n💖 Hiburan khas Asia lebih lengkap!\n💸 Harga: Rp23.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["🎬 Disney+ Hotstar", "📉 Film Disney, Marvel, Pixar terkunci semua?\n🎫 Disney+ Hotstar hadir dengan akses penuh tanpa iklan dan kualitas tinggi!\n🍿 Streaming film keluarga & blockbuster dalam satu aplikasi!\n💸 Harga: Rp30.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📺 Drakor.ID Premium", "💔 Nonton drama Korea ngebuffer dan subtitle delay?\n🎞️ Drakor.ID Premium hadir tanpa iklan, subtitle update cepat, dan tayangan HD!\n📲 Cocok untuk pencinta K-drama sejati!\n💸 Harga: Rp20.000/bulan\n📲 Kontak: [KONTAK KAMU]"],
  ["📖 Fizzo Novel Premium", "📚 Bosan dengan cerita itu-itu saja?\n🧾 Fizzo Premium buka akses ke ratusan novel seru dan update tiap hari!\n📖 Cocok untuk penggemar cerita cinta, misteri, & horor!\n💸 Harga: Rp15.000/bulan\n📲 Kontak: [KONTAK KAMU]"]
          ].map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item[0]}</td>
              <td class="deskripsi" id="desc-${index}">${item[1].replace(/\n/g, '<br>')}</td>
              <td>
                <button class="copy-btn" onclick="copyText('desc-${index}')">
                  <i class="fas fa-copy"></i> Salin
                </button>
              </td>
                </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'promosigame') {
  content = `<section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">📢 Dashboard Promosi</h2>
    <section style="padding: 2rem; overflow-x: auto;">
      <h3>📱 30+ Teks Promosi Topup Game Online</h3>
      <table class="announcement-table" style="min-width: 1000px;">
        <thead>
          <tr>
            <th>No</th>
            <th>Jenis Promosi</th>
            <th>Deskripsi</th>
            <th>Salin</th>
          </tr>
        </thead>
        <tbody>
          ${[
  ["💎 TopUp Diamond MLBB", "❌ Sering kehabisan Diamond saat mabar?\n⚡ TopUp MLBB instan, aman, dan proses hanya hitungan detik!\n🔥 Auto full skin & upgrade power!\n💸 Harga: mulai Rp5.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🎮 TopUp UC PUBG", "🔫 Gak bisa beli skin karena UC kosong?\n🚀 TopUp UC PUBG dijamin cepat & terpercaya, langsung masuk ke akun kamu!\n🎯 Makin gaya di medan perang!\n💸 Harga: mulai Rp7.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🎴 TopUp Genshin Impact", "💠 Crystal kamu menipis saat gacha waifu?\n🌠 TopUp Genshin Impact cepat & legal, via UID!\n💖 Dapatkan karakter impianmu sekarang juga!\n💸 Harga: mulai Rp15.000\n📲 Kontak: [KONTAK KAMU]"],  
  ["🔥 TopUp Free Fire", "😩 Mau beli bundle tapi Diamond FF habis?\n⚡ TopUp FF langsung masuk akun, terpercaya & proses cepat!\n🎁 Waktunya tampil beda di setiap match!\n💸 Harga: mulai Rp4.500\n📲 Kontak: [KONTAK KAMU]"],  
  ["🧙‍♂️ TopUp Higgs Domino", "♠️ Chip sekarat dan room panas?\n💸 TopUp Higgs Domino aman, support ID & Login FB langsung masuk!\n🎉 Jackpot bukan mimpi lagi!\n💸 Harga: mulai Rp10.000\n📲 Kontak: [KONTAK KAMU]"], 
  ["🏍️ TopUp Garena Speed Drifters", "🏁 Mobil keren kamu tertahan karena kurang voucher?\n💳 TopUp Speed Drifters langsung ngebut tanpa delay!\n🚘 Bikin lawan ketinggalan asap!\n💸 Harga: mulai Rp6.000\n📲 Kontak: [KONTAK KAMU]"],  
  ["🧚 TopUp Honkai: Star Rail", "🌌 Gacha karakter bintang 5 gak kesampaian?\n🎮 TopUp cepat & resmi via UID langsung masuk!\n🌟 Waktunya tarik Light Cone terbaikmu!\n💸 Harga: mulai Rp12.000\n📲 Kontak: [KONTAK KAMU]"],  
  ["🏆 TopUp Valorant Points", "🎯 Incar skin keren tapi VP kamu pas-pasan?\n⚡ TopUp Valorant cepat, legal, & anti delay!\n🔫 Aim kamu makin sangar!\n💸 Harga: mulai Rp20.000\n📲 Kontak: [KONTAK KAMU]"],  
  ["📦 TopUp Steam Wallet", "🕹️ Gak bisa beli game promo karena saldo Steam habis?\n💳 TopUp Steam Wallet legal & cepat, langsung masuk!\n🎮 Beli game impian jadi lebih mudah!\n💸 Harga: mulai Rp25.000\n📲 Kontak: [KONTAK KAMU]"],  
  ["🃏 TopUp CODM (Call of Duty Mobile)", "🔫 Skin senjata kamu standar terus?\n💣 TopUp CODM instan & terpercaya, support ID langsung masuk!\n🪖 Siap tempur dengan style premium!\n💸 Harga: mulai Rp6.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🐉 TopUp Dragon Nest", "⚔️ Lawan boss tapi kehabisan CC?\n✨ TopUp Dragon Nest langsung masuk, aman & terpercaya!\n🎯 Boost gear, skill, dan karakter kamu sekarang!\n💸 Harga: mulai Rp10.000\n📲 Kontak: [KONTAK KAMU]"],
  ["👻 TopUp Identity V", "🔦 Mau beli skin Hunter tapi Echo habis?\n🎮 TopUp cepat via ID, langsung bisa gacha & beli item event!\n🎭 Waktunya tampil beda di arena horor!\n💸 Harga: mulai Rp13.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🏞️ TopUp LifeAfter", "🧟‍♂️ Butuh gold bar buat upgrade senjata?\n🚑 TopUp LifeAfter cepat, aman, & legal!\n🌆 Siapkan pertahanan dari serangan zombie!\n💸 Harga: mulai Rp11.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🪓 TopUp Ragnarok M", "🧙‍♀️ Gacha MVP Card gagal terus?\n🧾 TopUp langsung masuk ke akun Ragnarok kamu, proses 1-2 menit!\n⚔️ Jadi top player dengan power maksimal!\n💸 Harga: mulai Rp15.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🏹 TopUp Tower of Fantasy", "🌌 Gacha banner SSR tapi kehabisan Tanium?\n🚀 TopUp via UID cepat, aman, dan harga terjangkau!\n🎯 Siapkan tim untuk jadi penjelajah dunia Aesperia!\n💸 Harga: mulai Rp14.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🔫 TopUp Apex Legends Mobile", "🛡️ Mau beli skin legend tapi Syndicate Gold kurang?\n🎯 TopUp legal dan cepat langsung masuk akun!\n🔥 Tampil beda di setiap match!\n💸 Harga: mulai Rp20.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🚀 TopUp War Robots", "🤖 Robot kamu terlalu lemah untuk PvP?\n🔋 TopUp Ag/Gold cepat masuk akun!\n💥 Dominasi medan perang dengan robot kelas berat!\n💸 Harga: mulai Rp17.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🦸 TopUp Marvel Super War", "💥 Mau unlock hero premium tapi coin habis?\n⚡ TopUp langsung masuk via UID!\n🛡️ Jadilah superhero dengan build terbaik!\n💸 Harga: mulai Rp12.000\n📲 Kontak: [KONTAK KAMU]"],
  ["⚽ TopUp eFootball (PES)", "🏆 Gacha pemain legend gagal terus?\n🎮 TopUp koin eFootball resmi dan cepat!\n⚡ Upgrade squad jadi juara!\n💸 Harga: mulai Rp16.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🚁 TopUp Rules of Survival", "🔫 Supply habis saat drop?\n🪂 TopUp cepat langsung ke akun RoS kamu!\n🔥 Bertahan hidup jadi lebih mudah!\n💸 Harga: mulai Rp9.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🌀 TopUp Onmyoji Arena", "🗡️ Ingin gacha skin Epic tapi tidak cukup Jade?\n🎴 TopUp via ID cepat dan aman!\n🌸 Tampil elegan di arena pertempuran Jepang kuno!\n💸 Harga: mulai Rp15.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🌍 TopUp Rise of Kingdoms", "🏰 Butuh Gems buat upgrade City Hall?\n🛡️ TopUp RoK resmi, proses cepat hanya 1 menit!\n🎯 Bangun kerajaanmu jadi legenda dunia!\n💸 Harga: mulai Rp18.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🎴 TopUp Yu-Gi-Oh! Duel Links", "🃏 Gacha kartu UR tapi gems habis?\n⚡ TopUp legal dan cepat masuk akun duelmu!\n🧠 Waktunya jadi King of Games!\n💸 Harga: mulai Rp10.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🎡 TopUp Roblox", "🧱 Gak bisa beli item karena Robux kosong?\n💳 TopUp Robux resmi, masuk cepat dan aman!\n🎨 Buat dunia impianmu tanpa batas!\n💸 Harga: mulai Rp5.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🛡️ TopUp Clash of Clans", "💣 Upgrade TH tertunda karena gem abis?\n🚀 TopUp COC langsung ke ID kamu, legal dan cepat!\n🏰 Bangun desa terkuat di dunia!\n💸 Harga: mulai Rp14.000\n📲 Kontak: [KONTAK KAMU]"],
  ["⚔️ TopUp Clash Royale", "🏹 Gak cukup gems buat buka chest?\n💠 TopUp cepat langsung ke akun Clash Royale kamu!\n🃏 Buka kartu legendaris tanpa tunggu lama!\n💸 Harga: mulai Rp13.000\n📲 Kontak: [KONTAK KAMU]"],
  ["⚙️ TopUp Arena of Valor", "⚡ Gak bisa beli skin Epic karena voucher habis?\n🎮 TopUp AOV super cepat & resmi!\n🔥 Tampil beda di medan tempur!\n💸 Harga: mulai Rp11.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🔫 TopUp Point Blank", "🎯 Butuh cash buat beli senjata premium?\n🚀 TopUp PB langsung ke akun Zepetto kamu!\n🕹️ Rebut ranking teratas sekarang!\n💸 Harga: mulai Rp9.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🐉 TopUp MU Origin", "🧙🏻 Ingin level up tapi kekurangan Diamonds?\n⚔️ TopUp MU Origin aman, cepat, dan resmi!\n🌟 Jadilah legenda sejati dalam pertempuran!\n💸 Harga: mulai Rp12.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🏰 TopUp Lords Mobile", "🛡️ Mau push rank tapi Gems habis?\n📦 TopUp LM legal, cepat, dan garansi masuk!\n🎯 Bangun kerajaanmu jadi tak terkalahkan!\n💸 Harga: mulai Rp15.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🎳 TopUp 8 Ball Pool", "🎱 Skin cue dan meja terbatas?\n⚡ TopUp cepat untuk beli item eksklusif!\n🏆 Tunjukkan gaya unikmu saat tanding!\n💸 Harga: mulai Rp8.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🔮 TopUp Summoners War", "💫 Ingin summon monster bintang 5?\n⚡ TopUp Crystals langsung masuk akun kamu!\n🎴 Perkuat tim dan raih kemenangan!\n💸 Harga: mulai Rp17.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🏙️ TopUp SimCity BuildIt", "🏗️ Gak cukup SimCash buat bangun kota?\n🏢 TopUp SimCity cepat, terpercaya, langsung ke akun kamu!\n🌆 Jadikan kotamu megapolis modern!\n💸 Harga: mulai Rp13.000\n📲 Kontak: [KONTAK KAMU]"],
  ["👨‍🌾 TopUp Hay Day", "🌾 Panen tertunda karena Diamond kurang?\n🚜 TopUp legal, cepat, dan bisa langsung digunakan!\n🐔 Bertani makin menyenangkan!\n💸 Harga: mulai Rp10.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🚂 TopUp Mini Metro", "🚉 Butuh unlock jalur premium tapi coins habis?\n🛤️ TopUp langsung via akunmu, cepat & resmi!\n🧠 Bangun kota dengan sistem transportasi terbaik!\n💸 Harga: mulai Rp10.000\n📲 Kontak: [KONTAK KAMU]"],
  ["🎠 TopUp Candy Crush", "🍬 Level stuck karena power-up habis?\n🔋 TopUp Candy Crush cepat & legal, langsung nikmati bonus booster!\n🍭 Lewati rintangan tanpa stres!\n💸 Harga: mulai Rp9.000\n📲 Kontak: [KONTAK KAMU]"]
          ].map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item[0]}</td>
              <td class="deskripsi" id="desc-${index}">${item[1].replace(/\n/g, '<br>')}</td>
              <td>
                <button class="copy-btn" onclick="copyText('desc-${index}')">
                  <i class="fas fa-copy"></i> Salin
                </button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'promosiJasa') {
  content = `<section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">📢 Dashboard Promosi</h2>
    <section style="padding: 2rem; overflow-x: auto;">
      <h3>🔧 50+ Teks Promosi Jasa Online</h3>
      <table class="announcement-table" style="min-width: 1000px;">
        <thead>
          <tr>
            <th>No</th>
            <th>Jenis Jasa</th>
            <th>Deskripsi</th>
            <th>Salin</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ["📦 Jasa Kirim Barang", "❌ Paket sering terlambat dan rusak?<br>⚡ Kirim aman & tepat waktu.<br>💖 Barang aman sampai tujuan!<br>💸 Harga: Rp15.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["📦 Jasa Kirim Barang", "📦 Biaya kirim mahal?<br>🚚 Tarif flat mulai Rp10rb.<br>😌 Hemat tanpa ribet!<br>💸 Harga: Rp10.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["📦 Jasa Kirim Barang", "📦 Susah tracking paket?<br>📍 Live tracking 24/7.<br>😎 Kirim jadi tenang!<br>💸 Harga: Rp12.000<br>📲 Kontak: [KONTAK KAMU]"],

            ["💇‍♀️ Jasa Potong Rambut", "💇‍♂️ Rambut kusut dan tak rapi?<br>✂️ Haircut stylish di rumahmu!<br>😌 Tampil segar & percaya diri!<br>💸 Harga: Rp40.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["💇‍♀️ Jasa Potong Rambut", "🔖 Gak sempat ke barbershop?<br>🚗 Layanan panggilan ke rumah.<br>🪞 Potong rapi tanpa antri!<br>💸 Harga: Rp50.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["💇‍♀️ Jasa Potong Rambut", "🎯 Mau model kekinian?<br>✂️ Hair stylist profesional.<br>📷 Cocok buat foto & tampil beda!<br>💸 Harga: Rp70.000<br>📲 Kontak: [KONTAK KAMU]"],

            ["🔧 Jasa Tukang Panggilan", "🏚️ Rumah bocor atau rusak?<br>🧰 Tukang handal langsung ke lokasi.<br>✅ Pekerjaan rapi & cepat!<br>💸 Harga: Rp100.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["🔧 Jasa Tukang Panggilan", "📅 Gak sempat renovasi?<br>📞 Jadwal fleksibel sesuai kamu.<br>🔧 Kami datang & bereskan!<br>💸 Harga: Rp150.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["🔧 Jasa Tukang Panggilan", "🔨 Pekerjaan kecil sering ditunda?<br>🔩 Serahkan ke tim kami.<br>🧱 Hemat tenaga & waktu!<br>💸 Harga: Rp90.000<br>📲 Kontak: [KONTAK KAMU]"],

            ["🧺 Jasa Laundry", "👚 Cucian numpuk?<br>🧼 Layanan laundry kilat & wangi.<br>💨 Siap pakai tanpa ribet!<br>💸 Harga: Rp8.000/kg<br>📲 Kontak: [KONTAK KAMU]"],
            ["🧺 Jasa Laundry", "🕒 Gak ada waktu nyuci?<br>🚚 Antar jemput laundry gratis.<br>😌 Baju bersih tanpa repot!<br>💸 Harga: Rp9.000/kg<br>📲 Kontak: [KONTAK KAMU]"],
            ["🧺 Jasa Laundry", "🌧️ Cuaca hujan terus?<br>🔥 Kami siap jemur & setrika.<br>👕 Baju rapi harum tahan lama!<br>💸 Harga: Rp10.000/kg<br>📲 Kontak: [KONTAK KAMU]"],

            ["📸 Jasa Fotografi", "📷 Acara spesial tanpa dokumentasi?<br>🎞️ Fotografer profesional siap hadir.<br>📂 Abadikan momen pentingmu!<br>💸 Harga: Rp350.000/jam<br>📲 Kontak: [KONTAK KAMU]"],
            ["📸 Jasa Fotografi", "👨‍👩‍👧 Butuh sesi keluarga?<br>🏡 Foto indoor/outdoor bisa atur.<br>📸 Kenangan indah selamanya!<br>💸 Harga: Rp500.000/paket<br>📲 Kontak: [KONTAK KAMU]"],
            ["📸 Jasa Fotografi", "📲 Konten IG feed gitu-gitu aja?<br>✨ Sesi foto estetik dengan edit bonus.<br>🌟 Bikin feed makin kece!<br>💸 Harga: Rp250.000<br>📲 Kontak: [KONTAK KAMU]"],

            ["🍽️ Jasa Catering Rumahan", "👨‍👩‍👧‍👦 Punya acara keluarga?<br>🍛 Catering rumahan lezat & hemat.<br>😋 Tamu puas, acara sukses!<br>💸 Harga: Rp25.000/porsi<br>📲 Kontak: [KONTAK KAMU]"],
            ["🍽️ Jasa Catering Rumahan", "📦 Susah cari makan siang kantor?<br>🥗 Menu harian sehat & variatif.<br>🚚 Antar ke tempat kamu!<br>💸 Harga: Rp20.000/porsi<br>📲 Kontak: [KONTAK KAMU]"],
            ["🍽️ Jasa Catering Rumahan", "🧆 Mau prasmanan rumahan enak?<br>🍽️ Menu bisa request sesuai selera.<br>🎉 Acara makin meriah & lezat!<br>💸 Harga: Rp30.000/porsi<br>📲 Kontak: [KONTAK KAMU]"],

            ["🎓 Jasa Les Privat", "📚 Anak susah fokus belajar?<br>👨‍🏫 Guru les datang ke rumah.<br>🎯 Belajar jadi menyenangkan!<br>💸 Harga: Rp75.000/jam<br>📲 Kontak: [KONTAK KAMU]"],
            ["🎓 Jasa Les Privat", "📝 Nilai ujian menurun?<br>🧠 Les intensif dengan metode fun.<br>📈 Prestasi naik signifikan!<br>💸 Harga: Rp80.000/jam<br>📲 Kontak: [KONTAK KAMU]"],
            ["🎓 Jasa Les Privat", "📖 Persiapan UTBK/SBMPTN?<br>📘 Tutor berpengalaman & soal terupdate.<br>🏆 Capai jurusan impianmu!<br>💸 Harga: Rp100.000/jam<br>📲 Kontak: [KONTAK KAMU]"],

	    ["💻 Jasa Desain Grafis", "🖼️ Bingung bikin logo atau banner?<br>🎨 Kami siap bantu desain sesuai kebutuhanmu!<br>🌟 Kualitas premium, harga bersahabat.<br>💸 Harga: Rp50.000/desain<br>📲 Kontak: [KONTAK KAMU]"],
            ["💻 Jasa Desain Grafis", "📢 Promosi gak menarik?<br>🎨 Desain konten IG/FB kekinian & profesional.<br>📈 Bisnismu makin dilirik!<br>💸 Harga: Rp35.000/postingan<br>📲 Kontak: [KONTAK KAMU]"],
            ["💻 Jasa Desain Grafis", "🎁 Butuh kemasan produk menarik?<br>🖌️ Jasa desain packaging unik & eye-catching!<br>🛍️ Produk makin laris manis!<br>💸 Harga: Rp75.000<br>📲 Kontak: [KONTAK KAMU]"],

            ["🛠️ Jasa Pembuatan Website", "🌐 Bisnismu belum punya website?<br>💻 Jasa buat website profesional & mobile friendly.<br>📈 Bikin usaha makin dipercaya!<br>💸 Harga: mulai Rp350.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["🛠️ Jasa Pembuatan Website", "🛍️ Mau jualan online sendiri?<br>🛒 Website toko lengkap fitur checkout & katalog!<br>🚀 Siap saingi marketplace!<br>💸 Harga: mulai Rp500.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["🛠️ Jasa Pembuatan Website", "📚 Punya portofolio tapi belum online?<br>📁 Website profil pribadi tampilkan skillmu!<br>🔗 Tinggal share link ke klien.<br>💸 Harga: mulai Rp300.000<br>📲 Kontak: [KONTAK KAMU]"],

            ["🎞️ Jasa Video Editing", "🎥 Punya footage mentah?<br>✂️ Kami edit jadi cinematic dan menarik.<br>🔥 Cocok untuk konten Youtube & Reels!<br>💸 Harga: Rp150.000/video<br>📲 Kontak: [KONTAK KAMU]"],
            ["🎞️ Jasa Video Editing", "📲 Video promosi produk belum maksimal?<br>📽️ Kami bantu buatkan iklan digital profesional.<br>💼 Naikkan penjualanmu sekarang!<br>💸 Harga: Rp200.000/video<br>📲 Kontak: [KONTAK KAMU]"],
            ["🎞️ Jasa Video Editing", "👨‍🏫 Mau edit video edukasi?<br>🧠 Tambah animasi & teks interaktif.<br>📈 Cocok buat konten e-learning.<br>💸 Harga: Rp120.000/video<br>📲 Kontak: [KONTAK KAMU]"],

            ["📢 Jasa Admin Sosial Media", "📉 IG & TikTok sepi interaksi?<br>📊 Admin profesional bantu kelola akunmu.<br>📈 Naikkan engagement & followers!<br>💸 Harga: Rp300.000/bulan<br>📲 Kontak: [KONTAK KAMU]"],
            ["📢 Jasa Admin Sosial Media", "📆 Gak sempat update konten harian?<br>📸 Kami handle semua jadwal & caption.<br>🗓️ Posting rutin, interaksi stabil!<br>💸 Harga: Rp400.000/bulan<br>📲 Kontak: [KONTAK KAMU]"],
            ["📢 Jasa Admin Sosial Media", "📈 Mau akun jualan makin profesional?<br>🎯 Admin plus desain konten & auto-responder.<br>💼 Fokus jualan, kami bantu branding!<br>💸 Harga: Rp600.000/bulan<br>📲 Kontak: [KONTAK KAMU]"],

            ["🧾 Jasa Penulisan Artikel", "✍️ Butuh konten website yang SEO friendly?<br>📚 Penulis berpengalaman siap bantu.<br>🧠 Konten informatif & original!<br>💸 Harga: Rp25.000/500 kata<br>📲 Kontak: [KONTAK KAMU]"],
            ["🧾 Jasa Penulisan Artikel", "📓 Susah bikin caption jualan?<br>🖋️ Copywriter siap buatkan konten promosi.<br>🔥 Bikin calon pembeli langsung beli!<br>💸 Harga: Rp15.000/caption<br>📲 Kontak: [KONTAK KAMU]"],
            ["🧾 Jasa Penulisan Artikel", "📝 Mau buat e-book tapi bingung mulai?<br>📖 Kami bantu tulis & edit konten digitalmu!<br>📘 Profesional, cepat, dan sesuai niche.<br>💸 Harga: mulai Rp200.000<br>📲 Kontak: [KONTAK KAMU]"],

            ["🌍 Jasa Translate Bahasa", "🌐 Bingung translate dokumen atau jurnal asing?<br>📝 Kami terima terjemahan Inggris, Jepang, Mandarin, dan lainnya!<br>💼 Akurat dan cepat.<br>💸 Harga: mulai Rp25.000/lembar<br>📲 Kontak: [KONTAK KAMU]"],
            ["🌍 Jasa Translate Bahasa", "📚 Mau translate tugas kampus atau abstrak skripsi?<br>🎓 Kami bantu translate formal & akademik.<br>✅ Dijamin rapi dan terstruktur.<br>💸 Harga: mulai Rp30.000/halaman<br>📲 Kontak: [KONTAK KAMU]"],
            ["🌍 Jasa Translate Bahasa", "💬 Translate chat bisnis atau email resmi?<br>📧 Layanan profesional & rahasia terjamin.<br>🚀 Cocok untuk kerja remote & ekspor-impor.<br>💸 Harga: mulai Rp20.000/100 kata<br>📲 Kontak: [KONTAK KAMU]"],

            ["📈 Jasa SEO Website", "🔍 Website gak muncul di Google?<br>🚀 Optimasi SEO On-page & Off-page untuk ranking lebih tinggi!<br>📊 Buktikan trafik naik dalam minggu pertama!<br>💸 Harga: mulai Rp250.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["📈 Jasa SEO Website", "📉 Trafik websitemu sepi pengunjung?<br>📌 Jasa SEO bulanan lengkap dengan laporan.<br>🎯 Cocok untuk UMKM & bisnis online!<br>💸 Harga: mulai Rp350.000/bulan<br>📲 Kontak: [KONTAK KAMU]"],
            ["📈 Jasa SEO Website", "🧠 Bingung bikin artikel SEO?<br>✍️ Kami bantu riset keyword & tulis konten SEO-friendly.<br>📈 Naikkan peringkatmu di Google!<br>💸 Harga: Rp50.000/artikel<br>📲 Kontak: [KONTAK KAMU]"],

            ["🧠 Jasa Konsultasi Online", "👥 Punya masalah bisnis, akademik, atau personal?<br>📞 Konsultasi via Zoom/Chat dengan ahli berpengalaman.<br>💬 Privasi terjamin, solusi cepat!<br>💸 Harga: mulai Rp50.000/sesi<br>📲 Kontak: [KONTAK KAMU]"],
            ["🧠 Jasa Konsultasi Online", "📚 Konsultasi skripsi atau tugas akhir?<br>🧑‍🏫 Kami bantu arahkan topik & revisi.<br>🔍 Langsung to the point & efisien.<br>💸 Harga: mulai Rp60.000/sesi<br>📲 Kontak: [KONTAK KAMU]"],
            ["🧠 Jasa Konsultasi Online", "💼 Bisnis sepi pelanggan?<br>🎯 Konsultasi strategi pemasaran online bersama kami.<br>📈 Tingkatkan omzet dengan langkah tepat!<br>💸 Harga: mulai Rp100.000/jam<br>📲 Kontak: [KONTAK KAMU]"],

            ["📣 Jasa Setting Iklan (FB/Google Ads)", "📉 Iklan boncos terus?<br>📊 Kami bantu set up iklan FB & Google dari nol.<br>🎯 Target tepat, hasil maksimal!<br>💸 Harga: mulai Rp150.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["📣 Jasa Setting Iklan (FB/Google Ads)", "🚀 Mau jualan makin laris?<br>💬 Kami buatkan copywriting, desain iklan, dan optimasi CTR.<br>📈 Full support selama campaign aktif!<br>💸 Harga: mulai Rp200.000<br>📲 Kontak: [KONTAK KAMU]"],
            ["📣 Jasa Setting Iklan (FB/Google Ads)", "🎯 Bingung cara retargeting audience?<br>📊 Setup pixel, katalog, & data insight oleh expert ads.<br>🔁 Ubah viewers jadi pembeli setia.<br>💸 Harga: mulai Rp250.000<br>📲 Kontak: [KONTAK KAMU]"],

            ["🛍️ Jasa Admin Marketplace", "📦 Toko Shopee atau Tokpedmu gak aktif?<br>🛒 Kami bantu kelola chat, upload produk, dan optimasi toko.<br>💼 Fokus kamu jualan, sisanya kami bantu.<br>💸 Harga: Rp350.000/bulan<br>📲 Kontak: [KONTAK KAMU]"],
            ["🛍️ Jasa Admin Marketplace", "📸 Foto produk & deskripsi berantakan?<br>📌 Admin marketplace siap bantu rapiin semua konten toko.<br>🛍️ Lebih dipercaya pembeli!<br>💸 Harga: Rp400.000/bulan<br>📲 Kontak: [KONTAK KAMU]"],
            ["🛍️ Jasa Admin Marketplace", "📊 Orderan banyak tapi balas chat lambat?<br>🤖 Admin full support 7 hari kerja, fast response dijamin!<br>📈 Pelayanan jadi bintang 5!<br>💸 Harga: Rp450.000/bulan<br>📲 Kontak: [KONTAK KAMU]"]

          ].map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item[0]}</td>
              <td class="deskripsi" id="desc-${index}">${item[1]}</td>
              <td>
                <button class="copy-btn" onclick="copyText('desc-${index}')">
                  <i class="fas fa-copy"></i> Salin
                </button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'bantuan') {
  content = `<section style="padding: 2rem;">
  <h2 style="font-size: 1.8rem; color: #00bfff; text-align: center; font-weight: 600;">
    📬 Form Bantuan / Saran
  </h2>

  <form id="bantuanForm" onsubmit="kirimBantuan(event)">
    <label for="nama">Nama:</label>
    <input type="text" id="nama" name="nama" required placeholder="Nama lengkap" />

    <label for="kontak">Email / Telegram / WhatsApp:</label>
    <input type="text" id="kontak" name="kontak" required placeholder="Contoh: @telegram / 08xxxx / email@gmail.com" />

    <label for="kategori">Jenis Pesan:</label>
    <select id="kategori" name="kategori" required>
      <option value="">-- Pilih Jenis Pesan --</option>
      <option value="Permasalahan">Permasalahan</option>
      <option value="Request Fitur">Request Fitur</option>
      <option value="Update Fitur">Update Fitur</option>
      <option value="Komplain">Komplain</option>
      <option value="Bonus">Bonus</option>
      <option value="Lainnya">Lainnya</option>
    </select>

    <label for="pesan">Pesan:</label>
    <textarea id="pesan" name="pesan" rows="5" required placeholder="Tulis pesan anda di sini..."></textarea>

    <button type="submit" id="btnKirim">📨 Kirim</button>
    <p id="statusKirim"></p>
  </form>
</section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'qrgenerator') {
  content = `
    <section class="page-qrgenerator">
  <section class="qr-section">
    <h2 class="qr-title">🔳 QR Code Generator</h2>
    <p class="qr-desc">Masukkan teks atau URL yang ingin diubah menjadi QR Code.</p>

    <div class="qr-box">
      <input id="qrText" type="text" class="qr-input" placeholder="Masukkan teks atau URL..." />
      <button onclick="generateQR()" class="qr-button">🔍 Generate QR</button>

      <div id="loading-spinner"></div>
      <div id="qrResult" class="qr-result"></div>
    </div>
  </section>
    </section>
  `;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'templatecanva') {
  content = `<section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">🎨 Dashboard Template Canva Premium</h2>
    <section style="padding: 2rem; overflow-x: auto;">
      <h3>🧾 100+ Template Premium (Resume, CV, dan Lainnya)</h3>
      <table class="announcement-table" style="min-width: 1000px;">
        <thead>
          <tr>
            <th>No</th>
            <th>Kategori</th>
            <th>Nama Template</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          ${[
             ["1", "Resume", "Modern Clean Resume"],
  ["2", "CV", "Creative CV with Icons"],
  ["3", "Proposal", "Business Proposal Layout"],
  ["4", "Invoice", "Minimal Invoice Template"],
  ["5", "Letterhead", "Professional Letterhead"],
  ["6", "ID Card", "Staff ID Badge Design"],
  ["7", "Worksheet", "Student Worksheet"],
  ["8", "Sertifikat", "Certificate of Achievement"],
  ["9", "Poster Edukasi", "Math Educational Poster"],
  ["10", "Rencana Pelajaran", "Weekly Lesson Plan"],
  ["11", "Post Instagram", "Promo Instagram Post"],
  ["12", "Story Instagram", "Product Launch IG Story"],
  ["13", "Facebook Post", "Business FB Post"],
  ["14", "Facebook Cover", "Modern Facebook Cover"],
  ["15", "YouTube Thumbnail", "Gaming YouTube Thumbnail"],
  ["16", "YouTube Channel Art", "Tech Channel Banner"],
  ["17", "Pinterest Graphic", "Travel Pinterest Post"],
  ["18", "LinkedIn Post", "Professional LinkedIn Update"],
  ["19", "Flyer", "Food Delivery Flyer"],
  ["20", "Poster", "Event Poster Premium"],
  ["21", "Brosur", "Trifold Business Brochure"],
  ["22", "Kartu Nama", "Creative Business Card"],
  ["23", "Banner", "Online Sale Web Banner"],
  ["24", "Roll Up Banner", "Corporate Stand Banner"],
  ["25", "Menu Restoran", "Modern Restaurant Menu"],
  ["26", "Label Produk", "Minimalist Product Label"],
  ["27", "Katalog", "Product Showcase Catalog"],
  ["28", "Kupon", "Discount Coupon Layout"],
  ["29", "Price List", "Service Pricing Sheet"],
  ["30", "Feed Promo", "Flash Sale Promo IG"],
  ["31", "Pitch Deck", "Startup Pitch Deck"],
  ["32", "Proposal Bisnis", "Business Growth Proposal"],
  ["33", "Company Profile", "Modern Profile Presentation"],
  ["34", "Template Seminar", "Online Webinar Template"],
  ["35", "Slide Pembelajaran", "Fun Learning Slides"],
  ["36", "Infografis", "Health Tips Infographic"],
  ["37", "Mood Board", "Aesthetic Moodboard"],
  ["38", "Poster Aesthetic", "Indie Band Poster"],
  ["39", "Collage", "Polaroid Photo Collage"],
  ["40", "Undangan Pernikahan", "Elegant Wedding Invite"],
  ["41", "Undangan Ulang Tahun", "Birthday Bash Invite"],
  ["42", "Undangan Formal", "Official Meeting Invitation"],
  ["43", "Kalender Event", "Monthly Event Calendar"],
  ["44", "Tiket Masuk", "Event Entry Ticket"],
  ["45", "Stiker", "Cute Planner Stickers"],
  ["46", "Hang Tag", "Clothing Tag Design"],
  ["47", "Label Botol", "Water Bottle Label"],
  ["48", "Kemasan Makanan", "Snack Food Packaging"],
  ["49", "Packaging Box", "Elegant Gift Box"],
  ["50", "Quotes Instagram", "Positive Vibes Quote"],
  ["51", "Caption Inspiratif", "Daily Motivation Caption"],
  ["52", "Quotes Islami", "Islamic Wisdom Quote"],
  ["53", "Meal Plan", "Weekly Meal Prep Plan"],
  ["54", "Fitness Tracker", "Gym Workout Tracker"],
  ["55", "Journaling", "Mental Health Journal"],
  ["56", "Self-Care Planner", "Daily Self-Love Tracker"],
  ["57", "Kalender", "Aesthetic 2025 Calendar"],
  ["58", "Weekly Planner", "Colorful Weekly Agenda"],
  ["59", "Daily Planner", "Minimalist Daily Plan"],
  ["60", "Habit Tracker", "Monthly Habits Template"],
  ["61", "Poster Kampanye", "Stop Bullying Poster"],
  ["62", "Konten Donasi", "Charity Campaign Flyer"],
  ["63", "Pengumuman Sekolah", "School Notice Poster"],
  ["64", "Media Dakwah", "Islamic Reminder Poster"],
  ["65", "Resume", "Bold Resume Design"],
  ["66", "CV", "Infographic CV Layout"],
  ["67", "Proposal", "Marketing Proposal Clean"],
  ["68", "Invoice", "Editable Invoice Layout"],
  ["69", "Letterhead", "Simple Letterhead Design"],
  ["70", "Worksheet", "Fun Science Worksheet"],
  ["71", "Sertifikat", "Appreciation Certificate"],
  ["72", "Poster Edukasi", "Science Class Poster"],
  ["73", "Instagram Post", "New Arrival Product IG"],
  ["74", "YouTube Thumbnail", "DIY Video Thumbnail"],
  ["75", "Flyer", "Music Concert Flyer"],
  ["76", "Poster", "Modern Art Exhibition"],
  ["77", "Kartu Nama", "Luxury Business Card"],
  ["78", "Menu Restoran", "Vegan Food Menu"],
  ["79", "Label Produk", "Handmade Soap Label"],
  ["80", "Price List", "Photography Price List"],
  ["81", "Company Profile", "Elegant Company Deck"],
  ["82", "Infografis", "COVID-19 Info Graphic"],
  ["83", "Mood Board", "Fashion Brand Moodboard"],
  ["84", "Undangan Pernikahan", "Floral Wedding Design"],
  ["85", "Tiket Masuk", "Movie Night Ticket"],
  ["86", "Packaging Box", "Product Packaging Box"],
  ["87", "Quotes Instagram", "Motivational Monday Quote"],
  ["88", "Meal Plan", "Fitness Meal Template"],
  ["89", "Journaling", "Bullet Journal Starter"],
  ["90", "Self-Care Planner", "Mindfulness Tracker"],
  ["91", "Kalender", "Digital Calendar Layout"],
  ["92", "Weekly Planner", "Boho Style Planner"],
  ["93", "Daily Planner", "Student Daily Template"],
  ["94", "Poster Kampanye", "Save The Earth Poster"],
  ["95", "Konten Donasi", "Zakat Campaign Content"],
  ["96", "Pengumuman Sekolah", "Back to School Info"],
  ["97", "Facebook Cover", "Cover for Business Page"],
  ["98", "Pinterest Graphic", "Pin for Recipe Blog"],
  ["99", "TikTok Video", "Template TikTok Promo"],
  ["100", "Slide Pembelajaran", "Math Class Slides"],
["101", "Resume", "Simple Modern Resume"],
            ["102", "CV", "Stylish CV Layout"],
            ["103", "Proposal", "Project Proposal Template"],
            ["104", "Invoice", "Professional Invoice Format"],
            ["105", "Poster", "Grand Opening Poster"],
            ["106", "Flyer", "Discount Sale Flyer"],
            ["107", "Instagram Post", "New Product Post"],
            ["108", "Facebook Post", "Summer Sale FB Post"],
            ["109", "YouTube Thumbnail", "Tutorial Thumbnail"],
            ["110", "YouTube Channel Art", "Modern Channel Art"],
            ["111", "Sertifikat", "Certificate of Excellence"],
            ["112", "Company Profile", "Elegant Company Deck"],
            ["113", "Pitch Deck", "Investor Pitch Template"],
            ["114", "Label Produk", "Organic Product Label"],
            ["115", "Menu Restoran", "Asian Cuisine Menu"],
            ["116", "Banner", "Marketing Web Banner"],
            ["117", "Roll Up Banner", "Event Stand Banner"],
            ["118", "Kartu Nama", "Clean Business Card"],
            ["119", "Katalog", "Product Catalog Layout"],
            ["120", "Price List", "Service Price Sheet"],
            ["121", "Undangan Pernikahan", "Rustic Wedding Invite"],
            ["122", "Undangan Ulang Tahun", "Kids Birthday Invite"],
            ["123", "Undangan Formal", "Corporate Event Invitation"],
            ["124", "Poster Edukasi", "Alphabet Learning Poster"],
            ["125", "Infografis", "Startup Infographic Design"],
            ["126", "Mood Board", "Interior Moodboard"],
            ["127", "Collage", "Photo Collage Layout"],
            ["128", "Quotes Instagram", "Inspirational Quote Post"],
            ["129", "Caption Inspiratif", "Uplifting Quote Content"],
            ["130", "Quotes Islami", "Ramadan Reminder Post"],
            ["131", "Meal Plan", "Healthy Eating Planner"],
            ["132", "Fitness Tracker", "Workout Progress Tracker"],
            ["133", "Journaling", "Daily Reflection Journal"],
            ["134", "Self-Care Planner", "Mindfulness Daily Log"],
            ["135", "Kalender", "2025 Wall Calendar"],
            ["136", "Daily Planner", "Work Task Planner"],
            ["137", "Habit Tracker", "Goal Tracking Sheet"],
            ["138", "Slide Pembelajaran", "Science Class Slides"],
            ["139", "Template Seminar", "Webinar Promo Slide"],
            ["140", "Proposal Bisnis", "SME Business Plan"],
            ["141", "Poster Kampanye", "Anti Plastic Campaign"],
            ["142", "Konten Donasi", "Social Fundraiser Post"],
            ["143", "Pengumuman Sekolah", "Exam Schedule Poster"],
            ["144", "Media Dakwah", "Jum'at Reminder Poster"],
            ["145", "Story Instagram", "Flash Sale Story"],
            ["146", "Tiket Masuk", "Concert Ticket Design"],
            ["147", "Hang Tag", "Clothing Tag Label"],
            ["148", "Label Botol", "Juice Bottle Label"],
            ["149", "Kemasan Makanan", "Bakery Box Design"],
            ["150", "Packaging Box", "Elegant Product Box"],
            ["151", "Worksheet", "Math Practice Sheet"],
            ["152", "Rencana Pelajaran", "Lesson Plan Outline"],
            ["153", "ID Card", "Event Crew ID"],
            ["154", "Letterhead", "Formal Company Letterhead"],
            ["155", "Facebook Cover", "Agency Cover Banner"],
            ["156", "Pinterest Graphic", "Beauty Tips Pin"],
            ["157", "TikTok Video", "Promo TikTok Layout"],
            ["158", "Post Instagram", "Announcement IG Post"],
            ["159", "Flyer", "Grand Launch Flyer"],
            ["160", "Poster", "Health Awareness Poster"],
            ["161", "Resume", "Infographic Resume Design"],
            ["162", "CV", "Modern CV Template"],
            ["163", "Proposal", "Simple Project Proposal"],
            ["164", "Invoice", "Freelancer Invoice Layout"],
            ["165", "Sertifikat", "Course Completion Certificate"],
            ["166", "Company Profile", "Professional Company Deck"],
            ["167", "Katalog", "Furniture Product Catalog"],
            ["168", "Quotes Instagram", "Morning Motivation Quote"],
            ["169", "Meal Plan", "Weekly Diet Planner"],
            ["170", "Self-Care Planner", "Mental Wellness Log"],
            ["171", "Kalender", "Minimalist Monthly Calendar"],
            ["172", "Weekly Planner", "Colorful Weekly Schedule"],
            ["173", "Daily Planner", "Routine Tracker"],
            ["174", "Poster Kampanye", "Eco-Friendly Poster"],
            ["175", "Konten Donasi", "Disaster Relief Post"],
            ["176", "Pengumuman Sekolah", "Parent Meeting Notice"],
            ["177", "Media Dakwah", "Hadith Quote Poster"],
            ["178", "Infografis", "Work From Home Stats"],
            ["179", "Mood Board", "Wedding Inspiration Moodboard"],
            ["180", "Collage", "Travel Photo Grid"],
            ["181", "Story Instagram", "New Product Launch"],
            ["182", "Post Instagram", "Limited Stock Promo"],
            ["183", "TikTok Video", "Beauty Product Showcase"],
            ["184", "Pinterest Graphic", "Kitchen Hacks Graphic"],
            ["185", "Facebook Post", "Team Introduction Post"],
            ["186", "Flyer", "Real Estate Listing Flyer"],
            ["187", "Poster", "University Admission Poster"],
            ["188", "Quotes Islami", "Daily Prayer Quote"],
            ["189", "Caption Inspiratif", "Gratitude Reminder"],
            ["190", "Label Produk", "Soap Bar Label"],
            ["191", "Menu Restoran", "Coffee Shop Menu"],
            ["192", "Banner", "Ecommerce Promo Banner"],
            ["193", "Slide Pembelajaran", "English Class Slide"],
            ["194", "Template Seminar", "Training Event Template"],
            ["195", "Proposal Bisnis", "Retail Expansion Proposal"],
            ["196", "Company Profile", "Annual Report Slide"],
            ["197", "Quotes Instagram", "Self-Love Quote"],
            ["198", "Meal Plan", "Gluten-Free Meal Plan"],
            ["199", "Fitness Tracker", "Daily Workout Log"],
            ["200", "Journaling", "Evening Reflection Journal"]
  ].map(item => {
            const no = item[0];
            const category = item[1];
            const name = item[2];
            const url = `https://www.canva.com/templates/?query=${encodeURIComponent(name)}`;
            return `
            <tr>
              <td>${no}</td>
              <td>${category}</td>
              <td>${name} <span style="color:orange;">(Premium)</span></td>
              <td>
                <a href="${url}" class="download-btn" target="_blank">
                  🔗 Lihat
                </a>
                <button class="report-btn" onclick="laporkanKeTelegram('${name.replace(/'/g, "\\'")}', '${url}', 'templatecanva', '${category}')">
                  ⚠️ Laporkan
                </button>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'appsmod') { 
  content = `<section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">Dashboard</h2>
    <section style="padding: 2rem;">
      <h3>🎮 100 Game Teratas Play Store (Gratis & Premium)</h3>
      <table class="announcement-table">
        <thead>
          <tr>
            <th>Last Updated</th>
            <th>Deskripsi</th>
            <th>Link Download</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ["26-05-2025", "Call of Duty: Mobile v1.0.51 MOD", "https://id.happymod.cloud/call-of-duty-mobile/com.activision.callofduty.shooter/"],
            ["26-05-2025", "Call of Duty: Mobile – Garena v1.6.51 MOD", "https://id.happymod.cloud/call-of-duty-mobile-garena/com.garena.game.codm/"],
            ["23-06-2025", "PUBG Mobile v2.9.0 MOD", "https://id.happymod.cloud/pubg-mobile/com.tencent.ig/"],
            ["17-06-2025", "Minecraft v1.21.81 ⭐ Premium MOD", "https://id.happymod.cloud/minecraft/com.mojang.minecraftpe/"],
            ["15-06-2025", "Genshin Impact v4.7.0 MOD", "https://id.happymod.cloud/genshin-impact/com.miHoYo.GenshinImpact/"],
            ["20-05-2025", "Free Fire v1.104.1 MOD", "https://id.happymod.cloud/free-fire-game-apk-app/com.dts.freefireth/"],
            ["10-04-2025", "Mobile Legends: Bang Bang v1.8.72.955.1 MOD", "https://id.happymod.cloud/mobile-legends/com.mobile.legends/"],
            ["05-06-2025", "Roblox v2.627.599 MOD", "https://id.happymod.cloud/roblox/com.roblox.client/"],
            ["01-03-2025", "Subway Surfers v3.31.0 MOD", "https://id.happymod.cloud/subway-surfers/com.kiloo.subwaysurf/"],
            ["02-04-2025", "Candy Crush Saga v1.270.0.2 MOD", "https://id.happymod.cloud/candy-crush-saga/com.king.candycrushsaga/"],
            ["30-05-2025", "Clash of Clans v15.547.4 MOD", "https://id.happymod.cloud/clash-of-clans/com.supercell.clashofclans/"],
            ["30-05-2025", "Clash Royale v3.3186.6 MOD", "https://id.happymod.cloud/clash-royale/com.supercell.clashroyale/"],
            ["15-05-2025", "Among Us v2024.6.12 MOD", "https://id.happymod.cloud/among-us/com.innersloth.spacemafia/"],
            ["28-05-2025", "Brawl Stars v57.255 MOD", "https://id.happymod.cloud/brawl-stars/com.supercell.brawlstars/"],
            ["21-05-2025", "Geometry Dash v2.211 ⭐ Premium MOD", "https://id.happymod.cloud/geometry-jump/com.robtopx.geometryjump/"],
            ["12-05-2025", "Terraria v1.4.4.9 ⭐ Premium MOD", "https://id.happymod.cloud/terraria/com.and.games505.TerrariaPaid/"],
            ["14-05-2025", "Stardew Valley v1.5.6.52 ⭐ Premium MOD", "https://id.happymod.cloud/stardew-valley/com.chucklefish.stardewvalley/"],
            ["25-05-2025", "The Room v1.10 ⭐ Premium MOD", "https://id.happymod.cloud/the-room/com.fireproofstudios.theroom/"],
            ["27-05-2025", "Plague Inc. v1.19.10 ⭐ Premium MOD", "https://id.happymod.cloud/plague-inc/com.miniclip.plagueinc/"],
            ["18-05-2025", "Mini Metro v2.52.0 ⭐ Premium MOD", "https://id.happymod.cloud/mini-metro/nz.co.codepoint.minimetro/"],
            ["26-05-2025", "Dead Cells v3.3.2 ⭐ Premium MOD", "https://id.happymod.cloud/dead-cells/com.playdigious.deadcells.mobile/"],
            ["23-05-2025", "Slay the Spire v2.2.8 ⭐ Premium MOD", "https://id.happymod.cloud/slay-the-spire/com.humble.SlayTheSpire/"],
            ["29-05-2025", "Shadow Fight 4 v1.7.4 MOD", "https://id.happymod.cloud/shadow-fight-4/com.nekki.shadowfightarena/"],
            ["22-05-2025", "Angry Birds 2 v3.19.2 MOD", "https://id.happymod.cloud/angry-birds-2/com.rovio.baba/"],
            ["16-05-2025", "Kingdom Rush Origins v5.8.08 ⭐ Premium MOD", "https://id.happymod.cloud/kingdom-rush-origins/com.ironhidegames.android.kingdomrushorigins/"],
            ["13-05-2025", "Rebel Inc. v1.13.2 ⭐ Premium MOD", "https://id.happymod.cloud/rebel-inc/com.ndemiccreations.rebelinc/"],
            ["19-05-2025", "Into the Dead 2 v1.68.0 MOD", "https://id.happymod.cloud/into-the-dead-2/com.pikpok.dr2.play/"],
            ["24-05-2025", "Plants vs Zombies 2 v10.8.1 MOD", "https://id.happymod.cloud/plants-vs-zombies-2/com.ea.game.pvz2_na/"],
            ["23-05-2025", "My Talking Tom v7.7.0.4073 MOD", "https://id.happymod.cloud/my-talking-tom/com.outfit7.mytalkingtomfree/"],
            ["21-05-2025", "Hay Day v1.59.188 MOD", "https://id.happymod.cloud/hay-day/com.supercell.hayday/"],
            ["20-05-2025", "FarmVille 3 v1.48.36042 MOD", "https://id.happymod.cloud/farmville-3/com.zynga.farmville3/"],
            ["19-05-2025", "The Sims Mobile v40.0.0.139564 MOD", "https://id.happymod.cloud/the-sims-mobile/com.ea.gp.simsmobile/"],
            ["15-05-2025", "SimCity BuildIt v1.51.1.119508 MOD", "https://id.happymod.cloud/simcity-buildit/com.ea.game.simcitymobile_row/"],
            ["10-05-2025", "8 Ball Pool v5.15.0 MOD", "https://id.happymod.cloud/8-ball-pool/com.miniclip.eightballpool/"],
            ["09-05-2025", "Real Racing 3 v12.0.2 MOD", "https://id.happymod.cloud/real-racing-3/com.ea.games.r3_row/"],
            ["08-05-2025", "Subway Princess Runner v1.5.5 MOD", "https://id.happymod.cloud/subway-princess-runner/com.yodo1games.subwayprincess/"],
            ["07-05-2025", "CarX Drift Racing 2 v1.46 MOD", "https://id.happymod.cloud/carx-drift-racing-2/com.carxtech.carxdr2/"],
            ["06-05-2025", "Asphalt 9: Legends v3.7.1 MOD", "https://id.happymod.cloud/asphalt-9-legends/com.gameloft.android.ANMP.GloftA9HM/"],
            ["05-05-2025", "Terraria v1.4.4.9 ⭐ Premium MOD", "https://id.happymod.cloud/terraria/com.and.games505.TerrariaPaid/"],
            ["04-05-2025", "Mario Kart Tour v3.6.0 MOD", "https://id.happymod.cloud/mario-kart-tour/com.nintendo.zaka/"],
            ["03-05-2025", "Among Us v2024.6.12 MOD", "https://id.happymod.cloud/among-us/com.innersloth.spacemafia/"],
            ["02-05-2025", "Brawl Stars v57.255 MOD", "https://id.happymod.cloud/brawl-stars/com.supercell.brawlstars/"],
            ["01-05-2025", "Fortnite v18.30.0 MOD", "https://id.happymod.cloud/fortnite/com.epicgames.fortnite/"],
            ["30-04-2025", "Plants vs Zombies Garden Warfare v1.0.1 MOD", "https://id.happymod.cloud/plants-vs-zombies-garden-warfare/com.popcap.pvzgw/"],
            ["29-04-2025", "SimCity BuildIt v1.51.1.119508 MOD", "https://id.happymod.cloud/simcity-buildit/com.ea.game.simcitymobile_row/"],
            ["28-04-2025", "Pokemon Go v1.223.1 MOD", "https://id.happymod.cloud/pokemon-go/com.nianticlabs.pokemongo/"],
            ["27-04-2025", "Clash of Kings v8.2.8 MOD", "https://id.happymod.cloud/clash-of-kings/com.gamelord.cok.gp/"],
            ["26-04-2025", "Lords Mobile v1.88 MOD", "https://id.happymod.cloud/lords-mobile/com.igg.android/"],
            ["25-04-2025", "Dragon Ball Legends v5.12.0 MOD", "https://id.happymod.cloud/dragon-ball-legends/com.bandainamcoent.dblegends_ww/"],
            ["24-04-2025", "Summoners War v6.5.6 MOD", "https://id.happymod.cloud/summoners-war/com.com2us.smon.normal.freefull.google.kr.android.common/"],
            ["23-04-2025", "Lineage 2 Revolution v2.0.114 MOD", "https://id.happymod.cloud/lineage-2-revolution/com.netmarble.lin2/"],
            ["22-04-2025", "Dragon Raja v1.5.152 MOD", "https://id.happymod.cloud/dragon-raja/com.zloong.eu.dragonraja/"],
            ["21-04-2025", "Rules of Survival v1.332028.332245 MOD", "https://id.happymod.cloud/rules-of-survival/com.netease.lztgglobal/"],
            ["20-04-2025", "Shadowgun Legends v1.11.0 MOD", "https://id.happymod.cloud/shadowgun-legends/com.madfingergames.legends/"],
            ["19-04-2025", "Among Trees v1.2 ⭐ Premium MOD", "https://id.happymod.cloud/among-trees/com.fjolnirsoft.amongtrees/"],
            ["18-04-2025", "Dead by Daylight Mobile v1.0.16 MOD", "https://id.happymod.cloud/dead-by-daylight-mobile/com.bhvr.deadbydaylight/"],
            ["17-04-2025", "The Witcher: Monster Slayer v1.0.3 MOD", "https://id.happymod.cloud/the-witcher-monster-slayer/com.spokko.witcher/"],
            ["16-04-2025", "Terraria v1.4.3 ⭐ Premium MOD", "https://id.happymod.cloud/terraria/com.and.games505.TerrariaPaid/"],
            ["15-04-2025", "Among Us v2024.5.18 MOD", "https://id.happymod.cloud/among-us/com.innersloth.spacemafia/"],
            ["14-04-2025", "Candy Crush Soda Saga v1.185.4 MOD", "https://id.happymod.cloud/candy-crush-soda-saga/com.king.candycrushsodasaga/"],
            ["13-04-2025", "Gardenscapes v5.9.2 MOD", "https://id.happymod.cloud/gardenscapes/com.playrix.gardenscapes/"],
            ["12-04-2025", "Toon Blast v5946 MOD", "https://id.happymod.cloud/toon-blast/com.peakgames.toonblast/"],
            ["11-04-2025", "Homescapes v5.9.2 MOD", "https://id.happymod.cloud/homescapes/com.playrix.homescapes/"],
            ["10-04-2025", "AFK Arena v1.70.14 MOD", "https://id.happymod.cloud/afk-arena/com.lilithgame.hgame.gp/"],
            ["09-04-2025", "Rise of Kingdoms v1.0.97.35 MOD", "https://id.happymod.cloud/rise-of-kingdoms-combat-heroes/com.lilithgames.roc.gp/"],
            ["08-04-2025", "Clash of Kings v8.2.7 MOD", "https://id.happymod.cloud/clash-of-kings/com.gamelord.cok.gp/"],
            ["07-04-2025", "State of Survival v1.16.23 MOD", "https://id.happymod.cloud/state-of-survival-zombie-war/com.kingsgroup.sos/"],
            ["06-04-2025", "Call of Duty: Mobile v1.0.48 MOD", "https://id.happymod.cloud/call-of-duty-mobile/com.activision.callofduty.shooter/"],
            ["05-04-2025", "Marvel Contest of Champions v28.1.1 MOD", "https://id.happymod.cloud/marvel-contest-of-champions/com.kabam.marvelbattle/"],
            ["04-04-2025", "Roblox v2.624.673 MOD", "https://id.happymod.cloud/roblox/com.roblox.client/"],
            ["03-04-2025", "GTA San Andreas v2.00 ⭐ Premium MOD", "https://id.happymod.cloud/grand-theft-auto-san-andreas/com.rockstargames.gtasa/"],
            ["02-04-2025", "Pokémon UNITE v2.0.0 MOD", "https://id.happymod.cloud/pokemon-unite/com.pokemon.unite/"],
            ["01-04-2025", "Subway Surfers v3.30.2 MOD", "https://id.happymod.cloud/subway-surfers/com.kiloo.subwaysurf/"],
	    ["30-06-2025", "Idle Heroes v1.32.0 MOD", "https://id.happymod.cloud/idle-heroes/com.droidhang.ad/"],
            ["30-06-2025", "Hustle Castle v1.70.0 MOD", "https://id.happymod.cloud/hustle-castle/com.my.hc.rpg.kingdom.simulator/"],
            ["30-06-2025", "Grim Soul v5.4.0 MOD", "https://id.happymod.cloud/grim-soul/com.digitalsouls.grimsoul/"],
            ["30-06-2025", "Zombeast v0.33.1 MOD", "https://id.happymod.cloud/zombeast/com.akpublish.zombie/"],
            ["30-06-2025", "Last Hope Sniper v3.33 MOD", "https://id.happymod.cloud/last-hope-sniper/com.JESoftware.LastHopeSniperWar/"],
            ["30-06-2025", "Hero Wars v1.178.101 MOD", "https://id.happymod.cloud/hero-wars/com.nexters.herowars/"],
            ["30-06-2025", "Stick War: Legacy v2023.2.35 MOD", "https://id.happymod.cloud/stick-war-legacy/com.maxgames.stickwarlegacy/"],
            ["30-06-2025", "Zombie Tsunami v4.5.124 MOD", "https://id.happymod.cloud/zombie-tsunami/net.mobigame.zombietsunami/"],
            ["30-06-2025", "Dragon City v24.1.1 MOD", "https://id.happymod.cloud/dragon-city/es.socialpoint.DragonCity/"],
            ["30-06-2025", "Temple Run 2 v6.9.2 MOD", "https://id.happymod.cloud/temple-run-2/com.imangi.templerun2/"]
          ].map(item => `
          <tr>
    <td>${item[0]}</td>
    <td>${item[1]}</td>
            <td><a href="${item[2]}" class="download-btn" target="_blank">
              <i class="fas fa-download"></i> Download
                </a>
		<button class="report-btn" onclick="laporkanKeTelegram('${item[1]}', '${item[2]}', 'link')">⚠️ Laporkan</button>
          </tr>`).join("")}

        </tbody>
      </table>
    </section>
  </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'cekmbti') {
  content = `
    <section style="padding: 2rem;">
      <center><h2 style="color: var(--text-color); font-size: 2rem;">🔮 Cek Kepribadian Zodiak</h2></center>
      <div style="max-width: 500px; margin: auto; background: #0c1b33; padding: 2rem; border-radius: 12px; box-shadow: 0 0 15px #00ffff44;">
        <label for="nama" style="color: #00ffff;">Nama Lengkap:</label>
        <input type="text" id="namaUser" placeholder="Masukkan nama" style="width: 100%; padding: 10px; margin-bottom: 1rem; border: none; border-radius: 6px;" />

        <label for="tgl" style="color: #00ffff;">Tanggal Lahir:</label>
        <input type="date" id="tglLahirUser" style="width: 100%; padding: 10px; margin-bottom: 1rem; border: none; border-radius: 6px;" />

        <button onclick="prosesKepribadian()" style="background-color: #00ffff; color: #000; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🔍 Cek Sekarang
        </button>

        <div id="hasilMBTI" style="margin-top: 2rem;"></div>
      </div>
    </section>
  `;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'nontonfilm') {
  content = `
    <section class="film-mood-container">
      <h2>🎬 Rekomendasi Film Berdasarkan Mood Kamu</h2>
      <p class="terms-box">Masukkan nama kamu dan mood saat ini, lalu kami akan berikan rekomendasi film, anime, atau drama yang cocok!</p>
      <div class="film-form">
        <input type="text" id="namaPengguna" placeholder="Nama kamu...">
        <select id="mood">
          <option value="senang">Senang</option>
          <option value="sedih">Sedih</option>
          <option value="marah">Marah</option>
          <option value="bosan">Bosan</option>
          <option value="kesepian">Kesepian</option>
          <option value="romantis">Romantis</option>
          <option value="cemas">Cemas</option>
          <option value="bahagia">Bahagia</option>
          <option value="bingung">Bingung</option>
          <option value="galau">Galau</option>
        </select>
        <button onclick="generateRekomendasiFilm()">🎥 Tampilkan Rekomendasi</button>
      </div>
      <div id="filmResult" class="film-result"></div>
    </section>`;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'gombal') {
  content = `
    <section class="gombal-page">
      <h2>💘 Yuk Gombal!</h2>
      <p class="subtitle">Masukkan nama & pilih jenis kelamin target gombalanmu 😍</p>

      <input type="text" id="namaTarget" placeholder="Masukkan nama..." />
      <select id="genderTarget">
        <option value="">-- Pilih Jenis Kelamin --</option>
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
      </select>

      <button onclick="generateGombal()">🎯 Gombalin Sekarang</button>

      <div id="gombalResult" class="gombal-box">Belum ada gombalan. Yuk mulai!</div>
      <button id="copyBtn" onclick="copyQuote()" style="display:none;">📋 Copy Gombalan</button>
    </section>
  `;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'ytnonton') {
  content = `
    <section class="yt-watch-container">
      <h2>🎥 Nonton Video YouTube</h2>
      <p class="subtitle">Masukkan link video YouTube dan nikmati dalam mode theater! 🎬</p>

      <input type="text" id="ytVideoLink" placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx" />
      <div class="controls">
        <button onclick="tampilkanVideoYoutube()">▶️ Tonton Video</button>
        <button onclick="toggleTheaterMode()">🖥️ Toggle Theater Mode</button>
      </div>

      <div id="ytIframeContainer" class="yt-iframe"></div>
    </section>
  `;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'cheatgame') {
  content = `
    <section class="cheat-game-container">
      <h2>💉 Kumpulan Cheat Game Terbaru</h2>
      <p class="subtitle">Berikut adalah link download cheat untuk game populer, diupdate setiap hari! 🔥</p>
      <div class="cheat-list">
        ${generateCheatList()}
      </div>
    </section>
  `;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'affiliator') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>Pengantar</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1094/1094983.png" alt="Affiliate Intro" class="page-img" />
          <p>Ingin jadi affiliator sukses dalam 3 bulan? Buku edukasi ini akan membimbing kamu langkah demi langkah mulai dari pemula hingga punya penghasilan sendiri dari program afiliasi. Yuk mulai!</p>
        </div>

        <div class="page" data-page="2">
          <h2>Bab 1: Kenali Dunia Afiliasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4320/4320330.png" alt="Affiliate Network" class="page-img" />
          <p>Afiliasi adalah model bisnis di mana kamu mempromosikan produk orang lain dan mendapatkan komisi dari setiap penjualan melalui link kamu. Platform populer: Tokopedia Affiliate, Shopee, TikTok Shop, Amazon.</p>
        </div>

        <div class="page" data-page="3">
          <h2>Bab 2: Pilih Produk & Platform</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7115/7115894.png" alt="Product Choice" class="page-img" />
          <p>Pilih platform yang kamu kuasai (misalnya TikTok jika suka video pendek). Fokus pada produk yang kamu suka & percaya. Jangan asal pilih, karena kepercayaan followers itu penting.</p>
        </div>

        <div class="page" data-page="4">
          <h2>Bab 3: Bangun Personal Branding</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3811/3811636.png" alt="Branding" class="page-img" />
          <p>Gunakan media sosial untuk membangun kepercayaan. Buat konten yang edukatif, menghibur, dan jujur. Orang akan lebih percaya membeli dari kamu kalau kamu terlihat “nyata” dan konsisten.</p>
        </div>

        <div class="page" data-page="5">
          <h2>Bab 4: Buat Konten yang Menjual</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="Sell Content" class="page-img" />
          <p>Gunakan hook, solusi, dan ajakan. Contoh: "Capek nyetrika? Ini solusinya!" lalu review produknya. Tambahkan link afiliasi di bio atau deskripsi. Berikan alasan kenapa produk ini layak dibeli.</p>
        </div>

        <div class="page" data-page="6">
          <h2>Bab 5: Pelajari Algoritma</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4122/4122511.png" alt="Algorithm" class="page-img" />
          <p>Setiap platform punya algoritma. Rajin upload, gunakan hashtag yang tepat, dan interaksi dengan audiens akan bantu jangkauan konten kamu makin luas. Konsistensi itu kunci!</p>
        </div>

        <div class="page" data-page="7">
          <h2>Bab 6: Gunakan Data & Evaluasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4963/4963465.png" alt="Data Evaluation" class="page-img" />
          <p>Cek performa link afiliasi. Produk mana yang paling banyak dibeli? Jam posting terbaik kapan? Belajar dari data akan membantu kamu perbaiki strategi agar lebih efektif ke depannya.</p>
        </div>

        <div class="page" data-page="8">
          <h2>Bab 7: Tingkatkan Komunikasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3990/3990066.png" alt="Communication" class="page-img" />
          <p>Jawab pertanyaan followers. Bangun hubungan baik. Kalau perlu, buat grup WhatsApp atau Telegram agar kamu bisa promosi lebih dekat dan personal. Jadilah teman, bukan cuma penjual.</p>
        </div>

        <div class="page" data-page="9">
          <h2>Bab 8: Monetisasi & Diversifikasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/484/484167.png" alt="Monetize" class="page-img" />
          <p>Setelah 2 bulan berjalan, kamu bisa mulai cari produk afiliasi dari platform lain juga. Jangan bergantung ke satu platform. Pelajari juga digital marketing dasar seperti email list dan retargeting.</p>
        </div>

        <div class="page" data-page="10">
          <h2>Penutup & Motivasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3159/3159078.png" alt="Motivasi" class="page-img" />
          <p>Jadi affiliator sukses itu bukan mimpi, tapi hasil dari konsistensi, belajar, dan adaptasi. Tetap semangat, evaluasi diri, dan percaya bahwa setiap usaha tidak akan mengkhianati hasil 💪✨</p>
        </div>
	<div class="page" data-page="11">
  <h2>Eksekusi: Persiapan Awal</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828940.png" alt="Checklist" class="page-img" />
  <ul>
    <li>🔍 Tentukan niche (produk bayi, fashion, gadget, dll)</li>
    <li>🛒 Pilih platform afiliasi (Tokopedia, Shopee, TikTok Shop)</li>
    <li>📱 Siapkan akun media sosial (TikTok, IG, YouTube Short)</li>
  </ul>
</div>
<div class="page" data-page="12">
  <h2>Eksekusi: Bulan 1</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/3159/3159310.png" alt="Content Start" class="page-img" />
  <ul>
    <li>🎥 Upload minimal 3 konten per minggu</li>
    <li>🧠 Fokus pada edukasi produk atau konten problem-solving</li>
    <li>📊 Coba 2-3 produk berbeda, lihat mana yang lebih menarik</li>
  </ul>
</div>

<div class="page" data-page="13">
  <h2>Eksekusi: Bulan 2</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/4090/4090388.png" alt="Grow Content" class="page-img" />
  <ul>
    <li>📈 Analisa performa video: jam tayang, klik link, sales</li>
    <li>🔁 Konsisten upload + mulai buat seri konten (contoh: #ReviewMurah)</li>
    <li>🤝 Interaksi rutin dengan penonton (balas komen, DM)</li>
  </ul>
</div>

<div class="page" data-page="14">
  <h2>Eksekusi: Bulan 3</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/4661/4661525.png" alt="Monetize" class="page-img" />
  <ul>
    <li>💰 Fokus produk paling laris (double down)</li>
    <li>🎯 Mulai kolaborasi dengan kreator lain</li>
    <li>📤 Promosikan link afiliasi di komentar, grup WA, Bio Link</li>
  </ul>
</div>
      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 14</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;
  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // ⬅️ INI WAJIB DIPANGGIL SETELAH KONTEN DIMUAT
}


if (page === 'contentcreator') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <!-- EDUKASI -->
        <div class="page active" data-page="1">
          <h2>Pengantar</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="Intro" class="page-img" />
          <p>Ingin jadi konten kreator sukses dalam 6 bulan? Panduan ini berisi langkah-langkah yang terstruktur untuk membantumu memulai, membangun audiens, dan menghasilkan uang dari kontenmu!</p>
        </div>

        <div class="page" data-page="2">
          <h2>Bab 1: Tentukan Niche</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3406/3406951.png" alt="Niche" class="page-img" />
          <p>Pilih topik yang kamu sukai: game, review, lifestyle, edukasi. Fokus pada 1 niche agar mudah membangun audiens dan branding.</p>
        </div>

        <div class="page" data-page="3">
          <h2>Bab 2: Riset Audiens</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2721/2721317.png" alt="Riset" class="page-img" />
          <p>Pelajari siapa target penontonmu. Gunakan TikTok Trends, YouTube Trending, Google Trends untuk tahu konten apa yang mereka suka.</p>
        </div>

        <div class="page" data-page="4">
          <h2>Bab 3: Produksi Konten</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3159/3159310.png" alt="Produksi" class="page-img" />
          <p>Gunakan HP dan cahaya alami. Edit pakai CapCut/VN. Buat video pendek, to the point, dan visual menarik.</p>
        </div>

        <div class="page" data-page="5">
          <h2>Bab 4: Konsistensi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Konsisten" class="page-img" />
          <p>Upload minimal 3x seminggu. Gunakan jadwal tetap. Semakin sering upload, makin besar peluang muncul di algoritma.</p>
        </div>

        <div class="page" data-page="6">
          <h2>Bab 5: Optimasi Sosial Media</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3293/3293815.png" alt="Sosial Media" class="page-img" />
          <p>Gunakan bio menarik, link tree, hashtag relevan, judul clickbait sehat, dan caption yang memancing interaksi.</p>
        </div>

        <div class="page" data-page="7">
          <h2>Bab 6: Monetisasi & Kolaborasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1087/1087929.png" alt="Monetisasi" class="page-img" />
          <p>Jika sudah punya audiens aktif, cari sponsor, endorse, atau afiliasi. Kolaborasi dengan kreator lain untuk menambah jangkauan.</p>
        </div>

        <!-- EKSEKUSI -->
        <div class="page" data-page="8">
          <h2>Eksekusi: Bulan 1–2</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2721/2721317.png" alt="Eksekusi1" class="page-img" />
          <ul>
            <li>🎯 Tentukan niche & nama akun</li>
            <li>📱 Produksi 10 video awal</li>
            <li>📅 Posting rutin (3-4 kali seminggu)</li>
          </ul>
        </div>

        <div class="page" data-page="9">
          <h2>Eksekusi: Bulan 3–4</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3079/3079166.png" alt="Eksekusi2" class="page-img" />
          <ul>
            <li>📊 Analisa performa konten</li>
            <li>📌 Fokus pada video yang perform</li>
            <li>🤝 Mulai kolaborasi kecil (duet, stitching)</li>
          </ul>
        </div>

        <div class="page" data-page="10">
          <h2>Eksekusi: Bulan 5–6</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1087/1087929.png" alt="Eksekusi3" class="page-img" />
          <ul>
            <li>💰 Ajukan diri untuk endorse</li>
            <li>🌐 Daftar ke affiliate platform</li>
            <li>📺 Bangun ciri khas kontenmu (signature style)</li>
          </ul>
        </div>

        <div class="page" data-page="11">
          <h2>Penutup</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3534/3534066.png" alt="Motivasi" class="page-img" />
          <p>Konten kreator sukses bukan hanya soal viral, tapi juga konsistensi dan keberanian mencoba. Kamu bisa mulai sekarang dan tumbuh pelan-pelan. Yang penting, jangan berhenti! 🚀🔥</p>
        </div>
      </div>

      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 11</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;
  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // ⬅️ INI WAJIB DIPANGGIL SETELAH KONTEN DIMUAT
}


if (page === 'personalbranding') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <!-- EDUKASI -->
        <div class="page active" data-page="1">
          <h2>Pengantar</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1484/1484815.png" class="page-img" alt="Brand Intro">
          <p>Personal Branding adalah kunci di era digital saat ini. Buku ini akan membimbingmu membangun citra dan identitas digital yang kuat, autentik, dan dipercaya audiensmu.</p>
        </div>

        <div class="page" data-page="2">
          <h2>Bab 1: Kenali Dirimu</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2641/2641034.png" class="page-img" alt="Self Discover">
          <p>Mulailah dari memahami siapa kamu, apa nilai kamu, passion, dan tujuanmu. Personal branding yang kuat berasal dari kejelasan jati diri.</p>
        </div>

        <div class="page" data-page="3">
          <h2>Bab 2: Tentukan Niche dan Audiens</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4359/4359764.png" class="page-img" alt="Niche">
          <p>Pilih satu topik utama yang kamu kuasai dan sukai. Kenali siapa target audiensmu, apa yang mereka butuhkan, dan bagaimana kamu bisa membantu mereka.</p>
        </div>

        <div class="page" data-page="4">
          <h2>Bab 3: Buat Konten Autentik</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11104/11104375.png" class="page-img" alt="Content">
          <p>Bangun konten yang menunjukkan keahlian dan kepribadianmu. Gunakan cerita pribadi, studi kasus, dan pengalaman nyata agar lebih relatable dan kuat.</p>
        </div>

        <div class="page" data-page="5">
          <h2>Bab 4: Konsistensi dan Visual Branding</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4212/4212885.png" class="page-img" alt="Visual Style">
          <p>Pakai warna, font, dan tone yang konsisten. Buat logo, foto profil, dan desain template yang mencerminkan branding-mu secara visual.</p>
        </div>

        <div class="page" data-page="6">
          <h2>Bab 5: Bangun Kredibilitas</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1684/1684460.png" class="page-img" alt="Trust">
          <p>Bagikan testimoni, pencapaian, atau kolaborasi. Aktif di komunitas, buat ebook, atau podcast agar orang melihatmu sebagai sosok berpengaruh di bidangmu.</p>
        </div>

        <div class="page" data-page="7">
          <h2>Bab 6: Evaluasi dan Adaptasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4019/4019485.png" class="page-img" alt="Evaluate">
          <p>Personal branding bukan hal statis. Evaluasi kontenmu, baca insight audiens, dan adaptasikan sesuai feedback dan perkembangan tren digital.</p>
        </div>

        <!-- EKSEKUSI -->
        <div class="page" data-page="8">
          <h2>Eksekusi: Minggu 1–2</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" class="page-img" alt="Plan">
          <ul>
            <li>🔍 Identifikasi keunikan, nilai, dan minat kamu</li>
            <li>📝 Tentukan niche & siapa audiens targetmu</li>
            <li>📷 Buat profil media sosial yang rapi dan profesional</li>
          </ul>
        </div>

        <div class="page" data-page="9">
          <h2>Eksekusi: Minggu 3–4</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3021/3021339.png" class="page-img" alt="Content">
          <ul>
            <li>🎥 Buat dan upload minimal 6 konten otentik</li>
            <li>🎨 Gunakan template visual branding konsisten</li>
            <li>💬 Balas semua komentar dan interaksi dari audiens</li>
          </ul>
        </div>

        <div class="page" data-page="10">
          <h2>Eksekusi: Bulan Kedua</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1388/1388431.png" class="page-img" alt="Growth">
          <ul>
            <li>📈 Evaluasi insight konten (reach, share, save)</li>
            <li>🤝 Bangun kolaborasi dengan kreator serupa</li>
            <li>📚 Tambah konten berbasis edukasi & pengalaman pribadi</li>
          </ul>
        </div>

        <div class="page" data-page="11">
          <h2>Penutup</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2011/2011108.png" class="page-img" alt="Finish">
          <p>Membangun personal branding adalah proses panjang. Tapi dengan langkah yang tepat, kamu bisa jadi sosok yang dipercaya, diingat, dan dicari. Tetap konsisten dan nikmati prosesnya ✨</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 11</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;
  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // ⬅️ INI WAJIB DIPANGGIL SETELAH KONTEN DIMUAT
}


if (page === 'jualcepat') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <!-- EDUKASI -->
        <div class="page active" data-page="1">
          <h2>Pengantar</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10080/10080794.png" alt="Intro Jual Cepat" class="page-img" />
          <p>Bingung gimana cara jualan online cepat laku? Di buku ini kamu akan belajar cara menjual barang apapun hanya dalam 3 menit dengan teknik storytelling, hook, dan call to action yang terbukti berhasil!</p>
        </div>

        <div class="page" data-page="2">
          <h2>Bab 1: Struktur 3 Menit</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8598/8598825.png" alt="Struktur 3 Menit" class="page-img" />
          <p>Bagi waktu 3 menit menjadi:<br>
          - 🧠 Menit 1: Masalah + Hook<br>
          - 🛠️ Menit 2: Solusi + Demo Produk<br>
          - 🎯 Menit 3: Bukti Sosial + CTA (Ajak beli)</p>
        </div>

        <div class="page" data-page="3">
          <h2>Bab 2: Menit 1 - Hook & Masalah</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9068/9068561.png" alt="Hook" class="page-img" />
          <p>Mulailah dengan pertanyaan atau pernyataan yang bikin penonton berhenti scroll:<br>
          - “Kamu sering capek nyapu rumah setiap hari?”<br>
          - “Skincare kamu nggak ngaruh juga?”</p>
        </div>

        <div class="page" data-page="4">
          <h2>Bab 3: Menit 2 - Solusi & Demo</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/5696/5696220.png" alt="Solusi" class="page-img" />
          <p>Tawarkan solusi langsung. Tunjukkan produknya, tampilkan cara pakainya, atau bandingkan dengan cara lama. Pastikan penonton melihat bahwa barangmu bisa membantu mereka.</p>
        </div>

        <div class="page" data-page="5">
          <h2>Bab 4: Menit 3 - Testimoni & Ajakan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2620/2620591.png" alt="CTA" class="page-img" />
          <p>Gunakan testimoni atau buktikan dari review pelanggan. Akhiri dengan CTA kuat:<br>
          - “Cuma hari ini diskon!”<br>
          - “Klik link bio sebelum kehabisan!”</p>
        </div>

        <!-- EKSEKUSI -->
        <div class="page" data-page="6">
          <h2>Eksekusi: Skenario Video</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2471/2471993.png" alt="Demo" class="page-img" />
          <p><strong>Produk:</strong> Vacuum Mini<br>
          - Menit 1: “Capek bersih-bersih manual tiap hari?”<br>
          - Menit 2: “Coba ini... Vacuum Mini Portable. Cuma 2 menit, debu langsung bersih!”<br>
          - Menit 3: “Sudah 5000+ orang pakai. Sekarang diskon 30%! Link di bio!”</p>
        </div>

        <div class="page" data-page="7">
          <h2>Eksekusi: Template Caption</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4108/4108884.png" alt="Caption" class="page-img" />
          <p><strong>Contoh Caption Jualan:</strong>\n
          "Capek nyapu setiap hari? 🚨 Coba vacuum mini ini!<br>
          ✅ Ringan & praktis<br>
          ✅ Harga di bawah 100rb<br>
          🎁 Promo cuma hari ini! Klik link bio sebelum habis!"</p>
        </div>

        <div class="page" data-page="8">
          <h2>Eksekusi: Check List Produksi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3940/3940083.png" alt="Checklist" class="page-img" />
          <ul>
            <li>📱 Siapkan HP dengan kamera bersih</li>
            <li>🎬 Rekam video 3 menit dengan struktur edukasi</li>
            <li>🧑‍💻 Edit cepat dengan CapCut (tambah teks & musik)</li>
            <li>📤 Upload ke TikTok/Reels jam prime time</li>
          </ul>
        </div>

        <div class="page" data-page="9">
          <h2>Penutup</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3534/3534066.png" alt="Akhir" class="page-img" />
          <p>Kunci jualan cepat adalah menyampaikan solusi dengan jelas dan cepat. Terapkan teknik ini secara konsisten, dan kamu bisa menjual produk apapun dengan percaya diri dalam waktu 3 menit!</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 9</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
`;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // ⬅️ INI WAJIB DIPANGGIL SETELAH KONTEN DIMUAT
}

if (page === 'roomwangi') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <!-- PAGE 1 -->
        <div class="page active" data-page="1">
          <h2>🔧 Langkah 1: Download Aplikasi OpenVPN</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/888/888879.png" alt="Download OpenVPN" class="page-img" />
          <p>Unduh aplikasi <strong>OpenVPN for Android</strong> melalui Google Play Store. Aplikasi ini digunakan untuk membuat koneksi VPN agar bisa mempengaruhi algoritma matchmaking Mobile Legends.</p>
        </div>

        <!-- PAGE 2 -->
        <div class="page" data-page="2">
          <h2>🔧 Langkah 2: Buat Config File</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2838/2838912.png" alt="Buat Config" class="page-img" />
          <p>Buka situs <a href="https://www.vpnjantit.com/free-openvpn" target="_blank">freeopenvpnserver</a> dari browser kamu. Pilih server seperti <strong>Philippines</strong> yang sering digunakan untuk Room Wangi.</p>
          <p>Klik tombol <em>“create username open VPN”</em>, masukkan username dan password. Setelah itu klik kembali tombol tersebut untuk membuat akun VPN.</p>
        </div>

        <!-- PAGE 3 -->
        <div class="page" data-page="3">
          <h2>🔧 Langkah 3: Unduh dan Import Config</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/633/633611.png" alt="Import ke OpenVPN" class="page-img" />
          <p>Setelah akun berhasil dibuat, klik “<strong>Download Config V2UDP 2500 OpenVPN</strong>”. File akan disimpan di folder Downloads.</p>
          <p>Buka aplikasi OpenVPN & klik tombol plus (+) oranye, pilih <strong>Browse</strong>, lalu cari file yang sudah diunduh dan klik "OK". Setelah itu tekan <strong>Connect</strong>.</p>
        </div>

        <!-- PAGE 4 -->
        <div class="page" data-page="4">
          <h2>🔧 Langkah 4: Gunakan Room Wangi di ML</h2>
	<img src="https://cdn-icons-png.flaticon.com/512/2769/2769339.png" alt="Matchmaking Mobile Legends" class="page-img" />
          <p>Buka aplikasi <strong>Mobile Legends</strong>. Masuk ke mode <strong>Brawl</strong> terlebih dahulu, lalu ubah ke mode <strong>Rank</strong>.</p>
          <p>Putuskan koneksi OpenVPN (Disconnect), lalu tunggu beberapa detik hingga ping stabil di lobby game.</p>
        </div>

        <!-- PAGE 5 -->
        <div class="page" data-page="5">
          <h2>🔧 Langkah 5: Konfirmasi Room Wangi Aktif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2210/2210151.png" alt="Ping Tinggi" class="page-img" />
          <p>Jika setelah disconnect, ping berubah-ubah lalu menjadi stabil (biasanya kuning atau merah awalnya), maka Room Wangi telah aktif. Ini akan meningkatkan peluangmu bertemu lawan yang lebih mudah.</p>
          <p>Kamu sekarang siap bermain Ranked dengan kondisi matchmaking yang lebih menguntungkan.</p>
        </div>
      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 5</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Penting: jalankan setelah konten dimuat
}

if (page === 'roombot') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>Pengenalan Room Bot Mobile Legends</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2618/2618579.png" alt="Room Bot" class="page-img" />
          <p>Room Bot adalah strategi untuk bermain melawan lawan yang dikendalikan oleh AI (bot), bukan pemain asli. Ini dimanfaatkan untuk menyelesaikan misi, push rank, atau farming dengan mudah. Salah satu caranya adalah menggunakan akun Returning Player sebagai host.</p>
        </div>

        <div class="page" data-page="2">
          <h2>Langkah 1: Gunakan Akun Tidak Aktif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/897/897188.png" alt="Akun Lama" class="page-img" />
          <p>Gunakan akun yang sudah tidak login selama minimal 15 hari. Setelah tidak aktif cukup lama, event <strong>"Returning Player"</strong> akan muncul, dan akun ini bisa memancing munculnya musuh bot saat membuat room.</p>
        </div>

        <div class="page" data-page="3">
          <h2>Langkah 2: Mainkan 2–3 Ranked Sebelum Dianggurkan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7331/7331332.png" alt="Ranked" class="page-img" />
          <p>Sebelum akun dianggurkan, mainkan terlebih dahulu 2–3 pertandingan ranked. Ini membantu sistem mencatat aktivitas akun. Setelah itu, biarkan tidak aktif selama 15 hari atau lebih.</p>
        </div>

        <div class="page" data-page="4">
          <h2>Langkah 3: Gunakan Akun Tier Rendah</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Tier Rendah" class="page-img" />
          <p>Akun dengan tier <strong>Warrior</strong> atau <strong>Elite</strong> lebih sering memunculkan lawan bot. Bot biasanya memakai hero seperti <em>Estes, Zilong, Alucard, Vexana, dan Lesley</em> serta tidak memiliki strategi tim yang baik.</p>
        </div>

        <div class="page" data-page="5">
          <h2>Langkah 4: Hindari Akun Tier Tinggi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4240/4240472.png" alt="Tier Tinggi" class="page-img" />
          <p>Jangan gunakan akun dengan tier <strong>Epic</strong>, <strong>Legend</strong>, atau di atasnya sebagai host. Ini akan meningkatkan kemungkinan kamu bertemu lawan asli, bukan bot.</p>
        </div>

        <div class="page" data-page="6">
          <h2>Langkah 5: Delay Start Room Sekitar 20 Detik</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8578/8578439.png" alt="Delay Start" class="page-img" />
          <p>Setelah membuat room, tunggu sekitar 20 detik sebelum menekan tombol "Start". Ini memberi sinyal sistem untuk mengisi lawan dengan bot, bukan pemain sungguhan.</p>
        </div>

        <div class="page" data-page="7">
          <h2>Langkah 6: Kenali Ciri Musuh Bot</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1580/1580179.png" alt="Bot Ciri" class="page-img" />
          <p>Lawan bot biasanya memilih hero sembarangan, tidak menggunakan skin, emblemnya acak, dan gaya mainnya aneh. Kamu bisa mengetahuinya saat loading screen atau awal permainan.</p>
        </div>

        <div class="page" data-page="8">
          <h2>Langkah 7: Hindari Server 5K</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Server" class="page-img" />
          <p>Beberapa server seperti <strong>5K (server Amerika)</strong> sering tidak memunculkan bot. Gunakan server lain seperti <strong>1K</strong>, <strong>2K</strong>, atau <strong>3K</strong> untuk hasil terbaik.</p>
        </div>

        <div class="page" data-page="9">
          <h2>Langkah 8: Batas dan Reset Pertandingan Bot</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828677.png" alt="Batas Harian" class="page-img" />
          <p>Satu akun hanya bisa mendapatkan maksimal <strong>5 pertandingan bot</strong> per hari. Namun, dengan trik tertentu, kamu bisa mendapatkan hingga <strong>10 pertandingan</strong> sehari.</p>
        </div>

        <div class="page" data-page="10">
          <h2>Langkah 9: Reset Mingguan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png" alt="Reset" class="page-img" />
          <p>Reset mingguan terjadi setiap <strong>Senin pukul 15:00 WIB</strong>. Setelah itu, kamu bisa menggunakan kembali akun yang sudah mencapai batas sebelumnya.</p>
        </div>

        <div class="page" data-page="11">
          <h2>Langkah 10: Gunakan Ulang Akun Bot</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2910/2910791.png" alt="Reuse" class="page-img" />
          <p>Akun host bot bisa digunakan berulang kali. Cukup tunggu 7 hari dan pastikan event Returning Player masih aktif, maka kamu bisa menggunakannya kembali untuk membuat room bot.</p>
        </div>

        <div class="page" data-page="12">
          <h2>Langkah 11: Atasi Batasan dengan Server 1K</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1008/1008140.png" alt="Bypass Server" class="page-img" />
          <p>Jika kamu sudah mencapai batas match bot, gunakan akun dari <strong>server 1K</strong> sebagai pembuat room (pinger). Server ini juga punya kelebihan lain seperti biaya WDP yang lebih murah dan bisa membantu bypass batas sistem matchmaking.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 12</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Penting: jalankan setelah konten dimuat
}

if (page === 'bugroomwangi') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>Pengenalan Bug Room Wangi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/5957/5957294.png" alt="Room Bug" class="page-img" />
          <p>Bug Room Wangi adalah trik untuk membuat sistem matchmaking Mobile Legends memunculkan musuh bot di mode Ranked. Dengan mengatur langkah-langkah khusus, kita bisa mengelabui sistem untuk mendapatkan musuh yang lebih mudah.</p>
        </div>

        <div class="page" data-page="2">
          <h2>Langkah 1: Tanpa VPN Aktif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10065/10065185.png" alt="No VPN" class="page-img" />
          <p>Mulai proses ini tanpa mengaktifkan VPN apapun. Tujuannya adalah menciptakan pola matchmaking alami sebelum sistem “dijebak”.</p>
        </div>

        <div class="page" data-page="3">
          <h2>Langkah 2: Masuk ke Mode Brawl</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7075/7075824.png" alt="Brawl Mode" class="page-img" />
          <p>Pilih mode <strong>Brawl</strong> di MLBB. Undang teman-teman untuk membuat party 5 orang. Jika waktu matchmaking lama (misalnya 3 menit), berarti bug mulai bekerja.</p>
        </div>

        <div class="page" data-page="4">
          <h2>Langkah 3: Mainkan 2 Match Brawl</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10280/10280460.png" alt="Match Brawl" class="page-img" />
          <p>Biarkan musuh menang dengan cepat. Tim kamu cukup tetap di base dan gunakan skill seperti Flame Shot ke arah musuh agar terdeteksi aktif. Catat durasi setiap pertandingan, karena penting untuk langkah selanjutnya.</p>
        </div>

        <div class="page" data-page="5">
          <h2>Langkah 4: Hubungkan ke VPN Pancingan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/897/897221.png" alt="VPN Pancingan" class="page-img" />
          <p>Hubungkan ke VPN Pancingan melalui OpenVPN:</p>
          <a href="https://www.vpnjantit.com/download-openvpn.php?server=in10" target="_blank" style="color:deepskyblue;">🔗 Unduh Config VPN Pancingan (in10)</a>
          <p>Buka MLBB hingga muncul notifikasi sistem, lalu kamu akan otomatis logout dari game.</p>
        </div>

        <div class="page" data-page="6">
          <h2>Langkah 5: Ganti ke VPN RW</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/897/897222.png" alt="VPN RW" class="page-img" />
          <p>Setelah keluar dari game, putuskan koneksi VPN Pancingan lalu sambungkan ke VPN RW:</p>
          <a href="https://www.vpnjantit.com/download-openvpn.php?server=indo4" target="_blank" style="color:limegreen;">🔗 Unduh Config VPN RW (indo4)</a>
          <p>Kemudian buka kembali MLBB seperti biasa.</p>
        </div>

        <div class="page" data-page="7">
          <h2>Langkah 6: Pindah Mode Brawl ke Ranked</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4265/4265623.png" alt="Pindah Mode" class="page-img" />
          <p>Setelah masuk MLBB, jangan langsung ke mode Ranked! Pertama-tama buka dulu mode <strong>Brawl</strong>, lalu langsung pindah ke mode <strong>Ranked</strong> tanpa keluar ke lobby utama.</p>
        </div>

        <div class="page" data-page="8">
          <h2>Langkah 7: Mulai Match Ranked</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4467/4467414.png" alt="Ranked Start" class="page-img" />
          <p>Undang teman ke dalam party jika perlu, lalu mulai pertandingan Ranked. Jika bug berhasil, waktu matchmaking akan singkat dan durasi match akan menyerupai durasi Brawl sebelumnya.</p>
        </div>

        <div class="page" data-page="9">
          <h2>Langkah Tambahan: Tes Jaringan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3215/3215426.png" alt="Tes Jaringan" class="page-img" />
          <p>Buka pengaturan jaringan di MLBB dan klik tes jaringan. Meskipun gagal karena VPN aktif, langkah ini kadang membantu memperkuat bug matchmaking.</p>
        </div>

        <div class="page" data-page="10">
          <h2>Hasil Akhir</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6099/6099835.png" alt="Hasil Room Wangi" class="page-img" />
          <p>Jika berhasil, kamu akan bertemu dengan musuh bot di Ranked. Cocok digunakan untuk push rank atau menyelesaikan misi harian dengan mudah.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 10</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Jalankan sistem buku
}

if (page === 'veo3') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>Pengenalan Google Veo 3</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11536/11536059.png" alt="Veo 3" class="page-img" />
          <p>Google Veo 3 adalah teknologi AI terbaru dari Google yang memungkinkan pengguna membuat video animasi hanya dengan mengetikkan prompt (perintah teks). Fitur ini bisa diakses lewat <strong>Gemini Pro</strong> dengan bantuan VPN.</p>
        </div>

        <div class="page" data-page="2">
          <h2>Langkah 1: Buka Chrome & Login ke Gemini</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3050/3050247.png" alt="Gemini Pro" class="page-img" />
          <p>Buka Google Chrome dan masuk ke situs <a href="https://gemini.google.com/" target="_blank" style="color:deepskyblue;">Gemini Google</a>. Pastikan kamu sudah login dengan akun Google aktif untuk bisa mengakses semua fitur AI dari Google.</p>
        </div>

        <div class="page" data-page="3">
          <h2>Langkah 2: Instal VPN Browser</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4152/4152530.png" alt="VPN" class="page-img" />
          <p>Ketik "Browsec VPN Chrome" di Google, lalu tambahkan ekstensi tersebut ke browser Chrome kamu. VPN ini diperlukan karena fitur Veo 3 hanya bisa diakses dari wilayah Amerika Serikat.</p>
        </div>

        <div class="page" data-page="4">
          <h2>Langkah 3: Aktifkan VPN ke Server Amerika</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3944/3944519.png" alt="US VPN" class="page-img" />
          <p>Klik ikon Browsec di pojok kanan atas browser → Pilih lokasi <strong>United States</strong> → Klik "ON". Sekarang kamu dianggap berasal dari wilayah AS oleh sistem Google.</p>
        </div>

        <div class="page" data-page="5">
          <h2>Langkah 4: Refresh Halaman Gemini</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/190/190406.png" alt="Refresh" class="page-img" />
          <p>Setelah VPN aktif, kembali ke halaman <strong>Gemini</strong> dan tekan tombol refresh. Jika berhasil, fitur <strong>Veo 3</strong> akan muncul dan kamu bisa mulai membuat video AI.</p>
        </div>

        <div class="page" data-page="6">
          <h2>Langkah 5: Mulai Buat Video AI</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6822/6822107.png" alt="Video AI" class="page-img" />
          <p>Ketik prompt (perintah teks) untuk menggambarkan isi video yang kamu inginkan. Kamu juga bisa menambahkan opsi seperti:</p>
          <ul>
            <li>🎤 Narasi (text-to-speech)</li>
            <li>🎵 Musik latar</li>
            <li>🗣️ Sinkronisasi bibir (lip-sync) untuk karakter AI</li>
          </ul>
          <p>Veo akan otomatis menambahkan musik jika narasi tidak digunakan.</p>
        </div>

         <div class="page" data-page="7">
          <h2>Contoh Prompt 1: Edukasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7023/7023451.png" alt="Edukasi" class="page-img" />
          <p><strong>Prompt:</strong></p>
          <pre id="prompt1" class="prompt-box">Buat video animasi berdurasi 30 detik tentang pentingnya menjaga kesehatan mental remaja. Gunakan gaya visual seperti kartun sekolah, karakter pelajar, dan narasi suara perempuan yang tenang.</pre>
          <button onclick="salinPrompt('prompt1')" class="copy-btn">📋 Salin Prompt</button>
        </div>

        <div class="page" data-page="8">
          <h2>Contoh Prompt 2: Promosi Produk</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11479/11479017.png" alt="Promosi" class="page-img" />
          <p><strong>Prompt:</strong></p>
          <pre id="prompt2" class="prompt-box">Buat video iklan animasi selama 45 detik untuk produk kopi dingin ‘Chill Brew’. Gunakan animasi kafe modern, gaya visual minimalis, musik jazz lembut, dan narasi maskulin yang hangat.</pre>
          <button onclick="salinPrompt('prompt2')" class="copy-btn">📋 Salin Prompt</button>
        </div>

        <div class="page" data-page="9">
          <h2>Contoh Prompt 3: Cerita Pendek</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9010/9010185.png" alt="Cerita" class="page-img" />
          <p><strong>Prompt:</strong></p>
          <pre id="prompt3" class="prompt-box">Buat video animasi cerita pendek tentang seekor rubah kecil yang tersesat di hutan ajaib. Gunakan suasana visual fantasi, efek suara alam, dan narasi anak-anak ceria selama 1 menit.</pre>
          <button onclick="salinPrompt('prompt3')" class="copy-btn">📋 Salin Prompt</button>
        </div>

        <div class="page" data-page="10">
          <h2>Penutup: Tips Tambahan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3534/3534033.png" alt="Tips" class="page-img" />
          <p>Gunakan prompt yang jelas dan visual detail. Semakin spesifik perintah kamu, semakin bagus hasil video yang dihasilkan. Jangan lupa eksplorasi efek, musik, dan karakter unik!</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 10</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'tipscopywriting') { 
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Teknik Copywriting untuk Jualan Produk Digital</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1041/1041880.png" alt="Copywriting Book" class="page-img" />
          <p><strong>Kategori:</strong> Marketing</p>
          <p><strong>Deskripsi:</strong> Teknik copywriting untuk jualan produk digital</p>
          <p>Copywriting adalah seni menulis untuk menjual. Dalam dunia digital, copy yang efektif bisa menjadi pembeda antara produk yang laris dan yang sepi peminat.</p>
        </div>

        <div class="page" data-page="2">
  <h2>📌 Bab 1: Peran Copywriting dalam Penjualan Digital</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/3767/3767095.png" alt="Digital Sales" class="page-img" />
  <p>Produk digital tidak bisa diraba. Maka, kata-kata menjadi 'produk' pertama yang dilihat calon pembeli. Copywriting yang kuat mampu membangun kepercayaan.</p>
  <br>
  <h4>Contoh:</h4>
  <p>Periksa caption, deskripsi, dan landing page Anda. Apakah cukup meyakinkan untuk membuat orang membeli tanpa ragu?</p>
</div>

<div class="page" data-page="3">
  <h2>📌 Bab 2: Kenali Audiens Anda</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/1256/1256650.png" alt="Target Audience" class="page-img" />
  <p>Copywriting yang bagus selalu dimulai dengan memahami siapa yang akan membaca. Usia, masalah, dan keinginan mereka menentukan gaya bahasa yang digunakan.</p>
  <br>
  <h4>Contoh:</h4>
  <p>Buat profil audiens Anda: umur, pekerjaan, impian, masalah utama. Lalu tulis copy seolah Anda sedang bicara langsung dengan mereka.</p>
</div>

<div class="page" data-page="4">
  <h2>📌 Bab 3: Gunakan Formula AIDA</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/2857/2857394.png" alt="AIDA Formula" class="page-img" />
  <p>Formula AIDA (Attention, Interest, Desire, Action) adalah struktur dasar copywriting. Ini membantu mengarahkan pembaca dari rasa penasaran hingga pembelian.</p>
  <br>
  <h4>Contoh:</h4>
  <p>"Punya Masalah Desain? Kami Punya Solusinya! 100+ Template Siap Pakai - Download Sekarang!"</p>
</div>

<div class="page" data-page="5">
  <h2>📌 Bab 4: Judul yang Menjual</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/3416/3416048.png" alt="Headline" class="page-img" />
  <p>Judul (headline) adalah 80% dari kekuatan copy. Jika judul gagal menarik, isi konten tidak akan dibaca.</p>
  <br>
  <h4>Contoh:</h4>
  <p>"5 Rahasia Copywriting yang Membuat Produk Digitalmu Laris!"</p>
</div>

<div class="page" data-page="6">
  <h2>📌 Bab 5: Fokus pada Manfaat, Bukan Fitur</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/3649/3649469.png" alt="Features vs Benefits" class="page-img" />
  <p>Pembeli tidak peduli seberapa canggih produk Anda, mereka peduli bagaimana itu menyelesaikan masalah mereka.</p>
  <br>
  <h4>Contoh:</h4>
  <p>Ubah kalimat “Produk ini memiliki 10 modul video” menjadi “Pelajari teknik rahasia dalam 10 modul singkat tanpa buang waktu.”</p>
</div>

<div class="page" data-page="7">
  <h2>📌 Bab 6: Buat CTA yang Kuat</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/2784/2784460.png" alt="Call to Action" class="page-img" />
  <p>CTA (Call-to-Action) adalah instruksi kepada audiens untuk melakukan sesuatu. CTA yang lemah akan membuat pembeli ragu.</p>
  <br>
  <h4>Contoh:</h4>
  <p>Ganti “Klik di sini” dengan “Download Sekarang & Mulai Hasilkan Uang dari Rumah!”</p>
</div>

<div class="page" data-page="8">
  <h2>📌 Bab 7: Bangun Urgensi dan Kelangkaan</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/6824/6824446.png" alt="Urgency" class="page-img" />
  <p>Urgensi dan kelangkaan memicu FOMO (Fear of Missing Out). Ini mempercepat keputusan pembelian.</p>
  <br>
  <h4>Contoh:</h4>
  <p>Tambahkan elemen seperti “Tersisa 10 slot lagi” atau “Promo hanya berlaku hari ini”.</p>
</div>

<div class="page" data-page="9">
  <h2>📌 Bab 8: Bukti Sosial dan Testimoni</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/3771/3771403.png" alt="Testimonials" class="page-img" />
  <p>Calon pembeli lebih percaya review dari orang lain dibanding klaim Anda sendiri.</p>
  <br>
  <h4>Contoh:</h4>
  <p>Kumpulkan 3 testimoni pengguna dan tampilkan di bagian tengah landing page Anda.</p>
</div>

<div class="page" data-page="10">
  <h2>📌 Penutup: Latihan Menjadikan Copy Anda Tajam</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/3281/3281306.png" alt="Practice Writing" class="page-img" />
  <p>Copywriting adalah skill yang terus diasah. Semakin sering Anda menulis dan menguji hasilnya, semakin tajam insting jualan Anda.</p>
  <br>
  <h4>Contoh:</h4>
  <p>Buat 3 versi copy berbeda untuk satu produk, uji mana yang hasilkan klik terbanyak, lalu optimalkan versi terbaiknya.</p>
</div>


      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 10</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'idekonten1tahun') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Ide Konten 1 Tahun Penuh</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1043/1043439.png" alt="Content Ideas" class="page-img" />
          <p><strong>Kategori:</strong> Konten & Strategi Kreator</p>
          <p><strong>Deskripsi:</strong> Panduan lengkap berisi ide konten selama 365 hari (1 tahun), dibagi per bulan & tema mingguan. Cocok untuk kreator pemula hingga expert yang ingin konsisten tanpa kehabisan inspirasi.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Januari – Bangun Awal yang Kuat</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4714/4714762.png" alt="January Ideas" class="page-img" />
          <p>Fokus pada resolusi, perkenalan brand, dan konten motivasi awal tahun. Bangun koneksi dengan audiens.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Tujuan utama brand kamu tahun ini apa?” → Buat konten reels atau carousel target brand kamu di 2025.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Februari – Cinta, Branding, dan Relasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10440/10440592.png" alt="February Ideas" class="page-img" />
          <p>Bulan penuh cinta. Fokus pada konten yang membangun kedekatan, testimoni, dan pengalaman personal dengan produk.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat konten “Kenapa aku jatuh cinta sama produk ini?” dengan gaya storytelling personal.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Maret – Edukasi dan Tutorial</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3589/3589443.png" alt="March Content" class="page-img" />
          <p>Gunakan bulan ini untuk berbagi tips, tutorial singkat, dan konten edukatif seputar produk/layanan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Cara menggunakan fitur X hanya dalam 2 menit” → Cocok untuk reels atau konten swipe carousel.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: April – Cerita dan Empati</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9469/9469200.png" alt="April Empathy" class="page-img" />
          <p>Fokuskan pada cerita struggle, proses, dan perjalanan kamu atau customer agar audiens merasa relate dan terhubung.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Ceritakan “Perjuangan pertama kali bangun usaha dari nol” dengan foto/video lawas dan transisi ke saat ini.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Mei – Rayakan Pencapaian & Momen</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3259/3259781.png" alt="May Celebration" class="page-img" />
          <p>Bulan yang cocok untuk highlight pencapaian Q1, ulang tahun brand, behind the scene tim, atau ucapan terima kasih ke audiens.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat video kompilasi: “Inilah yang sudah kita capai bersama selama 5 bulan terakhir. Terima kasih 🎉”</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Juni – Interaktif dan Kolaborasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7321/7321230.png" alt="June Collaboration" class="page-img" />
          <p>Gunakan fitur polling, Q&A, live, dan kolaborasi dengan kreator lain. Tujuannya: membangun engagement & audiens baru.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Kalian lebih suka produk A atau B?” → Gunakan fitur polling di story atau komentar untuk voting interaktif.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Juli – Refresh dan Edukasi Ulang</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3242/3242252.png" alt="July Education" class="page-img" />
          <p>Kembangkan ulang konten lama menjadi konten baru (recycle content), update info, dan evaluasi konten yang berhasil.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Ambil konten dari Januari yang perform-nya tinggi → ubah menjadi video reels dengan format terbaru.</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bab 8: Agustus – Nasionalisme & Branding Lokal</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11685/11685263.png" alt="August National" class="page-img" />
          <p>Manfaatkan momen 17 Agustus untuk membangun koneksi emosional dengan audiens lokal melalui nilai kebersamaan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat konten dengan tema “Semangat Merdeka Bangun Bisnis Lokal” lengkap dengan bendera & musik Indonesia.</p>
        </div>

<div class="page" data-page="10">
  <h2>📌 Bab 9: September – Edukasi Lanjutan & Testimoni</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/4451/4451060.png" alt="September Content" class="page-img" />
  <p>Gunakan konten yang mengedukasi lebih dalam, dan tampilkan testimoni atau kisah sukses dari pengguna produk/jasa kamu.</p>
  <br>
  <h4>Contoh:</h4>
  <p>“Aku coba teknik ini dari Juli lalu, dan hasilnya 3x lipat dari bulan sebelumnya!”</p>
</div>

<div class="page" data-page="11">
  <h2>📌 Bab 10: Oktober – Humor & Awareness</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/10172/10172042.png" alt="October Content" class="page-img" />
  <p>Gunakan humor, meme, dan konten ringan untuk membangun awareness menjelang akhir tahun.</p>
  <br>
  <h4>Contoh:</h4>
  <p>“Mood akhir tahun itu kayak: (insert meme relatable) + CTA ke produk atau layanan kamu.”</p>
</div>

<div class="page" data-page="12">
  <h2>📌 Bab 11: November – Promo & Strategi Penawaran</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/6491/6491573.png" alt="November Promo" class="page-img" />
  <p>Manfaatkan momen Harbolnas, Black Friday, dll. Buat konten yang mengajak audiens segera ambil penawaran terbaik.</p>
  <br>
  <h4>Contoh:</h4>
  <p>“Cuma 3 hari, dapatkan 3 e-book premium hanya Rp50rb! Swipe up/link di bio ya!”</p>
</div>

<div class="page" data-page="13">
  <h2>📌 Bab 12: Desember – Evaluasi & Resolusi</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/5663/5663078.png" alt="December Summary" class="page-img" />
  <p>Desember adalah waktu terbaik untuk refleksi, rekap momen terbaik, dan membuat konten resolusi 2026.</p>
  <br>
  <h4>Contoh:</h4>
  <p>“Tahun ini kami tumbuh bersama kamu. Inilah perjalanan kita... (insert recap video)”</p>
</div>


      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 13</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'fyptiktok2025') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Strategi FYP TikTok 2025</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3046/3046120.png" alt="TikTok Strategy" class="page-img" />
          <p><strong>Kategori:</strong> Konten Kreator & Viral Marketing</p>
          <p><strong>Deskripsi:</strong> Panduan terbaru agar konten kamu masuk FYP TikTok di tahun 2025. Dilengkapi strategi algoritma baru, jenis konten viral, dan formula engagement tinggi.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Memahami Algoritma TikTok 2025</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png" alt="TikTok Algo" class="page-img" />
          <p>Algoritma 2025 fokus pada durasi tonton, interaksi awal, dan relevansi konten. 3 detik pertama video sangat menentukan apakah kontenmu diteruskan ke FYP.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat pembuka video yang langsung menyentuh masalah audiens: "Capek kerja gak ada hasil? Coba ini deh..."</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Format Konten Viral 2025</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1034/1034127.png" alt="Content Format" class="page-img" />
          <p>Gunakan format storytelling, tutorial cepat, before-after, dan behind the scene. Durasi optimal: 7–25 detik.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat konten "Sebelum vs Sesudah" menggunakan produk kamu dalam 10 detik. Tambahkan caption “No Filter!”.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: 3 Detik Pertama Menentukan!</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9456/9456967.png" alt="3 Seconds Rule" class="page-img" />
          <p>Hook awal harus membuat orang berhenti scroll. Gunakan teks besar, mimik wajah kuat, dan ekspresi kejut.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan teks: “Cuma modal HP bisa dapet Rp500rb/Hari! Caranya?” sambil tunjuk layar dengan ekspresi serius.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Jam Upload Terbaik di 2025</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3030/3030179.png" alt="Upload Timing" class="page-img" />
          <p>Prime time FYP: Pagi (06.00–08.00), Siang (11.30–13.00), Malam (19.00–22.00). Konsistensi jauh lebih penting dari jumlah video.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Posting setiap hari jam 07.30 + 1 video tambahan jam 20.00 jika ada video yang trending.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Hashtag & Caption Efektif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9696/9696473.png" alt="Hashtag & Caption" class="page-img" />
          <p>Gunakan hashtag mix: niche + relevansi + viral. Caption singkat dan provokatif.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Hashtag: #belajardigital #fyp2025 #carajualan  
          Caption: “Ini yang bikin jualanku makin laris…”</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Musik & Tren Audio 2025</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7999/7999830.png" alt="Trending Sound" class="page-img" />
          <p>Gunakan audio trending 7 hari terakhir. Cek dari library TikTok dan lihat top sound di akun kreator sejenis.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan audio viral yang muncul di 5 video teratas saat cari “bisnis online” di TikTok.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Interaksi & Call to Action</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3259/3259784.png" alt="Engagement" class="page-img" />
          <p>Ajak audiens komentar, share, atau simpan video. Hindari “jualan langsung” di video pertama.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Akhiri video dengan: “Setuju gak? Komen pendapatmu ya 👇” atau “Kalau mau part 2, klik simpan dulu!”</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bab 8: Konsistensi & Evaluasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10433/10433692.png" alt="Consistency" class="page-img" />
          <p>Jadwalkan konten harian dan evaluasi mana yang perform. Konsisten 30 hari bisa menaikkan akunmu 10x lebih cepat.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan format: Hari 1–3 edukasi, Hari 4 testimoni, Hari 5 humor/relatable, dan ulangi siklus.</p>
        </div>

        <div class="page" data-page="10">
          <h2>📌 Penutup: Bangun Audiens, Bukan Sekadar Viral</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3595/3595455.png" alt="Audience Building" class="page-img" />
          <p>FYP hanyalah awal. Fokus jangka panjang adalah membangun audiens loyal yang menanti konten dan siap beli produkmu.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Selipkan value di setiap video & sapa followers lama dengan “Buat kamu yang udah follow aku dari awal, ini dia update terbarunya!”</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 10</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'masterinstagram') { 
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Master Instagram Growth</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4139/4139974.png" alt="Instagram Growth" class="page-img" />
          <p><strong>Kategori:</strong> Media Sosial & Branding</p>
          <p><strong>Deskripsi:</strong> Panduan lengkap menumbuhkan akun Instagram dari nol, memanfaatkan algoritma, konten, dan teknik monetisasi terkini.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Fundamental Instagram</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/725/725278.png" alt="Instagram Basics" class="page-img" />
          <p>Pelajari jenis konten Instagram (feed, story, reels, guides) dan cara kerja algoritma terkini untuk meningkatkan reach dan interaksi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan kombinasi Reels 3x seminggu, Story harian, dan Feed carousel edukatif minimal 2x seminggu untuk mempercepat pertumbuhan reach.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Optimasi Profil</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1250/1250689.png" alt="Profile Optimization" class="page-img" />
          <p>Tips membuat bio yang menarik, memilih username profesional, hingga mengatur link & CTA yang membuat orang tertarik follow atau klik.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Bio: “💼 Konsultan Bisnis Online | 🎯 Bantu UMKM Naik Omzet | 📩 DM untuk kerjasama”</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Strategi Konten Viral</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3400/3400685.png" alt="Viral Content" class="page-img" />
          <p>Rumus membuat konten viral: pola storytelling, tren musik reels, serta tips caption yang memicu interaksi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan caption “Yang gini pernah kamu alami juga nggak?” untuk mengajak interaksi, ditambah musik trend dan teks besar di awal video.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Riset Hashtag dan Explore Page</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3669/3669676.png" alt="Hashtag Strategy" class="page-img" />
          <p>Belajar memilih hashtag yang sesuai dengan niche dan target audience untuk memperluas jangkauan tanpa biaya iklan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan kombinasi hashtag seperti #bisnisonline #belajardigital #tipsinstagram (niche + audiens target + konten edukasi).</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Teknik Growth Hack Organik</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3464/3464397.png" alt="Growth Strategy" class="page-img" />
          <p>Gunakan kolaborasi, shoutout, dan giveaway untuk mempercepat pertumbuhan akun tanpa melanggar kebijakan Instagram.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kolaborasi: Buat live IG bareng akun sejenis lalu simpan sebagai video reels. Keduanya dapat jangkauan baru dari follower masing-masing.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Analisis dan Instagram Insight</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4149/4149573.png" alt="Insight & Analytics" class="page-img" />
          <p>Cara membaca insight: reach, impression, save, dan profile visit. Gunakan data ini untuk mengatur ulang strategi konten.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Jika Reels kamu mendapat banyak saves, ulangi pola kontennya. Jika reach rendah, ubah opening 3 detik pertama agar lebih menarik.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Monetisasi Akun Instagram</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6107/6107164.png" alt="Monetization" class="page-img" />
          <p>Buka peluang pendapatan dari paid promote, jualan produk, affiliate, atau menjadi micro-influencer untuk brand tertentu.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Tawarkan jasa promosi ke UMKM lokal setelah akun kamu tembus 3.000 followers dengan engagement bagus (like + komen aktif).</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bonus: Template & Tools</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Bonus Material" class="page-img" />
          <p>✅ Template Jadwal Posting  
          ✅ 50+ Ide Konten Harian  
          ✅ Format Caption Copywriting (AIDA, PAS, Story)</p>
          <br>
          <h4>Contoh:</h4>
          <p>Ide konten: “3 Hal yang Harus Kamu Hindari Saat Posting di Instagram Jam 12 Siang!”</p>
        </div>

        <div class="page" data-page="10">
          <h2>📌 Penutup: Konsistensi adalah Kunci</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10433/10433791.png" alt="Consistency" class="page-img" />
          <p>Pertumbuhan akun bukan hasil semalam. Dengan strategi dan konsistensi, akun Anda bisa berkembang menjadi aset digital bernilai tinggi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Komitmen 30 hari konten rutin (1 reels + 1 story + 1 feed per minggu) → Lacak hasilnya dan review strategi mingguan.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 10</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'dapatklienfreelance') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Cara Dapet Klien Freelance</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2920/2920285.png" alt="Freelance Client" class="page-img" />
          <p><strong>Kategori:</strong> Freelancing & Karier</p>
          <p><strong>Deskripsi:</strong> Panduan lengkap langkah demi langkah untuk mendapatkan klien pertama (dan selanjutnya) sebagai freelancer pemula. Cocok untuk desainer, penulis, editor video, dan jasa digital lainnya.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Tentukan Keahlian dan Layanan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2520/2520353.png" alt="Skills" class="page-img" />
          <p>Langkah pertama adalah tahu apa yang ingin kamu jual. Tentukan 1–2 layanan utama yang kamu kuasai, misalnya desain feed Instagram atau video editing TikTok.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Saya menyediakan jasa desain feed Instagram untuk UMKM, dengan gaya clean dan profesional.”</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Buat Portofolio Menarik</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10746/10746024.png" alt="Portfolio" class="page-img" />
          <p>Portofolio adalah bukti kemampuanmu. Buat minimal 3–5 contoh hasil kerja yang relevan, bisa dummy (fiktif) atau real.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan Canva atau Behance untuk buat tampilan portofolio desain. Buat 3 desain feed IG untuk brand fiktif.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Optimalkan Profil Sosial Media</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9131/9131432.png" alt="Social Profile" class="page-img" />
          <p>Gunakan bio Instagram, TikTok, atau LinkedIn untuk menjelaskan siapa kamu dan jasa apa yang ditawarkan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“👨‍🎨 Desain Feed IG • Jasa Konten UMKM | Portofolio: bit.ly/portovicky”</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Mulai dari Inner Circle</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7653/7653774.png" alt="Inner Circle" class="page-img" />
          <p>Promosikan ke teman, saudara, dan kenalan terdekat dulu. Klien pertama sering kali datang dari lingkaran pribadi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kirim chat: “Aku baru buka jasa desain feed IG, kalau ada teman yang butuh, kabarin ya. Harga promo nih.”</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Aktif di Grup Freelance dan Forum</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9746/9746776.png" alt="Group Forum" class="page-img" />
          <p>Gabung grup Telegram, Facebook, atau Discord yang membahas freelance. Sering ada orang post butuh jasa desain, penulis, dll.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Cari grup seperti “Freelance Indonesia” → aktif bantu jawab & tawarkan portofolio saat ada yang butuh jasa.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Gunakan Marketplace Freelance</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10934/10934849.png" alt="Freelance Site" class="page-img" />
          <p>Daftar di Sribulancer, Projects.co.id, Fiverr, Upwork, dll. Tawarkan jasa kamu di sana secara konsisten.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat gig: “Saya akan membuat desain feed IG profesional untuk bisnis kamu – hanya Rp50.000/postingan.”</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Bangun Kredibilitas dan Testimoni</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/5274/5274299.png" alt="Testimonial" class="page-img" />
          <p>Setelah dapat klien, minta izin untuk menampilkan hasil kerja dan minta testimoni sebagai bukti sosial.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Desainnya kece banget, bikin akun IG aku naik engagement. Recommended!” – Testimoni dari klien pertama</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bab 8: Konsisten Bangun Personal Branding</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7177/7177476.png" alt="Branding" class="page-img" />
          <p>Bangun personal branding di media sosial. Posting seputar proses kerja, hasil desain, tips, dan cerita proyek.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Posting: “Project terbaru untuk brand lokal skincare. Fokus clean & feminin. Swipe buat lihat before-after!”</p>
        </div>

        <div class="page" data-page="10">
          <h2>📌 Penutup: Jangan Takut Ditolak</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9524/9524701.png" alt="Never Give Up" class="page-img" />
          <p>Ditolak itu biasa. Terus coba, terus tawarkan. Freelance butuh waktu, relasi, dan konsistensi untuk berkembang.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Targetkan: 3 tawaran/hari. Kalau 10 orang tolak, mungkin 1 orang deal. Terus ulangi sampai konsisten dapat klien.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 10</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'mindsetdigitalcuan') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Mindset Digital Cuan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6174/6174962.png" alt="Digital Cuan" class="page-img" />
          <p><strong>Kategori:</strong> Mindset & Digital Growth</p>
          <p><strong>Deskripsi:</strong> Sebelum sukses di dunia digital, hal pertama yang harus dibenahi adalah pola pikir. E-book ini membahas 7 mindset penting untuk bertahan, berkembang, dan menghasilkan cuan dari dunia digital.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Digital Adalah Maraton, Bukan Sprint</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4601/4601996.png" alt="Long Game" class="page-img" />
          <p>Kesuksesan di dunia digital tidak terjadi semalam. Dibutuhkan konsistensi, eksperimen, dan adaptasi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu posting konten edukasi tiap hari selama 30 hari. Awalnya sepi, tapi di hari ke-25 satu video viral dan followers naik 10K.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Konten Adalah Aset Digital</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4149/4149755.png" alt="Digital Asset" class="page-img" />
          <p>Setiap konten yang kamu buat adalah investasi. Semakin banyak aset kamu, semakin besar peluang cuan datang dari berbagai arah.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Video YouTube yang kamu upload hari ini mungkin baru menghasilkan 3 bulan lagi lewat AdSense atau endorse.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Jangan Jualan, Tapi Tawarkan Solusi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11875/11875724.png" alt="Solution" class="page-img" />
          <p>Orang tidak suka dijualin, tapi suka dibantu. Posisikan produk/jasa kamu sebagai solusi dari masalah mereka.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Alih-alih berkata “Beli e-book ini”, ubah jadi “Kalau kamu bingung mulai freelance, ini panduan langkah awalnya.”</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Uang Datang ke Orang yang Konsisten</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8578/8578194.png" alt="Consistency" class="page-img" />
          <p>Kesuksesan digital lebih sering datang dari konsistensi, bukan dari keberuntungan. Orang yang muncul terus akan diingat.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu upload konten TikTok tiap hari selama 3 bulan. Meskipun awalnya tidak viral, kamu mulai dikenal dan diajak kolaborasi brand.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Value Dulu, Baru Profit</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7584/7584305.png" alt="Give Value" class="page-img" />
          <p>Memberi value (edukasi, hiburan, inspirasi) akan membuat orang loyal. Profit adalah efek samping dari value yang kamu berikan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu rutin berbagi tips desain di Instagram. Setelah 2 bulan, banyak followers mulai DM untuk jasa desain berbayar.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Kuasai 1 Skill, Lalu Kembangkan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2404/2404292.png" alt="Skill Focus" class="page-img" />
          <p>Fokus menguasai satu skill utama dulu sebelum menyebar ke banyak hal. Spesialisasi lebih cepat menghasilkan daripada generalisasi di awal.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu kuasai video editing dulu. Setelah lancar, baru pelajari copywriting dan marketing untuk menunjang jasa kamu.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Personal Branding Adalah Mata Uang Baru</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6911/6911736.png" alt="Personal Branding" class="page-img" />
          <p>Di era digital, orang beli karena percaya. Bangun nama, kehadiran, dan kepribadian yang kuat di platform digital.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Bio: “Aku bantu UMKM naik kelas lewat desain feed yang profesional.” → orang akan tahu kamu siapa dan apa keahlianmu.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'hookctaviral') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Rahasia Hook & CTA Viral</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10873/10873637.png" alt="Hook CTA" class="page-img" />
          <p><strong>Kategori:</strong> Content Strategy & Copywriting</p>
          <p><strong>Deskripsi:</strong> Ingin konten kamu viral? Rahasianya ada di kalimat pembuka (hook) dan penutup (CTA). E-book ini membahas struktur, jenis, dan contoh nyata hook & CTA yang terbukti viral.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Pentingnya Hook di 3 Detik Pertama</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4585/4585064.png" alt="Hook Start" class="page-img" />
          <p>Hook adalah kalimat atau visual pembuka yang menentukan apakah audiens akan lanjut menonton atau scroll. Hook yang kuat = perhatian langsung!</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Jangan lakukan ini kalau kamu masih pemula desain!” — kalimat ini memicu rasa penasaran dan mendorong audiens lanjut menonton.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Jenis Hook Paling Efektif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2874/2874015.png" alt="Hook Types" class="page-img" />
          <p>Hook bisa dalam bentuk pertanyaan, pernyataan mengejutkan, data unik, cerita pribadi, atau ancaman kerugian (fear-based).</p>
          <br>
          <h4>Contoh:</h4>
          <ul>
            <li>❓ Pertanyaan: “Pernah ngerasa kerja capek tapi duit nggak cukup?”</li>
            <li>⚠️ Fear-based: “90% kreator gagal karena ini.”</li>
            <li>📊 Data: “87% orang nggak tahu fitur rahasia ini di Canva.”</li>
          </ul>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Struktur Hook yang Menarik</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11665/11665617.png" alt="Hook Structure" class="page-img" />
          <p>Struktur hook yang efektif: <strong>Emosi → Masalah → Pancingan Solusi.</strong> Audiens harus merasa, “Ini tentang gue banget!”</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Dulu aku ngerasa bodoh tiap ngedit video…” → bikin relate → “Sampai aku nemu cara ini (lihat hasilnya)” → bangkitkan penasaran.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: CTA yang Mengubah Viewer Jadi Aksi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2784/2784460.png" alt="CTA" class="page-img" />
          <p>CTA (Call to Action) adalah bagian penutup yang memberi instruksi. Tanpa CTA, audiens bingung harus ngapain. Jangan biarkan mereka scroll begitu saja!</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Klik link bio buat dapetin semua template ini.” atau “Comment ‘YES’ kalau kamu mau tutorial lengkapnya.”</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Pola CTA yang Terbukti Viral</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/13121/13121340.png" alt="CTA Viral" class="page-img" />
          <p>Gunakan variasi CTA yang mendorong interaksi: komentar, share, save, klik, DM. Kata-katanya harus emosional dan jelas.</p>
          <br>
          <h4>Contoh:</h4>
          <ul>
            <li>💬 Komentar: “Pernah ngalamin ini juga? Cerita di bawah!”</li>
            <li>🔗 Klik: “Semua tool gratis aku simpan di bio.”</li>
            <li>📥 Save: “Simpan dulu biar nggak lupa nanti.”</li>
          </ul>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Kombinasi Hook + CTA Viral</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3065/3065820.png" alt="Hook CTA Combo" class="page-img" />
          <p>Konten paling viral biasanya memiliki kombinasi hook menarik + value yang kuat + CTA persuasif di akhir.</p>
          <br>
          <h4>Contoh:</h4>
          <p>🎯 Hook: “Cuma modal HP, kamu bisa dapet Rp5 juta/bulan” → 🎁 Konten: tutorialnya → 🔥 CTA: “Mau template-nya? Comment ‘YES’!”</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'roadmapfreelancer') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Roadmap Jadi Freelancer Sukses</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4329/4329025.png" alt="Freelance Roadmap" class="page-img" />
          <p><strong>Kategori:</strong> Freelance & Karier Digital</p>
          <p><strong>Deskripsi:</strong> Panduan langkah demi langkah untuk membangun karier sebagai freelancer sukses, mulai dari nol hingga punya klien rutin dan penghasilan stabil.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenapa Freelance?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2991/2991110.png" alt="Why Freelance" class="page-img" />
          <p>Freelance memberi kebebasan waktu, tempat, dan potensi income tanpa batas. Tapi perlu strategi yang tepat agar tidak tersesat di awal.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu bisa kerja dari rumah, ngatur waktu sendiri, dan klienmu bisa dari Jakarta, Bali, bahkan luar negeri.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Temukan Skill yang Bisa Dijual</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10458/10458876.png" alt="Sell Skill" class="page-img" />
          <p>Identifikasi skill utama yang bisa dijual, lalu kembangkan jadi layanan yang dibutuhkan pasar: desain, video editing, menulis, dll.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu jago desain? Ubah jadi jasa desain feed Instagram atau logo untuk UMKM.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Bangun Portofolio, Meski Belum Punya Klien</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/5953/5953614.png" alt="Portfolio" class="page-img" />
          <p>Portofolio tidak harus dari klien. Buat proyek fiktif atau bantu teman secara gratis untuk menunjukkan hasil kerja kamu.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat 3 desain feed Instagram untuk brand fiktif lalu upload di Behance atau link bio kamu.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Buat Personal Branding di Sosial Media</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6331/6331623.png" alt="Branding" class="page-img" />
          <p>Gunakan bio, konten, dan highlights untuk menampilkan skill, proses kerja, dan testimoni. Tunjukkan kamu ahli di bidangmu.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Bio IG: "Desain Feed Profesional | Bantu UMKM tampil stand out | DM untuk fast response"</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Mulai Cari Klien Pertama</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3311/3311572.png" alt="First Client" class="page-img" />
          <p>Gabung platform freelance (Fastwork, Sribulancer, Fiverr) dan manfaatkan grup Facebook/Telegram sebagai ladang job pertama.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Cari job di grup Facebook: “Butuh desain logo” → DM, tawarkan bantuan + contoh portofolio kamu.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Tentukan Harga dan Sistem Kerja</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2201/2201570.png" alt="Pricing" class="page-img" />
          <p>Tentukan harga berdasarkan waktu, nilai manfaat, dan riset kompetitor. Gunakan sistem DP, revisi terbatas, dan deadline yang jelas.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Paket Feed: 5 desain = Rp150K, DP 50%, 1x revisi, selesai 2 hari. Kirim PDF price list ke klien.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Bangun Relasi & Repeat Order</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4359/4359467.png" alt="Repeat Order" class="page-img" />
          <p>Pekerjaan terbaik datang dari klien puas. Jaga komunikasi, kasih bonus kecil, dan follow-up klien lama secara berkala.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Setelah selesai proyek, kirim pesan: “Kalau butuh konten bulan depan, aku siap bantu lagi 🙌”</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bab 8: Upgrade Skill dan Naik Kelas</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9097/9097555.png" alt="Upgrade" class="page-img" />
          <p>Terus belajar agar bisa nawarin layanan dengan harga lebih tinggi, misal dari desain jadi branding kit lengkap.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu belajar copywriting → jadi bisa tawarin paket desain + caption sekaligus.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 9</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'bisnisdigital') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Bangun Bisnis Digital</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10798/10798445.png" alt="Bisnis Digital" class="page-img" />
          <p><strong>Kategori:</strong> Digital Business</p>
          <p><strong>Deskripsi:</strong> Panduan membangun bisnis digital dari nol. Cocok untuk pemula yang ingin menciptakan penghasilan online tanpa harus punya toko fisik.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenapa Bisnis Digital?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8374/8374934.png" alt="Kenapa Digital" class="page-img" />
          <p>Bisnis digital memberikan fleksibilitas, biaya rendah, dan potensi pasar tak terbatas. Kamu bisa mulai dari rumah tanpa modal besar.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Menjual e-book, template, kursus online, atau jasa freelance hanya bermodalkan laptop dan koneksi internet.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Tentukan Model Bisnis</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9185/9185093.png" alt="Model Bisnis" class="page-img" />
          <p>Pilih model bisnis digital yang sesuai: produk digital (e-book, kursus), jasa (freelance, konsultasi), atau affiliate marketing.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Jika kamu jago ngajar, buat kursus online tentang desain atau digital marketing di platform seperti Gumroad atau Skillshare.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Riset Pasar dan Validasi Ide</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8443/8443512.png" alt="Riset Pasar" class="page-img" />
          <p>Pastikan ide kamu dibutuhkan pasar. Lakukan riset topik viral, masalah umum, dan kompetitor di niche yang kamu pilih.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Cek trending di TikTok atau cari keyword populer di Google Trends: “cara jualan di shopee”, “desain canva aesthetic”.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Buat Produk atau Layanan Digital</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10440/10440118.png" alt="Create Product" class="page-img" />
          <p>Mulai dari versi sederhana (MVP). Jangan tunggu sempurna. Fokus dulu pada solusi dan manfaat.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat e-book 10 halaman atau template desain sebagai produk awal. Uji dulu sebelum bikin yang lebih kompleks.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Bangun Personal Branding dan Media Sosial</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10440/10440345.png" alt="Branding" class="page-img" />
          <p>Gunakan Instagram, TikTok, dan YouTube untuk membangun audiens dan awareness. Tampilkan value, testimoni, dan proses kerja.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Post konten edukasi setiap hari: “3 cara dapetin klien tanpa promosi” atau “Tips desain feed profesional dengan Canva”.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Buat Sistem Penjualan Otomatis</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9005/9005823.png" alt="Sistem Jualan" class="page-img" />
          <p>Gunakan tools seperti Linktree, payment gateway, dan landing page untuk mempermudah transaksi otomatis.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan Linktree + Google Drive untuk jualan template: promosi via bio → klik link → beli → download otomatis.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Optimasi dan Scaling</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2674/2674956.png" alt="Scaling" class="page-img" />
          <p>Setelah valid, tingkatkan produk, buat varian lain, rekrut tim kecil, atau iklankan untuk hasil lebih besar.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu sudah jual 100 e-book? Tambahkan versi video, jual bundling, atau buka private coaching.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'sistemkontenharian') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Sistem Konten Harian</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10440/10440118.png" alt="Sistem Konten Harian" class="page-img" />
          <p><strong>Kategori:</strong> Konten & Produktivitas</p>
          <p><strong>Deskripsi:</strong> Panduan membangun sistem pembuatan konten harian tanpa stres. Cocok untuk kreator, pemilik bisnis, dan marketer yang ingin konsisten posting tanpa bingung tiap hari.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenapa Perlu Sistem Konten Harian?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4240/4240662.png" alt="Kenapa Sistem?" class="page-img" />
          <p>Posting setiap hari tanpa sistem membuatmu mudah kehabisan ide dan burnout. Sistem akan menyederhanakan proses dan meningkatkan konsistensi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Daripada mikir ide tiap pagi, kamu sudah punya jadwal dan daftar konten seminggu sebelumnya.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Struktur Mingguan (Tema Harian)</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7929/7929748.png" alt="Struktur Mingguan" class="page-img" />
          <p>Buat tema untuk tiap hari agar otak tidak perlu mikir dari nol. Misalnya: Senin – Edukasi, Selasa – Testimoni, Rabu – Tips, dst.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Senin: “3 Cara Konsisten Bangun Bisnis Online” | Selasa: “Review Klien: Hasil Jualan Meningkat 2x Lipat!”</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Batch Produksi Konten</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3595/3595455.png" alt="Batch Konten" class="page-img" />
          <p>Alih-alih bikin konten tiap hari, kamu bisa siapkan semua konten mingguan dalam 1–2 hari (batching).</p>
          <br>
          <h4>Contoh:</h4>
          <p>Sabtu rekam 7 video reels | Minggu edit semuanya → Jadwalkan pakai fitur draft atau tools.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Gunakan Template dan Format Tetap</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/12685/12685531.png" alt="Template" class="page-img" />
          <p>Template mempercepat proses desain dan penulisan. Gunakan format yang sama agar konten lebih mudah dibuat & dikenali.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan 1 desain tetap untuk carousel edukasi dan hanya ganti teks/konten setiap minggu.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Sistem Ide dan Catatan Konten</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8649/8649022.png" alt="Bank Ide" class="page-img" />
          <p>Buat ‘bank ide’ di Notion atau Google Sheet agar kamu tidak pernah kehabisan topik.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kolom: Judul – Jenis Konten – Target Publish – Status. Tambahkan ide tiap kali terinspirasi.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Jadwal dan Tools Pendukung</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6035/6035455.png" alt="Jadwal & Tools" class="page-img" />
          <p>Gunakan tools seperti Meta Business Suite, CapCut, Canva, Trello, Notion untuk menjadwalkan dan mengatur alur kerja konten.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Trello → plan konten mingguan, CapCut → edit reels batch, Canva → buat carousel, Meta Suite → jadwalkan.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Evaluasi & Upgrade Sistem</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10436/10436734.png" alt="Evaluasi" class="page-img" />
          <p>Evaluasi konten yang perform dan perbaiki sistem setiap minggu atau bulan. Konten yang sukses → direplikasi atau dikembangkan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Konten edukasi Sabtu viral? Buat versi baru dengan judul lebih kuat atau format berbeda (reels ke carousel).</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'algoritmasosmed') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Algoritma TikTok & Instagram</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/12134/12134720.png" alt="Algoritma Sosial Media" class="page-img" />
          <p><strong>Kategori:</strong> Sosial Media & Strategi</p>
          <p><strong>Deskripsi:</strong> Panduan memahami cara kerja algoritma TikTok & Instagram agar konten kamu lebih mudah FYP dan menjangkau audiens lebih luas. Cocok untuk kreator, bisnis, dan pemula.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Apa Itu Algoritma Sosial Media?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10093/10093003.png" alt="Pengertian Algoritma" class="page-img" />
          <p>Algoritma adalah sistem otomatis yang menentukan konten mana yang akan muncul di beranda pengguna berdasarkan interaksi, minat, dan relevansi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Jika kamu sering like video tentang bisnis, maka algoritma TikTok akan lebih sering menampilkan konten bisnis di FYP kamu.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Algoritma TikTok 2025</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9609/9609105.png" alt="TikTok Algorithm" class="page-img" />
          <p>Faktor utama: watch time, engagement (like, comment, share), topik video, deskripsi, dan musik yang digunakan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat video berdurasi 10–30 detik dengan hook kuat di 3 detik pertama, gunakan lagu viral, dan ajak audiens komentar.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Algoritma Instagram 2025</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11881/11881942.png" alt="Instagram Algorithm" class="page-img" />
          <p>IG menilai interaksi (saves, shares, comments), durasi tontonan di reels, dan seberapa sering akunmu berinteraksi dengan audiens tertentu.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Post carousel edukatif dengan CTA “save postingan ini biar gak lupa” → meningkatkan performa postingan.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Perbedaan TikTok vs Instagram</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10158/10158414.png" alt="Perbedaan Algoritma" class="page-img" />
          <p>TikTok lebih fokus ke konten, bukan akun. IG lebih fokus ke relasi antara akun dan audiens. TikTok lebih mudah viral, IG lebih ke komunitas.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Di TikTok, akun baru bisa viral dengan konten pertama. Di IG, kamu perlu waktu membangun kredibilitas dan relasi.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Strategi Mengalahkan Algoritma</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9244/9244234.png" alt="Strategi Algoritma" class="page-img" />
          <p>Konsistensi posting, gunakan format yang disukai platform (reels/video pendek), manfaatkan komentar & caption sebagai pemicu interaksi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Tambahkan pertanyaan di caption seperti “Kamu tim pagi atau malam?” → dorong interaksi & komentar.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Tools & Insight untuk Tracking</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/12079/12079434.png" alt="Tools Sosmed" class="page-img" />
          <p>Gunakan fitur analytic dari TikTok & IG untuk melihat jam terbaik posting, jenis konten dengan view tinggi, dan audience retention.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Lihat performa video via TikTok Pro/IG Insight: Jika 80% view drop di detik ke-5, ubah struktur hook video berikutnya.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'softselling') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Teknik Soft Selling Anti Hard Sell</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9966/9966964.png" alt="Soft Selling" class="page-img" />
          <p><strong>Kategori:</strong> Copywriting & Marketing</p>
          <p><strong>Deskripsi:</strong> Pelajari teknik menjual tanpa terasa jualan. Cocok untuk kamu yang ingin closing lebih banyak tanpa bikin audiens ilfeel. Cocok untuk social seller, freelancer, hingga pemilik bisnis digital.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Apa Itu Soft Selling?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3756/3756715.png" alt="Soft Selling Definition" class="page-img" />
          <p>Soft selling adalah teknik menjual secara halus tanpa memaksa. Fokus pada membangun kepercayaan dan hubungan, bukan sekadar menjual produk.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Alih-alih bilang “Beli sekarang!”, kamu bisa bilang “Produk ini bantu aku menghemat 3 jam kerja tiap hari.”</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Ciri Konten Soft Selling</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11156/11156208.png" alt="Ciri Soft Sell" class="page-img" />
          <p>Konten soft selling biasanya mengandung edukasi, storytelling, manfaat produk, testimoni, dan tidak frontal minta pembelian.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Awalnya aku ragu… Tapi setelah 7 hari coba tools ini, kerjaanku lebih cepat 2x lipat.”</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Struktur Konten Soft Selling</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8582/8582224.png" alt="Struktur Konten" class="page-img" />
          <p>Gunakan alur: Masalah – Proses – Solusi – Manfaat – Ajakan ringan. Buat audiens merasa relate dulu sebelum mengajak beli.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Dulu aku sering lembur karena desain manual. Sekarang? Cuma pakai template ini.” → CTA: “Cek link di bio kalau kamu juga pengen kerja lebih ringan.”</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Gunakan Storytelling Personal</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3222/3222694.png" alt="Storytelling" class="page-img" />
          <p>Ceritakan pengalaman pribadi yang real dan relatable. Orang membeli karena koneksi emosional, bukan karena promosi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Waktu itu aku sempat down karena ga ada klien. Sampai akhirnya nemu tools yang bantu aku dapet leads pertama.”</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Manfaatkan Testimoni sebagai Konten</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8438/8438646.png" alt="Testimoni" class="page-img" />
          <p>Testimoni bukan hanya bukti, tapi juga bisa jadi storytelling yang powerful dan meningkatkan trust.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Ini review dari mbak Dita, setelah 3 minggu pakai produk ini, penghasilannya naik 2x lipat!”</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Teknik CTA Halus tapi Menggoda</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/12114/12114071.png" alt="CTA Soft" class="page-img" />
          <p>CTA tetap perlu, tapi buat semenarik mungkin tanpa terkesan memaksa. Ciptakan rasa penasaran atau janji manfaat.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Mau tools yang aku pakai ini juga? Aku taruh link-nya di bio ya 😉”</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Konsistensi Bangun Trust</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10441/10441851.png" alt="Trust Building" class="page-img" />
          <p>Soft selling hanya efektif jika kamu konsisten hadir. Jangan menghilang lalu tiba-tiba jualan. Bangun kredibilitas secara rutin.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Rutin share tips tiap hari → sesekali selipkan cerita atau solusi dari produk kamu → beri CTA ringan.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'naikfollowers') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Strategi Naik Followers Aktif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10015/10015752.png" alt="Followers Aktif" class="page-img" />
          <p><strong>Kategori:</strong> Sosial Media Growth</p>
          <p><strong>Deskripsi:</strong> Panduan lengkap menaikkan followers aktif (bukan sekadar angka) di platform sosial media dengan strategi organik yang terbukti. Cocok untuk personal brand, kreator, dan bisnis digital.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenali Target Audiens</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10192/10192367.png" alt="Target Audience" class="page-img" />
          <p>Followers aktif berasal dari audiens yang merasa kamu bicara langsung ke mereka. Maka, pahami usia, hobi, masalah, dan harapan mereka.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kalau targetmu ibu rumah tangga, jangan buat konten ala gamers. Buat konten seputar keluarga, bisnis rumahan, atau produktivitas di rumah.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Konsistensi = Kredibilitas</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1055/1055641.png" alt="Consistency" class="page-img" />
          <p>Posting konsisten membuat algoritma bekerja lebih baik dan audiens percaya bahwa kamu serius dengan kontenmu.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan sistem konten mingguan (Senin: edukasi, Rabu: tips, Jumat: hiburan). Posting 3–5x seminggu minimal.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Konten yang Shareable</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8565/8565357.png" alt="Shareable Content" class="page-img" />
          <p>Konten yang dibagikan (bukan sekadar dilihat) lebih mudah memperluas jangkauan dan mendatangkan followers baru.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Post carousel “5 Hal yang Bikin Bisnismu Gagal” → diakhiri dengan CTA: “Tag temanmu yang harus lihat ini.”</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Interaksi Lebih Penting dari Jumlah</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9131/9131355.png" alt="Interaksi" class="page-img" />
          <p>Bangun komunitas, bukan hanya angka. Jawab komentar, balas DM, gunakan polling, Q&A, dan live untuk koneksi real.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Setiap kali ada komentar, balas dengan nama orang tersebut → ini meningkatkan engagement dan loyalitas.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Profil yang Mengundang Follow</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8869/8869458.png" alt="Profil Bio" class="page-img" />
          <p>Buat bio yang jelas, foto profil profesional, dan highlight story yang informatif agar orang langsung tahu kenapa harus follow kamu.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Desainer | Bantu kamu bikin brand makin dipercaya | 🎁 Free template di highlight!”</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Kolaborasi dan Tagging</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9429/9429119.png" alt="Collab" class="page-img" />
          <p>Kolaborasi dengan akun lain mempercepat eksposur ke audiens baru. Pilih akun yang audiensnya relevan, bukan hanya besar.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Bikin konten bareng atau saling repost story bersama partner se-niche (misal sesama edukator bisnis).</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Gunakan Hashtag yang Tepat</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4702/4702102.png" alt="Hashtag" class="page-img" />
          <p>Hashtag membantu algoritma mengkategorikan kontenmu dan menjangkau orang yang tertarik topik tersebut.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan kombinasi: niche (#belajardesain), trending (#viral2025), komunitas (#kontenkreatorindonesia).</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bab 8: CTA Follow yang Natural</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10609/10609406.png" alt="CTA Follow" class="page-img" />
          <p>Ajak audiens follow dengan alasan jelas, bukan sekadar “jangan lupa follow ya”. Tunjukkan value yang akan mereka dapat.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Follow akun ini kalau kamu ingin konsisten bikin konten kreatif tanpa kehabisan ide.”</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 9</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'dropship101') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Dropship 101: Cara Mulai Tanpa Modal</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8693/8693310.png" alt="Dropship 101" class="page-img" />
          <p><strong>Kategori:</strong> Bisnis Online</p>
          <p><strong>Deskripsi:</strong> Panduan praktis untuk memulai bisnis dropship tanpa stok barang dan tanpa modal besar. Cocok untuk pemula yang ingin punya penghasilan dari rumah.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Apa Itu Dropship?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9401/9401923.png" alt="Pengertian Dropship" class="page-img" />
          <p>Dropship adalah model bisnis di mana kamu menjual produk tanpa menyimpan stok. Supplier mengurus pengiriman, kamu fokus promosi dan jualan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu promosiin tas dari supplier di Shopee. Saat ada yang beli, kamu order ke supplier dan mereka kirim ke pembeli atas namamu.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Platform Jualan Dropship</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9187/9187793.png" alt="Platform Jualan" class="page-img" />
          <p>Kamu bisa jualan lewat: Marketplace (Shopee, Tokopedia), Media Sosial (Instagram, TikTok), dan Chat (WhatsApp, Telegram).</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buka toko Shopee, isi dengan foto produk dari supplier, kasih deskripsi menarik, dan aktifkan fitur gratis ongkir.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Cari Supplier yang Terpercaya</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9836/9836214.png" alt="Supplier Dropship" class="page-img" />
          <p>Supplier adalah kunci dropship sukses. Pilih yang cepat respons, pengiriman cepat, stok stabil, dan support dropshipper.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan filter "Siap Dropship" di Tokopedia atau cari supplier via Google & join grup reseller terpercaya.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Tentukan Niche Produk</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10237/10237097.png" alt="Niche" class="page-img" />
          <p>Pilih 1 jenis kategori yang kamu pahami dan bisa kamu edukasikan. Misal: perlengkapan bayi, produk diet, gadget aksesoris.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Fokus pada niche “Kesehatan Wanita” → jual produk herbal, test pack, korset, dll → semua kontennya senada.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Buat Konten & Caption Menjual</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10634/10634298.png" alt="Konten Dropship" class="page-img" />
          <p>Kunci utama dropship: konten menarik. Ambil foto dari supplier, ubah gaya, tambahkan copywriting agar beda dari seller lain.</p>
          <br>
          <h4>Contoh:</h4>
          <p>“Capek diet gagal terus? Produk ini bantu nurunin berat badan 3 kg dalam 7 hari tanpa olahraga ekstrem.”</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Sistem Order Dropship</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9699/9699762.png" alt="Sistem Order" class="page-img" />
          <p>Saat pembeli transfer ke kamu, langsung order ke supplier pakai data si pembeli. Pastikan nama pengirim sesuai tokomu.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Budi beli produk Rp79.000 → kamu order ke supplier (Rp55.000) pakai data Budi → kamu untung Rp24.000 tanpa kirim barang.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Layani dengan Profesional</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1055/1055666.png" alt="Layanan Dropship" class="page-img" />
          <p>Jawab pertanyaan cepat, gunakan template chat, update resi, dan beri layanan seperti toko profesional walau dropship.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan script WA seperti: “Halo kak, terima kasih sudah order! Paket kakak segera kami proses yaa. 🙏”</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bab 8: Naik Level dengan Branding</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9972/9972287.png" alt="Brand Dropship" class="page-img" />
          <p>Kalau sudah lancar, mulai bangun brand sendiri. Buat nama toko, logo, template visual, dan sistem admin agar bisa di-scale.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Buat akun Instagram dengan nama @fitlife.store → semua kontennya seragam & bisa diingat audiens.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 9</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}


if (page === 'bukukripto') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Crypto Starter Book</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7736/7736928.png" alt="Crypto Book" class="page-img" />
          <p><strong>Kategori:</strong> Keuangan Digital</p>
          <p><strong>Deskripsi:</strong> Buku ini akan membimbingmu memahami dasar-dasar dunia cryptocurrency dengan cara simpel. Cocok untuk pemula yang ingin tahu sebelum investasi.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Apa Itu Cryptocurrency?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2910/2910791.png" alt="Crypto Intro" class="page-img" />
          <p>Cryptocurrency adalah mata uang digital yang menggunakan teknologi blockchain dan tidak dikontrol oleh bank pusat.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Bitcoin, Ethereum, dan Solana adalah contoh cryptocurrency. Kamu bisa membeli sebagian kecil, misalnya 0.001 BTC.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Cara Kerja Blockchain</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9524/9524677.png" alt="Blockchain" class="page-img" />
          <p>Blockchain adalah sistem database terdesentralisasi yang mencatat transaksi secara permanen dan transparan.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Jika kamu transfer Bitcoin, datanya masuk ke blockchain dan bisa dilihat publik, tapi tetap anonim.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Exchange & Dompet Kripto</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10423/10423783.png" alt="Crypto Wallet" class="page-img" />
          <p>Exchange adalah tempat beli/jual kripto. Wallet adalah tempat menyimpan asetmu secara digital.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu bisa pakai Tokocrypto atau Binance untuk beli kripto, dan simpan di Trust Wallet atau MetaMask.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Risiko & Keamanan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8649/8649264.png" alt="Crypto Risk" class="page-img" />
          <p>Kripto bersifat fluktuatif dan tidak dijamin negara. Kamu harus paham risiko sebelum investasi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Harga Bitcoin bisa naik 30% dalam seminggu, tapi juga bisa turun drastis. Jangan pernah simpan password wallet di HP!</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Strategi Pemula</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7165/7165786.png" alt="Crypto Strategy" class="page-img" />
          <p>Mulai dari nominal kecil, gunakan strategi DCA (Dollar Cost Averaging), dan jangan FOMO saat harga naik tajam.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Beli Bitcoin Rp100.000 setiap minggu, tanpa peduli naik-turun harga. Ini menghindari beli di harga tertinggi sekaligus.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Dunia DeFi & NFT</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9684/9684909.png" alt="DeFi & NFT" class="page-img" />
          <p>DeFi (Decentralized Finance) adalah layanan keuangan tanpa bank. NFT (Non Fungible Token) adalah aset digital unik di blockchain.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Kamu bisa staking kripto untuk dapat bunga pasif, atau membeli NFT seperti gambar digital yang punya sertifikat kepemilikan.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'bukukriptolanjutan') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Crypto Level Intermediate</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11893/11893039.png" alt="Crypto Lanjutan" class="page-img" />
          <p><strong>Kategori:</strong> Keuangan Digital - Level Menengah</p>
          <p><strong>Deskripsi:</strong> Lanjutan dari Crypto Starter Book. Panduan ini membahas strategi, keamanan lanjutan, hingga manajemen portofolio kripto secara lebih serius dan terstruktur.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Analisis Fundamental Kripto</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7861/7861294.png" alt="Fundamental" class="page-img" />
          <p>Pahami apa yang membuat sebuah koin/token bernilai: tim pengembang, utilitas proyek, roadmap, partner, dan komunitas.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Bandingkan: Token A dengan whitepaper jelas & didukung Binance vs token B tanpa roadmap. Token A lebih layak dikoleksi.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Analisis Teknikal Dasar</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2920/2920080.png" alt="Chart Analysis" class="page-img" />
          <p>Gunakan grafik harga untuk memprediksi arah pasar. Pelajari support-resistance, candlestick, dan indikator MACD/RSI.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Saat harga Bitcoin menyentuh support kuat dan RSI oversold, kemungkinan besar akan naik → peluang beli.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Manajemen Portofolio</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11538/11538213.png" alt="Portfolio Management" class="page-img" />
          <p>Jangan all-in pada 1 koin. Diversifikasi jadi strategi wajib agar risiko kerugian tidak terlalu besar jika 1 koin turun tajam.</p>
          <br>
          <h4>Contoh:</h4>
          <p>60% BTC, 20% ETH, 10% altcoin besar, 10% stablecoin → seimbang antara pertumbuhan dan kestabilan.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Mengenal Stablecoin & Risiko Depeg</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8868/8868935.png" alt="Stablecoin" class="page-img" />
          <p>Stablecoin adalah kripto yang nilainya dipatok ke USD (seperti USDT, USDC). Namun risiko depeg bisa terjadi jika tidak didukung aset nyata.</p>
          <br>
          <h4>Contoh:</h4>
          <p>UST (Terra) pernah jatuh dari $1 ke $0.02 karena gagal menjaga cadangan. Hindari stablecoin algoritmis yang tidak transparan.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Staking, Farming & Passive Income</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9505/9505261.png" alt="Crypto Passive Income" class="page-img" />
          <p>Staking adalah mengunci kripto untuk mendapat reward. Yield farming menawarkan bunga lebih besar, tapi risiko lebih tinggi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Staking ETH di Lido bisa hasilkan 4-6% per tahun. Farming di DEX bisa hasilkan 20-40%, tapi dengan risiko impermanent loss.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Tips Keamanan Lanjutan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6147/6147214.png" alt="Security" class="page-img" />
          <p>Gunakan wallet non-custodial, aktifkan 2FA, jangan pernah klik link airdrop sembarangan, dan simpan seed phrase offline.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Gunakan MetaMask + Ledger (hardware wallet) dan jangan simpan seed phrase di Google Drive atau galeri HP.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'bukukriptoexpert') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Crypto Expert Book</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11893/11893261.png" alt="Crypto Expert" class="page-img" />
          <p><strong>Kategori:</strong> Keuangan Digital - Expert</p>
          <p><strong>Deskripsi:</strong> Buku level mahir ini dirancang untuk kamu yang ingin serius cuan dari dunia kripto. Mulai dari analisa tingkat lanjut, psikologi market, hingga strategi tokenomics.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Analisis On-Chain</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7737/7737747.png" alt="Onchain Analysis" class="page-img" />
          <p>Analisa on-chain menggunakan data blockchain seperti jumlah wallet aktif, volume transfer, dan aliran whale untuk memprediksi tren market.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Jika banyak whale mentransfer Bitcoin ke exchange, bisa jadi sinyal jual besar-besaran akan terjadi.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Psikologi Market & FOMO</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11893/11893365.png" alt="Market Psychology" class="page-img" />
          <p>Emosi seperti fear dan greed menggerakkan pasar. Trader pro tahu kapan publik sedang FOMO atau panik dan memanfaatkannya.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Saat Fear & Greed Index menunjukan "Extreme Greed", justru waktu tepat untuk jual sebagian aset.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Tokenomics & Sirkulasi Koin</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/620/620851.png" alt="Tokenomics" class="page-img" />
          <p>Pelajari struktur supply koin: total supply, burned token, unlock schedule, dan distribusi ke tim/developer.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Token X punya unlock token besar di bulan depan → potensi harga turun karena suplai bertambah.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Teknik Entry & Exit</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7613/7613611.png" alt="Entry Exit Strategy" class="page-img" />
          <p>Gunakan strategi entry bertahap (scaling in) dan exit bertahap (scaling out) untuk mengurangi risiko timing yang buruk.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Beli BTC di 3 titik: Rp600jt, Rp580jt, Rp550jt. Jual sebagian saat naik 10%, sisanya saat naik 20%.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Sistem Trading Bot</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9602/9602037.png" alt="Bot Trading" class="page-img" />
          <p>Gunakan bot seperti 3Commas, Pionex, atau Grid Bot untuk auto buy-sell berdasarkan logika teknikal.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Bot Grid di ETH: beli otomatis saat turun 2%, jual saat naik 2%. Cuan kecil tapi konsisten tanpa pantau manual.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Risiko Hidden & Sinyal Penipuan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9533/9533924.png" alt="Scam Token" class="page-img" />
          <p>Token abal-abal sering pakai pump & dump, fake volume, dan manipulasi chart. Hindari koin dengan tokenomics aneh & komunitas agresif.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Koin “ABC” naik 1000% dalam sehari, tapi volume tidak alami dan didominasi wallet baru → potensi scam tinggi.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Strategi Long-Term & Exit Plan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10047/10047823.png" alt="Exit Plan" class="page-img" />
          <p>Tanpa exit plan, kamu bisa terjebak hold forever. Tetapkan target profit, batas cut loss, dan tujuan akhir investasi.</p>
          <br>
          <h4>Contoh:</h4>
          <p>Target: profit 300% → realisasikan 70% dan pindahkan ke stablecoin. Sisa 30% biarkan “moon bag” untuk cuan tambahan.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'ternakuang') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Tangga Ternak Uang</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Ternak Uang" class="page-img" />
          <p><strong>Kategori:</strong> Finansial Pribadi</p>
          <p><strong>Deskripsi:</strong> Panduan berjenjang mengelola keuangan secara bertahap untuk mencapai kebebasan finansial. Cocok untuk pemula yang ingin hidup bebas utang dan punya sistem ternak uang yang sehat.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Tahap 1: Menabung Modal Awal</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8083/8083194.png" alt="Menabung" class="page-img" />
          <p>Bangun kebiasaan menabung dengan target awal, misalnya Rp10 juta. Ini menjadi dasar pengelolaan keuangan sehat dan bukti disiplin finansial.</p>
          <h4>Contoh:</h4>
          <p>Setiap bulan sisihkan Rp500.000 dari penghasilanmu, tanpa diutak-atik, hingga terkumpul Rp10 juta.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Tahap 2: Lunasi Hutang Konsumtif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9496/9496907.png" alt="Lunasi Utang" class="page-img" />
          <p>Hapus utang-utang kecil dan konsumtif (kartu kredit, paylater, pinjaman teman) agar tidak membebani cashflow. Kecuali KPR, semua utang wajib lunas dulu.</p>
          <h4>Contoh:</h4>
          <p>Bayar lunas cicilan smartphone Rp500 ribu/bulan daripada terus menambah bunga.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Tahap 3: Bangun Dana Darurat</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1843/1843107.png" alt="Dana Darurat" class="page-img" />
          <p>Siapkan dana darurat sebesar 3–6 kali pengeluaran bulanan, untuk keadaan tak terduga: PHK, sakit, dll.</p>
          <h4>Contoh:</h4>
          <p>Jika pengeluaran bulananmu Rp2 juta, maka target dana darurat adalah Rp6–12 juta.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Tahap 4: Mulai Investasi Rutin</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2331/2331970.png" alt="Investasi" class="page-img" />
          <p>Sisihkan minimal 20% penghasilan untuk investasi ke produk seperti reksadana, saham indeks, atau emas. Pilih yang sesuai profil risiko.</p>
          <h4>Contoh:</h4>
          <p>Setiap bulan beli reksadana pasar uang senilai Rp200.000 dari gaji Rp2 juta.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Tahap 5: Siapkan Dana Pendidikan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8705/8705641.png" alt="Pendidikan" class="page-img" />
          <p>Rancang dana untuk pendidikan anak atau pendidikan pribadi (kursus, skill). Jangan biarkan pendidikan jadi utang di masa depan.</p>
          <h4>Contoh:</h4>
          <p>Investasi di SBN atau reksadana campuran untuk dana kuliah anak 5–10 tahun mendatang.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Tahap 6: Percepat Pelunasan KPR</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3094/3094853.png" alt="Pelunasan KPR" class="page-img" />
          <p>Jika dana darurat dan investasi aman, mulai percepat cicilan KPR agar bisa bebas beban bunga dalam jangka panjang.</p>
          <h4>Contoh:</h4>
          <p>Tambahkan Rp500.000 ke cicilan KPR setiap bulan untuk mempersingkat tenor dan hemat bunga total puluhan juta.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Tahap 7: Bangun Kekayaan & Berbagi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6193/6193634.png" alt="Kekayaan & Berbagi" class="page-img" />
          <p>Setelah keuangan mapan, fokus pada pertumbuhan aset, bisnis, dan kontribusi sosial. Inilah fase ternak uang berjalan otomatis.</p>
          <h4>Contoh:</h4>
          <p>Gunakan sebagian keuntungan investasi untuk membuka usaha kecil + donasi rutin ke yayasan sosial.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'investormind') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 The Investor’s Mind</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6507/6507517.png" alt="Investor Mind" class="page-img" />
          <p><strong>Kategori:</strong> Mindset & Investasi</p>
          <p><strong>Deskripsi:</strong> Panduan tentang cara berpikir ala investor legendaris seperti Warren Buffett, Charlie Munger, dan Benjamin Graham. Cocok untuk pemula yang ingin investasi dengan tenang dan jangka panjang.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Filosofi Menunggu Kesempatan Emas</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6101/6101612.png" alt="Wait Opportunity" class="page-img" />
          <p>Investor hebat tidak tergesa-gesa. Mereka menunggu momen terbaik untuk masuk, seperti pemukul bisbol yang hanya memukul bola terbaik.</p>
          <h4>Contoh:</h4>
          <p>Alih-alih beli saham tiap minggu, Buffett menunggu peluang diskon besar seperti saat krisis. Investor sabar = investor menang.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Mengenal Batasan dan Pengetahuan Diri</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10559/10559832.png" alt="Self Knowledge" class="page-img" />
          <p>Pahami apa yang kamu tahu dan tidak tahu. Jangan paksakan investasi di bidang yang tidak kamu mengerti.</p>
          <h4>Contoh:</h4>
          <p>Jangan ikut-ikutan crypto atau saham teknologi jika kamu tidak memahami fundamentalnya. Fokus pada zona aman pengetahuanmu.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Fokus pada Circle of Competence</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8290/8290536.png" alt="Circle of Competence" class="page-img" />
          <p>Hanya investasikan uang di area yang kamu pahami betul. Ini adalah prinsip Warren Buffett yang paling penting.</p>
          <h4>Contoh:</h4>
          <p>Jika kamu paham industri retail, maka fokus di saham retail seperti UNIQLO, bukan sektor yang kamu belum kenal.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Bias Kognitif yang Menghancurkan Investor</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10426/10426058.png" alt="Cognitive Bias" class="page-img" />
          <p>Investor sering kalah bukan karena kurang pintar, tapi karena bias psikologis seperti FOMO, overconfidence, atau anchoring.</p>
          <h4>Contoh:</h4>
          <p>Jangan beli saham hanya karena “lagi rame” di TikTok. Itu FOMO. Analisa fundamental tetap nomor satu.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Hindari Keserakahan dalam Investasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8669/8669934.png" alt="Greed" class="page-img" />
          <p>Greed adalah musuh terbesar. Keinginan untung cepat justru bikin rugi.</p>
          <h4>Contoh:</h4>
          <p>Target 10% per tahun lebih sehat daripada berharap 100% dalam seminggu. Investasi adalah maraton, bukan sprint.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Mental Model ala Charlie Munger</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10200/10200100.png" alt="Mental Model" class="page-img" />
          <p>Gunakan kombinasi model berpikir dari berbagai disiplin ilmu: psikologi, ekonomi, matematika, hukum.</p>
          <h4>Contoh:</h4>
          <p>Sebelum invest, tanyakan: Apakah ini masuk logika ekonomi? Apakah ada hukum permintaan-penawaran yang bekerja?</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Nilai vs Harga</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4783/4783683.png" alt="Value vs Price" class="page-img" />
          <p>Harga adalah apa yang kamu bayar. Nilai adalah apa yang kamu dapat. Jangan tertipu harga murah kalau nilainya rendah.</p>
          <h4>Contoh:</h4>
          <p>Saham A harganya Rp1.000 tapi nilainya Rp500 = overvalued. Saham B harganya Rp5.000 tapi nilainya Rp10.000 = undervalued.</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bab 8: Margin of Safety ala Benjamin Graham</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10200/10200163.png" alt="Margin of Safety" class="page-img" />
          <p>Beli saham dengan diskon besar dari nilai wajarnya. Jadi walaupun prediksimu sedikit meleset, tetap aman.</p>
          <h4>Contoh:</h4>
          <p>Jika nilai wajar saham Rp10.000, beli di Rp6.000 = margin of safety 40%. Ini prinsip utama value investing.</p>
        </div>

        <div class="page" data-page="10">
          <h2>📌 Bab 9: Seni Berpikir Jangka Panjang</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6659/6659940.png" alt="Long Term Thinking" class="page-img" />
          <p>Investor besar berpikir 5-10 tahun ke depan, bukan 5 hari. Mereka tidak terganggu oleh fluktuasi jangka pendek.</p>
          <h4>Contoh:</h4>
          <p>Alih-alih menjual saat harga turun 10%, investor sukses justru beli lebih banyak jika fundamental tetap bagus.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 10</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'wealthblueprint') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 The Wealth Blueprint</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4139/4139951.png" alt="Wealth Blueprint" class="page-img" />
          <p><strong>Kategori:</strong> Mindset & Keuangan</p>
          <p><strong>Deskripsi:</strong> Panduan mental, strategi, dan sistem untuk membangun kekayaan secara bertahap namun pasti. Cocok untuk kamu yang ingin lepas dari siklus gaji dan mulai membangun pondasi finansial jangka panjang.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Pola Pikir Orang Kaya vs Orang Biasa</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/924/924915.png" alt="Mindset Comparison" class="page-img" />
          <p>Orang kaya memikirkan aset & leverage, orang biasa fokus pada pengeluaran & gaji tetap. Wealth starts in the mind.</p>
          <br><h4>Contoh:</h4>
          <p>Orang biasa bertanya: “Berapa gaji saya bulan ini?” <br>Orang kaya bertanya: “Bagaimana saya bisa buat uang bekerja untuk saya?”</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: 3 Sumber Penghasilan Sejati</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2942/2942882.png" alt="Income Streams" class="page-img" />
          <p>Sumber kekayaan jangka panjang berasal dari: penghasilan aktif, penghasilan pasif, dan penghasilan portofolio (investasi).</p>
          <br><h4>Contoh:</h4>
          <p>Punya skill freelance (aktif), bangun produk digital (pasif), dan invest reksadana/saham (portofolio).</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Sistem Keuangan 4-20-30-20-10-10</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1589/1589331.png" alt="Money Allocation" class="page-img" />
          <p>Bagi income kamu jadi 6 pos: kebutuhan, cicilan, investasi, dana darurat, sedekah, dan self-reward.</p>
          <br><h4>Contoh:</h4>
          <p>Dari gaji Rp5 juta: Rp2juta kebutuhan, Rp1juta cicilan, Rp1juta investasi, Rp500k darurat, Rp300k sedekah, Rp200k reward.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Aset Produktif vs Konsumtif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2830/2830485.png" alt="Assets" class="page-img" />
          <p>Aset produktif menghasilkan uang. Aset konsumtif justru menyedot uang. Fokus kamu harus ke produktif!</p>
          <br><h4>Contoh:</h4>
          <p>Beli kamera (produktif) untuk konten YouTube vs beli HP mahal hanya untuk gaya (konsumtif).</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Skill Kaya yang Harus Dimiliki</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4359/4359957.png" alt="High Income Skills" class="page-img" />
          <p>Skill yang membuka pintu income besar: copywriting, marketing, desain, public speaking, dan leadership.</p>
          <br><h4>Contoh:</h4>
          <p>Belajar copywriting → bikin landing page → jualan digital product → cuan tanpa stok barang.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Strategi Bangun Aset Digital</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11666/11666166.png" alt="Digital Asset" class="page-img" />
          <p>Buat produk sekali, jual berkali-kali. Digital asset seperti e-book, course, desain, tool, atau template bisa jadi passive income.</p>
          <br><h4>Contoh:</h4>
          <p>Buat e-book "Tips IG Growth", upload di platform, hasilkan Rp500k–Rp2jt per bulan secara otomatis.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Investasi yang Ramah Pemula</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7317/7317874.png" alt="Investasi Pemula" class="page-img" />
          <p>Mulai dari reksadana, emas digital, dan saham bluechip. Kuncinya bukan cepat, tapi rutin dan konsisten.</p>
          <br><h4>Contoh:</h4>
          <p>Invest Rp500k/bulan di indeks saham IDX30 → 5 tahun lagi bisa jadi Rp40–60 juta.</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Penutup: Kekayaan Butuh Waktu & Konsistensi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10590/10590530.png" alt="Wealth Takes Time" class="page-img" />
          <p>Tidak ada kekayaan instan. Yang ada: mindset yang benar, langkah yang konsisten, dan sistem yang terarah.</p>
          <br><h4>Contoh:</h4>
          <p>Setiap hari, ambil satu langkah kecil: belajar, posting, menjual, menabung. 1 tahun = 365 langkah lebih kaya.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 9</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'capitalmarket') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Capital Market Mastery</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6221/6221394.png" alt="Capital Market" class="page-img" />
          <p><strong>Kategori:</strong> Investasi & Pasar Modal</p>
          <p><strong>Deskripsi:</strong> Modul lengkap untuk memahami pasar modal secara komprehensif, mulai dari pengenalan instrumen hingga strategi investasi ala profesional.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Pengantar Pasar Modal</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/5612/5612924.png" alt="Intro" class="page-img" />
          <p>Pasar modal adalah tempat jual beli instrumen keuangan seperti saham, obligasi, reksa dana, dan lainnya. Tujuannya untuk menghimpun dana jangka panjang.</p>
          <br><h4>Contoh:</h4>
          <p>Perusahaan seperti Telkom dan Bank BCA menerbitkan saham untuk menghimpun dana dari publik melalui Bursa Efek Indonesia (BEI).</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Jenis Instrumen Pasar Modal</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6103/6103754.png" alt="Instrumen" class="page-img" />
          <p>Instrumen utama di pasar modal: saham, obligasi, reksa dana, derivatif, dan ETF. Masing-masing memiliki karakter dan risiko berbeda.</p>
          <br><h4>Contoh:</h4>
          <p>Investor konservatif memilih reksa dana pasar uang. Sedangkan investor agresif cenderung memilih saham atau ETF sektor teknologi.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Cara Membeli Saham Pertama Kali</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/5656/5656825.png" alt="Buy Saham" class="page-img" />
          <p>Langkah awal: buka rekening efek di sekuritas, setor dana, analisis emiten, lalu beli saham via aplikasi (misal: Ajaib, Bibit, IndoPremier).</p>
          <br><h4>Contoh:</h4>
          <p>Daftar di Ajaib, setor Rp100.000, lalu beli saham PT Unilever Indonesia (UNVR) sebagai permulaan.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Analisis Fundamental</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9573/9573416.png" alt="Fundamental" class="page-img" />
          <p>Analisis fundamental melibatkan laporan keuangan, rasio PE, PBV, ROE, dan kondisi industri untuk menilai nilai intrinsik saham.</p>
          <br><h4>Contoh:</h4>
          <p>Jika PT XYZ punya ROE 20% dan pertumbuhan laba stabil, maka sahamnya menarik untuk jangka panjang.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Analisis Teknikal</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6993/6993910.png" alt="Teknikal" class="page-img" />
          <p>Teknikal fokus pada pergerakan harga & volume. Gunakan indikator seperti MA, RSI, MACD untuk menentukan timing beli & jual.</p>
          <br><h4>Contoh:</h4>
          <p>Harga saham membentuk pola “double bottom” + RSI oversold → sinyal beli potensial.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Strategi Investasi Jangka Panjang</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8050/8050935.png" alt="Long Term" class="page-img" />
          <p>Strategi ala Warren Buffett: beli saham bagus di harga murah, tahan dalam jangka panjang (value investing).</p>
          <br><h4>Contoh:</h4>
          <p>Beli saham BBRI saat turun karena sentimen jangka pendek, lalu hold selama 5 tahun.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Risiko dan Psikologi Investasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8381/8381766.png" alt="Psikologi" class="page-img" />
          <p>Investor pemula sering panik saat market turun. Kunci sukses ada di pengendalian emosi & diversifikasi portofolio.</p>
          <br><h4>Contoh:</h4>
          <p>Saat IHSG turun 5%, tetap tenang karena portofolio kamu terdiversifikasi ke 10 emiten dari sektor berbeda.</p>
        </div>

        <div class="page" data-page="9">
          <h2>📌 Bab 8: Mengenal Dividen dan Capital Gain</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7763/7763771.png" alt="Dividen" class="page-img" />
          <p>Dividen adalah pembagian laba kepada pemegang saham. Capital gain adalah keuntungan dari selisih beli–jual saham.</p>
          <br><h4>Contoh:</h4>
          <p>Beli saham UNVR di Rp4.000 dan jual di Rp5.000 → capital gain Rp1.000 + dividen tahunan Rp150/saham.</p>
        </div>

        <div class="page" data-page="10">
          <h2>📌 Penutup: Konsisten & Terus Belajar</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11320/11320937.png" alt="Closing" class="page-img" />
          <p>Pasar modal bukan tempat cari kaya cepat, tapi tempat tumbuh bersama pengetahuan. Belajar → Praktik → Evaluasi.</p>
          <br><h4>Contoh:</h4>
          <p>Buat jurnal investasi: kapan beli, kenapa beli, hasilnya gimana. Pelajari pola kamu sendiri.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 10</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'kebiasaanmenabung') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Kebiasaan Menabung</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3467/3467835.png" alt="Menabung" class="page-img" />
          <p><strong>Kategori:</strong> Keuangan Pribadi</p>
          <p><strong>Deskripsi:</strong> E-book ini membantu kamu membangun kebiasaan menabung yang konsisten dan efektif, meskipun penghasilan pas-pasan. Dilengkapi strategi praktis & studi kasus sederhana.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenapa Harus Menabung?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9511/9511113.png" alt="Kenapa Menabung" class="page-img" />
          <p>Menabung bukan soal jumlah, tapi soal kebiasaan. Menabung memberikan rasa aman finansial dan menjadi fondasi hidup tenang.</p>
          <br><h4>Contoh:</h4>
          <p>Ada kejadian darurat (HP rusak, keluarga sakit) → tabungan jadi penyelamat agar tidak berutang.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Mulai dari Kecil, Tapi Konsisten</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10848/10848647.png" alt="Konsisten Menabung" class="page-img" />
          <p>Tak perlu menunggu gaji besar. Cukup mulai dari Rp5.000–Rp10.000/hari secara rutin, lama-lama akan terkumpul besar.</p>
          <br><h4>Contoh:</h4>
          <p>Menabung Rp10.000/hari selama 1 tahun = Rp3.650.000, cukup untuk darurat atau modal usaha kecil.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Teknik Amplop & Tabungan Otomatis</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3829/3829986.png" alt="Amplop Tabungan" class="page-img" />
          <p>Pakai sistem amplop untuk pisahkan pengeluaran & tabungan. Gunakan fitur autodebet agar tabungan langsung tersimpan di awal gajian.</p>
          <br><h4>Contoh:</h4>
          <p>Gaji masuk ke rekening → otomatis Rp300.000 langsung masuk ke tabungan digital khusus tanpa harus ingat.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Menabung Sesuai Tujuan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7891/7891463.png" alt="Tujuan Tabungan" class="page-img" />
          <p>Menabung tanpa tujuan membuatmu mudah tergoda. Tetapkan target: dana darurat, gadget, liburan, atau modal usaha.</p>
          <br><h4>Contoh:</h4>
          <p>Tulis di tabungan: "Dana Motor Baru - Target 6 juta dalam 6 bulan" → jadi lebih termotivasi dan terarah.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Hindari 3 Kesalahan Ini!</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9251/9251369.png" alt="Kesalahan Menabung" class="page-img" />
          <p>Kesalahan umum: menabung sisa uang, tabungan digabung dengan rekening utama, dan sering tarik tabungan karena tidak disiplin.</p>
          <br><h4>Contoh:</h4>
          <p>Jika selalu menabung di akhir bulan dari sisa gaji → biasanya tidak ada yang tersisa. Solusi: tabung dulu di awal gajian.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Bikin Menabung Jadi Menyenangkan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7794/7794840.png" alt="Fun Saving" class="page-img" />
          <p>Gunakan tantangan visual (habit tracker), tabungan koin, atau fitur gamifikasi dari aplikasi keuangan untuk bikin seru & konsisten.</p>
          <br><h4>Contoh:</h4>
          <p>Cetak tabel tabungan 52 minggu → setiap minggu simpan jumlah tertentu & centang → jadi tantangan dan kebanggaan!</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Penutup: Menabung adalah Gaya Hidup</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9139/9139683.png" alt="Lifestyle Saving" class="page-img" />
          <p>Menabung bukan cuma keuangan, tapi mindset. Mulai dari kecil, disiplin, dan terarah → kamu akan lebih siap menghadapi masa depan.</p>
          <br><h4>Contoh:</h4>
          <p>“Gue nggak kaya, tapi punya tabungan yang bikin tenang.” – itulah kekayaan sejati.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'danadarurat') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Dimana Menyimpan Dana Darurat?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3652/3652191.png" alt="Dana Darurat" class="page-img" />
          <p><strong>Kategori:</strong> Manajemen Keuangan</p>
          <p><strong>Deskripsi:</strong> E-book ini membahas strategi menyimpan dana darurat secara aman, likuid, dan tetap menguntungkan. Cocok untuk siapa pun yang ingin finansialnya lebih siap menghadapi kejadian tak terduga.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Apa Itu Dana Darurat?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11790/11790941.png" alt="Definisi Dana Darurat" class="page-img" />
          <p>Dana darurat adalah uang yang disimpan khusus untuk keadaan mendesak seperti sakit, kehilangan pekerjaan, atau kecelakaan.</p>
          <br><h4>Contoh:</h4>
          <p>Misal kamu kehilangan pekerjaan mendadak, dana darurat bisa menopang hidup selama 3–6 bulan ke depan tanpa utang.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Berapa Jumlah Ideal Dana Darurat?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4727/4727294.png" alt="Jumlah Ideal" class="page-img" />
          <p>Idealnya, dana darurat = 3–6 kali pengeluaran bulanan. Jika kamu single: 3x. Jika sudah menikah/berkeluarga: 6–12x.</p>
          <br><h4>Contoh:</h4>
          <p>Pengeluaran Rp3 juta/bulan → target dana darurat minimal Rp9 juta – Rp18 juta.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Syarat Tempat Menyimpan Dana Darurat</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2956/2956725.png" alt="Syarat Tempat Aman" class="page-img" />
          <p>Pilih tempat yang <strong>aman</strong>, <strong>likuid</strong> (mudah dicairkan), dan <strong>tidak mudah tergoda diambil</strong>.</p>
          <br><h4>Contoh:</h4>
          <p>Rekening khusus tanpa kartu ATM lebih aman daripada gabung dengan rekening utama.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Rekomendasi Tempat Menyimpan Dana Darurat</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1532/1532556.png" alt="Tempat Dana" class="page-img" />
          <ul>
            <li>✅ Rekening tabungan terpisah</li>
            <li>✅ E-wallet dengan bunga (DANA, ShopeePay Later Investment, dll)</li>
            <li>✅ Deposito jangka pendek (1–3 bulan)</li>
            <li>✅ Reksadana Pasar Uang</li>
          </ul>
          <br><h4>Contoh:</h4>
          <p>Kamu simpan Rp10 juta di Reksadana Pasar Uang → tetap bisa dicairkan dalam 1–2 hari & dapat bunga 4–6% per tahun.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Tempat yang Harus Dihindari</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/992/992651.png" alt="Jangan Taruh Di Sini" class="page-img" />
          <p>Hindari menyimpan dana darurat di:</p>
          <ul>
            <li>❌ Saham atau crypto (terlalu fluktuatif)</li>
            <li>❌ Bisnis teman (tidak likuid & berisiko)</li>
            <li>❌ Rekening utama yang sering kamu pakai</li>
          </ul>
          <br><h4>Contoh:</h4>
          <p>Menaruh dana darurat di crypto → saat butuh mendadak, nilai bisa turun drastis. Risiko tinggi = bukan pilihan tepat untuk darurat.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Penutup: Dana Darurat Adalah Fondasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3262/3262964.png" alt="Dana Aman" class="page-img" />
          <p>Sebelum investasi atau beli aset, pastikan dana darurat kamu aman. Ini adalah pondasi agar kamu tidak panik saat krisis.</p>
          <br><h4>Contoh:</h4>
          <p>Investor cerdas punya strategi, tapi yang punya dana darurat, punya ketenangan.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'caradanaDarurat') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Cara Menentukan Dana Darurat</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4350/4350053.png" alt="Tentukan Dana Darurat" class="page-img" />
          <p><strong>Kategori:</strong> Manajemen Keuangan</p>
          <p><strong>Deskripsi:</strong> Panduan praktis untuk menghitung dan menetapkan jumlah dana darurat berdasarkan kebutuhan personal dan kondisi hidup. Wajib dibaca bagi siapa pun yang ingin stabil secara finansial.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenapa Dana Darurat Itu Penting?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/5826/5826276.png" alt="Kenapa Dana Darurat" class="page-img" />
          <p>Dana darurat mencegah kamu terjebak utang saat menghadapi kondisi tak terduga seperti PHK, kecelakaan, atau kebutuhan mendesak lainnya.</p>
          <br><h4>Contoh:</h4>
          <p>Tanpa dana darurat, kamu mungkin harus ambil pinjaman bunga tinggi untuk biaya rumah sakit.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Rumus Umum Dana Darurat</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4753/4753110.png" alt="Rumus Dana Darurat" class="page-img" />
          <p>Gunakan rumus:
            <br><strong>Dana Darurat = Pengeluaran Bulanan x Durasi Aman</strong>
            <br>Durasi aman tergantung status pribadi:
            <ul>
              <li>Single: 3–6 bulan</li>
              <li>Menikah: 6–9 bulan</li>
              <li>Menikah + anak: 9–12 bulan</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Pengeluaran Rp4 juta/bulan, menikah + anak → 4 juta x 12 = Rp48 juta target dana darurat.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Komponen Pengeluaran yang Harus Dihitung</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4149/4149647.png" alt="Pengeluaran" class="page-img" />
          <p>Hitung hanya pengeluaran wajib seperti:
            <ul>
              <li>🛒 Makan dan kebutuhan harian</li>
              <li>🏠 Sewa/kredit rumah</li>
              <li>🚗 Transportasi</li>
              <li>🍼 Biaya anak (jika ada)</li>
              <li>💡 Listrik, air, internet</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Jangan masukkan liburan, beli baju, atau ngopi. Fokus hanya yang perlu untuk bertahan hidup.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Evaluasi & Revisi Berkala</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4369/4369762.png" alt="Evaluasi Dana Darurat" class="page-img" />
          <p>Kondisi hidup berubah → dana darurat juga harus dievaluasi minimal tiap 6 bulan sekali.</p>
          <br><h4>Contoh:</h4>
          <p>Dulu pengeluaran Rp3 juta, sekarang Rp5 juta. Dana darurat juga harus ditambah sesuai kondisi terbaru.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Penutup: Dana Darurat = Pondasi Finansial</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4076/4076506.png" alt="Penutup Dana" class="page-img" />
          <p>Sebelum kamu investasi, belanja besar, atau mulai bisnis, pastikan kamu punya dana darurat. Ini adalah tameng utama dari stres finansial dan ketidaksiapan.</p>
          <br><h4>Contoh:</h4>
          <p>“Uangmu bukan uangmu jika kamu nggak punya dana darurat.”</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 6</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'gayahidupkredit') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Bahaya Cicilan & Gaya Hidup Kredit</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1164/1164544.png" alt="Cicilan Kredit" class="page-img" />
          <p><strong>Kategori:</strong> Literasi Keuangan</p>
          <p><strong>Deskripsi:</strong> E-book ini membahas jebakan gaya hidup kredit, bahaya cicilan konsumtif, dan bagaimana mengelola keuangan dengan sehat tanpa tergantung pada utang. Cocok bagi siapa pun yang ingin merdeka secara finansial.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Gaya Hidup Kredit di Era Digital</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4236/4236541.png" alt="Gaya Hidup Kredit" class="page-img" />
          <p>PayLater, cicilan 0%, dan kartu kredit jadi gaya hidup baru. Sayangnya, ini membuat banyak orang merasa mampu beli sesuatu yang sebenarnya belum mampu.</p>
          <br><h4>Contoh:</h4>
          <p>Beli HP 15 juta pakai cicilan 24 bulan. Setiap bulan merasa “mampu”, tapi tabungan nggak pernah nambah.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Bahaya Cicilan Konsumtif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2740/2740654.png" alt="Bahaya Cicilan" class="page-img" />
          <p>Cicilan untuk barang konsumtif (bukan produktif) hanya menggerogoti pemasukan. Tidak menghasilkan uang, hanya menambah beban.</p>
          <br><h4>Contoh:</h4>
          <p>Cicilan motor mahal hanya untuk gaya. Setelah lunas, motor rusak dan nilainya turun drastis.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Ilusi Kemampuan Finansial</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8788/8788777.png" alt="Ilusi Mampu" class="page-img" />
          <p>Dengan cicilan, orang merasa mampu karena “cuma 300 ribu per bulan”. Padahal penghasilan belum stabil dan darurat tidak siap.</p>
          <br><h4>Contoh:</h4>
          <p>Gaji Rp4 juta, cicilan total Rp2 juta. Sisa Rp2 juta harus cukup untuk semua kebutuhan. Rawan stres & gali lubang tutup lubang.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Tips Keluar dari Gaya Hidup Kredit</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4687/4687030.png" alt="Keluar Cicilan" class="page-img" />
          <p>
            <ul>
              <li>Stop cicilan baru</li>
              <li>Cicil bayar utang paling besar dulu (metode avalanche)</li>
              <li>Bangun dana darurat</li>
              <li>Pakai sistem amplop untuk kebutuhan harian</li>
              <li>Upgrade gaya hidup terakhir, bukan pertama</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Gunakan bonus akhir tahun untuk lunasi cicilan, bukan beli barang baru.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Penutup: Kaya Itu Bukan dari Barang, Tapi Kendali</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3246/3246776.png" alt="Mandiri Finansial" class="page-img" />
          <p>Tujuan finansial bukan sekadar terlihat kaya, tapi benar-benar merdeka dari beban utang. Gaya hidup bebas cicilan membuat kamu punya kontrol atas hidupmu.</p>
          <br><h4>Contoh:</h4>
          <p>“Kalau bisa beli tanpa cicilan, itu baru tanda mampu.”</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 6</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'snowballvavalache') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Snowball vs Avalanche: Strategi Melunasi Utang</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2773/2773180.png" alt="Debt Strategy" class="page-img" />
          <p><strong>Kategori:</strong> Manajemen Utang & Finansial</p>
          <p><strong>Deskripsi:</strong> E-book ini membahas dua strategi populer dalam melunasi utang: Snowball dan Avalanche. Kamu akan belajar cara kerja masing-masing metode, kelebihan, kekurangan, dan kapan sebaiknya digunakan.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenapa Strategi Bayar Utang Itu Penting?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1482/1482832.png" alt="Urgensi Utang" class="page-img" />
          <p>Tanpa strategi yang tepat, utang bisa menumpuk dan membuat kamu stuck dalam siklus gali lubang tutup lubang. Maka, perlu sistem yang terukur dan terarah.</p>
          <br><h4>Contoh:</h4>
          <p>Seseorang punya 4 utang, tapi karena tidak pakai metode, hanya bayar minimum semuanya → total bunga makin besar tiap bulan.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Apa Itu Metode Snowball?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3891/3891607.png" alt="Snowball" class="page-img" />
          <p>Snowball = fokus melunasi utang dari yang terkecil ke terbesar, tanpa peduli bunga. Tujuannya membangun momentum dan rasa percaya diri.</p>
          <br><h4>Contoh:</h4>
          <p>Utang A: Rp500.000, Utang B: Rp1 juta, Utang C: Rp2 juta  
          → Fokus lunasi A dulu, lalu lanjut ke B, dan seterusnya.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Kapan Gunakan Metode Snowball?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Snowball Kapan" class="page-img" />
          <p>Metode ini cocok jika kamu:
            <ul>
              <li>Mudah kehilangan motivasi</li>
              <li>Suka lihat hasil cepat</li>
              <li>Punya banyak utang kecil</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Seseorang melunasi 2 utang kecil dalam 1 bulan → merasa lebih ringan dan semangat bayar yang besar.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Apa Itu Metode Avalanche?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4052/4052984.png" alt="Avalanche" class="page-img" />
          <p>Avalanche = fokus bayar utang dengan bunga tertinggi dulu → efisien secara matematis karena mengurangi total bunga.</p>
          <br><h4>Contoh:</h4>
          <p>Utang A: Rp1 juta (bunga 25%), Utang B: Rp2 juta (bunga 10%)  
          → Fokus lunasi A dulu meskipun nominalnya lebih kecil dari B.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Kapan Gunakan Metode Avalanche?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1900/1900599.png" alt="Avalanche Strategy" class="page-img" />
          <p>Metode ini cocok jika kamu:
            <ul>
              <li>Punya utang bunga tinggi (kartu kredit, pinjol)</li>
              <li>Fokus pada penghematan jangka panjang</li>
              <li>Suka perhitungan rasional daripada emosional</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Dalam 1 tahun, metode avalanche bisa menghemat bunga hingga Rp2 juta dibanding snowball, tergantung utang.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Mana yang Terbaik Untukmu?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1995/1995671.png" alt="Pilih Strategi" class="page-img" />
          <p>
            Tidak ada metode yang salah. Pilih sesuai dengan kepribadian dan kondisi keuanganmu:
            <ul>
              <li>Snowball = cepat merasa berhasil</li>
              <li>Avalanche = lebih hemat secara total</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Gabungkan keduanya: mulai dengan snowball → setelah dapat semangat, lanjutkan dengan avalanche.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'kartukreditbijak') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Cara Gunakan Kartu Kredit Secara Bijak</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7203/7203996.png" alt="Kartu Kredit" class="page-img" />
          <p><strong>Kategori:</strong> Manajemen Keuangan</p>
          <p><strong>Deskripsi:</strong> E-book ini mengajarkan cara menggunakan kartu kredit dengan cerdas tanpa terjerat utang. Cocok untuk pemula maupun pengguna aktif yang ingin lebih bijak secara finansial.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Apa Itu Kartu Kredit?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4334/4334566.png" alt="Definisi Kartu Kredit" class="page-img" />
          <p>Kartu kredit adalah alat pembayaran yang memungkinkan kamu bertransaksi terlebih dahulu, lalu membayar belakangan sesuai tagihan.</p>
          <br><h4>Contoh:</h4>
          <p>Kamu belanja Rp500.000 dengan kartu kredit hari ini, tapi bayar tagihannya bulan depan ke bank penerbit kartu.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Manfaat Kartu Kredit Jika Digunakan Bijak</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6555/6555997.png" alt="Manfaat" class="page-img" />
          <p>Manfaat kartu kredit antara lain:
            <ul>
              <li>Cashback & poin reward</li>
              <li>Diskon eksklusif</li>
              <li>Bayar belakangan tanpa bunga (jika lunas tepat waktu)</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Pakai kartu kredit untuk beli tiket Rp1 juta, dapat cashback 5% = hemat Rp50.000 jika dilunasi di bulan yang sama.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Risiko Jika Tidak Bijak</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/7165/7165792.png" alt="Risiko Kartu Kredit" class="page-img" />
          <p>Kartu kredit bisa jadi jebakan jika:
            <ul>
              <li>Hanya bayar minimum payment</li>
              <li>Belanja impulsif tanpa kontrol</li>
              <li>Tidak tahu tanggal jatuh tempo</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Tagihan Rp3 juta → hanya bayar minimum Rp300.000 → sisanya berbunga hingga puluhan % per tahun.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Tips Menggunakan Kartu Kredit dengan Bijak</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/984/984228.png" alt="Tips Bijak" class="page-img" />
          <p>
            <ul>
              <li>Lunasi 100% tagihan sebelum jatuh tempo</li>
              <li>Gunakan hanya untuk kebutuhan, bukan gaya hidup</li>
              <li>Catat semua transaksi harian</li>
              <li>Batasi penggunaan maksimal 30% dari limit</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Limit kamu Rp10 juta → batasi belanja maksimal Rp3 juta untuk jaga rasio kredit tetap sehat.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Apakah Semua Orang Perlu Kartu Kredit?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/631/631165.png" alt="Perlu atau Tidak" class="page-img" />
          <p>Tidak semua orang perlu kartu kredit. Gunakan jika:
            <ul>
              <li>Sudah punya penghasilan tetap</li>
              <li>Bisa mengelola keuangan dengan disiplin</li>
              <li>Tahu cara kerja dan risikonya</li>
            </ul>
          </p>
          <br><h4>Contoh:</h4>
          <p>Pelajar atau mahasiswa lebih baik menunggu sampai punya income rutin sebelum menggunakan kartu kredit.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 6</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'utangproduktif') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Utang Produktif vs Konsumtif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10396/10396183.png" alt="Utang" class="page-img" />
          <p><strong>Kategori:</strong> Edukasi Finansial</p>
          <p><strong>Deskripsi:</strong> Pelajari perbedaan antara utang produktif yang bisa mempercepat tujuan finansial, dan utang konsumtif yang justru bisa menyeret kamu ke dalam masalah keuangan.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Apa Itu Utang Produktif?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9068/9068784.png" alt="Utang Produktif" class="page-img" />
          <p>Utang produktif adalah utang yang digunakan untuk hal yang menghasilkan atau meningkatkan aset/pendapatan.</p>
          <br><h4>Contoh:</h4>
          <p>Pinjaman modal usaha, cicilan alat kerja (kamera untuk freelancer), atau KPR rumah sewa yang bisa disewakan kembali.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Apa Itu Utang Konsumtif?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6591/6591534.png" alt="Utang Konsumtif" class="page-img" />
          <p>Utang konsumtif adalah utang yang digunakan untuk membeli barang/jasa yang habis pakai dan tidak menghasilkan nilai tambah.</p>
          <br><h4>Contoh:</h4>
          <p>Pinjaman paylater untuk beli baju, cicilan HP terbaru untuk gengsi, atau kredit liburan tanpa ada manfaat jangka panjang.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Tanda Kamu Terjebak Utang Konsumtif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9267/9267078.png" alt="Tanda Bahaya" class="page-img" />
          <ul>
            <li>Selalu cicil barang konsumtif</li>
            <li>Sering ambil paylater untuk hal tidak penting</li>
            <li>Gaji habis hanya untuk bayar utang bulanan</li>
          </ul>
          <br><h4>Contoh:</h4>
          <p>Gaji Rp4 juta, tapi harus bayar cicilan gadget, fashion, dan makan online sampai Rp3,5 juta.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Kapan Utang Produktif Menjadi Berbahaya?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8981/8981111.png" alt="Risiko" class="page-img" />
          <p>Utang produktif bisa menjadi beban jika:</p>
          <ul>
            <li>Tanpa perhitungan cash flow</li>
            <li>Bisnis yang dibiayai gagal</li>
            <li>Utang terlalu besar dibanding penghasilan</li>
          </ul>
          <br><h4>Contoh:</h4>
          <p>Pinjam Rp50 juta untuk usaha tanpa riset pasar → bisnis gagal → utang tetap harus dibayar dengan gaji bulanan.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Cara Bijak Mengelola Utang</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8373/8373622.png" alt="Kelola Utang" class="page-img" />
          <ul>
            <li>Pastikan rasio utang maksimal 30% dari penghasilan</li>
            <li>Bedakan kebutuhan vs keinginan sebelum ambil cicilan</li>
            <li>Gunakan utang untuk hal yang bisa balik modal atau hasil</li>
          </ul>
          <br><h4>Contoh:</h4>
          <p>Punya gaji Rp5 juta → maksimal total cicilan sebaiknya Rp1,5 juta per bulan agar tetap sehat secara finansial.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 6</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}


if (page === 'tingkatpenghasilan') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Strategi Tingkatkan Penghasilan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4213/4213099.png" alt="Income Growth" class="page-img" />
          <p><strong>Kategori:</strong> Finansial & Produktivitas</p>
          <p><strong>Deskripsi:</strong> Panduan langkah demi langkah untuk menaikkan penghasilan lewat pekerjaan utama, side hustle, skill baru, dan mindset yang tepat.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Evaluasi Sumber Penghasilan Saat Ini</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/12519/12519689.png" alt="Evaluate Income" class="page-img" />
          <p>Sebelum meningkatkan, pahami dulu dari mana saja penghasilanmu saat ini, dan apakah bisa dimaksimalkan lebih jauh.</p>
          <br><h4>Contoh:</h4>
          <p>Kamu kerja sebagai CS, tapi juga jago desain. Apakah kamu bisa mulai tawarkan jasa desain untuk tambahan income?</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Naikkan Value di Pekerjaan Utama</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9609/9609237.png" alt="Naik Gaji" class="page-img" />
          <p>Cara tercepat untuk meningkatkan penghasilan adalah dengan meningkatkan value kamu di tempat kerja saat ini.</p>
          <br><h4>Contoh:</h4>
          <p>Upgrade skill Excel, ambil tanggung jawab baru, dan tunjukkan kontribusi nyata → ini bisa jadi dasar negosiasi kenaikan gaji.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Bangun Income Sampingan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/1055/1055666.png" alt="Side Hustle" class="page-img" />
          <p>Jangan hanya mengandalkan 1 sumber penghasilan. Mulai dari jasa freelance, jualan digital, atau afiliasi.</p>
          <br><h4>Contoh:</h4>
          <p>Buka jasa edit video, jual template desain, atau join program affiliate seperti Shopee/Tokopedia.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Investasi pada Skill Bernilai Tinggi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11728/11728947.png" alt="Invest Skill" class="page-img" />
          <p>Skill seperti desain, copywriting, coding, dan digital marketing bisa langsung diuangkan dan dicari pasar global.</p>
          <br><h4>Contoh:</h4>
          <p>Belajar dasar UI/UX, buat portofolio di Behance, lalu tawarkan jasamu di Fiverr/Upwork.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Manfaatkan Platform Digital</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11685/11685626.png" alt="Platform" class="page-img" />
          <p>Gunakan media sosial, marketplace, atau platform freelance untuk menjual skill/produk digital kamu.</p>
          <br><h4>Contoh:</h4>
          <p>Buat konten edukasi di TikTok, arahkan audiens ke link jualan digitalmu (template, e-book, jasa, dsb).</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Bangun Portofolio & Jejak Digital</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/5953/5953396.png" alt="Portofolio" class="page-img" />
          <p>Portofolio online & jejak digital akan mempermudah kamu dalam mendapatkan klien atau tawaran kerja.</p>
          <br><h4>Contoh:</h4>
          <p>Upload hasil desainmu di Instagram + Notion. Saat ditanya client, kamu tinggal kirim link portofolio online.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Bab 7: Ubah Mindset dari Konsumtif ke Produktif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/8146/8146710.png" alt="Mindset" class="page-img" />
          <p>Peningkatan penghasilan tidak akan terasa kalau gaya hidup boros. Fokuslah pada penggunaan uang yang memperbesar potensi earning-mu.</p>
          <br><h4>Contoh:</h4>
          <p>Daripada beli gadget baru tiap tahun, alokasikan Rp300.000/bulan untuk kursus skill yang bisa menghasilkan lebih besar.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'kebocorankeuangan') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Membongkar Kebocoran Keuangan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9917/9917124.png" alt="Leak Money" class="page-img" />
          <p><strong>Kategori:</strong> Manajemen Keuangan</p>
          <p><strong>Deskripsi:</strong> E-book ini membahas kebocoran keuangan yang sering terjadi tanpa disadari, bagaimana mengenalinya, menghitungnya, dan menutupnya untuk mengembalikan kestabilan finansial pribadi.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Apa Itu Kebocoran Keuangan?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9980/9980542.png" alt="Definition" class="page-img" />
          <p>Kebocoran keuangan adalah pengeluaran kecil namun konsisten yang tidak disadari dan merusak cash flow bulanan.</p>
          <br><h4>Contoh:</h4>
          <p>Langganan yang tidak digunakan, jajan harian kecil, dan biaya transfer antar bank bisa jadi ‘kebocoran’ rutin.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Jenis Kebocoran yang Umum Terjadi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4341/4341139.png" alt="Types" class="page-img" />
          <p>Termasuk biaya impulsif, gaya hidup digital (game, top-up, streaming), dan pengeluaran ‘tidak terasa’ seperti ojek online & kopi harian.</p>
          <br><h4>Contoh:</h4>
          <p>Beli kopi Rp25.000 setiap hari kerja = Rp500.000 per bulan.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Cara Mengidentifikasi Kebocoran</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10526/10526599.png" alt="Detect" class="page-img" />
          <p>Catat semua pengeluaran kecil selama 30 hari, kelompokkan berdasarkan kategori, dan evaluasi pengeluaran yang tidak penting.</p>
          <br><h4>Contoh:</h4>
          <p>Gunakan aplikasi catatan keuangan seperti Money Lover atau spreadsheet harian untuk tracking.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Menutup Kebocoran Secara Bertahap</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11768/11768271.png" alt="Fix Leak" class="page-img" />
          <p>Kurangi atau hentikan langganan, atur limit belanja impulsif, dan buat sistem notifikasi atau reminder pengeluaran.</p>
          <br><h4>Contoh:</h4>
          <p>Langganan 3 platform streaming? Pilih 1 saja dan hemat Rp100.000-Rp150.000 per bulan.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Ubah Kebocoran Jadi Tabungan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10792/10792633.png" alt="Convert" class="page-img" />
          <p>Setiap pengeluaran yang berhasil dihemat bisa langsung dialihkan ke tabungan atau dana darurat untuk memperbaiki kondisi finansial.</p>
          <br><h4>Contoh:</h4>
          <p>Berhasil menghemat Rp300.000 per bulan? Simpan otomatis ke rekening berbeda setiap tanggal gajian.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Penutup: Kecil Tapi Berbahaya</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9471/9471839.png" alt="Conclusion" class="page-img" />
          <p>Kebocoran keuangan ibarat lubang kecil di kapal. Tak terlihat, tapi jika dibiarkan bisa tenggelamkan semuanya. Sadari, atasi, dan ubah jadi kekuatan finansial.</p>
          <br><h4>Contoh:</h4>
          <p>Dari pengeluaran kecil tak terasa, kamu bisa menyisihkan hingga jutaan per tahun untuk investasi atau dana darurat.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'aturgajieffektif') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Mengatur Gaji Secara Efektif</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4357/4357761.png" alt="Manage Salary" class="page-img" />
          <p><strong>Kategori:</strong> Manajemen Keuangan Pribadi</p>
          <p><strong>Deskripsi:</strong> Pelajari cara mengelola gaji agar tidak habis di tengah bulan. Panduan ini mencakup teknik alokasi, strategi menabung, dan tips pengeluaran cerdas agar kamu bisa mencapai tujuan finansial.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenapa Gaji Selalu Habis?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9923/9923997.png" alt="Salary Gone" class="page-img" />
          <p>Banyak orang merasa gaji ‘tidak cukup’ padahal masalah utamanya bukan jumlah, tapi cara kelola yang tidak terencana.</p>
          <br><h4>Contoh:</h4>
          <p>Tanpa perencanaan, gaji langsung habis untuk kebutuhan konsumtif, cicilan, atau nongkrong tanpa batasan.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Sistem 50/30/20</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2329/2329085.png" alt="Budgeting Rule" class="page-img" />
          <p>Gunakan metode alokasi: 50% kebutuhan, 30% keinginan, 20% tabungan/investasi.</p>
          <br><h4>Contoh:</h4>
          <p>Gaji Rp5 juta: Rp2,5 juta untuk kebutuhan, Rp1,5 juta untuk keinginan, Rp1 juta untuk tabungan atau investasi.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Pisahkan Rekening Gaji & Tabungan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2971/2971300.png" alt="Bank Split" class="page-img" />
          <p>Miliki minimal 2 rekening: satu untuk pengeluaran harian dan satu khusus tabungan agar tidak tercampur.</p>
          <br><h4>Contoh:</h4>
          <p>Setiap gajian langsung transfer 20% ke rekening khusus yang tidak memiliki kartu ATM.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Otomatiskan Pengeluaran Penting</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4743/4743275.png" alt="Automation" class="page-img" />
          <p>Atur pembayaran otomatis untuk cicilan, tagihan, dan tabungan agar tidak lupa dan dana tidak terpakai duluan.</p>
          <br><h4>Contoh:</h4>
          <p>Gunakan fitur auto-debit untuk menabung atau bayar cicilan tiap tanggal 1 agar aman dan teratur.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Hindari Gaya Hidup Inflasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/10415/10415008.png" alt="Lifestyle Trap" class="page-img" />
          <p>Naik gaji bukan berarti naik gaya hidup. Tambah tabungan, bukan konsumsi.</p>
          <br><h4>Contoh:</h4>
          <p>Gaji naik Rp500.000, tetap hidup seperti sebelumnya dan tambahkan nominal tabungan dari selisih kenaikan itu.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Penutup: Gaji Bukan untuk Dihabiskan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9917/9917159.png" alt="Closing" class="page-img" />
          <p>Kamu bekerja keras untuk gaji bulanan, jadi pastikan uangmu bekerja juga untuk kamu. Rencanakan, alokasikan, dan nikmati hasilnya dengan cerdas.</p>
          <br><h4>Contoh:</h4>
          <p>Dengan strategi yang tepat, gaji Rp3 juta pun bisa mencukupi kebutuhan, menabung, bahkan investasi.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'anggaranbulanan') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Cara Membuat Anggaran Bulanan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4974/4974980.png" alt="Monthly Budget" class="page-img" />
          <p><strong>Kategori:</strong> Manajemen Keuangan Pribadi</p>
          <p><strong>Deskripsi:</strong> Pelajari langkah-langkah membuat anggaran bulanan yang realistis, fleksibel, dan sesuai kebutuhan. Cocok untuk kamu yang ingin lebih disiplin dalam mengatur keuangan pribadi maupun rumah tangga.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Kenapa Anggaran Itu Penting?</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9971/9971931.png" alt="Why Budget" class="page-img" />
          <p>Anggaran membantu kamu mengendalikan pengeluaran, mencapai tujuan keuangan, dan menghindari gaya hidup boros.</p>
          <br><h4>Contoh:</h4>
          <p>Tanpa anggaran, kamu bisa menghabiskan uang untuk hal tidak penting dan kehabisan saat tagihan datang.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Catat Semua Penghasilan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2843/2843649.png" alt="Income" class="page-img" />
          <p>Langkah awal membuat anggaran: tulis semua sumber penghasilan tetap maupun tidak tetap setiap bulan.</p>
          <br><h4>Contoh:</h4>
          <p>Gaji bulanan, bonus, hasil freelance, atau uang tambahan dari jualan online.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Kelompokkan Pengeluaran</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3794/3794486.png" alt="Expenses" class="page-img" />
          <p>Bagi pengeluaran menjadi: kebutuhan pokok, tagihan, tabungan, cicilan, dan hiburan. Gunakan persentase atau nominal tetap.</p>
          <br><h4>Contoh:</h4>
          <p>Rp1 juta untuk makan, Rp700 ribu untuk transport, Rp500 ribu untuk tabungan, Rp300 ribu untuk hiburan.</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Gunakan Metode Amplop atau Aplikasi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/4462/4462864.png" alt="Budget Method" class="page-img" />
          <p>Pilih metode sesuai gaya hidupmu: sistem amplop (uang fisik), spreadsheet, atau aplikasi keuangan digital.</p>
          <br><h4>Contoh:</h4>
          <p>Gunakan aplikasi seperti DompetKu atau Money Manager untuk mencatat real-time semua transaksi harianmu.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Sisihkan untuk Dana Tak Terduga</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6484/6484656.png" alt="Emergency Fund" class="page-img" />
          <p>Selalu sediakan alokasi untuk kebutuhan mendadak seperti servis kendaraan, obat, atau keperluan mendesak lainnya.</p>
          <br><h4>Contoh:</h4>
          <p>Alokasikan Rp200.000/bulan sebagai dana darurat kecil agar tidak mengganggu pos lainnya.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Bab 6: Evaluasi Setiap Akhir Bulan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9744/9744296.png" alt="Evaluate Budget" class="page-img" />
          <p>Cek kembali pengeluaranmu. Apakah sesuai rencana atau ada yang bocor? Ini akan bantu perbaikan bulan depan.</p>
          <br><h4>Contoh:</h4>
          <p>Bulan ini kamu lebih boros di makanan online → bulan depan tetapkan batas maksimal atau buat meal plan harian.</p>
        </div>

        <div class="page" data-page="8">
          <h2>📌 Penutup: Anggaran Bukan Pembatas, Tapi Pengarah</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/6956/6956676.png" alt="Guide" class="page-img" />
          <p>Anggaran memberi kamu arah, bukan larangan. Dengan kontrol yang baik, kamu bisa hidup nyaman tanpa khawatir keuangan bocor di tengah bulan.</p>
          <br><h4>Contoh:</h4>
          <p>Dengan budget, kamu tetap bisa nongkrong dan beli yang kamu mau, asal sudah dialokasikan di awal.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 8</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'richvspoor') {
  content = `
    <section class="book-container">
      <div class="book-content" id="bookContent">

        <div class="page active" data-page="1">
          <h2>📘 Rich vs Poor Mindset</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/3829/3829578.png" alt="Mindset Cover" class="page-img" />
          <p><strong>Kategori:</strong> Mindset & Finansial</p>
          <p><strong>Deskripsi:</strong> Bedah perbedaan pola pikir orang kaya dan orang miskin. Kenali kebiasaan, cara mengambil keputusan, hingga cara memandang uang agar kamu bisa mulai membentuk pola pikir yang mengarah ke kebebasan finansial.</p>
        </div>

        <div class="page" data-page="2">
          <h2>📌 Bab 1: Fokus pada Peluang vs Masalah</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Opportunity vs Problem" class="page-img" />
          <p>Orang kaya fokus mencari solusi & peluang. Orang miskin seringkali terjebak dalam masalah dan rasa takut gagal.</p>
          <br><h4>Contoh:</h4>
          <p>Situasi krisis: Si A (mindset kaya) buka layanan online, Si B (mindset miskin) hanya mengeluh kehilangan pekerjaan.</p>
        </div>

        <div class="page" data-page="3">
          <h2>📌 Bab 2: Investasi vs Konsumsi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11104/11104901.png" alt="Invest vs Spend" class="page-img" />
          <p>Mindset kaya menempatkan uang pada aset yang tumbuh. Mindset miskin fokus pada belanja barang konsumtif yang menyusut nilainya.</p>
          <br><h4>Contoh:</h4>
          <p>Uang Rp1 juta → Mindset kaya beli Reksadana. Mindset miskin beli sepatu mahal tanpa kebutuhan.</p>
        </div>

        <div class="page" data-page="4">
          <h2>📌 Bab 3: Bertumbuh Lewat Ilmu</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9433/9433650.png" alt="Learning" class="page-img" />
          <p>Orang kaya haus ilmu dan berani bayar mahal untuk belajar. Orang miskin merasa belajar itu buang waktu atau terlalu mahal.</p>
          <br><h4>Contoh:</h4>
          <p>Mindset kaya ikut kelas bisnis online. Mindset miskin tunggu gratisan atau bilang “nggak perlu belajar, cukup kerja.”</p>
        </div>

        <div class="page" data-page="5">
          <h2>📌 Bab 4: Networking vs Kompetisi</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/2674/2674418.png" alt="Networking" class="page-img" />
          <p>Mindset kaya bangun koneksi, kolaborasi. Mindset miskin iri, bersaing tanpa arah, dan takut berbagi ilmu.</p>
          <br><h4>Contoh:</h4>
          <p>Mindset kaya gabung komunitas bisnis. Mindset miskin takut ditiru atau menganggap semua saingan.</p>
        </div>

        <div class="page" data-page="6">
          <h2>📌 Bab 5: Jangka Panjang vs Instan</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/9743/9743867.png" alt="Long Term" class="page-img" />
          <p>Orang kaya siap sabar menanam dan menunggu hasil. Orang miskin ingin hasil cepat meski tanpa fondasi kuat.</p>
          <br><h4>Contoh:</h4>
          <p>Mindset kaya mulai investasi rutin. Mindset miskin cari “cuan cepat” dari pinjol atau trading tanpa ilmu.</p>
        </div>

        <div class="page" data-page="7">
          <h2>📌 Penutup: Mindset Bisa Diubah</h2>
          <img src="https://cdn-icons-png.flaticon.com/512/11041/11041609.png" alt="Mindset Growth" class="page-img" />
          <p>Kaya atau miskin bukan hanya soal uang, tapi soal cara berpikir. Ubah pola pikir hari ini, dan masa depanmu akan berubah.</p>
          <br><h4>Contoh:</h4>
          <p>Mulai dari hal kecil: alih-alih beli kopi mahal tiap hari, sisihkan dan belajar investasi. Itu langkah awal mindset kaya.</p>
        </div>

      </div>
      <div class="book-footer">
        <button id="prevBtn" class="nav-btn" disabled>⬅️ Kembali</button>
        <span id="pageNumber" class="page-number">1 / 7</span>
        <button id="nextBtn" class="nav-btn">Lanjut ➡️</button>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  initBook(); // Inisialisasi sistem buku
}

if (page === 'promptchatgpt') { 
  content = `<section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">📚 Kumpulan Prompt ChatGPT Terbaik</h2>
    <section style="padding: 2rem; overflow-x: auto;">
      <h3>🔥 600+ Prompt ChatGPT Siap Pakai</h3>
      <table class="announcement-table" style="min-width: 1000px;">
        <thead>
       <tr>
            <th>No</th>
            <th>Kategori</th> 
            <th>Deskripsi</th>
            <th>Salin</th>
          </tr>
        </thead>
        <tbody>
          ${[
            { kategori: "Konten Sosial Media", deskripsi: "Buatkan caption IG yang bikin orang auto share tentang [tema kamu]" },
{ kategori: "Konten Sosial Media", deskripsi: "Tuliskan ide konten harian untuk TikTok bertema [niche kamu]" },
{ kategori: "Konten Sosial Media", deskripsi: "Bikin thread X (Twitter) dengan gaya storytelling tentang [kisah inspiratif / fakta unik]" },
{ kategori: "Konten Sosial Media", deskripsi: "Tuliskan skrip video YouTube Shorts tentang [topik menarik]" },
{ kategori: "Konten Sosial Media", deskripsi: "Buatkan konten lucu + relate tentang kehidupan sehari-hari gen Z" },
{ kategori: "Konten Sosial Media", deskripsi: "Buatkan konten 'unpopular opinion' tentang [topik niche]" },
{ kategori: "Konten Sosial Media", deskripsi: "Tulis pertanyaan kontroversial tapi santai seputar [tema] untuk engagement tinggi" },
{ kategori: "Konten Sosial Media", deskripsi: "Tulis ulang konten viral ini dengan gayaku sendiri: [paste konten]" },
{ kategori: "Konten Sosial Media", deskripsi: "Buat skrip video 60 detik dengan hook di 3 detik pertama" },
{ kategori: "Konten Sosial Media", deskripsi: "Simulasikan konten podcast 2 orang ngobrol santai tentang [tema]" },
{ kategori: "Bisnis & Marketing", deskripsi: "Buatkan copywriting jualan produk [nama produk] agar pembaca langsung tergoda beli" },
{ kategori: "Bisnis & Marketing", deskripsi: "Tulis iklan Facebook Ads yang efektif untuk produk [nama produk]" },
{ kategori: "Bisnis & Marketing", deskripsi: "Tulis teks broadcast WhatsApp jualan yang tidak terasa seperti jualan" },
{ kategori: "Bisnis & Marketing", deskripsi: "Buatkan 5 versi tagline bisnis saya: [deskripsi bisnis]" },
{ kategori: "Bisnis & Marketing", deskripsi: "Tulis pitch singkat 30 detik seolah saya presentasi ke investor" },
{ kategori: "Bisnis & Marketing", deskripsi: "Simulasikan obrolan customer nanya produk dan saya jawab meyakinkan" },
{ kategori: "Bisnis & Marketing", deskripsi: "Buat postingan soft selling tentang [produk/jasa] dengan gaya bercerita" },
{ kategori: "Bisnis & Marketing", deskripsi: "Buat strategi promosi produk digital saya di Instagram selama 7 hari" },
{ kategori: "Bisnis & Marketing", deskripsi: "Tulis script closing penjualan dalam 5 detik terakhir video TikTok" },
{ kategori: "Bisnis & Marketing", deskripsi: "Tulis email marketing singkat tapi powerful untuk penawaran terbatas" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Bantu aku menyusun jadwal harian yang produktif mulai jam [xx]" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Berikan metode sederhana untuk menghindari prokrastinasi" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Tulis afirmasi harian untuk orang yang sedang berjuang" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Buat jurnal malam untuk refleksi diri hari ini" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Tulis morning routine versi orang sukses + versi realistis" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Simulasikan pembicaraan antara saya dan versi ideal diriku di masa depan" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Buat template to-do list berdasarkan prioritas penting vs mendesak" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Bantu buat skrip self-talk positif saat merasa gagal" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Rancang habit tracker mingguan dalam bentuk tabel" },
{ kategori: "Produktivitas & Self-Help", deskripsi: "Berikan tantangan pengembangan diri selama 30 hari" },
{ kategori: "Edukasi", deskripsi: "Jelaskan topik [misal: ekonomi digital] dalam gaya ngobrol ala teman" },
{ kategori: "Edukasi", deskripsi: "Buat thread edukatif Twitter tentang [topik rumit] tapi dikemas ringan" },
{ kategori: "Edukasi", deskripsi: "Bikin kuis cepat 5 soal seputar [topik]" },
{ kategori: "Edukasi", deskripsi: "Tulis fakta menarik tentang sejarah [negara/produk/hal]" },
{ kategori: "Edukasi", deskripsi: "Ubah topik pelajaran [nama pelajaran] menjadi cerita pendek" },
{ kategori: "Edukasi", deskripsi: "Jelaskan konsep [X] pakai analogi sehari-hari yang lucu" },
{ kategori: "Edukasi", deskripsi: "Berikan cheat sheet ringkas seputar [topik]" },
{ kategori: "Edukasi", deskripsi: "Buat infografis dalam bentuk teks untuk tema [X]" },
{ kategori: "Edukasi", deskripsi: "Tulis contoh soal + pembahasan singkat tentang [materi X]" },
{ kategori: "Edukasi", deskripsi: "Jelaskan materi seperti guru TikTok yang santai tapi ngena" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Buat cerita pendek thriller dengan twist mengejutkan" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Tuliskan puisi tentang jatuh cinta di zaman digital" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Simulasikan obrolan antara karakter anime dengan tokoh sejarah" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Tulis plot film horor 2 menit yang bisa viral di YouTube" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Tulis naskah drama 2 orang yang saling curhat di tengah malam" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Buat jokes receh tapi cerdas seputar [tema]" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Ciptakan karakter fiksi lengkap dengan latar belakang dan sifatnya" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Tulis lirik lagu cinta galau dengan gaya indie" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Tulis ide komik strip 3 panel yang relate dengan kehidupan kantor" },
{ kategori: "Kreatif & Hiburan", deskripsi: "Jadikan fakta ilmiah ini sebagai cerita fiksi: [fakta]" },
{ kategori: "Keuangan Pribadi", deskripsi: "Bantu hitung target omzet agar bisa dapat Rp10 juta/bulan dari [produk/jasa]" },
{ kategori: "Keuangan Pribadi", deskripsi: "Buat strategi jualan modal Rp200 ribu sampai balik modal" },
{ kategori: "Keuangan Pribadi", deskripsi: "Tulis cara memulai bisnis digital tanpa modal, cocok untuk pemula" },
{ kategori: "Keuangan Pribadi", deskripsi: "Buat daftar pengeluaran harian dan filter pengeluaran tidak penting" },
{ kategori: "Keuangan Pribadi", deskripsi: "Simulasikan saya jadi freelancer yang ingin mulai dari 0" },
{ kategori: "Keuangan Pribadi", deskripsi: "Jelaskan perbedaan antara aset dan liabilitas pakai contoh sehari-hari" },
{ kategori: "Keuangan Pribadi", deskripsi: "Tulis rencana 1 tahun untuk mencapai kebebasan finansial" },
{ kategori: "Keuangan Pribadi", deskripsi: "Bantu saya membangun brand personal sebagai content creator" },
{ kategori: "Keuangan Pribadi", deskripsi: "Jelaskan cara kerja affiliate marketing untuk pemula" },
{ kategori: "Keuangan Pribadi", deskripsi: "Tulis strategi mengelola uang bulanan bagi yang baru mulai kerja" },
{ kategori: "Strategi Bisnis", deskripsi: "Berikan 10 ide produk digital kekinian yang bisa dijual tanpa stok" },
{ kategori: "Strategi Bisnis", deskripsi: "Tulis analisis SWOT bisnis [bisnis kamu]" },
{ kategori: "Strategi Bisnis", deskripsi: "Buat 3 persona pelanggan ideal untuk produk [nama produk]" },
{ kategori: "Strategi Bisnis", deskripsi: "Simulasikan ide bisnis saya seandainya dijalankan full online" },
{ kategori: "Strategi Bisnis", deskripsi: "Tulis roadmap bisnis dari nol sampai omset 100 juta" },
{ kategori: "Strategi Bisnis", deskripsi: "Buat strategi peluncuran produk baru tanpa budget iklan" },
{ kategori: "Strategi Bisnis", deskripsi: "Tulis perbedaan mendasar antara jualan dan branding" },
{ kategori: "Strategi Bisnis", deskripsi: "Buat strategi kolaborasi untuk bisnis makanan rumahan" },
{ kategori: "Strategi Bisnis", deskripsi: "Tulis ide campaign viral untuk brand kopi lokal" },
{ kategori: "Strategi Bisnis", deskripsi: "Jelaskan cara bangun database customer dari nol" },
{ kategori: "AI & Teknologi", deskripsi: "Buat prompt MidJourney untuk desain poster modern tema [X]" },
{ kategori: "AI & Teknologi", deskripsi: "Tulis prompt ChatGPT untuk menghasilkan artikel SEO tentang [topik]" },
{ kategori: "AI & Teknologi", deskripsi: "Simulasikan penggunaan Notion sebagai dashboard bisnis pribadi" },
{ kategori: "AI & Teknologi", deskripsi: "Buat template content planner di Google Sheets" },
{ kategori: "AI & Teknologi", deskripsi: "Tulis perintah Python sederhana untuk [task harian]" },
{ kategori: "AI & Teknologi", deskripsi: "Jelaskan fungsi tool AI terbaru untuk content creator" },
{ kategori: "AI & Teknologi", deskripsi: "Tulis cara pakai ChatGPT untuk customer service otomatis" },
{ kategori: "AI & Teknologi", deskripsi: "Buat prompt AI untuk generate suara iklan produk" },
{ kategori: "AI & Teknologi", deskripsi: "Ubah data Excel ini menjadi analisis visual: [paste data]" },
{ kategori: "AI & Teknologi", deskripsi: "Tulis workflow bisnis digital hanya dengan bantuan AI" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Kalau saya hidup di abad ke-17, profesi apa yang cocok buat saya?" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Buat ramalan horoskop fiktif tapi lucu dan relate" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Tulis surat cinta seolah saya AI jatuh cinta pada manusia" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Buat dialog karakter dari dunia game dan dunia nyata ketemu" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Tulis naskah iklan produk aneh: odol rasa rendang" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Buat teka-teki logika yang jawabannya tidak terduga" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Tuliskan alasan konyol kenapa alien belum datang ke bumi" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Buatkan skrip prank text yang lucu tapi tidak jahat" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Simulasikan kalau karakter favorit saya kerja di Indomaret" },
{ kategori: "Prompt Seru & Unik", deskripsi: "Tulis parodi lagu terkenal tentang kehidupan mahasiswa" },
{ kategori: "Bonus Viralitas", deskripsi: "Tulis konten storytelling dari sisi korban, penjahat, dan saksi" },
{ kategori: "Bonus Viralitas", deskripsi: "Buat konten 'Before vs After' tentang perubahan hidup" },
{ kategori: "Bonus Viralitas", deskripsi: "Tulis konten 'Jika saya mengulang usia 20 tahun…'" },
{ kategori: "Bonus Viralitas", deskripsi: "Buat caption dengan gaya 3 pilihan: serius, santai, humor" },
{ kategori: "Bonus Viralitas", deskripsi: "Tulis postingan 'Kenapa saya berhenti melakukan [X]'" },
{ kategori: "Bonus Viralitas", deskripsi: "Buat konten 'kesalahan terbesar saya adalah…'" },
{ kategori: "Bonus Viralitas", deskripsi: "Tulis konten 'Yang tidak pernah diajarkan sekolah tapi penting…'" },
{ kategori: "Bonus Viralitas", deskripsi: "Buat konten 'Saya pernah gagal, dan inilah pelajarannya…'" },
{ kategori: "Bonus Viralitas", deskripsi: "Buat konten 'Jika saya punya waktu 1 jam dengan [tokoh X]…'" },
{ kategori: "Bonus Viralitas", deskripsi: "Tulis konten viral bertema nostalgia: [misalnya: masa kecil 90an]" },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Ide konten aesthetic untuk morning routine"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mengoptimalkan waktu kerja dengan metode Pomodoro"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Format konten edukasi yang disukai audiens Gen Z"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mengoptimalkan waktu kerja dengan metode Pomodoro"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Daftar tools AI gratis terbaik untuk kreator konten"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Kata-kata penyemangat untuk kreator konten baru"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Kata-kata penyemangat untuk kreator konten baru"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Desain poster film dengan nuansa vintage"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Kata-kata penyemangat untuk kreator konten baru"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Daftar tools AI gratis terbaik untuk kreator konten"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Konten storytelling viral untuk Reels"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Teknik batching konten agar efisien"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Quotes motivasi pagi untuk membuka hari dengan semangat"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Format konten edukasi yang disukai audiens Gen Z"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Teknik batching konten agar efisien"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Teknik batching konten agar efisien"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Quotes motivasi pagi untuk membuka hari dengan semangat"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Konten storytelling viral untuk Reels"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Kalender konten Instagram selama sebulan untuk brand fashion"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Teknik batching konten agar efisien"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Cara menghindari burnout saat kerja remote"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Formula caption iklan yang menarik perhatian"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Desain poster film dengan nuansa vintage"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi karakter game RPG fantasi"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Format konten edukasi yang disukai audiens Gen Z"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi gaya anime karakter di dunia sihir"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi gaya anime karakter di dunia sihir"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Konten storytelling viral untuk Reels"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Format konten edukasi yang disukai audiens Gen Z"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Ide konten aesthetic untuk morning routine"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mengoptimalkan waktu kerja dengan metode Pomodoro"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Cerita sukses dari nol yang bisa jadi inspirasi konten"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Desain poster film dengan nuansa vintage"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Cara menghindari burnout saat kerja remote"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Cara menghindari burnout saat kerja remote"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Formula caption iklan yang menarik perhatian"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Formula caption iklan yang menarik perhatian"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Cara menghindari burnout saat kerja remote"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi karakter game RPG fantasi"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Konten storytelling viral untuk Reels"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi karakter game RPG fantasi"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Formula caption iklan yang menarik perhatian"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Quotes motivasi pagi untuk membuka hari dengan semangat"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Desain poster film dengan nuansa vintage"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Desain poster film dengan nuansa vintage"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Quotes motivasi pagi untuk membuka hari dengan semangat"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Cerita sukses dari nol yang bisa jadi inspirasi konten"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Cara membangun brand personal dengan konten rutin"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Ide konten aesthetic untuk morning routine"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Kutipan populer yang bisa kamu jadikan konten carousel"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mengoptimalkan waktu kerja dengan metode Pomodoro"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Inspirasi UI/UX app e-commerce modern"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Kata-kata penyemangat untuk kreator konten baru"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mengoptimalkan waktu kerja dengan metode Pomodoro"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Gambar kota masa depan dengan kendaraan terbang"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Cerita sukses dari nol yang bisa jadi inspirasi konten"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Cara menghindari burnout saat kerja remote"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Cara menghindari burnout saat kerja remote"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Inspirasi UI/UX app e-commerce modern"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Daftar tools AI gratis terbaik untuk kreator konten"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Kalender konten Instagram selama sebulan untuk brand fashion"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Teknik batching konten agar efisien"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Cara membangun brand personal dengan konten rutin"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Formula caption iklan yang menarik perhatian"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Cara membangun brand personal dengan konten rutin"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Format konten edukasi yang disukai audiens Gen Z"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi karakter game RPG fantasi"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Desain poster film dengan nuansa vintage"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Konten storytelling viral untuk Reels"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Formula caption iklan yang menarik perhatian"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Konten storytelling viral untuk Reels"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Ide konten aesthetic untuk morning routine"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Cerita sukses dari nol yang bisa jadi inspirasi konten"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Cara membangun brand personal dengan konten rutin"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Teknik batching konten agar efisien"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Kalender konten Instagram selama sebulan untuk brand fashion"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Formula caption iklan yang menarik perhatian"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Inspirasi UI/UX app e-commerce modern"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Quotes motivasi pagi untuk membuka hari dengan semangat"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Cara membangun brand personal dengan konten rutin"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Kalender konten Instagram selama sebulan untuk brand fashion"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Quotes motivasi pagi untuk membuka hari dengan semangat"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi gaya anime karakter di dunia sihir"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Inspirasi UI/UX app e-commerce modern"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mengoptimalkan waktu kerja dengan metode Pomodoro"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi karakter game RPG fantasi"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Daftar tools AI gratis terbaik untuk kreator konten"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Ide konten aesthetic untuk morning routine"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi gaya anime karakter di dunia sihir"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "List kebiasaan produktif ala miliarder"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Konten tentang daily routine ala digital nomad"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Cerita sukses dari nol yang bisa jadi inspirasi konten"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Teknik batching konten agar efisien"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Motivasi visual: ilustrasi perjalanan hidup dalam 5 tahap"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Konten storytelling viral untuk Reels"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Ide konten YouTube untuk pemula dengan modal minim"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Inspirasi UI/UX app e-commerce modern"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Kutipan populer yang bisa kamu jadikan konten carousel"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Format konten edukasi yang disukai audiens Gen Z"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Formula caption iklan yang menarik perhatian"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Kalender konten Instagram selama sebulan untuk brand fashion"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Cara membangun brand personal dengan konten rutin"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Desain feed Instagram yang clean dan konsisten"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Kutipan populer yang bisa kamu jadikan konten carousel"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Challenge 7 hari hidup minimalis untuk media sosial"
  },
  {
    "kategori": "Lifestyle",
    "deskripsi": "Rekomendasi aplikasi life planner terbaik"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Kalender konten Instagram selama sebulan untuk brand fashion"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Kalender konten Instagram selama sebulan untuk brand fashion"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Gaya desain poster promo food & beverage"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Format konten edukasi yang disukai audiens Gen Z"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Cara menghindari burnout saat kerja remote"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi karakter game RPG fantasi"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Quotes motivasi pagi untuk membuka hari dengan semangat"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Cerita sukses dari nol yang bisa jadi inspirasi konten"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Kata-kata penyemangat untuk kreator konten baru"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Teknik copywriting untuk jualan produk digital"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Potret hyper-realistic selebriti di dunia futuristik"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "Kalender konten Instagram selama sebulan untuk brand fashion"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara membuat video cinematic dengan HP"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips menjaga konsistensi upload konten harian"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Cerita sukses dari nol yang bisa jadi inspirasi konten"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Desain poster film dengan nuansa vintage"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Sistem Notion untuk perencanaan konten mingguan"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "AI untuk mengubah naskah menjadi suara manusia"
  },
  {
    "kategori": "Ide Konten",
    "deskripsi": "100 ide konten TikTok untuk niche kecantikan"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Inspirasi UI/UX app e-commerce modern"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Cara membangun brand personal dengan konten rutin"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Strategi soft selling di TikTok yang efektif"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Tips viral untuk mempercepat pertumbuhan akun Instagram"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Cara menggunakan ChatGPT untuk bikin caption menarik"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial menggunakan Midjourney untuk pemula"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Desain poster film dengan nuansa vintage"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Inspirasi UI/UX app e-commerce modern"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Rutinitas kreator sukses dalam mengelola waktu"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Daftar tools AI gratis terbaik untuk kreator konten"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Checklist harian agar tetap fokus bekerja"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Tool AI untuk merancang logo profesional dalam hitungan menit"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Langkah-langkah membuat podcast dari rumah"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Color palette viral untuk brand tahun ini"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Teknik batching konten agar efisien"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Cara mengedit foto ala selebgram dengan aplikasi gratis"
  },
  {
    "kategori": "Marketing",
    "deskripsi": "Panduan membuat email marketing yang diklik banyak orang"
  },
  {
    "kategori": "Generate Gambar",
    "deskripsi": "Ilustrasi gaya anime karakter di dunia sihir"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Motivasi",
    "deskripsi": "Cerita sukses dari nol yang bisa jadi inspirasi konten"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Daftar tools AI gratis terbaik untuk kreator konten"
  },
  {
    "kategori": "Produktivitas",
    "deskripsi": "Tool gratis untuk manajemen tugas secara visual"
  },
  {
    "kategori": "Tutorial",
    "deskripsi": "Tutorial membuat website portfolio dengan HTML & CSS"
  },
  {
    "kategori": "Desain",
    "deskripsi": "Template konten carousel yang menarik untuk Canva"
  },
  {
    "kategori": "Tips & Trik",
    "deskripsi": "Trik mempercepat render video di Adobe Premiere"
  },
  {
    "kategori": "AI Tools",
    "deskripsi": "Panduan membuat thumbnail YouTube otomatis dengan AI"
  }
          ].map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.kategori}</td>
            <td class="deskripsi" id="desc-${index}">${item.deskripsi}</td>
            <td>
              <button class="copy-btn" onclick="copyText('desc-${index}')">
                <i class="fas fa-copy"></i> Salin
              </button>
            </td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>
  </section>`;
  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'promptgeminiveo3') { 
  content = `<section style="padding: 2rem;">
    <h2 style="font-size: 2rem; color: var(--text-color);">🔥 500+ Prompt Gemini Veo3 Terbaik</h2>
    <section style="padding: 2rem; overflow-x: auto;">
      <h3>🔥 500+ Prompt Gemini VEO3 Siap Pakai</h3>
      <table class="announcement-table" style="min-width: 1000px;">
        <thead>
          <tr>
            <th>No</th>
            <th>Kategori</th> 
            <th>Deskripsi</th>
            <th>Salin</th>
          </tr>
        </thead>
        <tbody>
          ${[
            { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" },
  { kategori: "Motivational", deskripsi: "Make a video with theme: motivational speech, with background in a dense jungle with natural lighting, use voice over in English, make a visual cinematic with warm lighting" },
  { kategori: "Adventure", deskripsi: "Create a cinematic video of a solo traveler hiking in the Himalayas, with drone shots and ambient sound" },
  { kategori: "Technology", deskripsi: "Generate a video showcasing futuristic AI technology in a sleek modern lab environment, glowing interfaces, and robotic arms" },
  { kategori: "Business", deskripsi: "Make a corporate explainer video in a modern office setting, with clean infographic overlays and professional narration" },
  { kategori: "Education", deskripsi: "Produce a visual explainer video for 'Photosynthesis', using animated diagrams, voiceover in a clear tone, and soft background music" },
  { kategori: "Fantasy", deskripsi: "Create a magical forest scene with glowing trees and floating orbs, with fantasy-style music and no dialogue" },
  { kategori: "Sci-Fi", deskripsi: "Visualize a space station orbiting Saturn with astronauts working outside, cinematic angle, dark ambient music" },
  { kategori: "Travel", deskripsi: "Make a travel vlog style video in Venice, with gondola rides, narrow alleyways, and romantic sunset lighting" },
  { kategori: "Food", deskripsi: "Show a high-speed video of a gourmet chef preparing sushi in a luxurious kitchen, with macro close-ups and upbeat background music" },
  { kategori: "Fitness", deskripsi: "Generate a morning workout montage in a city park, with runners, stretching, slow motion push-ups, and motivational background music" }
          ].map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.kategori}</td>
            <td class="deskripsi" id="desc-${index}">${item.deskripsi}</td>
            <td>
              <button class="copy-btn" onclick="copyText('desc-${index}')">
                <i class="fas fa-copy"></i> Salin
              </button>
            </td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>
  </section>`;
  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'shorturl') {
  content = `
    <section class="shorturl-container">
      <div class="shorturl-box">
        <h2 class="shorturl-title">🔗 Short URL Generator</h2>
        <input type="text" id="longUrl" placeholder="Masukkan URL panjang..." class="shorturl-input" />
        <button class="shorturl-btn" onclick="generateShortUrl()">Shorten URL</button>
        
        <div id="shortResult" class="shorturl-result" style="display: none;">
          <p>✅ URL berhasil disingkat:</p>
          <div id="shortUrlText" class="shorturl-output"></div>
          <button class="shorturl-copy-btn" onclick="copyShortUrl()">Salin</button>
        </div>
      </div>
    </section>
  `;
main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'calculatorDanaDarurat') {
  content = `
    <section class="shorturl-container">
      <div class="shorturl-box">
        <h2 class="shorturl-title">🧮 Kalkulator Dana Darurat</h2>
        <label for="pengeluaranBulanan">Pengeluaran Bulanan (Rp):</label>
        <input type="number" id="pengeluaranBulanan" placeholder="Contoh: 3000000" class="shorturl-input" />

        <label for="jumlahTanggungan">Jumlah Tanggungan:</label>
        <select id="jumlahTanggungan" class="shorturl-input">
          <option value="1">1 Orang</option>
          <option value="2">2 Orang</option>
          <option value="3">3 Orang</option>
          <option value="4">4 Orang</option>
          <option value="5">5 Orang</option>
          <option value="6">6 Orang</option>
        </select>

        <button class="shorturl-btn" onclick="hitungDanaDarurat()">Hitung Dana Darurat</button>
        
        <div id="hasilDanaDarurat" class="shorturl-result" style="display: none;">
          <p>💡 Dana Darurat yang disarankan:</p>
          <div id="danaDaruratText" class="shorturl-output"></div>
        </div>
      </div>
    </section>
  `;
  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'kalkulatorgaji') {
  content = `
    <section class="gaji-container">
      <div class="gaji-box">
        <h2 class="gaji-title">📊 Kalkulator Pembagian Gaji</h2>
        
        <label for="totalGaji">Total Gaji (Rp)</label>
        <input type="number" id="totalGaji" placeholder="Contoh: 5000000" />

        <div class="checkbox-sandwich">
          <input type="checkbox" id="isSandwich" onchange="toggleOrtuField()" />
          <label for="isSandwich">Saya termasuk Generasi Sandwich</label>
        </div>

        <div id="ortuField" style="display: none;">
          <label for="biayaOrtu">
            Biaya untuk Orang Tua (Rp) <span style="font-size: 0.9rem; color: #888;">(opsional)</span>
          </label>
          <input type="number" id="biayaOrtu" placeholder="Contoh: 1000000" />
        </div>

        <button class="shorturl-btn" onclick="hitungPembagianGaji()">Hitung</button>

        <div id="hasilGaji" class="shorturl-result" style="display: none; margin-top: 20px;"></div>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}


if (page === 'kalkulatorpendidikan') {
  content = `
    <section class="pendidikan-container">
      <div class="pendidikan-box">
        <h2>🎓 Kalkulator Pendidikan Anak</h2>

        <label for="tahunKelahiranAnak">Tahun Kelahiran Anak</label>
        <input type="number" id="tahunKelahiranAnak" placeholder="Contoh: 2018" class="pendidikan-input" />

        <label for="tempatTinggal">Tempat Tinggal</label>
        <select id="tempatTinggal" class="pendidikan-input">
          <option value="desa">Desa</option>
          <option value="kota">Kota</option>
          <option value="pusat">Pusat Kota</option>
        </select>

        <label>
          <input type="checkbox" id="lanjutKuliahCheckbox" onchange="toggleJurusan()"> Saya ingin melanjutkan ke kuliah
        </label>

        <div id="jurusanKuliahBox" style="display:none; margin-top: 10px;">
          <label for="jurusanKuliah">Pilih Jurusan Kuliah</label>
          <select id="jurusanKuliah" class="pendidikan-input">
            <optgroup label="🧪 Sains & Teknologi">
              <option value="Matematika">Matematika</option>
              <option value="Fisika">Fisika</option>
              <option value="Kimia">Kimia</option>
              <option value="Biologi">Biologi</option>
              <option value="Statistika">Statistika</option>
              <option value="Informatika / Ilmu Komputer">Informatika / Ilmu Komputer</option>
              <option value="Teknik Elektro">Teknik Elektro</option>
              <option value="Teknik Mesin">Teknik Mesin</option>
              <option value="Teknik Sipil">Teknik Sipil</option>
              <option value="Teknik Kimia">Teknik Kimia</option>
              <option value="Teknik Industri">Teknik Industri</option>
              <option value="Teknik Perkapalan">Teknik Perkapalan</option>
              <option value="Teknik Geologi">Teknik Geologi</option>
              <option value="Teknik Lingkungan">Teknik Lingkungan</option>
              <option value="Teknik Material">Teknik Material</option>
              <option value="Teknik Pangan">Teknik Pangan</option>
              <option value="Teknik Perminyakan">Teknik Perminyakan</option>
              <option value="Teknik Kehutanan">Teknik Kehutanan</option>
              <option value="Teknik Metalurgi">Teknik Metalurgi</option>
            </optgroup>
            <optgroup label="💼 Ekonomi, Bisnis & Manajemen">
              <option value="Ekonomi">Ekonomi</option>
              <option value="Manajemen">Manajemen</option>
              <option value="Akuntansi">Akuntansi</option>
              <option value="Keuangan / Finance">Keuangan / Finance</option>
              <option value="Perbankan">Perbankan</option>
              <option value="Ekonomi Pembangunan">Ekonomi Pembangunan</option>
              <option value="Bisnis Digital">Bisnis Digital</option>
              <option value="Entrepreneurship">Entrepreneurship</option>
            </optgroup>
            <optgroup label="🏥 Kesehatan & Kedokteran">
              <option value="Kedokteran">Kedokteran</option>
              <option value="Kedokteran Gigi">Kedokteran Gigi</option>
              <option value="Keperawatan">Keperawatan</option>
              <option value="Farmasi">Farmasi</option>
              <option value="Kebidanan">Kebidanan</option>
              <option value="Kesehatan Masyarakat">Kesehatan Masyarakat</option>
              <option value="Gizi">Gizi</option>
              <option value="Fisioterapi">Fisioterapi</option>
              <option value="Radiologi">Radiologi</option>
            </optgroup>
            <optgroup label="💡 Humaniora, Sosial & Pendidikan">
              <option value="Psikologi">Psikologi</option>
              <option value="Sosiologi">Sosiologi</option>
              <option value="Antropologi">Antropologi</option>
              <option value="Ilmu Politik">Ilmu Politik</option>
              <option value="Hubungan Internasional">Hubungan Internasional</option>
              <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
              <option value="Jurnalistik">Jurnalistik</option>
              <option value="Pendidikan">Pendidikan (Umum)</option>
              <option value="Pendidikan Anak Usia Dini">Pendidikan Anak Usia Dini</option>
              <option value="Pendidikan Bahasa dan Sastra">Pendidikan Bahasa & Sastra</option>
              <option value="Pendidikan Matematika">Pendidikan Matematika</option>
              <option value="Pendidikan IPA">Pendidikan IPA</option>
              <option value="Pendidikan IPS">Pendidikan IPS</option>
              <option value="Pendidikan Bahasa Inggris">Pendidikan Bahasa Inggris</option>
            </optgroup>
            <optgroup label="🎨 Desain, Seni & Budaya">
              <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
              <option value="Desain Interior">Desain Interior</option>
              <option value="Desain Produk">Desain Produk</option>
              <option value="Arsitektur">Arsitektur</option>
              <option value="Seni Rupa">Seni Rupa</option>
              <option value="Seni Musik">Seni Musik</option>
              <option value="Seni Tari">Seni Tari</option>
              <option value="Seni Teater">Seni Teater</option>
              <option value="Film & Televisi">Film & Televisi</option>
            </optgroup>
            <optgroup label="⚖️ Hukum & Ilmu Keamanan">
              <option value="Hukum">Hukum</option>
              <option value="Kriminologi">Kriminologi</option>
              <option value="Ilmu Kepolisian">Ilmu Kepolisian</option>
              <option value="Pertahanan & Keamanan">Pertahanan & Keamanan</option>
            </optgroup>
            <optgroup label="🌏 Pertanian, Marine & Kehutanan">
              <option value="Agribisnis">Agribisnis</option>
              <option value="Agronomi">Agronomi</option>
              <option value="Peternakan">Peternakan</option>
              <option value="Perikanan">Perikanan</option>
              <option value="Teknologi Hasil Perikanan">Teknologi Hasil Perikanan</option>
              <option value="Teknologi benih">Teknologi Benih</option>
              <option value="Kehutanan">Kehutanan</option>
            </optgroup>
            <optgroup label="🚌 Transport & Logistik">
              <option value="Manajemen Transport & Logistik">Manajemen Transport & Logistik</option>
              <option value="Teknik Transportasi">Teknik Transportasi</option>
            </optgroup>
            <optgroup label="🌐 Lain-lain / Interdisipliner">
              <option value="Ilmu Lingkungan">Ilmu Lingkungan</option>
              <option value="Geografi">Geografi</option>
              <option value="Ilmu Data (Data Science)">Ilmu Data (Data Science)</option>
              <option value="Teknologi Informasi">Teknologi Informasi</option>
              <option value="Multimedia">Multimedia</option>
              <option value="Kedokteran Hewan">Kedokteran Hewan</option>
            </optgroup>
          </select>
        </div>

        <button class="pendidikan-btn" onclick="hitungPendidikan()">Hitung Pendidikan</button>

        <div id="hasilPendidikan" class="pendidikan-result" style="display:none;"></div>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}

if (page === 'toolstranslate') {
  content = `
  <section class="translate-container">
    <h2>🌍 Tools Translate Dunia</h2>
    <label for="inputText">Masukkan Teks:</label>
    <textarea id="inputText" rows="5" placeholder="Contoh: Saya ingin makan."></textarea>

    <div class="select-box">
      <label for="fromLang">Dari:</label>
      <select id="fromLang">
        ${generateLanguageOptions()}
      </select>

      <label for="toLang">Ke:</label>
      <select id="toLang">
        ${generateLanguageOptions()}
      </select>
    </div>

    <button onclick="translateText()">Terjemahkan</button>

    <div id="resultBox" class="result-box">
      <h3>Hasil Terjemahan:</h3>
      <p id="translatedText">-</p>
      <button id="copyBtn" onclick="copyTranslation()">Salin</button>
    </div>
  </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}



if (page === 'adminucapan') {
  content = `
    <section class="adminucapan-container">
      <div class="adminucapan-box">
        <h2 class="adminucapan-title">🎁 Generator Link Ucapan</h2>

        <label>Dari:</label>
        <input type="text" id="adminDari" class="adminucapan-input" placeholder="Contoh: Seseorang / Budi">

        <label>Kepada:</label>
        <input type="text" id="adminNama" class="adminucapan-input" placeholder="Masukkan nama penerima...">

        <label>Jenis Kelamin:</label>
        <select id="adminGender" class="adminucapan-input">
          <option value="pria">Pria</option>
          <option value="wanita">Wanita</option>
        </select>

        <label>Hubungan:</label>
        <select id="adminHubungan" class="adminucapan-input">
          <option value="adik">Adik</option>
          <option value="kakak">Kakak</option>
          <option value="saudara">Saudara</option>
          <option value="sepupu">Sepupu</option>
          <option value="pacar">Pacar</option>
          <option value="hts">HTS</option>
          <option value="teman dekat">Teman Dekat</option>
          <option value="rekan kerja">Rekan Kerja</option>
          <option value="gebetan">Gebetan</option>
          <option value="mantan">Mantan</option>
          <option value="dll">Lainnya</option>
        </select>

        <label>Tema Ucapan:</label>
        <select id="adminTema" class="adminucapan-input">
          <option value="ulangtahun">Ulang Tahun</option>
          <option value="mintamaaf">Minta Maaf</option>
          <option value="weekend">Weekend</option>
          <option value="dating">Dating</option>
          <option value="dinner">Dinner</option>
        </select>

        <label>Pesan:</label>
        <textarea id="adminPesan" class="adminucapan-input" rows="3" style="min-height: 80px;" placeholder="Isi minimal 3 baris..."></textarea>

        <label>Nomor WhatsApp Penerima:</label>
        <input type="number" id="adminWa" class="adminucapan-input" placeholder="Contoh: 6281234567890">

        <button class="adminucapan-btn" onclick="generateUcapanLink()">Buat Ucapan</button>

        <div id="adminResult" class="adminucapan-result" style="display: none;">
          <p>✅ Link Ucapan:</p>
         <div id="adminLink" class="adminucapan-link"></div>
<button class="adminucapan-salin-btn" onclick="copyAdminLink()">Salin Link</button>
          <div style="margin-top: 1.2rem;">
            <button onclick="shareToWhatsApp()" style="margin-top: 1rem; background: #25D366; color: white; padding: 0.6rem 1.2rem; border-radius: 0.5rem; border: none; cursor: pointer;">
              💬 Kirim Lewat WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");

  const qrScript = document.createElement("script");
  qrScript.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
  document.body.appendChild(qrScript);
}

if (page === 'lovecalculator') {
  content = `
  <section class="love-container">
  <h2>💘 Love Calculator</h2>
  <input type="text" id="yourName" placeholder="Nama Kamu" />
  <input type="text" id="crushName" placeholder="Nama Dia" />
  <button onclick="hitungCinta()">Hitung Cinta</button>
  <button id="resetBtn" onclick="resetCinta()" style="margin-top: 10px;">Reset</button>

  <div id="hasilCinta" class="hasil-cinta" style="display: none;">
    <h3 id="namaHasil"></h3>
    <div class="progress-container">
      <div class="progress-bar" id="progressBar"></div>
    </div>
    <p id="skorText"></p>
    <p id="pesanText"></p>
  </div>
</section>

  `;
 main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
}


if (page === 'danakaget') {
  content = `
    <section class="gift-container">
      <h2 style="text-align:center;">🎁 Dana Kaget</h2>
      <div class="gift-box neon-blue" id="giftBox">
        <img src="https://cdn-icons-png.flaticon.com/512/4193/4193253.png" alt="Gift Box" class="gift-img" />
      </div>
      <div class="result-box" id="resultBox">💸 Hadiah akan muncul di sini!</div>
      <button id="openGiftBtn" class="open-gift-btn">🎉 Buka Hadiah</button>
    </section>
  `;

  main.innerHTML = content;
  document.getElementById("sidebar").classList.remove("active");
  generateDanaKaget();
}
}



/////// PISAHIN //////

function hitungCinta() {
  const yourName = document.getElementById("yourName").value.trim();
  const crushName = document.getElementById("crushName").value.trim();
  const button = document.querySelector(".love-container button");
  const resetBtn = document.getElementById("resetBtn");

  if (!yourName || !crushName) {
    alert("Isi kedua nama terlebih dahulu!");
    return;
  }

  const skor = Math.floor(Math.random() * 51) + 50; // 50 - 100
  let pesan = "";
  if (skor < 60) {
    pesan = "💔 Cinta kalian penuh tantangan. Tapi cinta sejati tak mudah, kan?";
  } else if (skor < 75) {
    pesan = "💞 Kalian cocok! Tinggal lebih sering ngobrol dan saling terbuka.";
  } else if (skor < 90) {
    pesan = "💖 Wah, hampir sempurna! Cinta kalian kuat dan penuh chemistry.";
  } else {
    pesan = "💘 Jodoh dari semesta! Segera ajak dia ngedate ya 😉";
  }

  // Tampilkan hasil box & reset progress
  const hasilBox = document.getElementById("hasilCinta");
  const progressBar = document.getElementById("progressBar");
  const skorText = document.getElementById("skorText");
  const pesanText = document.getElementById("pesanText");

  document.getElementById("namaHasil").innerHTML = `❤️ ${yourName} + ${crushName}`;
  hasilBox.style.display = "block";
  progressBar.style.width = "0%";
  skorText.innerHTML = "0%";
  pesanText.innerHTML = "";

  // Disable tombol hitung dan enable reset
  button.disabled = true;
  button.style.opacity = 0.6;
  resetBtn.disabled = true;

  let width = 0;
  let persentase = 0;

  const loading = setInterval(() => {
    if (width >= skor) {
      clearInterval(loading);
      skorText.innerHTML = `Skor Cinta: <strong>${skor}%</strong>`;
      pesanText.innerHTML = pesan;
      button.disabled = false;
      button.style.opacity = 1;
      resetBtn.disabled = false;
    } else {
      width++;
      persentase++;
      progressBar.style.width = width + "%";
      skorText.innerHTML = persentase + "%";
    }
  }, 50);
}

function resetCinta() {
  document.getElementById("yourName").value = "";
  document.getElementById("crushName").value = "";
  document.getElementById("hasilCinta").style.display = "none";
}



function generateLanguageOptions() {
  const languages = {
    af: "Afrikaans", sq: "Albanian", am: "Amharic", ar: "Arabic", hy: "Armenian", az: "Azerbaijani",
    eu: "Basque", be: "Belarusian", bn: "Bengali", bs: "Bosnian", bg: "Bulgarian", ca: "Catalan",
    ceb: "Cebuano", ny: "Chichewa", zh: "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)",
    co: "Corsican", hr: "Croatian", cs: "Czech", da: "Danish", nl: "Dutch", en: "English",
    eo: "Esperanto", et: "Estonian", tl: "Filipino", fi: "Finnish", fr: "French", fy: "Frisian",
    gl: "Galician", ka: "Georgian", de: "German", el: "Greek", gu: "Gujarati", ht: "Haitian Creole",
    ha: "Hausa", haw: "Hawaiian", iw: "Hebrew", hi: "Hindi", hmn: "Hmong", hu: "Hungarian",
    is: "Icelandic", ig: "Igbo", id: "Indonesian", ga: "Irish", it: "Italian", ja: "Japanese",
    jw: "Javanese", su: "Sundanese", kn: "Kannada", kk: "Kazakh", km: "Khmer", ko: "Korean",
    ku: "Kurdish", ky: "Kyrgyz", lo: "Lao", la: "Latin", lv: "Latvian", lt: "Lithuanian",
    lb: "Luxembourgish", mk: "Macedonian", mg: "Malagasy", ms: "Malay", ml: "Malayalam",
    mt: "Maltese", mi: "Maori", mr: "Marathi", mn: "Mongolian", my: "Myanmar (Burmese)",
    ne: "Nepali", no: "Norwegian", ps: "Pashto", fa: "Persian", pl: "Polish", pt: "Portuguese",
    pa: "Punjabi", ro: "Romanian", ru: "Russian", sm: "Samoan", gd: "Scots Gaelic", sr: "Serbian",
    st: "Sesotho", sn: "Shona", sd: "Sindhi", si: "Sinhala", sk: "Slovak", sl: "Slovenian",
    so: "Somali", es: "Spanish", sw: "Swahili", sv: "Swedish", tg: "Tajik", ta: "Tamil",
    te: "Telugu", th: "Thai", tr: "Turkish", uk: "Ukrainian", ur: "Urdu", uz: "Uzbek",
    vi: "Vietnamese", cy: "Welsh", xh: "Xhosa", yi: "Yiddish", yo: "Yoruba", zu: "Zulu",

    // 🔽 Bahasa Daerah Indonesia (Sebagian hanya dummy)
    jv: "Jawa", su: "Sunda", ban: "Bali (eksperimen)", bug: "Bugis (eksperimen)",
    min: "Minangkabau (eksperimen)", bbc: "Batak Toba (eksperimen)"
  };

  return Object.entries(languages)
    .map(([code, name]) => `<option value="${code}">${name}</option>`)
    .join('');
}

// === Fungsi: Translate via Google Translate API (public endpoint) ===
function translateText() {
  const text = document.getElementById('inputText').value.trim();
  const from = document.getElementById('fromLang').value;
  const to = document.getElementById('toLang').value;

  if (!text) {
    alert("Teks tidak boleh kosong!");
    return;
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const translated = data[0].map(item => item[0]).join('');
      document.getElementById('translatedText').innerText = translated;
    })
    .catch(() => {
      document.getElementById('translatedText').innerText =
        "❌ Bahasa ini mungkin belum didukung Google Translate atau terjadi kesalahan jaringan.";
    });
}

function copyTranslation() {
  const text = document.getElementById('translatedText')?.innerText || '';
  const btn = document.getElementById('copyBtn');

  if (text && text !== '-') {
    navigator.clipboard.writeText(text)
      .then(() => {
        btn.innerText = "✅ Disalin!";
        setTimeout(() => btn.innerText = "Salin", 2000);
      })
      .catch(() => {
        btn.innerText = "❌ Gagal Menyalin";
        setTimeout(() => btn.innerText = "Salin", 2000);
      });
  } else {
    alert("Belum ada hasil terjemahan untuk disalin.");
  }
}


// ===== Data Biaya Pendidikan per Jenjang & Jurusan =====
const biayaPendidikan = {
  negeri: {
    SD: { spp: 0, seragam: 800000, jajan: 10000, kegiatan: 750000, lama: 6 },
    SMP: { spp: 0, seragam: 1000000, jajan: 12000, kegiatan: 1000000, lama: 3 },
    SMA: { spp: 0, seragam: 1200000, jajan: 15000, kegiatan: 1500000, lama: 3 },
    kuliah: {
      masuk: 5000000,
      lainnya: 8000000,
      jajan: 20000,
      lama: 4
    }
  },
  swasta: {
    SD: { spp: 2300000, seragam: 2500000, jajan: 12000, kegiatan: 5750000, lama: 6 },
    SMP: { spp: 3000000, seragam: 1500000, jajan: 15000, kegiatan: 5500000, lama: 3 },
    SMA: { spp: 3500000, seragam: 2000000, jajan: 20000, kegiatan: 6000000, lama: 3 },
    kuliah: {
      pangkal: 30000000,
      masuk: 1000000,
      lainnya: 10000000,
      jajan: 25000,
      lama: 4
    }
  }
};

const uktNegeriJurusan = {
  Kedokteran: 8000000,
  Psikologi: 4000000,
  Teknik: 5000000,
  Ekonomi: 3000000,
  Komunikasi: 2000000
};

const sppSwastaJurusan = {
  Kedokteran: 30000000,
  Psikologi: 20000000,
  Teknik: 8000000,
  Ekonomi: 6000000,
  Komunikasi: 4000000
};

const biayaPerSKS = 500000;
const praktikPerSemester = {
  Kedokteran: 3000000,
  Psikologi: 2000000,
  Teknik: 2500000,
  Ekonomi: 1500000,
  Komunikasi: 1000000,
  default: 1000000
};

const lokasiKoefisien = {
  desa: 0.9,
  kota: 1,
  pusat: 1.2
};

const hariAktif = 220;
const inflasi = 0.05;

function formatRupiah(angka) {
  return angka.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
}

function hitungPendidikan() {
  const tahunLahir = parseInt(document.getElementById("tahunKelahiranAnak").value);
  const tempat = document.getElementById("tempatTinggal").value;
  const jurusan = document.getElementById("jurusanKuliah").value;
  const lanjutKuliah = document.getElementById("lanjutKuliahCheckbox").checked;

  if (!tahunLahir || !tempat) return alert("Lengkapi semua data!");

  const tahunSekarang = new Date().getFullYear();
  const usiaMasukSD = 6;

  const tahunMasuk = {
    SD: tahunLahir + usiaMasukSD,
    SMP: tahunLahir + usiaMasukSD + 6,
    SMA: tahunLahir + usiaMasukSD + 9,
    kuliah: tahunLahir + usiaMasukSD + 12
  };

  let html = "<h3>📘 Estimasi Biaya Pendidikan</h3>";

  html += `<p style="background:#021d2e;padding:10px;border-left:4px solid #00f7ff;color:#bdeeff;margin-bottom:1rem;"><b>Catatan:</b> Ini hanya estimasi saja, biaya dapat berubah tergantung lokasi daerah dan tahun sesuai kebijakan sekolah/universitas.</p>`;

  ["SD", "SMP", "SMA"].forEach((jenjang) => {
    ["negeri", "swasta"].forEach((tipe) => {
      const d = biayaPendidikan[tipe][jenjang];
      const thn = tahunMasuk[jenjang];
      const inflator = Math.pow(1 + inflasi, thn - tahunSekarang);
      const koef = lokasiKoefisien[tempat];

      const total = ((d.spp || 0) * 12 * d.lama + d.seragam + d.kegiatan + (d.jajan * hariAktif * d.lama)) * inflator * koef;

      html += `<div class="${tipe}"><b>${jenjang} ${tipe.toUpperCase()} (Masuk ${thn})</b><ul>
        ${d.spp ? `<li>SPP: ${formatRupiah(d.spp * 12)} x ${d.lama} tahun</li>` : "<li>SPP: Gratis</li>"}
        <li>Seragam: ${formatRupiah(d.seragam)}</li>
        <li>Kegiatan: ${formatRupiah(d.kegiatan)}</li>
        <li>Uang Jajan: ${formatRupiah(d.jajan * hariAktif * d.lama)}</li>
        <li><b>Total:</b> ${formatRupiah(total)}</li>
      </ul></div>`;
    });
  });

  if (lanjutKuliah && jurusan) {
    ["negeri", "swasta"].forEach((tipe) => {
      const d = biayaPendidikan[tipe].kuliah;
      const thn = tahunMasuk.kuliah;
      const inflator = Math.pow(1 + inflasi, thn - tahunSekarang);
      const koef = lokasiKoefisien[tempat];
      const totalSem = d.lama * 2;

      const biayaSem = tipe === "negeri"
        ? (uktNegeriJurusan[jurusan] || uktNegeriJurusan["Teknik"])
        : (sppSwastaJurusan[jurusan] || sppSwastaJurusan["Teknik"]);

      const uktsppTotal = biayaSem * totalSem * inflator * koef;
      const sks = biayaPerSKS * 20 * totalSem * inflator * koef;
      const praktik = (praktikPerSemester[jurusan] || praktikPerSemester.default) * totalSem * inflator * koef;
      const pangkal = (d.pangkal || 0) * inflator * koef;
      const masuk = d.masuk * inflator * koef;
      const lain = d.lainnya * inflator * koef;
      const jajan = d.jajan * hariAktif * d.lama * inflator * koef;

      const total = uktsppTotal + sks + praktik + pangkal + masuk + lain + jajan;

      html += `<div class="${tipe}"><b>Kuliah (${jurusan}) ${tipe.toUpperCase()} (Masuk ${thn})</b><ul>
        ${pangkal ? `<li>Uang Pangkal: ${formatRupiah(pangkal)}</li>` : ""}
        <li>UKT/SPP (${totalSem} sem): ${formatRupiah(uktsppTotal)}</li>
        <li>SKS (20/sm): ${formatRupiah(sks)}</li>
        <li>Praktikum: ${formatRupiah(praktik)}</li>
        <li>Uang Masuk: ${formatRupiah(masuk)}</li>
        <li>Biaya Lainnya: ${formatRupiah(lain)}</li>
        <li>Uang Jajan: ${formatRupiah(jajan)}</li>
        <li><b>Total Kuliah:</b> ${formatRupiah(total)}</li>
      </ul></div>`;
    });
  }

  document.getElementById("hasilPendidikan").innerHTML = html;
  document.getElementById("hasilPendidikan").style.display = "block";
}

function toggleJurusan() {
  const box = document.getElementById("jurusanKuliahBox");
  const check = document.getElementById("lanjutKuliahCheckbox");
  box.style.display = check.checked ? "block" : "none";
}



function toggleOrtuField() {
  const isSandwich = document.getElementById("isSandwich").checked;
  document.getElementById("ortuField").style.display = isSandwich ? "block" : "none";
}

function hitungPembagianGaji() {
  const total = parseFloat(document.getElementById("totalGaji").value);
  const ortu = parseFloat(document.getElementById("biayaOrtu").value) || 0;
  const hasilDiv = document.getElementById("hasilGaji");

  if (isNaN(total) || total <= 0) {
    hasilDiv.innerHTML = "<p>⚠️ Mohon masukkan total gaji yang valid.</p>";
    hasilDiv.style.display = "block";
    return;
  }

  const sisagaji = total - ortu;

  const hasil = `
    <p>📤 Total Gaji: <strong>Rp${total.toLocaleString('id-ID')}</strong></p>
    ${ortu > 0 ? `<p>👨‍👩‍👧‍👦 Biaya Orang Tua: <strong>Rp${ortu.toLocaleString('id-ID')}</strong></p>` : ""}
    <p>💡 Sisa Gaji Dibagi:</p>
    <ul style="padding-left: 1rem;">
      <li>🔸 50% Kebutuhan Pokok: <strong>Rp${(sisagaji * 0.5).toLocaleString('id-ID')}</strong></li>
      <li>🔸 40% Investasi / Tabungan: <strong>Rp${(sisagaji * 0.4).toLocaleString('id-ID')}</strong></li>
      <li>🔸 30% Hiburan / Lifestyle: <strong>Rp${(sisagaji * 0.3).toLocaleString('id-ID')}</strong></li>
      <li>🔸 20% Dana Darurat: <strong>Rp${(sisagaji * 0.2).toLocaleString('id-ID')}</strong></li>
      <li>🔸 10% Sedekah / Donasi: <strong>Rp${(sisagaji * 0.1).toLocaleString('id-ID')}</strong></li>
    </ul>
  `;

  hasilDiv.innerHTML = hasil;
  hasilDiv.style.display = "block";
}



function hitungDanaDarurat() {
  const pengeluaran = parseInt(document.getElementById("pengeluaranBulanan").value);
  const tanggungan = parseInt(document.getElementById("jumlahTanggungan").value);

  if (isNaN(pengeluaran) || pengeluaran <= 0) {
    alert("Masukkan pengeluaran bulanan yang valid.");
    return;
  }

  // Rumus: 1 orang = 6 bulan, 2 = 7, ..., 6 = 11, >6 = 12 bulan
  let bulanIdeal = 6 + (tanggungan - 1);
  if (bulanIdeal > 12) bulanIdeal = 12;

  const totalDana = pengeluaran * bulanIdeal;

  document.getElementById("hasilDanaDarurat").style.display = "block";
document.getElementById("danaDaruratText").innerHTML = `
  <strong>Estimasi Dana Darurat:</strong><br>
  Rp <strong>${totalDana.toLocaleString("id-ID")}</strong> 
  (setara <strong>${bulanIdeal} bulan</strong> pengeluaran bulanan)<br><br>

  <div class="catatan-box">
    <strong>Catatan:</strong><br>
    Dana darurat disiapkan untuk menghadapi situasi tak terduga seperti <strong>sakit, kehilangan pekerjaan, motor masuk bengkel, kebutuhan mendadak keluarga</strong>, dan lainnya. 
  </div>
`;

}


function generateUcapanLink() {
  const dari = document.getElementById("adminDari").value.trim();
  const nama = document.getElementById("adminNama").value.trim();
  const gender = document.getElementById("adminGender").value;
  const hubungan = document.getElementById("adminHubungan").value;
  const tema = document.getElementById("adminTema").value;
  const pesan = document.getElementById("adminPesan").value.trim();
  const wa = document.getElementById("adminWa").value.trim();

  // Validasi wajib
  if (!dari || !nama || !wa || !tema) {
    alert("Mohon lengkapi semua data wajib: Dari, Kepada, Nomor WhatsApp, dan Tema.");
    return;
  }

  // Validasi isi pesan jika ada
  const pesanLines = pesan.split("\n").filter(line => line.trim() !== "");
  if (pesan && pesanLines.length < 3) {
    alert("Pesan harus minimal 3 baris jika ingin diisi.");
    return;
  }

  // Template pesan berdasarkan tema (fallback otomatis)
  const defaultPesan = {
    ulangtahun: `Selamat ulang tahun ${nama}! 🎉\nSemoga panjang umur dan sehat selalu.\nTetap jadi ${hubungan} terbaik ya!`,
    mintamaaf: `Aku minta maaf ya ${nama} 🙏\nAku sadar aku salah dan ingin memperbaiki semuanya.\nSemoga kamu bisa maafin aku.`,
    weekend: `Selamat menikmati weekend, ${nama}! 😄\nSemoga akhir pekanmu menyenangkan.\nJangan lupa istirahat ya.`,
    dating: `Hai ${nama} 💕\nKamu sibuk gak hari ini?\nAku pengen ajak kamu jalan bareng...`,
    dinner: `Malam ini kita dinner bareng yuk? 🍽️\nAku yang traktir deh hehe\nTemenin aku ya ${nama}!`,
    roomwangi: `Buat kamu, ${nama}, si pemilik room paling wangi 💐\nJangan kasih musuh napas malam ini!\nAyo gas bareng ML malam ini!`,
    motivasi: `Halo ${nama},\nKamu hebat dan punya potensi besar 💪\nTerus semangat dan jangan menyerah ya!`,
    random: `Hai ${nama}, ada pesan spesial buat kamu 🎁\nSemoga hari ini membawa senyuman\nDari: ${dari}`
  };

  // Pilih pesan final
  const finalPesan = pesan || defaultPesan[tema] || `Halo ${nama}, ini pesan spesial dari ${dari}. Semoga harimu menyenangkan!`;

  // Buat link ucapan
  const baseUrl = "https://vlcrave.github.io/home/ucapan.html";
  const query = `?tema=${tema}&nama=${encodeURIComponent(nama)}&dari=${encodeURIComponent(dari)}&pesan=${encodeURIComponent(finalPesan)}&wa=${wa}`;
  const link = `${baseUrl}${query}`;

  // Tampilkan hasil
  document.getElementById("adminResult").style.display = "block";
  document.getElementById("adminLink").innerText = link;

  // Generate QR Code
  if (typeof QRCode !== 'undefined') {
    document.getElementById("adminQrCode").innerHTML = "";
    new QRCode(document.getElementById("adminQrCode"), {
      text: link,
      width: 160,
      height: 160,
      colorDark: "#000000",
      colorLight: "#ffffff"
    });
  }

  // Kirim ke Telegram
  const token = "7922409540:AAFitc5JFHh9Xs2omx8HqTgJ2d9qE_hN7Kw";
  const chatId = "6046360096";
  const telegramMsg = `📥 *Database Whatsapp dari Generator Ucapan*\n\n👤 Nama: ${nama}\n📱 Nomor WhatsApp: ${wa}\n\n🔗 Link:\n${link}`;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: telegramMsg,
      parse_mode: "Markdown"
    })
  });
}

function copyAdminLink() {
  const link = document.getElementById("adminLink").innerText;
  navigator.clipboard.writeText(link).then(() => alert("Link berhasil disalin!"));
}

function shareToWhatsApp() {
  const link = document.getElementById("adminLink").innerText;
  const text = `Hai, ini ada ucapan spesial buat kamu:\n${link}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}




function generateShortUrl() {
  let longUrl = document.getElementById('longUrl').value.trim();
  if (!longUrl) return alert("Masukkan URL terlebih dahulu.");

  if (!/^https?:\/\//i.test(longUrl)) {
    longUrl = 'https://' + longUrl;
  }

  fetch("https://api.tinyurl.com/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 06oJiNLFzLQoWVGtOIvImWW1pHUhXI7bDrnSYVjkQcjU7PMmZx8XYsoNynkO"
    },
    body: JSON.stringify({
      url: longUrl,
      domain: "tinyurl.com"
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("RESPON API:", data); // Debug
      if (data.data && data.data.tiny_url) {
        document.getElementById("shortUrlText").innerText = data.data.tiny_url;
        document.getElementById("shortResult").style.display = "block";
      } else {
        const pesanError = data.errors?.[0]?.message || "Tidak diketahui";
        alert("Gagal membuat short URL.\nPesan: " + pesanError);
      }
    })
    .catch(error => {
      console.error("TinyURL Error:", error);
      alert("Terjadi kesalahan saat menghubungi TinyURL API.");
    });
}



function copyShortUrl() {
  const text = document.getElementById('shortUrlText').innerText;
  navigator.clipboard.writeText(text).then(() => alert("URL berhasil disalin!"));
}


function salinPrompt(id) {
        const text = document.getElementById(id).innerText;
        navigator.clipboard.writeText(text).then(() => {
          alert("✅ Prompt berhasil disalin!");
        }).catch(err => {
          alert("❌ Gagal menyalin prompt.");
        });
      }

function generateDanaKaget() {
  const btn = document.getElementById("openGiftBtn");
  const box = document.getElementById("giftBox");
  const result = document.getElementById("resultBox");

  const isGiftEnabled = false; // Admin toggle
  const jumlahUserTerbuka = 10;
  const cooldownTime = 24 * 60 * 60 * 7 * 1000; // 7 Hari ja

  const hadiahList = [
    { nama: "Rp2.000", link: "" },
    { nama: "Rp5.000", link: "" },
    { nama: "Rp10.000", link: "" },
    { nama: "Rp15.000", link: "" },
    { nama: "Rp20.000", link: "" },
    { nama: "Rp25.000", link: "" },
    { nama: "Rp30.000", link: "" },
    { nama: "Rp35.000", link: "" },
    { nama: "Rp40.000", link: "" },
    { nama: "Rp45.000", link: "" },
    { nama: "Rp50.000", link: "" }
  ];

  const hadiahFix = hadiahList[0];
  const lastClaimTime = parseInt(localStorage.getItem("danaKagetClaimedTime"));
  const now = Date.now();

  if (lastClaimTime && now - lastClaimTime < cooldownTime) {
    const nextTime = new Date(lastClaimTime + cooldownTime).toLocaleString();
    btn.disabled = true;
    btn.textContent = "✅ Sudah Diklaim";
    result.innerHTML = `💬 Kamu sudah claim Dana Kaget minggu ini.<br/>Coba lagi setelah: <strong>${nextTime}</strong>`;
    return;
  }

  // Jika kadaluarsa, hapus waktu claim
  if (lastClaimTime && now - lastClaimTime >= cooldownTime) {
    localStorage.removeItem("danaKagetClaimedTime");
  }

  if (!isGiftEnabled) {
    btn.disabled = true;
    btn.textContent = "🎉 Buka Hadiah";
    result.innerHTML = "🔒 Dana Kaget belum dibuka. Tunggu aktivasi dari admin.";
    return;
  }

  // Aktif
  btn.disabled = false;
  btn.textContent = "🎉 Buka Hadiah";
  result.innerHTML = `✅ Dana Kaget sudah dibuka untuk <strong>${jumlahUserTerbuka}</strong> orang!`;

  btn.onclick = () => {
    btn.disabled = true;
    box.classList.add("shake");
    result.textContent = "🔄 Mengacak hadiah...";

    let count = 0;
    const interval = setInterval(() => {
      const random = hadiahList[Math.floor(Math.random() * hadiahList.length)];
      result.innerHTML = `🎲 Mengacak: <strong>${random.nama}</strong>`;
      count++;

      if (count >= 30) {
        clearInterval(interval);
        box.classList.remove("shake");

        result.innerHTML = `🎉 Kamu mendapatkan: <strong>${hadiahFix.nama}</strong>`;
        btn.textContent = "✅ Sudah Diklaim";
        localStorage.setItem("danaKagetClaimedTime", Date.now().toString());
        btn.disabled = true;
      }
    }, 100);
  };
}


let currentPage = 0;
let pages, prevBtn, nextBtn, pageNumber;

function initBook() {
  // Ambil semua elemen halaman (class .page)
  pages = document.querySelectorAll('.book-content .page');
  prevBtn = document.getElementById('prevBtn');
  nextBtn = document.getElementById('nextBtn');
  pageNumber = document.getElementById('pageNumber');

  // Fungsi untuk update tampilan halaman
  function updatePage() {
    pages.forEach((page, index) => {
      page.classList.toggle('active', index === currentPage);
    });

    pageNumber.textContent = `${currentPage + 1} / ${pages.length}`;
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === pages.length - 1;
  }

  // Tombol kembali
  prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      updatePage();
    }
  });

  // Tombol lanjut
  nextBtn.addEventListener('click', () => {
    if (currentPage < pages.length - 1) {
      currentPage++;
      updatePage();
    }
  });

  // Inisialisasi tampilan halaman pertama
  updatePage();
}



function getLastUpdateTime(index) {
  const now = new Date();
  let day = now.getDate();
  let hour = (index * 6) % 24;

  if (index * 6 >= 24) day += 1;

  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');

  return `${dayStr}/${month} jam ${hourStr}.00`;
}

function generateCheatList() {
  const cheats = [
    ["ml", "https://img.utdstc.com/icon/78d/66f/78d66ff1ab1bd23f7fd6d9cdb93854881cb8f0b69e8a301faaf4f4eab058d19e:200", "Mobile Legends", "active", "", "https://cdn.unipin.com/images/icon_product_pages/1735814979-icon-Image_20250102184102.jpg"],
    ["pb", "https://example.com/pb-cheat", "Point Blank", "error", "24/06 Jam 12.00", "https://cdn.unipin.com/images/icon_product_pages/1571814027-icon-1559011491-icon-1557743544-icon-point_blank.jpg"],
    ["ff", "https://example.com/ff-cheat", "Free Fire", "error", "24/06 Jam 06.00", "https://cdn.unipin.com/images/icon_product_pages/1658817763-icon-200x200_icon%20ff.jpg"],
    ["pubgm", "https://example.com/pubgm-cheat", "PUBG Mobile", "error", "Jam 18.00", "https://cdn.unipin.com/images/icon_product_pages/1592228250-icon-pubgm.jpg"],
  ];

  const descList = {
    "ml": "Auto Aim, Drone View, Skin Unlocker",
    "pb": "Wallhack, Aimlock, Fast Reload",
    "ff": "Headshot Auto, Antiban, ESP",
    "pubgm": "Wallhack, No Recoil, Antiban",
  };

  const badgeStyle = {
    active: `<span class="cheat-badge badge-green">🟢</span>`,
    maintenance: `<span class="cheat-badge badge-yellow">🟡</span>`,
    error: `<span class="cheat-badge badge-red">🔴</span>`
  };

  return cheats.map((item, i) => {
    const status = item[3];
    const updateTime = status === 'active' ? getLastUpdateTime(i) : item[4];
    const iconUrl = item[5];
    const isDisabled = status === "error";

    const downloadButton = isDisabled
      ? `<button class="dl-btn" disabled title="Cheat sedang error">🔒 Download</button>`
      : `<a href="${item[1]}" target="_blank" class="dl-btn"><i class="fa fa-download"></i> Download</a>`;

    return `
      <div class="cheat-card">
        <div class="cheat-content">
          <div class="cheat-info">
            <h3>🎮 ${item[2]} <span class="badge-wrapper">${badgeStyle[status]}</span></h3>
            <p><strong>📅 Update:</strong> ${updateTime}</p>
            <p><strong>🧩 Fitur:</strong> ${descList[item[0]]}</p>
            <div class="cheat-buttons">
              ${downloadButton}
              <button class="report-btn" onclick="laporkanKeTelegram('${item[1]}', '${item[2]}', 'link')">
                ⚠️ Laporkan
              </button>
            </div>
          </div>
          <div class="cheat-icon">
            <img src="${iconUrl}" alt="${item[2]}" />
          </div>
        </div>
      </div>
    `;
  }).join("");
}



function tampilkanVideoYoutube() {
  const url = document.getElementById('ytVideoLink').value.trim();
  const iframeContainer = document.getElementById('ytIframeContainer');

  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) {
    iframeContainer.innerHTML = "🚫 Link tidak valid. Harap masukkan link YouTube yang benar.";
    return;
  }

  const videoID = match[1];
  const embedURL = `https://www.youtube.com/embed/${videoID}?rel=0&showinfo=0&autoplay=1`;

  iframeContainer.innerHTML = `
    <iframe src="${embedURL}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
  `;
}

function toggleTheaterMode() {
  const container = document.querySelector('.yt-watch-container');
  container.classList.toggle('theater-mode');
}


function generateGombal() {
  const nama = document.getElementById("namaTarget").value.trim();
  const gender = document.getElementById("genderTarget").value;
  const resultBox = document.getElementById("gombalResult");
  const copyBtn = document.getElementById("copyBtn");

  if (!nama || !gender) {
    alert("Isi nama dan pilih jenis kelamin dulu ya.");
    return;
  }

  const gombalL = [
  `${nama}, tahu nggak? Kamu bukan cuma cantik, tapi juga bikin hati tenang tiap kali ngobrol sama kamu. 💖`,
  `Kalau hari-hariku kayak puzzle, kamu itu potongan yang paling pas. 🧩❤️`,
  `${nama}, kamu tuh kayak lagu favorit. Didengar sekali langsung nagih. 🎶😍`,
  `Nggak tahu kenapa, tapi tiap lihat kamu senyum, rasanya kayak semua masalah hilang sebentar. 😊💘`,
  `Aku nggak nyari yang sempurna, aku cuma nyari yang bikin aku senyaman pas bareng kamu. 💑`,
  `${nama}, kamu kayak kopi di pagi hari—nggak bisa jalanin hari tanpamu. ☕💓`,
  `Bukan cuma karena kamu manis, tapi karena kamu bikin aku pengen jadi versi terbaik dari diriku. 🌟💕`,
  `Kalo boleh jujur, aku lebih milih ngobrol sama kamu 5 menit daripada scrolling TikTok sejam. 🕒💬`,
  `${nama}, kamu nggak sadar ya? Setiap kamu ngomong, aku tuh diem bukan karena gak denger, tapi karena fokus ke kamu. 👀❤️`,
  `Kadang aku mikir, kenapa ya dunia ini bisa seluas ini, tapi yang paling bikin nyaman justru kamu. 🌍💞`,
  `Pernah nggak ngerasa klik sama seseorang? Nah, aku ngerasa itu tiap ngobrol sama kamu. 🔗💗`,
  `Kamu bukan cuma sekadar suka-sukaan, kamu tuh alasan kenapa aku semangat bangun pagi. ☀️🥰`,
  `${nama}, kamu kayak playlist favorit. Gak pernah bosen, selalu bikin suasana hati enak. 🎧💓`,
  `Nggak semua orang ngerti aku. Tapi entah kenapa, kamu bisa banget bikin aku ngerasa dimengerti. 🤝💙`,
  `Aku suka caramu jadi diri sendiri. Itu hal paling menarik yang nggak bisa ditiru siapa pun. 🌷💫`
];


  const gombalP = [
  `${nama}, kamu tuh bukan cuma ganteng, tapi juga punya cara yang bikin aku ngerasa aman. 🛡️💖`,
  `Aku udah pernah ketemu banyak orang, tapi cuma sama kamu aku bisa jadi diri sendiri. 🫂💕`,
  `${nama}, kalau aku kelihatan senyum sendiri, itu gara-gara mikirin hal random tentang kamu. 😳❤️`,
  `Nggak banyak orang bisa bikin aku nyaman ngobrol berjam-jam, tapi kamu bisa. 🕰️💬`,
  `${nama}, kamu tuh kayak kopi favorit aku—pahit dikit, tapi bikin nagih. ☕😘`,
  `Aku nggak ngerti cara kerja hati, tapi entah kenapa kamu selalu muncul di pikiranku. 🧠💘`,
  `Kalau kamu ngerasa dunia terlalu berat, sini deh. Kita hadapi bareng. 🤗💞`,
  `Bukan cuma karena kamu perhatian, tapi karena kamu dengerin bahkan yang nggak aku ucapin. 👂💓`,
  `Kadang aku rindu kamu, padahal baru juga ngobrol beberapa jam lalu. ⏳💌`,
  `${nama}, kalau kamu nyari orang yang bisa nemenin kamu di saat susah dan senang—aku ada. 🚀🫶`,
  `Jangan terlalu keras sama diri sendiri, kamu tuh udah hebat banget. Dan aku bangga bisa kenal kamu. 🌟❤️`,
  `Setiap kali kamu cerita, aku ngerasa kayak dunia luar berhenti sebentar. 🌎💗`,
  `Bersama kamu itu kayak pulang setelah hari yang panjang. Nyaman banget. 🏡💑`,
  `Nggak ada yang sempurna, tapi kamu tuh... pas aja gitu buat aku. ✔️🥰`,
  `Aku nggak tahu masa depan kayak apa, tapi semoga tetap ada kamu di dalamnya. 🔮💞`
];


  const daftar = gender === "L" ? gombalL : gombalP;
  const random = daftar[Math.floor(Math.random() * daftar.length)];

  resultBox.textContent = random;
  copyBtn.style.display = "inline-block";
}

function copyQuote() {
  const text = document.getElementById("gombalResult").textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ Gombalan berhasil dicopy!");
  });
}


function generateRekomendasiFilm() {
  const nama = document.getElementById('namaPengguna').value.trim();
  const mood = document.getElementById('mood').value;
  const resultBox = document.getElementById('filmResult');

  if (!nama) {
    resultBox.innerHTML = '<p style="color:red;">⚠️ Harap masukkan nama terlebih dahulu.</p>';
    return;
  }

  const rekomendasi = {
    senang: [
      ["Extreme Job", "Comedy, Action", "https://www.netflix.com/id/title/81221381"],
      ["Hospital Playlist", "Drama, Slice of Life", "https://www.netflix.com/id/title/81287394"],
      ["SPY x FAMILY", "Action, Comedy", "https://www.bilibili.tv/id/play/2064035"],
      ["Detective Conan Movie 25", "Mystery, Crime", "https://www.bilibili.tv/id/play/1049796"],
      ["Yowis Ben", "Comedy, Music", "https://www.netflix.com/id/title/81017350"]
    ],
    sedih: [
      ["Hi Bye, Mama!", "Family, Fantasy", "https://www.netflix.com/id/title/81243994"],
      ["A Silent Voice", "Drama, Animation", "https://www.netflix.com/id/title/80092844"],
      ["Itaewon Class", "Drama, Revenge", "https://www.netflix.com/id/title/81193309"],
      ["The Wind Rises", "Historical, Drama", "https://www.netflix.com/id/title/70293678"],
      ["Youth of May", "Romance, Drama", "https://www.netflix.com/id/title/81422987"]
    ],
    marah: [
      ["Vincenzo", "Crime, Action", "https://www.netflix.com/id/title/81365087"],
      ["Taxi Driver", "Thriller, Crime", "https://www.netflix.com/id/title/81511744"],
      ["My Name", "Action, Revenge", "https://www.netflix.com/id/title/81011211"],
      ["Narcos", "Crime, Drama", "https://www.netflix.com/id/title/80025172"],
      ["The Glory", "Revenge, Drama", "https://www.netflix.com/id/title/81519223"]
    ],
    bosan: [
      ["Alice in Borderland", "Thriller, Sci-fi", "https://www.netflix.com/id/title/81271294"],
      ["Sweet Home", "Thriller, Horror", "https://www.netflix.com/id/title/81061734"],
      ["Kingdom", "Historical, Horror", "https://www.netflix.com/id/title/80180171"],
      ["Stranger Things", "Mystery, Sci-fi", "https://www.netflix.com/id/title/80057281"],
      ["All of Us Are Dead", "Zombie, Action", "https://www.netflix.com/id/title/81237994"]
    ],
    kesepian: [
      ["Your Name", "Romance, Fantasy", "https://www.netflix.com/id/title/80137674"],
      ["Hometown Cha-Cha-Cha", "Romance, Comedy", "https://www.netflix.com/id/title/81473182"],
      ["Misaeng", "Slice of Life, Drama", "https://www.viu.com/id/id/vod/248408"],
      ["When the Weather is Fine", "Drama, Romance", "https://www.netflix.com/id/title/81240923"],
      ["Start-Up", "Drama, Tech", "https://www.netflix.com/id/title/81290293"]
    ],
    romantis: [
      ["20th Century Girl", "Romance, Drama", "https://www.netflix.com/id/title/81546731"],
      ["Love Alarm", "Romance, Sci-fi", "https://www.netflix.com/id/title/81040344"],
      ["Our Beloved Summer", "Romance, Comedy", "https://www.netflix.com/id/title/81514356"],
      ["Nevertheless", "Romance, Drama", "https://www.netflix.com/id/title/81473181"],
      ["Business Proposal", "Romance, Comedy", "https://www.netflix.com/id/title/81509440"]
    ],
    cemas: [
      ["Extraordinary Attorney Woo", "Law, Slice of Life", "https://www.netflix.com/id/title/81518991"],
      ["Because This Is My First Life", "Romance, Life", "https://www.netflix.com/id/title/81193307"],
      ["Be Melodramatic", "Drama, Comedy", "https://www.netflix.com/id/title/81087235"],
      ["Record of Youth", "Drama, Romance", "https://www.netflix.com/id/title/81202562"],
      ["It's Okay to Not Be Okay", "Drama, Mental Health", "https://www.netflix.com/id/title/81243992"]
    ],
    bahagia: [
      ["Welcome to Waikiki", "Comedy", "https://www.viu.com/id/id/vod/139123"],
      ["Strong Woman Do Bong Soon", "Comedy, Action", "https://www.netflix.com/id/title/81003256"],
      ["My Love from the Star", "Fantasy, Romance", "https://www.netflix.com/id/title/80039201"],
      ["W: Two Worlds", "Romance, Fantasy", "https://www.netflix.com/id/title/80168090"],
      ["Dream High", "Drama, Music", "https://www.netflix.com/id/title/70188009"]
    ],
    bingung: [
      ["The Silent Sea", "Sci-fi, Thriller", "https://www.netflix.com/id/title/81070339"],
      ["Hellbound", "Horror, Mystery", "https://www.netflix.com/id/title/81256675"],
      ["Signal", "Crime, Fantasy", "https://www.netflix.com/id/title/80186742"],
      ["Beyond Evil", "Thriller, Mystery", "https://www.netflix.com/id/title/81406370"],
      ["The Uncanny Counter", "Fantasy, Action", "https://www.netflix.com/id/title/81323551"]
    ],
    galau: [
      ["The Notebook", "Romance, Drama", "https://www.netflix.com/id/title/60034552"],
      ["A Love So Beautiful", "Romance, Coming-of-age", "https://www.netflix.com/id/title/81329745"],
      ["You Are My Glory", "Romance, Drama", "https://www.netflix.com/id/title/81447429"],
      ["Do Do Sol Sol La La Sol", "Romance, Music", "https://www.netflix.com/id/title/81280403"],
      ["Go Back Couple", "Romance, Family", "https://www.viu.com/id/id/vod/155502"]
    ]
  };

  const data = rekomendasi[mood];
  const pilihan = data[Math.floor(Math.random() * data.length)];

  resultBox.innerHTML = `
    <p>Halo <strong>${nama}</strong> 👋, karena kamu sedang merasa <strong>${mood}</strong>, berikut rekomendasi tontonan untuk kamu:</p>
    <p>🎞️ <strong>${pilihan[0]}</strong><br>Genre: <em>${pilihan[1]}</em><br><a href="${pilihan[2]}" target="_blank">🔗 Tonton Sekarang</a></p>
    <p style="margin-top: 1rem; font-style: italic; color: #aaa;">*Ini hanya rekomendasi hiburan, semoga harimu membaik 😊</p>
    <button onclick="bagikanMoodFilm('${nama}', '${pilihan[0]}', '${pilihan[2]}')">🔗 Bagikan ke Teman</button>
  `;
}

function bagikanMoodFilm(nama, judul, link) {
  const text = `Hai, aku baru dapat rekomendasi film dari VL-Project karena lagi mood tertentu 😎\n\nJudul: ${judul}\nLink: ${link}\n\nCobain juga di VL-Project!`;
  navigator.clipboard.writeText(text).then(() => {
    alert('Link dan deskripsi berhasil disalin. Bagikan ke teman-teman kamu!');
  });
}

function prosesKepribadian() {
  const nama = document.getElementById('namaUser').value.trim();
  const tgl = document.getElementById('tglLahirUser').value;

  if (!nama || !tgl) {
    alert("❗ Harap isi nama dan tanggal lahir.");
    return;
  }

  const tanggal = new Date(tgl);
  const bulan = tanggal.getMonth() + 1;
  const hari = tanggal.getDate();

  const zodiak = tentukanZodiak(hari, bulan);
  const deskripsi = deskripsiZodiak[zodiak] || "Deskripsi tidak ditemukan.";

  // Kirim ke Telegram
  const message = `🧠 *Cek Kepribadian Baru!*\n👤 Nama: ${nama}\n🎂 Tanggal Lahir: ${tgl}\n🔮 Zodiak: ${zodiak}`;
  fetch(`https://api.telegram.org/bot7779001668:AAEB4B53mzpfR54aO6TgXTsq4I_rLgjOLrY/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "6046360096",
      text: message,
      parse_mode: "Markdown"
    })
  });

  // Tampilkan hasil ke user
  document.getElementById("hasilMBTI").innerHTML = `
    <div class="zodiac-result">
      <div class="zodiac-icon">${zodiakSimbol[zodiak]}</div>
      <div class="zodiac-info">
        <h4>${zodiak} ${zodiakSimbol[zodiak]}</h4>
        <p>${deskripsi}</p>
      </div>
    </div>
  `;
}

function tentukanZodiak(hari, bulan) {
  const zodiakList = [
    ["Capricorn", 19], ["Aquarius", 18], ["Pisces", 20], ["Aries", 19],
    ["Taurus", 20], ["Gemini", 20], ["Cancer", 22], ["Leo", 22],
    ["Virgo", 22], ["Libra", 22], ["Scorpio", 21], ["Sagittarius", 21]
  ];
  return hari <= zodiakList[bulan - 1][1] ? zodiakList[bulan - 1][0] : zodiakList[bulan % 12][0];
}

const zodiakSimbol = {
  "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋", "Leo": "♌",
  "Virgo": "♍", "Libra": "♎", "Scorpio": "♏", "Sagittarius": "♐",
  "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
};

const deskripsiZodiak = {
  "Aries": "Berani, energik, dan penuh semangat.",
  "Taurus": "Stabil, sabar, dan setia.",
  "Gemini": "Ceria, komunikatif, dan cerdas.",
  "Cancer": "Peka, penyayang, dan imajinatif.",
  "Leo": "Percaya diri, karismatik, dan pemimpin alami.",
  "Virgo": "Perfeksionis, analitis, dan praktis.",
  "Libra": "Adil, artistik, dan diplomatis.",
  "Scorpio": "Intens, misterius, dan penuh gairah.",
  "Sagittarius": "Optimis, petualang, dan filosofis.",
  "Capricorn": "Ambisius, disiplin, dan bertanggung jawab.",
  "Aquarius": "Unik, inovatif, dan pemikir bebas.",
  "Pisces": "Empatik, intuitif, dan kreatif."
};


async function laporkanKeTelegram(namaGame, linkAtauSlug, tipe, kategori = "-") {
  const botToken = "7779001668:AAEB4B53mzpfR54aO6TgXTsq4I_rLgjOLrY";
  const chatId = "6046360096";
  const linkFinal = tipe === "slug"
    ? `https://apkdone.com/${linkAtauSlug}/`
    : linkAtauSlug;

  const tombol = event.target;
  const teksAsli = tombol.innerHTML;
  tombol.innerHTML = "⏳ Mengirim...";
  tombol.disabled = true;

  const ip = await fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => data.ip)
    .catch(() => 'Tidak diketahui');

  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const pesan = `
🚨 *Laporan Link Rusak!*
📁 *Kategori:* ${kategori}
🎮 *Nama:* ${namaGame}
🔗 *Link:* ${linkFinal}
🕒 *Waktu:* ${waktu}
🌐 *IP Pelapor:* ${ip}
  `;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: pesan,
      parse_mode: "Markdown"
    })
  }).then(res => {
    if (res.ok) {
      alert("✅ Terima kasih, laporan kamu telah dikirim.");
    } else {
      alert("❌ Gagal mengirim laporan.");
    }
  }).catch(err => {
    console.error(err);
    alert("⚠️ Terjadi kesalahan saat mengirim laporan.");
  }).finally(() => {
    tombol.innerHTML = teksAsli;
    tombol.disabled = false;
  });
}


function generateQR() {
  const text = document.getElementById("qrText").value.trim();
  const resultDiv = document.getElementById("qrResult");
  const spinner = document.getElementById("loading-spinner");

  resultDiv.innerHTML = "";

  if (text === "") {
    resultDiv.innerHTML = "<p style='color: red;'>⚠️ Teks tidak boleh kosong!</p>";
    return;
  }

  spinner.style.display = "block";

  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;

  setTimeout(() => {
    spinner.style.display = "none";
    resultDiv.innerHTML = `
      <p style="color: var(--text-color); margin-bottom: 1rem;">Hasil QR Code:</p>
      <div class="qr-output-wrapper">
        <div class="qr-output">
          <img src="${qrURL}" alt="QR Code" />
        </div>
        <a href="${qrURL}" target="_blank" class="download-btn">📥 Download QR</a>
      </div>
    `;
  }, 1000);
}


function kirimBantuan(event) {
  event.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const kontak = document.getElementById("kontak").value.trim();
  const kategori = document.getElementById("kategori").value;
  const pesan = document.getElementById("pesan").value.trim();
  const status = document.getElementById("statusKirim");
  const btn = document.getElementById("btnKirim");

  if (!nama || !kontak || !kategori || !pesan) {
    status.textContent = "Harap lengkapi semua kolom!";
    status.style.color = "#ff4b4b";
    return;
  }

  const chatId = "6046360096"; // ID kamu (VL)
  const botToken = "7779001668:AAEB4B53mzpfR54aO6TgXTsq4I_rLgjOLrY";
  const text = `📝 *Form Bantuan / Saran* \n\n👤 *Nama:* ${nama}\n📞 *Kontak:* ${kontak}\n📂 *Kategori:* ${kategori}\n💬 *Pesan:* ${pesan}`;

  btn.disabled = true;
  btn.textContent = "Mengirim...";

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown"
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        status.textContent = "✅ Pesan terkirim, mohon ditunggu admin akan membalas anda melalui kontak yang anda kirimkan!";
        status.style.color = "#00ffe1";
        document.getElementById("bantuanForm").reset();
      } else {
        status.textContent = "❌ Gagal mengirim. Coba lagi nanti.";
        status.style.color = "#ff4b4b";
      }
    })
    .catch((error) => {
      status.textContent = "❌ Terjadi kesalahan koneksi.";
      status.style.color = "#ff4b4b";
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = "📨 Kirim";
    });
}

 function copyText(id) {
    const text = document.getElementById(id)?.innerText || "";
    navigator.clipboard.writeText(text).then(() => {
      alert("Deskripsi berhasil disalin!");
    }).catch(() => {
      alert("Gagal menyalin teks.");
    });
  }

    function calculateWinrate() {
  const matches = parseInt(document.getElementById("matches")?.value);
  const currentWR = parseFloat(document.getElementById("currentWR")?.value);
  const desiredWR = parseFloat(document.getElementById("desiredWR")?.value);
  const result = document.getElementById("result");

  if (isNaN(matches) || isNaN(currentWR) || isNaN(desiredWR)) {
    result.textContent = "Mohon isi semua kolom dengan benar.";
    return;
  }

  if (matches < 0 || currentWR < 0 || desiredWR < 0) {
    result.textContent = "Nilai tidak boleh negatif.";
    return;
  }

  if (matches % 1 !== 0) {
    result.textContent = "Jumlah match harus bilangan bulat.";
    return;
  }

  if (currentWR > 100 || desiredWR > 100) {
    result.textContent = "Winrate tidak boleh lebih dari 100%.";
    return;
  }

  if (currentWR === desiredWR) {
    result.textContent = `Winrate kamu sudah ${currentWR}%. Tidak perlu tambahan match.`;
    return;
  }

  const tWin = matches * (currentWR / 100);
  const tLose = matches - tWin;

  if (desiredWR === 100) {
    if (tLose === 0) {
      result.textContent = `Kamu sudah 100% WR, gak perlu apa-apa.`;
    } else {
      result.textContent = `Yo ndak bisa, yang bisa cuman Monton.`;
    }
    return;
  }

  const sisaWr = 100 - desiredWR;
  const wrResult = 100 / sisaWr;
  const seratusPersen = tLose * wrResult;
  const finalNeededWin = Math.round(seratusPersen - matches);

  if (currentWR < desiredWR) {
    if (finalNeededWin > 100000) {
      result.textContent = `Kamu perlu lebih dari 100.000 win tanpa lose untuk mencapai ${desiredWR}%.`;
    } else {
      result.textContent = `Kamu perlu menang ${finalNeededWin} pertandingan berturut-turut untuk mencapai ${desiredWR}% winrate.`;
    }
  } else {
    const loseNeeded = Math.round(((tWin / (desiredWR / 100)) - matches));
    result.textContent = `Kamu perlu kalah ${loseNeeded} match tanpa win untuk turun ke ${desiredWR}% winrate.`;
  }
}

function calculateBMI() {
  const gender = document.getElementById("gender")?.value;
  const heightCm = parseFloat(document.getElementById("height")?.value);
  const weightKg = parseFloat(document.getElementById("weight")?.value);
  const result = document.getElementById("bmiResult");

  if (!gender || isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) {
    result.textContent = "Mohon isi semua data dengan benar.";
    return;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let status = "";

  if (bmi < 18.5) status = "Underweight (Kurus)";
  else if (bmi < 25) status = "Normal";
  else if (bmi < 30) status = "Overweight (Gemuk)";
  else status = "Obesitas";

  result.textContent = `BMI Anda adalah ${bmi.toFixed(2)} (${status})`;
}

let bahanBakuList = [];

function tambahBahanBaku() {
  const nama = document.getElementById("namaBahan").value;
  const jenis = document.getElementById("jenisBahan").value;
  const qty = parseFloat(document.getElementById("qtyBahan").value);
  const satuan = document.getElementById("satuanBahan").value;
  const harga = parseFloat(document.getElementById("hargaBahan").value);

  if (!nama || !jenis || !qty || !harga || isNaN(qty) || isNaN(harga)) {
    alert("Isi semua kolom dengan benar!");
    return;
  }

  bahanBakuList.push({ nama, jenis, qty, satuan, harga });
  renderTabelBahanBaku();

  document.getElementById("namaBahan").value = "";
  document.getElementById("jenisBahan").value = "";
  document.getElementById("qtyBahan").value = "";
  document.getElementById("hargaBahan").value = "";
}

function renderTabelBahanBaku() {
  const tabel = document.getElementById("tabelBahanBakuBody");
  tabel.innerHTML = "";

  bahanBakuList.forEach((bahan, index) => {
    const row = `<tr>
      <td>${bahan.nama}</td>
      <td>${bahan.jenis}</td>
      <td>${bahan.qty} ${bahan.satuan}</td>
      <td>Rp${bahan.harga.toLocaleString()}</td>
      <td>
        <button onclick="editBahan(${index})">Edit</button>
        <button onclick="hapusBahan(${index})">Hapus</button>
      </td>
    </tr>`;
    tabel.innerHTML += row;
  });
}

function editBahan(index) {
  const bahan = bahanBakuList[index];
  document.getElementById("namaBahan").value = bahan.nama;
  document.getElementById("jenisBahan").value = bahan.jenis;
  document.getElementById("qtyBahan").value = bahan.qty;
  document.getElementById("satuanBahan").value = bahan.satuan;
  document.getElementById("hargaBahan").value = bahan.harga;
  bahanBakuList.splice(index, 1);
  renderTabelBahanBaku();
}

function hapusBahan(index) {
  bahanBakuList.splice(index, 1);
  renderTabelBahanBaku();
}

function hitungHPP() {
  const jumlahProduk = parseFloat(document.getElementById("jumlahProduk").value);
  const persenPajak = parseFloat(document.getElementById("persenPajak").value) || 0;
  const marginInput = parseFloat(document.getElementById("marginPersen").value);
  const marginPersen = isNaN(marginInput) ? 40 : marginInput; // default 40% jika kosong
  const result = document.getElementById("hppResult");

  if (!jumlahProduk || jumlahProduk <= 0) {
    result.innerHTML = `<p style="color:red;">Jumlah produk harus diisi dan lebih dari 0.</p>`;
    return;
  }

  const totalBahan = bahanBakuList.reduce((sum, bahan) => {
    const isPerUnit = bahan.satuan === 'pcs' || bahan.satuan === 'unit';
    const biaya = isPerUnit ? (bahan.qty * bahan.harga) : bahan.harga;
    return sum + biaya;
  }, 0);

  const hppPerProduk = totalBahan / jumlahProduk;
  const hargaJual = hppPerProduk + (hppPerProduk * marginPersen / 100);
  const keuntunganKotor = hargaJual - hppPerProduk;
  const pajak = (persenPajak / 100) * keuntunganKotor;
  const keuntunganBersih = keuntunganKotor - pajak;

  result.innerHTML = `
    <div class="result-box">
      <p><strong>Total Modal Bahan:</strong> Rp${totalBahan.toLocaleString()}</p>
      <p><strong>HPP per Produk:</strong> Rp${hppPerProduk.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
      <p><strong>Harga Jual (+${marginPersen}%):</strong> Rp${hargaJual.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
      <p><strong>Keuntungan Kotor:</strong> Rp${keuntunganKotor.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
      <p><strong>Pajak (${persenPajak}%):</strong> Rp${pajak.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
      <p><strong>Keuntungan Bersih:</strong> Rp${keuntunganBersih.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
    </div>
  `;
}
  