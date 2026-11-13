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

<script>
import { ref, nextTick } from "vue";
import * as echarts from "echarts"; // 引入 ECharts 库

export default {
  name: "ContentArea", // 组件名称
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
      _chartInstance: null, // ECharts 图表实例
      _chartResizeHandler: null, // ECharts 图表自身的窗口大小调整处理器
      _resizeObserver: null, // 用于监听组件根元素大小变化的 ResizeObserver 实例
      innerContentHeight: 300, // 表格和图表内容的内部高度，由 JS 动态计算，默认 300px
    };
  },
  watch: {
    // 监听器
    dataList: {
      // 监听父组件传递的 dataList 属性变化
      handler(newData) {
        // 处理函数
        if (newData && newData.length > 0) {
          this.initChart(); // 如果新数据有效，重新初始化图表
        }
      },
      deep: true, // 深度监听，即使数组内部对象变化也触发
      immediate: true, // 组件首次加载时立即执行一次 handler (用于初始加载图表)
    },
  },
  mounted() {
    // 组件挂载后执行
    nextTick(() => {
      // 确保 DOM 已经渲染完成
      const rootEl = this.$refs.contentRoot; // 获取组件根元素的引用 (即 <div class="layout-content">)
      if (!rootEl) return; // 如果根元素不存在，则退出

      this.calculateInnerContentHeight(); // 首次计算内部内容高度

      // 使用 ResizeObserver 监听根元素尺寸变化，更精确地触发高度重新计算
      // ResizeObserver 可以在元素尺寸变化时 (不仅仅是窗口 resize) 触发回调
      if (typeof ResizeObserver !== "undefined") {
        this._resizeObserver = new ResizeObserver(
          this.calculateInnerContentHeight // 当尺寸变化时，调用此方法重新计算高度
        );
        this._resizeObserver.observe(rootEl); // 开始监听根元素
      } else {
        // 如果浏览器不支持 ResizeObserver，则回退到监听窗口大小变化
        // 这在窗口大小调整时也能工作，但不如下面的精确
        window.addEventListener("resize", this.calculateInnerContentHeight);
      }
    });
    // 注意：ECharts 的初始化由 watch 的 immediate: true 触发，无需在此处显式调用 initChart()
  },
  methods: {
    // 组件方法
    /**
     * @description 计算表格和图表可用的内部高度 (核心逻辑)
     * - 获取组件根元素的高度 (此高度由父组件的 Flexbox 布局动态分配)
     * - 估算卡片头部 (el-card__header) 和主体内边距 (el-card__body padding) 的高度
     * - 从根元素高度中减去这些非内容区域的高度，得到内容区域的可用高度
     * - 设置一个最小高度 (例如 150px) 防止计算出的高度过小或为负
     * - 更新 `innerContentHeight` 数据属性，此属性绑定到 el-table 和图表容器的 height
     * - 在高度计算完成后，如果 ECharts 实例已存在，则触发其 resize 方法，使其适应新高度
     */
    calculateInnerContentHeight() {
      const rootEl = this.$refs.contentRoot; // 获取根元素引用
      // 确保根元素及其查询方法可用
      if (!rootEl || typeof rootEl.querySelector !== "function") {
        console.warn("ContentArea: 根元素引用尚未准备好进行查询。");
        return;
      }
      // 查找任一卡片元素 (列表或图表卡片) 以估算头部和内边距
      const cardEl =
        rootEl.querySelector(".list-card") ||
        rootEl.querySelector(".chart-card");
      if (!cardEl) return; // 如果找不到卡片，则退出

      const cardHeader = cardEl.querySelector(".el-card__header"); // 获取卡片头部
      const cardBody = cardEl.querySelector(".el-card__body"); // 获取卡片主体

      // 获取卡片头部高度，如果找不到则估算为 40px (需要根据实际情况调整)
      const cardHeaderHeight = cardHeader ? cardHeader.offsetHeight : 40;
      // 获取卡片主体的计算样式，用于读取 padding
      const cardBodyStyles = cardBody
        ? window.getComputedStyle(cardBody)
        : null;
      // 获取卡片主体垂直方向的 padding 总和，如果获取不到则估算为 30px (15px + 15px)
      const cardBodyPaddingY = cardBodyStyles
        ? parseFloat(cardBodyStyles.paddingTop) +
          parseFloat(cardBodyStyles.paddingBottom)
        : 30; // 估算值

      // 获取组件根元素的实际渲染高度 (由父组件的 Flex 布局分配)
      const availableHeight = rootEl.clientHeight;
      // 计算可用于卡片主体内部内容 (表格/图表) 的高度
      const innerHeight = availableHeight - cardHeaderHeight - cardBodyPaddingY;

      // 确保计算出的高度不小于最小值 150px
      this.innerContentHeight = Math.max(innerHeight, 150);

      // 如果 ECharts 实例已存在，则在 DOM 更新后触发其 resize
      // (nextTick 确保 innerContentHeight 的变化已应用到 DOM)
      if (this._chartInstance) {
        nextTick(() => {
          // 使用 nextTick 确保 DOM 尺寸已更新
          this._chartInstance.resize();
        });
      }
    },

    /**
     * @description 初始化 ECharts 图表 (入口)
     * - 使用 nextTick 确保图表容器 DOM 元素已渲染
     * - 获取图表容器的引用 (`this.$refs.chartRef`)
     * - 调用 setupEcharts 进行图表的具体配置和渲染
     */
    initChart() {
      nextTick(() => {
        // 确保图表容器 DOM 元素已准备好
        const chartDom = this.$refs.chartRef; // 获取图表容器引用
        if (!chartDom) {
          console.warn("ContentArea: 图表 DOM 元素未找到。");
          return;
        }
        this.setupEcharts(chartDom); // 设置并渲染 ECharts
      });
    },

    /**
     * @description 配置并渲染 ECharts 图表
     * @param {HTMLElement} chartDom - 图表容器的 DOM 元素
     * - **销毁旧实例**: 如果已存在旧的图表实例 (`_chartInstance`)，先调用 `dispose()` 销毁它，并移除旧的窗口 resize 监听器 (`_chartResizeHandler`)，防止内存泄漏。
     * - **初始化新实例**: 使用 `echarts.init()` 在指定的 DOM 元素上初始化新的 ECharts 实例。
     * - **准备数据**: 从 `props.dataList` 提取图表所需的类目 (`categories`) 和数值 (`rates`)。注意处理百分比字符串和可能的空值。
     * - **定义配置项 (option)**:
     *   - `tooltip`: 配置提示框，坐标轴触发，显示阴影指示器，并格式化显示内容。
     *   - `legend`: 图例，此处设置为不显示。
     *   - `grid`: 配置绘图网格的位置和大小，留出足够空间给坐标轴标签。`containLabel: false` 表示 grid 边界不包含标签，需要手动调整 `left`, `right` 等。
     *   - `xAxis`: 配置 X 轴 (数值轴)，设置名称、位置、刻度标签格式等。`position: 'top'` 使 X 轴显示在图表顶部。
     *   - `yAxis`: 配置 Y 轴 (类目轴)，设置数据、刻度与标签对齐、反转 (`inverse: true` 使条形图从上到下按数据顺序排列)、标签截断等。
     *   - `series`: 配置图表系列。这里是一个条形图 (`type: 'bar'`)，设置名称、数据、标签 (`label`) 显示、图形样式 (`itemStyle`)，并使用函数为每个柱子循环应用不同的颜色。
     * - **应用配置**: 调用 `myChart.setOption(option)` 将配置应用到图表实例。
     * - **保存实例和处理器**: 将新创建的图表实例保存到 `_chartInstance`。创建一个新的 resize 处理器函数 `_chartResizeHandler`，并保存。
     * - **添加监听器**: 为 `window` 添加 `resize` 事件监听器，当窗口大小变化时调用 `_chartResizeHandler`，进而调用 ECharts 实例的 `resize()` 方法，使图表自适应容器大小。
     */
    setupEcharts(chartDom) {
      // 如果存在旧实例，先销毁
      if (this._chartInstance) {
        this._chartInstance.dispose(); // 销毁 ECharts 实例
        window.removeEventListener("resize", this._chartResizeHandler); // 移除旧的监听器
      }

      // 初始化 ECharts 实例
      const myChart = echarts.init(chartDom);

      // 从 props 准备图表数据
      const categories = this.dataList.map((item) => item.bkReasonName); // Y 轴类目
      const rates = this.dataList.map(
        // X 轴数据 (百分比)
        (item) =>
          // 将 "27.66%" 转换为 27.66，处理空值或无效值为 0
          parseFloat(String(item.totalBreakTimeRate || "0").replace("%", "")) ||
          0
      );

      // ECharts 默认颜色列表 (或从项目主题获取)
      const defaultColors = [
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
      const option = {
        tooltip: {
          // 提示框组件
          trigger: "axis", // 坐标轴触发
          axisPointer: { type: "shadow" }, // 阴影指示器
          formatter: "{b}: {c}%", // 格式化提示内容: 类目名: 值%
        },
        legend: {
          // 图例组件
          show: false, // 不显示图例
        },
        grid: {
          // 网格配置，控制图表绘图区域
          top: "5%", // 距容器顶部 5%
          left: "25%", // 距容器左侧 25% (给 Y 轴标签留空间)
          right: "10%", // 距容器右侧 10% (给条形图标签留空间)
          bottom: "5%", // 距容器底部 5%
          containLabel: false, // grid 区域不包含坐标轴的标签文字
        },
        xAxis: {
          // X 轴配置 (值轴)
          type: "value", // 数值轴
          name: "占比 (%)", // 轴名称
          nameLocation: "center", // 名称居中显示
          nameGap: 25, // 名称与轴线的距离
          nameTextStyle: { padding: [0, 0, 5, 0] }, // 名称内边距微调
          axisLabel: { formatter: "{value}%" }, // 刻度标签显示为 xx%
          position: "top", // X 轴显示在顶部
        },
        yAxis: {
          // Y 轴配置 (类目轴)
          type: "category", // 类目轴
          data: categories, // 类目数据 (退货原因名称)
          axisTick: { alignWithLabel: true }, // 刻度线与标签对齐
          inverse: true, // 类目反转，使得排名高的在上面
          axisLabel: {
            // 刻度标签配置
            interval: 0, // 强制显示所有标签
            fontSize: 12, // 字体大小
            formatter: function (value) {
              // 标签过长时截断并加省略号
              return value.length > 10 ? value.substring(0, 10) + "..." : value;
            },
          },
        },
        series: [
          // 系列列表 (可以有多个系列，例如折线图、饼图等)
          {
            name: "退货原因分布", // 系列名称 (用于 tooltip 等)
            type: "bar", // 图表类型：条形图
            data: rates, // 系列数据 (百分比数组)
            label: {
              // 图形上的文本标签 (显示在柱子右侧的百分比)
              show: true, // 显示标签
              position: "right", // 标签显示在柱子右侧
              formatter: "{c}%", // 标签内容格式为 xx%
              color: "#333", // 标签颜色
              fontSize: 10, // 标签字体大小
            },
            itemStyle: {
              // 图形样式 (柱子样式)
              color: function (params) {
                // 为每个柱子设置颜色
                // 使用默认颜色列表循环分配颜色
                return defaultColors[params.dataIndex % defaultColors.length];
              },
            },
          },
        ],
      };

      // 应用配置项到图表实例
      myChart.setOption(option);

      // 保存图表实例和 resize 处理器，用于后续操作和销毁
      this._chartInstance = myChart;
      this._chartResizeHandler = () => {
        // 定义 ECharts 自己的 resize 处理器
        if (this._chartInstance) {
          // 检查实例是否存在 (防止已销毁时调用)
          this._chartInstance.resize(); // 调用 ECharts 的 resize 方法使其自适应
        }
      };
      // 监听窗口大小变化，调用 ECharts 的 resize 处理器
      window.addEventListener("resize", this._chartResizeHandler);
    },
  },
};
</script>

<style scoped>
/* scoped 样式确保只作用于当前组件 */
/* --- 卡片基础样式 --- */
/* 左右卡片 (列表卡片和图表卡片) 的通用基础样式 */
.list-card,
.chart-card {
  background: #fff; /* 白色背景 */
  border-radius: 4px; /* 圆角 */
  border: 1px solid #ebeef5; /* 边框 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 阴影 */
  display: flex; /* 使用 Flexbox 布局内部元素 (header 和 body) */
  flex-direction: column; /* 内部元素垂直排列 */
  /* 高度由父级 Flexbox (el-col) 和 JS 动态计算决定，这里不需要设置固定高度 */
  /* 确保卡片自身能正确处理内部滚动 (如果需要的话，但这里由 el-table 和 chart-container 处理) */
  overflow: hidden; /* 隐藏卡片自身可能产生的滚动条 */
}

/* --- 卡片内部布局 (使用 :deep 穿透 scoped) --- */
/* 深度选择器 :deep() 用于修改子组件 Element Plus 的内部样式 */
/* 使卡片主体 (el-card__body) 能够填充卡片的剩余垂直空间 */
:deep(.el-card__header) {
  /* 如果需要，可以调整卡片头部的样式，例如内边距 */
  padding: 15px; /* 示例：调整头部内边距 */
  font-weight: bold; /* 示例：头部文字加粗 */
  border-bottom: 1px solid #ebeef5; /* 示例：添加下边框 */
}

:deep(.el-card__body) {
  flex-grow: 1; /* 占据所有可用的垂直空间 (关键) */
  padding: 15px; /* 调整内边距，比默认的 20px 稍小 */
  overflow: hidden; /* 隐藏内部可能溢出的内容 (重要，防止破坏布局) */
  display: flex; /* 允许内部元素 (如表格、图表容器) 使用 Flex */
  flex-direction: column; /* 内部元素垂直排列 */
  /* 确保 body 在 flex 布局下能正确收缩 */
  min-height: 0;
}

/* --- 表格和图表容器样式 --- */
/* 表格样式 */
:deep(.el-table) {
  /* 表格高度由模板中的 :height="innerContentHeight" 动态绑定 */
  /* 这里不需要设置 height */
  /* 确保表格在 flex 容器 (el-card__body) 中能正确填充 */
  flex-grow: 1; /* 如果 el-card__body 中只有表格，让表格填充 */
  /* 如果表格需要滚动条，确保其父容器 el-card__body 设置了 overflow: hidden; */
}

/* 图表容器样式 */
.chart-container {
  width: 100%; /* 宽度充满父容器 (el-card__body) */
  /* 图表高度由模板中的 :style="{ height: innerContentHeight + 'px' }" 动态绑定 */
  /* 这里不需要设置 height */
  /* 确保图表容器在 flex 容器 (el-card__body) 中能正确填充 */
  flex-grow: 1; /* 如果 el-card__body 中只有图表容器，让其填充 */
  /* 保证最小高度，防止计算错误时完全塌陷 */
  min-height: 150px;
}

/* --- 可选辅助样式 --- */
/* 表格单元格内文本过长时显示省略号的样式 (可选，如果 el-table-column 的 show-overflow-tooltip 不满足需求) */
.table-cell-tooltip {
  display: inline-block; /* 行内块元素 */
  max-width: 100%; /* 最大宽度不超过单元格 */
  overflow: hidden; /* 隐藏溢出部分 */
  white-space: nowrap; /* 不换行 */
  text-overflow: ellipsis; /* 显示省略号 */
  vertical-align: bottom; /* 垂直对齐方式 (根据需要调整) */
}
</style>
