import React from 'react';

interface InfoModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children?: React.ReactNode;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;

	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: 'rgba(0, 0, 0, 0.5)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 1000,
			padding: '20px'
		}}>
			<div style={{
				background: '#faf8f4',
				borderRadius: 16,
				padding: '32px',
				boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
				border: '1px solid #ece6da',
				maxWidth: 600,
				width: '100%',
				maxHeight: '80vh',
				overflowY: 'auto'
			}}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
					<h2 style={{ color: '#2c1810', fontSize: 28, fontWeight: 700, margin: 0 }}>{title}</h2>
					<button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#7c6f57', padding: 4, borderRadius: 4 }}>✕</button>
				</div>
				<div style={{ color: '#2c1810', lineHeight: 1.6 }}>
					{children || (
						<div>
							<p style={{ marginBottom: 12 }}>Информация появится скоро.</p>
							<p style={{ marginBottom: 0 }}>Подписывайтесь на наш Telegram-канал, чтобы не пропустить обновления.</p>
						</div>
					)}
				</div>
				<div style={{ marginTop: 24, textAlign: 'center' }}>
					<button onClick={onClose} style={{ background: '#d4a373', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer', fontWeight: 600 }}>Понятно</button>
				</div>
			</div>
		</div>
	);
};

export default InfoModal; 