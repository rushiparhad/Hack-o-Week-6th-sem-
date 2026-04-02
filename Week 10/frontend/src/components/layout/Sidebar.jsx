import { BarChart3, BrainCircuit, Building2, FileText, Radar } from "lucide-react";

const links = [
  { label: "Overview", icon: Radar },
  { label: "Analytics", icon: BarChart3 },
  { label: "Buildings", icon: Building2 },
  { label: "Insights", icon: BrainCircuit },
  { label: "Reports", icon: FileText },
];

function Sidebar({ score }) {
  return (
    <aside className="mx-4 mt-4 rounded-2xl border border-white/25 bg-white/60 p-5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:mx-0 lg:mt-0 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:p-6">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 shadow-[0_0_20px_rgba(16,185,129,0.65)]" />
        <div>
          <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">Campus Tracker</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sustainability Intelligence</p>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <div
              key={link.label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                idx === 0
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </div>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-emerald-300/40 bg-emerald-100/60 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Sustainability Score</p>
        <p className="mt-2 font-display text-2xl text-emerald-900 dark:text-emerald-200">{score}/100</p>
        <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">Ensemble model score with real-time anomaly checks</p>
      </div>
    </aside>
  );
}

export default Sidebar;
