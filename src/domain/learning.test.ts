import { builtinWords } from '@/data/catalog'
import { describe, expect, it } from 'vitest'
import { parseCsvLine, parseWordCsv } from './csv'
import { formatInterval } from './dates'
import { memoryInsight, memorySeries } from './memory'
import {
  applyCorrect,
  applyWrong,
  gradeFor,
  hintsFor,
  needsExtra,
  quizTypeFor,
  startAttempt,
} from './pipeline'
import { buildQuiz, pickDistractors } from './quiz'
import { applyGrade, emptyCardRecord, previewGrades, Rating, State } from './srs'
import type { Word } from './types'

const sample = (id: string, hangul: string, zh: string, pos: Word['pos'] = 'noun'): Word => ({
  id,
  bookId: 'daily',
  hangul,
  romanization: hangul,
  meaningZh: zh,
  hanja: '',
  pos,
  exampleKo: hangul,
  exampleZh: zh,
  imagePrompt: zh,
  theme: 'food',
})

describe('csv', () => {
  it('parses quoted commas', () => {
    expect(parseCsvLine('밥,"米饭, 饭",bap')).toEqual(['밥', '米饭, 饭', 'bap'])
  })

  it('parses header csv', () => {
    const text = 'hangul,meaning_zh,romanization,hanja,pos,example_ko,example_zh,image_prompt\n안녕,你好,annyeong,,expression,안녕!,嗨!,'
    const rows = parseWordCsv(text)
    expect(rows).toHaveLength(1)
    expect(rows[0].hangul).toBe('안녕')
    expect(rows[0].pos).toBe('expression')
  })
})

describe('quiz', () => {
  it('picks unique distractors', () => {
    const target = sample('1', '밥', '饭')
    const pool = [
      target,
      sample('2', '물', '水'),
      sample('3', '빵', '面包'),
      sample('4', '국', '汤'),
      sample('5', '차', '茶'),
    ]
    const d = pickDistractors(target, pool, pool, 3)
    expect(d).toHaveLength(3)
    expect(d.some((w) => w.id === '1')).toBe(false)
    expect(new Set(d.map((w) => w.hangul)).size).toBe(3)
  })

  it('builds four hangul choices', () => {
    const word = sample('1', '밥', '饭')
    const quiz = buildQuiz(word, [sample('2', '물', '水'), sample('3', '빵', '面包'), sample('4', '국', '汤')], 'image_to_hangul')
    expect(quiz.choices).toHaveLength(4)
    expect(quiz.answerId).toBe('1')
    expect(quiz.showImage).toBe(true)
  })

  it('builds image choices without leaking Chinese', () => {
    const word = sample('1', '밥', '饭')
    const quiz = buildQuiz(
      { ...word, exampleKo: '밥을 먹어요' },
      [sample('2', '물', '水'), sample('3', '빵', '面包'), sample('4', '국', '汤')],
      'example_to_image',
    )
    expect(quiz.promptExample).toBe('밥을 먹어요')
    expect(quiz.choices.every((c) => c.emoji && c.label === '')).toBe(true)
    expect(new Set(quiz.choices.map((c) => c.emoji)).size).toBe(4)
  })
})

describe('srs', () => {
  it('schedules a good grade into the future', () => {
    const now = new Date('2026-08-19T10:00:00')
    const card = emptyCardRecord('w1', now)
    const next = applyGrade(card, Rating.Good, true, now)
    expect(next.due).toBeGreaterThan(now.getTime())
    expect(next.reps).toBeGreaterThan(0)
    expect(next.consecutiveCorrect).toBe(1)
    const preview = previewGrades(card, now)
    expect(preview[Rating.Again].label.length).toBeGreaterThan(0)
  })
})

describe('seed', () => {
  it('ships a medium-sized builtin vocabulary', () => {
    expect(builtinWords.length).toBeGreaterThanOrEqual(800)
  })
})

describe('dates', () => {
  it('formats short intervals in minutes', () => {
    const from = new Date('2026-08-19T10:00:00')
    const to = new Date('2026-08-19T10:10:00')
    expect(formatInterval(from, to)).toBe('10 分钟后')
  })
})

describe('pipeline', () => {
  it('takes new words through three quiz types', () => {
    let state = startAttempt('new')
    expect(quizTypeFor(state)).toBe('example_to_image')
    state = applyCorrect(state).state
    expect(quizTypeFor(state)).toBe('hangul_to_image')
    state = applyCorrect(state).state
    expect(quizTypeFor(state)).toBe('hangul_to_zh')
    expect(applyCorrect(state).done).toBe(true)
  })

  it('keeps a new-word step after a hint and requires two clean hits on step 2', () => {
    let state = startAttempt('new')
    state = applyWrong(state)
    expect(state.step2Need).toBe(2)
    expect(state.mustPickCorrect).toBe(true)
    const afterHint = applyCorrect(state)
    expect(afterHint.done).toBe(false)
    expect(afterHint.state.step).toBe(1)
    expect(afterHint.state.mustPickCorrect).toBe(false)
    state = applyCorrect(afterHint.state).state
    expect(state.step).toBe(2)
    const first = applyCorrect(state)
    expect(first.done).toBe(false)
    expect(first.state.step).toBe(2)
    const second = applyCorrect(first.state)
    expect(second.state.step).toBe(3)
  })

  it('queues same-day extra after a missed review, not after a missed new word', () => {
    const missedNew = applyWrong(startAttempt('new'))
    expect(needsExtra(missedNew)).toBe(false)
    const missedReview = applyWrong(startAttempt('review'))
    const afterPick = applyCorrect(missedReview)
    expect(afterPick.done).toBe(true)
    expect(needsExtra(afterPick.state)).toBe(true)
  })

  it('resets extra remaining to two after a miss', () => {
    let state = startAttempt('extra')
    state = applyCorrect(state).state
    expect(state.extraNeeded).toBe(1)
    state = applyWrong(state)
    expect(state.extraNeeded).toBe(2)
    const afterHint = applyCorrect(state)
    expect(afterHint.done).toBe(false)
    expect(afterHint.state.extraNeeded).toBe(2)
  })

  it('maps a clean review to Easy only when the word is already stable', () => {
    const fresh = startAttempt('review')
    const newish = emptyCardRecord('w')
    expect(gradeFor(fresh, newish)).toBe(Rating.Good)
    expect(gradeFor(applyWrong(fresh), newish)).toBe(Rating.Again)
    expect(gradeFor(startAttempt('extra'), newish)).toBeNull()
    const stable = {
      ...newish,
      consecutiveCorrect: 2,
      scheduledDays: 6,
      reps: 4,
      state: State.Review,
    }
    expect(gradeFor(fresh, stable)).toBe(Rating.Easy)
  })

  it('reveals hints from hidden to obvious', () => {
    const word = {
      ...sample('1', '학교', '学校'),
      hanja: '學校',
      exampleZh: '我去学校。',
      romanization: 'hakgyo',
    }
    expect(hintsFor(word, 1)[0]).toContain('汉字词')
    expect(hintsFor(word, 4).at(-1)).toContain('学校')
  })
})

describe('memory', () => {
  it('draws a declining retrievability curve after a review', () => {
    const now = new Date('2026-08-19T10:00:00')
    const card = applyGrade(emptyCardRecord('w1', now), Rating.Good, true, now)
    const later = applyGrade(card, Rating.Good, true, new Date(now.getTime() + 86_400_000))
    const points = memorySeries(later, new Date(now.getTime() + 86_400_000))
    expect(points[0].r).toBeGreaterThan(0.8)
    expect(points[points.length - 1].r).toBeLessThan(points[0].r)
    const insight = memoryInsight(later, new Date(now.getTime() + 86_400_000))
    expect(insight.dueLabel.length).toBeGreaterThan(0)
    expect(insight.target).toBe(0.9)
  })
})
