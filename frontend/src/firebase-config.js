// Firebase конфигурация для P2P координации
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Замените на ваш API ключ
  authDomain: "bibleplay-p2p.firebaseapp.com",
  databaseURL: "https://bibleplay-p2p-default-rtdb.firebaseio.com", // Замените на ваш URL
  projectId: "bibleplay-p2p",
  storageBucket: "bibleplay-p2p.appspot.com",
  messagingSenderId: "931731334835",
  appId: "1:931731334835:web:XXXXXXXXXXXXXXXX" // Замените на ваш App ID
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
export default app;
