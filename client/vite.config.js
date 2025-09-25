import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/Modals': path.resolve(__dirname, './src/Modals'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/context': path.resolve(__dirname, './src/context'),
    }
  }
})
