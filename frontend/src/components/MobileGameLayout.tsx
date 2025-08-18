import React, { useState } from 'react';
import GameTable from './GameTable';
import DraggableCard from './DraggableCard';
import CustomDragLayer from './CustomDragLayer';
import Toast from './Toast';
import GameRules from './GameRules';

interface MobileGameLayoutProps {
  mode: 'single' | 'multiplayer';
  onLeaveRoom: () => void;
  onShowRules: () => void;
  players: any[];
  currentPlayerId: string;
  progress: number;
  timeLeft: number;
  table: any[];
  hand: any[];
  onDropCard: (cardId: number, insertIndex: number) => void;
  isGameOver: boolean;
  isHandEmpty: boolean;
  deckCount?: number;
  toast: string;
  setToast: (msg: string) => void;
  toastDuration?: number;
  scrollToCardIndex?: number | null;
}

const MobileGameLayout: React.FC<MobileGameLayoutProps> = ({
  mode,
  onLeaveRoom,
  onShowRules,
  players,
  currentPlayerId,
  progress,
  timeLeft,
  table,
  hand,
  onDropCard,
  isGameOver,
  isHandEmpty,
  deckCount = 0,
  toast,
  setToast,
  toastDuration = 2000,
  scrollToCardIndex,
}) => {
  const [showRules, setShowRules] = useState(false);
  const singlePlayer = mode === 'single' && players && players[0];

  return (
    <div className="mobile-v2-root">
      {/* Фиксированный header */}
      <div className="mobile-v2-header-fixed">
        <span className="mobile-v2-logo">BiblePlay</span>
        <button className="mobile-v2-btn mobile-v2-btn-rules" onClick={() => setShowRules(true)}>Правила</button>
        <button className="mobile-v2-btn mobile-v2-btn-exit" onClick={onLeaveRoom}>{mode === 'single' ? 'В меню' : 'Выйти'}</button>
      </div>
      {/* Toast всегда поверх */}
      {toast && <Toast message={toast} onClose={() => setToast('')} duration={toastDuration} />}
      {/* Основной layout */}
      <div className="mobile-v2-main">
        {/* Заголовок */}
        <div className="mobile-v2-title" style={{ paddingLeft: 47 }}>{mode === 'single' ? 'Одиночный режим' : 'Библейская хронология'}</div>
        {/* Осталось карт */}
        <div className="mobile-v2-cardsleft">Осталось карт: {deckCount}</div>
        {/* Инфоблок */}
        {mode === 'multiplayer' ? (
          <div className="mobile-v2-infocard">
            <div className="mobile-v2-infoblock-row">
              <span className="mobile-v2-timer">⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              <div className="mobile-v2-progress">
                <div className="mobile-v2-progress-label">Прогресс</div>
                <div className="mobile-v2-progress-bar"><div style={{ width: `${progress}%` }} /></div>
                <div className="mobile-v2-progress-pct">{progress}%</div>
              </div>
              <div className="mobile-v2-leaderboard">
                <div className="mobile-v2-leaderboard-label">Доска лидеров</div>
                <div className="mobile-v2-leaderboard-table">
                  {players.map((p, i) => (
                    <div key={p.id} className={p.id === currentPlayerId ? 'mobile-v2-leaderboard-row active' : 'mobile-v2-leaderboard-row'}>
                      <span>{i + 1}</span>
                      <span>{p.name}{p.id === currentPlayerId ? ' (ходит)' : ''}</span>
                      <span>{p.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mobile-v2-infocard-row">
            <div className="mobile-v2-infocard-metric">
              <div className="mobile-v2-metric-label">Жизни</div>
              <div className="mobile-v2-metric-value">{singlePlayer?.lives ?? 5} <span style={{ color: '#d32f2f', fontSize: 18 }}>❤️</span></div>
            </div>
            <div className="mobile-v2-infocard-metric">
              <div className="mobile-v2-metric-label">Баллы</div>
              <div className="mobile-v2-metric-value">{singlePlayer?.score ?? 0}</div>
            </div>
            <div className="mobile-v2-infocard-metric">
              <div className="mobile-v2-metric-label">Прогресс</div>
              <div className="mobile-v2-progress-bar" style={{ margin: '4px 0 2px 0' }}><div style={{ width: `${progress}%` }} /></div>
              <div className="mobile-v2-progress-pct">{progress}%</div>
            </div>
          </div>
        )}
        {/* Игровое поле */}
        <div className="mobile-v2-tablewrap">
          <GameTable table={table} onDropCard={onDropCard} isGameOver={isGameOver} isHandEmpty={isHandEmpty} scrollToCardIndex={scrollToCardIndex} />
        </div>
        <CustomDragLayer />
        {/* Рука */}
        <div className="mobile-v2-handlabel">Ваши карты:</div>
        <div className="mobile-v2-handwrap">
          <div className="mobile-v2-handscroll">
            {hand.map(card => (
              mode === 'multiplayer'
                ? <DraggableCard key={card.id} card={card} isGameOver={isGameOver} isHandEmpty={isHandEmpty} width={90} height={170} />
                : <DraggableCard key={card.id} card={card} isGameOver={isGameOver} isHandEmpty={isHandEmpty} />
            ))}
          </div>
        </div>
        {/* Инфоблок об ошибках — только для мультиплеера */}
        {mode === 'multiplayer' && (
          <div className="mobile-v2-infobox">
            <b>В случае ошибок со стороны игры или сайта:</b>
            <ol>
              <li>Если кто-то из игроков покинул игру, передача хода может работать некорректно. В этом случае пересоздайте комнату.</li>
              <li>Если во время игры возникла логическая ошибка (например, игра зависла или не реагирует), попробуйте обновить страницу. Если проблема не исчезла — проверьте ваше интернет-соединение.</li>
              <li>Если ошибка повторяется или вы столкнулись с другой проблемой, пожалуйста, свяжитесь с нами через контакты внизу сайта и опишите ситуацию.</li>
            </ol>
          </div>
        )}
      </div>
      <GameRules isOpen={showRules} onClose={() => setShowRules(false)} mode={mode} />
    </div>
  );
};

export default MobileGameLayout; 