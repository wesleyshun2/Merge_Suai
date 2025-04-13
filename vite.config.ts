import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html', // 主頁面
        profile: 'profile.html', // 新增 profile.html 作為入口
      },
    },
  },
});
