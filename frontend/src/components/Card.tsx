import React from 'react';

interface CardProps {
  title?: string;
  image?: string;
  order?: number;
  verse?: string;
  isFaceUp: boolean;
  color?: string;
  isDragPreview?: boolean;
  width?: string | number; // Новый проп
  height?: string | number; // Новый проп
}

const Card: React.FC<CardProps> = ({
  title = 'Без названия',
  image = '',
  order = 0,
  verse = '',
  isFaceUp,
  color = 'var(--color-card-green)',
  isDragPreview = false,
  width,
  height
}) => {
  const cardStyle: React.CSSProperties = {
    width: width || 'var(--card-width, 130px)',
    height: height || 'var(--card-height, 300px)',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    background: color,
    border: '2px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'inherit',
    margin: 4,
    perspective: 800,
    color: 'var(--color-text)',
    transition: 'background 0.2s, color 0.2s',
    opacity: isDragPreview ? 0.8 : 1,
    zIndex: isDragPreview ? 9999 : 'auto',
  };

  const innerStyle = (isFaceUp: boolean): React.CSSProperties => ({
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)',
    transformStyle: 'preserve-3d',
    transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
  });

  const faceStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  };

  const backStyle: React.CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(180deg)',
    background: color,
  };

  return (
    <div style={{...cardStyle, userSelect: 'none'}} className={`card${isDragPreview ? ' card-drag-preview' : ''}`} draggable={false}>
      {/* Верхняя часть — картинка или placeholder */}
      <div className="card-image" style={{
        height: '66%',
        width: '100%', 
        background: image ? `url(${image}) center/cover no-repeat` : 'rgba(0,0,0,0.18)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: 14,
        color: '#fff',
        fontWeight: 600,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        userSelect: 'none',
        pointerEvents: 'none',
      }} draggable={false}>
        {!image && 'Картинка'}
      </div>
      {/* Нижняя часть — инфоблок */}
      <div className="card-info" style={{
        height: '34%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 13,
        padding: '0 6px 6px 6px',
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.10)',
        userSelect: 'none',
        pointerEvents: 'none',
      }} draggable={false}>
        <div className="card-title" style={{ fontWeight: 600, fontSize: 15, textAlign: 'center', color: '#fff', marginTop: 4, userSelect: 'none', pointerEvents: 'none' }}>{title}</div>
        {isFaceUp && (
          <>
            <div className="card-order" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0 2px 0', color: '#fff', userSelect: 'none', pointerEvents: 'none' }}>
              <span style={{ fontSize: 11, color: '#fff', userSelect: 'none', pointerEvents: 'none' }}>№</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', userSelect: 'none', pointerEvents: 'none' }}>{order}</span>
            </div>
            <div className="card-verse" style={{ fontSize: 12, textAlign: 'center', color: '#fff', wordBreak: 'break-word', userSelect: 'none', pointerEvents: 'none' }}>{verse}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default Card; 