// Инициализация firebase-admin для serverless-функций Vercel
const admin = require('firebase-admin');

// Чтобы избежать повторной инициализации при холодных стартах
if (!admin.apps.length) {
  let credential;
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svc) {
    // Ожидаем JSON или base64-строку JSON
    let json;
    try {
      json = JSON.parse(svc);
    } catch {
      const decoded = Buffer.from(svc, 'base64').toString('utf8');
      json = JSON.parse(decoded);
    }
    credential = admin.credential.cert(json);
  } else {
    // fallback: application default (если настроено) или без кредов (для правил open)
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({
    credential,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

module.exports = admin;


