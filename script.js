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

if (page === 'adminucapan') {
  content = `
    <section class="adminucapan-container">
      <div class="adminucapan-box">
        <h2 class="adminucapan-title">🎁 Generator Link Ucapan</h2>

        <label>Dari:</label>
        <input type="text" id="adminDari" class="adminucapan-input" placeholder="Contoh: Vicky / Kak Vicky / Secret Admirer">

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
  