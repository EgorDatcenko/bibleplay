import React from 'react';

interface AliasRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

const AliasRules: React.FC<AliasRulesProps> = ({ isOpen, onClose }) => {
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
            📖 Правила игры "Библейский Alias"
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
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ 
              color: '#d4a373',
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 16
            }}>
              🎯 Цель игры
            </h3>
            <p style={{ marginBottom: 16 }}>
              Объясняйте библейские термины, имена, места и понятия так, чтобы ваша команда угадала слово быстрее соперников. 
              Набирайте очки и стремитесь к победе!
            </p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ 
              color: '#4caf50',
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 16
            }}>
              🎮 Как играть
            </h3>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><strong>Для игры нужен всего один телефон!</strong> Все команды играют на одном устройстве</li>
              <li style={{ marginBottom: 8 }}>Создайте команды (минимум 2 команды по 1+ игроку)</li>
              <li style={{ marginBottom: 8 }}>Настройте время раунда (15-180 секунд) и цель для победы</li>
              <li style={{ marginBottom: 8 }}>Выберите категории слов и уровень сложности</li>
              <li style={{ marginBottom: 8 }}>Команды играют по очереди</li>
              <li style={{ marginBottom: 8 }}>Один игрок объясняет слова своей команде</li>
              <li style={{ marginBottom: 8 }}>Команда угадывает слова, нажимая "Угадано" или "Пропустить"</li>
              <li style={{ marginBottom: 8 }}>После окончания времени ход переходит к следующей команде</li>
            </ul>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ 
              color: '#742a2a',
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 16
            }}>
              📊 Подсчет очков
            </h3>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><b>Угадано:</b> +1 очко команде</li>
              <li style={{ marginBottom: 8 }}><b>Пропущено:</b> -1 очко команде</li>
              <li style={{ marginBottom: 8 }}>Побеждает команда, первой набравшая целевое количество очков</li>
            </ul>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ 
              color: '#ff9800',
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 16
            }}>
              ⚠️ Правила объяснения
            </h3>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><b>Можно:</b> объяснять словами, синонимами, ассоциациями</li>
              <li style={{ marginBottom: 8 }}><b>Можно:</b> использовать подсказки (если включены в настройках)</li>
              <li style={{ marginBottom: 8 }}><b>Нельзя:</b> использовать однокоренные слова</li>
              <li style={{ marginBottom: 8 }}><b>Нельзя:</b> показывать жестами или мимикой</li>
              <li style={{ marginBottom: 8 }}><b>Нельзя:</b> переводить слово на другие языки</li>
              <li style={{ marginBottom: 8 }}><b>Нельзя:</b> произносить само слово или его части</li>
            </ul>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ 
              color: '#9c27b0',
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 16
            }}>
              🎛️ Настройки игры
            </h3>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><b>Время раунда:</b> 15-180 секунд на команду</li>
              <li style={{ marginBottom: 8 }}><b>Цель для победы:</b> количество очков для выигрыша</li>
              <li style={{ marginBottom: 8 }}><b>Категории:</b> выберите интересующие вас темы</li>
              <li style={{ marginBottom: 8 }}><b>Усложненный режим:</b> для опытных знатоков Библии</li>
              <li style={{ marginBottom: 8 }}><b>Подсказки:</b> можно отключить для усложнения</li>
            </ul>
          </div>

          <div>
            <h3 style={{ 
              color: '#2196f3',
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 16
            }}>
              📚 О словаре
            </h3>
            <p style={{ marginBottom: 16 }}>
              Все слова взяты из авторитетного "Библейского словаря Гезе" и разделены на категории:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><b>Библейские личности:</b> имена людей из Библии</li>
              <li style={{ marginBottom: 8 }}><b>Места и география:</b> города, страны, области</li>
              <li style={{ marginBottom: 8 }}><b>Предметы и понятия:</b> вещи, символы, термины</li>
              <li style={{ marginBottom: 8 }}><b>Культура:</b> народные ценности и инструменты</li>
              <li style={{ marginBottom: 8 }}><b>Еда:</b> продукты питания из библейских времен</li>
              <li style={{ marginBottom: 8 }}><b>Одежда:</b> предметы гардероба того времени</li>
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
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#c1965a'}
            onMouseOut={(e) => e.currentTarget.style.background = '#d4a373'}
          >
            Понятно!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AliasRules;
