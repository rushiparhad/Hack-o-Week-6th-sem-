import { MoonStar, Sun } from 'lucide-react';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-100"
    >
      {theme === 'dark' ? <Sun size={16} /> : <MoonStar size={16} />}
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}

export default ThemeToggle;
