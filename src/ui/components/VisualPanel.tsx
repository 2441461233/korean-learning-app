import type { Word } from '@/domain/types'
import { wordVisual } from '@/images/provider'
import { DoodleSparkles, DoodleStar } from './doodles'

function tilt(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const rots = [-1.6, -0.8, 0.7, 1.5, 0]
  return rots[Math.abs(h) % rots.length]
}

export function VisualPanel({
  word,
  large = false,
}: {
  word: Word
  large?: boolean
}) {
  const visual = wordVisual(word)
  return (
    <div
      className="sticker-card p-2"
      style={{ rotate: `${tilt(word.id)}deg` }}
    >
      <div
        className={`relative overflow-hidden rounded-[18px] ${large ? 'h-52' : 'h-36'}`}
        style={{ background: visual.bg }}
      >
        {word.imageUrl ? (
          <img src={word.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <>
            <div
              className="absolute -right-7 -top-9 h-32 w-32 rounded-full opacity-25"
              style={{ background: visual.accent }}
            />
            <div
              className="absolute -bottom-10 -left-5 h-28 w-28 rounded-full opacity-15"
              style={{ background: visual.accent }}
            />
            <DoodleStar
              className="absolute left-4 top-3.5 h-5 w-5 opacity-45"
              style={{ color: visual.accent }}
            />
            <DoodleSparkles
              className="absolute bottom-4 right-5 h-6 w-6 opacity-40"
              style={{ color: visual.accent }}
            />
            <div className="relative flex h-full flex-col items-center justify-center gap-2.5 p-4">
              <span className="grid place-items-center rounded-full bg-white/95 p-4 shadow-sticker">
                <span className={`${large ? 'text-6xl' : 'text-5xl'} leading-none`}>{visual.emoji}</span>
              </span>
              <span className="chip-washi bg-white/85">
                {word.theme === 'custom' ? '自建词' : word.meaningZh}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
