import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { getSpeechStatus, stopSpeech, subscribeSpeech } from '@/audio/tts'

export function SpeechFeedback({ enabled }: { enabled: boolean }) {
  const { pathname } = useLocation()
  const status = useSyncExternalStore(subscribeSpeech, getSpeechStatus, getSpeechStatus)

  useEffect(() => {
    if (!enabled) stopSpeech()
    return stopSpeech
  }, [pathname, enabled])

  if (!status.message) return null
  return (
    <div className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-sticker">
      <span role="status" className="flex-1">{status.message}</span>
      <button type="button" onClick={stopSpeech} className="px-2 py-1" aria-label="关闭发音提示">×</button>
    </div>
  )
}
