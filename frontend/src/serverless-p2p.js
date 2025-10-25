// Serverless P2P решение для браузера
class ServerlessP2P {
  constructor() {
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    this.roomId = null;
    this.isHost = false;
    this.gameState = null;
    this.eventHandlers = new Map();
    this.players = new Map();
    this.playerId = this.generatePlayerId();
    this.apiUrl = import.meta.env.VITE_API_URL || 'https://bibleplay-h1kluvl43-egors-projects-f86fbb5c.vercel.app/api';
    
    this.stunServers = [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
      'stun:stun3.l.google.com:19302'
    ];
  }

  // Инициализация
  async initialize() {
    try {
      console.log('[Serverless-P2P] Инициализация завершена');
      return true;
    } catch (error) {
      console.error('[Serverless-P2P] Ошибка инициализации:', error);
      return false;
    }
  }

  // Создание комнаты (хост)
  async createRoom(roomId, playerName) {
    try {
      this.roomId = roomId;
      this.isHost = true;
      
      // Создаем игровое состояние
      this.gameState = {
        roomId,
        players: [{ 
          id: this.playerId, 
          name: playerName, 
          score: 0, 
          hand: [], 
          online: true,
          isHost: true
        }],
        deck: this.shuffleDeck(),
        table: [],
        currentPlayer: 0,
        gameStarted: false,
        hostId: this.playerId,
        turnTimeout: null,
        canPlay: this.playerId
      };

      // Регистрируем комнату через API
      const response = await fetch(`${this.apiUrl}/coordination?action=create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          hostId: this.playerId,
          playerName,
          maxPlayers: 8,
          gameType: 'chronology'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('[Serverless-P2P] Комната создана:', roomId);
        return { success: true, roomId, gameState: this.gameState };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('[Serverless-P2P] Ошибка создания комнаты:', error);
      return { success: false, error: error.message };
    }
  }

  // Подключение к комнате (клиент)
  async joinRoom(roomId, playerName) {
    try {
      this.roomId = roomId;
      this.isHost = false;
      
      // Получаем информацию о комнате
      const response = await fetch(`${this.apiUrl}/coordination?action=find-room&roomId=${roomId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Подключаемся к комнате
      const joinResponse = await fetch(`${this.apiUrl}/coordination?action=join-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          playerId: this.playerId,
          playerName
        })
      });

      const joinResult = await joinResponse.json();
      
      if (!joinResult.success) {
        throw new Error(joinResult.error);
      }
      
      // Подключаемся к хосту через WebRTC
      await this.connectToHost(result.room.hostId);
      
      console.log('[Serverless-P2P] Подключение к комнате:', roomId);
      return { success: true, roomId };
      
    } catch (error) {
      console.error('[Serverless-P2P] Ошибка подключения:', error);
      return { success: false, error: error.message };
    }
  }

  // Подключение к хосту через WebRTC
  async connectToHost(hostId) {
    try {
      const peerConnection = await this.createPeerConnection(hostId);
      
      // Создаем offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Отправляем offer хосту через API
      await this.sendOfferToHost(hostId, offer);
      
      console.log('[Serverless-P2P] Подключение к хосту:', hostId);
      return true;
      
    } catch (error) {
      console.error('[Serverless-P2P] Ошибка подключения к хосту:', error);
      throw error;
    }
  }

  // Отправка offer хосту
  async sendOfferToHost(hostId, offer) {
    try {
      const response = await fetch(`${this.apiUrl}/coordination?action=exchange-signal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromId: this.playerId,
          toId: hostId,
          signal: offer,
          type: 'offer'
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('[Serverless-P2P] Ошибка отправки offer:', error);
      return false;
    }
  }

  // Создание WebRTC соединения
  async createPeerConnection(peerId) {
    const peerConnection = new RTCPeerConnection({
      iceServers: this.stunServers.map(url => ({ urls: url }))
    });

    // Создаем data channel для обмена игровыми данными
    const dataChannel = peerConnection.createDataChannel('gameData', {
      ordered: true,
      maxRetransmits: 3
    });

    // Обработчики data channel
    dataChannel.onopen = () => {
      console.log('[Serverless-P2P] Data channel открыт для пира:', peerId);
      this.dataChannels.set(peerId, dataChannel);
    };

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('[Serverless-P2P] Ошибка парсинга сообщения:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error('[Serverless-P2P] Ошибка data channel:', error);
    };

    dataChannel.onclose = () => {
      console.log('[Serverless-P2P] Data channel закрыт для пира:', peerId);
      this.dataChannels.delete(peerId);
    };

    // Обработчики ICE кандидатов
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Отправляем кандидата другому пиру через API
        this.sendIceCandidateToPeer(peerId, event.candidate);
      }
    };

    // Обработчик входящих соединений
    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      dataChannel.onopen = () => {
        console.log('[Serverless-P2P] Входящий data channel открыт');
        this.dataChannels.set(peerId, dataChannel);
      };
      
      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[Serverless-P2P] Ошибка парсинга входящего сообщения:', error);
        }
      };
    };

    // Обработчик изменения состояния соединения
    peerConnection.onconnectionstatechange = () => {
      console.log('[Serverless-P2P] Состояние соединения:', peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'failed') {
        console.error('[Serverless-P2P] Соединение не удалось');
        this.handleConnectionFailure(peerId);
      }
    };

    this.peerConnections.set(peerId, peerConnection);
    return peerConnection;
  }

  // Отправка ICE кандидата пиру
  async sendIceCandidateToPeer(peerId, candidate) {
    try {
      const response = await fetch(`${this.apiUrl}/coordination?action=exchange-signal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromId: this.playerId,
          toId: peerId,
          signal: candidate,
          type: 'ice-candidate'
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('[Serverless-P2P] Ошибка отправки ICE кандидата:', error);
      return false;
    }
  }

  // Обработка сбоя соединения
  handleConnectionFailure(peerId) {
    console.log('[Serverless-P2P] Обработка сбоя соединения для пира:', peerId);
    
    // Удаляем соединение
    this.peerConnections.delete(peerId);
    this.dataChannels.delete(peerId);
    
    // Уведомляем об отключении игрока
    this.broadcast({
      type: 'player-disconnected',
      data: { playerId: peerId }
    });
  }

  // Отправка сообщения конкретному пиру
  sendToPeer(peerId, message) {
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel && dataChannel.readyState === 'open') {
      try {
        dataChannel.send(JSON.stringify(message));
      } catch (error) {
        console.error('[Serverless-P2P] Ошибка отправки сообщения:', error);
      }
    } else {
      console.warn('[Serverless-P2P] Data channel не готов для пира:', peerId);
    }
  }

  // Отправка сообщения всем пирам
  broadcast(message) {
    this.dataChannels.forEach((dataChannel, peerId) => {
      if (dataChannel.readyState === 'open') {
        try {
          dataChannel.send(JSON.stringify(message));
        } catch (error) {
          console.error('[Serverless-P2P] Ошибка broadcast:', error);
        }
      }
    });
  }

  // Обработка входящих сообщений
  handleMessage(message) {
    console.log('[Serverless-P2P] Получено сообщение:', message);
    
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
      case 'ice-candidate':
        this.handleIceCandidate(message.candidate);
        break;
      case 'offer':
        this.handleOffer(message.offer);
        break;
      case 'answer':
        this.handleAnswer(message.answer);
        break;
      default:
        console.warn('[Serverless-P2P] Неизвестный тип сообщения:', message.type);
    }
  }

  // Обработка ICE кандидата
  async handleIceCandidate(candidate) {
    // Добавляем кандидата к соединению
    console.log('[Serverless-P2P] Обработка ICE кандидата:', candidate);
  }

  // Обработка offer
  async handleOffer(offer) {
    // Создаем answer
    console.log('[Serverless-P2P] Обработка offer:', offer);
  }

  // Обработка answer
  async handleAnswer(answer) {
    // Устанавливаем remote description
    console.log('[Serverless-P2P] Обработка answer:', answer);
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
      case 'start-game':
        return this.validateStartGame(action);
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

  // Валидация начала игры
  validateStartGame(action) {
    const player = this.gameState.players.find(p => p.id === action.playerId);
    if (!player) return false;
    
    // Только хост может начать игру
    if (!player.isHost) return false;
    
    // Минимум 2 игрока
    if (this.gameState.players.length < 2) return false;
    
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
    this.gameState.canPlay = this.gameState.players[0].id;
    
    // Запускаем таймер хода
    this.startTurnTimer();
  }

  // Запуск таймера хода
  startTurnTimer() {
    if (this.gameState.turnTimeout) {
      clearTimeout(this.gameState.turnTimeout);
    }
    
    this.gameState.turnTimeout = setTimeout(() => {
      this.nextPlayer();
    }, 30000); // 30 секунд на ход
  }

  // Переход к следующему игроку
  nextPlayer() {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
    this.gameState.canPlay = this.gameState.players[this.gameState.currentPlayer].id;
    
    // Перезапускаем таймер
    this.startTurnTimer();
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

  // Генерация ID игрока
  generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  // Регистрация обработчика событий
  on(event, handler) {
    this.eventHandlers.set(event, handler);
  }

  // Отправка действия
  emit(event, data) {
    if (!this.roomId) {
      console.error('[Serverless-P2P] Нет активной комнаты');
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
    return this.playerId;
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

export default ServerlessP2P;
