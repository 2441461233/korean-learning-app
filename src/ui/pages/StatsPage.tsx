import { averageMemorySeries, formatPercent, formatStability } from '@/domain/memory'
import { localDateKey } from '@/domain/dates'
import { computeStreak } from '@/domain/session'
import { isNewCard, REQUEST_RETENTION, retrievability } from '@/domain/srs'
import { useCards, useDailyStats, useReviews, useWords } from '@/db/hooks'
import { MemoryChart, MemoryPanel } from '@/ui/components/MemoryCurve'
import { Screen } from '@/ui/layout/AppShell'

export function StatsPage() {
  const words = useWords()
  const cards = useCards()
  const stats = useDailyStats()
  const reviews = useReviews()

  if (!words || !cards || !stats || !reviews) {
    return (
      <Screen>
        <div className="text-muted">统计加载中…</div>
      </Screen>
    )
  }

  const now = new Date()
  const learned = cards.filter((c) => !isNewCard(c))
  const due = learned.filter((c) => c.due <= now.getTime()).length
  const answered = reviews.length
  const correct = reviews.filter((r) => r.quizCorrect).length
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0
  const streak = computeStreak(stats)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = localDateKey(d)
    const row = stats.find((s) => s.date === key)
    return {
      key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: (row?.reviews ?? 0) + (row?.newCards ?? 0),
    }
  })
  const max = Math.max(1, ...days.map((d) => d.count))
  const avgR = learned.length
    ? learned.reduce((sum, card) => sum + retrievability(card, now), 0) / learned.length
    : 0
  const avgStability = learned.length
    ? learned.reduce((sum, card) => sum + card.stability, 0) / learned.length
    : 0
  const avgDifficulty = learned.length
    ? learned.reduce((sum, card) => sum + card.difficulty, 0) / learned.length
    : 0
  const libraryPoints = averageMemorySeries(learned, now, 24 * 21)
  const latest = [...learned].sort((a, b) => (b.lastReview ?? 0) - (a.lastReview ?? 0))[0]

  return (
    <Screen>
      <h1 className="font-display text-2xl">学习统计</h1>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="已学习" value={String(learned.length)} />
        <Stat label="待复习" value={String(due)} />
        <Stat label="正确率" value={`${accuracy}%`} />
        <Stat label="连续打卡" value={String(streak)} />
      </div>

      <div className="sticker-card mt-5 p-4">
        <div className="font-display text-lg">词库记忆曲线</div>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          把你已学过的词平均起来：现在整体还能想起 {formatPercent(avgR)}。黄线是系统想维持的 {Math.round(REQUEST_RETENTION * 100)}%。
        </p>
        <div className="mt-3">
          <MemoryChart points={libraryPoints} horizonHours={24 * 21} target={REQUEST_RETENTION} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini label="平均记得住" value={formatPercent(avgR)} />
          <Mini label="平均稳定度" value={learned.length ? formatStability(avgStability) : '—'} />
          <Mini label="平均难度" value={learned.length ? avgDifficulty.toFixed(1) : '—'} />
        </div>
        <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted">
          <p>
            <span className="font-semibold text-ink">记得住</span>
            ：现在还能想起的概率。掉到大约 90% 时，这个词会回来复习。
          </p>
          <p>
            <span className="font-semibold text-ink">稳定度</span>
            ：记忆能撑多久。越高，忘得越慢，下次间隔越长。
          </p>
          <p>
            <span className="font-semibold text-ink">难度</span>
            ：这个词对你有多难。答错会升高，答对会慢慢降下来。
          </p>
        </div>
      </div>

      {latest ? <div className="mt-5"><MemoryPanel record={latest} title="最近学过的词" /></div> : (
        <p className="mt-5 text-sm text-muted">学过词之后，这里会画出你还记得多少，以及为什么那时会再见到它。</p>
      )}

      <div className="sticker-card mt-5 p-4">
        <div className="font-display text-lg">近 7 日完成</div>
        <div className="mt-4 flex h-32 items-end gap-2">
          {days.map((day) => (
            <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end rounded-full bg-cream">
                <div
                  className="w-full rounded-full bg-coral"
                  style={{ height: day.count ? `${Math.max(8, (day.count / max) * 100)}%` : '0%' }}
                />
              </div>
              <div className="text-[10px] text-muted">{day.label}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">词库共 {words.length} 词。数据只存在这台设备上。</p>
    </Screen>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="sticker-card p-4">
      <div className="font-display text-2xl">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper-2 px-2 py-2">
      <div className="text-sm font-bold">{value}</div>
      <div className="mt-0.5 text-[10px] text-muted">{label}</div>
    </div>
  )
}
