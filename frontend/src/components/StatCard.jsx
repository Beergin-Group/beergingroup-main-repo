export default function StatCard({ label, value, sub, color = 'teal', icon }) {
  const COLOR_MAP = {
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100' },
    blue:   { bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-100' },
    emerald:{ bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
    rose:   { bg: 'bg-rose-50',   text: 'text-rose-600',   border: 'border-rose-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  }
  const theme = COLOR_MAP[color] || COLOR_MAP.teal

  return (
    <div className={`card p-5 border ${theme.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.bg} ${theme.text}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
      </div>
    </div>
  )
}
