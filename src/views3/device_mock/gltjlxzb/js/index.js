import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'gltjlxzb',
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
        reasonNamesOptions: [],
      },
      // 筛选-表单
      searchForm: {
        plNames: [],
        reasonNames: [],
        vYear: dayjs().year().toString()
      },

      // 订单暂停次数
      countList: [],
      countBarChart: null,

      // 订单暂停时长
      timeList: [],
      timeBarChart: null,

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
              "Type": "商品质量",
              "YearlyTotal": 16,
              "Proportion": "39.02%"
            },
            {
              "Type": "操作延误",
              "YearlyTotal": 13,
              "Proportion": "31.71%"
            },
            {
              "Type": "支付异常",
              "YearlyTotal": 5,
              "Proportion": "12.20%"
            },
            {
              "Type": "商品破损",
              "YearlyTotal": 3,
              "Proportion": "7.32%"
            },
            {
              "Type": "物流延误",
              "YearlyTotal": 2,
              "Proportion": "4.88%"
            },
            {
              "Type": "工艺质量",
              "YearlyTotal": 1,
              "Proportion": "2.44%"
            },
            {
              "Type": "订单异常",
              "YearlyTotal": 1,
              "Proportion": "2.44%"
            }
          ],
          "timeList": [
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 919,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "物流延误",
              "October": 0,
              "December": 0,
              "Proportion": "32.87%",
              "July": 0,
              "January": 919,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 642,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "商品质量",
              "October": 0,
              "December": 0,
              "Proportion": "22.96%",
              "July": 0,
              "January": 642,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 585,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "操作延误",
              "October": 0,
              "December": 0,
              "Proportion": "20.92%",
              "July": 0,
              "January": 585,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 355,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "支付异常",
              "October": 0,
              "December": 0,
              "Proportion": "12.70%",
              "July": 0,
              "January": 355,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 207,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "商品破损",
              "October": 0,
              "December": 0,
              "Proportion": "7.40%",
              "July": 0,
              "January": 207,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 48,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "工艺质量",
              "October": 0,
              "December": 0,
              "Proportion": "1.72%",
              "July": 0,
              "January": 48,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 40,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "订单异常",
              "October": 0,
              "December": 0,
              "Proportion": "1.43%",
              "July": 0,
              "January": 40,
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
              "YearlyTotal": 16,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "商品质量",
              "October": 0,
              "December": 0,
              "Proportion": "39.02%",
              "July": 0,
              "January": 16,
              "February": 0,
              "November": 0
            },
            {
              "June": 0,
              "May": 0,
              "September": 0,
              "YearlyTotal": 13,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "操作延误",
              "October": 0,
              "December": 0,
              "Proportion": "31.71%",
              "July": 0,
              "January": 13,
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
              "Type": "支付异常",
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
              "Type": "商品破损",
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
              "Type": "物流延误",
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
              "Type": "工艺质量",
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
              "YearlyTotal": 1,
              "March": 0,
              "April": 0,
              "August": 0,
              "Type": "订单异常",
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
              "Type": "物流延误",
              "YearlyTotal": 919,
              "Proportion": "32.87%"
            },
            {
              "Type": "商品质量",
              "YearlyTotal": 642,
              "Proportion": "22.96%"
            },
            {
              "Type": "操作延误",
              "YearlyTotal": 585,
              "Proportion": "20.92%"
            },
            {
              "Type": "支付异常",
              "YearlyTotal": 355,
              "Proportion": "12.70%"
            },
            {
              "Type": "商品破损",
              "YearlyTotal": 207,
              "Proportion": "7.40%"
            },
            {
              "Type": "工艺质量",
              "YearlyTotal": 48,
              "Proportion": "1.72%"
            },
            {
              "Type": "订单异常",
              "YearlyTotal": 40,
              "Proportion": "1.43%"
            }
          ],
          "analyse": "年份：2025年\n店铺：默认全店铺\n退货原因：\n该店铺本年度共计订单暂停类型：7种\n次数占比前三的类型分别是：商品质量（16次）、操作延误（13次）、支付异常（5次）\n订单暂停时长前三的类型分别是：物流延误（919分钟）、商品质量（642分钟）、操作延误（585分钟）"
        },
        "timestamp": 1748142060899
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
      reasonNameTypeData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "reasonNameType": "运输影响"
          },
          {
            "reasonNameType": "预约订单暂停"
          },
          {
            "reasonNameType": "异常订单暂停"
          },
          {
            "reasonNameType": "物流延误"
          },
          {
            "reasonNameType": "物流延误"
          },
          {
            "reasonNameType": "订单异常"
          },
          {
            "reasonNameType": "库存异常"
          },
          {
            "reasonNameType": "商品破损"
          },
          {
            "reasonNameType": "操作延误"
          },
          {
            "reasonNameType": "工艺质量"
          },
          {
            "reasonNameType": "工艺计划"
          },
          {
            "reasonNameType": "商品订单地址填写错误"
          },
          {
            "reasonNameType": "外部影响"
          },
          {
            "reasonNameType": "商品质量"
          },
          {
            "reasonNameType": "价格异常"
          },
          {
            "reasonNameType": "支付异常"
          }
        ],
        "timestamp": 1748142172399
      }
    };
  },
  mounted() {
    // 1.查询
    this.query();
    // 2.查询店铺列表
    this.queryPlNoList();
    // 3.查询退货原因列表
    this.queryReasonNameList();
    // 4.监听窗口大小变化
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
      // 1. 订单暂停次数表格
      _this.countList = _this.listData.result.countList;
      // 2. 订单暂停时长表格
      _this.timeList = _this.listData.result.timeList;
      // 3. 分析功能
      _this.analyse = _this.listData.result.analyse;
      // 4. 初始化图表
      _this.initCharts(_this.listData.result.countImgList, _this.listData.result.timeImgList);
    },

    // 查询_店铺列表
    async queryPlNoList() {
      let _this = this;
      _this.attrCnts.plNamesOptions = _this.plNoListData.result.map(item => ({
        value: item.plname,
        label: item.plname
      }));
    },

    // 查询_退货原因列表
    async queryReasonNameList() {
      let _this = this;
      _this.attrCnts.reasonNamesOptions = _this.reasonNameTypeData.result.map(item => ({
        value: item.reasonNameType,
        label: item.reasonNameType
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
     * @param {Array} countData - 订单暂停次数数据
     * @param {Array} timeData - 订单暂停时长数据
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

      // 订单暂停次数图表配置
      const countOption = {
        ...baseOption,
        series: [{
          name: '订单暂停次数占比',
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

      // 订单暂停时长图表配置
      const timeOption = {
        ...baseOption,
        series: [{
          name: '订单暂停时长占比',
          type: 'pie',
          radius: '70%',
          center: ['40%', '50%'],
          data: timeData.map(d => ({
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

      // 初始化图表
      _this.$nextTick(() => {
        _this.countBarChart = initChart('countBarChart', countOption);
        _this.timeBarChart = initChart('timeBarChart', timeOption);

        // 确保图表正确渲染
        setTimeout(() => {
          if (_this.countBarChart) _this.countBarChart.resize();
          if (_this.timeBarChart) _this.timeBarChart.resize();
        }, 1000);
      });
    },

    // 图表_监听窗口大小变化
    handleResize() {
      let _this = this;
      if (_this.countBarChart) {
        _this.countBarChart.resize();
      }
      if (_this.timeBarChart) {
        _this.timeBarChart.resize();
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
      if (_this.timeBarChart) {
        _this.timeBarChart.dispose();
        _this.timeBarChart = null;
      }
      window.removeEventListener('resize', _this.handleResize);
    },
  },
};
