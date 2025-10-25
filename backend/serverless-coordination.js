// Serverless координационный сервер для Vercel/Netlify
import { getDatabase, ref, set, get, remove, onValue, off } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "bibleplay-p2p.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://bibleplay-p2p-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "bibleplay-p2p",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "bibleplay-p2p.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "931731334835",
  appId: process.env.FIREBASE_APP_ID || "1:931731334835:web:XXXXXXXXXXXXXXXX"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Хранилище активных соединений (в памяти)
const activeConnections = new Map();

// Создание комнаты
export const createRoom = async (roomId, hostInfo) => {
  try {
    const roomData = {
      roomId,
      hostId: hostInfo.hostId,
      playerName: hostInfo.playerName,
      maxPlayers: hostInfo.maxPlayers || 8,
      gameType: hostInfo.gameType || 'chronology',
      players: [{
        id: hostInfo.hostId,
        name: hostInfo.playerName,
        isHost: true,
        connected: true
      }],
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    await set(ref(db, `rooms/${roomId}`), roomData);
    
    // Устанавливаем таймер на удаление (5 минут)
    setTimeout(() => {
      removeRoom(roomId);
    }, 300000);

    console.log('[SERVERLESS] Комната создана:', roomId);
    return { success: true, roomId };
    
  } catch (error) {
    console.error('[SERVERLESS] Ошибка создания комнаты:', error);
    return { success: false, error: error.message };
  }
};

// Поиск комнаты
export const findRoom = async (roomId) => {
  try {
    const snapshot = await get(ref(db, `rooms/${roomId}`));
    const room = snapshot.val();
    
    if (!room) {
      return { success: false, error: 'Комната не найдена' };
    }

    // Обновляем активность
    await set(ref(db, `rooms/${roomId}/lastActivity`), Date.now());
    
    return { 
      success: true, 
      room: {
        roomId: room.roomId,
        hostId: room.hostId,
        playerName: room.playerName,
        maxPlayers: room.maxPlayers,
        gameType: room.gameType,
        playersCount: room.players.length
      }
    };
    
  } catch (error) {
    console.error('[SERVERLESS] Ошибка поиска комнаты:', error);
    return { success: false, error: error.message };
  }
};

// Подключение к комнате
export const joinRoom = async (roomId, playerInfo) => {
  try {
    const snapshot = await get(ref(db, `rooms/${roomId}`));
    const room = snapshot.val();
    
    if (!room) {
      return { success: false, error: 'Комната не найдена' };
    }
    
    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Комната заполнена' };
    }
    
    // Добавляем игрока
    const newPlayer = {
      id: playerInfo.playerId,
      name: playerInfo.playerName,
      isHost: false,
      connected: true
    };
    
    room.players.push(newPlayer);
    room.lastActivity = Date.now();
    
    await set(ref(db, `rooms/${roomId}`), room);
    
    console.log('[SERVERLESS] Игрок подключился:', roomId, playerInfo.playerName);
    return { success: true, roomId };
    
  } catch (error) {
    console.error('[SERVERLESS] Ошибка подключения к комнате:', error);
    return { success: false, error: error.message };
  }
};

// Удаление комнаты
export const removeRoom = async (roomId) => {
  try {
    await remove(ref(db, `rooms/${roomId}`));
    console.log('[SERVERLESS] Комната удалена:', roomId);
    return { success: true };
  } catch (error) {
    console.error('[SERVERLESS] Ошибка удаления комнаты:', error);
    return { success: false, error: error.message };
  }
};

// Обмен WebRTC сигналами
export const exchangeSignal = async (fromId, toId, signal, type) => {
  try {
    // Сохраняем сигнал в Firebase
    await set(ref(db, `signals/${toId}/${fromId}`), {
      signal,
      type,
      timestamp: Date.now()
    });
    
    console.log('[SERVERLESS] WebRTC сигнал сохранен:', type, 'от', fromId, 'к', toId);
    return { success: true };
    
  } catch (error) {
    console.error('[SERVERLESS] Ошибка обмена сигналами:', error);
    return { success: false, error: error.message };
  }
};

// Получение сигналов для игрока
export const getSignals = async (playerId) => {
  try {
    const snapshot = await get(ref(db, `signals/${playerId}`));
    const signals = snapshot.val() || {};
    
    // Удаляем полученные сигналы
    await remove(ref(db, `signals/${playerId}`));
    
    return { success: true, signals };
    
  } catch (error) {
    console.error('[SERVERLESS] Ошибка получения сигналов:', error);
    return { success: false, error: error.message };
  }
};

// Получение списка активных комнат
export const getActiveRooms = async () => {
  try {
    const snapshot = await get(ref(db, 'rooms'));
    const rooms = snapshot.val() || {};
    
    const roomsList = Object.values(rooms).map(room => ({
      roomId: room.roomId,
      playerName: room.playerName,
      playersCount: room.players.length,
      maxPlayers: room.maxPlayers,
      gameType: room.gameType,
      createdAt: room.createdAt
    }));
    
    return { success: true, rooms: roomsList };
    
  } catch (error) {
    console.error('[SERVERLESS] Ошибка получения списка комнат:', error);
    return { success: false, error: error.message };
  }
};

// Очистка неактивных комнат
export const cleanupInactiveRooms = async () => {
  try {
    const snapshot = await get(ref(db, 'rooms'));
    const rooms = snapshot.val() || {};
    const now = Date.now();
    
    for (const [roomId, room] of Object.entries(rooms)) {
      if (now - room.lastActivity > 300000) { // 5 минут
        await remove(ref(db, `rooms/${roomId}`));
        console.log('[SERVERLESS] Удалена неактивная комната:', roomId);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('[SERVERLESS] Ошибка очистки комнат:', error);
    return { success: false, error: error.message };
  }
};

// Статистика
export const getStats = async () => {
  try {
    const snapshot = await get(ref(db, 'rooms'));
    const rooms = snapshot.val() || {};
    
    const totalRooms = Object.keys(rooms).length;
    const totalPlayers = Object.values(rooms).reduce((sum, room) => sum + room.players.length, 0);
    
    return {
      success: true,
      stats: {
        activeRooms: totalRooms,
        totalPlayers,
        timestamp: Date.now()
      }
    };
    
  } catch (error) {
    console.error('[SERVERLESS] Ошибка получения статистики:', error);
    return { success: false, error: error.message };
  }
};
