import React, { useState, useRef } from 'react';
import Card from './Card';
import DraggableCard from './DraggableCard';
import GameTable from './GameTable';
import CustomDragLayer from './CustomDragLayer';
import Toast from './Toast';
import GameRules from './GameRules';
import RoomSidebar from './RoomSidebar';

// Импортируем массив карт из актуального cards.json
import cards from './cards.json';
console.log('IMPORTED CARDS:', cards);

function shuffle(arr: any[]) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

const initialHandCount = 6;
const maxLives = 5;

const getShuffledDeck = () => {
  const shuffled = shuffle(cards);
  return {
    hand: shuffled.slice(0, initialHandCount),
    deck: shuffled.slice(initialHandCount)
  };
};

const STORAGE_KEY = 'chronium_single_state';

const SinglePlayerGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  // Восстановление состояния из sessionStorage
  const saved = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
  let initial = null;
  if (saved) {
    try { initial = JSON.parse(saved); } catch {}
  }
  // Функция для обогащения карточек из sessionStorage актуальными полями из cards.json
  function enrichCards(arr: any[]): any[] {
    if (!arr) return arr;
    return arr.map((cardFromStorage: any) => {
      const fresh = cards.find((c: any) => c.id === cardFromStorage.id);
      return { ...fresh, ...cardFromStorage };
    });
  }
  const { hand: initialHand, deck: initialDeck } = React.useMemo(getShuffledDeck, []);
  const [deck, setDeck] = useState(initial?.deck ? enrichCards(initial.deck) : initialDeck);
  const [hand, setHand] = useState<any[]>(initial?.hand ? enrichCards(initial.hand) : initialHand);
  React.useEffect(() => {
    console.log('HAND STATE:', hand);
  }, [hand]);
  const [table, setTable] = useState<any[]>(initial?.table ? enrichCards(initial.table) : []);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [lives, setLives] = useState(initial?.lives ?? maxLives);
  const [score, setScore] = useState(initial?.score || 0);
  const [toast, setToast] = useState('');
  const [gameOver, setGameOver] = useState(initial?.gameOver || false);
  const [showRules, setShowRules] = useState(false);
  const [scrollToCardIndex, setScrollToCardIndex] = useState<number | null>(null);

  // Сохранять состояние при каждом изменении
  React.useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ hand, deck, table, lives, score, gameOver }));
  }, [hand, deck, table, lives, score, gameOver]);

  // Очищать состояние только при старте новой игры, а не при onExit
  const handleExit = () => {
    // sessionStorage.removeItem(STORAGE_KEY); // НЕ очищаем!
    onExit();
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700;

  // Проверка правильности хода
  const onDropCard = (cardId: number, insertIdx: number) => {
    const card = hand.find((c) => c.id === cardId);
    if (!card) return;
    const leftOrder = insertIdx > 0 ? (table[insertIdx - 1]?.order ?? -Infinity) : -Infinity;
    const rightOrder = insertIdx < table.length ? (table[insertIdx]?.order ?? Infinity) : Infinity;
    const correct = leftOrder < card.order && card.order < rightOrder;
    let newHand = hand.filter((c) => c.id !== cardId);
    let newTable = [...table];
    if (correct) {
      newTable.splice(insertIdx, 0, card);
      const addScore = getCardScore(card);
      setScore((s: any) => s + addScore);
      setToast('Верно!');
      setScrollToCardIndex(null);
    } else {
      // Вставляем карту не по порядку
      const correctIndex = table.findIndex((c) => c.order > card.order);
      let idxToScroll: number;
      if (correctIndex === -1) {
        newTable.push(card);
        idxToScroll = newTable.length - 1;
      } else {
        newTable.splice(correctIndex, 0, card);
        idxToScroll = correctIndex;
      }
      setLives((l: any) => l - 1);
      setToast('Карта не попала в правильный порядок!');
      setScrollToCardIndex(idxToScroll);
    }
    // Добавляем новую карту из колоды, если есть
    if (deck.length > 0) {
      newHand = [...newHand, deck[0]];
      setDeck(deck.slice(1));
    }
    setHand(newHand);
    setTable(newTable);
    if (lives - (correct ? 0 : 1) <= 0) {
      setTimeout(() => setGameOver(true), 800);
    }
    if (newHand.length === 0 && deck.length === 0) {
      setTimeout(() => setGameOver(true), 800);
    }
  };

  // Функция для определения баллов по полю score
  function getCardScore(card: any) {
    return card.score || 1;
  }

  // После рендера сбрасываем scrollToCardIndex
  React.useEffect(() => {
    if (scrollToCardIndex !== null) {
      const timer = setTimeout(() => setScrollToCardIndex(null), 500);
      return () => clearTimeout(timer);
    }
  }, [scrollToCardIndex, table]);

  if (gameOver) {
    const getScoreText = (score: number) => {
      if (score === 1) return 'балл';
      if (score >= 2 && score <= 4) return 'балла';
      return 'баллов';
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9f6ef', padding: 20 }}>
        <div style={{ background: '#faf8f4', borderRadius: 16, padding: 40, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #ece6da', maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>⭐</div>
          <h1 style={{ marginBottom: 16, color: '#2c1810', fontSize: 32, fontWeight: 700 }}>Игра окончена</h1>
          <div style={{ fontSize: 24, marginBottom: 32, color: '#7c6f57', fontWeight: 500 }}>Ваш результат: <span style={{ color: '#d4a373', fontWeight: 700 }}>{score} {getScoreText(score)}</span></div>
          <div style={{ fontSize: 18, marginBottom: 32, color: '#2c1810' }}>Вы молодец! Продолжайте изучать Библию и возвращайтесь за новыми рекордами. Слава Богу!</div>
          <button onClick={handleExit} style={{ background: '#d4a373', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 18, cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.3s', width: 'auto' }}>В меню</button>
        </div>
      </div>
    );
  }

  // Мобильная версия: современный layout как в мультиплеере
  if (isMobile) {
    return (
      <div className="mobile-v2-root">
        {/* Фиксированный header */}
        <div className="mobile-v2-header-fixed">
          <span className="mobile-v2-logo">BiblePlay</span>
          <button className="mobile-v2-btn mobile-v2-btn-rules" onClick={() => setShowRules(true)}>Правила</button>
          <button className="mobile-v2-btn mobile-v2-btn-exit" onClick={handleExit}>В меню</button>
        </div>
        {/* Toast всегда поверх */}
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
        {/* Заголовок */}
        <div className="mobile-v2-title">Одиночный режим</div>
        {/* Осталось карт */}
        <div className="mobile-v2-cardsleft">Осталось карт: {deck.length}</div>
        {/* Инфоблок с метриками */}
        <div className="mobile-v2-infocard-row" style={{ paddingLeft: 60, paddingRight: 60 }}>
          <div className="mobile-v2-infocard-metric">
            <div className="mobile-v2-metric-label">Жизни</div>
            <div className="mobile-v2-metric-value">{lives} <span style={{ color: '#d32f2f', fontSize: 18 }}>❤️</span></div>
          </div>
          <div className="mobile-v2-infocard-metric">
            <div className="mobile-v2-metric-label">Баллы</div>
            <div className="mobile-v2-metric-value">{score}</div>
          </div>
          <div className="mobile-v2-infocard-metric">
            <div className="mobile-v2-metric-label">Прогресс</div>
            <div className="mobile-v2-progress-bar" style={{ margin: '4px 0 2px 0' }}><div style={{ width: `${Math.round((table.length / cards.length) * 100)}%` }} /></div>
            <div className="mobile-v2-progress-pct">{Math.round((table.length / cards.length) * 100)}%</div>
          </div>
        </div>
        {/* Игровое поле */}
        <div className="mobile-v2-tablewrap">
          <GameTable table={table} onDropCard={onDropCard} scrollToCardIndex={scrollToCardIndex} />
        </div>
        <CustomDragLayer />
        {/* Рука */}
        <div className="mobile-v2-handlabel">Ваши карты:</div>
        <div className="mobile-v2-handwrap">
          <div className="mobile-v2-handscroll">
            {hand.map(card => (
              <DraggableCard key={card.id} card={card} />
            ))}
          </div>
        </div>
        {/* Инфоблок с советами */}
        <div className="mobile-v2-infobox">
          <b>В случае ошибок со стороны игры или сайта:</b>
          <ol>
            <li>Если кто-то из игроков покинул игру, передача хода может работать некорректно. В этом случае пересоздайте комнату.</li>
            <li>Если во время игры возникла логическая ошибка (например, игра зависла или не реагирует), попробуйте обновить страницу. Если проблема не исчезла — проверьте ваше интернет-соединение.</li>
            <li>Если ошибка повторяется или вы столкнулись с другой проблемой, пожалуйста, свяжитесь с нами через контакты внизу сайта и опишите ситуацию.</li>
            <li>Если у вас некорректно отображается внешний вид игры, измените масштаб страницы в вашем браузере. Затем обновите страницу.</li>
          </ol>
        </div>
        <GameRules isOpen={showRules} onClose={() => setShowRules(false)} mode="single" />
      </div>
    );
  }

  // ПК-версия — sidebar слева, центр и рука
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#faf8f4', position: 'relative' }}>
      {/* Заголовок и "Осталось карт" по центру, как в мультиплеере */}
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', paddingTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ textAlign: 'center', margin: 0, fontSize: 28, fontWeight: 700, color: '#2c1810', lineHeight: '1.2', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56 }}>Одиночный режим</h2>
        <div style={{ width: '100%', textAlign: 'center', marginTop: 8, marginBottom: 8, fontSize: 16, color: '#7c6f57' }}>Осталось карт: {deck.length}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', maxWidth: 900, margin: '0 auto', paddingTop: 32 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#faf8f4', borderRadius: 10, padding: '8px 16px', fontSize: 16, color: '#2c1810', fontWeight: 600, border: '1px solid #ece6da' }}>Жизни: {lives} ❤️</div>
          <div style={{ background: '#faf8f4', borderRadius: 10, padding: '8px 16px', fontSize: 16, color: '#2c1810', fontWeight: 600, border: '1px solid #ece6da' }}>Баллы: {score}</div>
        </div>
        <div style={{ minWidth: 180, maxWidth: 220, flex: '0 0 200px', marginLeft: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#2c1810', marginBottom: 4 }}>Прогресс</div>
          <div style={{ width: '100%', background: '#ece6da', borderRadius: 5, height: 8, marginBottom: 4 }}>
            <div style={{ width: `${Math.round((table.length / cards.length) * 100)}%`, height: 8, background: '#d4a373', borderRadius: 5, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 12, color: '#7c6f57' }}>{Math.round((table.length / cards.length) * 100)}%</div>
        </div>
          </div>
          <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', overflowX: 'auto', position: 'relative' }}>
            <GameTable table={table} onDropCard={onDropCard} scrollToCardIndex={scrollToCardIndex} />
          </div>
          <div style={{ marginTop: 24, width: '100%' }}>
        <h3 style={{ textAlign: 'center', marginBottom: 8, color: '#2c1810' }}>Ваши карты:</h3>
            <div className="hand" style={{ display: 'flex', gap: 6, justifyContent: 'center', overflowX: 'auto', width: '100%', paddingBottom: 8 }}>
              {hand.map(card => (
                <DraggableCard key={card.id} card={card} />
              ))}
            </div>
          </div>
      <button onClick={handleExit} style={{ marginTop: 24, background: '#ccc', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer' }}>В меню</button>
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
        <GameRules isOpen={showRules} onClose={() => setShowRules(false)} mode="single" />
    </div>
  );
};

export default SinglePlayerGame; 