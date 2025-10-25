// WebRTC P2P решение для браузера
class WebRTCP2P {
  constructor() {
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    this.roomId = null;
    this.isHost = false;
    this.gameState = null;
    this.eventHandlers = new Map();
  }

  // Создание комнаты (хост)
  async createRoom(roomId, playerName) {
    try {
      this.roomId = roomId;
      this.isHost = true;
      
      // Создаем игровое состояние
      this.gameState = {
        roomId,
        players: [{ id: 'host', name: playerName, score: 0, hand: [], online: true }],
        deck: this.shuffleDeck(),
        table: [],
        currentPlayer: 0,
        gameStarted: false,
        hostId: 'host'
      };

      console.log('[WebRTC-P2P] Комната создана:', roomId);
      return { success: true, roomId };
      
    } catch (error) {
      console.error('[WebRTC-P2P] Ошибка создания комнаты:', error);
      return { success: false, error: error.message };
    }
  }

  // Подключение к комнате (клиент)
  async joinRoom(roomId, playerName) {
    try {
      this.roomId = roomId;
      this.isHost = false;
      
      // В реальном приложении здесь было бы подключение к хосту
      // Пока симулируем успешное подключение
      console.log('[WebRTC-P2P] Подключение к комнате:', roomId);
      
      return { success: true, roomId };
      
    } catch (error) {
      console.error('[WebRTC-P2P] Ошибка подключения:', error);
      return { success: false, error: error.message };
    }
  }

  // Создание WebRTC соединения
  async createPeerConnection(peerId) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    // Создаем data channel для обмена игровыми данными
    const dataChannel = peerConnection.createDataChannel('gameData', {
      ordered: true
    });

    // Обработчики data channel
    dataChannel.onopen = () => {
      console.log('[WebRTC-P2P] Data channel открыт для пира:', peerId);
      this.dataChannels.set(peerId, dataChannel);
    };

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('[WebRTC-P2P] Ошибка парсинга сообщения:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error('[WebRTC-P2P] Ошибка data channel:', error);
    };

    // Обработчики ICE кандидатов
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Отправляем кандидата другому пиру
        this.sendToPeer(peerId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    // Обработчик входящих соединений
    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      dataChannel.onopen = () => {
        console.log('[WebRTC-P2P] Входящий data channel открыт');
        this.dataChannels.set(peerId, dataChannel);
      };
      
      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebRTC-P2P] Ошибка парсинга входящего сообщения:', error);
        }
      };
    };

    this.peerConnections.set(peerId, peerConnection);
    return peerConnection;
  }

  // Отправка сообщения конкретному пиру
  sendToPeer(peerId, message) {
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(message));
    } else {
      console.warn('[WebRTC-P2P] Data channel не готов для пира:', peerId);
    }
  }

  // Отправка сообщения всем пирам
  broadcast(message) {
    this.dataChannels.forEach((dataChannel, peerId) => {
      if (dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(message));
      }
    });
  }

  // Обработка входящих сообщений
  handleMessage(message) {
    console.log('[WebRTC-P2P] Получено сообщение:', message);
    
    switch (message.type) {
      case 'game-update':
        this.updateGameState(message.data);
        break;
      case 'lobby-update':
        this.updateLobby(message.data);
        break;
      case 'player-action':
        this.handlePlayerAction(message.data);
        break;
      default:
        console.warn('[WebRTC-P2P] Неизвестный тип сообщения:', message.type);
    }
  }

  // Обновление игрового состояния
  updateGameState(data) {
    if (this.gameState) {
      Object.assign(this.gameState, data);
    }
    
    // Вызываем обработчик обновления
    const handler = this.eventHandlers.get('game-update');
    if (handler) {
      handler(data);
    }
  }

  // Обновление лобби
  updateLobby(data) {
    if (this.gameState) {
      this.gameState.players = data.players;
      this.gameState.gameStarted = data.gameStarted;
    }
    
    const handler = this.eventHandlers.get('lobby-update');
    if (handler) {
      handler(data);
    }
  }

  // Обработка действий игрока
  handlePlayerAction(data) {
    if (!this.isHost) return;
    
    // Валидация действия
    if (!this.validatePlayerAction(data)) {
      return;
    }
    
    // Применяем действие к игровому состоянию
    this.applyPlayerAction(data);
    
    // Отправляем обновление всем игрокам
    this.broadcast({
      type: 'game-update',
      data: this.gameState
    });
  }

  // Валидация действий игрока
  validatePlayerAction(action) {
    // Базовая валидация
    if (!action.playerId || !action.type) {
      return false;
    }
    
    // Дополнительная валидация в зависимости от типа действия
    switch (action.type) {
      case 'play-card':
        return this.validatePlayCard(action);
      case 'draw-card':
        return this.validateDrawCard(action);
      default:
        return false;
    }
  }

  // Валидация игры карты
  validatePlayCard(action) {
    const player = this.gameState.players.find(p => p.id === action.playerId);
    if (!player) return false;
    
    const card = player.hand.find(c => c.id === action.cardId);
    if (!card) return false;
    
    // Проверяем, что это ход игрока
    if (this.gameState.currentPlayer !== player.index) return false;
    
    return true;
  }

  // Валидация взятия карты
  validateDrawCard(action) {
    const player = this.gameState.players.find(p => p.id === action.playerId);
    if (!player) return false;
    
    // Проверяем, что это ход игрока
    if (this.gameState.currentPlayer !== player.index) return false;
    
    return true;
  }

  // Применение действия игрока
  applyPlayerAction(action) {
    switch (action.type) {
      case 'play-card':
        this.playCard(action);
        break;
      case 'draw-card':
        this.drawCard(action);
        break;
      case 'start-game':
        this.startGame();
        break;
    }
  }

  // Игра карты
  playCard(action) {
    const player = this.gameState.players.find(p => p.id === action.playerId);
    const cardIndex = player.hand.findIndex(c => c.id === action.cardId);
    
    if (cardIndex === -1) return;
    
    const card = player.hand.splice(cardIndex, 1)[0];
    this.gameState.table.splice(action.insertIndex, 0, card);
    
    // Переход к следующему игроку
    this.nextPlayer();
  }

  // Взятие карты
  drawCard(action) {
    const player = this.gameState.players.find(p => p.id === action.playerId);
    
    if (this.gameState.deck.length > 0) {
      const card = this.gameState.deck.pop();
      player.hand.push(card);
    }
    
    // Переход к следующему игроку
    this.nextPlayer();
  }

  // Начало игры
  startGame() {
    if (this.gameState.players.length < 2) return;
    
    this.gameState.gameStarted = true;
    
    // Раздаем карты
    this.gameState.players.forEach(player => {
      player.hand = this.gameState.deck.splice(0, 8);
    });
    
    this.gameState.currentPlayer = 0;
  }

  // Переход к следующему игроку
  nextPlayer() {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
  }

  // Перемешивание колоды
  shuffleDeck() {
    const deck = [...this.getDefaultDeck()];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  // Получение стандартной колоды
  getDefaultDeck() {
    // Здесь должна быть ваша логика создания колоды
    // Пока возвращаем пустой массив
    return [];
  }

  // Регистрация обработчика событий
  on(event, handler) {
    this.eventHandlers.set(event, handler);
  }

  // Отправка действия
  emit(event, data) {
    if (!this.roomId) {
      console.error('[WebRTC-P2P] Нет активной комнаты');
      return;
    }
    
    this.broadcast({
      type: 'player-action',
      data: {
        ...data,
        playerId: this.getCurrentPlayerId(),
        timestamp: Date.now()
      }
    });
  }

  // Получение ID текущего игрока
  getCurrentPlayerId() {
    return this.isHost ? 'host' : 'client';
  }

  // Получение состояния игры
  getGameState() {
    return this.gameState;
  }

  // Закрытие соединения
  close() {
    this.peerConnections.forEach(connection => {
      connection.close();
    });
    this.peerConnections.clear();
    this.dataChannels.clear();
    this.roomId = null;
    this.isHost = false;
    this.gameState = null;
  }
}

export default WebRTCP2P;
