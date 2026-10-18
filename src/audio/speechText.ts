import type { HangulLetter } from '@/data/hangul'

export const TTS_PREVIEW_TEXT = '안녕하세요. 오늘도 함께 한국어를 공부해요.'

export function normalizeSpeechText(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ')
}

// Jamo on their own are ambiguous to speech engines. Read the displayed
// letter name (기역 / 아), and keep complete syllables such as 각 unchanged.
export function hangulSpeechText(letter: HangulLetter): string {
  return /^[ㄱ-ㆎ]+$/.test(letter.char) ? letter.name : letter.char
}
