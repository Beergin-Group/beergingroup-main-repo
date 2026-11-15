import { useState, useEffect } from 'react'

export default function DoseCountdown({ targetTimeIso }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!targetTimeIso) {
      setTimeLeft('No upcoming dose')
      return
    }

    const update = () => {
      const now = new Date().getTime()
      const target = new Date(targetTimeIso).getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft('Due now')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${seconds}s`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetTimeIso])

  return (
    <span className="font-mono text-teal-600 font-bold tracking-tight">
      {timeLeft}
    </span>
  )
}
