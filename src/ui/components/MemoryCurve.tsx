import {
  formatPercent,
  formatStability,
  memoryInsight,
  type MemoryPoint,
} from '@/domain/memory'
import { REQUEST_RETENTION } from '@/domain/srs'
import type { CardRecord } from '@/domain/types'

function axisLabel(hours: number): string {
  if (hours <= 0) return '现在'
  if (hours < 24) {
    const mins = Math.round(hours * 60)
    if (mins < 60) return `${Math.max(1, mins)}分`
    return `${Math.round(hours)}时`
  }
  const days = hours / 24
  if (Math.abs(days - Math.round(days)) < 0.05) return `${Math.round(days)}天`
  return `${days.toFixed(1)}天`
}

export function MemoryChart({
  points,
  horizonHours,
  dueHours,
  target = REQUEST_RETENTION,
}: {
  points: MemoryPoint[]
  horizonHours: number
  dueHours?: number
  target?: number
}) {
  const width = 320
  const height = 168
  const pad = { l: 36, r: 14, t: 18, b: 30 }
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const maxH = Math.max(1, horizonHours)
  const x = (hours: number) => pad.l + (Math.min(maxH, Math.max(0, hours)) / maxH) * innerW
  const y = (r: number) => pad.t + (1 - Math.min(1, Math.max(0, r))) * innerH
  const plotted = points.length ? points : [{ hours: 0, r: 0 }, { hours: maxH, r: 0 }]
  const line = plotted.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.hours).toFixed(1)} ${y(p.r).toFixed(1)}`).join(' ')
  const area = `${line} L ${x(plotted[plotted.length - 1].hours).toFixed(1)} ${y(0).toFixed(1)} L ${x(plotted[0].hours).toFixed(1)} ${y(0).toFixed(1)} Z`
  const ticks = [0, maxH / 2, maxH]
  const dueX = dueHours === undefined ? null : x(dueHours)
  const targetY = y(target)
  const duePoint = plotted.reduce(
    (best, p) => (Math.abs(p.hours - (dueHours ?? 0)) < Math.abs(best.hours - (dueHours ?? 0)) ? p : best),
    plotted[0],
  )

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="记忆曲线">
      <rect x="0" y="0" width={width} height={height} rx="18" fill="#fbf3e4" />
      <line x1={pad.l} y1={targetY} x2={width - pad.r} y2={targetY} stroke="#f2a93b" strokeDasharray="4 4" strokeWidth="1.2" />
      <text x={width - pad.r} y={targetY - 6} textAnchor="end" fontSize="10" fill="#c07a2e">
        维持 {Math.round(target * 100)}%
      </text>
      <path d={area} fill="#f4513b" opacity="0.14" />
      <path d={line} fill="none" stroke="#f4513b" strokeWidth="2.6" strokeLinejoin="round" />
      {dueX !== null ? (
        <>
          <line x1={dueX} y1={pad.t} x2={dueX} y2={height - pad.b} stroke="#5e9beb" strokeWidth="1.5" />
          <circle cx={dueX} cy={y(duePoint.r)} r="4.2" fill="#5e9beb" />
        </>
      ) : null}
      <circle cx={x(0)} cy={y(plotted[0].r)} r="4.2" fill="#f4513b" />
      {ticks.map((h) => (
        <text key={h} x={x(h)} y={height - 10} textAnchor={h === 0 ? 'start' : h === maxH ? 'end' : 'middle'} fontSize="10" fill="#91755e">
          {axisLabel(h)}
        </text>
      ))}
      <text x={8} y={pad.t + 4} fontSize="10" fill="#91755e">
        记得住
      </text>
    </svg>
  )
}

export function MemoryPanel({
  record,
  title = '记忆曲线',
}: {
  record: CardRecord
  title?: string
}) {
  const insight = memoryInsight(record)
  return (
    <div className="sticker-card p-4">
      <div className="font-display text-lg">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        曲线往下掉就是在遗忘。黄虚线是系统想帮你维持的 {formatPercent(insight.target)}；蓝线是下次出现的时间。
      </p>
      <div className="mt-3 overflow-hidden rounded-[18px]">
        <MemoryChart
          points={insight.points}
          horizonHours={insight.horizonHours}
          dueHours={insight.dueHours}
          target={insight.target}
        />
      </div>
      <div className="mt-3 rounded-2xl bg-butter/70 px-3 py-3 text-sm">
        <div className="font-semibold">下次复习 {insight.dueLabel}</div>
        <div className="mt-1 text-xs text-muted">
          那时预测还能想起约 {formatPercent(insight.rDue)}，所以现在把词排回来。
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="现在记得住" value={formatPercent(insight.rNow)} />
        <Metric label="稳定度" value={formatStability(insight.stabilityDays)} />
        <Metric label="难度" value={insight.difficulty.toFixed(1)} />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        稳定度越高，忘得越慢。难度越低，这个词对你越好记。数字来自这次对错，不是一张固定的遗忘表。
      </p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper-2 px-2 py-2">
      <div className="text-sm font-bold">{value}</div>
      <div className="mt-0.5 text-[10px] text-muted">{label}</div>
    </div>
  )
}
