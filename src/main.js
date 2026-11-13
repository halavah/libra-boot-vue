// vue
import { createApp } from 'vue';
import App from './App.vue';
// 路由
import router from './router';
// Pinia 状态管理
import { createPinia } from 'pinia';
// 全局样式
import '/public/styles/global.css';
// import '/public/styles/index.scss';

// ==================== 通用样式（可选，按需导入） ====================
// 导入通用工具类样式（padding, margin 等）
// import '@/assets/styles/common.scss';
// 导入 SCSS 变量
// import '@/assets/styles/variables.module.scss';
// 导入 SCSS 混入
// import '@/assets/styles/mixin.scss';
// 使用方式：直接在模板中使用类名，如 <div class="mt10 mb20">

// ==================== 全局插件（可选，按需导入） ====================
// 导入并安装全局插件（缓存、弹窗等工具）
// import installPlugins from '@/plugins';
// 安装后可在组件中使用：this.$cache, this.$modal, this.msgSuccess() 等
// 详细文档请查看：src/plugins/README.md

// ==================== 全局混入（可选，在组件中按需使用） ====================
// 注意：mixins 不需要在 main.js 中全局导入，在具体组件中按需使用
// 使用示例：
// import BaseMixins from '@/mixins/BaseMixins';
// import ListMixins from '@/mixins/ListMixins';
// import Standard from '@/mixins/Standard';
// export default {
//   mixins: [BaseMixins, ListMixins, Standard],
//   // ...
// }
// 详细文档请查看：src/mixins/README.md

// ant-desigin-vue
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
// element
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// dayjs
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'

dayjs.locale('zh-cn')
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(Antd);
app.use(ElementPlus);
app.use(router);

// ==================== 安装全局插件（示例） ====================
// 取消下面的注释以启用全局插件
// installPlugins(app);

app.mount('#app');
