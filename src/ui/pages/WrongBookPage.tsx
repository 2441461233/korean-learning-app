import { Link } from 'react-router-dom'
import { useCards, useWords } from '@/db/hooks'
import { isWrongWord } from '@/domain/session'
import { DoodleHeart, DoodleSquiggle, IconArrowRight, IconBandage } from '@/ui/components/doodles'
import { Screen } from '@/ui/layout/AppShell'

export function WrongBookPage() {
  const words = useWords()
  const cards = useCards()

  if (!words || !cards) {
    return (
      <Screen>
        <div className="text-muted">载入错题…</div>
      </Screen>
    )
  }

  const cardMap = new Map(cards.map((c) => [c.wordId, c]))
  const weak = words.filter((w) => isWrongWord(cardMap.get(w.id)))

  return (
    <Screen>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-3xl">错题本</h1>
        <IconBandage className="h-6 w-6 text-coral" />
      </div>
      <DoodleSquiggle className="mt-0.5 h-3 w-14 text-coral" />
      <p className="mt-2 text-sm text-muted">最近答错的词，单独加强一轮。</p>

      {weak.length ? (
        <>
          <span className="chip-washi mt-4 rotate-1 bg-pink">{weak.length} 个薄弱词</span>
          <Link
            to="/study?mode=wrong"
            className="btn-press mt-4 flex items-center justify-center gap-2 rounded-2xl bg-coral py-4 font-semibold text-white"
          >
            开始加强
            <IconArrowRight className="h-5 w-5" />
          </Link>
        </>
      ) : (
        <div className="sticker-card mt-6 p-6 text-center" style={{ rotate: '-0.6deg' }}>
          <DoodleHeart className="mx-auto h-7 w-7 text-coral" />
          <div className="mt-2 font-display text-lg">暂时没有错题</div>
          <p className="mt-1 text-sm text-muted">学得不错，继续保持。</p>
        </div>
      )}

      {weak.length ? (
        <div className="sticker-card mt-5 divide-y divide-dashed divide-paper-2 overflow-hidden">
          {weak.map((word) => (
            <div key={word.id} className="flex items-baseline justify-between gap-3 px-4 py-3">
              <div>
                <div className="font-kr text-lg">{word.hangul}</div>
                <div className="text-sm text-muted">{word.meaningZh}</div>
              </div>
              <div className="text-xs text-muted">{word.romanization}</div>
            </div>
          ))}
        </div>
      ) : null}
    </Screen>
  )
}
