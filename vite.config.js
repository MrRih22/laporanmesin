import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['talo.png', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'MTC Ticketing System - PT Tatalogam Lestari',
        short_name: 'MTC Tatalogam',
        description: 'Sistem pemantauan dan pelaporan kerusakan mesin pabrik real-time',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/talo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/talo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})