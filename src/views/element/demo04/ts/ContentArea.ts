import { defineComponent, ref, nextTick, PropType } from "vue";
import * as echarts from "echarts"; // 导入 ECharts 主模块
import type { EChartsOption, ECharts } from 'echarts'; // 导入 ECharts 类型
import type { CallbackDataParams } from 'echarts/types/dist/shared'; // 导入 ECharts 回调参数类型

// 定义 ContentArea 组件
export default defineComponent({
  name: "ContentArea", // 组件名称
  props: {
    // 接收父组件传递的故障模式列表数据
    dataList: {
      // 直接定义期望的数组元素结构，而不是引用外部类型
      type: Array as PropType<Array<{
        bkReasonName: string;
        totalBreakTime: number | string;
        totalBreakTimeRate?: string | number | null;
      }>>,
      required: true, // 必需属性
      default: () => [], // 默认值为空数组
    },
  },
  // 组件内部状态数据
  data(): {
    _chartInstance: ECharts | null; // ECharts 实例引用
    _chartResizeHandler: (() => void) | null; // 图表 resize 事件处理器引用
    _resizeObserver: ResizeObserver | null; // ResizeObserver 实例引用
    innerContentHeight: number; // 内部内容区域高度 (用于计算图表高度)
  } {
    return {
      _chartInstance: null, // 初始化为 null
      _chartResizeHandler: null, // 初始化为 null
      _resizeObserver: null, // 初始化为 null
      innerContentHeight: 300, // 默认高度
    };
  },
  // 监听器
  watch: {
    // 监听 dataList 属性的变化
    dataList: {
      // 当 dataList 变化时执行的处理器
      // 直接使用内联类型定义
      handler(newData: Array<{ bkReasonName: string; totalBreakTime: number | string; totalBreakTimeRate?: string | number | null }>) {
        // 如果新数据存在且不为空，则初始化图表
        if (newData && newData.length > 0) {
          this.initChart();
        }
      },
      deep: true, // 深度监听数组内部变化
      immediate: true, // 组件创建时立即执行一次 handler
    },
  },
  // 生命周期钩子：组件挂载后
  mounted() {
    // 使用 nextTick 确保 DOM 更新完成
    nextTick(() => {
      // 获取根元素引用
      const rootEl = this.$refs.contentRoot as HTMLElement | null;
      if (!rootEl) return; // 如果根元素不存在，则退出

      // 计算内部内容高度
      this.calculateInnerContentHeight();

      // 如果浏览器支持 ResizeObserver，则使用它监听根元素尺寸变化
      if (typeof ResizeObserver !== "undefined") {
        this._resizeObserver = new ResizeObserver(
          this.calculateInnerContentHeight // 尺寸变化时重新计算高度
        );
        this._resizeObserver.observe(rootEl); // 开始监听
      } else {
        // 否则，回退到监听 window 的 resize 事件
        window.addEventListener("resize", this.calculateInnerContentHeight);
      }
    });
  },
  // 生命周期钩子：组件卸载前
  beforeUnmount() {
    // 销毁 ECharts 实例，释放资源
    if (this._chartInstance) {
      this._chartInstance.dispose();
    }
    // 移除 window resize 事件监听器
    if (this._chartResizeHandler) {
      window.removeEventListener("resize", this._chartResizeHandler);
    }
    // 停止 ResizeObserver 监听
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  },
  // 方法定义
  methods: {
    /**
     * 计算内部内容区域的高度
     * 用于动态调整列表和图表的高度以适应容器
     */
    calculateInnerContentHeight(): void {
      const rootEl = this.$refs.contentRoot as HTMLElement | null;
      // 确保根元素及其查询方法可用
      if (!rootEl || typeof rootEl.querySelector !== "function") {
        console.warn("ContentArea: 根元素引用尚未准备好进行查询。");
        return;
      }

      // 获取卡片元素 (列表卡片或图表卡片)
      const cardEl = rootEl.querySelector(".list-card") as HTMLElement ||
        rootEl.querySelector(".chart-card") as HTMLElement | null;
      if (!cardEl) return; // 卡片不存在则退出

      // 获取卡片头部和主体元素
      const cardHeader = cardEl.querySelector(".el-card__header") as HTMLElement | null;
      const cardBody = cardEl.querySelector(".el-card__body") as HTMLElement | null;

      // 获取卡片头部高度 (若不存在则使用默认值)
      const cardHeaderHeight = cardHeader ? cardHeader.offsetHeight : 40;

      // 获取卡片主体 padding (若不存在则使用默认值)
      const cardBodyStyles = cardBody ? window.getComputedStyle(cardBody) : null;
      const cardBodyPaddingY = cardBodyStyles
        ? parseFloat(cardBodyStyles.paddingTop) + parseFloat(cardBodyStyles.paddingBottom)
        : 30;

      // 计算可用高度和内部高度
      const availableHeight = rootEl.clientHeight; // 容器总高度
      const innerHeight = availableHeight - cardHeaderHeight - cardBodyPaddingY; // 减去头部和 padding

      // 设置内部内容高度，确保最小值为 150
      this.innerContentHeight = Math.max(innerHeight, 150);

      // 如果图表实例存在，则在下一次 DOM 更新后调整其大小
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
      // 使用 nextTick 确保图表容器 DOM 已渲染
      nextTick(() => {
        const chartDom = this.$refs.chartRef as HTMLElement | null;
        if (!chartDom) {
          console.warn("ContentArea: 图表 DOM 元素未找到。");
          return;
        }
        // 设置 ECharts 图表
        this.setupEcharts(chartDom);
      });
    },

    /**
     * 设置 ECharts 图表实例和配置
     * @param chartDom 图表容器的 DOM 元素
     */
    setupEcharts(chartDom: HTMLElement): void {
      // 如果已存在图表实例，先销毁并移除旧的 resize 监听器
      if (this._chartInstance) {
        this._chartInstance.dispose();
        if (this._chartResizeHandler) {
          window.removeEventListener("resize", this._chartResizeHandler);
        }
      }

      // 初始化 ECharts 实例
      const myChart: ECharts = echarts.init(chartDom);

      // 准备图表数据：类别和比率
      const categories: string[] = this.dataList.map((item) => item.bkReasonName);
      const rates: number[] = this.dataList.map(
        (item) =>
          parseFloat(String(item.totalBreakTimeRate || "0").replace("%", "")) || 0 // 将百分比字符串转为数字
      );

      // 默认颜色列表，用于条形图颜色循环
      const defaultColors: string[] = [
        "#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399",
        "#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de",
        "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc",
      ];

      // ECharts 配置项
      const option: EChartsOption = {
        tooltip: { // 提示框配置
          trigger: "axis", // 坐标轴触发
          axisPointer: { type: "shadow" }, // 阴影指示器
          formatter: "{b}: {c}%", // 格式化显示：类别: 值%
        },
        legend: { // 图例配置
          show: false, // 不显示图例
        },
        grid: { // 网格配置，控制图表区域位置
          top: "5%", left: "25%", right: "10%", bottom: "5%", // 边距
          containLabel: false, // grid 区域不包含坐标轴的标签
        },
        xAxis: { // X 轴配置 (水平轴，显示百分比)
          type: "value", // 数值轴
          name: "占比 (%)", // 轴名称
          nameLocation: "middle", // 名称居中
          nameGap: 25, // 名称与轴线距离
          nameTextStyle: { padding: [0, 0, 5, 0] }, // 名称内边距
          axisLabel: { formatter: "{value}%" }, // 标签格式化
          position: "top", // X 轴位于顶部
        },
        yAxis: { // Y 轴配置 (垂直轴，显示故障模式名称)
          type: "category", // 类别轴
          data: categories, // 类别数据
          axisTick: { alignWithLabel: true }, // 刻度线与标签对齐
          inverse: true, // 反向坐标轴，使最大值在顶部
          axisLabel: { // 轴标签配置
            interval: 0, // 显示所有标签
            fontSize: 12, // 字体大小
            // 标签过长时截断显示
            formatter: (value: string) =>
              value.length > 10 ? value.substring(0, 10) + "..." : value,
          },
        },
        series: [ // 系列列表
          {
            name: "故障模式分布", // 系列名称
            type: "bar", // 条形图
            data: rates, // 系列数据
            label: { // 条形图标签配置
              show: true, // 显示标签
              position: "right", // 标签位于右侧
              formatter: "{c}%", // 格式化显示值%
              color: "#333", // 标签颜色
              fontSize: 10, // 标签字体大小
            },
            itemStyle: { // 条形图样式
              // 根据数据索引循环使用颜色
              color: (params: CallbackDataParams) => {
                return defaultColors[params.dataIndex % defaultColors.length];
              },
            },
          },
        ],
      };

      // 应用配置项到图表实例
      myChart.setOption(option);

      // 保存图表实例和 resize 处理器
      this._chartInstance = myChart;
      this._chartResizeHandler = () => {
        this._chartInstance?.resize(); // 窗口 resize 时调整图表大小
      };
      // 添加 window resize 事件监听
      window.addEventListener("resize", this._chartResizeHandler);
    },
  },
});
