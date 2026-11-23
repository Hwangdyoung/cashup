import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 상대 경로로 빌드해야 dist 폴더를 어디에 올려도(정적 호스팅·Artifact) 그대로 열린다
  base: './',
  server: { port: 5174 },
  test: {
    environment: 'jsdom',
  },
});
