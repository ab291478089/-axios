import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import {join} from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  
  ],
  resolve: {
    alias: {
      '@': join(__dirname,"src")
    }
  },
  server: { //主要是加上这段代码
    host: 'localhost',
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',	//实际请求地址
        changeOrigin: true,
      },
    }
  }
})
