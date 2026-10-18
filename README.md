# 韩语单词

面向中文用户的韩语单词学习 Web App：看图选词 + FSRS 间隔重复。数据保存在浏览器本地。

```bash
npm install
npm run dev
```

- `npm run test` 跑学习引擎测试
- `npm run build` 生产构建

### 韩语发音

内置单词、例句和字母课使用 Microsoft `ko-KR-SunHiNeural` 自然女声，生成语速为 `-5%`。
音频存放在 `public/audio/ko/`，随静态站点一起部署，不需要浏览器语音包、运行时密钥或 TTS 后端。
「我的 → 试听新发音」可以试听。导入的自定义词句若没有对应录音，会使用设备的韩语语音；设备没有韩语语音时会显示提示。
内置录音加载失败会提示重试，不会自动切回系统音色。生产环境按需缓存最近播放的音频（最多 400 条，30 天），已缓存音频可离线重播。

修改词库后重新生成音频：

```bash
# 需要 Python、uv 和可访问 Edge 语音服务的网络
uv run --with edge-tts==7.3.1 python scripts/generate-tts.py
# 需要代理时，通过 TTS_PROXY 指定，不修改系统配置
```

生成器使用 [edge-tts](https://github.com/rany2/edge-tts)，可断点续跑，只有全部成功后才更新音频清单。
音频文件名包含文本、音色和语速的内容哈希；提交时同时提交 `public/audio/ko/` 和 `src/audio/generated/manifest.json`。
生成阶段依赖 Edge 的在线服务；日常学习直接播放本站音频。

推送到 `main` 后会自动部署到 GitHub Pages：https://2441461233.github.io/korean-learning-app/
