import { hashString } from '@/domain/hash'
import type { Word } from '@/domain/types'

const THEMES: Record<string, { emoji: string; bg: string; accent: string }> = {
  greetings: { emoji: '👋', bg: '#FFE0D6', accent: '#E14B36' },
  family: { emoji: '👨‍👩‍👧', bg: '#FFE8C9', accent: '#C07A2E' },
  people: { emoji: '🙂', bg: '#FFE4D2', accent: '#B96A3C' },
  numbers: { emoji: '🔢', bg: '#D6E7FB', accent: '#3D6FB8' },
  time: { emoji: '⏰', bg: '#E7DCFA', accent: '#6F4FAD' },
  food: { emoji: '🍜', bg: '#FFE6BE', accent: '#C4722A' },
  drink: { emoji: '🧋', bg: '#FBD9CE', accent: '#B45A4B' },
  shopping: { emoji: '🛍️', bg: '#FBDAE8', accent: '#B44E83' },
  travel: { emoji: '✈️', bg: '#D6F0FB', accent: '#2F86B0' },
  transport: { emoji: '🚇', bg: '#DFE8F6', accent: '#44628C' },
  home: { emoji: '🏠', bg: '#E4F3D4', accent: '#5F8A34' },
  daily: { emoji: '☀️', bg: '#FFF1C4', accent: '#BF8E1E' },
  body: { emoji: '💪', bg: '#FFDCD3', accent: '#B54E40' },
  health: { emoji: '💊', bg: '#D9F2E5', accent: '#2F8A70' },
  school: { emoji: '📚', bg: '#DBE5FB', accent: '#405CAB' },
  work: { emoji: '💼', bg: '#EAE4D8', accent: '#71654F' },
  weather: { emoji: '🌧️', bg: '#D7EDF7', accent: '#3C7C98' },
  nature: { emoji: '🌿', bg: '#E0F3D5', accent: '#4C8A32' },
  clothes: { emoji: '👕', bg: '#F0DCFA', accent: '#8A4CAD' },
  color: { emoji: '🎨', bg: '#FBE0EE', accent: '#B04A82' },
  emotion: { emoji: '😊', bg: '#FFF3C4', accent: '#BF921C' },
  verb: { emoji: '🏃', bg: '#D9F0FB', accent: '#2F7AA6' },
  adjective: { emoji: '✨', bg: '#FFE9D3', accent: '#C06B3A' },
  place: { emoji: '📍', bg: '#FBDEC9', accent: '#B05F2F' },
  city: { emoji: '🏙️', bg: '#E1E7F5', accent: '#4C5C88' },
  culture: { emoji: '🎭', bg: '#F9E2D2', accent: '#B05B3C' },
  society: { emoji: '🏛️', bg: '#E9E3D6', accent: '#70654F' },
  exam: { emoji: '📝', bg: '#E2EBFB', accent: '#3F5CAD' },
  animal: { emoji: '🐱', bg: '#FFE6C4', accent: '#C07E20' },
  custom: { emoji: '⭐', bg: '#F7EDDC', accent: '#B45C40' },
}

const GLYPHS = [
  '👋', '🌸', '🍚', '🍜', '☕', '🍵', '🍞', '🍎', '🚌', '🚇', '✈️', '🏠', '🌙', '☀️',
  '📚', '✏️', '💼', '👕', '👟', '🎧', '📱', '🔑', '🛏️', '🚿', '💊', '💪', '🐱', '🐶',
  '🌧️', '❄️', '🌊', '⛰️', '🌳', '🎁', '💰', '🛒', '📷', '🎬', '🎵', '⚽', '🎯', '⏰',
  '❤️', '😊', '😢', '🔥', '⭐', '🧭', '🗺️', '🚪', '🪟', '🪞', '🧺', '🧼', '🦷', '🧠',
  '🤝', '👶', '👨', '👩', '🏫', '🏥', '🏦', '🏪', '🏝️', '🚗', '🚲', '🚢', '🎟️', '📦',
  '🧋', '🛍️', '🌿', '🎨', '🏃', '✨', '📍', '🏙️', '🎭', '📝', '🙂', '🔢',
]

export interface WordLook {
  emoji: string
  bg: string
  accent: string
  from: string
  to: string
  imageUrl?: string
}

export function themeVisual(theme: string) {
  return THEMES[theme] ?? THEMES.custom
}

export function glyphFor(word: Word, offset = 0): string {
  const palette = [...GLYPHS]
  const themeEmoji = themeVisual(word.theme).emoji
  if (!palette.includes(themeEmoji)) palette.unshift(themeEmoji)
  const idx = (hashString(`${word.hangul}:${word.meaningZh}:${word.id}`) + offset) % palette.length
  return palette[idx]
}

export function wordVisual(word: Word): WordLook {
  const colors = themeVisual(word.theme)
  return {
    emoji: glyphFor(word),
    bg: colors.bg,
    accent: colors.accent,
    from: colors.bg,
    to: colors.accent,
    imageUrl: word.imageUrl,
  }
}

export function uniqueVisuals(words: Word[]): Map<string, WordLook> {
  const used = new Set<string>()
  const map = new Map<string, WordLook>()
  for (const word of words) {
    const colors = themeVisual(word.theme)
    let offset = 0
    let emoji = glyphFor(word, offset)
    while (used.has(emoji) && offset < GLYPHS.length) {
      offset += 1
      emoji = glyphFor(word, offset)
    }
    used.add(emoji)
    map.set(word.id, {
      emoji,
      bg: colors.bg,
      accent: colors.accent,
      from: colors.bg,
      to: colors.accent,
      imageUrl: word.imageUrl,
    })
  }
  return map
}
