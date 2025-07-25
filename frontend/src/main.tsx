import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));

const DND_BACKEND = isTouchDevice() ? TouchBackend : HTML5Backend;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DndProvider backend={DND_BACKEND} options={isTouchDevice() ? { enableMouseEvents: true } : undefined}>
      <App />
    </DndProvider>
  </StrictMode>,
)
