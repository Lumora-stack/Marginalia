import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { GameMode } from '../lib/categories';
import { useMuseumSound } from '../lib/sound-context';
type MemoryCard = { pair: number; symbol: string };

const MEMORY_SYMBOLS = ['🌙', '⭐', '🌸', '🦋', '🍀', '🎈', '🐚', '🍓'];
const MEMORY_DECK: MemoryCard[] = MEMORY_SYMBOLS.flatMap((symbol, pair) => [
  { pair, symbol },
  { pair, symbol },
]);
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function useGameSound() {
  return useMuseumSound();
}

function shuffledDeck() {
  const deck = [...MEMORY_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function MemoryMatch() {
  const [cards, setCards] = useState(() => shuffledDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [matchBurst, setMatchBurst] = useState(0);
  const sound = useGameSound();
  const isComplete = matched.length === MEMORY_SYMBOLS.length;

  useEffect(() => {
    if (startedAt === null || isComplete) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt, isComplete]);

  useEffect(() => {
    if (flipped.length !== 2 || cards[flipped[0]].pair === cards[flipped[1]].pair) return;
    const timeout = window.setTimeout(() => setFlipped([]), 850);
    return () => window.clearTimeout(timeout);
  }, [cards, flipped]);

  const restart = () => {
    setCards(shuffledDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setElapsedSeconds(0);
    setStartedAt(null);
    setCombo(0);
    setMatchBurst(0);
  };

  const flipCard = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].pair)) return;

    setStartedAt(current => current ?? Date.now());
    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);
    sound.play('tick');
    if (nextFlipped.length === 2) {
      setMoves(current => current + 1);
      if (cards[nextFlipped[0]].pair === cards[nextFlipped[1]].pair) {
        setMatched(current => [...current, cards[nextFlipped[0]].pair]);
        setFlipped([]);
        setCombo(current => current + 1);
        setMatchBurst(current => current + 1);
        sound.play('match');
      } else {
        setCombo(0);
      }
    }
  };

  return (
    <motion.div
      animate={matchBurst ? { x: [0, -2, 2, -1, 1, 0] } : { x: 0 }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-3xl border border-ink/10 dark:border-white/10 bg-ink/5 dark:bg-white/5 p-5 sm:p-8"
    >
      {matchBurst > 0 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 18 }, (_, index) => (
            <motion.i
              key={`${matchBurst}-${index}`}
              initial={{ opacity: 0, y: 50, x: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [20, -150 - (index % 4) * 30],
                x: [(index - 9) * 8, (index - 9) * 24],
                rotate: [0, index % 2 ? 180 : -180],
              }}
              transition={{ duration: 1.4, delay: (index % 6) * 0.05 }}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm bg-accent"
              style={{ left: `${10 + (index * 17) % 80}%` }}
            />
          ))}
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Memory Match</p>
          <p className="mt-1 text-sm opacity-60">Find all eight matching pairs.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm font-mono opacity-70">
            <span>Moves: {moves} · {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')}</span>
            {combo > 1 && <motion.span key={combo} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="ml-2 inline-block text-accent">COMBO ×{combo}</motion.span>}
          </div>
          <button
            type="button"
            onClick={sound.toggle}
            aria-label={sound.enabled ? 'Turn sound off' : 'Turn sound on'}
            aria-pressed={sound.enabled}
            className="rounded-full border border-ink/10 dark:border-white/10 p-2 text-accent"
          >
            {sound.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 dark:border-white/10 px-4 py-2 text-xs font-mono hover:border-accent hover:text-accent transition-colors"
          >
            <RotateCcw size={14} /> Restart
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 sm:gap-3 [perspective:1000px]">
        {cards.map((card, index) => {
          const isRevealed = flipped.includes(index) || matched.includes(card.pair);
          return (
            <button
              key={index}
              type="button"
              onClick={() => flipCard(index)}
              aria-label={isRevealed ? `Card ${card.symbol}` : `Reveal card ${index + 1}`}
              aria-pressed={isRevealed}
              className="relative aspect-square [transform-style:preserve-3d]"
            >
              <span className={`absolute inset-0 flex items-center justify-center rounded-2xl border text-2xl transition-all duration-500 [backface-visibility:hidden] sm:text-4xl ${
                isRevealed
                  ? 'border-accent bg-accent/10 shadow-[0_0_25px_rgba(212,175,55,.4)]'
                  : 'border-ink/10 bg-paper dark:border-white/10 dark:bg-white/5'
              }`} style={{ transform: isRevealed ? 'rotateY(180deg) translateZ(-4px)' : 'rotateY(0deg) translateZ(4px)' }}>
                ?
                <i aria-hidden="true" className={`memory-card-sweep absolute inset-0 ${isRevealed ? 'memory-card-sweep-active' : ''}`} />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center rounded-2xl border border-accent bg-accent/10 text-2xl shadow-[0_0_25px_rgba(212,175,55,.25)] transition-all duration-500 [backface-visibility:hidden] sm:text-4xl`}
                style={{ transform: isRevealed ? 'rotateY(0deg) translateZ(4px)' : 'rotateY(-180deg) translateZ(-4px)' }}
              >
                {card.symbol}
                <i aria-hidden="true" className={`memory-card-sweep absolute inset-0 ${isRevealed ? 'memory-card-sweep-active' : ''}`} />
              </span>
            </button>
          );
        })}
      </div>
      {isComplete && (
        <p className="mt-5 text-center font-serif text-lg text-accent">
          All pairs matched in {moves} moves. Well played!
        </p>
      )}
    </motion.div>
  );
}

function TicTacToe() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [nextMark, setNextMark] = useState('X');
  const winningLine = WINNING_LINES.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  const winner = winningLine ? board[winningLine[0]] : null;
  const isDraw = !winner && board.every(Boolean);
  const lineStyle = winningLine ? (() => {
    const startRow = Math.floor(winningLine[0] / 3);
    const endRow = Math.floor(winningLine[2] / 3);
    const startColumn = winningLine[0] % 3;
    const endColumn = winningLine[2] % 3;
    const deltaX = endColumn - startColumn;
    const deltaY = endRow - startRow;
    return {
      left: `${((startColumn + endColumn + 1) / 6) * 100}%`,
      top: `${((startRow + endRow + 1) / 6) * 100}%`,
      width: `${(Math.hypot(deltaX, deltaY) / 3) * 100}%`,
      x: '-50%',
      y: '-50%',
      rotate: Math.atan2(deltaY, deltaX) * (180 / Math.PI),
    };
  })() : undefined;
  const sound = useGameSound();

  const play = (index: number) => {
    if (board[index] || winner || isDraw) return;
    const nextBoard = [...board];
    nextBoard[index] = nextMark;
    setBoard(nextBoard);
    sound.play('tick');
    setNextMark(nextMark === 'X' ? 'O' : 'X');
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setNextMark('X');
  };

  return (
    <motion.div
      animate={winner ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.34 }}
      className="relative overflow-hidden rounded-3xl border border-ink/10 dark:border-white/10 bg-ink/5 dark:bg-white/5 p-5 sm:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Tic-Tac-Toe</p>
          <p className="mt-1 text-sm opacity-60">Two players, one board. Take turns on this device.</p>
        </div>
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={sound.toggle}
          aria-label={sound.enabled ? 'Turn sound off' : 'Turn sound on'}
          aria-pressed={sound.enabled}
          className="rounded-full border border-ink/10 dark:border-white/10 p-2 text-accent"
        >
          {sound.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 dark:border-white/10 px-4 py-2 text-xs font-mono hover:border-accent hover:text-accent transition-colors"
        >
          <RotateCcw size={14} /> New game
        </button>
        </div>
      </div>

      <p className="mb-4 text-center font-serif text-lg" aria-live="polite">
        {winner ? `Player ${winner} wins!` : isDraw ? "It's a draw!" : `Player ${nextMark}'s turn`}
      </p>
      <div className="relative mx-auto grid max-w-sm grid-cols-3 gap-2">
        {board.map((mark, index) => (
          <button
            key={index}
            type="button"
            onClick={() => play(index)}
            aria-label={`Square ${index + 1}${mark ? `, ${mark}` : ', empty'}`}
            className="aspect-square rounded-2xl border border-ink/10 dark:border-white/10 bg-paper dark:bg-white/5 text-4xl font-serif text-accent hover:border-accent/60 transition-colors"
          >
            <motion.span
              initial={false}
              animate={mark ? { opacity: 1, scale: 1, rotateX: 0, y: 0 } : { opacity: 0, scale: 0.7, rotateX: -75, y: -10 }}
              transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              className="inline-block"
            >
              {mark}
            </motion.span>
          </button>
        ))}
        {winningLine && (
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[3px] origin-center rounded-full bg-accent shadow-[0_0_14px_rgba(212,175,55,.95),0_0_28px_rgba(212,175,55,.8)]"
            style={lineStyle}
          />
        )}
      </div>
      {winner && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 14 }, (_, index) => (
            <motion.i
              key={index}
              initial={{ opacity: 0, y: 70, x: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [40, -130 - (index % 3) * 25],
                x: [(index - 7) * 6, (index - 7) * 22],
                rotate: [0, index % 2 ? 160 : -160],
              }}
              transition={{ duration: 1.25, delay: (index % 5) * 0.04 }}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-accent"
              style={{ left: `${10 + (index * 23) % 80}%` }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function Games({ mode }: { mode: GameMode }) {
  return mode === 'singleplayer' ? <MemoryMatch /> : <TicTacToe />;
}
