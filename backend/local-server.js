const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { cards, cardColors, getCardColor } = require('./cards');

const app = express();
const server = http.createServer(app);

// Настройка CORS для локального сервера
const corsOptions = {
  origin: "*", // Разрешаем подключения отовсюду для P2P
  methods: ['GET', 'POST'],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

// Импорт игровой логики из основного сервера
const deepCopy = obj => JSON.parse(JSON.stringify(obj));

function normalizeCard(card) {
  return {
    id: card.id,
    title: card.title ?? '',
    imageFront: card.imageFront ?? '',
    imageBack: card.imageBack ?? '',
    difficulty: card.difficulty ?? 1,
    verse: card.verse ?? '',
    order: card.order ?? 0,
    color: card.color ?? getCardColor(card.order ?? 0)
  };
}

function normalizeCards(cardsArr) {
  return cardsArr.map(normalizeCard);
}

function isValidCard(card) {
  return card && typeof card === 'object' && card.id && card.title && card.order;
}

// Состояние игры (аналогично основному серверу)
let rooms = {};
let roomTimers = {};
let roomBusy = {};
let roomDeleteTimers = {};
let playerDeleteTimers = {};

const ROOM_DELETE_TIMEOUT = 120000;
const PLAYER_DELETE_TIMEOUT = 120000;

function getActivePlayers(room) {
  return room.players.filter(p => p.hand && p.hand.length > 0);
}

function startTurnTimer(roomId) {
  clearTimeout(roomTimers[roomId]);
  console.log('[LOCAL-SERVER] startTurnTimer для комнаты', roomId);
  roomTimers[roomId] = setTimeout(() => {
    const room = rooms[roomId];
    if (!room || !room.gameStarted) return;
    
    let activePlayers = getActivePlayers(room);
    if (activePlayers.length === 0) return;
    
    do {
      room.currentPlayer = (room.currentPlayer + 1) % room.players.length;
    } while (room.players[room.currentPlayer].hand.length === 0);
    
    const nextPlayer = room.players[room.currentPlayer];
    const turnTimeout = Date.now() + 30000;
    room.turnTimeout = turnTimeout;
    room.canPlay = nextPlayer.id;
    
    room.players.forEach(p => {
      io.to(p.id).emit('update', {
        ...room,
        currentPlayerId: nextPlayer.id,
        turnTimeout: turnTimeout,
        hand: p.hand
      });
    });
  }, 30000);
}

// Получение публичного IP и порта
function getPublicConnectionInfo() {
  return {
    host: process.env.PUBLIC_IP || 'localhost',
    port: process.env.PORT || 3001,
    protocol: 'http'
  };
}

// API для получения информации о подключении
app.get('/connection-info', (req, res) => {
  res.json(getPublicConnectionInfo());
});

// API для проверки доступности
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: Object.keys(rooms).length });
});

console.log('=== LOCAL SERVER STARTED ===');

io.on('connection', (socket) => {
  console.log('[LOCAL-SOCKET-CONNECT] socket.id:', socket.id);
  
  socket.onAny((event, ...args) => {
    console.log('[LOCAL-SOCKET-ANY]', event, 'socket.id:', socket.id, 'args:', args);
  });

  // Создание комнаты (аналогично основному серверу)
  socket.on('createRoom', ({ name, clientId }, callback) => {
    const roomId = Math.random().toString(36).substr(2, 6);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const players = [{ 
      id: socket.id, 
      hand: [], 
      name: name || 'Игрок 1', 
      score: 0, 
      clientId: clientId || socket.id, 
      online: true 
    }];
    
    rooms[roomId] = {
      players,
      deck: shuffled,
      table: [],
      currentPlayer: 0,
      gameStarted: false,
      hostId: socket.id,
      isLocalServer: true
    };
    
    socket.join(roomId);
    callback({ 
      roomId, 
      hand: [],
      connectionInfo: getPublicConnectionInfo()
    });
    
    io.to(roomId).emit('lobbyUpdate', { 
      roomId, 
      players: rooms[roomId].players.map(p => ({ 
        id: p.id, 
        name: p.name, 
        score: p.score, 
        clientId: p.clientId 
      })),
      gameStarted: false
    });
  });

  // Подключение к комнате
  socket.on('joinRoom', ({ roomId, name, clientId }, callback) => {
    console.log('[LOCAL-JOIN] Попытка подключения к комнате:', roomId);
    
    const room = rooms[roomId];
    if (!room) {
      callback({ error: 'Комната не найдена' });
      return;
    }

    // Поиск существующего игрока
    let player = room.players.find(p => p.clientId === clientId || p.id === socket.id);
    
    if (player) {
      player.online = true;
      player.id = socket.id;
      if (clientId) player.clientId = clientId;
    } else {
      player = { 
        id: socket.id, 
        hand: [], 
        name: name || `Игрок ${room.players.length + 1}`, 
        score: 0, 
        clientId: clientId || socket.id, 
        online: true 
      };
      room.players.push(player);
    }
    
    socket.join(roomId);
    
    if (room.gameStarted) {
      callback({
        roomId,
        hand: player.hand,
        table: normalizeCards(deepCopy(room.table)),
        deck: normalizeCards(deepCopy(room.deck)),
        players: room.players.filter(p => p.online).map(p => ({ 
          id: p.id, 
          name: p.name, 
          score: p.score, 
          clientId: p.clientId 
        })),
        gameStarted: true,
        currentPlayerId: room.players[room.currentPlayer]?.id,
        turnTimeout: room.turnTimeout
      });
    } else {
      callback({
        roomId,
        hand: player.hand,
        players: room.players.map(p => ({ 
          id: p.id, 
          name: p.name, 
          score: p.score, 
          clientId: p.clientId 
        })),
        gameStarted: false
      });
    }
    
    io.to(roomId).emit('lobbyUpdate', {
      roomId,
      players: room.players.map(p => ({ 
        id: p.id, 
        name: p.name, 
        score: p.score, 
        clientId: p.clientId 
      })),
      gameStarted: room.gameStarted
    });
  });

  // Остальные игровые события (аналогично основному серверу)
  socket.on('startGame', ({ roomId }, callback) => {
    const room = rooms[roomId];
    if (!room || room.gameStarted) {
      callback({ error: 'Игра уже началась или комната не найдена' });
      return;
    }
    
    if (room.players.length < 2) {
      callback({ error: 'Недостаточно игроков для начала игры' });
      return;
    }
    
    room.gameStarted = true;
    room.players.forEach(player => {
      player.hand = room.deck.splice(0, 8);
    });
    
    startTurnTimer(roomId);
    
    room.players.forEach(p => {
      io.to(p.id).emit('update', {
        ...room,
        hand: p.hand,
        players: room.players.map(pl => ({ 
          ...pl, 
          hand: undefined, 
          clientId: pl.clientId 
        })),
        currentPlayerId: room.players[room.currentPlayer]?.id,
        turnTimeout: room.turnTimeout
      });
    });
    
    callback({ success: true });
  });

  // Игровые действия (playCard, drawCard и т.д.)
  socket.on('playCard', ({ roomId, cardId, insertIndex }, callback) => {
    const room = rooms[roomId];
    if (!room || !room.gameStarted) {
      callback({ error: 'Игра не началась' });
      return;
    }
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      callback({ error: 'Игрок не найден' });
      return;
    }
    
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      callback({ error: 'Карта не найдена' });
      return;
    }
    
    const card = player.hand.splice(cardIndex, 1)[0];
    room.table.splice(insertIndex, 0, card);
    
    // Обновляем состояние для всех игроков
    room.players.forEach(p => {
      io.to(p.id).emit('update', {
        ...room,
        hand: p.hand,
        table: normalizeCards(deepCopy(room.table)),
        deck: normalizeCards(deepCopy(room.deck)),
        players: room.players.map(pl => ({ 
          ...pl, 
          hand: undefined, 
          clientId: pl.clientId 
        })),
        currentPlayerId: room.players[room.currentPlayer]?.id,
        turnTimeout: room.turnTimeout
      });
    });
    
    callback({ success: true });
  });

  socket.on('disconnect', () => {
    console.log('[LOCAL-DISCONNECT] socket.id:', socket.id);
    
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      const player = room.players.find(p => p.id === socket.id);
      
      if (player) {
        player.online = false;
        
        // Если это хост и игра не началась, удаляем комнату
        if (room.hostId === socket.id && !room.gameStarted) {
          delete rooms[roomId];
          clearTimeout(roomTimers[roomId]);
          delete roomTimers[roomId];
          console.log('[LOCAL-SERVER] Комната удалена, хост отключился:', roomId);
        }
      }
    });
  });
});

// Запуск сервера на случайном порту
const PORT = process.env.PORT || 0;
server.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`[LOCAL-SERVER] Запущен на порту ${actualPort}`);
  console.log(`[LOCAL-SERVER] Подключение: http://localhost:${actualPort}`);
});

module.exports = { server, getPublicConnectionInfo };
