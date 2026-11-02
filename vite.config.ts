import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// BASE_PATH is set when building for GitHub Pages (served under /cenove_ponuky/).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 5173 },
})
