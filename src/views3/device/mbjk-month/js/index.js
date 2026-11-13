import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'mbjk-month',
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
      vYear: [
        { type: 'string', required: true, message: '请选择年份', trigger: 'change' }
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
        plNamesOptions: [],
      },
      // 筛选-表单
      searchForm: {
        plNoKey: [],
        vYear: dayjs().year().toString()
      },

      // 筛选-表格
      dataList: [],

      // 图表
      barChart: null,
      lineChart: null,

      // 分析功能文本
      analyse: ''
    };
  },
  mounted() {
    // 1.查询
    this.query();
    // 2.查询厂处列表
    this.queryPlNoList();
    // 3.监听窗口大小变化
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
      _this.loading = true;
      const params = {
        plNames: _this.searchForm.plNoKey.join(',') || null,
        year: _this.searchForm.vYear
      };
      await axios({
        url: _this.wsUrl + '/mbjk/month/list',
        method: 'POST',
        data: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }).then(res => {
        if (res.data.success) {
          // 1.表格数据
          _this.dataList = res.data.result.dataList;

          // 2.分析功能
          _this.analyse = res.data.result.analyse;

          // 3.绘制图表
          const processedTargetData = res.data.result.jxzList
            ? res.data.result.jxzList.split(',').map(v => parseFloat(v) || 0)
            : Array(12).fill(0);
          const processedChartData = res.data.result.chartList
            ? res.data.result.chartList.split(',').map(v => Number(v) || 0)
            : Array(12).fill(0);
          const yearMonths = Array(12).fill(0).map((_, i) => i + 1);
          const currentYear = _this.searchForm.vYear;
          _this.initCharts(processedChartData, processedTargetData, yearMonths, currentYear);
        } else {
          ElMessage.error(res.data.message || '获取月数据失败');
        }
        _this.loading = false;
      });
    },

    // 查询_厂处列表
    async queryPlNoList() {
      const _this = this;
      _this.loading = true;
      await axios({
        url: _this.wsUrl + '/public/plNoList',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }).then(res => {
        if (res.data.success) {
          _this.attrCnts.plNamesOptions = res.data.result.map(item => ({
            value: item.plname,
            label: item.plname
          }));
        } else {
          ElMessage.error(res.data.message || '获取厂处列表失败');
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
      if (column.property === 'plName') {
        return { backgroundColor: '#fadca6', color: '#342410' };
      } else if (column.property === 'mbmc') {
        return { backgroundColor: '#faefd6', color: '#342410' };
      }
    },

    /*******************************************************绘制：echarts图表*******************************************************/

    /**
     * @description 根据获取的数据准备并设置柱状图和折线图的配置。
     * @param {Array<number>} chartActualData - "故障时间"系列的数据数组。
     * @param {Array<number>} chartTargetData - "指标值"系列的数据数组。
     * @param {Array<number>} yearMonths - 月份数组，例如 [1, 2, ..., 12]。
     * @param {string} currentYear - 当前选中的年份字符串，用于图表标题。
     */
    initCharts(chartActualData, chartTargetData, yearMonths, currentYear) {
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

      const baseOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        title: {
          text: currentYear + '年设备事故管理目标监控',
          left: 'center',
          top: -4,
          textStyle: {
            fontSize: 16
          }
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
          data: yearMonths.map(m => `${m}月`),
          axisLabel: {
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '时间'
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
            data: chartActualData,
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
            data: chartTargetData,
            itemStyle: {
              color: '#FF0000'
            },
            lineStyle: {
              width: 2
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}'
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
            data: chartActualData,
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
            data: chartTargetData,
            itemStyle: {
              color: '#FF0000'
            },
            lineStyle: {
              width: 2
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}'
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
