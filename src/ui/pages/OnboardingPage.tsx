import { Link, useNavigate } from 'react-router-dom'
import { patchSettings } from '@/db/database'
import { DoodleSparkles, DoodleStar } from '@/ui/components/doodles'

export function OnboardingPage() {
  const navigate = useNavigate()

  async function finish(skipHangul: boolean) {
    await patchSettings({ onboardingDone: true, hangulSkipped: skipHangul })
    navigate(skipHangul ? '/' : '/hangul', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
      <div className="flex-1">
        <div className="sticker-card relative p-2" style={{ rotate: '-1.2deg' }}>
          <span className="tape tape-coral" style={{ top: -11, left: 28, rotate: '-7deg' }} />
          <span className="tape tape-sky" style={{ top: -11, right: 28, left: 'auto', rotate: '6deg' }} />
          <div className="relative grid h-44 place-items-center overflow-hidden rounded-[18px] bg-butter">
            <div className="absolute -left-6 -top-8 h-28 w-28 rounded-full bg-coral/15" />
            <div className="absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-sky/15" />
            <DoodleStar className="animate-float-slow absolute left-6 top-5 h-5 w-5 text-coral/60" />
            <DoodleSparkles className="animate-float-slow absolute bottom-6 right-7 h-6 w-6 text-sky/70" />
            <span className="grid place-items-center rounded-full bg-white/95 p-6 shadow-sticker">
              <span className="font-kr text-7xl leading-none text-ink">한</span>
            </span>
          </div>
        </div>
        <h1 className="font-display mt-8 text-3xl leading-tight">用眼睛记住韩语单词</h1>
        <p className="mt-3 text-muted">
          看图选词，再用间隔重复把词留住。先花几分钟认识韩文字母，之后学词会轻松很多。
        </p>
        <ul className="mt-6 space-y-2.5 text-sm text-ink/80">
          <li className="flex items-center gap-2">
            <DoodleStar className="h-4 w-4 shrink-0 text-coral" />
            生活入门 + TOPIK I 两本词书
          </li>
          <li className="flex items-center gap-2">
            <DoodleStar className="h-4 w-4 shrink-0 text-sun" />
            本地保存，可导出备份
          </li>
          <li className="flex items-center gap-2">
            <DoodleStar className="h-4 w-4 shrink-0 text-good" />
            每天一小会儿，连续打卡
          </li>
        </ul>
      </div>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => finish(false)}
          className="btn-press w-full rounded-2xl bg-coral py-4 text-base font-semibold text-white"
        >
          先学韩文字母
        </button>
        <button
          type="button"
          onClick={() => finish(true)}
          className="btn-press sticker-card w-full rounded-2xl py-4 text-base font-semibold"
        >
          我会字母，直接学单词
        </button>
        <p className="text-center text-xs text-muted">
          之后仍可在 <Link to="/hangul" className="text-coral underline decoration-wavy underline-offset-2">字母课</Link> 里复习
        </p>
      </div>
    </div>
  )
}
