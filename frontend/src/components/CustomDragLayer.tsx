import React from 'react';
import { useDragLayer } from 'react-dnd';
import Card from './Card';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 10000,
  left: 0,
  top: 0,
  width: '100vw',
  height: '100vh',
};

function getItemStyles(currentOffset: any) {
  if (!currentOffset) {
    return { display: 'none' };
  }
  const { x, y } = currentOffset;
  return {
    transform: `translate(${x}px, ${y}px)`,
    WebkitTransform: `translate(${x}px, ${y}px)`
  };
}

const CustomDragLayer: React.FC = () => {
  const {
    itemType,
    isDragging,
    item,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !item) {
    return null;
  }

  // Можно добавить больше логики для разных типов drag
  return (
    <div style={layerStyles}>
      <div style={getItemStyles(currentOffset)}>
        <Card
          image={item.imageFront || ''}
          imageBack={item.imageBack || ''}
          isFaceUp={true}
          isDragPreview={true}
          width={120}
          height={350}
          imageScaleOffset={-20}
        />
      </div>
    </div>
  );
};

export default CustomDragLayer; 