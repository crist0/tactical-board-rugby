import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // SCSS variables are available globally via this import
        additionalData: `@use "/src/assets/styles/variables.scss" as *;`
      }
    }
  }
})
