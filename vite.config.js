import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.svg', 'icon-512.svg', 'icons.svg'],
      manifest: {
        name: 'Apparel Creations',
        short_name: 'Apparel',
        description: 'ระบบบันทึกข้อมูลการผลิตเสื้อผ้า',
        theme_color: '#1a5276',
        background_color: '#f4f6f9',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  root: 'frontend',
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
