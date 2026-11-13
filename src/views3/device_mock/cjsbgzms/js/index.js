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
    const loading = ref(false)
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
      //     {required: true, message: '请输入商品编号', trigger: 'blur'},
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

      // 商品编号模糊查询
      equipmentNoTableVisible: false, // 商品编号表格是否显示
      equipmentNoTableData: [],       // 商品编号表格数据
      equipmentNoTablePage: 1,        // 当前页码
      equipmentNoTablePageSize: 5,    // 每页条数

      // mock数据
      listData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": {
          "dataList": [
            {
              "bkReasonName": "商品规格与描述不符",
              "totalBreakTimeRate": "24.99%",
              "totalBreakTime": 2545
            },
            {
              "bkReasonName": "其他",
              "totalBreakTimeRate": "17.68%",
              "totalBreakTime": 1801
            },
            {
              "bkReasonName": "商品质量问题",
              "totalBreakTimeRate": "13.23%",
              "totalBreakTime": 1347
            },
            {
              "bkReasonName": "商品数量不足",
              "totalBreakTimeRate": "10.88%",
              "totalBreakTime": 1108
            },
            {
              "bkReasonName": "商品外观破损",
              "totalBreakTimeRate": "4.58%",
              "totalBreakTime": 466
            },
            {
              "bkReasonName": "商品包装破损",
              "totalBreakTimeRate": "3.37%",
              "totalBreakTime": 343
            },
            {
              "bkReasonName": "商品尺寸不合适",
              "totalBreakTimeRate": "2.97%",
              "totalBreakTime": 303
            },
            {
              "bkReasonName": "商品价格变动",
              "totalBreakTimeRate": "2.48%",
              "totalBreakTime": 253
            },
            {
              "bkReasonName": "赠品漏发",
              "totalBreakTimeRate": "1.85%",
              "totalBreakTime": 188
            },
            {
              "bkReasonName": "商品异响",
              "totalBreakTimeRate": "1.78%",
              "totalBreakTime": 181
            },
            {
              "bkReasonName": "商品型号不匹配",
              "totalBreakTimeRate": "1.76%",
              "totalBreakTime": 179
            },
            {
              "bkReasonName": "不再需要",
              "totalBreakTimeRate": "1.58%",
              "totalBreakTime": 161
            },
            {
              "bkReasonName": "物流配送延误",
              "totalBreakTimeRate": "1.51%",
              "totalBreakTime": 154
            },
            {
              "bkReasonName": "错发商品",
              "totalBreakTimeRate": "1.50%",
              "totalBreakTime": 153
            },
            {
              "bkReasonName": "商品颜色与描述不符",
              "totalBreakTimeRate": "1.42%",
              "totalBreakTime": 145
            },
            {
              "bkReasonName": "签收后发现缺件",
              "totalBreakTimeRate": "1.37%",
              "totalBreakTime": 140
            },
            {
              "bkReasonName": "商品保质期不足",
              "totalBreakTimeRate": "1.35%",
              "totalBreakTime": 137
            },
            {
              "bkReasonName": "订单地址填写错误",
              "totalBreakTimeRate": "1.33%",
              "totalBreakTime": 135
            },
            {
              "bkReasonName": "商品临期",
              "totalBreakTimeRate": "1.16%",
              "totalBreakTime": 118
            },
            {
              "bkReasonName": "商品配件缺失",
              "totalBreakTimeRate": "0.98%",
              "totalBreakTime": 100
            },
            {
              "bkReasonName": "商品性能不符",
              "totalBreakTimeRate": "0.73%",
              "totalBreakTime": 74
            },
            {
              "bkReasonName": "重复购买",
              "totalBreakTimeRate": "0.59%",
              "totalBreakTime": 60
            },
            {
              "bkReasonName": "冷链温控异常",
              "totalBreakTimeRate": "0.49%",
              "totalBreakTime": 50
            },
            {
              "bkReasonName": "组合商品缺货",
              "totalBreakTimeRate": "0.28%",
              "totalBreakTime": 29
            },
            {
              "bkReasonName": "商品功能与介绍不符",
              "totalBreakTimeRate": "0.15%",
              "totalBreakTime": 15
            }
          ],
          "analyse": "商品分类：默认全部商品分类\n商品编号：\n商品售后模式：\n日期范围：20250101-20250525\n占比总和超80%：商品规格与描述不符（24.99%）、其他（17.68%）、商品质量问题（13.23%）、商品数量不足（10.88%）、商品外观破损（4.58%）、商品包装破损（3.37%）、商品尺寸不合适（2.97%）、商品价格变动（2.48%）\n近三个月呈上升趋势：其他"
        },
        "timestamp": 1748141560694
      },
      plNoTreeData: {
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
            "stopReasonType": "商品描述问题"
          },
          {
            "stopReasonType": "售后处理原因"
          },
          {
            "stopReasonType": "订单管理问题"
          },
          {
            "stopReasonType": "订单操作问题"
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
    // 1.查询
    this.query();
    // 2.查询树形列表
    this.queryTree();
    // 3.查询退货原因列表
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
      const sortedData = _this.listData.result.dataList.sort((a, b) => {
        const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
        const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
        return valueB - valueA;
      });
      _this.dataList = sortedData;
      _this.analyse = _this.listData.result.analyse;
      _this.initChart();
    },

    // 查询_树形列表
    async queryTree() {
      let _this = this;
      _this.treeData = _this.plNoTreeData.result;
      // 递归处理函数，为所有节点添加 key 和 isLeaf
      const processNode = (node) => {
        node.key = node.plno;
        node.isLeaf = !node.children || node.children.length === 0;
        if (node.children && node.children.length > 0) {
          node.children.forEach(processNode);
        }
      };
      const rootObject = _this.plNoTreeData.result[0];
      if (rootObject && rootObject.children) {
        rootObject.children.forEach(processNode);
        _this.treeData = rootObject.children;
        // 保存原始treeData副本
        _this.originalTreeData = JSON.parse(JSON.stringify(_this.treeData));
      } else {
        _this.treeData = [];
        _this.originalTreeData = [];
      }
    },

    // 查询_下拉框_商品售后模式
    async queryStopReasonType() {
      let _this = this;
      _this.attrCnts.stopReasonNameOptions = _this.stopReasonData.result.map(item => {
        return { label: item.stopReasonType, value: item.stopReasonType };
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
          // 重置时隐藏商品编号模糊查询表格
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
      // 重置时隐藏商品编号模糊查询表格
      this.equipmentNoTableVisible = false;
      this.equipmentNoTableData = [];
      this.equipmentNoTablePage = 1;
    },

    /*******************************************************调用：商品编号输入*******************************************************/

    // 商品编号输入监听
    onEquipmentNoInput(val) {
      let _this = this;
      // 限制长度
      if (val.length > 12) {
        _this.searchForm.equipmentNo = val.slice(0, 12);
        return;
      }
      // 自动商品分类匹配
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
      // 自动商品编号模糊查询
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
    // 商品编号模糊查询
    async queryEquipmentNoList(val) {
      let _this = this;
      _this.equipmentNoTableData = _this.equipmentNoTableData.filter(item => item.EQUIPMENTNO.includes(val));
      _this.equipmentNoTableVisible = _this.equipmentNoTableData.length > 0;
      _this.equipmentNoTablePage = 1;
    },
    // 单击表格行填充商品编号
    onEquipmentNoRowClick(row) {
      let _this = this;
      _this.searchForm.equipmentNo = row.EQUIPMENTNO;
      _this.searchForm.equipmentName = row.EQUIPMENTNAME;
      _this.equipmentNoTableVisible = false;
      // 自动商品分类匹配
      if (row.EQUIPMENTNO && row.EQUIPMENTNO.length >= 4) {
        const plNo = row.EQUIPMENTNO.slice(0, 4);
        _this.searchForm.plNoKey = [plNo];
      }
    },
    // 商品分类输入框focus时重置treeData为原始数据
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
          name: '退货原因分布',
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
