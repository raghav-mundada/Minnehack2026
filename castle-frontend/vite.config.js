import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/join-group': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/create-group': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/groups': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/group': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/leaderboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ingest': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
