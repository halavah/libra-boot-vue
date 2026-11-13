import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'mbjk-week',
  setup() {
    // 加载
    // 1.主页面
    // 2.弹框表单
    const loading = ref(false)
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
      vMonth: [
        { type: 'string', required: true, message: '请选择月份', trigger: 'change' }
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
      },
      // 筛选-表单
      searchForm: {
        vMonth: dayjs().format('YYYY-MM')
      },

      // 筛选-表格
      dataList: [],

      // 图表
      barChart: null,
      lineChart: null,

      // mock数据
      listData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": {
          "chartList": "33,374,45,40,0",
          "dataList": [
            {
              "mzrqfw": "第1周(05.01-05.07),第2周(05.08-05.14),第3周(05.15-05.21),第4周(05.22-05.28),第5周(05.29-05.31)",
              "zbgkglbm": "设备处+信息自动化处",
              "mbmc": "故障时间",
              "jxz": {
                "source": "0.0",
                "parsedValue": 0
              },
              "mzgzsj": "33,374,45,40,0"
            }
          ],
          "jxzList": "0.0"
        },
        "timestamp": 1748142453495
      },
    };
  },
  mounted() {
    // 1.查询
    this.query();
    // 2.监听窗口大小变化
    this.handleResize();
  },
  beforeUnmount() {
    // 1.销毁图表
    this.clearCharts();
  },
  methods: {
    // 查询_表格
    async query() {
      const _this = this;
      // 1.表格数据
      _this.dataList = _this.listData.result.dataList;

      // 2.绘制图表
      let weekCount = _this.dataList[0].mzrqfw.split(',').length;
      const processedTargetValue = _this.listData.result.jxzList
        ? parseFloat(_this.listData.result.jxzList) || 0
        : 0;
      const processedChartData = _this.listData.result.chartList
        ? _this.listData.result.chartList.split(',').map(v => Number(v) || 0)
        : Array(weekCount).fill(0);
      const weekNumbers = Array(weekCount).fill(0).map((_, i) => i + 1);
      const currentMonth = dayjs(_this.searchForm.vMonth).format('YYYY年M月');
      _this.initCharts(processedChartData, processedTargetValue, weekNumbers, currentMonth);
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
      });
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

    /*******************************************************绘制：表格*************************************************************/

    // 表格_表头样式
    hearderCellStyle({ columnIndex }) {
      if (columnIndex == '0' || columnIndex == '1') {
        return { backgroundColor: '#f3d07e', color: '#333' }
      } else {
        return { backgroundColor: '#a2f6e4', color: '#333' }
      }
    },

    // 表格_单元格样式
    cellStyle({ column }) {
      if (column.property === 'zbgkglbm') {
        return { backgroundColor: '#fadca6', color: '#342410' };
      } else if (column.property === 'mbmc') {
        return { backgroundColor: '#faefd6', color: '#342410' };
      }
    },

    /*******************************************************绘制：echarts图表*******************************************************/

    /**
     * @description 根据获取的数据准备并设置柱状图和折线图的配置。
     * @param {Array<number>} chartActualData - "故障时间"系列的数据数组。
     * @param {number} chartTargetValue - "指标值"的单一数值。
     * @param {Array<number>} weekNumbers - 周数组，例如 [1, 2, ..., ]。
     * @param {string} currentMonth - 当前选中的月份字符串，用于图表标题。
     */
    initCharts(processedChartData, processedTargetValue, weekNumbers, currentMonth) {
      let _this = this;
      const initChart = (chartRef, options) => {
        if (!_this.$refs[chartRef]) return null;

        const chart = echarts.getInstanceByDom(_this.$refs[chartRef]);
        if (chart) {
          chart.dispose();
        }

        const newChart = echarts.init(_this.$refs[chartRef]);
        newChart.setOption(options);
        return newChart;
      };

      const processedTargetData = Array(weekNumbers.length).fill(processedTargetValue);
      const baseOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['故障时间', '指标值'],
          bottom: 10,
          left: 'center'
        },
        grid: {
          top: 30,
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: weekNumbers.map(w => `第${w}周`),
          axisLabel: {
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '时间'
        },
        title: {
          text: currentMonth + '设备事故管理目标监控',
          left: 'center',
          top: -5,
          textStyle: {
            fontSize: 16
          }
        }
      };

      // 柱状图配置
      const barOption = {
        ...baseOption,
        series: [
          {
            name: '故障时间',
            type: 'bar',
            barWidth: '40%',
            data: processedChartData,
            itemStyle: {
              color: '#EFAD19'
            },
            label: {
              show: true,
              position: 'top'
            }
          },
          {
            name: '指标值',
            type: 'line',
            symbol: 'circle',
            symbolSize: 8,
            data: processedTargetData,
            itemStyle: {
              color: '#FF0000'
            },
            lineStyle: {
              width: 2
            },
            label: {
              show: true,
              formatter: function (params) {
                // 只在最后一个点显示数值
                return params.dataIndex === processedTargetData.length - 1 ? params.value : '';
              },
              position: 'right',
              distance: 10,
              color: '#FF0000',
              fontSize: 12
            }
          }
        ]
      };

      // 折线图配置
      const lineOption = {
        ...baseOption,
        series: [
          {
            name: '故障时间',
            type: 'line',
            data: processedChartData,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#EFAD19'
            },
            lineStyle: {
              width: 2
            },
            label: {
              show: true,
              position: 'top'
            }
          },
          {
            name: '指标值',
            type: 'line',
            symbol: 'circle',
            symbolSize: 8,
            data: processedTargetData,
            itemStyle: {
              color: '#FF0000'
            },
            lineStyle: {
              width: 2
            },
            label: {
              show: true,
              formatter: function (params) {
                // 只在最后一个点显示数值
                return params.dataIndex === processedTargetData.length - 1 ? params.value : '';
              },
              position: 'right',
              distance: 10,
              color: '#FF0000',
              fontSize: 12
            }
          }
        ]
      };

      // 初始化图表
      _this.$nextTick(() => {
        _this.barChart = initChart('barChartRef', barOption);
        _this.lineChart = initChart('lineChartRef', lineOption);

        // 确保图表正确渲染
        setTimeout(() => {
          if (_this.barChart) _this.barChart.resize();
          if (_this.lineChart) _this.lineChart.resize();
        }, 1000);
      });
    },

    // 图表_监听窗口大小变化
    handleResize() {
      let _this = this;
      if (_this.barChart) {
        _this.barChart.resize();
      }
      if (_this.lineChart) {
        _this.lineChart.resize();
      }
      window.addEventListener('resize', _this.handleResize);
    },

    // 图表_销毁
    clearCharts() {
      let _this = this;
      if (_this.barChart) {
        _this.barChart.dispose();
        _this.barChart = null;
      }
      if (_this.lineChart) {
        _this.lineChart.dispose();
        _this.lineChart = null;
      }
      window.removeEventListener('resize', _this.handleResize);
    },
  },
};
