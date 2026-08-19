import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { draftsToWords, parseWordCsv } from '@/domain/csv'
import { db } from '@/db/database'
import { useBooks, useWordsByBook } from '@/db/hooks'
import type { Pos } from '@/domain/types'
import { POS_LABEL } from '@/domain/types'
import { IconArrowLeft, IconPencil } from '@/ui/components/doodles'
import { Screen } from '@/ui/layout/AppShell'

const POS_OPTIONS = Object.keys(POS_LABEL) as Pos[]

export function BookDetailPage() {
  const { bookId } = useParams()
  const resolvedBookId = bookId ?? ''
  const books = useBooks()
  const words = useWordsByBook(bookId)
  const book = books?.find((b) => b.id === resolvedBookId)
  const [adding, setAdding] = useState(false)
  const [csvError, setCsvError] = useState('')
  const [form, setForm] = useState({
    hangul: '',
    meaningZh: '',
    romanization: '',
    hanja: '',
    pos: 'noun' as Pos,
    exampleKo: '',
    exampleZh: '',
    imagePrompt: '',
  })

  if (!resolvedBookId || !books || !words) {
    return (
      <Screen>
        <div className="text-muted">载入词书…</div>
      </Screen>
    )
  }

  if (!book) {
    return (
      <Screen>
        <Link to="/books" className="flex items-center gap-1 text-sm text-muted">
          <IconArrowLeft className="h-4 w-4" />
          词书
        </Link>
        <p className="mt-6">找不到这本词书。</p>
      </Screen>
    )
  }

  const id = resolvedBookId
  const canEdit = book.kind === 'user'

  async function addWord(event: FormEvent) {
    event.preventDefault()
    if (!form.hangul.trim() || !form.meaningZh.trim()) return
    const [word] = draftsToWords(id, [
      {
        hangul: form.hangul.trim(),
        meaningZh: form.meaningZh.trim(),
        romanization: form.romanization.trim(),
        hanja: form.hanja.trim(),
        pos: form.pos,
        exampleKo: form.exampleKo.trim(),
        exampleZh: form.exampleZh.trim(),
        imagePrompt: form.imagePrompt.trim() || `温暖插画：${form.meaningZh.trim()}`,
      },
    ])
    await db.words.add(word)
    setForm({
      hangul: '',
      meaningZh: '',
      romanization: '',
      hanja: '',
      pos: 'noun',
      exampleKo: '',
      exampleZh: '',
      imagePrompt: '',
    })
    setAdding(false)
  }

  async function onCsv(file: File) {
    setCsvError('')
    const text = await file.text()
    const drafts = parseWordCsv(text)
    if (!drafts.length) {
      setCsvError('没有解析到单词。请确认含 hangul 与中文释义两列。')
      return
    }
    await db.words.bulkAdd(draftsToWords(id, drafts))
    setCsvError(`已导入 ${drafts.length} 个词。`)
  }

  return (
    <Screen>
      <Link to="/books" className="flex items-center gap-1 text-sm text-muted">
        <IconArrowLeft className="h-4 w-4" />
        词书
      </Link>
      <h1 className="font-display mt-3 text-3xl">{book.title}</h1>
      <p className="mt-2 text-sm text-muted">{book.description}</p>
      <span className="chip-washi mt-2 -rotate-1 bg-skyblue">{words.length} 个单词</span>

      {canEdit ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="btn-press flex items-center gap-1.5 rounded-2xl bg-coral px-4 py-3 text-sm font-semibold text-white"
          >
            <IconPencil className="h-4 w-4" />
            手动加词
          </button>
          <label className="btn-press sticker-card cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold">
            导入 CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void onCsv(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      ) : null}
      {csvError ? (
        <p className={`mt-2 text-sm ${csvError.startsWith('已导入') ? 'text-leaf' : 'text-again'}`}>{csvError}</p>
      ) : null}

      {adding ? (
        <form onSubmit={addWord} className="sticker-card relative mt-4 space-y-2 p-4">
          <span className="tape tape-pink" style={{ top: -11, left: 24, rotate: '-5deg' }} />
          <Field label="韩语" value={form.hangul} onChange={(v) => setForm({ ...form, hangul: v })} required />
          <Field label="中文" value={form.meaningZh} onChange={(v) => setForm({ ...form, meaningZh: v })} required />
          <Field label="罗马音" value={form.romanization} onChange={(v) => setForm({ ...form, romanization: v })} />
          <Field label="汉字词" value={form.hanja} onChange={(v) => setForm({ ...form, hanja: v })} />
          <label className="block text-sm">
            词性
            <select
              value={form.pos}
              onChange={(e) => setForm({ ...form, pos: e.target.value as Pos })}
              className="input-paper mt-1 w-full px-3 py-3"
            >
              {POS_OPTIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {POS_LABEL[pos]}
                </option>
              ))}
            </select>
          </label>
          <Field label="例句" value={form.exampleKo} onChange={(v) => setForm({ ...form, exampleKo: v })} />
          <Field label="例句翻译" value={form.exampleZh} onChange={(v) => setForm({ ...form, exampleZh: v })} />
          <button type="submit" className="btn-press w-full rounded-2xl bg-coral py-3 font-semibold text-white">
            保存
          </button>
        </form>
      ) : null}

      <div className="sticker-card mt-5 divide-y divide-dashed divide-paper-2 overflow-hidden">
        {words.map((word) => (
          <div key={word.id} className="flex items-baseline justify-between gap-3 px-4 py-3">
            <div>
              <div className="font-kr text-lg">{word.hangul}</div>
              <div className="text-sm text-muted">{word.meaningZh}</div>
            </div>
            <div className="text-xs text-muted">{word.romanization}</div>
          </div>
        ))}
      </div>
    </Screen>
  )
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="input-paper mt-1 w-full px-3 py-3"
      />
    </label>
  )
}
