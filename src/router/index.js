import { createRouter, createWebHistory } from 'vue-router';
import Home from '../Home.vue'; // 列表页面组件
import AdminLayout from '../layouts/index.vue'; // 嵌套布局组件
import { getSystemConfigByViewFolder } from '@/layouts/config/system-config';

// ======================= 自动路由扫描 =======================
// 扫描所有视图文件夹（支持任意深度）
// 支持：/src/views/**/*.vue, /src/views2/**/*.vue, /src/views3/**/*.vue, ... /src/viewsN/**/*.vue
// 使用 views* 通配符自动匹配所有 views 开头的文件夹
const viewModules = import.meta.glob('/src/views*/**/index.vue', { eager: false });
// =======================================================

console.log('📁 扫描到的视图模块:', Object.keys(viewModules));

// 动态生成路由配置
const dynamicRoutes = Object.keys(viewModules).map((path) => {
  // 跳过模板文件夹
  if (path.includes('/_template/')) {
    return null;
  }

  // 匹配路径：/src/views[数字]?/任意层级/index.vue
  // 例如：/src/views/entrance/recruitment/register/index.vue
  //      /src/views2/module/page/index.vue
  //      /src/views10/module/page/index.vue
  const nameMatch = path.match(/\/src\/(views\d*)\/(.+)\/index\.vue$/);

  if (!nameMatch) {
    return null;
  }

  const viewFolder = nameMatch[1]; // views, views2, views3, ..., viewsN
  const relativePath = nameMatch[2]; // entrance/recruitment/register
  const pathSegments = relativePath.split('/');

  // 获取系统配置
  const systemConfig = getSystemConfigByViewFolder(viewFolder);

  // 生成路由名称：LayoutEntranceRecruitmentRegister
  const routeName = 'Layout' + pathSegments
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

  // 生成页面标题
  const pageTitle = pathSegments[pathSegments.length - 1]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // 提取模块名（第一段路径）
  const moduleName = pathSegments[0];

  return {
    // 路由路径：/entrance/recruitment/register
    path: `/${relativePath}`,
    // 路由名称：LayoutEntranceRecruitmentRegister
    name: routeName,
    // 组件懒加载
    component: viewModules[path],
    // meta 信息
    meta: {
      title: pageTitle,
      module: moduleName,
      system: systemConfig.systemId,
      viewFolder: viewFolder,
      fullPath: `/${relativePath}`
    }
  };
}).filter(Boolean); // 过滤掉 null 值

console.log('🚀 生成的动态路由:', dynamicRoutes.length, '个');

// 最终的路由数组 = 静态路由 + 动态生成的路由 + 嵌套布局路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home, // 列表页面显示在根路径
  },
  // 嵌套布局路由 - 默认不打开任何子页面
  {
    path: '/layout',
    component: AdminLayout,
    children: dynamicRoutes.map(route => ({
      path: route.path.replace(/^\//, ''), // 子路由路径不以 '/'
      name: `Layout${route.name}`, // 避免与顶层路由重名
      component: route.component,
      meta: route.meta
    }))
  },
  // 保持原有的独立页面路由（用于直接访问）
  ...dynamicRoutes,
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用 History 模式
  routes,
});

export default router;