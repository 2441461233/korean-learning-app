import { builtinBooks, builtinWords } from '@/data/catalog'
import { HANGUL_LESSONS } from '@/data/hangul'
import { iconForWord } from '@/images/icons'
import { glyphFor, uniqueVisuals, wordVisual } from '@/images/provider'
import { describe, expect, it } from 'vitest'
import { parseBackup } from './backup'
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
import { buildSessionQueue, computeStreak, isWrongWord } from './session'
import { applyGrade, emptyCardRecord, previewGrades, Rating, State } from './srs'
import { DEFAULT_SETTINGS, type Word, type WordBook } from './types'

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

  it('queues same-day extra after a missed new word or review', () => {
    const missedNew = applyWrong(startAttempt('new'))
    expect(needsExtra(missedNew)).toBe(true)
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

  it('does not leak the Chinese example on listen-and-pick-image', () => {
    const word = {
      ...sample('1', '학교', '学校'),
      hanja: '',
      exampleZh: '我去学校。',
      romanization: 'hakgyo',
    }
    const imageHints = hintsFor(word, 4, 'example_to_image')
    expect(imageHints.join('')).not.toContain('我去学校')
    expect(imageHints[0]).toContain('读音')
    expect(hintsFor(word, 2, 'hangul_to_zh').some((hint) => hint.includes('例句'))).toBe(true)
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

const KNOWN_THEMES = new Set([
  'greetings', 'family', 'people', 'numbers', 'time', 'food', 'drink', 'shopping',
  'travel', 'transport', 'home', 'daily', 'body', 'health', 'school', 'work',
  'weather', 'nature', 'clothes', 'color', 'emotion', 'verb', 'adjective',
  'place', 'city', 'culture', 'society', 'exam', 'animal', 'custom',
])

function book(partial: Partial<WordBook> & Pick<WordBook, 'id'>): WordBook {
  return {
    title: partial.id,
    description: '',
    kind: 'builtin',
    theme: 'daily',
    enabled: true,
    createdAt: 0,
    ...partial,
  }
}

describe('session', () => {
  const words = [sample('1', '밥', '饭'), sample('2', '물', '水'), sample('3', '빵', '面包'), sample('4', '국', '汤')]
  const books = [book({ id: 'daily', enabled: true })]
  const settings = { ...DEFAULT_SETTINGS, dailyGoal: 5, newCardsPerDay: 2 }

  it('puts due reviews before new words and respects daily budget', () => {
    const now = new Date('2026-08-19T10:00:00')
    const due = applyGrade(emptyCardRecord('1', now), Rating.Good, true, now)
    const cards = new Map([
      ['1', { ...due, due: now.getTime() - 1000, state: State.Review, reps: 2 }],
    ])
    const picked = buildSessionQueue({ words, books, cards, settings, now })
    expect(picked.dueCount).toBe(1)
    expect(picked.reviews.map((w) => w.id)).toEqual(['1'])
    expect(picked.news).toHaveLength(2)
    expect(picked.queue[0].id).toBe('1')
    expect(picked.queue.slice(1).every((w) => w.id !== '1')).toBe(true)
  })

  it('excludes disabled books and extra session still fills a small queue', () => {
    const now = new Date('2026-08-19T10:00:00')
    const picked = buildSessionQueue({
      words,
      books: [book({ id: 'daily', enabled: false })],
      cards: new Map(),
      settings,
      now,
    })
    expect(picked.queue).toHaveLength(0)

    const extra = buildSessionQueue({
      words,
      books,
      cards: new Map(),
      settings: { ...settings, dailyGoal: 20, newCardsPerDay: 10 },
      today: { date: '2026-08-19', reviews: 20, newCards: 10, correct: 20, answered: 30, goalMet: true },
      extra: true,
      now,
    })
    expect(extra.queue.length).toBeGreaterThan(0)
    expect(extra.news.length).toBeLessThanOrEqual(4)
  })

  it('counts streak from yesterday when today is not yet done', () => {
    expect(computeStreak([], '2026-08-19')).toBe(0)
    expect(
      computeStreak(
        [{ date: '2026-08-19', reviews: 20, newCards: 0, correct: 20, answered: 20, goalMet: true }],
        '2026-08-19',
      ),
    ).toBe(1)
    expect(
      computeStreak(
        [
          { date: '2026-08-19', reviews: 0, newCards: 0, correct: 0, answered: 0, goalMet: false },
          { date: '2026-08-18', reviews: 20, newCards: 0, correct: 20, answered: 20, goalMet: true },
          { date: '2026-08-17', reviews: 20, newCards: 0, correct: 20, answered: 20, goalMet: true },
        ],
        '2026-08-19',
      ),
    ).toBe(2)
  })

  it('introduces builtin new words in catalog order, not id order', () => {
    const picked = buildSessionQueue({
      words: builtinWords,
      books: builtinBooks,
      cards: new Map(),
      settings: { ...DEFAULT_SETTINGS, dailyGoal: 20, newCardsPerDay: 3 },
    })
    expect(picked.news.map((w) => w.hangul)).toEqual(builtinWords.slice(0, 3).map((w) => w.hangul))
  })

  it('marks a word as weak after a miss', () => {
    expect(isWrongWord(undefined)).toBe(false)
    expect(isWrongWord({ ...emptyCardRecord('1'), consecutiveAgain: 1 })).toBe(true)
    expect(isWrongWord({ ...emptyCardRecord('1'), lastQuizCorrect: false })).toBe(true)
    expect(isWrongWord({ ...emptyCardRecord('1'), consecutiveAgain: 0, lastQuizCorrect: true })).toBe(false)
  })
})

describe('hangul curriculum', () => {
  it('ships ten ordered lessons with valid quizzes', () => {
    expect(HANGUL_LESSONS).toHaveLength(10)
    expect(HANGUL_LESSONS.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    for (const lesson of HANGUL_LESSONS) {
      expect(lesson.letters.length).toBeGreaterThan(0)
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(4)
      for (const question of lesson.quiz) {
        expect(question.options).toContain(question.answer)
        expect(new Set(question.options).size).toBe(question.options.length)
      }
    }
  })
})

describe('seed quality', () => {
  it('covers both builtin books without empty fields or unknown themes', () => {
    expect(builtinBooks.map((b) => b.id)).toEqual(['daily', 'topik'])
    expect(builtinWords.length).toBeGreaterThanOrEqual(800)
    const missing = builtinWords.filter((w) => !w.hangul || !w.meaningZh || !w.exampleKo)
    expect(missing).toEqual([])
    const unknownTheme = builtinWords.filter((w) => !KNOWN_THEMES.has(w.theme))
    expect(unknownTheme.map((w) => `${w.id}:${w.theme}`)).toEqual([])
  })
})

describe('visual identity', () => {
  it('picks a word-level icon from the Chinese gloss', () => {
    expect(wordVisual(sample('1', '밥', '饭')).emoji).toBe('🍚')
    expect(wordVisual(sample('2', '물', '水')).emoji).toBe('💧')
    expect(wordVisual(sample('3', '가게', '小店', 'noun')).emoji).toBe('🏪')
    expect(wordVisual({ ...sample('4', '안녕하세요', '你好'), theme: 'greetings' }).emoji).toBe('👋')
  })

  it('covers most builtin glosses with a word-level icon', () => {
    const hit = builtinWords.filter((w) => iconForWord(w)).length
    expect(hit / builtinWords.length).toBeGreaterThan(0.7)
  })

  it('keeps the target word emoji stable when a distractor collides', () => {
    const target = sample('t', '밥', '饭')
    const other = sample('o', '쌀밥', '米饭')
    expect(glyphFor(other)).toBe(glyphFor(target))
    const looks = uniqueVisuals([other, target])
    expect(looks.get(other.id)?.emoji).toBe(glyphFor(other))
    expect(looks.get(target.id)?.emoji).not.toBe(glyphFor(target))

    const quiz = buildQuiz(
      target,
      [other, sample('x', '빵', '面包'), sample('y', '국', '汤')],
      'example_to_image',
    )
    const answer = quiz.choices.find((c) => c.id === target.id)
    expect(answer?.emoji).toBe(wordVisual(target).emoji)
    expect(wordVisual(target).emoji).toBe('🍚')
  })
})

describe('backup', () => {
  it('rejects payloads that are not version-1 backups', () => {
    expect(() => parseBackup('{}')).toThrow()
    expect(() => parseBackup('not-json')).toThrow()
  })
})
