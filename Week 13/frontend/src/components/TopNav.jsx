import { Bell, Search, Menu, RefreshCw } from 'lucide-react';

export default function TopNav({ onMenuClick, onRefresh, loading }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-800 sm:text-lg">
            Dashboard Overview
          </h1>
          <p className="hidden text-xs text-slate-400 sm:block">{today}</p>
        </div>
      </div>

      {/* Right: search, refresh, notifications, avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search — desktop only */}
        <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-44 bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-50"
          title="Refresh data"
          aria-label="Refresh data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-semibold text-white shadow">
          AD
        </div>
      </div>
    </header>
  );
}
