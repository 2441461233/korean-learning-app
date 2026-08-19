import { Rating, type Grade } from './srs'
import type { CardRecord, QuizType, Word } from './types'

export type AttemptKind = 'new' | 'review' | 'extra'

export interface AttemptState {
  kind: AttemptKind
  step: 1 | 2 | 3
  step2Hits: number
  step2Need: number
  mustPickCorrect: boolean
  hintLevel: number
  everWrong: boolean
  extraNeeded: number
}

export function startAttempt(kind: AttemptKind): AttemptState {
  if (kind === 'new') {
    return {
      kind,
      step: 1,
      step2Hits: 0,
      step2Need: 1,
      mustPickCorrect: false,
      hintLevel: 0,
      everWrong: false,
      extraNeeded: 0,
    }
  }
  return {
    kind,
    step: 3,
    step2Hits: 0,
    step2Need: 1,
    mustPickCorrect: false,
    hintLevel: 0,
    everWrong: false,
    extraNeeded: kind === 'extra' ? 2 : 0,
  }
}

export function quizTypeFor(state: AttemptState): QuizType {
  if (state.kind === 'new' && state.step === 1) return 'example_to_image'
  if (state.kind === 'new' && state.step === 2) return 'hangul_to_image'
  return 'hangul_to_zh'
}

export function applyWrong(state: AttemptState): AttemptState {
  return {
    ...state,
    everWrong: true,
    mustPickCorrect: true,
    hintLevel: Math.min(4, state.hintLevel + 1),
    step2Need: state.kind === 'new' && state.step <= 2 ? 2 : state.step2Need,
    extraNeeded: 2,
  }
}

export function applyCorrect(state: AttemptState): { state: AttemptState; done: boolean } {
  if (state.mustPickCorrect) {
    if (state.kind === 'review') {
      return {
        state: { ...state, mustPickCorrect: false, hintLevel: 0, extraNeeded: 2 },
        done: true,
      }
    }
    return {
      state: {
        ...state,
        mustPickCorrect: false,
        hintLevel: 0,
        extraNeeded: state.kind === 'extra' ? 2 : state.extraNeeded,
      },
      done: false,
    }
  }

  if (state.kind === 'new') {
    if (state.step === 1) {
      return { state: { ...state, step: 2 }, done: false }
    }
    if (state.step === 2) {
      const hits = state.step2Hits + 1
      if (hits >= state.step2Need) {
        return { state: { ...state, step: 3, step2Hits: hits }, done: false }
      }
      return { state: { ...state, step2Hits: hits }, done: false }
    }
    return { state, done: true }
  }

  if (state.kind === 'extra') {
    const left = state.extraNeeded - 1
    if (left <= 0) return { state: { ...state, extraNeeded: 0 }, done: true }
    return { state: { ...state, extraNeeded: left }, done: false }
  }

  return { state, done: true }
}

export function needsExtra(state: AttemptState): boolean {
  return state.kind !== 'extra' && state.extraNeeded > 0
}

export function gradeFor(state: AttemptState, card: CardRecord): Grade | null {
  if (state.kind === 'extra') return null
  if (state.everWrong) return Rating.Again
  if (
    state.kind === 'review' &&
    (card.consecutiveCorrect ?? 0) >= 2 &&
    card.scheduledDays >= 6
  ) {
    return Rating.Easy
  }
  return Rating.Good
}

export function hintsFor(word: Word, level: number, quizType?: QuizType): string[] {
  const hideExample = quizType === 'example_to_image'
  const layers = [
    word.hanja ? `汉字词：${word.hanja}` : '',
    !hideExample && word.exampleZh ? `例句：${word.exampleZh}` : '',
    word.romanization ? `读音：${word.romanization}` : '',
    `意思：${word.meaningZh}`,
  ].filter(Boolean)
  return layers.slice(0, Math.max(0, level))
}

export function stepTitle(state: AttemptState): string {
  if (state.kind === 'extra') return `加练 · 还需做对 ${state.extraNeeded} 次`
  if (state.kind === 'review') return '复习：这是什么意思？'
  if (state.step === 1) return '听例句，选出画面'
  if (state.step === 2) return '看单词，选出画面'
  return '看单词，选出意思'
}
