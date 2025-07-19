import React, { useState } from 'react';

interface LobbyProps {
  roomId: string;
  players: Array<{ id: string; name: string; score: number }>;
  onStartGame: () => void;
  isHost: boolean;
  onNameChange?: (newName: string) => void;
  currentPlayerName?: string;
  onLeaveRoom?: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ 
  roomId, 
  players, 
  onStartGame, 
  isHost, 
  onNameChange, 
  currentPlayerName,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentPlayerName || '');

  const copyRoomLink = async () => {
    const roomLink = `${window.location.origin}?room=${roomId}`;
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Не удалось скопировать ссылку:', err);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Не удалось скопировать код:', err);
    }
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

  return (
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
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid #ece6da',
        maxWidth: 500,
        width: '100%',
        textAlign: 'center'
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
              📋
            </button>
          </div>
        </div>

        {/* Кнопка копирования ссылки */}
        <button
          onClick={copyRoomLink}
          style={{
            background: copied ? '#4caf50' : '#d4a373',
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
          {copied ? '✓ Скопировано!' : '📎 Копировать ссылку'}
        </button>

        {/* Список игроков */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ 
            marginBottom: 16, 
            color: '#2c1810',
            fontSize: 20,
            fontWeight: 600
          }}>
            Игроки ({players.length}/6)
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
                  {onNameChange && player.id === players.find(p => p.name === currentPlayerName)?.id && (
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
              maxWidth: 300,
              width: '100%'
            }}>
              <h3 style={{ marginBottom: 16, color: '#2c1810' }}>Изменить имя</h3>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d4a373',
                  borderRadius: 6,
                  fontSize: 16,
                  marginBottom: 16
                }}
                placeholder="Введите новое имя"
                onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleNameCancel}
                  style={{
                    background: '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: 'pointer'
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
                    padding: '8px 16px',
                    cursor: 'pointer'
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
    </div>
  );
};

export default Lobby; 