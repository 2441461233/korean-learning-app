import { uniqueVisuals } from '@/images/provider'
import { hashString } from './hash'
import type { Quiz, QuizChoice, QuizType, Word } from './types'

export { hashString }

const TYPES: QuizType[] = ['image_to_hangul', 'zh_to_hangul', 'hangul_to_zh']

export function pickQuizType(wordId: string, round: number): QuizType {
  return TYPES[(hashString(wordId) + round) % TYPES.length]
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items]
  let s = seed || 1
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

export function pickDistractors(
  target: Word,
  bookPool: Word[],
  globalPool: Word[],
  count = 3,
): Word[] {
  const used = new Set([target.id])
  const hangulUsed = new Set([target.hangul])
  const meaningUsed = new Set([target.meaningZh])
  const picked: Word[] = []

  const take = (pool: Word[]) => {
    for (const word of pool) {
      if (picked.length >= count) return
      if (used.has(word.id)) continue
      if (hangulUsed.has(word.hangul) || meaningUsed.has(word.meaningZh)) continue
      used.add(word.id)
      hangulUsed.add(word.hangul)
      meaningUsed.add(word.meaningZh)
      picked.push(word)
    }
  }

  const samePosBook = bookPool.filter((w) => w.pos === target.pos)
  const sameThemeBook = bookPool.filter((w) => w.theme === target.theme)
  take(seededShuffle(samePosBook, hashString(target.id)))
  take(seededShuffle(sameThemeBook, hashString(target.id + 't')))
  take(seededShuffle(bookPool, hashString(target.id + 'b')))
  take(seededShuffle(globalPool, hashString(target.id + 'g')))
  return picked
}

export function buildQuiz(
  word: Word,
  distractors: Word[],
  type: QuizType,
  salt = 0,
): Quiz {
  const options = seededShuffle([word, ...distractors], hashString(`${word.id}:${type}:${salt}`))
  const looks = uniqueVisuals(options)

  if (type === 'example_to_image' || type === 'hangul_to_image') {
    const choices: QuizChoice[] = options.map((item) => {
      const look = looks.get(item.id)
      return {
        id: item.id,
        label: '',
        ariaLabel: item.meaningZh,
        emoji: look?.emoji,
        from: look?.from,
        to: look?.to,
      }
    })
    return {
      type,
      promptHangul: type === 'hangul_to_image' ? word.hangul : undefined,
      promptExample: type === 'example_to_image' ? word.exampleKo || word.hangul : undefined,
      showImage: false,
      choices,
      answerId: word.id,
    }
  }

  const hangulChoices: QuizChoice[] = options.map((item) => ({
    id: item.id,
    label: item.hangul,
  }))
  const zhChoices: QuizChoice[] = options.map((item) => ({
    id: item.id,
    label: item.meaningZh,
  }))

  if (type === 'hangul_to_zh') {
    return {
      type,
      promptHangul: word.hangul,
      showImage: false,
      choices: zhChoices,
      answerId: word.id,
    }
  }

  if (type === 'zh_to_hangul') {
    return {
      type,
      promptZh: word.meaningZh,
      showImage: false,
      choices: hangulChoices,
      answerId: word.id,
    }
  }

  return {
    type,
    promptZh: word.meaningZh,
    showImage: true,
    choices: hangulChoices,
    answerId: word.id,
  }
}

export function quizPromptTitle(type: QuizType): string {
  if (type === 'hangul_to_zh') return '这是什么意思？'
  if (type === 'zh_to_hangul') return '韩语怎么说？'
  if (type === 'example_to_image') return '听例句，选出画面'
  if (type === 'hangul_to_image') return '看单词，选出画面'
  return '看图选词'
}
