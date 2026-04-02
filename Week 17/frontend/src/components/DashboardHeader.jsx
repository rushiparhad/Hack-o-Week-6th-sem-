import { Activity, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

function DashboardHeader({ user, theme, onToggleTheme, onLogout }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/50 p-6 backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/50">
      <div>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-lg shadow-cyan-500/30">
            <Activity size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Secure Analytics Suite
            </p>
            <h1 className="font-display text-2xl font-black text-slate-900 dark:text-slate-50">
              User Data Export & Analytics
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="rounded-full border border-white/40 bg-white/60 px-4 py-2 text-sm dark:border-slate-700/50 dark:bg-slate-900/60">
          <span className="text-slate-500 dark:text-slate-300">{user?.role}</span>
          <span className="mx-2 text-slate-400">|</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.name}</span>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full border border-rose-300/50 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-200"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
