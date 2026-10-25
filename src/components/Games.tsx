import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GameMode } from '../lib/categories';
import type { ReactNode } from 'react';

const Counter = lazy(() => import('./Counter'));
type Difficulty = 'easy' | 'medium' | 'hard';
type MemoryCard = { pair: number; symbol: string };
type MemoryRecord = { time: number; moves: number };
type MemoryRecords = Partial<Record<Difficulty, MemoryRecord>>;
type TicScores = { X: number; O: number; draws: number };
type Mark = 'X' | 'O';

const SYMBOLS = ['🌙', '⭐', '🌸', '🦋', '🍀', '🎈', '🐚', '🍓', '☀️', '🍄', '🪁', '🌿'];
const DIFFICULTIES: Record<Difficulty, { label: string; columns: number; pairs: number }> = {
  easy: { label: 'Easy · 4×3', columns: 4, pairs: 6 },
  medium: { label: 'Medium · 4×4', columns: 4, pairs: 8 },
  hard: { label: 'Hard · 6×4', columns: 6, pairs: 12 },
};
const MEMORY_RECORDS_KEY = 'artville-memory-records-v1';
const TIC_SCORES_KEY = 'artville-tic-tac-toe-scores-v1';
const WINNING_LINES = [
  { cells: [0, 1, 2], path: 'M 18 50 H 282' },
  { cells: [3, 4, 5], path: 'M 18 150 H 282' },
  { cells: [6, 7, 8], path: 'M 18 250 H 282' },
  { cells: [0, 3, 6], path: 'M 50 18 V 282' },
  { cells: [1, 4, 7], path: 'M 150 18 V 282' },
  { cells: [2, 5, 8], path: 'M 250 18 V 282' },
  { cells: [0, 4, 8], path: 'M 28 28 L 272 272' },
  { cells: [2, 4, 6], path: 'M 272 28 L 28 272' },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? { ...fallback, ...JSON.parse(value) } : fallback;
  } catch (error) {
    console.warn(`Could not read saved game data for ${key}:`, error);
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save game data for ${key}:`, error);
  }
}

function shuffledDeck(difficulty: Difficulty): MemoryCard[] {
  const pairCount = DIFFICULTIES[difficulty].pairs;
  const deck = SYMBOLS.slice(0, pairCount).flatMap((symbol, pair) => [
    { pair, symbol },
    { pair, symbol },
  ]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function GameFrame({ children }: { children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl border border-ink/10 bg-ink/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.025] sm:p-8"
    >
      {children}
    </motion.section>
  );
}

function BackToGames() {
  return (
    <Link
      to="/section/games"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-accent/40 px-4 font-mono text-[10px] uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <ArrowLeft size={14} /> Back to games
    </Link>
  );
}

function MemoryMatch() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState(() => shuffledDeck('medium'));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [records, setRecords] = useState<MemoryRecords>(() => readStorage(MEMORY_RECORDS_KEY, {}));
  const mismatchTimeout = useRef<number | null>(null);
  const isComplete = matched.length === DIFFICULTIES[difficulty].pairs;

  useEffect(() => {
    if (startedAt === null || isComplete) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt, isComplete]);

  useEffect(() => () => {
    if (mismatchTimeout.current !== null) window.clearTimeout(mismatchTimeout.current);
  }, []);

  const restart = (nextDifficulty = difficulty) => {
    if (mismatchTimeout.current !== null) window.clearTimeout(mismatchTimeout.current);
    mismatchTimeout.current = null;
    setDifficulty(nextDifficulty);
    setCards(shuffledDeck(nextDifficulty));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setElapsedSeconds(0);
    setStartedAt(null);
  };

  const flipCard = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].pair)) return;
    setStartedAt(current => current ?? Date.now());
    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);
    if (nextFlipped.length !== 2) return;

    setMoves(current => current + 1);
    if (cards[nextFlipped[0]].pair === cards[nextFlipped[1]].pair) {
      const nextMatched = [...matched, cards[nextFlipped[0]].pair];
      setMatched(nextMatched);
      setFlipped([]);
      if (nextMatched.length === DIFFICULTIES[difficulty].pairs) {
        const current = { time: elapsedSeconds, moves: moves + 1 };
        const previous = records[difficulty];
        if (!previous || current.time < previous.time || (current.time === previous.time && current.moves < previous.moves)) {
          const updated = { ...records, [difficulty]: current };
          setRecords(updated);
          writeStorage(MEMORY_RECORDS_KEY, updated);
        }
      }
    } else {
      mismatchTimeout.current = window.setTimeout(() => {
        setFlipped([]);
        mismatchTimeout.current = null;
      }, 750);
    }
  };

  const best = records[difficulty];

  return (
    <GameFrame>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <BackToGames />
          <h2 className="room-signature-games mt-4 text-2xl sm:text-3xl">Memory Match</h2>
          <p className="mt-1 text-sm opacity-65">Flip cards, find every pair, beat your best time.</p>
        </div>
        <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-wider">
          Difficulty
          <select
            value={difficulty}
            onChange={event => restart(event.target.value as Difficulty)}
            className="min-h-11 rounded-full border border-ink/10 bg-paper px-4 text-xs text-ink outline-none focus-visible:border-accent dark:border-white/15 dark:bg-[#111113] dark:text-[#f0ede6]"
          >
            {Object.entries(DIFFICULTIES).map(([key, option]) => (
              <option key={key} value={key}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/15 bg-accent/[0.04] px-4 py-3">
        <p className="font-mono text-xs" aria-live="polite">
          Moves <strong className="text-accent"><Suspense fallback={moves}><Counter value={moves} duration={0.25} motionBlur={false} /></Suspense></strong>
          <span className="mx-2 opacity-30">·</span>
          Time <strong className="text-accent">{formatTime(elapsedSeconds)}</strong>
          <span className="mx-2 opacity-30">·</span>
          Pairs <strong className="text-accent">{matched.length}/{DIFFICULTIES[difficulty].pairs}</strong>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider opacity-65">
          Best {best ? `${formatTime(best.time)} · ${best.moves} moves` : 'No record yet'}
        </p>
        <button
          type="button"
          onClick={() => restart()}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 text-xs font-mono transition-colors hover:border-accent hover:text-accent dark:border-white/10"
        >
          <RotateCcw size={14} /> Restart
        </button>
      </div>

      <div
        className="mx-auto grid max-w-3xl gap-2 sm:gap-3 [perspective:1000px]"
        style={{ gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].columns}, minmax(0, 1fr))` }}
        aria-label={`${DIFFICULTIES[difficulty].label} card grid`}
      >
        {cards.map((card, index) => {
          const isRevealed = flipped.includes(index) || matched.includes(card.pair);
          return (
            <button
              key={`${difficulty}-${index}`}
              type="button"
              onClick={() => flipCard(index)}
              aria-label={isRevealed ? `Card ${card.symbol}` : `Reveal card ${index + 1}`}
              aria-pressed={isRevealed}
              className="relative aspect-square min-h-0 [transform-style:preserve-3d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span
                className={`absolute inset-0 flex items-center justify-center rounded-xl border text-xl transition-all duration-300 sm:rounded-2xl sm:text-4xl ${
                  isRevealed
                    ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(154,123,31,.3)]'
                    : 'border-ink/10 bg-paper dark:border-white/10 dark:bg-white/5'
                }`}
                style={{ transform: isRevealed ? 'rotateY(0deg)' : 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
              >
                {isRevealed ? card.symbol : '?'}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-paper/95 p-6 dark:bg-[#0c0c0e]/95"
            role="dialog"
            aria-modal="true"
            aria-labelledby="memory-win-title"
          >
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Collection complete</p>
              <h3 id="memory-win-title" className="mt-2 font-serif text-3xl">A perfect match.</h3>
              <p className="mt-3 text-sm opacity-70">You found every pair in {moves} moves and {formatTime(elapsedSeconds)}.</p>
              <button
                type="button"
                onClick={() => restart()}
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 font-mono text-xs uppercase tracking-widest text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <RotateCcw size={14} /> Play again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameFrame>
  );
}

function TicTacToe() {
  const [board, setBoard] = useState<(Mark | null)[]>(Array(9).fill(null));
  const [nextMark, setNextMark] = useState<Mark>('X');
  const [scores, setScores] = useState<TicScores>(() => readStorage(TIC_SCORES_KEY, { X: 0, O: 0, draws: 0 }));
  const [playerX, setPlayerX] = useState('');
  const [playerO, setPlayerO] = useState('');
  const roundRecorded = useRef(false);
  const winningLine = WINNING_LINES.find(({ cells }) => {
    const [first, second, third] = cells;
    return board[first] && board[first] === board[second] && board[first] === board[third];
  });
  const winner = winningLine ? board[winningLine.cells[0]] : null;
  const isDraw = !winner && board.every(Boolean);

  useEffect(() => {
    if ((!winner && !isDraw) || roundRecorded.current) return;
    roundRecorded.current = true;
    const updated = winner
      ? { ...scores, [winner]: scores[winner] + 1 }
      : { ...scores, draws: scores.draws + 1 };
    setScores(updated);
    writeStorage(TIC_SCORES_KEY, updated);
  }, [isDraw, scores, winner]);

  const play = (index: number) => {
    if (board[index] || winner || isDraw) return;
    roundRecorded.current = false;
    const nextBoard = [...board];
    nextBoard[index] = nextMark;
    setBoard(nextBoard);
    setNextMark(nextMark === 'X' ? 'O' : 'X');
  };

  const newRound = () => {
    roundRecorded.current = false;
    setBoard(Array(9).fill(null));
    setNextMark('X');
  };

  const resetScores = () => {
    const empty = { X: 0, O: 0, draws: 0 };
    setScores(empty);
    writeStorage(TIC_SCORES_KEY, empty);
    newRound();
  };

  const labelX = playerX.trim() || 'Player X';
  const labelO = playerO.trim() || 'Player O';

  return (
    <GameFrame>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <BackToGames />
          <h2 className="room-signature-games mt-4 text-2xl sm:text-3xl">Tic-Tac-Toe</h2>
          <p className="mt-1 text-sm opacity-65">Two players, one screen. Claim three in a row.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={newRound} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 text-xs font-mono hover:border-accent hover:text-accent dark:border-white/10">
            <RotateCcw size={13} /> New round
          </button>
          <button type="button" onClick={resetScores} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 text-xs font-mono hover:border-accent hover:text-accent dark:border-white/10">
            <X size={13} /> Reset scores
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <label className="font-mono text-[10px] uppercase tracking-wider">
          Player X
          <input value={playerX} onChange={event => setPlayerX(event.target.value)} maxLength={24} placeholder="Player X" className="mt-1 block min-h-11 w-full rounded-xl border border-ink/10 bg-paper px-3 text-sm font-sans normal-case tracking-normal outline-none focus:border-accent dark:border-white/10 dark:bg-[#111113]" />
        </label>
        <label className="font-mono text-[10px] uppercase tracking-wider">
          Player O
          <input value={playerO} onChange={event => setPlayerO(event.target.value)} maxLength={24} placeholder="Player O" className="mt-1 block min-h-11 w-full rounded-xl border border-ink/10 bg-paper px-3 text-sm font-sans normal-case tracking-normal outline-none focus:border-accent dark:border-white/10 dark:bg-[#111113]" />
        </label>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 text-center font-mono text-[10px] uppercase tracking-wider">
        <p className="rounded-xl border border-accent/20 bg-accent/[0.04] p-3">{labelX}: <strong className="text-accent">{scores.X}</strong></p>
        <p className="rounded-xl border border-ink/10 p-3 dark:border-white/10">Draws: <strong>{scores.draws}</strong></p>
        <p className="rounded-xl border border-accent/20 bg-accent/[0.04] p-3">{labelO}: <strong className="text-accent">{scores.O}</strong></p>
      </div>

      <p className="mb-4 text-center font-serif text-lg" aria-live="polite">
        {winner ? `${winner === 'X' ? labelX : labelO} wins!` : isDraw ? "It's a draw!" : `${nextMark === 'X' ? labelX : labelO}'s turn (${nextMark})`}
      </p>
      <div className="relative mx-auto grid max-w-sm grid-cols-3 gap-2">
        {board.map((mark, index) => (
          <button
            key={index}
            type="button"
            onClick={() => play(index)}
            aria-label={`Square ${index + 1}${mark ? `, ${mark}` : ', empty'}`}
            className="aspect-square rounded-2xl border border-ink/10 bg-paper text-4xl font-serif text-accent transition-colors hover:border-accent/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-white/10 dark:bg-white/5 sm:text-5xl"
          >
            <motion.span
              initial={false}
              animate={mark ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="inline-block"
            >
              {mark}
            </motion.span>
          </button>
        ))}
        {winningLine && (
          <svg aria-hidden="true" viewBox="0 0 300 300" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <path d={winningLine.path} fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="5" strokeLinecap="round" className="games-win-line" />
          </svg>
        )}
      </div>
    </GameFrame>
  );
}

export default function Games({ mode }: { mode: GameMode }) {
  return mode === 'singleplayer' ? <MemoryMatch /> : <TicTacToe />;
}
