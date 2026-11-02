import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// BASE_PATH is set when building for GitHub Pages (served under /cenove_ponuky/).
// VITE_ARTIFACT=1 builds one inlinable bundle for the claude.ai artifact preview.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 5173 },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: process.env.VITE_ARTIFACT === '1' ? { output: { inlineDynamicImports: true } } : {},
  },
})
