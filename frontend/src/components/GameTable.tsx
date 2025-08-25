import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import Card from './Card';

interface CardType {
  id: number;
  imageFront?: string;
  imageBack?: string;
  order: number;
}

interface GameTableProps {
  table: CardType[];
  onDropCard: (cardId: number, insertIndex: number) => void;
  isGameOver?: boolean;
  isHandEmpty?: boolean;
  scrollToCardIndex?: number | null; // новый проп
}

// Хук для отслеживания ширины visual viewport (учитывает zoom)
function useVisualViewportWidth() {
  const [vw, setVw] = useState(
    typeof window !== 'undefined' && window.visualViewport
      ? window.visualViewport.width
      : window.innerWidth
  );
  useEffect(() => {
    function handleResize() {
      setVw(window.visualViewport ? window.visualViewport.width : window.innerWidth);
    }
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return vw;
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
  const [{ isOver, canDrop, isDragging }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: any) => {
      if (!disabled) onDrop(item.id);
    },
    canDrop: () => !disabled,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      // Есть активный drag (для подсказок со стрелкой)
      isDragging: !!monitor.getClientOffset(),
    })
  }), [onDrop, disabled]);
  // Мобильные размеры
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700;
  // Увеличиваем ширину дроп-зон в 2 раза для ПК
  const width = isMobile ? 90 : (large ? '80%' : 120);
  const minWidth = isMobile ? 90 : (large ? 800 : 120);
  const maxWidth = isMobile ? 90 : (large ? 1800 : 120);
  const height = isMobile ? 170 : 350;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width, minWidth, maxWidth, margin: isMobile ? '0 2px' : (large ? '0 auto' : '0 8px') }}>
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className="DropZone"
        style={{
          width: '100%',
          height,
          background: isOver ? '#bde0fe' : canDrop ? '#f0e9d2' : '#f0e9d2',
          borderRadius: 12,
          transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s, opacity 0.2s',
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
      {isDragging && !isOver && canDrop && (
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: 0.9,
          animation: 'arrowPulse 1.2s ease-in-out infinite',
          marginTop: 6
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '14px solid #90caf9',
            marginBottom: 4
          }} />
          <div style={{ fontSize: 11, color: '#90caf9', fontWeight: 700, whiteSpace: 'nowrap' }}>Положить сюда</div>
          <style>{`@keyframes arrowPulse { 0% { transform: translateY(0); } 50% { transform: translateY(-4px); } 100% { transform: translateY(0); } }`}</style>
        </div>
      )}
    </div>
  );
};

const GameTable: React.FC<GameTableProps> = ({ table, onDropCard, isGameOver, isHandEmpty, scrollToCardIndex }) => {
  const dropDisabled = !!isGameOver || !!isHandEmpty;
  // refs для карт
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flexRef = useRef<HTMLDivElement | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700;
  // Drag-to-scroll для ПК
  useEffect(() => {
    if (isMobile || !containerRef.current) return;
    const el = containerRef.current;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const onMouseDown = (e: MouseEvent) => {
      // Только ЛКМ и только если не по карточке/дропзоне
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('.card') || (e.target as HTMLElement).closest('.dropzone')) return;
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2;
      el.scrollLeft = scrollLeft - walk;
    };
    const onMouseUp = () => {
      isDown = false;
      el.style.cursor = '';
    };
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isMobile]);
  useEffect(() => {
    if (
      typeof scrollToCardIndex === 'number' &&
      scrollToCardIndex >= 0 &&
      cardRefs.current[scrollToCardIndex] &&
      containerRef.current
    ) {
      const cardEl = cardRefs.current[scrollToCardIndex];
      const containerEl = containerRef.current;
      // Новый способ: абсолютные координаты
      const cardRect = cardEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;
      const scrollDiff = cardCenter - containerCenter;
      containerEl.scrollTo({ left: containerEl.scrollLeft + scrollDiff, behavior: 'smooth' });
    }
  }, [table, scrollToCardIndex]);

  return (
    <div ref={containerRef} className="game-table" style={{ 
      overflowX: table.length === 0 ? 'hidden' : 'auto', 
      overflowY: 'hidden', 
      whiteSpace: 'nowrap', 
      padding: '8px 0', 
      margin: '24px 0', 
      boxSizing: 'border-box',
      background: '#fff'
    }}>
      {table.length === 0 ? (
        <div style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          alignItems: 'center',
          width: isMobile ? undefined : '100%',
          minHeight: 350,
          paddingLeft: isMobile ? 8 : 0
        }}>
          <DropZone onDrop={(cardId) => onDropCard(cardId, 0)} disabled={dropDisabled} large={true} />
        </div>
      ) : (
        <div ref={flexRef} style={{ 
          display: 'inline-flex', 
          gap: 0, 
          alignItems: 'center', 
          minHeight: 350, 
          paddingRight: 150, 
          boxSizing: 'content-box',
          minWidth: table.length > 0 ? 2000 : undefined,
          overflowAnchor: 'none'
        }}>
          <DropZone onDrop={(cardId) => onDropCard(cardId, 0)} disabled={dropDisabled} />
          {table.map((card, idx) => (
            <React.Fragment key={card.id}>
              <CardFade>
                <div ref={el => { cardRefs.current[idx] = el; }} style={{ display: 'inline-block' }}>
                  {card && card.order && card.id ? (
                    <Card
                      image={card.imageBack ?? ''}
                      isFaceUp={true}
                      imageBack={card.imageBack ?? ''}
                      width={120}
                      height={350}
                      imageScaleOffset={-20}
                    />
                  ) : (
                    <div style={{ width: 120, height: 350, background: '#eee', border: '2px solid red', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b71c1c', fontWeight: 700 }}>
                      Ошибка карты
                    </div>
                  )}
                </div>
              </CardFade>
              <DropZone onDrop={(cardId) => onDropCard(cardId, table.findIndex(c => c.id === card.id) + 1)} disabled={dropDisabled} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameTable; 