import type { Rating, State } from 'ts-fsrs'

export type Pos =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'particle'
  | 'expression'
  | 'number'
  | 'pronoun'

export const POS_LABEL: Record<Pos, string> = {
  noun: '名词',
  verb: '动词',
  adjective: '形容词',
  adverb: '副词',
  particle: '助词',
  expression: '表达',
  number: '数词',
  pronoun: '代词',
}

export type BookKind = 'builtin' | 'user'

export interface Word {
  id: string
  bookId: string
  hangul: string
  romanization: string
  meaningZh: string
  hanja: string
  pos: Pos
  exampleKo: string
  exampleZh: string
  imagePrompt: string
  imageUrl?: string
  theme: string
}

export interface WordBook {
  id: string
  title: string
  description: string
  kind: BookKind
  theme: string
  enabled: boolean
  createdAt: number
}

export interface CardRecord {
  wordId: string
  due: number
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  reps: number
  lapses: number
  state: State
  lastReview?: number
  consecutiveAgain: number
  consecutiveCorrect: number
  lastQuizCorrect?: boolean
}

export interface ReviewLogRecord {
  id: string
  wordId: string
  bookId: string
  rating: Rating
  quizCorrect: boolean
  quizType: QuizType
  reviewedAt: number
  scheduledDays: number
}

export interface AppSettings {
  id: 'app'
  dailyGoal: number
  newCardsPerDay: number
  ttsEnabled: boolean
  onboardingDone: boolean
  hangulSkipped: boolean
  imageApiKey: string
}

export interface HangulProgress {
  lessonId: string
  completed: boolean
  quizScore: number
  completedAt?: number
}

export interface DailyStat {
  date: string
  reviews: number
  newCards: number
  correct: number
  answered: number
  goalMet: boolean
}

export interface SeedMeta {
  id: 'seed'
  version: number
}

export type QuizType =
  | 'image_to_hangul'
  | 'zh_to_hangul'
  | 'hangul_to_zh'
  | 'example_to_image'
  | 'hangul_to_image'

export interface QuizChoice {
  id: string
  label: string
  sublabel?: string
  ariaLabel?: string
  emoji?: string
  from?: string
  to?: string
}

export interface Quiz {
  type: QuizType
  promptHangul?: string
  promptZh?: string
  promptExample?: string
  showImage: boolean
  choices: QuizChoice[]
  answerId: string
}

export interface BackupPayload {
  version: 1
  exportedAt: number
  books: WordBook[]
  words: Word[]
  cards: CardRecord[]
  reviews: ReviewLogRecord[]
  hangulProgress: HangulProgress[]
  settings: AppSettings
  dailyStats: DailyStat[]
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'app',
  dailyGoal: 20,
  newCardsPerDay: 10,
  ttsEnabled: true,
  onboardingDone: false,
  hangulSkipped: false,
  imageApiKey: '',
}

export const GRADE_META = {
  1: { key: 'again', label: '重来', hint: '完全忘了' },
  2: { key: 'hard', label: '困难', hint: '想起来很吃力' },
  3: { key: 'good', label: '良好', hint: '正常想起' },
  4: { key: 'easy', label: '简单', hint: '一眼就知道' },
} as const
