import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '@/db/database'
import { useBooks, useWords } from '@/db/hooks'
import type { WordBook } from '@/domain/types'
import { themeVisual } from '@/images/provider'
import { DoodleSquiggle, IconCheck, IconPlus } from '@/ui/components/doodles'
import { Screen } from '@/ui/layout/AppShell'

export function BooksPage() {
  const books = useBooks()
  const words = useWords()
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')

  if (!books || !words) {
    return (
      <Screen>
        <div className="text-muted">载入词书…</div>
      </Screen>
    )
  }

  async function toggle(book: WordBook) {
    await db.books.update(book.id, { enabled: !book.enabled })
  }

  async function createBook() {
    const name = title.trim() || '我的词书'
    const id = `userbook:${crypto.randomUUID()}`
    await db.books.add({
      id,
      title: name,
      description: '自己添加或导入的单词',
      kind: 'user',
      theme: 'custom',
      enabled: true,
      createdAt: Date.now(),
    })
    setTitle('')
    setCreating(false)
  }

  return (
    <Screen>
      <h1 className="font-display text-3xl">词书</h1>
      <DoodleSquiggle className="mt-0.5 h-3 w-14 text-coral" />
      <p className="mt-2 text-sm text-muted">打开的词书会进入今日学习队列。</p>
      <div className="mt-5 space-y-3">
        {books.map((book, i) => {
          const count = words.filter((w) => w.bookId === book.id).length
          const accent = themeVisual(book.theme).accent
          return (
            <div
              key={book.id}
              className="sticker-card flex overflow-hidden"
              style={{ rotate: `${i % 2 === 0 ? -0.4 : 0.4}deg` }}
            >
              <span className="w-2 shrink-0" style={{ background: accent }} />
              <div className="flex min-w-0 flex-1 items-start justify-between gap-3 p-4">
                <Link to={`/books/${book.id}`} className="min-w-0 flex-1">
                  <div className="text-lg font-semibold">{book.title}</div>
                  <div className="mt-1 text-sm text-muted">{book.description}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <span>{count} 词</span>
                    <span className={`chip-washi ${book.kind === 'builtin' ? 'bg-skyblue' : 'bg-butter'}`}>
                      {book.kind === 'builtin' ? '预置' : '自建'}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(book)}
                  className={`btn-press flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    book.enabled ? 'bg-coral text-white' : 'bg-paper-2 text-muted'
                  }`}
                >
                  {book.enabled ? <IconCheck className="h-3.5 w-3.5" /> : null}
                  {book.enabled ? '学习中' : '未启用'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {creating ? (
        <div className="sticker-card mt-5 p-4">
          <span className="tape tape-mint" style={{ top: -11, left: 24, rotate: '-6deg' }} />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="词书名称"
            className="input-paper w-full px-3 py-3"
          />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={createBook} className="btn-press flex-1 rounded-xl bg-coral py-3 font-semibold text-white">
              创建
            </button>
            <button type="button" onClick={() => setCreating(false)} className="btn-press flex-1 rounded-xl bg-paper-2 py-3 font-semibold">
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/25 bg-white/60 py-4 font-semibold text-muted transition-colors hover:text-ink"
        >
          <IconPlus className="h-5 w-5" />
          新建词书
        </button>
      )}
    </Screen>
  )
}
