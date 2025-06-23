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
        content = `<section style="padding: 2rem;"><h2 style="font-size: 2rem; color: var(--text-color);">Dashboard</h2>
	<section style="padding: 2rem;">
      <h2 style="font-size: 2rem; color: var(--text-color);"></h2>
      <h3>Pengumuman</h3>
      <table class="announcement-table">
        <thead>
          <tr><th>Last Updated</th><th>Deskripsi</th><th>Link Download</th></tr>
        </thead>
        <tbody>
          <tr><td>23-06-2025</td><td>Capcut Premium <span class="badge update">Update</span></td><td><a href="https://contohlink.com/download-capcut" class="download-btn" target="_blank">
    <i class="fas fa-download"></i> Download</a></td>
</tr>
<tr><td>23-06-2025</td><td>Capcut Premium <span class="badge update">Update</span></td><td><a href="https://contohlink.com/download-capcut" class="download-btn" target="_blank">
    <i class="fas fa-download"></i> Download</a></td>
</tr>
        </tbody>
      </table>
	</section>`;
      }

// BATAS UNTUK HALAMAN DAN JS FUNGSI //

      main.innerHTML = content;
      document.getElementById("sidebar").classList.remove("active");
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
  
