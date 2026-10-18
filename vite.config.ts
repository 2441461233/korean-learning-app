/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // Audio is cached as it is heard, not downloaded with the whole app.
        runtimeCaching: [{
          urlPattern: /\/audio\/ko\/[a-f0-9]+\.mp3$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'korean-natural-speech-v1',
            cacheableResponse: { statuses: [200] },
            expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
            rangeRequests: true,
          },
        }],
      },
      manifest: {
        name: '韩语单词',
        short_name: '韩语单词',
        description: '视觉化韩语单词学习',
        theme_color: '#E85D4C',
        background_color: '#F6EFE4',
        display: 'standalone',
        lang: 'zh-CN',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
  },
})
