import { reactive, ref, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';
import axios from 'axios';
// zh-cn
import zhCN from 'ant-design-vue/es/locale/zh_CN';
// dayjs
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

export default {
  // 组件名称
  name: 'demo01',

  // 全局注册数据：组合式API函数
  setup() {
    // 加载状态
    const loading = ref(true);
    const dataFormLoading = ref(false);

    // 筛选-树
    // 1.节点属性 (Antd Tree 使用 title, key, children)
    // 2.节点数据
    // 3.展开/选中键
    // 4.加载状态 (现在是同步加载，但保留以防未来改动)
    const treeProps = {
      title: 'plname', // 映射到 Antd TreeSelect 的 'title' (显示文本)
      value: 'plno',   // 映射到 Antd TreeSelect 的 'value' (唯一标识符)
      children: 'children', // 映射到 Antd TreeSelect 的 'children'
    }
    const treeData = ref([])
    const expandedKeys = ref([])
    const selectedKeys = ref([])
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
      return Promise.resolve();
    };

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
      //   { required: true, message: '请输入设备号', trigger: 'blur' },
      // ],
    })

    // 筛选-表格
    const dataTableRef = ref('');
    const selectionRows = [];
    const currentRow = {};

    // 筛选-表格-分页
    const dataTableHeight = ref(window.innerHeight - 176);
    const pageSizes = ref([15, 25, 35, 50, 100]);
    const pageSize = ref(15);
    const currentPage = ref(1);
    const dataTotal = ref(0);

    // 筛选-表格-弹框表单
    const dataFormRef = ref('');
    const dataFormTitle = ref('详情');
    const dataFormVisible = ref(false);
    const dataFormStatus = ref('');

    return {
      loading,
      dataFormLoading,

      // 筛选-树
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
          // dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
          // dayjs().format('YYYY-MM-DD')
          dayjs('2000-01-01'),
          dayjs('2026-01-01')
        ],
      },
      // 筛选-表格
      dataList: [],
      dateLength: [],

      // 筛选-表格-弹框表单
      dataForm: {},

      // 分析功能文本
      analysisText: '演示订单售后记录001',

      // 模拟数据
      listDataJson: {
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
      stopReasonDataJson: {
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
      },
      tableColumns: [
        {
          title: '故障模式',
          dataIndex: 'bkReasonName',
          key: 'bkReasonName',
          ellipsis: true,
          width: '70%',
        },
        {
          title: '停机时间',
          dataIndex: 'totalBreakTime',
          key: 'totalBreakTime',
          align: 'right',
          width: '30%',
        },
      ],
    };
  },

  // 初始化加载
  mounted() {
    this.query();
    this.queryTree();
    this.queryStopReasonType();
  },

  methods: {
    // 加载列表数据 (从硬编码 JSON)
    query() {
      let _this = this;
      _this.loading = true;
      if (_this.listDataJson.success) {
        // 排序逻辑保持不变
        const sortedData = _this.listDataJson.result.sort((a, b) => {
          const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
          const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
          return valueB - valueA;
        });
        _this.dataList = sortedData;
        _this.initChart();
      } else {
        message.error(_this.listDataJson.message || '获取列表数据失败 (来自 JSON)');
      }
      _this.loading = false;
    },

    // 加载树形数据 (从硬编码 JSON)
    queryTree() {
      let _this = this;
      _this.loading = true;
      if (_this.treeDataJson.success) {
        // 节点处理逻辑保持不变
        const processNode = (node) => {
          node.title = node.plname;
          node.key = node.plno;
          if (node.children && node.children.length > 0) {
            node.children.forEach(processNode);
          } else {
            node.children = undefined;
          }
        };
        const rootObject = _this.treeDataJson.result[0];
        if (rootObject && rootObject.children) {
          rootObject.children.forEach(processNode);
          _this.treeData = rootObject.children;
          // 设置初始展开项
          if (_this.treeData.length > 0 && _this.treeData[0].key) {
            _this.expandedKeys = [_this.treeData[0].key];
          }
        } else {
          _this.treeData = [];
        }
      } else {
        message.error(_this.treeDataJson.message || '获取树形列表失败 (来自 JSON)');
        _this.treeData = [];
      }
      _this.loading = false;
    },

    // 加载故障模式下拉选项 (从硬编码 JSON)
    queryStopReasonType() {
      let _this = this;
      _this.loading = true;
      if (_this.stopReasonDataJson.success) {
        // 映射逻辑保持不变
        _this.attrCnts.faultModeOptions = _this.stopReasonDataJson.result.map(item => ({
          label: item.stopReasonType,
          value: item.stopReasonType
        }));
      } else {
        message.error(_this.stopReasonDataJson.message || '获取故障模式失败 (来自 JSON)');
        _this.attrCnts.faultModeOptions = [];
      }
      _this.loading = false;
    },

    // 按钮_查询
    async fun_search() {
      if (!this.searchFormRef) return;
      this.loading = true;
      try {
        await this.searchFormRef.validateFields();
        // 目前仅重新加载数据和图表，无实际过滤
        this.query();
        message.success('查询完成');
      } catch (errorInfo) {
        // console.log('表单验证失败:', errorInfo); // 移除日志
        message.warning('请检查表单输入项！');
      } finally {
        this.loading = false;
      }
    },

    // 按钮_重置
    fun_reset() {
      if (!this.searchFormRef) return;
      this.loading = true;
      try {
        this.searchFormRef.resetFields();
        // 重置后重新加载数据和图表
        this.query();
        message.success('重置完成');
      } catch (error) {
        console.error("重置操作失败:", error);
        message.error('重置操作失败');
      } finally {
        this.loading = false;
      }
    },

    /*******************************************************绘制：echarts图表*******************************************************/

    setupEcharts(chartDom) {
      // 销毁旧实例
      // 销毁旧实例（如果存在）
      if (this._chartInstance) {
        this._chartInstance.dispose();
        window.removeEventListener('resize', this._chartResizeHandler);
      }

      const myChart = echarts.init(chartDom);
      // const myChart = echarts.init(chartDom); // 移除重复声明
      // 提取图表数据
      const categories = this.dataList.map(item => item.bkReasonName);
      const rates = this.dataList.map(item => parseFloat(String(item.totalBreakTimeRate).replace('%', '')) || 0);
      // 默认颜色
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
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['故障模式分布'],
          type: 'scroll',
          tooltip: { show: true },
          show: false // 添加此行来隐藏图例
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
          nameTextStyle: { padding: [0, 0, 5, 0] },
          axisLabel: { formatter: '{value}%' },
          position: 'top'
        },
        yAxis: {
          type: 'category',
          data: categories,
          axisTick: { alignWithLabel: true },
          inverse: true,
          axisLabel: { interval: 0, fontSize: 12 }
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
      myChart.setOption(option);

      this._chartInstance = myChart;
      this._chartResizeHandler = () => { myChart.resize(); };
      window.addEventListener('resize', this._chartResizeHandler);
    },

    // 初始化图表
    initChart() {
      const chartRef = this.$refs.chartRef;
      if (!chartRef) {
        // 延迟到 DOM 更新后尝试获取引用
        nextTick(() => {
          if (this.$refs.chartRef) {
            this.setupEcharts(this.$refs.chartRef);
          } else {
            console.warn("图表引用在 nextTick 后仍然不可用");
          }
        });
        return;
      }
      this.setupEcharts(chartRef);
    },

    // TreeSelect 选择事件 (目前仅打印日志和提示)
    onSelect(selectedKeysValue, info) {
      this.selectedKeys = selectedKeysValue;
      // 简单提示，无实际数据过滤
      message.info(`已选择节点: ${info.node.title}`);
      // 选择节点后可以考虑是否需要刷新图表，目前不刷新
      this.initChart();
    },
  },

  // 组件卸载前清理
  beforeUnmount() {
    // 在组件销毁前移除事件监听器，防止内存泄漏
    if (this._chartResizeHandler) {
      window.removeEventListener('resize', this._chartResizeHandler);
    }
  }
};
