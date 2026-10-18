/// <reference types="node" />
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { builtinWords } from '@/data/catalog'
import { HANGUL_LESSONS } from '@/data/hangul'
import manifest from './generated/manifest.json'
import { hangulSpeechText, normalizeSpeechText, TTS_PREVIEW_TEXT } from './speechText'

describe('bundled pronunciation coverage', () => {
  it('ships playable MP3 data for every built-in word, example and lesson', () => {
    const texts = new Set([
      TTS_PREVIEW_TEXT,
      ...builtinWords.flatMap((word) => [word.hangul, word.exampleKo]),
      ...HANGUL_LESSONS.flatMap((lesson) => lesson.letters.map(hangulSpeechText)),
    ].map(normalizeSpeechText).filter(Boolean))
    const clips: Record<string, string> = manifest.clips
    expect(Object.keys(clips).sort()).toEqual([...texts].sort())
    for (const text of texts) {
      const filename = clips[text]
      expect(filename, text).toMatch(/^[a-f0-9]{20}\.mp3$/)
      const path = resolve('public/audio/ko', filename)
      expect(statSync(path).size, text).toBeGreaterThan(1000)
      const bytes = readFileSync(path)
      const hasHeader = bytes.subarray(0, 3).toString() === 'ID3'
        || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
      expect(hasHeader, text).toBe(true)
    }
  })

  it('reads letter names and vowels deliberately, and preserves syllables', () => {
    const letters = HANGUL_LESSONS.flatMap((lesson) => lesson.letters)
    expect(hangulSpeechText(letters.find((letter) => letter.char === 'ㄱ')!)).toBe('기역')
    expect(hangulSpeechText(letters.find((letter) => letter.char === 'ㅏ')!)).toBe('아')
    expect(hangulSpeechText(letters.find((letter) => letter.char === '각')!)).toBe('각')
    expect(hangulSpeechText(letters.find((letter) => letter.char === 'ㄲ')!)).toBe('쌍기역')
  })
})
