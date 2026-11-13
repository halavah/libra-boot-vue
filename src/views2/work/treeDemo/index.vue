<template>
  <div class="root-container">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">TreeMultiple 组件通讯方式示例</h1>
        <p class="page-subtitle">展示 Vue 组件间 5 种常见通讯模式的实现方式</p>
      </div>
    </div>

    <!-- 中间内容区域 -->
    <div class="content-section">
      <div class="content-wrapper">
        <!-- Props 通讯示例 -->
        <props-example class="example-item" />

        <!-- Emit 通讯示例 -->
        <emit-example class="example-item" />

        <!-- Ref 通讯示例 -->
        <ref-example class="example-item" />

        <!-- 插槽通讯示例 -->
        <slot-example class="example-item" />

        <!-- 事件回调通讯示例 -->
        <event-example class="example-item" />
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="footer-section">
      <div class="footer-content">
        <el-button @click="scrollToTop">返回顶部</el-button>
        <el-button type="primary" @click="openAllExamples"
          >展开所有示例</el-button
        >
        <el-button @click="collapseAllExamples">收起所有示例</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import PropsExample from "./components/PropsExample.vue";
import EmitExample from "./components/EmitExample.vue";
import RefExample from "./components/RefExample.vue";
import SlotExample from "./components/SlotExample.vue";
import EventExample from "./components/EventExample.vue";

// 调试日志开关 - true: 开启日志, false: 关闭日志
const DEV_LOG_ENABLED = true;

/**
 * 调试日志输出函数
 * 只有在 DEV_LOG_ENABLED 为 true 时才输出日志
 * @param {...any} args - 要输出的参数
 */
const devLog = (...args) => {
  if (DEV_LOG_ENABLED) {
    console.log("[TreeDemo]", ...args);
  }
};

/**
 * 调试错误日志输出函数
 * 只有在 DEV_LOG_ENABLED 为 true 时才输出错误日志
 * @param {...any} args - 要输出的参数
 */
const devError = (...args) => {
  if (DEV_LOG_ENABLED) {
    console.error("[TreeDemo]", ...args);
  }
};

export default {
  name: "TreeDemo",
  components: {
    PropsExample,
    EmitExample,
    RefExample,
    SlotExample,
    EventExample,
  },

  // ************************************************ 区域：响应式数据 *****************************************************
  setup() {
    devLog("setup: 初始化响应式数据");

    // 示例组件引用数组
    const exampleRefs = ref([]);

    // 返回需要在模板中使用的数据和方法
    return {
      exampleRefs,
    };
  },

  // ************************************************ 区域：业务数据 *****************************************************
  data() {
    devLog("data: 初始化业务数据");

    return {
      // 页面状态
      pageLoading: false,
      // 示例展开状态
      examplesExpanded: false,
    };
  },

  // ************************************************ 区域：生命周期 *****************************************************
  mounted() {
    devLog("mounted: 页面挂载完成");

    // 初始化页面
    this.initPage();
  },

  // ************************************************ 区域：业务方法 *****************************************************
  methods: {
    // 初始化页面
    initPage() {
      devLog("initPage: 初始化页面");

      // 设置页面标题
      document.title = "TreeMultiple 组件通讯方式示例";
    },

    // 返回顶部
    scrollToTop() {
      devLog("scrollToTop: 返回顶部");

      const contentSection = document.querySelector(".content-section");
      if (contentSection) {
        contentSection.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },

    // 展开所有示例
    openAllExamples() {
      devLog("openAllExamples: 展开所有示例");

      this.examplesExpanded = true;

      // 通过事件总线通知所有子组件展开
      this.$nextTick(() => {
        this.$children.forEach((child) => {
          if (child.$options.name && child.$options.name.includes("Example")) {
            if (typeof child.expandExample === "function") {
              child.expandExample();
            }
          }
        });
      });
    },

    // 收起所有示例
    collapseAllExamples() {
      devLog("collapseAllExamples: 收起所有示例");

      this.examplesExpanded = false;

      // 通过事件总线通知所有子组件收起
      this.$nextTick(() => {
        this.$children.forEach((child) => {
          if (child.$options.name && child.$options.name.includes("Example")) {
            if (typeof child.collapseExample === "function") {
              child.collapseExample();
            }
          }
        });
      });
    },

    // 处理页面滚动
    handlePageScroll() {
      devLog("handlePageScroll: 处理页面滚动");

      const contentSection = document.querySelector(".content-section");
      if (contentSection) {
        const scrollTop = contentSection.scrollTop;
        // 可以在这里添加滚动相关的逻辑，如显示/隐藏返回顶部按钮
      }
    },
  },

  // ************************************************ 区域：监听器 *****************************************************
  watch: {
    // 监听示例展开状态变化
    examplesExpanded: {
      handler(val) {
        devLog("examplesExpanded: 监听示例展开状态变化", { value: val });
      },
      immediate: false,
    },
  },
};
</script>

<style scoped>
/* ==========================================================================
   TreeDemo 页面样式 - 三段式布局
   ========================================================================== */

/* ==========================================================================
   区域：全局样式重置
   ========================================================================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ==========================================================================
   区域：根容器 - 三段式布局主体
   ========================================================================== */
.root-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;
}

/* ==========================================================================
   区域：顶部标题区域 - 固定高度
   ========================================================================== */
.header-section {
  flex-shrink: 0;
  height: 80px;
  background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
  color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 300;
}

/* ==========================================================================
   区域：中间内容区域 - 自适应高度
   ========================================================================== */
.content-section {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  background-color: #f5f7fa;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* ==========================================================================
   区域：底部操作区域 - 固定高度
   ========================================================================== */
.footer-section {
  flex-shrink: 0;
  height: 60px;
  background-color: white;
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -2px 12px 0 rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 12px;
}

/* ==========================================================================
   区域：示例组件通用样式
   ========================================================================== */
.example-item {
  margin-bottom: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.example-item:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* ==========================================================================
   区域：示例组件内部结构
   ========================================================================== */
.example-container {
  padding: 20px;
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.example-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.example-description {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.example-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.demo-area {
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px dashed #dcdfe6;
}

.result-area {
  padding: 16px;
  background-color: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.result-area h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #409eff;
}

.result-content {
  font-family: "Courier New", monospace;
  font-size: 13px;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.example-code {
  margin-top: 20px;
}

.example-code pre {
  margin: 0;
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 6px;
  overflow-x: auto;
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

/* ==========================================================================
   区域：Element Plus 组件样式覆盖
   ========================================================================== */
/* 覆盖折叠面板样式 */
:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
  padding-left: 16px;
}

:deep(.el-collapse-item__header:hover) {
  background-color: #ebeef5;
}

:deep(.el-collapse-item__content) {
  padding: 0;
  border-bottom: none;
}

/* 覆盖按钮样式 */
.footer-content .el-button {
  min-width: 100px;
}

/* 覆盖标签样式 */
:deep(.el-tag) {
  font-weight: 500;
}

/* ==========================================================================
   区域：响应式设计
   ========================================================================== */
@media (max-width: 768px) {
  .header-section {
    height: 70px;
  }

  .header-content {
    padding: 0 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .content-section {
    padding: 16px;
  }

  .example-container {
    padding: 16px;
  }

  .example-demo {
    flex-direction: column;
  }

  .footer-content {
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 16px;
  }

  .footer-content .el-button {
    min-width: 80px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header-section {
    height: 60px;
  }

  .page-title {
    font-size: 18px;
  }

  .content-section {
    padding: 12px;
  }

  .example-container {
    padding: 12px;
  }

  .example-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .demo-area,
  .result-area {
    padding: 12px;
  }
}
</style>
