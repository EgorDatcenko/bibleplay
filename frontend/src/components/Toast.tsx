import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

function getToastType(message: string) {
  if (message.toLowerCase().includes('верно!') || message.toLowerCase().includes('✅')) return 'success';
  if (message.toLowerCase().includes('неправильный порядок') || 
      message.toLowerCase().includes('ошибка') || 
      message.toLowerCase().includes('не удалось') || 
      message.toLowerCase().includes('error') || 
      message.toLowerCase().includes('не ваш ход') ||
      message.toLowerCase().includes('не попала в правильный порядок')) {
    return 'error';
  }
  return 'default';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const type = getToastType(message);
  const isNotYourTurn = message.toLowerCase().includes('не ваш ход');
  const isSuccess = type === 'success';

  return (
    <div className="toast" style={{
      position: 'fixed',
      bottom: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'error' ? '#fff0f0' : isSuccess ? '#e6ffe6' : 'var(--color-toast-bg)',
      color: type === 'error' ? '#b71c1c' : isSuccess ? '#388e3c' : 'var(--color-text)',
      borderRadius: 18,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      padding: type === 'error' ? '36px 60px' : isSuccess ? '28px 48px' : '22px 36px',
      fontSize: type === 'error' ? 36 : isSuccess ? 28 : 22,
      fontWeight: 700,
      zIndex: 2000,
      minWidth: type === 'error' ? 420 : isSuccess ? 320 : 260,
      textAlign: 'center',
      border: type === 'error' ? '3px solid #e57373' : isSuccess ? '3px solid #4caf50' : '2px solid var(--color-border)',
      animation: 'toast-in 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      justifyContent: 'center',
      transition: 'background 0.2s, color 0.2s',
    }}>
      <span>{message}</span>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(60px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast; 