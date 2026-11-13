<template>
  <div class="admin-layout">
    <!-- 左侧导航菜单 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <!-- 系统切换组件 -->
        <SystemSwitcher />
      </div>
      <nav class="sidebar-nav">
        <!-- 递归菜单组件 - 添加过渡动画 -->
        <transition-group name="menu-fade" tag="div">
          <MenuGroup
            v-for="group in menuConfig"
            :key="group.id"
            :menu-item="group"
            :current-path="$route.path"
          />
        </transition-group>
      </nav>
    </aside>

    <!-- 右侧内容区域 -->
    <main class="main-content">
      <!-- 顶部面包屑 -->
      <header class="content-header">
        <div class="header-left">
          <div class="breadcrumb-with-toggle">
            <button @click="toggleSidebar" class="sidebar-toggle-btn">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </button>
            <nav class="breadcrumb">
              <span class="breadcrumb-item">{{ currentModule }}</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item current">{{ currentPage }}</span>
            </nav>
          </div>
        </div>
        <div class="header-right">
          <button @click="handleReturnToList" class="list-view-btn">
            视图切换
          </button>
        </div>
      </header>

      <!-- 标签页导航 -->
      <div class="tab-container">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: tab.id === activeTabId }"
          @click="switchTab(tab.id)"
          @contextmenu.prevent="showContextMenu($event, tab)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <button
            class="tab-close"
            @click.stop="closeTab(tab.id)"
          >
            ×
          </button>
        </div>
      </div>

      <!-- 右键菜单 -->
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click="hideContextMenu"
      >
        <div class="menu-item" @click="refreshPage">刷新页面</div>
        <div class="menu-item" @click="refreshPageHard">刷新清缓存</div>
        <div class="menu-item" @click="closeCurrentTab">关闭当前</div>
        <div class="menu-item" @click="closeOtherTabs">关闭其他</div>
        <div class="menu-item" @click="closeAllTabs">全部关闭</div>
      </div>

      <!-- 页面内容 -->
      <div class="content-body">
        <div v-if="tabs.length === 0" class="empty-content">
          <img src="/backdrop.jpg" alt="背景图片" class="backdrop-image" />
        </div>
        <router-view v-else />
      </div>
    </main>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  ref,
  watch,
  onMounted,
  onUnmounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import MenuGroup from "./components/MenuGroup.vue";
import SystemSwitcher from "./components/SystemSwitcher.vue";
import { useSystemSwitcherStore } from "./config/system-store";

export default defineComponent({
  name: "AdminLayout",
  components: {
    MenuGroup,
    SystemSwitcher,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const sidebarCollapsed = ref(false);
    const systemStore = useSystemSwitcherStore();

    // 标签页管理
    const tabs = ref([]);
    const activeTabId = ref("");
    const contextMenu = ref({
      visible: false,
      x: 0,
      y: 0,
      targetTab: null,
    });

    // 标签页持久化：保存到 localStorage
    const saveTabsToStorage = () => {
      try {
        const tabsData = {
          tabs: tabs.value,
          activeTabId: activeTabId.value,
          systemId: systemStore.currentSystemId
        };
        localStorage.setItem('wing:layout-tabs', JSON.stringify(tabsData));
      } catch (e) {
        console.warn('保存标签页状态失败:', e);
      }
    };

    // 标签页持久化：从 localStorage 恢复
    const restoreTabsFromStorage = () => {
      try {
        const saved = localStorage.getItem('wing:layout-tabs');
        if (saved) {
          const tabsData = JSON.parse(saved);
          // 只在系统ID匹配时恢复标签页
          if (tabsData.systemId === systemStore.currentSystemId) {
            tabs.value = tabsData.tabs || [];
            activeTabId.value = tabsData.activeTabId || "";
            console.log('✅ 恢复标签页:', tabs.value.length, '个');
          }
        }
      } catch (e) {
        console.warn('恢复标签页状态失败:', e);
      }
    };

    // 监听标签页变化，自动保存
    watch([tabs, activeTabId], () => {
      saveTabsToStorage();
    }, { deep: true });

    // 菜单配置：优先使用系统配置的菜单，如果为空则回退到自动生成
    const menuConfig = computed(() => {
      try {
        console.log('\n🏗️  Layout 菜单配置开始...');
        console.log(`   当前系统ID: ${systemStore.currentSystemId}`);

        // 优先使用系统配置的菜单
        const systemMenus = systemStore.currentMenus;
        console.log(`   系统菜单数量: ${systemMenus?.length || 0}`);

        if (systemMenus && systemMenus.length > 0) {
          console.log("✅ 使用系统配置菜单");
          return systemMenus;
        }

        console.log("⚠️  系统菜单为空，回退到路由自动生成");

        // 回退到基于路由自动生成菜单
        const routes = router.getRoutes();
        const menuMap = {};

        // 只处理 /layout 下的子路由 (名称以 "Layout" 开头)
        routes.forEach((routeItem) => {
          if (
            routeItem.name &&
            routeItem.name.startsWith("Layout") &&
            routeItem.meta &&
            routeItem.meta.module &&
            routeItem.meta.title
          ) {
            const moduleName = routeItem.meta.module.toLowerCase();
            const componentName = routeItem.meta.title.toLowerCase();

            if (!menuMap[moduleName]) {
              menuMap[moduleName] = {
                id: moduleName,
                name: moduleName,
                icon: "📁",
                children: [],
              };
            }

            // 去重检查
            if (
              !menuMap[moduleName].children.find(
                (c) => c.name === componentName
              )
            ) {
              menuMap[moduleName].children.push({
                id: `${moduleName}-${componentName}`,
                name: componentName,
                path: `/${moduleName}/${componentName}`,
                icon: "📄",
              });
            }
          }
        });

        const config = Object.values(menuMap).sort(
          (a, b) => a.id.localeCompare(b.id) // 模块名按字母序
        );
        config.forEach((g) =>
          g.children.sort((a, b) => a.name.localeCompare(b.name))
        );

        console.log("✅ 使用自动生成菜单:", config.length, '个模块');
        return config;
      } catch (error) {
        console.error("❌ 菜单构建失败:", error);
        return [];
      }
    });

    // 计算当前模块和页面名称
    const currentModule = computed(() => {
      const segments = route.path
        .replace(/^\/layout\//, "")
        .split("/")
        .filter(Boolean);
      return segments[0] || "layout";
    });

    const currentPage = computed(() => {
      const segments = route.path
        .replace(/^\/layout\//, "")
        .split("/")
        .filter(Boolean);
      return segments[1] || "";
    });

    // 处理返回列表视图：去掉layout前缀并新标签页打开
    const handleReturnToList = () => {
      const currentRoute = route.path;
      let targetPath = "/";

      if (currentRoute.startsWith("/layout/")) {
        // 去掉 /layout 前缀
        targetPath = currentRoute.replace("/layout", "");
      }

      // 新标签页打开
      window.open(targetPath, "_blank");
    };

    // 切换侧边栏收缩状态
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    };

    // 初始化当前页面标签
    const initCurrentTab = () => {
      const currentPath = route.path;

      // 如果是 /layout 根路径，不创建标签页
      if (currentPath === "/layout") {
        return;
      }

      // 如果是 layout 下的具体页面，需要创建标签页
      if (
        currentPath.startsWith("/layout/") &&
        currentModule.value &&
        currentPage.value
      ) {
        const tabId = currentPath;
        const tabTitle = currentPage.value; // 只使用页面名

        if (!tabs.value.find((tab) => tab.id === tabId)) {
          tabs.value.push({
            id: tabId,
            title: tabTitle,
            path: currentPath,
          });
        }
        activeTabId.value = tabId;
      }
    };

    // 监听路由变化，自动添加标签页
    watch(
      route,
      () => {
        initCurrentTab();
      },
      { immediate: true }
    );

    // 标签页操作
    const switchTab = (tabId) => {
      activeTabId.value = tabId;
      const tab = tabs.value.find((t) => t.id === tabId);
      if (tab && tab.path !== route.path) {
        router.push(tab.path);
      }
    };

    const closeTab = (tabId) => {
      const index = tabs.value.findIndex((tab) => tab.id === tabId);
      if (index > -1) {
        tabs.value.splice(index, 1);

        // 如果关闭的是当前标签，切换到相邻标签
        if (tabId === activeTabId.value && tabs.value.length > 0) {
          const newIndex = Math.min(index, tabs.value.length - 1);
          switchTab(tabs.value[newIndex].id);
        }

        // 如果所有标签页都关闭了，跳转到 /layout
        if (tabs.value.length === 0) {
          router.push('/layout');
        }
      }
    };

    // 右键菜单
    const showContextMenu = (event, tab) => {
      contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        targetTab: tab,
      };
    };

    const hideContextMenu = () => {
      contextMenu.value.visible = false;
    };

    const refreshPage = () => {
      window.location.reload();
      hideContextMenu();
    };

    const refreshPageHard = () => {
      window.location.reload(true);
      hideContextMenu();
    };

    const closeCurrentTab = () => {
      if (contextMenu.value.targetTab) {
        closeTab(contextMenu.value.targetTab.id);
      }
      hideContextMenu();
    };

    const closeOtherTabs = () => {
      if (contextMenu.value.targetTab) {
        tabs.value = tabs.value.filter(
          (tab) => tab.id === contextMenu.value.targetTab.id
        );
        switchTab(contextMenu.value.targetTab.id);
      }
      hideContextMenu();
    };

    const closeAllTabs = () => {
      tabs.value = [];
      router.push('/layout');
      hideContextMenu();
    };

    // 点击其他地方隐藏右键菜单
    const handleGlobalClick = () => {
      hideContextMenu();
    };

    onMounted(() => {
      // 初始化系统切换器（从 localStorage 恢复状态）
      systemStore.restoreFromStorage();

      // 恢复标签页状态
      restoreTabsFromStorage();

      document.addEventListener("click", handleGlobalClick);
    });

    onUnmounted(() => {
      document.removeEventListener("click", handleGlobalClick);
    });

    return {
      menuConfig,
      currentModule,
      currentPage,
      handleReturnToList,
      sidebarCollapsed,
      toggleSidebar,
      tabs,
      activeTabId,
      contextMenu,
      switchTab,
      closeTab,
      showContextMenu,
      hideContextMenu,
      refreshPage,
      refreshPageHard,
      closeCurrentTab,
      closeOtherTabs,
      closeAllTabs,
    };
  },
});
</script>

<style lang="scss" scoped>
/* 页面样式 */
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

/* 左侧导航菜单 */
.sidebar {
  width: 220px;
  background-color: #263445; /* 深色背景微调 */
  color: #e6edf3;
  overflow: hidden; /* 自身不滚动，由内部区域滚动 */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.14);
  transition: width 0.3s ease;

  &.collapsed {
    width: 0;
    overflow: hidden;
  }

  /* 左侧导航菜单头部 */
  .sidebar-header {
    height: 57px; /* 与右侧面包屑区域等高，便于对齐底线 */
    padding: 0 12px;
    background-color: #2a3b4f;
    display: flex;
    align-items: center;
    justify-content: center; /* 标题居中 */
    position: sticky;
    top: 0;
    z-index: 2;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #f2f6fa;
    }
  }

  /* 左侧导航菜单内容 */
  .sidebar-nav {
    padding: 8px 6px 16px 6px;
    height: calc(100vh - 56px); /* 与侧栏头部高度匹配 */
    overflow-y: auto; /* 只滚动菜单区 */

    /* 隐藏滚动条 */
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 3px;

    &-track {
      background: #263445;
    }

    &-thumb {
      background: rgba(90, 167, 255, 0.8);
      border-radius: 2px;

      &:hover {
        background: #4291f6;
      }
    }
  }
}

/* 右侧内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部面包屑 */
.content-header {
  background-color: white;
  padding: 12px 16px; /* 与内容区域内边距保持一致 */
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* 顶部面包屑左侧 */
  .header-left {
    flex: 1;
  }

  /* 顶部面包屑右侧 */
  .header-right {
    flex-shrink: 0;
  }
}

/* 面包屑与切换按钮容器 */
.breadcrumb-with-toggle {
  display: flex;
  align-items: center;
  gap: 0;
}

/* 侧边栏切换按钮 */
.sidebar-toggle-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  margin-right: 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
}

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}

/* 返回列表视图按钮 */
.list-view-btn {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white;
  border: none;
  padding: 0.6em 1.2em;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

/* 面包屑项 */
.breadcrumb-item {
  color: #666;

  &.current {
    color: #1890ff;
    font-weight: 500;
  }
}

/* 面包屑分隔符 */
.breadcrumb-separator {
  margin: 0 8px;
  color: #ccc;
}

/* 页面内容 */
.content-body {
  flex: 1;
  padding: 12px 16px; /* 减少内边距，优化视觉比例 */
  overflow-y: auto;
  background-color: #f5f5f5;
}

/* 标签页容器 */
.tab-container {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  padding: 8px 16px;
  overflow-x: auto;
  gap: 6px;
}

/* 标签页项 - 小方块样式 */
.tab-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #e9ecef;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  min-width: 80px;
  max-width: 140px;
  font-size: 12px;
  height: 28px;

  &:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
    box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
  }
}

/* 标签页标题 */
.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

/* 标签页关闭按钮 */
.tab-close {
  margin-left: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
}

/* 标签页项激活时关闭按钮 */
.tab-item.active .tab-close {
  color: rgba(255, 255, 255, 0.8);

  &:hover {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.2);
  }
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background-color: white;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
}

/* 右键菜单项 */
.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }
}

/* 空内容区域样式 */
.empty-content {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* 背景图片 */
.backdrop-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 菜单切换过渡动画 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.3s ease;
}

.menu-fade-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.menu-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 左侧导航菜单响应式设计 */
  .sidebar {
    width: 200px;
  }

  /* 左侧导航菜单链接 */
  .nav-link {
    padding: 10px 15px;
    font-size: 13px;
  }

  /* 左侧导航菜单子链接 */
  .nav-submenu .nav-link {
    padding: 8px 12px 8px 25px;
    font-size: 12px;
  }
}
</style>
