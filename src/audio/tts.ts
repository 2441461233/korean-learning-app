let voicesReady: Promise<void> | null = null

function waitVoices(): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve()
  if (window.speechSynthesis.getVoices().length) return Promise.resolve()
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const done = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', done)
        resolve()
      }
      window.speechSynthesis.addEventListener('voiceschanged', done)
      window.setTimeout(done, 800)
    })
  }
  return voicesReady
}

export async function speakKorean(text: string): Promise<void> {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return
  await waitVoices()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ko-KR'
  utter.rate = 0.92
  const voice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith('ko'))
  if (voice) utter.voice = voice
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
}

export function stopSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}
