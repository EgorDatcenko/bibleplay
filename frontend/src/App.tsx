import { useState } from 'react';
import './App.css';
import React from 'react';
import GameTable from './components/GameTable';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import DraggableCard from './components/DraggableCard';
import RoomSidebar from './components/RoomSidebar';
import Toast from './components/Toast';
import Lobby from './components/Lobby';
import SinglePlayerGame from './components/SinglePlayerGame';
import GameRules from './components/GameRules';
import AliasGame from './components/AliasGame';
import MobileGameLayout from './components/MobileGameLayout';
import cards from './components/cards.json';
import CustomDragLayer from './components/CustomDragLayer';
import InfoModal from './components/InfoModal';

// Упрощенная версия для отладки - без сокетов
export default function App() {
  const [selectedGame, setSelectedGame] = useState<'chronology' | 'alias' | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [openInfoGame, setOpenInfoGame] = useState<null | 'chronology' | 'alias' | 'pharisees'>(null);

  // Проверяем, что все компоненты загружаются
  console.log('App.tsx загружен, компоненты:', {
    GameTable: !!GameTable,
    DraggableCard: !!DraggableCard,
    SinglePlayerGame: !!SinglePlayerGame,
    AliasGame: !!AliasGame,
    cards: cards?.length || 0
  });

  if (selectedGame === 'alias') {
      return (
        <>
          <div className="header"><span className="header-logo">BiblePlay</span></div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#f9f6ef',
          padding: '20px',
          position: 'relative',
        }}>
          {/* Кнопка назад к списку игр */}
          <div style={{ position: 'absolute', top: 80, left: 24, zIndex: 20 }}>
              <button 
              onClick={() => { setSelectedGame(null); }}
              style={{ background: '#bdb7af', color: '#2c1810', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 16, cursor: 'pointer', fontWeight: 700 }}
            >
              ← Назад
              </button>
            </div>
          <AliasGame onExit={() => setSelectedGame(null)} />
          </div>
        </>
      );
    }

  if (selectedGame === 'chronology') {
    return (
      <>
        <div className="header"><span className="header-logo">BiblePlay</span></div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f9f6ef',
          padding: '20px',
          position: 'relative',
        }}>
          {/* Кнопка назад к списку игр */}
          <div style={{ position: 'absolute', top: 80, left: 24, zIndex: 20 }}>
            <button
              onClick={() => { setSelectedGame(null); }}
              style={{ background: '#bdb7af', color: '#2c1810', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 16, cursor: 'pointer', fontWeight: 700 }}
            >
              ← Назад
            </button>
          </div>
          <div style={{
            background: '#faf8f4',
            borderRadius: 16,
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #ece6da',
            maxWidth: 400,
            width: '100%',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              marginBottom: 32, 
              marginTop: 60,
              color: '#2c1810',
              fontSize: 32,
              fontWeight: 700
            }}>
              Библейская хронология
            </h1>
            <p style={{
              color: '#7c6f57',
              fontSize: 16,
              marginBottom: 32,
              lineHeight: 1.5
            }}>
              Режим отладки - без сокетов
            </p>
            <button onClick={() => setSelectedGame(null)} style={{ background: '#ccc', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px' }}>В меню</button>
            </div>
          </div>
      </>
    );
  }

    return (
      <>
        <div className="header"><span className="header-logo">BiblePlay</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', background: '#f9f6ef', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 760, padding: '18px 12px' }}>
            <h1 style={{
              textAlign: 'center',
              color: '#2c1810',
              fontSize: 28,
              fontWeight: 800,
              margin: '12px 0 28px 0',
              marginTop: (typeof window !== 'undefined' && window.innerWidth <= 700) ? 56 : 12,
              marginBottom: 28
            }}>Библейские игры для провождения времени с друзьями!</h1>

            {/* Блок 1 — Библейская хронология */}
            <div style={{ background: '#efebe5', borderRadius: 16, padding: 16, border: '1px solid #e2d9ca', marginBottom: 16, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#2c1810' }}>Библейская хронология</div>
                <button onClick={() => setSelectedGame('chronology')} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Играть</button>
              </div>
              <div style={{ color: '#4d3b2f', fontSize: 14, marginTop: 8 }}>
                Соберите библейскую историю воедино: выкладывайте события в правильной последовательности. Играйте компанией или тренируйтесь в одиночку.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div style={{ background: '#d7d2cb', borderRadius: 20, padding: '6px 12px', color: '#2c1810', fontWeight: 700, fontSize: 14 }}>2–15 чел.</div>
                <button onClick={() => setOpenInfoGame('chronology')} style={{ background: '#bdb7af', color: '#2c1810', border: 'none', borderRadius: 20, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Подробнее</button>
              </div>
            </div>

            {/* Блок 2 — Библейский Alias */}
            <div style={{ background: '#efebe5', borderRadius: 16, padding: 16, border: '1px solid #e2d9ca', marginBottom: 16, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#2c1810' }}>Библейский Alias</div>
              <button onClick={() => setSelectedGame('alias')} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Играть</button>
              </div>
              <div style={{ color: '#4d3b2f', fontSize: 14, marginTop: 8 }}>
                Объясняйте библейские термины, имена, места и книги так, чтобы команда угадала слово быстрее соперников.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div style={{ background: '#d7d2cb', borderRadius: 20, padding: '6px 12px', color: '#2c1810', fontWeight: 700, fontSize: 14 }}>мин 2 чел.</div>
                <button onClick={() => setOpenInfoGame('alias')} style={{ background: '#bdb7af', color: '#2c1810', border: 'none', borderRadius: 20, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Подробнее</button>
              </div>
            </div>

            {/* Блок 3 — Игра «Фарисеи» */}
            <div style={{ background: '#efebe5', borderRadius: 16, padding: 16, border: '1px solid #e2d9ca', marginBottom: 16, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#2c1810' }}>Игра "Фарисеи"</div>
                <button disabled style={{ background: '#2c2c2c', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 16, fontWeight: 700, opacity: 0.85 }}>Скоро</button>
              </div>
              <div style={{ color: '#4d3b2f', fontSize: 14, marginTop: 8 }}>
                Социальная игра по мотивам «Мафии» о противостоянии фарисеев и последователей Иисуса. Нужен ведущий.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div style={{ background: '#d7d2cb', borderRadius: 20, padding: '6px 12px', color: '#2c1810', fontWeight: 700, fontSize: 14 }}>5–20 чел. + ведущий</div>
                <button onClick={() => setOpenInfoGame('pharisees')} style={{ background: '#bdb7af', color: '#2c1810', border: 'none', borderRadius: 20, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Подробнее</button>
              </div>
            </div>
          </div>

                <div style={{ marginTop: 20 }}>
          <button onClick={() => setShowDonate(true)} style={{ background: '#ffd600', color: '#2c1810', border: 'none', borderRadius: 8, padding: '12px 20px' }}>Пожертвовать</button>
          </div>

          {/* Модальные окна «Подробнее» */}
          <InfoModal isOpen={openInfoGame === 'chronology'} onClose={() => setOpenInfoGame(null)} title="Библейская хронология">
            <p>Классическая карточная игра по библейским событиям. Цель — выложить события в правильном хронологическом порядке. Доступны мультиплеер и одиночный режим.</p>
          </InfoModal>
          <InfoModal isOpen={openInfoGame === 'alias'} onClose={() => setOpenInfoGame(null)} title="Библейский Alias">
            <p>В этой командной игре вы объясняете библейские слова, не используя однокоренные. В зависимости от количества игроков объясняете <b>своей команде</b> или ходите по очереди, заставляя угадывать <b>другие команды</b>. Гибкие правила подойдут и для небольшой компании, и для большого мероприятия.</p>
          </InfoModal>
          <InfoModal isOpen={openInfoGame === 'pharisees'} onClose={() => setOpenInfoGame(null)} title='Игра "Фарисеи"'>
            <div>
              <p><b>Фарисеи</b> — это новый взгляд на классику «Мафии». Вы живёте во времена Иисуса. Днём ученики пытаются вычислить фарисеев и «отлучить» их, а ночью фарисеи тайно выбирают жертву, чтобы «побить камнями». Побеждает команда, которая первой выполнит свою миссию.</p>
              <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
                <li><b>Игроки:</b> 5–20 человек + ведущий</li>
                <li><b>Команды:</b> ученики Иисуса и фарисеи</li>
                <li><b>Сюжет и роли:</b> десятки специальных ролей помогают обеим сторонам, у каждого — уникальная способность</li>
                <li><b>Цель:</b> ученики находят и изгоняют фарисеев; фарисеи — незаметно избавляются от учеников ночью</li>
              </ul>
              <p>Игра вдохновлена и адаптирована на основе материалов проекта «PHARISEES: The Party Game». Подробности и полезные материалы для ведущего см. на сайте <a href="https://phariseesgame.com" target="_blank" rel="noopener noreferrer">phariseesgame.com</a>.</p>
            </div>
          </InfoModal>

          <GameRules isOpen={showRules} onClose={() => setShowRules(false)} mode="both" />
        
          {showDonate && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}>
              <div style={{
                background: '#faf8f4',
                borderRadius: 16,
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                border: '1px solid #ece6da',
                maxWidth: 340,
                width: '90vw',
              textAlign: 'center'
              }}>
                <h2 style={{ color: '#2c1810', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Пожертвование</h2>
                <p style={{ color: '#7c6f57', fontSize: 16, marginBottom: 24 }}>
                Ваши пожертвования помогут в оплате серверов и развитии проекта.
              </p>
                  <button onClick={() => setShowDonate(false)} style={{
                    background: '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: 16,
                cursor: 'pointer'
                  }}>
                    Закрыть
                  </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
