import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
   preview: {
    host: "0.0.0.0",
    port: process.env.PORT || 4173, allowedHosts: ["tambola-frontend-ycaj.onrender.com"],
   }, 
  plugins: [react(), tailwindcss()],
})
