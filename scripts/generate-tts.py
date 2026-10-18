"""Generate resumable, same-origin Korean audio for the static site.

Run with: uv run --with edge-tts==7.3.1 python scripts/generate-tts.py
Set TTS_PROXY to an HTTP proxy only when your network requires one.
"""

import asyncio
import hashlib
import json
import os
from pathlib import Path
import subprocess

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
VOICE = 'ko-KR-SunHiNeural'
RATE = '-5%'
OUTPUT = ROOT / 'public/audio/ko'
MANIFEST = ROOT / 'src/audio/generated/manifest.json'


async def main():
    subprocess.run(['node', 'scripts/export-tts-corpus.mjs'], cwd=ROOT, check=True)
    texts = json.loads((ROOT / 'node_modules/.cache/tts/corpus.json').read_text())
    OUTPUT.mkdir(parents=True, exist_ok=True)
    semaphore = asyncio.Semaphore(8)
    completed = 0
    clips = {}

    async def generate(text):
        nonlocal completed
        digest = hashlib.sha256(f'{VOICE}\n{RATE}\n{text}'.encode()).hexdigest()[:20]
        filename = f'{digest}.mp3'
        path = OUTPUT / filename
        clips[text] = filename
        async with semaphore:
            if not path.exists() or path.stat().st_size < 1000:
                temporary = path.with_suffix('.part')
                for attempt in range(4):
                    try:
                        speech = edge_tts.Communicate(
                            text, VOICE, rate=RATE,
                            proxy=os.environ.get('TTS_PROXY'),
                            connect_timeout=15, receive_timeout=30,
                        )
                        await asyncio.wait_for(speech.save(str(temporary)), timeout=60)
                        if temporary.stat().st_size < 1000:
                            raise ValueError('Empty or incomplete audio')
                        temporary.replace(path)
                        break
                    except Exception:
                        temporary.unlink(missing_ok=True)
                        if attempt == 3:
                            raise
                        await asyncio.sleep(2 ** (attempt + 1))
            completed += 1
            if completed % 50 == 0 or completed == len(texts):
                print(f'Audio ready: {completed}/{len(texts)}', flush=True)

    await asyncio.gather(*(generate(text) for text in texts))
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    temporary_manifest = MANIFEST.with_suffix('.json.part')
    temporary_manifest.write_text(json.dumps({
        'voice': VOICE, 'rate': RATE, 'clips': dict(sorted(clips.items())),
    }, ensure_ascii=False, indent=2) + '\n')
    temporary_manifest.replace(MANIFEST)
    total = sum((OUTPUT / name).stat().st_size for name in clips.values())
    print(f'Complete: {len(clips)} clips, {total / 1024 / 1024:.1f} MiB. Manifest updated.', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
