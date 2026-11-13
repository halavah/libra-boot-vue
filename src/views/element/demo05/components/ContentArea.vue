<template>
  <div class="layout-content" ref="contentRoot">
    <div class="content-area">
      <el-row :gutter="24">
        <!-- 左侧列表 -->
        <el-col :span="6">
          <el-card shadow="never" class="list-card">
            <template #header>
              <div>
                <span>退货原因列表</span>
              </div>
            </template>
            <!-- 表格高度通过 innerContentHeight 动态绑定 -->
            <el-table :data="dataList" stripe :height="innerContentHeight">
              <el-table-column
                prop="bkReasonName"
                label="退货原因"
                show-overflow-tooltip
              />
              <el-table-column
                prop="totalBreakTime"
                label="订单暂停时长"
                width="100"
                align="right"
              />
            </el-table>
          </el-card>
        </el-col>
        <!-- 右侧图表 -->
        <el-col :span="18">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div>
                <span>退货原因分布图（%）</span>
              </div>
            </template>
            <!-- 图表容器高度通过 innerContentHeight 动态绑定 -->
            <div
              ref="chartRef"
              class="chart-container"
              :style="{ height: innerContentHeight + 'px' }"
            ></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
// 导入 Vue 相关模块和 ECharts
import { defineComponent, ref, nextTick, PropType } from "vue";
import * as echarts from "echarts";
import type { EChartsOption, ECharts } from "echarts";

// --- 工具函数 ---
/**
 * 简单的防抖函数
 * @param func 需要防抖的函数
 * @param wait 防抖延迟时间 (毫秒)
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// --- 类型定义 ---
// 退货原因列表项接口 (导出供父组件使用)
export interface FaultModeItem {
  bkReasonName: string; // 退货原因名称
  totalBreakTime: number | string; // 订单暂停时长
  totalBreakTimeRate?: string | number | null; // 订单暂停时长占比 (可选)
}

// --- 组件定义 ---
export default defineComponent({
  name: "ContentArea", // 组件名称
  props: {
    // 从父组件接收的退货原因列表数据
    dataList: {
      type: Array as PropType<FaultModeItem[]>, // 类型为 FaultModeItem 数组
      required: true, // 必传
      default: () => [], // 默认空数组
    },
  },
  // 组件内部状态 (Options API data)
  data(): {
    _chartInstance: ECharts | null; // ECharts 实例
    _chartResizeHandler: (() => void) | null; // 图表 resize 处理器 (未使用)
    _resizeObserver: ResizeObserver | null; // 容器尺寸监听器
    innerContentHeight: number; // 内部内容高度 (用于表格和图表)
  } {
    return {
      _chartInstance: null,
      _chartResizeHandler: null, // 保留但未使用
      _resizeObserver: null,
      innerContentHeight: 300, // 默认高度
    };
  },
  // 监听器
  watch: {
    // 监听 dataList 变化，数据变化时重新初始化图表
    dataList: {
      handler(newData: FaultModeItem[]) {
        if (newData && newData.length > 0) {
          this.initChart();
        }
      },
      deep: true, // 深度监听
      immediate: true, // 立即执行
    },
  },
  // 生命周期钩子
  mounted() {
    // DOM 更新后执行
    nextTick(() => {
      const rootEl = this.$refs.contentRoot as HTMLElement | null;
      if (!rootEl) return;

      // 初始化时计算一次高度
      this.calculateInnerContentHeight();

      // 创建防抖后的高度计算函数
      const debouncedCalculateHeight = debounce(
        this.calculateInnerContentHeight,
        100 // 100ms 防抖
      );

      // 使用 ResizeObserver 监听容器尺寸变化，动态调整高度
      if (typeof ResizeObserver !== "undefined") {
        this._resizeObserver = new ResizeObserver(debouncedCalculateHeight);
        this._resizeObserver.observe(rootEl);
      } else {
        // 降级方案：监听窗口 resize (也使用防抖)
        window.addEventListener("resize", debouncedCalculateHeight);
        // 注意：如果使用降级方案，需要在 beforeUnmount 中移除对应的监听器
      }
    });
  },
  beforeUnmount() {
    // 组件卸载前清理资源
    if (this._chartInstance) {
      this._chartInstance.dispose(); // 销毁 ECharts 实例
    }
    // 移除窗口 resize 监听器 (如果使用了降级方案且添加了监听)
    // window.removeEventListener("resize", debouncedCalculateHeight); // 需要引用正确的防抖函数实例

    // 停止 ResizeObserver 监听
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  },
  // 方法
  methods: {
    /**
     * 计算内部内容区域的高度 (表格和图表的高度)
     * 根据容器高度、卡片头部高度和内边距计算
     */
    calculateInnerContentHeight(): void {
      const rootEl = this.$refs.contentRoot as HTMLElement | null;
      if (!rootEl || typeof rootEl.querySelector !== "function") {
        console.warn("ContentArea: 根元素引用未就绪。");
        return;
      }

      // 获取任一卡片元素用于计算
      const cardEl =
        (rootEl.querySelector(".list-card") as HTMLElement) ||
        (rootEl.querySelector(".chart-card") as HTMLElement | null);
      if (!cardEl) return;

      // 获取卡片头部和主体
      const cardHeader = cardEl.querySelector(".el-card__header") as HTMLElement | null;
      const cardBody = cardEl.querySelector(".el-card__body") as HTMLElement | null;

      // 获取头部高度和主体垂直 padding
      const cardHeaderHeight = cardHeader ? cardHeader.offsetHeight : 40; // 默认 40
      const cardBodyStyles = cardBody ? window.getComputedStyle(cardBody) : null;
      const cardBodyPaddingY = cardBodyStyles
        ? parseFloat(cardBodyStyles.paddingTop) + parseFloat(cardBodyStyles.paddingBottom)
        : 30; // 默认 30 (根据实际样式调整)

      // 计算可用高度和内部高度
      const availableHeight = rootEl.clientHeight;
      const innerHeight = availableHeight - cardHeaderHeight - cardBodyPaddingY;

      // 确保最小高度为 150px
      const newInnerHeight = Math.max(innerHeight, 150);

      // 更新内部高度状态 (防抖由调用处处理)
      this.innerContentHeight = newInnerHeight;

      // 触发 ECharts resize (防抖由调用处处理)
      if (this._chartInstance) {
        nextTick(() => {
          this._chartInstance?.resize();
        });
      }
    },

    /**
     * 初始化 ECharts 图表
     */
    initChart(): void {
      nextTick(() => {
        const chartDom = this.$refs.chartRef as HTMLElement | null;
        if (!chartDom) {
          console.warn("ContentArea: 图表 DOM 元素未找到。");
          return;
        }
        this.setupEcharts(chartDom); // 设置图表
      });
    },

    /**
     * 设置 ECharts 实例和配置项
     * @param chartDom 图表容器 DOM 元素
     */
    setupEcharts(chartDom: HTMLElement): void {
      // 如果实例已存在，先销毁
      if (this._chartInstance) {
        this._chartInstance.dispose();
      }

      // 初始化 ECharts
      const myChart: ECharts = echarts.init(chartDom);

      // 准备图表数据
      const categories: string[] = this.dataList.map((item) => item.bkReasonName);
      const rates: number[] = this.dataList.map(
        (item) => parseFloat(String(item.totalBreakTimeRate || "0").replace("%", "")) || 0
      );

      // 默认颜色列表
      const defaultColors: string[] = [ "#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399", "#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", ];

      // ECharts 配置项
      const option: EChartsOption = {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: "{b}: {c}%", },
        legend: { show: false, },
        grid: { top: "5%", left: "25%", right: "10%", bottom: "5%", containLabel: false, },
        xAxis: { type: "value", name: "占比 (%)", nameLocation: "middle", nameGap: 25, nameTextStyle: { padding: [0, 0, 5, 0] }, axisLabel: { formatter: "{value}%" }, position: "top", },
        // 注意：此处移除了之前误放在这里的注释
        yAxis: { type: "category", data: categories, axisTick: { alignWithLabel: true }, inverse: true, axisLabel: { interval: 0, fontSize: 12, formatter: (value: string) => value.length > 10 ? value.substring(0, 10) + "..." : value, }, },
        series: [ { name: "退货原因分布", type: "bar", data: rates, label: { show: true, position: "right", formatter: "{c}%", color: "#333", fontSize: 10, }, itemStyle: { // 条形图颜色循环
              color: (params: { dataIndex: number }) => {
                return defaultColors[params.dataIndex % defaultColors.length];
              },
            },
          },
        ],
      };

      // 应用配置
      myChart.setOption(option);

      // 保存实例
      this._chartInstance = myChart;
    },
  },
});
</script>

<style scoped>
/* --- 根元素 (.layout-content) Flex 布局 --- */
.layout-content {
  flex-grow: 1; /* 填充父容器剩余空间 */
  min-height: 0; /* 允许收缩 */
  overflow: hidden; /* 隐藏自身溢出 */
  margin-bottom: 15px; /* 与下方分析区域间距 */
  display: flex; /* 自身也使用 Flex */
  flex-direction: column; /* 内部垂直排列 */
}

/* --- 卡片基础样式 --- */
.list-card,
.chart-card {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex; /* 卡片内部 Flex 布局 */
  flex-direction: column; /* 垂直排列 Header 和 Body */
  overflow: hidden; /* 隐藏卡片自身溢出 */
}

/* --- 卡片内部布局 (穿透 Scoped) --- */
:deep(.el-card__header) {
  padding: 15px; /* 调整头部内边距 */
  font-weight: bold; /* 头部加粗 */
  border-bottom: 1px solid #ebeef5; /* 头部下边框 */
}
:deep(.el-card__body) {
  flex-grow: 1; /* Body 填充卡片剩余空间 */
  padding: 15px; /* 调整 Body 内边距 */
  overflow: hidden; /* 隐藏 Body 内部溢出 */
  display: flex; /* Body 内部也使用 Flex */
  flex-direction: column; /* 垂直排列 */
  min-height: 0; /* 允许 Body 收缩 */
}

/* --- 表格和图表容器 --- */
:deep(.el-table) {
  /* 高度由 :height 绑定 */
  flex-grow: 1; /* 填充 Body 空间 (如果 Body 只有表格) */
}
.chart-container {
  width: 100%; /* 宽度 100% */
  /* 高度由 :style 绑定 */
  flex-grow: 1; /* 填充 Body 空间 (如果 Body 只有图表) */
  min-height: 150px; /* 最小高度 */
}

/* --- 可选：表格单元格溢出处理 --- */
.table-cell-tooltip {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: bottom;
}
</style>
