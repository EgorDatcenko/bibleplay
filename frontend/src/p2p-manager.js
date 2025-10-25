// P2P Manager для обнаружения и подключения к локальным серверам
class P2PManager {
  constructor() {
    this.localServers = new Map(); // roomId -> connectionInfo
    this.connections = new Map(); // roomId -> socket
    this.isHost = false;
    this.hostProcess = null;
  }

  // Запуск локального сервера (только для хоста)
  async startLocalServer() {
    if (this.isHost) {
      console.log('[P2P] Локальный сервер уже запущен');
      return;
    }

    try {
      // В реальном приложении здесь был бы запуск Node.js процесса
      // Для демонстрации симулируем запуск
      console.log('[P2P] Запуск локального сервера...');
      
      // В браузере мы не можем напрямую запустить Node.js
      // Поэтому используем WebRTC для P2P соединений
      this.isHost = true;
      
      // Симулируем информацию о подключении
      const connectionInfo = {
        host: window.location.hostname,
        port: Math.floor(Math.random() * 1000) + 3000,
        protocol: 'ws',
        roomId: this.generateRoomId()
      };
      
      this.localServers.set(connectionInfo.roomId, connectionInfo);
      return connectionInfo;
      
    } catch (error) {
      console.error('[P2P] Ошибка запуска локального сервера:', error);
      throw error;
    }
  }

  // Остановка локального сервера
  async stopLocalServer() {
    if (this.hostProcess) {
      this.hostProcess.kill();
      this.hostProcess = null;
    }
    this.isHost = false;
    this.localServers.clear();
  }

  // Подключение к локальному серверу
  async connectToLocalServer(connectionInfo) {
    const { host, port, protocol } = connectionInfo;
    const socketUrl = `${protocol}://${host}:${port}`;
    
    try {
      console.log('[P2P] Подключение к локальному серверу:', socketUrl);
      
      // В реальном приложении здесь было бы подключение через Socket.io
      // Для демонстрации используем WebRTC
      const connection = await this.createWebRTCConnection(connectionInfo);
      this.connections.set(connectionInfo.roomId, connection);
      
      return connection;
      
    } catch (error) {
      console.error('[P2P] Ошибка подключения к локальному серверу:', error);
      throw error;
    }
  }

  // Создание WebRTC соединения для P2P
  async createWebRTCConnection(connectionInfo) {
    return new Promise((resolve, reject) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      const dataChannel = peerConnection.createDataChannel('gameData', {
        ordered: true
      });

      dataChannel.onopen = () => {
        console.log('[P2P] WebRTC Data Channel открыт');
        resolve({
          type: 'webrtc',
          connection: peerConnection,
          dataChannel: dataChannel,
          roomId: connectionInfo.roomId
        });
      };

      dataChannel.onerror = (error) => {
        console.error('[P2P] Ошибка Data Channel:', error);
        reject(error);
      };

      // Обработка ICE кандидатов
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // В реальном приложении здесь была бы отправка кандидата другому пиру
          console.log('[P2P] ICE кандидат:', event.candidate);
        }
      };

      // Создание offer
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          // В реальном приложении здесь была бы отправка offer другому пиру
          console.log('[P2P] Offer создан');
        })
        .catch(reject);
    });
  }

  // Отправка сообщения через P2P соединение
  sendMessage(roomId, event, data) {
    const connection = this.connections.get(roomId);
    if (!connection) {
      console.error('[P2P] Соединение не найдено для комнаты:', roomId);
      return;
    }

    if (connection.type === 'webrtc' && connection.dataChannel) {
      const message = JSON.stringify({ event, data });
      connection.dataChannel.send(message);
    }
  }

  // Прослушивание сообщений через P2P соединение
  onMessage(roomId, callback) {
    const connection = this.connections.get(roomId);
    if (!connection) {
      console.error('[P2P] Соединение не найдено для комнаты:', roomId);
      return;
    }

    if (connection.type === 'webrtc' && connection.dataChannel) {
      connection.dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          callback(message.event, message.data);
        } catch (error) {
          console.error('[P2P] Ошибка парсинга сообщения:', error);
        }
      };
    }
  }

  // Генерация ID комнаты
  generateRoomId() {
    return Math.random().toString(36).substr(2, 6);
  }

  // Обнаружение доступных локальных серверов
  async discoverLocalServers() {
    // В реальном приложении здесь был бы поиск через mDNS или другие механизмы
    // Для демонстрации возвращаем пустой массив
    return [];
  }

  // Создание комнаты с локальным сервером
  async createRoomWithLocalServer(playerName) {
    try {
      const connectionInfo = await this.startLocalServer();
      const connection = await this.connectToLocalServer(connectionInfo);
      
      // Эмулируем создание комнаты
      const roomData = {
        roomId: connectionInfo.roomId,
        connectionInfo,
        connection,
        isHost: true
      };
      
      return roomData;
      
    } catch (error) {
      console.error('[P2P] Ошибка создания комнаты:', error);
      throw error;
    }
  }

  // Подключение к существующей комнате
  async joinRoom(roomId, playerName) {
    try {
      // В реальном приложении здесь был бы поиск комнаты по ID
      // Для демонстрации создаем фиктивное подключение
      const connectionInfo = {
        host: 'localhost',
        port: 3001,
        protocol: 'ws',
        roomId
      };
      
      const connection = await this.connectToLocalServer(connectionInfo);
      
      return {
        roomId,
        connectionInfo,
        connection,
        isHost: false
      };
      
    } catch (error) {
      console.error('[P2P] Ошибка подключения к комнате:', error);
      throw error;
    }
  }

  // Закрытие соединения
  closeConnection(roomId) {
    const connection = this.connections.get(roomId);
    if (connection) {
      if (connection.type === 'webrtc' && connection.connection) {
        connection.connection.close();
      }
      this.connections.delete(roomId);
    }
  }

  // Получение информации о подключении для других игроков
  getConnectionInfo(roomId) {
    const connection = this.connections.get(roomId);
    if (!connection) return null;
    
    return {
      roomId,
      isHost: this.isHost,
      connectionType: connection.type,
      status: connection.dataChannel?.readyState || 'disconnected'
    };
  }
}

// Экспорт для использования в приложении
export default P2PManager;
