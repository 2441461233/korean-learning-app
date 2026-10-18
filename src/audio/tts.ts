import manifest from './generated/manifest.json'
import { normalizeSpeechText } from './speechText'

export type SpeechStatus = { state: 'idle' | 'loading' | 'playing' | 'error'; message: string }

const clips: Record<string, string> = manifest.clips
const listeners = new Set<() => void>()
const idle: SpeechStatus = { state: 'idle', message: '' }
let status = idle
let currentAudio: HTMLAudioElement | null = null
let requestId = 0
let loadingTimer: ReturnType<typeof setTimeout> | undefined

export function getSpeechStatus(): SpeechStatus {
  return status
}

export function subscribeSpeech(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function updateStatus(next: SpeechStatus) {
  status = next
  listeners.forEach((listener) => listener())
}

export function recordedSpeechUrl(text: string): string | undefined {
  const filename = clips[normalizeSpeechText(text)]
  return filename ? `${import.meta.env.BASE_URL}audio/ko/${filename}` : undefined
}

function releaseAudio() {
  clearTimeout(loadingTimer)
  if (!currentAudio) return
  currentAudio.onplaying = null
  currentAudio.onended = null
  currentAudio.onerror = null
  currentAudio.pause()
  currentAudio.removeAttribute('src')
  currentAudio.load()
  currentAudio = null
}

function fail(id: number, message: string) {
  if (id !== requestId) return
  releaseAudio()
  // Invalidate any late play() rejection or media event from this request.
  requestId += 1
  updateStatus({ state: 'error', message })
}

async function systemSpeech(text: string, id: number): Promise<void> {
  const synth = window.speechSynthesis
  if (!synth) {
    fail(id, '这个词暂无自然语音，设备也不支持韩语朗读。')
    return
  }
  if (!synth.getVoices().length) {
    await new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer)
        synth.removeEventListener('voiceschanged', done)
        resolve()
      }
      const timer = setTimeout(done, 800)
      synth.addEventListener('voiceschanged', done)
    })
  }
  if (id !== requestId) return
  const voice = synth.getVoices().find((candidate) => /^ko(?:-|_)/i.test(candidate.lang))
  if (!voice) {
    fail(id, '这个词暂无自然语音，请先在设备上安装韩语语音。')
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = voice
  utterance.lang = 'ko-KR'
  utterance.rate = 0.95
  utterance.onend = () => { if (id === requestId) updateStatus(idle) }
  utterance.onerror = () => { fail(id, '系统语音播放失败，请点喇叭重试。') }
  updateStatus({ state: 'playing', message: '' })
  synth.speak(utterance)
}

export async function speakKorean(rawText: string): Promise<void> {
  const text = normalizeSpeechText(rawText)
  if (!text || typeof window === 'undefined') return
  stopSpeech()
  const id = requestId
  const url = recordedSpeechUrl(text)
  updateStatus({ state: 'loading', message: '正在加载发音…' })

  // Custom CSV words have no bundled recording. Only these use a Korean
  // system voice; a failed built-in recording never silently downgrades.
  if (!url) {
    try {
      await systemSpeech(text, id)
    } catch {
      fail(id, '系统语音播放失败，请点喇叭重试。')
    }
    return
  }

  try {
    const audio = new Audio(url)
    currentAudio = audio
    audio.onplaying = () => {
      if (id !== requestId) return
      clearTimeout(loadingTimer)
      updateStatus({ state: 'playing', message: '' })
    }
    audio.onended = () => {
      if (id !== requestId) return
      releaseAudio()
      updateStatus(idle)
    }
    audio.onerror = () => fail(id, '语音加载失败，请检查网络后点喇叭重试。')
    loadingTimer = setTimeout(() => fail(id, '语音加载超时，请点喇叭重试。'), 15000)
    // Call play synchronously in the click handler to preserve iOS activation.
    await audio.play()
  } catch (error) {
    const blocked = error instanceof Error && error.name === 'NotAllowedError'
    fail(id, blocked ? '点一下喇叭，就能播放发音。' : '语音播放失败，请点喇叭重试。')
  }
}

export function stopSpeech(): void {
  requestId += 1
  releaseAudio()
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  updateStatus(idle)
}
