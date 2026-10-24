import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { GameMode } from '../lib/categories';
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

function shuffledDeck() {
  const deck = [...MEMORY_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function MemoryMatch() {
  const [cards, setCards] = useState(MEMORY_DECK);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

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
  };

  const flipCard = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].pair)) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);
    if (nextFlipped.length === 2) {
      setMoves(current => current + 1);
      if (cards[nextFlipped[0]].pair === cards[nextFlipped[1]].pair) {
        setMatched(current => [...current, cards[nextFlipped[0]].pair]);
        setFlipped([]);
      }
    }
  };

  const isComplete = matched.length === MEMORY_SYMBOLS.length;

  return (
    <div className="rounded-3xl border border-ink/10 dark:border-white/10 bg-ink/5 dark:bg-white/5 p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Memory Match</p>
          <p className="mt-1 text-sm opacity-60">Find all eight matching pairs.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono opacity-70">Moves: {moves}</span>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 dark:border-white/10 px-4 py-2 text-xs font-mono hover:border-accent hover:text-accent transition-colors"
          >
            <RotateCcw size={14} /> Restart
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card, index) => {
          const isRevealed = flipped.includes(index) || matched.includes(card.pair);
          return (
            <button
              key={index}
              type="button"
              onClick={() => flipCard(index)}
              aria-label={isRevealed ? `Card ${card.symbol}` : `Reveal card ${index + 1}`}
              aria-pressed={isRevealed}
              className={`aspect-square rounded-2xl border text-2xl sm:text-4xl transition-all ${
                isRevealed
                  ? 'border-accent/40 bg-accent/10'
                  : 'border-ink/10 dark:border-white/10 bg-paper dark:bg-white/5 hover:border-accent/60'
              }`}
            >
              {isRevealed ? card.symbol : '?'}
            </button>
          );
        })}
      </div>
      {isComplete && (
        <p className="mt-5 text-center font-serif text-lg text-accent">
          All pairs matched in {moves} moves. Well played!
        </p>
      )}
    </div>
  );
}

function TicTacToe() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [nextMark, setNextMark] = useState('X');
  const winner = WINNING_LINES
    .map(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c] ? board[a] : null)
    .find(Boolean);
  const isDraw = !winner && board.every(Boolean);

  const play = (index: number) => {
    if (board[index] || winner || isDraw) return;
    const nextBoard = [...board];
    nextBoard[index] = nextMark;
    setBoard(nextBoard);
    setNextMark(nextMark === 'X' ? 'O' : 'X');
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setNextMark('X');
  };

  return (
    <div className="rounded-3xl border border-ink/10 dark:border-white/10 bg-ink/5 dark:bg-white/5 p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Tic-Tac-Toe</p>
          <p className="mt-1 text-sm opacity-60">Two players, one board. Take turns on this device.</p>
        </div>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 dark:border-white/10 px-4 py-2 text-xs font-mono hover:border-accent hover:text-accent transition-colors"
        >
          <RotateCcw size={14} /> New game
        </button>
      </div>

      <p className="mb-4 text-center font-serif text-lg" aria-live="polite">
        {winner ? `Player ${winner} wins!` : isDraw ? "It's a draw!" : `Player ${nextMark}'s turn`}
      </p>
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
        {board.map((mark, index) => (
          <button
            key={index}
            type="button"
            onClick={() => play(index)}
            aria-label={`Square ${index + 1}${mark ? `, ${mark}` : ', empty'}`}
            className="aspect-square rounded-2xl border border-ink/10 dark:border-white/10 bg-paper dark:bg-white/5 text-4xl font-serif text-accent hover:border-accent/60 transition-colors"
          >
            {mark}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Games({ mode }: { mode: GameMode }) {
  return mode === 'singleplayer' ? <MemoryMatch /> : <TicTacToe />;
}
