const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Настройка CORS
const corsOptions = {
  origin: "*", // В продакшене указать конкретные домены
  methods: ['GET', 'POST'],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

// Хранилище комнат (в продакшене использовать Redis)
const rooms = new Map();
const roomTimers = new Map();

// Таймаут для удаления неактивных комнат (5 минут)
const ROOM_TIMEOUT = 300000;

// Очистка неактивных комнат
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    if (now - room.lastActivity > ROOM_TIMEOUT) {
      console.log('[COORDINATION] Удаление неактивной комнаты:', roomId);
      rooms.delete(roomId);
      if (roomTimers.has(roomId)) {
        clearTimeout(roomTimers.get(roomId));
        roomTimers.delete(roomId);
      }
    }
  });
}, 60000); // Проверяем каждую минуту

console.log('=== COORDINATION SERVER STARTED ===');

io.on('connection', (socket) => {
  console.log('[COORDINATION] Подключение:', socket.id);
  
  // Регистрация комнаты
  socket.on('register-room', (data, callback) => {
    try {
      const { roomId, hostId, playerName, maxPlayers = 8, gameType = 'chronology' } = data;
      
      if (rooms.has(roomId)) {
        callback({ success: false, error: 'Комната уже существует' });
        return;
      }
      
      const room = {
        roomId,
        hostId: socket.id,
        playerName,
        maxPlayers,
        gameType,
        players: [{ id: socket.id, name: playerName, isHost: true }],
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      
      rooms.set(roomId, room);
      
      // Устанавливаем таймер на удаление комнаты
      const timer = setTimeout(() => {
        if (rooms.has(roomId)) {
          console.log('[COORDINATION] Таймаут комнаты:', roomId);
          rooms.delete(roomId);
          roomTimers.delete(roomId);
        }
      }, ROOM_TIMEOUT);
      
      roomTimers.set(roomId, timer);
      
      socket.join(roomId);
      
      console.log('[COORDINATION] Комната зарегистрирована:', roomId);
      callback({ success: true, roomId });
      
    } catch (error) {
      console.error('[COORDINATION] Ошибка регистрации комнаты:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Поиск комнаты
  socket.on('find-room', (roomId, callback) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        callback({ success: false, error: 'Комната не найдена' });
        return;
      }
      
      // Обновляем активность
      room.lastActivity = Date.now();
      
      callback({ 
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
      console.error('[COORDINATION] Ошибка поиска комнаты:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Подключение к комнате
  socket.on('join-room', (data, callback) => {
    try {
      const { roomId, playerName } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        callback({ success: false, error: 'Комната не найдена' });
        return;
      }
      
      if (room.players.length >= room.maxPlayers) {
        callback({ success: false, error: 'Комната заполнена' });
        return;
      }
      
      // Добавляем игрока
      const player = {
        id: socket.id,
        name: playerName,
        isHost: false
      };
      
      room.players.push(player);
      room.lastActivity = Date.now();
      
      socket.join(roomId);
      
      // Уведомляем хоста о новом игроке
      socket.to(roomId).emit('player-joined', {
        playerId: socket.id,
        playerName,
        playersCount: room.players.length
      });
      
      console.log('[COORDINATION] Игрок подключился к комнате:', roomId, playerName);
      callback({ success: true, roomId });
      
    } catch (error) {
      console.error('[COORDINATION] Ошибка подключения к комнате:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Обмен WebRTC сигналами
  socket.on('webrtc-signal', (data) => {
    try {
      const { targetId, signal, type } = data;
      
      // Отправляем сигнал целевому игроку
      socket.to(targetId).emit('webrtc-signal', {
        fromId: socket.id,
        signal,
        type
      });
      
      console.log('[COORDINATION] WebRTC сигнал отправлен:', type, 'от', socket.id, 'к', targetId);
      
    } catch (error) {
      console.error('[COORDINATION] Ошибка отправки WebRTC сигнала:', error);
    }
  });

  // Получение списка комнат
  socket.on('get-rooms', (callback) => {
    try {
      const roomsList = Array.from(rooms.values()).map(room => ({
        roomId: room.roomId,
        playerName: room.playerName,
        playersCount: room.players.length,
        maxPlayers: room.maxPlayers,
        gameType: room.gameType,
        createdAt: room.createdAt
      }));
      
      callback({ success: true, rooms: roomsList });
      
    } catch (error) {
      console.error('[COORDINATION] Ошибка получения списка комнат:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Пинг для поддержания соединения
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Обработка отключения
  socket.on('disconnect', () => {
    console.log('[COORDINATION] Отключение:', socket.id);
    
    // Удаляем игрока из всех комнат
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        // Если это был хост, удаляем комнату
        if (player.isHost) {
          console.log('[COORDINATION] Хост отключился, удаляем комнату:', roomId);
          rooms.delete(roomId);
          if (roomTimers.has(roomId)) {
            clearTimeout(roomTimers.get(roomId));
            roomTimers.delete(roomId);
          }
          
          // Уведомляем всех игроков
          socket.to(roomId).emit('host-disconnected');
        } else {
          // Уведомляем остальных игроков
          socket.to(roomId).emit('player-left', {
            playerId: socket.id,
            playersCount: room.players.length
          });
        }
      }
    });
  });
});

// API для получения статистики
app.get('/api/stats', (req, res) => {
  res.json({
    activeRooms: rooms.size,
    totalPlayers: Array.from(rooms.values()).reduce((sum, room) => sum + room.players.length, 0),
    uptime: process.uptime()
  });
});

// API для проверки здоровья
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[COORDINATION] Сервер запущен на порту ${PORT}`);
  console.log(`[COORDINATION] API доступен на http://localhost:${PORT}`);
});

module.exports = { server, io, rooms };
