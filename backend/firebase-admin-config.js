// Firebase Admin SDK конфигурация для серверной части
const admin = require("firebase-admin");

// Инициализация Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://bibleplay-p2p-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

const db = admin.database();

module.exports = { admin, db };
