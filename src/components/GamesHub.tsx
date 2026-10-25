import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, Clock3, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import TiltedCard from './TiltedCard';

type MemoryRecord = { time: number; moves: number };
type TicScores = { X: number; O: number; draws: number };

const MEMORY_RECORDS_KEY = 'artville-memory-records-v1';
const TIC_SCORES_KEY = 'artville-tic-tac-toe-scores-v1';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? { ...fallback, ...JSON.parse(value) } : fallback;
  } catch {
    return fallback;
  }
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function MemoryPreview() {
  return (
    <div aria-hidden="true" className="games-memory-preview">
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className={`games-preview-card games-preview-card-${index + 1}`}>
          {index === 1 || index === 7 ? '✦' : ''}
        </span>
      ))}
    </div>
  );
}

function TicPreview() {
  return (
    <svg aria-hidden="true" viewBox="0 0 180 180" className="games-tic-preview">
      <path className="games-tic-grid" d="M60 12v156M120 12v156M12 60h156M12 120h156" />
      <path className="games-tic-mark games-tic-x games-tic-x-one" d="m24 24 28 28m0-28L24 52" />
      <path className="games-tic-mark games-tic-o games-tic-o-one" d="M145 38a14 14 0 1 1-28 0 14 14 0 0 1 28 0Z" />
      <path className="games-tic-mark games-tic-x games-tic-x-two" d="m84 84 28 28m0-28L84 112" />
      <path className="games-tic-mark games-tic-o games-tic-o-two" d="M55 145a14 14 0 1 1-28 0 14 14 0 0 1 28 0Z" />
      <path className="games-tic-win-line" d="M38 18v144" />
    </svg>
  );
}

function GamesModeCard({
  mode,
  children,
  players,
  detail,
  record,
  desktopTilt,
}: {
  mode: 'singleplayer' | 'multiplayer';
  children: ReactNode;
  players: string;
  detail: string;
  record: string;
  desktopTilt: boolean;
}) {
  const isSingle = mode === 'singleplayer';
  const href = `/section/games/${mode}`;
  const content = (
    <Link
      to={href}
      className="games-mode-link group flex h-full min-h-[410px] flex-col rounded-[inherit] border border-accent/20 bg-paper p-6 text-ink transition-colors hover:border-accent/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:bg-[#111113] dark:text-[#f0ede6] sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {isSingle ? '01 · Singleplayer' : '02 · Multiplayer'}
        </span>
        <ArrowRight aria-hidden="true" size={18} className="shrink-0 text-accent transition-transform group-hover:translate-x-1" />
      </div>

      <div className="my-6 flex min-h-[138px] flex-1 items-center justify-center rounded-2xl border border-accent/15 bg-accent/[0.045] p-4 transition-shadow group-hover:shadow-[0_0_32px_rgba(154,123,31,0.14)] dark:bg-black/20">
        {children}
      </div>

      <h2 className="room-signature-games text-2xl tracking-tight sm:text-3xl">
        {isSingle ? 'Memory Match' : 'Tic-Tac-Toe'}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed opacity-70">
        {isSingle
          ? 'Flip cards, find every pair, beat your best time.'
          : 'Two players, one screen. Claim three in a row.'}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider dark:border-white/10">
          <UsersRound size={12} className="text-accent" /> {players}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider dark:border-white/10">
          <Clock3 size={12} className="text-accent" /> {detail}
        </span>
        <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider dark:border-white/10">
          Best: {record}
        </span>
      </div>

      <span className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-transform group-active:scale-[0.98]">
        Play <ArrowRight size={15} />
      </span>
    </Link>
  );

  return (
    <div className="h-[480px]">
      {desktopTilt ? (
        <TiltedCard
          containerHeight="100%"
          containerWidth="100%"
          imageHeight="100%"
          imageWidth="100%"
          rotateAmplitude={4}
          scaleOnHover={1.015}
          glare={0.14}
          shadow={0.18}
          parallax={0}
          gyroscope={false}
          intro={false}
          showTooltip={false}
          className="h-full w-full"
        >
          {content}
        </TiltedCard>
      ) : content}
    </div>
  );
}

export default function GamesHub() {
  const [desktopTilt, setDesktopTilt] = useState(() =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  const [memoryRecords] = useState<Record<string, MemoryRecord>>(() =>
    readStorage(MEMORY_RECORDS_KEY, {}),
  );
  const [ticScores] = useState<TicScores>(() =>
    readStorage(TIC_SCORES_KEY, { X: 0, O: 0, draws: 0 }),
  );

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setDesktopTilt(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const memoryRecord = Object.values(memoryRecords).reduce<MemoryRecord | null>((best, current) => {
    if (!best || current.time < best.time || (current.time === best.time && current.moves < best.moves)) return current;
    return best;
  }, null);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 items-stretch gap-[var(--content-gap)] md:grid-cols-2">
        <GamesModeCard
          mode="singleplayer"
          players="1 Player"
          detail="Easy · Medium · Hard"
          record={memoryRecord ? `${formatTime(memoryRecord.time)} · ${memoryRecord.moves} moves` : 'No record yet'}
          desktopTilt={desktopTilt}
        >
          <MemoryPreview />
        </GamesModeCard>
        <GamesModeCard
          mode="multiplayer"
          players="2 Players"
          detail="~2 min"
          record={`X ${ticScores.X} · O ${ticScores.O} · Draw ${ticScores.draws}`}
          desktopTilt={desktopTilt}
        >
          <TicPreview />
        </GamesModeCard>
      </div>
    </div>
  );
}
