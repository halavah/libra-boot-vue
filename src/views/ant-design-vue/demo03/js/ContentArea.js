import { ref, watch, onMounted, onBeforeUnmount, inject, nextTick } from "vue";

// 注意：由于原始脚本是 <script setup>，它使用了组合式 API。
// 参考的 element/demo03/js/ContentArea.js 使用的是选项式 API。
// 这里我们遵循参考文件的风格，将组合式 API 逻辑转换为选项式 API。

export default {
  name: "ContentAreaAntd", // 组件名称 (建议与 element 版本区分)
  inject: ["echarts"], // 注入 echarts
  props: {
    // 定义从父组件接收的属性
    dataList: {
      // 退货原因列表数据
      type: Array, // 类型为数组
      required: true, // 必须传递
      default: () => [], // 默认值为空数组
    },
  },
  data() {
    // --- 组件内部状态数据 ---
    return {
      myChart: null, // ECharts 图表实例变量
      resizeHandler: null, // 用于存储 resize 事件处理函数引用
      // 表格列定义 (从 setup 移到 data)
      tableColumns: [
        {
          title: "退货原因", // 列标题
          dataIndex: "bkReasonName", // 数据字段
          key: "bkReasonName", // 唯一键
          ellipsis: true, // 开启单元格内容省略
        },
        {
          title: "订单暂停时长", // 列标题
          dataIndex: "totalBreakTime", // 数据字段
          key: "totalBreakTime", // 唯一键
          width: 100, // 列宽度
          align: "right", // 右对齐
        },
      ],
    };
  },
  watch: {
    // 监听器
    dataList: {
      // 监听父组件传递的 dataList 属性变化
      handler(newDataList) {
        // 当数据列表变化时，如果图表实例已存在，则更新图表选项
        if (this.myChart) {
          this.setChartOption(newDataList);
        }
      },
      deep: true, // 开启深度监听
      // immediate: true // 初始调用移到 mounted 中，确保 DOM 和实例存在
    },
  },
  mounted() {
    // 组件挂载后执行
    nextTick(async () => { // 使用 async 确保 nextTick 完成
      // 等待下次 DOM 更新循环结束，确保 #chartRef 元素已渲染
      // 添加短暂延迟，进一步确保容器尺寸计算完成 (应对复杂布局)
      await new Promise(resolve => setTimeout(resolve, 50)); // 增加延迟确保渲染

      this.initChartInstance(); // 初始化 ECharts 实例
      this.setChartOption(this.dataList); // 使用初始数据设置图表选项

      // 定义并注册窗口大小调整事件的处理函数
      this.resizeHandler = () => {
        if (this.myChart) {
          this.myChart.resize(); // 调用 ECharts 的 resize 方法调整图表大小
        }
      };
      window.addEventListener("resize", this.resizeHandler); // 添加监听器
    });
  },
  beforeUnmount() { // 使用 beforeUnmount 对应 onBeforeUnmount
    // 组件卸载前执行
    // 销毁 ECharts 实例，释放资源
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
    // 移除窗口大小调整事件监听器
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
  },
  methods: {
    // --- ECharts 相关方法 ---
    // 初始化 ECharts 实例
    initChartInstance() {
      // 确保 DOM 容器存在且图表实例尚未创建
      // 使用 this.$refs 访问模板引用
      const chartDom = this.$refs.chartRef;
      if (chartDom && !this.myChart) {
        this.myChart = this.echarts.init(chartDom); // 初始化 ECharts
      } else if (!chartDom) {
        console.warn("ContentAreaAntd: 图表 DOM 元素 'chartRef' 未找到。");
      }
    },

    // 设置或更新 ECharts 图表选项
    setChartOption(data) {
      // 确保图表实例存在且有有效数据
      if (this.myChart && data && data.length > 0) {
        // 定义图表配置项
        const option = {
          tooltip: {
            // 提示框配置
            trigger: "item", // 触发类型：数据项图形触发
            formatter: "{a} <br/>{b} : {c} ({d}%)", // 提示框内容格式器
          },
          legend: {
            // 图例配置
            orient: "vertical", // 垂直布局
            left: "left", // 靠左显示
            data: data.map((item) => item.bkReasonName), // 图例数据来源于 props
            type: 'scroll', // 当图例过多时可以滚动
            height: '85%', // 限制图例高度
            tooltip: { // 为图例项添加 tooltip
                show: true
            }
          },
          series: [
            // 系列列表
            {
              name: "退货原因", // 系列名称
              type: "pie", // 图表类型：饼图
              radius: "70%", // 饼图半径
              center: ["60%", "50%"], // 饼图中心位置 [水平, 垂直]
              data: data.map((item) => ({
                // 系列数据来源于 props
                value: item.totalBreakTime, // 数据值
                name: item.bkReasonName, // 数据项名称 (用于图例和提示框)
              })),
              emphasis: {
                // 高亮状态配置
                itemStyle: {
                  // 图形样式
                  shadowBlur: 10, // 阴影模糊大小
                  shadowOffsetX: 0, // 水平阴影偏移
                  shadowColor: "rgba(0, 0, 0, 0.5)", // 阴影颜色
                },
              },
              label: { // 饼图标签配置
                formatter: '{b}: {d}%', // 显示名称和百分比
                fontSize: 10 // 调整字体大小以防重叠
              },
            },
          ],
        };
        // 应用配置项到图表实例，true 表示不合并，直接替换
        this.myChart.setOption(option, true);
      } else if (this.myChart) {
        // 如果没有有效数据但图表实例存在，则清空图表
        this.myChart.clear();
      }
    },
  },
};
