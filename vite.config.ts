// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// const path = require('path'); // If you need path for __dirname etc.

export default defineConfig({
  plugins: [react()],
  base: "/giftcash/",
  define: {
    // Определяем global и process.env глобально
    'global': 'globalThis',
    'process.env': '{}', // Или 'process.env': JSON.stringify(process.env) если нужны реальные env переменные
  },
  resolve: {
    alias: {
      // Важно: Этот алиас нужен, чтобы 'buffer' (который может быть запрошен внутренне)
      // указывал на пакет 'buffer'.
      'buffer': 'buffer',
      // Дополнительно: Если есть проблемы с другими Node.js модулями, можно добавить
      // 'stream': 'stream-browserify',
      // 'util': 'util',
      // и т.д., после установки соответствующих пакетов.
    },
  },
  // build: {
  //   rollupOptions: {
  //     external: ['/src/main.tsx'], // Или другие файлы, которые не должны быть частью основного бандла
  //   },
  // },
});