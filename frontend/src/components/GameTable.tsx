import React from 'react';
import { useDrop } from 'react-dnd';
import Card from './Card';

interface CardType {
  id: number;
  title: string;
  imageFront?: string;
  imageBack?: string;
  verse: string;
  order: number;
  color?: string;
}

interface GameTableProps {
  table: CardType[];
  onDropCard: (cardId: number, insertIndex: number) => void;
  isGameOver?: boolean;
  isHandEmpty?: boolean;
}

const CardFade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ animation: 'fade-in 0.5s' }}>
    {children}
    <style>{`
      @keyframes fade-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `}</style>
  </div>
);

const DropZone: React.FC<{ onDrop: (cardId: number) => void; large?: boolean; disabled?: boolean }> = ({ onDrop, large, disabled }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: any) => {
      if (!disabled) onDrop(item.id);
    },
    canDrop: () => !disabled,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    })
  }), [onDrop, disabled]);
  // Мобильные размеры
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700;
  const width = isMobile ? 90 : (large ? '80%' : 48);
  const minWidth = isMobile ? 90 : (large ? 400 : 48);
  const maxWidth = isMobile ? 90 : (large ? 900 : 48);
  const height = isMobile ? 170 : 300;
  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      style={{
        width,
        minWidth,
        maxWidth,
        height,
        background: isOver ? '#bde0fe' : canDrop ? '#f0e9d2' : '#f0e9d2',
        borderRadius: 12,
        transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
        margin: isMobile ? '0 2px' : (large ? '0 auto' : '0 8px'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        border: isOver ? '2.5px solid #90caf9' : '2px dashed #bdbdbd',
        position: 'relative',
        zIndex: 1,
        transform: isOver ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      <span style={{ fontSize: isMobile ? 32 : 48, color: '#bdbdbd', userSelect: 'none', pointerEvents: 'none' }}>+</span>
    </div>
  );
};

const GameTable: React.FC<GameTableProps> = ({ table, onDropCard, isGameOver, isHandEmpty }) => {
  const dropDisabled = !!isGameOver || !!isHandEmpty;
  // console.log('table ids:', table.map(c => c.id));
  if (table.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '24px 0', minHeight: 240, width: '100%' }}>
        <DropZone onDrop={(cardId) => onDropCard(cardId, 0)} large disabled={dropDisabled} />
      </div>
    );
  }
  return (
    <div className="game-table" style={{ overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', padding: '8px 0', margin: '24px 0', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <div style={{ display: 'inline-flex', gap: 0, alignItems: 'center', minHeight: 300, paddingRight: 150, boxSizing: 'content-box' }}>
        <DropZone onDrop={(cardId) => onDropCard(cardId, 0)} disabled={dropDisabled} />
        {table.map((card) => (
          <React.Fragment key={card.id}>
            <CardFade>
              {card && card.title && card.order && card.id ? (
                <Card
                  title={card.title}
                  order={card.order}
                  verse={card.verse}
                  isFaceUp={true}
                  color={card.color}
                  image={card.imageFront}
                />
              ) : (
                <div style={{ width: 130, height: 300, background: '#eee', border: '2px solid red', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b71c1c', fontWeight: 700 }}>
                  Ошибка карты
                </div>
              )}
            </CardFade>
            <DropZone onDrop={(cardId) => onDropCard(cardId, table.findIndex(c => c.id === card.id) + 1)} disabled={dropDisabled} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GameTable; 