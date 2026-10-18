import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getSpeechStatus, recordedSpeechUrl, speakKorean, stopSpeech } from './tts'
import { TTS_PREVIEW_TEXT } from './speechText'

let playResult: () => Promise<void>
let audios: FakeAudio[]
const voiceListeners = new Set<() => void>()
const synth = {
  cancel: vi.fn(),
  speak: vi.fn(),
  getVoices: vi.fn(() => [{ lang: 'ko-KR', name: 'Korean' }]),
  addEventListener: vi.fn((_event: string, listener: () => void) => voiceListeners.add(listener)),
  removeEventListener: vi.fn((_event: string, listener: () => void) => voiceListeners.delete(listener)),
}

class FakeAudio {
  url: string
  onplaying: (() => void) | null = null
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  pause = vi.fn()
  removeAttribute = vi.fn()
  load = vi.fn()
  play = vi.fn(() => playResult())
  constructor(url: string) {
    this.url = url
    audios.push(this)
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  audios = []
  voiceListeners.clear()
  playResult = () => Promise.resolve()
  synth.getVoices.mockReturnValue([{ lang: 'ko-KR', name: 'Korean' }])
  vi.stubGlobal('window', { speechSynthesis: synth })
  vi.stubGlobal('Audio', FakeAudio)
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    text: string
    constructor(text: string) { this.text = text }
  })
  stopSpeech()
})

afterEach(() => {
  stopSpeech()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('natural Korean audio', () => {
  it('plays a bundled clip even when the device has no speech engine', async () => {
    vi.stubGlobal('window', {})
    await speakKorean(TTS_PREVIEW_TEXT)
    expect(audios[0].url).toBe(recordedSpeechUrl(TTS_PREVIEW_TEXT))
    audios[0].onplaying?.()
    expect(getSpeechStatus().state).toBe('playing')
    expect(synth.speak).not.toHaveBeenCalled()
    audios[0].onended?.()
    expect(getSpeechStatus().state).toBe('idle')
  })

  it('preserves the GitHub Pages base path and normalizes text', () => {
    vi.stubEnv('BASE_URL', '/korean-learning-app/')
    expect(recordedSpeechUrl('  안녕하세요.\n 오늘도 함께 한국어를 공부해요.  '))
      .toMatch(/^\/korean-learning-app\/audio\/ko\/[a-f0-9]+\.mp3$/)
  })

  it('stops the previous clip and ignores its late rejection', async () => {
    let rejectFirst!: (error: Error) => void
    playResult = () => new Promise<void>((_resolve, reject) => { rejectFirst = reject })
    const first = speakKorean('가방')
    const staleError = audios[0].onerror
    playResult = () => Promise.resolve()
    await speakKorean('나무')
    audios[1].onplaying?.()
    expect(audios[0].pause).toHaveBeenCalled()
    rejectFirst(new Error('The previous play was interrupted'))
    await first
    staleError?.()
    expect(getSpeechStatus().state).toBe('playing')
    expect(audios[1].pause).not.toHaveBeenCalled()
  })

  it('shows a tap-to-play hint when autoplay is blocked, and can retry', async () => {
    playResult = () => Promise.reject(Object.assign(new Error('Blocked'), { name: 'NotAllowedError' }))
    await speakKorean('가방')
    expect(getSpeechStatus().message).toContain('点一下喇叭')
    expect(synth.speak).not.toHaveBeenCalled()
    playResult = () => Promise.resolve()
    await speakKorean('가방')
    audios[1].onplaying?.()
    expect(getSpeechStatus().state).toBe('playing')
  })

  it('reports a broken built-in clip without switching to the old voice', async () => {
    await speakKorean('가방')
    audios[0].onerror?.()
    expect(getSpeechStatus().message).toContain('语音加载失败')
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('times out stalled loads and stops pending playback on navigation', async () => {
    await speakKorean('가방')
    await vi.advanceTimersByTimeAsync(15000)
    expect(getSpeechStatus().message).toContain('超时')
    await speakKorean('나무')
    const stalePlaying = audios[1].onplaying
    stopSpeech()
    stalePlaying?.()
    await vi.advanceTimersByTimeAsync(15000)
    expect(getSpeechStatus().state).toBe('idle')
    expect(audios[1].pause).toHaveBeenCalled()
  })

  it('keeps Korean system speech available for unrecorded imported text', async () => {
    await speakKorean('사용자가 추가한 새로운 문장입니다.')
    expect(audios).toHaveLength(0)
    expect(synth.speak).toHaveBeenCalledWith(expect.objectContaining({
      text: '사용자가 추가한 새로운 문장입니다.', lang: 'ko-KR',
    }))
  })

  it('does not read Korean with an unrelated language voice', async () => {
    synth.getVoices.mockReturnValue([{ lang: 'en-US', name: 'English' }])
    await speakKorean('사용자가 추가한 새로운 문장입니다.')
    expect(synth.speak).not.toHaveBeenCalled()
    expect(getSpeechStatus().message).toContain('安装韩语语音')
  })

  it('does not resume an old system request after voices finish loading', async () => {
    synth.getVoices.mockReturnValue([])
    const pending = speakKorean('사용자가 추가한 새로운 문장입니다.')
    stopSpeech()
    synth.getVoices.mockReturnValue([{ lang: 'ko-KR', name: 'Korean' }])
    voiceListeners.forEach((listener) => listener())
    await pending
    expect(synth.speak).not.toHaveBeenCalled()
    expect(voiceListeners.size).toBe(0)
  })
})
