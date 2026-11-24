import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      {/* Top-Center Toast Container */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2.5 pointer-events-none w-full max-w-md px-4">
        {toasts.map((t) => {
          let bgStyle = 'bg-slate-900 text-white border-slate-700'
          let icon = 'ℹ️'
          if (t.type === 'success') {
            bgStyle = 'bg-emerald-700 text-white border-emerald-600 shadow-emerald-900/30'
            icon = '✓'
          } else if (t.type === 'error') {
            bgStyle = 'bg-rose-700 text-white border-rose-600 shadow-rose-900/30'
            icon = '✕'
          } else if (t.type === 'warning') {
            bgStyle = 'bg-amber-600 text-white border-amber-500 shadow-amber-900/30'
            icon = '⚠️'
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold tracking-wide w-full transition-all duration-300 animate-slide-down ${bgStyle}`}
              role="alert"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-black flex-shrink-0">
                  {icon}
                </span>
                <span className="truncate break-words">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0 text-sm leading-none"
                aria-label="Close toast"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * High-fidelity Audible Alarm sound using Web Audio API synth chime.
 * Generates an audible 2-stage melodic chime without requiring external audio assets.
 */
export function playAlarmSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }

    // Melodic repeating chime pattern (A5, C#6, E6)
    playTone(880, 0, 0.3)
    playTone(1108.73, 0.15, 0.3)
    playTone(1318.51, 0.3, 0.5)
    playTone(880, 0.7, 0.3)
    playTone(1108.73, 0.85, 0.3)
    playTone(1318.51, 1.0, 0.6)
  } catch (err) {
    console.warn('AudioContext playback error:', err)
  }
}
