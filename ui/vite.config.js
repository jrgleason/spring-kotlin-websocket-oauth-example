import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import Sitemap from 'vite-plugin-sitemap';
import path from 'path'
import { fileURLToPath } from 'url'

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), Sitemap({
    outDir: path.resolve(__dirname, '../app/src/main/resources/static')
  })],
  watch: {
    include: 'src/**'
  },
  build: {
    sourcemap: true,
    emptyOutDir: true,
    outDir: '../app/src/main/resources/static'
  }
})
