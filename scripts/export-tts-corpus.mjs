import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = resolve(root, 'node_modules/.cache/tts/corpus.json')
const server = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
  resolve: { alias: { '@': resolve(root, 'src') } },
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
})

try {
  const { builtinWords } = await server.ssrLoadModule('/src/data/catalog.ts')
  const { HANGUL_LESSONS } = await server.ssrLoadModule('/src/data/hangul.ts')
  const { normalizeSpeechText, hangulSpeechText, TTS_PREVIEW_TEXT } =
    await server.ssrLoadModule('/src/audio/speechText.ts')
  const texts = [
    TTS_PREVIEW_TEXT,
    ...builtinWords.flatMap((word) => [word.hangul, word.exampleKo]),
    ...HANGUL_LESSONS.flatMap((lesson) => lesson.letters.map(hangulSpeechText)),
  ]
  const corpus = [...new Set(texts.map(normalizeSpeechText).filter(Boolean))].sort()
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, JSON.stringify(corpus, null, 2) + '\n')
  console.log(`Exported ${corpus.length} utterances from ${builtinWords.length} words and the letter lessons.`)
} finally {
  await server.close()
}
