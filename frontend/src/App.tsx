import { useState } from 'react';
import './App.css';
import { io, Socket } from 'socket.io-client';
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
import MobileGameLayout from './components/MobileGameLayout';
import cards from './components/cards.json';

// Исправить определение backendHost:
// Если window.location.hostname === 'localhost', использовать prompt для ввода IP или брать из localStorage, иначе использовать window.location.hostname
let backendHost = window.location.hostname;
if (backendHost === 'localhost') {
  backendHost = localStorage.getItem('chronium_backend_ip') || prompt('Введите IP-адрес сервера (ПК):', '') || 'localhost';
  localStorage.setItem('chronium_backend_ip', backendHost);
}
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
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('apiUrl:', apiUrl);
const socket: Socket = io(apiUrl, { query: { clientId } });
(window as any).chroniumSocket = socket;

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
    // Всегда подставляем imageFront и imageBack из cards.json, остальные поля не трогаем
    return { ...cardFromServer, imageFront: fresh?.imageFront, imageBack: fresh?.imageBack };
  });
}

const DEFAULT_TURN_TIME = 30; // секунд
const TURN_TIME_8 = 45;
const TURN_TIME_12 = 60;
const TURN_TIME_16 = 75;
const TURN_TIME_30 = 90;

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

  // refs для автоскролла к формам
  const createFormRef = useRef<HTMLDivElement>(null);
  const joinFormRef = useRef<HTMLDivElement>(null);

  // Проверяем URL для автоматического входа в комнату
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setJoinRoomId(roomParam);
      setJoinRoomMode(true);
    }
  }, []);

  // Восстановление состояния из sessionStorage при загрузке страницы (только один раз)
  React.useEffect(() => {
    const savedRoomId = sessionStorage.getItem('chronium_roomId');
    const savedPlayerName = sessionStorage.getItem('chronium_playerName');
    const savedInLobby = sessionStorage.getItem('chronium_inLobby');
    const savedGameStarted = sessionStorage.getItem('chronium_gameStarted');
    const savedSingleMode = sessionStorage.getItem('chronium_singleMode');
    console.log('[APP-MOUNT] clientId:', clientId, 'sessionStorage:', {
      roomId: sessionStorage.getItem('chronium_roomId'),
      playerName: sessionStorage.getItem('chronium_playerName'),
      inLobby: sessionStorage.getItem('chronium_inLobby'),
      gameStarted: sessionStorage.getItem('chronium_gameStarted'),
      singleMode: sessionStorage.getItem('chronium_singleMode')
    });
    // Одиночка
    if (savedSingleMode === '1') {
      setSingleMode(true);
      setInRoom(false);
      setInLobby(false);
      return;
    }
    // Мультиплеер: только если есть ВСЕ ключи
    if (savedRoomId && savedPlayerName && savedInLobby && savedGameStarted !== null) {
      // console.log('Вызываю joinRoom с:', { roomId: savedRoomId, name: savedPlayerName, clientId });
      socket.emit('joinRoom', { roomId: savedRoomId, name: savedPlayerName, clientId }, (res: any) => {
        // console.log('Ответ на joinRoom:', res);
        if (!res || res.error || !res.roomId || !Array.isArray(res.players)) {
          setToast('Ошибка восстановления лобби. Возврат в меню.');
          goToMenu();
          return;
        }
        const foundSelfById = (res.players as any[]).some((p: any) => p.id === socket.id);
        if (!foundSelfById || res.players.length === 0) {
          setToast('Ошибка восстановления: вы не в комнате. Возврат в меню.');
          goToMenu();
          return;
        }
        setRoomId(res.roomId);
        setHand(enrichCards(res.hand || []));
        setSingleMode(false);
        if (res.gameStarted) {
          setInRoom(true);
          setInLobby(false);
          setGameStarted(true);
          if (res.table) setTable(enrichCards(res.table));
          if (res.deck) setDeckCount(res.deck.length);
          if (res.currentPlayerId) setCurrentPlayerId(res.currentPlayerId);
          if (res.currentPlayerClientId) setCurrentPlayerClientId(res.currentPlayerClientId);
          if (res.turnTimeout) setTurnTimeout(res.turnTimeout);
        } else {
          setInRoom(true);
          setInLobby(true);
          setGameStarted(false);
        }
        sessionStorage.setItem('chronium_roomId', res.roomId);
        sessionStorage.setItem('chronium_playerName', savedPlayerName);
        sessionStorage.setItem('chronium_inLobby', res.gameStarted ? '0' : '1');
        sessionStorage.setItem('chronium_singleMode', '0');
        sessionStorage.setItem('chronium_gameStarted', res.gameStarted ? '1' : '0');
      });
    }
  }, []);

  // Сохранять gameStarted в sessionStorage при изменении
  React.useEffect(() => {
    sessionStorage.setItem('chronium_gameStarted', gameStarted ? '1' : '0');
  }, [gameStarted]);

  // Обновление состояния комнаты
  React.useEffect(() => {
    let updateCount = 0;
    socket.on('lobbyUpdate', (data: any) => {
      // console.log('lobbyUpdate data:', data);
      if (!data || !data.players) return;
      setLobbyPlayers(data.players.filter((p: any) => p && (p.online === undefined || p.online === true)));
      setGameStarted(!!data.gameStarted);
      // Автоматическая передача isHost
      if (data.players && data.players.length > 0) {
        setIsHost(data.players[0].id === socket.id);
      } else {
        setIsHost(false);
      }
    });

    socket.on('gameStarted', (data: any) => {
      if (!data || !data.hand) return;
      setHand(enrichCards(data.hand));
      setInLobby(false);
      setGameStarted(true);
      setCurrentPlayerId(data.currentPlayerId || '');
      setCurrentPlayerClientId(data.currentPlayerClientId || '');
      setTurnTimeout(data.turnTimeout || 0);
      // Показываем предупреждение только один раз за сессию
      if (sessionStorage.getItem('chronium_startWarningShown') !== '1') {
        setShowStartWarning(true);
        sessionStorage.setItem('chronium_startWarningShown', '1');
      }
    });

    socket.on('update', (room: any) => {
      // Логирование для диагностики синхронизации хода
      console.log('[SYNC-DEBUG] socket.id:', socket.id, 'currentPlayerId:', room.currentPlayerId, 'currentPlayerClientId:', room.currentPlayerClientId, 'clientId:', clientId);
      // console.log('update data:', room);
      if (!room || !room.players) return;
      updateCount++;
      // console.log('--- update event #' + updateCount + ' ---');
      // console.log('table from server:', room.table);
      // if (Array.isArray(room.table)) {
      //   room.table.forEach((c: any, i: number) => console.log(`card[${i}]`, c));
      // }
      // Фильтруем дубликаты на клиенте
      const filteredTable = deduplicateTable(room.table || []);
      setTable(enrichCards(JSON.parse(JSON.stringify(filteredTable))));
      setDeckCount(room.deck ? room.deck.length : 0);
      setCurrentPlayerId(room.currentPlayerId || '');
      setCurrentPlayerClientId(room.currentPlayerClientId || '');
      setTurnTimeout(room.turnTimeout || 0);
      // Обновляем список игроков для sidebar
      setLobbyPlayers(Array.isArray(room.players) ? room.players.filter((p: any) => p && (p.online === undefined || p.online === true)) : []);
      // Обновляем руку только если она передана в обновлении
      if (room.hand) {
        setHand(enrichCards(JSON.parse(JSON.stringify(room.hand))));
      }
      // Разрешаем ходить только если ход реально за этим сокетом
      // Удаляю обработку syncTurn и canPlayNow
    });

    socket.on('gameOver', (data: any) => {
      setIsGameOver(true);
      if (data && data.winners) {
        setWinner(Array.isArray(data.winners) ? data.winners.map((w: any) => w.name || w.id).join(', ') : data.winners);
      }
      if (data && data.scoreboard) {
        setScoreboard(data.scoreboard);
      } else {
        setScoreboard([]);
      }
      // Можно добавить отображение scoreboard, если нужно
    });

    socket.on('autoSkipNotice', (data: any) => {
      if (data && data.message) {
        setToast(data.message);
        setToastDuration(10000);
        setTimeout(() => setToast(''), 10000);
      }
    });

    return () => {
      socket.off('lobbyUpdate');
      socket.off('gameStarted');
      socket.off('update');
      socket.off('gameOver');
      socket.off('autoSkipNotice');
    };
  }, []);

  React.useEffect(() => {
    if (!turnTimeout) return;
    const interval = setInterval(() => {
      setTurnTimeLeft(Math.max(0, Math.floor((turnTimeout - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(interval);
  }, [turnTimeout]);

  React.useEffect(() => {
    if (gameStarted && !winner) {
      setTimeout(() => setToast('Перетащите карту на линию, чтобы начать!'), 500);
    }
  }, [gameStarted, winner]);

  // Toast с авто-скрытием
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), toastDuration);
      return () => clearTimeout(timer);
    }
  }, [toast, toastDuration]);

  // При выходе в меню (главная)
  const goToMenu = () => {
    setInRoom(false);
    setInLobby(false);
    setGameStarted(false);
    setSingleMode(false);
    setHand([]);
    setTable([]);
    setLobbyPlayers([]);
    setIsHost(false);
    setRoomId('');
    setPlayerName('');
    setJoinRoomMode(false);
    setJoinRoomId('');
    setJoinError('');
    setWinner('');
    // Полностью очищаем sessionStorage для мультиплеера и одиночки
    sessionStorage.clear();
  };

  // При переходе в одиночный режим
  const goToSingleMode = () => {
    setSingleMode(true);
    setInRoom(false);
    setInLobby(false);
    // Сохраняем только singleMode
    sessionStorage.setItem('chronium_singleMode', '1');
    sessionStorage.removeItem('chronium_roomId');
    sessionStorage.removeItem('chronium_playerName');
    sessionStorage.removeItem('chronium_inLobby');
    // Очищаем мультиплеерное состояние
    sessionStorage.removeItem('chronium_roomId');
    sessionStorage.removeItem('chronium_playerName');
    sessionStorage.removeItem('chronium_inLobby');
  };

  // При создании комнаты
  const createRoom = () => {
    if (!playerName.trim()) {
      setNameError('Введите ваше имя');
      setToast('Введите ваше имя');
      return;
    }
    setNameError('');
    socket.emit('createRoom', { name: playerName.trim(), clientId }, (response: any) => {
      if (!response || !response.roomId || !response.hand) {
        setToast('Ошибка создания комнаты');
        return;
      }
      setRoomId(response.roomId);
      setHand(enrichCards(response.hand));
      setInRoom(true);
      setInLobby(true);
      setIsHost(true);
      setSingleMode(false);
      // Сохраняем состояние
      sessionStorage.setItem('chronium_roomId', response.roomId);
      sessionStorage.setItem('chronium_playerName', playerName.trim());
      sessionStorage.setItem('chronium_inLobby', '1');
      sessionStorage.setItem('chronium_singleMode', '0');
    });
  };

  const startGame = () => {
    socket.emit('startGame', { roomId }, (response: any) => {
      if (!response) return;
      if (response.error) {
        setToast(response.error);
      }
    });
  };

  const changeName = (newName: string) => {
    socket.emit('changeName', { roomId, newName }, (response: any) => {
      if (!response) return;
      if (response.error) {
        setToast(response.error);
      } else {
        setPlayerName(newName);
      }
    });
  };

  const leaveRoom = () => {
    socket.emit('leaveRoom', { roomId }, (response: any) => {
      if (!response) return;
      if (response.error) {
        setToast(response.error);
      } else {
        setWinner('');
        // Вместо ручного сброса — вызываем goToMenu для полного сброса и очистки localStorage
        goToMenu();
        // Очищаем одиночное состояние на всякий случай
        sessionStorage.removeItem('chronium_single_state');
      }
    });
  };

  // Количество карт для прогресса (например, 10 или 12, либо динамически)
  const maxProgressCards = 10; // Можно заменить на нужное число или сделать динамическим
  const progress = table.length > 0 ? Math.min(100, Math.round((table.length / maxProgressCards) * 100)) : 0;

  const onDropCard = (cardId: number, insertIndex: number) => {
    console.log('[DROP-CARD-DEBUG]', {
      socketId: socket.id,
      currentPlayerId,
      clientId,
      currentPlayerClientId,
      isGameOver,
      handLength: hand.length
    });
    if (isGameOver || hand.length === 0) {
      setToast('Игра завершена или у вас нет карт!');
      console.log('[DROP-CARD-DEBUG] Блокировка: isGameOver или hand.length === 0');
      return;
    }
    if (!(currentPlayerId === socket.id || currentPlayerClientId === clientId)) {
      setToast('Дождитесь своего хода!');
      console.log('[DROP-CARD-DEBUG] Блокировка: не ваш ход (жёсткая проверка)');
      return;
    }
    setLastPlayedCardId(cardId);
    socket.emit('playCard', {
      roomId,
      cardId,
      insertIndex
    }, (res: any) => {
      if (res && res.incorrect) {
        setToast('❌ Карта не попала в правильный порядок!');
        setToastDuration(3500);
        if (typeof res.correctIndex === 'number') {
          setScrollToCardIndex(res.correctIndex);
        } else {
          setTimeout(() => {
            setTable(prevTable => {
              const idx = deduplicateTable(prevTable).findIndex(c => c.id === cardId);
              if (idx !== -1) setScrollToCardIndex(idx);
              return prevTable;
            });
          }, 0);
        }
      } else if (res && !res.error) {
        setToast('✅ Верно!');
        setToastDuration(1800);
        setScrollToCardIndex(null);
      }
      if (res && res.error) {
        if (res.error === 'Сейчас не ваш ход') {
          setToast('Из-за вашего переподключения вы не можете сделать ход, дождитесь окончания таймера для продолжения игры');
          setToastDuration(10000); // 10 секунд
        } else {
          setToast(res.error);
          // Не сбрасываем toastDuration здесь, чтобы не перебивать длительность для других сообщений
        }
      }
    });
  };

  // При входе в комнату
  const joinRoom = () => {
    if (!joinRoomId.trim()) {
      setToast('Введите код комнаты');
      return;
    }
    if (!playerName.trim()) {
      setNameError('Введите ваше имя');
      setToast('Введите ваше имя');
      return;
    }
    setNameError('');
    console.log('[JOINROOM-CALL]', { roomId, playerName, clientId });
    socket.emit('joinRoom', { roomId: joinRoomId.trim().toLowerCase(), name: playerName, clientId }, (res: any) => {
      if (!res) {
        setToast('Ошибка соединения с сервером');
        return;
      }
      if (res.error) {
        setToast(res.error);
        setJoinError(res.error);
      } else if (res.roomId && res.hand) {
        setRoomId(res.roomId);
        setHand(enrichCards(res.hand));
        setInRoom(true);
        setInLobby(true);
        setSingleMode(false);
        if (res.gameStarted) {
          setInRoom(true);
          setInLobby(false);
          setGameStarted(true);
          if (res.table) setTable(enrichCards(res.table));
          if (res.deck) setDeckCount(res.deck.length);
          if (res.currentPlayerId) setCurrentPlayerId(res.currentPlayerId);
          if (res.currentPlayerClientId) setCurrentPlayerClientId(res.currentPlayerClientId);
          if (res.turnTimeout) setTurnTimeout(res.turnTimeout);
        } else {
          setInRoom(true);
          setInLobby(true);
          setGameStarted(false);
        }
        sessionStorage.setItem('chronium_roomId', res.roomId);
        sessionStorage.setItem('chronium_playerName', playerName);
        sessionStorage.setItem('chronium_inLobby', '1');
        sessionStorage.setItem('chronium_singleMode', '0');
      } else {
        setToast('Некорректный ответ сервера');
      }
    });
  };

  // Проверка наличия сохранённой одиночки и мультиплеера
  const hasSingleSave = !!sessionStorage.getItem('chronium_single_state');
  const hasMultiplayerSave = !!sessionStorage.getItem('chronium_roomId') && sessionStorage.getItem('chronium_inLobby') === '1';

  // Обработчики для главного меню
  const handleContinueSingle = () => {
    sessionStorage.setItem('chronium_singleMode', '1');
    setSingleMode(true);
    setInRoom(false);
    setInLobby(false);
  };
  const handleNewSingle = () => {
    sessionStorage.removeItem('chronium_single_state');
    sessionStorage.setItem('chronium_singleMode', '1');
    setSingleMode(false); // Сбросить, чтобы компонент размонтировался
    setTimeout(() => setSingleMode(true), 0); // Монтируем заново новую игру
    setInRoom(false);
    setInLobby(false);
  };
  const handleContinueMultiplayer = () => {
    // Просто обновляем страницу, чтобы сработал useEffect восстановления
    window.location.reload();
  };
  const handleExitMultiplayer = () => {
    sessionStorage.removeItem('chronium_roomId');
    sessionStorage.removeItem('chronium_playerName');
    sessionStorage.removeItem('chronium_inLobby');
    sessionStorage.removeItem('chronium_gameStarted');
    setInRoom(false);
    setInLobby(false);
    setGameStarted(false);
    setRoomId('');
    setPlayerName('');
  };

  // Добавить обработчик deckCleared
  React.useEffect(() => {
    socket.on('deckCleared', () => {
      setDeckCount(0);
      setToast('Колода очищена (тест)!');
    });
    return () => {
      socket.off('deckCleared');
    };
  }, []);

  // Автоскролл к форме на мобильных
  React.useEffect(() => {
    if (createRoomMode && typeof window !== 'undefined' && window.innerWidth <= 700 && createFormRef.current) {
      setTimeout(() => createFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
    if (joinRoomMode && typeof window !== 'undefined' && window.innerWidth <= 700 && joinFormRef.current) {
      setTimeout(() => joinFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [createRoomMode, joinRoomMode]);

  // После рендера сбрасываем scrollToCardIndex
  React.useEffect(() => {
    if (scrollToCardIndex !== null) {
      const timer = setTimeout(() => setScrollToCardIndex(null), 500);
      return () => clearTimeout(timer);
    }
  }, [scrollToCardIndex, table]);

  // Динамический таймер хода
  React.useEffect(() => {
    if (!gameStarted) return;
    let turnTime = DEFAULT_TURN_TIME;
    const cardsOnTable = deduplicateTable(table).length;
    if (cardsOnTable > 30) turnTime = TURN_TIME_30;
    else if (cardsOnTable > 16) turnTime = TURN_TIME_16;
    else if (cardsOnTable > 12) turnTime = TURN_TIME_12;
    else if (cardsOnTable > 8) turnTime = TURN_TIME_8;
    setTurnTimeout(Date.now() + turnTime * 1000);
  }, [gameStarted, table]);

  if (winner) {
    // Если есть scoreboard и игроков больше 3, показываем таблицу мест и очков
    if (scoreboard && scoreboard.length > 3) {
      // Сортируем по месту (если есть finishedPlace), иначе по количеству карт и очкам
      const sorted = [...scoreboard].sort((a, b) => {
        if (a.finishedPlace && b.finishedPlace) return a.finishedPlace - b.finishedPlace;
        if (a.hand !== undefined && b.hand !== undefined && a.hand !== b.hand) return a.hand - b.hand;
        return b.score - a.score;
      });
      return (
        <>
          <div className="header"><span className="header-logo">BiblePlay</span></div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#f9f6ef',
            padding: '20px'
          }}>
            <div style={{
              background: '#faf8f4',
              borderRadius: 16,
              padding: '40px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #ece6da',
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 64, marginBottom: 24 }}>🏆</div>
              <h1 style={{ marginBottom: 16, color: '#2c1810', fontSize: 32, fontWeight: 700 }}>Игра окончена</h1>
              <div style={{ fontSize: 22, marginBottom: 24, color: '#7c6f57', fontWeight: 500 }}>Распределение мест и очков:</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
                <thead>
                  <tr style={{ background: '#ece6da', color: '#2c1810', fontWeight: 700 }}>
                    <th style={{ padding: 8, borderRadius: 6 }}>Место</th>
                    <th style={{ padding: 8, borderRadius: 6 }}>Имя</th>
                    <th style={{ padding: 8, borderRadius: 6 }}>Очки</th>
                    {sorted[0].hand !== undefined && <th style={{ padding: 8, borderRadius: 6 }}>Карт на руках</th>}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((player, idx) => (
                    <tr key={player.id} style={{ background: idx % 2 === 0 ? '#faf8f4' : '#f1e9db' }}>
                      <td style={{ padding: 8, fontWeight: 700 }}>{player.finishedPlace || idx + 1}</td>
                      <td style={{ padding: 8 }}>{player.name}</td>
                      <td style={{ padding: 8 }}>{player.score}</td>
                      {player.hand !== undefined && <td style={{ padding: 8 }}>{player.hand}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: '#d4a373',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '16px 32px',
                  fontSize: 18,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background-color 0.3s'
                }}
              >
                🎮 Новая игра
              </button>
            </div>
          </div>
          <div className="footer">При технических проблемах сайта и по другим вопросам, обращаться в наш telegram - @bibleplay</div>
        </>
      );
    }
    // Если игроков 2-3, показываем просто победителя
    return (
      <>
        <div className="header"><span className="header-logo">BiblePlay</span></div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f9f6ef',
          padding: '20px'
        }}>
          <div style={{
            background: '#faf8f4',
            borderRadius: 16,
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #ece6da',
            maxWidth: 500,
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 64,
              marginBottom: 24
            }}>
              🏆
            </div>
            
            <h1 style={{ 
              marginBottom: 16, 
              color: '#2c1810',
              fontSize: 32,
              fontWeight: 700
            }}>
              Победа!
            </h1>
            
            <div style={{ 
              fontSize: 24, 
              marginBottom: 32,
              color: '#7c6f57',
              fontWeight: 500
            }}>
              Победил: <span style={{ color: '#d4a373', fontWeight: 700 }}>{winner}</span>
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#d4a373',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '16px 32px',
                fontSize: 18,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background-color 0.3s'
              }}
            >
              🎮 Новая игра
            </button>
          </div>
        </div>
        <div className="footer">При технических проблемах сайта и по другим вопросам, обращаться в наш telegram - @bibleplay</div>
      </>
    );
  }

  if (inLobby && !gameStarted) {
    return (
      <>
        <div className="header"><span className="header-logo">BiblePlay</span></div>
        <Lobby
          roomId={roomId}
          players={lobbyPlayers}
          onStartGame={startGame}
          isHost={isHost}
          onNameChange={changeName}
          currentPlayerName={playerName}
          onLeaveRoom={leaveRoom}
          currentPlayerId={socket.id || ''}
        />
        <div className="footer">При технических проблемах сайта и по другим вопросам, обращаться в наш telegram - @bibleplay</div>
      </>
    );
  }

  if (singleMode) {
    // Мобильная версия одиночки — без header сверху
    if (typeof window !== 'undefined' && window.innerWidth <= 700) {
      return (
        <>
          <SinglePlayerGame onExit={() => {
            sessionStorage.removeItem('chronium_singleMode');
            setSingleMode(false);
          }} />
          <div className="footer">При технических проблемах сайта и по другим вопросам, обращаться в наш telegram - @bibleplay</div>
        </>
      );
    }
    // ПК-версия одиночки — с header
    return (
      <>
        <div className="header"><span className="header-logo">BiblePlay</span></div>
        <SinglePlayerGame onExit={() => {
          sessionStorage.removeItem('chronium_singleMode');
          setSingleMode(false);
        }} />
        <div className="footer">При технических проблемах сайта и по другим вопросам, обращаться в наш telegram - @bibleplay</div>
      </>
    );
  }

  if (!inRoom && !singleMode) {
    return (
      <>
        <div className="header"><span className="header-logo">BiblePlay</span></div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f9f6ef',
          padding: '20px',
          position: 'relative',
        }}>
          <div style={{
            background: '#faf8f4',
            borderRadius: 16,
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #ece6da',
            maxWidth: 400,
            width: '100%',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              marginBottom: 32, 
              color: '#2c1810',
              fontSize: 32,
              fontWeight: 700
            }}>
              Библейская хронология
            </h1>
            <p style={{
              color: '#7c6f57',
              fontSize: 16,
              marginBottom: 32,
              lineHeight: 1.5
            }}>
              Создайте комнату, присоединитесь к игре или попробуйте одиночный режим
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              {/* Сначала мультиплеер */}
              {hasMultiplayerSave && (
                <>
                  <button onClick={handleContinueMultiplayer} style={{ background: '#d4a373', color: 'white', border: 'none', borderRadius: 8, padding: '16px 24px', fontSize: 18, cursor: 'pointer', fontWeight: 600 }}>▶ Продолжить мультиплеер</button>
                  <button onClick={handleExitMultiplayer} style={{ background: '#fff', color: '#d4a373', border: '2px solid #d4a373', borderRadius: 8, padding: '16px 24px', fontSize: 18, cursor: 'pointer', fontWeight: 600 }}>🚪 Выйти из комнаты</button>
                </>
              )}
              {!hasMultiplayerSave && (
                <>
                  <button onClick={() => setCreateRoomMode(true)} style={{ background: '#d4a373', color: 'white', border: 'none', borderRadius: 8, padding: '16px 24px', fontSize: 18, cursor: 'pointer', fontWeight: 600 }}>🎮 Создать комнату</button>
                  <button onClick={() => setJoinRoomMode(true)} style={{ background: '#fff', color: '#d4a373', border: '2px solid #d4a373', borderRadius: 8, padding: '16px 24px', fontSize: 18, cursor: 'pointer', fontWeight: 600 }}>🔗 Войти в комнату</button>
                </>
              )}
              {/* Затем одиночка */}
              {hasSingleSave && (
                <>
                  <button onClick={handleContinueSingle} style={{ background: '#4caf50', color: 'white', border: 'none', borderRadius: 8, padding: '16px 24px', fontSize: 18, cursor: 'pointer', fontWeight: 600 }}>▶ Продолжить игру</button>
                  <button onClick={handleNewSingle} style={{ background: '#fff', color: '#4caf50', border: '2px solid #4caf50', borderRadius: 8, padding: '16px 24px', fontSize: 18, cursor: 'pointer', fontWeight: 600 }}>♻️ Новая игра</button>
                </>
              )}
              {!hasSingleSave && (
                <button onClick={() => setSingleMode(true)} style={{ background: '#fff', color: '#4caf50', border: '2px solid #4caf50', borderRadius: 8, padding: '16px 24px', fontSize: 18, cursor: 'pointer', fontWeight: 600 }}>🧑‍🎓 Одиночный режим</button>
              )}
              <button 
                onClick={() => setShowRules(true)}
                style={{
                  background: '#fff',
                  color: '#742a2a',
                  border: '2px solid #742a2a',
                  borderRadius: 8,
                  padding: '16px 24px',
                  fontSize: 18,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s'
                }}
              >
                📖 Правила игры
              </button>
              <button
                onClick={() => setShowDonate(true)}
                style={{
                  background: '#ffd600',
                  color: '#2c1810',
                  border: '2px solid #ffd600',
                  borderRadius: 8,
                  padding: '16px 24px',
                  fontSize: 18,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s'
                }}
              >
                💛 Пожертвовать
              </button>
            </div>

            {createRoomMode && (
              <div ref={createFormRef} style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #ece6da' }}>
                <h3 style={{ marginBottom: 16, color: '#2c1810', fontSize: 20, fontWeight: 600 }}>Создать новую игру</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <input
                    placeholder="Ваше имя"
                    value={playerName}
                    onChange={e => { setPlayerName(e.target.value); setNameError(''); }}
                    style={{ padding: '12px 16px', border: '1px solid #d4a373', borderRadius: 8, fontSize: 16, outline: 'none' }}
                  />
                  {nameError && <div style={{ color: '#d32f2f', fontWeight: 600, fontSize: 16, marginTop: 2 }}>{nameError}</div>}
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={createRoom}
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontSize: 16,
                      cursor: 'pointer',
                      fontWeight: 600,
                      flex: 1
                    }}
                  >
                    Создать
                  </button>
                  <button 
                    onClick={() => {
                      setCreateRoomMode(false);
                      setPlayerName('');
                    }}
                    style={{
                      background: '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: 16,
                      cursor: 'pointer'
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {joinRoomMode && (
              <div ref={joinFormRef} style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #ece6da' }}>
                <h3 style={{ marginBottom: 16, color: '#2c1810', fontSize: 20, fontWeight: 600 }}>Присоединиться к игре</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <input 
                    placeholder="Код комнаты" 
                    value={joinRoomId} 
                    onChange={e => setJoinRoomId(e.target.value)} 
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d4a373',
                      borderRadius: 8,
                      fontSize: 16,
                      outline: 'none'
                    }}
                  />
                  {joinError && (
                    <div style={{ color: '#d32f2f', fontWeight: 600, fontSize: 20, marginTop: 8, textAlign: 'center' }}>
                      {joinError}
                    </div>
                  )}
                  <input 
                    placeholder="Ваше имя" 
                    value={playerName} 
                    onChange={e => { setPlayerName(e.target.value); setNameError(''); }}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d4a373',
                      borderRadius: 8,
                      fontSize: 16,
                      outline: 'none'
                    }}
                  />
                  {nameError && <div style={{ color: '#d32f2f', fontWeight: 600, fontSize: 16, marginTop: 2 }}>{nameError}</div>}
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={joinRoom}
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontSize: 16,
                      cursor: 'pointer',
                      fontWeight: 600,
                      flex: 1
                    }}
                  >
                    Войти
                  </button>
                  <button 
                    onClick={() => {
                      setJoinRoomMode(false);
                      setJoinError('');
                      setJoinRoomId('');
                      setPlayerName('');
                    }}
                    style={{
                      background: '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: 16,
                      cursor: 'pointer'
                    }}
                  >
                    Отмена
                  </button>
                </div>
                
              </div>
            )}
          </div>
          <GameRules isOpen={showRules} onClose={() => setShowRules(false)} mode="both" />
          {/* Модалка доната вынесена на самый верх */}
          {showDonate && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}>
              <div style={{
                background: '#faf8f4',
                borderRadius: 16,
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                border: '1px solid #ece6da',
                maxWidth: 340,
                width: '90vw',
                minWidth: 220,
                textAlign: 'center',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <h2 style={{ color: '#2c1810', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Пожертвование</h2>
                <p style={{ color: '#7c6f57', fontSize: 16, marginBottom: 24 }}>
                  Ваши пожертвования помогут в оплате серверов, поддержке и расширении проекта (усовершенствование и добавление новых игр).
                </p>
                <a href="https://www.donationalerts.com/r/bibleplay" target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-block',
                  background: '#ffd600',
                  color: '#2c1810',
                  fontWeight: 700,
                  fontSize: 18,
                  padding: '12px 32px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  marginBottom: 16,
                  whiteSpace: 'nowrap',
                  minWidth: 220,
                  textAlign: 'center'
                }}>
                  Перейти на DonationAlerts
                </a>
                <div>
                  <button onClick={() => setShowDonate(false)} style={{
                    background: '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: 16,
                    cursor: 'pointer',
                    marginTop: 12
                  }}>
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="footer" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#faf8f4', borderTop: '1px solid #ece6da', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c6f57', fontSize: 15, fontFamily: 'Istok Web, Arial, sans-serif', minHeight: 40, zIndex: 10000 }}>
          При технических проблемах сайта и по другим вопросам, обращаться в наш telegram - @bibleplay
        </div>
      </>
    );
  }

  // Тестовые данные для sidebar
  const players = lobbyPlayers.length > 0 ? lobbyPlayers : [
    { id: socket.id || '', name: 'Вы', score: 0 },
  ];
  const mode = 'Средний';
  const timeLeft = 60; // секунд, для примера

  // Перед рендером GameTable
  // const uniqueIds = new Set(table.map(c => c.id));
  // console.log('table length:', table.length, 'unique ids:', uniqueIds.size);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700;

  // Удалён useEffect с автоматическим масштабированием

  // --- Модальное окно-предупреждение для мобильной версии ---
  if (isMobile) {
    return (
      <>
        {showStartWarning && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '36px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: '1px solid #ece6da',
              maxWidth: 340,
              width: '90vw',
              minWidth: 180,
              textAlign: 'center',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <h2 style={{ color: '#b71c1c', fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Внимание!</h2>
              <div style={{ color: '#2c1810', fontSize: 15, marginBottom: 22, lineHeight: 1.5 }}>
                Если вы обновите страницу во время своего хода, вы не сможете сделать ход и будете вынуждены дождаться окончания таймера.<br /><br />
                Рекомендуем обновлять страницу только во время хода другого игрока.
              </div>
              <button onClick={() => setShowStartWarning(false)} style={{
                background: '#d4a373',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                fontSize: 16,
                cursor: 'pointer',
                fontWeight: 600,
                marginTop: 8
              }}>
                Хорошо
              </button>
            </div>
          </div>
        )}
        <MobileGameLayout
          mode={singleMode ? 'single' : 'multiplayer'}
          onLeaveRoom={leaveRoom}
          onShowRules={() => setShowRules(true)}
          players={players}
          currentPlayerId={currentPlayerId}
          progress={progress}
          timeLeft={turnTimeLeft}
          table={deduplicateTable(table)}
          hand={hand}
          onDropCard={onDropCard}
          isGameOver={isGameOver}
          isHandEmpty={hand.length === 0}
          deckCount={deckCount}
          toast={toast}
          setToast={setToast}
          toastDuration={toastDuration}
          scrollToCardIndex={scrollToCardIndex}
        />
      </>
    );
  }

  // ПК-версия
  return (
    <>
      <div className="header"><span className="header-logo">BiblePlay</span></div>
      {showStartWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '36px 32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: '1px solid #ece6da',
            maxWidth: 420,
            width: '90vw',
            minWidth: 220,
            textAlign: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h2 style={{ color: '#b71c1c', fontSize: 28, fontWeight: 700, marginBottom: 18 }}>Внимание!</h2>
            <div style={{ color: '#2c1810', fontSize: 18, marginBottom: 28, lineHeight: 1.6 }}>
              Если вы обновите страницу во время своего хода, вы не сможете сделать ход и будете вынуждены дождаться окончания таймера.<br /><br />
              Рекомендуем обновлять страницу только во время хода другого игрока.
            </div>
            <button onClick={() => setShowStartWarning(false)} style={{
              background: '#d4a373',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '14px 38px',
              fontSize: 18,
              cursor: 'pointer',
              fontWeight: 600,
              marginTop: 8
            }}>
              Хорошо
            </button>
          </div>
        </div>
      )}
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#faf8f4', position: 'relative', alignItems: 'center', paddingTop: 60, paddingBottom: 48 }}>
          {/* Заголовок и кнопка правил на одном уровне, заголовок строго по центру */}
          <div style={{ position: 'absolute', top: 18, left: 0, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 }}>
            <div style={{ width: 120 }} />
            <span style={{ fontWeight: 700, fontSize: 28, color: '#2c1810', letterSpacing: '1px', textAlign: 'center', flex: 1 }}>Библейская хронология</span>
          <button
            onClick={() => setShowRules(true)}
            className="rules-button"
            style={{
              background: '#742a2a',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
                fontSize: 20,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background-color 0.3s',
                marginLeft: 18,
                minWidth: 120,
                minHeight: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
          >
            📖 Правила
          </button>
          </div>
          {gameStarted && (
            <div style={{ width: '100%', textAlign: 'center', marginTop: 8, marginBottom: 8, fontSize: 16, color: '#7c6f57' }}>Осталось карт: {deckCount}</div>
          )}
          {/* Кнопка выхода из игры слева */}
          <div style={{ position: 'absolute', top: 18, left: 24, zIndex: 20 }}>
            {inRoom && (
              <button
                onClick={leaveRoom}
                style={{
                  background: '#d4a373',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 18,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background-color 0.3s'
                }}
              >
                🚪 Выйти
              </button>
            )}
          </div>
          {/* Игровое поле и рука по центру */}
          <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 60 }}>
            <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', overflowX: 'auto', position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <GameTable table={deduplicateTable(table)} onDropCard={onDropCard} isGameOver={isGameOver} isHandEmpty={hand.length === 0} scrollToCardIndex={scrollToCardIndex} />
            </div>
            <div style={{ marginTop: 32, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ textAlign: 'center', marginBottom: 12 }}>Ваши карты:</h3>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {hand.map(card => (
                  <DraggableCard key={card.id} card={card} isGameOver={isGameOver} isHandEmpty={hand.length === 0} />
                ))}
              </div>
            </div>
            {/* Информационный блок об ошибках — под игровым полем */}
            <div style={{ margin: '40px auto 0 auto', background: '#fffbe6', border: '1px solid #ffe082', borderRadius: 10, padding: 18, fontSize: 15, color: '#7c6f57', lineHeight: 1.7, maxWidth: 600, textAlign: 'left', boxShadow: '0 2px 12px rgba(212,163,115,0.07)' }}>
              <b>В случае ошибок со стороны игры или сайта:</b>
              <ol style={{ paddingLeft: 22, margin: '10px 0 0 0' }}>
                <li>Если кто-то из игроков покинул игру, передача хода может работать некорректно. В этом случае пересоздайте комнату.</li>
                <li>Если во время игры возникла логическая ошибка (например, игра зависла или не реагирует), попробуйте обновить страницу. Если проблема не исчезла — проверьте ваше интернет-соединение.</li>
                <li>Если ошибка повторяется или вы столкнулись с другой проблемой, пожалуйста, свяжитесь с нами через контакты внизу сайта и опишите ситуацию.</li>
              </ol>
            </div>
          </div>
          {/* Плавающий сайдбар справа */}
          <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 100, background: '#faf8f4', border: '1px solid #ece6da', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 18, minWidth: 220, maxWidth: 270 }}>
            <RoomSidebar
              mode={mode}
              progress={progress}
              timeLeft={turnTimeLeft}
              players={players}
              currentPlayerId={currentPlayerId}
              showTimer={true}
              showLeaderboard={true}
              showLives={false}
              showScore={false}
              roomId={roomId}
            />
          </div>
          {toast && <Toast message={toast} onClose={() => setToast('')} duration={toastDuration} />}
          <GameRules isOpen={showRules} onClose={() => setShowRules(false)} mode="multiplayer" />
        </div>
      </DndProvider>
      {/* Модалка доната вынесена на самый верх */}
      {showDonate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#faf8f4',
            borderRadius: 16,
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: '1px solid #ece6da',
            maxWidth: 340,
            width: '90vw',
            minWidth: 220,
            textAlign: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h2 style={{ color: '#2c1810', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Пожертвование</h2>
            <p style={{ color: '#7c6f57', fontSize: 16, marginBottom: 24 }}>
              Ваши пожертвования помогут в оплате серверов, поддержке и расширении проекта (усовершенствование и добавление новых игр).
            </p>
            <a href="https://www.donationalerts.com/r/bibleplay" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block',
              background: '#ffd600',
              color: '#2c1810',
              fontWeight: 700,
              fontSize: 18,
              padding: '12px 32px',
              borderRadius: 8,
              textDecoration: 'none',
              marginBottom: 16,
              whiteSpace: 'nowrap',
              minWidth: 220,
              textAlign: 'center'
            }}>
              Перейти на DonationAlerts
            </a>
            <div>
              <button onClick={() => setShowDonate(false)} style={{
                background: '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 16,
                cursor: 'pointer',
                marginTop: 12
              }}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="footer">При технических проблемах сайта и по другим вопросам, обращаться в наш telegram - @bibleplay</div>
    </>
  );
}

export default App;
