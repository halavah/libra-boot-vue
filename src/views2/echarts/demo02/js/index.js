const { createApp, reactive, ref, nextTick } = Vue;
const { ElMessage, ElMessageBox } = ElementPlus;

const App = {
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
      analysisText: '演示订单售后记录001',

      // 表格列定义
      tableColumns: [
        { prop: 'bkReasonName', label: '故障模式', showOverflowTooltip: true, minWidth: 150 },
        { prop: 'totalBreakTime', label: '停机时间', width: 100, align: 'right' }
      ],

      // 模拟数据
      listData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "bkReasonName": "其他",
            "totalBreakTimeRate": "27.66%",
            "totalBreakTime": 3596
          },
          {
            "bkReasonName": "设计机构，构造有问题",
            "totalBreakTimeRate": "19.58%",
            "totalBreakTime": 2545
          },
          {
            "bkReasonName": "点检方法，判定基准有问题",
            "totalBreakTimeRate": "8.54%",
            "totalBreakTime": 1110
          },
          {
            "bkReasonName": "修理，维护方法有问题",
            "totalBreakTimeRate": "7.38%",
            "totalBreakTime": 960
          },
          {
            "bkReasonName": "自然劣化(预测困难)",
            "totalBreakTimeRate": "7.04%",
            "totalBreakTime": 915
          },
          {
            "bkReasonName": "材质缺陷(质量，热处理，表面处理)",
            "totalBreakTimeRate": "7.02%",
            "totalBreakTime": 913
          },
          {
            "bkReasonName": "点检周期有问题",
            "totalBreakTimeRate": "3.50%",
            "totalBreakTime": 455
          },
          {
            "bkReasonName": "修理维护周期不适当",
            "totalBreakTimeRate": "3.18%",
            "totalBreakTime": 413
          },
          {
            "bkReasonName": "机种，型式选定有问题",
            "totalBreakTimeRate": "2.64%",
            "totalBreakTime": 343
          },
          {
            "bkReasonName": "运转操作技能，知识不足",
            "totalBreakTimeRate": "1.84%",
            "totalBreakTime": 239
          },
          {
            "bkReasonName": "异物侵入",
            "totalBreakTimeRate": "1.48%",
            "totalBreakTime": 193
          },
          {
            "bkReasonName": "尺寸，强度，容量有问题",
            "totalBreakTimeRate": "1.24%",
            "totalBreakTime": 161
          },
          {
            "bkReasonName": "组装，配合施工技术差",
            "totalBreakTimeRate": "1.18%",
            "totalBreakTime": 154
          },
          {
            "bkReasonName": "松动松弛",
            "totalBreakTimeRate": "1.08%",
            "totalBreakTime": 140
          },
          {
            "bkReasonName": "组装，配合方法上有问题",
            "totalBreakTimeRate": "1.05%",
            "totalBreakTime": 137
          },
          {
            "bkReasonName": "疲劳损伤",
            "totalBreakTimeRate": "0.96%",
            "totalBreakTime": 125
          },
          {
            "bkReasonName": "油质劣化",
            "totalBreakTimeRate": "0.91%",
            "totalBreakTime": 118
          },
          {
            "bkReasonName": "异常振动",
            "totalBreakTimeRate": "0.74%",
            "totalBreakTime": 96
          },
          {
            "bkReasonName": "配合加工有问题",
            "totalBreakTimeRate": "0.69%",
            "totalBreakTime": 90
          },
          {
            "bkReasonName": "异物混入",
            "totalBreakTimeRate": "0.68%",
            "totalBreakTime": 88
          },
          {
            "bkReasonName": "规格不符",
            "totalBreakTimeRate": "0.46%",
            "totalBreakTime": 60
          },
          {
            "bkReasonName": "异常温度",
            "totalBreakTimeRate": "0.38%",
            "totalBreakTime": 50
          },
          {
            "bkReasonName": "安装，拆卸方法上有问题",
            "totalBreakTimeRate": "0.23%",
            "totalBreakTime": 30
          },
          {
            "bkReasonName": "机械剥离",
            "totalBreakTimeRate": "0.22%",
            "totalBreakTime": 29
          },
          {
            "bkReasonName": "误运转操作",
            "totalBreakTimeRate": "0.19%",
            "totalBreakTime": 25
          },
          {
            "bkReasonName": "温度(在计划设计时不能预测)",
            "totalBreakTimeRate": "0.12%",
            "totalBreakTime": 15
          }
        ],
        "timestamp": 1745118762285
      },
      treeDataJson: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "parent_plno": null,
            "plname": "根节点",
            "children": [
              {
                "parent_plno": "A1",
                "plname": "电商物流中心",
                "children": [
                  {
                    "parent_plno": "W1",
                    "plname": "电商物流中心-商品分组01",
                    "plno": "W101"
                  }
                ],
                "plno": "W1"
              },
              {
                "parent_plno": "A1",
                "plname": "商品运营中心",
                "children": [
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组01",
                    "plno": "W201"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组02",
                    "plno": "W202"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组03",
                    "plno": "W203"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组04",
                    "plno": "W204"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组05",
                    "plno": "W205"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组06",
                    "plno": "W206"
                  }
                ],
                "plno": "W2"
              },
              {
                "parent_plno": "A1",
                "plname": "自营店铺",
                "children": [
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组01",
                    "plno": "W301"
                  },
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组02",
                    "plno": "W302"
                  },
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组03",
                    "plno": "W303"
                  },
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组04",
                    "plno": "W304"
                  },
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组05",
                    "plno": "W305"
                  }
                ],
                "plno": "W3"
              },
              {
                "parent_plno": "A1",
                "plname": "数码旗舰店",
                "children": [
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组01",
                    "plno": "W401"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组02",
                    "plno": "W402"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组03",
                    "plno": "W403"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组04",
                    "plno": "W404"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组05",
                    "plno": "W405"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组06",
                    "plno": "W406"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组07",
                    "plno": "W407"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组08",
                    "plno": "W408"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组09",
                    "plno": "W409"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组10",
                    "plno": "W410"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组11",
                    "plno": "W411"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组12",
                    "plno": "W412"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组13",
                    "plno": "W413"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组14",
                    "plno": "W414"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组15",
                    "plno": "W415"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组16",
                    "plno": "W416"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组17",
                    "plno": "W417"
                  }
                ],
                "plno": "W4"
              },
              {
                "parent_plno": "A1",
                "plname": "客户服务中心",
                "children": [
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组01",
                    "plno": "W503"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组02",
                    "plno": "W504"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组03",
                    "plno": "W505"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组04",
                    "plno": "W506"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组05",
                    "plno": "W507"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组06",
                    "plno": "W508"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组07",
                    "plno": "W509"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组08",
                    "plno": "W510"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组09",
                    "plno": "W511"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组10",
                    "plno": "W512"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组11",
                    "plno": "W513"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组12",
                    "plno": "W514"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组13",
                    "plno": "W515"
                  }
                ],
                "plno": "W5"
              },
              {
                "parent_plno": "A1",
                "plname": "家居旗舰店",
                "children": [
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组01",
                    "plno": "W801"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组02",
                    "plno": "W802"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组03",
                    "plno": "W803"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组04",
                    "plno": "W804"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组05",
                    "plno": "W805"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组06",
                    "plno": "W806"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组07",
                    "plno": "W807"
                  }
                ],
                "plno": "W8"
              },
              {
                "parent_plno": "A1",
                "plname": "美妆旗舰店",
                "children": [
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组01",
                    "plno": "W901"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组02",
                    "plno": "W902"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组03",
                    "plno": "W903"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组04",
                    "plno": "W904"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组05",
                    "plno": "W905"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组06",
                    "plno": "W906"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组07",
                    "plno": "W907"
                  }
                ],
                "plno": "W9"
              },
              {
                "parent_plno": "A1",
                "plname": "户外旗舰店",
                "children": [
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组01",
                    "plno": "WA01"
                  },
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组02",
                    "plno": "WA02"
                  },
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组03",
                    "plno": "WA03"
                  },
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组04",
                    "plno": "WA04"
                  },
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组05",
                    "plno": "WA05"
                  }
                ],
                "plno": "WA"
              },
              {
                "parent_plno": "A1",
                "plname": "服饰旗舰店",
                "children": [
                  {
                    "parent_plno": "Y2",
                    "plname": "服饰旗舰店-商品分组01",
                    "plno": "Y201"
                  },
                  {
                    "parent_plno": "Y2",
                    "plname": "服饰旗舰店-商品分组02",
                    "plno": "Y202"
                  },
                  {
                    "parent_plno": "Y2",
                    "plname": "服饰旗舰店-商品分组03",
                    "plno": "Y203"
                  }
                ],
                "plno": "Y2"
              },
              {
                "parent_plno": "A1",
                "plname": "运动旗舰店",
                "children": [
                  {
                    "parent_plno": "Y3",
                    "plname": "运动旗舰店-商品分组01",
                    "plno": "Y301"
                  },
                  {
                    "parent_plno": "Y3",
                    "plname": "运动旗舰店-商品分组02",
                    "plno": "Y302"
                  },
                  {
                    "parent_plno": "Y3",
                    "plname": "运动旗舰店-商品分组03",
                    "plno": "Y303"
                  }
                ],
                "plno": "Y3"
              },
              {
                "parent_plno": "A1",
                "plname": "母婴旗舰店",
                "children": null,
                "plno": "Y4"
              },
              {
                "parent_plno": "A1",
                "plname": "食品旗舰店",
                "children": null,
                "plno": "Y5"
              },
              {
                "parent_plno": "A1",
                "plname": "图书旗舰店",
                "children": [
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组01",
                    "plno": "Y801"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组02",
                    "plno": "Y802"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组03",
                    "plno": "Y803"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组04",
                    "plno": "Y804"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组05",
                    "plno": "Y805"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组06",
                    "plno": "Y806"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组07",
                    "plno": "Y807"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组08",
                    "plno": "Y808"
                  }
                ],
                "plno": "Y8"
              }
            ],
            "plno": "A1"
          }
        ],
        "timestamp": 1745118762288
      },
      stopReasonData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "stopReasonType": "质量原因"
          },
          {
            "stopReasonType": "设计原因"
          },
          {
            "stopReasonType": "维修原因"
          },
          {
            "stopReasonType": "管理原因"
          },
          {
            "stopReasonType": "操作原因"
          },
          {
            "stopReasonType": "其他原因"
          }
        ],
        "timestamp": 1745118762197
      }
    };
  },
  mounted() {
    this.query();
    this.queryTree();
    this.queryStopReasonType();
  },
  methods: {
    // 查询_表格 (使用硬编码数据)
    query() { // 移除 async
      let _this = this;
      _this.loading = true;
      // 模拟异步操作，例如过滤数据（如果需要的话），这里直接使用硬编码数据
      // 注意：实际应用中，如果需要根据 searchForm 过滤导入的 JSON 数据，需要在此处添加过滤逻辑

      // 使用导入的 JSON 数据
      if (_this.listData.success) {
        // 对导入数据进行排序
        const sortedData = _this.listData.result.sort((a, b) => {
          const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
          const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
          return valueB - valueA;
        });
        _this.dataList = sortedData; // 更新 dataList
        _this.initChart(); // 初始化图表
      } else {
        ElMessage.error(listData.message || '获取列表数据失败 (来自 JSON)');
      }
      _this.loading = false; // 结束加载状态
    },

    // 查询_树形列表 (使用硬编码数据)
    queryTree() { // 移除 async
      let _this = this;
      _this.loading = true;

      // 使用导入的 JSON 数据
      if (_this.treeDataJson.success) {
        // 递归处理函数，为所有节点添加 key 和 isLeaf (与原逻辑相同)
        const processNode = (node) => {
          node.key = node.plno;
          node.isLeaf = !node.children || node.children.length === 0;
          if (node.children && node.children.length > 0) {
            node.children.forEach(processNode);
          }
        };
        // 导入的 JSON 数据包含一个根对象
        const rootObject = _this.treeDataJson.result[0];
        if (rootObject && rootObject.children) {
          rootObject.children.forEach(processNode);
          // 注意：这里直接使用了 setup 中定义的 treeData ref
          // 在 Options API 的 methods 中访问 setup ref 需要通过 this.$refs 或其他方式
          // 但由于 treeData 是在 setup 中定义的 ref，可以直接在 setup 作用域内访问
          // 为了在 methods 中更新 setup 中的 ref，我们直接修改 this.treeData (Vue 3 会处理)
          _this.treeData = rootObject.children;
        } else {
          _this.treeData = [];
        }
      } else {
        ElMessage.error(_this.treeDataJson.message || '获取树形列表失败 (来自 JSON)');
        _this.treeData = [];
      }
      _this.loading = false; // 结束加载状态
    },

    // 查询_下拉框_商品售后模式 (使用硬编码数据)
    queryStopReasonType() { // 移除 async
      let _this = this;
      _this.loading = true;

      // 使用导入的 JSON 数据
      if (_this.stopReasonData.success) {
        // 直接映射导入数据到下拉框选项格式
        _this.attrCnts.faultModeOptions = _this.stopReasonData.result.map(item => {
          return { label: item.stopReasonType, value: item.stopReasonType };
        });
      } else {
        ElMessage.error(_this.stopReasonData.message || '获取下拉框_故障模式失败 (来自 JSON)');
        _this.attrCnts.faultModeOptions = []; // 清空选项以防万一
      }
      _this.loading = false; // 结束加载状态
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
          data: ['故障模式分布'], // <-- Set legend data to match the series name
          type: 'scroll',     // 如果图例项过多，允许滚动
          tooltip: {          // 为图例添加提示框
            show: true
          },
          show: false, // 添加此行以隐藏图例
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
      this._chartResizeHandler = () => {
        myChart.resize();
      };
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

createApp(App).use(ElementPlus, { locale: ElementPlusLocaleZhCn }).mount("#app");
