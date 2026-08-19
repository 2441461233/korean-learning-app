import { useState } from 'react'
import { Link } from 'react-router-dom'
import { draftsToWords, parseWordCsv } from '@/domain/csv'
import { clearUserProgress, db, exportBackup, importBackup, patchSettings } from '@/db/database'
import { useSettings } from '@/db/hooks'
import { DoodleSquiggle, IconMinus, IconPlus } from '@/ui/components/doodles'
import { Screen } from '@/ui/layout/AppShell'

export function SettingsPage() {
  const settings = useSettings()
  const [message, setMessage] = useState('')

  if (!settings) {
    return (
      <Screen>
        <div className="text-muted">载入设置…</div>
      </Screen>
    )
  }

  async function downloadBackup() {
    const json = await exportBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `korean-words-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function restore(file: File) {
    try {
      await importBackup(await file.text())
      setMessage('备份已恢复。')
    } catch {
      setMessage('无法读取这份备份。')
    }
  }

  async function importCsv(file: File) {
    const drafts = parseWordCsv(await file.text())
    if (!drafts.length) {
      setMessage('CSV 里没有有效单词。')
      return
    }
    const id = `userbook:${crypto.randomUUID()}`
    await db.books.add({
      id,
      title: file.name.replace(/\.csv$/i, '') || '导入词书',
      description: '从 CSV 导入',
      kind: 'user',
      theme: 'custom',
      enabled: true,
      createdAt: Date.now(),
    })
    await db.words.bulkAdd(draftsToWords(id, drafts))
    setMessage(`已导入 ${drafts.length} 个词。`)
  }

  return (
    <Screen>
      <h1 className="font-display text-3xl">我的</h1>
      <DoodleSquiggle className="mt-0.5 h-3 w-12 text-coral" />

      <section className="sticker-card mt-5 p-4" style={{ rotate: '0.4deg' }}>
        <div className="font-display text-lg">每日目标</div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            className="btn-press grid h-10 w-10 place-items-center rounded-full bg-paper-2"
            onClick={() => patchSettings({ dailyGoal: Math.max(5, settings.dailyGoal - 5) })}
            aria-label="减少目标"
          >
            <IconMinus className="h-4 w-4" />
          </button>
          <div className="font-display text-2xl">{settings.dailyGoal}</div>
          <button
            type="button"
            className="btn-press grid h-10 w-10 place-items-center rounded-full bg-paper-2"
            onClick={() => patchSettings({ dailyGoal: Math.min(80, settings.dailyGoal + 5) })}
            aria-label="增加目标"
          >
            <IconPlus className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted">张 / 天</span>
        </div>
        <div className="mt-4 text-sm text-muted">每天新学上限</div>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="btn-press grid h-10 w-10 place-items-center rounded-full bg-paper-2"
            onClick={() => patchSettings({ newCardsPerDay: Math.max(3, settings.newCardsPerDay - 1) })}
            aria-label="减少新学上限"
          >
            <IconMinus className="h-4 w-4" />
          </button>
          <div className="font-display text-xl">{settings.newCardsPerDay}</div>
          <button
            type="button"
            className="btn-press grid h-10 w-10 place-items-center rounded-full bg-paper-2"
            onClick={() => patchSettings({ newCardsPerDay: Math.min(30, settings.newCardsPerDay + 1) })}
            aria-label="增加新学上限"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="sticker-card mt-3 p-4">
        <Link to="/hangul" className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg">韩文字母课</div>
            <div className="text-sm text-muted">辅音、元音、拼音节和韵尾</div>
          </div>
          <span className="text-sm font-semibold text-coral">打开</span>
        </Link>
      </section>

      <section className="sticker-card mt-3 p-4" style={{ rotate: '-0.4deg' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg">朗读发音</div>
            <div className="text-sm text-muted">使用系统韩语语音</div>
          </div>
          <button
            type="button"
            onClick={() => patchSettings({ ttsEnabled: !settings.ttsEnabled })}
            className={`h-8 w-14 rounded-full p-1 transition-colors ${settings.ttsEnabled ? 'bg-coral' : 'bg-paper-2'}`}
            aria-label="切换朗读"
          >
            <span
              className={`block h-6 w-6 rounded-full bg-white shadow-sticker transition-transform ${
                settings.ttsEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </section>

      <section className="sticker-card mt-3 p-4">
        <div className="font-display text-lg">AI 配图（二期）</div>
        <p className="mt-1 text-sm text-muted">词卡已预留配图字段。以后填入密钥即可生成真正的记忆图。</p>
        <input
          value={settings.imageApiKey}
          onChange={(e) => patchSettings({ imageApiKey: e.target.value })}
          placeholder="API Key（可选预留）"
          className="input-paper mt-3 w-full px-3 py-3 text-sm"
        />
      </section>

      <section className="sticker-card mt-3 space-y-2 p-4">
        <div className="font-display text-lg">数据</div>
        <button type="button" onClick={() => void downloadBackup()} className="btn-press w-full rounded-xl bg-paper-2 py-3 font-semibold">
          导出 JSON 备份
        </button>
        <label className="btn-press block w-full cursor-pointer rounded-xl bg-paper-2 py-3 text-center font-semibold">
          恢复备份
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void restore(file)
              e.target.value = ''
            }}
          />
        </label>
        <label className="btn-press block w-full cursor-pointer rounded-xl bg-paper-2 py-3 text-center font-semibold">
          导入 CSV 为新词书
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void importCsv(file)
              e.target.value = ''
            }}
          />
        </label>
        <button
          type="button"
          onClick={async () => {
            if (window.confirm('清除学习进度？词书还会留着。')) {
              await clearUserProgress()
              setMessage('进度已清空。')
            }
          }}
          className="w-full rounded-xl py-3 font-semibold text-again"
        >
          清空学习进度
        </button>
      </section>
      {message ? <p className="mt-3 text-sm text-leaf">{message}</p> : null}
      <p className="mt-6 text-center text-xs text-muted">韩语单词 MVP · 数据保存在本机浏览器</p>
    </Screen>
  )
}
