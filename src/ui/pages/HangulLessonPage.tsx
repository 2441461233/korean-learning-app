import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HANGUL_LESSONS } from '@/data/hangul'
import { db } from '@/db/database'
import { speakKorean } from '@/audio/tts'
import { DoodleSparkles, IconArrowLeft, IconCheck, IconSpeaker, IconX } from '@/ui/components/doodles'
import { Screen } from '@/ui/layout/AppShell'

const TILES = ['bg-mint', 'bg-butter', 'bg-pink', 'bg-skyblue', 'bg-lilac']

export function HangulLessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const lesson = HANGUL_LESSONS.find((l) => l.id === lessonId)
  const [step, setStep] = useState<'learn' | 'quiz'>('learn')
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const nextLesson = useMemo(() => {
    if (!lesson) return undefined
    return HANGUL_LESSONS.find((l) => l.order === lesson.order + 1)
  }, [lesson])

  if (!lesson) {
    return (
      <Screen>
        <p>找不到这一课。</p>
        <Link to="/hangul" className="text-coral">
          返回
        </Link>
      </Screen>
    )
  }

  const question = lesson.quiz[qIndex]
  const finishedQuiz = step === 'quiz' && qIndex >= lesson.quiz.length

  async function complete(quizScore: number) {
    await db.hangulProgress.put({
      lessonId: lesson!.id,
      completed: true,
      quizScore,
      completedAt: Date.now(),
    })
    if (nextLesson) navigate(`/hangul/${nextLesson.id}`)
    else navigate('/hangul')
  }

  return (
    <Screen>
      <Link to="/hangul" className="flex items-center gap-1 text-sm text-muted">
        <IconArrowLeft className="h-4 w-4" />
        字母课
      </Link>
      <h1 className="font-display mt-3 text-3xl">{lesson.title}</h1>
      <p className="mt-2 text-sm text-muted">{lesson.body}</p>

      {step === 'learn' ? (
        <>
          <div className="mt-5 space-y-3">
            {lesson.letters.map((letter, i) => (
              <button
                key={letter.char + letter.name}
                type="button"
                onClick={() => speakKorean(letter.char.length === 1 ? letter.char : letter.example?.hangul ?? letter.char)}
                className="sticker-card w-full p-4 text-left transition-transform hover:-translate-y-0.5"
                style={{ rotate: `${i % 2 === 0 ? -0.4 : 0.4}deg` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl font-kr text-3xl ${TILES[i % TILES.length]}`}>
                    {letter.char}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {letter.name} · {letter.roman}
                      <IconSpeaker className="h-3.5 w-3.5 text-muted" />
                    </div>
                    <div className="mt-1 text-sm text-muted">{letter.tip}</div>
                    {letter.example ? (
                      <div className="mt-1 text-sm">
                        <span className="font-kr">{letter.example.hangul}</span> · {letter.example.meaning}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep('quiz')}
            className="btn-press mt-6 w-full rounded-2xl bg-coral py-4 font-semibold text-white"
          >
            开始小测
          </button>
        </>
      ) : finishedQuiz ? (
        <div className="sticker-card mt-10 p-6 text-center" style={{ rotate: '0.8deg' }}>
          <DoodleSparkles className="mx-auto h-8 w-8 text-sun" />
          <div className="font-display mt-2 text-xl">本课完成</div>
          <p className="mt-2 text-muted">
            答对 {score} / {lesson.quiz.length}
          </p>
          <button
            type="button"
            onClick={() => complete(score)}
            className="btn-press mt-5 w-full rounded-2xl bg-coral py-4 font-semibold text-white"
          >
            {nextLesson ? '下一课' : '完成字母课'}
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <span className="chip-washi -rotate-1 bg-skyblue">
            {qIndex + 1} / {lesson.quiz.length}
          </span>
          <div className="mt-3 text-xl font-semibold">{question.prompt}</div>
          <div className="mt-4 grid gap-3">
            {question.options.map((option, i) => {
              const picked = selected === option
              const right = selected && option === question.answer
              const wrong = picked && option !== question.answer
              return (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(selected)}
                  onClick={() => {
                    setSelected(option)
                    if (option === question.answer) setScore((s) => s + 1)
                    window.setTimeout(() => {
                      setSelected(null)
                      setQIndex((i) => i + 1)
                    }, 500)
                  }}
                  className={`relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-lg transition-all ${
                    right
                      ? 'border-2 border-good bg-[#EBF6E9]'
                      : wrong
                        ? 'animate-wobble border-2 border-again/60 bg-[#FDECE7]'
                        : 'sticker-card hover:-translate-y-0.5'
                  }`}
                  style={{ rotate: selected ? '0deg' : `${i % 2 === 0 ? -0.5 : 0.5}deg` }}
                >
                  {right ? (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-good text-white">
                      <IconCheck className="h-4 w-4" />
                    </span>
                  ) : wrong ? (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-again text-white">
                      <IconX className="h-4 w-4" />
                    </span>
                  ) : null}
                  <span className="font-kr">{option}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Screen>
  )
}
