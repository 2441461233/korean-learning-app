import { useEffect, useState } from 'react'
import { ensureSeeded } from '@/db/database'
import App from '@/ui/App.tsx'

function LogoSticker({ size = 'h-20 w-20' }: { size?: string }) {
  return (
    <div className={`sticker-card grid ${size} rotate-3 place-items-center`}>
      <span className="tape tape-coral" style={{ top: -9, left: '50%', marginLeft: -34, width: 68, height: 16, rotate: '-3deg' }} />
      <span className="font-kr text-4xl text-coral">한</span>
    </div>
  )
}

export function Boot() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ensureSeeded()
      .then(() => setReady(true))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : '启动失败'))
  }, [])

  if (error) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <p>无法启动：{error}</p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="text-center">
          <div className="animate-float-slow mx-auto w-fit">
            <LogoSticker />
          </div>
          <div className="mt-5 text-muted">正在准备词书…</div>
        </div>
      </div>
    )
  }

  return <App />
}
