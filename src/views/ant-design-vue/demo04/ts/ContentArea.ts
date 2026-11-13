import { defineComponent, PropType, nextTick } from "vue";
import type { ECharts, EChartsOption } from 'echarts'; // 导入 ECharts 类型
import type { TableColumnType } from 'ant-design-vue'; // 导入 Antd 表格列类型

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
      from: 'echarts', // 来源名称
      default: null // 提供默认值或处理未注入的情况
    }
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
      handler(newDataList: DataItem[]): void { // 为 handler 参数添加类型
        if (this.myChart) {
          this.setChartOption(newDataList);
        }
      },
      deep: true,
    },
  },
  mounted() {
    nextTick(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));

      // 检查注入的 echarts 是否有效
      if (!(this as any).echarts) {
        console.error("ContentAreaAntd: ECharts instance is not injected correctly.");
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
        console.error("ContentAreaAntd: Cannot initialize chart, ECharts not available.");
        return;
      }

      const chartDom = this.$refs.chartRef as HTMLElement; // 断言为 HTMLElement
      if (chartDom && !this.myChart) {
        // 使用注入的 echarts 实例
        this.myChart = echartsInstance.init(chartDom);
      } else if (!chartDom) {
        console.warn("ContentAreaAntd: Chart DOM element 'chartRef' not found.");
      }
    },

    setChartOption(data: DataItem[]): void { // 为方法参数添加类型
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
            type: 'scroll',
            height: '85%',
            tooltip: {
              show: true
            }
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
                formatter: '{b}: {d}%',
                fontSize: 10
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
