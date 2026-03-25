import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
  blue: {
    border:  'border-blue-100',
    iconBg:  'bg-blue-500',
    iconShadow: 'shadow-blue-200',
    badge:   'bg-blue-50 text-blue-700',
  },
  emerald: {
    border:  'border-emerald-100',
    iconBg:  'bg-emerald-500',
    iconShadow: 'shadow-emerald-200',
    badge:   'bg-emerald-50 text-emerald-700',
  },
  violet: {
    border:  'border-violet-100',
    iconBg:  'bg-violet-500',
    iconShadow: 'shadow-violet-200',
    badge:   'bg-violet-50 text-violet-700',
  },
  amber: {
    border:  'border-amber-100',
    iconBg:  'bg-amber-500',
    iconShadow: 'shadow-amber-200',
    badge:   'bg-amber-50 text-amber-700',
  },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, subtitle }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  const isPositive = trend >= 0;

  return (
    <div
      className={[
        'flex flex-col rounded-xl border bg-white p-5 shadow-sm',
        'transition-shadow duration-200 hover:shadow-md',
        c.border,
      ].join(' ')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 text-3xl font-bold text-slate-800">
            {value?.toLocaleString() ?? '—'}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div
          className={[
            'flex-shrink-0 rounded-xl p-2.5 text-white shadow',
            c.iconBg,
            c.iconShadow,
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Trend badge */}
      {trend != null && (
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={[
              'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              isPositive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500',
            ].join(' ')}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
}
