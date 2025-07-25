const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Бэкенд работает!');
});

const { cards, cardColors, getCardColor } = require('./cards');
const deepCopy = obj => JSON.parse(JSON.stringify(obj));

// Гарантирует, что у карты есть все нужные поля
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

let rooms = {};
let roomTimers = {};
// Флаги занятости для атомарности playCard
let roomBusy = {};
// Таймеры на удаление комнат после disconnect
let roomDeleteTimers = {};
// Таймеры на удаление игроков после disconnect
let playerDeleteTimers = {};
// Таймауты на удаление комнат и игроков (2 минуты)
const ROOM_DELETE_TIMEOUT = 120000; // 2 минуты
const PLAYER_DELETE_TIMEOUT = 120000; // 2 минуты

// --- ДОБАВЛЕНИЕ: вспомогательная функция для определения активных игроков ---
function getActivePlayers(room) {
  // Игроки, у которых есть карты на руках
  return room.players.filter(p => p.hand && p.hand.length > 0);
}

function startTurnTimer(roomId) {
  clearTimeout(roomTimers[roomId]);
  console.log('[TIMER] startTurnTimer для комнаты', roomId, 'currentPlayer:', rooms[roomId]?.currentPlayer, 'id:', rooms[roomId]?.players?.[rooms[roomId]?.currentPlayer]?.id, 'время:', Date.now());
  roomTimers[roomId] = setTimeout(() => {
    const room = rooms[roomId];
    if (!room || !room.gameStarted) return;
    // --- ПРОПУСКАЕМ победителей ---
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
    // --- ДОБАВЛЕНИЕ: авто-пропуск если offline или без карт ---
    if (room.players[room.currentPlayer].hand.length === 0 || room.players[room.currentPlayer].online === false) {
      autoSkipIfNoCardsOrOffline(roomId);
      return;
    }
    startTurnTimer(roomId);
  }, 30000);
}

// --- ДОБАВЛЕНИЕ: функция перехода хода ---
// Вспомогательная функция: индекс следующего игрока с картами (кроме текущего)
function getNextPlayerWithCards(room, excludeIdx) {
  for (let i = 1; i < room.players.length; i++) {
    const idx = (excludeIdx + i) % room.players.length;
    if (room.players[idx].hand.length > 0) return idx;
  }
  return null;
}

function advanceToNextPlayerWithCards(room) {
  const playersWithCards = room.players.filter(p => p.hand.length > 0);
  if (playersWithCards.length === 0) {
    room.canPlay = null;
    console.log('[CARD-DEBUG] Нет игроков с картами, canPlay=null, currentPlayer не меняется');
    return;
  }
  if (playersWithCards.length === 1) {
    const idx = room.players.findIndex(p => p.hand.length > 0);
    room.currentPlayer = idx;
    room.canPlay = room.players[idx].id;
    room.players[room.currentPlayer].clientId = room.players[room.currentPlayer].clientId || room.players[room.currentPlayer].id;
    console.log('[CARD-DEBUG] Остался один игрок с картами, currentPlayer и canPlay:', room.canPlay);
    return;
  }
  let nextIdx = room.currentPlayer;
  let found = false;
  for (let i = 0; i < room.players.length; i++) {
    nextIdx = (nextIdx + 1) % room.players.length;
    if (room.players[nextIdx].hand.length > 0) {
      found = true;
      break;
    }
  }
  if (found) {
    room.currentPlayer = nextIdx;
    room.canPlay = room.players[room.currentPlayer].id;
    room.players[room.currentPlayer].clientId = room.players[room.currentPlayer].clientId || room.players[room.currentPlayer].id;
  } else {
    room.canPlay = null;
    console.log('[CARD-DEBUG] Нет игроков с картами (после поиска), canPlay=null, currentPlayer не меняется');
  }
}

function autoSkipIfNoCards(roomId) {
  const room = rooms[roomId];
  if (!room || !room.gameStarted) return;
  let safety = 0;
  while (room.players[room.currentPlayer].hand.length === 0 && safety < room.players.length) {
    advanceToNextPlayerWithCards(room);
    safety++;
  }
  // --- ГАРАНТИЯ clientId ---
  if (!room.players[room.currentPlayer].clientId) {
    room.players[room.currentPlayer].clientId = room.players[room.currentPlayer].id;
  }
  // Обновить состояние для всех
  const turnTimeout = Date.now() + 30000;
  room.turnTimeout = turnTimeout;
  // --- ЛОГ ---
  console.log('[UPDATE-DEBUG] currentPlayer:', room.currentPlayer, 'id:', room.players[room.currentPlayer]?.id, 'clientId:', room.players[room.currentPlayer]?.clientId);
  console.log('[UPDATE-DEBUG] PLAYERS:', room.players.map(p => ({id: p.id, clientId: p.clientId, name: p.name, online: p.online})));
  if (
    room.currentPlayer !== undefined &&
    room.players[room.currentPlayer] &&
    !room.players[room.currentPlayer].clientId
  ) {
    // Попробовать найти clientId по id, если вдруг потерялся
    const id = room.players[room.currentPlayer].id;
    const found = room.players.find(p => p.id === id && p.clientId);
    if (found) {
      room.players[room.currentPlayer].clientId = found.clientId;
    } else {
      // В крайнем случае присвоить clientId = id (чтобы не было undefined)
      room.players[room.currentPlayer].clientId = id;
    }
    // Лог для отладки
    console.log('[FINAL-DEBUG] Восстановлен clientId для currentPlayer:', room.currentPlayer, 'id:', id, 'clientId:', room.players[room.currentPlayer].clientId);
  }
  room.players.forEach(p => {
    io.to(p.id).emit('update', {
      ...room,
      table: normalizeCards(deepCopy(room.table)).filter(isValidCard),
      deck: normalizeCards(deepCopy(room.deck)),
      hand: normalizeCards(deepCopy(p.hand)),
      players: room.players.map(pl => ({ ...pl, hand: undefined, clientId: pl.clientId })),
      currentPlayerId: room.players[room.currentPlayer].id,
      currentPlayerClientId: room.players[room.currentPlayer]?.clientId,
      turnTimeout: room.turnTimeout
    });
  });
  startTurnTimer(roomId);
}

// --- ДОБАВЛЕНИЕ: авто-пропуск хода для offline/без карт ---
function advanceToNextActivePlayer(room) {
  const playersWithCards = room.players.filter(p => p.hand.length > 0 && p.online !== false);
  if (playersWithCards.length === 0) {
    room.canPlay = null;
    return;
  }
  let nextIdx = room.currentPlayer;
  for (let i = 0; i < room.players.length; i++) {
    nextIdx = (nextIdx + 1) % room.players.length;
    if (room.players[nextIdx].hand.length > 0 && room.players[nextIdx].online !== false) break;
  }
  room.currentPlayer = nextIdx;
  room.canPlay = room.players[room.currentPlayer].id;
}

function autoSkipIfNoCardsOrOffline(roomId) {
  clearTimeout(roomTimers[roomId]);
  const room = rooms[roomId];
  if (!room || !room.gameStarted) return;
  console.log('[AUTO-SKIP] autoSkipIfNoCardsOrOffline для комнаты', roomId, 'currentPlayer:', room.currentPlayer, 'id:', room.players[room.currentPlayer]?.id, 'время:', Date.now());
  let safety = 0;
  while ((room.players[room.currentPlayer].hand.length === 0 || room.players[room.currentPlayer].online === false) && safety < room.players.length) {
    advanceToNextActivePlayer(room);
    safety++;
  }
  // --- ГАРАНТИЯ clientId ---
  if (!room.players[room.currentPlayer].clientId) {
    room.players[room.currentPlayer].clientId = room.players[room.currentPlayer].id;
  }
  // Обновить состояние для всех
  const turnTimeout = Date.now() + 30000;
  room.turnTimeout = turnTimeout;
  // --- ЛОГ ---
  console.log('[UPDATE-DEBUG] currentPlayer:', room.currentPlayer, 'id:', room.players[room.currentPlayer]?.id, 'clientId:', room.players[room.currentPlayer]?.clientId);
  console.log('[UPDATE-DEBUG] PLAYERS:', room.players.map(p => ({id: p.id, clientId: p.clientId, name: p.name, online: p.online})));
  if (
    room.currentPlayer !== undefined &&
    room.players[room.currentPlayer] &&
    !room.players[room.currentPlayer].clientId
  ) {
    // Попробовать найти clientId по id, если вдруг потерялся
    const id = room.players[room.currentPlayer].id;
    const found = room.players.find(p => p.id === id && p.clientId);
    if (found) {
      room.players[room.currentPlayer].clientId = found.clientId;
    } else {
      // В крайнем случае присвоить clientId = id (чтобы не было undefined)
      room.players[room.currentPlayer].clientId = id;
    }
    // Лог для отладки
    console.log('[FINAL-DEBUG] Восстановлен clientId для currentPlayer:', room.currentPlayer, 'id:', id, 'clientId:', room.players[room.currentPlayer].clientId);
  }
  room.players.forEach(p => {
    io.to(p.id).emit('update', {
      ...room,
      table: normalizeCards(deepCopy(room.table)).filter(isValidCard),
      deck: normalizeCards(deepCopy(room.deck)),
      hand: normalizeCards(deepCopy(p.hand)),
      players: room.players.map(pl => ({ ...pl, hand: undefined, clientId: pl.clientId })),
      currentPlayerId: room.players[room.currentPlayer].id,
      currentPlayerClientId: room.players[room.currentPlayer]?.clientId,
      turnTimeout: room.turnTimeout
    });
  });
  startTurnTimer(roomId); // <-- теперь всегда запускаем новый таймер после авто-скипа
}

// Удаляет дубликаты карт по id (оставляет первую встреченную)
function deduplicateTable(table) {
  const seen = new Set();
  const result = [];
  for (const card of table) {
    if (!seen.has(card.id)) {
      seen.add(card.id);
      result.push(card);
    } else {
      console.warn('Дубликат id в table:', card.id, card.title);
    }
  }
  return result;
}

// Вспомогательная функция для генерации clientId (если нужно)
function getClientId(socket) {
  return socket.handshake.query.clientId || null;
}

// --- THROTTLE для playCard ---
const playCardThrottle = {};

console.log('=== BACKEND INDEX.JS STARTED ===');
io.on('connection', (socket) => {
  console.log('[SOCKET-CONNECT] socket.id:', socket.id, 'clientId:', socket.handshake.query.clientId);
  socket.onAny((event, ...args) => {
    console.log('[SOCKET-ANY]', event, 'socket.id:', socket.id, 'args:', args);
  });

  socket.on('createRoom', ({ name, clientId }, callback) => {
    const roomId = Math.random().toString(36).substr(2, 6);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const players = [{ id: socket.id, hand: [], name: name || 'Игрок 1', score: 0, clientId: clientId || socket.id, online: true }];
    rooms[roomId] = {
      players,
      deck: shuffled,
      table: [],
      currentPlayer: 0,
      gameStarted: false,
      hostId: socket.id
    };
    const room = rooms[roomId];
    if (
      room.currentPlayer !== undefined &&
      room.players[room.currentPlayer] &&
      !room.players[room.currentPlayer].clientId
    ) {
      // Попробовать найти clientId по id, если вдруг потерялся
      const id = room.players[room.currentPlayer].id;
      const found = room.players.find(p => p.id === id && p.clientId);
      if (found) {
        room.players[room.currentPlayer].clientId = found.clientId;
      } else {
        // В крайнем случае присвоить clientId = id (чтобы не было undefined)
        room.players[room.currentPlayer].clientId = id;
      }
      // Лог для отладки
      console.log('[FINAL-DEBUG] Восстановлен clientId для currentPlayer:', room.currentPlayer, 'id:', id, 'clientId:', room.players[room.currentPlayer].clientId);
    }
    socket.join(roomId);
    callback({ roomId, hand: [] });
    io.to(roomId).emit('lobbyUpdate', { 
      roomId, 
      players: rooms[roomId].players.map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
      gameStarted: false
    });
  });

  // joinRoom с поддержкой clientId
  socket.on('joinRoom', ({ roomId, name, clientId }, callback) => {
    console.log('[JOINROOM-HANDLER]', { roomId, name, clientId, socketId: socket.id });
    console.log('[JOINROOM-DEBUG] socket.id:', socket.id, 'clientId:', clientId, 'roomId:', roomId);
    console.log('joinRoom:', { roomId, name, clientId, socketId: socket.id });
    const room = rooms[roomId];
    if (!room) {
      if (roomDeleteTimers[roomId]) {
        clearTimeout(roomDeleteTimers[roomId]);
        delete roomDeleteTimers[roomId];
      } else {
        return callback({ error: 'Комната не найдена' });
      }
    }
    // Ищем игрока по clientId (в том числе offline)
    let player = room.players.find(p => p.clientId === clientId);
    if (player) {
      // Если этот игрок был хостом (hostId === старый id или hostId === clientId), обновляем hostId на новый socket.id
      if (room.hostId === player.id || room.hostId === clientId) {
        room.hostId = socket.id;
      }
      player.id = socket.id;
      player.name = name || player.name;
      player.online = true;
      socket.join(roomId);
      if (playerDeleteTimers[roomId + '_' + clientId]) {
        clearTimeout(playerDeleteTimers[roomId + '_' + clientId]);
        delete playerDeleteTimers[roomId + '_' + clientId];
      }
      if (roomDeleteTimers[roomId]) {
        clearTimeout(roomDeleteTimers[roomId]);
        delete roomDeleteTimers[roomId];
      }
      // --- АВТОМАТИЧЕСКИЙ ПЕРЕХОД ХОДА ПРИ ПЕРЕПОДКЛЮЧЕНИИ ---
      if (room.gameStarted && room.currentPlayer !== undefined && room.players[room.currentPlayer]?.id === socket.id) {
        roomBusy[roomId] = false; // Сбросить возможную блокировку зависшего playCard
        console.log('[AUTO-SKIP][joinRoom] Вызван autoSkipIfNoCardsOrOffline для комнаты', roomId, 'currentPlayer:', room.currentPlayer, 'id:', room.players[room.currentPlayer]?.id, 'canPlay:', room.canPlay, 'время:', Date.now());
        autoSkipIfNoCardsOrOffline(roomId);
        io.to(roomId).emit('autoSkipNotice', {
          message: 'Из-за переподключения игрока ход был автоматически передан следующему.'
        });
      }
      if (room.gameStarted) {
        callback({
          roomId,
          hand: player.hand,
          table: normalizeCards(deepCopy(room.table)),
          deck: normalizeCards(deepCopy(room.deck)),
          players: room.players.filter(p => p.online).map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
          gameStarted: true,
          currentPlayerId: room.players[room.currentPlayer]?.id,
          turnTimeout: room.turnTimeout
        });
        io.to(roomId).emit('update', {
          ...room,
          table: normalizeCards(deepCopy(room.table)),
          deck: normalizeCards(deepCopy(room.deck)),
          players: room.players.filter(p => p.online).map(p => ({ ...p, hand: undefined, clientId: p.clientId })),
          currentPlayerId: room.players[room.currentPlayer]?.id,
          turnTimeout: room.turnTimeout
        });
        return;
      } else {
        // В лобби отправляем всех игроков (без фильтрации по online)
        callback({
          roomId,
          hand: player.hand,
          players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
          gameStarted: false
        });
        io.to(roomId).emit('lobbyUpdate', {
          roomId,
          players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
          gameStarted: false
        });
        return;
      }
    }
    // Если игрок не найден по clientId, проверяем, не был ли он хостом
    if (room.hostId === clientId) {
      room.hostId = socket.id;
    }
    // Ищем игрока по id (в том числе offline)
    player = room.players.find(p => p.id === clientId);
    if (player) {
      // Если этот игрок был хостом (hostId === старый id или hostId === clientId), обновляем hostId на новый socket.id
      if (room.hostId === player.id || room.hostId === clientId) {
        room.hostId = socket.id;
      }
      player.id = socket.id;
      player.name = name || player.name;
      player.online = true;
      socket.join(roomId);
      if (playerDeleteTimers[roomId + '_' + clientId]) {
        clearTimeout(playerDeleteTimers[roomId + '_' + clientId]);
        delete playerDeleteTimers[roomId + '_' + clientId];
      }
      if (roomDeleteTimers[roomId]) {
        clearTimeout(roomDeleteTimers[roomId]);
        delete roomDeleteTimers[roomId];
      }
      // --- АВТОМАТИЧЕСКИЙ ПЕРЕХОД ХОДА ПРИ ПЕРЕПОДКЛЮЧЕНИИ ---
      if (room.gameStarted && room.currentPlayer !== undefined && room.players[room.currentPlayer]?.id === socket.id) {
        roomBusy[roomId] = false; // Сбросить возможную блокировку зависшего playCard
        console.log('[AUTO-SKIP][joinRoom] Вызван autoSkipIfNoCardsOrOffline для комнаты', roomId, 'currentPlayer:', room.currentPlayer, 'id:', room.players[room.currentPlayer]?.id, 'canPlay:', room.canPlay, 'время:', Date.now());
        autoSkipIfNoCardsOrOffline(roomId);
        io.to(roomId).emit('autoSkipNotice', {
          message: 'Из-за переподключения игрока ход был автоматически передан следующему.'
        });
      }
      if (room.gameStarted) {
        callback({
          roomId,
          hand: player.hand,
          table: normalizeCards(deepCopy(room.table)),
          deck: normalizeCards(deepCopy(room.deck)),
          players: room.players.filter(p => p.online).map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
          gameStarted: true,
          currentPlayerId: room.players[room.currentPlayer]?.id,
          turnTimeout: room.turnTimeout
        });
        io.to(roomId).emit('update', {
          ...room,
          table: normalizeCards(deepCopy(room.table)),
          deck: normalizeCards(deepCopy(room.deck)),
          players: room.players.filter(p => p.online).map(p => ({ ...p, hand: undefined, clientId: p.clientId })),
          currentPlayerId: room.players[room.currentPlayer]?.id,
          turnTimeout: room.turnTimeout
        });
        return;
      } else {
        // В лобби отправляем всех игроков (без фильтрации по online)
        callback({
          roomId,
          hand: player.hand,
          players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
          gameStarted: false
        });
        io.to(roomId).emit('lobbyUpdate', {
          roomId,
          players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
          gameStarted: false
        });
        return;
      }
    }
    // Если игрок не найден ни по clientId, ни по id, добавляем его
    player = { id: socket.id, hand: [], name: name || `Игрок ${room.players.length + 1}`, score: 0, clientId: clientId || socket.id, online: true };
    room.players.push(player);
    socket.join(roomId);
    callback({ roomId, hand: player.hand, players: room.players.filter(p => p.online).map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })), gameStarted: room.gameStarted });
    io.to(roomId).emit('lobbyUpdate', { 
      roomId, 
      players: room.players.filter(p => p.online).map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
      gameStarted: room.gameStarted
    });
    // После любого добавления/обновления игрока:
    console.log('[LOBBY-DEBUG][joinRoom] Состав игроков после join:',
      rooms[roomId]?.players?.map(p => ({ id: p.id, clientId: p.clientId, online: p.online, name: p.name }))
    );
    // Новый лог: выводим всех игроков комнаты после joinRoom
    console.log('[JOINROOM-PLAYERS]', room.players.map(p => ({ id: p.id, clientId: p.clientId, name: p.name })));
  });

  socket.on('startGame', ({ roomId }, callback) => {
    const room = rooms[roomId];
    if (!room) return callback({ error: 'Комната не найдена' });
    if (room.hostId !== socket.id) return callback({ error: 'Только хост может начать игру' });
    if (room.players.length < 2) return callback({ error: 'Минимум 2 игрока для начала игры' });
    if (room.players.length > 15) return callback({ error: 'В комнате максимум 15 игроков' });
    if (room.gameStarted) return callback({ error: 'Игра уже началась' });
    const shuffled = [...room.deck].sort(() => Math.random() - 0.5);
    room.players.forEach(player => {
      player.hand = normalizeCards(deepCopy(shuffled.splice(0, 6)));
      player.score = 0;
      player.finishedPlace = null;
      player.clientId = player.clientId || player.id;
    });
    room.deck = normalizeCards(deepCopy(shuffled));
    room.gameStarted = true;
    room.currentPlayer = 0;
    room.players[0].clientId = room.players[0].clientId || room.players[0].clientId || (room.players[0] && room.players[0].clientId);
    const turnTimeout = Date.now() + 30000;
    room.turnTimeout = turnTimeout;
    room.canPlay = room.players[0].id;
    room.winners = [];
    room.finalRound = false;
    room.finalRoundPlayers = new Set();
    room.finalRoundQueue = [];
    room.finalRoundPlayerCount = null;
    if (
      room.currentPlayer !== undefined &&
      room.players[room.currentPlayer] &&
      !room.players[room.currentPlayer].clientId
    ) {
      // Попробовать найти clientId по id, если вдруг потерялся
      const id = room.players[room.currentPlayer].id;
      const found = room.players.find(p => p.id === id && p.clientId);
      if (found) {
        room.players[room.currentPlayer].clientId = found.clientId;
      } else {
        // В крайнем случае присвоить clientId = id (чтобы не было undefined)
        room.players[room.currentPlayer].clientId = id;
      }
      // Лог для отладки
      console.log('[FINAL-DEBUG] Восстановлен clientId для currentPlayer:', room.currentPlayer, 'id:', id, 'clientId:', room.players[room.currentPlayer].clientId);
    }
    room.players.forEach(player => {
      io.to(player.id).emit('gameStarted', {
        roomId,
        hand: normalizeCards(deepCopy(player.hand)),
        currentPlayerId: room.players[0].id,
        turnTimeout: turnTimeout
      });
    });
    if (
      room.currentPlayer !== undefined &&
      room.players[room.currentPlayer] &&
      !room.players[room.currentPlayer].clientId
    ) {
      // Попробовать найти clientId по id, если вдруг потерялся
      const id = room.players[room.currentPlayer].id;
      const found = room.players.find(p => p.id === id && p.clientId);
      if (found) {
        room.players[room.currentPlayer].clientId = found.clientId;
      } else {
        // В крайнем случае присвоить clientId = id (чтобы не было undefined)
        room.players[room.currentPlayer].clientId = id;
      }
      // Лог для отладки
      console.log('[FINAL-DEBUG] Восстановлен clientId для currentPlayer:', room.currentPlayer, 'id:', id, 'clientId:', room.players[room.currentPlayer].clientId);
    }
    // Сразу отправить актуальное состояние всем
    io.to(roomId).emit('update', {
      ...room,
      table: normalizeCards(deepCopy(room.table)),
      deck: normalizeCards(deepCopy(room.deck)),
      players: room.players.map(p => ({ ...p, hand: undefined })),
      currentPlayerId: room.players[0].id,
      turnTimeout: turnTimeout
    });
    // Если первый игрок offline или без карт — сразу передать ход следующему активному
    if (room.players[room.currentPlayer].hand.length === 0 || room.players[room.currentPlayer].online === false) {
      autoSkipIfNoCardsOrOffline(roomId);
      return callback({ success: true });
    }
    startTurnTimer(roomId);
    callback({ success: true });
  });

  socket.on('changeName', ({ roomId, newName }, callback) => {
    const room = rooms[roomId];
    if (!room) return callback({ error: 'Комната не найдена' });
    if (room.gameStarted) return callback({ error: 'Нельзя изменить имя во время игры' });
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return callback({ error: 'Игрок не найден' });
    
    player.name = newName;
    
    if (
      room.currentPlayer !== undefined &&
      room.players[room.currentPlayer] &&
      !room.players[room.currentPlayer].clientId
    ) {
      // Попробовать найти clientId по id, если вдруг потерялся
      const id = room.players[room.currentPlayer].id;
      const found = room.players.find(p => p.id === id && p.clientId);
      if (found) {
        room.players[room.currentPlayer].clientId = found.clientId;
      } else {
        // В крайнем случае присвоить clientId = id (чтобы не было undefined)
        room.players[room.currentPlayer].clientId = id;
      }
      // Лог для отладки
      console.log('[FINAL-DEBUG] Восстановлен clientId для currentPlayer:', room.currentPlayer, 'id:', id, 'clientId:', room.players[room.currentPlayer].clientId);
    }
    io.to(roomId).emit('lobbyUpdate', { 
      roomId, 
      players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
      gameStarted: false
    });
    
    callback({ success: true });
  });

  socket.on('leaveRoom', ({ roomId }, callback) => {
    const room = rooms[roomId];
    if (!room) return callback({ error: 'Комната не найдена' });
    
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return callback({ error: 'Игрок не найден в комнате' });
    
    room.players.splice(playerIndex, 1);
    socket.leave(roomId);
    
    // Если игрок был хостом, назначаем нового хоста
    if (room.hostId === socket.id && room.players.length > 0) {
      room.hostId = room.players[0].id;
    }
    
    // После удаления игрока (leaveRoom, disconnect) — если не началась игра, lobbyUpdate отправлять со всеми игроками
    if (room.players.length === 0) {
      delete rooms[roomId];
      clearTimeout(roomTimers[roomId]);
      delete roomTimers[roomId];
    } else {
      // В лобби отправляем всех игроков
      io.to(roomId).emit('lobbyUpdate', { 
        roomId, 
        players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
        gameStarted: room.gameStarted
      });
      console.log('[LOBBY-DEBUG][lobbyUpdate] Отправляем игрокам:',
        room.players.map(p => ({ id: p.id, clientId: p.clientId, online: p.online, name: p.name })),
        'roomId:', roomId
      );
    }
    
    callback({ success: true });
  });

  socket.on('playCard', async ({ roomId, cardId, insertIndex }, callback) => {
    console.log('[PLAYCARD-ALWAYS]', socket.id, roomId);
    // Максимально раннее логирование
    const room = rooms[roomId];
    console.log('[PLAYCARD-DEBUG-BEGIN]', {
      socketId: socket.id,
      roomId,
      roomExists: !!room,
      gameStarted: room?.gameStarted,
      players: room?.players?.map(p => ({ id: p.id, clientId: p.clientId, name: p.name }))
    });
    // Throttle: если игрок только что делал ход, игнорируем повторный вызов в течение 1 секунды
    if (!playCardThrottle[socket.id]) playCardThrottle[socket.id] = 0;
    const now = Date.now();
    if (now - playCardThrottle[socket.id] < 1000) {
      return callback && callback({ error: 'Подождите, ход обрабатывается...' });
    }
    playCardThrottle[socket.id] = now;
    const debugId = Math.random().toString(36).substr(2, 6);
    if (!room || !room.gameStarted) return callback && callback({ error: 'Игра завершена или комната удалена' });
    if (roomBusy[roomId]) return callback && callback({ error: 'Подождите, ход обрабатывается...' });
    roomBusy[roomId] = true;
    let playerIdx = room.players.findIndex(p => p.id === socket.id);
    let player = room.players[playerIdx];
    const clientId = socket.handshake.query.clientId;
    const currentPlayer = room.players[room.currentPlayer];
    if (
      (currentPlayer && currentPlayer.clientId && clientId === currentPlayer.clientId) ||
      (socket.id === currentPlayer.id)
    ) {
      currentPlayer.id = socket.id;
      room.canPlay = socket.id;
      playerIdx = room.currentPlayer;
      player = currentPlayer;
    } else {
      return callback && callback({ error: 'Сейчас не ваш ход' });
    }
    try {
      if (playerIdx === -1) return callback && callback({ error: 'Нет такого игрока' });
      if (room.players[playerIdx].hand.length === 0) return callback && callback({ error: 'Вы уже завершили игру' });
      const cardIdx = player.hand.findIndex(c => c.id === cardId);
      if (cardIdx === -1) return callback && callback({ error: 'Нет такой карты' });
      const cardCopy = normalizeCard(deepCopy(player.hand[cardIdx]));
      if (room.table.some(c => c.id === cardCopy.id)) return callback && callback({ error: 'Карта уже на столе' });
      const leftOrder = insertIndex > 0 ? (room.table[insertIndex - 1]?.order ?? -Infinity) : -Infinity;
      const rightOrder = insertIndex < room.table.length ? (room.table[insertIndex]?.order ?? Infinity) : Infinity;
      let correct = leftOrder < cardCopy.order && cardCopy.order < rightOrder;
      player.hand.splice(cardIdx, 1);
      let incorrect = false;
      if (correct) {
        room.table.splice(insertIndex, 0, cardCopy);
        player.score += 1;
      } else {
        // Автоматически вставляем в правильное место
        const correctIndex = room.table.findIndex(c => c.order > cardCopy.order);
        if (correctIndex === -1) {
          room.table.push(cardCopy);
        } else {
          room.table.splice(correctIndex, 0, cardCopy);
        }
        if (room.deck.length > 0) {
          player.hand.push(normalizeCard(deepCopy(room.deck.pop())));
        }
        incorrect = true;
      }
      room.table = deduplicateTable(room.table);
      // Проверка победителя (по избавлению от всех карт)
      if (player.hand.length === 0) {
        room.winners = room.winners || [];
        room.winners.push({ id: player.id, name: player.name });
        player.finishedPlace = room.winners.length;
        // 1. Активация финального круга
        if (room.players.length <= 3 && !room.finalRoundActive) {
          room.finalRoundActive = true;
          room.finalRoundStartIdx = playerIdx;
          room.finalRoundQueue = [];
          for (let i = 1; i < room.players.length; i++) {
            const idx = (playerIdx + i) % room.players.length;
            if (room.players[idx].hand.length > 0) {
              room.finalRoundQueue.push(room.players[idx].id);
            }
          }
          room.finalRoundMoved = new Set();
          console.log('[FINAL-ROUND] Активирован финальный круг! Стартовый игрок:', playerIdx, 'Очередь:', room.finalRoundQueue.map(id => room.players.findIndex(p => p.id === id)), 'ID:', room.finalRoundQueue);
        }
      }
      // 2. Каждый ход в финальном круге
      if (room.finalRoundActive) {
        room.finalRoundMoved = room.finalRoundMoved || new Set();
        room.finalRoundMoved.add(socket.id);
        console.log('[FINAL-ROUND] Игрок сделал ход:', socket.id, 'Имя:', player.name, 'Сходившие:', Array.from(room.finalRoundMoved), 'Очередь:', room.finalRoundQueue);
        const allMoved = room.finalRoundQueue.every(id => room.finalRoundMoved.has(id));
        if (allMoved || room.finalRoundQueue.length === 0) {
          console.log('[FINAL-ROUND] Все сходили или очередь пуста, завершаем финальный круг по баллам!');
          const maxScore = Math.max(...room.players.map(p => p.score));
          const winners = room.players.filter(p => p.score === maxScore);
          const scoreboard = room.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
          io.to(roomId).emit('gameOver', { winners, scoreboard });
          delete rooms[roomId];
          clearTimeout(roomTimers[roomId]);
          delete roomTimers[roomId];
          delete roomBusy[roomId];
          delete roomDeleteTimers[roomId];
          delete playerDeleteTimers[roomId];
          return callback && callback({});
        } else {
          let nextId = null;
          for (let i = 0; i < room.finalRoundQueue.length; i++) {
            const id = room.finalRoundQueue[i];
            const pl = room.players.find(p => p.id === id);
            if (!room.finalRoundMoved.has(id) && pl && pl.hand.length > 0) {
              nextId = id;
              break;
            }
          }
          if (!nextId) {
            console.log('[FINAL-ROUND] Все из очереди без карт, завершаем финальный круг по баллам!');
            const maxScore = Math.max(...room.players.map(p => p.score));
            const winners = room.players.filter(p => p.score === maxScore);
            const scoreboard = room.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
            io.to(roomId).emit('gameOver', { winners, scoreboard });
            delete rooms[roomId];
            clearTimeout(roomTimers[roomId]);
            delete roomTimers[roomId];
            delete roomBusy[roomId];
            delete roomDeleteTimers[roomId];
            delete playerDeleteTimers[roomId];
            return callback && callback({});
          }
          console.log('[FINAL-ROUND] Передаём ход следующему:', nextId, 'Имя:', (room.players.find(p => p.id === nextId) || {}).name);
          const nextIdx = room.players.findIndex(p => p.id === nextId);
          room.currentPlayer = nextIdx;
          room.canPlay = nextId;
          const turnTimeout = Date.now() + 30000;
          room.turnTimeout = turnTimeout;
          startTurnTimer(roomId);
          room.players.forEach(p => {
            io.to(p.id).emit('update', {
              ...room,
              table: normalizeCards(deepCopy(room.table)).filter(isValidCard),
              deck: normalizeCards(deepCopy(room.deck)),
              hand: normalizeCards(deepCopy(p.hand)),
              players: room.players.map(pl => ({ ...pl, hand: undefined, clientId: pl.clientId })),
              currentPlayerId: room.players[room.currentPlayer].id,
              currentPlayerClientId: room.players[room.currentPlayer]?.clientId,
              turnTimeout: room.turnTimeout
            });
          });
          return callback && callback(incorrect ? { incorrect: true } : {});
        }
        }
      // --- Обычная логика передачи хода и завершения игры ---
      if (!room.finalRoundActive && room.deck.length === 0) {
        console.log('[GAME-OVER] Колода пуста, завершение по баллам. Финальный круг активен?', room.finalRoundActive);
        if (room.players.length > 3) {
          const sorted = [...room.players].sort((a, b) => {
            if (a.hand.length !== b.hand.length) return a.hand.length - b.hand.length;
            return b.score - a.score;
          });
          const winners = sorted.slice(0, 3);
          const scoreboard = room.players.map(p => ({ id: p.id, name: p.name, score: p.score, hand: p.hand.length }));
          io.to(roomId).emit('gameOver', { winners, scoreboard });
        } else {
          const maxScore = Math.max(...room.players.map(p => p.score));
          const winners = room.players.filter(p => p.score === maxScore);
          const scoreboard = room.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
          io.to(roomId).emit('gameOver', { winners, scoreboard });
        }
        delete rooms[roomId];
        clearTimeout(roomTimers[roomId]);
        delete roomTimers[roomId];
        delete roomBusy[roomId];
        delete roomDeleteTimers[roomId];
        delete playerDeleteTimers[roomId];
        return callback && callback({});
      }
      let nextIdx = room.currentPlayer;
      for (let i = 0; i < room.players.length; i++) {
        nextIdx = (nextIdx + 1) % room.players.length;
        if (room.players[nextIdx].hand.length > 0) break;
      }
      room.currentPlayer = nextIdx;
      room.canPlay = room.players[nextIdx].id;
      const turnTimeout = Date.now() + 30000;
      room.turnTimeout = turnTimeout;
      startTurnTimer(roomId);
      room.players.forEach(p => {
        io.to(p.id).emit('update', {
          ...room,
          table: normalizeCards(deepCopy(room.table)).filter(isValidCard),
          deck: normalizeCards(deepCopy(room.deck)),
          hand: normalizeCards(deepCopy(p.hand)),
          players: room.players.map(pl => ({ ...pl, hand: undefined })),
          currentPlayerId: room.players[room.currentPlayer].id,
          currentPlayerClientId: room.players[room.currentPlayer]?.clientId,
          turnTimeout: room.turnTimeout
        });
      });
      const playersWithCards = room.players.filter(p => p.hand.length > 0);
      if (playersWithCards.length === 0) {
        console.log('[GAME-OVER] Все избавились от карт, завершение.');
        const winners = room.players.filter(p => p.hand.length === 0);
        const scoreboard = room.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
        io.to(roomId).emit('gameOver', { winners, scoreboard });
        delete rooms[roomId];
        clearTimeout(roomTimers[roomId]);
        delete roomTimers[roomId];
        delete roomBusy[roomId];
        delete roomDeleteTimers[roomId];
        delete playerDeleteTimers[roomId];
        return callback && callback({});
      }
      if (playersWithCards.length === 1) {
        console.log('[GAME-OVER] Остался один игрок с картами, завершение.');
        const winners = room.players.filter(p => p.hand.length === 0);
        const scoreboard = room.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
        io.to(roomId).emit('gameOver', { winners, scoreboard });
        delete rooms[roomId];
        clearTimeout(roomTimers[roomId]);
        delete roomTimers[roomId];
        delete roomBusy[roomId];
        delete roomDeleteTimers[roomId];
        delete playerDeleteTimers[roomId];
        return callback && callback({});
      }
      return callback && callback(incorrect ? { incorrect: true } : {});
    } finally {
      roomBusy[roomId] = false;
    }
  });

  socket.on('clearDeck', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.gameStarted) return;
    if (room.hostId !== socket.id) return;
    room.deck = [];
    io.to(roomId).emit('deckCleared');
  });

  // Кик игрока из лобби (только хост)
  socket.on('kickPlayer', ({ roomId, playerId, clientId }, callback) => {
    const room = rooms[roomId];
    if (!room) return callback && callback({ error: 'Комната не найдена' });
    if (room.hostId !== socket.id) return callback && callback({ error: 'Только хост может кикать игроков' });
    let playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 && clientId) {
      playerIndex = room.players.findIndex(p => p.clientId === clientId);
    }
    if (playerIndex === -1) return callback && callback({ error: 'Игрок не найден' });
    const kickedPlayer = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    io.to(kickedPlayer.id).emit('kicked', { roomId });
    // Если кикнутый был хостом, назначаем нового хоста из онлайн-игроков
    if (room.hostId === kickedPlayer.id && room.players.length > 0) {
      room.hostId = room.players.find(p => p.online)?.id || room.players[0].id;
    }
    // Если не осталось онлайн-игроков — ставим таймер на удаление комнаты
    if (room.players.filter(p => p.online).length === 0) {
      if (roomDeleteTimers[roomId]) clearTimeout(roomDeleteTimers[roomId]);
      roomDeleteTimers[roomId] = setTimeout(() => {
        delete rooms[roomId];
        clearTimeout(roomTimers[roomId]);
        delete roomTimers[roomId];
        delete roomDeleteTimers[roomId];
        console.log('Комната удалена по таймеру:', roomId);
      }, ROOM_DELETE_TIMEOUT);
    } else {
      // Обновляем лобби только с онлайн-игроками
      io.to(roomId).emit('lobbyUpdate', {
        roomId,
        players: room.players.filter(p => p.online).map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
        gameStarted: room.gameStarted
      });
      console.log('[LOBBY-DEBUG][lobbyUpdate] Отправляем игрокам:',
        room.players.filter(p => p.online).map(p => ({ id: p.id, clientId: p.clientId, online: p.online, name: p.name })),
        'roomId:', roomId
      );
    }
    callback && callback({ success: true });
  });

  // disconnect с учётом clientId
  socket.on('disconnect', () => {
    console.log('disconnect:', socket.id, 'clientId:', socket.handshake.query.clientId);
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const clientId = room.players[playerIndex].clientId;
        const player = room.players[playerIndex];
        const stillConnected = Object.values(io.sockets.sockets).some(s => s.id !== socket.id && s.handshake.query.clientId === clientId);
        if (!stillConnected) {
          // Мягкое отключение: помечаем offline, не удаляем сразу
          player.online = false;
          // Если игрок был хостом, НЕ менять hostId, если в комнате остался игрок с тем же clientId
          if (room.hostId === socket.id) {
            const hasSameClient = room.players.some((p, idx) => idx !== playerIndex && p.clientId === clientId);
            if (!hasSameClient) {
              // Не меняем hostId, просто ждём переподключения
            } else if (room.players.filter(p => p.online).length > 0) {
              room.hostId = room.players.find(p => p.online)?.id || room.players[0].id;
            }
          }
          // Ставим таймер на удаление игрока
          if (playerDeleteTimers[roomId + '_' + clientId]) clearTimeout(playerDeleteTimers[roomId + '_' + clientId]);
          playerDeleteTimers[roomId + '_' + clientId] = setTimeout(() => {
            // Удаляем игрока только если он всё ещё offline
            const idx = room.players.findIndex(p => p.clientId === clientId && !p.online);
            if (idx !== -1) {
              room.players.splice(idx, 1);
              // Если после удаления нет online игроков — ставим таймер на удаление комнаты
              if (room.players.filter(p => p.online).length === 0) {
                if (roomDeleteTimers[roomId]) clearTimeout(roomDeleteTimers[roomId]);
                roomDeleteTimers[roomId] = setTimeout(() => {
                  delete rooms[roomId];
                  clearTimeout(roomTimers[roomId]);
                  delete roomTimers[roomId];
                  delete roomDeleteTimers[roomId];
                  console.log('Комната удалена по таймеру:', roomId);
                }, ROOM_DELETE_TIMEOUT);
              }
            }
            delete playerDeleteTimers[roomId + '_' + clientId];
          }, PLAYER_DELETE_TIMEOUT);
          // Обновляем лобби для оставшихся online игроков
          io.to(roomId).emit('lobbyUpdate', { 
            roomId, 
            players: room.gameStarted
              ? room.players.filter(p => p.online).map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId }))
              : room.players.map(p => ({ id: p.id, name: p.name, score: p.score, clientId: p.clientId })),
            gameStarted: room.gameStarted
          });
          console.log('[LOBBY-DEBUG][lobbyUpdate] Отправляем игрокам:',
            room.players.filter(p => p.online).map(p => ({ id: p.id, clientId: p.clientId, online: p.online, name: p.name })),
            'roomId:', roomId
          );
        }
      }
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 