import React from 'react';

interface CardProps {
  image: string;
  isFaceUp: boolean;
  isDragPreview?: boolean;
  width?: string | number;
  height?: string | number;
  imageBack?: string;
  imageScaleOffset?: number; // новый проп для уменьшения масштаба картинки
}

const Card: React.FC<CardProps> = ({
  image,
  isFaceUp,
  isDragPreview = false,
  width = 180,
  height = 300,
  imageBack,
  imageScaleOffset = 0
}) => {
  const cardStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    border: '2px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    margin: 4,
    background: '#fff',
    opacity: isDragPreview ? 0.8 : 1,
    zIndex: isDragPreview ? 9999 : 'auto',
    userSelect: 'none',
    padding: 0,
  };

  const imgW = typeof width === 'number' ? width - imageScaleOffset : `calc(${width} - ${imageScaleOffset}px)`;
  const imgH = typeof height === 'number' ? height - imageScaleOffset : `calc(${height} - ${imageScaleOffset}px)`;

  const imageStyle: React.CSSProperties = {
    width: imgW,
    height: imgH,
    objectFit: 'contain',
    borderRadius: 10,
    backgroundColor: '#fff',
    display: 'block',
    margin: 'auto',
  };

  return (
    <div
      style={cardStyle}
      className={`card${isDragPreview ? ' card-drag-preview' : ''}`}
      draggable={false}
      onContextMenu={e => e.preventDefault()} // Запрет контекстного меню
    >
      <img
        src={isFaceUp ? image : (imageBack || image)}
        alt="card"
        style={imageStyle}
        draggable={false}
      />
    </div>
  );
};

export default Card; 