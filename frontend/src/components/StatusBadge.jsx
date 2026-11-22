export default function StatusBadge({ status, label }) {
  const STYLES = {
    taken:        'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    upcoming:     'bg-sky-50 text-sky-700 border-sky-200/60',
    pending:      'bg-amber-50 text-amber-700 border-amber-200/60',
    skipped:      'bg-rose-50 text-rose-700 border-rose-200/60',
    in_stock:     'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    low_stock:    'bg-amber-50 text-amber-700 border-amber-200/60',
    out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200/60',
    active:       'bg-teal-50 text-teal-700 border-teal-200/60',
  }

  const LABELS = {
    taken:        'Taken',
    upcoming:     'Upcoming',
    pending:      'Pending',
    skipped:      'Skipped',
    in_stock:     'In Stock',
    low_stock:    'Low Stock',
    out_of_stock: 'Out of Stock',
    active:       'Active',
  }

  const s = status?.toLowerCase() || 'pending'
  const style = STYLES[s] || 'bg-slate-50 text-slate-700 border-slate-200'
  const text = label || LABELS[s] || status

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {text}
    </span>
  )
}
