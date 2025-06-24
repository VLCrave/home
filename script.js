 // Blokir klik kanan
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  // Blokir shortcut umum DevTools
  document.addEventListener('keydown', function (e) {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
    }

    // Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key.toUpperCase())) {
      e.preventDefault();
    }

    // Ctrl+U (view source), Ctrl+S (save)
    if (e.ctrlKey && ['U', 'S'].includes(e.key.toUpperCase())) {
      e.preventDefault();
    }
  });

  // Deteksi Developer Tools dibuka (basic)
  setInterval(function () {
    const before = new Date().getTime();
    debugger;
    const after = new Date().getTime();
    if (after - before > 100) {
      document.body.innerHTML = "<h1 style='color: red; text-align: center;'>Akses Diblokir!</h1>";
    }
  }, 1000);

window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup-greeting");
  const overlay = document.getElementById("popup-overlay");
  const closeBtn = document.getElementById("close-popup");
  const accessCodeInput = document.getElementById("access-code");
  const spinner = document.getElementById("loading-spinner");
  const checkIcon = document.getElementById("checkmark");
  const crossIcon = document.getElementById("crossmark");
  const purchaseLink = document.getElementById("purchase-link");

  // WAJIB: Tampilkan popup saat pertama kali
  document.body.classList.add("popup-active");

  closeBtn.addEventListener("click", () => {
    const kode = accessCodeInput.value.trim();
    spinner.style.display = "block";
    checkIcon.style.display = "none";
    crossIcon.style.display = "none";
    purchaseLink.style.display = "none";
    closeBtn.disabled = true;

    setTimeout(() => {
      spinner.style.display = "none";

      if (kode === "PREMIUM") {
        checkIcon.style.display = "block";
        purchaseLink.style.display = "none";
        setTimeout(() => {
          popup.style.display = "none";
          overlay.style.display = "none";
          document.body.classList.remove("popup-active"); // WAJIB agar halaman bisa dipakai
        }, 1000);
      } else {
        crossIcon.style.display = "block";
        purchaseLink.style.display = "block";
        setTimeout(() => {
          crossIcon.style.display = "none";
        }, 3000);
      }

      closeBtn.disabled = false;
    }, 2000);
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
        <p>150</p>
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
        <tr><th><i class="fas fa-calendar-alt"></i> Tanggal</th><th><i class="fas fa-info-circle"></i> Deskripsi</th></tr>
      </thead>
      <tbody>
        <tr><td>23-06-2025</td><td>Pembaruan sistem keamanan backend <span class="badge update">Update</span></td></tr>
        <tr><td>22-06-2025</td><td>Penambahan fitur kalkulator HPP <span class="badge new">New</span></td></tr>
        <tr><td>21-06-2025</td><td>Penghapusan fitur lama versi v1 <span class="badge delete">Delete</span></td></tr>
        <tr><td>20-06-2025</td><td>Pemeliharaan server pukul 00:00 - 03:00 <span class="badge maintenance">Maintenance</span></td></tr>
      </tbody>
    </table>
  </section>`;

  // Fungsi-fungsi untuk last visit dan last update
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
            const url = `https://www.canva.com/templates/?query=${encodeURIComponent(category)}`;
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
            ["01-04-2025", "Subway Surfers v3.30.2 MOD", "https://id.happymod.cloud/subway-surfers/com.kiloo.subwaysurf/"]
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
}

// BATAS UNTUK HALAMAN DAN JS FUNGSI //

      main.innerHTML = content;
      document.getElementById("sidebar").classList.remove("active");
    }

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
  