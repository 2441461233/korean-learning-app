import { Link } from 'react-router-dom'
import { HANGUL_LESSONS } from '@/data/hangul'
import { localDateKey, greeting } from '@/domain/dates'
import { buildSessionQueue, computeStreak } from '@/domain/session'
import { useBooks, useCards, useDailyStats, useHangulProgress, useSettings, useWords } from '@/db/hooks'
import { ProgressRing } from '@/ui/components/ProgressRing'
import { DoodleFlame, DoodleSquiggle, DoodleSparkles, IconArrowRight } from '@/ui/components/doodles'
import { Screen } from '@/ui/layout/AppShell'
import type { CardRecord } from '@/domain/types'

export function HomePage() {
  const words = useWords()
  const books = useBooks()
  const cards = useCards()
  const settings = useSettings()
  const stats = useDailyStats()
  const hangul = useHangulProgress()

  if (!words || !books || !cards || !stats || !hangul || !settings) {
    return (
      <Screen>
        <div className="text-muted">正在打开今日功课…</div>
      </Screen>
    )
  }

  const todayKey = localDateKey()
  const today = stats.find((s) => s.date === todayKey)
  const done = (today?.reviews ?? 0) + (today?.newCards ?? 0)
  const cardMap = new Map<string, CardRecord>(cards.map((c) => [c.wordId, c]))
  const session = buildSessionQueue({
    words,
    books,
    cards: cardMap,
    settings,
    today,
  })
  const streak = computeStreak(stats, todayKey)
  const hangulDone = HANGUL_LESSONS.every((l) => hangul.some((p) => p.lessonId === l.id && p.completed))
  const showHangul = !settings.hangulSkipped && !hangulDone
  const newCount = Math.max(0, Math.min(session.newAvailable, settings.newCardsPerDay - (today?.newCards ?? 0)))
  const reviewInQueue = session.reviews.length
  const newInQueue = session.news.length

  let cta = '开始学习'
  if (reviewInQueue && newInQueue) cta = `开始 · 先复习再新学 · ${session.queue.length} 张`
  else if (reviewInQueue) cta = `开始复习 · ${reviewInQueue} 张`
  else if (newInQueue) cta = `开始学新词 · ${newInQueue} 张`

  return (
    <Screen>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted">{greeting()}</div>
          <h1 className="font-display mt-1 text-3xl">今日单词</h1>
          <DoodleSquiggle className="mt-0.5 h-3 w-20 text-coral" />
        </div>
        <div className="sticker-card rotate-2 px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <DoodleFlame className={`h-5 w-5 ${streak > 0 ? 'text-coral' : 'text-muted/50'}`} />
            <span className="font-display text-lg leading-none text-coral">{streak}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted">连续打卡</div>
        </div>
      </div>

      <div className="sticker-card relative mt-5 flex items-center gap-4 p-5" style={{ rotate: '0.4deg' }}>
        <span className="tape tape-sky" style={{ top: -11, left: 20, rotate: '-7deg' }} />
        <ProgressRing value={done} max={settings.dailyGoal} label={`目标 ${settings.dailyGoal}`} />
        <div className="min-w-0 text-sm">
          <div className="font-semibold">先复习，再新学</div>
          <div className="mt-1 text-muted">到期词排在前面，先把要忘的捡回来。</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="sticker-card p-4" style={{ rotate: '-0.5deg' }}>
          <div className="text-xs text-muted">先复习</div>
          <div className="font-display mt-1 text-2xl text-sky">{session.dueCount}</div>
          <div className="mt-1 text-xs text-muted">到期词</div>
        </div>
        <div className="sticker-card p-4" style={{ rotate: '0.5deg' }}>
          <div className="text-xs text-muted">再新学</div>
          <div className="font-display mt-1 text-2xl text-coral">{newCount}</div>
          <div className="mt-1 text-xs text-muted">今日还可学</div>
        </div>
      </div>

      {showHangul ? (
        <Link to="/hangul" className="relative mt-4 block rounded-2xl bg-pink p-4 shadow-sticker" style={{ rotate: '-0.8deg' }}>
          <span className="tape tape-coral" style={{ top: -11, right: 24, left: 'auto', rotate: '6deg' }} />
          <div className="text-sm font-semibold">还没学完字母课</div>
          <div className="mt-1 text-sm text-ink/60">认识韩文再记单词，会轻松很多。</div>
        </Link>
      ) : null}

      {session.queue.length > 0 ? (
        <Link
          to="/study"
          className="btn-press mt-6 flex items-center justify-center gap-2 rounded-2xl bg-coral py-4 text-center text-lg font-semibold text-white"
        >
          {cta}
          <IconArrowRight className="h-5 w-5" />
        </Link>
      ) : (
        <div className="sticker-card mt-6 p-5 text-center" style={{ rotate: '0.6deg' }}>
          <DoodleSparkles className="mx-auto h-7 w-7 text-sun" />
          <div className="mt-2 font-display text-lg">{done >= settings.dailyGoal ? '今日目标达成' : '暂时没有到期卡片'}</div>
          <p className="mt-2 text-sm text-muted">可以再学一组，或去词书里打开更多内容。</p>
          <Link to="/study?extra=1" className="btn-press mt-4 inline-block rounded-2xl bg-coral px-5 py-3 font-semibold text-white">
            再学一组
          </Link>
        </div>
      )}
    </Screen>
  )
}
