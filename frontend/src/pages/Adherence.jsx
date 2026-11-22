import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'

export default function Adherence() {
  const { activeDependentId } = useAuth()
  const [summary, setSummary] = useState(null)
  const [weekly, setWeekly] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAdherence = async () => {
    try {
      setLoading(true)
      const params = {}
      if (activeDependentId) params.dependent_id = activeDependentId
      const [sumRes, weekRes] = await Promise.all([
        api.get('/adherence/summary', { params }),
        api.get('/adherence/weekly', { params })
      ])
      if (sumRes.data?.success) setSummary(sumRes.data.data)
      if (weekRes.data?.success) setWeekly(weekRes.data.data)
    } catch (err) {
      console.error('Failed to load adherence report:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdherence()
  }, [activeDependentId])

  if (loading && !summary) return <Spinner label="Generating adherence analytics..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medication Adherence Analytics"
        subtitle="Detailed compliance tracking, daily consistency streaks, and prescription-level adherence reports."
        actions={
          <button onClick={loadAdherence} className="btn-secondary">
            ↻ Refresh Report
          </button>
        }
      />

      {/* 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Adherence"
          value={`${summary?.overall_rate || 0}%`}
          sub="30-day compliance rate"
          color="teal"
          icon="📈"
        />
        <StatCard
          label="Consistent Streak"
          value={`${summary?.current_streak_days || 0} Days`}
          sub="unbroken daily regimen"
          color="emerald"
          icon="🔥"
        />
        <StatCard
          label="Doses Taken"
          value={summary?.taken_doses || 0}
          sub={`out of ${summary?.total_logged_doses || 0} doses`}
          color="blue"
          icon="✓"
        />
        <StatCard
          label="Skipped / Missed"
          value={(summary?.skipped_doses || 0) + (summary?.missed_doses || 0)}
          sub="unfulfilled doses"
          color="rose"
          icon="⚠️"
        />
      </div>

      {/* 7-Day Visual Progress */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Past 7 Days Adherence Performance</h2>
        <div className="grid grid-cols-7 gap-3 text-center">
          {weekly.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase text-slate-400 mb-2">{day.day_name}</span>
              <div className="w-full bg-slate-100 rounded-xl h-28 relative flex items-end overflow-hidden p-1">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    day.rate >= 80 ? 'bg-teal-500' : day.rate >= 50 ? 'bg-amber-400' : day.total_doses === 0 ? 'bg-slate-200' : 'bg-rose-400'
                  }`}
                  style={{ height: `${day.total_doses === 0 ? 0 : Math.max(12, day.rate)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2 font-mono">
                {day.total_doses === 0 ? '—' : `${day.rate}%`}
              </span>
              <span className="text-[10px] text-slate-400">
                {day.taken_doses}/{day.total_doses}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Medicine Breakdown Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Per-Medication Compliance Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Medicine</th>
                <th className="px-6 py-3">Dosage</th>
                <th className="px-6 py-3">Taken / Scheduled</th>
                <th className="px-6 py-3">Compliance Rate</th>
                <th className="px-6 py-3">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.medicine_breakdown?.map(med => (
                <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: med.color || '#0d9488' }}
                      />
                      <span>{med.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{med.dosage}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700">
                    {med.taken_doses} / {med.total_doses} doses
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full"
                          style={{ width: `${med.adherence_rate}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-800">{med.adherence_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <span className={med.is_low_stock ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                      {med.stock_count} units {med.is_low_stock && '(Low)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
