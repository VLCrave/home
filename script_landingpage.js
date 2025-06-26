const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('active');
  menuToggle.classList.toggle('menu-open');
});



// === Format angka ribuan (locale Indonesia) ===
function formatNumber(num) {
  return num.toLocaleString('id-ID');
}

// === Statistik Dinamis ===
const baseUser = 1000;
const baseVisit = 100000;
const baseFeature = 55;

// Start time: 26 Juni 2025 pukul 00:00
const startTime = new Date('2025-06-26T00:00:00');
const now = new Date();

// Hitung selisih waktu
const diffMs = now - startTime;
const diffHours = Math.floor(diffMs / (1000 * 60 * 60));      // Selisih jam
const diffDays = Math.floor(diffHours / 24);                  // Setiap 24 jam = 1 hari

// Perhitungan statistik dinamis
const totalUser = baseUser + diffHours;            // +1 user per jam
const totalVisit = baseVisit + (diffHours * 50);   // +50 visit per jam
const totalFeature = baseFeature + (diffDays * 2); // +2 fitur per 24 jam

// Format angka lokal Indonesia
function formatNumber(num) {
  return num.toLocaleString('id-ID');
}

// Tampilkan ke HTML
document.getElementById('totalUser').innerHTML = `<i class="fas fa-users"></i> ${formatNumber(totalUser)}`;
document.getElementById('totalVisit').innerHTML = `<i class="fas fa-eye"></i> ${formatNumber(totalVisit)}`;
document.getElementById('totalFeature').innerHTML = `<i class="fas fa-cube"></i> ${formatNumber(totalFeature)}`;


// === Slider Fitur Unggulan ===
const slider = document.getElementById('featureSlider');
const fiturList = [
  {
    img: 'https://png.pngtree.com/png-clipart/20220405/original/pngtree-3d-metal-vip-badge-wheat-ear-decoration-png-image_7522414.png',
    title: 'Cheat Game',
    desc: 'Fitur terbaik untuk player yang ingin bersenang-senang / menaikkan rank dengan gampang.',
    price: 'Rp100.000'
  },
{
    img: 'https://cdn-icons-png.flaticon.com/512/12409/12409452.png',
    title: 'Tools',
    desc: 'Pusing akses tools gratis tapi banyak iklan? VLCrave Project menyediakan semua dalam satu klik secara gratis tanpa iklan!',
    price: 'Rp50.000'
  },
  {
    img: 'https://www.edigitalagency.com.au/wp-content/uploads/ChatGPT-logo-PNG-medium-size-white-green-background.png',
    title: 'Prompt ChatGPT',
    desc: '600+ prompt Viral ChatGPT terbaru tinggal salin dan langsung pakai.',
    price: 'Rp75.000'
  },
  {
    img: 'https://e7.pngegg.com/pngimages/365/856/png-clipart-gift-card-voucher-online-shopping-product-return-gift-miscellaneous-ribbon.png',
    title: 'Ucapan Generator',
    desc: 'Buat kartu ucapan dalam berbagai tema secara otomatis dalam satu kali klik.',
    price: 'Rp25.000'
  },
  {
    img: 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg',
    title: 'Room Wangi',
    desc: 'Settingan + Tutorial Lengkap yang sudah dirangkum untuk membuat Room Wangi Mobile Legends Paling Update setiap patch.',
    price: 'Rp200.000'
  },
  {
    img: 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg',
    title: 'Room Bot',
    desc: 'Settingan + Tutorial Lengkap yang sudah dirangkum untuk membuat Room Bot Mobile Legends.',
    price: 'Rp100.000'
  },
  {
    img: 'https://images.ctfassets.net/4cd45et68cgf/Rx83JoRDMkYNlMC9MKzcB/2b14d5a59fc3937afd3f03191e19502d/Netflix-Symbol.png?w=700&h=456',
    title: 'Aplikasi Premium',
    desc: 'Total 50+ Aplikasi berbayar Subscription setiap bulan yang dapat kamu akses secara Gratis.',
    price: 'Rp1.000.000'
  },
{
    img: 'https://www.pngarts.com/files/4/Minecraft-Logo-PNG-Image.png',
    title: 'Aplikasi Original',
    desc: 'Total 50+ Aplikasi berbayar yang dapat kamu unduh dalam satu klik secara Gratis.',
    price: 'Rp1.000.000'
  },
{
    img: 'https://cdn.freebiesupply.com/logos/large/2x/ebook-logo-svg-vector.svg',
    title: 'E-Book Premium',
    desc: 'Total 500+ E-Book Premium berbagai kategori berbayar  yang dapat kamu akses secara Gratis.',
    price: 'Rp500.000'
  },
  {
    img: 'https://freepnglogo.com/images/all_img/1691829400logo-canva-png.png',
    title: 'Template Canva',
    desc: '100+ template Canva pilihan premium yang dapat kamu pilih dalam satu klik.',
    price: 'Rp35.000'
  }
]


const duplicated = [...fiturList, ...fiturList, ...fiturList];
duplicated.forEach(fitur => {
  const item = document.createElement('div');
  item.className = 'feature-item';
  item.innerHTML = `
    <img src="${fitur.img}" alt="${fitur.title}" />
    <h4>${fitur.title}</h4>
    <p>${fitur.desc}</p>
    <div class="feature-price">${fitur.price}</div>
  `;
  slider.appendChild(item);
});

function updateActive() {
  const items = document.querySelectorAll('.feature-item');
  const sliderRect = slider.getBoundingClientRect();
  const center = sliderRect.left + sliderRect.width / 2;
  let closest = null;
  let closestDist = Infinity;

  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const distance = Math.abs(center - itemCenter);
    if (distance < closestDist) {
      closestDist = distance;
      closest = item;
    }
  });

  items.forEach(item => item.classList.remove('active'));
  if (closest) closest.classList.add('active');
}

function nextSlide() {
  slider.scrollBy({ left: 270, behavior: 'smooth' });
}

let autoScroll;
let autoScrollDelay;

function startAutoScroll() {
  autoScroll = setInterval(nextSlide, 3000);
}

function stopAutoScrollTemporarily() {
  clearInterval(autoScroll);
  clearTimeout(autoScrollDelay);
  autoScrollDelay = setTimeout(() => {
    startAutoScroll();
  }, 5000);
}

slider.addEventListener('scroll', updateActive);
slider.addEventListener('mousedown', stopAutoScrollTemporarily);
slider.addEventListener('touchstart', stopAutoScrollTemporarily);
slider.addEventListener('mouseup', stopAutoScrollTemporarily);
slider.addEventListener('touchend', stopAutoScrollTemporarily);

updateActive();
startAutoScroll();

// === Generate Fitur CTA Section ===
const fiturContainer = document.getElementById('fiturListContainer');
let totalHarga = 0;

if (fiturContainer) {
  fiturList.forEach(fitur => {
    const li = document.createElement('li');
    li.innerHTML = `
  <span class="fitur-nama">
    ✅ ${fitur.title}
    <span class="badge-premium">Premium</span>
  </span>
  <span class="price">${fitur.price}</span>
`;

    fiturContainer.appendChild(li);

    const angka = parseInt(fitur.price.replace(/[^\d]/g, '')) || 0;
    totalHarga += angka;
  });
}

const hargaPromo = 89000;
const persenDiskon = Math.round(((totalHarga - hargaPromo) / totalHarga) * 100);

// Update elemen jika ada
const elAsli = document.getElementById('totalHargaAsli');
const elPromo = document.getElementById('hargaPromo');
const elDiskon = document.getElementById('persenDiskon');

if (elAsli) elAsli.textContent = `Rp${formatNumber(totalHarga)}`;
if (elPromo) elPromo.textContent = `Rp${formatNumber(hargaPromo)}`;
if (elDiskon) elDiskon.textContent = `${persenDiskon}%`;



// === COUNTDOWN REALTIME (30 hari dari hari ini) ===
const countdownEnd = new Date("2025-07-26T18:00:00+07:00"); // Format ISO dengan zona waktu WIB
countdownEnd.setDate(countdownEnd.getDate() + 30);

// Simpan referensi DOM
const elDays = document.getElementById("days");
const elHours = document.getElementById("hours");
const elMinutes = document.getElementById("minutes");
const elSeconds = document.getElementById("seconds");

setInterval(() => {
  const now = new Date();
  const selisih = countdownEnd - now;

  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  if (selisih <= 0) {
    elDays.textContent = "00";
    elHours.textContent = "00";
    elMinutes.textContent = "00";
    elSeconds.textContent = "00";
    return;
  }

  const days = Math.floor(selisih / (1000 * 60 * 60 * 24));
  const hours = Math.floor((selisih / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((selisih / (1000 * 60)) % 60);
  const seconds = Math.floor((selisih / 1000) % 60);

  elDays.textContent = String(days).padStart(2, '0');
  elHours.textContent = String(hours).padStart(2, '0');
  elMinutes.textContent = String(minutes).padStart(2, '0');
  elSeconds.textContent = String(seconds).padStart(2, '0');
}, 1000);




// === FAQ Accordion ===
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const allItems = document.querySelectorAll('.faq-item');
    if (item.classList.contains('active')) {
      item.classList.remove('active');
    } else {
      allItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    }
  });
});

// === TESTIMONIAL SLIDER ===
const testimonialSlider = document.getElementById("testimonialSlider");

const testimonials = [
  {
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScsg7vbHBvu5Lu2SYjgSPtVaLc_fCfScFftw&s",
    nama: "Rian Setiawan",
    asal: "Surabaya",
    isi: "Setelah join, income bulanan saya meningkat 3x lipat karena jualan tools premium ini!",
    tanggal: "22 Juni 2025"
  },
  {
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScsg7vbHBvu5Lu2SYjgSPtVaLc_fCfScFftw&s",
    nama: "Dina Pratiwi",
    asal: "Bandung",
    isi: "Banyak ilmu baru dan fitur yang sangat berguna untuk bantu saya jadi content creator!",
    tanggal: "20 Juni 2025"
  },
  {
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScsg7vbHBvu5Lu2SYjgSPtVaLc_fCfScFftw&s",
    nama: "Ahmad Zulfikar",
    asal: "Jakarta",
    isi: "Saya bisa jual ulang tools dan hasilnya bisa bantu biaya kuliah saya. Recommended banget!",
    tanggal: "18 Juni 2025"
  },
  {
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScsg7vbHBvu5Lu2SYjgSPtVaLc_fCfScFftw&s",
    nama: "Laras Putri",
    asal: "Yogyakarta",
    isi: "Sangat puas! Semua fitur berjalan baik dan mudah digunakan. Support juga cepat!",
    tanggal: "15 Juni 2025"
  }
];

// Duplikat untuk infinite loop mulus
const extendedTestimonials = [...testimonials, ...testimonials];

extendedTestimonials.forEach(t => {
  const div = document.createElement("div");
  div.className = "testimonial-item";
  div.innerHTML = `
    <img src="${t.img}" alt="${t.nama}" />
    <h4>${t.nama}</h4>
    <small>${t.asal}</small>
    <p>"${t.isi}"</p>
    <div class="testimonial-date">${t.tanggal}</div>
  `;
  testimonialSlider.appendChild(div);
});

// Mulai auto slide
let currentTestimonial = 0;
const totalTestimonials = extendedTestimonials.length;

function autoSlideTestimonials() {
  currentTestimonial++;

  // Transisi biasa
  testimonialSlider.style.transition = 'transform 0.6s ease-in-out';
  testimonialSlider.style.transform = `translateX(-${currentTestimonial * 100}%)`;

  // Reset ke awal tanpa transisi saat mencapai akhir duplikat
  if (currentTestimonial >= totalTestimonials - testimonials.length) {
    setTimeout(() => {
      testimonialSlider.style.transition = 'none';
      testimonialSlider.style.transform = `translateX(0%)`;
      currentTestimonial = 0;
    }, 650); // waktu lebih dari transition duration agar tidak glitch
  }
}

// Mulai interval
setInterval(autoSlideTestimonials, 4000);

// Form Pesan

 document.getElementById("pesanForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const nomor = document.getElementById("nomor").value;
    const pesan = document.getElementById("pesan").value;
    const statusEl = document.getElementById("statusKirim");

    const token = '8196700726:AAEjKwEWTyHOjFvRghZIlW6ECQfmpdzcZIg';
    const chat_id = '6046360096';
    const text = `📥 Pesan Baru dari Website:\n\n👤 Nama: ${nama}\n📧 Email: ${email}\n📱 Nomor HP: ${nomor}\n💬 Pesan:\n${pesan}`;

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text })
    })
    .then(res => {
      if (res.ok) {
        statusEl.textContent = "✅ Pesan berhasil dikirim!";
        statusEl.style.color = "#00ffcc";
        document.getElementById("pesanForm").reset();
      } else {
        throw new Error("Gagal mengirim");
      }
    })
    .catch(err => {
      statusEl.textContent = "❌ Gagal mengirim pesan. Coba lagi.";
      statusEl.style.color = "red";
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 70, // Sesuaikan offset jika ada header tetap
          behavior: 'smooth'
        });
      }
    });
  });