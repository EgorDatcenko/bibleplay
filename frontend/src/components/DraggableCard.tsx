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
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { id: card.id },
    canDrag: () => !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [card, disabled]);

  return (
    <div ref={drag as unknown as React.Ref<HTMLDivElement>} style={{ opacity: isDragging ? 0.5 : 1, pointerEvents: disabled ? 'none' : undefined }}>
      <Card
        image={card.imageFront}
        imageBack={card.imageBack}
        isFaceUp={true}
        isDragPreview={isDragging}
        width={120}
        height={350}
        imageScaleOffset={-20}
      />
    </div>
  );
};

export default DraggableCard; 