<template>
  <!-- 整体加载状态 -->
  <a-spin :spinning="loading" tip="加载中...">
    <!-- 页面根容器 -->
    <div class="root-container">
      <!-- 布局 1: 筛选区域 -->
      <div class="layout-search">
        <!-- Ant Design Vue 全局配置 (设置中文) -->
        <a-config-provider :locale="locale">
          <!-- 筛选表单 -->
          <a-form
            ref="searchFormRef"
            :model="searchForm"
            :rules="rules"
            layout="inline"
            class="search-form-inline"
          >
            <!-- 筛选条件 Flex 容器 -->
            <div class="search-filters-flex">
              <!-- 产线选择 (TreeSelect) -->
              <a-form-item-rest>
                <a-form-item label="产线" name="plNos">
                  <a-tree-select
                    v-model:value="searchForm.plNos"
                    style="width: 180px"
                    :tree-data="treeData"
                    tree-checkable
                    allow-clear
                    placeholder="默认全部产线"
                    :field-names="treeProps"
                    :treeDefaultExpandedKeys="expandedKeys"
                    class="search-tree-select"
                  />
                </a-form-item>
              </a-form-item-rest>

              <!-- 设备号输入 (Input) -->
              <a-form-item label="设备号" name="equipmentNo">
                <a-input
                  v-model:value="searchForm.equipmentNo"
                  placeholder="请输入设备号"
                  allow-clear
                  class="search-input"
                />
              </a-form-item>
              <!-- 商品售后模式选择 (Select) -->
              <a-form-item label="商品售后模式" name="stopReasonName">
                <a-select
                  v-model:value="searchForm.stopReasonName"
                  mode="multiple"
                  placeholder="请选择故障模式"
                  :options="attrCnts.faultModeOptions"
                  allow-clear
                  class="search-select"
                />
              </a-form-item>
              <!-- 日期范围选择 (RangePicker) -->
              <a-form-item label="日期范围" name="vDay">
                <a-range-picker
                  v-model:value="searchForm.vDay"
                  :placeholder="['开始日期', '结束日期']"
                  format="YYYY/MM/DD"
                  valueFormat="YYYY/MM/DD"
                  class="search-datepicker"
                />
              </a-form-item>
              <!-- 查询与重置按钮 -->
              <div class="search-buttons">
                <a-form-item>
                  <a-button type="primary" @click="fun_search()">查询</a-button>
                  <a-button style="margin-left: 8px" @click="fun_reset()"
                    >重置</a-button
                  >
                </a-form-item>
              </div>
            </div>
          </a-form>
        </a-config-provider>
      </div>

      <!-- 布局 2: 内容区域 (列表和图表) -->
      <content-area :data-list="dataList"></content-area>

      <!-- 布局 3: 分析功能区域 -->
      <div class="layout-analysis">
        <a-card :bordered="false" class="analysis-card" size="small">
          <template #title>
            <span>分析功能</span>
          </template>
          <!-- 分析文本域 (只读) -->
          <div>
            <a-textarea
              v-model:value="analysisText"
              :rows="2"
              readonly
              :autoSize="false"
              class="analysis-textarea"
            />
          </div>
        </a-card>
      </div>
    </div>
  </a-spin>
</template>

<script lang="ts">
// --- 核心库导入 ---
import { reactive, ref, nextTick, provide, defineComponent, Ref } from "vue";
import { message, FormInstance } from "ant-design-vue";
import { Rule } from "ant-design-vue/es/form";
import * as echarts from "echarts";
import axios from "axios"; // (当前未使用)

// --- 组件与配置导入 ---
import ContentArea from "./components/ContentArea.vue"; // 内容区域子组件
import zhCN from "ant-design-vue/es/locale/zh_CN"; // Antd 中文语言包
import dayjs, { Dayjs } from "dayjs"; // 日期库
import "dayjs/locale/zh-cn"; // Dayjs 中文语言包
dayjs.locale("zh-cn"); // 设置 Dayjs 全局中文

// --- 类型定义 ---
interface TreeNode { // 产线树节点
  plname: string;
  plno: string;
  parent_plno: string | null;
  children?: TreeNode[];
  title?: string; // Antd TreeSelect 需要
  key?: string;   // Antd TreeSelect 需要
  value?: string; // Antd TreeSelect 需要
}

interface FaultModeOption { // 故障模式下拉选项
  label: string;
  value: string;
}

interface SearchForm { // 筛选表单数据结构
  plNos: string[];
  equipmentNo: string;
  stopReasonName: string[];
  vDay: [Dayjs, Dayjs] | null; // 使用 Dayjs 类型
}

interface ListItem { // 列表项数据结构
  bkReasonName: string;
  totalBreakTimeRate: string;
  totalBreakTime: number;
}

// --- 组件定义 ---
export default defineComponent({
  name: "demo05", // 组件名称
  components: {
    ContentArea, // 注册子组件
  },
  // --- 组合式 API setup ---
  setup() {
    // --- 全局注入 ---
    provide("echarts", echarts); // 向下提供 ECharts

    // --- 响应式状态 ---
    const loading: Ref<boolean> = ref(true); // 页面加载状态
    const dataFormLoading: Ref<boolean> = ref(false); // (未使用)

    // 产线树 (TreeSelect) 相关状态
    const treeProps = { title: "plname", value: "plno", children: "children", }; // 属性映射
    const treeData: Ref<TreeNode[]> = ref([]); // 树数据
    const expandedKeys: Ref<string[]> = ref([]); // 默认展开节点
    const selectedKeys: Ref<string[]> = ref([]); // (未使用)
    const treeLoading: Ref<boolean> = ref(false); // 树加载状态

    // --- 自定义表单校验器 ---
    const validateDateRange = async (_rule: any, value: [Dayjs, Dayjs] | null): Promise<void> => {
      if (!value || !Array.isArray(value) || value.length < 2 || !value[0] || !value[1]) {
        return Promise.resolve(); // 允许为空
      }
      if (dayjs(value[1]).isBefore(dayjs(value[0]))) {
        return Promise.reject("结束时间不能早于开始时间");
      }
      return Promise.resolve();
    };

    // 筛选表单 (Form) 相关状态
    const searchFormRef: Ref<FormInstance | null> = ref(null); // 表单实例
    const rules: Record<string, Rule[]> = reactive({ // 校验规则
      vDay: [{ validator: validateDateRange, trigger: "change" }],
    });

    // 内容区域 - 表格 (Table) 相关状态 (大部分移至子组件)
    const dataTableRef: Ref<any> = ref(null); // (未使用)
    const selectionRows: Ref<any[]> = ref([]); // (未使用)
    const currentRow: Ref<Record<string, any>> = ref({}); // (未使用)

    // 内容区域 - 分页 (Pagination) 相关状态 (未使用)
    const dataTableHeight: Ref<number> = ref(window.innerHeight - 176);
    const pageSizes: Ref<number[]> = ref([15, 25, 35, 50, 100]);
    const pageSize: Ref<number> = ref(15);
    const currentPage: Ref<number> = ref(1);
    const dataTotal: Ref<number> = ref(0);

    // 弹窗表单 (Modal Form) 相关状态 (未使用)
    const dataFormRef: Ref<FormInstance | null> = ref(null);
    const dataFormTitle: Ref<string> = ref("详情");
    const dataFormVisible: Ref<boolean> = ref(false);
    const dataFormStatus: Ref<string> = ref("");

    // --- setup 返回 ---
    return {
      loading, dataFormLoading, treeProps, treeData, expandedKeys, selectedKeys, treeLoading,
      rules, searchFormRef, dataTableRef, selectionRows, currentRow, dataTableHeight,
      pageSizes, pageSize, currentPage, dataTotal, dataFormRef, dataFormTitle,
      dataFormVisible, dataFormStatus, dayjs, locale: zhCN, // 返回 dayjs 实例和中文配置
    };
  },

  // --- 选项式 API data ---
  data(): {
    wsUrl: string; // (未使用)
    attrCnts: { yesOrNo: string[]; faultModeOptions: FaultModeOption[]; }; // 属性容器 (下拉选项等)
    searchForm: SearchForm; // 筛选表单数据模型
    dataList: ListItem[]; // 列表数据 (传递给子组件)
    dateLength: any[]; // (未使用)
    dataForm: Record<string, any>; // (未使用)
    analysisText: string; // 分析文本
    // --- 模拟 API 数据 ---
    listDataJson: any;
    treeDataJson: any;
    stopReasonDataJson: any;
  } {
    return {
      wsUrl: "http://localhost:9994/pisces-boot", // (未使用)
      attrCnts: { // 初始化属性容器
        yesOrNo: ["是", "否"], // (未使用)
        faultModeOptions: [], // 故障模式下拉选项
      },
      searchForm: { // 初始化筛选表单
        plNos: [],
        equipmentNo: "",
        stopReasonName: [],
        vDay: [dayjs("2000-01-01"), dayjs("2026-01-01")], // 默认日期范围
      },
      dataList: [], // 初始化列表数据
      dateLength: [], // (未使用)
      dataForm: {}, // (未使用)
      analysisText: "演示订单售后记录001", // 初始化分析文本
      // --- 模拟数据区 ---
      listDataJson: { success: true, message: "", code: 200, result: [ { bkReasonName: "其他", totalBreakTimeRate: "27.66%", totalBreakTime: 3596, }, { bkReasonName: "设计机构，构造有问题", totalBreakTimeRate: "19.58%", totalBreakTime: 2545, }, { bkReasonName: "点检方法，判定基准有问题", totalBreakTimeRate: "8.54%", totalBreakTime: 1110, }, { bkReasonName: "修理，维护方法有问题", totalBreakTimeRate: "7.38%", totalBreakTime: 960, }, { bkReasonName: "自然劣化(预测困难)", totalBreakTimeRate: "7.04%", totalBreakTime: 915, }, { bkReasonName: "材质缺陷(质量，热处理，表面处理)", totalBreakTimeRate: "7.02%", totalBreakTime: 913, }, { bkReasonName: "点检周期有问题", totalBreakTimeRate: "3.50%", totalBreakTime: 455, }, { bkReasonName: "修理维护周期不适当", totalBreakTimeRate: "3.18%", totalBreakTime: 413, }, { bkReasonName: "机种，型式选定有问题", totalBreakTimeRate: "2.64%", totalBreakTime: 343, }, { bkReasonName: "运转操作技能，知识不足", totalBreakTimeRate: "1.84%", totalBreakTime: 239, }, { bkReasonName: "异物侵入", totalBreakTimeRate: "1.48%", totalBreakTime: 193, }, { bkReasonName: "尺寸，强度，容量有问题", totalBreakTimeRate: "1.24%", totalBreakTime: 161, }, { bkReasonName: "组装，配合施工技术差", totalBreakTimeRate: "1.18%", totalBreakTime: 154, }, { bkReasonName: "松动松弛", totalBreakTimeRate: "1.08%", totalBreakTime: 140, }, { bkReasonName: "组装，配合方法上有问题", totalBreakTimeRate: "1.05%", totalBreakTime: 137, }, { bkReasonName: "疲劳损伤", totalBreakTimeRate: "0.96%", totalBreakTime: 125, }, { bkReasonName: "油质劣化", totalBreakTimeRate: "0.91%", totalBreakTime: 118, }, { bkReasonName: "异常振动", totalBreakTimeRate: "0.74%", totalBreakTime: 96, }, { bkReasonName: "配合加工有问题", totalBreakTimeRate: "0.69%", totalBreakTime: 90, }, { bkReasonName: "异物混入", totalBreakTimeRate: "0.68%", totalBreakTime: 88, }, { bkReasonName: "规格不符", totalBreakTimeRate: "0.46%", totalBreakTime: 60, }, { bkReasonName: "异常温度", totalBreakTimeRate: "0.38%", totalBreakTime: 50, }, { bkReasonName: "安装，拆卸方法上有问题", totalBreakTimeRate: "0.23%", totalBreakTime: 30, }, { bkReasonName: "机械剥离", totalBreakTimeRate: "0.22%", totalBreakTime: 29, }, { bkReasonName: "误运转操作", totalBreakTimeRate: "0.19%", totalBreakTime: 25, }, { bkReasonName: "温度(在计划设计时不能预测)", totalBreakTimeRate: "0.12%", totalBreakTime: 15, }, ], timestamp: 1745118762285, },
      treeDataJson: { success: true, message: "", code: 200, result: [ { parent_plno: null, plname: "根节点", children: [ { parent_plno: "A1", plname: "电商物流中心", children: [ { parent_plno: "W1", plname: "电商物流中心-商品分组01", plno: "W101", }, ], plno: "W1", }, { parent_plno: "A1", plname: "商品运营中心", children: [ { parent_plno: "W2", plname: "商品运营中心-商品分组01", plno: "W201", }, { parent_plno: "W2", plname: "商品运营中心-商品分组02", plno: "W202", }, { parent_plno: "W2", plname: "商品运营中心-商品分组03", plno: "W203", }, { parent_plno: "W2", plname: "商品运营中心-商品分组04", plno: "W204", }, { parent_plno: "W2", plname: "商品运营中心-商品分组05", plno: "W205", }, { parent_plno: "W2", plname: "商品运营中心-商品分组06", plno: "W206", }, ], plno: "W2", }, { parent_plno: "A1", plname: "自营店铺", children: [ { parent_plno: "W3", plname: "自营店铺-商品分组01", plno: "W301" }, { parent_plno: "W3", plname: "自营店铺-商品分组02", plno: "W302" }, { parent_plno: "W3", plname: "自营店铺-商品分组03", plno: "W303" }, { parent_plno: "W3", plname: "自营店铺-商品分组04", plno: "W304" }, { parent_plno: "W3", plname: "自营店铺-商品分组05", plno: "W305", }, ], plno: "W3", }, { parent_plno: "A1", plname: "数码旗舰店", children: [ { parent_plno: "W4", plname: "数码旗舰店-商品分组01", plno: "W401", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组02", plno: "W402", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组03", plno: "W403", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组04", plno: "W404", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组05", plno: "W405", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组06", plno: "W406", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组07", plno: "W407", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组08", plno: "W408", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组09", plno: "W409", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组10", plno: "W410", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组11", plno: "W411", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组12", plno: "W412", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组13", plno: "W413", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组14", plno: "W414", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组15", plno: "W415", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组16", plno: "W416", }, { parent_plno: "W4", plname: "数码旗舰店-商品分组17", plno: "W417", }, ], plno: "W4", }, { parent_plno: "A1", plname: "客户服务中心", children: [ { parent_plno: "W5", plname: "客户服务中心-商品分组01", plno: "W503", }, { parent_plno: "W5", plname: "客户服务中心-商品分组02", plno: "W504", }, { parent_plno: "W5", plname: "客户服务中心-商品分组03", plno: "W505", }, { parent_plno: "W5", plname: "客户服务中心-商品分组04", plno: "W506", }, { parent_plno: "W5", plname: "客户服务中心-商品分组05", plno: "W507", }, { parent_plno: "W5", plname: "客户服务中心-商品分组06", plno: "W508", }, { parent_plno: "W5", plname: "客户服务中心-商品分组07", plno: "W509", }, { parent_plno: "W5", plname: "客户服务中心-商品分组08", plno: "W510", }, { parent_plno: "W5", plname: "客户服务中心-商品分组09", plno: "W511", }, { parent_plno: "W5", plname: "客户服务中心-商品分组10", plno: "W512", }, { parent_plno: "W5", plname: "客户服务中心-商品分组11", plno: "W513", }, { parent_plno: "W5", plname: "客户服务中心-商品分组12", plno: "W514", }, { parent_plno: "W5", plname: "客户服务中心-商品分组13", plno: "W515", }, ], plno: "W5", }, { parent_plno: "A1", plname: "家居旗舰店", children: [ { parent_plno: "W8", plname: "家居旗舰店-商品分组01", plno: "W801", }, { parent_plno: "W8", plname: "家居旗舰店-商品分组02", plno: "W802", }, { parent_plno: "W8", plname: "家居旗舰店-商品分组03", plno: "W803", }, { parent_plno: "W8", plname: "家居旗舰店-商品分组04", plno: "W804", }, { parent_plno: "W8", plname: "家居旗舰店-商品分组05", plno: "W805", }, { parent_plno: "W8", plname: "家居旗舰店-商品分组06", plno: "W806", }, { parent_plno: "W8", plname: "家居旗舰店-商品分组07", plno: "W807", }, ], plno: "W8", }, { parent_plno: "A1", plname: "美妆旗舰店", children: [ { parent_plno: "W9", plname: "美妆旗舰店-商品分组01", plno: "W901", }, { parent_plno: "W9", plname: "美妆旗舰店-商品分组02", plno: "W902", }, { parent_plno: "W9", plname: "美妆旗舰店-商品分组03", plno: "W903", }, { parent_plno: "W9", plname: "美妆旗舰店-商品分组04", plno: "W904", }, { parent_plno: "W9", plname: "美妆旗舰店-商品分组05", plno: "W905", }, { parent_plno: "W9", plname: "美妆旗舰店-商品分组06", plno: "W906", }, { parent_plno: "W9", plname: "美妆旗舰店-商品分组07", plno: "W907" }, ], plno: "W9", }, { parent_plno: "A1", plname: "户外旗舰店", children: [ { parent_plno: "WA", plname: "户外旗舰店-商品分组01", plno: "WA01", }, { parent_plno: "WA", plname: "户外旗舰店-商品分组02", plno: "WA02", }, { parent_plno: "WA", plname: "户外旗舰店-商品分组03", plno: "WA03", }, { parent_plno: "WA", plname: "户外旗舰店-商品分组04", plno: "WA04", }, { parent_plno: "WA", plname: "户外旗舰店-商品分组05", plno: "WA05", }, ], plno: "WA", }, { parent_plno: "A1", plname: "服饰旗舰店", children: [ { parent_plno: "Y2", plname: "服饰旗舰店-商品分组01", plno: "Y201", }, { parent_plno: "Y2", plname: "服饰旗舰店-商品分组02", plno: "Y202", }, { parent_plno: "Y2", plname: "服饰旗舰店-商品分组03", plno: "Y203", }, ], plno: "Y2", }, { parent_plno: "A1", plname: "运动旗舰店", children: [ { parent_plno: "Y3", plname: "运动旗舰店-商品分组01", plno: "Y301", }, { parent_plno: "Y3", plname: "运动旗舰店-商品分组02", plno: "Y302", }, { parent_plno: "Y3", plname: "运动旗舰店-商品分组03", plno: "Y303", }, ], plno: "Y3", }, { parent_plno: "A1", plname: "母婴旗舰店", children: null, plno: "Y4", }, { parent_plno: "A1", plname: "食品旗舰店", children: null, plno: "Y5", }, { parent_plno: "A1", plname: "图书旗舰店", children: [ { parent_plno: "Y8", plname: "图书旗舰店-商品分组01", plno: "Y801" }, { parent_plno: "Y8", plname: "图书旗舰店-商品分组02", plno: "Y802", }, { parent_plno: "Y8", plname: "图书旗舰店-商品分组03", plno: "Y803", }, { parent_plno: "Y8", plname: "图书旗舰店-商品分组04", plno: "Y804", }, { parent_plno: "Y8", plname: "图书旗舰店-商品分组05", plno: "Y805" }, { parent_plno: "Y8", plname: "图书旗舰店-商品分组06", plno: "Y806" }, { parent_plno: "Y8", plname: "图书旗舰店-商品分组07", plno: "Y807" }, { parent_plno: "Y8", plname: "图书旗舰店-商品分组08", plno: "Y808" }, ], plno: "Y8", }, ], plno: "A1", }, ], timestamp: 1745118762247, },
      stopReasonDataJson: { success: true, message: "", code: 200, result: [ { stopReasonType: "设备原因" }, { stopReasonType: "维修原因" }, { stopReasonType: "管理原因" }, { stopReasonType: "操作原因" }, { stopReasonType: "其他原因" }, ], timestamp: 1745118762197, },
    };
  },

  // --- 生命周期钩子 ---
  mounted() {
    // 组件挂载后初始化数据
    this.query();
    this.queryTree();
    this.queryStopReasonType();
  },

  // --- 方法 ---
  methods: {
    /**
     * 查询列表数据 (模拟)
     */
    query(): void {
      this.loading = true;
      if (this.listDataJson.success) {
        // 按占比降序排序
        const sortedData = this.listDataJson.result.sort(
          (a: ListItem, b: ListItem) => {
            const valueA = parseFloat(String(a.totalBreakTimeRate || "0").replace("%", ""));
            const valueB = parseFloat(String(b.totalBreakTimeRate || "0").replace("%", ""));
            return valueB - valueA;
          }
        );
        this.dataList = sortedData;
      } else {
        message.error(this.listDataJson.message || "获取列表数据失败 (模拟)");
      }
      this.loading = false;
    },

    /**
     * 查询产线树数据 (模拟)
     */
    queryTree(): void {
      this.loading = true;
      if (this.treeDataJson.success) {
        // 递归处理节点，添加 Antd TreeSelect 需要的属性
        const processNode = (node: TreeNode): void => {
          node.title = node.plname;
          node.key = node.plno;
          node.value = node.plno;
          if (node.children && node.children.length > 0) {
            node.children.forEach(processNode);
          } else {
            node.children = undefined; // Antd 需要无子节点时为 undefined
          }
        };
        const rootObject = this.treeDataJson.result[0];
        if (rootObject && rootObject.children) {
          rootObject.children.forEach(processNode);
          this.treeData = rootObject.children;
          // 默认展开第一个一级节点
          if (this.treeData.length > 0 && this.treeData[0].key) {
            this.expandedKeys = [this.treeData[0].key];
          }
        } else {
          this.treeData = [];
        }
      } else {
        message.error(this.treeDataJson.message || "获取树形列表失败 (模拟)");
        this.treeData = [];
      }
      this.loading = false;
    },

    /**
     * 查询故障模式下拉选项 (模拟)
     */
    queryStopReasonType(): void {
      this.loading = true;
      if (this.stopReasonDataJson.success) {
        // 转换数据格式为 Antd Select 需要的格式
        this.attrCnts.faultModeOptions = this.stopReasonDataJson.result.map(
          (item: { stopReasonType: string }) => ({
            label: item.stopReasonType,
            value: item.stopReasonType,
          })
        );
      } else {
        message.error(this.stopReasonDataJson.message || "获取故障模式失败 (模拟)");
        this.attrCnts.faultModeOptions = [];
      }
      this.loading = false;
    },

    /**
     * 查询按钮点击处理
     */
    async fun_search(): Promise<void> {
      if (!this.searchFormRef) return;
      this.loading = true;
      try {
        await this.searchFormRef.validateFields(); // 触发表单校验
        this.query(); // 校验通过则查询
        message.success("查询完成");
      } catch (errorInfo) {
        console.log("表单校验失败:", errorInfo);
        message.warning("请检查表单输入项！");
      } finally {
        this.loading = false;
      }
    },

    /**
     * 重置按钮点击处理
     */
    fun_reset(): void {
      if (!this.searchFormRef) return;
      this.loading = true;
      try {
        this.searchFormRef.resetFields(); // 重置表单
        this.searchForm.vDay = [dayjs("2000-01-01"), dayjs("2026-01-01")]; // 手动重置日期
        nextTick(() => { // 确保 DOM 更新后再查询
          this.query();
          message.success("重置完成");
          this.loading = false;
        });
      } catch (error) {
        console.error("重置操作失败:", error);
        message.error("重置操作失败");
        this.loading = false;
      }
    },
  },
});
</script>
<style scoped lang="less">
/* --- 页面整体容器 --- */
.root-container {
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
  overflow-x: hidden;
  font-size: 14px;

  /* --- 通用 Ant Design 卡片样式覆盖 --- */
  :deep(.ant-card-head) {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
    font-size: 14px;
    font-weight: bold;
    min-height: auto;
  }
  :deep(.ant-card-head-title) { padding: 0; }
  :deep(.ant-card-body) { padding: 20px; }
}

/* --- 布局 1: 筛选区域 --- */
.layout-search {
  margin-bottom: 15px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  /* 筛选条件 Flex 容器 */
  .search-filters-flex {
    display: flex;
    flex-wrap: wrap; // 自动换行
    align-items: flex-start; // 顶部对齐
    gap: 15px 20px; // 行列间距

    .ant-form-item {
      margin-bottom: 0; // 移除默认下边距
      flex-grow: 0;
      flex-shrink: 0;
    }
  }

  /* --- 特定筛选控件宽度 --- */
  .search-tree-select {
    width: 240px;
    /* TreeSelect 多选样式修复 */
    :deep(.ant-select-selector) { max-height: 70px; overflow-y: auto; }
    :deep(.ant-select-selection-item) { margin-top: 1px; margin-bottom: 1px; line-height: normal; }
  }
  .search-input, .search-select { width: 220px; }
  .search-datepicker { width: 280px !important; } // 使用 !important 强制宽度

  /* 查询/重置按钮容器 */
  .search-buttons {
    .ant-form-item { margin-bottom: 0; }
  }
}

/* --- TreeSelect 下拉树样式调整 (全局但受限) --- */
:deep(.ant-select-tree-node-content-wrapper) { display: flex !important; align-items: center !important; }
:deep(.ant-select-tree-checkbox) { margin-right: 4px !important; flex-shrink: 0 !important; }
:deep(.ant-select-tree-title) { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; flex-grow: 1 !important; }

/* --- 布局 2: 内容区域 --- */
.layout-content { margin-bottom: 15px; }

/* 左右卡片通用样式 */
.list-card, .chart-card {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 左侧表格单元格省略提示 */
.table-cell-tooltip {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: bottom;
}

/* 右侧图表容器 */
.chart-container { width: 100%; height: 515px; }

/* --- 布局 3: 分析功能区域 --- */
.analysis-card {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 分析文本域样式 (模拟静态文本) */
.analysis-textarea {
  border: none;
  resize: none;
  background-color: transparent;
  padding: 5px 0;
  box-shadow: none;
  cursor: default;
  color: #606266;
  font-size: inherit;
}

/* --- 响应式布局 --- */
@media screen and (max-width: 1366px) { // 窄屏调整
  .root-container { padding: 12px; }
  .layout-search { padding: 12px; .search-filters-flex { gap: 12px; } }
}

@media screen and (max-width: 768px) { // 移动端调整
  .layout-search {
    .search-filters-flex { flex-direction: column; align-items: stretch; } // 垂直排列
    .search-tree-select, .search-input, .search-select, .search-datepicker { width: 100%; } // 宽度占满
    .search-buttons { width: 100%; display: flex; justify-content: flex-end; } // 按钮右对齐
  }
  .layout-content { // 内容区左右卡片垂直排列
    .ant-row > .ant-col {
      flex: 1 1 100%; max-width: 100%; margin-bottom: 16px;
      &:last-child { margin-bottom: 0; }
    }
  }
}
</style>
