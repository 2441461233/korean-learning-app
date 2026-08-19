import { useLiveQuery } from 'dexie-react-hooks'
import { db, getAppSettings } from './database'

export function useBooks() {
  return useLiveQuery(() => db.books.toArray())
}

export function useWords() {
  return useLiveQuery(() => db.words.toArray())
}

export function useWordsByBook(bookId: string | undefined) {
  return useLiveQuery(() => (bookId ? db.words.where('bookId').equals(bookId).toArray() : []), [bookId])
}

export function useCards() {
  return useLiveQuery(() => db.cards.toArray())
}

export function useSettings() {
  return useLiveQuery(() => getAppSettings())
}

export function useDailyStats() {
  return useLiveQuery(() => db.dailyStats.toArray())
}

export function useHangulProgress() {
  return useLiveQuery(() => db.hangulProgress.toArray())
}

export function useReviews() {
  return useLiveQuery(() => db.reviews.toArray())
}
