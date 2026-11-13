import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'cjsbgzms',
  setup() {
    // 加载
    // 1.主页面
    // 2.弹框表单
    const loading = ref(true)
    const dataFormLoading = ref(false)

    // 筛选-树
    // 1.节点属性
    // 2.节点数据
    const treeProps = {
      label: 'plname',
      children: 'children',
    }
    const treeData = ref([])

    // 筛选-表单
    // 1.ref
    // 2.规则
    const searchFormRef = ref('')
    const searchFormRules = reactive({
      // equipmentNo: [
      //     {required: true, message: '请输入设备号', trigger: 'blur'},
      // ],
      vDay: [
        { type: 'array', required: true, message: '请选择日期范围', trigger: 'change' }
      ],
    })

    // 筛选-表格
    // 1.ref
    // 2.可选行数
    // 3.当前行
    const dataTableRef = ref('')
    const selectionRows = [];
    const currentRow = {};

    // 筛选-表格-分页
    // 1.数据列表高H = WindowH - (HeaderH_60 + SearchFormH_50 + MainPaddingTop_20) - PagerH_36 - 10
    // 2.分页大小：可选15, 25, 35, 50, 100
    // 3.分页大小，默认：15
    // 4.当前页：1
    // 5.总数：默认置0
    const dataTableHeight = ref(window.innerHeight - 176)
    const pageSizes = ref([15, 25, 35, 50, 100])
    const pageSize = ref(15)
    const currentPage = ref(1)
    const dataTotal = ref(0)

    // 筛选-表格-弹框表单
    // 1.ref
    // 2.标题
    // 3.可见性
    // 4.状态：create、update、detail
    const dataFormRef = ref('')
    const dataFormTitle = ref('详情')
    const dataFormVisible = ref(false)
    const dataFormStatus = ref('');

    // 返回
    return {
      // 加载
      loading,
      dataFormLoading,

      // 筛选-树
      treeProps,
      treeData,

      // 筛选-表单
      searchFormRules,
      searchFormRef,

      // 筛选-表格
      dataTableRef,
      selectionRows,
      currentRow,

      // 筛选-表格-分页
      dataTableHeight,
      pageSizes,
      pageSize,
      currentPage,
      dataTotal,

      // 筛选-表格-弹框表单
      dataFormRef,
      dataFormTitle,
      dataFormVisible,
      dataFormStatus,
    };
  },
  data() {
    return {
      // 通用-地址
      wsUrl: 'http://localhost:9994/pisces-boot',
      // 通用-属性
      attrCnts: {
        yesOrNo: ['是', '否'],
        faultModeOptions: [],
      },
      // 筛选-表单
      searchForm: {
        plNoKey: [],
        equipmentNo: '',
        stopReasonName: [],
        vDay: [
          // dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
          // dayjs().format('YYYY-MM-DD')
          '2000-01-01',
          '2026-01-01'
        ],
      },
      // 筛选-表格
      dataList: [],
      dateLength: [],
      // 筛选-表格-弹框表单
      dataForm: {},
      // 分析功能文本
      analysisText: '演示订单售后记录001'
    };
  },
  mounted() {
    this.query();
    this.queryTree();
    this.queryStopReasonType();
  },
  methods: {
    // 查询_表格
    async query() {
      let _this = this;
      _this.loading = true;
      let params = {
        plNos: Array.isArray(_this.searchForm.plNoKey) && _this.searchForm.plNoKey.length > 0 ? _this.searchForm.plNoKey.join(',') : null,
        equipmentNo: _this.searchForm.equipmentNo || null,
        stopReasonNames: Array.isArray(_this.searchForm.stopReasonName) && _this.searchForm.stopReasonName.length > 0 ? _this.searchForm.stopReasonName.join(',') : null,
        startDate: _this.searchForm.vDay[0],
        endDate: _this.searchForm.vDay[1]
      };
      await axios({
        url: _this.wsUrl + '/cjsbgzms/list',
        method: 'POST',
        data: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }).then(res => {
        if (res.data.success) {
          const sortedData = res.data.result.sort((a, b) => {
            const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
            const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
            return valueB - valueA;
          });
          _this.dataList = sortedData;
          _this.initChart();
        } else {
          ElMessage.error(res.data.message || '获取列表数据失败');
        }
        _this.loading = false;
      });
    },

    // 查询_树形列表
    async queryTree() {
      let _this = this;
      _this.loading = true;
      await axios({
        url: _this.wsUrl + '/public/plNoTree',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }).then(res => {
        if (res.data.success) {
          // 递归处理函数，为所有节点添加 key 和 isLeaf
          const processNode = (node) => {
            // 使用 plno 作为 key
            node.key = node.plno;
            // 检查 children 是否存在且不为空数组来判断 isLeaf
            node.isLeaf = !node.children || node.children.length === 0;
            // 只有当 children 存在且不为空时才递归
            if (node.children && node.children.length > 0) {
              // 递归处理子节点
              node.children.forEach(processNode);
            }
          };
          // API 返回 result 是一个数组，包含一个根对象
          const rootObject = res.data.result[0];
          if (rootObject && rootObject.children) {
            // 从实际顶层节点开始处理
            rootObject.children.forEach(processNode);
            // 将处理后的顶层节点数组赋给 treeData
            _this.treeData = rootObject.children;
          } else {
            // 处理空数据情况
            _this.treeData = [];
          }
        } else {
          ElMessage.error(res.data.message || '获取树形列表失败');
          _this.treeData = [];
        }
        _this.loading = false;
      });
    },

    // 查询_下拉框_商品售后模式
    async queryStopReasonType() {
      let _this = this;
      _this.loading = true;
      await axios({
        url: _this.wsUrl + '/public/stopReasonType',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }).then(res => {
        if (res.data.success) {
          _this.attrCnts.faultModeOptions = res.data.result.map(item => {
            return { label: item.stopReasonType, value: item.stopReasonType };
          });
        } else {
          ElMessage.error(res.data.message || '获取下拉框_故障模式失败');
        }
        _this.loading = false;
      });
    },

    // 按钮_查询
    async fun_search(formEl) {
      let _this = this;
      if (!formEl) {
        return;
      }
      await formEl.validate((valid) => {
        if (valid) {
          _this.query();
        } else {
          ElMessage.warning('请检查相关参数');
        }
      })
    },

    // 按钮_重置
    async fun_reset(formEl) {
      let _this = this;
      if (!formEl) {
        return;
      }
      formEl.resetFields();
      _this.query();
    },

    /*******************************************************绘制：echarts图表*******************************************************/

    // 初始化图表
    initChart() {
      const chartDom = this.$refs.chartRef;
      if (chartDom) {
        this.setupEcharts(chartDom);
      } else {
        nextTick(() => {
          const chartDomAfterTick = this.$refs.chartRef;
          if (chartDomAfterTick) {
            this.setupEcharts(chartDomAfterTick);
          } else {
            console.warn("Chart ref not available even after nextTick");
          }
        });
      }
    },

    // 辅助函数，用于设置 ECharts
    setupEcharts(chartDom) {
      // 销毁旧实例（如果存在）
      if (this._chartInstance) {
        this._chartInstance.dispose();
        window.removeEventListener('resize', this._chartResizeHandler);
      }
      const myChart = echarts.init(chartDom);
      // 从 dataList 提取图表所需数据
      const categories = this.dataList.map(item => item.bkReasonName);
      // 解析百分比字符串为数值，如果解析失败则默认为 0
      const rates = this.dataList.map(item => parseFloat(String(item.totalBreakTimeRate).replace('%', '')) || 0);
      // ECharts 默认颜色列表 (可以自定义更多颜色)
      const defaultColors = [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ffc933',
        '#a5d6a7', '#81d4fa', '#ce93d8', '#ef9a9a', '#fff59d'
      ];
      const option = {
        // title: { // 移除标题
        //   text: '故障模式分布图 (%)',
        //   left: 'center'
        // },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: '{b}: {c}%' // 提示框显示百分比
        },
        legend: {
          orient: 'vertical', // 垂直布局
          right: 10,          // 靠右
          top: 'center',      // 垂直居中
          data: categories,   // 图例数据使用故障模式名称
          type: 'scroll',     // 如果图例项过多，允许滚动
          tooltip: {          // 为图例添加提示框
            show: true
          }
        },
        grid: {
          top: '5%',      // 减少顶部边距
          left: '25%',    // 大幅增加左侧边距，为 Y 轴标签留空间
          right: '15%',   // 保持右侧边距 (为图例和数值留空间)
          bottom: '5%',   // 减少底部边距
          containLabel: false // 设置为 false，让 grid.left 控制标签空间
        },
        // 交换 X 和 Y 轴
        xAxis: { // 原来的 Y 轴
          type: 'value',
          name: '占比 (%)', // X 轴名称
          nameLocation: 'center', // 名称位置居中（可选，看效果）
          nameGap: 25, // 名称与轴线距离（可能需要调整）
          nameTextStyle: { // 设置名称样式
            padding: [0, 0, 5, 0] // 调整内边距 [上, 右, 下, 左]，增加下内边距将文字向上推
          },
          axisLabel: {
            formatter: '{value}%' // X 轴标签显示百分号
          },
          position: 'top' // 可以将 X 轴放到顶部，节省底部空间
        },
        yAxis: { // 原来的 X 轴
          type: 'category',
          data: categories, // Y 轴数据使用故障模式名称
          axisTick: {
            alignWithLabel: true
          },
          inverse: true, // 反转 Y 轴顺序
          axisLabel: {
            interval: 0,    // 显示所有标签
            fontSize: 12,   // 可以恢复或设置合适的字体大小
          }
        },
        series: [{
          name: '故障模式分布', // 系列名称，与图例对应
          type: 'bar',
          data: rates, // 系列数据使用解析后的百分比数值
          label: { // 添加标签配置
            show: true,         // 显示标签
            position: 'right',  // 标签位置在条形右侧
            formatter: '{c}%',  // 格式化标签内容为 数值 + %
            color: '#333',      // 标签颜色 (可选)
            fontSize: 10        // 标签字体大小 (可选, 保持与Y轴标签一致或调整)
          },
          itemStyle: {
            color: function (params) {
              // 循环使用颜色列表
              return defaultColors[params.dataIndex % defaultColors.length];
            }
          }
        }]
      };
      myChart.setOption(option);

      this._chartInstance = myChart; // 保存图表实例
      this._chartResizeHandler = () => { myChart.resize(); };
      window.addEventListener('resize', this._chartResizeHandler);
    },
  },

  // 清理资源：在组件实例即将卸载并销毁之前调用
  beforeUnmount() {
    // 在组件销毁前移除事件监听器，防止内存泄漏
    if (this._chartResizeHandler) {
      window.removeEventListener('resize', this._chartResizeHandler);
    }
  }
};
