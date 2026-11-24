import { useState, useEffect, useRef } from 'react'

export function parseDoseTargetTime(targetTimeIso) {
  if (!targetTimeIso) return null
  // Extract HH:mm regardless of whether it's ISO UTC string or HH:mm
  const now = new Date()
  let hours = 0
  let minutes = 0

  if (targetTimeIso.includes('T')) {
    const timePart = targetTimeIso.split('T')[1].substring(0, 5)
    const parts = timePart.split(':').map(Number)
    hours = parts[0]
    minutes = parts[1]
  } else if (/^\d{2}:\d{2}$/.test(targetTimeIso)) {
    const parts = targetTimeIso.split(':').map(Number)
    hours = parts[0]
    minutes = parts[1]
  } else {
    return new Date(targetTimeIso)
  }

  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
}

export default function DoseCountdown({ targetTimeIso, onAlarm }) {
  const [timeLeft, setTimeLeft] = useState('')
  const alarmTriggeredRef = useRef(false)

  useEffect(() => {
    alarmTriggeredRef.current = false
    if (!targetTimeIso) {
      setTimeLeft('No upcoming dose')
      return
    }

    const targetDate = parseDoseTargetTime(targetTimeIso)
    if (!targetDate) {
      setTimeLeft('Invalid time')
      return
    }

    const update = () => {
      const now = new Date().getTime()
      const diff = targetDate.getTime() - now

      if (diff <= 0) {
        setTimeLeft('Due now')
        if (onAlarm && !alarmTriggeredRef.current) {
          alarmTriggeredRef.current = true
          onAlarm()
        }
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
  }, [targetTimeIso, onAlarm])

  return (
    <span className="font-mono text-teal-600 font-bold tracking-tight">
      {timeLeft}
    </span>
  )
}
