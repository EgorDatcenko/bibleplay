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

const DraggableCard: React.FC<DraggableCardProps> = ({ card, isGameOver, isHandEmpty, width, height }) => {
  const disabled = !!isGameOver || !!isHandEmpty;
  const [isPressed, setIsPressed] = React.useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { id: card.id, imageFront: card.imageFront, imageBack: card.imageBack },
    canDrag: () => !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [card, disabled]);

  React.useEffect(() => {
    if (isDragging) {
      setIsPressed(false);
    }
  }, [isDragging]);

  function handlePointerDown() {
    if (!disabled) setIsPressed(true);
  }
  function handlePointerUp() {
    setIsPressed(false);
  }
  function handlePointerLeave() {
    setIsPressed(false);
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