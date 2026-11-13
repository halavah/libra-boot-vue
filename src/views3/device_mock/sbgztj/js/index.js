import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'sbgztj',
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
        plNames: [],
        vYear: dayjs().year().toString()
      },

      // 停机次数
      countList: [],
      countBarChart: null,

      // 停机时间
      timeList: [],
      timeLineChart: null,

      // 分析功能
      analyse: '暂无分析',

      // mock数据
      listData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": {
          "countImgList": [
            {
              "Type": "图书旗舰店",
              "YearlyTotal": 11,
              "Proportion": "26.83%"
            },
            {
              "Type": "服饰旗舰店",
              "YearlyTotal": 7,
              "Proportion": "17.07%"
            },
            {
              "Type": "自营店铺",
              "YearlyTotal": 6,
              "Proportion": "14.63%"
            },
            {
              "Type": "商品运营中心",
              "YearlyTotal": 6,
              "Proportion": "14.63%"
            },
            {
              "Type": "母婴旗舰店",
              "YearlyTotal": 5,
              "Proportion": "12.20%"
            },
            {
              "Type": "运动旗舰店",
              "YearlyTotal": 3,
              "Proportion": "7.32%"
            },
            {
              "Type": "食品旗舰店",
              "YearlyTotal": 2,
              "Proportion": "4.88%"
            },
            {
              "Type": "数码旗舰店",
              "YearlyTotal": 1,
              "Proportion": "2.44%"
            }
          ],
          "timeList": [
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 807,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "商品运营中心",
              "October": 0,
              "December": 0,
              "Proportion": "28.86%",
              "July": 0,
              "January": 807,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 552,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "图书旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "19.74%",
              "July": 0,
              "January": 552,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 346,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "自营店铺",
              "October": 0,
              "December": 0,
              "Proportion": "12.37%",
              "July": 0,
              "January": 346,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 327,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "数码旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "11.70%",
              "July": 0,
              "January": 327,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 301,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "服饰旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "10.77%",
              "July": 0,
              "January": 301,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 276,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "母婴旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "9.87%",
              "July": 0,
              "January": 276,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 117,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "运动旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "4.18%",
              "July": 0,
              "January": 117,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 70,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "食品旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "2.50%",
              "July": 0,
              "January": 70,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 2796,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "小计",
              "October": 0,
              "December": 0,
              "Proportion": "/",
              "July": 0,
              "January": 2796,
              "February": 0,
              "November": 0
            }
          ],
          "countList": [
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 11,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "图书旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "26.83%",
              "July": 0,
              "January": 11,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 7,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "服饰旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "17.07%",
              "July": 0,
              "January": 7,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 6,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "自营店铺",
              "October": 0,
              "December": 0,
              "Proportion": "14.63%",
              "July": 0,
              "January": 6,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 6,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "商品运营中心",
              "October": 0,
              "December": 0,
              "Proportion": "14.63%",
              "July": 0,
              "January": 6,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 5,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "母婴旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "12.20%",
              "July": 0,
              "January": 5,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 3,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "运动旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "7.32%",
              "July": 0,
              "January": 3,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 2,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "食品旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "4.88%",
              "July": 0,
              "January": 2,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 1,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "数码旗舰店",
              "October": 0,
              "December": 0,
              "Proportion": "2.44%",
              "July": 0,
              "January": 1,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 41,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "小计",
              "October": 0,
              "December": 0,
              "Proportion": "/",
              "July": 0,
              "January": 41,
              "February": 0,
              "November": 0
            }
          ],
          "timeImgList": [
            {
              "Type": "商品运营中心",
              "YearlyTotal": 807,
              "Proportion": "28.86%"
            },
            {
              "Type": "图书旗舰店",
              "YearlyTotal": 552,
              "Proportion": "19.74%"
            },
            {
              "Type": "自营店铺",
              "YearlyTotal": 346,
              "Proportion": "12.37%"
            },
            {
              "Type": "数码旗舰店",
              "YearlyTotal": 327,
              "Proportion": "11.70%"
            },
            {
              "Type": "服饰旗舰店",
              "YearlyTotal": 301,
              "Proportion": "10.77%"
            },
            {
              "Type": "母婴旗舰店",
              "YearlyTotal": 276,
              "Proportion": "9.87%"
            },
            {
              "Type": "运动旗舰店",
              "YearlyTotal": 117,
              "Proportion": "4.18%"
            },
            {
              "Type": "食品旗舰店",
              "YearlyTotal": 70,
              "Proportion": "2.50%"
            }
          ],
          "analyse": "年份：2025年\n厂处：默认全厂处\n次数占比前三的类型分别是：图书旗舰店（11次）、服饰旗舰店（7次）、自营店铺（6次）\n次数占比近三个月呈上涨趋势：\n订单暂停时长前三的类型分别是：商品运营中心（807分钟）、图书旗舰店（552分钟）、自营店铺（346分钟）\n订单暂停时长近三个月呈上涨趋势：\n"
        },
        "timestamp": 1748142534583
      },
      plNoListData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "plname": "客户服务中心",
            "plno": "W5"
          },
          {
            "plname": "图书旗舰店",
            "plno": "Y8"
          },
          {
            "plname": "电商物流中心",
            "plno": "W1"
          },
          {
            "plname": "母婴旗舰店",
            "plno": "Y4"
          },
          {
            "plname": "美妆旗舰店",
            "plno": "W9"
          },
          {
            "plname": "数码旗舰店",
            "plno": "W4"
          },
          {
            "plname": "家居旗舰店",
            "plno": "W8"
          },
          {
            "plname": "自营店铺",
            "plno": "W3"
          },
          {
            "plname": "商品运营中心",
            "plno": "W2"
          },
          {
            "plname": "食品旗舰店",
            "plno": "Y5"
          },
          {
            "plname": "户外旗舰店",
            "plno": "WA"
          },
          {
            "plname": "服饰旗舰店",
            "plno": "Y2"
          },
          {
            "plname": "运动旗舰店",
            "plno": "Y3"
          }
        ],
        "timestamp": 1748142141090
      },
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
      let _this = this;
      // 1. 停机次数表格
      _this.countList = _this.listData.result.countList;
      // 2. 停机时间表格
      _this.timeList = _this.listData.result.timeList;
      // 3. 分析功能
      _this.analyse = _this.listData.result.analyse;
      // 4. 初始化图表
      _this.initCharts(_this.listData.result.countImgList, _this.listData.result.timeImgList);
    },

    // 查询_厂处列表
    async queryPlNoList() {
      let _this = this;
      _this.attrCnts.plNamesOptions = _this.plNoListData.result.map(item => ({
        value: item.plname,
        label: item.plname
      }));
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
    // 暂无

    // 表格_单元格样式
    // 暂无

    /*******************************************************绘制：echarts图表*******************************************************/

    /**
     * @description 初始化所有图表
     * @param {Array} countData - 停机次数数据
     * @param {Array} timeData - 停机时间数据
     */
    initCharts(countData, timeData) {
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
          trigger: 'item',
          formatter: function (params) {
            return `${params.name}<br/>年累计：${params.data.yearTotal}<br/>占比：${params.value}%`;
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        grid: {
          top: 30,
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        }
      };

      // 停机次数图表配置
      const countOption = {
        ...baseOption,
        series: [{
          name: '停机次数占比',
          type: 'pie',
          radius: '70%',
          center: ['40%', '50%'],
          data: countData.map(d => ({
            name: d.Type,
            value: parseFloat(d.Proportion.replace('%', '')) || 0,
            yearTotal: d.YearlyTotal
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}: {d}%'
          }
        }]
      };

      // 停机时间图表配置
      const timeOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            return `${params[0].name}<br/>${params[0].value} 分钟`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: timeData.map(d => d.Type),
          axisLabel: {
            interval: 0,
            rotate: 30 // 标签旋转30度，防止文字重叠
          }
        },
        yAxis: {
          type: 'value',
          name: '分钟'
        },
        series: [{
          type: 'bar',
          barWidth: '40%',
          data: timeData.map(d => ({
            value: d.YearlyTotal,
            itemStyle: {
              color: '#5470c6' // 设置柱状图颜色
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
        }]
      };

      // 初始化图表
      _this.$nextTick(() => {
        _this.countBarChart = initChart('countBarChart', countOption);
        _this.timeLineChart = initChart('timeLineChart', timeOption);

        // 确保图表正确渲染
        setTimeout(() => {
          if (_this.countBarChart) _this.countBarChart.resize();
          if (_this.timeLineChart) _this.timeLineChart.resize();
        }, 1000);
      });
    },

    // 图表_监听窗口大小变化
    handleResize() {
      let _this = this;
      if (_this.countBarChart) {
        _this.countBarChart.resize();
      }
      if (_this.timeLineChart) {
        _this.timeLineChart.resize();
      }
      window.addEventListener('resize', _this.handleResize);
    },

    // 图表_销毁
    clearCharts() {
      let _this = this;
      if (_this.countBarChart) {
        _this.countBarChart.dispose();
        _this.countBarChart = null;
      }
      if (_this.timeLineChart) {
        _this.timeLineChart.dispose();
        _this.timeLineChart = null;
      }
      window.removeEventListener('resize', _this.handleResize);
    },
  },
};
