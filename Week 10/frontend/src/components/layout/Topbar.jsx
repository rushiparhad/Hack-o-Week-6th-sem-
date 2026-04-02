import { Download } from "lucide-react";
import { getExportUrl } from "../../api/sustainabilityApi";
import ThemeToggle from "../ui/ThemeToggle";

function Topbar() {
  const handleExport = () => {
    const url = getExportUrl({});
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <header className="glass-card flex flex-wrap items-center justify-between gap-3 !p-4">
      <div>
        <h1 className="font-display text-xl text-slate-800 dark:text-slate-100">Campus-Wide Sustainability Tracker</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Predictive analytics for carbon, energy, water, and waste.</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default Topbar;
