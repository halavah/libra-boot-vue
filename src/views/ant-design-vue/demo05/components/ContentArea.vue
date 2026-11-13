<template>
  <!-- 布局 2: 内容区域 -->
  <div class="layout-content">
    <div class="content-area">
      <a-row :gutter="16">
        <!-- 左侧列表 -->
        <a-col :span="6">
          <a-card :bordered="false" class="list-card" size="small">
            <template #title>
              <span>退货原因列表</span>
            </template>
            <a-table
              :columns="tableColumns"
              :data-source="dataList"
              :pagination="false"
              :scroll="{ y: 475 }"
              size="small"
              row-key="bkReasonName"
            >
              <template #bodyCell="{ column, text }">
                <template v-if="column.key === 'bkReasonName'">
                  <a-tooltip :title="text">
                    <span class="table-cell-tooltip">{{ text }}</span>
                  </a-tooltip>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
        <!-- 右侧图表 -->
        <a-col :span="18">
          <a-card :bordered="false" class="chart-card" size="small">
            <template #title>
              <span>退货原因分布图（%）</span>
            </template>
            <div ref="chartRef" class="chart-container"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, nextTick } from "vue";
import type { ECharts, EChartsOption } from "echarts"; // 导入 ECharts 类型
import type { TableColumnType } from "ant-design-vue"; // 导入 Antd 表格列类型

// --- 类型定义 ---
interface DataItem {
  bkReasonName: string;
  totalBreakTimeRate: string; // 保持字符串
  totalBreakTime: number;
}

// --- 组件定义 ---
export default defineComponent({
  name: "ContentAreaAntd", // 组件名称
  // 显式声明注入的依赖及其类型
  inject: {
    echarts: {
      from: "echarts", // 来源名称
      default: null, // 提供默认值或处理未注入的情况
    },
  },
  props: {
    // 使用 PropType 定义复杂类型
    dataList: {
      type: Array as PropType<DataItem[]>, // 类型断言为 DataItem 数组
      required: true,
      default: () => [],
    },
  },
  data(): {
    myChart: ECharts | null; // ECharts 实例类型
    resizeHandler: (() => void) | null; // 函数类型或 null
    tableColumns: TableColumnType[]; // Antd 表格列类型数组
  } {
    return {
      myChart: null,
      resizeHandler: null,
      tableColumns: [
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
    dataList: {
      handler(newDataList: DataItem[]): void {
        // 为 handler 参数添加类型
        if (this.myChart) {
          this.setChartOption(newDataList);
        }
      },
      deep: true,
    },
  },
  mounted() {
    nextTick(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 检查注入的 echarts 是否有效
      if (!(this as any).echarts) {
        console.error(
          "ContentAreaAntd: ECharts instance is not injected correctly."
        );
        return;
      }

      this.initChartInstance();
      // 明确传递类型正确的 dataList
      this.setChartOption(this.dataList as DataItem[]);

      this.resizeHandler = () => {
        if (this.myChart) {
          this.myChart.resize();
        }
      };
      window.addEventListener("resize", this.resizeHandler);
    });
  },
  beforeUnmount() {
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
  },
  methods: {
    initChartInstance(): void {
      // 使用类型守卫确保 echarts 存在
      const echartsInstance = (this as any).echarts;
      if (!echartsInstance) {
        console.error(
          "ContentAreaAntd: Cannot initialize chart, ECharts not available."
        );
        return;
      }

      const chartDom = this.$refs.chartRef as HTMLElement; // 断言为 HTMLElement
      if (chartDom && !this.myChart) {
        // 使用注入的 echarts 实例
        this.myChart = echartsInstance.init(chartDom);
      } else if (!chartDom) {
        console.warn(
          "ContentAreaAntd: Chart DOM element 'chartRef' not found."
        );
      }
    },

    setChartOption(data: DataItem[]): void {
      // 为方法参数添加类型
      if (this.myChart && data && data.length > 0) {
        // 定义 ECharts 配置项类型
        const option: EChartsOption = {
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b} : {c} ({d}%)",
          },
          legend: {
            orient: "vertical",
            left: "left",
            // data 类型应为 string[]
            data: data.map((item) => item.bkReasonName),
            type: "scroll",
            height: "85%",
            tooltip: {
              show: true,
            },
          },
          series: [
            {
              name: "退货原因",
              type: "pie",
              radius: "70%",
              center: ["60%", "50%"],
              // data 类型应为 { value: number, name: string }[]
              data: data.map((item) => ({
                value: item.totalBreakTime,
                name: item.bkReasonName,
              })),
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
              label: {
                formatter: "{b}: {d}%",
                fontSize: 10,
              },
            },
          ],
        };
        // setOption 第二个参数类型为 boolean | NotMergeOption
        this.myChart.setOption(option, true);
      } else if (this.myChart) {
        this.myChart.clear();
      }
    },
  },
});
</script>
<style scoped>
/* --- 布局样式 --- */
.layout-content {
  /* 内容区域外层容器 */
  flex-grow: 1; /* 占据剩余垂直空间 */
  display: flex; /* 使用 Flexbox 布局 */
  flex-direction: column; /* 垂直排列子元素 */
  overflow: hidden; /* 隐藏溢出内容 */
  padding-top: 2px; /* 与上方元素的间距 */
}

.content-area {
  /* 包含左右两列的区域 */
  flex-grow: 1; /* 占据 layout-content 的剩余空间 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* --- 卡片样式 --- */
.list-card, /* 左侧列表卡片 */
.chart-card {
  /* 右侧图表卡片 */
  height: 620px; /* 固定卡片高度 */
  display: flex; /* 使用 Flexbox 布局 */
  flex-direction: column; /* 垂直排列卡片内部元素 (标题和内容) */
}

.list-card .ant-card-body, /* 左侧卡片内容区域 */
.chart-card .ant-card-body {
  /* 右侧卡片内容区域 */
  flex-grow: 1; /* 占据卡片内剩余空间 */
  overflow: hidden; /* 隐藏溢出内容 (如图表或表格) */
  padding: 0px 1px 0px 0px !important; /* 覆盖 Antd 默认内边距，进行微调 */
}

/* --- 图表与表格样式 --- */
.chart-container {
  /* ECharts 图表容器 */
  height: 515px; /* 固定图表高度 */
  width: 100%; /* 图表宽度占满父容器 */
}

.table-cell-tooltip {
  /* 表格单元格内用于省略提示的 span */
  display: inline-block; /* 使其可以设置宽度 */
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: bottom; /* 对齐方式 */
}
</style>
