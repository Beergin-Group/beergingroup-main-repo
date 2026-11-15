export default function Spinner({ label = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
    </div>
  )
}
