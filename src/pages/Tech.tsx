import { Code2, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ContentPage } from '../components/ContentPage';
import PublicationEntries from '../components/PublicationEntries';

const topics = ['All topics', 'DevSecOps', 'CI/CD', 'Cloud security', 'Tooling'];

export default function Tech() {
  const [topic, setTopic] = useState('All topics');
  const [query, setQuery] = useState('');

  return (
    <ContentPage
      eyebrow="Field notes · 02"
      title="Tech, understood."
      description="A growing notebook of topics I am learning—explained in my own words, with practical notes and ideas worth revisiting."
    >
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-ink/10 bg-ink/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-ink/10 bg-paper px-4 dark:border-white/10 dark:bg-black/20">
          <Search size={16} className="shrink-0 text-accent" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search topics and notes"
            aria-label="Search tech topics"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-45"
          />
        </label>
        <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider opacity-50">
          <SlidersHorizontal size={13} /> Filter by topic
        </span>
      </div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by topic">
        {topics.map(item => (
          <button
            key={item}
            type="button"
            aria-pressed={topic === item}
            onClick={() => setTopic(item)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${
              topic === item
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-ink/10 opacity-55 hover:border-accent/40 hover:opacity-100 dark:border-white/10'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <PublicationEntries
        kind="tech"
        searchText={query}
        categoryFilter={topic === 'All topics' ? '' : topic}
      />
      <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] opacity-45">
        <Code2 size={14} className="text-accent" />
        <span>Beginner · Intermediate · Advanced</span>
        {query && <span className="ml-auto">Searching “{query}” in {topic.toLowerCase()}</span>}
      </div>
    </ContentPage>
  );
}
