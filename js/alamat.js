let map, customerMarker;
let customerLocation = { lat: -1.6409437, lng: 105.7686011 }; // Default lokasi

function initMap(lat = customerLocation.lat, lng = customerLocation.lng) {
  if (map) return; // Jangan buat ulang peta jika sudah ada

  map = L.map('map-container').setView([lat, lng], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  customerMarker = L.marker([lat, lng], { draggable: true })
    .addTo(map)
    .bindPopup("📍 Lokasi Anda")
    .openPopup();

  customerMarker.on('dragend', e => {
    const pos = e.target.getLatLng();
    customerLocation = { lat: pos.lat, lng: pos.lng };
    saveOnlyLocation(pos.lat, pos.lng);
  });
}

function toggleAddressForm(editMode = false) {
  document.getElementById('address-form').style.display = 'block';
  document.getElementById('address-display').style.display = 'none';
  const formTitle = document.getElementById('form-title');
  if (formTitle) formTitle.textContent = editMode ? "Edit Alamat Pengiriman" : "Tambah Alamat Pengiriman";
}

function saveAddress() {
  const nama = document.getElementById('full-name').value.trim();
  const noHp = document.getElementById('phone-number').value.trim();
  const alamat = document.getElementById('full-address').value.trim();
  const catatan = document.getElementById('courier-note').value.trim();

  if (!nama || !noHp || !alamat) return alert("❌ Mohon lengkapi semua data alamat.");

  const user = firebase.auth().currentUser;
  if (!user) return;

  const db = firebase.firestore();
  const uid = user.uid;

  const dataAlamat = {
    userId: uid,
    nama,
    noHp,
    alamat,
    catatan,
    lokasi: new firebase.firestore.GeoPoint(customerLocation.lat, customerLocation.lng),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("alamat").doc(uid).set(dataAlamat)
    .then(() => {
      alert("✅ Alamat berhasil disimpan.");
      loadSavedAddress();
    })
    .catch(err => {
      console.error("❌ Gagal menyimpan:", err);
      alert("❌ Gagal menyimpan alamat.");
    });
}

function saveOnlyLocation(lat, lng) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  firebase.firestore().collection("alamat").doc(user.uid).update({
    lokasi: new firebase.firestore.GeoPoint(lat, lng)
  }).then(() => {
    console.log("📍 Lokasi diperbarui.");
  }).catch(err => {
    console.error("❌ Gagal update lokasi:", err);
  });
}

function loadSavedAddress() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const db = firebase.firestore();
  db.collection("alamat").doc(user.uid).get()
    .then(doc => {
      const box = document.getElementById('address-display');
      const text = document.getElementById('saved-address');
      const note = document.getElementById('saved-note');

      if (doc.exists) {
        const data = doc.data();
        box.style.display = 'block';
        document.getElementById('address-form').style.display = 'none';
        text.innerHTML = `👤 ${data.nama}<br/>📱 ${data.noHp}<br/>🏠 ${data.alamat}`;
        note.textContent = data.catatan || '-';

        if (data.lokasi && data.lokasi.latitude !== undefined && data.lokasi.longitude !== undefined) {
          customerLocation = {
            lat: data.lokasi.latitude,
            lng: data.lokasi.longitude
          };

          if (map && customerMarker) {
            map.setView([customerLocation.lat, customerLocation.lng], 17);
            customerMarker.setLatLng([customerLocation.lat, customerLocation.lng]);
          } else {
            setTimeout(() => {
              initMap(customerLocation.lat, customerLocation.lng);
            }, 100);
          }
        } else {
          console.warn("❌ Lokasi tidak ditemukan, menggunakan default.");
          setTimeout(() => initMap(), 100);
        }
      } else {
        document.getElementById('address-form').style.display = 'block';
        box.style.display = 'none';
        setTimeout(() => initMap(), 100);
      }
    })
    .catch(err => {
      console.error("❌ Gagal memuat alamat:", err);
    });
}

function deleteAddress() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (confirm("Yakin ingin menghapus alamat ini?")) {
    firebase.firestore().collection("alamat").doc(user.uid).delete()
      .then(() => {
        alert("✅ Alamat dihapus.");
        loadSavedAddress();
      })
      .catch(err => {
        alert("❌ Gagal menghapus alamat.");
        console.error(err);
      });
  }
}
