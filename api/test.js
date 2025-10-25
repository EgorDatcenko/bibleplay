// Простая тестовая API функция для проверки Firebase
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyBEO0F_911vQE5RSXQ3PMRW7SESzUryhiU",
  authDomain: "bibleplay-p2p.firebaseapp.com",
  databaseURL: "https://bibleplay-p2p-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bibleplay-p2p",
  storageBucket: "bibleplay-p2p.firebasestorage.app",
  messagingSenderId: "931731334835",
  appId: "1:931731334835:web:768a2c4293ecbf11df72c6"
};

module.exports = async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Инициализация Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // Тестовая запись в Firebase
    const testRef = ref(db, 'test/connection');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Firebase connection test successful'
    });

    // Чтение из Firebase
    const snapshot = await get(testRef);
    const data = snapshot.val();

    res.json({
      success: true,
      message: 'Firebase connection successful',
      data: data,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[TEST] Ошибка:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
