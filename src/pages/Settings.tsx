import { ArrowUpRight, AtSign, BriefcaseBusiness, Code2, Mail, Phone, SunMoon, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentPage } from '../components/ContentPage';
import ThemeToggle from '../components/ThemeToggle';
import { getThemePreference, setThemePreference, type ThemePreference } from '../lib/theme';

const preferences: { id: ThemePreference; label: string; detail: string }[] = [
  { id: 'system', label: 'System', detail: 'Follow your device' },
  { id: 'light', label: 'Light', detail: 'Warm paper' },
  { id: 'dark', label: 'Dark', detail: 'Evening gallery' },
];

const contactItems = [
  { label: 'Email', detail: 'An easy way to say hello', Icon: Mail },
  { label: 'Phone', detail: 'Contact number', Icon: Phone },
  { label: 'Instagram', detail: 'Photos and small moments', Icon: AtSign },
  { label: 'LinkedIn', detail: 'Professional profile', Icon: BriefcaseBusiness },
  { label: 'GitHub', detail: 'Code and projects', Icon: Code2 },
];

export default function Settings() {
  const [preference, setPreference] = useState<ThemePreference>(() => getThemePreference());

  const chooseTheme = (next: ThemePreference) => {
    setThemePreference(next);
    setPreference(next);
  };

  return (
    <ContentPage
      eyebrow="Your corner · 05"
      title="Settings"
      description="A few ways to make this space feel like yours, and a quiet path to the artist behind it."
    >
      <section aria-labelledby="appearance-heading" className="mb-5 rounded-[1.75rem] border border-ink/10 bg-ink/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.025] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent">Appearance</p>
            <h2 id="appearance-heading" className="mt-2 font-serif text-2xl">Choose your atmosphere</h2>
            <p className="mt-1 text-xs opacity-55">Your preference is saved on this device.</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 text-accent"><SunMoon size={18} /></span>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-3" role="group" aria-label="Theme preference">
          {preferences.map(item => (
            <button
              key={item.id}
              type="button"
              aria-pressed={preference === item.id}
              onClick={() => chooseTheme(item.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                preference === item.id
                  ? 'border-accent/55 bg-accent/10'
                  : 'border-ink/10 hover:border-accent/30 dark:border-white/10'
              }`}
            >
              <span className={`block text-sm ${preference === item.id ? 'text-accent' : ''}`}>{item.label}</span>
              <span className="mt-1 block text-[10px] opacity-50">{item.detail}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-ink/8 pt-4 dark:border-white/8">
          <ThemeToggle className="h-9 w-9" />
          <p className="text-xs opacity-55">Quickly switch between light and dark.</p>
        </div>
      </section>

      <Link
        to="/settings/about"
        className="group mb-5 flex items-center justify-between gap-4 rounded-[1.75rem] border border-ink/10 p-5 transition-colors hover:border-accent/35 hover:bg-accent/[0.03] dark:border-white/10 sm:p-7"
      >
        <span className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent"><UserRound size={19} /></span>
          <span>
            <span className="block font-serif text-xl">About the artist</span>
            <span className="mt-1 block text-xs opacity-55">Profile, works, interests, and contact details</span>
          </span>
        </span>
        <ArrowUpRight size={18} className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>

      <section className="rounded-[1.75rem] border border-ink/10 p-5 dark:border-white/10 sm:p-7">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent">Ways to connect</p>
        <h2 className="mt-2 font-serif text-2xl">The profile can grow here.</h2>
        <p className="mt-2 text-xs leading-relaxed opacity-55">These contact fields are ready for the artist’s chosen public details.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {contactItems.map(({ label, detail, Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-ink/[0.025] p-3 dark:bg-white/[0.03]">
              <Icon size={16} className="shrink-0 text-accent" />
              <span>
                <span className="block text-xs">{label}</span>
                <span className="block text-[10px] opacity-45">{detail}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <Link to="/admin" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] opacity-45 transition hover:bg-ink/5 hover:text-accent hover:opacity-100 dark:hover:bg-white/5">
          Owner portal <ArrowUpRight size={13} />
        </Link>
      </div>
    </ContentPage>
  );
}
