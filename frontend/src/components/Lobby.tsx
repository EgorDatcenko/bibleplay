import React, { useState, useEffect } from 'react';
import GameRules from './GameRules';

interface LobbyProps {
  roomId: string;
  players: Array<{ id: string; name: string; score: number; clientId?: string }>;
  onStartGame: () => void;
  isHost: boolean;
  onNameChange?: (newName: string) => void;
  currentPlayerName?: string;
  onLeaveRoom?: () => void;
  currentPlayerId: string;
}

const Lobby: React.FC<LobbyProps> = ({ 
  roomId, 
  players, 
  onStartGame, 
  isHost, 
  onNameChange, 
  currentPlayerName,
  onLeaveRoom,
  currentPlayerId
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toast, setToast] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentPlayerName || '');
  const [showRules, setShowRules] = useState(false);

  // Автоматический скролл вверх при появлении окна лобби
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Универсальная функция копирования с fallback
  const copyTextUniversal = async (text: string, onSuccess: () => void, onError: () => void) => {
    // Сначала пробуем современный API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        onSuccess();
        return;
      } catch (e) {
        // Переходим к старому способу
      }
    }
    // Старый способ через textarea
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) {
        onSuccess();
      } else {
        onError();
      }
    } catch (e) {
      onError();
    }
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}?room=${roomId}`;
    copyTextUniversal(
      roomLink,
      () => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      },
      () => setToast('Не удалось скопировать ссылку')
    );
  };

  const copyRoomCode = () => {
    copyTextUniversal(
      roomId,
      () => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      },
      () => setToast('Не удалось скопировать код')
    );
  };

  const handleNameSave = () => {
    if (tempName.trim() && onNameChange) {
      onNameChange(tempName.trim());
    }
    setEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(currentPlayerName || '');
    setEditingName(false);
  };

  // Получаем socket из window (глобально, т.к. напрямую не передаётся)
  const socket = (window as any).chroniumSocket;

  // Кик игрока
  const handleKick = (playerId: string, clientId?: string) => {
    if (!roomId || !playerId) return;
    socket.emit('kickPlayer', { roomId, playerId, clientId }, (res: any) => {
      if (res && res.error) setToast(res.error);
    });
  };

  useEffect(() => {
    if (!socket) return;
    const onKicked = () => {
      setToast('Вы были кикнуты из лобби');
      setTimeout(() => {
        if (onLeaveRoom) onLeaveRoom();
      }, 1200);
    };
    socket.on('kicked', onKicked);
    return () => { socket.off('kicked', onKicked); };
  }, [socket, onLeaveRoom]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9f6ef',
      position: 'relative',
      padding: 0,
    }}>
      <div style={{
        background: '#faf8f4',
        borderRadius: 16,
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid #ece6da',
        maxWidth: 500,
        width: '100%',
        textAlign: 'center',
        marginBottom: 60,
        marginTop: typeof window !== 'undefined' && window.innerWidth <= 700 ? 60 : 0
      }}>
        <h1 style={{ 
          marginBottom: 24, 
          color: '#2c1810',
          fontSize: 28,
          fontWeight: 600
        }}>
          Лобби игры
        </h1>

        {/* Номер комнаты */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            fontSize: 16, 
            color: '#7c6f57', 
            marginBottom: 8 
          }}>
            Код комнаты:
          </div>
          <div style={{
            background: '#fff',
            border: '2px solid #d4a373',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 24,
            fontWeight: 700,
            color: '#2c1810',
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <span>{roomId.toUpperCase()}</span>
            <button
              onClick={copyRoomCode}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#d4a373',
                fontSize: '16px'
              }}
              title="Копировать код"
            >
              {copiedCode ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Кнопка копирования ссылки */}
        <button
          onClick={copyRoomLink}
          style={{
            background: copiedLink ? '#4caf50' : '#d4a373',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 16,
            cursor: 'pointer',
            marginBottom: 32,
            transition: 'background-color 0.3s',
            fontWeight: 500
          }}
        >
          {copiedLink ? '✓ Скопировано!' : '📎 Копировать ссылку'}
        </button>

        {/* Список игроков */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ 
            marginBottom: 16, 
            color: '#2c1810',
            fontSize: 20,
            fontWeight: 600
          }}>
            Игроки ({players.length}/15)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((player, index) => (
              <div key={player.id} style={{
                background: '#fff',
                border: '1px solid #ece6da',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#d4a373',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ 
                    fontWeight: 500, 
                    color: '#2c1810',
                    fontSize: 16
                  }}>
                    {player.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {player.id === players[0]?.id && (
                    <span style={{
                      background: '#d4a373',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      Хост
                    </span>
                  )}
                  {onNameChange && player.id === currentPlayerId && (
                    <button
                      onClick={() => setEditingName(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        color: '#7c6f57',
                        fontSize: '14px'
                      }}
                      title="Изменить имя"
                    >
                      ✏️
                    </button>
                  )}
                  {/* Кнопка кика только для хоста и не для себя */}
                  {isHost && player.id !== currentPlayerId && (
                    <button
                      onClick={() => handleKick(player.id, player.clientId)}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 14,
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                      title="Кикнуть игрока"
                    >
                      Кик
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Модальное окно для изменения имени */}
        {editingName && (
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
            zIndex: 1000
          }}>
            <div style={{
              background: '#faf8f4',
              borderRadius: 12,
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: '1px solid #ece6da',
              maxWidth: 340,
              width: '90vw',
              minWidth: 220,
              textAlign: 'center',
              boxSizing: 'border-box'
            }}>
              <h3 style={{ marginBottom: 16, color: '#2c1810', fontSize: 22, fontWeight: 600 }}>Изменить имя</h3>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 280,
                  padding: '10px 14px',
                  border: '1px solid #d4a373',
                  borderRadius: 6,
                  fontSize: 16,
                  marginBottom: 20,
                  boxSizing: 'border-box'
                }}
                placeholder="Введите новое имя"
                onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={handleNameCancel}
                  style={{
                    background: '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 20px',
                    cursor: 'pointer',
                    fontSize: 16
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleNameSave}
                  style={{
                    background: '#d4a373',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 20px',
                    cursor: 'pointer',
                    fontSize: 16
                  }}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Кнопка начала игры */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isHost && (
            <button
              onClick={onStartGame}
              disabled={players.length < 2}
              style={{
                background: players.length < 2 ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '16px 32px',
                fontSize: 18,
                cursor: players.length < 2 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                transition: 'background-color 0.3s'
              }}
            >
              {players.length < 2 ? 'Минимум 2 игрока' : '🎮 Начать игру'}
            </button>
          )}

          {!isHost && (
            <div style={{
              color: '#7c6f57',
              fontSize: 16,
              fontStyle: 'italic',
              marginBottom: 12
            }}>
              Ожидание начала игры...
            </div>
          )}

          <button
            onClick={() => setShowRules(true)}
            style={{
              background: '#742a2a',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 16,
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background-color 0.3s'
            }}
          >
            📖 Правила игры
          </button>

          {onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background-color 0.3s'
              }}
            >
              🚪 Покинуть комнату
            </button>
          )}
        </div>
      </div>
      {toast && <div style={{ color: '#f44336', margin: '12px 0', fontSize: 15 }}>{toast}</div>}
      <GameRules isOpen={showRules} onClose={() => setShowRules(false)} mode="multiplayer" />
      {/* Информационная надпись под окном лобби */}
      <div style={{
        color: '#7c6f57',
        background: '#fffbe6',
        border: '1px solid #ffe082',
        borderRadius: 8,
        padding: '10px 16px',
        fontSize: 15,
        margin: '18px 0 0 0',
        fontWeight: 500,
        maxWidth: 500,
        width: '100%',
        textAlign: 'center'
      }}>
        Если при подключении одного из пользователей список игроков не обновляется, обновите страницу
      </div>
    </div>
  );
};

export default Lobby; 