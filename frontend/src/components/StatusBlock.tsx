import React from 'react';

const StatusBlock: React.FC<{ progress: number; timeLeft: number }> = ({ progress, timeLeft }) => {
  return (
    <div style={{ background: '#faf8f4', borderRadius: 12, padding: '16px 22px', minWidth: 210, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', border: '1px solid #ece6da', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Статус игры</div>
      <div style={{ fontWeight: 400, fontSize: 14, marginBottom: 2 }}>Прогресс</div>
      <div style={{ width: '100%', background: '#eee', borderRadius: 5, height: 7, marginBottom: 6 }}>
        <div style={{ width: `${progress}%`, height: 7, background: '#d4a373', borderRadius: 5, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 13, marginTop: 0 }}>Осталось времени <span style={{ fontWeight: 600 }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span></div>
    </div>
  );
};

export default StatusBlock; 