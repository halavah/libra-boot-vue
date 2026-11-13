// --- 核心库导入 ---
import { reactive, ref, nextTick, provide } from 'vue'; // Vue 组合式 API
import { message } from 'ant-design-vue'; // Ant Design Vue 消息提示
import * as echarts from 'echarts'; // ECharts 核心库
import axios from 'axios'; // HTTP 请求库 (当前未使用，但保留)

// --- 组件与配置导入 ---
import ContentArea from '../components/ContentArea.vue'; // 导入内容区域子组件
import zhCN from 'ant-design-vue/es/locale/zh_CN'; // Ant Design Vue 中文语言包
import dayjs from 'dayjs'; // 日期时间处理库
import 'dayjs/locale/zh-cn'; // 导入 Dayjs 中文语言包
dayjs.locale('zh-cn'); // 设置 Dayjs 全局语言为中文

export default {
  name: 'demo02', // 组件名称
  components: { // 注册子组件
    ContentArea
  },
  // --- 组合式 API 入口 ---
  setup() {
    // --- 全局注入 ---
    provide('echarts', echarts); // 向子组件提供 ECharts 实例

    // --- 响应式状态定义 ---
    // 加载状态
    const loading = ref(true); // 页面整体加载状态
    const dataFormLoading = ref(false); // 弹窗表单加载状态 (当前未使用)

    // 筛选区域 - 产线树 (TreeSelect)
    const treeProps = { // TreeSelect 节点属性映射
      title: 'plname', // 显示文本字段名
      value: 'plno',   // 节点值字段名
      children: 'children', // 子节点字段名
    }
    const treeData = ref([]); // 树形数据源
    const expandedKeys = ref([]); // 默认展开的节点键
    const selectedKeys = ref([]); // 当前选中的节点键 (v-model 绑定的是 searchForm.plNos)
    const treeLoading = ref(false); // 树数据加载状态

    // --- 自定义表单校验器 ---
    // 校验日期范围选择器
    const validateDateRange = async (_rule, value) => {
      // 基础校验：必须是包含两个有效日期的数组
      if (!value || !Array.isArray(value) || value.length < 2 || !value[0] || !value[1]) {
        return Promise.reject('请选择有效的开始及结束时间');
      }
      // 逻辑校验：结束日期不能早于开始日期
      if (dayjs(value[1]).isBefore(dayjs(value[0]))) {
        return Promise.reject('结束时间不能早于开始时间');
      }
      return Promise.resolve(); // 校验通过
    };

    // 筛选区域 - 表单 (Form)
    const searchFormRef = ref(''); // 表单实例引用
    const rules = reactive({ // 表单校验规则
      vDay: [ // 日期范围校验
        { validator: validateDateRange, trigger: 'change' } // 使用自定义校验器
      ],
      equipmentNo: [ // 设备号校验
        { required: true, message: '请输入设备号', trigger: 'blur' }, // 必填
      ],
    })

    // 内容区域 - 表格 (Table) - (大部分逻辑移至 ContentArea.vue)
    const dataTableRef = ref(''); // 表格实例引用 (当前未使用)
    const selectionRows = []; // 选中的行 (当前未使用)
    const currentRow = {}; // 当前行 (当前未使用)

    // 内容区域 - 表格分页 (Pagination) - (当前未使用，因表格在子组件)
    const dataTableHeight = ref(window.innerHeight - 176); // 表格高度 (当前未使用)
    const pageSizes = ref([15, 25, 35, 50, 100]); // 每页条数选项
    const pageSize = ref(15); // 当前每页条数
    const currentPage = ref(1); // 当前页码
    const dataTotal = ref(0); // 总数据条数

    // 弹窗表单 (Modal Form) - (当前未使用)
    const dataFormRef = ref(''); // 弹窗表单实例引用
    const dataFormTitle = ref('详情'); // 弹窗标题
    const dataFormVisible = ref(false); // 弹窗可见性
    const dataFormStatus = ref(''); // 弹窗状态 (add/edit)

    // --- setup 返回值 ---
    // 将需要在模板中使用或暴露给选项式 API 的变量和函数返回
    return {
      loading,
      dataFormLoading,

      // 树相关
      treeProps,
      treeData,
      expandedKeys,
      selectedKeys,
      treeLoading,

      // 表单相关
      rules,
      searchFormRef,

      // 表格相关 (保留引用，即使当前未使用)
      dataTableRef,
      selectionRows,
      currentRow,

      // 分页相关 (保留，即使当前未使用)
      dataTableHeight,
      pageSizes,
      pageSize,
      currentPage,
      dataTotal,

      // 弹窗表单相关 (保留，即使当前未使用)
      dataFormRef,
      dataFormTitle,
      dataFormVisible,
      dataFormStatus,

      // 其他库实例
      dayjs,

      // Ant Design Vue 配置
      locale: zhCN, // 设置中文语言包
    };
  },

  // --- 选项式 API 数据 ---
  // 用于存储非响应式或通过 this 访问的数据
  data() {
    return {
      // --- 配置与常量 ---
      wsUrl: 'http://localhost:9994/pisces-boot', // 后端 API 地址 (当前未使用)

      // --- 静态数据或选项 ---
      attrCnts: { // 通用属性/选项集合
        yesOrNo: ['是', '否'], // 是/否选项 (当前未使用)
        faultModeOptions: [], // 商品售后模式下拉选项 (从 API 或 JSON 加载)
      },

      // --- 表单数据模型 ---
      searchForm: { // 筛选表单数据绑定对象
        plNos: [], // 产线编号 (TreeSelect v-model)
        equipmentNo: '', // 设备号 (Input v-model)
        stopReasonName: [], // 商品售后模式 (Select v-model)
        vDay: [ // 日期范围 (RangePicker v-model)
          // 默认日期范围 (示例)
          dayjs('2000-01-01'),
          dayjs('2026-01-01')
        ],
      },

      // --- 核心业务数据 ---
      dataList: [], // 故障模式列表数据 (传递给子组件)
      dateLength: [], // (用途不明，保留)

      // --- 弹窗表单数据模型 --- (当前未使用)
      dataForm: {},

      // --- 其他 UI 数据 ---
      analysisText: '演示订单售后记录001', // 分析功能区域文本

      // --- 模拟数据 (用于前端独立调试) ---
      listDataJson: { // 列表模拟数据
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
      treeDataJson: { // 树形模拟数据
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
        "timestamp": 1745118762247
      },
      stopReasonDataJson: { // 故障模式下拉选项模拟数据
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "stopReasonType": "设备原因"
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
      // 表格列定义已移至子组件 ContentArea.vue
    };
  },

  // --- 生命周期钩子 ---
  mounted() {
    // 组件挂载后执行初始化数据查询
    this.query(); // 加载列表数据
    this.queryTree(); // 加载树形数据
    this.queryStopReasonType(); // 加载故障模式选项
  },

  // --- 方法 ---
  methods: {
    // 加载故障模式列表数据 (当前使用模拟数据)
    query() {
      let _this = this;
      _this.loading = true; // 开始加载
      // 模拟 API 请求成功
      if (_this.listDataJson.success) {
        // 对结果按 totalBreakTimeRate 降序排序
        const sortedData = _this.listDataJson.result.sort((a, b) => {
          const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
          const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
          return valueB - valueA;
        });
        _this.dataList = sortedData; // 更新列表数据 (将传递给子组件)
      } else {
        // 处理模拟 API 请求失败
        message.error(_this.listDataJson.message || '获取列表数据失败 (来自 JSON)');
      }
      _this.loading = false; // 结束加载
    },

    // 加载产线树形数据 (当前使用模拟数据)
    queryTree() {
      let _this = this;
      _this.loading = true; // 开始加载
      // 模拟 API 请求成功
      if (_this.treeDataJson.success) {
        // 递归处理节点数据，添加 Antd TreeSelect 需要的 title 和 key 属性
        const processNode = (node) => {
          node.title = node.plname; // 映射显示文本
          node.key = node.plno; // 映射唯一键
          if (node.children && node.children.length > 0) {
            node.children.forEach(processNode); // 递归处理子节点
          } else {
            node.children = undefined; // 如果没有子节点，移除 children 属性
          }
        };
        const rootObject = _this.treeDataJson.result[0]; // 获取根节点对象
        if (rootObject && rootObject.children) {
          rootObject.children.forEach(processNode); // 处理根节点的直接子节点
          _this.treeData = rootObject.children; // 更新树数据
          // 默认展开第一个一级节点
          if (_this.treeData.length > 0 && _this.treeData[0].key) {
            _this.expandedKeys = [_this.treeData[0].key];
          }
        } else {
          _this.treeData = []; // 如果数据无效，设置为空数组
        }
      } else {
        // 处理模拟 API 请求失败
        message.error(_this.treeDataJson.message || '获取树形列表失败 (来自 JSON)');
        _this.treeData = [];
      }
      _this.loading = false; // 结束加载
    },

    // 加载商品售后模式下拉选项 (当前使用模拟数据)
    queryStopReasonType() {
      let _this = this;
      _this.loading = true; // 开始加载
      // 模拟 API 请求成功
      if (_this.stopReasonDataJson.success) {
        // 将 API 返回的数组映射为 Antd Select 需要的 { label, value } 格式
        _this.attrCnts.faultModeOptions = _this.stopReasonDataJson.result.map(item => ({
          label: item.stopReasonType,
          value: item.stopReasonType
        }));
      } else {
        // 处理模拟 API 请求失败
        message.error(_this.stopReasonDataJson.message || '获取故障模式失败 (来自 JSON)');
        _this.attrCnts.faultModeOptions = [];
      }
      _this.loading = false; // 结束加载
    },

    // 点击“查询”按钮事件处理
    async fun_search() {
      if (!this.searchFormRef) return; // 检查表单引用是否存在
      this.loading = true; // 开始加载
      try {
        // 触发表单校验
        await this.searchFormRef.validateFields();
        // 校验通过，执行查询逻辑 (当前仅重新加载模拟数据)
        this.query();
        message.success('查询完成'); // 提示成功
      } catch (errorInfo) {
        // 校验失败
        message.warning('请检查表单输入项！'); // 提示警告
      } finally {
        this.loading = false; // 结束加载
      }
    },

    // 点击“重置”按钮事件处理
    fun_reset() {
      if (!this.searchFormRef) return; // 检查表单引用是否存在
      this.loading = true; // 开始加载
      try {
        // 重置表单字段到初始值
        this.searchFormRef.resetFields();
        // 重置后重新加载数据
        this.query();
        message.success('重置完成'); // 提示成功
      } catch (error) {
        // 处理重置过程中的异常
        console.error("重置操作失败:", error);
        message.error('重置操作失败');
      } finally {
        this.loading = false; // 结束加载
      }
    },

    // TreeSelect 节点选择事件处理 (当前仅作提示)
    onSelect(selectedKeysValue, info) {
      this.selectedKeys = selectedKeysValue; // 更新内部 selectedKeys 状态 (注意 v-model 绑定的是 searchForm.plNos)
      // 触发提示，显示选中的节点名称
      message.info(`已选择节点: ${info.node.title}`);
      // 注意：当前选择节点不会触发数据或图表的重新加载/过滤
    }

    // 注意：ECharts 相关的方法 (如初始化、设置选项) 和 beforeUnmount 钩子已移至子组件 ContentArea.vue
  }
};
