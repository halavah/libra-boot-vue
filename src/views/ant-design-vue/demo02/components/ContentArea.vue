<template>
  <!-- 布局 2: 内容区域 -->
  <div class="layout-content">
    <div class="content-area">
      <a-row :gutter="16">
        <!-- 左侧列表 -->
        <a-col :span="6">
          <a-card :bordered="false" class="list-card" size="small">
            <template #title>
              <span>故障模式列表</span>
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
              <span>故障模式分布图（%）</span>
            </template>
            <div ref="chartRef" class="chart-container"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
// --- 核心库导入 ---
import { ref, watch, onMounted, onBeforeUnmount, inject, nextTick } from "vue";

// --- 全局注入 ---
const echarts = inject("echarts"); // 从父组件或全局获取 ECharts 实例

// --- Props 定义 ---
// 接收父组件传递的故障模式列表数据
const props = defineProps({
  dataList: {
    // 列表数据
    type: Array,
    required: true,
    default: () => [], // 默认为空数组
  },
});

// --- Refs 与变量 ---
const chartRef = ref(null); // ECharts 图表容器的 DOM 引用
let myChart = null; // ECharts 图表实例变量

// --- 表格配置 ---
// 左侧表格的列定义
const tableColumns = [
  {
    title: "故障模式", // 列标题
    dataIndex: "bkReasonName", // 数据字段
    key: "bkReasonName", // 唯一键
    ellipsis: true, // 开启单元格内容省略
  },
  {
    title: "停机时间", // 列标题
    dataIndex: "totalBreakTime", // 数据字段
    key: "totalBreakTime", // 唯一键
    width: 100, // 列宽度
    align: "right", // 右对齐
  },
];

// --- ECharts 相关方法 ---
// 初始化 ECharts 实例
const initChartInstance = () => {
  // 确保 DOM 容器存在且图表实例尚未创建
  if (chartRef.value && !myChart) {
    myChart = echarts.init(chartRef.value); // 初始化 ECharts
  }
};

// 设置或更新 ECharts 图表选项
const setChartOption = (data) => {
  // 确保图表实例存在且有有效数据
  if (myChart && data && data.length > 0) {
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
        data: props.dataList.map((item) => item.bkReasonName), // 图例数据来源于 props
      },
      series: [
        // 系列列表
        {
          name: "故障模式", // 系列名称
          type: "pie", // 图表类型：饼图
          radius: "70%", // 饼图半径
          center: ["60%", "50%"], // 饼图中心位置 [水平, 垂直]
          data: props.dataList.map((item) => ({
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
        },
      ],
    };
    // 应用配置项到图表实例，true 表示不合并，直接替换
    myChart.setOption(option, true);
  } else if (myChart) {
    // 如果没有有效数据但图表实例存在，则清空图表
    myChart.clear();
  }
};

// --- 窗口大小调整处理 ---
let resizeHandler = null; // 用于存储 resize 事件处理函数引用

// --- 监听器 ---
// 深度监听 props.dataList 的变化
watch(
  () => props.dataList,
  (newDataList) => {
    // 当数据列表变化时，如果图表实例已存在，则更新图表选项
    if (myChart) {
      setChartOption(newDataList);
    }
  },
  { deep: true } // 开启深度监听
);

// --- 生命周期钩子 ---
// 组件挂载后执行
onMounted(async () => {
  // 等待下次 DOM 更新循环结束，确保 #chartRef 元素已渲染
  await nextTick();
  // 添加短暂延迟，进一步确保容器尺寸计算完成 (应对复杂布局)
  setTimeout(() => {
    initChartInstance(); // 初始化 ECharts 实例
    setChartOption(props.dataList); // 使用初始数据设置图表选项
  }, 10); // 延迟 10 毫秒

  // 定义并注册窗口大小调整事件的处理函数
  resizeHandler = () => {
    if (myChart) {
      myChart.resize(); // 调用 ECharts 的 resize 方法调整图表大小
    }
  };
  window.addEventListener("resize", resizeHandler); // 添加监听器
});

// 组件卸载前执行
onBeforeUnmount(() => {
  // 销毁 ECharts 实例，释放资源
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  // 移除窗口大小调整事件监听器
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
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
