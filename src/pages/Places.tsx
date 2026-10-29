import { ArrowUpRight, MapPin, MapPinned, Utensils, Compass } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { ContentPage } from '../components/ContentPage';
import PublicationEntries from '../components/PublicationEntries';
import { useState, type FormEvent } from 'react';

const placeTabs = [
  { to: '/places/food', label: 'Food & Cafes', Icon: Utensils },
  { to: '/places/travel', label: 'Travel', Icon: Compass },
];

export default function Places() {
  const location = useLocation();
  const isTravel = location.pathname.endsWith('/travel');
  const [mapQuery, setMapQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const handleMapSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = mapQuery.trim();
    if (!query) return;
    setSubmittedQuery(query);
  };

  return (
    <ContentPage
      eyebrow="Places remembered · 03"
      title={isTravel ? 'A little further.' : 'Good things, found.'}
      description={isTravel
        ? 'Destinations, small discoveries, and notes from the places that stay with me.'
        : 'Cafes, meals, and local finds—with the details that make a place worth remembering.'}
    >
      <nav aria-label="Place collections" className="mb-8 inline-flex rounded-full border border-ink/10 bg-ink/[0.025] p-1 dark:border-white/10 dark:bg-white/[0.025]">
        {placeTabs.map(({ to, label, Icon }) => {
          const active = to.endsWith(isTravel ? 'travel' : 'food');
          return (
            <NavLink
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs transition-colors sm:px-5 ${
                active ? 'bg-accent text-white shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Icon size={15} /> {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative flex min-h-64 flex-col justify-between overflow-hidden rounded-[1.75rem] border border-accent/20 bg-[radial-gradient(ellipse_at_55%_45%,rgba(212,175,55,0.16),transparent_58%),linear-gradient(135deg,rgba(212,175,55,0.05),transparent)] p-6 sm:min-h-72 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(0deg,transparent_24%,rgba(133,101,13,.08)_25%,rgba(133,101,13,.08)_26%,transparent_27%,transparent_74%,rgba(133,101,13,.08)_75%,rgba(133,101,13,.08)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(133,101,13,.08)_25%,rgba(133,101,13,.08)_26%,transparent_27%,transparent_74%,rgba(133,101,13,.08)_75%,rgba(133,101,13,.08)_76%,transparent_77%)] [background-size:46px_46px]" />
          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-paper/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent dark:bg-black/20">
              <MapPinned size={13} /> Google Maps
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider opacity-45">Search & save places</span>
          </div>
          <div aria-hidden="true" className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-accent/25 bg-paper/65 text-accent shadow-[0_0_70px_rgba(212,175,55,.12)] dark:bg-black/30">
            <span className="absolute h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_rgba(212,175,55,.9)]" />
            <span className="absolute inset-3 rounded-full border border-dashed border-accent/20" />
            <MapPin size={22} />
          </div>
          <form onSubmit={handleMapSearch} className="relative mt-5">
            <label htmlFor="place-map-query" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
              {isTravel ? 'Find a destination' : 'Find a cafe or restaurant'}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="place-map-query"
                type="search"
                value={mapQuery}
                onChange={(event) => setMapQuery(event.target.value)}
                maxLength={120}
                placeholder={isTravel ? 'City, landmark, or region' : 'Cafe, restaurant, or area'}
                className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20 dark:border-white/10 dark:bg-black/20"
              />
              <button
                type="submit"
                disabled={!mapQuery.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Search Google Maps <ArrowUpRight size={14} />
              </button>
            </div>
            {submittedQuery && (
              <p className="mt-3 text-xs leading-relaxed">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(submittedQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                >
                  Search Google Maps for “{submittedQuery}” <ArrowUpRight size={12} />
                </a>
              </p>
            )}
          </form>
          <p className="relative mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] leading-relaxed opacity-55">
            <span>Open the result in Google Maps and use Save to add it to one of your Maps lists.</span>
          </p>
        </div>
        <div className="flex flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-ink/[0.025] p-6 dark:border-white/10 dark:bg-white/[0.025] sm:p-8">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent">{isTravel ? 'On the way' : 'At the table'}</p>
            <h2 className="mt-4 font-serif text-2xl">{isTravel ? 'Journeys & little detours' : 'Cafes & things to taste'}</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-55">
              {isTravel
                ? 'Dates, destination notes, practical tips, and photo memories.'
                : 'Cuisine, location, a rating, price range, and the dish I would order again.'}
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider opacity-45">
            <MapPin size={13} className="text-accent" /> Coordinates and place galleries
          </div>
        </div>
      </div>

      <PublicationEntries kind={isTravel ? 'travel' : 'food'} />
    </ContentPage>
  );
}
