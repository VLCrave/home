// WAJIB pakai compat untuk sw
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js");

// Inisialisasi ulang Firebase di Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyAfBzoX9kUwUTWfQYT6QLndd_mP03__8Wo",
  authDomain: "vlcrave-express.firebaseapp.com",
  projectId: "vlcrave-express",
  storageBucket: "vlcrave-express.appspot.com",
  messagingSenderId: "609330453287",
  appId: "1:609330453287:web:5280b9ec5c0d435518e702"
});

const messaging = firebase.messaging();
