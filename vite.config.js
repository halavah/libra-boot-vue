import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'

export default defineConfig(({command, mode}) => {

  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [
      vue()
    ],
    css: {
      devSourcemap: true, // 开启 CSS sourcemap 调试
    },
    server: {
      // 监听所有地址，使得可以通过 IP 访问
      host: '0.0.0.0',
      // 设置服务端口为 5173
      port: 5173,
      // 不自动打开链接
      open: false,
      // 配置静态文件处理
      fs: {
        // 允许访问项目根目录
        allow: ['..']
      },
      // 代理设置
      proxy: {
        '/dev-api': {
          // 你可以为它设置一个不同的 target，比如一个API网关
          // target: 'http://127.0.0.1:9000',
          target: 'http://127.0.0.1:9941', // 或者使用和上面相同的 target
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ''), // 只去掉 /dev-api 前缀
        },

        // 你原来的其他代理规则可以继续放在这里
        '/piscesboot': {
          target: 'http://localhost:9994/pisces-boot',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/piscesboot/, ''),
        },
      }
    },
    // 如果需要生产环境 sourcemap，取消下面的注释
    build: {
      sourcemap: true,
    }
  }
})
