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
    // 3.原始节点数据
    const treeProps = {
      label: 'plname',
      children: 'children',
    }
    const treeData = ref([])
    const originalTreeData = ref([])

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
      originalTreeData,

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
        stopReasonNameOptions: [],
      },
      // 筛选-表单
      searchForm: {
        plNoKey: [],
        equipmentNo: '',
        equipmentName: '',
        stopReasonName: [],
        vDay: [
          dayjs().startOf('year').format('YYYY-MM-DD'),
          dayjs().format('YYYY-MM-DD')
        ],
      },
      // 筛选-表格
      dataList: [],
      // 筛选-表格-弹框表单
      dataForm: {},
      // 分析功能文本
      analyse: '',

      // 设备号模糊查询
      equipmentNoTableVisible: false, // 设备号表格是否显示
      equipmentNoTableData: [],       // 设备号表格数据
      equipmentNoTablePage: 1,        // 当前页码
      equipmentNoTablePageSize: 5,    // 每页条数
    };
  },
  mounted() {
    // 1.查询
    this.query();
    // 2.查询树形列表
    this.queryTree();
    // 3.查询故障模式列表
    this.queryStopReasonType();
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
      _this.loading = true;
      // 取plNoKey
      const plNoKeyArr = Array.isArray(_this.searchForm.plNoKey) ? _this.searchForm.plNoKey : [];
      // 递归查找plname
      const plNameArr = _this.findPlNamesByPlNos(plNoKeyArr, _this.treeData);
      // 如果设备号有值且设备号表格只查到1条，自动赋值商品名称
      if (_this.searchForm.equipmentNo && _this.equipmentNoTableData.length === 1) {
        const onlyRow = _this.equipmentNoTableData[0];
        if (onlyRow.EQUIPMENTNO === _this.searchForm.equipmentNo) {
          _this.searchForm.equipmentName = onlyRow.EQUIPMENTNAME;
        }
      }
      let params = {
        plNos: plNoKeyArr.length > 0 ? plNoKeyArr.join(',') : null,
        plNames: plNameArr.length > 0 ? plNameArr.join(',') : null,
        equipmentNo: _this.searchForm.equipmentNo || null,
        equipmentName: _this.searchForm.equipmentName || null,
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
          const sortedData = res.data.result.dataList.sort((a, b) => {
            const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
            const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
            return valueB - valueA;
          });
          _this.dataList = sortedData;
          _this.analyse = res.data.result.analyse;
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
            node.key = node.plno;
            node.isLeaf = !node.children || node.children.length === 0;
            if (node.children && node.children.length > 0) {
              node.children.forEach(processNode);
            }
          };
          const rootObject = res.data.result[0];
          if (rootObject && rootObject.children) {
            rootObject.children.forEach(processNode);
            _this.treeData = rootObject.children;
            // 保存原始treeData副本
            _this.originalTreeData = JSON.parse(JSON.stringify(_this.treeData));
          } else {
            _this.treeData = [];
            _this.originalTreeData = [];
          }
        } else {
          ElMessage.error(res.data.message || '获取树形列表失败');
          _this.treeData = [];
          _this.originalTreeData = [];
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
          _this.attrCnts.stopReasonNameOptions = res.data.result.map(item => {
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
          // 重置时隐藏设备号模糊查询表格
          this.equipmentNoTableVisible = false;
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
      // 重置时隐藏设备号模糊查询表格
      this.equipmentNoTableVisible = false;
      this.equipmentNoTableData = [];
      this.equipmentNoTablePage = 1;
    },

    /*******************************************************调用：设备号输入*******************************************************/

    // 设备号输入监听
    onEquipmentNoInput(val) {
      let _this = this;
      // 限制长度
      if (val.length > 12) {
        _this.searchForm.equipmentNo = val.slice(0, 12);
        return;
      }
      // 自动产线匹配
      if (val.length >= 2) {
        const plNo = val.slice(0, 4);
        const found = _this.findPlNamesByPlNos([plNo], _this.treeData);
        if (found.length > 0) {
          _this.searchForm.plNoKey = [plNo];
        } else {
          // 检查treeData中是否已存在该节点
          if (!_this.treeData.some(node => node.plno === plNo)) {
            _this.treeData.push({
              plno: plNo,
              plname: plNo,
              key: plNo,
              isLeaf: true,
              children: []
            });
          }
          _this.searchForm.plNoKey = [plNo];
        }
      } else {
        _this.searchForm.plNoKey = [];
      }
      // 自动设备号模糊查询
      if (val.length >= 4) {
        _this.queryEquipmentNoList(val);
        // 自动赋值商品名称
        const match = _this.equipmentNoTableData.find(item => item.EQUIPMENTNO === val);
        _this.searchForm.equipmentName = match ? match.EQUIPMENTNAME : '';
      } else {
        _this.equipmentNoTableVisible = false;
        _this.equipmentNoTableData = [];
        _this.searchForm.equipmentName = '';
      }
    },
    // 设备号模糊查询
    async queryEquipmentNoList(val) {
      let _this = this;
      _this.loading = true;
      await axios({
        url: this.wsUrl + '/public/equipmentNo',
        method: 'POST',
        data: JSON.stringify({ equipmentNo: val }),
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      }).then(res => {
        if (res.data.success) {
          _this.equipmentNoTableData = res.data.result || [];
          _this.equipmentNoTableVisible = _this.equipmentNoTableData.length > 0;
          _this.equipmentNoTablePage = 1;
        } else {
          _this.equipmentNoTableVisible = false;
          _this.equipmentNoTableData = [];
        }
        _this.loading = false;
      });
    },
    // 单击表格行填充设备号
    onEquipmentNoRowClick(row) {
      let _this = this;
      _this.searchForm.equipmentNo = row.EQUIPMENTNO;
      _this.searchForm.equipmentName = row.EQUIPMENTNAME;
      _this.equipmentNoTableVisible = false;
      // 自动产线匹配
      if (row.EQUIPMENTNO && row.EQUIPMENTNO.length >= 4) {
        const plNo = row.EQUIPMENTNO.slice(0, 4);
        _this.searchForm.plNoKey = [plNo];
      }
    },
    // 产线输入框focus时重置treeData为原始数据
    onPlNoTreeFocus() {
      let _this = this;
      if (_this.originalTreeData && _this.originalTreeData.length > 0) {
        _this.treeData = JSON.parse(JSON.stringify(_this.originalTreeData));
      }
    },
    // 递归查找所有plno对应的plname
    findPlNamesByPlNos(plNos, treeNodes) {
      let result = [];
      if (!Array.isArray(treeNodes)) return result;
      for (const node of treeNodes) {
        if (plNos.includes(node.plno)) {
          result.push(node.plname);
        }
        if (node.children && node.children.length > 0) {
          result = result.concat(this.findPlNamesByPlNos(plNos, node.children));
        }
      }
      return result;
    },

    /*******************************************************绘制：echarts图表*******************************************************/

    // 初始化图表
    initChart() {
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

      // 从 dataList 提取图表所需数据
      const categories = this.dataList.map(item => item.bkReasonName);
      const rates = this.dataList.map(item => parseFloat(String(item.totalBreakTimeRate).replace('%', '')) || 0);

      // ECharts 默认颜色列表
      const defaultColors = [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ffc933',
        '#a5d6a7', '#81d4fa', '#ce93d8', '#ef9a9a', '#fff59d'
      ];

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: '{b}: {c}%'
        },
        grid: {
          top: '5%',
          left: '25%',
          right: '15%',
          bottom: '5%',
          containLabel: false
        },
        xAxis: {
          type: 'value',
          name: '占比 (%)',
          nameLocation: 'center',
          nameGap: 25,
          nameTextStyle: {
            padding: [0, 0, 5, 0]
          },
          axisLabel: {
            formatter: '{value}%'
          },
          position: 'top'
        },
        yAxis: {
          type: 'category',
          data: categories,
          axisTick: {
            alignWithLabel: true
          },
          inverse: true,
          axisLabel: {
            interval: 0,
            fontSize: 12,
          }
        },
        series: [{
          name: '故障模式分布',
          type: 'bar',
          data: rates,
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: '#333',
            fontSize: 10
          },
          itemStyle: {
            color: function (params) {
              return defaultColors[params.dataIndex % defaultColors.length];
            }
          }
        }]
      };

      // 初始化图表
      _this.$nextTick(() => {
        _this._chartInstance = initChart('chartRef', option);

        // 确保图表正确渲染
        setTimeout(() => {
          if (_this._chartInstance) _this._chartInstance.resize();
        }, 1000);
      });
    },

    // 图表_监听窗口大小变化
    handleResize() {
      let _this = this;
      if (_this._chartInstance) {
        _this._chartInstance.resize();
      }
      window.addEventListener('resize', _this.handleResize);
    },

    // 图表_销毁
    clearCharts() {
      let _this = this;
      if (_this._chartInstance) {
        _this._chartInstance.dispose();
        _this._chartInstance = null;
      }
      window.removeEventListener('resize', _this.handleResize);
    },
  },
};
