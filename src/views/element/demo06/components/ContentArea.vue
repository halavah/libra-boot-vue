<template>
  <div class="layout-content" ref="contentRoot">
    <div class="content-area">
      <el-row :gutter="24">
        <!-- 左侧列表卡片 -->
        <el-col :span="6">
          <el-card shadow="never" class="list-card">
            <template #header>
              <div>
                <span>退货原因列表</span>
              </div>
            </template>
            <!-- 退货原因表格 -->
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
        <!-- 右侧图表卡片 -->
        <el-col :span="18">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div>
                <span>退货原因分布图（%）</span>
              </div>
            </template>
            <!-- ECharts 图表容器 -->
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
import { defineComponent, ref, nextTick, PropType } from "vue";
import * as echarts from "echarts";
import type { EChartsOption, ECharts } from "echarts";

// --- 工具函数 ---
/**
 * 简单的防抖函数
 * @param func - 目标函数
 * @param wait - 延迟时间 (毫秒)
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
// 退货原因列表项接口 (供父组件和内部使用)
export interface FaultModeItem {
  bkReasonName: string; // 退货原因名称
  totalBreakTime: number | string; // 订单暂停时长
  totalBreakTimeRate?: string | number | null; // 订单暂停时长占比 (可选)
}

// --- 组件定义 ---
export default defineComponent({
  name: "ContentArea", // 组件名
  props: {
    // 从父组件接收的列表数据
    dataList: {
      type: Array as PropType<FaultModeItem[]>,
      required: true,
      default: () => [],
    },
  },
  // --- Options API data ---
  data(): {
    _chartInstance: ECharts | null; // ECharts 实例
    _chartResizeHandler: (() => void) | null; // 图表 resize 处理器 (未使用)
    _resizeObserver: ResizeObserver | null; // 容器尺寸监听器
    innerContentHeight: number; // 内部内容高度 (用于表格和图表)
  } {
    return {
      _chartInstance: null,
      _chartResizeHandler: null,
      _resizeObserver: null,
      innerContentHeight: 300, // 默认高度
    };
  },
  // --- 监听器 ---
  watch: {
    // 监听列表数据变化，重新初始化图表
    dataList: {
      handler(newData: FaultModeItem[]) {
        if (newData && newData.length > 0) {
          this.initChart();
        }
      },
      deep: true, // 深度监听
      immediate: true, // 立即执行一次
    },
  },
  // --- 生命周期钩子 ---
  mounted() {
    // DOM 挂载后执行
    nextTick(() => {
      const rootEl = this.$refs.contentRoot as HTMLElement | null;
      if (!rootEl) return;

      this.calculateInnerContentHeight(); // 初始化计算高度

      // 创建防抖的高度计算函数
      const debouncedCalculateHeight = debounce(
        this.calculateInnerContentHeight,
        100
      );

      // 使用 ResizeObserver 监听容器尺寸变化
      if (typeof ResizeObserver !== "undefined") {
        this._resizeObserver = new ResizeObserver(debouncedCalculateHeight);
        this._resizeObserver.observe(rootEl);
      } else {
        // 降级方案: 监听窗口 resize
        window.addEventListener("resize", debouncedCalculateHeight);
      }
    });
  },
  beforeUnmount() {
    // 组件卸载前清理
    if (this._chartInstance) {
      this._chartInstance.dispose(); // 销毁 ECharts
    }
    // 移除监听器
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    } else {
      // 如果使用了降级方案，需要移除 window resize 监听
      // window.removeEventListener("resize", debouncedCalculateHeight); // 注意引用正确的函数实例
    }
  },
  // --- 方法 ---
  methods: {
    /**
     * 计算内部内容区域的高度 (表格和图表)
     */
    calculateInnerContentHeight(): void {
      const rootEl = this.$refs.contentRoot as HTMLElement | null;
      if (!rootEl || typeof rootEl.querySelector !== "function") return;

      const cardEl =
        (rootEl.querySelector(".list-card") as HTMLElement) ||
        (rootEl.querySelector(".chart-card") as HTMLElement | null);
      if (!cardEl) return;

      const cardHeader = cardEl.querySelector(
        ".el-card__header"
      ) as HTMLElement | null;
      const cardBody = cardEl.querySelector(
        ".el-card__body"
      ) as HTMLElement | null;

      const cardHeaderHeight = cardHeader ? cardHeader.offsetHeight : 40;
      const cardBodyStyles = cardBody
        ? window.getComputedStyle(cardBody)
        : null;
      const cardBodyPaddingY = cardBodyStyles
        ? parseFloat(cardBodyStyles.paddingTop) +
          parseFloat(cardBodyStyles.paddingBottom)
        : 30;

      const availableHeight = rootEl.clientHeight;
      const innerHeight = availableHeight - cardHeaderHeight - cardBodyPaddingY;
      const newInnerHeight = Math.max(innerHeight, 150); // 最小高度 150px

      this.innerContentHeight = newInnerHeight; // 更新高度状态

      // 触发 ECharts resize
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
        if (!chartDom) return;
        this.setupEcharts(chartDom);
      });
    },

    /**
     * 设置 ECharts 实例和配置
     * @param chartDom - 图表容器 DOM
     */
    setupEcharts(chartDom: HTMLElement): void {
      if (this._chartInstance) {
        this._chartInstance.dispose(); // 销毁旧实例
      }

      const myChart: ECharts = echarts.init(chartDom); // 初始化新实例

      // 准备图表数据
      const categories: string[] = this.dataList.map(
        (item) => item.bkReasonName
      );
      const rates: number[] = this.dataList.map(
        (item) =>
          parseFloat(String(item.totalBreakTimeRate || "0").replace("%", "")) ||
          0
      );

      // 颜色列表
      const defaultColors: string[] = [
        "#409EFF",
        "#67C23A",
        "#E6A23C",
        "#F56C6C",
        "#909399",
        "#5470c6",
        "#91cc75",
        "#fac858",
        "#ee6666",
        "#73c0de",
        "#3ba272",
        "#fc8452",
        "#9a60b4",
        "#ea7ccc",
      ];

      // ECharts 配置项
      const option: EChartsOption = {
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: "{b}: {c}%",
        },
        legend: { show: false },
        grid: {
          top: "5%",
          left: "25%",
          right: "10%",
          bottom: "5%",
          containLabel: false,
        }, // 调整网格边距以容纳长标签
        xAxis: {
          type: "value",
          name: "占比 (%)",
          nameLocation: "middle",
          nameGap: 25,
          nameTextStyle: { padding: [0, 0, 5, 0] },
          axisLabel: { formatter: "{value}%" },
          position: "top",
        },
        yAxis: {
          type: "category",
          data: categories,
          axisTick: { alignWithLabel: true },
          inverse: true, // Y 轴反向，使最大值在顶部
          axisLabel: {
            interval: 0,
            fontSize: 12, // 截断长标签
            formatter: (value: string) =>
              value.length > 10 ? value.substring(0, 10) + "..." : value,
          },
        },
        series: [
          {
            name: "退货原因分布",
            type: "bar",
            data: rates,
            label: {
              show: true,
              position: "right",
              formatter: "{c}%",
              color: "#333",
              fontSize: 10,
            },
            itemStyle: {
              // 条形图颜色循环
              color: (params: { dataIndex: number }) =>
                defaultColors[params.dataIndex % defaultColors.length],
            },
          },
        ],
      };

      myChart.setOption(option); // 应用配置
      this._chartInstance = myChart; // 保存实例
    },
  },
});
</script>

<style scoped lang="less">
/* --- 根元素 (.layout-content) Flex 布局 --- */
.layout-content {
  flex-grow: 1; // 填充父容器剩余空间
  min-height: 0; // 允许收缩
  overflow: hidden; // 隐藏自身溢出
  margin-bottom: 15px; // 与下方分析区域间距
  display: flex;
  flex-direction: column;
}

/* --- 卡片基础样式 --- */
.list-card,
.chart-card {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column; // 垂直排列 Header 和 Body
  overflow: hidden; // 隐藏卡片自身溢出

  /* --- 卡片内部布局 (穿透 Scoped) --- */
  :deep(.el-card__header) {
    padding: 15px;
    font-weight: bold;
    border-bottom: 1px solid #ebeef5;
  }
  :deep(.el-card__body) {
    flex-grow: 1; // Body 填充卡片剩余空间
    padding: 15px;
    overflow: hidden; // 隐藏 Body 内部溢出
    display: flex;
    flex-direction: column; // 垂直排列
    min-height: 0; // 允许 Body 收缩
  }
}

/* --- 表格和图表容器 --- */
:deep(.el-table) {
  flex-grow: 1; // 表格填充 Body 空间
}
.chart-container {
  width: 100%;
  flex-grow: 1; // 图表填充 Body 空间
  min-height: 150px; // 最小高度
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
