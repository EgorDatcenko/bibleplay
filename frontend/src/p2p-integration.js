// Интеграция P2P-функциональности в основное приложение
import P2PManager from './p2p-manager.js';

class P2PIntegration {
  constructor() {
    this.p2pManager = new P2PManager();
    this.currentRoom = null;
    this.gameState = null;
    this.eventHandlers = new Map();
  }

  // Инициализация P2P-функциональности
  async initialize() {
    console.log('[P2P-INTEGRATION] Инициализация P2P-функциональности');
    
    // Проверяем поддержку WebRTC
    if (!this.isWebRTCSupported()) {
      throw new Error('WebRTC не поддерживается в этом браузере');
    }
    
    return true;
  }

  // Проверка поддержки WebRTC
  isWebRTCSupported() {
    return !!(window.RTCPeerConnection && window.RTCDataChannel);
  }

  // Создание комнаты с локальным сервером
  async createRoom(playerName) {
    try {
      console.log('[P2P-INTEGRATION] Создание комнаты для игрока:', playerName);
      
      const roomData = await this.p2pManager.createRoomWithLocalServer(playerName);
      this.currentRoom = roomData;
      
      // Настраиваем обработчики событий
      this.setupEventHandlers(roomData.roomId);
      
      return {
        success: true,
        roomId: roomData.roomId,
        connectionInfo: roomData.connectionInfo,
        isHost: true
      };
      
    } catch (error) {
      console.error('[P2P-INTEGRATION] Ошибка создания комнаты:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Подключение к комнате
  async joinRoom(roomId, playerName) {
    try {
      console.log('[P2P-INTEGRATION] Подключение к комнате:', roomId);
      
      const roomData = await this.p2pManager.joinRoom(roomId, playerName);
      this.currentRoom = roomData;
      
      // Настраиваем обработчики событий
      this.setupEventHandlers(roomData.roomId);
      
      return {
        success: true,
        roomId: roomData.roomId,
        connectionInfo: roomData.connectionInfo,
        isHost: false
      };
      
    } catch (error) {
      console.error('[P2P-INTEGRATION] Ошибка подключения к комнате:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Настройка обработчиков событий
  setupEventHandlers(roomId) {
    // Обработчик входящих сообщений
    this.p2pManager.onMessage(roomId, (event, data) => {
      console.log('[P2P-INTEGRATION] Получено сообщение:', event, data);
      
      // Вызываем соответствующий обработчик
      const handler = this.eventHandlers.get(event);
      if (handler) {
        handler(data);
      }
    });
  }

  // Регистрация обработчика событий
  on(event, handler) {
    this.eventHandlers.set(event, handler);
  }

  // Отправка события
  emit(event, data) {
    if (!this.currentRoom) {
      console.error('[P2P-INTEGRATION] Нет активной комнаты');
      return;
    }
    
    this.p2pManager.sendMessage(this.currentRoom.roomId, event, data);
  }

  // Начало игры
  startGame() {
    if (!this.currentRoom) {
      console.error('[P2P-INTEGRATION] Нет активной комнаты');
      return;
    }
    
    this.emit('startGame', { roomId: this.currentRoom.roomId });
  }

  // Игра карты
  playCard(cardId, insertIndex) {
    if (!this.currentRoom) {
      console.error('[P2P-INTEGRATION] Нет активной комнаты');
      return;
    }
    
    this.emit('playCard', {
      roomId: this.currentRoom.roomId,
      cardId,
      insertIndex
    });
  }

  // Взятие карты
  drawCard() {
    if (!this.currentRoom) {
      console.error('[P2P-INTEGRATION] Нет активной комнаты');
      return;
    }
    
    this.emit('drawCard', { roomId: this.currentRoom.roomId });
  }

  // Изменение имени
  changeName(newName) {
    if (!this.currentRoom) {
      console.error('[P2P-INTEGRATION] Нет активной комнаты');
      return;
    }
    
    this.emit('changeName', {
      roomId: this.currentRoom.roomId,
      newName
    });
  }

  // Покидание комнаты
  leaveRoom() {
    if (!this.currentRoom) {
      console.error('[P2P-INTEGRATION] Нет активной комнаты');
      return;
    }
    
    this.emit('leaveRoom', { roomId: this.currentRoom.roomId });
    
    // Закрываем соединение
    this.p2pManager.closeConnection(this.currentRoom.roomId);
    this.currentRoom = null;
  }

  // Получение информации о комнате
  getRoomInfo() {
    if (!this.currentRoom) return null;
    
    return {
      roomId: this.currentRoom.roomId,
      isHost: this.currentRoom.isHost,
      connectionInfo: this.currentRoom.connectionInfo
    };
  }

  // Получение состояния игры
  getGameState() {
    return this.gameState;
  }

  // Обновление состояния игры
  updateGameState(newState) {
    this.gameState = newState;
  }

  // Очистка ресурсов
  cleanup() {
    if (this.currentRoom) {
      this.leaveRoom();
    }
    
    this.eventHandlers.clear();
    this.gameState = null;
  }

  // Получение статистики соединения
  getConnectionStats() {
    if (!this.currentRoom) return null;
    
    return this.p2pManager.getConnectionInfo(this.currentRoom.roomId);
  }
}

// Экспорт для использования в приложении
export default P2PIntegration;
