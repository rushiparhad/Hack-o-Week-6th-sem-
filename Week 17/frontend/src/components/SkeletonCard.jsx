function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/20 bg-white/45 p-5 dark:border-slate-700/40 dark:bg-slate-900/45">
      <div className="h-3 w-28 rounded bg-slate-300/60 dark:bg-slate-700/80" />
      <div className="mt-3 h-8 w-24 rounded bg-slate-300/70 dark:bg-slate-700/80" />
      <div className="mt-3 h-3 w-32 rounded bg-slate-300/60 dark:bg-slate-700/70" />
    </div>
  );
}

export default SkeletonCard;
