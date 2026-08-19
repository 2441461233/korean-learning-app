import { GRADE_META } from '@/domain/types'
import { Rating, type Grade } from '@/domain/srs'
import { DoodleStar } from './doodles'

const COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-again',
  2: 'bg-hard',
  3: 'bg-good',
  4: 'bg-easy',
}

const TILTS: Record<1 | 2 | 3 | 4, string> = {
  1: '-rotate-1',
  2: 'rotate-1',
  3: '-rotate-1',
  4: 'rotate-1',
}

export function GradeBar({
  labels,
  suggested,
  onGrade,
}: {
  labels: Record<1 | 2 | 3 | 4, string>
  suggested: Rating
  onGrade: (rating: Grade) => void
}) {
  const grades = [1, 2, 3, 4] as const
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {grades.map((grade) => (
        <button
          key={grade}
          type="button"
          onClick={() => onGrade(grade)}
          className={`btn-press relative rounded-2xl px-1 py-3 text-white ${COLORS[grade]} ${TILTS[grade]} ${
            suggested === grade ? 'ring-[3px] ring-ink/25 ring-offset-2 ring-offset-paper' : ''
          }`}
        >
          {suggested === grade ? (
            <DoodleStar className="absolute -right-1.5 -top-2 h-4.5 w-4.5 text-sun" />
          ) : null}
          <div className="text-sm font-bold">{GRADE_META[grade].label}</div>
          <div className="mt-1 text-[10px] leading-tight text-white/90">{labels[grade]}</div>
        </button>
      ))}
    </div>
  )
}
