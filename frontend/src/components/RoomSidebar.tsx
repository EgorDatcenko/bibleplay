import React from 'react';

interface RoomSidebarProps {
  mode: string;
  progress: number;
  timeLeft: number;
  players: any[];
  currentPlayerId: string;
  mobile?: boolean;
  showTimer?: boolean;
  showLives?: boolean;
  showScore?: boolean;
  showLeaderboard?: boolean;
  lives?: number;
  score?: number;
  mobileLightBg?: boolean; // Новый проп
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({
  mode,
  progress,
  timeLeft,
  players,
  currentPlayerId,
  mobile,
  showTimer = false,
  showLives = false,
  showScore = false,
  showLeaderboard = true,
  lives = 0,
  score = 0,
  mobileLightBg = false // Новый проп
}) => {
  const isMobile = mobile || window.innerWidth <= 700;
  if (isMobile) {
    return (
      <div className="mobile-top" style={{
        width: '100vw',
        maxWidth: 420,
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr 1.2fr',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: mobileLightBg ? '#faf8f4' : 'var(--color-sidebar)', // Светлый фон если mobileLightBg
        borderBottom: '1px solid var(--color-sidebar-border)',
        padding: '8px 4px 0 4px',
        boxSizing: 'border-box',
        minHeight: '33vh',
        maxHeight: '34vh',
        gap: 0
      }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, justifyContent: 'flex-start' }}>
        {/* Таймер, жизни, баллы */}
          {showTimer && (
            <div style={{ background: mobileLightBg ? '#fff' : 'var(--color-card)', borderRadius: 10, padding: '6px 14px', fontSize: 16, color: mobileLightBg ? '#2c1810' : 'var(--color-text)', fontWeight: 600, border: '1px solid #ece6da', marginBottom: 4 }}>⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          )}
          {showLives && (
            <div style={{ background: mobileLightBg ? '#fff' : 'var(--color-card)', borderRadius: 10, padding: '6px 14px', fontSize: 16, color: mobileLightBg ? '#2c1810' : 'var(--color-text)', fontWeight: 600, border: '1px solid #ece6da', marginBottom: 4 }}>Жизни: {lives} ❤️</div>
          )}
          {showScore && (
            <div style={{ background: mobileLightBg ? '#fff' : 'var(--color-card)', borderRadius: 10, padding: '6px 14px', fontSize: 16, color: mobileLightBg ? '#2c1810' : 'var(--color-text)', fontWeight: 600, border: '1px solid #ece6da' }}>Баллы: {score}</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
        {/* Лидерборд */}
        {showLeaderboard && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0, justifyContent: 'flex-start', width: '100%' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: mobileLightBg ? '#2c1810' : 'var(--color-text)', fontSize: 15, textAlign: 'center' }}>Доска лидеров</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              {players.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', background: p.id === currentPlayerId ? 'rgba(212,163,115,0.18)' : 'transparent', borderRadius: 6, padding: 2, fontWeight: p.id === currentPlayerId ? 700 : 400, color: mobileLightBg ? '#2c1810' : 'var(--color-text)', fontSize: 13 }}>
                  <div style={{ width: 18, textAlign: 'center', fontWeight: 700 }}>{i + 1}</div>
                  <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}{p.id === currentPlayerId && ' (ходит)'}</div>
                  <div>{p.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          {/* Прогресс-бар и статистика */}
          <div style={{ fontWeight: 600, fontSize: 15, color: mobileLightBg ? '#2c1810' : 'var(--color-text)', marginBottom: 4, textAlign: 'center' }}>Прогресс</div>
          <div style={{ width: '100%', background: mobileLightBg ? '#ece6da' : 'var(--color-border)', borderRadius: 5, height: 8, marginBottom: 4 }}>
            <div style={{ width: `${progress}%`, height: 8, background: mobileLightBg ? '#d4a373' : 'var(--color-card-red)', borderRadius: 5, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 12, color: mobileLightBg ? '#7c6f57' : 'var(--color-text-secondary)', textAlign: 'center' }}>{progress}%</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ width: 220, background: '#faf8f4', padding: 8, minHeight: '100vh', boxSizing: 'border-box', transition: 'background 0.2s, color 0.2s' }}>
      {/* Таймер, жизни, баллы */}
      {(showTimer || showLives || showScore) && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {showTimer && (
            <div style={{ background: '#fff', borderRadius: 10, padding: '6px 12px', fontSize: 16, color: '#2c1810', fontWeight: 600, border: '5px solid #ece6da', textAlign: 'center' }}>⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          )}
          {showLives && (
            <div style={{ background: '#fff', borderRadius: 10, padding: '6px 12px', fontSize: 16, color: '#2c1810', fontWeight: 600, border: '5px solid #ece6da', textAlign: 'center' }}>Жизни: {lives} ❤️</div>
          )}
          {showScore && (
            <div style={{ background: '#fff', borderRadius: 10, padding: '6px 12px', fontSize: 16, color: '#2c1810', fontWeight: 600, border: '5px solid #ece6da', textAlign: 'center' }}>Баллы: {score}</div>
          )}
        </div>
      )}
      {/* Прогресс-бар */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#2c1810', marginBottom: 4 }}>Прогресс</div>
        <div style={{ width: '100%', background: '#ece6da', borderRadius: 5, height: 8, marginBottom: 4 }}>
          <div style={{ width: `${progress}%`, height: 8, background: '#d4a373', borderRadius: 5, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 12, color: '#7c6f57' }}>{progress}%</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '5px solid #ece6da' }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#2c1810' }}>Быстрая статистика</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: '#faf8f4', borderRadius: 8, padding: 8, textAlign: 'center', color: '#2c1810' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{players.length}</div>
            <div style={{ fontSize: 12 }}>Игроки</div>
          </div>
          <div style={{ flex: 1, background: '#faf8f4', borderRadius: 8, padding: 8, textAlign: 'center', color: '#2c1810' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>0</div>
            <div style={{ fontSize: 12 }}>Высокий Балл</div>
          </div>
        </div>
      </div>
      {/* Лидерборд */}
      {showLeaderboard && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '5px solid #ece6da' }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#2c1810' }}>Доска лидеров</div>
          {players.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, background: p.id === currentPlayerId ? 'rgba(212,163,115,0.18)' : 'transparent', borderRadius: 6, padding: 4, fontWeight: p.id === currentPlayerId ? 700 : 400, color: '#2c1810' }}>
              <div style={{ width: 24, textAlign: 'center', fontWeight: 700 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>{p.name}{p.id === currentPlayerId && ' (ходит)'}</div>
              <div>{p.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomSidebar; 