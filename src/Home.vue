<template>
  <div class="system-overview">
    <!-- 导航链接区域 -->
    <div class="navigation-section">
      <h2 class="nav-title">快速导航</h2>
      <div class="nav-links">
        <a
          href="http://127.0.0.1:5173/layout"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link"
        >
          <span class="nav-icon">🏢</span>
          <span class="nav-text">Layout 布局</span>
        </a>
        <a
          href="http://127.0.0.1:5173/test/index.html"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link"
        >
          <span class="nav-icon">🧪</span>
          <span class="nav-text">Test: 5173</span>
        </a>
        <a
          href="http://127.0.0.1:5174/test/index.html"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link"
        >
          <span class="nav-icon">🧪</span>
          <span class="nav-text">Test: 5174</span>
        </a>
      </div>
    </div>

    <!-- 头部标题和操作栏 -->
    <div class="overview-header">
      <div class="header-left">
        <h1 class="title">
          <span class="icon">🏠</span>
          系统架构总览
        </h1>
        <p class="subtitle">自动扫描所有系统、模块和页面的规范文档</p>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模块或页面..."
          prefix-icon="Search"
          clearable
          class="search-input"
          @input="handleSearch"
        />
        <el-button type="primary" @click="exportMarkdown">
          <el-icon><Document /></el-icon>
          导出 MD
        </el-button>
        <el-button @click="exportJSON">
          <el-icon><Download /></el-icon>
          导出 JSON
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <div class="stat-card">
        <div class="stat-icon system-icon">📦</div>
        <div class="stat-info">
          <div class="stat-value">{{ globalStats.totalSystems }}</div>
          <div class="stat-label">系统总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon module-icon">📁</div>
        <div class="stat-info">
          <div class="stat-value">{{ globalStats.totalModules }}</div>
          <div class="stat-label">模块总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon page-icon">📄</div>
        <div class="stat-info">
          <div class="stat-value">{{ globalStats.totalPages }}</div>
          <div class="stat-label">页面总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon time-icon">🕐</div>
        <div class="stat-info">
          <div class="stat-value">{{ globalStats.lastUpdate }}</div>
          <div class="stat-label">最后更新</div>
        </div>
      </div>
    </div>

    <!-- 系统列表 -->
    <div class="systems-container">
      <div
        v-for="system in filteredSystemStats"
        :key="system.id"
        class="system-card"
        :class="`system-${system.id}`"
      >
        <!-- 系统头部 -->
        <div class="system-header" @click="toggleSystem(system.id)">
          <div class="system-info">
            <el-icon class="system-icon-large" :size="24">
              <component :is="system.icon || 'Grid'" />
            </el-icon>
            <div class="system-title-group">
              <h2 class="system-title">{{ system.title }}</h2>
              <span class="system-stats">
                {{ system.moduleCount }} 个模块 · {{ system.pageCount }} 个页面
              </span>
            </div>
          </div>
          <div class="system-actions">
            <el-icon
              class="expand-icon"
              :class="{ expanded: expandedSystems[system.id] }"
            >
              <ArrowDown />
            </el-icon>
          </div>
        </div>

        <!-- 系统内容（可展开） -->
        <el-collapse-transition>
          <div v-show="expandedSystems[system.id]" class="system-content">
            <!-- 模块列表 -->
            <div
              v-for="module in system.modules"
              :key="module.id"
              class="module-section"
            >
              <div class="module-header">
                <el-icon class="module-icon">
                  <Folder />
                </el-icon>
                <span class="module-name">{{ module.title }}</span>
                <span class="module-count"
                  >({{ module.children?.length || 0 }} 个页面)</span
                >
              </div>

              <!-- 页面网格 -->
              <div class="pages-grid">
                <div
                  v-for="page in module.children"
                  :key="page.id"
                  class="page-card"
                  @click="navigateToPage(system.id, page.path)"
                >
                  <el-icon class="page-icon">
                    <Document />
                  </el-icon>
                  <span class="page-name">{{ page.title }}</span>
                  <el-icon class="page-arrow">
                    <ArrowRight />
                  </el-icon>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-if="!system.modules || system.modules.length === 0"
              class="empty-state"
            >
              <el-icon :size="48" color="#ccc">
                <FolderOpened />
              </el-icon>
              <p>该系统暂无模块</p>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>

    <!-- 空搜索结果 -->
    <div
      v-if="searchKeyword && filteredSystemStats.length === 0"
      class="empty-search"
    >
      <el-icon :size="64" color="#ccc">
        <Search />
      </el-icon>
      <p>未找到匹配的系统、模块或页面</p>
      <el-button @click="searchKeyword = ''">清空搜索</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Document,
  Download,
  Search,
  ArrowDown,
  ArrowRight,
  Folder,
  FolderOpened,
  Grid,
} from "@element-plus/icons-vue";
import { useSystemSwitcherStore } from "./layouts/config/system-store";
import {
  getEnabledSystems,
  getSystemMenus,
} from "./layouts/config/system-config";

const router = useRouter();
const systemStore = useSystemSwitcherStore();

// 搜索关键词
const searchKeyword = ref("");

// 展开/收起状态
const expandedSystems = ref({
  system1: true,
  system2: false,
  system3: false,
});

// 获取所有系统统计信息
const systemStats = computed(() => {
  const allSystems = getEnabledSystems();

  return allSystems.map((system) => {
    const menus = getSystemMenus(system.id);
    const moduleCount = menus.length;
    const pageCount = menus.reduce(
      (sum, menu) => sum + (menu.children?.length || 0),
      0
    );

    return {
      ...system,
      moduleCount,
      pageCount,
      modules: menus,
    };
  });
});

// 全局统计
const globalStats = computed(() => {
  const totalSystems = systemStats.value.length;
  const totalModules = systemStats.value.reduce(
    (sum, s) => sum + s.moduleCount,
    0
  );
  const totalPages = systemStats.value.reduce((sum, s) => sum + s.pageCount, 0);
  const today = new Date().toISOString().split("T")[0];

  return {
    totalSystems,
    totalModules,
    totalPages,
    lastUpdate: today,
  };
});

// 过滤后的系统统计（根据搜索关键词）
const filteredSystemStats = computed(() => {
  if (!searchKeyword.value.trim()) {
    return systemStats.value;
  }

  const keyword = searchKeyword.value.toLowerCase().trim();

  return systemStats.value
    .map((system) => {
      // 过滤模块
      const filteredModules = system.modules
        .map((module) => {
          // 检查模块名是否匹配
          const moduleMatches = module.title.toLowerCase().includes(keyword);

          // 过滤页面
          const filteredPages =
            module.children?.filter((page) =>
              page.title.toLowerCase().includes(keyword)
            ) || [];

          // 如果模块名匹配，返回所有页面；否则只返回匹配的页面
          if (moduleMatches) {
            return module;
          } else if (filteredPages.length > 0) {
            return {
              ...module,
              children: filteredPages,
            };
          }
          return null;
        })
        .filter(Boolean);

      // 检查系统名是否匹配
      const systemMatches = system.title.toLowerCase().includes(keyword);

      if (systemMatches) {
        return system; // 系统名匹配，返回完整系统
      } else if (filteredModules.length > 0) {
        // 有匹配的模块或页面
        const pageCount = filteredModules.reduce(
          (sum, m) => sum + (m.children?.length || 0),
          0
        );
        return {
          ...system,
          moduleCount: filteredModules.length,
          pageCount,
          modules: filteredModules,
        };
      }
      return null;
    })
    .filter(Boolean);
});

// 切换系统展开/收起
const toggleSystem = (systemId) => {
  expandedSystems.value[systemId] = !expandedSystems.value[systemId];
};

// 搜索处理
const handleSearch = () => {
  // 如果有搜索关键词，自动展开所有系统
  if (searchKeyword.value.trim()) {
    Object.keys(expandedSystems.value).forEach((key) => {
      expandedSystems.value[key] = true;
    });
  }
};

// 导航到页面
const navigateToPage = (systemId, pagePath) => {
  // 先切换到目标系统
  if (systemStore.currentSystemId !== systemId) {
    systemStore.switchSystem(systemId);
  }

  // 跳转到页面
  router.push(`/layout${pagePath}`);
};

// 导出 Markdown
const exportMarkdown = () => {
  let markdown = "# Wing-Vue 系统架构总览\n\n";
  markdown += `> 生成时间: ${new Date().toLocaleString("zh-CN")}\n\n`;
  markdown += `## 统计概览\n\n`;
  markdown += `- 系统总数: ${globalStats.value.totalSystems} 个\n`;
  markdown += `- 模块总数: ${globalStats.value.totalModules} 个\n`;
  markdown += `- 页面总数: ${globalStats.value.totalPages} 个\n\n`;
  markdown += `---\n\n`;

  systemStats.value.forEach((system) => {
    markdown += `## ${system.title} (${system.id})\n\n`;
    markdown += `- 模块数: ${system.moduleCount}\n`;
    markdown += `- 页面数: ${system.pageCount}\n\n`;

    if (system.modules && system.modules.length > 0) {
      system.modules.forEach((module) => {
        markdown += `### 📁 ${module.title}\n\n`;
        if (module.children && module.children.length > 0) {
          module.children.forEach((page) => {
            markdown += `- 📄 ${page.title} → \`${page.path}\`\n`;
          });
        }
        markdown += `\n`;
      });
    }
    markdown += `---\n\n`;
  });

  // 下载文件
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `系统架构总览_${new Date().toISOString().split("T")[0]}.md`;
  a.click();
  URL.revokeObjectURL(url);

  ElMessage.success("Markdown 文档已导出");
};

// 导出 JSON
const exportJSON = () => {
  const data = {
    metadata: {
      title: "Wing-Vue 系统架构总览",
      generatedAt: new Date().toISOString(),
      statistics: globalStats.value,
    },
    systems: systemStats.value.map((system) => ({
      id: system.id,
      title: system.title,
      icon: system.icon,
      moduleCount: system.moduleCount,
      pageCount: system.pageCount,
      modules: system.modules.map((module) => ({
        id: module.id,
        name: module.name,
        title: module.title,
        pages:
          module.children?.map((page) => ({
            id: page.id,
            name: page.name,
            title: page.title,
            path: page.path,
          })) || [],
      })),
    })),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `系统架构总览_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  ElMessage.success("JSON 数据已导出");
};

onMounted(() => {
  console.log("📊 系统架构总览页面加载完成");
  console.log("系统统计:", systemStats.value);
});
</script>

<style lang="scss" scoped>
.system-overview {
  padding: 24px;
  background: #1a1d24;
  min-height: 100vh;
  color: #e6edf3;
}

/* 导航链接区域 */
.navigation-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #e6edf3;
}

.nav-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(90, 167, 255, 0.1);
  border: 1px solid rgba(90, 167, 255, 0.3);
  border-radius: 8px;
  color: #5aa7ff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background: rgba(90, 167, 255, 0.2);
    border-color: #5aa7ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(90, 167, 255, 0.3);
  }
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 14px;
}

/* 头部 */
.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  flex: 1;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #e6edf3;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    font-size: 28px;
  }
}

.subtitle {
  margin: 8px 0 0 36px;
  font-size: 14px;
  color: #8b95a1;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 240px;
}

/* 统计卡片 */
.statistics-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  }
}

.stat-icon {
  font-size: 36px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;

  &.system-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.module-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &.page-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.time-icon {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #e6edf3;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #8b95a1;
}

/* 系统卡片 */
.systems-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.system-card {
  background: #2c3e50;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
    transform: translateY(-2px);
  }

  &.system-system1 {
    border-left: 5px solid #5aa7ff;
  }

  &.system-system2 {
    border-left: 5px solid #67c23a;
  }

  &.system-system3 {
    border-left: 5px solid #f39c12;
  }
}

.system-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  background: rgba(255, 255, 255, 0.03);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.system-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.system-icon-large {
  color: #5aa7ff;
}

.system-title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.system-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #e6edf3;
}

.system-stats {
  font-size: 13px;
  color: #8b95a1;
}

.expand-icon {
  transition: transform 0.3s;
  color: #8b95a1;

  &.expanded {
    transform: rotate(180deg);
  }
}

/* 系统内容 */
.system-content {
  padding: 0 24px 24px;
  background: rgba(0, 0, 0, 0.1);
}

.module-section {
  margin-top: 24px;
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  border-left: 3px solid #5aa7ff;
}

.module-icon {
  color: #f39c12;
  font-size: 18px;
}

.module-name {
  font-size: 15px;
  font-weight: 600;
  color: #e6edf3;
}

.module-count {
  font-size: 13px;
  color: #8b95a1;
}

/* 页面网格 */
.pages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.page-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #5aa7ff;
    background: rgba(90, 167, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(90, 167, 255, 0.2);
  }
}

.page-icon {
  color: #8b95a1;
  font-size: 16px;
  flex-shrink: 0;
}

.page-name {
  flex: 1;
  font-size: 14px;
  color: #c9d1d9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-arrow {
  color: #8b95a1;
  font-size: 14px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.page-card:hover .page-arrow {
  opacity: 1;
  color: #5aa7ff;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #8b95a1;

  p {
    margin-top: 16px;
    font-size: 14px;
    color: #8b95a1;
  }
}

.empty-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);

  p {
    margin: 16px 0 24px;
    font-size: 16px;
    color: #8b95a1;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .statistics-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .pages-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .overview-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-right {
    width: 100%;
    flex-direction: column;

    .search-input {
      width: 100%;
    }
  }

  .statistics-cards {
    grid-template-columns: 1fr;
  }

  .pages-grid {
    grid-template-columns: 1fr;
  }

  .nav-links {
    flex-direction: column;
  }

  .nav-link {
    width: 100%;
    justify-content: center;
  }
}
</style>
