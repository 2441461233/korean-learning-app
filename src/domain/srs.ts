import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs'
import { formatInterval } from './dates'
import type { CardRecord } from './types'

export const REQUEST_RETENTION = 0.9

const scheduler = fsrs({
  request_retention: REQUEST_RETENTION,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['1m', '10m'],
  relearning_steps: ['10m'],
})

export function emptyCardRecord(wordId: string, now = new Date()): CardRecord {
  const card = createEmptyCard(now)
  return {
    ...fromFsrsCard(card),
    wordId,
    consecutiveAgain: 0,
    consecutiveCorrect: 0,
  }
}

export function fromFsrsCard(
  card: Card,
): Omit<CardRecord, 'wordId' | 'consecutiveAgain' | 'consecutiveCorrect' | 'lastQuizCorrect'> {
  return {
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReview: card.last_review?.getTime(),
  }
}

export function toFsrsCard(record: CardRecord): Card {
  return {
    due: new Date(record.due),
    stability: record.stability,
    difficulty: record.difficulty,
    elapsed_days: record.elapsedDays,
    scheduled_days: record.scheduledDays,
    learning_steps: record.learningSteps,
    reps: record.reps,
    lapses: record.lapses,
    state: record.state,
    last_review: record.lastReview ? new Date(record.lastReview) : undefined,
  }
}

export function previewGrades(record: CardRecord, now = new Date()) {
  const preview = scheduler.repeat(toFsrsCard(record), now)
  return {
    [Rating.Again]: {
      card: preview[Rating.Again].card,
      label: formatInterval(now, preview[Rating.Again].card.due),
    },
    [Rating.Hard]: {
      card: preview[Rating.Hard].card,
      label: formatInterval(now, preview[Rating.Hard].card.due),
    },
    [Rating.Good]: {
      card: preview[Rating.Good].card,
      label: formatInterval(now, preview[Rating.Good].card.due),
    },
    [Rating.Easy]: {
      card: preview[Rating.Easy].card,
      label: formatInterval(now, preview[Rating.Easy].card.due),
    },
  }
}

export function applyGrade(
  record: CardRecord,
  rating: Grade,
  quizCorrect: boolean,
  now = new Date(),
): CardRecord {
  const result = scheduler.next(toFsrsCard(record), now, rating)
  const consecutiveAgain =
    rating === Rating.Again ? (record.consecutiveAgain ?? 0) + 1 : 0
  const consecutiveCorrect =
    rating === Rating.Again ? 0 : (record.consecutiveCorrect ?? 0) + 1
  return {
    ...fromFsrsCard(result.card),
    wordId: record.wordId,
    consecutiveAgain,
    consecutiveCorrect,
    lastQuizCorrect: quizCorrect,
  }
}

export function isNewCard(record: CardRecord | undefined): boolean {
  return !record || record.state === State.New || record.reps === 0
}

export function isDue(record: CardRecord, now = new Date()): boolean {
  if (isNewCard(record)) return false
  return record.due <= now.getTime()
}

export function retrievability(record: CardRecord, when = new Date()): number {
  if (isNewCard(record)) return 0
  const value = scheduler.get_retrievability(toFsrsCard(record), when, false)
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value)) / 100
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

export { Rating, State, type Grade }
