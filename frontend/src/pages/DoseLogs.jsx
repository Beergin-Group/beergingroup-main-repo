import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString

    // Extract time component cleanly
    let timeStr = ''
    if (isoString.includes('T')) {
      const timePart = isoString.split('T')[1].substring(0, 5)
      const [h, m] = timePart.split(':').map(Number)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const formattedH = h % 12 || 12
      timeStr = `${formattedH}:${m < 10 ? '0' + m : m} ${ampm}`
    } else {
      timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    return `${dateStr} · ${timeStr}`
  } catch (e) {
    return isoString
  }
}

export default function DoseLogs() {
  const { activeDependentId } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params = {}
      if (activeDependentId) params.dependent_id = activeDependentId
      const res = await api.get('/dose-logs/history', { params })
      if (res.data?.success) {
        setLogs(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [activeDependentId])

  const filtered = logs.filter(l => {
    if (statusFilter === 'all') return true
    return l.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dose History & Audit Log"
        subtitle="Complete record of all taken, skipped, and pending doses over time."
        actions={
          <button onClick={loadLogs} className="btn-secondary">
            ↻ Refresh Log
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {['all', 'taken', 'skipped', 'pending'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              statusFilter === st
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st} ({logs.filter(l => st === 'all' || l.status === st).length})
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading history records..." />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <span className="text-3xl block mb-2">📜</span>
          <p className="text-base font-semibold text-slate-600">No dose records found</p>
          <p className="text-xs mt-1">Dose events will appear here once you take or log your medications.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Scheduled Time</th>
                  <th className="px-6 py-3">Medicine</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Recorded At</th>
                  <th className="px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800 text-xs whitespace-nowrap">
                      {formatDateTime(log.scheduled_time)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: log.color || '#0d9488' }}
                        />
                        <span className="font-bold text-slate-900">{log.medicine_name}</span>
                        <span className="text-xs text-slate-400">({log.dosage})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200/60">
                          <span className="animate-pulse">⏳</span> Pending
                        </span>
                      ) : (
                        <StatusBadge status={log.status} />
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {log.recorded_at ? formatDateTime(log.recorded_at) : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {log.notes || <span className="text-slate-300 italic">No notes</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
