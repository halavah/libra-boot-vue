import { createRouter, createWebHistory } from 'vue-router';
import Home from '../Home.vue'; // 列表页面组件
import AdminLayout from '../layouts/index.vue'; // 嵌套布局组件

// 使用 import.meta.glob 动态查找 src/views/ 下两级子目录中的 index.vue 文件
// eager: false (默认) 返回动态导入函数 () => import(...)，实现路由懒加载
// 模式 '/src/views/*/*/index.vue' 匹配 src/views/模块名/组件名/index.vue
const viewModules = import.meta.glob('/src/views/*/*/index.vue');

// 动态生成路由配置
const dynamicRoutes = Object.keys(viewModules).map((path) => {
  // 从路径 '/src/views/模块名/组件名/index.vue' 中提取 '模块名' 和 '组件名'
  // 例如: /src/views/element/demo1/index.vue -> moduleName='element', componentName='demo1'
  const nameMatch = path.match(/\/src\/views\/(.*?)\/(.*?)\/index\.vue$/);
  const moduleName = nameMatch ? nameMatch[1] : ''; // 功能模块名
  const componentName = nameMatch ? nameMatch[2] : ''; // 具体组件名

  // 构造内部路由名称，例如 'ElementDemo1' (保持唯一性)
  const routeName = (moduleName.charAt(0).toUpperCase() + moduleName.slice(1)) +
    (componentName.charAt(0).toUpperCase() + componentName.slice(1));

  // 构造用于显示的标题，直接使用从路径中提取的小写组件名，例如 'demo1', 'cjsbgzms'
  const displayTitle = componentName; // 直接使用小写组件名

  return {
    // 路由路径使用 /模块名/组件名 格式，例如 /element/demo1
    path: `/${moduleName}/${componentName}`,
    // 路由名称使用组合名称，确保内部跳转逻辑的唯一性
    name: routeName,
    // 组件使用动态导入函数，实现懒加载
    component: viewModules[path],
    // 添加 meta 字段，用于存储显示信息等
    meta: {
      title: displayTitle, // 用于 UI 显示的标题
      module: moduleName // 可以选择性地保留模块名信息，方便 UI 分组
    }
  };
});

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
