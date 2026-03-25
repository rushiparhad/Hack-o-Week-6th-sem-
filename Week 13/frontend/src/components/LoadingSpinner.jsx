export default function LoadingSpinner() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <div className="relative h-14 w-14">
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        {/* Spinner */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-500" />
        {/* Inner pulse */}
        <div className="absolute inset-3 animate-pulse rounded-full bg-indigo-100" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600">Loading dashboard data</p>
        <p className="mt-0.5 text-xs text-slate-400">Decrypting and processing…</p>
      </div>
    </div>
  );
}
