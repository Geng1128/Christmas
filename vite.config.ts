import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⚠️ 把 '<你的仓库名>' 换成你在 GitHub 仓库的实际名字
  // 例如：base: '/christmas-tree/',
  base: '/Christmas/', 
})