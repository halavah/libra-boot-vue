import { defineComponent, reactive, ref, Ref } from 'vue'
import { ElMessage, ElForm, ElTreeSelect } from 'element-plus';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'
import ContentArea from '../components/ContentArea.vue';
// 移除从 ./ContentArea.ts 导入 FaultModeItem

dayjs.locale('zh-cn') // 设置 Dayjs 本地化为中文

// --- 类型定义区域 ---

// 退货原因列表项数据结构 (从 ContentArea.ts 移动过来)
export interface FaultModeItem {
  bkReasonName: string; // 退货原因名称
  totalBreakTime: number | string; // 订单暂停时长 (可能是数字或字符串)
  totalBreakTimeRate?: string | number | null; // 订单暂停时长占比 (可选, 可能是字符串、数字或 null)
}

// 商品分类树节点数据结构
interface PlTreeNode {
  parent_plno: string | null; // 父节点编号
  plname: string; // 商品分类名称
  plno: string; // 商品分类编号
  key?: string; // 树选择器使用的唯一标识
  isLeaf?: boolean; // 是否为叶子节点
  children?: PlTreeNode[] | null; // 子节点数组
}

// 退货原因下拉选项数据结构
interface FaultModeOption {
  label: string; // 显示文本
  value: string; // 选项值
}

// 筛选表单数据结构
interface SearchForm {
  plNoKey: string[]; // 选中的商品分类 key 数组
  equipmentNo: string; // 商品编号
  stopReasonName: string[]; // 选中的退货原因名称数组
  vDay: [string, string]; // 日期范围 [开始日期, 结束日期]
}

// 通用 API 响应数据结构
interface ApiResponse<T> {
  success: boolean; // 请求是否成功
  message: string; // 响应消息
  code: number; // 响应状态码
  result: T; // 响应结果数据
  timestamp: number; // 服务器时间戳
}

// 退货原因列表 API 响应结果类型
type ListDataResult = FaultModeItem[];

// 商品分类树 API 响应结果类型
type TreeDataResult = PlTreeNode[];

// 退货原因类型 API 响应结果类型
interface StopReasonTypeItem {
  stopReasonType: string; // 退货原因类型名称
}
type StopReasonDataResult = StopReasonTypeItem[];


// --- 组件定义 ---
export default defineComponent({
  name: 'demo04', // 组件名称
  components: { // 注册子组件
    ContentArea // 移除 as any 断言
  },
  // --- Composition API setup ---
  setup() {
    // 响应式状态：加载状态
    const loading: Ref<boolean> = ref(true);

    // 商品分类树选择器配置
    const treeProps = {
      label: 'plname', // 指定节点标签名为 'plname'
      children: 'children', // 指定子树为 'children'
    };
    // 响应式状态：商品分类树数据
    const treeData: Ref<PlTreeNode[]> = ref([]);

    // 响应式引用：筛选表单实例 (使用 any 绕过类型检查)
    const searchFormRef: Ref<any | null> = ref(null);
    // 响应式状态：筛选表单验证规则 (使用 any 绕过类型检查)
    const searchFormRules = reactive<any>({
      vDay: [ // 日期范围必填
        { type: 'array', required: true, message: '请选择日期范围', trigger: 'change' }
      ],
    });

    // 返回 setup 中定义的变量，供模板和 Options API 使用
    return {
      loading,
      treeProps,
      treeData,
      searchFormRules,
      searchFormRef,
    };
  },
  // --- Options API data ---
  data(): {
    // 属性容器，用于存放下拉选项等
    attrCnts: {
      faultModeOptions: FaultModeOption[]; // 退货原因下拉选项
    };
    // 筛选表单数据模型
    searchForm: SearchForm;
    // 传递给子组件的数据列表
    dataList: FaultModeItem[];
    // 分析功能区域文本
    analysisText: string;
    // 模拟 API 返回数据 (带类型)
    listData: ApiResponse<ListDataResult>;
    treeDataJson: ApiResponse<TreeDataResult>;
    stopReasonData: ApiResponse<StopReasonDataResult>;
  } {
    return {
      // 属性容器初始化
      attrCnts: {
        faultModeOptions: [], // 退货原因下拉选项初始化为空
      },
      // 筛选表单数据初始化
      searchForm: {
        plNoKey: [], // 商品分类选择默认为空
        equipmentNo: '', // 商品编号默认为空
        stopReasonName: [], // 退货原因选择默认为空
        vDay: [ // 日期范围默认值
          '2000-01-01',
          '2026-01-01'
        ],
      },
      // 退货原因列表数据初始化为空
      dataList: [],
      // 分析文本初始化
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
  // --- 生命周期钩子 ---
  mounted() {
    // 组件挂载后，执行初始化查询
    this.query(); // 查询退货原因列表
    this.queryTree(); // 查询商品分类树
    this.queryStopReasonType(); // 查询退货原因类型
  },
  // --- 方法定义 ---
  methods: {
    /**
     * 查询退货原因列表数据 (模拟)
     */
    query(): void {
      this.loading = true; // 显示加载状态
      if (this.listData.success) {
        // 模拟数据排序 (按订单暂停时长占比降序)
        const sortedData = [...this.listData.result].sort((a, b) => {
          const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
          const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
          return valueB - valueA; // 降序排列
        });
        this.dataList = sortedData; // 更新列表数据
      } else {
        // 显示错误提示
        ElMessage.error(this.listData.message || '获取列表数据失败 (来自模拟数据)');
      }
      this.loading = false; // 隐藏加载状态
    },

    /**
     * 查询商品分类树数据 (模拟)
     */
    queryTree(): void {
      this.loading = true;
      if (this.treeDataJson.success) {
        // 递归处理树节点，添加 key 和 isLeaf 属性
        const processNode = (node: PlTreeNode): void => {
          node.key = node.plno; // 使用 plno 作为 key
          node.isLeaf = !node.children || node.children.length === 0; // 判断是否叶子节点
          if (node.children && node.children.length > 0) {
            node.children.forEach(processNode); // 递归子节点
          }
        };
        // 处理模拟数据中的根节点下的子节点
        const rootObject = this.treeDataJson.result[0];
        if (rootObject && rootObject.children) {
          rootObject.children.forEach(processNode);
          this.treeData = rootObject.children; // 更新树数据
        } else {
          this.treeData = []; // 无子节点则置空
        }
      } else {
        ElMessage.error(this.treeDataJson.message || '获取树形列表失败 (来自模拟数据)');
        this.treeData = [];
      }
      this.loading = false;
    },

    /**
     * 查询退货原因下拉选项数据 (模拟)
     */
    queryStopReasonType(): void {
      this.loading = true;
      if (this.stopReasonData.success) {
        // 将模拟数据转换为下拉框选项格式 { label, value }
        this.attrCnts.faultModeOptions = this.stopReasonData.result.map((item): FaultModeOption => {
          return { label: item.stopReasonType, value: item.stopReasonType };
        });
      } else {
        ElMessage.error(this.stopReasonData.message || '获取下拉框选项失败 (来自模拟数据)');
        this.attrCnts.faultModeOptions = [];
      }
      this.loading = false;
    },

    /**
     * 查询按钮点击处理函数
     * @param formEl 表单实例 (使用 any 绕过类型检查)
     */
    async fun_search(formEl: any | null): Promise<void> {
      if (!formEl) return; // 实例不存在则退出
      try {
        // 触发表单验证
        const valid = await formEl.validate();
        if (valid) { // 验证通过
          this.query(); // 执行查询
        }
        // else 分支可以省略，validate 失败会 reject 进入 catch
      } catch (error) {
        // 捕获验证失败或查询过程中的错误
        console.warn('表单验证未通过或发生错误:', error);
        ElMessage.warning('请检查筛选参数是否符合要求'); // 提示用户检查输入
      }
    },

    /**
     * 重置按钮点击处理函数
     * @param formEl 表单实例 (使用 any 绕过类型检查)
     */
    fun_reset(formEl: any | null): void {
      if (!formEl) return; // 实例不存在则退出
      formEl.resetFields(); // 重置表单字段
      this.query(); // 重新查询数据
    },
  },
});
