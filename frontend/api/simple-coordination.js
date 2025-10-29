// Упрощенная API функция для координации P2P
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, remove } = require('firebase/database');

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
    const { action } = req.query;
    console.log('[SIMPLE-API] Запрос:', action, req.method);

    // Инициализация Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    switch (action) {
      case 'create-room':
        return await handleCreateRoom(req, res, db);
      
      case 'find-room':
        return await handleFindRoom(req, res, db);
      
      case 'join-room':
        return await handleJoinRoom(req, res, db);
      
      case 'stats':
        return await handleStats(req, res, db);
      
      default:
        res.status(400).json({ success: false, error: 'Неизвестное действие' });
    }
  } catch (error) {
    console.error('[SIMPLE-API] Ошибка:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
};

// Создание комнаты
async function handleCreateRoom(req, res, db) {
  try {
    const { roomId, hostId, playerName, maxPlayers, gameType } = req.body;
    
    console.log('[SIMPLE-API] Создание комнаты:', { roomId, hostId, playerName });
    
    if (!roomId || !hostId || !playerName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Недостаточно данных для создания комнаты' 
      });
    }

    const roomData = {
      roomId,
      hostId,
      playerName,
      maxPlayers: maxPlayers || 8,
      gameType: gameType || 'chronology',
      players: [{
        id: hostId,
        name: playerName,
        isHost: true,
        connected: true
      }],
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    // Сохраняем в Firebase
    const roomRef = ref(db, `rooms/${roomId}`);
    await set(roomRef, roomData);

    console.log('[SIMPLE-API] Комната создана:', roomId);
    
    res.json({ 
      success: true, 
      roomId,
      message: 'Комната успешно создана'
    });

  } catch (error) {
    console.error('[SIMPLE-API] Ошибка создания комнаты:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Поиск комнаты
async function handleFindRoom(req, res, db) {
  try {
    const { roomId } = req.query;
    
    console.log('[SIMPLE-API] Поиск комнаты:', roomId);
    
    if (!roomId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID комнаты не указан' 
      });
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    const room = snapshot.val();

    if (!room) {
      return res.json({ 
        success: false, 
        error: 'Комната не найдена' 
      });
    }

    // Обновляем активность
    await set(ref(db, `rooms/${roomId}/lastActivity`), Date.now());

    res.json({ 
      success: true, 
      room: {
        roomId: room.roomId,
        hostId: room.hostId,
        playerName: room.playerName,
        maxPlayers: room.maxPlayers,
        gameType: room.gameType,
        playersCount: room.players.length
      }
    });

  } catch (error) {
    console.error('[SIMPLE-API] Ошибка поиска комнаты:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Подключение к комнате
async function handleJoinRoom(req, res, db) {
  try {
    const { roomId, playerId, playerName } = req.body;
    
    console.log('[SIMPLE-API] Подключение к комнате:', { roomId, playerId, playerName });
    
    if (!roomId || !playerId || !playerName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Недостаточно данных для подключения к комнате' 
      });
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    const room = snapshot.val();

    if (!room) {
      return res.json({ 
        success: false, 
        error: 'Комната не найдена' 
      });
    }

    if (room.players.length >= room.maxPlayers) {
      return res.json({ 
        success: false, 
        error: 'Комната заполнена' 
      });
    }

    // Добавляем игрока
    const newPlayer = {
      id: playerId,
      name: playerName,
      isHost: false,
      connected: true
    };

    room.players.push(newPlayer);
    room.lastActivity = Date.now();

    await set(roomRef, room);

    console.log('[SIMPLE-API] Игрок подключен:', playerName);
    
    res.json({ 
      success: true, 
      roomId,
      message: 'Подключение к комнате успешно'
    });

  } catch (error) {
    console.error('[SIMPLE-API] Ошибка подключения к комнате:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Статистика
async function handleStats(req, res, db) {
  try {
    const roomsRef = ref(db, 'rooms');
    const snapshot = await get(roomsRef);
    const rooms = snapshot.val() || {};
    
    const totalRooms = Object.keys(rooms).length;
    const totalPlayers = Object.values(rooms).reduce((sum, room) => sum + room.players.length, 0);
    
    res.json({
      success: true,
      stats: {
        activeRooms: totalRooms,
        totalPlayers,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[SIMPLE-API] Ошибка получения статистики:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
