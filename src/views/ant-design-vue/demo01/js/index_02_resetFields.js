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
    this.list();
    this.list_tree();
    this.list_stopReasonType();
    this.initChart();
  },

  // 公共方法区：在模板中通过事件绑定调用，也可以在其他方法或生命周期钩子中调用
  methods: {
    /*******************************************************绘制：筛选框+表格*******************************************************/

    // 查询_表格
    async list() {
      let _this = this;
      // 处理中。。。
      _this.loading = true;
      let params = {
        plNos: Array.isArray(_this.searchForm.plNos) && _this.searchForm.plNos.length > 0 ? _this.searchForm.plNos[0] : 'A1',
        equipmentNo: _this.searchForm.equipmentNo,
        stopReasonName: Array.isArray(_this.searchForm.stopReasonName) ? _this.searchForm.stopReasonName.join(',') : '',
        startDate: _this.searchForm.vDay[0].format('YYYY-MM-DD'),
        endDate: _this.searchForm.vDay[1].format('YYYY-MM-DD')
      };
      console.log("输入参数：" + params)
      await axios({
        url: _this.wsUrl + '/cjsbgzms/list',
        method: 'POST',
        data: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }
      ).then(res => {
        if (res.data.success) {
          _this.dataList = res.data.result;
          _this.dataTotal = _this.dataList.length;
        }
        // 处理完成。
        _this.loading = false;
      });
    },

    // 查询_树形列表
    async list_tree() {
      let _this = this;
      // 处理中。。。
      _this.loading = true;
      await axios({
        url: _this.wsUrl + '/cjsbgzms/plNoTree',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }
      ).then(res => {
        if (res.data.success) {
          _this.treeData = res.data.result[0];
        }
        // 处理完成。
        _this.loading = false;
      });
    },

    // 查询_下拉框_商品售后模式
    async list_stopReasonType() {
      let _this = this;
      // 处理中。。。
      _this.loading = true;
      await axios({
        url: _this.wsUrl + '/cjsbgzms/stopReasonType',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }
      ).then(res => {
        if (res.data.success) {
          _this.attrCnts.faultModeOptions = res.data.result.map(item => {
            return { label: item.stopReasonType, value: item.stopReasonType };
          });
        }
        // 处理完成。
        _this.loading = false;
      });
    },

    // 按钮_查询
    async fun_search(searchFormRef) {
      let _this = this;
      if (!searchFormRef) {
        return
      }
      try {
        await searchFormRef.validateFields();
        _this.list();
      } catch (error) {
        message.warning('请检查相关参数！');
      }
    },

    // 按钮_重置
    fun_reset(searchFormRef) {
      if (!searchFormRef) {
        return
      }
      searchFormRef.resetFields();
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
          text: '旋转设备常见的故障模式分布图',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['故障模式分布'],
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
            '异常振动', '机械摩损', '异常声响', '零部件损伤', '移动位移', '油质劣化',
            '轴承滑油', '跑管渗漏', '材质劣化', '异常温度', '机械倾斜', '绝缘老化',
          ],
          axisLabel: { interval: 0, rotate: 45 },
        },
        yAxis: { type: 'value', name: '%' },
        series: [
          {
            name: '故障模式分布',
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