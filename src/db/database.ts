import Dexie, { type EntityTable } from 'dexie'
import { parseBackup, serializeBackup } from '@/domain/backup'
import { DEFAULT_SETTINGS, type AppSettings, type BackupPayload, type CardRecord, type DailyStat, type HangulProgress, type ReviewLogRecord, type SeedMeta, type Word, type WordBook } from '@/domain/types'
import { builtinBooks, builtinWords } from '@/data/catalog'
import { localDateKey } from '@/domain/dates'

const SEED_VERSION = 1

export class KoreanDB extends Dexie {
  books!: EntityTable<WordBook, 'id'>
  words!: EntityTable<Word, 'id'>
  cards!: EntityTable<CardRecord, 'wordId'>
  reviews!: EntityTable<ReviewLogRecord, 'id'>
  hangulProgress!: EntityTable<HangulProgress, 'lessonId'>
  settings!: EntityTable<AppSettings, 'id'>
  dailyStats!: EntityTable<DailyStat, 'date'>
  meta!: EntityTable<SeedMeta, 'id'>

  constructor() {
    super('korean-word-app')
    this.version(1).stores({
      books: 'id, kind, enabled',
      words: 'id, bookId, hangul, theme',
      cards: 'wordId, due, state, consecutiveAgain',
      reviews: 'id, wordId, bookId, reviewedAt',
      hangulProgress: 'lessonId',
      settings: 'id',
      dailyStats: 'date',
      meta: 'id',
    })
  }
}

export const db = new KoreanDB()

export async function ensureSeeded(): Promise<void> {
  await db.open()
  const meta = await db.meta.get('seed')
  const settings = await db.settings.get('app')
  if (!settings) {
    await db.settings.put(DEFAULT_SETTINGS)
  }

  if (meta?.version === SEED_VERSION) return

  const existingBooks = await db.books.toArray()
  const userBooks = existingBooks.filter((b) => b.kind === 'user')
  const existingEnabled = new Map(existingBooks.map((b) => [b.id, b.enabled]))

  await db.transaction('rw', db.books, db.words, db.meta, async () => {
    for (const book of builtinBooks) {
      await db.books.put({
        ...book,
        enabled: existingEnabled.get(book.id) ?? book.enabled,
      })
    }
    const builtinIds = new Set(builtinWords.map((w) => w.id))
    const currentBuiltin = await db.words.where('bookId').anyOf(builtinBooks.map((b) => b.id)).toArray()
    for (const word of currentBuiltin) {
      if (word.id.startsWith('daily:') || word.id.startsWith('topik:') || builtinIds.has(word.id)) {
        if (!builtinIds.has(word.id)) await db.words.delete(word.id)
      }
    }
    await db.words.bulkPut(builtinWords)
    await db.meta.put({ id: 'seed', version: SEED_VERSION })
  })

  if (userBooks.length) {
    await db.books.bulkPut(userBooks)
  }
}

export async function getAppSettings(): Promise<AppSettings> {
  return (await db.settings.get('app')) ?? DEFAULT_SETTINGS
}

export async function patchSettings(patch: Partial<AppSettings>): Promise<void> {
  const current = await getAppSettings()
  await db.settings.put({ ...current, ...patch, id: 'app' })
}

export async function bumpDailyStat(input: {
  isNew: boolean
  correct: boolean
  goal: number
}): Promise<void> {
  const date = localDateKey()
  const row = (await db.dailyStats.get(date)) ?? {
    date,
    reviews: 0,
    newCards: 0,
    correct: 0,
    answered: 0,
    goalMet: false,
  }
  if (input.isNew) row.newCards += 1
  else row.reviews += 1
  row.answered += 1
  if (input.correct) row.correct += 1
  row.goalMet = row.reviews + row.newCards >= input.goal
  await db.dailyStats.put(row)
}

export async function exportBackup(): Promise<string> {
  const [books, words, cards, reviews, hangulProgress, settings, dailyStats] = await Promise.all([
    db.books.toArray(),
    db.words.toArray(),
    db.cards.toArray(),
    db.reviews.toArray(),
    db.hangulProgress.toArray(),
    getAppSettings(),
    db.dailyStats.toArray(),
  ])
  return serializeBackup({ books, words, cards, reviews, hangulProgress, settings, dailyStats })
}

export async function importBackup(text: string): Promise<void> {
  const data: BackupPayload = parseBackup(text)
  await db.transaction(
    'rw',
    [db.books, db.words, db.cards, db.reviews, db.hangulProgress, db.settings, db.dailyStats],
    async () => {
      await Promise.all([
        db.books.clear(),
        db.words.clear(),
        db.cards.clear(),
        db.reviews.clear(),
        db.hangulProgress.clear(),
        db.dailyStats.clear(),
      ])
      await db.books.bulkPut(data.books)
      await db.words.bulkPut(data.words)
      await db.cards.bulkPut(data.cards)
      await db.reviews.bulkPut(data.reviews)
      await db.hangulProgress.bulkPut(data.hangulProgress)
      await db.dailyStats.bulkPut(data.dailyStats)
      await db.settings.put({ ...DEFAULT_SETTINGS, ...data.settings, id: 'app' })
    },
  )
  await ensureSeeded()
}

export async function clearUserProgress(): Promise<void> {
  await db.transaction('rw', [db.cards, db.reviews, db.hangulProgress, db.dailyStats], async () => {
    await db.cards.clear()
    await db.reviews.clear()
    await db.hangulProgress.clear()
    await db.dailyStats.clear()
  })
}
