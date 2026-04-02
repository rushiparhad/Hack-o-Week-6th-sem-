function LoadingState() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="glass-card animate-pulse">
          <div className="h-3 w-28 rounded bg-slate-200/80 dark:bg-white/10" />
          <div className="mt-3 h-8 w-40 rounded bg-slate-300/80 dark:bg-white/15" />
          <div className="mt-3 h-3 w-24 rounded bg-slate-200/80 dark:bg-white/10" />
        </div>
      ))}
    </section>
  );
}

export default LoadingState;
