import React from 'react';

interface MobileGameSidebarProps {
  mode: 'single' | 'multiplayer';
  lives?: number;
  score?: number;
  progress: number;
  timeLeft?: number;
  players?: any[];
  currentPlayerId?: string;
}

const MobileGameSidebar: React.FC<MobileGameSidebarProps> = ({
  mode,
  lives = 5,
  score = 0,
  progress,
  timeLeft = 0,
  players = [],
  currentPlayerId = ''
}) => {
  if (mode === 'single') {
    return (
      <div className="mobile-sidebar-card">
        <div className="mobile-sidebar-row">
          <span className="mobile-sidebar-block">Жизни: <b>{lives}</b> ❤️</span>
          <span className="mobile-sidebar-block">Баллы: <b>{score}</b></span>
          <span className="mobile-sidebar-block">Прогресс: <b>{progress}%</b></span>
        </div>
      </div>
    );
  }
  // multiplayer
  return (
    <div className="mobile-sidebar-card">
      <div className="mobile-sidebar-row">
        <span className="mobile-sidebar-block">⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        <span className="mobile-sidebar-block">Прогресс: <b>{progress}%</b></span>
      </div>
      <div className="mobile-sidebar-row" style={{ marginTop: 4 }}>
        <span className="mobile-sidebar-block">Доска лидеров:</span>
        <span className="mobile-sidebar-block">
          {players.map((p, i) => (
            <span key={p.id} style={{ fontWeight: p.id === currentPlayerId ? 700 : 400, color: p.id === currentPlayerId ? '#d4a373' : '#2c1810', marginRight: 8 }}>
              {i + 1}. {p.name}{p.id === currentPlayerId ? ' (ходит)' : ''} ({p.score})
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default MobileGameSidebar; 