import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 相对路径：页面地址用 hash，部署到 GitHub Pages 子路径或本地打开都不用改配置
  base: './',
  plugins: [react()],
  // three.js 整包约 1 MB，只在 3D 课按需加载
  build: { chunkSizeWarningLimit: 1100 },
})
