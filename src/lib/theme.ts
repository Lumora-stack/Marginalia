export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

export function getThemePreference(): ThemePreference {
  const preference = localStorage.getItem(THEME_STORAGE_KEY);
  return preference === 'dark' || preference === 'light' ? preference : 'system';
}

export function setThemePreference(preference: ThemePreference) {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyThemePreference(preference);
}

export function applyThemePreference(preference: ThemePreference) {
  const isDark = preference === 'dark' ||
    (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0C0C0E' : '#F7F5F1');
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', isDark ? 'dark' : 'light');
}
