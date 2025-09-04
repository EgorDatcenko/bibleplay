import React from 'react';
import { aliasCategories, getAllWords, shuffle } from './aliasData.ts';
import type { AliasCategory, AliasWord } from './aliasData.ts';

type Team = { id: string; name: string; score: number };

type Settings = {
  roundSeconds: number;
  targetScore: number;
  selectedCategories: string[];
  includeAdvanced: boolean;
  disableHints: boolean;
};

type Phase = 'setup' | 'playing' | 'round';

function useCountdown(endAtMs: number | null) {
  const [now, setNow] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    if (!endAtMs) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [endAtMs]);
  const left = endAtMs ? Math.max(0, Math.ceil((endAtMs - now) / 1000)) : 0;
  return left;
}

export default function AliasGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = React.useState<Phase>('setup');
  const [teams, setTeams] = React.useState<Team[]>([
    { id: 't1', name: 'Команда 1', score: 0 },
    { id: 't2', name: 'Команда 2', score: 0 },
  ]);
  const [currentTeamIdx, setCurrentTeamIdx] = React.useState(0);
  const [settings, setSettings] = React.useState<Settings>({ roundSeconds: 60, targetScore: 20, selectedCategories: aliasCategories.map(c => c.key), includeAdvanced: false, disableHints: false });
  const [deck, setDeck] = React.useState<AliasWord[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = React.useState(0);
  const [roundEndAt, setRoundEndAt] = React.useState<number | null>(null);
  const timeLeft = useCountdown(roundEndAt);

  React.useEffect(() => {
    const words = shuffle(getAllWords(settings.selectedCategories, settings.includeAdvanced));
    setDeck(words);
    setCurrentWordIdx(0);
  }, [settings.selectedCategories, settings.includeAdvanced]);

  const startGame = () => {
    setPhase('playing');
  };

  const startRound = () => {
    setPhase('round');
    setRoundEndAt(Date.now() + settings.roundSeconds * 1000);
  };

  const endRound = () => {
    setPhase('playing');
    setRoundEndAt(null);
    setCurrentTeamIdx((i) => (i + 1) % teams.length);
  };

  React.useEffect(() => {
    if (phase === 'round' && timeLeft === 0 && roundEndAt) {
      endRound();
    }
  }, [timeLeft, phase, roundEndAt]);

  const addTeam = () => {
    const id = Math.random().toString(36).slice(2, 8);
    setTeams((t) => [...t, { id, name: `Команда ${t.length + 1}`, score: 0 }]);
  };

  const removeTeam = (id: string) => {
    setTeams((t) => t.filter(x => x.id !== id));
    setCurrentTeamIdx(0);
  };

  const updateTeamName = (id: string, name: string) => {
    setTeams((t) => t.map(x => x.id === id ? { ...x, name } : x));
  };

  const guessed = () => {
    // +1 очко текущей команде, следующeе слово
    setTeams((t) => t.map((team, idx) => idx === currentTeamIdx ? { ...team, score: team.score + 1 } : team));
    nextWord();
  };

  const skipped = () => {
    // -1 очко текущей команде за пропуск, следующее слово
    setTeams((t) => t.map((team, idx) => idx === currentTeamIdx ? { ...team, score: Math.max(0, team.score - 1) } : team));
    nextWord();
  };

  const nextWord = () => {
    setCurrentWordIdx((i) => (i + 1) % Math.max(1, deck.length));
  };

  const hasWinner = teams.some(t => t.score >= settings.targetScore);
  const winner = hasWinner ? teams.reduce((a, b) => a.score >= b.score ? a : b) : null;

  if (hasWinner && winner) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20 }}>
        <h2 style={{ fontSize: 'clamp(20px, 5vw, 24px)', textAlign: 'center' }}>Победа: {winner.name}</h2>
        <button onClick={onExit} style={{ background: '#d4a373', color: '#fff', border: 'none', borderRadius: 8, padding: 'clamp(12px, 3vw, 16px) clamp(24px, 5vw, 28px)', fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>В меню</button>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20 }}>
        <button onClick={onExit} style={{ 
          background: '#ccc', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 8, 
          padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
          alignSelf: 'flex-start',
          marginTop: 'clamp(20px, 5vw, 30px)',
          marginBottom: '20px',
          fontSize: 'clamp(14px, 3.5vw, 16px)'
        }}>← Назад</button>
        <h2 style={{ marginTop: '0px', marginBottom: '20px', textAlign: 'center', fontSize: 'clamp(20px, 5vw, 24px)' }}>Библейский Alias — Настройки</h2>
        <div style={{ background: '#faf8f4', border: '1px solid #ece6da', borderRadius: 12, padding: 16, width: '100%', maxWidth: 700 }}>
          <h3 style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>Команды</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {teams.map(t => (
              <div key={t.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={t.name} onChange={e => updateTeamName(t.id, e.target.value)} style={{ 
                  flex: 1, 
                  padding: '12px 18px', 
                  borderRadius: 8, 
                  border: '1px solid #d4a373',
                  fontSize: '18px'
                }} />
                {teams.length > 2 && (
                  <button onClick={() => removeTeam(t.id)} style={{ background: '#ccc', color: '#fff', border: 'none', borderRadius: 8, padding: 'clamp(10px, 2.5vw, 12px) clamp(14px, 3.5vw, 18px)', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Удалить</button>
                )}
              </div>
            ))}
            {teams.length < 10 && (
              <button onClick={addTeam} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, padding: 'clamp(12px, 3vw, 16px) clamp(18px, 4vw, 24px)', fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>+ Добавить команду</button>
            )}
            {teams.length >= 10 && (
              <div style={{ color: '#666', fontSize: 'clamp(14px, 3.5vw, 16px)', textAlign: 'center', padding: 'clamp(8px, 2vw, 12px)', background: '#f0f0f0', borderRadius: 8 }}>Максимум 10 команд</div>
            )}
          </div>
          <h3 style={{ marginTop: 16, fontSize: 'clamp(16px, 4vw, 18px)' }}>Время раунда (сек)</h3>
          <input type="number" min={15} max={180} value={settings.roundSeconds} onChange={e => setSettings(s => ({ ...s, roundSeconds: Math.max(15, Math.min(180, Number(e.target.value)||60)) }))} style={{ padding: '12px 18px', borderRadius: 8, border: '1px solid #d4a373', width: 140, fontSize: '18px' }} />
          <h3 style={{ marginTop: 16, fontSize: 'clamp(16px, 4vw, 18px)' }}>Очки до победы</h3>
          <input type="number" min={5} max={200} value={settings.targetScore} onChange={e => setSettings(s => ({ ...s, targetScore: Math.max(5, Math.min(200, Number(e.target.value)||20)) }))} style={{ padding: '12px 18px', borderRadius: 8, border: '1px solid #d4a373', width: 140, fontSize: '18px' }} />
          <h3 style={{ marginTop: 16, fontSize: 'clamp(16px, 4vw, 18px)' }}>Категории</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {aliasCategories.map((c: AliasCategory) => {
              const checked = settings.selectedCategories.includes(c.key);
              return (
                <label key={c.key} style={{ 
                  display: 'flex', 
                  gap: 8, 
                  alignItems: 'center', 
                  background: '#efebe5', 
                  border: '1px solid #e2d9ca', 
                  borderRadius: 12, 
                  padding: 'clamp(10px, 2.5vw, 12px)',
                  fontSize: 'clamp(14px, 3.5vw, 16px)'
                }}>
                  <input type="checkbox" checked={checked} onChange={() => setSettings(s => ({ ...s, selectedCategories: checked ? s.selectedCategories.filter(k => k !== c.key) : [...s.selectedCategories, c.key] }))} />
                  <span style={{ fontWeight: 700 }}>{c.title}</span>
                </label>
              );
            })}
          </div>
          <h3 style={{ marginTop: 16, fontSize: 'clamp(16px, 4vw, 18px)' }}>Режим сложности</h3>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#efebe5', border: '1px solid #e2d9ca', borderRadius: 12, padding: 'clamp(10px, 2.5vw, 12px)' }}>
            <input 
              type="checkbox" 
              checked={settings.includeAdvanced} 
              onChange={(e) => setSettings(s => ({ ...s, includeAdvanced: e.target.checked }))} 
            />
            <span style={{ fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Усложненный режим (для опытных знатоков)</span>
          </label>
          <h3 style={{ marginTop: 16, fontSize: 'clamp(16px, 4vw, 18px)' }}>Подсказки</h3>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#efebe5', border: '1px solid #e2d9ca', borderRadius: 12, padding: 'clamp(10px, 2.5vw, 12px)' }}>
            <input 
              type="checkbox" 
              checked={settings.disableHints} 
              onChange={(e) => setSettings(s => ({ ...s, disableHints: e.target.checked }))} 
            />
            <span style={{ fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Отключить подсказки</span>
          </label>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={startGame} style={{ background: '#d4a373', color: '#fff', border: 'none', borderRadius: 8, padding: 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 24px)', fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Начать игру</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20 }}>
        <h2 style={{ fontSize: 'clamp(20px, 5vw, 24px)' }}>Библейский Alias</h2>
        <div style={{ background: '#faf8f4', border: '1px solid #ece6da', borderRadius: 12, padding: 16, width: '100%', maxWidth: 700 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: 'clamp(16px, 4vw, 18px)' }}>Ход: {teams[currentTeamIdx]?.name}</div>
            <button onClick={startRound} style={{ background: '#742a2a', color: '#fff', border: 'none', borderRadius: 8, padding: 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 24px)', fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Начать ход</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>Счёт</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {teams.map(t => (
                <div key={t.id} style={{ background: '#efebe5', border: '1px solid #e2d9ca', borderRadius: 12, padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>{t.name}: <b>{t.score}</b></div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onExit} style={{ background: '#ccc', color: '#fff', border: 'none', borderRadius: 8, padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>В меню</button>
      </div>
    );
  }

  // phase === 'round'
  const word = deck[currentWordIdx];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 720, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 4vw, 20px)' }}>Ход: {teams[currentTeamIdx]?.name}</div>
        <div style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>⏱ {timeLeft}s</div>
      </div>
      <div style={{ background: '#faf8f4', border: '1px solid #ece6da', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', width: '100%', maxWidth: 720, textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 800, marginBottom: 8 }}>{word?.term || '—'}</div>
        {!settings.disableHints && <div style={{ color: '#7c6f57', minHeight: 20, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>{word?.hint || ''}</div>}
      </div>
      <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={guessed} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, padding: 'clamp(12px, 3vw, 16px) clamp(18px, 4vw, 24px)', fontWeight: 800, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Угадано +1</button>
        <button onClick={skipped} style={{ background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 8, padding: 'clamp(12px, 3vw, 16px) clamp(18px, 4vw, 24px)', fontWeight: 800, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Пропустить -1</button>
        <button onClick={endRound} style={{ background: '#bdb7af', color: '#2c1810', border: 'none', borderRadius: 8, padding: 'clamp(12px, 3vw, 16px) clamp(18px, 4vw, 24px)', fontWeight: 800, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Завершить ход</button>
      </div>
      <div style={{ marginTop: 8, color: '#7c6f57', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Категория: {word?.category}</div>
    </div>
  );
}


