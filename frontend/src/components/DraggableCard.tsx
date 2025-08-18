import React from 'react';
import { useDrag } from 'react-dnd';
import Card from './Card';

interface DraggableCardProps {
  card: any;
  isGameOver?: boolean;
  isHandEmpty?: boolean;
  width?: string | number; // Новый проп
  height?: string | number; // Новый проп
}

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));

const MOVE_THRESHOLD_PX = 8; // небольшой порог смещения

const DraggableCard: React.FC<DraggableCardProps> = ({ card, isGameOver, isHandEmpty, width, height }) => {
  const disabled = !!isGameOver || !!isHandEmpty;
  const isTouch = isTouchDevice();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [isPressed, setIsPressed] = React.useState(false);
  const [dragReady, setDragReady] = React.useState(!isTouch); // на тач — после задержки; на десктопе сразу
  const pressTimerRef = React.useRef<number | null>(null);
  const startPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const canceledRef = React.useRef(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { id: card.id, imageFront: card.imageFront, imageBack: card.imageBack },
    canDrag: () => !disabled && dragReady,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [card, disabled, dragReady]);

  React.useEffect(() => {
    if (isDragging) {
      // При старте dnd снимаем pressed-состояние
      setIsPressed(false);
    }
  }, [isDragging]);

  function clearPressTimer() {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  function withinElement(x: number, y: number): boolean {
    const el = rootRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function handlePointerDown(e: any) {
    if (disabled) return;
    canceledRef.current = false;
    const { clientX, clientY } = getClientXY(e);
    startPosRef.current = { x: clientX, y: clientY };
    lastPosRef.current = { x: clientX, y: clientY };

    if (isTouch) {
      setDragReady(false);
      clearPressTimer();
      // Показываем анимацию зажатия и разрешаем dnd только через 250мс
      pressTimerRef.current = window.setTimeout(() => {
        if (canceledRef.current) return;
        const pos = lastPosRef.current;
        if (!pos) return;
        if (!withinElement(pos.x, pos.y)) return;
        setIsPressed(true);
        setDragReady(true);
      }, 250);
    } else {
      // На ПК — визуал сразу, dnd доступен сразу
      setIsPressed(true);
      setDragReady(true);
    }
  }

  function handlePointerMove(e: any) {
    if (pressTimerRef.current && !isPressed) {
      const { clientX, clientY } = getClientXY(e);
      lastPosRef.current = { x: clientX, y: clientY };
      const start = startPosRef.current;
      if (start) {
        const dx = clientX - start.x;
        const dy = clientY - start.y;
        const moved = Math.hypot(dx, dy) > MOVE_THRESHOLD_PX;
        const inside = withinElement(clientX, clientY);
        if (moved || !inside) {
          canceledRef.current = true;
          clearPressTimer();
          setIsPressed(false);
          setDragReady(false);
        }
      }
    }
  }

  function handlePointerUp() {
    canceledRef.current = true;
    clearPressTimer();
    setIsPressed(false);
    if (isTouch) setDragReady(false);
  }

  function handlePointerLeave() {
    canceledRef.current = true;
    clearPressTimer();
    setIsPressed(false);
    if (isTouch) setDragReady(false);
  }

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        (drag as any)(node);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      style={{
        opacity: isDragging ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : undefined,
        transform: isPressed && !isDragging ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 120ms ease, filter 120ms ease',
        filter: isPressed && !isDragging ? 'brightness(0.9)' : 'none'
      }}
    >
      <Card
        image={card.imageFront}
        imageBack={card.imageBack}
        isFaceUp={true}
        isDragPreview={isDragging}
        width={width ?? 120}
        height={height ?? 350}
        imageScaleOffset={-20}
      />
    </div>
  );
};

function getClientXY(e: any): { clientX: number; clientY: number } {
  if (e?.clientX != null && e?.clientY != null) return { clientX: e.clientX, clientY: e.clientY };
  const t = e?.touches?.[0] || e?.changedTouches?.[0];
  return { clientX: t?.clientX ?? 0, clientY: t?.clientY ?? 0 };
}

export default DraggableCard; 