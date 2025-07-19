import React from 'react';

interface GameRulesProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'multiplayer' | 'single' | 'both';
}

const GameRules: React.FC<GameRulesProps> = ({ isOpen, onClose, mode = 'both' }) => {
  if (!isOpen) return null;

  return (
    <div className="rules-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="rules-content" style={{
        background: '#faf8f4',
        borderRadius: 16,
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid #ece6da',
        maxWidth: 600,
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <h2 style={{ 
            color: '#2c1810',
            fontSize: 28,
            fontWeight: 700,
            margin: 0
          }}>
            📖 Правила игры
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#7c6f57',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.3s'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ color: '#2c1810', lineHeight: 1.6 }}>
          {(mode === 'both' || mode === 'multiplayer') && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                color: '#d4a373',
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 16
              }}>
                🎮 Мультиплеерный режим
              </h3>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>Создайте комнату или присоединитесь к существующей</li>
                <li style={{ marginBottom: 8 }}>Минимум 2 игрока для начала игры</li>
                <li style={{ marginBottom: 8 }}>Максимум 15 игроков в одной комнате</li>
                <li style={{ marginBottom: 8 }}>Каждый игрок получает 6 карт в начале игры</li>
                <li style={{ marginBottom: 8 }}>Ходы делаются по очереди, у каждого игрока 30 секунд на ход</li>
                <li style={{ marginBottom: 8 }}>Карты нужно размещать в хронологическом порядке</li>
                <li style={{ marginBottom: 8 }}>При правильном размещении карты: +1 балл, карта уходит из руки</li>
                <li style={{ marginBottom: 8 }}>При неправильном размещении: карта автоматически встаёт на правильное место, игрок получает новую карту</li>
                <li style={{ marginBottom: 8 }}>Первый игрок, который избавится от всех карт — победитель</li>
                <li style={{ marginBottom: 8 }}>В игре с 4+ игроками игра продолжается до определения 3 победителей</li>
              </ul>
            </div>
          )}

          {(mode === 'both' || mode === 'single') && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ 
                color: '#4caf50',
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 16
              }}>
                🧑‍🎓 Одиночный режим
              </h3>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>Играйте в одиночку, изучая библейскую хронологию</li>
                <li style={{ marginBottom: 8 }}>У вас есть 5 жизней</li>
                <li style={{ marginBottom: 8 }}>Каждый правильный ход даёт +1 балл</li>
                <li style={{ marginBottom: 8 }}>При неправильном размещении карты: -1 жизнь</li>
                <li style={{ marginBottom: 8 }}>Игра заканчивается, когда заканчиваются жизни или все карты</li>
                <li style={{ marginBottom: 8 }}>Цель — набрать как можно больше баллов</li>
                <li style={{ marginBottom: 8 }}>Нет ограничения по времени на ходы</li>
                <li style={{ marginBottom: 8 }}><b>Баллы в одиночном режиме:</b> зелёная карта — 1 балл, синяя — 2 балла, красная — 3 балла.</li>
              </ul>
            </div>
          )}

          <div>
            <h3 style={{ 
              color: '#742a2a',
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 16
            }}>
              🎯 Общие правила
            </h3>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>Карты размещаются в порядке возрастания номеров событий</li>
              <li style={{ marginBottom: 8 }}>Перетаскивайте карты из руки на игровое поле</li>
              <li style={{ marginBottom: 8 }}>Карты можно размещать между уже выложенными картами</li>
              <li style={{ marginBottom: 8 }}>Цвет карты зависит от типа события</li>
              <li style={{ marginBottom: 8 }}>Изучайте библейскую хронологию и улучшайте свои знания!</li>
            </ul>
            <h3 style={{ color: '#742a2a', fontSize: 20, fontWeight: 600, margin: '18px 0 8px 0' }}>Управление</h3>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>Для перетаскивания карты зажмите её <b>мышкой</b> (на ПК) или <b>пальцем</b> (на телефоне).</li>
              <li style={{ marginBottom: 8 }}>Перетащите карту на один из <b>плюсиков</b> (дроп-зон) на хронологической линии, чтобы разместить её в нужном месте.</li>
            </ul>
          </div>
        </div>

        <div style={{ 
          marginTop: 24,
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#d4a373',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 16,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background-color 0.3s'
            }}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameRules; 