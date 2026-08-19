import { Link } from 'react-router-dom'
import { HANGUL_LESSONS } from '@/data/hangul'
import { useHangulProgress } from '@/db/hooks'
import { DoodleSquiggle, IconArrowRight, IconCheck } from '@/ui/components/doodles'
import { Screen } from '@/ui/layout/AppShell'

const CHIPS = ['bg-mint', 'bg-butter', 'bg-pink', 'bg-skyblue', 'bg-lilac']

export function HangulIndexPage() {
  const progress = useHangulProgress() ?? []
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))
  const finished = HANGUL_LESSONS.every((l) => done.has(l.id))

  return (
    <Screen>
      <div className="mb-1 text-sm text-muted">入门</div>
      <h1 className="font-display text-3xl">韩文字母课</h1>
      <DoodleSquiggle className="mt-0.5 h-3 w-20 text-coral" />
      <p className="mt-2 text-sm text-muted">14 个基本辅音、10 个基本元音，再学会拼音节和韵尾。</p>
      <div className="mt-5 space-y-3">
        {HANGUL_LESSONS.map((lesson, i) => {
          const ok = done.has(lesson.id)
          return (
            <Link
              key={lesson.id}
              to={`/hangul/${lesson.id}`}
              className="sticker-card block p-4 transition-transform hover:-translate-y-0.5"
              style={{ rotate: `${i % 2 === 0 ? -0.4 : 0.4}deg` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`chip-washi shrink-0 ${CHIPS[i % CHIPS.length]}`}>第 {lesson.order} 课</span>
                  <div className="min-w-0">
                    <div className="text-lg font-semibold">{lesson.title}</div>
                    <div className="text-sm text-muted">{lesson.subtitle}</div>
                  </div>
                </div>
                {ok ? (
                  <span className="chip-washi shrink-0 bg-mint">
                    <IconCheck className="h-3.5 w-3.5" />
                    已完成
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-coral">
                    开始
                    <IconArrowRight className="h-4 w-4" />
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
      {finished ? (
        <Link to="/" className="btn-press mt-6 block rounded-2xl bg-coral py-4 text-center font-semibold text-white">
          开始学单词
        </Link>
      ) : (
        <Link to="/" className="mt-6 block text-center text-sm text-muted">
          先跳过，去学单词
        </Link>
      )}
    </Screen>
  )
}
