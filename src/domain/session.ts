import { localDateKey } from './dates'
import { isDue, isNewCard } from './srs'
import type { AppSettings, CardRecord, DailyStat, Word, WordBook } from './types'
import { builtinWords } from '@/data/catalog'

const BUILTIN_ORDER = new Map(builtinWords.map((word, index) => [word.id, index]))

function compareNewWords(a: Word, b: Word): number {
  const ao = BUILTIN_ORDER.get(a.id) ?? Number.MAX_SAFE_INTEGER
  const bo = BUILTIN_ORDER.get(b.id) ?? Number.MAX_SAFE_INTEGER
  if (ao !== bo) return ao - bo
  return a.id.localeCompare(b.id)
}

export interface SessionPick {
  reviews: Word[]
  news: Word[]
  queue: Word[]
  dueCount: number
  newAvailable: number
  remainingGoal: number
}

export function buildSessionQueue(input: {
  words: Word[]
  books: WordBook[]
  cards: Map<string, CardRecord>
  settings: AppSettings
  today?: DailyStat
  now?: Date
  extra?: boolean
}): SessionPick {
  const now = input.now ?? new Date()
  const enabled = new Set(input.books.filter((b) => b.enabled).map((b) => b.id))
  const enabledWords = input.words.filter((w) => enabled.has(w.bookId))
  const dueWords: Word[] = []
  const newWords: Word[] = []

  for (const word of enabledWords) {
    const card = input.cards.get(word.id)
    if (isNewCard(card)) newWords.push(word)
    else if (card && isDue(card, now)) dueWords.push(word)
  }
  newWords.sort(compareNewWords)

  dueWords.sort((a, b) => {
    const da = input.cards.get(a.id)?.due ?? 0
    const db = input.cards.get(b.id)?.due ?? 0
    return da - db
  })

  const today = input.today
  const done = (today?.reviews ?? 0) + (today?.newCards ?? 0)
  const remainingGoal = Math.max(0, input.settings.dailyGoal - done)
  const newLeft = input.extra
    ? newWords.length
    : Math.max(0, input.settings.newCardsPerDay - (today?.newCards ?? 0))

  const budget = input.extra ? Math.max(10, remainingGoal || 10) : remainingGoal
  const reviews = dueWords.slice(0, budget)
  const newCount = Math.min(newLeft, Math.max(0, budget - reviews.length))
  const news = newWords.slice(0, newCount)
  return {
    reviews,
    news,
    queue: [...reviews, ...news],
    dueCount: dueWords.length,
    newAvailable: newWords.length,
    remainingGoal,
  }
}

export function isWrongWord(card: CardRecord | undefined): boolean {
  if (!card) return false
  return card.consecutiveAgain > 0 || card.lastQuizCorrect === false
}

export function computeStreak(stats: DailyStat[], todayKey = localDateKey()): number {
  const byDate = new Map(stats.map((s) => [s.date, s]))
  let streak = 0
  let cursor = todayKey
  const today = byDate.get(cursor)
  if (!today?.goalMet) {
    const y = new Date(`${todayKey}T00:00:00`)
    y.setDate(y.getDate() - 1)
    cursor = localDateKey(y)
  }
  while (true) {
    const row = byDate.get(cursor)
    if (!row?.goalMet) break
    streak += 1
    const prev = new Date(`${cursor}T00:00:00`)
    prev.setDate(prev.getDate() - 1)
    cursor = localDateKey(prev)
  }
  return streak
}
