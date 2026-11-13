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
    const treeData = []
    const expandedKeys = ['A1']
    const selectedKeys = ['A1']
    const treeLoading = false

    // 筛选-表单
    // 1.ref
    // 2.规则
    const searchFormRef = ref('')
    const rules = reactive({
      rq: [
        { required: true, message: '请选择时间', trigger: 'change' },
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
        plNos: ['A1'],
        equipmentNo: '',
        stopReasonName: [],
        vDay: [
          dayjs().subtract(3, 'month'),
          dayjs()
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
    this.initData();
  },

  // 公共方法区：在模板中通过事件绑定调用，也可以在其他方法或生命周期钩子中调用
  methods: {
    // 统一的请求错误处理
    handleRequestError(error, customMessage) {
      console.error(customMessage || '请求失败', error);
      message.error(customMessage || '请求失败，请稍后重试');
    },

    // 初始化数据
    async initData() {
      this.loading = true;
      try {
        // 使用 Promise.allSettled 替代 Promise.all，这样单个请求失败不会影响其他请求
        const results = await Promise.allSettled([
          this.list(),
          this.list_tree(),
          this.list_stopReasonType()
        ]);

        // 检查每个请求的状态
        results.forEach((result, index) => {
          if (result.success === false) {
            const apis = ['列表数据', '树形数据', '退货原因数据'];
            this.handleRequestError(result.reason, `${apis[index]}加载失败`);
          }
        });

        // 无论部分请求是否失败，都初始化图表
        this.initChart();
      } catch (error) {
        this.handleRequestError(error, '初始化数据失败');
      } finally {
        this.loading = false;
      }
    },

    // 统一的 axios 请求方法
    async request(config) {
      try {
        const response = await axios({
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          ...config
        });
        if (response.data.success) {
          return response.data;
        }
        throw new Error(response.data.message || '请求失败');
      } catch (error) {
        this.handleRequestError(error);
        throw error;
      }
    },

    /*******************************************************绘制：筛选框+表格*******************************************************/

    // 表格
    async list() {
      const params = {
        plNos: Array.isArray(this.searchForm.plNos) && this.searchForm.plNos.length > 0
          ? this.searchForm.plNos[0]
          : 'A1',
        equipmentNo: this.searchForm.equipmentNo,
        stopReasonName: Array.isArray(this.searchForm.stopReasonName)
          ? this.searchForm.stopReasonName.join(',')
          : '',
        startDate: this.searchForm.vDay[0].format('YYYY-MM-DD'),
        endDate: this.searchForm.vDay[1].format('YYYY-MM-DD')
      };

      try {
        const { result } = await this.request({
          url: this.wsUrl + '/cjsbgzms/list',
          method: 'POST',
          data: JSON.stringify(params)
        });
        this.dataList = result;
        this.dataTotal = this.dataList.length;
      } catch (error) {
        this.dataList = [];
        this.dataTotal = 0;
      }
    },

    // 树形列表
    async list_tree() {
      try {
        const { result } = await this.request({
          url: this.wsUrl + '/cjsbgzms/plNoTree',
          method: 'GET'
        });
        this.treeData = result[0];
      } catch (error) {
        this.treeData = [];
      }
    },

    // 下拉框_商品售后模式
    async list_stopReasonType() {
      try {
        const { result } = await this.request({
          url: this.wsUrl + '/cjsbgzms/stopReasonType',
          method: 'GET'
        });
        this.attrCnts.faultModeOptions = result.map(item => ({
          label: item.stopReasonType,
          value: item.stopReasonType
        }));
      } catch (error) {
        this.attrCnts.faultModeOptions = [];
      }
    },

    // 查询
    async fun_search(formRef) {
      let _this = this;
      if (!formRef) {
        return
      }
      try {
        await formRef.validateFields();
        _this.list();
      } catch (error) {
        message.warning('请检查相关参数！');
      }
    },

    // 重置
    fun_reset(formRef) {
      if (!formRef) {
        return
      }
      // 重置表单字段
      formRef.resetFields();
      // 手动重置 searchForm 到初始状态
      this.searchForm = {
        plNos: ['A1'],
        equipmentNo: '',
        stopReasonName: [],
        vDay: [
          dayjs().subtract(3, 'month'),
          dayjs()
        ],
      };
      // 重置后重新查询
      this.list();
    },

    /*******************************************************绘制：树形列表*******************************************************/

    // 加载树节点数据
    async loadTreeData(treeNode) {
      let _this = this;
      // 处理中。。。
      _this.treeLoading = true;

      // 这里可以根据 treeNode 的 key 或其他属性来加载子节点
      // 示例：假设我们有一个 API 可以根据父节点 ID 加载子节点
      try {
        const response = await axios({
          url: _this.wsUrl + '/cjsbgzms/plNoTreeChildren',
          method: 'GET',
          params: {
            parentId: treeNode.key
          },
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          }
        });

        if (response.data.success) {
          // 将加载的子节点添加到当前节点
          treeNode.children = response.data.result;
          // 更新树数据
          _this.treeData = [..._this.treeData];
        }
      } catch (error) {
        console.error('加载树节点数据失败', error);
        message.error('加载树节点数据失败');
      } finally {
        // 处理完成。
        _this.treeLoading = false;
      }
    },

    /*******************************************************绘制：echarts图表*******************************************************/

    initChart() {
      // 使用 this.$refs 访问模板引用
      if (!this.$refs.chartRef) {
        return;
      }
      const myChart = echarts.init(this.$refs.chartRef);
      const option = {
        title: {
          text: '商品退货原因分布图',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['退货原因分布'],
        },
        grid: {
          left: '3%',
          right: '15%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [
            '商品价格变动', '商品磨损', '商品异响', '商品配件破损', '商品规格不符', '商品临期',
            '配件漏发', '包装漏液', '商品材质不符', '冷链温控异常', '商品运输变形', '商品性能不符',
          ],
          axisLabel: { interval: 0, rotate: 45 },
        },
        yAxis: { type: 'value', name: '%' },
        series: [
          {
            name: '退货原因分布',
            type: 'bar',
            data: [30.4, 19.3, 11.4, 7.6, 7.6, 4.2, 3.8, 3.4, 2.9, 2.1, 2.1, 0.9],
            itemStyle: { color: '#1890ff' },
          },
        ],
      };
      myChart.setOption(option);
      // 注意：在 Options API 中，最好在 beforeUnmount 中移除事件监听器
      this._chartResizeHandler = () => {
        myChart.resize();
      };
      window.addEventListener('resize', this._chartResizeHandler);
    },

    onSelect(selectedKeys, info) {
      console.log('selected', selectedKeys, info);
      this.selectedKeys = selectedKeys; // 更新 data 中的状态
      // 这里可以根据选择的节点更新图表数据
      this.initChart(); // 示例：选择后重新初始化图表
    },

    // 处理日期范围变化
    handleDateChange(dates) {
      if (dates) {
        this.searchForm.vDay = [
          dayjs(dates[0]),
          dayjs(dates[1])
        ];
      } else {
        this.searchForm.vDay = [
          dayjs().subtract(3, 'month'),
          dayjs()
        ];
      }
      // 触发查询
      this.list();
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