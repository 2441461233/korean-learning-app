import type { Pos, Word } from '@/domain/types'

const POS = new Set<string>([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'particle',
  'expression',
  'number',
  'pronoun',
])

export function parseSeedText(bookId: string, text: string): Word[] {
  const words: Word[] = []
  const seen = new Set<string>()
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const parts = line.split('|')
    if (parts.length < 8) continue
    const [hangul, romanization, meaningZh, hanja, posRaw, exampleKo, exampleZh, theme] = parts
    const pos = (POS.has(posRaw.trim()) ? posRaw.trim() : 'noun') as Pos
    const base = `${bookId}:${hangul}:${meaningZh}`
    let id = base
    let n = 2
    while (seen.has(id)) {
      id = `${base}:${n}`
      n += 1
    }
    seen.add(id)
    words.push({
      id,
      bookId,
      hangul: hangul.trim(),
      romanization: romanization.trim(),
      meaningZh: meaningZh.trim(),
      hanja: (hanja ?? '').trim(),
      pos,
      exampleKo: exampleKo.trim(),
      exampleZh: exampleZh.trim(),
      theme: theme.trim(),
      imagePrompt: `温暖生活化插画，表现「${meaningZh.trim()}」，韩国日常场景，柔和光线，干净构图，不要文字`,
    })
  }
  return words
}

