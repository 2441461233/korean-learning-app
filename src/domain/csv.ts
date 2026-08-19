import type { Pos, Word } from './types'

const POS_SET = new Set<Pos>([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'particle',
  'expression',
  'number',
  'pronoun',
])

export function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      out.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur.trim())
  return out
}

function normalizePos(raw: string): Pos {
  const v = raw.trim().toLowerCase()
  if (POS_SET.has(v as Pos)) return v as Pos
  const zh: Record<string, Pos> = {
    名词: 'noun',
    动词: 'verb',
    形容词: 'adjective',
    副词: 'adverb',
    助词: 'particle',
    表达: 'expression',
    数词: 'number',
    代词: 'pronoun',
  }
  return zh[raw.trim()] ?? 'noun'
}

export interface CsvWordDraft {
  hangul: string
  meaningZh: string
  romanization: string
  hanja: string
  pos: Pos
  exampleKo: string
  exampleZh: string
  imagePrompt: string
}

export function parseWordCsv(text: string): CsvWordDraft[] {
  const raw = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return []

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
  const looksLikeHeader =
    header.includes('hangul') || header.includes('谚文') || header.includes('韩语')
  const start = looksLikeHeader ? 1 : 0
  const idx = (names: string[], fallback: number) => {
    const found = names
      .map((n) => header.indexOf(n))
      .find((i) => i >= 0)
    return found ?? fallback
  }

  const iHangul = looksLikeHeader ? idx(['hangul', '谚文', '韩语'], 0) : 0
  const iZh = looksLikeHeader ? idx(['meaning_zh', '中文', '释义'], 1) : 1
  const iRom = looksLikeHeader ? idx(['romanization', '罗马音'], 2) : 2
  const iHanja = looksLikeHeader ? idx(['hanja', '汉字'], 3) : 3
  const iPos = looksLikeHeader ? idx(['pos', '词性'], 4) : 4
  const iExKo = looksLikeHeader ? idx(['example_ko', '例句'], 5) : 5
  const iExZh = looksLikeHeader ? idx(['example_zh', '例句翻译'], 6) : 6
  const iPrompt = looksLikeHeader ? idx(['image_prompt', '配图'], 7) : 7

  const drafts: CsvWordDraft[] = []
  for (const line of lines.slice(start)) {
    const cols = parseCsvLine(line)
    const hangul = cols[iHangul] ?? ''
    const meaningZh = cols[iZh] ?? ''
    if (!hangul || !meaningZh) continue
    drafts.push({
      hangul,
      meaningZh,
      romanization: cols[iRom] ?? '',
      hanja: cols[iHanja] ?? '',
      pos: normalizePos(cols[iPos] ?? 'noun'),
      exampleKo: cols[iExKo] ?? '',
      exampleZh: cols[iExZh] ?? '',
      imagePrompt: cols[iPrompt] ?? `温暖插画：${meaningZh}，韩国日常生活`,
    })
  }
  return drafts
}

export function draftsToWords(bookId: string, drafts: CsvWordDraft[]): Word[] {
  return drafts.map((draft) => ({
    id: `${bookId}:${crypto.randomUUID()}`,
    bookId,
    hangul: draft.hangul,
    romanization: draft.romanization,
    meaningZh: draft.meaningZh,
    hanja: draft.hanja,
    pos: draft.pos,
    exampleKo: draft.exampleKo,
    exampleZh: draft.exampleZh,
    imagePrompt: draft.imagePrompt || `温暖插画：${draft.meaningZh}，韩国日常生活`,
    theme: 'custom',
  }))
}
