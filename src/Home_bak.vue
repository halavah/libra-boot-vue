<template>
  <div class="home">
    <!-- navigation 区域 -->
    <div class="route-group">
      <h2>navigation</h2>
      <ul>
        <li>
          <a
            href="http://127.0.0.1:5173/layout"
            target="_blank"
            rel="noopener noreferrer"
          >
            layout
          </a>
        </li>
        <li>
          <a
            href="http://127.0.0.1:5173/test/index.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            test：5173
          </a>
        </li>
        <li>
          <a
            href="http://127.0.0.1:5174/test/index.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            test：5174
          </a>
        </li>
      </ul>
    </div>

    <!-- 遍历路由分组 -->
    <div
      v-for="(groupRoutes, groupName) in groupedAvailableRoutes"
      :key="groupName"
      class="route-group"
    >
      <h2>{{ groupName }}</h2>
      <ul>
        <li v-for="route in groupRoutes" :key="route.path">
          <a
            :href="router.resolve(route.path).href"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ route.meta?.title || route.name || route.path }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

// 获取 Vue Router 实例
const router = useRouter();

// 将路由按路径第一段（模块名）分组
const groupedAvailableRoutes = computed(() => {
  const routes = router.options.routes;
  const groups = {};

  routes.forEach((route) => {
    if (route.path === "/") return; // 跳过首页

    const segments = route.path.split("/").filter(Boolean);
    if (segments.length >= 1) {
      const moduleName = segments[0];
      // 只收集顶层普通页面路由，排除layout子路由
      if (moduleName === "layout") return;

      if (!groups[moduleName]) groups[moduleName] = [];
      groups[moduleName].push(route);
    }
  });

  // 模块名按字母序排序（与首页图片2一致）
  const sortedNames = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  // 添加 layout 分组
  const sortedGroups = {};
  sortedNames.forEach((n) => (sortedGroups[n] = groups[n]));
  return sortedGroups;
});
</script>

<style lang="scss" scoped>
/* 组件容器基本样式 */
.home {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 1rem; /* 显式设置字体大小，与 :root 一致 */
  padding: 30px;
  line-height: 1.6;
  color: #333;
  max-width: 800px;

  /* 分组标题样式 */
  .route-group {
    h2 {
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.6em;
      font-size: 1.2em;
      color: #1a1a1a;
      padding-bottom: 0.3em;
    }

    /* 移除第一个分组标题的上边距 */
    &:first-of-type h2 {
      margin-top: 0;
    }

    /* 列表样式 */
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      padding-left: 10px; /* 轻微缩进组件链接 */
      margin-top: 0.5em;
    }

    /* 列表项样式 */
    li {
      margin-bottom: 0.6em;
    }

    /* 链接样式 */
    a {
      color: #007bff;
      text-decoration: none;
      transition: color 0.2s ease-in-out;

      &:hover {
        color: #0056b3;
        text-decoration: underline;
      }
    }
  }

  /* 其他通用标题/段落样式 (如果需要) */
  h1 {
    margin-top: 0;
    margin-bottom: 0.5em;
    font-weight: 600;
    font-size: 1.8em;
  }

  /* 其他通用标题/段落样式 (如果需要) */
  p {
    margin-top: 0;
    margin-bottom: 1.5em;
    color: #555;
  }
}
</style>
