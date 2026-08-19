import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { speakKorean, stopSpeech } from '@/audio/tts'
import { bumpDailyStat, db } from '@/db/database'
import { useBooks, useCards, useDailyStats, useSettings, useWords } from '@/db/hooks'
import { localDateKey } from '@/domain/dates'
import {
  applyCorrect,
  applyWrong,
  gradeFor,
  hintsFor,
  needsExtra,
  quizTypeFor,
  startAttempt,
  stepTitle,
  type AttemptKind,
  type AttemptState,
} from '@/domain/pipeline'
import { buildQuiz, pickDistractors } from '@/domain/quiz'
import { applyGrade, emptyCardRecord, isNewCard } from '@/domain/srs'
import { buildSessionQueue, isWrongWord } from '@/domain/session'
import type { CardRecord, Quiz, Word } from '@/domain/types'
import { QuizChoices } from '@/ui/components/QuizChoices'
import { WordReveal } from '@/ui/components/WordReveal'
import { DoodleSparkles, IconArrowLeft, IconSpeaker } from '@/ui/components/doodles'

export function StudyPage() {
  const [params] = useSearchParams()
  const extraSession = params.get('extra') === '1'
  const wrongMode = params.get('mode') === 'wrong'
  const words = useWords()
  const books = useBooks()
  const cards = useCards()
  const settings = useSettings()
  const stats = useDailyStats()

  const [mainQueue, setMainQueue] = useState<Word[]>([])
  const [extraQueue, setExtraQueue] = useState<Word[]>([])
  const [ready, setReady] = useState(false)
  const [index, setIndex] = useState(0)
  const [inExtra, setInExtra] = useState(false)
  const [phase, setPhase] = useState<'quiz' | 'complete'>('quiz')
  const [attempt, setAttempt] = useState<AttemptState | null>(null)
  const [quizSalt, setQuizSalt] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const started = useRef(false)

  const cardMap = useMemo(
    () => new Map<string, CardRecord>((cards ?? []).map((c) => [c.wordId, c])),
    [cards],
  )
  const cardMapRef = useRef(cardMap)
  useEffect(() => {
    cardMapRef.current = cardMap
  }, [cardMap])

  useEffect(() => {
    if (started.current) return
    if (!words || !books || !cards || !stats || !settings) return
    const today = stats.find((s) => s.date === localDateKey())
    const map = new Map<string, CardRecord>(cards.map((c) => [c.wordId, c]))
    let picked: Word[]
    if (wrongMode) {
      picked = words.filter((w) => isWrongWord(map.get(w.id))).slice(0, 20)
    } else {
      picked = buildSessionQueue({
        words,
        books,
        cards: map,
        settings,
        today,
        extra: extraSession,
      }).queue
    }
    started.current = true
    setMainQueue(picked)
    setIndex(0)
    setReady(true)
  }, [words, books, cards, stats, settings, extraSession, wrongMode])

  const queue = inExtra ? extraQueue : mainQueue
  const word = queue[index]
  const total = mainQueue.length + extraQueue.length
  const current = inExtra ? mainQueue.length + index : index

  useEffect(() => {
    if (!word) return
    const kind: AttemptKind = inExtra
      ? 'extra'
      : isNewCard(cardMapRef.current.get(word.id))
        ? 'new'
        : 'review'
    setAttempt(startAttempt(kind))
    setPhase('quiz')
    setSelected(null)
    setWrongIds([])
    setQuizSalt(0)
    setBusy(false)
  }, [word?.id, inExtra])

  const quiz = useMemo(() => {
    if (!word || !attempt || phase !== 'quiz' || !words) return null
    return makeQuiz(word, words, quizTypeFor(attempt), quizSalt)
  }, [word, attempt, phase, words, quizSalt])

  useEffect(() => {
    if (!quiz || !word || !settings?.ttsEnabled || phase !== 'quiz') return
    if (quiz.promptExample) speakKorean(quiz.promptExample)
    else if (quiz.promptHangul) speakKorean(quiz.promptHangul)
    return () => stopSpeech()
  }, [quiz, word, settings?.ttsEnabled, phase])

  if (!ready || !words || !books || !settings) {
    return <StudyFrame>正在准备卡片…</StudyFrame>
  }

  if (!word) {
    return (
      <StudyFrame>
        <div className="sticker-card mx-auto mt-24 max-w-xs p-6 text-center" style={{ rotate: '0.8deg' }}>
          <DoodleSparkles className="mx-auto h-8 w-8 text-sun" />
          <div className="font-display mt-2 text-2xl">{wrongMode ? '错题已经清完' : '这组学完了'}</div>
          <p className="mt-2 text-sm text-muted">回首页看看今日进度，或再开一组。</p>
          <Link to="/" className="btn-press mt-5 inline-block rounded-2xl bg-coral px-6 py-3 font-semibold text-white">
            回到今日
          </Link>
        </div>
      </StudyFrame>
    )
  }

  const enabledTts = settings.ttsEnabled
  const dailyGoal = settings.dailyGoal
  const hints = attempt ? hintsFor(word, attempt.hintLevel) : []

  async function finishWith(state: AttemptState) {
    const existing = cardMapRef.current.get(word.id) ?? emptyCardRecord(word.id)
    const rating = gradeFor(state, existing)
    let saved = existing
    if (rating !== null) {
      saved = applyGrade(existing, rating, !state.everWrong)
      await db.cards.put(saved)
      await db.reviews.add({
        id: crypto.randomUUID(),
        wordId: word.id,
        bookId: word.bookId,
        rating,
        quizCorrect: !state.everWrong,
        quizType: quizTypeFor(state),
        reviewedAt: Date.now(),
        scheduledDays: saved.scheduledDays,
      })
      if (!wrongMode) {
        await bumpDailyStat({
          isNew: state.kind === 'new',
          correct: !state.everWrong,
          goal: dailyGoal,
        })
      }
    }
    if (needsExtra(state)) {
      setExtraQueue((q) => (q.some((w) => w.id === word.id) ? q : [...q, word]))
    }
    setPhase('complete')
    setBusy(false)
  }

  function choose(id: string) {
    if (!quiz || !attempt || busy || phase !== 'quiz') return
    if (wrongIds.includes(id)) return
    if (id !== quiz.answerId) {
      setWrongIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
      setAttempt(applyWrong(attempt))
      return
    }
    const { state, done } = applyCorrect(attempt)
    setSelected(id)
    if (done) {
      setAttempt(state)
      setBusy(true)
      void finishWith(state)
      return
    }
    setBusy(true)
    window.setTimeout(() => {
      setAttempt(state)
      setWrongIds([])
      setSelected(null)
      setQuizSalt((n) => n + 1)
      setBusy(false)
    }, 280)
  }

  function goNext() {
    const qLen = inExtra ? extraQueue.length : mainQueue.length
    if (index + 1 < qLen) {
      setIndex((i) => i + 1)
      return
    }
    if (!inExtra && extraQueue.length > 0) {
      setInExtra(true)
      setIndex(0)
      return
    }
    setIndex((i) => i + 1)
  }

  function replay() {
    if (!enabledTts || !quiz) return
    if (quiz.promptExample) speakKorean(quiz.promptExample)
    else if (quiz.promptHangul) speakKorean(quiz.promptHangul)
  }

  return (
    <StudyFrame>
      <div className="flex items-center justify-between text-sm">
        <Link to="/" className="flex items-center gap-1 text-muted">
          <IconArrowLeft className="h-4 w-4" />
          关闭
        </Link>
        <div className="sticker-card px-2.5 py-1 font-display text-sm">
          {Math.min(current + 1, Math.max(total, 1))} / {Math.max(total, 1)}
        </div>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper-2">
        <div
          className="h-full rounded-full bg-coral transition-all duration-300"
          style={{ width: `${total ? (current / total) * 100 : 0}%` }}
        />
      </div>

      {phase === 'quiz' && quiz && attempt ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="chip-washi -rotate-1 bg-skyblue">{stepTitle(attempt)}</span>
            {attempt.kind === 'new' ? (
              <span className="chip-washi rotate-1 bg-mint">新学 {attempt.step}/3</span>
            ) : null}
          </div>
          {quiz.promptExample ? (
            <button type="button" onClick={replay} className="sticker-card relative w-full px-4 py-6 text-center">
              <span className="tape tape-mint" style={{ top: -11, left: 24, rotate: '-6deg' }} />
              <div className="font-kr text-2xl font-bold leading-snug">{quiz.promptExample}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted">
                <IconSpeaker className="h-3.5 w-3.5" />
                {enabledTts ? '点这里再听一遍' : '选出对应画面'}
              </div>
            </button>
          ) : null}
          {quiz.promptHangul ? (
            <button type="button" onClick={replay} className="w-full py-6 text-center">
              <div className="font-kr text-6xl">{quiz.promptHangul}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted">
                <IconSpeaker className="h-3.5 w-3.5" />
                {enabledTts ? '点这里朗读' : '选出意思'}
              </div>
            </button>
          ) : null}
          {hints.length ? (
            <div className="relative rounded-2xl bg-butter px-4 py-3 pt-4 text-sm" style={{ rotate: '-0.5deg' }}>
              <span className="tape tape-coral" style={{ top: -10, right: 20, left: 'auto', rotate: '5deg', scale: '0.75' }} />
              <div className="text-xs font-semibold text-hard">看提示，再选出正确答案</div>
              {hints.map((hint) => (
                <div key={hint} className="mt-1">
                  {hint}
                </div>
              ))}
            </div>
          ) : null}
          <QuizChoices quiz={quiz} selected={selected} wrongIds={wrongIds} onSelect={choose} />
        </div>
      ) : null}

      {phase === 'complete' ? (
        <div className="mt-5 space-y-4 pb-6">
          <WordReveal word={word} tts={settings.ttsEnabled} />
          {attempt?.kind === 'extra' ? (
            <p className="text-center text-xs text-muted">加练不会改下次出现的时间，只是今天再练一遍。</p>
          ) : null}
          <button type="button" onClick={goNext} className="btn-press w-full rounded-2xl bg-coral py-4 text-lg font-semibold text-white">
            下一词
          </button>
        </div>
      ) : null}
    </StudyFrame>
  )
}

function makeQuiz(word: Word, pool: Word[], type: Quiz['type'], salt: number): Quiz {
  const bookPool = pool.filter((w) => w.bookId === word.bookId)
  const distractors = pickDistractors(word, bookPool, pool, 3)
  return buildQuiz(word, distractors, type, salt)
}

function StudyFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md px-5 pb-10 pt-[max(1.2rem,env(safe-area-inset-top))]">
      {children}
    </div>
  )
}
