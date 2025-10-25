// Vercel API функция для координации P2P соединений
import { createRoom, findRoom, joinRoom, exchangeSignal, getSignals, getActiveRooms, getStats } from '../backend/serverless-coordination.js';

export default async function handler(req, res) {
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
