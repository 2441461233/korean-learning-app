import { POS_LABEL, type Word } from '@/domain/types'
import { speakKorean } from '@/audio/tts'
import { VisualPanel } from './VisualPanel'
import { IconSpeaker } from './doodles'

export function WordReveal({ word, tts }: { word: Word; tts: boolean }) {
  return (
    <div className="animate-paste space-y-3">
      <VisualPanel word={word} large />
      <div className="sticker-card p-5">
        <span className="tape tape-coral" style={{ top: -11, left: '50%', marginLeft: -46, rotate: '-4deg' }} />
        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <div className="font-kr text-5xl leading-none">{word.hangul}</div>
            <div className="mt-2 text-sm text-muted">{word.romanization}</div>
          </div>
          <button
            type="button"
            onClick={() => tts && speakKorean(word.hangul)}
            className="btn-press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-butter text-ink"
            aria-label="朗读"
          >
            <IconSpeaker className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 text-2xl font-semibold">{word.meaningZh}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="chip-washi -rotate-1 bg-mint">{POS_LABEL[word.pos]}</span>
          {word.hanja ? <span className="chip-washi rotate-1 bg-skyblue">汉字词 {word.hanja}</span> : null}
        </div>
        {word.exampleKo ? (
          <div className="relative mt-4 rounded-2xl bg-[#FFF6D8] p-3.5 pt-4 text-sm">
            <span className="tape tape-butter" style={{ top: -10, left: 18, rotate: '-6deg', scale: '0.7' }} />
            <button type="button" className="block w-full text-left" onClick={() => tts && speakKorean(word.exampleKo)}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-kr text-base font-medium">{word.exampleKo}</span>
                <IconSpeaker className="h-4 w-4 shrink-0 text-ink/50" />
              </div>
              <div className="mt-1 text-muted">{word.exampleZh}</div>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
