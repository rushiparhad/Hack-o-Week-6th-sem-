import {
  LayoutDashboard,
  Activity,
  BarChart2,
  Users,
  Settings,
  LogOut,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Activity,        label: 'Activity',  active: false },
  { icon: BarChart2,       label: 'Analytics', active: false },
  { icon: Users,           label: 'Users',     active: false },
  { icon: Settings,        label: 'Settings',  active: false },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col',
          'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900',
          'shadow-2xl transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0 md:flex-shrink-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500 p-1.5 shadow-lg shadow-indigo-500/40">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              ActivityHub
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>
          <ul className="space-y-1">
            {navItems.map(({ icon: Icon, label, active }) => (
              <li key={label}>
                <button
                  className={[
                    'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                    'transition-all duration-200',
                    active
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:bg-white/[0.07] hover:text-white',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'h-5 w-5 flex-shrink-0',
                      active
                        ? 'text-white'
                        : 'text-slate-500 transition-colors group-hover:text-indigo-400',
                    ].join(' ')}
                  />
                  {label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-300" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User footer */}
        <div className="flex-shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-semibold text-white shadow">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Admin User</p>
              <p className="truncate text-xs text-slate-400">admin@company.com</p>
            </div>
          </div>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-all duration-200 hover:bg-red-400/10 hover:text-red-400">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
