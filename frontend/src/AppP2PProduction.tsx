import { useState, useEffect } from 'react';
import './App.css';
import GameTable from './components/GameTable';
import React, { useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import DraggableCard from './components/DraggableCard';
import RoomSidebar from './components/RoomSidebar';
import Toast from './components/Toast';
import Lobby from './components/Lobby';
import SinglePlayerGame from './components/SinglePlayerGame';
import GameRules from './components/GameRules';
import AliasRules from './components/AliasRules';
import AliasGame from './components/AliasGame';
import MobileGameLayout from './components/MobileGameLayout';
import cards from './components/cards.json';
import CustomDragLayer from './components/CustomDragLayer';
import InfoModal from './components/InfoModal';
import ProductionP2P from './production-p2p.js';

// Генерация clientId (uuid)
function getOrCreateClientId() {
  let clientId = localStorage.getItem('chronium_clientId');
  if (!clientId) {
    clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('chronium_clientId', clientId);
  }
  return clientId as string;
}

const clientId = getOrCreateClientId();

// Удаляет дубликаты карт по id (оставляет первую встреченную)
function deduplicateTable(table: any[]) {
  const seen = new Set();
  const result = [];
  for (const card of table) {
    if (!seen.has(card.id)) {
      seen.add(card.id);
      result.push(card);
    }
  }
  return result;
}

// Получение начального состояния из sessionStorage
function getInitialStateFromStorage() {
  const savedRoomId = sessionStorage.getItem('chronium_roomId') || '';
  const savedPlayerName = sessionStorage.getItem('chronium_playerName') || '';
  const savedInLobby = sessionStorage.getItem('chronium_inLobby') === '1';
  const savedSingleMode = sessionStorage.getItem('chronium_singleMode') === '1';
  const savedGameStarted = sessionStorage.getItem('chronium_gameStarted') === '1';
  return {
    inRoom: !!savedRoomId,
    inLobby: savedInLobby,
    roomId: savedRoomId,
    playerName: savedPlayerName,
    singleMode: savedSingleMode,
    gameStarted: savedGameStarted
  };
}

// Функция для обогащения карточек из cards.json
function enrichCards(arr: any[]) {
  if (!arr) return arr;
  return arr.map(cardFromServer => {
    const fresh = cards.find(c => c.id === cardFromServer.id);
    return { ...cardFromServer, imageFront: fresh?.imageFront, imageBack: fresh?.imageBack };
  });
}

// Предзагрузка изображений
function preloadImages(urls: string[]) {
  urls.filter(Boolean).forEach((url) => {
    const img = new Image();
    (img as any).decoding = 'async';
    (img as any).loading = 'eager';
    img.src = url;
  });
}

const DEFAULT_TURN_TIME = 30;
const TURN_TIME_8 = 45;
const TURN_TIME_12 = 60;
const TURN_TIME_16 = 75;
const TURN_TIME_30 = 90;

function FooterKuBBiA() {
  return (
    <div className="footer" style={{ width: '100%', minHeight: 40, background: '#faf8f4', borderTop: '1px solid #ece6da', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c6f57', fontSize: 15, fontFamily: 'Istok Web, Arial, sans-serif', marginTop: 32, boxSizing: 'border-box', flexDirection: 'column', padding: '32px 0 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center', margin: '0 0 18px 0' }}>
        <span style={{ fontWeight: 700 }}>Оригинал и другие настольные игры можете приобрести в магазине KuBBiA - </span>
        <a href="https://kubbia.ru/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#742a2a', fontWeight: 700, textDecoration: 'underline' }}>
          <img src="/i (2).webp" alt="KuBBiA" style={{ width: 54, height: 54, objectFit: 'contain', background: '#fff', border: '2px solid #ece6da', borderRadius: 16, padding: 6, boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} />
          kubbia.ru
        </a>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, margin: '0 0 14px 0' }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, textAlign: 'center' }}>
          Заходите в наш Telegram канал, чтобы вы могли знать о новом контенте на сайте и о грядущих обновлениях
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
          <a href="https://t.me/bibleplaychannel" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#229ED9"/>
              <path d="M23.3 10.1L8.7 15.3C8.7 15.3 8.1 15.6 8.1 16C8.1 16.4 8.7 16.6 8.7 16.6L12.3 17.6C12.3 17.6 12.7 17.7 12.8 17.6C12.9 17.5 17.1 14.1 17.1 14.1C17.1 14.1 17.4 14 17.5 14.1C17.6 14.2 17.5 14.5 17.5 14.5L14.3 17.5C14.3 17.5 14.2 17.7 14.3 17.8C14.4 17.9 14.5 17.9 14.5 17.9L19.1 19C19.1 19 19.5 19.1 19.8 18.8C20.1 18.5 20.2 18 20.2 18L23.7 11.1C23.7 11.1 24.1 10.4 23.3 10.1Z" fill="white"/>
            </svg>
          </a>
        </div>
      </div>
      <div>При технических проблемах сайта и по другим вопросам, обращаться в наш Telegram - @bibleplay</div>
    </div>
  );
}

function App() {
  const initial = getInitialStateFromStorage();
  const [inRoom, setInRoom] = useState(initial.inRoom);
  const [inLobby, setInLobby] = useState(initial.inLobby);
  const [roomId, setRoomId] = useState(initial.roomId);
  const [hand, setHand] = useState<any[]>([]);
  const [table, setTable] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [deckCount, setDeckCount] = useState(0);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [currentPlayerClientId, setCurrentPlayerClientId] = useState('');
  const [joinRoomMode, setJoinRoomMode] = useState(false);
  const [createRoomMode, setCreateRoomMode] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [playerName, setPlayerName] = useState(initial.playerName);
  const [joinError, setJoinError] = useState('');
  const [winner, setWinner] = useState('');
  const [turnTimeout, setTurnTimeout] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(0);
  const [toast, setToast] = useState('');
  const [toastDuration, setToastDuration] = useState(2000);
  const [lobbyPlayers, setLobbyPlayers] = useState<Array<{ id: string; name: string; score: number; clientId?: string }>>([]);
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(initial.gameStarted);
  const [singleMode, setSingleMode] = useState(initial.singleMode);
  const [showRules, setShowRules] = useState(false);
  const [showAliasRules, setShowAliasRules] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const [nameError, setNameError] = useState('');
  const [scrollToCardIndex, setScrollToCardIndex] = useState<number | null>(null);
  const [lastPlayedCardId, setLastPlayedCardId] = useState<number | null>(null);
  const [canPlayNow, setCanPlayNow] = useState(false);
  const [showStartWarning, setShowStartWarning] = useState(() => {
    return sessionStorage.getItem('chronium_startWarningShown') !== '1';
  });
  const [selectedGame, setSelectedGame] = useState<'chronology' | 'alias' | null>(null);
  const [openInfoGame, setOpenInfoGame] = useState<null | 'chronology' | 'alias' | 'pharisees'>(null);
  const [aliasMenuMode, setAliasMenuMode] = useState(false);
  const [p2pMode, setP2pMode] = useState(false);
  const [p2pIntegration, setP2pIntegration] = useState<ProductionP2P | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Инициализация P2P-интеграции
  useEffect(() => {
    const initP2P = async () => {
      try {
        const p2p = new ProductionP2P();
        setP2pIntegration(p2p);
        setConnectionStatus('connected');
        console.log('[P2P] P2P-интеграция инициализирована');
      } catch (error) {
        console.error('[P2P] Ошибка инициализации P2P:', error);
        setConnectionStatus('disconnected');
      }
    };

    initP2P();
  }, []);

  // Обработчики P2P-событий
  useEffect(() => {
    if (!p2pIntegration) return;

    // Обработчик обновления игры
    p2pIntegration.on('game-update', (data: any) => {
      console.log('[P2P] Получено обновление игры:', data);
      if (data.hand) setHand(enrichCards(data.hand));
      if (data.table) setTable(enrichCards(data.table));
      if (data.deck) setDeckCount(data.deck.length);
      if (data.players) setLobbyPlayers(data.players);
      if (data.currentPlayerId) setCurrentPlayerId(data.currentPlayerId);
      if (data.turnTimeout) setTurnTimeout(data.turnTimeout);
      if (data.gameStarted !== undefined) setGameStarted(data.gameStarted);
    });

    // Обработчик обновления лобби
    p2pIntegration.on('lobby-update', (data: any) => {
      console.log('[P2P] Получено обновление лобби:', data);
      if (data.players) setLobbyPlayers(data.players);
      if (data.gameStarted !== undefined) setGameStarted(data.gameStarted);
    });

    // Обработчик ошибок
    p2pIntegration.on('error', (data: any) => {
      console.error('[P2P] Ошибка:', data);
      setToast(data.message || 'Ошибка P2P-соединения');
    });

  }, [p2pIntegration]);

  // Создание комнаты через P2P
  const createRoomP2P = async () => {
    if (!playerName.trim()) {
      setToast('Введите ваше имя');
      return;
    }

    if (!p2pIntegration) {
      setToast('P2P-соединение не инициализировано');
      return;
    }

    try {
      setConnectionStatus('connecting');
      const roomId = Math.random().toString(36).substr(2, 6);
      const result = await p2pIntegration.createRoom(roomId, playerName.trim());
      
      if (result.success) {
        setRoomId(result.roomId);
        setInRoom(true);
        setInLobby(true);
        setIsHost(true);
        setP2pMode(true);
        setConnectionStatus('connected');
        
        sessionStorage.setItem('chronium_roomId', result.roomId);
        sessionStorage.setItem('chronium_playerName', playerName.trim());
        sessionStorage.setItem('chronium_inLobby', '1');
        sessionStorage.setItem('chronium_singleMode', '0');
        sessionStorage.setItem('chronium_p2pMode', '1');
        
        setToast('Комната создана! Поделитесь кодом комнаты с друзьями');
      } else {
        setToast(result.error || 'Ошибка создания комнаты');
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('[P2P] Ошибка создания комнаты:', error);
      setToast('Ошибка создания комнаты');
      setConnectionStatus('disconnected');
    }
  };

  // Подключение к комнате через P2P
  const joinRoomP2P = async () => {
    if (!joinRoomId.trim()) {
      setToast('Введите код комнаты');
      return;
    }
    if (!playerName.trim()) {
      setToast('Введите ваше имя');
      return;
    }

    if (!p2pIntegration) {
      setToast('P2P-соединение не инициализировано');
      return;
    }

    try {
      setConnectionStatus('connecting');
      const result = await p2pIntegration.joinRoom(joinRoomId.trim(), playerName.trim());
      
      if (result.success) {
        setRoomId(result.roomId);
        setInRoom(true);
        setInLobby(true);
        setIsHost(false);
        setP2pMode(true);
        setConnectionStatus('connected');
        
        sessionStorage.setItem('chronium_roomId', result.roomId);
        sessionStorage.setItem('chronium_playerName', playerName.trim());
        sessionStorage.setItem('chronium_inLobby', '1');
        sessionStorage.setItem('chronium_singleMode', '0');
        sessionStorage.setItem('chronium_p2pMode', '1');
        
        setToast('Подключение к комнате успешно!');
      } else {
        setToast(result.error || 'Ошибка подключения к комнате');
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('[P2P] Ошибка подключения к комнате:', error);
      setToast('Ошибка подключения к комнате');
      setConnectionStatus('disconnected');
    }
  };

  // Начало игры через P2P
  const startGameP2P = () => {
    if (!p2pIntegration) {
      setToast('P2P-соединение не инициализировано');
      return;
    }

    p2pIntegration.emit('start-game', {});
  };

  // Игра карты через P2P
  const playCardP2P = (cardId: number, insertIndex: number) => {
    if (!p2pIntegration) {
      setToast('P2P-соединение не инициализировано');
      return;
    }

    p2pIntegration.emit('play-card', { cardId, insertIndex });
  };

  // Покидание комнаты через P2P
  const leaveRoomP2P = () => {
    if (!p2pIntegration) {
      setToast('P2P-соединение не инициализировано');
      return;
    }

    p2pIntegration.close();
    
    setWinner('');
    setInRoom(false);
    setInLobby(false);
    setGameStarted(false);
    setP2pMode(false);
    setConnectionStatus('disconnected');
    
    sessionStorage.removeItem('chronium_roomId');
    sessionStorage.removeItem('chronium_inLobby');
    sessionStorage.removeItem('chronium_singleMode');
    sessionStorage.removeItem('chronium_p2pMode');
  };

  // Остальные функции остаются без изменений...
  // (здесь должны быть все остальные функции из оригинального App.tsx)

  return (
    <div className="App">
      {/* P2P-режим индикатор */}
      {p2pMode && (
        <div style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: connectionStatus === 'connected' ? '#4CAF50' : connectionStatus === 'connecting' ? '#FF9800' : '#F44336',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          P2P: {connectionStatus === 'connected' ? 'Подключено' : connectionStatus === 'connecting' ? 'Подключение...' : 'Отключено'}
        </div>
      )}

      {/* Остальной интерфейс остается без изменений */}
      {/* Здесь должен быть весь остальной JSX из оригинального App.tsx */}
      
      <FooterKuBBiA />
    </div>
  );
}

export default App;
