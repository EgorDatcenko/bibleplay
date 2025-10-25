// Firebase конфигурация для P2P координации
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBEO0F_911vQE5RSXQ3PMRW7SESzUryhiU",
  authDomain: "bibleplay-p2p.firebaseapp.com",
  databaseURL: "https://bibleplay-p2p-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bibleplay-p2p",
  storageBucket: "bibleplay-p2p.firebasestorage.app",
  messagingSenderId: "931731334835",
  appId: "1:931731334835:web:768a2c4293ecbf11df72c6",
  measurementId: "G-M2JM0K8JVV"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
export default app;
