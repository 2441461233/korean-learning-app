import type { Word, WordBook } from '@/domain/types'
import { parseSeedText } from './parseSeed'
import { DAILY_SEED } from './seeds/daily'
import { TOPIK_A } from './seeds/topik-a'
import { TOPIK_B } from './seeds/topik-b'
import { TOPIK_C } from './seeds/topik-c'

export const BOOK_DAILY: WordBook = {
  id: 'daily',
  title: '生活入门',
  description: '吃穿住行、问候数字、家人和出行，从开口就能用的词开始。',
  kind: 'builtin',
  theme: 'daily',
  enabled: true,
  createdAt: 0,
}

export const BOOK_TOPIK: WordBook = {
  id: 'topik',
  title: 'TOPIK I 基础',
  description: '考试与课堂高频词：学习、社会、工作、抽象名词和常用动词。',
  kind: 'builtin',
  theme: 'exam',
  enabled: true,
  createdAt: 0,
}

function uniqueWords(bookId: string, chunks: string[]): Word[] {
  const parsed = parseSeedText(bookId, chunks.join('\n'))
  const seen = new Set<string>()
  const out: Word[] = []
  for (const word of parsed) {
    const key = `${word.hangul}|${word.meaningZh}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(word)
  }
  return out
}

export const dailyWords = uniqueWords('daily', [DAILY_SEED])
const dailyHangulMeaning = new Set(dailyWords.map((w) => `${w.hangul}|${w.meaningZh}`))

export const topikWords = uniqueWords('topik', [TOPIK_A, TOPIK_B, TOPIK_C]).filter(
  (w) => !dailyHangulMeaning.has(`${w.hangul}|${w.meaningZh}`),
)

export const builtinBooks: WordBook[] = [BOOK_DAILY, BOOK_TOPIK]
export const builtinWords: Word[] = [...dailyWords, ...topikWords]
export const SEED_WORD_COUNT = builtinWords.length
