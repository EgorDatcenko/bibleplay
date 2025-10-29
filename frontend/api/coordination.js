// Упрощенная API функция для координации P2P (Vercel, Root=frontend)
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const { action } = req.query;
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    if (action === 'create-room' && req.method === 'POST') {
      const { roomId, hostId, playerName, maxPlayers, gameType } = req.body || {};
      if (!roomId || !hostId || !playerName) {
        return res.status(400).json({ success: false, error: 'Недостаточно данных' });
      }
      const room = {
        roomId,
        hostId,
        playerName,
        maxPlayers: maxPlayers || 8,
        gameType: gameType || 'chronology',
        players: [{ id: hostId, name: playerName, isHost: true, connected: true }],
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      await set(ref(db, `rooms/${roomId}`), room);
      return res.json({ success: true, roomId });
    }

    if (action === 'find-room' && req.method === 'GET') {
      const { roomId } = req.query;
      if (!roomId) return res.status(400).json({ success: false, error: 'ID не указан' });
      const snap = await get(ref(db, `rooms/${roomId}`));
      const room = snap.val();
      if (!room) return res.json({ success: false, error: 'Комната не найдена' });
      await set(ref(db, `rooms/${roomId}/lastActivity`), Date.now());
      return res.json({ success: true, room: { roomId: room.roomId, hostId: room.hostId, playerName: room.playerName, maxPlayers: room.maxPlayers, gameType: room.gameType, playersCount: room.players.length } });
    }

    if (action === 'join-room' && req.method === 'POST') {
      const { roomId, playerId, playerName } = req.body || {};
      if (!roomId || !playerId || !playerName) return res.status(400).json({ success: false, error: 'Недостаточно данных' });
      const rRef = ref(db, `rooms/${roomId}`);
      const snap = await get(rRef);
      const room = snap.val();
      if (!room) return res.json({ success: false, error: 'Комната не найдена' });
      if (room.players.length >= room.maxPlayers) return res.json({ success: false, error: 'Комната заполнена' });
      room.players.push({ id: playerId, name: playerName, isHost: false, connected: true });
      room.lastActivity = Date.now();
      await set(rRef, room);
      return res.json({ success: true, roomId });
    }

    if (action === 'stats') {
      const snap = await get(ref(db, 'rooms'));
      const rooms = snap.val() || {};
      const totalRooms = Object.keys(rooms).length;
      const totalPlayers = Object.values(rooms).reduce((s, r) => s + (r.players?.length || 0), 0);
      return res.json({ success: true, stats: { activeRooms: totalRooms, totalPlayers, timestamp: Date.now() } });
    }

    return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  } catch (e) {
    console.error('[coordination] error', e);
    return res.status(500).json({ success: false, error: e.message });
  }
};

// Vercel API функция для координации P2P соединений
const { createRoom, findRoom, joinRoom, exchangeSignal, getSignals, getActiveRooms, getStats } = require('../backend/serverless-coordination.js');

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
    const { action } = req.query;

    switch (action) {
      case 'create-room':
        return await handleCreateRoom(req, res);
      
      case 'find-room':
        return await handleFindRoom(req, res);
      
      case 'join-room':
        return await handleJoinRoom(req, res);
      
      case 'exchange-signal':
        return await handleExchangeSignal(req, res);
      
      case 'get-signals':
        return await handleGetSignals(req, res);
      
      case 'get-rooms':
        return await handleGetRooms(req, res);
      
      case 'stats':
        return await handleStats(req, res);
      
      default:
        res.status(400).json({ success: false, error: 'Неизвестное действие' });
    }
  } catch (error) {
    console.error('[API] Ошибка:', error);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
}

// Создание комнаты
async function handleCreateRoom(req, res) {
  const { roomId, hostId, playerName, maxPlayers, gameType } = req.body;
  
  if (!roomId || !hostId || !playerName) {
    return res.status(400).json({ 
      success: false, 
      error: 'Недостаточно данных для создания комнаты' 
    });
  }

  const result = await createRoom(roomId, {
    hostId,
    playerName,
    maxPlayers: maxPlayers || 8,
    gameType: gameType || 'chronology'
  });

  res.json(result);
}

// Поиск комнаты
async function handleFindRoom(req, res) {
  const { roomId } = req.query;
  
  if (!roomId) {
    return res.status(400).json({ 
      success: false, 
      error: 'ID комнаты не указан' 
    });
  }

  const result = await findRoom(roomId);
  res.json(result);
}

// Подключение к комнате
async function handleJoinRoom(req, res) {
  const { roomId, playerId, playerName } = req.body;
  
  if (!roomId || !playerId || !playerName) {
    return res.status(400).json({ 
      success: false, 
      error: 'Недостаточно данных для подключения к комнате' 
    });
  }

  const result = await joinRoom(roomId, {
    playerId,
    playerName
  });

  res.json(result);
}

// Обмен WebRTC сигналами
async function handleExchangeSignal(req, res) {
  const { fromId, toId, signal, type } = req.body;
  
  if (!fromId || !toId || !signal || !type) {
    return res.status(400).json({ 
      success: false, 
      error: 'Недостаточно данных для обмена сигналами' 
    });
  }

  const result = await exchangeSignal(fromId, toId, signal, type);
  res.json(result);
}

// Получение сигналов
async function handleGetSignals(req, res) {
  const { playerId } = req.query;
  
  if (!playerId) {
    return res.status(400).json({ 
      success: false, 
      error: 'ID игрока не указан' 
    });
  }

  const result = await getSignals(playerId);
  res.json(result);
}

// Получение списка комнат
async function handleGetRooms(req, res) {
  const result = await getActiveRooms();
  res.json(result);
}

// Статистика
async function handleStats(req, res) {
  const result = await getStats();
  res.json(result);
}
