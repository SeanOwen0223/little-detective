import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/little-detective/', // <--- MAKE SURE THIS MATCHES YOUR REPO NAME
  plugins: [
    react(),
    tailwindcss(),
  ],
})