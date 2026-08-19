import { DoodleStar } from './doodles'

export function ProgressRing({
  value,
  max,
  label,
}: {
  value: number
  max: number
  label: string
}) {
  const pct = max <= 0 ? 0 : Math.min(1, value / max)
  const r = 40
  const c = 2 * Math.PI * r
  const done = pct >= 1
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1e5cf" strokeWidth={13} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={done ? '#5fae67' : '#f4513b'}
          strokeWidth={13}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          className="transition-[stroke-dasharray] duration-500"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgb(255 255 255 / 0.35)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="1.5 9"
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl leading-none">{Math.min(value, max)}</div>
        <div className="mt-1 text-[11px] text-muted">{label}</div>
      </div>
      {done ? (
        <DoodleStar className="animate-sparkle-pop absolute -right-1 -top-1 h-6 w-6 text-sun" />
      ) : null}
    </div>
  )
}
