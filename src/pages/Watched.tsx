import { Film, SlidersHorizontal, Star } from 'lucide-react';
import { useState } from 'react';
import { ContentPage, EmptyCollection } from '../components/ContentPage';

const genres = ['All genres', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Animation'];

export default function Watched() {
  const [genre, setGenre] = useState('All genres');

  return (
    <ContentPage
      eyebrow="The watchlist · 04"
      title="Watched, remembered."
      description="Films and series worth talking about: the stories, the feeling after the credits, and whether I would watch them again."
    >
      <div className="mb-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] opacity-50">
        <SlidersHorizontal size={14} className="text-accent" /> Browse by genre
      </div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by genre">
        {genres.map(item => (
          <button
            key={item}
            type="button"
            aria-pressed={genre === item}
            onClick={() => setGenre(item)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${
              genre === item
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-ink/10 opacity-55 hover:border-accent/40 hover:opacity-100 dark:border-white/10'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <EmptyCollection
        number="04"
        title="A screen-side collection."
        description="Movie and series posters, genres, ratings, rewatch notes, and spoiler-safe reviews will live here. No sample titles are shown as personal reviews."
      />
      <div className="mt-6 flex flex-wrap items-center gap-5 text-[10px] opacity-45">
        <span className="inline-flex items-center gap-2"><Film size={14} className="text-accent" /> Movies & series</span>
        <span className="inline-flex items-center gap-2"><Star size={14} className="text-accent" /> Personal ratings</span>
        {genre !== 'All genres' && <span>Showing: {genre}</span>}
      </div>
    </ContentPage>
  );
}
