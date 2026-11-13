import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus';
// dayjs
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'
// 导入子组件
import ContentArea from '../components/ContentArea.vue'; // 导入内容区域子组件

dayjs.locale('zh-cn') // 设置 dayjs 本地化为中文

export default {
  name: 'demo02', // 组件名称 (应与文件夹名一致)
  components: { // 注册子组件
    ContentArea
  },
  setup() {
    // --- Setup 中定义的响应式变量 ---
    const loading = ref(true); // 控制页面加载状态的 V-Loading 指令

    // 商品分类树形选择器的配置项
    const treeProps = {
      label: 'plname', // 指定节点标签为节点对象的 'plname' 属性
      children: 'children', // 指定子树为节点对象的 'children' 属性
    };
    const treeData = ref([]); // 商品分类树形选择器的数据源

    // 筛选表单的引用和验证规则
    const searchFormRef = ref(''); // 筛选表单的模板引用 (用于访问表单实例)
    const searchFormRules = reactive({ // 筛选表单的验证规则
      // equipmentNo: [ // 商品编号验证规则 (示例，当前注释掉)
      //     {required: true, message: '请输入商品编号', trigger: 'blur'},
      // ],
      vDay: [ // 日期范围验证规则
        { type: 'array', required: true, message: '请选择日期范围', trigger: 'change' }
      ],
    });

    // 从 setup 返回响应式变量，使其在模板和 Options API 中可用
    return {
      loading,
      treeProps,
      treeData,
      searchFormRules,
      searchFormRef,
    };
  },
  data() {
    // --- Options API 中定义的响应式数据 ---
    return {
      // 通用属性或配置
      attrCnts: {
        faultModeOptions: [], // 商品售后模式下拉框的选项
      },
      // 筛选表单的数据模型
      searchForm: {
        plNoKey: [], // 商品分类选择 (el-tree-select 的 v-model)
        equipmentNo: '', // 商品编号输入 (el-input 的 v-model)
        stopReasonName: [], // 商品售后模式选择 (el-select 的 v-model)
        vDay: [ // 日期范围选择 (el-date-picker 的 v-model)
          // dayjs().subtract(3, 'month').format('YYYY-MM-DD'), // 示例：默认最近三个月
          // dayjs().format('YYYY-MM-DD')
          '2000-01-01', // 默认开始日期
          '2026-01-01'  // 默认结束日期
        ],
      },
      // 传递给子组件 ContentArea 的数据列表
      dataList: [],
      // 分析功能区域的文本模型
      analysisText: '演示订单售后记录001',

      // --- 模拟数据 (实际应用中应通过 API 获取) ---
      listData: { // 模拟退货原因列表接口返回数据
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
            "bkReasonName": "商品规格与描述不符",
            "totalBreakTimeRate": "19.58%",
            "totalBreakTime": 2545
          },
          {
            "bkReasonName": "商品颜色与描述不符",
            "totalBreakTimeRate": "8.54%",
            "totalBreakTime": 1110
          },
          {
            "bkReasonName": "商品尺寸不合适",
            "totalBreakTimeRate": "7.38%",
            "totalBreakTime": 960
          },
          {
            "bkReasonName": "商品质量问题",
            "totalBreakTimeRate": "7.04%",
            "totalBreakTime": 915
          },
          {
            "bkReasonName": "商品数量不足",
            "totalBreakTimeRate": "7.02%",
            "totalBreakTime": 913
          },
          {
            "bkReasonName": "商品配件缺失",
            "totalBreakTimeRate": "3.50%",
            "totalBreakTime": 455
          },
          {
            "bkReasonName": "商品外观破损",
            "totalBreakTimeRate": "3.18%",
            "totalBreakTime": 413
          },
          {
            "bkReasonName": "商品包装破损",
            "totalBreakTimeRate": "2.64%",
            "totalBreakTime": 343
          },
          {
            "bkReasonName": "错发商品",
            "totalBreakTimeRate": "1.84%",
            "totalBreakTime": 239
          },
          {
            "bkReasonName": "重复购买",
            "totalBreakTimeRate": "1.48%",
            "totalBreakTime": 193
          },
          {
            "bkReasonName": "不再需要",
            "totalBreakTimeRate": "1.24%",
            "totalBreakTime": 161
          },
          {
            "bkReasonName": "物流配送延误",
            "totalBreakTimeRate": "1.18%",
            "totalBreakTime": 154
          },
          {
            "bkReasonName": "签收后发现缺件",
            "totalBreakTimeRate": "1.08%",
            "totalBreakTime": 140
          },
          {
            "bkReasonName": "商品保质期不足",
            "totalBreakTimeRate": "1.05%",
            "totalBreakTime": 137
          },
          {
            "bkReasonName": "商品型号不匹配",
            "totalBreakTimeRate": "0.96%",
            "totalBreakTime": 125
          },
          {
            "bkReasonName": "商品临期",
            "totalBreakTimeRate": "0.91%",
            "totalBreakTime": 118
          },
          {
            "bkReasonName": "商品价格变动",
            "totalBreakTimeRate": "0.74%",
            "totalBreakTime": 96
          },
          {
            "bkReasonName": "优惠未正确抵扣",
            "totalBreakTimeRate": "0.69%",
            "totalBreakTime": 90
          },
          {
            "bkReasonName": "订单重复扣款",
            "totalBreakTimeRate": "0.68%",
            "totalBreakTime": 88
          },
          {
            "bkReasonName": "订单地址填写错误",
            "totalBreakTimeRate": "0.46%",
            "totalBreakTime": 60
          },
          {
            "bkReasonName": "冷链温控异常",
            "totalBreakTimeRate": "0.38%",
            "totalBreakTime": 50
          },
          {
            "bkReasonName": "预售交付延期",
            "totalBreakTimeRate": "0.23%",
            "totalBreakTime": 30
          },
          {
            "bkReasonName": "组合商品缺货",
            "totalBreakTimeRate": "0.22%",
            "totalBreakTime": 29
          },
          {
            "bkReasonName": "商品标签信息错误",
            "totalBreakTimeRate": "0.19%",
            "totalBreakTime": 25
          },
          {
            "bkReasonName": "商品功能与介绍不符",
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
    // --- 组件挂载后执行 ---
    this.query(); // 查询退货原因列表数据
    this.queryTree(); // 查询商品分类树数据
    this.queryStopReasonType(); // 查询退货原因下拉选项数据
  },
  methods: {
    // --- 数据查询方法 (当前使用模拟数据) ---

    /**
     * @description 查询退货原因列表数据 (模拟)
     * - 设置加载状态
     * - 使用本地模拟数据 `listData`
     * - 对数据按 `totalBreakTimeRate` 降序排序
     * - 更新 `dataList` (传递给子组件)
     * - 处理错误情况
     * - 结束加载状态
     */
    query() {
      let _this = this;
      _this.loading = true; // 开始加载状态
      // 实际应用中，这里会是 API 请求
      // 此处直接使用模拟数据 listData
      if (_this.listData.success) {
        // 对模拟数据按 totalBreakTimeRate 降序排序
        const sortedData = _this.listData.result.sort((a, b) => {
          const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
          const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
          return valueB - valueA; // 降序
        });
        _this.dataList = sortedData; // 更新 dataList，传递给子组件
      } else {
        ElMessage.error(_this.listData.message || '获取列表数据失败 (来自模拟数据)');
      }
      _this.loading = false; // 结束加载状态
    },

    /**
     * @description 查询商品分类树数据 (模拟)
     * - 设置加载状态
     * - 使用本地模拟数据 `treeDataJson`
     * - 递归处理树节点，添加 `key` 和 `isLeaf` 属性以适配 `el-tree-select`
     * - 更新 `treeData` (在 setup 中定义)
     * - 处理错误情况
     * - 结束加载状态
     */
    queryTree() {
      let _this = this;
      _this.loading = true;
      // 实际应用中，这里会是 API 请求
      // 此处直接使用模拟数据 treeDataJson
      if (_this.treeDataJson.success) {
        // 递归函数，为树节点添加 el-tree-select 需要的 key 和 isLeaf 属性
        const processNode = (node) => {
          node.key = node.plno; // 使用 plno 作为唯一 key
          node.isLeaf = !node.children || node.children.length === 0; // 判断是否为叶子节点
          if (node.children && node.children.length > 0) {
            node.children.forEach(processNode); // 递归处理子节点
          }
        };
        // 模拟数据包含一个根对象，我们需要其 children
        const rootObject = _this.treeDataJson.result[0];
        if (rootObject && rootObject.children) {
          rootObject.children.forEach(processNode); // 处理所有一级子节点
          _this.treeData = rootObject.children; // 更新 setup 中定义的 treeData ref
        } else {
          _this.treeData = []; // 如果没有子节点，设置为空数组
        }
      } else {
        ElMessage.error(_this.treeDataJson.message || '获取树形列表失败 (来自模拟数据)');
        _this.treeData = [];
      }
      _this.loading = false;
    },

    /**
     * @description 查询退货原因下拉选项数据 (模拟)
     * - 设置加载状态
     * - 使用本地模拟数据 `stopReasonData`
     * - 将数据映射为 `el-select` 需要的 `{ label, value }` 格式
     * - 更新 `attrCnts.faultModeOptions`
     * - 处理错误情况
     * - 结束加载状态
     */
    queryStopReasonType() {
      let _this = this;
      _this.loading = true;
      // 实际应用中，这里会是 API 请求
      // 此处直接使用模拟数据 stopReasonData
      if (_this.stopReasonData.success) {
        // 将模拟数据映射为 el-select 需要的 { label, value } 格式
        _this.attrCnts.faultModeOptions = _this.stopReasonData.result.map(item => {
          return { label: item.stopReasonType, value: item.stopReasonType };
        });
      } else {
        ElMessage.error(_this.stopReasonData.message || '获取下拉框选项失败 (来自模拟数据)');
        _this.attrCnts.faultModeOptions = [];
      }
      _this.loading = false;
    },

    // --- 事件处理方法 ---

    /**
     * @description 查询按钮点击事件处理
     * @param {Object} formEl - 表单实例 (通过模板引用传递)
     */
    async fun_search(formEl) {
      let _this = this;
      if (!formEl) { // 检查表单实例是否存在
        return;
      }
      // 触发表单验证
      await formEl.validate((valid) => {
        if (valid) { // 验证通过
          _this.query(); // 重新查询数据 (基于当前筛选条件，虽然模拟数据未实现过滤)
        } else { // 验证失败
          ElMessage.warning('请检查筛选参数是否符合要求');
        }
      })
    },

    /**
     * @description 重置按钮点击事件处理
     * @param {Object} formEl - 表单实例 (通过模板引用传递)
     */
    async fun_reset(formEl) {
      let _this = this;
      if (!formEl) { // 检查表单实例是否存在
        return;
      }
      formEl.resetFields(); // 重置表单到初始值
      _this.query(); // 重新查询数据 (显示所有数据)
    },
  },
};
