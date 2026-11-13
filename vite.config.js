import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {viteMockServe} from 'vite-plugin-mock'
import {resolve} from 'path'

export default defineConfig(({command, mode}) => {

  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [
      vue(),
      viteMockServe({
        enable: true, // 是否开启
        logger: true, // 显示Mock日志
        supportTs: false, // 不使用TypeScript
        injectCode: `
          import { setupProdMockServer } from './mock/mockProdServer';
          setupProdMockServer();
        `,
      })
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
        // // 规则一：处理 /dev-api/onboard/ 的请求（更具体的规则，必须放在前面）
        // // 它会匹配所有以 /dev-api/onboard 开头的请求
        // '/dev-api/onboard': {
        //   target: 'http://127.0.0.1:9931', // 假设 onboard 服务的地址是这个
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/dev-api\/onboard/, ''), // 重点：将 /dev-api/onboard 整个去掉
        // },

        // // 规则二：处理所有其他的 /dev-api/ 请求（通用规则，放在后面作为回退）
        // // 它会匹配所有其他以 /dev-api 开头的请求
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
