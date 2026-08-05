import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_PORT) || 5173,
      open: false,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, '')
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    }
  }
})
