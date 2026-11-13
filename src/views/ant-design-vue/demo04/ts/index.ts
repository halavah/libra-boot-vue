// --- 核心库导入 ---
import { reactive, ref, nextTick, provide, defineComponent, Ref } from 'vue'; // Vue 组合式 API 和 defineComponent
import { message, FormInstance } from 'ant-design-vue'; // Ant Design Vue 消息提示和类型
import { Rule } from 'ant-design-vue/es/form'; // Ant Design Vue 表单规则类型
import * as echarts from 'echarts'; // ECharts 核心库
import axios from 'axios'; // HTTP 请求库 (当前未使用，但保留)

// --- 组件与配置导入 ---
import ContentArea from '../components/ContentArea.vue'; // 导入内容区域子组件
import zhCN from 'ant-design-vue/es/locale/zh_CN'; // Ant Design Vue 中文语言包
import dayjs, { Dayjs } from 'dayjs'; // 日期时间处理库和类型
import 'dayjs/locale/zh-cn'; // 导入 Dayjs 中文语言包
dayjs.locale('zh-cn'); // 设置 Dayjs 全局语言为中文

// --- 类型定义 ---
interface TreeNode {
  plname: string;
  plno: string;
  parent_plno: string | null;
  children?: TreeNode[];
  // Antd TreeSelect 需要的额外属性
  title?: string;
  key?: string;
  value?: string; // 通常 value 和 key 相同
}

interface FaultModeOption {
  label: string;
  value: string;
}

interface SearchForm {
  plNos: string[];
  equipmentNo: string;
  stopReasonName: string[];
  vDay: [Dayjs, Dayjs] | null; // 明确类型为 Dayjs 元组或 null
}

interface ListItem {
  bkReasonName: string;
  totalBreakTimeRate: string; // 保持字符串，因为原始数据是 "xx.xx%"
  totalBreakTime: number;
}

// --- 组件定义 ---
export default defineComponent({
  name: 'demo04', // 组件名称 (更新为 demo4)
  components: { // 注册子组件
    ContentArea
  },
  // --- 组合式 API 入口 ---
  setup() {
    // --- 全局注入 ---
    provide('echarts', echarts); // 向子组件提供 ECharts 实例

    // --- 响应式状态定义 ---
    const loading: Ref<boolean> = ref(true); // 页面整体加载状态
    const dataFormLoading: Ref<boolean> = ref(false); // 弹窗表单加载状态 (当前未使用)

    // 筛选区域 - 商品分类树 (TreeSelect)
    const treeProps = { // TreeSelect 节点属性映射
      title: 'plname',
      value: 'plno',
      children: 'children',
    };
    const treeData: Ref<TreeNode[]> = ref([]); // 树形数据源
    const expandedKeys: Ref<string[]> = ref([]); // 默认展开的节点键
    const selectedKeys: Ref<string[]> = ref([]); // 当前选中的节点键
    const treeLoading: Ref<boolean> = ref(false); // 树数据加载状态

    // --- 自定义表单校验器 ---
    const validateDateRange = async (_rule: any, value: [Dayjs, Dayjs] | null): Promise<void> => {
      if (!value || !Array.isArray(value) || value.length < 2 || !value[0] || !value[1]) {
        // 允许为空，如果需要必填，在 rules 中添加 required: true
        return Promise.resolve();
        // return Promise.reject('请选择有效的开始及结束时间');
      }
      if (dayjs(value[1]).isBefore(dayjs(value[0]))) {
        return Promise.reject('结束时间不能早于开始时间');
      }
      return Promise.resolve();
    };

    // 筛选区域 - 表单 (Form)
    const searchFormRef: Ref<FormInstance | null> = ref(null); // 表单实例引用
    const rules: Record<string, Rule[]> = reactive({ // 表单校验规则
      vDay: [
        { validator: validateDateRange, trigger: 'change' }
      ],
      // equipmentNo: [ // 暂时移除必填，方便测试
      //   { required: true, message: '请输入商品编号', trigger: 'blur' },
      // ],
    });

    // 内容区域 - 表格 (Table) - (大部分逻辑移至 ContentArea.vue)
    const dataTableRef: Ref<any> = ref(null); // 表格实例引用 (类型设为 any)
    const selectionRows: Ref<any[]> = ref([]); // 选中的行
    const currentRow: Ref<Record<string, any>> = ref({}); // 当前行

    // 内容区域 - 表格分页 (Pagination) - (当前未使用)
    const dataTableHeight: Ref<number> = ref(window.innerHeight - 176);
    const pageSizes: Ref<number[]> = ref([15, 25, 35, 50, 100]);
    const pageSize: Ref<number> = ref(15);
    const currentPage: Ref<number> = ref(1);
    const dataTotal: Ref<number> = ref(0);

    // 弹窗表单 (Modal Form) - (当前未使用)
    const dataFormRef: Ref<FormInstance | null> = ref(null);
    const dataFormTitle: Ref<string> = ref('详情');
    const dataFormVisible: Ref<boolean> = ref(false);
    const dataFormStatus: Ref<string> = ref(''); // 'add' | 'edit'

    // --- setup 返回值 ---
    return {
      loading,
      dataFormLoading,
      treeProps,
      treeData,
      expandedKeys,
      selectedKeys,
      treeLoading,
      rules,
      searchFormRef,
      dataTableRef,
      selectionRows,
      currentRow,
      dataTableHeight,
      pageSizes,
      pageSize,
      currentPage,
      dataTotal,
      dataFormRef,
      dataFormTitle,
      dataFormVisible,
      dataFormStatus,
      dayjs, // 直接返回 dayjs 实例
      locale: zhCN,
    };
  },

  // --- 选项式 API 数据 ---
  data(): {
    wsUrl: string;
    attrCnts: {
      yesOrNo: string[];
      faultModeOptions: FaultModeOption[];
    };
    searchForm: SearchForm;
    dataList: ListItem[];
    dateLength: any[]; // 类型设为 any[]
    dataForm: Record<string, any>;
    analysisText: string;
    listDataJson: any; // 模拟数据保持 any 类型
    treeDataJson: any;
    stopReasonDataJson: any;
  } {
    return {
      wsUrl: 'http://localhost:9994/pisces-boot',
      attrCnts: {
        yesOrNo: ['是', '否'],
        faultModeOptions: [],
      },
      searchForm: {
        plNos: [],
        equipmentNo: '',
        stopReasonName: [],
        // 使用 dayjs() 创建 Dayjs 对象
        vDay: [dayjs('2000-01-01'), dayjs('2026-01-01')],
      },
      dataList: [],
      dateLength: [],
      dataForm: {},
      analysisText: '演示订单售后记录001',
      // --- 模拟数据 ---
      listDataJson: { /* ... 原始 JSON 数据 ... */
        "success": true, "message": "", "code": 200, "result": [
          { "bkReasonName": "其他", "totalBreakTimeRate": "27.66%", "totalBreakTime": 3596 },
          { "bkReasonName": "商品规格与描述不符", "totalBreakTimeRate": "19.58%", "totalBreakTime": 2545 },
          { "bkReasonName": "商品颜色与描述不符", "totalBreakTimeRate": "8.54%", "totalBreakTime": 1110 },
          { "bkReasonName": "商品尺寸不合适", "totalBreakTimeRate": "7.38%", "totalBreakTime": 960 },
          { "bkReasonName": "商品质量问题", "totalBreakTimeRate": "7.04%", "totalBreakTime": 915 },
          { "bkReasonName": "商品数量不足", "totalBreakTimeRate": "7.02%", "totalBreakTime": 913 },
          { "bkReasonName": "商品配件缺失", "totalBreakTimeRate": "3.50%", "totalBreakTime": 455 },
          { "bkReasonName": "商品外观破损", "totalBreakTimeRate": "3.18%", "totalBreakTime": 413 },
          { "bkReasonName": "商品包装破损", "totalBreakTimeRate": "2.64%", "totalBreakTime": 343 },
          { "bkReasonName": "错发商品", "totalBreakTimeRate": "1.84%", "totalBreakTime": 239 },
          { "bkReasonName": "重复购买", "totalBreakTimeRate": "1.48%", "totalBreakTime": 193 },
          { "bkReasonName": "不再需要", "totalBreakTimeRate": "1.24%", "totalBreakTime": 161 },
          { "bkReasonName": "物流配送延误", "totalBreakTimeRate": "1.18%", "totalBreakTime": 154 },
          { "bkReasonName": "签收后发现缺件", "totalBreakTimeRate": "1.08%", "totalBreakTime": 140 },
          { "bkReasonName": "商品保质期不足", "totalBreakTimeRate": "1.05%", "totalBreakTime": 137 },
          { "bkReasonName": "商品型号不匹配", "totalBreakTimeRate": "0.96%", "totalBreakTime": 125 },
          { "bkReasonName": "商品临期", "totalBreakTimeRate": "0.91%", "totalBreakTime": 118 },
          { "bkReasonName": "商品价格变动", "totalBreakTimeRate": "0.74%", "totalBreakTime": 96 },
          { "bkReasonName": "优惠未正确抵扣", "totalBreakTimeRate": "0.69%", "totalBreakTime": 90 },
          { "bkReasonName": "订单重复扣款", "totalBreakTimeRate": "0.68%", "totalBreakTime": 88 },
          { "bkReasonName": "订单地址填写错误", "totalBreakTimeRate": "0.46%", "totalBreakTime": 60 },
          { "bkReasonName": "冷链温控异常", "totalBreakTimeRate": "0.38%", "totalBreakTime": 50 },
          { "bkReasonName": "预售交付延期", "totalBreakTimeRate": "0.23%", "totalBreakTime": 30 },
          { "bkReasonName": "组合商品缺货", "totalBreakTimeRate": "0.22%", "totalBreakTime": 29 },
          { "bkReasonName": "商品标签信息错误", "totalBreakTimeRate": "0.19%", "totalBreakTime": 25 },
          { "bkReasonName": "商品功能与介绍不符", "totalBreakTimeRate": "0.12%", "totalBreakTime": 15 }
        ], "timestamp": 1745118762285
      },
      treeDataJson: { /* ... 原始 JSON 数据 ... */
        "success": true, "message": "", "code": 200, "result": [
          {
            "parent_plno": null, "plname": "根节点", "children": [
              { "parent_plno": "A1", "plname": "电商物流中心", "children": [{ "parent_plno": "W1", "plname": "电商物流中心-商品分组01", "plno": "W101" }], "plno": "W1" },
              { "parent_plno": "A1", "plname": "商品运营中心", "children": [{ "parent_plno": "W2", "plname": "商品运营中心-商品分组01", "plno": "W201" }, { "parent_plno": "W2", "plname": "商品运营中心-商品分组02", "plno": "W202" }, { "parent_plno": "W2", "plname": "商品运营中心-商品分组03", "plno": "W203" }, { "parent_plno": "W2", "plname": "商品运营中心-商品分组04", "plno": "W204" }, { "parent_plno": "W2", "plname": "商品运营中心-商品分组05", "plno": "W205" }, { "parent_plno": "W2", "plname": "商品运营中心-商品分组06", "plno": "W206" }], "plno": "W2" },
              { "parent_plno": "A1", "plname": "自营店铺", "children": [{ "parent_plno": "W3", "plname": "自营店铺-商品分组01", "plno": "W301" }, { "parent_plno": "W3", "plname": "自营店铺-商品分组02", "plno": "W302" }, { "parent_plno": "W3", "plname": "自营店铺-商品分组03", "plno": "W303" }, { "parent_plno": "W3", "plname": "自营店铺-商品分组04", "plno": "W304" }, { "parent_plno": "W3", "plname": "自营店铺-商品分组05", "plno": "W305" }], "plno": "W3" },
              { "parent_plno": "A1", "plname": "数码旗舰店", "children": [{ "parent_plno": "W4", "plname": "数码旗舰店-商品分组01", "plno": "W401" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组02", "plno": "W402" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组03", "plno": "W403" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组04", "plno": "W404" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组05", "plno": "W405" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组06", "plno": "W406" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组07", "plno": "W407" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组08", "plno": "W408" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组09", "plno": "W409" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组10", "plno": "W410" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组11", "plno": "W411" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组12", "plno": "W412" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组13", "plno": "W413" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组14", "plno": "W414" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组15", "plno": "W415" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组16", "plno": "W416" }, { "parent_plno": "W4", "plname": "数码旗舰店-商品分组17", "plno": "W417" }], "plno": "W4" },
              { "parent_plno": "A1", "plname": "客户服务中心", "children": [{ "parent_plno": "W5", "plname": "客户服务中心-商品分组01", "plno": "W503" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组02", "plno": "W504" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组03", "plno": "W505" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组04", "plno": "W506" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组05", "plno": "W507" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组06", "plno": "W508" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组07", "plno": "W509" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组08", "plno": "W510" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组09", "plno": "W511" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组10", "plno": "W512" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组11", "plno": "W513" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组12", "plno": "W514" }, { "parent_plno": "W5", "plname": "客户服务中心-商品分组13", "plno": "W515" }], "plno": "W5" },
              { "parent_plno": "A1", "plname": "家居旗舰店", "children": [{ "parent_plno": "W8", "plname": "家居旗舰店-商品分组01", "plno": "W801" }, { "parent_plno": "W8", "plname": "家居旗舰店-商品分组02", "plno": "W802" }, { "parent_plno": "W8", "plname": "家居旗舰店-商品分组03", "plno": "W803" }, { "parent_plno": "W8", "plname": "家居旗舰店-商品分组04", "plno": "W804" }, { "parent_plno": "W8", "plname": "家居旗舰店-商品分组05", "plno": "W805" }, { "parent_plno": "W8", "plname": "家居旗舰店-商品分组06", "plno": "W806" }, { "parent_plno": "W8", "plname": "家居旗舰店-商品分组07", "plno": "W807" }], "plno": "W8" },
              { "parent_plno": "A1", "plname": "美妆旗舰店", "children": [{ "parent_plno": "W9", "plname": "美妆旗舰店-商品分组01", "plno": "W901" }, { "parent_plno": "W9", "plname": "美妆旗舰店-商品分组02", "plno": "W902" }, { "parent_plno": "W9", "plname": "美妆旗舰店-商品分组03", "plno": "W903" }, { "parent_plno": "W9", "plname": "美妆旗舰店-商品分组04", "plno": "W904" }, { "parent_plno": "W9", "plname": "美妆旗舰店-商品分组05", "plno": "W905" }, { "parent_plno": "W9", "plname": "美妆旗舰店-商品分组06", "plno": "W906" }, { "parent_plno": "W9", "plname": "美妆旗舰店-商品分组07", "plno": "W907" }], "plno": "W9" },
              { "parent_plno": "A1", "plname": "户外旗舰店", "children": [{ "parent_plno": "WA", "plname": "户外旗舰店-商品分组01", "plno": "WA01" }, { "parent_plno": "WA", "plname": "户外旗舰店-商品分组02", "plno": "WA02" }, { "parent_plno": "WA", "plname": "户外旗舰店-商品分组03", "plno": "WA03" }, { "parent_plno": "WA", "plname": "户外旗舰店-商品分组04", "plno": "WA04" }, { "parent_plno": "WA", "plname": "户外旗舰店-商品分组05", "plno": "WA05" }], "plno": "WA" },
              { "parent_plno": "A1", "plname": "服饰旗舰店", "children": [{ "parent_plno": "Y2", "plname": "服饰旗舰店-商品分组01", "plno": "Y201" }, { "parent_plno": "Y2", "plname": "服饰旗舰店-商品分组02", "plno": "Y202" }, { "parent_plno": "Y2", "plname": "服饰旗舰店-商品分组03", "plno": "Y203" }], "plno": "Y2" },
              { "parent_plno": "A1", "plname": "运动旗舰店", "children": [{ "parent_plno": "Y3", "plname": "运动旗舰店-商品分组01", "plno": "Y301" }, { "parent_plno": "Y3", "plname": "运动旗舰店-商品分组02", "plno": "Y302" }, { "parent_plno": "Y3", "plname": "运动旗舰店-商品分组03", "plno": "Y303" }], "plno": "Y3" },
              { "parent_plno": "A1", "plname": "母婴旗舰店", "children": null, "plno": "Y4" },
              { "parent_plno": "A1", "plname": "食品旗舰店", "children": null, "plno": "Y5" },
              { "parent_plno": "A1", "plname": "图书旗舰店", "children": [{ "parent_plno": "Y8", "plname": "图书旗舰店-商品分组01", "plno": "Y801" }, { "parent_plno": "Y8", "plname": "图书旗舰店-商品分组02", "plno": "Y802" }, { "parent_plno": "Y8", "plname": "图书旗舰店-商品分组03", "plno": "Y803" }, { "parent_plno": "Y8", "plname": "图书旗舰店-商品分组04", "plno": "Y804" }, { "parent_plno": "Y8", "plname": "图书旗舰店-商品分组05", "plno": "Y805" }, { "parent_plno": "Y8", "plname": "图书旗舰店-商品分组06", "plno": "Y806" }, { "parent_plno": "Y8", "plname": "图书旗舰店-商品分组07", "plno": "Y807" }, { "parent_plno": "Y8", "plname": "图书旗舰店-商品分组08", "plno": "Y808" }], "plno": "Y8" }
            ], "plno": "A1"
          }
        ], "timestamp": 1745118762247
      },
      stopReasonDataJson: { /* ... 原始 JSON 数据 ... */
        "success": true, "message": "", "code": 200, "result": [
          { "stopReasonType": "商品质量原因" }, { "stopReasonType": "售后处理原因" },
          { "stopReasonType": "订单管理问题" }, { "stopReasonType": "订单操作问题" },
          { "stopReasonType": "其他原因" }
        ], "timestamp": 1745118762197
      },
    };
  },

  // --- 生命周期钩子 ---
  mounted() {
    this.query();
    this.queryTree();
    this.queryStopReasonType();
  },

  // --- 方法 ---
  methods: {
    query(): void {
      this.loading = true;
      if (this.listDataJson.success) {
        const sortedData = this.listDataJson.result.sort((a: ListItem, b: ListItem) => {
          const valueA = parseFloat(String(a.totalBreakTimeRate || '0').replace('%', ''));
          const valueB = parseFloat(String(b.totalBreakTimeRate || '0').replace('%', ''));
          return valueB - valueA;
        });
        this.dataList = sortedData;
      } else {
        message.error(this.listDataJson.message || '获取列表数据失败 (来自 JSON)');
      }
      this.loading = false;
    },

    queryTree(): void {
      this.loading = true;
      if (this.treeDataJson.success) {
        const processNode = (node: TreeNode): void => {
          node.title = node.plname;
          node.key = node.plno;
          node.value = node.plno; // 添加 value 属性，通常与 key 相同
          if (node.children && node.children.length > 0) {
            node.children.forEach(processNode);
          } else {
            node.children = undefined;
          }
        };
        const rootObject = this.treeDataJson.result[0];
        if (rootObject && rootObject.children) {
          rootObject.children.forEach(processNode);
          this.treeData = rootObject.children;
          if (this.treeData.length > 0 && this.treeData[0].key) {
            this.expandedKeys = [this.treeData[0].key];
          }
        } else {
          this.treeData = [];
        }
      } else {
        message.error(this.treeDataJson.message || '获取树形列表失败 (来自 JSON)');
        this.treeData = [];
      }
      this.loading = false;
    },

    queryStopReasonType(): void {
      this.loading = true;
      if (this.stopReasonDataJson.success) {
        this.attrCnts.faultModeOptions = this.stopReasonDataJson.result.map((item: { stopReasonType: string }) => ({
          label: item.stopReasonType,
          value: item.stopReasonType
        }));
      } else {
        message.error(this.stopReasonDataJson.message || '获取退货原因失败 (来自 JSON)');
        this.attrCnts.faultModeOptions = [];
      }
      this.loading = false;
    },

    async fun_search(): Promise<void> {
      if (!this.searchFormRef) return;
      this.loading = true;
      try {
        await this.searchFormRef.validateFields();
        this.query();
        message.success('查询完成');
      } catch (errorInfo) {
        console.log('表单校验失败:', errorInfo); // 打印校验错误信息
        message.warning('请检查表单输入项！');
      } finally {
        this.loading = false;
      }
    },

    fun_reset(): void {
      if (!this.searchFormRef) return;
      this.loading = true;
      try {
        this.searchFormRef.resetFields();
        // 重置后需要手动设置默认日期，因为 resetFields 可能清空它
        this.searchForm.vDay = [dayjs('2000-01-01'), dayjs('2026-01-01')];
        // 确保 nextTick 后再查询，让表单状态更新
        nextTick(() => {
          this.query();
          message.success('重置完成');
          this.loading = false;
        });
      } catch (error) {
        console.error("重置操作失败:", error);
        message.error('重置操作失败');
        this.loading = false;
      }
    },

    // onSelect(selectedKeysValue: string[], info: any): void { // info 类型暂时设为 any
    //   this.selectedKeys = selectedKeysValue;
    //   message.info(`已选择节点: ${info.node.title}`);
    // }
  }
});
