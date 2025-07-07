document.addEventListener("DOMContentLoaded", async () => {
  // === Script kamu yang sudah ada ===
  // ✅ Notifikasi awal
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("🔔 Notifikasi Diaktifkan!", {
          body: "Kami akan memberi tahu jika pesanan kamu dikirimkan.",
          icon: "./img/icon.png"
        });
      }
    });
  }

  // ✅ DOM Element
  const popup = document.getElementById("popup-greeting");
  const overlay = document.getElementById("popup-overlay");
  const closeBtn = document.getElementById("close-popup");
  const popupImg = document.getElementById("popup-img");
  const popupText = document.getElementById("popup-text");
  const checkoutBtn = document.querySelector(".checkout-btn-final");

  if (!popup || !overlay || !closeBtn || !popupImg || !popupText) return;

  let isOpen = true;
  let jamBuka = "08:00", jamTutup = "22:00";

  try {
    const db = firebase.firestore();
    const doc = await db.collection("pengaturan").doc("jam_layanan").get();

    const data = doc.exists ? doc.data() : { buka: "08:00", tutup: "22:00", aktif: true, mode: "otomatis" };
    jamBuka = data.buka || "08:00";
    jamTutup = data.tutup || "22:00";
    const aktif = data.aktif !== false;
    const mode = data.mode || "otomatis";

    const now = new Date();
    const hour = now.getHours();

    if (mode === "otomatis") {
      const buka = parseInt(jamBuka.split(":")[0]);
      const tutup = parseInt(jamTutup.split(":")[0]);
      isOpen = aktif && hour >= buka && hour < tutup;
    } else {
      isOpen = aktif;
    }

    // ✅ Tampilkan popup
    popup.style.display = "block";
    overlay.style.display = "block";
    document.body.classList.add("popup-active");

    popupImg.src = isOpen ? "./img/open.png" : "./img/close.png";
    popupText.innerHTML = isOpen
      ? `<strong>✅ Layanan Aktif</strong><br>Selamat berbelanja!`
      : `<strong>⛔ Layanan Tutup</strong><br>Buka setiap ${jamBuka} - ${jamTutup}`;

    // ✅ Tutup popup
closeBtn.addEventListener("click", async () => {
  popup.style.display = "none";
  overlay.style.display = "none";
  document.body.classList.remove("popup-active");

  try {
    const user = firebase.auth().currentUser;
    if (user) {
      const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
      const role = userDoc.exists ? (userDoc.data().role || "").toLowerCase() : "";

      if (role === "seller") {
        loadContent("seller-dashboard");
      } else if (role === "driver") {
        loadContent("driver-dashboard");
      } else {
        loadContent("productlist");
      }
    } else {
      loadContent("productlist");
    }

    if (!isOpen) {
      alert(`⚠️ Layanan saat ini sedang tutup.\nJam buka: ${jamBuka} - ${jamTutup}`);
    }

  } catch (err) {
    console.error("❌ Gagal mendeteksi role user:", err);
    loadContent("productlist");
  }
});


    // ✅ Disable tombol checkout jika layanan tutup
    if (!isOpen && checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Layanan Tutup";
      checkoutBtn.style.opacity = "0.6";
      checkoutBtn.style.cursor = "not-allowed";
    }

  } catch (err) {
    console.error("❌ Gagal mengambil jam layanan:", err);
    alert("⚠️ Gagal memuat pengaturan layanan. Silakan refresh halaman.");
  }

  // ✅ Update badge keranjang jika ada
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }

  // ✅ Auto-refresh riwayat jika di halaman riwayat
  const page = localStorage.getItem("pageAktif") || "";
  if (page === "riwayat" && typeof renderRiwayat === "function") {
    renderRiwayat();
    setInterval(() => {
      if (document.getElementById("riwayat-list")) {
        renderRiwayat();
        console.log("🔁 Riwayat diperbarui otomatis");
      }
    }, 1000);
  }

  // === Tambahan: Dropdown toggle handler ===
  document.addEventListener("click", function(event) {
    if (event.target.matches(".dropdown-toggle")) {
      const dropdownContainer = event.target.closest(".dropdown-container");
      if (!dropdownContainer) return;

      const dropdownMenu = dropdownContainer.querySelector(".dropdown-menu");
      if (!dropdownMenu) return;

      const isShown = dropdownMenu.style.display === "block";

      // Tutup semua dropdown menu lain
      document.querySelectorAll(".dropdown-menu").forEach(menu => {
        menu.style.display = "none";
      });

      // Toggle dropdown menu saat ini
      dropdownMenu.style.display = isShown ? "none" : "block";

      event.stopPropagation();
    } else {
      // Klik di luar tombol dropdown, tutup semua dropdown
      document.querySelectorAll(".dropdown-menu").forEach(menu => {
        menu.style.display = "none";
      });
    }
  });

});


// === Fungsi Utama ===
async function loadContent(page) {
  const main = document.getElementById("page-container");
  let content = '';

if (page === 'alamat') {
  content = `
    <div class="alamat-wrapper">
      <section>
        <h2>📍 Alamat Pengiriman</h2>

        <div class="alamat-box address-box" id="address-display" style="display:none;">
          <h3>Alamat Pengiriman:</h3>
          <p id="saved-address">Alamat belum ditambahkan</p>
          <p><strong>Catatan:</strong> <span id="saved-note">Tidak ada catatan</span></p>
          <div style="margin-top:10px;">
            <button onclick="toggleAddressForm(true)">✏️ Edit</button>
            <button onclick="deleteAddress()">🗑️ Hapus</button>
          </div>
        </div>

        <div class="alamat-box address-form-box" id="address-form" style="display:none;">
          <h3 id="form-title">Tambah Alamat Pengiriman</h3>
          <input type="text" id="full-name" placeholder="Nama Lengkap" />
          <input type="text" id="phone-number" placeholder="Nomor HP" />
          <input type="text" id="full-address" placeholder="Alamat Lengkap" />
          <textarea id="courier-note" placeholder="Patokan" rows="3"></textarea>
          <button class="add-address-btn" onclick="saveAddress()">Simpan Alamat</button>
        </div>

        <div class="alamat-footer">
          <button class="add-address-btn" onclick="toggleAddressForm()">Tambah Alamat</button>
        </div>

        <div id="map-container" style="height: 300px; margin: 10px 0;"></div>
      </section>
    </div>
  `;

  main.innerHTML = content;
  loadSavedAddress();
  initMap();
}


if (page === 'checkout') {
  content = `
    <div class="checkout-wrapper checkout-page">
      <h2>🧾 Checkout Pesanan</h2>

      <!-- Alamat Pengiriman -->
      <div class="alamat-box">
        <h3>📍 Alamat Pengiriman</h3>
        <div class="alamat-terpilih" id="alamat-terpilih">
          <p>Memuat alamat...</p>
        </div>
      </div>

      <!-- Daftar Keranjang -->
<div class="keranjang-box">
  <h3>🛒 Daftar Pesanan</h3>
  <ul id="cart-items-list"></ul>
  <div id="total-checkout"></div>

  <!-- Catatan Tambahan -->
  <div class="catatan-tambahan" style="margin-top: 15px;">
    <label for="catatan-pesanan"><strong>📝 Catatan Tambahan</strong></label>
    <textarea id="catatan-pesanan" placeholder="Tulis catatan untuk penjual... (opsional)" rows="3" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; margin-top:5px;"></textarea>
  </div>
</div>

      <!-- Metode Pengiriman -->
      <div class="pengiriman-wrapper">
        <label class="pengiriman-label">🚚 Metode Pengiriman:</label>
        <div class="pengiriman-box">
          <input type="radio" name="pengiriman" id="standard" value="standard" checked>
          <label for="standard" class="pengiriman-card">
            <div class="pengiriman-judul">Standard</div>
            <div class="pengiriman-harga" id="ongkir-standard">Menghitung...</div>
            <div class="pengiriman-jarak" id="jarak-standard">Jarak: -</div>
            <div class="pengiriman-estimasi" id="estimasi-standard">Estimasi: -</div>
          </label>

          <input type="radio" name="pengiriman" id="priority" value="priority">
          <label for="priority" class="pengiriman-card">
            <div class="pengiriman-judul">Priority</div>
            <div class="pengiriman-harga" id="ongkir-priority">Menghitung...</div>
            <div class="pengiriman-jarak" id="jarak-priority">Jarak: -</div>
            <div class="pengiriman-estimasi" id="estimasi-priority">Estimasi: -</div>
          </label>
        </div>
      </div>

      <!-- Voucher -->
      <div class="pengiriman-boxs">
        <h3>🎟️ Voucher</h3>
        <div class="voucher-section-full">
          <input type="text" id="voucher" placeholder="Masukkan kode voucher...">
          <button id="cek-voucher-btn" onclick="cekVoucher()">Cek</button>
        </div>
        <small id="voucher-feedback" class="checkout-note"></small>
      </div>

      <!-- Metode Pembayaran -->
      <div class="pembayaran-box">
        <label class="pembayaran-label"><i class="fas fa-wallet"></i> Metode Pembayaran</label>
        <select id="metode-pembayaran">
          <option value="cod">Bayar di Tempat (COD)</option>
          <option value="saldo">Saldo</option>
        </select>
      </div>

      <!-- Rincian Pembayaran -->
      <div class="rincian-box">
        <h3>🧾 Rincian Pembayaran</h3>
        <div class="rincian-item"><span>Subtotal Pesanan</span><span id="rincian-subtotal">Rp 0</span></div>
        <div class="rincian-item"><span>Subtotal Pengiriman</span><span id="rincian-ongkir">Rp 0</span></div>
        <div class="rincian-item biaya-layanan"><span>Biaya Layanan</span><span>Rp 0</span></div>
        <div class="rincian-item"><span>Total Diskon</span><span id="rincian-diskon">- Rp 0</span></div>
      </div>

      <!-- Sticky Footer -->
      <div class="checkout-footer-sticky">
        <div class="total-info">
          <strong>Total: Rp <span id="footer-total">0</span></strong>
          <small class="hemat-text">Hemat Rp <span id="footer-diskon">0</span></small>
        </div>
        <button class="checkout-btn-final" onclick="handleKlikCheckout()">Buat Pesanan</button>
      </div>
    </div>
  `;

  main.innerHTML = content;

  renderAlamatCheckout();
  renderCheckoutItems();
  cekSaldoUser();

  document.querySelectorAll('input[name="pengiriman"]').forEach(radio => {
    radio.addEventListener('change', renderCheckoutItems);
  });
}

else if (page === "driver-dashboard") {
  const container = document.getElementById("page-container");
  container.innerHTML = "<h2>🚗 Dashboard Driver</h2><p>Memuat data...</p>";

  (async () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const db = firebase.firestore();
    const driverId = user.uid;
    const driverRef = db.collection("driver").doc(driverId);

    mulaiUpdateLokasiDriver(driverId);

    const driverDoc = await driverRef.get();
    if (!driverDoc.exists) {
      container.innerHTML = `<p style="color:red;">❌ Data driver tidak ditemukan.</p>`;
      return;
    }

    const dataDriver = driverDoc.data();
    const saldoDriver = dataDriver.saldo || 0;
    const lokasiDriver = dataDriver.lokasi || null;
    const plat = dataDriver.nomorPlat || "-";
    const namaDriver = dataDriver.nama || "-";
    let statusDriver = dataDriver.status || "nonaktif";
    let forceNonaktif = false;
    const pelanggaran = dataDriver.pelanggaran || 0;
    const nonaktifHingga = dataDriver.nonaktifHingga || 0;
    const now = Date.now();

    const dalamPembatasan = statusDriver === "nonaktif" && nonaktifHingga && now <= nonaktifHingga;

    if (statusDriver === "nonaktif" && nonaktifHingga && now > nonaktifHingga) {
      await driverRef.update({
        status: "aktif",
        nonaktifHingga: firebase.firestore.FieldValue.delete()
      });
      statusDriver = "aktif";
      alert("✅ Driver telah diaktifkan kembali otomatis karena masa nonaktif sudah berakhir.");
    }

    if (dalamPembatasan) {
      const sisaMenit = Math.ceil((nonaktifHingga - now) / 60000);
      alert(`🚫 Akun Anda sedang dinonaktifkan sementara karena pelanggaran.\n` +
            `Sisa waktu nonaktif: ${sisaMenit} menit.\n` +
            `Level pelanggaran: ${pelanggaran}`);
    }

    let multiOrderAktif = dataDriver.multiOrderAktif || false;
    let multiOrderExpired = dataDriver.multiOrderExpired?.toDate?.() || null;
    const masihLangganan = multiOrderExpired && multiOrderExpired > new Date();

    if (!masihLangganan && multiOrderAktif) {
      multiOrderAktif = false;
      await driverRef.update({ multiOrderAktif: false });
    }

    if (saldoDriver < 3000) {
      forceNonaktif = true;
      if (statusDriver !== "nonaktif") {
        await driverRef.update({ status: "nonaktif" });
        statusDriver = "nonaktif";
      }
      alert(`🛑 Saldo kamu hanya Rp ${saldoDriver.toLocaleString()}. Sistem menonaktifkan akun sementara.`);
    } else if (saldoDriver >= 6000 && saldoDriver < 10000) {
      alert(`⚠️ Saldo kamu hanya Rp ${saldoDriver.toLocaleString()}. Disarankan isi ulang.`);
    }

    const awalHari = new Date(); awalHari.setHours(0, 0, 0, 0);
    const riwayatSnap = await db.collection("riwayat_driver")
      .where("idDriver", "==", driverId).where("waktuSelesai", ">=", awalHari).get();
    const jumlahHariIni = riwayatSnap.size;
    const totalHariIni = riwayatSnap.docs.reduce((t, d) => t + (d.data().penghasilanBersih || 0), 0);

    const pesananSnap = await db.collection("pesanan_driver")
      .where("idDriver", "==", driverId).get();


// 🔔 Notifikasi jika ada pesanan baru
for (const doc of pesananSnap.docs) {
  const data = doc.data();
  if (!data.notified) {
    tampilkanFloatingBox(`🚨 Pesanan Baru Masuk!<br>ID: ${data.idPesanan}`);
    alert(`🚨 Pesanan Baru Masuk!\nID: ${data.idPesanan}`);
    await doc.ref.update({ notified: true }); // tandai sudah diberi notifikasi
  }
}

    const daftarPesanan = [];

    const toLatLng = geo => {
      if (!geo) return null;
      if (geo.latitude !== undefined) return { lat: geo.latitude, lng: geo.longitude };
      if (geo.lat !== undefined) return geo;
      return null;
    };

    const hitungJarakKM = (a, b) => {
      a = toLatLng(a); b = toLatLng(b);
      if (!a || !b) return null;
      const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
      const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 100) / 100;
    };



    for (const doc of pesananSnap.docs) {
  const data = doc.data();
  const pesananDoc = await db.collection("pesanan").doc(data.idPesanan).get();
  if (!pesananDoc.exists) continue;
  const pesanan = pesananDoc.data();

  const lokasiCustomer = pesanan.lokasi || null;
  const idToko = pesanan.produk?.[0]?.idToko || "";
  const tokoDoc = await db.collection("toko").doc(idToko).get();
  const lokasiToko = tokoDoc.exists ? tokoDoc.data().koordinat : null;
  const namaToko = tokoDoc.exists ? tokoDoc.data().namaToko || "Toko" : "Toko";

  const jarakKeToko = hitungJarakKM(lokasiDriver, lokasiToko);
  const jarakKeCustomer = hitungJarakKM(lokasiToko, lokasiCustomer);

  let namaCustomer = "Customer";

  if (pesanan.userId) {
    const userDoc = await db.collection("users").doc(pesanan.userId).get();
    if (userDoc.exists) namaCustomer = userDoc.data().nama || namaCustomer;
  }

  // Push ke daftarPesanan
  daftarPesanan.push({
    id: doc.id,
    idPesanan: data.idPesanan,
    idCustomer: pesanan.userId || "-",
    namaCustomer,
    namaToko,
    namaDriver,
    plat,
    statusDriver: data.status,
    metode: pesanan.metode,
    pengiriman: pesanan.pengiriman,
    total: pesanan.total || 0,
    createdAt: pesanan.createdAt?.toDate?.() || new Date(),
    jarakKeToko,
    jarakKeCustomer,
    stepsLog: pesanan.stepsLog || [],
    produk: pesanan.produk || []
  });
}


    // Urutkan priority lebih dulu, lalu berdasarkan waktu terbaru
daftarPesanan.sort((a, b) => {
  const prioritasA = (a.pengiriman || "standard").toLowerCase() === "priority" ? 1 : 0;
  const prioritasB = (b.pengiriman || "standard").toLowerCase() === "priority" ? 1 : 0;

  if (prioritasA !== prioritasB) return prioritasB - prioritasA; // priority dulu
  return b.createdAt - a.createdAt; // lalu waktu terbaru
});


let html = `
  <div class="driver-header">
    <p><strong>Nama:</strong> ${namaDriver}</p>
    <p><strong>Saldo:</strong> Rp ${saldoDriver.toLocaleString()}</p>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <strong>Status:</strong>
        <label class="switch-wrap">
          <input type="checkbox" id="status-toggle" ${statusDriver === "aktif" ? "checked" : ""} ${forceNonaktif || dalamPembatasan ? "disabled" : ""}>
          <span class="slider-ball"></span>
        </label>
        <span id="status-label">${statusDriver === "aktif" ? "Bekerja" : "Tidak Bekerja"}</span>
      </div>
      ${(forceNonaktif || dalamPembatasan) ? `<small style="color:red;">🔒 Status tidak bisa diubah saat ini</small>` : ""}
      ${dalamPembatasan
        ? `<small style="color:#c00;">⏳ Aktif kembali: ${new Date(nonaktifHingga).toLocaleString("id-ID", {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</small>`
        : ""
      }
    </div>

    <p><strong>🔥 Level Pelanggaran:</strong> ${pelanggaran}</p>

    <div style="display: flex; align-items: center; gap: 10px;">
      <strong><span>Multi Order</span></strong>
      <label class="switch-wrap">
        <input type="checkbox" id="multi-order-toggle" ${multiOrderAktif ? "checked" : ""} ${!masihLangganan ? "disabled" : ""}>
        <span class="slider-ball"></span>
      </label>
      <button id="multi-info-btn" title="Apa itu Multi Order?">❓</button>
    </div>

    <div id="multi-info-popup" class="popup-info" style="display:none;">
      <p><strong>Multi Order</strong> memungkinkan driver menerima lebih dari satu pesanan sekaligus, meningkatkan efisiensi dan penghasilan.</p>
      <button onclick="document.getElementById('multi-info-popup').style.display = 'none'">Tutup</button>
    </div>

    <small>Masa Aktif: ${multiOrderExpired ? multiOrderExpired.toLocaleString("id-ID", {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : "Tidak Aktif"}</small>

    <p><strong>📆 Riwayat Hari Ini:</strong> ${jumlahHariIni} pesanan</p>
    <p><strong>💵 Penghasilan Hari Ini:</strong> Rp ${totalHariIni.toLocaleString()}</p>
<!-- ✅ Tombol Aksi Horizontal -->
<div class="group-btn-horizontal">
  <button onclick="loadContent('driver-riwayat')" class="btn-riwayat">📊 Lihat Riwayat Detail</button>
  <button onclick="bukaModalPesanDriver()" class="btn-pesan">✉️ Pesan</button>
  <button onclick="formTarikSaldoDriver('${driverId}', ${saldoDriver})" class="btn-tarik">💸 Tarik Saldo</button>
</div>

    </div>
  </div>

  <h3>📦 Pesanan Aktif</h3>
  ${daftarPesanan.length === 0 ? "<p>Tidak ada pesanan aktif.</p>" : ""}
  <ul class="driver-pesanan-list">
`;

    for (const p of daftarPesanan) {
  // Tentukan tampilan metode pengiriman
  const metodePengiriman = (p.pengiriman || "standard").toLowerCase();
  let metodeLabel = "";
  let metodeStyle = "";

  if (metodePengiriman === "priority") {
    metodeLabel = "⚡ Priority";
    metodeStyle = "color: #d9534f; font-weight: bold;";
  } else {
    metodeLabel = metodePengiriman.charAt(0).toUpperCase() + metodePengiriman.slice(1);
    metodeStyle = "color: #333;";
  }

html += `
  <li class="pesanan-item">
    <p><strong>Nama:</strong> ${p.namaCustomer} - ${p.namaToko}</p>
    <p>🕒 Masuk: ${p.createdAt.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</p>
    ${p.jarakKeToko !== null ? `<p>📍 Jarak ke Toko: ${p.jarakKeToko} km</p>` : ""}
    ${p.jarakKeCustomer !== null ? `<p>🚚 Jarak ke Customer: ${p.jarakKeCustomer} km</p>` : ""}
    <p>💰 Pembayaran: ${p.metode?.toUpperCase?.() || "-"}</p>
    <p style="${metodeStyle}">🚚 Metode Pengiriman: ${metodeLabel}</p>
    <p>📌 Status: ${p.statusDriver}</p>
    <p><strong>Total:</strong> Rp ${p.total.toLocaleString("id-ID")}</p>

    <div class="btn-group">
      <button onclick="bukaDetailPesananDriver('${p.idPesanan}')">🔍 Detail</button>
      <button onclick="renderChatDriver({
        idPesanan: '${p.idPesanan}',
        idDriver: '${driverId}',
        idCustomer: '${p.idCustomer}',
        namaDriver: '${p.namaDriver}',
        namaCustomer: '${p.namaCustomer}'
      })">💬 Chat Customer</button>
    </div>
  </li>
`;
}


    html += "</ul>";
    container.innerHTML = html;

    document.getElementById("status-toggle")?.addEventListener("change", async (e) => {
      const aktif = e.target.checked;
      const newStatus = aktif ? "aktif" : "nonaktif";
      const label = document.getElementById("status-label");

      try {
        await driverRef.update({ status: newStatus });
        label.textContent = aktif ? "Bekerja" : "Tidak Bekerja";
        alert(`✅ Status diubah menjadi "${label.textContent}"`);
      } catch (err) {
        e.target.checked = !aktif;
        label.textContent = !aktif ? "Bekerja" : "Tidak Bekerja";
        alert("❌ Gagal memperbarui status.");
      }
    });

    document.getElementById("multi-order-toggle")?.addEventListener("change", async (e) => {
      const aktif = e.target.checked;
      try {
        await driverRef.update({ multiOrderAktif: aktif });
        alert(`✅ Multi Order ${aktif ? "diaktifkan" : "dinonaktifkan"}`);
      } catch (error) {
        console.error("Gagal update multiOrderAktif:", error);
        alert("❌ Gagal mengubah Multi Order. Coba lagi.");
      }
    });

    document.getElementById("multi-info-btn")?.addEventListener("click", () => {
      document.getElementById("multi-info-popup").style.display = "block";
    });
  })();
}






else if (page === "driver-riwayat") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<h2>📊 Riwayat Driver</h2><p>Memuat data...</p>`;

  (async () => {
    const user = firebase.auth().currentUser;
    if (!user) return container.innerHTML = `<p>❌ Harap login terlebih dahulu.</p>`;
    const db = firebase.firestore();
    const driverId = user.uid;

    const snap = await db.collection("riwayat_driver_admin")
      .where("idDriver", "==", driverId)
      .orderBy("waktu", "desc")
      .limit(100)
      .get();

    let html = `
      <div class="riwayat-driver-container">
        <button onclick="loadContent('driver-dashboard')" class="btn-kembali">⬅️ Kembali ke Dashboard</button>
    `;

    if (snap.empty) {
      html += `<p>Belum ada riwayat pesanan.</p>`;
    } else {
      html += `<div class="riwayat-card-list">`;
      for (const doc of snap.docs) {
        const d = doc.data();
        const waktu = new Date(d.waktu).toLocaleString("id-ID");
        const idPesanan = d.idPesanan || d.orderId || "-";

        // Ambil data dari pesanan_driver berdasarkan idPesanan
        const driverSnap = await db.collection("pesanan_driver")
          .where("idPesanan", "==", idPesanan)
          .limit(1)
          .get();

        let totalOngkir = 0;
        let subtotal = 0;
        let status = d.status || "-";

        if (!driverSnap.empty) {
          const dataDriver = driverSnap.docs[0].data();
          totalOngkir = dataDriver.totalOngkir || 0;
          subtotal = dataDriver.subtotal || 0;
          status = dataDriver.status || "-";
        }

        const biayaLayanan = Math.round(subtotal * 0.01);
        const biayaOngkir = Math.round(totalOngkir * 0.05);
        const totalFee = biayaLayanan + biayaOngkir;
        const penghasilanBersih = (subtotal + totalOngkir) - totalFee;

        // Ambil rating
        let ratingText = "-";
        try {
          const ratingSnap = await db.collection("rating_driver")
            .where("idPesanan", "==", idPesanan)
            .limit(1)
            .get();

          if (!ratingSnap.empty) {
            const rating = ratingSnap.docs[0].data().rating || 0;
            ratingText = `⭐ ${rating}/5`;
          }
        } catch (err) {
          console.warn(`❌ Gagal ambil rating untuk ${idPesanan}:`, err.message);
        }

        html += `
          <div class="riwayat-card">
            <div><strong>ID Pesanan:</strong> ${idPesanan}</div>
            <div><strong>Waktu:</strong> ${waktu}</div>
            <div><strong>Status:</strong> ${status}</div>
            <div><strong>Ongkir:</strong> Rp ${totalOngkir.toLocaleString("id-ID")}</div>
            <div><strong>Fee:</strong> Rp ${totalFee.toLocaleString("id-ID")}</div>
            <div><strong>Total:</strong> Rp ${penghasilanBersih.toLocaleString("id-ID")}</div>
            <div><strong>Rating:</strong> ${ratingText}</div>
            <button class="btn-riwayat" onclick="lihatLogPesananDriver('${idPesanan}')">📄 Detail</button>
          </div>
        `;
      }
      html += `</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
  })();
}















if (page === "riwayat-driver") {
  const container = document.getElementById("page-container");
  container.innerHTML = "<h2>📋 Riwayat Pengantaran</h2><p>Memuat data...</p>";

  const user = firebase.auth().currentUser;
  if (!user) return (container.innerHTML = "<p>❌ Harap login terlebih dahulu.</p>");

  const uid = user.uid;
  const db = firebase.firestore();

  db.collection("riwayat_driver")
    .where("idDriver", "==", uid)
    .orderBy("createdAt", "desc")
    .get()
    .then((snap) => {
      if (snap.empty) {
        container.innerHTML = "<p>🚫 Belum ada riwayat pengantaran.</p>";
        return;
      }

      let html = `
        <h2>📦 Riwayat Pengantaran</h2>
        <ul class="riwayat-driver-list">
      `;

      snap.forEach(doc => {
        const d = doc.data();
        const waktu = d.createdAt?.toDate().toLocaleString("id-ID") || "-";
        html += `
          <li class="riwayat-driver-item">
            🧾 <strong>${d.idPesanan}</strong><br>
            💵 Pendapatan: <strong>Rp ${d.pendapatanBersih?.toLocaleString() || 0}</strong><br>
            📅 ${waktu}
          </li>
        `;
      });

      html += "</ul>";
      container.innerHTML = html;
    })
    .catch(err => {
      console.error("❌ Gagal memuat riwayat driver:", err);
      container.innerHTML = "<p style='color:red;'>❌ Gagal memuat data riwayat.</p>";
    });
}



if (page === "admin-user") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat data admin...</p>`;

  const user = firebase.auth().currentUser;
  if (!user) {
    container.innerHTML = `<p>Silakan login ulang.</p>`;
    return;
  }

  const db = firebase.firestore();

  try {
    const adminDoc = await db.collection("users").doc(user.uid).get();
    const role = adminDoc.exists ? (adminDoc.data().role || "").toLowerCase() : "";

    if (role !== "admin") {
      container.innerHTML = `<p style="color:red;text-align:center;">❌ Akses ditolak. Hanya admin.</p>`;
      return;
    }

    // Ambil data paralel kecuali totalFee yang harus async sendiri
    const [
      usersSnapshot,
      pesananSnapshot,
      depositSnapshot,
      tarikSaldoSnapshot,
      tarikSaldoDriverSnapshot,
      laporanDriverSnapshot,
      laporanSellerSnapshot,
      tokoSnapshot
    ] = await Promise.all([
      db.collection("users").get(),
      db.collection("pesanan").get(),
      db.collection("topup_request").where("status", "==", "Menunggu").get(),
      db.collection("tarik_saldo").where("status", "==", "Menunggu").get(),
      db.collection("tarik_saldo_driver").where("status", "==", "Menunggu").get(),
      db.collection("laporan_driver").get(),
      db.collection("laporan_penjual").get(),
      db.collection("toko").get()
    ]);

    // Hitung total fee perusahaan menggunakan fungsi helper
    const totalFeeKeseluruhan = await hitungTotalFeePerusahaan(db);

    let totalUser = 0;
    let totalDriver = 0;
    let totalNominal = 0;
    let totalPesananAktif = 0;

    usersSnapshot.forEach(doc => {
      const r = (doc.data().role || "").toLowerCase();
      if (r === "user") totalUser++;
      if (r === "driver") totalDriver++;
    });

    pesananSnapshot.forEach(doc => {
      const d = doc.data();
      const status = (d.status || "").toLowerCase();

      if (status === "selesai") {
        const totalPembayaran = d.total || 0;
        totalNominal += totalPembayaran;
      } else {
        totalPesananAktif++;
      }
    });

    const totalDepositMenunggu = depositSnapshot.size;
    const totalWithdrawMenunggu = tarikSaldoSnapshot.size + tarikSaldoDriverSnapshot.size;
    const totalLaporanDriver = laporanDriverSnapshot.size;
    const totalLaporanSeller = laporanSellerSnapshot.size;
    const totalToko = tokoSnapshot.size;

    container.innerHTML = `
      <div class="admin-user-dashboard">
        <h2>📊 Dashboard Admin</h2>

        <div class="pyramid-grid-2">

          <div class="pyramid-button">
            <div class="label-with-badge">👤 Users ${totalUser > 0 ? `<span class="badge">${totalUser}</span>` : ""}</div>
            <button onclick="loadContent('users-management')" class="detail-btn">Lihat Detail</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">🛵 Driver ${totalDriver > 0 ? `<span class="badge">${totalDriver}</span>` : ""}</div>
            <button onclick="loadContent('admin-driver')" class="detail-btn">Lihat Detail</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">👤 Live Chat ${totalUser > 0 ? `<span class="badge">${totalUser}</span>` : ""}</div>
            <button onclick="loadContent('livechat-admin')" class="detail-btn">Lihat Detail</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">🏪 Toko ${totalToko > 0 ? `<span class="badge" id="badge-total-toko">${totalToko}</span>` : ""}</div>
            <button onclick="loadContent('admin-toko')" class="detail-btn">Kelola Toko</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">📦 Pesanan ${totalPesananAktif > 0 ? `<span class="badge">${totalPesananAktif}</span>` : ""}</div>
            <button onclick="loadContent('pesanan-admin')" class="detail-btn">Lihat Pesanan</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">💳 Transaksi</div>
            <div style="font-size:13px;">Rp${totalNominal.toLocaleString("id-ID")}</div>
            <button onclick="loadContent('riwayat-transaksi-admin')" class="detail-btn">Lihat Detail</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">💼 Fee Perusahaan</div>
            <div style="font-size:13px;">Rp${totalFeeKeseluruhan.toLocaleString("id-ID")}</div>
            <button onclick="loadContent('riwayat-admin')" class="detail-btn">Lihat Detail</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">💰 Deposit ${totalDepositMenunggu > 0 ? `<span class="badge">${totalDepositMenunggu}</span>` : ""}</div>
            <button onclick="loadContent('permintaan-deposit')" class="detail-btn">Lihat Permintaan</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">💸 Withdraw ${totalWithdrawMenunggu > 0 ? `<span class="badge">${totalWithdrawMenunggu}</span>` : ""}</div>
            <button onclick="loadContent('permintaan-withdraw')" class="detail-btn">Lihat Permintaan</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">🚨 Laporan Driver ${totalLaporanDriver > 0 ? `<span class="badge">${totalLaporanDriver}</span>` : ""}</div>
            <button onclick="loadContent('laporan-driver-admin')" class="detail-btn">Tinjau</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">🚨 Laporan Seller ${totalLaporanSeller > 0 ? `<span class="badge">${totalLaporanSeller}</span>` : ""}</div>
            <button onclick="loadContent('laporan-seller-admin')" class="detail-btn">Tinjau</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">📣 Pesan</div>
            <button onclick="loadContent('admin-kirim-pesan')" class="detail-btn">Kelola</button>
          </div>

<div class="pyramid-button">
  <div class="label-with-badge">📣 Notifikasi</div>
  <button onclick="formNotifikasiAdmin()" class="detail-btn">
    📢 Kirim Notifikasi
  </button>
</div>


          <div class="pyramid-button">
            <div class="label-with-badge">💳 Voucher</div>
            <button onclick="loadContent('admin-voucher')" class="detail-btn">Kelola</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">🏦 Rekening Deposit</div>
            <button onclick="loadContent('setting-rekening')" class="detail-btn">Kelola</button>
          </div>

          <div class="pyramid-button">
            <div class="label-with-badge">⏰ Layanan</div>
            <button onclick="loadContent('jam-layanan')" class="detail-btn">Kelola</button>
          </div>

        </div>
      </div>
    `;
  } catch (error) {
    console.error("❌ Error admin-user:", error);
    container.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${error.message}</p>`;
  }
}

if (page === "users-management") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat data pengguna...</p>`;

  const user = firebase.auth().currentUser;
  if (!user) return (container.innerHTML = `<p>Silakan login ulang.</p>`);

  const db = firebase.firestore();
  const adminDoc = await db.collection("users").doc(user.uid).get();
  const isAdmin = adminDoc.exists && (adminDoc.data().role || "").toLowerCase() === "admin";

  if (!isAdmin) {
    container.innerHTML = `<p style="color:red;text-align:center;">❌ Akses ditolak. Hanya admin.</p>`;
    return;
  }

  const snapshot = await db.collection("users").get();

  let html = `<h2 class="-admin-user-title">👥 Manajemen Pengguna</h2>
              <div class="-admin-user-wrapper">`;

  snapshot.forEach(doc => {
    const d = doc.data();
    const uid = doc.id;
    const shortUid = uid.slice(0, 5) + "...";

    html += `
      <div class="-admin-user-card">
        <div class="-admin-user-header">
          <span>UID: <code>${shortUid}</code></span>
          <button onclick="copyToClipboard('${uid}')" title="Salin UID" class="-admin-user-copy">📋</button>
        </div>

        <div class="-admin-user-body">
          <p><strong>👤 Nama:</strong> ${d.namaLengkap || "-"}</p>
          <p><strong>📧 Email:</strong> ${d.email || "-"}</p>
          <p><strong>👑 Role:</strong> ${d.role || "-"}</p>
          <p><strong>💰 Saldo:</strong> Rp${(d.saldo || 0).toLocaleString()}</p>
        </div>

        <div class="-admin-user-actions">
          <button onclick="gantiRole('${uid}', '${d.role || ""}')">🔁 Ganti Role</button>
          <button onclick="resetPin('${uid}')">🔐 Reset PIN</button>
          <button onclick="transferSaldo('${uid}')">💰 Transfer Saldo</button>
        </div>
      </div>
    `;
  });

  html += `</div><br/><button onclick="loadContent('admin-user')" class="btn-mini">⬅️ Kembali</button>`;
  container.innerHTML = html;
}



else if (page === 'pesanan-admin') {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>📦 Memuat semua pesanan...</p>`;

  const db = firebase.firestore();

  try {
    const snap = await db.collection("pesanan").orderBy("createdAt", "desc").get();

    if (snap.empty) {
      container.innerHTML = `<p>⚠️ Belum ada pesanan yang masuk.</p>`;
      return;
    }

    let html = `<div class="card-list -admin-pesanan">`;

    for (const doc of snap.docs) {
      const data = doc.data();
      const id = doc.id;
      const waktu = data.createdAt?.toDate().toLocaleString("id-ID") ?? "-";
      const metode = data.metode?.toUpperCase() ?? "-";
      const status = data.status ?? "-";
      const pembeli = data.namaPembeli ?? "Customer";

      html += `
        <div class="card pesanan-card -admin-pesanan">
          <div class="card-header">
            <strong>ID:</strong> ${id} <br>
            <small>${waktu}</small>
          </div>
          <div><strong>Pembeli:</strong> ${pembeli}</div>
          <div><strong>Metode:</strong> ${metode}</div>
          <div><strong>Status:</strong> ${status}</div>
          <div class="card-actions">
            <button onclick="bukaModalDetailPesananAdmin('${id}')" class="btn-mini-pesanan-seller">🔍 Detail</button>
            <button onclick="editStatusPesanan('${id}', '${status}')" class="btn-mini-pesanan-seller">✏️ Edit</button>
            <button onclick="hapusPesananAdmin('${id}')" class="btn-mini-pesanan-seller" style="background-color:crimson;">🗑️ Hapus</button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

  } catch (err) {
    console.error("❌ Gagal memuat pesanan:", err);
    container.innerHTML = `<p style="color:red;">❌ Gagal memuat pesanan.</p>`;
  }
}



if (page === "livechat-admin") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat Live Chat Admin...</p>`;

  const db = firebase.firestore();
  const adminUid = "JtD1wA2wkzVg6SWwWSFTxFZMhxO2"; // Ganti sesuai UID adminmu
  let currentChatUser = null;
  let unsubscribeChat = null;

  async function renderLiveChatPanel() {
    try {
      // Ambil status live chat
      const settingDoc = await db.collection("pengaturan").doc("liveChatStatus").get();
      const liveChatStatus = settingDoc.exists ? settingDoc.data().status || "offline" : "offline";

      // Ambil 50 chat terbaru
      const chatSnapshot = await db.collection("chat")
        .orderBy("waktu", "desc")
        .limit(50)
        .get();

      // Kumpulkan user unik yang chat dengan admin
      const usersMap = new Map();
      chatSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const otherUid = data.dari !== adminUid ? data.dari : data.ke;
        if (!usersMap.has(otherUid)) {
          usersMap.set(otherUid, { lastChat: data.waktu, unreadCount: 0 });
        }
      });

      // Hitung unread pesan per user (pesan ke admin dengan status_baca false)
      const unreadSnapshot = await db.collection("chat")
        .where("ke", "==", adminUid)
        .where("status_baca", "==", false)
        .get();

      unreadSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (usersMap.has(data.dari)) {
          usersMap.get(data.dari).unreadCount++;
        }
      });

      container.innerHTML = `
        <h2>💬 Live Chat Admin</h2>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
          <span>Status Live Chat:</span>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-live-chat-switch" ${liveChatStatus === "online" ? "checked" : ""} />
            <span class="slider"></span>
          </label>
          <span id="live-chat-status-text" style="font-weight:bold; color:${liveChatStatus === 'online' ? 'green' : 'red'};">
            ${liveChatStatus.toUpperCase()}
          </span>
        </div>
        <hr />
        <div id="live-chat-users-list" style="max-height: 400px; overflow-y:auto; margin-top:10px;">
          ${usersMap.size === 0 ? "<p>Tidak ada chat aktif.</p>" : ""}
        </div>
        <div id="live-chat-chatbox" style="margin-top:20px;"></div>
      `;

      // Render list user
      const usersListElem = document.getElementById("live-chat-users-list");
      usersMap.forEach((val, key) => {
        const badge = val.unreadCount > 0
          ? `<span>${val.unreadCount}</span>`
          : "";
        const userBtn = document.createElement("button");
        userBtn.innerHTML = key + badge;
        userBtn.style = `
          display:block; width:100%; text-align:left; padding:8px; 
          cursor:pointer; border:none; background:#f0f0f0; margin-bottom:4px; 
          border-radius:6px; font-weight:600; font-size:14px; color:#333;
          display: flex; justify-content: space-between; align-items: center;
          transition: background-color 0.2s ease;
        `;
        userBtn.onmouseover = () => userBtn.style.backgroundColor = "#e0e0e0";
        userBtn.onmouseout = () => userBtn.style.backgroundColor = "#f0f0f0";
        userBtn.onclick = () => openLiveChatWithUser(key);
        usersListElem.appendChild(userBtn);
      });

      // Toggle status live chat
      const toggleSwitch = document.getElementById("toggle-live-chat-switch");
      const statusText = document.getElementById("live-chat-status-text");

      toggleSwitch.onchange = async () => {
        const newStatus = toggleSwitch.checked ? "online" : "offline";
        await db.collection("pengaturan").doc("liveChatStatus").set({ status: newStatus });
        statusText.textContent = newStatus.toUpperCase();
        statusText.style.color = newStatus === "online" ? "green" : "red";
        alert("Status live chat diubah menjadi: " + newStatus.toUpperCase());
      };

    } catch (error) {
      container.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${error.message}</p>`;
    }
  }

  async function openLiveChatWithUser(userId) {
    currentChatUser = userId;
    const chatContainer = document.getElementById("live-chat-chatbox");
    chatContainer.innerHTML = `<p>Memuat chat dengan ${userId}...</p>`;

    // Jika ada subscription chat sebelumnya, unsubscribe dulu
    if (unsubscribeChat) unsubscribeChat();

    const messagesElem = document.createElement("div");
    messagesElem.style.cssText = `
      height:300px; overflow-y:auto; border:1px solid #ccc; 
      padding:8px; border-radius:8px; background:#fafafa; 
      display:flex; flex-direction: column; gap: 6px;
    `;
    chatContainer.appendChild(messagesElem);

    const inputWrapper = document.createElement("div");
    inputWrapper.style.marginTop = "8px";
    inputWrapper.innerHTML = `
      <input type="text" id="chat-input" placeholder="Ketik pesan..." 
        style="width: 80%; padding:6px; border-radius:6px; border:1px solid #ccc;" />
      <button id="send-chat-btn" 
        style="padding:6px 12px; border-radius:6px; background:#4caf50; color:white; border:none; cursor:pointer;">
        Kirim
      </button>
      <button id="close-chat-btn" 
        style="padding:6px 12px; border-radius:6px; background:#f44336; color:white; border:none; cursor:pointer; margin-left:8px;">
        Tutup Chat
      </button>
    `;
    chatContainer.appendChild(inputWrapper);

    const inputElem = inputWrapper.querySelector("#chat-input");
    const sendBtn = inputWrapper.querySelector("#send-chat-btn");
    const closeBtn = inputWrapper.querySelector("#close-chat-btn");

    // Load chat realtime
    unsubscribeChat = db.collection("chat")
      .where("dari", "in", [userId, adminUid])
      .where("ke", "in", [userId, adminUid])
      .orderBy("waktu", "asc")
      .onSnapshot(snapshot => {
        messagesElem.innerHTML = "";
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const isAdmin = data.dari === adminUid;
          const bubble = document.createElement("div");
          bubble.style.padding = "8px";
          bubble.style.borderRadius = "10px";
          bubble.style.maxWidth = "70%";
          bubble.style.backgroundColor = isAdmin ? "#dcf8c6" : "#fff";
          bubble.style.alignSelf = isAdmin ? "flex-end" : "flex-start";
          bubble.textContent = data.isi;
          messagesElem.appendChild(bubble);

          // Tandai pesan user ke admin sudah dibaca
          if (!isAdmin && data.status_baca === false) {
            doc.ref.update({ status_baca: true });
          }
        });
        messagesElem.scrollTop = messagesElem.scrollHeight;
      });

    // Kirim pesan admin ke user
    sendBtn.onclick = async () => {
      const text = inputElem.value.trim();
      if (!text) return;
      await db.collection("chat").add({
        dari: adminUid,
        ke: userId,
        isi: text,
        waktu: new Date(),
        status_baca: false
      });
      inputElem.value = "";
    };

    // Tombol tutup chat
    closeBtn.onclick = () => {
      if (unsubscribeChat) {
        unsubscribeChat();
        unsubscribeChat = null;
      }
      currentChatUser = null;
      chatContainer.innerHTML = "";
    };
  }

  renderLiveChatPanel();
}



else if (page === "riwayat-transaksi-admin") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>⏳ Memuat riwayat transaksi...</p>`;

  const db = firebase.firestore();

  try {
    const snapshot = await db.collection("pesanan")
      .orderBy("waktuPesan", "desc")
      .get();

    if (snapshot.empty) {
      container.innerHTML = `<p>📭 Belum ada pesanan yang tercatat.</p>`;
      return;
    }

    const semuaData = [];
    const tokoCache = {};

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const produk = data.produk || [];
      const idToko = produk[0]?.idToko || null;

      let namaToko = "Tidak diketahui";
      if (idToko) {
        if (tokoCache[idToko]) {
          namaToko = tokoCache[idToko];
        } else {
          const tokoDoc = await db.collection("toko").doc(idToko).get();
          if (tokoDoc.exists) {
            namaToko = tokoDoc.data().namaToko || "Tanpa Nama";
            tokoCache[idToko] = namaToko;
          }
        }
      }

      semuaData.push({
        id: doc.id,
        waktu: data.waktuPesan ? new Date(data.waktuPesan).toLocaleString("id-ID") : "-",
        namaToko,
        total: data.total || 0,
        status: data.status || "-"
      });
    }

    // Render awal + filter
    renderTabelRiwayat(semuaData, container, "Semua");

  } catch (err) {
    console.error("❌ Gagal memuat riwayat:", err);
    container.innerHTML = `<p style="color:red;">❌ Terjadi kesalahan: ${err.message}</p>`;
  }
}



else if (page === "admin-voucher") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat voucher...</p>`;

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;

  if (!user) {
    container.innerHTML = `<p style="color:red;">❌ Silakan login ulang.</p>`;
    return;
  }

  const userDoc = await db.collection("users").doc(user.uid).get();
  const role = userDoc.exists ? (userDoc.data().role || "").toLowerCase() : "";

  if (role !== "admin") {
    container.innerHTML = `<p style="color:red;">❌ Akses ditolak.</p>`;
    return;
  }

  const snapshot = await db.collection("voucher").orderBy("expired", "desc").get();
  const voucherList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const cards = voucherList.map((v, i) => {
    const expiredDate = v.expired?.toDate?.();
    const expiredStr = expiredDate instanceof Date
      ? expiredDate.toLocaleDateString("id-ID")
      : "-";

    const potonganStr = v.tipe === "persen"
      ? `${v.potongan}%`
      : `Rp${parseInt(v.potongan).toLocaleString("id-ID")}`;

    const potonganUntuk = v.tipePotongan === "ongkir" ? "Ongkir" : "Produk";

    return `
      <div class="voucher-card-voucher-admin">
        <div><strong>📌 Kode:</strong> ${v.kode || "-"}</div>
        <div><strong>💸 Minimal:</strong> Rp${(v.minimal || 0).toLocaleString("id-ID")}</div>
        <div><strong>🎁 Potongan:</strong> ${potonganStr} (${potonganUntuk})</div>
        <div><strong>📦 Kuota:</strong> ${v.kuota || 0}</div>
        <div><strong>⏳ Expired:</strong> ${expiredStr}</div>
        <div><strong>👤 Dipakai:</strong> ${(v.digunakanOleh || []).length} user</div>
        <div class="voucher-card-actions-voucher-admin">
  <button onclick="editVoucher('${v.id}')">✏️ Edit</button>
  <button onclick="hapusVoucher('${v.id}')">🗑️ Hapus</button>
  <button onclick="lihatRiwayatVoucher('${v.id}')">📜 Riwayat</button>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="admin-voucher-page-voucher-admin">
      <h2>🎟️ Kelola Voucher</h2>

      <form onsubmit="return simpanVoucher(event)" id="form-voucher" style="margin-bottom:20px;">
        <input type="hidden" id="voucher-id" />
        <input required type="text" id="voucher-kode" placeholder="Kode Voucher (huruf besar)" />

        <select id="voucher-tipe">
          <option value="nominal">Nominal (Rp)</option>
          <option value="persen">Persen (%)</option>
        </select>

        <input required type="number" id="voucher-potongan" placeholder="Potongan" />
        <input required type="number" id="voucher-minimal" placeholder="Minimal Order" />

        <select id="voucher-tipe-potongan">
          <option value="produk">Potong Produk</option>
          <option value="ongkir">Potong Ongkir</option>
        </select>

        <input required type="number" id="voucher-kuota" placeholder="Kuota" />
        <input required type="date" id="voucher-expired" />
        <button type="submit">💾 Simpan Voucher</button>
      </form>

      <div class="voucher-list-voucher-admin">
        ${cards || `<p style="text-align:center;">Tidak ada voucher.</p>`}
      </div>
    </div>
  `;
}



else if (page === "riwayat-admin") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>⏳ Memuat transaksi selesai...</p>`;

  const db = firebase.firestore();

  try {
    const snapshot = await db.collection("pesanan")
      .orderBy("waktuPesan", "desc")
      .limit(100)
      .get();

    if (snapshot.empty) {
      container.innerHTML = `<p>✅ Tidak ada transaksi selesai.</p>`;
      return;
    }

    let cards = "";
    let totalFeeKeseluruhan = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const status = (data.status || "").toLowerCase();
      if (status !== "selesai") continue;

      const id = doc.id;
      const tanggal = data.waktuPesan
        ? new Date(data.waktuPesan).toLocaleString("id-ID")
        : "-";

      const subtotal = data.subtotalProduk || 0;
      const ongkir = data.totalOngkir || 0;
      const totalTransaksi = subtotal + ongkir;

      const biayaLayanan = Math.round(totalTransaksi * 0.01);
      const biayaToko = Math.round(subtotal * 0.05);
      const biayaDriver = Math.round(ongkir * 0.05);
      const totalFee = biayaLayanan + biayaToko + biayaDriver;

      totalFeeKeseluruhan += totalFee;

      cards += `
        <div class="card-fee-admin">
          <p><strong>ID:</strong> ${id}</p>
          <p><strong>Tanggal:</strong> ${tanggal}</p>
          <p><strong>Total Transaksi:</strong> Rp${totalTransaksi.toLocaleString("id-ID")}</p>
          <p><strong>Biaya Layanan (1%):</strong> Rp${biayaLayanan.toLocaleString("id-ID")}</p>
          <p><strong>Biaya Toko (5%):</strong> Rp${biayaToko.toLocaleString("id-ID")}</p>
          <p><strong>Biaya Driver (5%):</strong> Rp${biayaDriver.toLocaleString("id-ID")}</p>
          <p><strong>Total Fee:</strong> <span style="font-weight:bold;">Rp${totalFee.toLocaleString("id-ID")}</span></p>
          <button onclick="lihatDetailTransaksi('${id}')" class="btn-detail">🔍 Detail</button>
        </div>
      `;
    }

    if (!cards) {
      container.innerHTML = `<p>✅ Tidak ada transaksi selesai.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="riwayat-transaksi-selesai">
        <h2>📄 Riwayat Transaksi Selesai</h2>
        <div id="card-list-fee-admin">
          ${cards}
        </div>
        <p style="margin-top:12px;font-weight:bold;">
          💰 Total Semua Fee: Rp ${totalFeeKeseluruhan.toLocaleString("id-ID")}
        </p>
        <button onclick="loadContent('admin-user')" class="btn-kembali">⬅️ Kembali</button>
      </div>
    `;

  } catch (err) {
    console.error("❌ Gagal memuat transaksi selesai:", err);
    container.innerHTML = `<p style="color:red;">❌ Terjadi kesalahan: ${err.message}</p>`;
  }
}








if (page === "admin-driver") {
  const container = document.getElementById("page-container");
  container.innerHTML = "<p>Memuat data driver...</p>";

  const user = firebase.auth().currentUser;
  if (!user) return (container.innerHTML = "<p>Silakan login ulang.</p>");

  const db = firebase.firestore();

  try {
    const userDoc = await db.collection("users").doc(user.uid).get();
    const role = (userDoc.data()?.role || "").toLowerCase();

    if (role !== "admin") {
      container.innerHTML = `<p style="color:red;text-align:center;">❌ Akses ditolak. Hanya admin.</p>`;
      return;
    }

    const driversSnapshot = await db.collection("driver").orderBy("createdAt", "desc").get();
    const drivers = driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let html = `
      <h2 class="-admin-driver-title">🛵 Manajemen Driver</h2>
      <div class="-admin-driver-topbar">
        <input type="text" id="input-uid-driver" placeholder="Masukkan UID Driver" />
        <button onclick="tambahDriver()">➕ Tambah Driver</button>
      </div>
      <div class="-admin-driver-wrapper">
    `;

    for (const driver of drivers) {
      const saldoRef = db.collection("driver").doc(driver.id).collection("saldo").doc("data");
      const saldoDoc = await saldoRef.get();
      const saldo = saldoDoc.exists ? saldoDoc.data().jumlah || 0 : 0;

      html += `
        <div class="-admin-driver-card">
          <div class="-admin-driver-header">
            <strong>👤 ${driver.nama || 'Tanpa Nama'}</strong>
          </div>
          <div class="-admin-driver-body">
            🏍️ Plat: <strong>${driver.nomorPlat || '-'}</strong><br>
            ⚙️ Status: <span style="color:${driver.status === 'aktif' ? 'green' : 'red'}">${driver.status}</span><br>
            💰 Saldo: <strong id="saldo-${driver.id}">Rp ${saldo.toLocaleString()}</strong><br>
            📄 KTP: ${driver.urlKTP ? `<a href="${driver.urlKTP}" target="_blank">Lihat</a>` : 'Tidak tersedia'}
          </div>
          <div class="-admin-driver-actions">
            <button onclick="promptTransferSaldo('${driver.id}')">💸 Transfer</button>
            <button onclick="editDriver('${driver.id}')">✏️ Edit</button>
            <button onclick="hapusDriver('${driver.id}')">🗑️ Hapus</button>
            <button onclick="loadContent('riwayat-driver-admin', '${driver.id}')">📜 Riwayat</button>
          </div>
        </div>
      `;
    }

    html += "</div>";
    container.innerHTML = html;

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red;">Gagal memuat data driver: ${err.message}</p>`;
  }
}



else if (page === "riwayat-driver-admin") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>📦 Memuat riwayat driver...</p>`;

  const db = firebase.firestore();

  try {
    const snapshot = await db.collection("riwayat_driver_admin")
      .orderBy("waktu", "desc")
      .limit(100)
      .get();

    if (snapshot.empty) {
      container.innerHTML = `<p>✅ Belum ada riwayat tersedia.</p>`;
      return;
    }

    let html = `<h2>📚 Riwayat Driver (Admin)</h2><div class="-driver-riwayat-admin-list">`;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const waktu = data.waktu
        ? new Date(data.waktu).toLocaleString("id-ID")
        : "-";
      const orderId = data.orderId || "-";
      const idDriver = data.idDriver || "-";
      const stepsLog = Array.isArray(data.stepsLog) ? data.stepsLog : [];

      let metodePengiriman = "-";
      let estimasiMenit = "-";
      let selesaiDalam = "-";

      try {
        const pesananSnap = await db.collection("pesanan").doc(orderId).get();
        if (pesananSnap.exists) {
          const pesananData = pesananSnap.data();
          metodePengiriman = pesananData.metodePengiriman || "-";
          estimasiMenit = pesananData.estimasiMenit
            ? `${pesananData.estimasiMenit} menit`
            : "-";

          const timeExtract = s => {
            const match = s.match(/^(\d{1,2})\.(\d{2})/);
            if (match) {
              const [_, jam, menit] = match;
              const date = new Date();
              date.setHours(+jam, +menit, 0, 0);
              return date;
            }
            return null;
          };

          const timeFirst = timeExtract(stepsLog[0]);
          const timeLast = timeExtract(stepsLog[stepsLog.length - 1]);

          if (timeFirst && timeLast) {
            const diffMs = timeLast - timeFirst;
            const diffMenit = Math.round(diffMs / 60000);
            selesaiDalam = `${diffMenit} menit`;
          }
        }
      } catch (e) {
        console.warn(`Gagal ambil data pesanan: ${orderId}`, e);
      }

      const stepHtml = stepsLog.length > 0
        ? `<ul class="step-log">` +
            stepsLog.map(step => {
              const match = step.match(/^(\d{1,2})\.(\d{2})\s+(.*)$/);
              if (match) {
                const jam = `${match[1]}:${match[2]}`;
                const isi = match[3];
                return `<li><strong>${jam}</strong> — ${isi}</li>`;
              }
              return `<li>${step}</li>`;
            }).join("") +
          `</ul>`
        : `<p class="step-empty">(Tidak ada log langkah)</p>`;

      html += `
        <div class="-driver-riwayat-admin-card">
          <div class="card-header">🆔 Order ID: <b>${orderId}</b></div>
          <div class="card-body">
            <p><b>🚗 Driver:</b> ${idDriver}</p>
            <p><b>📦 Pengiriman:</b> ${metodePengiriman}</p>
            <p><b>⏳ Estimasi:</b> ${estimasiMenit}</p>
            <p><b>✅ Selesai Dalam:</b> ${selesaiDalam}</p>
            <p><b>📋 Steps Log:</b></p>
            ${stepHtml}
          </div>
        </div>
      `;
    }

    html += "</div>";
    container.innerHTML = html;

  } catch (error) {
    console.error("Gagal memuat riwayat driver:", error);
    container.innerHTML = `<p style="color:red;">❌ Terjadi kesalahan saat memuat data.</p>`;
  }
}







if (page.startsWith("edit-driver")) {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat data driver...</p>`;

  const params = new URLSearchParams(window.location.search);
  const driverId = params.get("id");

  if (!driverId) {
    container.innerHTML = `<p style="color:red;">❌ ID driver tidak ditemukan.</p>`;
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) return (container.innerHTML = `<p>Silakan login ulang.</p>`);

  const db = firebase.firestore();
  const adminDoc = await db.collection("users").doc(user.uid).get();
  const role = adminDoc.exists ? (adminDoc.data().role || "").toLowerCase() : "";

  if (role !== "admin") {
    container.innerHTML = `<p style="color:red;">❌ Akses ditolak. Hanya admin.</p>`;
    return;
  }

  const driverDoc = await db.collection("driver").doc(driverId).get();
  if (!driverDoc.exists) {
    container.innerHTML = `<p style="color:red;">Driver tidak ditemukan.</p>`;
    return;
  }

  const data = driverDoc.data();
  const {
    nama = "",
    nomorPlat = "",
    status = "nonaktif",
    fotoProfil = "",
    urlKTP = ""
  } = data;

  // Ambil saldo dari subkoleksi
  const saldoRef = db.collection("driver").doc(driverId).collection("saldo").doc("data");
  const saldoDoc = await saldoRef.get();
  const saldoDriver = saldoDoc.exists ? saldoDoc.data().jumlah || 0 : 0;

  container.innerHTML = `
    <h2>✏️ Edit Driver</h2>
    <form id="edit-driver-form" onsubmit="submitEditDriver(event, '${driverId}')">
      <label>Nama Lengkap:<br/>
        <input type="text" id="driver-nama" value="${nama}" required>
      </label><br/><br/>

      <label>Nomor Plat:<br/>
        <input type="text" id="driver-plat" value="${nomorPlat}" required>
      </label><br/><br/>

      <label>Status:<br/>
        <select id="driver-status">
          <option value="aktif" ${status === "aktif" ? "selected" : ""}>Aktif</option>
          <option value="nonaktif" ${status === "nonaktif" ? "selected" : ""}>Nonaktif</option>
        </select>
      </label><br/><br/>

      <label>URL Foto Profil:<br/>
        <input type="url" id="driver-foto" value="${fotoProfil}">
      </label><br/><br/>

      <label>URL KTP (opsional):<br/>
        <input type="url" id="driver-ktp" value="${urlKTP}">
      </label><br/><br/>

      <button type="submit">💾 Simpan Perubahan</button>
      <button type="button" onclick="loadContent('admin-driver')">⬅️ Batal</button>
    </form>
  `;
}




else if (page === "admin-toko") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat data toko...</p>`;

  const db = firebase.firestore();
  const tokoRef = db.collection("toko");

  try {
    const snapshot = await tokoRef.get();
    const dataToko = [];
    let htmlCards = '';

    for (const doc of snapshot.docs) {
      const toko = doc.data();
      const produkSnap = await db.collection("produk").where("toko", "==", toko.namaToko).get();
      const transaksiSnap = await db.collection("pesanan").where("toko", "==", toko.namaToko).get();

      dataToko.push({
        id: doc.id,
        ...toko,
        totalProduk: produkSnap.size,
        totalTransaksi: transaksiSnap.size
      });

      htmlCards += `
        <div class="toko-card -admin-toko">
          <div class="toko-card-header -admin-toko">
            <h3>${toko.namaToko}</h3>
            <small>UID: ${toko.uid || '-'}</small>
          </div>
          <div class="toko-card-body -admin-toko">
            <p><strong>🧑 Pemilik:</strong> ${toko.namaPemilik || '-'}</p>
            <p><strong>🕒 Jam Operasional:</strong> ${toko.jamBuka}:00 - ${toko.jamTutup}:00</p>
            <p><strong>📍 Alamat:</strong> ${toko.alamatToko || '-'}</p>
            <p><strong>📦 Produk:</strong> ${produkSnap.size}</p>
            <p><strong>🧾 Transaksi:</strong> ${transaksiSnap.size}</p>
            <p><strong>💰 Saldo:</strong> Rp${(toko.saldo || 0).toLocaleString()}</p>
          </div>
          <div class="toko-card-actions -admin-toko">
            <button onclick="lihatRiwayatTransaksi('${doc.id}')">📄 Riwayat</button>
            <button onclick="editToko('${doc.id}')">✏️ Edit</button>
            <button onclick="hapusToko('${doc.id}')">🗑️ Hapus</button>
            <button onclick="tambahSaldoToko('${doc.id}', '${toko.namaToko}')">➕ Top Up</button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="admin-toko-page -admin-toko">
        <div class="admin-toko-header -admin-toko">
          <h2>🏪 Manajemen Toko</h2>
          <div class="admin-toko-controls -admin-toko">
            <button onclick="formTambahTokoAdmin()" class="btn-tambah-toko-admin">➕ Tambah Toko Manual</button>
<input type="text" id="input-uid-toko" placeholder="Masukkan UID Seller" />
<button onclick="tambahTokoViaUID()" class="btn-tambah-dari-uid">✅ Tambah dari UID</button>

          </div>
        </div>
        <div class="toko-list -admin-toko">
          ${htmlCards || `<p style="text-align:center;">Tidak ada data toko.</p>`}
        </div>
      </div>
    `;

    const badge = document.getElementById("badge-total-toko");
    if (badge) badge.textContent = dataToko.length;

  } catch (e) {
    container.innerHTML = `<p style="color:red;">Gagal memuat data: ${e.message}</p>`;
  }
}







if (page === "setting-rekening") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat data rekening...</p>`;

  const db = firebase.firestore();
  const docRef = db.collection("pengaturan").doc("rekening");

  async function loadRekening() {
    const doc = await docRef.get();
    if (!doc.exists) return [];
    const data = doc.data();
    return Array.isArray(data.list) ? data.list : [];
  }

  function renderRekeningList(items) {
    container.innerHTML = `
      <div class="rekening-container-admin-rekening">
        <h2>⚙️ Kelola Rekening Deposit</h2>
        <button id="btn-tambah" class="btn-tambah-admin-rekening">➕ Tambah Rekening Baru</button>

        <div class="rekening-list-admin-rekening">
          ${
            items.length === 0
              ? `<p style="text-align:center;">Belum ada data rekening.</p>`
              : items
                  .map((item, i) => `
              <div class="rekening-card-admin-rekening" data-index="${i}">
                <p><strong>🏦 Bank:</strong> ${item.bank || "-"}</p>
                <p><strong>👤 Nama:</strong> ${item.nama || "-"}</p>
                <p><strong>🔢 Nomor:</strong> ${item.nomor || "-"}</p>
                <p><strong>Status:</strong> ${item.aktif ? "✅ Aktif" : "❌ Nonaktif"}</p>
                <div class="rekening-card-actions-admin-rekening">
                  <button class="btn-edit-admin-rekening" data-index="${i}">✏️ Edit</button>
                  <button class="btn-hapus-admin-rekening" data-index="${i}">🗑️ Hapus</button>
                </div>
              </div>
            `).join("")
          }
        </div>

        <div id="form-container" style="margin-top: 20px;"></div>
      </div>
    `;

    document.getElementById("btn-tambah").addEventListener("click", () => showForm());

    container.querySelectorAll(".btn-edit-admin-rekening").forEach(btn =>
      btn.addEventListener("click", e => {
        const index = Number(e.target.dataset.index);
        const item = items[index];
        showForm(item, index);
      })
    );

    container.querySelectorAll(".btn-hapus-admin-rekening").forEach(btn =>
      btn.addEventListener("click", async e => {
        const index = Number(e.target.dataset.index);
        if (confirm("Yakin ingin menghapus rekening ini?")) {
          try {
            items.splice(index, 1);
            await docRef.set({ list: items });
            alert("✅ Rekening berhasil dihapus.");
            init();
          } catch (err) {
            alert("❌ Gagal menghapus rekening.");
            console.error(err);
          }
        }
      })
    );
  }

  function showForm(data = null, index = null) {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = `
      <div class="form-rekening-admin-rekening">
        <h3>${data ? "Edit" : "Tambah"} Rekening</h3>
        <form id="rekening-form">
          <label>Nama Bank:</label>
          <input type="text" name="bank" value="${data ? data.bank : ""}" required /><br/>

          <label>Nama Rekening:</label>
          <input type="text" name="nama" value="${data ? data.nama : ""}" required /><br/>

          <label>Nomor Rekening:</label>
          <input type="text" name="nomor" value="${data ? data.nomor : ""}" required /><br/>

          <label>Status Aktif:</label>
          <input type="checkbox" name="aktif" ${data && data.aktif ? "checked" : ""} /><br/><br/>

          <button type="submit" class="btn-simpan-admin-rekening">${data ? "💾 Simpan" : "➕ Tambah"}</button>
          <button type="button" id="btn-batal" class="btn-batal-admin-rekening">Batal</button>
          <div id="form-message" style="margin-top:10px; font-weight:600;"></div>
        </form>
      </div>
    `;

    const form = document.getElementById("rekening-form");
    const messageDiv = document.getElementById("form-message");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      messageDiv.textContent = "";

      const formData = new FormData(form);
      const bank = formData.get("bank").trim();
      const nama = formData.get("nama").trim();
      const nomor = formData.get("nomor").trim();
      const aktif = formData.get("aktif") === "on";

      if (!bank || !nama || !nomor) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "❌ Semua kolom wajib diisi.";
        return;
      }

      try {
        const items = await loadRekening();
        if (data) {
          items[index] = { bank, nama, nomor, aktif };
        } else {
          items.push({ bank, nama, nomor, aktif });
        }

        await docRef.set({ list: items });
        messageDiv.style.color = "green";
        messageDiv.textContent = `✅ Rekening berhasil ${data ? "diperbarui" : "ditambahkan"}.`;

        setTimeout(() => {
          formContainer.innerHTML = "";
          init();
        }, 1000);
      } catch (err) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "❌ Gagal menyimpan rekening.";
        console.error(err);
      }
    });

    document.getElementById("btn-batal").addEventListener("click", () => {
      formContainer.innerHTML = "";
    });
  }

  async function init() {
    try {
      const items = await loadRekening();
      renderRekeningList(items);
    } catch (err) {
      container.innerHTML = `<p style="color:red;">Gagal memuat data rekening.</p>`;
      console.error(err);
    }
  }

  init();
}



if (page === "permintaan-deposit") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat permintaan deposit...</p>`;

  const db = firebase.firestore();
  const snapshot = await db.collection("topup_request").orderBy("timestamp", "desc").get();

  let html = `
    <div class="permintaan-deposit-container-deposit-admin">
      <h2>💰 Permintaan Deposit</h2>
      <div class="deposit-list-deposit-admin">
  `;

  if (snapshot.empty) {
    html += `<p style="text-align:center;">Tidak ada permintaan.</p>`;
  } else {
    snapshot.forEach(doc => {
      const d = doc.data();
      const waktu = d.timestamp?.toDate()?.toLocaleString("id-ID") || "-";
      const isExpired = d.expiredAt && d.expiredAt < Date.now();
      const status = isExpired && d.status === "Menunggu" ? "Dibatalkan (Expired)" : d.status;

      html += `
        <div class="deposit-card-deposit-admin">
          <p><strong>🆔 UserID:</strong> ${d.userId}</p>
          <p><strong>💳 Metode:</strong> ${d.metode}</p>
          <p><strong>💵 Nominal:</strong> Rp${d.jumlah.toLocaleString()}</p>
          <p><strong>🧾 Total:</strong> Rp${d.total.toLocaleString()}</p>
          <p><strong>📝 Catatan:</strong> ${d.catatan || "-"}</p>
          <p><strong>📌 Status:</strong> ${status}</p>
          <p><small>🕒 ${waktu}</small></p>
          ${
            d.status === "Menunggu" && !isExpired
              ? ` 
                <div class="deposit-action-deposit-admin">
                  <button class="btn-mini" onclick="konfirmasiTopup('${doc.id}', '${d.userId}', ${d.jumlah})">✅ Konfirmasi</button>
                  <button class="btn-mini" onclick="tolakTopup('${doc.id}')">❌ Tolak</button>
                </div>
              `
              : d.status === "Dikonfirmasi" || d.status === "Ditolak"
              ? `
                <div class="deposit-action-deposit-admin">
                  <button class="btn-mini" onclick="batalkanTopup('${doc.id}')">❌ Batalkan</button>
                  ${d.status !== "Selesai" ? `<button class="btn-mini" onclick="selesaikanTopup('${doc.id}')">✔️ Selesai</button>` : ""}
                </div>
              `
              : ""
          }
        </div>
      `;
    });
  }

  html += `
      </div>
      <button class="btn-mini" onclick="loadContent('admin-user')">⬅️ Kembali</button>
    </div>
  `;

  container.innerHTML = html;
}

// Fungsi untuk membatalkan permintaan deposit
async function batalkanTopup(id) {
  const confirmCancel = confirm("Apakah Anda yakin ingin membatalkan permintaan deposit ini?");
  if (confirmCancel) {
    const db = firebase.firestore();
    try {
      await db.collection("topup_request").doc(id).update({
        status: "Dibatalkan"
      });
      alert("✅ Permintaan deposit berhasil dibatalkan.");
      loadContent("permintaan-deposit"); // Reload halaman
    } catch (error) {
      console.error(error);
      alert("❌ Gagal membatalkan permintaan deposit.");
    }
  }
}

// Fungsi untuk menandai permintaan deposit sebagai selesai
async function selesaikanTopup(id) {
  const confirmComplete = confirm("Apakah Anda yakin ingin menandai permintaan deposit ini sebagai selesai?");
  if (confirmComplete) {
    const db = firebase.firestore();
    try {
      await db.collection("topup_request").doc(id).update({
        status: "Selesai"
      });
      alert("✅ Permintaan deposit telah selesai diproses.");
      loadContent("permintaan-deposit"); // Reload halaman
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menyelesaikan permintaan deposit.");
    }
  }
}




if (page === "permintaan-withdraw") {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>⏳ Memuat permintaan withdraw...</p>`;

  const db = firebase.firestore();

  const driverSnap = await db.collection("tarik_saldo_driver").orderBy("waktu", "desc").get();
  const sellerSnap = await db.collection("tarik_saldo").orderBy("waktu", "desc").get();

  let html = `
    <div class="container-withdrawal">
      <h2 class="title-withdrawal">💸 Daftar Permintaan Withdraw</h2>
      <div class="list-withdrawal">
  `;

  // === ✅ DRIVER ===
  if (!driverSnap.empty) {
    html += `<h3>🚗 Dari Driver</h3>`;
    driverSnap.forEach(doc => {
      const d = doc.data();
      const waktu = d.waktu?.toDate?.().toLocaleString("id-ID") || "-";
      const status = d.status || "pending";
      const idTransaksi = `WD-${doc.id.substring(0, 4).toUpperCase()}`;

      html += `
        <div class="item-withdrawal">
          <p><strong>ID Transaksi:</strong> ${idTransaksi}</p>
          <p><strong>ID Driver:</strong> ${d.idDriver || "-"}</p>
          <p><strong>Jumlah:</strong> Rp${(d.jumlah || 0).toLocaleString("id-ID")}</p>
          <p><strong>Diterima:</strong> Rp${(d.diterima || 0).toLocaleString("id-ID")}</p>
          <p><strong>Bank:</strong> ${d.bank || "-"}</p>
          <p><strong>Rekening:</strong> ${d.rekening || "-"}</p>
          <p><strong>Biaya Admin:</strong> Rp${(d.biayaAdmin || 0).toLocaleString("id-ID")}</p>
          <p><span class="status-withdrawal ${status}">Status: ${status}</span></p>
          <small>🕒 ${waktu}</small>
          ${
            d.status === "pending" ? `
              <div class="actions-withdrawal">
                <button class="btn-withdrawal btn-approve-withdrawal" onclick="konfirmasiTarikDriver('${doc.id}', '${d.idDriver}', ${d.diterima})">✅ Konfirmasi</button>
                <button class="btn-withdrawal btn-reject-withdrawal" onclick="tolakTarikDriver('${doc.id}')">❌ Tolak</button>
              </div>` : 
            d.status === "selesai" ? `
              <div class="actions-withdrawal">
                <p><strong>Status:</strong> Berhasil</p>
              </div>` : 
            d.status === "ditolak" ? `
              <div class="actions-withdrawal">
                <button class="btn-withdrawal btn-cancel-withdrawal" onclick="batalkanTarikDriver('${doc.id}')">❌ Batalkan</button>
              </div>` : ""
          }
        </div>
      `;
    });
  }

  // === ✅ SELLER ===
  if (!sellerSnap.empty) {
    html += `<h3>🛒 Dari Seller</h3>`;
    sellerSnap.forEach(doc => {
      const d = doc.data();
      const waktu = d.waktu?.toDate?.().toLocaleString("id-ID") || "-";
      const status = d.status || "pending";
      const idTransaksi = `WD-${doc.id.substring(0, 4).toUpperCase()}`;

      html += `
        <div class="item-withdrawal">
          <p><strong>ID Transaksi:</strong> ${idTransaksi}</p>
          <p><strong>ID Toko:</strong> ${d.idToko || "-"}</p>
          <p><strong>Jumlah:</strong> Rp${(d.jumlah || 0).toLocaleString("id-ID")}</p>
          <p><strong>Diterima:</strong> Rp${(d.jumlahDiterima || 0).toLocaleString("id-ID")}</p>
          <p><strong>Bank:</strong> ${d.bank || "-"}</p>
          <p><strong>Rekening:</strong> ${d.rekening || "-"}</p>
          <p><strong>Potongan:</strong> Rp${(d.potongan || 0).toLocaleString("id-ID")}</p>
          <p><span class="status-withdrawal ${status}">Status: ${status}</span></p>
          <small>🕒 ${waktu}</small>
          ${
            d.status === "pending" ? `
              <div class="actions-withdrawal">
                <button class="btn-withdrawal btn-approve-withdrawal" onclick="konfirmasiTarikSeller('${doc.id}', '${d.idToko}', ${d.jumlahDiterima})">✅ Konfirmasi</button>
                <button class="btn-withdrawal btn-reject-withdrawal" onclick="tolakTarikSeller('${doc.id}')">❌ Tolak</button>
              </div>` : 
            d.status === "berhasil" ? `
              <div class="actions-withdrawal">
                <p><strong>Status:</strong> Berhasil</p>
              </div>` : 
            d.status === "ditolak" ? `
              <div class="actions-withdrawal">
                <button class="btn-withdrawal btn-cancel-withdrawal" onclick="batalkanTarikSeller('${doc.id}')">❌ Batalkan</button>
              </div>` : ""
          }
        </div>
      `;
    });
  }

  if (driverSnap.empty && sellerSnap.empty) {
    html += `<p class="empty-withdrawal">Tidak ada permintaan withdraw.</p>`;
  }

  html += `
      </div>
      <center><button class="btn-withdrawal" onclick="loadContent('admin-user')">⬅️ Kembali</button></center>
    </div>
  `;

  container.innerHTML = html;
}


// Fungsi untuk membatalkan permintaan withdraw driver
async function batalkanTarikDriver(id) {
  const confirmCancel = confirm("Apakah Anda yakin ingin membatalkan permintaan withdraw ini?");
  if (confirmCancel) {
    const db = firebase.firestore();
    try {
      await db.collection("tarik_saldo_driver").doc(id).update({
        status: "Dibatalkan"
      });
      alert("✅ Permintaan withdraw berhasil dibatalkan.");
      loadContent("permintaan-withdraw"); // Reload halaman
    } catch (error) {
      console.error(error);
      alert("❌ Gagal membatalkan permintaan withdraw.");
    }
  }
}

// Fungsi untuk membatalkan permintaan withdraw seller
async function batalkanTarikSeller(id) {
  const confirmCancel = confirm("Apakah Anda yakin ingin membatalkan permintaan withdraw ini?");
  if (confirmCancel) {
    const db = firebase.firestore();
    try {
      await db.collection("tarik_saldo").doc(id).update({
        status: "Dibatalkan"
      });
      alert("✅ Permintaan withdraw berhasil dibatalkan.");
      loadContent("permintaan-withdraw"); // Reload halaman
    } catch (error) {
      console.error(error);
      alert("❌ Gagal membatalkan permintaan withdraw.");
    }
  }
}







if (page === "user") {
  const user = firebase.auth().currentUser;
  const container = document.getElementById("page-container");

  if (!user) {
    container.innerHTML = "<p>Memuat data user...</p>";
    return;
  }

  const db = firebase.firestore();
  const docRef = db.collection("users").doc(user.uid);
  const alamatRef = db.collection("alamat").doc(user.uid);

  Promise.all([docRef.get(), alamatRef.get()])
    .then(([userDoc, alamatDoc]) => {
      if (!userDoc.exists) {
        container.innerHTML = "<p>Data user tidak ditemukan.</p>";
        return;
      }

      const data = userDoc.data();
      const alamatData = alamatDoc.exists ? alamatDoc.data() : {};

      const profilePic = data.photoURL || "https://via.placeholder.com/150?text=Foto+Profil";
      const username = data.username || "";
      const namaLengkap = data.namaLengkap || "";
      const email = data.email || user.email || "-";
      const nomorHp = data.nomorHp ? data.nomorHp.toString() : "-";
      const saldoValue = typeof data.saldo === "number" ? data.saldo : 0;
      const saldo = `Rp${saldoValue.toLocaleString("id-ID")}`;
      const role = data.role?.toUpperCase() || "-";
      const createdAt = data.createdAt?.toDate?.().toLocaleString("id-ID", {
        dateStyle: "long", timeStyle: "short"
      }) || "-";
      const alamat = alamatData.alamat || "";

      const content = `
  <div class="panel-user-container">
    <h2 class="panel-user-heading"><i class="fas fa-user-circle"></i> Profil Akun</h2>

    <div class="panel-user-photo-wrapper">
      <img src="${profilePic}" alt="Foto Profil" class="panel-user-photo">
    </div>

    <!-- Tampilan View -->
    <div class="panel-user-info-grid" id="info-view">
      <div class="panel-user-label">Username</div>
      <div class="panel-user-value" id="view-username">${username}</div>

      <div class="panel-user-label">Nama Lengkap</div>
      <div class="panel-user-value" id="view-nama">${namaLengkap}</div>

      <div class="panel-user-label">Alamat</div>
      <div class="panel-user-value" id="view-alamat">${alamat}</div>
    </div>

    <!-- Tampilan Edit -->
    <div class="panel-user-info-grid" id="info-edit" style="display:none;">
      <div class="panel-user-label">Username</div>
      <div class="panel-user-value"><input id="edit-username" value="${username}" /></div>

      <div class="panel-user-label">Nama Lengkap</div>
      <div class="panel-user-value"><input id="edit-nama" value="${namaLengkap}" /></div>

      <div class="panel-user-label">Alamat</div>
      <div class="panel-user-value"><textarea id="edit-alamat" rows="3">${alamat}</textarea></div>
    </div>

    <!-- Informasi Lain -->
    <div class="panel-user-info-grid">
      <div class="panel-user-label">Saldo</div>
      <div class="panel-user-value">
        <i class="fas fa-wallet"></i> ${saldo}
        <button onclick="topupSaldoUser()" class="panel-user-btn-mini">🔼 Top Up</button>
      </div>

      <div class="panel-user-label">Role</div>
      <div class="panel-user-value"><i class="fas fa-id-badge"></i> ${role}</div>

      <div class="panel-user-label">Email</div>
      <div class="panel-user-value"><i class="fas fa-envelope"></i> ${email}</div>

      <div class="panel-user-label">Nomor HP</div>
      <div class="panel-user-value"><i class="fas fa-phone-alt"></i> ${nomorHp}</div>

      <div class="panel-user-label">PIN</div>
      <div class="panel-user-value">
        <i class="fas fa-key"></i>
        <button onclick="loadContent('ubah-pin')" class="panel-user-btn-mini">Ubah PIN</button>
      </div>

      <div class="panel-user-label">Dibuat</div>
      <div class="panel-user-value"><i class="fas fa-calendar-alt"></i> ${createdAt}</div>
    </div>

    <!-- Tombol Aksi -->
    <button id="btn-edit-profil" class="panel-user-btn panel-user-btn-edit">✏️ Ubah Profil</button>
    <button id="btn-simpan-profil" class="panel-user-btn panel-user-btn-save" style="display: none;">💾 Simpan Perubahan</button>
    <button id="btn-logout" class="panel-user-btn panel-user-btn-logout"><i class="fas fa-sign-out-alt"></i> Logout</button>
  </div>
`;


      container.innerHTML = content;

      document.getElementById("btn-edit-profil").addEventListener("click", () => {
        document.getElementById("info-view").style.display = "none";
        document.getElementById("info-edit").style.display = "grid";
        document.getElementById("btn-edit-profil").style.display = "none";
        document.getElementById("btn-simpan-profil").style.display = "inline-block";
      });

      document.getElementById("btn-simpan-profil").addEventListener("click", async () => {
        const newUsername = document.getElementById("edit-username").value.trim();
        const newNama = document.getElementById("edit-nama").value.trim();
        const newAlamat = document.getElementById("edit-alamat").value.trim();

        try {
          await Promise.all([
            db.collection("users").doc(user.uid).update({
              username: newUsername,
              namaLengkap: newNama
            }),
            db.collection("alamat").doc(user.uid).set({ alamat: newAlamat }, { merge: true })
          ]);

          alert("✅ Profil berhasil diperbarui!");
          loadContent("user");
        } catch (err) {
          alert("❌ Gagal menyimpan perubahan: " + err.message);
        }
      });

      document.getElementById("btn-logout").addEventListener("click", () => {
        firebase.auth().signOut().then(() => {
          window.location.href = "login.html";
        });
      });

    })
    .catch(error => {
      container.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${error.message}</p>`;
    });
}



if (page === "ubah-pin") {
  const container = document.getElementById("page-container");

  container.innerHTML = `
    <div class="ubah-pin-wrapper">
      <h2 style="text-align:center; margin-bottom: 10px;"><i class="fas fa-key"></i> Ubah PIN</h2>
      <p style="text-align:center; margin-bottom: 20px;">Masukkan PIN lama dan PIN baru (6 digit).</p>

      <div class="form-group">
        <label for="pin-lama">🔐 PIN Lama</label>
        <input type="password" id="pin-lama" maxlength="6" placeholder="••••••" />
      </div>

      <div class="form-group">
        <label for="pin-baru">🔐 PIN Baru</label>
        <input type="password" id="pin-baru" maxlength="6" placeholder="••••••" />
      </div>

      <div class="form-group">
        <label for="pin-baru2">🔐 Ulangi PIN Baru</label>
        <input type="password" id="pin-baru2" maxlength="6" placeholder="••••••" />
      </div>

      <button onclick="simpanPINBaru()" style="width: 100%; padding: 10px; margin-top: 10px; background: #007bff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
        💾 Simpan PIN
      </button>
    </div>
  `;
}



if (page === "jam-layanan") {
  const container = document.getElementById("page-container");
  container.innerHTML = "<p>Memuat pengaturan jam layanan...</p>";

  const db = firebase.firestore();
  const snap = await db.collection("pengaturan").doc("jam_layanan").get();
  const data = snap.exists ? snap.data() : {
    buka: "08:00",
    tutup: "22:00",
    aktif: true,
    mode: "otomatis"
  };

  container.innerHTML = `
    <div class="user-container" style="padding:1rem;">
      <h2>⏰ Pengaturan Jam Layanan</h2>

      <label>Mode Layanan</label>
      <select id="mode-layanan">
        <option value="otomatis" ${data.mode === "otomatis" ? 'selected' : ''}>⏱ Otomatis</option>
        <option value="manual" ${data.mode === "manual" ? 'selected' : ''}>🖐 Manual</option>
      </select>

      <div id="jam-otomatis">
        <label>Jam Buka</label>
        <input type="time" id="jam-buka" value="${data.buka}" />

        <label>Jam Tutup</label>
        <input type="time" id="jam-tutup" value="${data.tutup}" />
      </div>

      <label>Status (Manual)</label>
      <select id="status-layanan" ${data.mode === "manual" ? '' : 'disabled'}>
        <option value="true" ${data.aktif ? "selected" : ""}>✅ Aktif</option>
        <option value="false" ${!data.aktif ? "selected" : ""}>❌ Nonaktif</option>
      </select>

      <br/><br/>
      <button onclick="simpanJamLayanan()" class="btn-mini">💾 Simpan</button>
      <button onclick="loadContent('admin-user')" class="btn-mini">⬅️ Kembali</button>
    </div>
  `;

  // ✅ Tampilkan/sembunyikan jam sesuai mode
  const modeSelect = document.getElementById("mode-layanan");
  const jamDiv = document.getElementById("jam-otomatis");
  const statusLayanan = document.getElementById("status-layanan");

  modeSelect.addEventListener("change", () => {
    const mode = modeSelect.value;
    if (mode === "manual") {
      jamDiv.style.display = "none";
      statusLayanan.disabled = false;
    } else {
      jamDiv.style.display = "block";
      statusLayanan.disabled = true;
    }
  });

  // Inisialisasi tampilan berdasarkan mode awal
  if (data.mode === "manual") {
    jamDiv.style.display = "none";
    statusLayanan.disabled = false;
  } else {
    jamDiv.style.display = "block";
    statusLayanan.disabled = true;
  }
}



if (page === "riwayat") {
  const content = `
    <div class="riwayat-container">
      <h2>📜 Riwayat Pesanan</h2>
      <div id="riwayat-list"></div>
    </div>
  `;
  document.getElementById("page-container").innerHTML = content;
  renderRiwayat();
}





else if (page === "seller-dashboard") {
  const container = document.getElementById("page-container");
  if (!container) return console.error("❌ Element #page-container tidak ditemukan.");

  container.innerHTML = `<p>Memuat dashboard seller...</p>`;

  const user = firebase.auth().currentUser;
  if (!user) return container.innerHTML = `<p>❌ Harap login terlebih dahulu.</p>`;

  const db = firebase.firestore();

  try {
    const tokoQuery = await db.collection("toko").where("userId", "==", user.uid).limit(1).get();
    if (tokoQuery.empty) {
      container.innerHTML = `
        <div class="seller-dashboard-seller-pesanan">
          <h2>📦 Seller Dashboard</h2>
          <p>⚠️ Kamu belum memiliki toko.</p>
          <button onclick="formTambahToko()" class="tambah-btn-seller-pesanan">➕ Buat Toko Baru</button>
        </div>
      `;
      return;
    }

    const tokoDoc = tokoQuery.docs[0];
    const toko = tokoDoc.data();
    const idToko = tokoDoc.id;

    const jamBuka = toko.jamBuka ?? 8;
    const jamTutup = toko.jamTutup ?? 21;
    const autoOpenNow = isTokoSedangBuka(jamBuka, jamTutup);

    if (!toko.statusManual) {
      await db.collection("toko").doc(idToko).update({ isOpen: autoOpenNow });
      toko.isOpen = autoOpenNow;
    }

    const produkSnap = await db.collection("produk").where("idToko", "==", idToko).get();
    const totalProduk = produkSnap.size;

    container.innerHTML = `
      <div class="seller-dashboard-seller-pesanan">
        <h2>📦 Seller Dashboard</h2>

        <div class="info-box-seller-pesanan">
          <p><strong>Nama Toko:</strong> ${toko.namaToko}</p>
          <p><strong>Saldo:</strong> Rp${(toko.saldo || 0).toLocaleString()}</p>
          <p><strong>Total Produk:</strong> ${totalProduk}</p>

          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <strong>Status Toko:</strong>
            <label class="switch-wrap-seller-pesanan">
              <input type="checkbox" id="toggle-buka-toko" ${toko.isOpen ? "checked" : ""}>
              <span class="slider-ball-seller-pesanan"></span>
            </label>
            <span id="status-toko">${toko.isOpen ? "Toko Buka" : "Toko Tutup"}</span>
          </div>

          <small id="auto-note" style="display:block;margin-bottom:5px;color:gray;">
            ${toko.statusManual
              ? `🛠 Manual aktif. Jadwal: ${jamBuka}:00 - ${jamTutup}:00`
              : `⏱ Otomatis buka/tutup sesuai jadwal: ${jamBuka}:00 - ${jamTutup}:00`}
          </small>

          <center>
            <div class="aksi-box-seller-pesanan">
              <button onclick="bukaModalPesan('${idToko}')" class="btn-mini-seller-pesanan">✉️ Pesan</button>
              <button onclick="kelolaProduk('${idToko}')" class="btn-mini-seller-pesanan">🛒 Produk</button>
              <button onclick="editToko('${idToko}')" class="btn-mini-seller-pesanan">✏️ Edit Toko</button>
              <button onclick="formTarikSaldo('${idToko}', ${toko.saldo || 0})" class="btn-mini-seller-pesanan">💸 Tarik Saldo</button>
            </div>
          </center>
        </div>

        <h3 style="margin-top:30px;">📬 Pesanan Masuk</h3>
        <div id="pesanan-penjual-list" class="card-list-seller-pesanan"></div>

        <h3 style="margin-top:30px;">📊 Riwayat Penarikan</h3>
        <div id="riwayat-keuangan" class="card-list-seller-pesanan"></div>
      </div>
    `;

    document.getElementById("toggle-buka-toko").addEventListener("change", async (e) => {
      const isOpen = e.target.checked;
      try {
        await db.collection("toko").doc(idToko).update({
          isOpen,
          statusManual: true
        });
        document.getElementById("status-toko").innerText = isOpen ? "Toko Buka" : "Toko Tutup";
        document.getElementById("auto-note").innerText = `🛠 Manual aktif. Toko akan tetap ${isOpen ? "buka" : "tutup"} hingga di-reset.`;
      } catch (err) {
        console.error("Gagal update status toko:", err);
        alert("❌ Gagal mengubah status toko.");
        e.target.checked = !isOpen;
      }
    });

async function renderPesananCards(docs) {
  if (docs.length === 0) return `<p>Tidak ada pesanan masuk.</p>`;

  // Urutkan pesanan:
  // - Priority -> Aktif -> Dibatalkan
  docs.sort((a, b) => {
    const getPriorityValue = (doc) => {
      const data = doc.data();
      const status = data.status || "";
      const pengiriman = (data.pengiriman || "").toLowerCase();

      if (status === "Dibatalkan") return 3;       // Dibatalkan → paling bawah
      if (pengiriman === "priority") return 0;     // Priority → paling atas
      return 1;                                     // Pesanan aktif biasa → tengah
    };

    return getPriorityValue(a) - getPriorityValue(b);
  });

  let html = "";

  for (const doc of docs) {
    const p = doc.data();
    const idPesanan = p.idPesanan;
    const statusPesanan = p.status || "Menunggu";
    const alasanPembatalan = p.alasanPembatalan || "";
    const waktu = p.createdAt?.toDate();
    const jamMenit = waktu
      ? waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : "-";

    const metodePengiriman = (p.pengiriman || "standard").toLowerCase();
    const metodeLabel = metodePengiriman === "priority"
      ? "⚡ Priority"
      : metodePengiriman.charAt(0).toUpperCase() + metodePengiriman.slice(1);
    const metodeStyle = metodePengiriman === "priority"
      ? "color: #d9534f; font-weight: bold;"
      : "color: #333;";

    const isDibatalkan = statusPesanan === "Dibatalkan";

    let tombolAksi = "";
    if (!isDibatalkan) {
      tombolAksi = `
        <div class="btn-group-seller-pesanan">
          <button onclick="lihatLogPesananSeller('${idPesanan}')">📄 Detail</button>
          <button onclick="renderChatPelanggan({
            idPesanan: '${p.idPesanan}',
            idCustomer: '${p.idPembeli}',
            namaCustomer: '${p.namaPembeli}',
            namaToko: '${p.namaToko || "-"}'
          })">💬 Chat</button>
        </div>`;

      const cekDriver = await firebase.firestore().collection("pesanan_driver")
        .where("idPesanan", "==", idPesanan).limit(1).get();

      if (cekDriver.empty) {
        tombolAksi += `<div class="btn-group-seller-pesanan">
          <button onclick="konfirmasiPesanan('${doc.id}', '${idPesanan}')">✅ Konfirmasi</button>
        </div>`;
      }
    }

    html += `
      <div class="pesanan-item-seller-pesanan">
        <p><strong>ID Pesanan:</strong> ${idPesanan} <small>${jamMenit}</small></p>
        <p><strong>Pembeli:</strong> ${p.namaPembeli} - ${p.noHpPembeli}</p>
        <p style="${metodeStyle}">🚚 Metode Pengiriman: ${metodeLabel}</p>
        <p><strong>Status:</strong> <span>${statusPesanan}</span></p>
        ${
          isDibatalkan && alasanPembatalan
            ? `<div style="margin-top: 10px; background: #ffeaea; border-left: 4px solid #dc3545; padding: 8px 12px; border-radius: 8px;">
                <strong style="color: #c0392b;">❌ Alasan Pembatalan:</strong><br>${alasanPembatalan}
              </div>`
            : ""
        }
        ${tombolAksi}
      </div>
    `;
  }

  return html;
}




    async function updateDriverInfo(doc) {
      const p = doc.data();
      const idPesanan = p.idPesanan;
      const sudahDitambahkan = p.rewardDitambahkan || false;

      let statusDriver = "Menunggu Driver";
      let driverInfoHtml = `<span class="badge-seller-pesanan abu-seller-pesanan">Mencari Driver...</span>`;

      const driverSnap = await db.collection("pesanan_driver").where("idPesanan", "==", idPesanan).limit(1).get();

      if (!driverSnap.empty) {
        const driverData = driverSnap.docs[0].data();
        const driverId = driverData.idDriver;
        statusDriver = driverData.status || statusDriver;

        if (statusDriver === "Pesanan Diterima" && !sudahDitambahkan) {
          const total = p.total || 0;
          const pendapatan = Math.round(total * 0.95);

          await db.collection("toko").doc(idToko).update({
            saldo: firebase.firestore.FieldValue.increment(pendapatan)
          });

          await db.collection("pesanan_penjual").doc(doc.id).update({ rewardDitambahkan: true });
        }

        const driverDoc = await db.collection("driver").doc(driverId).get();
        if (driverDoc.exists) {
          const driver = driverDoc.data();
          const namaDriver = driver.nama || "Driver";
          const platNomor = driver.nomorPlat || "-";
          driverInfoHtml = `<b>${namaDriver}</b><br><small>${platNomor}</small>`;
        }
      }

      const elStatus = document.getElementById(`status-driver-${doc.id}`);
      const elInfo = document.getElementById(`driver-info-${doc.id}`);
      if (elStatus) elStatus.innerHTML = statusDriver;
      if (elInfo) elInfo.innerHTML = driverInfoHtml;
    }

    db.collection("pesanan_penjual").where("idToko", "==", idToko).orderBy("createdAt", "desc").onSnapshot(async (snap) => {
      const containerPesanan = document.getElementById("pesanan-penjual-list");
      if (!containerPesanan) return;
      containerPesanan.innerHTML = snap.empty
        ? `<p>Tidak ada pesanan masuk.</p>`
        : await renderPesananCards(snap.docs);
      snap.docs.forEach(updateDriverInfo);
    });

    const riwayatBox = document.getElementById("riwayat-keuangan");
    if (riwayatBox) {
      const riwayatSnap = await db.collection("withdraw_request").where("idToko", "==", idToko).orderBy("waktu", "desc").get();
      riwayatBox.innerHTML = riwayatSnap.empty
        ? `<p>Belum ada riwayat penarikan.</p>`
        : riwayatSnap.docs.map(doc => {
            const r = doc.data();
            const tanggal = new Date(r.waktu).toLocaleString("id-ID");
            return `
              <div class="card-seller-pesanan riwayat-card-seller-pesanan">
                <div>💸 <strong>Rp${r.nominal?.toLocaleString()}</strong> ke <strong>${r.bank}</strong> (${r.atasNama})</div>
                <small>${tanggal}</small>
              </div>
            `;
          }).join("");
    }

  } catch (e) {
    console.error("❌ Gagal memuat dashboard seller:", e);
    container.innerHTML = `<p style="color:red;">❌ Terjadi kesalahan saat memuat dashboard seller.</p>`;
  }
}







else if (page === "admin-kirim-pesan") {
  const container = document.getElementById("page-container");
  container.innerHTML = `
    <div class="panel-kirim-pesan">
      <h2>📨 Kirim Pesan ke Driver / Seller</h2>

      <label for="role">Pilih Role:</label>
      <select id="role" onchange="loadTargetDropdown()">
        <option value="driver">Driver</option>
        <option value="seller">Seller</option>
      </select>

      <label for="targetId">Pilih Tujuan:</label>
      <select id="targetId">
        <option value="">-- Pilih --</option>
      </select>

      <label for="perihal">Perihal:</label>
      <input type="text" id="perihal" placeholder="Contoh: Penarikan Disetujui" />

      <label for="pesan">Keterangan:</label>
      <textarea id="pesan" rows="4" placeholder="Isi pesan..."></textarea>

      <button onclick="kirimPesanKeTarget()">🚀 Kirim Pesan</button>
    </div>

    <div id="riwayat-pesan" style="margin-top:30px;">
      <h3>📜 Riwayat Pesan Terakhir</h3>
      <p>⏳ Memuat riwayat pesan...</p>
    </div>
  `;

  loadTargetDropdown();
  loadRiwayatPesanAdmin(); // panggil fungsi ini
}


 else if (page === "chat") {
  const container = document.getElementById("page-container");
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;

  if (!user) {
    container.innerHTML = "<p>❌ Harap login terlebih dahulu.</p>";
    return;
  }

  const adminUid = data?.uid || "JtD1wA2wkzVg6SWwWSFTxFZMhxO2";
  const chatRef = db.collection("chat");
  const chatId = [user.uid, adminUid].sort().join("_");

  container.innerHTML = `
    <div class="chat-box">
      <div class="chat-messages" id="chat-messages">Memuat pesan...</div>
      <div class="chat-input">
        <input type="text" id="pesan" placeholder="Tulis pesan..." />
        <button onclick="kirimPesanChat('${chatId}', '${user.uid}', '${adminUid}')">Kirim</button>
      </div>
    </div>
  `;

  // Tampilkan chat real-time
  chatRef.where("chatId", "==", chatId).orderBy("timestamp")
    .onSnapshot((snap) => {
      const pesanBox = document.getElementById("chat-messages");
      if (snap.empty) {
        pesanBox.innerHTML = "<p>Belum ada pesan.</p>";
        return;
      }

      let html = "";
      snap.forEach(doc => {
        const p = doc.data();
        const align = p.from === user.uid ? "right" : "left";
        html += `
          <div class="chat-bubble ${align}">
            <div class="bubble">${p.pesan}</div>
            <small>${new Date(p.timestamp).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</small>
          </div>
        `;
      });
      pesanBox.innerHTML = html;
      pesanBox.scrollTop = pesanBox.scrollHeight;
    });
}

else if (page === "daftar-chat-user") {
  const container = document.getElementById("page-container");
  container.innerHTML = `
    <div class="-admin-chat-wrapper">
      <h2 class="-admin-chat-title">💬 Chat dengan Admin</h2>
      <div class="-admin-chat-container">
  <div class="-admin-chat-box" id="chat-bubble-box">
    <div class="-admin-chat-loading">⏳ Memuat chat...</div>
    
    <div class="-admin-chat-template-bubbles">
      <span onclick="isiTemplate('Bagaimana cara topup saldo?')">Cara topup saldo</span>
      <span onclick="isiTemplate('Saya mengalami kendala saat login')">Kendala login</span>
      <span onclick="isiTemplate('Bagaimana cara menarik saldo?')">Tarik saldo</span>
      <span onclick="isiTemplate('Berapa lama proses verifikasi?')">Lama verifikasi</span>
    </div>
  </div>
</div>


      <div id="chat-timestamp" class="-admin-chat-timestamp"></div>

      <div class="-admin-chat-form">
        <input type="text" id="input-chat" class="-admin-chat-input" placeholder="Tulis pesan...">
        <button onclick="kirimPesanKeAdmin()" class="-admin-chat-button">Kirim</button>
      </div>
    </div>
  `;

  renderChatBox();
}







 if (page === 'productlist') {
  content = `
    <div class="productlist-wrapper">
      <section>
        <div id="produk-container" class="produk-list-container"></div>
      </section>
    </div>`;
    
  main.innerHTML = content;
  renderProductList();
}
}


///  BATAS  ////

async function editToko(idToko) {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>⏳ Memuat form edit toko...</p>`;

  const db = firebase.firestore();
  try {
    const doc = await db.collection("toko").doc(idToko).get();
    if (!doc.exists) {
      container.innerHTML = `<p style="color:red;">❌ Toko tidak ditemukan.</p>`;
      return;
    }

    const toko = doc.data();
    const koordinatValue = toko.koordinat && toko.koordinat.latitude
      ? `${toko.koordinat.latitude},${toko.koordinat.longitude}`
      : '';

    container.innerHTML = `
      <div class="form-box">
        <h2>✏️ Edit Toko</h2>
        <form onsubmit="simpanEditToko(event, '${idToko}')">
          <label>Nama Pemilik</label>
          <input id="namaPemilik" value="${toko.namaPemilik || ''}" readonly
            style="background:#eee; border:1px solid #ccc;" />

          <label>Nama Toko</label>
          <input id="namaToko" value="${toko.namaToko || ''}" required />

          <label>Deskripsi Toko</label>
          <textarea id="deskripsiToko" placeholder="Deskripsi singkat toko...">${toko.deskripsiToko || ''}</textarea>

          <label>Alamat Toko</label>
          <textarea id="alamatToko" required>${toko.alamatToko || ''}</textarea>

          <label>Jam Buka (0–23)</label>
          <input id="jamBuka" type="number" min="0" max="23" value="${toko.jamBuka || 0}" required />

          <label>Jam Tutup (0–23)</label>
          <input id="jamTutup" type="number" min="0" max="23" value="${toko.jamTutup || 23}" required />

          <label>Koordinat</label>
          <input id="koordinat" value="${koordinatValue}" required />

          <button type="submit" class="btn-simpan">💾 Simpan Perubahan</button>
        </form>

        <div id="leafletMap" style="height: 300px; margin-top: 20px; border-radius: 8px;"></div>
        <button onclick="loadContent('admin-toko')" class="btn-mini" style="margin-top:1rem;">⬅️ Kembali</button>
      </div>
    `;

    // Inisialisasi Peta
    const map = L.map('leafletMap').setView(
      toko.koordinat ? [toko.koordinat.latitude, toko.koordinat.longitude] : [-1.63, 105.77],
      13
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker = toko.koordinat
      ? L.marker([toko.koordinat.latitude, toko.koordinat.longitude]).addTo(map)
      : null;

    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      document.getElementById("koordinat").value = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      if (marker) marker.remove();
      marker = L.marker([lat, lng]).addTo(map);
    });

  } catch (err) {
    console.error("❌ Gagal memuat toko:", err);
    container.innerHTML = `<p style="color:red;">❌ Gagal memuat data toko.</p>`;
  }
}


async function tambahTokoViaUID() {
  const uid = document.getElementById("input-uid-toko").value.trim();
  if (!uid) return alert("❌ Masukkan UID seller terlebih dahulu.");

  const db = firebase.firestore();
  const userRef = db.collection("users").doc(uid);

  try {
    const userSnap = await userRef.get();
    if (!userSnap.exists) return alert("❌ UID tidak ditemukan.");

    const userData = userSnap.data();
    if ((userData.role || "").toLowerCase() !== "seller") {
      return alert("❌ Role akun bukan Seller.");
    }

    const namaPemilik = userData.namaLengkap || "Tanpa Nama";
    const defaultNamaToko = `Toko ${namaPemilik}`;
    const defaultDeskripsi = "Belum ada deskripsi.";
    const defaultAlamat = "Belum ada alamat.";
    const defaultJamBuka = 8;
    const defaultJamTutup = 21;
    const defaultKoordinat = new firebase.firestore.GeoPoint(-1.63468, 105.77554);
    const defaultLogo = "/img/toko-pict.png";

    await db.collection("toko").add({
      userId: uid,
      namaPemilik,
      namaToko: defaultNamaToko,
      deskripsiToko: defaultDeskripsi,
      alamatToko: defaultAlamat,
      jamBuka: defaultJamBuka,
      jamTutup: defaultJamTutup,
      koordinat: defaultKoordinat,
      saldo: 0,
      logo: defaultLogo,
      createdAt: new Date()
    });

    alert("✅ Toko berhasil dibuat!");
    loadContent("admin-toko");

  } catch (err) {
    console.error("❌ Gagal tambah toko via UID:", err);
    alert("❌ Terjadi kesalahan. Silakan coba lagi.");
  }
}


async function lihatRiwayatVoucher(voucherId) {
  const modal = document.getElementById("modal-detail");
  const content = modal.querySelector(".modal-content");
  modal.style.display = "flex";
  content.innerHTML = `<p>Memuat riwayat penggunaan voucher...</p>`;

  const db = firebase.firestore();
  try {
    const doc = await db.collection("voucher").doc(voucherId).get();
    if (!doc.exists) {
      content.innerHTML = `<p>❌ Voucher tidak ditemukan.</p>`;
      return;
    }

    const data = doc.data();
    const digunakanOleh = data.digunakanOleh || [];

    if (digunakanOleh.length === 0) {
      content.innerHTML = `
        <h3>📜 Riwayat Voucher</h3>
        <p>Belum ada pengguna voucher ini.</p>
        <div style="text-align:right;"><button onclick="document.getElementById('modal-detail').style.display='none'">Tutup</button></div>
      `;
      return;
    }

    let list = "";
    for (const uid of digunakanOleh) {
      const userDoc = await db.collection("users").doc(uid).get();
      const nama = userDoc.exists ? userDoc.data().namaLengkap || "-" : "-";
      const email = userDoc.exists ? userDoc.data().email || "-" : "-";

      list += `
        <li style="margin-bottom:10px;">
          <strong>${nama}</strong><br/>
          <small style="font-family:monospace;">${uid}</small><br/>
          <small>${email}</small>
        </li>
      `;
    }

    content.innerHTML = `
      <h3>📜 Pengguna Voucher</h3>
      <ul style="padding-left:1rem;">${list}</ul>
      <div style="text-align:right;"><button onclick="document.getElementById('modal-detail').style.display='none'">Tutup</button></div>
    `;
  } catch (err) {
    console.error("❌ Gagal ambil riwayat voucher:", err);
    content.innerHTML = `<p>❌ Gagal memuat riwayat voucher.</p>`;
  }
}


async function formNotifikasiAdmin() {
  const modal = document.getElementById("modal-detail");
  const content = modal.querySelector(".modal-content");
  modal.style.display = "flex";

  const db = firebase.firestore();
  const snap = await db.collection("notifikasi_umum").orderBy("createdAt", "desc").limit(10).get();

  let daftarNotif = "";
  if (!snap.empty) {
    daftarNotif += `<h3>🗂 Daftar Notifikasi Terbaru</h3><ul class="-admin-notif">`;
    snap.forEach(doc => {
      const data = doc.data();
      const waktu = data.createdAt?.toDate?.().toLocaleString("id-ID") || "-";
      daftarNotif += `
        <li style="margin-bottom:8px;">
          <div><strong>${data.judul}</strong> (${data.tujuan})<br><small>${waktu}</small></div>
          <div>${data.pesan}</div>
          <button onclick="hapusNotifikasi('${doc.id}')" style="color:white;background:red;border:none;padding:4px 10px;margin-top:4px;cursor:pointer;">🗑 Hapus</button>
        </li>`;
    });
    daftarNotif += `</ul>`;
  }

  content.innerHTML = `
    <h2>📢 Kirim Notifikasi Floating</h2>
    <form id="form-notif-admin">
      <label>Judul:</label>
      <input type="text" id="judul-notif" required placeholder="Contoh: Promo Hari Ini" style="width:100%; margin-bottom:8px;" />

      <label>Pesan:</label>
      <textarea id="pesan-notif" required placeholder="Contoh: Diskon 50% untuk semua menu!" style="width:100%; margin-bottom:8px;"></textarea>

      <label>Tujuan:</label>
      <select id="tujuan-notif" style="width:100%; margin-bottom:8px;">
        <option value="all">Semua</option>
        <option value="seller">Seller</option>
        <option value="driver">Driver</option>
        <option value="user">User</option>
      </select>

      <button type="submit" style="margin-top:12px;">🚀 Kirim Notifikasi</button>
    </form>

    ${daftarNotif}

    <div style="text-align:right; margin-top:10px;">
      <button onclick="document.getElementById('modal-detail').style.display='none'">Tutup</button>
    </div>
  `;

  document.getElementById("form-notif-admin").onsubmit = async (e) => {
    e.preventDefault();

    const judul = document.getElementById("judul-notif").value.trim();
    const pesan = document.getElementById("pesan-notif").value.trim();
    const tujuan = document.getElementById("tujuan-notif").value;

    try {
      await db.collection("notifikasi_umum").add({
        judul,
        pesan,
        tujuan,
        status: "aktif",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("✅ Notifikasi berhasil dikirim!");
      formNotifikasiAdmin(); // reload modal untuk refresh list
    } catch (err) {
      console.error("❌ Gagal kirim notifikasi:", err);
      alert("❌ Gagal kirim notifikasi.");
    }
  };
}

async function hapusNotifikasi(id) {
  if (!confirm("Yakin ingin menghapus notifikasi ini?")) return;
  try {
    await firebase.firestore().collection("notifikasi_umum").doc(id).delete();
    alert("🗑 Notifikasi berhasil dihapus.");
    formNotifikasiAdmin(); // refresh tampilan
  } catch (err) {
    console.error("❌ Gagal hapus:", err);
    alert("❌ Gagal menghapus notifikasi.");
  }
}


function tampilkanFloatingAlert(judul, pesan, opsi = {}) {
  let box = document.getElementById("floating-alert");

  // Jika belum ada elemen, buat
  if (!box) {
    box = document.createElement("div");
    box.id = "floating-alert";
    box.className = "floating-alert";
    document.body.appendChild(box);
  }

  // Opsi: apakah ini notifikasi admin?
  if (opsi.admin) box.classList.add("-admin-notif");
  else box.classList.remove("-admin-notif");

  // Isi konten
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${judul}</strong><br>${pesan}
      </div>
      <button onclick="document.getElementById('floating-alert').classList.remove('show')" style="margin-left:10px;background:none;border:none;font-size:18px;cursor:pointer;">✖</button>
    </div>
  `;

  // Tampilkan
  box.classList.add("show");

  // Jika tidak disetel sebagai `persist`, maka auto-close
  if (!opsi.persist) {
    clearTimeout(box._hideTimeout);
    box._hideTimeout = setTimeout(() => {
      box.classList.remove("show");
    }, opsi.timeout || 5000);
  }
}



async function lihatLogPesananDriver(idPesanan) {
  const db = firebase.firestore();
  const modal = document.getElementById("modal-detail");
  const container = modal.querySelector(".modal-content");

  container.innerHTML = `<p>🔄 Memuat log driver...</p>`;
  modal.style.display = "flex";

  try {
    const snap = await db.collection("pesanan_driver")
      .where("idPesanan", "==", idPesanan)
      .limit(1)
      .get();

    if (snap.empty) {
      container.innerHTML = `<p style="color:red;">❌ Log tidak ditemukan untuk ID: ${idPesanan}</p>`;
      return;
    }

    const data = snap.docs[0].data();
    const driverId = data.idDriver || "(Tidak diketahui)";
    const statusDriver = data.status || "-";
    const logs = Array.isArray(data.stepsLog) ? data.stepsLog : [];

    // 🔍 Ambil rating + ulasan dari log_driver berdasarkan idPesanan
    const ratingSnap = await db.collection("log_driver")
      .where("idPesanan", "==", idPesanan)
      .limit(1)
      .get();

    let ratingHTML = "<p><em>Belum ada rating untuk driver.</em></p>";
    if (!ratingSnap.empty) {
      const ratingData = ratingSnap.docs[0].data();
      ratingHTML = `
        <p><strong>Rating Driver:</strong> ${"⭐".repeat(ratingData.rating || 0)} (${ratingData.rating || 0}/5)</p>
        <p><strong>Ulasan:</strong> ${ratingData.komentar || "-"}</p>
      `;
    }

    const logList = logs.length
      ? logs.map(log => {
          const match = log.match(/^(\d{1,2}\.\d{2})\s+(.*)$/);
          if (match) {
            const jam = match[1].replace(".", ":");
            const keterangan = match[2];
            return `<li>✅ <strong>${keterangan}</strong> - <em>${jam}</em></li>`;
          } else {
            return `<li>✅ ${log}</li>`;
          }
        }).join("")
      : "<li>(Belum ada log aktivitas)</li>";

    container.innerHTML = `
      <button onclick="document.getElementById('modal-detail').style.display='none'" 
        style="float:right; font-size:20px; background:none; border:none;">❌</button>
      <h2>📄 Log Aktivitas Driver</h2>
      <p><strong>ID Pesanan:</strong> ${idPesanan}</p>
      <p><strong>ID Driver:</strong> ${driverId}</p>
      <p><strong>Status Saat Ini:</strong> ${statusDriver}</p>

      <h3 style="margin-top:20px;">📝 Log Perjalanan:</h3>
      <ul>${logList}</ul>

      <h3 style="margin-top:20px;">🌟 Rating & Ulasan:</h3>
      ${ratingHTML}
    `;
  } catch (err) {
    console.error("❌ Gagal ambil log:", err);
    container.innerHTML = `<p style="color:red;">❌ Gagal mengambil data log driver.</p>`;
  }
}


async function bukaModalDetailPesananAdmin(id) {
  const db = firebase.firestore();
  const container = document.querySelector("#modal-detail .modal-content");
  const modal = document.getElementById("modal-detail");

  try {
    const doc = await db.collection("pesanan").doc(id).get();
    if (!doc.exists) {
      container.innerHTML = `<p style="color:red;">❌ Pesanan tidak ditemukan.</p>`;
      return;
    }

    const data = doc.data();
    const produkList = Array.isArray(data.produk)
      ? data.produk.map(p => `<li>${p.nama} (${p.jumlah}x) - Rp ${(p.harga * p.jumlah).toLocaleString()}</li>`).join("")
      : "<li>-</li>";

    container.innerHTML = `
      <button onclick="document.getElementById('modal-detail').style.display='none'" 
        style="float:right; font-size:20px; background:none; border:none;">❌</button>
      <h2>📦 Detail Pesanan</h2>
      <p><strong>Nama Pembeli:</strong> ${data.namaPembeli || "-"}</p>
      <p><strong>No HP:</strong> ${data.noHpPembeli || "-"}</p>
      <p><strong>Alamat:</strong> ${data.alamat || "-"}</p>
      <p><strong>Status:</strong> ${data.status || "-"}</p>
      <p><strong>Metode:</strong> ${data.metode || "-"}</p>
      <h3>🛍️ Produk:</h3>
      <ul>${produkList}</ul>
    `;

    modal.style.display = "flex";
  } catch (err) {
    console.error("❌ Gagal ambil detail:", err);
    container.innerHTML = `<p style="color:red;">❌ Gagal ambil detail pesanan.</p>`;
  }
}


function editStatusPesanan(id, currentStatus) {
  const statusBaru = prompt("Ubah status pesanan:", currentStatus);
  if (!statusBaru || statusBaru === currentStatus) return;

  firebase.firestore().collection("pesanan").doc(id).update({
    status: statusBaru
  }).then(() => {
    alert("✅ Status berhasil diperbarui.");
    loadPage("pesanan-admin");
  }).catch(err => {
    console.error("❌ Gagal update status:", err);
    alert("❌ Gagal mengubah status.");
  });
}

function hapusPesananAdmin(id) {
  if (!confirm("⚠️ Yakin ingin menghapus pesanan ini?")) return;

  firebase.firestore().collection("pesanan").doc(id).delete()
    .then(() => {
      alert("✅ Pesanan berhasil dihapus.");
      renderHalaman("pesanan-admin");
    })
    .catch(err => {
      console.error("❌ Gagal hapus pesanan:", err);
      alert("❌ Gagal menghapus pesanan.");
    });
}



async function konfirmasiTarikDriver(id, jumlahDiterima) {
  if (!confirm("Yakin ingin mengonfirmasi penarikan untuk driver ini?")) return;

  const db = firebase.firestore();
  const ref = db.collection("tarik_saldo_driver").doc(id);

  try {
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Data tidak ditemukan.");

    const data = doc.data();
    const jumlah = data.jumlah;
    const diterima = jumlahDiterima;

    // Ambil ID Driver langsung dari UID pengguna yang sedang login
    const idDriver = firebase.auth().currentUser.uid;  // UID dari user yang sedang login

    console.log("ID Driver yang sedang login:", idDriver);  // Log ID Driver untuk debugging

    // Cek apakah data driver ada di koleksi 'driver' menggunakan UID sebagai doc.id
    const driverRef = db.collection("driver").doc(idDriver);  // Menggunakan koleksi 'driver' bukan 'drivers'
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) {
      throw new Error("Driver tidak ditemukan.");
    }

    // Update status penarikan
    await db.runTransaction(async (tx) => {
      const saldoDriver = driverDoc.data().saldo || 0;
      tx.update(driverRef, { saldo: saldoDriver + diterima });
      tx.update(ref, { status: "Selesai", waktuDiproses: new Date() });
    });

    // ✅ Kirim pesan ke pesan_toko > [idDriver] > pesan
    await db.collection("pesan_toko")
      .doc(idDriver)  // Menggunakan idDriver yang sesuai (UID)
      .collection("pesan")
      .add({
        waktu: new Date(),
        perihal: "Withdraw Dikonfirmasi",
        keterangan: `Penarikan sebesar Rp${diterima.toLocaleString("id-ID")} telah berhasil diproses untuk driver ${idDriver}.`,
        dari: "Admin"
      });

    alert("✅ Penarikan untuk driver berhasil dikonfirmasi.");
    loadContent("permintaan-withdraw"); // Reload halaman
  } catch (err) {
    alert("❌ Gagal mengonfirmasi penarikan: " + err.message);
  }
}

async function batalkanTarikDriver(id) {
  if (!confirm("Yakin ingin membatalkan penarikan untuk driver ini dan mengembalikan saldo?")) return;

  const db = firebase.firestore();
  const ref = db.collection("tarik_saldo_driver").doc(id);

  try {
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Data tidak ditemukan.");

    const data = doc.data();
    const jumlah = data.jumlah;
    const idDriver = data.idDriver;

    // Ambil data driver berdasarkan idDriver (menggunakan UID)
    const driverRef = db.collection("driver").doc(idDriver);
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) throw new Error("Driver tidak ditemukan.");

    // Mengembalikan saldo driver
    const saldoDriver = driverDoc.data().saldo || 0;

    // Melakukan transaksi untuk membatalkan penarikan dan mengembalikan saldo, serta set status menjadi 'pending'
    await db.runTransaction(async (tx) => {
      tx.update(driverRef, { saldo: saldoDriver + jumlah });
      tx.update(ref, { status: "pending", waktuDiproses: new Date() }); // Mengubah status menjadi 'pending'
    });

    // ✅ Kirim pesan ke pesan_toko > [idDriver] > pesan
    await db.collection("pesan_toko")
      .doc(idDriver)  // Menggunakan idDriver untuk mengirim pesan ke driver
      .collection("pesan")
      .add({
        waktu: new Date(),
        perihal: "Withdraw Dibatalkan",
        keterangan: `Penarikan sebesar Rp${jumlah.toLocaleString("id-ID")} dibatalkan dan status dikembalikan ke 'pending'. Dana telah dikembalikan ke saldo driver.`,
        dari: "Admin"
      });

    alert("✅ Penarikan untuk driver telah dibatalkan dan status dikembalikan ke 'pending'. Saldo dikembalikan.");
    loadContent("permintaan-withdraw"); // Reload halaman setelah pembatalan
  } catch (err) {
    alert("❌ Gagal membatalkan penarikan: " + err.message);
  }
}


async function konfirmasiTarikSeller(id, idToko, jumlahDiterima) {
  if (!confirm("Yakin ingin mengonfirmasi penarikan untuk seller ini?")) return;

  const db = firebase.firestore();
  const ref = db.collection("tarik_saldo").doc(id);

  try {
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Data tidak ditemukan.");

    const data = doc.data();
    const jumlah = data.jumlah;
    const diterima = jumlahDiterima;

    const tokoRef = db.collection("toko").doc(idToko);

    // Update saldo toko dan status permintaan
    await db.runTransaction(async (tx) => {
      const tokoDoc = await tx.get(tokoRef);
      if (!tokoDoc.exists) throw new Error("Toko tidak ditemukan.");

      const saldo = tokoDoc.data().saldo || 0;
      tx.update(tokoRef, { saldo: saldo + diterima });
      tx.update(ref, { status: "Selesai", waktuDiproses: new Date() });
    });

    // ✅ Kirim pesan ke pesan_toko > [idToko] > pesan
    await db.collection("pesan_toko")
      .doc(idToko)
      .collection("pesan")
      .add({
        waktu: new Date(),
        perihal: "Withdraw Dikonfirmasi",
        keterangan: `Penarikan sebesar Rp${diterima.toLocaleString("id-ID")} telah berhasil diproses untuk toko ${idToko}.`,
        dari: "Admin"
      });

    alert("✅ Penarikan seller berhasil dikonfirmasi.");
    loadContent("permintaan-withdraw"); // Reload halaman
  } catch (err) {
    alert("❌ Gagal mengonfirmasi penarikan: " + err.message);
  }
}



async function renderChatPelanggan({ idPesanan, idCustomer, namaCustomer = "Customer", namaToko = "Seller" }) {
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Anda tidak memiliki akses.");

  const modal = document.getElementById("modal-detail");
  const container = modal.querySelector(".modal-content");

  container.innerHTML = `
    <div class="chat-header-chat" style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">💬 Chat dengan ${namaCustomer}</h2>
      <button onclick="document.getElementById('modal-detail').style.display='none'" style="font-size:18px;">❌</button>
    </div>

    <div style="margin:5px 0;"><strong>Order ID:</strong> ${idPesanan}</div>
    <div class="chat-info-chat" style="margin-bottom:10px; font-size:14px;">
      <p><strong>Anda:</strong> ${namaToko}</p>
      <p><strong>Customer:</strong> ${namaCustomer}</p>
    </div>

    <div id="chat-box-seller" class="chat-box-chat" style="max-height:300px; overflow-y:auto; padding:10px; border:1px solid #ccc; border-radius:8px; background:#f9f9f9; margin-bottom:10px;"></div>

    <div class="chat-form-chat" style="display:flex; gap:8px; margin-bottom:10px;">
      <input type="text" id="chat-input-seller" placeholder="Ketik pesan..." style="flex:1; padding:6px 10px; border-radius:6px; border:1px solid #ccc;" />
      <button onclick="kirimPesanSeller('${idPesanan}', '${user.uid}', '${idCustomer}', '${namaToko}')">Kirim</button>
    </div>

    <div class="chat-templates-chat">
      <p><strong>📋 Template Cepat:</strong></p>
      <div class="template-buttons-chat" style="display:flex; flex-wrap:wrap; gap:6px;">
        <button class="mini-btn-chat" onclick="kirimPesanTemplateSeller('Pesanan Anda sedang diproses.', '${idPesanan}', '${user.uid}', '${idCustomer}', '${namaToko}')">⚙️ Diproses</button>
        <button class="mini-btn-chat" onclick="kirimPesanTemplateSeller('Pesanan Anda segera dikirim ya!', '${idPesanan}', '${user.uid}', '${idCustomer}', '${namaToko}')">🚚 Dikirim</button>
        <button class="mini-btn-chat" onclick="kirimPesanTemplateSeller('Terima kasih sudah memesan di ${namaToko}.', '${idPesanan}', '${user.uid}', '${idCustomer}', '${namaToko}')">🙏 Terima Kasih</button>
      </div>
    </div>
  `;

  modal.style.display = "flex";

  const chatBox = container.querySelector("#chat-box-seller");

  db.collection("chat_seller")
    .doc(idPesanan)
    .collection("pesan")
    .orderBy("waktu", "asc")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";

      if (snapshot.empty) {
        chatBox.innerHTML = "<p style='text-align:center; color:gray;'>Belum ada pesan.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const isSenderSeller = data.dari === user.uid;
        const posisi = isSenderSeller ? "flex-end" : "flex-start";
        const bgColor = isSenderSeller ? "#d1f1ff" : "#f1f1f1";
        const waktu = data.waktu?.toDate?.() || new Date();

        const bubble = document.createElement("div");
        bubble.style = `
          align-self: ${posisi};
          background: ${bgColor};
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 8px;
          max-width: 70%;
        `;
        bubble.innerHTML = `
          <div style="font-weight:bold; margin-bottom:3px;">${isSenderSeller ? "Anda" : namaCustomer}</div>
          <div>${escapeHTML(data.pesan)}</div>
          <div style="text-align:right; font-size:11px; color:#777;">${waktu.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        chatBox.appendChild(bubble);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

async function kirimPesanSeller(idPesanan, idSeller, idCustomer, namaToko) {
  const input = document.getElementById("chat-input-seller");
  const isiPesan = input.value.trim();
  if (!isiPesan) return;

  const db = firebase.firestore();
  await db.collection("chat_seller").doc(idPesanan).collection("pesan").add({
    dari: idSeller,
    ke: idCustomer,
    nama: namaToko,
    pesan: isiPesan,
    waktu: new Date()
  });

  input.value = "";
}

async function kirimPesanTemplateSeller(teks, idPesanan, idSeller, idCustomer, namaToko) {
  const db = firebase.firestore();
  await db.collection("chat_seller").doc(idPesanan).collection("pesan").add({
    dari: idSeller,
    ke: idCustomer,
    nama: namaToko,
    pesan: teks,
    waktu: new Date()
  });
}

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meter
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


function chatCustomer(idPesanan, namaPembeli, namaToko) {
  const modal = document.getElementById("modal-detail");
  const content = modal.querySelector(".modal-content");

  content.innerHTML = `
    <div style="position:relative;">
      <button onclick="tutupModalChat()" style="position:absolute; top:10px; right:10px; background:none; border:none; font-size:20px; cursor:pointer;">❌</button>
      <h3>Chat Pesanan: ${idPesanan}</h3>
      <p><strong>Nama Toko:</strong> ${namaToko}<br><strong>Nama Pembeli:</strong> ${namaPembeli}</p>
      <div id="chat-messages" style="height:200px; overflow-y:auto; border:1px solid #ccc; padding:10px; margin:10px 0; background:#f9f9f9;"></div>
      <textarea id="chat-input" placeholder="Tulis pesan..." style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc;"></textarea>
      <button onclick="kirimPesanChat('${idPesanan}')" style="margin-top:10px; width:100%;">Kirim</button>
    </div>
  `;

  modal.style.display = 'flex';

  const db = firebase.firestore();
  db.collection('chat_pesanan').doc(idPesanan).collection('messages')
    .orderBy('timestamp', 'asc')
    .onSnapshot(snapshot => {
      const box = document.getElementById('chat-messages');
      box.innerHTML = '';
      snapshot.forEach(doc => {
        const d = doc.data();
        const align = d.sender === 'seller' ? 'right' : 'left';
        const bg = d.sender === 'seller' ? '#d1f3ff' : '#f3f3f3';
        box.innerHTML += `
          <div style="text-align:${align}; margin:5px 0;">
            <div style="display:inline-block; background:${bg}; padding:6px 12px; border-radius:10px; max-width:80%;">
              ${d.message}
            </div>
          </div>`;
      });
      box.scrollTop = box.scrollHeight;
    });
}

function tutupModalChat() {
  document.getElementById("modal-detail").style.display = "none";
}


function kirimPesanChat(idPesanan) {
  const input = document.getElementById('chat-input');
  const pesan = input.value.trim();
  if (!pesan) return;

  const db = firebase.firestore();
  db.collection('chat_pesanan').doc(idPesanan).collection('messages').add({
    sender: 'seller',
    message: pesan,
    timestamp: new Date()
  });

  input.value = '';
}


async function konfirmasiPesanan(docId, idPesanan) {
  const db = firebase.firestore();

  try {
    const pesananDoc = await db.collection("pesanan_penjual").doc(docId).get();
    if (!pesananDoc.exists) {
      alert("❌ Pesanan tidak ditemukan.");
      return;
    }

    const dataPesanan = pesananDoc.data();

    const cekDriver = await db.collection("pesanan_driver")
      .where("idPesanan", "==", idPesanan)
      .limit(1)
      .get();

    if (!cekDriver.empty) {
      alert("⚠️ Pesanan sudah pernah diteruskan ke driver.");
      return;
    }

    // Ambil data pesanan utama
    const pesananUtamaDoc = await db.collection("pesanan").doc(idPesanan).get();
    if (!pesananUtamaDoc.exists) {
      alert("❌ Data pesanan utama tidak ditemukan.");
      return;
    }

    const pesanan = pesananUtamaDoc.data();
    const lokasiCustomer = pesanan.lokasi;
    const produk = pesanan.produk;

    // Ambil lokasi toko dari produk
    const lokasiToko = produk.find(p => p.idToko === dataPesanan.idToko)?.idToko;

    if (!lokasiToko) {
      alert("❌ Lokasi toko tidak tersedia.");
      return;
    }

    // Ambil koordinat toko dari koleksi toko
    const tokoDoc = await db.collection("toko").doc(lokasiToko).get();
    if (!tokoDoc.exists) {
      alert("❌ Data toko tidak ditemukan.");
      return;
    }

    const koordinatToko = tokoDoc.data().koordinat; // Koordinat dalam bentuk GeoPoint

    if (!koordinatToko) {
      alert("❌ Lokasi toko tidak tersedia.");
      return;
    }

    // Hitung jarak
    const geoPointToLatLng = geo => {
      if (!geo) return null;
      return geo.latitude !== undefined ? { lat: geo.latitude, lng: geo.longitude } : geo;
    };

    const hitungJarakKM = (a, b) => {
      a = geoPointToLatLng(a); b = geoPointToLatLng(b);
      if (!a || !b) return Infinity;
      const R = 6371;
      const dLat = (b.lat - a.lat) * Math.PI / 180;
      const dLng = (b.lng - a.lng) * Math.PI / 180;
      const x = Math.sin(dLat / 2) ** 2 +
        Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
      return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 10) / 10;
    };

    // Cari driver aktif & terdekat dengan prioritas berlangganan
    const driverSnap = await db.collection("driver").get();
    let nearestDriver = null;
    let minJarak = Infinity;

    for (const doc of driverSnap.docs) {
      const driver = doc.data();
      if (driver.status !== "aktif" || !driver.lokasi) continue;

      const jarak = hitungJarakKM(driver.lokasi, koordinatToko);
      if (jarak > 20) continue; // Filter driver yang berada dalam radius 20 km

      // Prioritaskan driver dengan berlanggananMultiOrder dan multiOrderAktif
      if (driver.berlanggananMultiOrder && driver.multiOrderAktif) {
        // Jika driver berlangganan multiOrder, prioritaskan meskipun jarak lebih jauh
        if (jarak < minJarak || nearestDriver === null) {
          nearestDriver = { id: doc.id, lokasi: driver.lokasi, jarak };
          minJarak = jarak;
        }
      }
    }

    // Jika tidak ada driver berlanggananMultiOrder yang ditemukan, cari driver biasa
    if (!nearestDriver) {
      for (const doc of driverSnap.docs) {
        const driver = doc.data();
        if (driver.status !== "aktif" || !driver.lokasi) continue;

        const jarak = hitungJarakKM(driver.lokasi, koordinatToko);
        if (jarak > 20) continue;

        if (jarak < minJarak || nearestDriver === null) {
          nearestDriver = { id: doc.id, lokasi: driver.lokasi, jarak };
          minJarak = jarak;
        }
      }
    }

    if (!nearestDriver) {
      alert("❌ Tidak ada driver aktif & cocok dalam radius 20km.");
      return;
    }

    // Simpan ke pesanan_driver
    await db.collection("pesanan_driver").doc(idPesanan).set({
      idPesanan,
      idDriver: nearestDriver.id,
      idToko: dataPesanan.idToko,
      status: "Menunggu Ambil",
      waktuAmbil: null,
      produk,
      lokasiDriver: nearestDriver.lokasi,
      lokasiToko: koordinatToko,
      lokasiCustomer,
      jarakDriverKeToko: hitungJarakKM(nearestDriver.lokasi, koordinatToko),
      jarakTokoKeCustomer: hitungJarakKM(koordinatToko, lokasiCustomer),
      metode: pesanan.metode,
      total: pesanan.total,
      totalOngkir: pesanan.totalOngkir,
      biayaLayanan: pesanan.biayaLayanan,
      catatan: pesanan.catatan,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("✅ Pesanan berhasil diteruskan ke driver terdekat.");

  } catch (error) {
    console.error("Gagal konfirmasi pesanan:", error);
    alert("❌ Gagal memproses konfirmasi.");
  }
}





function tampilkanFloatingBox(pesan) {
  const box = document.createElement("div");
  box.className = "floating-notif";
  box.innerHTML = pesan;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 6000);
}

// ✅ Menampilkan Floating Window Pesanan
function tampilkanFloatingWindowPesanan(data) {
  const idPesanan = data.idPesanan || "-";
  const metode = (data.metode || "-").toUpperCase();
  const jarak = data.jarakTokoKeCustomer != null ? data.jarakTokoKeCustomer : "-";
  const total = (data.total || 0).toLocaleString("id-ID");

  // Hapus jika sudah ada
  const existing = document.getElementById("floating-order-box");
  if (existing) existing.remove();

  // Buat elemen
  const floatBox = document.createElement("div");
  floatBox.id = "floating-order-box";
  floatBox.className = "floating-order-window";
  floatBox.innerHTML = `
    <div class="floating-header">
      <strong>📦 Pesanan Baru</strong>
      <button class="btn-close-window" onclick="document.getElementById('floating-order-box').remove()">✖</button>
    </div>
    <div class="floating-body">
      <p><strong>ID:</strong> ${idPesanan}</p>
      <p><strong>Metode:</strong> ${metode}</p>
      <p><strong>Jarak:</strong> ${jarak} km</p>
      <p><strong>Total:</strong> Rp ${total}</p>
      <button onclick="bukaDetailPesananDriver('${idPesanan}')" class="btn-cek-pesanan">🔍 Lihat Detail</button>
    </div>
  `;
  document.body.appendChild(floatBox);

  // Putar suara
  playNotifikasiSuara();
}

// ✅ Notifikasi Mengambang (bawah)
function tampilkanNotifikasiDriver(data) {
  const idPesanan = data.idPesanan || "-";
  const metode = (data.metode || "-").toUpperCase();
  const jarak = data.jarakTokoKeCustomer != null ? data.jarakTokoKeCustomer : "-";

  const box = document.createElement("div");
  box.className = "notif-float-driver";
  box.innerHTML = `
    <strong>📦 Pesanan Baru!</strong><br>
    ID: ${idPesanan}<br>
    Jarak: ${jarak} km<br>
    Metode: ${metode}
  `;
  document.body.appendChild(box);

  setTimeout(() => {
    box.classList.add("hide");
    setTimeout(() => box.remove(), 500);
  }, 5000);

  playNotifikasiSuara();
}

// ✅ Listener Real-Time Pesanan Baru Driver
function listenPesananBaruDriver(driverUid) {
  const db = firebase.firestore();

  db.collection("pesanan_driver")
    .where("idDriver", "==", driverUid)
    .orderBy("createdAt", "desc")
    .limit(5)
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const data = change.doc.data();
          tampilkanFloatingWindowPesanan(data);     // Tampilkan window utama
          tampilkanNotifikasiDriver(data);          // Notif kecil bawah
        }
      });
    });
}

// ✅ Fungsi Pemutar Suara
function playNotifikasiSuara() {
  const audio = new Audio("https://www.myinstants.com/media/sounds/notification-sound.mp3");
  audio.play().catch(() => {
    console.warn("🔇 Gagal memutar notifikasi suara.");
  });
}



async function renderAdminLiveChatPanel() {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat Live Chat...</p>`;

  const db = firebase.firestore();
  const adminUid = "JtD1wA2wkzVg6SWwWSFTxFZMhxO2";

  try {
    // Ambil status live chat dari pengaturan/liveChatStatus
    const settingDoc = await db.collection("pengaturan").doc("liveChatStatus").get();
    const liveChatStatus = settingDoc.exists ? settingDoc.data().status || "offline" : "offline";

    // Ambil chat terbaru (limit 50)
    const chatSnapshot = await db.collection("chat")
      .orderBy("waktu", "desc")
      .limit(50)
      .get();

    const usersMap = new Map();

    chatSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const otherUid = data.dari !== adminUid ? data.dari : data.ke;
      if (!usersMap.has(otherUid)) {
        usersMap.set(otherUid, { lastChat: data.waktu, unreadCount: 0 });
      }
    });

    // Hitung unread pesan per user (pesan dari user ke admin yang belum dibaca)
    const unreadSnapshot = await db.collection("chat")
      .where("ke", "==", adminUid)
      .where("status_baca", "==", false)
      .get();

    unreadSnapshot.forEach(doc => {
      const data = doc.data();
      if (usersMap.has(data.dari)) {
        usersMap.get(data.dari).unreadCount++;
      }
    });

    container.innerHTML = `
      <h2>💬 Live Chat Admin</h2>
      <div>
        Status Live Chat: 
        <span id="live-chat-status" style="font-weight:bold; color:${liveChatStatus === 'online' ? 'green' : 'red'};">
          ${liveChatStatus.toUpperCase()}
        </span>
        <button id="toggle-live-chat-btn" style="margin-left:10px; padding: 6px 12px; border-radius: 6px; cursor: pointer; background: #2196f3; color: white; border: none;">
          Ubah ke ${liveChatStatus === 'online' ? 'OFFLINE' : 'ONLINE'}
        </button>
      </div>
      <hr />
      <div id="live-chat-users-list" style="max-height: 400px; overflow-y:auto; margin-top:10px;">
        ${usersMap.size === 0 ? "<p>Tidak ada chat aktif.</p>" : ""}
      </div>
      <div id="live-chat-chatbox" style="margin-top:20px;">
        <!-- Chat box akan muncul di sini setelah klik user -->
      </div>
    `;

    // Render list user dengan badge unread
    const usersListElem = document.getElementById("live-chat-users-list");
    usersMap.forEach((val, key) => {
      const badge = val.unreadCount > 0
        ? `<span style="background:red; color:white; padding:2px 6px; border-radius:12px; font-size:12px; margin-left:6px;">${val.unreadCount}</span>`
        : "";
      const userBtn = document.createElement("button");
      userBtn.innerHTML = `${key}${badge}`;
      userBtn.style = "display:block; width:100%; text-align:left; padding:8px; cursor:pointer; border:none; background:#f0f0f0; margin-bottom:4px; border-radius:6px;";
      userBtn.onclick = () => openLiveChatWithUser(key);
      usersListElem.appendChild(userBtn);
    });

    // Toggle status live chat
    document.getElementById("toggle-live-chat-btn").onclick = async () => {
      const newStatus = liveChatStatus === "online" ? "offline" : "online";
      await db.collection("pengaturan").doc("liveChatStatus").set({ status: newStatus });
      alert("Status live chat diubah menjadi: " + newStatus.toUpperCase());
      renderAdminLiveChatPanel(); // Reload panel supaya update status dan tombol
    };
  } catch (error) {
    container.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${error.message}</p>`;
  }
}

// Fungsi buka chat dengan user
async function openLiveChatWithUser(userId) {
  const container = document.getElementById("live-chat-chatbox");
  container.innerHTML = `<p>Memuat chat dengan ${userId}...</p>`;

  const db = firebase.firestore();
  const adminUid = "JtD1wA2wkzVg6SWwWSFTxFZMhxO2";

  // Render header + pesan + input
  container.innerHTML = `
    <h3>Chat dengan User: ${userId}</h3>
    <div id="chat-messages" style="height:300px; overflow-y:auto; border:1px solid #ccc; padding:8px; border-radius:8px; background:#fafafa; display:flex; flex-direction: column; gap:6px;"></div>
    <div style="margin-top:8px; display:flex; gap:8px;">
      <input type="text" id="chat-input" placeholder="Ketik pesan..." style="flex-grow: 1; padding:6px; border-radius:6px; border:1px solid #ccc;" />
      <button id="send-chat-btn" style="padding:6px 12px; border-radius:6px; background:#4caf50; color:white; border:none; cursor:pointer;">Kirim</button>
    </div>
  `;

  const messagesElem = document.getElementById("chat-messages");
  const inputElem = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-chat-btn");

  // Load chat realtime dengan unsubscribe jika ada
  if (window.unsubscribeChatLive) window.unsubscribeChatLive();
  window.unsubscribeChatLive = db.collection("chat")
    .where("dari", "in", [userId, adminUid])
    .where("ke", "in", [userId, adminUid])
    .orderBy("waktu", "asc")
    .onSnapshot(snapshot => {
      messagesElem.innerHTML = "";
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const isAdmin = data.dari === adminUid;
        const bubble = document.createElement("div");
        bubble.style.marginBottom = "6px";
        bubble.style.padding = "8px";
        bubble.style.borderRadius = "10px";
        bubble.style.maxWidth = "70%";
        bubble.style.backgroundColor = isAdmin ? "#dcf8c6" : "#fff";
        bubble.style.alignSelf = isAdmin ? "flex-end" : "flex-start";
        bubble.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        bubble.textContent = data.isi;
        messagesElem.appendChild(bubble);

        // Tandai pesan user ke admin sudah dibaca
        if (!isAdmin && data.status_baca === false) {
          doc.ref.update({ status_baca: true });
        }
      });
      messagesElem.scrollTop = messagesElem.scrollHeight;
    });

  // Kirim pesan admin ke user
  sendBtn.onclick = async () => {
    const text = inputElem.value.trim();
    if (!text) return;

    await db.collection("chat").add({
      dari: adminUid,
      ke: userId,
      isi: text,
      waktu: new Date(),
      status_baca: false
    });

    inputElem.value = "";
  };
}




async function hitungTotalFeePerusahaan(db) {
  const snapshot = await db.collection("pesanan")
    .orderBy("waktuPesan", "desc")
    .limit(100)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  let totalFeeKeseluruhan = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const status = (data.status || "").toLowerCase();
    if (status !== "selesai") continue;

    const subtotal = data.subtotalProduk || 0;
    const ongkir = data.totalOngkir || 0;
    const totalTransaksi = subtotal + ongkir;

    const biayaLayanan = Math.round(totalTransaksi * 0.01);
    const biayaToko = Math.round(subtotal * 0.05);
    const biayaDriver = Math.round(ongkir * 0.05);
    const totalFee = biayaLayanan + biayaToko + biayaDriver;

    totalFeeKeseluruhan += totalFee;
  }

  return totalFeeKeseluruhan;
}

function isiTemplate(pesan) {
  const input = document.getElementById("input-chat");
  if (input) {
    input.value = pesan;
    input.focus();
  }
}


async function kirimPesanKeAdmin() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const uid = user.uid;
  const input = document.getElementById("input-chat");
  const isiPesan = input.value.trim();
  if (!isiPesan) return;

  const db = firebase.firestore();
  const waktu = firebase.firestore.Timestamp.now();

  // Kirim pesan user ke admin
  await db.collection("chat").add({
    dari: uid,
    ke: "JtD1wA2wkzVg6SWwWSFTxFZMhxO2", // admin ID
    isi: isiPesan,
    waktu: waktu,
  });

  input.value = "";

  // Tentukan balasan otomatis sistem berdasarkan isi pesan user
  let balasan = "";

  if (isiPesan.toLowerCase().includes("topup")) {
    balasan = "🔁 Untuk topup saldo, silakan gunakan menu Dompet → Top Up.";
  } else if (isiPesan.toLowerCase().includes("login")) {
    balasan = "🔒 Coba logout dan login kembali jika mengalami masalah login.";
  } else if (isiPesan.toLowerCase().includes("tarik")) {
    balasan = "💸 Penarikan saldo bisa dilakukan melalui menu Dompet → Tarik Saldo.";
  } else if (isiPesan.toLowerCase().includes("biaya")) {
    balasan = "💡 Tidak ada biaya tambahan untuk penggunaan normal.";
  } else if (isiPesan.toLowerCase().includes("verifikasi")) {
    balasan = "🕒 Proses verifikasi akun biasanya 1-2 hari kerja.";
  }

  // Kirim balasan sistem jika ada
  if (balasan) {
    await db.collection("chat").add({
      dari: "SISTEM",       // ID khusus untuk sistem
      ke: uid,
      isi: balasan,
      waktu: firebase.firestore.Timestamp.now(),
    });
  }
}


async function renderChatBox() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  const uid = user.uid;

  const chatBox = document.querySelector(".-admin-chat-box");
  const timestampElem = document.getElementById("chat-timestamp");
  if (!chatBox || !timestampElem) return;

  const db = firebase.firestore();

  const avatarDefault = "https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar.png";

  db.collection("chat")
    .where("dari", "in", [uid, "JtD1wA2wkzVg6SWwWSFTxFZMhxO2", "SISTEM"])
    .where("ke", "in", [uid, "JtD1wA2wkzVg6SWwWSFTxFZMhxO2", "SISTEM"])
    .orderBy("waktu", "asc")
    .onSnapshot(async (snapshot) => {
      chatBox.innerHTML = "";

      let lastTimestamp = "";

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const isSender = data.dari === uid;
        const waktuDate = data.waktu?.toDate();
        const waktuStr = waktuDate?.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        }) || "";

        if (waktuDate) {
          lastTimestamp = waktuDate.toLocaleString("id-ID", {
            dateStyle: "short",
            timeStyle: "short"
          });
        }

        let namaPengirim = "";
        let avatar = avatarDefault;

        if (data.dari === uid) {
          namaPengirim = "Kamu";
        } else if (data.dari === "SISTEM") {
          namaPengirim = "[Sistem]";
        } else {
          const adminDoc = await db.collection("users").doc("JtD1wA2wkzVg6SWwWSFTxFZMhxO2").get();
          namaPengirim = adminDoc.exists ? adminDoc.data().nama || "Admin" : "Admin";
        }

        const pesanElem = document.createElement("div");
        pesanElem.className = "-admin-chat-message " + (isSender ? "right" : "left");

        pesanElem.innerHTML = `
          <img class="-admin-chat-avatar" src="${avatar}" />
          <div class="-admin-chat-bubble">
            <div class="-admin-chat-nama">${namaPengirim}</div>
            <div class="-admin-chat-isi">${data.isi}</div>
            <div class="-admin-chat-waktu">${waktuStr}</div>
          </div>
        `;

        chatBox.appendChild(pesanElem);
      }

// ... bagian akhir renderChatBox setelah loop chat bubble ...
const templateBubble = document.createElement("div");
templateBubble.className = "-admin-chat-message left";
templateBubble.innerHTML = `
  <img class="-admin-chat-avatar" src="${avatarDefault}" />
  <div class="-admin-chat-bubble" style="background:#fff7d1">
    <div class="-admin-chat-nama">[Sistem]</div>
    <div class="-admin-chat-isi">Silakan pilih salah satu pertanyaan di bawah ini:</div>
    <div class="-admin-chat-template-bubbles" style="margin-top: 8px;">
      <span onclick="isiTemplate('Bagaimana cara topup saldo?')">Cara topup saldo</span>
      <span onclick="isiTemplate('Saya mengalami kendala saat login')">Kendala login</span>
      <span onclick="isiTemplate('Bagaimana cara menarik saldo?')">Tarik saldo</span>
      <span onclick="isiTemplate('Berapa lama proses verifikasi?')">Lama verifikasi</span>
    </div>
    <button onclick="hubungkanKeAdmin()" style="margin-top: 12px; background:#4caf50; color:#fff; border:none; border-radius: 16px; padding: 8px 16px; cursor:pointer; font-weight:bold;">
      Chat dengan Admin
    </button>
  </div>
`;
chatBox.appendChild(templateBubble);


      chatBox.scrollTop = chatBox.scrollHeight;
    });
}


async function hubungkanKeAdmin() {
  const db = firebase.firestore();

  try {
    const statusDoc = await db.collection("pengaturan").doc("liveChatStatus").get();

    if (statusDoc.exists && statusDoc.data().status === "online") {
      // Admin online
      const input = document.getElementById("input-chat");
      if (input) {
        input.focus();
        input.value = "";
      }
      alert("Admin sedang online, silakan ketik pesan dan kirim.");
    } else {
      // Admin offline
      alert("Admin sedang tidak tersedia sekarang. Silakan tinggalkan pesan, kami akan membalas secepatnya.");
    }
  } catch (error) {
    console.error("Gagal cek status live chat admin:", error);
    alert("Terjadi kesalahan saat mengecek status admin. Silakan coba lagi nanti.");
  }
}





async function loadRiwayatPesanAdmin() {
  const db = firebase.firestore();
  const riwayatEl = document.getElementById("riwayat-pesan");
  let pesanRows = "";

  try {
    // Ambil 20 pesan terbaru dari pesan_driver dan pesan_toko
    const [driverSnap, sellerSnap] = await Promise.all([
      db.collectionGroup("pesan").where("dari", "==", "Admin").orderBy("waktu", "desc").limit(20).get(),
    ]);

    if (driverSnap.empty) {
      riwayatEl.innerHTML += `<p>Belum ada riwayat pesan.</p>`;
      return;
    }

    pesanRows += `
      <table style="width:100%; border-collapse: collapse; margin-top:10px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:6px; border:1px solid #ccc;">No</th>
            <th style="padding:6px; border:1px solid #ccc;">Tanggal</th>
            <th style="padding:6px; border:1px solid #ccc;">Waktu</th>
            <th style="padding:6px; border:1px solid #ccc;">Perihal</th>
            <th style="padding:6px; border:1px solid #ccc;">Keterangan</th>
            <th style="padding:6px; border:1px solid #ccc;">Tujuan</th>
          </tr>
        </thead>
        <tbody>
    `;

    let no = 1;
    driverSnap.forEach(doc => {
      const data = doc.data();
      const waktu = data.waktu?.toDate?.();
      const tanggal = waktu?.toLocaleDateString("id-ID") || "-";
      const jam = waktu?.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) || "-";
      const tujuan = doc.ref.path.includes("pesan_driver") ? `Driver (${doc.ref.parent.parent.id})` : `Seller (${doc.ref.parent.parent.id})`;

      pesanRows += `
        <tr>
          <td style="padding:6px; border:1px solid #ccc;">${no++}</td>
          <td style="padding:6px; border:1px solid #ccc;">${tanggal}</td>
          <td style="padding:6px; border:1px solid #ccc;">${jam}</td>
          <td style="padding:6px; border:1px solid #ccc;">${data.perihal}</td>
          <td style="padding:6px; border:1px solid #ccc;">${data.keterangan}</td>
          <td style="padding:6px; border:1px solid #ccc;">${tujuan}</td>
        </tr>
      `;
    });

    pesanRows += `</tbody></table>`;
    riwayatEl.innerHTML = `<h3>📜 Riwayat Pesan Terakhir</h3>${pesanRows}`;

  } catch (err) {
    riwayatEl.innerHTML += `<p style="color:red;">❌ Gagal memuat riwayat: ${err.message}</p>`;
  }
}


async function loadTargetDropdown() {
  const role = document.getElementById("role").value;
  const dropdown = document.getElementById("targetId");
  dropdown.innerHTML = `<option value="">⏳ Memuat...</option>`;

  const db = firebase.firestore();
  let query;

  if (role === "driver") {
    query = await db.collection("driver").get();
  } else {
    query = await db.collection("toko").get();
  }

  let options = `<option value="">-- Pilih --</option>`;
  query.forEach(doc => {
    const data = doc.data();
    const name = data.nama || data.namaToko || "Tanpa Nama";
    options += `<option value="${doc.id}">${name} / ${doc.id}</option>`;
  });

  dropdown.innerHTML = options;
}

async function kirimPesanKeTarget() {
  const role = document.getElementById("role").value;
  const targetId = document.getElementById("targetId").value.trim();
  const perihal = document.getElementById("perihal").value.trim();
  const keterangan = document.getElementById("pesan").value.trim();

  if (!targetId || !perihal || !keterangan) {
    return alert("❌ Semua kolom wajib diisi!");
  }

  const db = firebase.firestore();
  const waktu = new Date();

  const data = {
    waktu,
    perihal,
    keterangan,
    dari: "Admin"
  };

  try {
    if (role === "driver") {
      await db.collection("pesan_driver").doc(targetId).collection("pesan").add(data);
    } else {
      await db.collection("pesan_toko").doc(targetId).collection("pesan").add(data);
    }

    alert("✅ Pesan berhasil dikirim!");
    document.getElementById("perihal").value = "";
    document.getElementById("pesan").value = "";
  } catch (err) {
    alert("❌ Gagal mengirim pesan: " + err.message);
  }
}



async function bukaModalPesanDriver() {
  const modal = document.getElementById("modal-detail");
  const content = modal.querySelector(".modal-content");
  modal.style.display = "flex";
  content.innerHTML = `<p>⏳ Memuat pesan...</p>`;

  const user = firebase.auth().currentUser;
  if (!user) {
    content.innerHTML = `
      <p style="color:red;">❌ Kamu belum login.</p>
      <div style="text-align:right; margin-top:12px;">
        <button onclick="document.getElementById('modal-detail').style.display='none'"
          style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
          Tutup
        </button>
      </div>
    `;
    return;
  }

  const idDriver = user.uid;
  const db = firebase.firestore();

  try {
    const snapshot = await db.collection("pesan_driver")
      .doc(idDriver)
      .collection("pesan")
      .orderBy("waktu", "desc")
      .limit(20)
      .get();

    if (snapshot.empty) {
      content.innerHTML = `
        <p>📭 Tidak ada pesan masuk.</p>
        <div style="text-align:right; margin-top:12px;">
          <button onclick="document.getElementById('modal-detail').style.display='none'"
            style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
            Tutup
          </button>
        </div>
      `;
      return;
    }

    let pesanList = `
      <h2>📩 Pesan Masuk Driver</h2>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="padding:6px; border:1px solid #ccc;">No</th>
            <th style="padding:6px; border:1px solid #ccc;">Waktu</th>
            <th style="padding:6px; border:1px solid #ccc;">Perihal</th>
            <th style="padding:6px; border:1px solid #ccc;">Keterangan</th>
            <th style="padding:6px; border:1px solid #ccc;">Dari</th>
          </tr>
        </thead>
        <tbody>
    `;

    let no = 1;
    snapshot.forEach(doc => {
      const data = doc.data();
      const waktu = data.waktu?.toDate?.().toLocaleString("id-ID") || "-";
      pesanList += `
        <tr>
          <td style="padding:6px; border:1px solid #ccc;">${no++}</td>
          <td style="padding:6px; border:1px solid #ccc;">${waktu}</td>
          <td style="padding:6px; border:1px solid #ccc;">${data.perihal || "-"}</td>
          <td style="padding:6px; border:1px solid #ccc;">${data.keterangan || "-"}</td>
          <td style="padding:6px; border:1px solid #ccc;">${data.dari || "Admin"}</td>
        </tr>
      `;
    });

    pesanList += `</tbody></table>`;

    content.innerHTML = `
      ${pesanList}
      <div style="text-align:right; margin-top:12px;">
        <button onclick="document.getElementById('modal-detail').style.display='none'"
          style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
          Tutup
        </button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `
      <p style="color:red;">❌ Gagal memuat pesan: ${err.message}</p>
      <div style="text-align:right; margin-top:12px;">
        <button onclick="document.getElementById('modal-detail').style.display='none'"
          style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
          Tutup
        </button>
      </div>
    `;
  }
}



async function bukaModalPesan(idToko) {
  const modal = document.getElementById("modal-detail");
  const content = modal.querySelector(".modal-content");
  modal.style.display = "flex";
  content.innerHTML = `<p>⏳ Memuat pesan...</p>`;

  const db = firebase.firestore();

  try {
    const snapshot = await db.collection("pesan_toko")
      .doc(idToko)
      .collection("pesan")
      .orderBy("waktu", "desc")
      .limit(20)
      .get();

    if (snapshot.empty) {
      content.innerHTML = `
        <p>📭 Tidak ada pesan masuk untuk toko ini.</p>
        <div style="text-align:right; margin-top:12px;">
          <button onclick="document.getElementById('modal-detail').style.display='none'"
            style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
            Tutup
          </button>
        </div>
      `;
      return;
    }

    let pesanList = `
      <h2>📩 Pesan Masuk Toko</h2>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="padding:6px; border:1px solid #ccc;">No</th>
            <th style="padding:6px; border:1px solid #ccc;">Waktu</th>
            <th style="padding:6px; border:1px solid #ccc;">Perihal</th>
            <th style="padding:6px; border:1px solid #ccc;">Keterangan</th>
            <th style="padding:6px; border:1px solid #ccc;">Dari</th>
          </tr>
        </thead>
        <tbody>
    `;

    let no = 1;
    snapshot.forEach(doc => {
      const data = doc.data();
      const waktu = data.waktu?.toDate?.().toLocaleString("id-ID") || "-";
      pesanList += `
        <tr>
          <td style="padding:6px; border:1px solid #ccc;">${no++}</td>
          <td style="padding:6px; border:1px solid #ccc;">${waktu}</td>
          <td style="padding:6px; border:1px solid #ccc;">${data.perihal || "-"}</td>
          <td style="padding:6px; border:1px solid #ccc;">${data.keterangan || "-"}</td>
          <td style="padding:6px; border:1px solid #ccc;">${data.dari || "Admin"}</td>
        </tr>
      `;
    });

    pesanList += `</tbody></table>`;

    content.innerHTML = `
      ${pesanList}
      <div style="text-align:right; margin-top:12px;">
        <button onclick="document.getElementById('modal-detail').style.display='none'"
          style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
          Tutup
        </button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `
      <p style="color:red;">❌ Gagal memuat pesan: ${err.message}</p>
      <div style="text-align:right; margin-top:12px;">
        <button onclick="document.getElementById('modal-detail').style.display='none'"
          style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
          Tutup
        </button>
      </div>
    `;
  }
}




async function formTarikSaldoDriver(idDriver, saldo) {
  const modal = document.getElementById("modal-detail");
  const content = modal.querySelector(".modal-content");

  modal.style.display = "flex";
  content.innerHTML = `<p>⏳ Memuat data driver...</p>`;

  const db = firebase.firestore();

  try {
    const driverDoc = await db.collection("driver").doc(idDriver).get();
    if (!driverDoc.exists) {
      content.innerHTML = `<p style="color:red;">❌ Data driver tidak ditemukan.</p>`;
      return;
    }

    const data = driverDoc.data();
    const namaDriver = data.nama || "-";

    content.innerHTML = `
      <h2>💸 Tarik Saldo Driver</h2>
      <p><strong>Saldo:</strong> Rp ${saldo.toLocaleString("id-ID")}</p>

      <form onsubmit="return konfirmasiTarikSaldoDriver(event, '${idDriver}', ${saldo})">
        <label>Nama Rekening</label>
        <input type="text" value="${namaDriver}" readonly
          style="width:100%; padding:8px; margin-bottom:10px; background:#eee; border:1px solid #ccc; border-radius:6px;">

        <label>Jumlah Tarik (Rp)</label>
        <input type="number" id="jumlah-tarik-driver" required min="10000" placeholder="Minimal Rp10.000"
          oninput="hitungJumlahDiterimaDriver()" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px;">

        <label>Nomor Rekening / E-Wallet</label>
        <input type="text" id="rekening-driver" required placeholder="Contoh: 089123456789"
          style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px;">

        <label>Bank / E-Wallet</label>
        <select id="bank-driver" onchange="hitungJumlahDiterimaDriver()" required
          style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px;">
          <option value="">Pilih Bank / E-Wallet</option>
          <option value="BCA" data-biaya="0">BCA</option>
          <option value="BRI" data-biaya="2500">BRI +2.500</option>
          <option value="MANDIRI" data-biaya="2500">MANDIRI +2.500</option>
          <option value="SEABANK" data-biaya="0">SEABANK</option>
          <option value="DANA" data-biaya="0">DANA</option>
        </select>

        <label>Jumlah Diterima</label>
        <input type="text" id="jumlah-diterima-driver" readonly
          style="width:100%; padding:8px; margin-bottom:14px; background:#eee; border:1px solid #ccc; border-radius:6px;">

        <button type="submit"
          style="width:100%; background:#28a745; color:#fff; border:none; border-radius:6px; padding:10px;">
          Ajukan Tarik Saldo
        </button>
      </form>

      <div id="hasilTarikDriver" style="margin-top:16px;"></div>

      <div style="text-align:right; margin-top:12px;">
        <button onclick="document.getElementById('modal-detail').style.display='none'"
          style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
          Tutup
        </button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<p style="color:red;">❌ Gagal memuat form: ${err.message}</p>`;
  }
}

function konfirmasiTarikSaldoDriver(event, idDriver, saldo) {
  event.preventDefault();
  const konfirmasi = confirm("Yakin ingin mengajukan penarikan saldo ini?");
  if (konfirmasi) {
    return submitTarikSaldoDriver(event, idDriver, saldo);
  } else {
    return false;
  }
}


function hitungJumlahDiterimaDriver() {
  const jumlah = parseInt(document.getElementById("jumlah-tarik-driver").value) || 0;
  const bank = document.getElementById("bank-driver");
  const biaya = parseInt(bank.options[bank.selectedIndex]?.dataset?.biaya || 0);
  const diterima = jumlah - biaya;
  document.getElementById("jumlah-diterima-driver").value = diterima > 0 ? `Rp ${diterima.toLocaleString("id-ID")}` : "Rp 0";
}

async function submitTarikSaldoDriver(event, idDriver, saldoTersedia) {
  event.preventDefault();

  const jumlah = parseInt(document.getElementById("jumlah-tarik-driver").value) || 0;
  const rekening = document.getElementById("rekening-driver").value.trim();
  const bank = document.getElementById("bank-driver").value;
  const bankOption = document.getElementById("bank-driver").selectedOptions[0];
  const biayaAdmin = parseInt(bankOption.dataset.biaya || 0);
  const diterima = jumlah - biayaAdmin;

  const hasilEl = document.getElementById("hasilTarikDriver");
  hasilEl.innerHTML = "";

  if (!bank || !rekening || jumlah < 10000) {
    hasilEl.innerHTML = `<p style="color:red;">❗ Lengkapi semua data dengan benar. Minimal tarik Rp10.000.</p>`;
    return false;
  }

  if (jumlah > saldoTersedia) {
    hasilEl.innerHTML = `<p style="color:red;">❌ Jumlah melebihi saldo tersedia.</p>`;
    return false;
  }

  try {
    const db = firebase.firestore();

    // 🔎 Cek apakah ada penarikan pending
    const cekPending = await db.collection("tarik_saldo_driver")
      .where("idDriver", "==", idDriver)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (!cekPending.empty) {
      hasilEl.innerHTML = `<p style="color:red;">❌ Kamu masih memiliki penarikan saldo yang sedang diproses. Silakan tunggu hingga selesai.</p>`;
      return false;
    }

    // ✅ Tambahkan data penarikan
    await db.collection("tarik_saldo_driver").add({
      idDriver,
      jumlah,
      biayaAdmin,
      diterima,
      rekening,
      bank,
      status: "pending",
      waktu: new Date()
    });

    hasilEl.innerHTML = `<p style="color:green;">✅ Permintaan tarik saldo berhasil dikirim!</p>`;

    setTimeout(() => {
      document.getElementById("modal-detail").style.display = "none";
    }, 1000);

  } catch (err) {
    hasilEl.innerHTML = `<p style="color:red;">❌ Gagal mengirim: ${err.message}</p>`;
  }

  return false;
}




async function formTarikSaldo(idToko, saldo) {
  const modal = document.getElementById("modal-detail");
  const content = modal.querySelector(".modal-content");

  modal.style.display = "flex";
  content.innerHTML = `<p>⏳ Memuat data...</p>`;

  const db = firebase.firestore();

  try {
    const tokoDoc = await db.collection("toko").doc(idToko).get();
    if (!tokoDoc.exists) {
      content.innerHTML = `<p style="color:red;">❌ Data toko tidak ditemukan.</p>`;
      return;
    }

    const dataToko = tokoDoc.data();
    const namaPemilik = dataToko.namaPemilik || "-";

    content.innerHTML = `
      <h2>💸 Tarik Saldo</h2>
      <p><strong>Saldo Toko:</strong> Rp ${saldo.toLocaleString("id-ID")}</p>

      <form onsubmit="return submitTarikSaldo(event, '${idToko}', ${saldo})">
        <label>Nama Rekening (sesuai KTP)</label>
        <input type="text" value="${namaPemilik}" readonly
          style="width:100%; padding:8px; margin-bottom:10px; background:#eee; border:1px solid #ccc; border-radius:6px;">

        <label>Jumlah Tarik (Rp)</label>
        <input type="number" id="jumlah" required min="10000" placeholder="Minimal Rp10.000"
          oninput="hitungJumlahDiterima()" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px;">

        <label>Nomor Rekening / E-Wallet</label>
        <input type="text" id="rekening" required placeholder="Contoh: 089123456789"
          style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px;">

        <label>Bank / E-Wallet</label>
        <select id="bank" onchange="hitungJumlahDiterima()" required
          style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px;">
          <option value="">Pilih Bank / E-Wallet</option>
          <option value="BCA">BCA</option>
          <option value="BRI">BRI +2.500</option>
          <option value="MANDIRI">MANDIRI +2.500</option>
          <option value="SEABANK">SEABANK</option>
          <option value="DANA">DANA</option>
        </select>

        <label>Jumlah Diterima</label>
        <input type="text" id="jumlahDiterima" readonly
          style="width:100%; padding:8px; margin-bottom:14px; background:#eee; border:1px solid #ccc; border-radius:6px;">

        <button type="submit"
          style="width:100%; background:#28a745; color:#fff; border:none; border-radius:6px; padding:10px;">
          Ajukan Tarik Saldo
        </button>
      </form>

      <div id="hasilTarikSaldo" style="margin-top:16px;"></div>

      <div style="text-align:right; margin-top:12px;">
        <button onclick="document.getElementById('modal-detail').style.display='none'"
          style="background:#aaa; color:#fff; padding:6px 12px; border:none; border-radius:6px;">
          Tutup
        </button>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<p style="color:red;">❌ Gagal memuat form: ${err.message}</p>`;
  }
}

function hitungJumlahDiterima() {
  const jumlah = parseInt(document.getElementById("jumlah").value) || 0;
  const bank = document.getElementById("bank").value;
  const jumlahDiterimaInput = document.getElementById("jumlahDiterima");

  let potongan = 0;
  if (bank === "BRI" || bank === "MANDIRI") potongan = 2500;

  const diterima = Math.max(0, jumlah - potongan);
  jumlahDiterimaInput.value = `Rp ${diterima.toLocaleString("id-ID")}`;
}


async function submitTarikSaldo(event, idToko, saldoToko) {
  event.preventDefault();

  const jumlah = parseInt(document.getElementById("jumlah").value);
  const rekening = document.getElementById("rekening").value.trim();
  const bank = document.getElementById("bank").value;
  const hasil = document.getElementById("hasilTarikSaldo");

  if (!bank) {
    hasil.innerHTML = `<p style="color:red;">❌ Silakan pilih bank atau e-wallet.</p>`;
    return false;
  }

  const potongan = (bank === "BRI" || bank === "MANDIRI") ? 2500 : 0;
  const jumlahDiterima = jumlah - potongan;

  if (jumlah < 10000) {
    hasil.innerHTML = `<p style="color:red;">❌ Minimal tarik saldo adalah Rp10.000</p>`;
    return false;
  }

  if (jumlah > saldoToko) {
    hasil.innerHTML = `<p style="color:red;">❌ Saldo tidak mencukupi. Tersedia: Rp ${saldoToko.toLocaleString("id-ID")}</p>`;
    return false;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    hasil.innerHTML = `<p style="color:red;">❌ Silakan login terlebih dahulu.</p>`;
    return false;
  }

  const uid = user.uid;
  const db = firebase.firestore();

  try {
    // 🔍 Cek apakah ada penarikan yang masih menunggu
    const cekPending = await db.collection("tarik_saldo")
      .where("idToko", "==", idToko)
      .where("status", "==", "menunggu")
      .limit(1)
      .get();

    if (!cekPending.empty) {
      hasil.innerHTML = `<p style="color:red;">❌ Masih ada penarikan saldo yang belum diproses. Silakan tunggu dulu.</p>`;
      return false;
    }

    // ✅ Kirim permintaan tarik saldo
    await db.collection("tarik_saldo").add({
      idToko,
      uid,
      jumlah,
      rekening,
      bank,
      potongan,
      jumlahDiterima,
      status: "menunggu",
      waktu: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Kurangi saldo toko
    await db.collection("toko").doc(idToko).update({
      saldo: saldoToko - jumlah
    });

    hasil.innerHTML = `<p style="color:green;">✅ Permintaan tarik saldo berhasil dikirim.</p>`;
    event.target.reset();
    document.getElementById("jumlahDiterima").value = "";
  } catch (err) {
    hasil.innerHTML = `<p style="color:red;">❌ Gagal mengirim: ${err.message}</p>`;
  }

  return false;
}



async function lihatLogPesananSeller(idPesanan) {
  const modal = document.getElementById("modal-detail");
  const modalContent = modal ? modal.querySelector(".modal-content") : null;

  // Periksa apakah modal dan modalContent ada
  if (!modal || !modalContent) {
    console.error("Modal atau modal-content tidak ditemukan.");
    return;
  }

  modal.style.display = "flex"; // Tampilkan modal
  modalContent.innerHTML = `<p>⏳ Memuat data pesanan...</p>`;

  const db = firebase.firestore();

  try {
    // Ambil data dari pesanan_penjual berdasarkan idPesanan
    const pesananPenjualSnap = await db.collection("pesanan_penjual")
      .where("idPesanan", "==", idPesanan)
      .limit(1)
      .get();

    let daftarProdukHTML = `<p>Tidak ada produk.</p>`;
    let catatanPembeli = "-";
    let subtotalProduk = 0;
    let totalOngkir = 0;
    let metodePengiriman = "-";  // Variabel untuk metode pengiriman

    if (!pesananPenjualSnap.empty) {
      const pesanan = pesananPenjualSnap.docs[0].data();
      const produkList = pesanan.produk || [];
      catatanPembeli = pesanan.catatan || "-";
      metodePengiriman = pesanan.pengiriman || "-";  // Mengambil metode pengiriman

      // Menghitung subtotal produk
      if (produkList.length > 0) {
        daftarProdukHTML = "<ul style='padding-left:16px;'>";

        produkList.forEach((item, i) => {
          const nama = item.nama || "-";
          const qty = item.qty || 1;
          const harga = item.harga || 0;
          const total = harga * qty;
          subtotalProduk += total; // Menambahkan subtotal produk

          daftarProdukHTML += `
            <li style="margin-bottom: 5px;">
              <b>${i + 1}. ${nama}</b><br>
              <span style="font-size:14px;">x${qty} - Rp${total.toLocaleString("id-ID")}</span>
            </li>`;
        });
        daftarProdukHTML += "</ul>";
      }
      
      // Hitung total ongkir
      totalOngkir = produkList.reduce((sum, item) => sum + (item.ongkir || 0), 0);
    }

    // Tampilkan data di dalam modal
    modalContent.innerHTML = `
      <div style="font-family: 'Arial', sans-serif; padding: 10px; line-height: 1.4;">
        <h2 style="font-size: 20px; margin: 0;">🧾 Detail Pesanan</h2>
        <hr style="border: 1px solid #ddd; margin: 10px 0;">
        
        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${idPesanan}</p>
        
        <h3 style="margin: 10px 0; font-size: 16px;">📦 Daftar Produk:</h3>
        ${daftarProdukHTML}
        
        <h3 style="margin: 10px 0; font-size: 16px;">📝 Catatan Pembeli:</h3>
        <p style="font-size:14px;">${catatanPembeli}</p>

        <h3 style="margin: 10px 0; font-size: 16px;">💵 Subtotal Produk:</h3>
        <p style="font-size:14px;">Rp ${subtotalProduk.toLocaleString("id-ID")}</p>

        <h3 style="margin: 10px 0; font-size: 16px;">🚚 Total Ongkir:</h3>
        <p style="font-size:14px;">Rp ${totalOngkir.toLocaleString("id-ID")}</p>

        <h3 style="margin: 10px 0; font-size: 16px;">💳 Total Biaya:</h3>
        <p style="font-size:16px; font-weight: bold;">Rp ${(subtotalProduk + totalOngkir).toLocaleString("id-ID")}</p>

        <h3 style="margin: 10px 0; font-size: 16px;">🚚 Metode Pengiriman:</h3>
        <p style="font-size:14px; margin: 5px 0;">${metodePengiriman || "Tidak tersedia"}</p> <!-- Menampilkan metode pengiriman -->

        <div style="text-align:right; margin-top: 20px;">
          <button onclick="document.getElementById('modal-detail').style.display='none'" 
                  style="padding:6px 12px; background:#888; color:#fff; border:none; border-radius:6px; font-size:14px;">Tutup</button>
          <button onclick="printStruk('${idPesanan}')" 
                  style="padding:6px 12px; background:#4CAF50; color:#fff; border:none; border-radius:6px; font-size:14px;">🖨️ Print Struk</button>
        </div>
      </div>
    `;
  } catch (err) {
    modalContent.innerHTML = `<p style="color:red;">❌ Gagal memuat pesanan: ${err.message}</p>`;
  }
}




async function printStruk(idPesanan) {
  const db = firebase.firestore();
  const snapshot = await db.collection("pesanan_penjual")
    .where("idPesanan", "==", idPesanan)
    .limit(1)
    .get();

  if (snapshot.empty) {
    alert("Pesanan tidak ditemukan.");
    return;
  }

  const pesanan = snapshot.docs[0].data();
  const produkList = pesanan.produk || [];
  const catatanPembeli = pesanan.catatan || "-";
  let subtotalProduk = 0;
  let totalOngkir = 0;

  // Menyusun daftar produk dan menghitung subtotal produk serta ongkir
  let daftarProdukHTML = "";
  produkList.forEach((item, i) => {
    const nama = item.nama || "-";
    const qty = item.qty || 1;
    const harga = item.harga || 0;
    const total = harga * qty;
    subtotalProduk += total; // Menambahkan subtotal produk
    totalOngkir += item.ongkir || 0;

    daftarProdukHTML += `
      <div style="margin-bottom: 8px;">
        <b>${i + 1}. ${nama}</b><br>
        <span style="font-size:14px;">x${qty} - Rp${total.toLocaleString("id-ID")}</span>
      </div>`;
  });

  // Menghitung total biaya
  const diskon = pesanan.potongan || 0;
  const biayaLayanan = pesanan.biayaLayanan || 0;
  const totalBayar = subtotalProduk + totalOngkir + biayaLayanan - diskon;

  // Mendapatkan waktu timestamp saat pesanan dibuat
  const timestamp = pesanan.createdAt ? pesanan.createdAt.toDate() : new Date();
  const timestampFormatted = timestamp.toLocaleString("id-ID", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Mendapatkan nama toko dari koleksi 'toko'
  const idTokoUtama = produkList[0]?.idToko;
  const tokoDoc = await db.collection("toko").doc(idTokoUtama).get();
  const namaToko = tokoDoc.exists ? tokoDoc.data().namaToko : "Nama Toko Tidak Ditemukan";

  // Membuat konten struk yang akan dicetak
  const strukHTML = `
    <div style="font-family: 'Arial', sans-serif; width: 100%; padding: 10px; line-height: 1.6; font-size: 14px;">
      <h2 style="font-size: 22px; text-align: center; margin: 0;">VLCrave Express - ${namaToko}</h2>
      <hr style="border: 1px solid #ddd;">
      
      <p style="margin: 5px 0;"><strong>ID Pesanan:</strong> ${idPesanan}</p>
      <p style="margin: 5px 0;"><strong>Tanggal & Waktu:</strong> ${timestampFormatted}</p>
      <hr style="border: 1px solid #ddd;">
      
      <h3 style="margin: 10px 0;">Daftar Pesanan:</h3>
      <div style="padding-left: 20px;">
        ${daftarProdukHTML}
      </div>

      <h3 style="margin: 10px 0;">Catatan:</h3>
      <p>${catatanPembeli}</p>

      <h3 style="margin: 10px 0;">💵 Biaya:</h3>
      <p><strong>Subtotal Produk:</strong> Rp ${subtotalProduk.toLocaleString("id-ID")}</p>
      <p><strong>Biaya Layanan:</strong> Rp ${biayaLayanan.toLocaleString("id-ID")}</p>
      <p><strong>Biaya Ongkir:</strong> Rp ${totalOngkir.toLocaleString("id-ID")}</p>

      <h3 style="margin: 10px 0;">💳 Total Pembayaran:</h3>
      <p><strong>Rp ${totalBayar.toLocaleString("id-ID")}</strong></p>

      <h3 style="margin: 10px 0;">Metode Pembayaran:</h3>
      <p>${pesanan.metodePembayaran}</p>

      <h3 style="margin: 10px 0;">Pengiriman:</h3>
      <p>${pesanan.pengiriman}</p>

      <hr style="border: 1px solid #ddd;">
      <p style="font-size: 12px; color: #777; text-align: center;">- Terima Kasih sudah menggunakan VLCrave Express -</p>
    </div>
  `;

  // Membuka jendela baru dan menampilkan struk
  const printWindow = window.open('', '', 'width=600,height=400');
  printWindow.document.write(strukHTML);
  printWindow.document.close(); // Tutup dokumen agar siap dicetak
  printWindow.print(); // Cetak halaman
}




async function lihatDetailTransaksi(id) {
  const db = firebase.firestore();
  const docRef = db.collection("pesanan").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    alert("❌ Transaksi tidak ditemukan.");
    return;
  }

  // Buat modal jika belum ada
  let modal = document.getElementById("modal-detail");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-detail";
    modal.innerHTML = `<div class="modal-content"></div>`;
    document.body.appendChild(modal);
  }

  // Tambahkan CSS jika belum ada
  if (!document.getElementById("modal-style")) {
    const style = document.createElement("style");
    style.id = "modal-style";
    style.innerHTML = `
      #modal-detail {
        display: flex;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
      }
      #modal-detail .modal-content {
        background: #fff;
        padding: 20px 24px;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        font-family: "Segoe UI", sans-serif;
        animation: scaleIn 0.2s ease;
      }
      #modal-detail button {
        margin-top: 16px;
        padding: 8px 16px;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s ease;
      }
      #modal-detail button:hover {
        background-color: #c0392b;
      }
      #modal-detail ul {
        padding-left: 18px;
        margin-top: 8px;
      }
      #modal-detail ul li {
        margin-bottom: 6px;
        line-height: 1.4;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  const content = modal.querySelector(".modal-content");
  if (!content) return alert("❌ Kontainer modal tidak ditemukan.");

  const data = docSnap.data();
  const subtotal = data.subtotalProduk || 0;
  const ongkir = data.totalOngkir || 0;
  const biayaLayanan = Math.round((subtotal + ongkir) * 0.01);

  const produkList = Array.isArray(data.produk) ? data.produk : [];

 const daftarProduk = produkList.length
  ? produkList.map((p, i) => {
      const nama = p.nama || "Produk Tidak Dikenal";
      const harga = p.harga || 0;
      const jumlah = p.jumlah || 1;
      const totalItem = harga * jumlah;
      return `<li>${i + 1}. ${nama} - Rp${harga.toLocaleString("id-ID")} x ${jumlah} = <strong>Rp${totalItem.toLocaleString("id-ID")}</strong></li>`;
    }).join("")
  : "<li>(Tidak ada produk)</li>";


  content.innerHTML = `
    <h3>📦 Detail Transaksi</h3>
    <p><strong>Order ID:</strong> ${id}</p>
    <p><strong>Subtotal Produk:</strong> Rp${subtotal.toLocaleString("id-ID")}</p>
    <p><strong>Total Ongkir:</strong> Rp${ongkir.toLocaleString("id-ID")}</p>
    <p><strong>Biaya Layanan (1%):</strong> Rp${biayaLayanan.toLocaleString("id-ID")}</p>
    <p><strong>Daftar Produk:</strong></p>
    <ul>${daftarProduk}</ul>
    <button onclick="tutupModal()">❌ Tutup</button>
  `;

  modal.style.display = "flex";
}



function tutupModal() {
  document.getElementById("modal-detail").style.display = "none";
}

async function renderTabelRiwayat(data, container, statusFilter = "Semua") {
  const filtered = statusFilter === "Semua"
    ? data
    : data.filter(d => (d.status || "").toLowerCase() === statusFilter.toLowerCase());

  let cards = filtered.map(item => `
    <div class="card-admin-riwayat">
      <p><strong>ID Pesanan:</strong> ${item.id ?? "-"}</p>
      <p><strong>Waktu:</strong> ${item.waktu ?? "-"}</p>
      <p><strong>Nama Toko:</strong> ${item.namaToko ?? "-"}</p>
      <p><strong>Total:</strong> Rp${(item.total ?? 0).toLocaleString("id-ID")}</p>
      <p><strong>Status:</strong> ${item.status ?? "-"}</p>
    </div>
  `).join("");

  if (!cards) {
    cards = `<p style="text-align:center;">Tidak ada data transaksi.</p>`;
  }

  container.innerHTML = `
    <div class="riwayat-transaksi-admin">
      <h2>📄 Riwayat Transaksi Semua Toko</h2>
      <div style="margin-bottom:15px;">
        <label><strong>Filter Status:</strong></label>
        <select id="filter-status">
          <option value="Semua">Semua</option>
          <option value="Pending">Pending</option>
          <option value="Diproses">Diproses</option>
          <option value="Menuju Customer">Menuju Customer</option>
          <option value="Selesai">Selesai</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
      </div>
      <div id="card-list-riwayat">
        ${cards}
      </div>
    </div>
  `;

  document.getElementById("filter-status").value = statusFilter;
  document.getElementById("filter-status").onchange = () => {
    renderTabelRiwayat(data, container, document.getElementById("filter-status").value);
  };
}



async function nonaktifkanPenjualSementara(idToko, idLaporan, inputId) {
  const menitInput = document.getElementById(inputId);
  if (!menitInput) {
    alert("❌ Input durasi tidak ditemukan.");
    return;
  }

  const menit = parseInt(minutInput.value);
  if (isNaN(menit) || menit <= 0) {
    alert("❌ Durasi tidak valid.");
    return;
  }

  const konfirmasi = confirm(`⚠️ Nonaktifkan toko selama ${menit} menit?`);
  if (!konfirmasi) return;

  const db = firebase.firestore();
  const expired = new Date(Date.now() + menit * 60000);

  try {
    await db.collection("toko").doc(idToko).update({
      blokirSementara: firebase.firestore.Timestamp.fromDate(expired)
    });

    alert(`✅ Toko dinonaktifkan hingga ${expired.toLocaleTimeString("id-ID")}`);
    await db.collection("laporan_penjual").doc(idLaporan).delete();
    loadContent("laporan-seller-admin");
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menonaktifkan toko.");
  }
}

async function hapusLaporanPenjual(idLaporan, elementRef) {
  const konfirmasi = confirm("🗑️ Hapus laporan ini?");
  if (!konfirmasi) return;

  const db = firebase.firestore();
  try {
    await db.collection("laporan_penjual").doc(idLaporan).delete();
    alert("✅ Laporan dihapus.");

    // Hapus elemen dari DOM
    const card = elementRef.closest(".laporan-card");
    if (card) card.remove();

  } catch (err) {
    console.error(err);
    alert("❌ Gagal menghapus laporan.");
  }
}




async function simpanVoucher(event) {
  event.preventDefault();
  const db = firebase.firestore();

  const id = document.getElementById("voucher-id").value;
  const kode = document.getElementById("voucher-kode").value.trim().toUpperCase();
  const tipe = document.getElementById("voucher-tipe").value;
  const tipePotongan = document.getElementById("voucher-tipe-potongan").value;
  const potongan = parseInt(document.getElementById("voucher-potongan").value);
  const minimal = parseInt(document.getElementById("voucher-minimal").value);
  const kuota = parseInt(document.getElementById("voucher-kuota").value);
  const expiredInput = document.getElementById("voucher-expired").value;

  if (!expiredInput) {
    alert("❌ Tanggal expired tidak boleh kosong.");
    return;
  }

  const expired = new Date(expiredInput);

  const data = {
    kode,
    tipe,
    tipePotongan,
    potongan,
    minimal,
    kuota,
    expired: firebase.firestore.Timestamp.fromDate(expired)
  };

  try {
    if (id) {
      await db.collection("voucher").doc(id).update(data);
      alert("✅ Voucher diperbarui.");
    } else {
      await db.collection("voucher").add({ ...data, digunakanOleh: [] });
      alert("✅ Voucher ditambahkan.");
    }

    loadContent("admin-voucher");
  } catch (err) {
    console.error("Gagal menyimpan voucher:", err);
    alert("❌ Gagal menyimpan voucher.");
  }
}


async function editVoucher(id) {
  const db = firebase.firestore();
  const doc = await db.collection("voucher").doc(id).get();
  if (!doc.exists) return alert("❌ Voucher tidak ditemukan.");
  const v = doc.data();

  document.getElementById("voucher-id").value = id;
  document.getElementById("voucher-kode").value = v.kode || "";
  document.getElementById("voucher-tipe").value = v.tipe || "nominal";
  document.getElementById("voucher-potongan").value = v.potongan || 0;
  document.getElementById("voucher-minimal").value = v.minimal || 0;
  document.getElementById("voucher-kuota").value = v.kuota || 0;
  document.getElementById("voucher-expired").value = v.expired?.toDate().toISOString().slice(0, 10) || "";

  // Set tipe potongan (produk / ongkir)
  document.getElementById("voucher-tipe-potongan").value = v.tipePotongan || "produk";
}


async function hapusVoucher(id) {
  if (!confirm("❌ Hapus voucher ini?")) return;
  const db = firebase.firestore();
  await db.collection("voucher").doc(id).delete();
  alert("✅ Voucher dihapus.");
  loadContent("admin-voucher");
}

async function renderChatDriver({ idPesanan, idDriver, idCustomer, namaDriver = "Anda", namaCustomer = "Customer" }) {
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user || user.uid !== idDriver) return alert("❌ Anda tidak memiliki akses.");

  const driverSnap = await db.collection("pesanan_driver")
    .where("idPesanan", "==", idPesanan)
    .where("idDriver", "==", idDriver)
    .limit(1).get();

  if (driverSnap.empty) return alert("❌ Pesanan tidak ditemukan atau bukan milik Anda.");

  const driverData = driverSnap.docs[0].data();
  const statusDriver = driverData.status || "-";

  const statusTemplates = {
    "Menuju Resto": "Saya sedang menuju ke restoran.",
    "Menunggu Pesanan": "Saya sudah tiba di resto dan sedang menunggu pesanan.",
    "Pickup Pesanan": "Pesanan sudah saya ambil dan saya segera berangkat.",
    "Menuju Customer": "Saya sedang dalam perjalanan menuju lokasi Anda.",
    "Pesanan Diterima": "Pesanan berhasil dikirim, terima kasih!"
  };

  const templatePesan = statusTemplates[statusDriver] || "";

  const modal = document.getElementById("modal-detail");
  const container = modal.querySelector(".modal-content");

  container.innerHTML = `
    <div class="chat-header-chat" style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">💬 Chat dengan ${namaCustomer}</h2>
      <button onclick="document.getElementById('modal-detail').style.display='none'" style="font-size:18px;">❌</button>
    </div>

    <div style="margin:5px 0;"><strong>Order ID:</strong> ${idPesanan}</div>
    <div class="chat-info-chat" style="margin-bottom:10px; font-size:14px;">
      <p><strong>Anda:</strong> ${namaDriver}</p>
      <p><strong>Customer:</strong> ${namaCustomer}</p>
      <p><strong>Status Lokasi:</strong> ${statusDriver}</p>
    </div>

    <div id="chat-box" class="chat-box-chat" style="max-height:300px; overflow-y:auto; padding:10px; border:1px solid #ccc; border-radius:8px; background:#f9f9f9; margin-bottom:10px;"></div>

    <div class="chat-form-chat" style="display:flex; gap:8px; margin-bottom:10px;">
      <input type="text" id="chat-input" placeholder="Ketik pesan..." style="flex:1; padding:6px 10px; border-radius:6px; border:1px solid #ccc;" />
      <button onclick="kirimPesanDriver('${idPesanan}', '${idDriver}', '${idCustomer}', '${namaDriver}')">Kirim</button>
    </div>

    <div class="chat-templates-chat">
      <p><strong>📋 Template Cepat:</strong></p>
      <div class="template-buttons-chat" style="display:flex; flex-wrap:wrap; gap:6px;">
        <button class="mini-btn-chat" onclick="kirimPesanTemplate('${templatePesan}', '${idPesanan}', '${idDriver}', '${idCustomer}', '${namaDriver}')">🧭 Status</button>
        <button class="mini-btn-chat" onclick="kirimPesanTemplate('Mohon ditunggu sebentar ya.', '${idPesanan}', '${idDriver}', '${idCustomer}', '${namaDriver}')">⏳ Tunggu</button>
        <button class="mini-btn-chat" onclick="kirimPesanTemplate('Saya sudah tiba di lokasi Anda.', '${idPesanan}', '${idDriver}', '${idCustomer}', '${namaDriver}')">📍 Sampai</button>
        <button class="mini-btn-chat" onclick="kirimPesanTemplate('Lokasi sudah sesuai titik ya?', '${idPesanan}', '${idDriver}', '${idCustomer}', '${namaDriver}')">📍 Titik</button>
      </div>
    </div>
  `;

  modal.style.display = "flex";

  const chatBox = container.querySelector("#chat-box");

  db.collection("chat_driver")
    .doc(idPesanan)
    .collection("pesan")
    .orderBy("waktu", "asc")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";

      if (snapshot.empty) {
        chatBox.innerHTML = "<p style='text-align:center; color:gray;'>Belum ada pesan.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const isSenderDriver = data.dari === idDriver;
        const posisi = isSenderDriver ? "flex-end" : "flex-start";
        const bgColor = isSenderDriver ? "#d4fcd3" : "#e6e6e6";
        const waktu = data.waktu?.toDate?.() || new Date();

        const bubble = document.createElement("div");
        bubble.style = `
          align-self: ${posisi};
          background: ${bgColor};
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 8px;
          max-width: 70%;
        `;
        bubble.innerHTML = `
          <div style="font-weight:bold; margin-bottom:3px;">${isSenderDriver ? "Anda" : namaCustomer}</div>
          <div>${escapeHTML(data.pesan)}</div>
          <div style="text-align:right; font-size:11px; color:#777;">${waktu.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        chatBox.appendChild(bubble);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

async function kirimPesanTemplate(teks, idPesanan, idDriver, idCustomer, namaDriver) {
  if (!teks) return;

  const db = firebase.firestore();
  const pesanRef = db.collection("chat_driver").doc(idPesanan).collection("pesan");

  try {
    await pesanRef.add({
      dari: idDriver,
      ke: idCustomer,
      nama: namaDriver,
      pesan: teks,
      waktu: new Date()
    });
  } catch (err) {
    console.error("Gagal kirim template:", err);
    alert("❌ Gagal mengirim template. Coba lagi.");
  }
}




// Fungsi bantu untuk isi input chat
function isiPesan(teks) {
  const input = document.getElementById("chat-input");
  if (input) input.value = teks;
}

function isiPesanDanKirim(teks, idPesanan, idDriver, idCustomer, namaDriver) {
  if (!firebase.auth().currentUser) return;

  const db = firebase.firestore();

  db.collection("chat_driver")
    .doc(idPesanan)
    .collection("pesan")
    .add({
      dari: idDriver,
      ke: idCustomer,
      pesan: teks,
      waktu: firebase.firestore.FieldValue.serverTimestamp()
    });
}


async function kirimPesanTemplate(teks, idPesanan, idDriver, idCustomer, namaDriver) {
  if (!teks) return;

  const db = firebase.firestore();
  const pesanRef = db.collection("chat_driver").doc(idPesanan).collection("pesan");

  try {
    await pesanRef.add({
      dari: idDriver,
      ke: idCustomer,
      nama: namaDriver,
      pesan: teks,
      waktu: new Date()
    });
  } catch (err) {
    console.error("Gagal kirim template:", err);
    alert("❌ Gagal mengirim template. Coba lagi.");
  }
}


function escapeHTML(str) {
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[match]);
}





function laporkanDriver(idPesanan, idDriver) {
  const modal = document.getElementById("modal-detail");
  const container = modal.querySelector(".modal-content");

  container.innerHTML = `
    <div class="report-driver-header" style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">⚠️ Laporkan Driver</h2>
      <button onclick="document.getElementById('modal-detail').style.display='none'" style="font-size:18px;">❌</button>
    </div>

    <div class="report-driver-info">
      <p><strong>ID Pesanan:</strong> ${idPesanan}</p>
      <p><strong>ID Driver:</strong> ${idDriver}</p>
    </div>

    <textarea id="report-driver-alasan" class="report-driver-textarea" placeholder="Masukkan alasan laporan Anda..."></textarea>

    <div class="report-driver-actions">
      <button class="report-driver-btn" onclick="kirimLaporanDriver('${idPesanan}', '${idDriver}')">Kirim Laporan</button>
    </div>
  `;

  modal.style.display = "flex";
}

async function kirimLaporanDriver(idPesanan, idDriver) {
  const textarea = document.getElementById("report-driver-alasan");
  if (!textarea) return alert("❌ Terjadi kesalahan pada form laporan.");

  const alasan = textarea.value.trim();
  if (!alasan) return alert("⚠️ Alasan wajib diisi.");

  try {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    if (!user) return alert("❌ Anda belum login.");

    const userId = user.uid;

    // 🔍 Cek apakah user sudah pernah melapor untuk pesanan ini
    const existingReport = await db.collection("laporan_driver")
      .where("idPesanan", "==", idPesanan)
      .where("idPelapor", "==", userId)
      .limit(1)
      .get();

    if (!existingReport.empty) {
      return alert("⚠️ Anda sudah melaporkan driver untuk pesanan ini sebelumnya.");
    }

    // 🚀 Kirim laporan baru
    await db.collection("laporan_driver").add({
      idPesanan,
      idDriver,
      idPelapor: userId,
      alasan,
      waktu: Date.now()
    });

    document.getElementById("modal-detail").style.display = "none";
    alert("✅ Laporan telah dikirim. Terima kasih atas kontribusinya.");
  } catch (err) {
    console.error("Gagal mengirim laporan:", err);
    alert("❌ Gagal mengirim laporan. Silakan coba lagi nanti.");
  }
}


function bukaModalPembatalan(idPesanan) {
  const modal = document.getElementById("modal-detail");
  const container = modal.querySelector(".modal-content");

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">❌ Batalkan Pesanan</h2>
      <button onclick="document.getElementById('modal-detail').style.display='none'" style="font-size:18px;">✖️</button>
    </div>

    <p><strong>ID Pesanan:</strong> ${idPesanan}</p>

    <p>Silakan tuliskan alasan Anda membatalkan pesanan ini:</p>
    <textarea id="alasanPembatalan" placeholder="Contoh: Salah alamat, berubah pikiran, dll" style="width:100%;height:80px;padding:8px;border-radius:6px;border:1px solid #ccc;"></textarea>

    <div style="margin-top:12px;text-align:right;">
      <button onclick="batalkanPesananDenganAlasan('${idPesanan}')" style="padding:6px 14px;border:none;background:#dc3545;color:#fff;border-radius:6px;cursor:pointer;">Konfirmasi Pembatalan</button>
    </div>
  `;

  modal.style.display = "flex";
}


async function batalkanPesananDenganAlasan(idPesanan) {
  const alasan = document.getElementById("alasanPembatalan").value.trim();
  if (!alasan) return alert("❌ Alasan pembatalan wajib diisi.");

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Anda belum login.");

  try {
    const pesananRef = db.collection("pesanan").doc(idPesanan);
    const pesananDoc = await pesananRef.get();
    if (!pesananDoc.exists) throw new Error("❌ Data pesanan tidak ditemukan.");

    const dataPesanan = pesananDoc.data();
    const waktuSekarang = new Date();

    // ✅ 1. Update status dan alasan di koleksi pesanan utama
    await pesananRef.update({
      status: "Dibatalkan",
      alasanPembatalan: alasan,
      waktuDibatalkan: firebase.firestore.FieldValue.serverTimestamp(),
      stepsLog: firebase.firestore.FieldValue.arrayUnion({
        status: "Dibatalkan oleh pengguna",
        alasan: alasan,
        waktu: waktuSekarang
      })
    });

    // ✅ 2. Update juga ke koleksi pesanan_penjual
    const penjualSnapshot = await db.collection("pesanan_penjual")
      .where("idPesanan", "==", idPesanan)
      .limit(1)
      .get();

    if (!penjualSnapshot.empty) {
      const docPenjual = penjualSnapshot.docs[0];
      const penjualId = docPenjual.id;
      const penjualData = docPenjual.data();
      const idToko = penjualData.idToko;

      await db.collection("pesanan_penjual").doc(penjualId).update({
        status: "Dibatalkan",
        alasanPembatalan: alasan // ✅ Tambahkan alasan ke dokumen penjual
      });

      // Ambil nama toko untuk pesan chat otomatis
      let namaToko = "Seller";
      try {
        const tokoDoc = await db.collection("toko").doc(idToko).get();
        if (tokoDoc.exists) {
          namaToko = tokoDoc.data().namaToko || "Seller";
        }
      } catch (e) {
        console.warn("⚠️ Gagal mengambil data namaToko:", e.message);
      }

      // Kirim chat otomatis ke seller
      await db.collection("chat_seller").doc(idPesanan).collection("pesan").add({
        dari: user.uid,
        ke: idToko,
        nama: "System",
        pesan: `❌ Pesanan dibatalkan oleh pelanggan. Alasan: ${alasan}`,
        waktu: waktuSekarang
      });
    }

    // ✅ Tutup modal dan refresh riwayat
    document.getElementById("modal-detail").style.display = "none";
    alert("✅ Pesanan berhasil dibatalkan.");
    renderRiwayat();

  } catch (err) {
    console.error("Gagal membatalkan pesanan:", err);
    alert("❌ Gagal membatalkan pesanan.");
  }
}




async function kirimPesanChat(idPesanan, idDriver, idCustomer) {
  const input = document.getElementById("chat-input");
  const pesan = input.value.trim();
  if (!pesan) return;

  const db = firebase.firestore();
  const waktu = Date.now();

  const data = {
    sender: "driver",
    pesan,
    waktu
  };

  await db.collection("chat_pesanan").doc(idPesanan).collection("pesan").add(data);
  input.value = "";
  renderChatDriver({ idPesanan, idDriver, idCustomer }); // Refresh chat
}

function kirimPesanCustomer(idPesanan, idCustomer, idDriver, namaCustomer) {
  const input = document.getElementById("chat-input-customer");
  const teks = input.value.trim();
  if (!teks) return;

  firebase.firestore()
    .collection("chat_driver")
    .doc(idPesanan)
    .collection("pesan")
    .add({
      dari: idCustomer,
      ke: idDriver,
      nama: namaCustomer,
      pesan: teks,
      waktu: new Date()
    });

  input.value = "";
}

function kirimPesanTemplateCustomer(teks, idPesanan, idCustomer, idDriver, namaCustomer) {
  firebase.firestore()
    .collection("chat_driver")
    .doc(idPesanan)
    .collection("pesan")
    .add({
      dari: idCustomer,
      ke: idDriver,
      nama: namaCustomer,
      pesan: teks,
      waktu: new Date()
    });
}


function isiPesan(teks) {
  const input = document.getElementById("chat-input-customer");
  if (input) input.value = teks;
}

// Mode 2: Langsung kirim template pesan ke database
function kirimPesanTemplateCustomer(teks, idPesanan, idCustomer, idDriver, namaCustomer) {
  const db = firebase.firestore();
  const pesanRef = db.collection("chat_driver").doc(idPesanan).collection("pesan");

  pesanRef.add({
    dari: idCustomer,
    ke: idDriver,
    nama: namaCustomer,
    pesan: teks,
    waktu: new Date()
  });
}

// Pesan dari input manual
async function kirimPesanCustomer(idPesanan, idCustomer, idDriver, namaCustomer) {
  const input = document.getElementById("chat-input-customer");
  const isiPesan = input.value.trim();
  if (!isiPesan) return;

  const db = firebase.firestore();
  const pesanRef = db.collection("chat_driver").doc(idPesanan).collection("pesan");

  await pesanRef.add({
    dari: idCustomer,
    ke: idDriver,
    nama: namaCustomer,
    pesan: isiPesan,
    waktu: new Date()
  });

  input.value = "";
}

async function formRatingRestoDriver(idPesanan) {
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return alert("Silakan login terlebih dahulu.");

  const pesananRef = db.collection("pesanan").doc(idPesanan);
  const pesananDoc = await pesananRef.get();
  if (!pesananDoc.exists) return alert("❌ Pesanan tidak ditemukan.");

  const data = pesananDoc.data();
  if (data.ratingDiberikan) return alert("✅ Kamu sudah memberi rating.");

  const userDoc = await db.collection("users").doc(user.uid).get();
  const namaUser = userDoc.exists ? userDoc.data().nama || "Pengguna" : "Pengguna";

  const idResto = data.idToko || "-";
  const idDriver = data.idDriver || "-";

  // Ambil semua produk dari pesanan (array of objek)
  const produkDibeli = Array.isArray(data.produk) ? data.produk : [];

  let listProdukHTML = "";
  for (const item of produkDibeli) {
    if (item.namaProduk) {
      listProdukHTML += `<li>🍽️ ${item.namaProduk}</li>`;
    }
  }

  const popup = document.getElementById("popup-greeting");
  const overlay = document.getElementById("popup-overlay");

  popup.innerHTML = `
    <div class="popup-container-rating">
      <div class="popup-header-rating">
        <span class="popup-close-rating" onclick="tutupPopup()">✕</span>
        <h3>Beri Rating Pesanan</h3>
      </div>

      <div class="rating-section">
        <p><strong>Rating Driver:</strong></p>
        <div class="star-container" id="rating-driver"></div>
        <textarea id="ulasan-driver" placeholder="Ulasan untuk driver..." rows="2"></textarea>
      </div>

      <div class="rating-section">
        <p><strong>Rating Makanan:</strong></p>
        <div class="star-container" id="rating-resto"></div>
        <textarea id="ulasan-resto" placeholder="Ulasan makanan atau resto..." rows="2"></textarea>
        <ul style="padding-left: 20px; margin-top: 5px; color: #444;">
          ${listProdukHTML}
        </ul>
      </div>

      <button class="btn-submit-rating" onclick="kirimRating('${idPesanan}', '${idDriver}', '${idResto}', '${namaUser}')">Kirim</button>
    </div>
  `;

  popup.style.display = "block";
  overlay.style.display = "block";
  document.body.classList.add("popup-active");

  renderBintang("rating-driver");
  renderBintang("rating-resto");
}


function renderBintang(divId) {
  const container = document.getElementById(divId);
  if (!container) return;
  container.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const bintang = document.createElement("span");
    bintang.textContent = "☆";
    bintang.classList.add("star");
    bintang.dataset.value = i;

    bintang.addEventListener("click", () => {
      const semua = container.querySelectorAll(".star");
      semua.forEach((el, idx) => {
        el.textContent = idx < i ? "★" : "☆";
      });
      container.dataset.rating = i;
    });

    container.appendChild(bintang);
  }
}

async function kirimRating(idPesanan, idDriver, uidToko, namaUser) {
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return alert("Silakan login terlebih dahulu.");

  const pesananRef = db.collection("pesanan").doc(idPesanan);
  const pesananDoc = await pesananRef.get();
  if (!pesananDoc.exists) return alert("❌ Data pesanan tidak ditemukan.");
  const data = pesananDoc.data();

  if (data.ratingDiberikan) return alert("✅ Kamu sudah memberi rating.");

  const ratingDriver = parseInt(document.getElementById("rating-driver").dataset.rating || 0);
  const ratingResto = parseInt(document.getElementById("rating-resto").dataset.rating || 0);
  const ulasanDriver = document.getElementById("ulasan-driver").value.trim();
  const ulasanResto = document.getElementById("ulasan-resto").value.trim();

  if (!ratingDriver || !ratingResto) return alert("❌ Harap beri rating pada kedua sisi.");

  // Simpan rating ke driver
  if (idDriver && idDriver !== "-") {
    await db.collection("driver").doc(idDriver).collection("rating").add({
      userId: user.uid,
      namaUser,
      rating: ratingDriver,
      ulasan: ulasanDriver,
      waktu: Date.now()
    });
  }

  // Simpan rating ke resto (UID toko)
  if (uidToko && uidToko !== "-") {
    await db.collection("toko").doc(uidToko).collection("rating").add({
      userId: user.uid,
      namaUser,
      rating: ratingResto,
      ulasan: ulasanResto,
      waktu: Date.now()
    });
  }

  // Simpan rating untuk setiap produk yang dibeli
  for (const item of data.produk || []) {
    const idProduk = item.id;
    if (!idProduk) continue;

    await db.collection("produk").doc(idProduk).collection("rating").add({
      userId: user.uid,
      namaUser,
      rating: ratingResto,
      ulasan: ulasanResto,
      waktu: Date.now()
    });
  }

  // Update pesanan agar tidak bisa rating lagi
  await pesananRef.update({ ratingDiberikan: true });

  alert("✅ Terima kasih! Rating berhasil dikirim.");
  tutupPopup();
}









async function konfirmasiWithdraw(docId, idToko, nominal) {
  const db = firebase.firestore();
  const konfirmasi = confirm("Yakin ingin menyetujui permintaan withdraw ini?");
  if (!konfirmasi) return;

  try {
    await db.collection("withdraw_request").doc(docId).update({
      status: "Selesai"
    });

    alert("✅ Permintaan withdraw disetujui.");
    loadPage("permintaan-withdraw");
  } catch (e) {
    console.error("❌ Gagal konfirmasi withdraw:", e);
    alert("❌ Gagal menyetujui permintaan.");
  }
}

async function tolakWithdraw(docId) {
  const alasan = prompt("Masukkan alasan penolakan:");
  if (!alasan) return;

  try {
    await firebase.firestore().collection("withdraw_request").doc(docId).update({
      status: "Ditolak",
      alasan
    });

    alert("❌ Permintaan withdraw ditolak.");
    loadPage("permintaan-withdraw");
  } catch (e) {
    console.error("❌ Gagal tolak withdraw:", e);
    alert("❌ Gagal menolak permintaan.");
  }
}



async function lihatLogPesananSeller(idPesanan) {
  const modal = document.getElementById("modal-detail");
  const modalContent = modal ? modal.querySelector(".modal-content") : null;

  // Periksa apakah modal dan modalContent ada
  if (!modal || !modalContent) {
    console.error("Modal atau modal-content tidak ditemukan.");
    return;
  }

  modal.style.display = "flex"; // Tampilkan modal
  modalContent.innerHTML = `<p>⏳ Memuat data pesanan...</p>`;

  const db = firebase.firestore();

  try {
    // Ambil data dari pesanan_penjual berdasarkan idPesanan
    const pesananPenjualSnap = await db.collection("pesanan_penjual")
      .where("idPesanan", "==", idPesanan)
      .limit(1)
      .get();

    let daftarProdukHTML = `<p>Tidak ada produk.</p>`;
    let catatanPembeli = "-";
    let subtotalProduk = 0;
    let totalOngkir = 0;
    let metodePengiriman = "-";  // Variabel untuk metode pengiriman

    if (!pesananPenjualSnap.empty) {
      const pesanan = pesananPenjualSnap.docs[0].data();
      const produkList = pesanan.produk || [];
      catatanPembeli = pesanan.catatan || "-";
      metodePengiriman = pesanan.pengiriman || "-";  // Mengambil metode pengiriman

      // Menghitung subtotal produk
      if (produkList.length > 0) {
        daftarProdukHTML = "<ul style='padding-left:16px;'>";

        produkList.forEach((item, i) => {
          const nama = item.nama || "-";
          const qty = item.qty || 1;
          const harga = item.harga || 0;
          const total = harga * qty;
          subtotalProduk += total; // Menambahkan subtotal produk

          daftarProdukHTML += `
            <li style="margin-bottom: 5px;">
              <b>${i + 1}. ${nama}</b><br>
              <span style="font-size:14px;">x${qty} - Rp${total.toLocaleString("id-ID")}</span>
            </li>`;
        });
        daftarProdukHTML += "</ul>";
      }
      
      // Hitung total ongkir
      totalOngkir = produkList.reduce((sum, item) => sum + (item.ongkir || 0), 0);
    }

    // Tampilkan data di dalam modal
    modalContent.innerHTML = `
      <div style="font-family: 'Arial', sans-serif; padding: 10px; line-height: 1.4;">
        <h2 style="font-size: 20px; margin: 0;">🧾 Detail Pesanan</h2>
        <hr style="border: 1px solid #ddd; margin: 10px 0;">
        
        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${idPesanan}</p>
        
        <h3 style="margin: 10px 0; font-size: 16px;">📦 Daftar Produk:</h3>
        ${daftarProdukHTML}
        
        <h3 style="margin: 10px 0; font-size: 16px;">📝 Catatan Pembeli:</h3>
        <p style="font-size:14px;">${catatanPembeli}</p>

        <h3 style="margin: 10px 0; font-size: 16px;">💵 Subtotal Produk:</h3>
        <p style="font-size:14px;">Rp ${subtotalProduk.toLocaleString("id-ID")}</p>

        <h3 style="margin: 10px 0; font-size: 16px;">🚚 Total Ongkir:</h3>
        <p style="font-size:14px;">Rp ${totalOngkir.toLocaleString("id-ID")}</p>

        <h3 style="margin: 10px 0; font-size: 16px;">💳 Total Biaya:</h3>
        <p style="font-size:16px; font-weight: bold;">Rp ${(subtotalProduk + totalOngkir).toLocaleString("id-ID")}</p>

        <h3 style="margin: 10px 0; font-size: 16px;">🚚 Metode Pengiriman:</h3>
        <p style="font-size:14px; margin: 5px 0;">${metodePengiriman || "Tidak tersedia"}</p> <!-- Menampilkan metode pengiriman -->

        <div style="text-align:right; margin-top: 20px;">
          <button onclick="document.getElementById('modal-detail').style.display='none'" 
                  style="padding:6px 12px; background:#888; color:#fff; border:none; border-radius:6px; font-size:14px;">Tutup</button>
          <button onclick="printStruk('${idPesanan}')" 
                  style="padding:6px 12px; background:#4CAF50; color:#fff; border:none; border-radius:6px; font-size:14px;">🖨️ Print Struk</button>
        </div>
      </div>
    `;
  } catch (err) {
    modalContent.innerHTML = `<p style="color:red;">❌ Gagal memuat pesanan: ${err.message}</p>`;
  }
}


async function renderTabelRiwayat(data, container, statusFilter = "Semua") {
  const filtered = statusFilter === "Semua"
    ? data
    : data.filter(d => (d.status || "").toLowerCase() === statusFilter.toLowerCase());

  let cards = "";
  for (const item of filtered) {
    cards += `
      <div class="riwayat-card-riwayatseller-admin">
        <div><strong>ID:</strong> ${item.id}</div>
        <div><strong>Waktu:</strong> ${item.waktu}</div>
        <div><strong>Nama Toko:</strong> ${item.namaToko}</div>
        <div><strong>Total:</strong> Rp${item.total.toLocaleString("id-ID")}</div>
        <div><strong>Status:</strong> ${item.status}</div>
        <div class="card-actions-riwayatseller-admin">
          <button class="btn-riwayat-riwayatseller-admin" onclick="lihatLogPesananSeller('${item.id}')">🔍 Log</button>
          <button class="btn-riwayat-riwayatseller-admin btn-delete" onclick="hapusPesananAdmin('${item.id}')">🗑️ Hapus</button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="riwayat-container-riwayatseller-admin">
      <h2>📄 Riwayat Transaksi Semua Toko</h2>

      <div style="margin-bottom: 16px;">
        <label for="filter-status"><strong>Filter Status:</strong></label>
        <select id="filter-status" style="margin-left: 8px; padding: 4px 8px; border-radius: 6px;">
          <option value="Semua">Semua</option>
          <option value="Pending">Pending</option>
          <option value="Diproses">Diproses</option>
          <option value="Menuju Customer">Menuju Customer</option>
          <option value="Selesai">Selesai</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
      </div>

      <div class="riwayat-card-list-riwayatseller-admin">
        ${cards || `<p style="text-align:center;">Tidak ada data.</p>`}
      </div>
    </div>
  `;

  document.getElementById("filter-status").value = statusFilter;
  document.getElementById("filter-status").addEventListener("change", (e) => {
    renderTabelRiwayat(data, container, e.target.value);
  });
}


async function hapusPesananAdmin(idPesanan) {
  const konfirmasi = confirm(`Yakin ingin menghapus pesanan dengan ID ${idPesanan}?`);
  if (!konfirmasi) return;

  const db = firebase.firestore();

  try {
    // Hapus dari koleksi utama
    await db.collection("pesanan").doc(idPesanan).delete();

    // Opsional: hapus juga data terkait jika ada (driver, penjual, review)
    await Promise.all([
      db.collection("pesanan_driver")
        .where("idPesanan", "==", idPesanan)
        .get()
        .then(snapshot => snapshot.forEach(doc => doc.ref.delete())),

      db.collection("pesanan_penjual")
        .where("idPesanan", "==", idPesanan)
        .get()
        .then(snapshot => snapshot.forEach(doc => doc.ref.delete())),

      db.collection("review_seller")
        .where("idPesanan", "==", idPesanan)
        .get()
        .then(snapshot => snapshot.forEach(doc => doc.ref.delete())),
    ]);

    alert("✅ Pesanan berhasil dihapus.");

    // Hapus elemen pesanan dari DOM tanpa refresh halaman
    const pesananCard = document.getElementById(`pesanan-card-${idPesanan}`);
    if (pesananCard) {
      pesananCard.remove(); // Menghapus elemen pesanan yang terhapus dari tampilan
    }

  } catch (error) {
    console.error("Gagal menghapus pesanan:", error);
    alert("❌ Gagal menghapus pesanan.");
  }
}





async function laporkanPesananSeller(idPesanan) {
  const alasan = prompt("Jelaskan laporan permasalahanmu:");
  if (!alasan || alasan.length < 5) return alert("⚠️ Alasan terlalu pendek.");

  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Harap login terlebih dahulu.");

  const db = firebase.firestore();

  try {
    const pesananSnap = await db.collection("pesanan_penjual")
      .where("idPesanan", "==", idPesanan)
      .limit(1)
      .get();

    if (pesananSnap.empty) return alert("❌ Data pesanan tidak ditemukan.");

    const data = pesananSnap.docs[0].data();
    const namaToko = data.namaToko || "-";
    const idToko = data.idToko || "-";
    const waktu = new Date().toLocaleString("id-ID");

    await db.collection("laporan_driver").add({
      idPesanan,
      idToko,
      namaToko,
      alasan,
      dilaporkanOleh: "seller",
      waktu: Date.now(),
      waktuString: waktu,
      status: "Menunggu Tinjauan"
    });

    alert("✅ Laporan berhasil dikirim ke admin.");
    kembaliKeDashboardSeller();
  } catch (err) {
    console.error("Laporan gagal:", err);
    alert("❌ Gagal mengirim laporan.");
  }
}



async function tambahSaldoToko(docId, namaToko) {
  const nominal = prompt(`Masukkan jumlah saldo yang ingin ditambahkan untuk toko "${namaToko}":`);

  if (!nominal || isNaN(nominal)) {
    alert("Input tidak valid.");
    return;
  }

  const db = firebase.firestore();
  const tokoRef = db.collection("toko").doc(docId);

  try {
    const docSnap = await tokoRef.get();
    if (!docSnap.exists) {
      alert("Toko tidak ditemukan.");
      return;
    }

    const currentSaldo = docSnap.data().saldo || 0;
    const newSaldo = currentSaldo + Number(nominal);

    await tokoRef.update({ saldo: newSaldo });
    alert(`✅ Saldo toko berhasil ditambahkan. Saldo sekarang: Rp${newSaldo.toLocaleString()}`);
    loadContent("admin-toko"); // refresh
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menambah saldo.");
  }
}


async function hapusLaporanDriver(idLaporan) {
  if (!confirm("Yakin ingin menghapus laporan ini?")) return;
  try {
    await firebase.firestore().collection("laporan_driver").doc(idLaporan).delete();
    alert("✅ Laporan berhasil dihapus.");
    loadContent("laporan-driver-admin");
  } catch (err) {
    console.error("❌ Gagal menghapus laporan:", err);
    alert("Terjadi kesalahan saat menghapus laporan.");
  }
}

async function kirimPeringatanManual(idDriver, inputId) {
  const db = firebase.firestore();
  const isi = document.getElementById(inputId)?.value.trim();
  if (!isi) return alert("Masukkan isi pesan terlebih dahulu.");

  try {
    await db.collection("peringatan_driver").add({
      idDriver,
      waktu: Date.now(),
      pesan: isi,
      dariAdmin: true
    });
    alert("✅ Peringatan berhasil dikirim.");
    document.getElementById(inputId).value = "";
  } catch (e) {
    console.error("❌ Gagal kirim peringatan:", e);
    alert("Terjadi kesalahan saat mengirim pesan.");
  }
}

async function nonaktifkanDriverSementara(idDriver, idLaporan, inputId) {
  const input = document.getElementById(inputId);
  const menit = parseInt(input.value);

  if (isNaN(menit) || menit <= 0) {
    alert("Masukkan durasi nonaktif dalam menit (minimal 1).");
    return;
  }

  const db = firebase.firestore();
  const admin = firebase.auth().currentUser;
  if (!admin) return alert("Silakan login ulang.");

  try {
    const waktuSekarang = Date.now();
    const waktuAktifLagi = waktuSekarang + menit * 60 * 1000;

    // Ambil data laporan
    const laporanDoc = await db.collection("laporan_driver").doc(idLaporan).get();
    const data = laporanDoc.data() || {};
    const alasan = data.alasan || "Tidak disebutkan";

    // Ambil data driver untuk update level pelanggaran
    const driverRef = db.collection("driver").doc(idDriver);
    const driverDoc = await driverRef.get();
    const pelanggaran = (driverDoc.data()?.pelanggaran || 0) + 1;

    // Update status driver ke nonaktif & tambah level pelanggaran
    await driverRef.update({
      status: "nonaktif",
      nonaktifHingga: waktuAktifLagi,
      pelanggaran: pelanggaran
    });

    // Kirim notifikasi ke driver
    await db.collection("notifikasi_driver").add({
      idDriver,
      pesan: `Akun Anda dinonaktifkan selama ${menit} menit karena: ${alasan}`,
      waktu: waktuSekarang,
      terbaca: false
    });

    // Catat log admin
    await db.collection("riwayat_tindakan_admin").add({
      oleh: admin.uid,
      tindakan: "Nonaktifkan Driver",
      idDriver,
      idLaporan,
      durasi: menit,
      waktu: waktuSekarang,
      keterangan: `Dinonaktifkan karena laporan: ${alasan}`,
      levelPelanggaran: pelanggaran
    });

    // Hapus laporan setelah ditindak
    await db.collection("laporan_driver").doc(idLaporan).delete();

    alert(`Driver dinonaktifkan selama ${menit} menit. (Total pelanggaran: ${pelanggaran})`);
    loadContent("laporan-driver-admin");

  } catch (err) {
    console.error(err);
    alert("❌ Gagal menonaktifkan driver: " + err.message);
  }
}


// Tambahkan di atas: fungsi bantu
function isTokoSedangBuka(jamBuka, jamTutup) {
  const now = new Date();
  const jam = now.getHours();
  if (jamBuka === jamTutup) return false;
  if (jamBuka < jamTutup) return jam >= jamBuka && jam < jamTutup;
  return jam >= jamBuka || jam < jamTutup;
}

function hitungJarakKM(loc1, loc2) {
  if (!loc1 || !loc2) return 999;

  const R = 6371; // Radius bumi (KM)
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const lat1 = toRad(loc1.lat);
  const lat2 = toRad(loc2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2); // KM, dibulatkan 2 angka
}

function toRad(value) {
  return (value * Math.PI) / 180;
}


function hitungJarakKM(pos1 = {}, pos2 = {}) {
  if (!pos1.lat || !pos2.lat) return "-";
  const R = 6371; // Radius bumi dalam KM
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // dibulatkan 1 angka di belakang koma
}

async function tolakPesananDriver(id) {
  const konfirmasi = confirm("Yakin ingin menolak pesanan?");
  if (!konfirmasi) return;

  const db = firebase.firestore();
  await db.collection("pesanan_driver").doc(id).delete();
  alert("❌ Pesanan ditolak");
  loadContent("driver-dashboard");
}


async function openCustomerChat(idPesanan) {
  const modal = document.getElementById("modal-detail");
  const container = modal.querySelector(".modal-content");
  container.innerHTML = `<p>💬 Memuat chat dengan customer...</p>`;

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) {
    container.innerHTML = "<p>❌ Harap login.</p>";
    return;
  }

  window.currentChatPesananId = idPesanan;

  const chatBoxId = "chat-messages";

  container.innerHTML = `
    <button onclick="document.getElementById('modal-detail').style.display='none'"
      style="position: absolute; top: 10px; right: 15px; font-size: 20px; background: none; border: none; color: #333; cursor: pointer;">
      ❌
    </button>

    <div class="chat-container">
      <h2 style="margin-top:0;">💬 Chat dengan Customer</h2>

      <div id="${chatBoxId}" class="chat-messages" style="max-height:300px; overflow-y:auto; border:1px solid #ddd; padding:10px; margin-bottom:10px;"></div>

      <div class="chat-input-area" style="display:flex; gap:5px; margin-bottom:10px;">
        <input type="text" id="chat-input" placeholder="Tulis pesan..." style="flex:1; padding:8px;" />
        <button onclick="kirimPesanCustomer()">Kirim</button>
      </div>

      <div class="template-buttons" style="display: flex; flex-wrap: wrap; gap: 5px;">
        <p style="width:100%;"><strong>📋 Pesan Cepat:</strong></p>
        <button onclick="kirimTemplateChat('Saya sudah di titik lokasi, sesuai titik ya!')">📍 Sesuai Titik</button>
        <button onclick="kirimTemplateChat('Mohon ditunggu, saya sedang otw')">🛵 OTW</button>
        <button onclick="kirimTemplateChat('Pesanan kamu akan segera sampai')">📦 Segera Sampai</button>
        <button onclick="kirimTemplateChat('Tolong pastikan nomor rumah terlihat jelas ya!')">🏠 Nomor Rumah</button>
      </div>
    </div>
  `;

  db.collection("chat_driver")
    .where("idPesanan", "==", idPesanan)
    .orderBy("timestamp", "asc")
    .onSnapshot(snapshot => {
      const messages = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const waktu = data.timestamp?.toDate().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) || "-";
        const isDriver = data.sender === "driver";
        messages.push(`
          <div class="chat-message ${isDriver ? 'chat-driver' : 'chat-user'}" style="margin-bottom:8px; display:flex; ${isDriver ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}">
            <div class="chat-bubble" style="max-width:70%; background:${isDriver ? '#dcf8c6' : '#f1f0f0'}; padding:10px; border-radius:10px;">
              <p style="margin:0;">${data.teks}</p>
              <small style="font-size:10px; color:#888;">${waktu}</small>
            </div>
          </div>
        `);
      });
      const chatBox = document.getElementById(chatBoxId);
      if (chatBox) {
        chatBox.innerHTML = messages.join("");
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    });

  // Tampilkan modal
  modal.style.display = "flex";
}




function escapeHTML(str) {
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[match]);
}

function kirimPesanTemplateCustomer(teks, idPesanan, idCustomer, idDriver, namaCustomer) {
  const db = firebase.firestore();
  const pesanRef = db.collection("chat_driver").doc(idPesanan).collection("pesan");

  pesanRef.add({
    dari: idCustomer,
    ke: idDriver,
    nama: namaCustomer,
    pesan: teks,
    waktu: new Date()
  });
}

async function kirimPesanCustomer(idPesanan, idCustomer, idDriver, namaCustomer) {
  const input = document.getElementById("chat-input-customer");
  const isiPesan = input.value.trim();
  if (!isiPesan) return;

  const db = firebase.firestore();
  const pesanRef = db.collection("chat_driver").doc(idPesanan).collection("pesan");

  await pesanRef.add({
    dari: idCustomer,
    ke: idDriver,
    nama: namaCustomer,
    pesan: isiPesan,
    waktu: new Date()
  });

  input.value = "";
}



async function promptTransferSaldo(driverId) {
  const nominalStr = prompt("Masukkan nominal saldo yang ingin ditransfer:");
  const nominal = parseInt(nominalStr);

  if (isNaN(nominal) || nominal <= 0) {
    alert("❌ Nominal tidak valid.");
    return;
  }

  const konfirmasi = confirm(`Yakin transfer Rp ${nominal.toLocaleString()} ke driver ini?`);
  if (!konfirmasi) return;

  try {
    const user = firebase.auth().currentUser;
    if (!user) throw new Error("User tidak ditemukan");
    const uid = user.uid;
    const db = firebase.firestore();

    // 🔐 Ambil saldo admin dari users/{uid}.saldo
    const userDoc = await db.collection("users").doc(uid).get();
    const saldoAdmin = userDoc.exists ? userDoc.data().saldo || 0 : 0;

    if (saldoAdmin < nominal) {
      alert(`❌ Saldo admin tidak cukup. Sisa saldo: Rp ${saldoAdmin.toLocaleString()}`);
      return;
    }

    // 🎯 Ambil saldo driver langsung dari driver/{id}.saldo
    const driverRef = db.collection("driver").doc(driverId);
    const driverDoc = await driverRef.get();
    if (!driverDoc.exists) throw new Error("Driver tidak ditemukan.");

    const dataDriver = driverDoc.data();
    const saldoDriver = dataDriver.saldo || 0;

    const newSaldoDriver = saldoDriver + nominal;
    const newSaldoAdmin = saldoAdmin - nominal;

    // 💾 Simpan saldo baru
    await Promise.all([
      driverRef.update({ saldo: newSaldoDriver, updatedAt: new Date() }),
      db.collection("users").doc(uid).update({ saldo: newSaldoAdmin }),
    ]);

    // 🖼️ Update DOM jika tersedia
    const saldoElem = document.getElementById(`saldo-${driverId}`);
    if (saldoElem) saldoElem.innerText = `Rp ${newSaldoDriver.toLocaleString()}`;

    alert(`✅ Transfer berhasil!\nSaldo Admin: Rp ${newSaldoAdmin.toLocaleString()}`);
  } catch (err) {
    console.error(err);
    alert("❌ Transfer gagal: " + err.message);
  }
}

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meter
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function bukaDetailPesananDriver(idPesanan) {
  const container = document.querySelector("#modal-detail .modal-content");
  const db = firebase.firestore();

  if (!idPesanan) {
    container.innerHTML = `<p style="color:red;">❌ ID Pesanan tidak valid.</p>`;
    return;
  }

  try {
    const pesananDoc = await db.collection("pesanan").doc(idPesanan).get();
    if (!pesananDoc.exists) {
      container.innerHTML = `<p style="color:red;">❌ Pesanan tidak ditemukan (ID: ${idPesanan}).</p>`;
      return;
    }

    const data = pesananDoc.data();

    const driverSnap = await db.collection("pesanan_driver")
      .where("idPesanan", "==", idPesanan)
      .limit(1).get();

    if (driverSnap.empty) {
      container.innerHTML = `<p style="color:red;">❌ Belum ada driver yang menerima pesanan ini.</p>`;
      return;
    }

    const driverDoc = driverSnap.docs[0];
    const driverData = driverDoc.data();
    const driverDocId = driverDoc.id;

    const stepsLog = Array.isArray(driverData.stepsLog)
      ? driverData.stepsLog
      : Array.isArray(data.stepsLog)
        ? data.stepsLog
        : [];

    if (stepsLog.length) {
      const existing = await db.collection("riwayat_driver_admin")
        .where("idDriver", "==", driverData.idDriver)
        .where("orderId", "==", idPesanan)
        .limit(1).get();

      if (existing.empty) {
        await db.collection("riwayat_driver_admin").add({
          waktu: Date.now(),
          orderId: idPesanan,
          idDriver: driverData.idDriver,
          stepsLog: stepsLog
        });
      }
    }

    const statusStepMap = {
      "Menuju Resto": "🔜 Menuju Resto",
      "Menunggu Pesanan": "⏳ Menunggu Pesanan",
      "Pickup Pesanan": "📦 Pickup Pesanan",
      "Menuju Customer": "🛵 Menuju Customer",
      "Pesanan Diterima": "✅ Pesanan Diterima"
    };

    const urutanStatus = Object.keys(statusStepMap);
    const currentIndex = urutanStatus.indexOf(driverData.status);
    const nextStatus = urutanStatus[currentIndex + 1];

    let tombolStatus = "";
    if (nextStatus) {
      const bolehBatal = ["Menunggu Ambil", "Diterima", "Menuju Resto"].includes(driverData.status);
      tombolStatus = `
        <div class="btn-group">
          <button class="btn-next-status"
            onclick="updateStatusDriver('${driverDocId}', '${nextStatus}', '${idPesanan}')">
            ${statusStepMap[nextStatus]}
          </button>
          ${bolehBatal ? `
            <button class="btn-cancel" style="margin-left:10px; background-color:crimson;"
              onclick="batalkanPesananDriver('${driverDocId}', '${idPesanan}')">
              ❌ Batalkan Pesanan
            </button>
          ` : ""}
        </div>
      `;
    } else if (driverData.status === "Pesanan Diterima") {
      tombolStatus = `
        <div class="btn-group" style="display: flex; flex-direction: column; align-items: center; margin-top: 20px;">
          <button class="btn-next-status btn-success" id="btn-selesaikan" disabled>
            🎉 Selesaikan Pesanan
          </button>
          <p id="jarak-info" style="font-size: 14px; margin-top: 8px; color: #333;"></p>
        </div>
      `;
    }

    const formatStepsLog = () => {
      if (!stepsLog.length) return "<li>(Belum ada log)</li>";
      return stepsLog.map(s => {
        const match = s.match(/^(\d{1,2}\.\d{2})\s+(.*)$/);
        if (match) {
          const jam = match[1].replace(".", ":");
          const isi = match[2];
          return `<li>✅ <strong>${isi}</strong> - <em>${jam}</em></li>`;
        } else {
          return `<li>✅ ${s}</li>`;
        }
      }).join("");
    };

    let namaPembeli = "Customer";
    if (data.userId) {
      const userDoc = await db.collection("users").doc(data.userId).get();
      if (userDoc.exists) namaPembeli = userDoc.data().nama || namaPembeli;
    }

    const produkList = Array.isArray(data.produk)
      ? data.produk.map(p => `<li>${p.nama} (${p.jumlah}x) - Rp ${(p.harga * p.jumlah).toLocaleString()}</li>`).join("")
      : "<li>-</li>";

    container.innerHTML = `
      <div class="detail-pesanan-wrapper" style="position: relative;">
        <button onclick="document.getElementById('modal-detail').style.display='none'"
          style="position: absolute; top: 10px; right: 15px; font-size: 20px; background: none; border: none; color: #333; cursor: pointer;">
          ❌
        </button>
        <h2>📦 Detail Pesanan</h2>
        <div class="detail-pesanan-info">
          <p><strong>Nama Pembeli:</strong> ${namaPembeli}</p>
          <p><strong>Alamat:</strong> ${data.alamat || "-"}</p>
          <p><strong>Pembayaran:</strong> ${data.metode?.toUpperCase() || "-"}</p>
          <p><strong>Status Driver:</strong> ${driverData.status || "-"}</p>
        </div>

        <h3>🛍️ Daftar Produk:</h3>
        ${produkList}

        <h3>📶 Langkah Pengantaran:</h3>
        <ul>${formatStepsLog()}</ul>

        <h3>🗺️ Rute:</h3>
        <div id="map-detail" class="map-detail" style="height: 300px;"></div>

        ${tombolStatus}
      </div>
    `;

    // 🌍 MAP
    setTimeout(async () => {
      const geoToLatLng = geo => geo?.latitude ? { lat: geo.latitude, lng: geo.longitude } : geo?.lat ? { lat: geo.lat, lng: geo.lng } : null;
      const toko = geoToLatLng(driverData.lokasiToko);
      const cust = geoToLatLng(driverData.lokasiCustomer);
      const driverId = driverData.idDriver;

      const hitungJarakMeter = (a, b) => {
        const R = 6371e3;
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const lat1 = a.lat * Math.PI / 180;
        const lat2 = b.lat * Math.PI / 180;
        const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
      };

      if (toko && cust) {
        const map = L.map("map-detail").setView([cust.lat, cust.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const icon = (cls, icon) => L.divIcon({ className: cls, html: `<i class="fas ${icon}"></i>`, iconSize: [32, 32], iconAnchor: [16, 32] });

        const tokoDoc = await db.collection("toko").doc(data.produk?.[0]?.idToko).get();
        const namaToko = tokoDoc.exists ? tokoDoc.data().namaToko : "Toko";

        L.marker([toko.lat, toko.lng], { icon: icon('toko-marker', 'fa-store') }).addTo(map).bindPopup(`📍 ${namaToko}`);
        L.marker([cust.lat, cust.lng], { icon: icon('customer-marker', 'fa-user') }).addTo(map).bindPopup(`📦 ${namaPembeli}`);

        let markerDriver = null;
        let routeToToko = null;
        let routeToCustomer = null;
        let sudahSampaiToko = false;

        firebase.firestore().collection("driver").doc(driverId).onSnapshot(snap => {
          const posisi = geoToLatLng(snap.data()?.lokasi);
          if (!posisi) return;

          if (!markerDriver) {
            markerDriver = L.marker([posisi.lat, posisi.lng], { icon: icon('driver-marker', 'fa-motorcycle') })
              .addTo(map).bindPopup("🛵 Driver");
          } else {
            markerDriver.setLatLng([posisi.lat, posisi.lng]);
          }

          const jarakKeToko = hitungJarakMeter(posisi, toko);
          const jarakKeCustomer = hitungJarakMeter(posisi, cust);

          if (!sudahSampaiToko && !routeToToko) {
            routeToToko = L.Routing.control({
              waypoints: [L.latLng(posisi.lat, posisi.lng), L.latLng(toko.lat, toko.lng)],
              lineOptions: { styles: [{ color: 'orange', weight: 4 }] },
              createMarker: () => null,
              routeWhileDragging: false,
              draggableWaypoints: false,
              addWaypoints: false
            }).addTo(map);
          }

          if (jarakKeToko <= 50 && !sudahSampaiToko) {
            sudahSampaiToko = true;
            if (routeToToko) {
              try { map.removeControl(routeToToko); } catch (e) {}
              routeToToko = null;
            }

            routeToCustomer = L.Routing.control({
              waypoints: [L.latLng(toko.lat, toko.lng), L.latLng(cust.lat, cust.lng)],
              lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
              createMarker: () => null,
              routeWhileDragging: false,
              draggableWaypoints: false,
              addWaypoints: false
            }).addTo(map);
          }

          if (driverData.status === "Pesanan Diterima") {
            const btn = document.getElementById("btn-selesaikan");
            const info = document.getElementById("jarak-info");
            if (btn && info) {
              info.textContent = `Jarak ke customer: ${jarakKeCustomer} meter`;
              if (jarakKeCustomer <= 50) {
                btn.disabled = false;
                btn.onclick = () => selesaikanPesanan(idPesanan);
                info.textContent = `✅ Kamu berada dalam radius 50 meter.`;
              } else {
                btn.disabled = true;
                btn.onclick = () => {
                  alert("❗ Kamu harus berada dalam radius 50 meter dari lokasi customer untuk menyelesaikan pesanan.");
                };
              }
            }
          }
        });
      } else {
        document.getElementById("map-detail").innerHTML = `<p style="padding:10px;">📍 Lokasi belum lengkap.</p>`;
      }
    }, 100);

    document.getElementById("modal-detail").style.display = "flex";

  } catch (err) {
    console.error("❌ Gagal membuka detail pesanan:", err);
    container.innerHTML = `<p style="color:red;">❌ Terjadi kesalahan teknis.</p>`;
  }
}








async function updateStatusDriver(docId, status, idPesanan) {
  const db = firebase.firestore();
  const waktu = new Date().toLocaleTimeString("id-ID", {
    hour: '2-digit',
    minute: '2-digit'
  });

  const logBaru = `${waktu} ${status}`;

  try {
    const pesananDriverDoc = await db.collection("pesanan_driver").doc(docId).get();
    if (!pesananDriverDoc.exists) {
      alert("❌ Pesanan driver tidak ditemukan.");
      return;
    }

    await db.collection("pesanan_driver").doc(docId).update({
      status,
      stepsLog: firebase.firestore.FieldValue.arrayUnion(logBaru),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    const pesananDoc = await db.collection("pesanan").doc(idPesanan).get();
    if (!pesananDoc.exists) {
      alert("❌ Data pesanan utama tidak ditemukan.");
      return;
    }

    const pesanan = pesananDoc.data();

    await db.collection("pesanan").doc(idPesanan).update({
      status,
      stepsLog: firebase.firestore.FieldValue.arrayUnion(logBaru)
    });

    // 💰 Potong saldo saat status "Menuju Resto" dan metode COD
    if (status === "Menuju Resto") {
      if (pesanan.metode?.toLowerCase() === "cod" && !pesanan.sudahDiprosesPotong) {
        const subtotal = parseFloat(pesanan.subtotal) || 0;
        const ongkir = parseFloat(pesanan.ongkir) || 0;

        const potonganSeller = subtotal * 0.95;
        const potonganDriver = ongkir * 0.95;

        if (potonganSeller <= 0 || potonganDriver <= 0) {
          alert("❌ Subtotal atau ongkir tidak valid untuk dipotong.");
          return;
        }

        // ✅ Potong saldo seller
        const tokoRef = db.collection("toko").doc(pesanan.idToko);
        const tokoDoc = await tokoRef.get();
        if (!tokoDoc.exists) {
          alert(`❌ Toko dengan ID ${pesanan.idToko} tidak ditemukan.`);
          return;
        }

        await tokoRef.update({
          saldo: firebase.firestore.FieldValue.increment(-potonganSeller)
        });

        // ✅ Potong saldo driver
        const driverRef = db.collection("driver").doc(pesanan.idDriver);
        const driverDoc = await driverRef.get();
        if (!driverDoc.exists) {
          alert(`❌ Driver dengan ID ${pesanan.idDriver} tidak ditemukan.`);
          return;
        }

        await driverRef.update({
          saldo: firebase.firestore.FieldValue.increment(-potonganDriver)
        });

        await db.collection("pesanan").doc(idPesanan).update({
          sudahDiprosesPotong: true
        });

        console.log("✅ Saldo seller & driver berhasil dipotong (COD)");
      }
    }

    alert(`✅ Status diubah ke: ${status}`);
    await bukaDetailPesananDriver(idPesanan);

  } catch (err) {
    console.error("❌ Gagal update status:", err);
    alert("❌ Terjadi kesalahan saat memperbarui status.");
  }
}








function tampilkanRute(id) {
  const mapData = window[`map_${id}`];
  if (!mapData) return;

  const { map, pesanan } = mapData;

  if (!pesanan.lokasiDriver || !pesanan.lokasiToko || !pesanan.lokasiCustomer) {
    alert("❌ Lokasi tidak lengkap.");
    return;
  }

  const route = [
    [pesanan.lokasiDriver.lat, pesanan.lokasiDriver.lng],
    [pesanan.lokasiToko.lat, pesanan.lokasiToko.lng],
    [pesanan.lokasiCustomer.lat, pesanan.lokasiCustomer.lng],
  ];

  L.polyline(route, { color: 'blue', weight: 5 }).addTo(map);
  map.fitBounds(route);
}

async function autoAmbilPendingPesanan(driverId, lokasiDriver) {
  const db = firebase.firestore();

  const sedangProses = await cekDriverSedangProses(driverId);
  if (sedangProses) return; // ❌ Driver sudah punya pesanan

  const pendingSnap = await db.collection("pending_driver_queue")
    .orderBy("createdAt")
    .get();

  if (pendingSnap.empty) return;

  let pesananTerdekat = null;
  let jarakTerdekat = Infinity;

  for (const doc of pendingSnap.docs) {
    const data = doc.data();

    const pesananDoc = await db.collection("pesanan").doc(data.idPesanan).get();
    if (!pesananDoc.exists) continue;

    const pesanan = pesananDoc.data();
    const tokoDoc = await db.collection("toko").doc(pesanan.produk[0]?.idToko).get();
    const lokasiTokoGeo = tokoDoc.exists ? tokoDoc.data().koordinat : null;
    const lokasiToko = lokasiTokoGeo ? {
      lat: lokasiTokoGeo.latitude,
      lng: lokasiTokoGeo.longitude
    } : null;

    const jarak = hitungJarakKM(lokasiDriver, lokasiToko);
    if (jarak < jarakTerdekat) {
      jarakTerdekat = jarak;
      pesananTerdekat = {
        idDokQueue: doc.id,
        idPesanan: data.idPesanan
      };
    }
  }

  if (pesananTerdekat) {
    // Update pesanan_driver
    const pesananDriverSnap = await db.collection("pesanan_driver")
      .where("idPesanan", "==", pesananTerdekat.idPesanan)
      .get();

    if (!pesananDriverSnap.empty) {
      const docId = pesananDriverSnap.docs[0].id;
      await db.collection("pesanan_driver").doc(docId).update({
        idDriver: driverId,
        status: "Menunggu Ambil",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Hapus dari antrean pending
      await db.collection("pending_driver_queue").doc(pesananTerdekat.idDokQueue).delete();
    }
  }
}

async function terimaPesananDriver(idPesananDriver, idPesanan) {
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();

  const sedangProses = await cekDriverSedangProses(user.uid);
  if (sedangProses) {
    alert("❌ Kamu masih punya pesanan yang sedang berjalan.");
    return;
  }

  await db.collection("pesanan_driver").doc(idPesananDriver).update({
    idDriver: user.uid,
    status: "Diterima",
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("✅ Pesanan berhasil diambil!");
  loadContent("driver-dashboard");
}


async function cekDriverSedangProses(driverId) {
  const db = firebase.firestore();

  const snap = await db.collection("pesanan_driver")
    .where("idDriver", "==", driverId)
    .where("status", "in", ["Diterima", "Menuju Resto", "Pickup Pesanan", "Menuju Customer"])
    .get();

  return !snap.empty; // Jika ada → sedang proses
}


async function kirimPesananKeDriverAktif(idPesanan) {
  const db = firebase.firestore();

  try {
    // Ambil semua driver dengan status aktif
    const driverSnap = await db.collection("driver")
      .where("status", "==", "aktif")
      .get();

    if (driverSnap.empty) {
      alert("❌ Tidak ada driver aktif saat ini.");
      return;
    }

    // Pilih driver secara acak
    const drivers = driverSnap.docs;
    const driverTerpilih = drivers[Math.floor(Math.random() * drivers.length)];
    const idDriver = driverTerpilih.id;

    // Buat dokumen baru di pesanan_driver
    await db.collection("pesanan_driver").add({
      idDriver: idDriver,
      idPesanan: idPesanan,
      status: "Menunggu Ambil",
      waktuAmbil: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert(`✅ Pesanan berhasil diteruskan ke driver: ${driverTerpilih.data().nama || idDriver}`);
  } catch (error) {
    console.error("❌ Gagal kirim pesanan ke driver aktif:", error);
    alert("❌ Terjadi kesalahan saat mengirim pesanan ke driver.");
  }
}


async function ambilPesananDriverOtomatis(uidDriver) {
  const db = firebase.firestore();

  try {
    const queueSnap = await db.collection("pending_driver_queue")
                              .orderBy("createdAt", "asc")
                              .limit(1)
                              .get();

    if (!queueSnap.empty) {
      const queueDoc = queueSnap.docs[0];
      const { idPesanan } = queueDoc.data();

      // Cek apakah pesanan_driver sudah ada untuk idPesanan ini
      const checkSnap = await db.collection("pesanan_driver")
                                .where("idPesanan", "==", idPesanan)
                                .limit(1)
                                .get();

      if (checkSnap.empty) {
        await db.collection("pesanan_driver").add({
          idDriver: uidDriver,
          idPesanan,
          status: "Menunggu Ambil",
          waktuAmbil: null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection("pending_driver_queue").doc(queueDoc.id).delete();
        console.log(`✅ Pesanan ${idPesanan} dikirim otomatis ke driver ${uidDriver}`);
      }
    }
  } catch (error) {
    console.error("❌ Gagal ambil pesanan otomatis:", error);
  }
}

async function ubahStatusPesananSeller(idPesanan, statusBaru) {
  const db = firebase.firestore();
  try {
    await db.collection("pesanan").doc(idPesanan).update({
      status: statusBaru,
      stepsLog: firebase.firestore.FieldValue.arrayUnion(
        `${new Date().toLocaleTimeString("id-ID")} Seller mengubah status menjadi ${statusBaru}`
      )
    });

    const driverSnap = await db.collection("pesanan_driver")
                               .where("idPesanan", "==", idPesanan)
                               .limit(1)
                               .get();

    if (!driverSnap.empty) {
      const driverDocId = driverSnap.docs[0].id;
      await db.collection("pesanan_driver").doc(driverDocId).update({
        status: statusBaru
      });
    }

    alert("✅ Status pesanan diperbarui.");
    loadContent("seller-dashboard");
  } catch (e) {
    console.error("❌ Gagal ubah status:", e);
    alert("❌ Gagal mengubah status pesanan.");
  }
}



async function ubahStatusPesananSeller(idPesanan, statusBaru) {
  const db = firebase.firestore();
  try {
    await db.collection("pesanan").doc(idPesanan).update({
      status: statusBaru,
      stepsLog: firebase.firestore.FieldValue.arrayUnion(
        `${new Date().toLocaleTimeString("id-ID")} Seller mengubah status menjadi ${statusBaru}`
      )
    });

    const driverSnap = await db.collection("pesanan_driver").where("idPesanan", "==", idPesanan).limit(1).get();
    if (!driverSnap.empty) {
      const driverDocId = driverSnap.docs[0].id;
      await db.collection("pesanan_driver").doc(driverDocId).update({
        status: statusBaru
      });
    }

    alert("✅ Status pesanan diperbarui.");
    loadContent("seller-dashboard");
  } catch (e) {
    console.error("❌ Gagal ubah status:", e);
    alert("❌ Gagal mengubah status pesanan.");
  }
}



async function tambahDriver() {
  const uid = document.getElementById("input-uid-driver")?.value.trim();
  if (!uid) return alert("❌ UID tidak boleh kosong.");

  const db = firebase.firestore();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return alert("❌ UID tidak ditemukan di koleksi users.");

    const namaLengkap = userDoc.data().namaLengkap || "Tanpa Nama";

    const nomorPlat = prompt("Masukkan Nomor Plat Kendaraan:", "B 1234 ABC");
    if (!nomorPlat) return alert("❌ Nomor plat wajib diisi.");

    const urlKTP = prompt("Masukkan URL Foto KTP Driver:");
    if (!urlKTP) return alert("❌ URL KTP wajib diisi.");

    const dataDriver = {
      idDriver: uid,
      nama: namaLengkap,
      nomorPlat,
      urlKTP,
      status: "nonaktif",
      saldo: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("driver").doc(uid).set(dataDriver);

    alert("✅ Driver berhasil ditambahkan.");
    loadContent("admin-driver");

  } catch (error) {
    console.error("Gagal tambah driver:", error);
    alert("❌ Terjadi kesalahan saat menambahkan driver.");
  }
}




async function toggleStatusDriver(driverId, currentStatus) {
  const db = firebase.firestore();
  const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
  await db.collection("driver").doc(driverId).update({ status: newStatus });
  alert(`✅ Status driver diubah menjadi ${newStatus}`);
  loadContent("admin-driver");
}


async function editDriver(driverId) {
  const db = firebase.firestore();
  try {
    const doc = await db.collection("driver").doc(driverId).get();
    if (!doc.exists) return alert("❌ Data driver tidak ditemukan.");

    const data = doc.data();
    const nama = prompt("Edit Nama:", data.nama || "");
    const plat = prompt("Edit Nomor Plat:", data.nomorPlat || "");
    const urlKTP = prompt("Edit URL Foto KTP:", data.urlKTP || "");
    const status = prompt("Status (aktif / nonaktif):", data.status || "nonaktif");

    if (!nama || !plat || !urlKTP || !["aktif", "nonaktif"].includes(status.toLowerCase()))
      return alert("❌ Data tidak valid.");

    await db.collection("driver").doc(driverId).update({
      nama,
      nomorPlat: plat,
      urlKTP,
      status: status.toLowerCase()
    });

    alert("✅ Data driver berhasil diperbarui.");
    loadContent("admin-driver");
  } catch (err) {
    console.error("Gagal edit driver:", err);
    alert("❌ Terjadi kesalahan saat mengedit driver.");
  }
}

async function hapusDriver(driverId) {
  if (!confirm("Yakin ingin menghapus driver ini?")) return;

  const db = firebase.firestore();
  try {
    await db.collection("driver").doc(driverId).delete();
    alert("✅ Driver berhasil dihapus.");
    loadContent("admin-driver");
  } catch (err) {
    console.error("Gagal hapus driver:", err);
    alert("❌ Terjadi kesalahan saat menghapus driver.");
  }
}

async function riwayatDriver(driverId) {
  const db = firebase.firestore();
  try {
    const snap = await db.collection("pesanan_driver")
      .where("idDriver", "==", driverId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    if (snap.empty) return alert("🚫 Riwayat kosong untuk driver ini.");

    let pesan = `📜 Riwayat Driver (${driverId}):\n\n`;
    snap.forEach(doc => {
      const d = doc.data();
      pesan += `• ${d.idPesanan} [${d.status}]\n`;
    });

    alert(pesan);
  } catch (err) {
    console.error("Gagal ambil riwayat driver:", err);
    alert("❌ Gagal mengambil riwayat driver.");
  }
}

async function terimaPesananDriver(idPesanan) {
  const konfirmasi = confirm("Apakah kamu yakin ingin menerima pesanan ini?");
  if (!konfirmasi) return;

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Tidak dapat mengambil data driver.");
  const driverId = user.uid;

  try {
    // 🔍 Ambil dokumen pesanan_driver berdasarkan idPesanan
    const snap = await db.collection("pesanan_driver")
      .where("idPesanan", "==", idPesanan)
      .limit(1)
      .get();

    if (snap.empty) {
      alert("❌ Dokumen pesanan_driver tidak ditemukan.");
      return;
    }

    const docId = snap.docs[0].id;

    // 🔄 Update status pesanan_driver
    await db.collection("pesanan_driver").doc(docId).update({
      status: "Diterima",
      waktuAmbil: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 🔍 Ambil data pesanan utama
    const pesananRef = db.collection("pesanan").doc(idPesanan);
    const pesananDoc = await pesananRef.get();
    if (!pesananDoc.exists) return alert("❌ Pesanan tidak ditemukan.");

    const dataPesanan = pesananDoc.data();
    const metode = dataPesanan.metode;
    const totalOngkir = dataPesanan.totalOngkir || 0;
    const biayaLayanan = dataPesanan.biayaLayanan || 0;
    const totalBayar = dataPesanan.total || 0;

    // 🔍 Ambil saldo driver langsung dari dokumen utama
    const driverRef = db.collection("driver").doc(driverId);
    const driverDoc = await driverRef.get();
    const saldoDriver = driverDoc.exists ? driverDoc.data().saldo || 0 : 0;

    // ⚠️ Jika metode COD, potong saldo driver 5% dari (ongkir + biaya layanan)
    if (metode === "cod") {
      const fee = Math.round((totalOngkir + biayaLayanan) * 0.05);
      if (saldoDriver < fee) {
        alert(`❌ Saldo kamu tidak cukup untuk menerima pesanan. Diperlukan Rp ${fee.toLocaleString()}`);
        return;
      }

      await driverRef.update({
        saldo: firebase.firestore.FieldValue.increment(-fee)
      });
    }

    // 🧠 Tambahkan log waktu
    const logSebelumnya = dataPesanan.stepsLog || [];
    const waktu = new Date().toLocaleTimeString("id-ID", {
      hour: '2-digit',
      minute: '2-digit'
    });
    const logBaru = `${waktu} Pesanan diterima oleh driver`;

    await pesananRef.update({
      status: "Diterima",
      stepsLog: [...logSebelumnya, logBaru]
    });

    alert("✅ Pesanan berhasil diterima.");
    loadContent("driver-dashboard");
  } catch (err) {
    console.error("❌ Gagal menerima pesanan:", err);
    alert("❌ Terjadi kesalahan saat menerima pesanan.");
  }
}

async function selesaikanPesanan(idPesanan) {
  const db = firebase.firestore();
  const pesananDoc = await db.collection("pesanan").doc(idPesanan).get();
  const pesanan = pesananDoc.data();

  const { subtotal, ongkir, idToko, idDriver, metode, lokasiCustomer, metodePengiriman } = pesanan;
  const waktu = new Date();

  const feeSeller = subtotal * 0.05;
  const feeDriver = ongkir * 0.05;
  const feeLayanan = (subtotal + ongkir) * 0.01;

  let sellerDiterima = subtotal * 0.95;
  let driverDiterima = ongkir * 0.95;
  let tambahanPerusahaan = 0;

  // Tambahkan bonus jika metode pengiriman priority
  if (metodePengiriman && metodePengiriman.toLowerCase() === "priority") {
    sellerDiterima += 1500;
    driverDiterima += 1000;
    tambahanPerusahaan += 1000; // masuk sebagai fee ongkir tambahan
  }

  // Ambil data driver
  const driverDoc = await db.collection("driver").doc(idDriver).get();
  const driver = driverDoc.data();
  const namaDriver = driver.nama;
  const userIdDriver = idDriver; // UID = ID Driver
  const saldoDriverSebelumnya = driver.saldo || 0;
  const saldoAkhirDriver = saldoDriverSebelumnya + driverDiterima;

  // Ambil data toko
  const tokoDoc = await db.collection("toko").doc(idToko).get();
  const toko = tokoDoc.data();
  const namaToko = toko.namaToko || "Toko";
  const userIdSeller = toko.uid;
  const saldoSellerSebelumnya = toko.saldo || 0;
  const saldoAkhirSeller = saldoSellerSebelumnya + sellerDiterima;

  // Hitung jarak (meter)
  const jarak = hitungJarakMeter(
    lokasiCustomer.lat, lokasiCustomer.lng,
    driver.lokasi.lat, driver.lokasi.lng
  );

  const infoElem = document.getElementById(`info-jarak-${idPesanan}`);
  if (infoElem) {
    infoElem.innerHTML = `📏 Jarak driver ke customer: <b>${jarak.toFixed(1)} meter</b>`;
  }

  if (metode.toLowerCase() === "saldo") {
    await db.collection("toko").doc(idToko).update({
      saldo: firebase.firestore.FieldValue.increment(sellerDiterima),
    });

    await db.collection("driver").doc(idDriver).update({
      saldo: firebase.firestore.FieldValue.increment(driverDiterima),
    });

    await db.collection("pesan_driver").doc(userIdDriver).collection("pesan").add({
      dari: "Sistem",
      perihal: `Pesanan #${idPesanan} diselesaikan`,
      keterangan: `Saldo Anda bertambah Rp${Math.round(driverDiterima).toLocaleString()}. Saldo akhir: Rp${Math.round(saldoAkhirDriver).toLocaleString()}`,
      waktu
    });

    await db.collection("pesan_toko").doc(userIdSeller).collection("pesan").add({
      dari: "Sistem",
      perihal: `Pesanan #${idPesanan} diselesaikan`,
      keterangan: `Saldo Anda bertambah Rp${Math.round(sellerDiterima).toLocaleString()}. Saldo akhir: Rp${Math.round(saldoAkhirSeller).toLocaleString()}`,
      waktu
    });
  }

  await db.collection("pemasukan_perusahaan").add({
    idOrder: idPesanan,
    feeLayanan,
    feeDriver,
    feeSeller,
    tambahanPriority: tambahanPerusahaan,
    totalPemasukan: feeLayanan + feeDriver + feeSeller + tambahanPerusahaan,
    metodePembayaran: metode,
    metodePengiriman: metodePengiriman || "standard",
    waktu,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  const tombol = document.getElementById(`tombol-selesaikan-${idPesanan}`);
  if (tombol) {
    tombol.disabled = true;
    tombol.innerText = "✅ Sudah Diselesaikan";
  }

  alert(`✅ Pesanan diselesaikan!
🚚 Driver: ${namaDriver}
📏 Jarak: ${jarak.toFixed(1)} meter
💸 Metode: ${metode.toUpperCase()}
🚀 Pengiriman: ${metodePengiriman?.toUpperCase() || "STANDARD"}
`);
}


// Hitung jarak (meter)
function hitungJarakMeter(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}



function mulaiUpdateLokasiDriver(driverId) {
  if (!navigator.geolocation) {
    console.warn("❌ Geolocation tidak didukung.");
    return;
  }

  navigator.geolocation.watchPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;

    try {
      const db = firebase.firestore();
      await db.collection("driver").doc(driverId).update({
        lokasi: {
          lat: latitude,
          lng: longitude
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log("📍 Lokasi driver diperbarui:", latitude, longitude);
    } catch (err) {
      console.error("❌ Gagal update lokasi driver:", err);
    }
  }, (err) => {
    console.error("❌ Gagal mendapatkan lokasi driver:", err);
  }, {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  });
}


function hentikanUpdateLokasiDriver() {
  if (lokasiWatchID !== null) {
    navigator.geolocation.clearWatch(lokasiWatchID);
    lokasiWatchID = null;
    console.log("⛔️ Update lokasi dihentikan.");
  }
}




// Fungsi salin UID ke clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert("UID berhasil disalin: " + text))
    .catch(() => alert("Gagal menyalin UID."));
}


async function simpanProduk(event, idToko) {
  event.preventDefault();
  const db = firebase.firestore();

  // Ambil input
  const namaProduk = document.getElementById("namaProduk").value;
  const harga = parseInt(document.getElementById("harga").value);
  const stok = parseInt(document.getElementById("stok").value);
  const estimasi = parseInt(document.getElementById("estimasi").value);
  const deskripsi = document.getElementById("deskripsi").value;
  const kategori = document.getElementById("kategori").value;
  const file = document.getElementById("fileGambar").files[0];
  const statusEl = document.getElementById("statusUpload");

  if (!file) {
    alert("❌ Gambar belum dipilih.");
    return;
  }

  // Upload gambar ke Cloudinary
  let urlGambar = "";
  statusEl.innerText = "⏳ Mengupload gambar ke Cloudinary...";
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "VLCrave-Express");
    formData.append("folder", "folder");

    const response = await fetch("https://api.cloudinary.com/v1_1/du8gsffhb/image/upload", {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    if (!result.secure_url) throw new Error("Gagal mendapatkan URL gambar.");

    urlGambar = result.secure_url;
    statusEl.innerText = "✅ Gambar berhasil diupload.";
  } catch (err) {
    console.error("❌ Upload gagal:", err);
    statusEl.innerText = "❌ Gagal upload gambar.";
    alert("❌ Upload gambar gagal. Coba lagi.");
    return;
  }

  // Opsional: ambil nama toko dari Firestore
  try {
    const tokoDoc = await db.collection("toko").doc(idToko).get();
    if (!tokoDoc.exists) throw new Error("Toko tidak ditemukan.");
  } catch (err) {
    console.warn("❗ Gagal ambil data toko:", err);
  }

  // Buat ID produk: VLC-1234
  const angkaAcak = Math.floor(1000 + Math.random() * 9000);
  const idProduk = `VLC-${angkaAcak}`;

  // Siapkan data produk
  const data = {
    idProduk,       // ← Tambahkan ID produk ke field
    idToko,
    namaProduk,
    harga,
    stok,
    estimasi,
    deskripsi,
    kategori,
    urlGambar,
    createdAt: new Date()
  };

  try {
    await db.collection("produk").doc(idProduk).set(data);
    alert("✅ Produk berhasil ditambahkan!");
    kelolaProduk(idToko);
  } catch (error) {
    console.error("❌ Gagal menyimpan produk:", error);
    alert("❌ Gagal menambahkan produk. Silakan coba lagi.");
  }
}







async function editProduk(docId, idToko) {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat form edit produk...</p>`;

  const db = firebase.firestore();
  try {
    const doc = await db.collection("produk").doc(docId).get();
    if (!doc.exists) {
      container.innerHTML = `<p style="color:red;">❌ Produk tidak ditemukan.</p>`;
      return;
    }

    const p = doc.data();

    container.innerHTML = `
      <div class="form-box">
        <h2>✏️ Edit Produk</h2>
        <form id="editProdukForm" onsubmit="simpanEditProduk(event, '${docId}', '${idToko}')">
          <label>Nama Produk</label>
          <input id="namaProduk" type="text" value="${p.namaProduk}" required />

          <label>Harga (Rp)</label>
          <input id="harga" type="number" value="${p.harga}" required />

          <label>Stok</label>
          <input id="stok" type="number" value="${p.stok}" required />

          <label>Deskripsi</label>
          <textarea id="deskripsi">${p.deskripsi || ""}</textarea>

          <label>Gambar Produk</label>
          <input id="fileGambar" type="file" accept="image/*" />
          <p style="margin:0;">Gambar saat ini:</p>
          <img src="${p.urlGambar || ""}" alt="Preview Gambar" style="max-width:150px; margin-bottom:1rem;" />
          <p id="statusUpload" style="color:green;"></p>

          <label>Estimasi (menit)</label>
          <input id="estimasi" type="number" value="${p.estimasi || ""}" required />

          <label>Kategori:</label>
          <select id="kategori" required>
            <option value="Makanan" ${p.kategori === "Makanan" ? "selected" : ""}>Makanan</option>
            <option value="Minuman" ${p.kategori === "Minuman" ? "selected" : ""}>Minuman</option>
            <option value="Snack" ${p.kategori === "Snack" ? "selected" : ""}>Snack</option>
            <option value="Dessert" ${p.kategori === "Dessert" ? "selected" : ""}>Dessert</option>
            <option value="Lainnya" ${p.kategori === "Lainnya" ? "selected" : ""}>Lainnya</option>
          </select>

          <button type="submit" class="btn-simpan">💾 Simpan Perubahan</button>
        </form>
        <button onclick="kelolaProduk('${idToko}')" class="btn-mini" style="margin-top:1rem;">⬅️ Kembali</button>
      </div>
    `;
  } catch (err) {
    console.error("❌ Gagal load produk:", err);
    container.innerHTML = `<p style="color:red;">❌ Gagal memuat data produk.</p>`;
  }
}



async function simpanEditProduk(event, docId, idToko) {
  event.preventDefault();
  const db = firebase.firestore();

  const namaProduk = document.getElementById("namaProduk").value;
  const harga = parseInt(document.getElementById("harga").value);
  const stok = parseInt(document.getElementById("stok").value);
  const deskripsi = document.getElementById("deskripsi").value;
  const estimasi = parseInt(document.getElementById("estimasi").value);
  const kategori = document.getElementById("kategori").value;
  const file = document.getElementById("fileGambar").files[0];
  const statusEl = document.getElementById("statusUpload");

  let urlGambar = "";

  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "VLCrave-Express"); // Preset kamu
    formData.append("folder", "folder"); // Sesuaikan dengan folder kamu (opsional)

    statusEl.innerText = "⏳ Mengupload gambar ke Cloudinary...";

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/du8gsffhb/image/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!result.secure_url) {
        throw new Error("Gagal mendapatkan URL gambar.");
      }

      urlGambar = result.secure_url;
      statusEl.innerText = "✅ Gambar berhasil diupload.";
    } catch (err) {
      console.error("❌ Upload gagal:", err);
      statusEl.innerText = "❌ Gagal upload gambar.";
      alert("❌ Upload gambar gagal. Coba lagi.");
      return;
    }
  } else {
    // Jika tidak memilih gambar baru, ambil URL lama
    const doc = await db.collection("produk").doc(docId).get();
    urlGambar = doc.data().urlGambar || "";
  }

  await db.collection("produk").doc(docId).update({
    namaProduk,
    harga,
    stok,
    deskripsi,
    estimasi,
    kategori,
    urlGambar,
    updatedAt: new Date()
  });

  alert("✅ Produk berhasil diperbarui!");
  kelolaProduk(idToko);
}




async function updateProduk(event, idProduk, idToko) {
  event.preventDefault();
  const db = firebase.firestore();

  // Mengambil data dari form
  const data = {
    nama: document.getElementById("namaProduk").value.trim(),
    harga: parseInt(document.getElementById("hargaProduk").value),
    estimasi: parseInt(document.getElementById("estimasiMasak").value),
    kategori: document.getElementById("kategoriProduk").value.trim(),  // Menambahkan kategori
    gambar: document.getElementById("gambarProduk").value.trim(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    // Mengupdate data produk di Firestore
    await db.collection("produk").doc(idProduk).update(data);
    alert("✅ Produk berhasil diupdate");
    kelolaProduk(idToko);  // Kembali ke halaman kelola produk
  } catch (err) {
    alert("❌ Gagal update: " + err.message);
  }
}

async function hapusProduk(docId, idToko) {
  const konfirmasi = confirm("Apakah kamu yakin ingin menghapus produk ini?");
  if (!konfirmasi) return;

  const db = firebase.firestore();
  try {
    // Menghapus produk dari koleksi Firestore
    await db.collection("produk").doc(docId).delete();
    alert("🗑️ Produk berhasil dihapus.");
    kelolaProduk(idToko);  // Kembali ke halaman kelola produk
  } catch (err) {
    console.error("❌ Gagal hapus produk:", err);
    alert("❌ Gagal menghapus produk: " + err.message);
  }
}



async function kelolaProduk(idToko) {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat produk...</p>`;

  const db = firebase.firestore();

  try {
    const tokoDoc = await db.collection("toko").doc(idToko).get();
    if (!tokoDoc.exists) {
      container.innerHTML = `<p style="color:red;">❌ Toko tidak ditemukan.</p>`;
      return;
    }

    const toko = tokoDoc.data();
    const produkSnap = await db.collection("produk").where("idToko", "==", idToko).get();

    let html = `
      <div class="-kelola-produk">
        <div class="-kelola-produk-header">
          <h2>🛍️ Produk Toko: <span style="color:#3498db;">${toko.namaToko}</span></h2>
          <button class="-kelola-produk-btn" onclick="formTambahProduk('${idToko}')">➕ Tambah Produk</button>
        </div>
        <div class="-kelola-produk-list">
    `;

    if (produkSnap.empty) {
      html += `<p class="-kelola-produk-kosong">Belum ada produk di toko ini.</p>`;
    } else {
      produkSnap.forEach(doc => {
        const p = doc.data();
        const isAvailable = (p.stok || 0) > 0;
        const toggleId = `toggle-${doc.id}`;
        const deskripsi = p.deskripsi?.trim() || "-";

        html += `
          <div class="-kelola-produk-card">
            <div class="-kelola-produk-card-body">
              <div class="-kelola-produk-header-bar">
                <h3 class="-kelola-produk-nama">${p.namaProduk}</h3>
                ${p.kategori ? `<div class="-kelola-produk-kategori">📂 ${p.kategori}</div>` : ""}
              </div>

              <div class="-kelola-produk-info-bar">
                <p><strong>💰 Harga:</strong> Rp ${Number(p.harga).toLocaleString("id-ID")}</p>
                <p><strong>📦 Stok:</strong> ${p.stok || 0}</p>
                <p><strong>⏱️ Estimasi:</strong> ${p.estimasi || 10} menit</p>
              </div>

              <p class="-kelola-produk-deskripsi"><strong>📝 Deskripsi:</strong> ${deskripsi}</p>

              <div class="-kelola-produk-status">
                <label class="switch">
                  <input type="checkbox" id="${toggleId}" ${isAvailable ? "checked" : ""} onchange="toggleStatusProduk('${doc.id}', this.checked)">
                  <span class="slider round"></span>
                </label>
                <span class="-kelola-produk-status-label">${isAvailable ? "Tersedia" : "Kosong"}</span>
              </div>

              <div class="-kelola-produk-aksi">
                <button class="-kelola-produk-btn-mini" onclick="kelolaAddonProduk('${doc.id}', '${idToko}')">⚙️ Add-On</button>
                <button class="-kelola-produk-btn-mini" onclick="editProduk('${doc.id}', '${idToko}')">✏️ Edit</button>
                <button class="-kelola-produk-btn-mini" onclick="hapusProduk('${doc.id}', '${idToko}')">🗑️ Hapus</button>
              </div>
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
        <div class="-kelola-produk-footer">
          <button onclick="loadContent('seller-dashboard')" class="-kelola-produk-btn-mini">⬅️ Kembali ke Dashboard</button>
        </div>
      </div>
    `;

    container.innerHTML = html;

  } catch (e) {
    console.error("❌ Gagal memuat produk:", e);
    container.innerHTML = `<p style="color:red;">❌ Gagal memuat produk toko.</p>`;
  }
}





async function toggleStatusProduk(idProduk, isChecked) {
  const db = firebase.firestore();
  try {
    const stokBaru = isChecked ? 10 : 0; // Default stok saat dinyalakan ulang
    await db.collection("produk").doc(idProduk).update({ stok: stokBaru });
    console.log(`Produk ${idProduk} diubah ke ${isChecked ? "Tersedia" : "Stok Habis"}`);
  } catch (error) {
    alert("❌ Gagal mengubah status produk.");
    console.error(error);
  }
}





function formTambahProduk(idToko) {
  const container = document.getElementById("page-container");

  container.innerHTML = `
    <div class="form-box">
      <h2>➕ Tambah Produk</h2>
      <form onsubmit="simpanProduk(event, '${idToko}')">
        <label for="namaProduk">Nama Produk:</label>
        <input id="namaProduk" type="text" required>

        <label for="harga">Harga (Rp):</label>
        <input id="harga" type="number" required>

        <label for="stok">Stok:</label>
        <input id="stok" type="number" required>

        <label for="estimasi">Estimasi Masak (menit):</label>
        <input id="estimasi" type="number" value="10" min="1" required>

        <label for="deskripsi">Deskripsi:</label>
        <textarea id="deskripsi"></textarea>

        <label for="fileGambar">Upload Gambar Produk:</label>
        <input id="fileGambar" type="file" accept="image/*" required />
        <p id="statusUpload" style="color:green;"></p>

        <label for="kategori">Kategori:</label>
        <select id="kategori" required>
          <option value="Makanan">Makanan</option>
          <option value="Minuman">Minuman</option>
          <option value="Snack">Snack</option>
          <option value="Dessert">Dessert</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        <hr>
        <h4>Tambah Add-On (Opsional)</h4>
        <div id="addon-container"></div>
        <button type="button" onclick="tambahFieldAddon()">➕ Tambah Add-On</button>

        <br><br>
        <button type="submit">💾 Simpan Produk</button>
      </form>
    </div>
  `;
}


function tambahFieldAddon() {
  const container = document.getElementById("addon-container");

  const index = container.children.length;

  const addonHTML = `
    <div class="addon-row" style="margin-bottom:10px;">
      <input type="text" placeholder="Nama Add-On" class="addon-nama" required />
      <input type="number" placeholder="Harga (Rp)" class="addon-harga" required />
      <button type="button" onclick="this.parentElement.remove()">🗑️</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', addonHTML);
}



async function kelolaAddonProduk(docId, idToko) {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>Memuat add-on produk...</p>`;

  const db = firebase.firestore();

  try {
    const produkDoc = await db.collection("produk").doc(docId).get();
    if (!produkDoc.exists) {
      container.innerHTML = `<p style="color:red;">❌ Produk tidak ditemukan.</p>`;
      return;
    }

    const p = produkDoc.data();
    const addonSnap = await db.collection("produk").doc(docId).collection("addons").get();

    let html = `
      <div class="form-box">
        <h2>⚙️ Kelola Add-On untuk: ${p.namaProduk}</h2>

        <form onsubmit="tambahAddon(event, '${docId}', '${idToko}')">
          <label>Nama Add-On:</label>
          <input type="text" id="addonNama" required>

          <label>Harga Add-On (Rp):</label>
          <input type="number" id="addonHarga" required>

          <button type="submit">➕ Tambah Add-On</button>
        </form>

        <div style="margin-top: 1rem;">
          <h4>📋 Daftar Add-On:</h4>
    `;

    if (addonSnap.empty) {
      html += `<p style="color: gray;">Belum ada add-on.</p>`;
    } else {
      addonSnap.forEach(addon => {
        const a = addon.data();
        html += `
          <div class="addon-item" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span>${a.nama} - Rp ${a.harga?.toLocaleString("id-ID")}</span>
            <button onclick="hapusAddon('${docId}', '${addon.id}', '${idToko}')" class="btn-mini">🗑️ Hapus</button>
          </div>
        `;
      });
    }

    html += `
        </div>
        <button onclick="kelolaProduk('${idToko}')" class="btn-mini" style="margin-top:1rem;">⬅️ Kembali ke Produk</button>
      </div>
    `;

    container.innerHTML = html;

  } catch (err) {
    console.error("❌ Gagal memuat add-on:", err);
    container.innerHTML = `<p style="color:red;">❌ Gagal memuat data add-on.</p>`;
  }
}

async function tambahAddon(event, docId, idToko) {
  event.preventDefault();
  const nama = document.getElementById("addonNama").value.trim();
  const harga = parseInt(document.getElementById("addonHarga").value);

  if (!nama || isNaN(harga)) {
    alert("❌ Nama dan harga add-on wajib diisi.");
    return;
  }

  const db = firebase.firestore();

  try {
    await db.collection("produk").doc(docId).collection("addons").add({ nama, harga });
    alert("✅ Add-on ditambahkan.");
    kelolaAddonProduk(docId, idToko); // refresh halaman
  } catch (err) {
    console.error("❌ Gagal tambah add-on:", err);
    alert("❌ Gagal menambahkan add-on.");
  }
}

async function hapusAddon(docId, addonId, idToko) {
  if (!confirm("Yakin ingin menghapus add-on ini?")) return;

  const db = firebase.firestore();

  try {
    await db.collection("produk").doc(docId).collection("addons").doc(addonId).delete();
    alert("✅ Add-on dihapus.");
    kelolaAddonProduk(docId, idToko);
  } catch (err) {
    console.error("❌ Gagal hapus add-on:", err);
    alert("❌ Gagal menghapus add-on.");
  }
}

async function updateToko(event, id) {
  event.preventDefault();
  const db = firebase.firestore();
  const data = {
    namaPemilik: document.getElementById("namaPemilik").value,
    namaToko: document.getElementById("namaToko").value,
    alamatToko: document.getElementById("alamatToko").value,
    jamBuka: parseInt(document.getElementById("jamBuka").value),
    jamTutup: parseInt(document.getElementById("jamTutup").value),
    koordinat: document.getElementById("koordinat").value
  };

  try {
    await db.collection("toko").doc(id).update(data);
    alert("✅ Toko berhasil diupdate");
    loadContent("admin-toko");
  } catch (e) {
    alert("❌ Gagal update: " + e.message);
  }
}

async function hapusToko(id) {
  if (!confirm("Yakin ingin menghapus toko ini?")) return;
  const db = firebase.firestore();
  try {
    await db.collection("toko").doc(id).delete();
    alert("✅ Toko berhasil dihapus");
    loadContent("admin-toko");
  } catch (e) {
    alert("❌ Gagal hapus: " + e.message);
  }
}


async function simpanToko(event) {
  event.preventDefault();

  const user = firebase.auth().currentUser;
  const db = firebase.firestore();
  const uid = user.uid;

  // Ambil data dari form
  const namaPemilik = document.getElementById("namaPemilik").value.trim();
  const namaToko = document.getElementById("namaToko").value.trim();
  const deskripsiToko = document.getElementById("deskripsiToko").value.trim();
  const alamatToko = document.getElementById("alamatToko").value.trim();
  const jamBuka = parseInt(document.getElementById("jamBuka").value);
  const jamTutup = parseInt(document.getElementById("jamTutup").value);
  const koordinatInput = document.getElementById("koordinat").value.trim();
  const [lat, lng] = koordinatInput.split(",");
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return alert("❌ Format koordinat tidak valid.");
  }

  // Buat ID toko format VLP-1234
  const angkaAcak = Math.floor(1000 + Math.random() * 9000);
  const idToko = `VLP-${angkaAcak}`;

  const dataToko = {
    idToko, // ← simpan ke dalam field juga
    userId: uid,
    namaPemilik,
    namaToko,
    deskripsiToko,
    alamatToko,
    jamBuka,
    jamTutup,
    saldo: 0,
    koordinat: new firebase.firestore.GeoPoint(latitude, longitude),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("toko").doc(idToko).set(dataToko);

    alert("✅ Toko berhasil ditambahkan.");

    // Cek role user & arahkan
    const userDoc = await db.collection("users").doc(uid).get();
    const role = (userDoc.data()?.role || "").toLowerCase();

    if (role === "seller") {
      loadContent("seller-dashboard");
    } else if (role === "admin") {
      loadContent("admin-toko");
    }

  } catch (err) {
    console.error(err);
    alert("❌ Gagal menambahkan toko.");
  }
}






async function formTambahToko() {
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Harap login terlebih dahulu.");

  const uid = user.uid;
  const db = firebase.firestore();
  const userDoc = await db.collection("users").doc(uid).get();
  const role = (userDoc.data()?.role || "").toLowerCase();

  if (role !== "seller") {
    return alert("❌ Hanya pengguna dengan role 'Seller' yang dapat menambahkan toko.");
  }

  const container = document.getElementById("page-container");
  container.innerHTML = `
    <div class="form-box">
      <h2><i class="fas fa-store"></i> Tambah Toko</h2>
      <form id="form-tambah-toko" onsubmit="return simpanToko(event)">
        <input type="hidden" id="userIdSeller" value="${uid}" />

        <label>Nama Pemilik</label>
        <input required id="namaPemilik" value="${userDoc.data().nama || ''}" placeholder="Nama pemilik toko" />

        <label>Nama Toko</label>
        <input required id="namaToko" placeholder="Nama toko" />

        <label>Deskripsi Toko</label>
        <textarea required id="deskripsiToko" placeholder="Deskripsi singkat tentang toko" rows="3"></textarea>

        <label>Alamat Toko</label>
        <textarea required id="alamatToko" placeholder="Alamat lengkap toko" rows="3"></textarea>

        <label>Jam Buka (0–23)</label>
        <input type="number" min="0" max="23" required id="jamBuka" placeholder="Contoh: 8" />

        <label>Jam Tutup (0–23)</label>
        <input type="number" min="0" max="23" required id="jamTutup" placeholder="Contoh: 21" />

        <label>Koordinat (klik peta untuk isi otomatis)</label>
        <input required id="koordinat" placeholder="Contoh: -6.12345,106.54321" />

        <label>Upload Logo Toko (opsional)</label>
        <input type="file" id="fileLogo" accept="image/*" />
        <p id="statusUpload" style="color: green;"></p>

        <button type="submit" class="btn-simpan">💾 Simpan</button>
      </form>

      <div id="leafletMap" style="height: 300px; margin-top: 20px; border-radius: 8px; overflow: hidden;"></div>
    </div>
  `;

  // Inisialisasi Peta
  const map = L.map('leafletMap').setView([-1.63468, 105.77554], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let marker;
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    document.getElementById("koordinat").value = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (marker) marker.remove();
    marker = L.marker([lat, lng]).addTo(map);
  });
}




async function formTambahTokoAdmin() {
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Harap login terlebih dahulu.");

  const container = document.getElementById("page-container");
  container.innerHTML = `
    <div class="form-box">
      <h2>🏪 Tambah Toko Manual oleh Admin</h2>
      <form id="form-tambah-toko-admin" onsubmit="return simpanTokoAdmin(event)">
        <label>UID Seller</label>
        <input required id="uidSeller" placeholder="Masukkan UID" />

        <label>Nama Pemilik</label>
        <input required id="namaPemilik" placeholder="Nama pemilik toko" />

        <label>Nama Toko</label>
        <input required id="namaToko" placeholder="Nama toko" />

        <label>Deskripsi Toko</label>
        <textarea required id="deskripsiToko" placeholder="Deskripsi singkat tentang toko" rows="3"></textarea>

        <label>Alamat Toko</label>
        <textarea required id="alamatToko" placeholder="Alamat lengkap toko" rows="3"></textarea>

        <label>Jam Buka (0–23)</label>
        <input type="number" min="0" max="23" required id="jamBuka" placeholder="Contoh: 8" />

        <label>Jam Tutup (0–23)</label>
        <input type="number" min="0" max="23" required id="jamTutup" placeholder="Contoh: 21" />

        <label>Koordinat (klik peta untuk isi otomatis)</label>
        <input required id="koordinat" placeholder="Contoh: -6.12345,106.54321" />

        <label>Upload Logo Toko (opsional)</label>
        <input type="file" id="fileLogo" accept="image/*" />
        <p id="statusUpload" style="color: green;"></p>

        <button type="submit" class="btn-simpan">💾 Simpan Toko</button>
      </form>

      <div id="leafletMap" style="height: 300px; margin-top: 20px; border-radius: 8px;"></div>
    </div>
  `;

  // Inisialisasi peta
  const map = L.map('leafletMap').setView([-1.63468, 105.77554], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let marker;
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    document.getElementById("koordinat").value = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (marker) marker.remove();
    marker = L.marker([lat, lng]).addTo(map);
  });
}

async function simpanTokoAdmin(event) {
  event.preventDefault();

  const uid = document.getElementById("uidSeller").value.trim();
  const namaPemilik = document.getElementById("namaPemilik").value.trim();
  const namaToko = document.getElementById("namaToko").value.trim();
  const deskripsiToko = document.getElementById("deskripsiToko").value.trim();
  const alamatToko = document.getElementById("alamatToko").value.trim();
  const jamBuka = parseInt(document.getElementById("jamBuka").value);
  const jamTutup = parseInt(document.getElementById("jamTutup").value);
  const koordinatInput = document.getElementById("koordinat").value.trim();
  const file = document.getElementById("fileLogo").files[0];

  if (!uid || !namaPemilik || !namaToko || !deskripsiToko || !alamatToko || isNaN(jamBuka) || isNaN(jamTutup)) {
    return alert("❌ Semua field wajib diisi dengan benar.");
  }

  if (jamBuka < 0 || jamBuka > 23 || jamTutup < 0 || jamTutup > 23) {
    return alert("❌ Jam buka/tutup harus antara 0–23.");
  }

  const [lat, lng] = koordinatInput.split(",");
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) {
    return alert("❌ Format koordinat salah.");
  }

  const db = firebase.firestore();
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return alert("❌ UID tidak ditemukan.");
  if ((userDoc.data().role || "").toLowerCase() !== "seller") return alert("❌ UID bukan seller.");

  // Upload gambar jika ada
  let logoURL = "/img/toko-pict.png"; // default
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "vlcravepreset");
    formData.append("folder", "toko");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/du8gsffhb/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) logoURL = data.secure_url;
    } catch (err) {
      console.error("❌ Gagal upload logo:", err);
    }
  }

  try {
    await db.collection("toko").add({
      userId: uid,
      namaPemilik,
      namaToko,
      deskripsiToko,
      alamatToko,
      jamBuka,
      jamTutup,
      koordinat: new firebase.firestore.GeoPoint(latitude, longitude),
      saldo: 0,
      logo: logoURL,
      createdAt: new Date()
    });

    alert("✅ Toko berhasil ditambahkan.");
    loadContent("admin-toko");

  } catch (err) {
    console.error("❌ Gagal simpan toko:", err);
    alert("❌ Gagal menyimpan toko. Silakan coba lagi.");
  }
}




async function lihatRiwayatTransaksi(idToko) {
  const container = document.getElementById("page-container");
  container.innerHTML = `<p>⏳ Memuat riwayat transaksi toko...</p>`;

  const db = firebase.firestore();

  try {
    const snapshot = await db.collection("pesanan_penjual")
      .where("idToko", "==", idToko)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      container.innerHTML = `<p>📭 Tidak ada riwayat transaksi untuk toko ini.</p>`;
      return;
    }

    let html = `
      <div class="riwayat-toko-wrapper">
        <h2>📄 Riwayat Transaksi Toko</h2>
        <button onclick="loadContent('admin-toko')" class="btn-kembali">⬅️ Kembali</button>
        <div class="card-list">
    `;

    let no = 1;
    for (const doc of snapshot.docs) {
      const p = doc.data();
      const waktu = p.createdAt?.toDate()?.toLocaleString("id-ID") || "-";

      // Ambil status dari pesanan_driver
      let status = "-";
      const driverSnap = await db.collection("pesanan_driver")
        .where("idPesanan", "==", p.idPesanan)
        .limit(1)
        .get();

      if (!driverSnap.empty) {
        status = driverSnap.docs[0].data().status || "-";
      }

      html += `
        <div class="card riwayat-seller-admin">
          <div class="card-header">
            <h3>ID Pesanan: ${p.idPesanan}</h3>
            <span class="status">${status}</span>
          </div>
          <div class="card-body">
            <p><strong>Waktu:</strong> ${waktu}</p>
            <p><strong>Pembeli:</strong> ${p.namaPembeli}<br><small>${p.noHpPembeli}</small></p>
            <p><strong>Metode Pengiriman:</strong> ${p.pengiriman || "-"}</p>
            <p><strong>Ongkir:</strong> Rp${(p.ongkir || 0).toLocaleString()}</p>
          </div>
          <div class="card-footer">
            <button class="btn-edit" onclick="editTransaksi('${doc.id}')">✏️ Edit</button>
            <button class="btn-delete" onclick="hapusTransaksi('${doc.id}')">🗑️ Hapus</button>
          </div>
        </div>
      `;
    }

    html += `</div></div>`;

    container.innerHTML = html;
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p style="color:red;">❌ Gagal memuat riwayat transaksi: ${error.message}</p>`;
  }
}

// Fungsi untuk menghapus transaksi
async function hapusTransaksi(id) {
  const confirmDelete = confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
  if (confirmDelete) {
    const db = firebase.firestore();
    try {
      await db.collection("pesanan_penjual").doc(id).delete();
      alert("✅ Transaksi berhasil dihapus.");
      loadContent("admin-toko"); // Reload halaman
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menghapus transaksi.");
    }
  }
}

// Fungsi untuk mengedit transaksi
async function editTransaksi(id) {
  const db = firebase.firestore();
  try {
    const transaksiDoc = await db.collection("pesanan_penjual").doc(id).get();
    if (!transaksiDoc.exists) {
      return alert("❌ Transaksi tidak ditemukan.");
    }

    const transaksiData = transaksiDoc.data();
    // Misalnya, buka modal edit dan isi form dengan data transaksi yang ada
    document.getElementById("edit-idPesanan").value = transaksiData.idPesanan;
    document.getElementById("edit-namaPembeli").value = transaksiData.namaPembeli;
    document.getElementById("edit-metodePengiriman").value = transaksiData.pengiriman || "standard";
    document.getElementById("edit-ongkir").value = transaksiData.ongkir || 0;

    // Tampilkan modal untuk mengedit transaksi
    document.getElementById("modal-edit-transaksi").style.display = "flex";

    // Update data ketika pengguna menyimpan perubahan
    document.getElementById("save-edit-transaksi").onclick = async () => {
      const updatedData = {
        idPesanan: document.getElementById("edit-idPesanan").value,
        namaPembeli: document.getElementById("edit-namaPembeli").value,
        pengiriman: document.getElementById("edit-metodePengiriman").value,
        ongkir: parseInt(document.getElementById("edit-ongkir").value) || 0
      };

      await db.collection("pesanan_penjual").doc(id).update(updatedData);
      alert("✅ Transaksi berhasil diperbarui.");
      loadContent("admin-toko");
    };
  } catch (error) {
    console.error(error);
    alert("❌ Gagal mengambil data transaksi.");
  }
}





async function topupSaldoUser() {
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Kamu harus login terlebih dahulu.");

  const doc = await db.collection("pengaturan").doc("rekening").get();
  const data = doc.exists ? doc.data() : {};
  const listRekening = Array.isArray(data.list) ? data.list : [];
  const rekeningAktif = listRekening.filter(r => r.aktif);

  if (rekeningAktif.length === 0) return alert("❌ Tidak ada rekening aktif.");

  // Generate kode unik (3 digit)
  const kodeUnik = Math.floor(Math.random() * 900) + 100;

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box">
      <h3>🔼 Ajukan Top Up</h3>
      <input id="topup-nominal" type="number" placeholder="Nominal (min Rp10.000)" class="input-full" />

      <select id="topup-metode" class="input-full" onchange="tampilRekeningTujuan(this.value)">
        <option value="" disabled selected>🧾 Pilih Bank</option>
        ${rekeningAktif.map((r, i) => `<option value="${i}">${r.bank}</option>`).join("")}
      </select>

      <div id="rekening-tujuan" class="rekening-box" style="display:none;">
        <strong>Bank: <span id="rekening-bank">-</span></strong><br/>
        <strong>Nama: <span id="rekening-nama">-</span></strong><br/>
        <span id="rekening-nomor" class="copyable" title="Klik untuk salin">-</span><br/><br/>
        <span id="nominal-display" class="nominal-display" title="Klik untuk salin">-</span>
      </div>

      <input id="topup-catatan" type="text" placeholder="Catatan (opsional)" class="input-full" />
      <div id="modal-message" class="modal-message"></div>

      <div class="modal-actions">
        <button class="btn-mini" id="btn-batal">Batal</button>
        <button class="btn-mini" id="btn-kirim">Kirim</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Menampilkan rekening saat dipilih
  window.tampilRekeningTujuan = function(index) {
    const box = document.getElementById("rekening-tujuan");
    const nominalInput = document.getElementById("topup-nominal").value;
    const nominalDisplay = document.getElementById("nominal-display");

    if (!index) {
      box.style.display = "none";
      nominalDisplay.textContent = "-";
      return;
    }

    const rekening = rekeningAktif[Number(index)];
    document.getElementById("rekening-bank").textContent = rekening.bank || "-";
    document.getElementById("rekening-nama").textContent = rekening.nama || "-";
    document.getElementById("rekening-nomor").textContent = rekening.nomor || "-";

    const total = Number(nominalInput) + kodeUnik;
    nominalDisplay.textContent = Number(nominalInput) >= 10000 ? formatRupiah(total) : "-";
    box.style.display = "block";
  };

  // Salin nomor rekening
  modal.querySelector("#rekening-nomor").addEventListener("click", () => {
    const text = document.getElementById("rekening-nomor").innerText;
    if (text && text !== "-") {
      navigator.clipboard.writeText(text);
      setMessage("📋 Nomor rekening disalin.");
    }
  });

  // Format total nominal (termasuk kode unik)
  modal.querySelector("#topup-nominal").addEventListener("input", e => {
    const val = e.target.value.trim();
    const total = Number(val) + kodeUnik;
    const nominalDisplay = document.getElementById("nominal-display");
    nominalDisplay.textContent = Number(val) >= 10000 ? formatRupiah(total) : "-";
  });

  modal.querySelector("#btn-batal").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.querySelector("#btn-kirim").addEventListener("click", () => {
    kirimTopupRequest(user, rekeningAktif, modal, kodeUnik);
  });

  function setMessage(msg, isError = false) {
    const msgDiv = document.getElementById("modal-message");
    msgDiv.textContent = msg;
    msgDiv.style.color = isError ? "#e74c3c" : "#2ecc71";
  }

  function formatRupiah(angka) {
    if (!angka) return "-";
    let number_string = angka.toString().replace(/[^,\d]/g, "");
    let split = number_string.split(",");
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) {
      let separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }
    rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
    return "Rp" + rupiah;
  }
}



async function simpanJamLayanan() {
  const buka = document.getElementById("jam-buka").value;
  const tutup = document.getElementById("jam-tutup").value;
  const aktif = document.getElementById("status-layanan").value === "true";
  const mode = document.getElementById("mode-layanan").value;

  await firebase.firestore().collection("pengaturan").doc("jam_layanan").set({
    buka,
    tutup,
    aktif,
    mode
  });

  alert("✅ Jam layanan berhasil diperbarui.");
  loadContent("jam-layanan");
}

async function kirimTopupRequest(user, rekeningAktif, modal) {
  const db = firebase.firestore();
  const nominalInput = document.getElementById("topup-nominal");
  const metodeSelect = document.getElementById("topup-metode");
  const catatan = document.getElementById("topup-catatan").value.trim();
  const setMessage = (msg, error) => {
    const msgDiv = document.getElementById("modal-message");
    msgDiv.textContent = msg;
    msgDiv.style.color = error ? "#e74c3c" : "#2ecc71";
  };

  const nominal = Number(nominalInput.value.trim());
  const metodeIndex = metodeSelect.value;

  if (!nominal || nominal < 10000) {
    setMessage("❌ Nominal minimal Rp10.000", true);
    nominalInput.focus();
    return;
  }

  if (!metodeIndex || !rekeningAktif[metodeIndex]) {
    setMessage("❌ Pilih metode bank", true);
    metodeSelect.focus();
    return;
  }

  const rekeningDipilih = rekeningAktif[metodeIndex];
  const unik = Math.floor(Math.random() * 900) + 100;
  const total = nominal + unik;
  const expiredAt = Date.now() + 30 * 60 * 1000;

  const topupData = {
    userId: user.uid,
    jumlah: nominal,
    unik,
    total,
    metode: rekeningDipilih.bank,
    rekening: {
      nama: rekeningDipilih.nama,
      nomor: rekeningDipilih.nomor
    },
    catatan: catatan || "",
    status: "Menunggu",
    expiredAt,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("topup_request").add(topupData);
    setMessage("✅ Permintaan top up berhasil dikirim.");
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 1200);
  } catch (err) {
    console.error("Gagal kirim topup:", err);
    setMessage("❌ Gagal mengirim permintaan. Coba lagi.", true);
  }
}


// ✅ Konfirmasi Topup
async function konfirmasiTopup(docId, uid, nominal) {
  const db = firebase.firestore();
  const userRef = db.collection("users").doc(uid);
  const topupRef = db.collection("topup_request").doc(docId);

  const userSnap = await userRef.get();
  const topupSnap = await topupRef.get();

  if (!userSnap.exists) return alert("❌ User tidak ditemukan.");
  if (!topupSnap.exists) return alert("❌ Permintaan topup tidak ditemukan.");

  const topupData = topupSnap.data();
  if (topupData.status !== "Menunggu") return alert("❌ Permintaan sudah diproses.");

  // Tambah saldo
  const saldoLama = parseInt(userSnap.data().saldo || 0);
  const saldoBaru = saldoLama + nominal;

  try {
    await userRef.update({ saldo: saldoBaru });
    await topupRef.update({ status: "Selesai" });

    alert("✅ Deposit berhasil dikonfirmasi.");
    loadContent("permintaan-deposit");
  } catch (err) {
    console.error("❌ Gagal konfirmasi:", err);
    alert("❌ Gagal konfirmasi topup.");
  }
}

// ❌ Tolak Topup
async function tolakTopup(docId) {
  const topupRef = firebase.firestore().collection("topup_request").doc(docId);
  const snap = await topupRef.get();
  if (!snap.exists) return alert("❌ Data tidak ditemukan.");

  const data = snap.data();
  if (data.status !== "Menunggu") return alert("❌ Permintaan sudah diproses.");

  try {
    await topupRef.update({ status: "Dibatalkan" });
    alert("❌ Permintaan deposit ditolak.");
    loadContent("permintaan-deposit");
  } catch (err) {
    console.error("❌ Gagal menolak:", err);
    alert("❌ Gagal menolak permintaan.");
  }
}


async function konfirmasiWithdraw(docId, uid, nominal) {
  const db = firebase.firestore();
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    alert("❌ User tidak ditemukan.");
    return;
  }

  const saldoLama = parseInt(userSnap.data().saldo || 0);
  if (saldoLama < nominal) {
    alert("❌ Saldo tidak cukup.");
    return;
  }

  await userRef.update({ saldo: saldoLama - nominal });

  await db.collection("withdraw_request").doc(docId).update({
    status: "Selesai",
    approvedBy: firebase.auth().currentUser.uid,
    approvedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("✅ Withdraw dikonfirmasi.");
  loadContent("permintaan-withdraw");
}

async function tolakWithdraw(docId) {
  await firebase.firestore().collection("withdraw_request").doc(docId).update({
    status: "Dibatalkan",
    rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("❌ Withdraw ditolak.");
  loadContent("permintaan-withdraw");
}



function toggleDropdown(button) {
  // Tutup semua dropdown yang lain
  document.querySelectorAll(".dropdown-menu").forEach(menu => {
    if (menu !== button.nextElementSibling) menu.style.display = "none";
  });

  const menu = button.nextElementSibling;
  const visible = menu.style.display === "block";
  menu.style.display = visible ? "none" : "block";
}

// Tutup dropdown saat klik di luar
document.addEventListener("click", function (e) {
  if (!e.target.closest(".dropdown-container")) {
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
      menu.style.display = "none";
    });
  }
});


function gantiRole(uid, currentRole = '') {
  const pilihan = ['user', 'driver', 'seller', 'admin']; // ✅ tambah seller
  const selectOptions = pilihan.map(role => {
    const selected = role === currentRole.toLowerCase() ? 'selected' : '';
    return `<option value="${role}" ${selected}>${role.charAt(0).toUpperCase() + role.slice(1)}</option>`;
  }).join('');

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box">
      <h3>🔁 Ganti Role Pengguna</h3>
      <select id="select-role" style="margin: 12px 0; padding: 8px 12px; width: 100%; font-size: 14px;">
        ${selectOptions}
      </select>
      <div style="display: flex; justify-content: space-between; gap: 10px;">
        <button class="btn-mini" onclick="document.body.removeChild(this.closest('.modal-overlay'))">Batal</button>
        <button class="btn-mini" onclick="konfirmasiGantiRole('${uid}')">Simpan</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function konfirmasiGantiRole(uid) {
  const newRole = document.getElementById("select-role").value;
  if (!newRole) return alert("❌ Silakan pilih role terlebih dahulu.");

  const db = firebase.firestore();

  try {
    await db.collection("users").doc(uid).update({ role: newRole });
    alert("✅ Role berhasil diperbarui ke: " + newRole);
    document.querySelector(".modal-overlay").remove();
    loadContent("users-management"); // ⟳ refresh halaman
  } catch (err) {
    console.error("Gagal update role:", err);
    alert("❌ Gagal memperbarui role.");
  }
}



function resetPin(uid) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box">
      <h3>🔐 Reset PIN</h3>
      <input id="new-pin" type="text" maxlength="6" placeholder="PIN Baru (6 digit)" style="width:100%;padding:8px 10px;margin:10px 0;" />
      <div style="display:flex;justify-content:space-between;gap:10px;">
        <button class="btn-mini" onclick="document.body.removeChild(this.closest('.modal-overlay'))">Batal</button>
        <button class="btn-mini" onclick="konfirmasiResetPin('${uid}')">Reset</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function konfirmasiResetPin(uid) {
  const pinBaru = document.getElementById("new-pin").value.trim();

  if (!/^\d{6}$/.test(pinBaru)) {
    alert("❌ PIN harus 6 digit angka.");
    return;
  }

  const db = firebase.firestore();
  await db.collection("users").doc(uid).update({ pin: pinBaru });

  alert("✅ PIN berhasil direset ke: " + pinBaru);
  document.querySelector(".modal-overlay").remove();
  loadContent("users-management"); // Refresh halaman
}


function transferSaldo(uid) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box">
      <h3>💰 Transfer Saldo ke User</h3>
      <input id="jumlah-saldo" type="number" placeholder="Nominal (Rp)" style="width:100%;padding:8px 10px;margin:8px 0;" />
      <input id="catatan-saldo" type="text" placeholder="Catatan (Opsional)" style="width:100%;padding:8px 10px;margin-bottom:10px;" />
      <div style="display:flex;justify-content:space-between;gap:10px;">
        <button class="btn-mini" onclick="document.body.removeChild(this.closest('.modal-overlay'))">Batal</button>
        <button class="btn-mini" onclick="konfirmasiTransferSaldo('${uid}')">Transfer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function konfirmasiTransferSaldo(uid) {
  const jumlah = parseInt(document.getElementById("jumlah-saldo").value);
  const catatan = document.getElementById("catatan-saldo").value || "-";

  if (isNaN(jumlah) || jumlah <= 0) {
    alert("❌ Nominal tidak valid.");
    return;
  }

  const db = firebase.firestore();
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    alert("❌ Pengguna tidak ditemukan.");
    return;
  }

  const data = userDoc.data();
  const saldoLama = parseInt(data.saldo || 0);
  const saldoBaru = saldoLama + jumlah;

  await userRef.update({ saldo: saldoBaru });

  // Tambah ke log transaksi (opsional)
  await db.collection("transaksi_admin").add({
    userId: uid,
    jumlah,
    catatan,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("✅ Saldo berhasil ditransfer.");
  document.querySelector(".modal-overlay").remove();
  loadContent("users-management"); // refresh
}


function toggleStatus(uid) {
  alert("Suspend/Aktifkan/Banned UID: " + uid);
}

function lihatRiwayat(uid) {
  alert("Menampilkan riwayat transaksi UID: " + uid);
}


async function simpanPINBaru() {
  const pinLama = document.getElementById("pin-lama").value.trim();
  const pinBaru = document.getElementById("pin-baru").value.trim();
  const pinBaru2 = document.getElementById("pin-baru2").value.trim();

  // Validasi input dasar
  if (!pinLama || !pinBaru || !pinBaru2) {
    alert("⚠️ Semua field PIN wajib diisi.");
    return;
  }

  if (pinLama.length !== 6 || pinBaru.length !== 6 || pinBaru2.length !== 6 || isNaN(pinLama) || isNaN(pinBaru) || isNaN(pinBaru2)) {
    alert("⚠️ PIN harus 6 digit angka.");
    return;
  }

  if (pinBaru !== pinBaru2) {
    alert("❌ PIN baru tidak cocok.");
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    alert("⚠️ Silakan login ulang.");
    return;
  }

  const db = firebase.firestore();
  const userDocRef = db.collection("users").doc(user.uid);
  const doc = await userDocRef.get({ source: "server" });

  if (!doc.exists) {
    alert("❌ Data pengguna tidak ditemukan.");
    return;
  }

  const data = doc.data();
  const pinTersimpan = Number(data.pin || 0);
  const pinLamaInput = Number(pinLama);

  if (pinTersimpan !== pinLamaInput) {
    alert("❌ PIN lama salah.");
    return;
  }

  await userDocRef.update({ pin: Number(pinBaru) });

  alert("✅ PIN berhasil diperbarui.");
  loadContent("user");
}




function handleKlikCheckout() {
  prosesCheckout(); // langsung proses, tidak pakai PIN
}





async function renderDetailRiwayat(item) {
  const container = document.getElementById("riwayat-detail-container");
  if (!container) return;

  const now = Date.now();
  const db = firebase.firestore();

  // Ambil stepsLog terbaru dari Firestore
  let stepsLog = [];
  try {
    const doc = await db.collection("pesanan").doc(item.id).get();
    if (doc.exists) {
      const data = doc.data();
      stepsLog = Array.isArray(data.stepsLog) ? data.stepsLog : [];
    }
  } catch (err) {
    console.error("❌ Gagal mengambil data stepsLog dari Firestore:", err);
  }

  const waktuSelesaiFormatted = item.waktuSelesai
    ? new Date(item.waktuSelesai).toLocaleString("id-ID", {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : "-";

  const statusClass = {
    Berhasil: "status-selesai",
    Diproses: "status-proses",
    Dibatalkan: "status-batal",
    "Menunggu Pembayaran": "status-menunggu"
  }[item.status] || "status-unknown";

  let html = `
    <div class="riwayat-detail">
      <h3>Status: <span class="status-text ${statusClass}">${item.status}</span></h3>
      <p>🕐 Selesai pada: ${waktuSelesaiFormatted}</p>
      <h4>📋 Timeline Pengiriman:</h4>
      <ul class="timeline-log">
  `;

  const visibleSteps = stepsLog.filter(step => step.timestamp <= now);

  if (visibleSteps.length > 0) {
    visibleSteps.forEach(step => {
      const stepTime = new Date(step.timestamp).toLocaleTimeString("id-ID", {
        hour: '2-digit',
        minute: '2-digit'
      });
      html += `<li><strong>${stepTime}</strong> - ${step.label}</li>`;
    });
  } else {
    html += `<li><em>Belum ada log berjalan.</em></li>`;
  }

  html += `</ul></div>`;
  container.innerHTML = html;
}





async function renderRiwayat() {
  const list = document.getElementById("riwayat-list");
  if (!list) return;

  list.innerHTML = `<p>Memuat riwayat...</p>`;

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return;

  let riwayat = [];
  try {
    const snapshot = await db.collection("pesanan")
      .where("userId", "==", user.uid)
      .orderBy("waktuPesan", "desc")
      .get();
    riwayat = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching pesanan:", error);
    list.innerHTML = `<p class="riwayat-kosong-riwayat-transaksi">Gagal memuat riwayat pesanan.</p>`;
    return;
  }

  const driverSnapshot = await db.collection("pesanan_driver").get();
  const mapDriverByPesanan = {};
  driverSnapshot.forEach(doc => {
    const data = doc.data();
    if (data?.idPesanan && data?.idDriver) {
      mapDriverByPesanan[data.idPesanan] = data.idDriver;
    }
  });

  const userDoc = await db.collection("users").doc(user.uid).get();
  const namaCustomer = userDoc.exists ? userDoc.data().nama || "Anda" : "Anda";

  const now = Date.now();
  list.innerHTML = "";

  if (riwayat.length === 0) {
    list.innerHTML = `<p class="riwayat-kosong-riwayat-transaksi">Belum ada pesanan sebelumnya.</p>`;
    return;
  }

  for (let i = 0; i < riwayat.length; i++) {
    const item = riwayat[i];
    const waktuPesan = new Date(item.waktuPesan || now);
    const waktuFormatted = waktuPesan.toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit"
    });

    const statusClass = {
      Pending: "status-menunggu-pesanan",
      Menunggu_Pembayaran: "status-menunggu-pesanan",
      Diproses: "status-menuju-resto",
      Selesai: "status-pesanan-diterima",
      Berhasil: "status-pesanan-diterima",
      Dibatalkan: "status-dibatalkan",
      Menuju_Resto: "status-menuju-resto",
      Menunggu_Pesanan: "status-menunggu-pesanan",
      Pickup_Pesanan: "status-pickup-pesanan",
      Menuju_Customer: "status-menuju-customer",
      Pesanan_Diterima: "status-pesanan-diterima"
    }[item.status.replace(/\s/g, "_")] || "status-menunggu-pesanan";

    const stepLog = Array.isArray(item.stepsLog) ? item.stepsLog : [];
    const historyList = stepLog.length > 0
      ? stepLog.map(log => `🕒 ${log.status || log.label || JSON.stringify(log)}<br>`).join("")
      : `<i>Belum ada langkah berjalan</i>`;

    const produkList = (item.produk || []).map(p => `
      <div class="riwayat-item-produk-riwayat-transaksi">
        <img src="${p.gambar || "https://via.placeholder.com/60"}" alt="${p.nama}" class="riwayat-item-img-riwayat-transaksi" />
        <div class="riwayat-item-info-riwayat-transaksi">
          <div class="riwayat-item-nama-riwayat-transaksi">${p.nama}</div>
          <div class="riwayat-item-jumlah-riwayat-transaksi">Jumlah: x${p.jumlah}</div>
          <div class="riwayat-item-harga-riwayat-transaksi">Total: Rp${(p.harga * p.jumlah).toLocaleString()}</div>
        </div>
      </div>
    `).join("");

    const idDriver = mapDriverByPesanan[item.id] || null;
    let namaDriver = "-";
    if (idDriver) {
      try {
        const driverDoc = await db.collection("driver").doc(idDriver).get();
        if (driverDoc.exists) {
          namaDriver = driverDoc.data().nama || "-";
        }
      } catch (e) {
        console.warn("Gagal mengambil nama driver:", e.message);
      }
    }

    const waktuSelesai = new Date(item.waktuPesan).getTime();
    const selisihWaktu = now - waktuSelesai;

    const isDibatalkan = item.status === "Dibatalkan";
    const isPending = ["Pending"].includes(item.status);
    const isDriverProcess = ["Menuju Resto", "Menunggu Pesanan", "Pickup Pesanan", "Menuju Customer", "Pesanan Diterima"].includes(item.status);
    const isSelesai = ["Selesai", "Berhasil"].includes(item.status);

    let tombolAction = "";

    if (!isDibatalkan) {
      if (isPending) {
        tombolAction += `
<div class="riwayat-chat-actions-riwayat-transaksi">
            <button class="btn-chat-driver-riwayat-transaksi" onclick="renderChatSeller({ 
              idPesanan: '${item.id}', 
              idCustomer: '${item.userId}',
              namaCustomer: '${namaCustomer}',
              namaToko: '${(item.namaToko || "Seller").replace(/'/g, "\\'")}'}
            )">💬 Chat Seller</button>
          
             <button class="btn-batal-pesanan-riwayat-transaksi" onclick="bukaModalPembatalan('${item.id}')">❌ Batalkan Pesanan</button>
          </div>

        `;
      } else if (isDriverProcess) {
        tombolAction += `
          <div class="riwayat-chat-actions-riwayat-transaksi">
            <button class="btn-chat-driver-riwayat-transaksi" onclick="renderChatCustomer({ 
              idPesanan: '${item.id}', 
              idDriver: '${idDriver}', 
              idCustomer: '${item.userId}',
              namaDriver: '${namaDriver}',
              namaCustomer: '${namaCustomer}'
            })">💬 Chat Driver</button>
            <button class="btn-laporkan-driver-riwayat-transaksi" onclick="laporkanDriver('${item.id}', '${idDriver}')">⚠️ Laporkan Driver</button>
          </div>
        `;
      } else if (isSelesai && selisihWaktu > 10 * 60 * 1000 && !item.ratingDiberikan) {
        tombolAction += `
          <div class="riwayat-rating-riwayat-transaksi">
            <button onclick="formRatingRestoDriver('${item.id}')" class="btn-rating-resto-riwayat-transaksi">🌟 Beri Rating</button>
          </div>
        `;
      }
    }

    const box = document.createElement("div");
    box.className = "riwayat-box-riwayat-transaksi";
    box.innerHTML = `
      <div class="riwayat-header-riwayat-transaksi">
        <h4 class="riwayat-id-riwayat-transaksi">🆔 ${item.id}</h4>
        <span class="riwayat-status-riwayat-transaksi ${statusClass}">${item.status}</span>
      </div>

      <div class="riwayat-produk-list-riwayat-transaksi">${produkList}</div>
      <p class="riwayat-subtotal-riwayat-transaksi"><strong>Subtotal:</strong> Rp${item.total?.toLocaleString() || 0}</p>
      <p class="riwayat-metode-riwayat-transaksi"><strong>Metode Pembayaran:</strong> ${item.metode?.toUpperCase() || "-"}</p>
      <p class="riwayat-tanggal-riwayat-transaksi"><small>Waktu Pesan: ${waktuFormatted}</small></p>

      <div class="riwayat-btn-group-riwayat-transaksi">
        <button class="btn-lihat-detail-riwayat-transaksi" onclick="toggleDetail(${i})">Lihat Detail</button>
      </div>

      ${tombolAction}

      <div class="riwayat-detail-riwayat-transaksi" id="detail-${i}" style="display: none;">
        <p><strong>History Waktu:</strong></p>
        <ul class="riwayat-steps-riwayat-transaksi">${historyList}</ul>
      </div>
    `;

    list.appendChild(box);
  }
}






async function renderChatSeller({ idPesanan, idCustomer, namaCustomer = "Anda" }) {
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user || user.uid !== idCustomer) return alert("❌ Anda tidak memiliki akses.");

  const modal = document.getElementById("modal-detail");
  const container = modal.querySelector(".modal-content");

  // Ambil data pesanan untuk mendapatkan tokoId
  const pesananDoc = await db.collection("pesanan").doc(idPesanan).get();
  if (!pesananDoc.exists) return alert("❌ Pesanan tidak ditemukan.");

  const dataPesanan = pesananDoc.data();
  const tokoId = dataPesanan.tokoId || null;

  let namaToko = "Seller";
  if (tokoId) {
    try {
      const tokoDoc = await db.collection("toko").doc(tokoId).get();
      if (tokoDoc.exists) {
        namaToko = tokoDoc.data().nama || "Seller";
      }
    } catch (e) {
      console.warn("Gagal mengambil data toko:", e.message);
    }
  }

  container.innerHTML = `
    <div class="chat-header-chat" style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">💬 Chat dengan ${namaToko}</h2>
      <button onclick="document.getElementById('modal-detail').style.display='none'" style="font-size:18px;">❌</button>
    </div>

    <div style="margin:5px 0;"><strong>Order ID:</strong> ${idPesanan}</div>
    <div class="chat-info-chat" style="margin-bottom:10px; font-size:14px;">
      <p><strong>Anda:</strong> ${namaCustomer}</p>
      <p><strong>Seller:</strong> ${namaToko}</p>
    </div>

    <div id="chat-box-seller" class="chat-box-chat" style="max-height:300px; overflow-y:auto; padding:10px; border:1px solid #ccc; border-radius:8px; background:#f9f9f9; margin-bottom:10px;"></div>

    <div class="chat-form-chat" style="display:flex; gap:8px; margin-bottom:10px;">
      <input type="text" id="chat-input-seller" placeholder="Ketik pesan..." style="flex:1; padding:6px 10px; border-radius:6px; border:1px solid #ccc;" />
      <button onclick="kirimPesanSeller('${idPesanan}', '${idCustomer}', '${namaToko}')">Kirim</button>
    </div>


  `;

  modal.style.display = "flex";

  const chatBox = container.querySelector("#chat-box-seller");

  db.collection("chat_seller")
    .doc(idPesanan)
    .collection("pesan")
    .orderBy("waktu", "asc")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";

      if (snapshot.empty) {
        chatBox.innerHTML = "<p style='text-align:center; color:gray;'>Belum ada pesan.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const isSenderCustomer = data.dari === idCustomer;
        const posisi = isSenderCustomer ? "flex-end" : "flex-start";
        const bgColor = isSenderCustomer ? "#d1f1ff" : "#f1f1f1";
        const waktu = data.waktu?.toDate?.() || new Date();

        const bubble = document.createElement("div");
        bubble.style = `
          align-self: ${posisi};
          background: ${bgColor};
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 8px;
          max-width: 70%;
        `;
        bubble.innerHTML = `
          <div style="font-weight:bold; margin-bottom:3px;">${isSenderCustomer ? "Anda" : namaToko}</div>
          <div>${escapeHTML(data.pesan)}</div>
          <div style="text-align:right; font-size:11px; color:#777;">${waktu.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        chatBox.appendChild(bubble);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}



function escapeHTML(str) {
  return str?.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m])) || '';
}

async function kirimPesanSeller(idPesanan, idCustomer, namaToko) {
  const input = document.getElementById("chat-input-seller");
  const isiPesan = input.value.trim();
  if (!isiPesan) return;

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Anda belum login.");

  const pesanRef = db.collection("chat_seller").doc(idPesanan).collection("pesan");

  await pesanRef.add({
    dari: user.uid,       // id seller = user.uid
    ke: idCustomer,
    nama: namaToko,       // Nama toko sebagai pengirim
    pesan: isiPesan,
    waktu: new Date()
  });

  input.value = "";
}


async function kirimPesanTemplateSeller(pesan, idPesanan, idCustomer, namaToko) {
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Anda belum login.");

  await db.collection("chat_seller").doc(idPesanan).collection("pesan").add({
    dari: user.uid,
    ke: idCustomer,
    nama: namaToko,
    pesan,
    waktu: new Date()
  });
}


function escapeHTML(str) {
  return (str || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[m]);
}


async function renderChatCustomer({ idPesanan, idDriver, idCustomer, namaDriver = "Driver", namaCustomer = "Anda" }) {
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user || user.uid !== idCustomer) return alert("❌ Anda tidak memiliki akses.");

  const modal = document.getElementById("modal-detail");
  const container = modal.querySelector(".modal-content");

  container.innerHTML = `
    <div class="chat-header-chat" style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">💬 Chat dengan ${namaDriver}</h2>
      <button onclick="document.getElementById('modal-detail').style.display='none'" style="font-size:18px;">❌</button>
    </div>

    <div style="margin:5px 0;"><strong>Order ID:</strong> ${idPesanan}</div>
    <div class="chat-info-chat" style="margin-bottom:10px; font-size:14px;">
      <p><strong>Anda:</strong> ${namaCustomer}</p>
      <p><strong>Driver:</strong> ${namaDriver}</p>
    </div>

    <div id="chat-box-customer" class="chat-box-chat" style="max-height:300px; overflow-y:auto; padding:10px; border:1px solid #ccc; border-radius:8px; background:#f9f9f9; margin-bottom:10px;"></div>

    <div class="chat-form-chat" style="display:flex; gap:8px; margin-bottom:10px;">
      <input type="text" id="chat-input-customer" placeholder="Ketik pesan..." style="flex:1; padding:6px 10px; border-radius:6px; border:1px solid #ccc;" />
      <button onclick="kirimPesanCustomer('${idPesanan}', '${idCustomer}', '${idDriver}', '${namaCustomer}')">Kirim</button>
    </div>

    <div class="chat-templates-chat">
      <p><strong>📋 Template Cepat:</strong></p>
      <div class="template-buttons-chat" style="display:flex; flex-wrap:wrap; gap:6px;">
        <button class="mini-btn-chat" onclick="kirimPesanTemplateCustomer('Lokasi saya ada di sini, apakah sudah dekat?', '${idPesanan}', '${idCustomer}', '${idDriver}', '${namaCustomer}')">📍 Lokasi Saya</button>
        <button class="mini-btn-chat" onclick="kirimPesanTemplateCustomer('Berapa lama lagi sampai?', '${idPesanan}', '${idCustomer}', '${idDriver}', '${namaCustomer}')">🕒 Lama Sampai</button>
        <button class="mini-btn-chat" onclick="kirimPesanTemplateCustomer('Tolong letakkan di depan pintu ya', '${idPesanan}', '${idCustomer}', '${idDriver}', '${namaCustomer}')">🚪 Di Depan</button>
        <button class="mini-btn-chat" onclick="kirimPesanTemplateCustomer('Terima kasih ya, pesanannya sudah saya terima.', '${idPesanan}', '${idCustomer}', '${idDriver}', '${namaCustomer}')">✅ Terima Kasih</button>
      </div>
    </div>
  `;

  modal.style.display = "flex";

  const chatBox = container.querySelector("#chat-box-customer");

  db.collection("chat_driver")
    .doc(idPesanan)
    .collection("pesan")
    .orderBy("waktu", "asc")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";

      if (snapshot.empty) {
        chatBox.innerHTML = "<p style='text-align:center; color:gray;'>Belum ada pesan.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const isSenderCustomer = data.dari === idCustomer;
        const posisi = isSenderCustomer ? "flex-end" : "flex-start";
        const bgColor = isSenderCustomer ? "#d1f1ff" : "#f1f1f1";
        const waktu = data.waktu?.toDate?.() || new Date();

        const bubble = document.createElement("div");
        bubble.style = `
          align-self: ${posisi};
          background: ${bgColor};
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 8px;
          max-width: 70%;
        `;
        bubble.innerHTML = `
          <div style="font-weight:bold; margin-bottom:3px;">${isSenderCustomer ? "Anda" : namaDriver}</div>
          <div>${escapeHTML(data.pesan)}</div>
          <div style="text-align:right; font-size:11px; color:#777;">${waktu.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        chatBox.appendChild(bubble);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}



function toggleDetail(index) {
  const el = document.getElementById(`detail-${index}`);
  if (!el) return;

  const isHidden = el.style.display === "none" || el.style.display === "";
  document.querySelectorAll(".riwayat-detail-riwayat-transaksi").forEach(detail => {
    detail.style.display = "none";
  });

  if (isHidden) el.style.display = "block";
}

function filterProduk() {
  const keyword = document.getElementById("search-input").value.trim().toLowerCase();
  const kategori = document.getElementById("filter-kategori").value;
  const produkContainer = document.getElementById("produk-container");

  produkContainer.innerHTML = "";

  const now = new Date();
  const jamSekarang = now.getHours();
  const deliveryAktif = jamSekarang >= 8 && jamSekarang < 24;

  const hasilFilter = produkData.filter(produk => {
    const cocokKeyword =
      produk.nama.toLowerCase().includes(keyword) ||
      produk.toko.toLowerCase().includes(keyword);

    const cocokKategori =
      kategori === "all" ||
      (kategori === "open" && jamSekarang >= produk.buka && jamSekarang < produk.tutup) ||
      produk.kategori.toLowerCase() === kategori;

    return cocokKeyword && cocokKategori;
  });

  if (hasilFilter.length === 0) {
    produkContainer.innerHTML = "<p style='padding: 1rem; color: #999;'>Produk tidak ditemukan.</p>";
    return;
  }

  hasilFilter.forEach((produk, index) => {
    const tokoBuka = jamSekarang >= produk.buka && jamSekarang < produk.tutup;
    const tombolAktif = tokoBuka && deliveryAktif;

    const productCard = `
      <div class="produk-horizontal">
        <div class="produk-toko-bar" onclick="renderTokoPage('${produk.toko.replace(/'/g, "\\'")}')">
          <i class="fa-solid fa-shop"></i>
          <span class="produk-toko-nama">${produk.toko}</span>
          <span class="produk-toko-arrow">›</span>
        </div>
        <div class="produk-body">
          <img src="${produk.gambar}" alt="${produk.nama}" class="produk-img" />
          <div class="produk-info">
            <h1 class="produk-nama">${produk.nama}</h1>
            <p class="produk-meta">Kategori: ${produk.kategori}</p>
            <p class="produk-meta">⭐ ${produk.rating} | ${produk.jarak} | ${produk.estimasi}</p>
            <div class="produk-action">
              <strong>Rp ${produk.harga.toLocaleString()}</strong>
              <button class="beli-btn"
                      data-index="${produkData.indexOf(produk)}"
                      ${tombolAktif ? '' : 'disabled'}>
                ${tombolAktif 
                  ? 'Tambah ke Keranjang' 
                  : (!deliveryAktif ? 'Delivery Tutup' : 'Toko Tutup')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    produkContainer.innerHTML += productCard;
  });

  // Event handler tombol beli
  document.querySelectorAll('.beli-btn').forEach(button => {
    if (!button.disabled) {
      const index = button.getAttribute('data-index');
      button.addEventListener('click', () => tambahKeKeranjang(produkData[index]));
    }
  });
}



async function renderTokoPage(namaToko) {
  const container = document.getElementById("page-container");
  container.innerHTML = "<p>Memuat halaman toko...</p>";

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;

  if (!user) {
    container.innerHTML = "<p>Silakan login terlebih dahulu.</p>";
    return;
  }

  try {
    const alamatDoc = await db.collection("alamat").doc(user.uid).get();
    if (!alamatDoc.exists || !alamatDoc.data().lokasi) {
      container.innerHTML = "<p>Koordinat pengguna tidak ditemukan.</p>";
      return;
    }

    const lokasiUser = alamatDoc.data().lokasi;
    const lat1 = lokasiUser.latitude;
    const lon1 = lokasiUser.longitude;

    const tokoSnapshot = await db.collection("toko")
      .where("namaToko", "==", namaToko)
      .limit(1)
      .get();

    if (tokoSnapshot.empty) {
      container.innerHTML = "<p>Toko tidak ditemukan.</p>";
      return;
    }

    const tokoDoc = tokoSnapshot.docs[0];
    const toko = tokoDoc.data();
    const idToko = tokoDoc.id;

    // Ambil rating dari log_resto > idToko > rating
    let totalRatingToko = 0, countRatingToko = 0;

    const ratingTokoSnap = await db.collection("log_resto").doc(idToko).collection("rating").get();
    ratingTokoSnap.forEach(doc => {
      const data = doc.data();
      if (typeof data.rating === "number") {
        totalRatingToko += data.rating;
        countRatingToko++;
      }
    });

    const rataToko = countRatingToko > 0 ? (totalRatingToko / countRatingToko).toFixed(1) : null;

    // Produk dari toko
    const produkSnapshot = await db.collection("produk").where("idToko", "==", idToko).get();
    const produkToko = [];

    for (const doc of produkSnapshot.docs) {
      const produk = doc.data();
      const idProduk = doc.id;

      // Ambil rating produk dari subcollection rating
      const ratingSnap = await db.collection("produk").doc(idProduk).collection("rating").get();
      let total = 0, count = 0;
      ratingSnap.forEach(r => {
        const data = r.data();
        if (typeof data.rating === "number") {
          total += data.rating;
          count++;
        }
      });

      const rataRating = count > 0 ? (total / count).toFixed(1) : "-";
      const lat2 = toko.koordinat?.latitude || 0;
      const lon2 = toko.koordinat?.longitude || 0;
      const jarakKm = (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2))
        ? hitungJarak(lat1, lon1, lat2, lon2)
        : 0;

      produkToko.push({
        id: idProduk,
        ...produk,
        rating: rataRating,
        tokoNama: toko.namaToko,
        isOpen: toko.isOpen ?? false,
        jarak: `${jarakKm.toFixed(2)} km`
      });
    }

    const gambarToko = toko.foto || './img/toko-pict.png';

    let html = `
      <div class="toko-page">
        <div class="toko-header">
          <img src="${gambarToko}" alt="${toko.namaToko}" class="toko-foto" />
          <div class="toko-detail">
            <strong><h1>${toko.namaToko}</h1></strong>
            ${rataToko
              ? `<p class="toko-rating">⭐ ${rataToko} <span class="toko-ulasan">(${countRatingToko} ulasan)</span></p>`
              : `<p class="toko-belum-ada">Belum ada rating</p>`}
            <p class="toko-deskripsi">${toko.deskripsiToko || ''}</p>
            <p class="toko-lokasi">📍 ${toko.alamatToko || '-'}</p>
          </div>
        </div>
        <hr class="toko-separator" />
        <h2 class="produk-judul">🍽️ Daftar Produk</h2>
        <div id="produk-container">
    `;

    if (produkToko.length === 0) {
      html += `<p>Belum ada produk di toko ini.</p>`;
    } else {
      produkToko.forEach((produk, index) => {
        const tokoAktif = produk.isOpen;
        const stokHabis = (produk.stok || 0) <= 0;
        const disabledAttr = (!tokoAktif || stokHabis) ? 'disabled' : '';
        let btnText = 'Lihat Detail';

        if (!tokoAktif) btnText = 'Toko Tutup';
        else if (stokHabis) btnText = 'Stok Habis';

        const gambarProduk = produk.urlGambar || './img/toko-pict.png';
        const estimasiText = produk.estimasi ? `${produk.estimasi} Menit` : '-';

        html += `
          <div class="produk-horizontal">
            <div class="produk-body">
              <img src="${gambarProduk}" alt="${produk.namaProduk || produk.nama}" class="produk-img" />
              <div class="produk-info">
                <h3 class="produk-nama">${produk.namaProduk || produk.nama}</h3>
                <p class="produk-meta">Kategori: ${produk.kategori || '-'}</p>
                <p class="produk-meta">⭐ ${produk.rating} | ${produk.jarak} | ${estimasiText}</p>
                <div class="produk-action">
                  <strong>Rp ${Number(produk.harga || 0).toLocaleString()}</strong>
                  <button class="beli-btn" data-index="${index}" ${disabledAttr}>
                    ${btnText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }

    html += `</div></div>`;
    container.innerHTML = html;

    document.querySelectorAll('.beli-btn').forEach(button => {
      if (!button.disabled) {
        const index = button.getAttribute('data-index');
        button.addEventListener('click', () => tampilkanPopupDetail(produkToko[index]));
      }
    });

  } catch (err) {
    console.error("❌ Gagal memuat toko:", err);
    container.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${err.message}</p>`;
  }
}



async function prosesCheckout() {
  const user = firebase.auth().currentUser;
  if (!user) return alert("Silakan login terlebih dahulu.");
  const uid = user.uid;
  const db = firebase.firestore();

  const metodePembayaran = document.getElementById("metode-pembayaran")?.value || "saldo";

  const alamatDoc = await db.collection("alamat").doc(uid).get();
  if (!alamatDoc.exists) return alert("❌ Alamat belum tersedia.");
  const { nama, noHp, alamat, lokasi } = alamatDoc.data() || {};

  const keranjangDoc = await db.collection("keranjang").doc(uid).get();
  const produk = keranjangDoc.exists ? keranjangDoc.data().items || [] : [];
  if (produk.length === 0) return alert("❌ Keranjang kosong.");

  const estimasiTotalMenit = produk.reduce((t, i) => t + (parseInt(i.estimasi) || 10), 0);
  const subtotalProduk = produk.reduce((t, i) => t + (i.harga * i.jumlah), 0);
  const totalOngkir = [...new Set(produk.map(p => p.idToko))].reduce((sum, idToko) => {
    const item = produk.find(p => p.idToko === idToko);
    return sum + (item?.ongkir || 0);
  }, 0);

  let kodeVoucher = null;
  let potongan = 0;
  const voucher = window.voucherTerpakai;

  if (voucher?.kode && voucher.potongan) {
    if (voucher.digunakanOleh?.includes(uid)) {
      return alert("❌ Voucher ini sudah pernah digunakan.");
    }

    const nowTime = new Date();
    if (voucher.expired?.toDate?.() && nowTime > voucher.expired.toDate()) {
      return alert("❌ Voucher sudah expired.");
    }

    if (voucher.kuota <= 0) {
      return alert("❌ Kuota voucher sudah habis.");
    }

    if (subtotalProduk < voucher.minimal) {
      return alert(`❌ Minimal order Rp${voucher.minimal.toLocaleString()} untuk menggunakan voucher ini.`);
    }

    kodeVoucher = voucher.kode;
    const tipePotongan = voucher.tipePotongan || "produk";
    const dasarPotongan = tipePotongan === "ongkir" ? totalOngkir : subtotalProduk;

    potongan = voucher.tipe === "persen"
      ? Math.round(dasarPotongan * (parseFloat(voucher.potongan) / 100))
      : parseInt(voucher.potongan);

    if (potongan > dasarPotongan) potongan = dasarPotongan;
  }

  const biayaLayanan = Math.round((subtotalProduk + totalOngkir - potongan) * 0.01);
  const totalBayar = subtotalProduk + totalOngkir + biayaLayanan - potongan;
  if (totalBayar <= 0) return alert("❌ Total bayar tidak valid.");

  const metodePengiriman = document.querySelector('input[name="pengiriman"]:checked')?.value || "standard";
  const catatanPesanan = document.getElementById("catatan-pesanan")?.value.trim() || "-";

  if (metodePembayaran === "saldo") {
    const userDoc = await db.collection("users").doc(uid).get();
    const saldo = userDoc.exists ? userDoc.data().saldo || 0 : 0;
    if (saldo < totalBayar) {
      return alert(`❌ Saldo tidak cukup. Saldo kamu: Rp ${saldo.toLocaleString()}`);
    }
  }

  const now = Date.now();
  const today = new Date();
  const random = Math.floor(Math.random() * 100000);
  const idPesanan = `ORD-${today.toISOString().slice(0, 10).replace(/-/g, "")}-${random}`;
  const waktuTiba = new Date(now + estimasiTotalMenit * 60000);
  const waktuPesanStr = new Date(now).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  const stepsLog = [`${waktuPesanStr} Pesanan dibuat (Pending)`];

  const idTokoUtama = produk[0].idToko;
  const tokoDoc = await db.collection("toko").doc(idTokoUtama).get();
  const lokasiToko = tokoDoc.exists ? tokoDoc.data().koordinat : null;
  if (!lokasiToko) return alert("❌ Lokasi toko belum tersedia.");

  const geoPointToLatLng = geo => {
    if (!geo) return null;
    return geo.latitude !== undefined ? { lat: geo.latitude, lng: geo.longitude } : geo;
  };

  const hitungJarakKM = (a, b) => {
    a = geoPointToLatLng(a); b = geoPointToLatLng(b);
    if (!a || !b) return Infinity;
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 10) / 10;
  };

  const jarakTokoKeUser = hitungJarakKM(lokasiToko, lokasi);
  if (jarakTokoKeUser > 20) return alert("❌ Layanan tidak tersedia di lokasi Anda.");

  const wa = noHp.startsWith("08") ? "628" + noHp.slice(2) : noHp;

  const dataPesanan = {
    id: idPesanan,
    userId: uid,
    nama,
    noHp: wa,
    alamat,
    lokasi,
    produk,
    catatan: catatanPesanan,
    metode: metodePembayaran,
    pengiriman: metodePengiriman,
    estimasiMenit: estimasiTotalMenit,
    status: "Pending",
    stepsLog,
    waktuPesan: now,
    waktuTiba: waktuTiba.getTime(),
    subtotalProduk,
    totalOngkir,
    biayaLayanan,
    potongan,
    total: totalBayar,
    kodeVoucher: kodeVoucher || null,
    tipePotongan: voucher?.tipePotongan || null,
    sudahDiprosesPembayaran: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Simpan data pesanan ke koleksi pesanan
  await db.collection("pesanan").doc(idPesanan).set(dataPesanan);

  // Hapus keranjang setelah checkout
  await db.collection("keranjang").doc(uid).delete();

// Simpan data ke pesanan_penjual menggunakan idPesanan sebagai document ID
await db.collection("pesanan_penjual").doc(idPesanan).set({
  idPesanan,
  idToko: idTokoUtama,
  metode: metodePembayaran,
  namaPembeli: nama,
  noHpPembeli: wa,
  alamatPembeli: alamat,
  lokasiPembeli: lokasi,
  produk: produk.map(item => ({
    nama: item.nama,
    harga: item.harga,
    qty: item.jumlah,
    ongkir: item.ongkir || 0
  })),
  subtotalProduk,
  totalOngkir,
  biayaLayanan,
  potongan,
  total: totalBayar,
  catatan: catatanPesanan,
  pengiriman: metodePengiriman,
  status: "Pending",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});



  // Update kuota voucher jika digunakan
  if (voucher?.id) {
    await db.collection("voucher").doc(voucher.id).update({
      kuota: firebase.firestore.FieldValue.increment(-1),
      digunakanOleh: firebase.firestore.FieldValue.arrayUnion(uid)
    });
  }

  // Reset voucher yang telah digunakan
  window.voucherTerpakai = null;

  // Kosongkan input voucher
  const voucherInput = document.getElementById("voucher");
  if (voucherInput) voucherInput.value = "";
  const voucherFeedback = document.getElementById("voucher-feedback");
  if (voucherFeedback) voucherFeedback.innerText = "";

  // Update rincian harga
  if (document.getElementById("rincian-subtotal")) {
    document.getElementById("rincian-subtotal").innerText = `Rp ${subtotalProduk.toLocaleString()}`;
    document.getElementById("rincian-ongkir").innerText = `Rp ${totalOngkir.toLocaleString()}`;
    document.querySelector(".biaya-layanan span:last-child").innerText = `Rp ${biayaLayanan.toLocaleString()}`;
    document.getElementById("rincian-diskon").innerText = `- Rp ${potongan.toLocaleString()}`;
  }

  if (document.getElementById("footer-total")) {
    document.getElementById("footer-total").innerText = totalBayar.toLocaleString();
    document.getElementById("footer-diskon").innerText = potongan.toLocaleString();
  }

  // Beri tahu pengguna bahwa pesanan berhasil dibuat
  alert("✅ Pesanan berhasil dibuat!");
  renderCheckoutItems();
  if (document.getElementById("riwayat-list")) renderRiwayat();
  loadContent(metodePembayaran);
}









// === Daftar Voucher ===
const voucherList = {
  "VLCRAVE": 0.10,
  "ONGKIR20": 0.20
};

let currentDiskon = 0;

async function cekVoucher() {
  const kode = document.getElementById('voucher')?.value.trim().toUpperCase();
  const feedback = document.getElementById('voucher-feedback');
  const user = firebase.auth().currentUser;
  if (!user) {
    if (feedback) feedback.textContent = "❌ Silakan login untuk menggunakan voucher.";
    return;
  }

  if (!kode) {
    if (feedback) feedback.textContent = "";
    window.voucherTerpakai = null;
    renderCheckoutItems();
    return;
  }

  try {
    const db = firebase.firestore();
    const snapshot = await db.collection("voucher").where("kode", "==", kode).limit(1).get();

    if (snapshot.empty) {
      if (feedback) feedback.textContent = "❌ Kode voucher tidak ditemukan.";
      window.voucherTerpakai = null;
      renderCheckoutItems();
      return;
    }

    const doc = snapshot.docs[0];
    const voucher = doc.data();
    const uid = user.uid;
    const now = new Date();

    if (voucher.digunakanOleh?.includes(uid)) {
      feedback.textContent = "❌ Voucher ini sudah pernah digunakan.";
      window.voucherTerpakai = null;
    } else if (voucher.expired?.toDate?.() && now > voucher.expired.toDate()) {
      feedback.textContent = "❌ Voucher sudah expired.";
      window.voucherTerpakai = null;
    } else if (voucher.kuota <= 0) {
      feedback.textContent = "❌ Kuota voucher sudah habis.";
      window.voucherTerpakai = null;
    } else {
      // Simpan data voucher
      window.voucherTerpakai = {
        ...voucher,
        id: doc.id,
        tipePotongan: voucher.tipePotongan || "produk" // default "produk"
      };

      let info = "✅ Voucher aktif!";
      if (voucher.tipe === "persen") {
        info += ` Diskon ${voucher.potongan}% untuk ${voucher.tipePotongan === "ongkir" ? "ongkir" : "produk"}.`;
      } else {
        info += ` Potongan Rp${parseInt(voucher.potongan).toLocaleString()} untuk ${voucher.tipePotongan}.`;
      }

      feedback.textContent = info;
    }
  } catch (err) {
    console.error("Cek voucher gagal:", err);
    if (feedback) feedback.textContent = "❌ Terjadi kesalahan saat validasi voucher.";
    window.voucherTerpakai = null;
  }

  renderCheckoutItems();
}



function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // dalam kilometer
}


// === Hitung Ongkir ===
function hitungOngkirDenganTipe(tipe, jarak = 0) {
  let ongkir = 8000;
  if (jarak > 2) ongkir += Math.ceil(jarak - 2) * 1500;
  if (tipe === "priority") ongkir += 3500;
  return ongkir;
}



// === Hitung ongkir dari pilihan radio
function hitungOngkir() {
  const metode = document.querySelector('input[name="pengiriman"]:checked')?.value || "standard";
  return hitungOngkirDenganTipe(metode);
}


// === Update Jumlah Produk di Keranjang ===
async function updateJumlah(namaProduk, change) {
  const user = firebase.auth().currentUser;
  if (!user) return alert("❌ Harap login dulu.");

  const db = firebase.firestore();
  const keranjangRef = db.collection("keranjang").doc(user.uid);

  try {
    const snap = await keranjangRef.get();
    let items = snap.exists ? snap.data().items || [] : [];

    const index = items.findIndex(item => item.nama === namaProduk);
    if (index === -1) return;

    items[index].jumlah += change;

    // Tambahkan log perubahan
    items[index].stepslog = items[index].stepslog || [];
    items[index].stepslog.push({
      waktu: new Date().toISOString(),
      pesan: `Jumlah diubah menjadi ${items[index].jumlah}`
    });

    if (items[index].jumlah <= 0) {
      items.splice(index, 1); // Hapus jika 0
    }

    await keranjangRef.set({ items }, { merge: true });

    if (typeof renderCheckoutItems === "function") renderCheckoutItems();
    if (typeof updateCartBadge === "function") updateCartBadge();
  } catch (error) {
    console.error("❌ Gagal update jumlah:", error.message);
  }
}


// === Render daftar item checkout dan update total ===
async function renderCheckoutItems() {
  const listEl = document.getElementById("cart-items-list");
  const totalEl = document.getElementById("total-checkout");
  const footerTotalEl = document.getElementById("footer-total");
  const footerDiskonEl = document.getElementById("footer-diskon");
  const elSubtotal = document.getElementById("rincian-subtotal");
  const elOngkir = document.getElementById("rincian-ongkir");
  const elDiskon = document.getElementById("rincian-diskon");
  const elLayanan = document.querySelector(".rincian-item.biaya-layanan span:last-child");

  const user = firebase.auth().currentUser;
  if (!user || !listEl || !totalEl) return;

  const db = firebase.firestore();
  const doc = await db.collection("keranjang").doc(user.uid).get();
  const cart = doc.exists ? (doc.data().items || []) : [];

  if (cart.length === 0) {
    listEl.innerHTML = "<p style='text-align:center;'>🛒 Keranjang kosong.</p>";
    ['standard', 'priority'].forEach(mode => {
      document.getElementById(`jarak-${mode}`).textContent = "Jarak: -";
      document.getElementById(`ongkir-${mode}`).textContent = "-";
      document.getElementById(`estimasi-${mode}`).textContent = "Estimasi: -";
    });
    footerTotalEl.textContent = "0";
    footerDiskonEl.textContent = "0";
    elSubtotal.textContent = "Rp 0";
    elOngkir.textContent = "Rp 0";
    elDiskon.textContent = "- Rp 0";
    if (elLayanan) elLayanan.textContent = "Rp 0";
    return;
  }

  const tokoCache = {};
  for (const item of cart) {
    if (!item.toko && item.idToko && !tokoCache[item.idToko]) {
      const tokoDoc = await db.collection("toko").doc(item.idToko).get();
      tokoCache[item.idToko] = tokoDoc.exists ? tokoDoc.data().namaToko || item.idToko : item.idToko;
    }
  }

  const grupToko = {};
  cart.forEach(item => {
    const namaToko = item.toko || tokoCache[item.idToko] || "Toko Tidak Diketahui";
    if (!grupToko[namaToko]) grupToko[namaToko] = [];
    grupToko[namaToko].push(item);
  });

  listEl.innerHTML = "";
  let subtotal = 0;
  let totalOngkir = 0;
  const tokoUnik = new Set();

  for (const namaToko in grupToko) {
    listEl.innerHTML += `<li><strong>🛍️ ${namaToko}</strong></li>`;
    const firstItem = grupToko[namaToko][0];
    if (!tokoUnik.has(firstItem.idToko)) {
      tokoUnik.add(firstItem.idToko);
      totalOngkir += parseInt(firstItem.ongkir || 0);
    }

    grupToko[namaToko].forEach(item => {
      const hargaTotal = item.harga * item.jumlah;
      subtotal += hargaTotal;
      listEl.innerHTML += `
        <li style="display: flex; gap: 12px; margin-bottom: 10px;">
          <img src="${item.gambar}" style="width: 60px; height: 60px; object-fit: cover;">
          <div>
            <strong>${item.nama}</strong><br/>
            Jumlah:
            <button onclick="updateJumlahFirestore('${item.nama}', -1)">➖</button>
            ${item.jumlah}
            <button onclick="updateJumlahFirestore('${item.nama}', 1)">➕</button><br/>
            <small>Total: Rp ${hargaTotal.toLocaleString()}</small>
          </div>
        </li>`;
    });

    listEl.innerHTML += `<hr style="margin: 8px 0;">`;
  }

  const alamatDoc = await db.collection("alamat").doc(user.uid).get();
  const lokasi = alamatDoc.exists ? alamatDoc.data().lokasi : null;
  const tokoPertama = cart[0]?.idToko;

  let estimasiStandard = 0;
  let estimasiPriority = 0;
  let jarakToko = 0;

  if (lokasi?.latitude && tokoPertama) {
    const tokoDoc = await db.collection("toko").doc(tokoPertama).get();
    if (tokoDoc.exists && tokoDoc.data().koordinat instanceof firebase.firestore.GeoPoint) {
      const tokoGeo = tokoDoc.data().koordinat;
      const jarak = getDistanceFromLatLonInKm(
        tokoGeo.latitude,
        tokoGeo.longitude,
        lokasi.latitude,
        lokasi.longitude
      );
      jarakToko = jarak;
      estimasiStandard = Math.round(5 + jarak * 4);
      estimasiPriority = Math.round((5 * 0.8) + jarak * 3);

      await db.collection("keranjang").doc(user.uid).update({
        estimasiMenit: estimasiStandard
      });
    }
  }

  const metode = document.querySelector('input[name="pengiriman"]:checked')?.value || 'standard';
  let ongkir = totalOngkir;
  if (metode === 'priority') ongkir += 3500;

  // === Validasi dan Hitung Potongan Voucher ===
  let potongan = 0;
  const voucher = window.voucherTerpakai;
  const nowTime = new Date();

  if (voucher?.kode && voucher.potongan) {
    const isValid =
      (!voucher.digunakanOleh || !voucher.digunakanOleh.includes(user.uid)) &&
      (!voucher.expired?.toDate || nowTime <= voucher.expired.toDate()) &&
      (voucher.kuota > 0) &&
      (subtotal >= voucher.minimal);

    if (isValid) {
      const tipePotongan = voucher.tipePotongan || "produk";
      const dasarPotongan = tipePotongan === "ongkir" ? ongkir : subtotal;

      if (voucher.tipe === "persen") {
        potongan = Math.round(dasarPotongan * (parseFloat(voucher.potongan) / 100));
      } else {
        potongan = parseInt(voucher.potongan);
      }

      if (potongan > dasarPotongan) potongan = dasarPotongan;
    }
  }

  const biayaLayanan = Math.round((subtotal + ongkir - potongan) * 0.01);
  const totalBayar = subtotal + ongkir - potongan + biayaLayanan;

  ['standard', 'priority'].forEach(mode => {
    const est = mode === 'standard' ? estimasiStandard : estimasiPriority;
    const ongkirX = totalOngkir + (mode === 'priority' ? 3500 : 0);
    document.getElementById(`jarak-${mode}`).textContent = `Jarak: ${jarakToko.toFixed(2)} km`;
    document.getElementById(`ongkir-${mode}`).textContent = `Rp ${ongkirX.toLocaleString()}`;
    document.getElementById(`estimasi-${mode}`).textContent = `Estimasi: ±${est} menit`;
  });

  totalEl.innerHTML = `<p><strong>Subtotal:</strong> Rp ${subtotal.toLocaleString()}</p>`;
  elSubtotal.textContent = `Rp ${subtotal.toLocaleString()}`;
  elOngkir.textContent = `Rp ${ongkir.toLocaleString()}`;
  elDiskon.textContent = `- Rp ${potongan.toLocaleString()} (${voucher?.tipePotongan === "ongkir" ? "Ongkir" : "Produk"})`;
  footerTotalEl.textContent = totalBayar.toLocaleString();
  footerDiskonEl.textContent = potongan.toLocaleString();
  if (elLayanan) elLayanan.textContent = `Rp ${biayaLayanan.toLocaleString()}`;

  if (cart.length > 8 || ongkir > 20000) {
    const notifBox = document.createElement('div');
    notifBox.className = "checkout-note";
    notifBox.style = "color:#d9534f; padding: 6px 12px;";
    notifBox.innerHTML = "⚠️ Pesanan mungkin akan telat karena antrian sedang tinggi di toko.";
    totalEl.appendChild(notifBox);
  }
}









async function updateJumlahFirestore(namaProduk, change) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const db = firebase.firestore();
  const ref = db.collection("keranjang").doc(user.uid);
  const doc = await ref.get();
  if (!doc.exists) return;

  const items = doc.data().items || [];
  const index = items.findIndex(i => i.nama === namaProduk);
  if (index === -1) return;

  items[index].jumlah += change;
  if (items[index].jumlah <= 0) items.splice(index, 1);

  await ref.set({ items }, { merge: true });
  renderCheckoutItems();
  updateCartBadge?.();
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cekSaldoUser() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const db = firebase.firestore();
  db.collection("users").doc(user.uid).get().then(doc => {
    if (doc.exists) {
      const saldo = doc.data().saldo || 0;
      window.userSaldo = saldo; // Simpan global

      const select = document.getElementById("metode-pembayaran");
      if (select) {
        // Cari opsi saldo, jika belum ada, tambahkan
        let optionSaldo = select.querySelector("option[value='saldo']");
        if (!optionSaldo) {
          optionSaldo = document.createElement("option");
          optionSaldo.value = "saldo";
          select.appendChild(optionSaldo);
        }

        // Perbarui teks opsi saldo dengan jumlah saldo
        optionSaldo.textContent = `Saldo (Rp ${saldo.toLocaleString()})`;
      }
    } else {
      console.warn("❌ Data user tidak ditemukan.");
    }
  }).catch(err => {
    console.error("❌ Gagal mengambil saldo:", err);
  });
}


async function renderAlamatCheckout() {
  const alamatBox = document.getElementById('alamat-terpilih');
  const user = firebase.auth().currentUser;

  if (!user) {
    alamatBox.innerHTML = `<p>🔒 Harap login terlebih dahulu untuk melihat alamat.</p>`;
    return;
  }

  try {
    const db = firebase.firestore();
    const docRef = db.collection("alamat").doc(user.uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      alamatBox.innerHTML = `<p>⚠️ Alamat belum diisi. Silakan lengkapi di menu Alamat.</p>`;
      return;
    }

    const data = doc.data();
    const nama = data.nama || '-';
    const phone = data.noHp || '-';
    const alamat = data.alamat || 'Alamat belum diisi';
    const note = data.catatan || '-';
    const lokasi = data.lokasi;

    let lokasiLink = '';
    if (lokasi && lokasi.lat && lokasi.lng) {
      lokasiLink = `<br/><a href="https://www.google.com/maps?q=${lokasi.lat},${lokasi.lng}" target="_blank">📍 Lihat Lokasi di Google Maps</a>`;
    }

    // Simpan global jika diperlukan untuk hitung jarak
    window.customerLocation = lokasi;

    alamatBox.innerHTML = `
      <p>👤 ${nama}<br/>📱 ${phone}<br/>🏠 ${alamat}</p>
      <p class="checkout-note">📦 Catatan: ${note}</p>
      ${lokasiLink}
    `;
  } catch (error) {
    console.error("❌ Gagal mengambil alamat:", error);
    alamatBox.innerHTML = `<p style="color:red;">❌ Gagal memuat alamat pengguna.</p>`;
  }
}


// Fungsi cek apakah toko sedang buka
function cekTokoBuka(jamSekarang, buka, tutup) {
  if (buka === tutup) return true; // anggap buka 24 jam
  if (buka < tutup) return jamSekarang >= buka && jamSekarang < tutup;
  return jamSekarang >= buka || jamSekarang < tutup; // buka malam - tutup pagi
}


// Fungsi cek apakah toko sedang buka
function cekTokoBuka(jamSekarang, buka, tutup) {
  if (buka === tutup) return true; // anggap buka 24 jam
  if (buka < tutup) return jamSekarang >= buka && jamSekarang < tutup;
  return jamSekarang >= buka || jamSekarang < tutup; // buka malam - tutup pagi
}

async function renderProductList() {
  const produkContainer = document.getElementById('produk-container');
  if (!produkContainer) return;

  produkContainer.innerHTML = '<div class="loader">⏳ Memuat produk...</div>';

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  if (!user) {
    produkContainer.innerHTML = `<p>❌ Harap login terlebih dahulu.</p>`;
    return;
  }

  try {
    const alamatDoc = await db.collection("alamat").doc(user.uid).get();
    if (!alamatDoc.exists || !alamatDoc.data().lokasi) {
      produkContainer.innerHTML = `<p>❌ Lokasi pengguna tidak ditemukan.</p>`;
      return;
    }

    const lokasiUser = alamatDoc.data().lokasi;
    const lat1 = lokasiUser.latitude;
    const lon1 = lokasiUser.longitude;

    const produkSnapshot = await db.collection("produk").get();
    const produkList = produkSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (produkList.length === 0) {
      produkContainer.innerHTML = '<p>Produk tidak tersedia.</p>';
      return;
    }

    const tokoSnapshot = await db.collection("toko").get();
    const tokoMap = {};
    tokoSnapshot.docs.forEach(doc => {
      const data = doc.data();
      let geo = { lat: 0, lng: 0 };
      if (data.koordinat instanceof firebase.firestore.GeoPoint) {
        geo = {
          lat: data.koordinat.latitude,
          lng: data.koordinat.longitude
        };
      }
      tokoMap[doc.id] = {
        namaToko: data.namaToko || 'Unknown Toko',
        buka: typeof data.jamBuka === 'number' ? data.jamBuka : 0,
        tutup: typeof data.jamTutup === 'number' ? data.jamTutup : 0,
        isOpen: data.isOpen ?? false,
        koordinat: geo
      };
    });

    function hitungJarak(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const produkGabung = [];

    for (const produk of produkList) {
      const produkDoc = await db.collection("produk").doc(produk.id).get();
      const dataProdukFix = produkDoc.exists ? produkDoc.data() : produk;
      const urlGambar = dataProdukFix.urlGambar || './img/toko-pict.png';

      const toko = tokoMap[produk.idToko] || {
        namaToko: 'Unknown Toko',
        buka: 0,
        tutup: 0,
        isOpen: false,
        koordinat: { lat: 0, lng: 0 }
      };

      const lat2 = toko.koordinat.lat;
      const lon2 = toko.koordinat.lng;
      const jarakKm = (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2) && lat2 !== 0)
        ? hitungJarak(lat1, lon1, lat2, lon2)
        : 0;

      const ratingSnap = await db.collection("produk").doc(produk.id).collection("rating").get();
      let total = 0, count = 0;
      ratingSnap.forEach(r => {
        const data = r.data();
        if (typeof data.rating === "number") {
          total += data.rating;
          count++;
        }
      });

      const ratingDisplay = count > 0
        ? `⭐ ${(total / count).toFixed(1)} <span style="color:#888;">(${count} ulasan)</span>`
        : "⭐ -";

      produkGabung.push({
        ...produk,
        ...dataProdukFix,
        tokoNama: toko.namaToko,
        buka: toko.buka,
        tutup: toko.tutup,
        isOpen: toko.isOpen,
        jarak: jarakKm ? `${jarakKm.toFixed(2)} km` : 'N/A',
        jarakNumber: jarakKm,
        ratingDisplay,
        urlGambar
      });
    }

    const produkUrut = produkGabung.sort((a, b) => (a.jarakNumber || Infinity) - (b.jarakNumber || Infinity));

    let html = '';
    produkUrut.forEach((produk, index) => {
      const tokoAktif = produk.isOpen;
      const stokHabis = (produk.stok || 0) <= 0;
      const layananTidakTersedia = produk.jarakNumber > 20;
      const disabledAttr = (!tokoAktif || stokHabis || layananTidakTersedia) ? 'disabled' : '';
      let btnText = 'Lihat Detail';

      if (layananTidakTersedia) btnText = 'Layanan Tidak Tersedia';
      else if (!tokoAktif) btnText = 'Toko Tutup';
      else if (stokHabis) btnText = 'Stok Habis';

      const tokoSafe = (produk.tokoNama || '').replace(/'/g, "\\'");
      const gambarProduk = produk.urlGambar || './img/toko-pict.png';

      html += `
        <div class="produk-horizontal">
          <div class="produk-toko-bar" onclick="renderTokoPage('${tokoSafe}')">
            <i class="fa-solid fa-shop"></i>
            <span class="produk-toko-nama">${produk.tokoNama}</span>
            <span class="produk-toko-arrow">›</span>
          </div>
          <div class="produk-body">
            <img src="${gambarProduk}" alt="${produk.namaProduk}" class="produk-img" />
            <div class="produk-info">
              <p class="produk-nama">${produk.namaProduk}</p>
              <p class="produk-meta">Kategori: ${produk.kategori || '-'}</p>
              <p class="produk-meta">
                ${produk.ratingDisplay} |
                ${produk.jarak || '-'} |
                ${produk.estimasi ? produk.estimasi + ' Menit' : '-'}
              </p>
              <div class="produk-action">
                <strong>Rp ${Number(produk.harga || 0).toLocaleString()}</strong>
                <button class="beli-btn" data-index="${index}" ${disabledAttr}>${btnText}</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    produkContainer.innerHTML = html;

    document.querySelectorAll('.beli-btn').forEach(button => {
      const index = button.getAttribute('data-index');
      const produk = produkUrut[index];

      if (button.disabled) {
        button.addEventListener('click', () => {
          if (produk.jarakNumber > 20) alert("❌ Layanan tidak tersedia untuk lokasi Anda.");
          else if (!produk.isOpen) alert("❌ Toko sedang tutup.");
          else if ((produk.stok || 0) <= 0) alert("❌ Stok produk habis.");
        });
      } else {
        button.addEventListener('click', () => {
          tampilkanPopupDetail(produk);
        });
      }
    });

  } catch (err) {
    console.error("❌ Gagal memuat produk:", err);
    produkContainer.innerHTML = `<p style="color:red;">Terjadi kesalahan saat memuat produk.</p>`;
  }
}







async function tampilkanPopupDetail(produk) {
  const db = firebase.firestore();
  if (!produk.id) return alert("❌ Produk tidak memiliki ID.");

  // Ambil Add-ons
  let addons = [];
  try {
    const addonSnap = await db.collection("produk").doc(produk.id).collection("addons").get();
    addons = addonSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.warn("⚠️ Gagal mengambil addons:", e.message);
  }

  // Ambil Rating + Ulasan
  let totalRating = 0;
  let totalUlasan = 0;
  let daftarUlasan = [];

  try {
    const ratingSnap = await db
      .collection("produk")
      .doc(produk.id)
      .collection("rating")
      .orderBy("timestamp", "desc")
      .get();

    totalUlasan = ratingSnap.size;
    ratingSnap.forEach(doc => {
      const data = doc.data();
      const rating = parseInt(data.rating || 0);
      if (!isNaN(rating)) {
        totalRating += rating;
        if (daftarUlasan.length < 3) {
          daftarUlasan.push({
            rating,
            komentar: data.komentar || "-",
          });
        }
      }
    });
  } catch (e) {
    console.warn("⚠️ Gagal mengambil rating:", e.message);
  }

  const rataRata = totalUlasan > 0 ? (totalRating / totalUlasan) : 0;
  const bintangHTML = totalUlasan > 0
    ? "★".repeat(Math.round(rataRata)).padEnd(5, "☆")
    : "Belum ada ulasan";

  const ulasanHTML = daftarUlasan.map(u => `
    <div style="border: 1px solid #ddd; border-radius: 6px; padding: 8px; margin-bottom: 6px;">
      <div>Rating: ${"★".repeat(u.rating)} (${u.rating}/5)</div>
      <div style="font-style: italic; color: #555;">"${u.komentar}"</div>
    </div>
  `).join("");

  const addonHtml = addons.length ? `
    <div class="popup-addon-list-detail-produk">
      <p><strong>Pilih Add-On:</strong></p>
      ${addons.map(addon => `
        <label class="addon-item-detail-produk">
          <input type="checkbox" class="addon-checkbox"
            data-nama="${addon.nama}" data-harga="${parseInt(addon.harga || 0)}" />
          ${addon.nama} (Rp ${parseInt(addon.harga || 0).toLocaleString("id-ID")})
        </label>
      `).join("")}
    </div>` : `<p><em>Tidak ada add-on tersedia.</em></p>`;

  // Tampilkan Popup
  const popup = document.getElementById("popup-greeting");
  const overlay = document.getElementById("popup-overlay");

  popup.innerHTML = `
    <div class="popup-container-detail-produk">
      <div class="popup-header-detail-produk">
        <span class="popup-close-detail-produk" onclick="tutupPopup()">✕</span>
      </div>

      <img class="popup-img-detail-produk" src="${produk.urlGambar || './img/toko-pict.png'}" alt="Gambar Produk" />

      <div class="popup-text-detail-produk">
        <h3 class="popup-nama-detail-produk">${produk.namaProduk}</h3>

        <div class="popup-info-detail-produk">
          <p><strong>Deskripsi:</strong> ${produk.deskripsi || 'Tidak ada deskripsi.'}</p>
          <p><strong>Estimasi:</strong> ${produk.estimasi || 10} menit</p>
          <p><strong>Kategori:</strong> ${produk.kategori}</p>
          <p><strong>Harga:</strong> Rp <span id="harga-utama">${produk.harga.toLocaleString("id-ID")}</span></p>
        </div>

        ${addonHtml}

        <div class="popup-rating-ulasan" style="margin-top: 16px; border-top: 1px solid #eee; padding-top: 10px;">
          <p><strong>Rating:</strong> ${bintangHTML} ${rataRata.toFixed(1)} (${totalUlasan} ulasan)</p>
          ${totalUlasan > 0 ? `
            <button onclick="tampilkanSemuaUlasan('${produk.id}')" class="btn-mini" style="margin-bottom: 10px;">📋 Lihat Semua Ulasan</button>
            <div class="popup-review-list" style="margin-top: 8px;">${ulasanHTML}</div>
          ` : "<p><em>Belum ada ulasan.</em></p>"}
        </div>
      </div>

      <div class="footer-checkout-detail-produk">
        <button id="tombol-tambah-keranjang" onclick='tambahKeKeranjangDenganAddon(${JSON.stringify(produk)}, ${JSON.stringify(addons)})'>
          <div style="font-size: 15px;">Tambah ke Keranjang</div>
          <div style="font-weight: bold;">Rp ${produk.harga.toLocaleString("id-ID")}</div>
        </button>
      </div>
    </div>
  `;

  popup.style.display = "block";
  overlay.style.display = "block";
  document.body.classList.add("popup-active");

  // Event untuk addon
  document.querySelectorAll(".addon-checkbox").forEach(cb => {
    cb.addEventListener("change", () => hitungSubtotal(produk.harga));
  });
}





async function tampilkanSemuaUlasan(idProduk) {
  const db = firebase.firestore();

  let html = `<h3 style="margin-bottom: 12px;">📋 Semua Ulasan</h3>`;

  try {
    const snap = await db
      .collection("produk")
      .doc(idProduk)
      .collection("rating")
      .orderBy("waktuRating", "desc")
      .get();

    if (snap.empty) {
      html += `<p><em>Belum ada ulasan untuk produk ini.</em></p>`;
    } else {
      snap.forEach(doc => {
        const r = doc.data();
        const waktu = r.waktuRating?.toDate
          ? r.waktuRating.toDate().toLocaleString("id-ID")
          : (new Date(r.waktuRating)).toLocaleString("id-ID");

        const ratingBintang = "⭐".repeat(r.rating || 0);
        const komentar = (r.komentar || "-").trim();
        const namaUser = r.nama || "Anonim";

        html += `
          <div style="border: 1px solid #ddd; border-radius: 8px; padding: 10px; margin-bottom: 10px; background:#fff;">
            <div style="font-weight: bold; font-size: 14px; color: #333;">${namaUser}</div>
            <div style="color: #f1c40f;">${ratingBintang} (${r.rating}/5)</div>
            <div style="font-style: italic; margin: 5px 0; color: #555;">"${komentar}"</div>
            <div style="font-size: 12px; color: #999;">🕒 ${waktu}</div>
          </div>
        `;
      });
    }

    document.getElementById("popup-greeting").innerHTML = `
      <div style="max-height: 70vh; overflow-y: auto; padding: 12px;">
        ${html}
      </div>
      <button onclick="tutupPopup()" class="btn-mini" style="margin-top: 15px;">✕ Tutup</button>
    `;

    document.getElementById("popup-greeting").style.display = "block";
    document.getElementById("popup-overlay").style.display = "block";
    document.body.classList.add("popup-active");

  } catch (error) {
    console.error("❌ Gagal mengambil semua ulasan:", error);
    alert("❌ Terjadi kesalahan saat memuat ulasan.");
  }
}



function hitungSubtotal(hargaProduk) {
  const checkboxes = document.querySelectorAll(".addon-checkbox");
  let subtotal = hargaProduk;

  checkboxes.forEach(cb => {
    if (cb.checked) {
      subtotal += parseInt(cb.dataset.harga || "0");
    }
  });

  // Update tampilan subtotal jika ada
  const subtotalText = document.getElementById("subtotal");
  if (subtotalText) {
    subtotalText.innerText = subtotal.toLocaleString("id-ID");
  }

  // Update tombol dua baris
  const tombol = document.getElementById("tombol-tambah-keranjang");
  if (tombol) {
    tombol.innerHTML = `
      <div style="font-weight: 500;">Tambah ke Keranjang</div>
      <div style="font-weight: bold;">Rp ${subtotal.toLocaleString("id-ID")}</div>
    `;
  }
}






async function simpanEditToko(event, idToko) {
  event.preventDefault();
  const db = firebase.firestore();

  const namaToko = document.getElementById("namaToko").value;
  const deskripsiToko = document.getElementById("deskripsiToko").value;
  const alamatToko = document.getElementById("alamatToko").value;
  const jamBuka = parseInt(document.getElementById("jamBuka").value);
  const jamTutup = parseInt(document.getElementById("jamTutup").value);
  const koordinatStr = document.getElementById("koordinat").value;
  const file = document.getElementById("fileLogo")?.files?.[0];

  let [lat, lng] = koordinatStr.split(",").map(Number);
  if (isNaN(lat) || isNaN(lng)) {
    alert("❌ Koordinat tidak valid.");
    return;
  }

  let logoToko = "/img/toko-pict.png"; // default fallback
  const statusEl = document.getElementById("statusUpload");

  // Ambil data lama
  const doc = await db.collection("toko").doc(idToko).get();
  if (!doc.exists) return alert("❌ Toko tidak ditemukan.");
  const dataLama = doc.data();
  logoToko = dataLama.logoToko || logoToko;

  if (file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "VLCrave-Express");

      const res = await fetch("https://api.cloudinary.com/v1_1/du8gsffhb/image/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      logoToko = result.secure_url;
      if (statusEl) statusEl.innerText = "✅ Logo berhasil diupdate.";
    } catch (err) {
      console.error("❌ Upload logo gagal:", err);
      if (statusEl) statusEl.innerText = "❌ Upload logo gagal.";
      return alert("❌ Gagal upload logo.");
    }
  }

  const updateData = {
    namaToko,
    deskripsiToko,
    alamatToko,
    jamBuka,
    jamTutup,
    logoToko,
    koordinat: new firebase.firestore.GeoPoint(lat, lng),
    updatedAt: new Date()
  };

  try {
    await db.collection("toko").doc(idToko).update(updateData);
    alert("✅ Toko berhasil diperbarui!");
    loadContent('seller-dashboard');
  } catch (err) {
    console.error("❌ Gagal update toko:", err);
    alert("❌ Gagal menyimpan perubahan.");
  }
}



async function simpanEditToko(event, idToko) {
  event.preventDefault();

  const namaToko = document.getElementById("namaToko").value.trim();
  const deskripsiToko = document.getElementById("deskripsiToko").value.trim();
  const alamatToko = document.getElementById("alamatToko").value.trim();
  const jamBuka = parseInt(document.getElementById("jamBuka").value);
  const jamTutup = parseInt(document.getElementById("jamTutup").value);
  const koordinatInput = document.getElementById("koordinat").value.trim();
  const file = document.getElementById("fileLogo")?.files?.[0];
  const statusEl = document.getElementById("statusUpload");

  // Validasi jam
  if (jamBuka < 0 || jamBuka > 23 || jamTutup < 0 || jamTutup > 23) {
    alert("❌ Jam buka dan tutup harus antara 0–23.");
    return;
  }

  // Validasi koordinat
  const [lat, lng] = koordinatInput.split(",");
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) {
    alert("❌ Format koordinat tidak valid. Gunakan format: latitude,longitude");
    return;
  }

  const db = firebase.firestore();

  // Ambil data lama toko
  let logoToko = "/img/toko-pict.png";
  try {
    const doc = await db.collection("toko").doc(idToko).get();
    if (doc.exists) {
      const dataLama = doc.data();
      logoToko = dataLama.logoToko || logoToko;
    }
  } catch (err) {
    console.warn("❗ Gagal ambil data lama toko:", err);
  }

  // Upload logo baru jika dipilih
  if (file) {
    try {
      if (statusEl) statusEl.innerText = "⏳ Mengupload logo ke Cloudinary...";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "VLCrave-Express"); // preset kamu

      const res = await fetch("https://api.cloudinary.com/v1_1/du8gsffhb/image/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      logoToko = result.secure_url;
      if (statusEl) statusEl.innerText = "✅ Logo berhasil diupdate.";
    } catch (err) {
      console.error("❌ Upload logo gagal:", err);
      alert("❌ Gagal upload logo. Gunakan gambar yang lebih ringan atau coba lagi.");
      return;
    }
  }

  try {
    await db.collection("toko").doc(idToko).update({
      namaToko,
      deskripsiToko,
      alamatToko,
      jamBuka,
      jamTutup,
      logoToko,
      koordinat: new firebase.firestore.GeoPoint(latitude, longitude),
      updatedAt: new Date()
    });

    alert("✅ Data toko berhasil diperbarui.");
    loadContent("seller-dashboard");
  } catch (err) {
    console.error("❌ Gagal menyimpan perubahan:", err);
    alert("❌ Gagal menyimpan perubahan. Silakan coba lagi.");
  }
}




function parseGeoPointString(coordStr) {
  // Contoh input: "[1.63468° S, 105.77276° E]"
  if (!coordStr) return null;

  // Hilangkan kurung siku dan spasi berlebih
  coordStr = coordStr.replace(/[\[\]]/g, '').trim();

  // Pisah dengan koma
  const parts = coordStr.split(',');

  if (parts.length !== 2) return null;

  // Parsing lat
  let latPart = parts[0].trim(); // "1.63468° S"
  let latValue = parseFloat(latPart);
  if (latPart.toUpperCase().includes('S')) latValue = -Math.abs(latValue);
  else if (latPart.toUpperCase().includes('N')) latValue = Math.abs(latValue);
  else return null; // kalau gak ada N/S, error

  // Parsing lng
  let lngPart = parts[1].trim(); // "105.77276° E"
  let lngValue = parseFloat(lngPart);
  if (lngPart.toUpperCase().includes('W')) lngValue = -Math.abs(lngValue);
  else if (lngPart.toUpperCase().includes('E')) lngValue = Math.abs(lngValue);
  else return null; // kalau gak ada E/W, error

  return { lat: latValue, lng: lngValue };
}


function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fungsi untuk rating parsing
function parseRating(val) {
  return isNaN(parseFloat(val)) ? 0 : parseFloat(val);
}



async function tambahKeKeranjangDenganAddon(produk, addons = []) {
  try {
    const checkboxes = document.querySelectorAll(".addon-checkbox");
    const addonTerpilih = [];
    let totalAddon = 0;

    checkboxes.forEach(cb => {
      if (cb.checked) {
        const hargaAddon = parseInt(cb.dataset.harga || "0");
        addonTerpilih.push({
          nama: cb.dataset.nama,
          harga: hargaAddon
        });
        totalAddon += hargaAddon;
      }
    });

    // Ambil catatan dari textarea
    const catatanElem = document.querySelector(".popup-text-detail-produk textarea");
    const catatan = catatanElem ? catatanElem.value.trim() : "";

    // Pastikan fungsi tambahKeKeranjang tersedia
    if (typeof tambahKeKeranjang !== "function") {
      throw new Error("Fungsi tambahKeKeranjang tidak ditemukan.");
    }

    // Kirim catatan ke fungsi tambahKeKeranjang
    await tambahKeKeranjang(produk, addonTerpilih, catatan);
    tutupPopup();
    alert("✅ Produk berhasil ditambahkan ke keranjang.");
    
    // Setelah sukses, load halaman checkout
    if (typeof loadContent === "function") {
      loadContent('checkout');
    } else {
      console.warn("Fungsi loadContent tidak ditemukan, tidak dapat pindah ke checkout.");
    }
  } catch (err) {
    console.error("❌ Gagal proses keranjang:", err.message || err);
    alert("❌ Gagal menambahkan ke keranjang.");
  }
}

async function batalkanPesananDriver(idDocDriver, idPesanan) {
  const alasan = prompt("Tulis alasan pembatalan pesanan:");
  if (!alasan || alasan.trim() === "") return alert("❌ Alasan pembatalan wajib diisi.");

  const db = firebase.firestore();
  const now = Date.now();

  try {
    // Ambil data pesanan
    const pesananRef = db.collection("pesanan").doc(idPesanan);
    const pesananDoc = await pesananRef.get();
    if (!pesananDoc.exists) return alert("❌ Pesanan tidak ditemukan.");
    const dataPesanan = pesananDoc.data();
    const idUser = dataPesanan.userId;

    // Update status di pesanan_driver
    await db.collection("pesanan_driver").doc(idDocDriver).update({
      status: "Dibatalkan",
      stepsLog: firebase.firestore.FieldValue.arrayUnion({
        status: `❌ Dibatalkan - ${alasan}`,
        waktu: now
      })
    });

    // Update status di pesanan utama
    await pesananRef.update({
      status: "Dibatalkan",
      stepsLog: firebase.firestore.FieldValue.arrayUnion({
        status: `❌ Dibatalkan oleh driver - ${alasan}`,
        waktu: now
      })
    });

    // ✅ Kirim notifikasi ke chatbox (subkoleksi `chat`)
    await pesananRef.collection("chat").add({
      pengirim: "driver",
      pesan: `❌ Pesanan dibatalkan oleh driver. Alasan: ${alasan}`,
      waktu: firebase.firestore.FieldValue.serverTimestamp(),
      tipe: "notifikasi"
    });

    alert("✅ Pesanan berhasil dibatalkan dan notifikasi dikirim ke chat.");
    loadContent("driver-dashboard");

  } catch (err) {
    console.error("❌ Gagal membatalkan pesanan:", err);
    alert("❌ Terjadi kesalahan saat membatalkan pesanan.");
  }
}

function tutupPopup() {
  document.getElementById("popup-greeting").style.display = "none";
  document.getElementById("popup-overlay").style.display = "none";
  document.body.classList.remove("popup-active");
}


async function tambahKeKeranjang(produk, addonTerpilih = [], catatanPenjual = "") {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("❌ Harap login terlebih dahulu.");
    return;
  }

  const db = firebase.firestore();
  const keranjangRef = db.collection("keranjang").doc(user.uid);

  try {
    // Ambil lokasi user dari koleksi "alamat"
    const alamatDoc = await db.collection("alamat").doc(user.uid).get();
    if (!alamatDoc.exists || !alamatDoc.data().lokasi) {
      throw new Error("Lokasi belum lengkap");
    }

    const lokasiUser = alamatDoc.data().lokasi;
    if (typeof lokasiUser.latitude !== "number" || typeof lokasiUser.longitude !== "number") {
      throw new Error("Lokasi pengguna tidak valid");
    }

    const cust = {
      lat: lokasiUser.latitude,
      lng: lokasiUser.longitude
    };

    // Validasi produk punya idToko
    if (!produk.idToko) throw new Error("Produk tidak memiliki idToko");

    // Ambil lokasi toko
    const tokoDoc = await db.collection("toko").doc(produk.idToko).get();
    if (!tokoDoc.exists) throw new Error("Toko tidak ditemukan");

    const tokoData = tokoDoc.data();
    const koordinatToko = tokoData.koordinat;

    if (!koordinatToko || typeof koordinatToko.latitude !== "number" || typeof koordinatToko.longitude !== "number") {
      throw new Error("Koordinat toko tidak valid");
    }

    const toko = {
      lat: koordinatToko.latitude,
      lng: koordinatToko.longitude
    };

    // Hitung jarak (km)
    const jarak = getDistanceFromLatLonInKm(toko.lat, toko.lng, cust.lat, cust.lng);

    // Estimasi waktu (masak + kirim)
    const estimasiMasak = parseInt(produk.estimasi) || 10;
    const estimasiKirim = Math.ceil(jarak * 4); // 4 menit/km
    const totalEstimasi = estimasiMasak + estimasiKirim;

    // Hitung ongkir
    let ongkir = 8000;
    if (jarak > 2) {
      ongkir += Math.ceil(jarak - 2) * 1500;
    }

    // Total harga add-on
    const totalAddon = addonTerpilih.reduce((sum, addon) => sum + parseInt(addon.harga || 0), 0);
    const totalHarga = (produk.harga || 0) + totalAddon;

    // Ambil isi keranjang
    const snap = await keranjangRef.get();
    let items = snap.exists ? snap.data().items || [] : [];

    // Gabungkan nama produk + add-on untuk pembeda
    const namaGabungan = produk.namaProduk + (addonTerpilih.length ? ` + ${addonTerpilih.map(a => a.nama).join(', ')}` : '');

    // Cek apakah produk ini sudah ada di keranjang (bandingkan nama + addons + catatan)
    const index = items.findIndex(item =>
      item.nama === namaGabungan &&
      item.idToko === produk.idToko &&
      JSON.stringify(item.addon || []) === JSON.stringify(addonTerpilih) &&
      (item.catatanPenjual || "") === catatanPenjual
    );

    if (index !== -1) {
      items[index].jumlah += 1;
    } else {
      items.push({
        nama: namaGabungan,
        idToko: produk.idToko,
        harga: totalHarga,
        gambar: produk.urlGambar || './img/toko-pict.png',
        jumlah: 1,
        estimasi: totalEstimasi,
        ongkir: ongkir,
        jarak: jarak.toFixed(2),
        addon: addonTerpilih,
        catatanPenjual: catatanPenjual, // simpan catatan
        status: "Menunggu Ambil",
        stepslog: [
          {
            waktu: new Date().toISOString(),
            pesan: "Produk dimasukkan ke keranjang"
          }
        ]
      });
    }

    await keranjangRef.set({ items }, { merge: true });

    if (typeof updateCartBadge === "function") updateCartBadge();
    if (window.toast) toast(`✅ ${produk.namaProduk} ditambahkan ke keranjang`);

  } catch (error) {
    console.error("❌ Gagal tambah ke keranjang:", error.message || error);
    alert("❌ Gagal menambahkan ke keranjang: " + (error.message || error));
  }
}

async function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  const icon = document.querySelector('.footer-cart-icon');

  if (!badge || !icon) return;

  const user = firebase.auth().currentUser;
  if (!user) {
    badge.style.display = 'none';
    icon.classList.remove('fa-bounce');
    return;
  }

  try {
    const db = firebase.firestore();
    const doc = await db.collection("keranjang").doc(user.uid).get();
    const items = doc.exists ? (doc.data().items || []) : [];

    const total = items.reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0);

    if (total > 0) {
      badge.textContent = total;
      badge.style.display = 'inline-block';
      icon.classList.add('fa-bounce');
    } else {
      badge.style.display = 'none';
      badge.textContent = '';
      icon.classList.remove('fa-bounce');
    }

  } catch (e) {
    console.error("❌ Gagal memperbarui badge keranjang:", e.message);
  }
}






