<template>
  <!-- 布局 2: 内容区域 -->
  <div class="layout-content">
    <div class="content-area">
      <a-row :gutter="16">
        <!-- 左侧列表卡片 -->
        <a-col :span="6">
          <a-card :bordered="false" class="list-card" size="small">
            <template #title>
              <span>退货原因列表</span>
            </template>
            <!-- 退货原因表格 -->
            <a-table
              :columns="tableColumns"
              :data-source="dataList"
              :pagination="false"
              :scroll="{ y: 475 }"
              size="small"
              row-key="bkReasonName"
            >
              <template #bodyCell="{ column, text }">
                <!-- 表格单元格 Tooltip 处理长文本 -->
                <template v-if="column.key === 'bkReasonName'">
                  <a-tooltip :title="text">
                    <span class="table-cell-tooltip">{{ text }}</span>
                  </a-tooltip>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
        <!-- 右侧图表卡片 -->
        <a-col :span="18">
          <a-card :bordered="false" class="chart-card" size="small">
            <template #title>
              <span>退货原因分布图（%）</span>
            </template>
            <!-- ECharts 图表容器 -->
            <div ref="chartRef" class="chart-container"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, nextTick } from "vue";
import type { ECharts, EChartsOption } from "echarts"; // ECharts 类型
import type { TableColumnType } from "ant-design-vue"; // Antd 表格列类型

// --- 类型定义 ---
interface DataItem {
  // 列表项数据结构
  bkReasonName: string;
  totalBreakTimeRate: string;
  totalBreakTime: number;
}

// --- 组件定义 ---
export default defineComponent({
  name: "ContentAreaAntd", // 组件名称
  // 显式注入 ECharts 实例
  inject: {
    echarts: { from: "echarts", default: null },
  },
  props: {
    // 从父组件接收的列表数据
    dataList: {
      type: Array as PropType<DataItem[]>,
      required: true,
      default: () => [],
    },
  },
  data(): {
    myChart: ECharts | null; // ECharts 实例
    resizeHandler: (() => void) | null; // 窗口 resize 处理器
    tableColumns: TableColumnType[]; // 表格列配置
  } {
    return {
      myChart: null,
      resizeHandler: null,
      tableColumns: [
        // 定义表格列
        {
          title: "退货原因",
          dataIndex: "bkReasonName",
          key: "bkReasonName",
          ellipsis: true,
        },
        {
          title: "订单暂停时长",
          dataIndex: "totalBreakTime",
          key: "totalBreakTime",
          width: 100,
          align: "right",
        },
      ],
    };
  },
  watch: {
    // 监听列表数据变化，更新图表
    dataList: {
      handler(newDataList: DataItem[]): void {
        if (this.myChart) {
          this.setChartOption(newDataList);
        }
      },
      deep: true,
    },
  },
  mounted() {
    // DOM 挂载后初始化图表和监听器
    nextTick(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50)); // 短暂延迟确保 ECharts 注入

      // 检查 ECharts 是否成功注入
      if (!(this as any).echarts) {
        console.error("ContentAreaAntd: ECharts 未正确注入。");
        return;
      }

      this.initChartInstance(); // 初始化 ECharts 实例
      this.setChartOption(this.dataList as DataItem[]); // 设置初始图表数据

      // 添加窗口 resize 监听，用于图表自适应
      this.resizeHandler = () => {
        if (this.myChart) {
          this.myChart.resize();
        }
      };
      window.addEventListener("resize", this.resizeHandler);
    });
  },
  beforeUnmount() {
    // 组件卸载前清理资源
    if (this.myChart) {
      this.myChart.dispose(); // 销毁 ECharts 实例
      this.myChart = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler); // 移除监听器
    }
  },
  methods: {
    /**
     * 初始化 ECharts 实例
     */
    initChartInstance(): void {
      const echartsInstance = (this as any).echarts; // 获取注入的 ECharts
      if (!echartsInstance) {
        console.error("ContentAreaAntd: 无法初始化图表，ECharts 不可用。");
        return;
      }

      const chartDom = this.$refs.chartRef as HTMLElement; // 获取图表容器 DOM
      if (chartDom && !this.myChart) {
        this.myChart = echartsInstance.init(chartDom); // 初始化 ECharts
      } else if (!chartDom) {
        console.warn("ContentAreaAntd: 图表 DOM 元素 'chartRef' 未找到。");
      }
    },

    /**
     * 设置 ECharts 图表配置项并更新图表
     * @param data - 列表数据
     */
    setChartOption(data: DataItem[]): void {
      if (this.myChart && data && data.length > 0) {
        // ECharts 配置项
        const option: EChartsOption = {
          tooltip: { trigger: "item", formatter: "{a} <br/>{b} : {c} ({d}%)" }, // 提示框
          legend: {
            // 图例
            orient: "vertical",
            left: "left",
            data: data.map((item) => item.bkReasonName),
            type: "scroll",
            height: "85%",
            tooltip: { show: true }, // 移除末尾逗号
          },
          series: [
            // 系列数据 (饼图)
            {
              name: "退货原因",
              type: "pie",
              radius: "70%",
              center: ["60%", "50%"],
              data: data.map((item) => ({
                value: item.totalBreakTime,
                name: item.bkReasonName,
              })), // 转换数据格式
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              }, // 高亮样式
              label: { formatter: "{b}: {d}%", fontSize: 10 }, // 标签显示格式
            },
          ],
        };
        this.myChart.setOption(option, true); // 应用配置，true 表示不合并
      } else if (this.myChart) {
        this.myChart.clear(); // 数据为空时清空图表
      }
    },
  },
});
</script>
<style scoped lang="less">
/* --- 布局样式 --- */
.layout-content {
  flex-grow: 1; // 填充剩余空间
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 2px; // 微调顶部间距

  .content-area {
    flex-grow: 1;
    overflow: hidden; // 内部滚动由子元素控制
  }
}

/* --- 卡片样式 --- */
.list-card,
.chart-card {
  height: 620px; // 固定高度
  display: flex;
  flex-direction: column; // 垂直布局

  :deep(.ant-card-body) {
    flex-grow: 1; // 卡片主体填充
    overflow: hidden; // 隐藏主体溢出
  }
}

/* --- 图表与表格样式 --- */
.chart-container {
  // 图表容器
  height: 515px; // 固定高度
  width: 100%;
}

.table-cell-tooltip {
  // 表格单元格 Tooltip 样式
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: bottom;
}
</style>
