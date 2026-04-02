function ErrorState({ message }) {
  return (
    <div className="glass-card border-rose-300/70 bg-rose-100/70 dark:border-rose-500/30 dark:bg-rose-500/10">
      <h3 className="font-display text-lg text-rose-700 dark:text-rose-300">Unable to load dashboard</h3>
      <p className="mt-2 text-sm text-rose-600 dark:text-rose-200">{message}</p>
    </div>
  );
}

export default ErrorState;
