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
  console.log('DraggableCard card:', card);
  const disabled = !!isGameOver || !!isHandEmpty;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { id: card.id },
    canDrag: () => !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [card, disabled]);

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, pointerEvents: disabled ? 'none' : undefined }}>
      <Card
        title={card.title}
        image={card.imageFront}
        order={card.order}
        verse={card.verse}
        isFaceUp={false}
        color={card.color}
        isDragPreview={isDragging}
        width={width}
        height={height}
      />
    </div>
  );
};

export default DraggableCard; 