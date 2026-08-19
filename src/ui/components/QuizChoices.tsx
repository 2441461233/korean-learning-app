import type { Quiz } from '@/domain/types'
import { DoodleStar, IconCheck, IconX } from './doodles'

const CHIP_COLORS = ['bg-mint', 'bg-butter', 'bg-pink', 'bg-skyblue']
const CHIP_LETTERS = ['A', 'B', 'C', 'D']

export function QuizChoices({
  quiz,
  selected,
  wrongIds,
  onSelect,
}: {
  quiz: Quiz
  selected: string | null
  wrongIds: string[]
  onSelect: (id: string) => void
}) {
  const solved = selected === quiz.answerId
  const imageGrid = quiz.choices.some((choice) => choice.emoji)
  const textIsHangul = quiz.type !== 'hangul_to_zh'

  if (imageGrid) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {quiz.choices.map((choice, i) => {
          const pickedWrong = wrongIds.includes(choice.id)
          const pickedRight = solved && choice.id === quiz.answerId
          return (
            <button
              key={choice.id}
              type="button"
              aria-label={choice.ariaLabel || choice.label}
              disabled={pickedWrong || solved}
              onClick={() => onSelect(choice.id)}
              className={`sticker-card p-2 transition-all ${
                pickedRight
                  ? 'border-2 border-good'
                  : pickedWrong
                    ? 'animate-wobble opacity-45'
                    : 'hover:-translate-y-0.5'
              }`}
              style={{ rotate: pickedWrong || pickedRight ? '0deg' : `${i % 2 === 0 ? -0.7 : 0.7}deg` }}
            >
              <div
                className="relative grid aspect-square place-items-center rounded-[14px]"
                style={{ background: choice.from ?? '#F7EDDC' }}
              >
                <span className="grid place-items-center rounded-full bg-white/95 p-3 shadow-sticker">
                  <span className="text-4xl leading-none">{choice.emoji}</span>
                </span>
                {pickedRight ? (
                  <DoodleStar className="animate-sparkle-pop absolute right-2 top-2 h-6 w-6 text-sun" />
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {quiz.choices.map((choice, i) => {
        const pickedWrong = wrongIds.includes(choice.id)
        const pickedRight = solved && choice.id === quiz.answerId
        return (
          <button
            key={choice.id}
            type="button"
            disabled={pickedWrong || solved}
            onClick={() => onSelect(choice.id)}
            className={`relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all ${
              pickedRight
                ? 'border-2 border-good bg-[#EBF6E9]'
                : pickedWrong
                  ? 'animate-wobble border-2 border-again/60 bg-[#FDECE7] opacity-60'
                  : 'sticker-card hover:-translate-y-0.5'
            }`}
            style={{ rotate: pickedWrong || pickedRight ? '0deg' : `${i % 2 === 0 ? -0.5 : 0.5}deg` }}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm ${
                pickedRight
                  ? 'bg-good text-white'
                  : pickedWrong
                    ? 'bg-again text-white'
                    : CHIP_COLORS[i % CHIP_COLORS.length]
              }`}
            >
              {pickedRight ? (
                <IconCheck className="h-4 w-4" />
              ) : pickedWrong ? (
                <IconX className="h-4 w-4" />
              ) : (
                CHIP_LETTERS[i % 4]
              )}
            </span>
            <span className="min-w-0">
              <span className={`block text-[21px] leading-tight ${textIsHangul ? 'font-kr' : 'font-semibold'}`}>
                {choice.label}
              </span>
              {choice.sublabel ? <span className="mt-0.5 block text-xs text-muted">{choice.sublabel}</span> : null}
            </span>
            {pickedRight ? (
              <DoodleStar className="animate-sparkle-pop absolute -right-1.5 -top-2 h-5 w-5 text-sun" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
