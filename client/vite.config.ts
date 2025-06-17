// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Garante que o servidor Vite escute em todas as interfaces de rede.
    // Isso é importante para que o ngrok consiga se conectar a ele.
    host: true,

    // 2. Permite explicitamente os hosts do ngrok, como a mensagem de erro pede.
    // Usar ".ngrok-free.app" deve funcionar como um padrão para aceitar qualquer
    // subdomínio que termine com essa string.
    allowedHosts: [
      '.ngrok-free.app'
    ],
    
    // 3. O proxy permanece o mesmo, para conectar com o backend.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})