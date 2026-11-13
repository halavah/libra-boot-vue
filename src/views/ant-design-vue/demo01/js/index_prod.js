import { createApp, reactive, ref } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import axios from 'axios';
import { message } from 'ant-design-vue';
// 导入 Ant Design Vue 的中文语言包
import zhCN from 'ant-design-vue/es/locale/zh_CN';
// 导入 dayjs 的中文语言包
import 'dayjs/locale/zh-cn';
// 设置 dayjs 的默认语言为中文
dayjs.locale('zh-cn');

export default {
  // 组件名称
  name: 'demo2',

  // 全局注册数据：组合式API函数
  setup() {
    // 加载
    // 1.主页面
    // 2.弹框表单
    const loading = ref(true)
    const dataFormLoading = ref(false)

    // 筛选-树
    // 1.节点
    // 2.节点属性
    // 3.节点数据
    // 4.控制哪些节点在初始渲染时是展开的
    // 5.控制哪些节点在初始渲染时是选中的
    // 6.用于控制树组件的加载状态，确保在数据加载过程中用户看到的是加载中的提示，而不是空白或不完整的数据
    const treeRef = ref('')
    const treeProps = {
      label: 'name',
      children: 'children',
    }
    const treeData = ref([])
    const expandedKeys = ref(['A1'])
    const selectedKeys = ref(['A1'])
    const treeLoading = ref(false)

    // --- 自定义校验器 ---
    const validateDateRange = async (_rule, value) => {
      // 检查值是否存在、是否为数组、长度是否为2，以及两个元素是否都有效
      if (!value || !Array.isArray(value) || value.length < 2 || !value[0] || !value[1]) {
        return Promise.reject('请选择有效的开始及结束时间');
      }
      // 可选：检查结束日期是否在开始日期之后
      if (dayjs(value[1]).isBefore(dayjs(value[0]))) {
        return Promise.reject('结束时间不能早于开始时间');
      } ``
      return Promise.resolve(); // 校验成功
    };
    // --- 校验器结束 ---

    // 筛选-表单
    // 1.ref
    // 2.规则
    const searchFormRef = ref('')
    const rules = reactive({
      vDay: [
        // 使用自定义校验器，它会处理必填和格式要求
        { validator: validateDateRange, trigger: 'change' }
      ],
      // equipmentNo: [
      //     {required: true, message: '请输入设备号', trigger: 'blur'},
      // ],
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
      treeRef,
      treeProps,
      treeData,
      expandedKeys,
      selectedKeys,
      treeLoading,

      // 筛选-表单
      rules,
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

      // 额外引入
      dayjs,
      // 添加语言配置
      locale: zhCN,
    };
  },

  // 自定义注册数据：用于存储和管理组件的状态
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
        plNos: [],
        equipmentNo: '',
        stopReasonName: [],
        vDay: [
          // dayjs().subtract(3, 'month').format('YYYY-MM-DD'), // 保留注释作为参考
          // dayjs().format('YYYY-MM-DD') // 保留注释作为参考
          dayjs('2000-01-01'), // 使用 dayjs() 包装字符串
          dayjs('2026-01-01')  // 使用 dayjs() 包装字符串
        ],
      },
      // 筛选-表格
      dataList: [],
      dateLength: [],

      // 筛选-表格-弹框表单
      dataForm: {},
    };
  },

  // 初始化加载：如初始化接口、第三方库、定时器
  mounted() {
    this.loadInitialData();
    this.initChart();
  },

  // 公共方法区：在模板中通过事件绑定调用，也可以在其他方法或生命周期钩子中调用
  methods: {
    /*******************************************************绘制：筛选框+表格*******************************************************/

    // 查询_统一加载初始数据
    async loadInitialData() {
      this.loading = true; // 开始加载
      try {
        // 并行执行三个异步请求
        // Promise.all 会在第一个 reject 时停止，这里捕获那个错误
        await Promise.all([
          this.list(),
          this.list_tree(),
          this.list_stopReasonType()
        ]);
      } catch (error) {
        console.error("初始化数据加载失败:", error);
        message.error('初始化数据加载失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    // 查询_表格
    async list() {
      let _this = this;
      // 假设校验已通过，直接构造参数
      let params = {
        plNos: Array.isArray(_this.searchForm.plNos) && _this.searchForm.plNos.length > 0 ? _this.searchForm.plNos.join(',') : null,
        equipmentNo: _this.searchForm.equipmentNo || null,
        stopReasonNames: Array.isArray(_this.searchForm.stopReasonName) && _this.searchForm.stopReasonName.length > 0 ? _this.searchForm.stopReasonName.join(',') : null,
        startDate: _this.searchForm.vDay[0].format('YYYY-MM-DD'),
        endDate: _this.searchForm.vDay[1].format('YYYY-MM-DD')
      };
      try {
        const res = await axios({
          url: this.wsUrl + '/cjsbgzms/list',
          method: 'POST',
          data: params,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        });
        if (res.data.success) {
          this.dataList = res.data.result;
          this.dataTotal = this.dataList.length;
        } else {
          message.error(res.data.message || '获取列表数据失败');
        }
      } catch (error) {
        console.error("获取列表数据失败:", error);
        message.error('获取列表数据失败');
        throw error;
      }
    },

    // 查询_树形列表
    async list_tree() {
      try {
        const res = await axios({
          url: this.wsUrl + '/public/plNoTree',
          method: 'GET',
          headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        });
        if (res.data.success) {
          this.treeData.value = res.data.result;
        } else {
          message.error(res.data.message || '获取树形列表失败');
        }
      } catch (error) {
        console.error("获取树形列表失败:", error);
        message.error('获取树形列表失败');
        throw error;
      }
    },

    // 查询_下拉框_商品售后模式
    async list_stopReasonType() {
      try {
        const res = await axios({
          url: this.wsUrl + '/public/stopReasonType',
          method: 'GET',
          headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        });
        if (res.data.success) {
          this.attrCnts.faultModeOptions = res.data.result.map(item => ({
            label: item.stopReasonType,
            value: item.stopReasonType
          }));
        } else {
          message.error(res.data.message || '获取故障模式失败');
        }
      } catch (error) {
        console.error("获取故障模式失败:", error);
        message.error('获取故障模式失败');
        throw error;
      }
    },

    // 按钮_查询
    async fun_search() {
      if (!this.searchFormRef) {
        console.warn("Search form ref not available");
        return;
      }
      this.loading = true;
      try {
        await this.searchFormRef.validateFields();
        await this.list();
      } catch (error) {
        if (error && error.errorFields) {
          message.warning('请检查表单输入项！');
        } else {
          console.error("查询操作失败:", error);
          message.error('查询失败，请稍后重试');
        }
      } finally {
        this.loading = false;
      }
    },

    // 按钮_重置
    async fun_reset() {
      if (!this.searchFormRef) {
        console.warn("Search form ref not available");
        return;
      }
      this.loading = true;
      try {
        this.searchFormRef.resetFields();
        await this.list();
      } catch (error) {
        console.error("重置并查询失败:", error);
        message.error('重置操作失败');
      } finally {
        this.loading = false;
      }
    },

    /*******************************************************绘制：树形列表*******************************************************/

    // 加载树节点数据 (Ant Design Vue a-tree load-data 需要返回 Promise)
    async loadTreeData(treeNode) {
      this.treeLoading.value = true; // 控制加载状态
      try {
        const response = await axios({
          url: this.wsUrl + '/cjsbgzms/plNoTreeChildren',
          method: 'GET',
          params: { parentId: treeNode.key }
        });

        if (response.data.success && response.data.result) {
          // 直接修改 treeNode 的 children，Vue 会响应
          treeNode.children = response.data.result;
          return Promise.resolve(); // 告知 a-tree 加载成功
        } else {
          message.error(response.data.message || '加载子节点失败');
          return Promise.reject(new Error(response.data.message || '加载子节点失败')); // 告知 a-tree 加载失败
        }
      } catch (error) {
        console.error('加载树节点数据失败:', error);
        message.error('加载树节点数据失败');
        return Promise.reject(error); // 告知 a-tree 加载失败
      } finally {
        this.treeLoading.value = false; // 结束加载状态
      }
    },

    /*******************************************************绘制：echarts图表*******************************************************/
    // 辅助函数，用于设置 ECharts
    setupEcharts(chartDom) {
      // 销毁旧实例（如果存在）
      if (this._chartInstance) {
        this._chartInstance.dispose();
        window.removeEventListener('resize', this._chartResizeHandler);
      }

      const myChart = echarts.init(chartDom);
      // TODO: 根据实际需要，option 的数据源应该动态获取，而不是写死
      // 应该基于 this.dataList 或其他相关数据生成 option
      const option = {
        title: { text: '旋转设备常见的故障模式分布图' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { orient: 'vertical', right: 10, top: 'center', data: ['故障模式分布'] },
        grid: { left: '3%', right: '15%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['异常振动', '机械摩损', '异常声响', '零部件损伤', '移动位移', '油质劣化', '轴承滑油', '跑管渗漏', '材质劣化', '异常温度', '机械倾斜', '绝缘老化'], // 示例数据
          axisLabel: { interval: 0, rotate: 45 },
        },
        yAxis: { type: 'value', name: '%' },
        series: [{
          name: '故障模式分布', type: 'bar',
          data: [30.4, 19.3, 11.4, 7.6, 7.6, 4.2, 3.8, 3.4, 2.9, 2.1, 2.1, 0.9], // 示例数据
          itemStyle: { color: '#1890ff' },
        }],
      };
      myChart.setOption(option);

      this._chartInstance = myChart; // 保存图表实例
      this._chartResizeHandler = () => { myChart.resize(); };
      window.addEventListener('resize', this._chartResizeHandler);
    },

    initChart() {
      // 使用 this.$refs 访问模板引用
      const chartRef = this.$refs.chartRef;
      if (!chartRef) {
        // 如果 DOM 还未准备好，使用 nextTick
        this.$nextTick(() => {
          if (this.$refs.chartRef) {
            this.setupEcharts(this.$refs.chartRef);
          } else {
            console.warn("Chart ref still not available after nextTick");
          }
        });
        return;
      }
      this.setupEcharts(chartRef);
    },

    onSelect(selectedKeysValue, info) { // 参数名修改以反映其为值
      // console.log('selected', selectedKeysValue, info); // 移除或保留调试
      this.selectedKeys.value = selectedKeysValue; // 更新 ref 的 .value

      // 当选择树节点时，通常是更新查询参数并重新获取列表数据
      // 假设选择的 key 就是 plNos (如果允许多选，需要处理数组)
      this.searchForm.plNos = selectedKeysValue;
      this.fun_search(); // 使用查询按钮的逻辑，包含加载状态和错误处理

      // 可能也需要更新图表，取决于图表是否依赖于列表数据或选中的节点
      // 如果图表数据独立于列表，可以在 fun_search() 成功后更新图表
      // this.initChart(); // 可以在 fun_search 成功后调用，或者 list 成功后调用
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
