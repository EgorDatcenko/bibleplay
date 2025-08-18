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

const DraggableCard: React.FC<DraggableCardProps> = ({ card, isGameOver, isHandEmpty, width, height }) => {
  const disabled = !!isGameOver || !!isHandEmpty;
  const isTouch = isTouchDevice();
  const [isPressed, setIsPressed] = React.useState(false);
  const [dragReady, setDragReady] = React.useState(!isTouch); // на тач — после задержки; на десктопе сразу
  const pressTimerRef = React.useRef<number | null>(null);

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

  function handlePointerDown() {
    if (disabled) return;
    if (isTouch) {
      setDragReady(false);
      clearPressTimer();
      // Показываем анимацию зажатия и разрешаем dnd только через 250мс
      pressTimerRef.current = window.setTimeout(() => {
        setIsPressed(true);
        setDragReady(true);
      }, 250);
    } else {
      // На ПК — визуал сразу, dnd доступен сразу
      setIsPressed(true);
      setDragReady(true);
    }
  }

  function handlePointerUp() {
    clearPressTimer();
    setIsPressed(false);
    if (isTouch) setDragReady(false);
  }

  function handlePointerLeave() {
    clearPressTimer();
    setIsPressed(false);
    if (isTouch) setDragReady(false);
  }

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handlePointerDown}
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

export default DraggableCard; 