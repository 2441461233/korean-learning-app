import { formatInterval } from './dates'
import { REQUEST_RETENTION, retrievability } from './srs'
import type { CardRecord } from './types'

export interface MemoryPoint {
  hours: number
  r: number
}

export interface MemoryInsight {
  points: MemoryPoint[]
  horizonHours: number
  rNow: number
  rDue: number
  dueHours: number
  dueLabel: string
  stabilityDays: number
  difficulty: number
  target: number
}

export function dueHoursFromNow(record: CardRecord, now = new Date()): number {
  return (record.due - now.getTime()) / 3_600_000
}

export function memoryHorizonHours(record: CardRecord, now = new Date()): number {
  const dueH = Math.max(0, dueHoursFromNow(record, now))
  if (dueH <= 24) return 48
  if (dueH <= 24 * 7) return 24 * 14
  if (dueH <= 24 * 21) return 24 * 21
  return Math.min(24 * 60, Math.ceil((dueH + 24 * 7) / 24) * 24)
}

function sampleHours(horizonHours: number): number[] {
  if (horizonHours <= 48) return [0, 0.5, 1, 2, 4, 6, 12, 18, 24, 36, 48].filter((h) => h <= horizonHours)
  if (horizonHours <= 24 * 14) {
    const hours = [0, 6, 12, 24]
    for (let d = 2; d <= horizonHours / 24; d += 1) hours.push(d * 24)
    return hours
  }
  const hours = [0, 24]
  for (let d = 2; d <= horizonHours / 24; d += 1) hours.push(d * 24)
  return hours
}

export function memorySeries(
  record: CardRecord,
  now = new Date(),
  horizonHours = memoryHorizonHours(record, now),
): MemoryPoint[] {
  return sampleHours(horizonHours).map((hours) => ({
    hours,
    r: retrievability(record, new Date(now.getTime() + hours * 3_600_000)),
  }))
}

export function averageMemorySeries(
  records: CardRecord[],
  now = new Date(),
  horizonHours = 24 * 21,
): MemoryPoint[] {
  if (records.length === 0) return sampleHours(horizonHours).map((hours) => ({ hours, r: 0 }))
  return sampleHours(horizonHours).map((hours) => {
    const when = new Date(now.getTime() + hours * 3_600_000)
    const sum = records.reduce((acc, record) => acc + retrievability(record, when), 0)
    return { hours, r: sum / records.length }
  })
}

export function memoryInsight(record: CardRecord, now = new Date()): MemoryInsight {
  const horizonHours = memoryHorizonHours(record, now)
  const dueH = dueHoursFromNow(record, now)
  return {
    points: memorySeries(record, now, horizonHours),
    horizonHours,
    rNow: retrievability(record, now),
    rDue: retrievability(record, new Date(record.due)),
    dueHours: dueH,
    dueLabel: record.due <= now.getTime() ? '已经到期' : formatInterval(now, new Date(record.due)),
    stabilityDays: record.stability,
    difficulty: record.difficulty,
    target: REQUEST_RETENTION,
  }
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${Math.round(value * 100)}%`
}

export function formatStability(days: number): string {
  if (!Number.isFinite(days) || days <= 0) return '刚开始记'
  if (days < 1) return `${Math.max(1, Math.round(days * 24))} 小时`
  if (days < 10) return `${days.toFixed(1)} 天`
  return `${Math.round(days)} 天`
}
