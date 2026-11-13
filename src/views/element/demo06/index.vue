<template>
  <div v-loading.lock="loading" class="root-container">
    <!-- 布局 1: 筛选区域 -->
    <div class="layout-search">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :rules="searchFormRules"
        :inline="true"
      >
        <!-- 条件容器 -->
        <div class="search-filters">
          <!-- 商品分类选择 -->
          <el-form-item label="商品分类" prop="plNoKey">
            <el-tree-select
              v-model="searchForm.plNoKey"
              :props="treeProps"
              :data="treeData"
              check-strictly
              :render-after-expand="false"
              placeholder="默认全部商品分类"
              class="search-tree-select"
              value-key="key"
              multiple
              clearable
            />
          </el-form-item>
          <!-- 商品编号输入 -->
          <el-form-item label="商品编号" prop="equipmentNo">
            <el-input
              v-model="searchForm.equipmentNo"
              placeholder="请输入商品编号"
              clearable
              class="search-input"
            ></el-input>
          </el-form-item>
          <!-- 商品售后模式选择 -->
          <el-form-item label="商品售后模式" prop="stopReasonName">
            <el-select
              v-model="searchForm.stopReasonName"
              placeholder="请选择退货原因"
              multiple
              clearable
              class="search-select"
            >
              <el-option
                v-for="item in attrCnts.faultModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <!-- 日期范围选择 -->
          <el-form-item label="日期范围" prop="vDay">
            <el-date-picker
              v-model="searchForm.vDay"
              type="daterange"
              start-placeholder="开始日期"
              range-separator="至"
              end-placeholder="结束日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              class="search-datepicker"
            >
            </el-date-picker>
          </el-form-item>
          <!-- 查询与重置按钮 -->
          <div class="search-buttons">
            <el-form-item>
              <el-button type="primary" @click="fun_search(searchFormRef)"
                >查询</el-button
              >
              <el-button @click="fun_reset(searchFormRef)">重置</el-button>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 布局 2: 内容区域 (使用子组件展示列表和图表) -->
    <content-area :data-list="dataList"></content-area>

    <!-- 布局 3: 分析功能区域 -->
    <div class="layout-analysis">
      <el-card class="analysis-card">
        <template #header>
          <div>
            <span>分析功能</span>
          </div>
        </template>
        <div>
          <el-input
            type="textarea"
            v-model="analysisText"
            :rows="3"
            readonly
            resize="none"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, Ref } from "vue";
import {
  ElMessage,
  ElForm,
  ElTreeSelect,
  FormInstance,
  FormRules,
} from "element-plus";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import ContentArea, { FaultModeItem } from "./components/ContentArea.vue"; // 导入子组件及类型

dayjs.locale("zh-cn"); // 设置 Dayjs 全局中文

// --- 类型定义 ---
interface PlTreeNode {
  parent_plno: string | null;
  plname: string;
  plno: string;
  key?: string;
  isLeaf?: boolean;
  children?: PlTreeNode[] | null;
}

interface FaultModeOption {
  label: string;
  value: string;
}

interface SearchForm {
  plNoKey: string[];
  equipmentNo: string;
  stopReasonName: string[];
  vDay: [string, string];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: number;
  result: T;
  timestamp: number;
}

type ListDataResult = FaultModeItem[];
type TreeDataResult = PlTreeNode[];
interface StopReasonTypeItem {
  stopReasonType: string;
}
type StopReasonDataResult = StopReasonTypeItem[];

// --- 组件定义 ---
export default defineComponent({
  name: "demo05", // 组件名称
  components: {
    ContentArea, // 注册子组件
  },
  // --- Composition API setup ---
  setup() {
    const loading: Ref<boolean> = ref(true); // 页面加载状态

    // 商品分类树配置
    const treeProps = {
      label: "plname",
      children: "children",
    };
    const treeData: Ref<PlTreeNode[]> = ref([]); // 商品分类树数据

    // 筛选表单
    const searchFormRef: Ref<FormInstance | null> = ref(null); // 表单实例
    const searchFormRules = reactive<FormRules>({
      // 表单规则
      vDay: [
        {
          type: "array",
          required: true,
          message: "请选择日期范围",
          trigger: "change",
        },
      ],
    });

    // 返回 setup 数据供模板使用
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
    attrCnts: { faultModeOptions: FaultModeOption[] }; // 下拉选项等属性容器
    searchForm: SearchForm; // 筛选表单数据
    dataList: FaultModeItem[]; // 列表数据 (传递给子组件)
    analysisText: string; // 分析文本
    // --- 模拟 API 数据 ---
    listData: ApiResponse<ListDataResult>;
    treeDataJson: ApiResponse<TreeDataResult>;
    stopReasonData: ApiResponse<StopReasonDataResult>;
  } {
    return {
      attrCnts: { faultModeOptions: [] }, // 初始化下拉选项
      searchForm: {
        // 初始化筛选表单
        plNoKey: [],
        equipmentNo: "",
        stopReasonName: [],
        vDay: ["2000-01-01", "2026-01-01"], // 默认日期
      },
      dataList: [], // 初始化列表
      analysisText:
        "演示订单售后记录001", // 初始化分析文本
      // --- 模拟数据区 ---
      listData: {
        success: true,
        message: "",
        code: 200,
        result: [
          {
            bkReasonName: "其他",
            totalBreakTimeRate: "27.66%",
            totalBreakTime: 3596,
          },
          {
            bkReasonName: "商品规格与描述不符",
            totalBreakTimeRate: "19.58%",
            totalBreakTime: 2545,
          },
          {
            bkReasonName: "商品颜色与描述不符",
            totalBreakTimeRate: "8.54%",
            totalBreakTime: 1110,
          },
          {
            bkReasonName: "商品尺寸不合适",
            totalBreakTimeRate: "7.38%",
            totalBreakTime: 960,
          },
          {
            bkReasonName: "商品质量问题",
            totalBreakTimeRate: "7.04%",
            totalBreakTime: 915,
          },
          {
            bkReasonName: "商品数量不足",
            totalBreakTimeRate: "7.02%",
            totalBreakTime: 913,
          },
          {
            bkReasonName: "商品配件缺失",
            totalBreakTimeRate: "3.50%",
            totalBreakTime: 455,
          },
          {
            bkReasonName: "商品外观破损",
            totalBreakTimeRate: "3.18%",
            totalBreakTime: 413,
          },
          {
            bkReasonName: "商品包装破损",
            totalBreakTimeRate: "2.64%",
            totalBreakTime: 343,
          },
          {
            bkReasonName: "错发商品",
            totalBreakTimeRate: "1.84%",
            totalBreakTime: 239,
          },
          {
            bkReasonName: "重复购买",
            totalBreakTimeRate: "1.48%",
            totalBreakTime: 193,
          },
          {
            bkReasonName: "不再需要",
            totalBreakTimeRate: "1.24%",
            totalBreakTime: 161,
          },
          {
            bkReasonName: "物流配送延误",
            totalBreakTimeRate: "1.18%",
            totalBreakTime: 154,
          },
          {
            bkReasonName: "签收后发现缺件",
            totalBreakTimeRate: "1.08%",
            totalBreakTime: 140,
          },
          {
            bkReasonName: "商品保质期不足",
            totalBreakTimeRate: "1.05%",
            totalBreakTime: 137,
          },
          {
            bkReasonName: "商品型号不匹配",
            totalBreakTimeRate: "0.96%",
            totalBreakTime: 125,
          },
          {
            bkReasonName: "商品临期",
            totalBreakTimeRate: "0.91%",
            totalBreakTime: 118,
          },
          {
            bkReasonName: "商品价格变动",
            totalBreakTimeRate: "0.74%",
            totalBreakTime: 96,
          },
          {
            bkReasonName: "优惠未正确抵扣",
            totalBreakTimeRate: "0.69%",
            totalBreakTime: 90,
          },
          {
            bkReasonName: "订单重复扣款",
            totalBreakTimeRate: "0.68%",
            totalBreakTime: 88,
          },
          {
            bkReasonName: "订单地址填写错误",
            totalBreakTimeRate: "0.46%",
            totalBreakTime: 60,
          },
          {
            bkReasonName: "冷链温控异常",
            totalBreakTimeRate: "0.38%",
            totalBreakTime: 50,
          },
          {
            bkReasonName: "预售交付延期",
            totalBreakTimeRate: "0.23%",
            totalBreakTime: 30,
          },
          {
            bkReasonName: "组合商品缺货",
            totalBreakTimeRate: "0.22%",
            totalBreakTime: 29,
          },
          {
            bkReasonName: "商品标签信息错误",
            totalBreakTimeRate: "0.19%",
            totalBreakTime: 25,
          },
          {
            bkReasonName: "商品功能与介绍不符",
            totalBreakTimeRate: "0.12%",
            totalBreakTime: 15,
          },
        ],
        timestamp: 1745118762285,
      },
      treeDataJson: {
        success: true,
        message: "",
        code: 200,
        result: [
          {
            parent_plno: null,
            plname: "根节点",
            children: [
              {
                parent_plno: "A1",
                plname: "电商物流中心",
                children: [
                  {
                    parent_plno: "W1",
                    plname: "电商物流中心-商品分组01",
                    plno: "W101",
                  },
                ],
                plno: "W1",
              },
              {
                parent_plno: "A1",
                plname: "商品运营中心",
                children: [
                  {
                    parent_plno: "W2",
                    plname: "商品运营中心-商品分组01",
                    plno: "W201",
                  },
                  {
                    parent_plno: "W2",
                    plname: "商品运营中心-商品分组02",
                    plno: "W202",
                  },
                  {
                    parent_plno: "W2",
                    plname: "商品运营中心-商品分组03",
                    plno: "W203",
                  },
                  {
                    parent_plno: "W2",
                    plname: "商品运营中心-商品分组04",
                    plno: "W204",
                  },
                  {
                    parent_plno: "W2",
                    plname: "商品运营中心-商品分组05",
                    plno: "W205",
                  },
                  {
                    parent_plno: "W2",
                    plname: "商品运营中心-商品分组06",
                    plno: "W206",
                  },
                ],
                plno: "W2",
              },
              {
                parent_plno: "A1",
                plname: "自营店铺",
                children: [
                  { parent_plno: "W3", plname: "自营店铺-商品分组01", plno: "W301" },
                  { parent_plno: "W3", plname: "自营店铺-商品分组02", plno: "W302" },
                  { parent_plno: "W3", plname: "自营店铺-商品分组03", plno: "W303" },
                  { parent_plno: "W3", plname: "自营店铺-商品分组04", plno: "W304" },
                  {
                    parent_plno: "W3",
                    plname: "自营店铺-商品分组05",
                    plno: "W305",
                  },
                ],
                plno: "W3",
              },
              {
                parent_plno: "A1",
                plname: "数码旗舰店",
                children: [
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组01",
                    plno: "W401",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组02",
                    plno: "W402",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组03",
                    plno: "W403",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组04",
                    plno: "W404",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组05",
                    plno: "W405",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组06",
                    plno: "W406",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组07",
                    plno: "W407",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组08",
                    plno: "W408",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组09",
                    plno: "W409",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组10",
                    plno: "W410",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组11",
                    plno: "W411",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组12",
                    plno: "W412",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组13",
                    plno: "W413",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组14",
                    plno: "W414",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组15",
                    plno: "W415",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组16",
                    plno: "W416",
                  },
                  {
                    parent_plno: "W4",
                    plname: "数码旗舰店-商品分组17",
                    plno: "W417",
                  },
                ],
                plno: "W4",
              },
              {
                parent_plno: "A1",
                plname: "客户服务中心",
                children: [
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组01",
                    plno: "W503",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组02",
                    plno: "W504",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组03",
                    plno: "W505",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组04",
                    plno: "W506",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组05",
                    plno: "W507",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组06",
                    plno: "W508",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组07",
                    plno: "W509",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组08",
                    plno: "W510",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组09",
                    plno: "W511",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组10",
                    plno: "W512",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组11",
                    plno: "W513",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组12",
                    plno: "W514",
                  },
                  {
                    parent_plno: "W5",
                    plname: "客户服务中心-商品分组13",
                    plno: "W515",
                  },
                ],
                plno: "W5",
              },
              {
                parent_plno: "A1",
                plname: "家居旗舰店",
                children: [
                  {
                    parent_plno: "W8",
                    plname: "家居旗舰店-商品分组01",
                    plno: "W801",
                  },
                  {
                    parent_plno: "W8",
                    plname: "家居旗舰店-商品分组02",
                    plno: "W802",
                  },
                  {
                    parent_plno: "W8",
                    plname: "家居旗舰店-商品分组03",
                    plno: "W803",
                  },
                  {
                    parent_plno: "W8",
                    plname: "家居旗舰店-商品分组04",
                    plno: "W804",
                  },
                  {
                    parent_plno: "W8",
                    plname: "家居旗舰店-商品分组05",
                    plno: "W805",
                  },
                  {
                    parent_plno: "W8",
                    plname: "家居旗舰店-商品分组06",
                    plno: "W806",
                  },
                  {
                    parent_plno: "W8",
                    plname: "家居旗舰店-商品分组07",
                    plno: "W807",
                  },
                ],
                plno: "W8",
              },
              {
                parent_plno: "A1",
                plname: "美妆旗舰店",
                children: [
                  {
                    parent_plno: "W9",
                    plname: "美妆旗舰店-商品分组01",
                    plno: "W901",
                  },
                  {
                    parent_plno: "W9",
                    plname: "美妆旗舰店-商品分组02",
                    plno: "W902",
                  },
                  {
                    parent_plno: "W9",
                    plname: "美妆旗舰店-商品分组03",
                    plno: "W903",
                  },
                  {
                    parent_plno: "W9",
                    plname: "美妆旗舰店-商品分组04",
                    plno: "W904",
                  },
                  {
                    parent_plno: "W9",
                    plname: "美妆旗舰店-商品分组05",
                    plno: "W905",
                  },
                  {
                    parent_plno: "W9",
                    plname: "美妆旗舰店-商品分组06",
                    plno: "W906",
                  },
                  { parent_plno: "W9", plname: "美妆旗舰店-商品分组07", plno: "W907" },
                ],
                plno: "W9",
              },
              {
                parent_plno: "A1",
                plname: "户外旗舰店",
                children: [
                  {
                    parent_plno: "WA",
                    plname: "户外旗舰店-商品分组01",
                    plno: "WA01",
                  },
                  {
                    parent_plno: "WA",
                    plname: "户外旗舰店-商品分组02",
                    plno: "WA02",
                  },
                  {
                    parent_plno: "WA",
                    plname: "户外旗舰店-商品分组03",
                    plno: "WA03",
                  },
                  {
                    parent_plno: "WA",
                    plname: "户外旗舰店-商品分组04",
                    plno: "WA04",
                  },
                  {
                    parent_plno: "WA",
                    plname: "户外旗舰店-商品分组05",
                    plno: "WA05",
                  },
                ],
                plno: "WA",
              },
              {
                parent_plno: "A1",
                plname: "服饰旗舰店",
                children: [
                  {
                    parent_plno: "Y2",
                    plname: "服饰旗舰店-商品分组01",
                    plno: "Y201",
                  },
                  {
                    parent_plno: "Y2",
                    plname: "服饰旗舰店-商品分组02",
                    plno: "Y202",
                  },
                  {
                    parent_plno: "Y2",
                    plname: "服饰旗舰店-商品分组03",
                    plno: "Y203",
                  },
                ],
                plno: "Y2",
              },
              {
                parent_plno: "A1",
                plname: "运动旗舰店",
                children: [
                  {
                    parent_plno: "Y3",
                    plname: "运动旗舰店-商品分组01",
                    plno: "Y301",
                  },
                  {
                    parent_plno: "Y3",
                    plname: "运动旗舰店-商品分组02",
                    plno: "Y302",
                  },
                  {
                    parent_plno: "Y3",
                    plname: "运动旗舰店-商品分组03",
                    plno: "Y303",
                  },
                ],
                plno: "Y3",
              },
              {
                parent_plno: "A1",
                plname: "母婴旗舰店",
                children: null,
                plno: "Y4",
              },
              {
                parent_plno: "A1",
                plname: "食品旗舰店",
                children: null,
                plno: "Y5",
              },
              {
                parent_plno: "A1",
                plname: "图书旗舰店",
                children: [
                  { parent_plno: "Y8", plname: "图书旗舰店-商品分组01", plno: "Y801" },
                  {
                    parent_plno: "Y8",
                    plname: "图书旗舰店-商品分组02",
                    plno: "Y802",
                  },
                  {
                    parent_plno: "Y8",
                    plname: "图书旗舰店-商品分组03",
                    plno: "Y803",
                  },
                  {
                    parent_plno: "Y8",
                    plname: "图书旗舰店-商品分组04",
                    plno: "Y804",
                  },
                  { parent_plno: "Y8", plname: "图书旗舰店-商品分组05", plno: "Y805" },
                  { parent_plno: "Y8", plname: "图书旗舰店-商品分组06", plno: "Y806" },
                  { parent_plno: "Y8", plname: "图书旗舰店-商品分组07", plno: "Y807" },
                  { parent_plno: "Y8", plname: "图书旗舰店-商品分组08", plno: "Y808" },
                ],
                plno: "Y8",
              },
            ],
            plno: "A1",
          },
        ],
        timestamp: 1745118762288,
      },
      stopReasonData: {
        success: true,
        message: "",
        code: 200,
        result: [
          { stopReasonType: "质量原因" },
          { stopReasonType: "商品描述问题" },
          { stopReasonType: "售后处理原因" },
          { stopReasonType: "订单管理问题" },
          { stopReasonType: "订单操作问题" },
          { stopReasonType: "其他原因" },
        ],
        timestamp: 1745118762197,
      },
    };
  },
  // --- 生命周期钩子 ---
  mounted() {
    // 组件挂载后初始化数据
    this.query();
    this.queryTree();
    this.queryStopReasonType();
  },
  // --- 方法定义 ---
  methods: {
    /**
     * 查询退货原因列表 (模拟)
     */
    query(): void {
      this.loading = true;
      if (this.listData.success) {
        // 按占比降序排序
        const sortedData = [...this.listData.result].sort((a, b) => {
          const valueA = parseFloat(
            String(a.totalBreakTimeRate || "0").replace("%", "")
          );
          const valueB = parseFloat(
            String(b.totalBreakTimeRate || "0").replace("%", "")
          );
          return valueB - valueA;
        });
        this.dataList = sortedData;
      } else {
        ElMessage.error(this.listData.message || "获取列表数据失败 (模拟)");
      }
      this.loading = false;
    },

    /**
     * 查询商品分类树数据 (模拟)
     */
    queryTree(): void {
      this.loading = true;
      if (this.treeDataJson.success) {
        // 递归处理树节点，添加 key 和 isLeaf
        const processNode = (node: PlTreeNode): void => {
          node.key = node.plno;
          node.isLeaf = !node.children || node.children.length === 0;
          if (node.children && node.children.length > 0) {
            node.children.forEach(processNode);
          }
        };
        const rootObject = this.treeDataJson.result[0];
        if (rootObject && rootObject.children) {
          rootObject.children.forEach(processNode);
          this.treeData = rootObject.children;
        } else {
          this.treeData = [];
        }
      } else {
        ElMessage.error(this.treeDataJson.message || "获取树形列表失败 (模拟)");
        this.treeData = [];
      }
      this.loading = false;
    },

    /**
     * 查询退货原因下拉选项 (模拟)
     */
    queryStopReasonType(): void {
      this.loading = true;
      if (this.stopReasonData.success) {
        // 转换数据格式
        this.attrCnts.faultModeOptions = this.stopReasonData.result.map(
          (item): FaultModeOption => ({
            label: item.stopReasonType,
            value: item.stopReasonType,
          })
        );
      } else {
        ElMessage.error(
          this.stopReasonData.message || "获取下拉框选项失败 (模拟)"
        );
        this.attrCnts.faultModeOptions = [];
      }
      this.loading = false;
    },

    /**
     * 查询按钮点击处理
     */
    async fun_search(formEl: FormInstance | null): Promise<void> {
      if (!formEl) return;
      try {
        const valid = await formEl.validate(); // 触发表单验证
        if (valid) {
          this.query(); // 验证通过则查询
        }
      } catch (error) {
        console.warn("表单验证失败或查询出错:", error);
        ElMessage.warning("请检查筛选条件是否填写正确");
      }
    },

    /**
     * 重置按钮点击处理
     */
    fun_reset(formEl: FormInstance | null): void {
      if (!formEl) return;
      formEl.resetFields(); // 重置表单
      this.query(); // 重新查询
    },
  },
});
</script>

<style scoped lang="less">
/* --- 页面整体与根容器 --- */
.root-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-size: 14px;
  overflow: hidden;
  background-color: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;

  /* --- 通用卡片样式调整 --- */
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
    font-weight: bold;
  }
  :deep(.el-card__body) {
    padding: 20px;
  }

  /* --- 布局 1: 筛选区域 --- */
  .layout-search {
    flex-shrink: 0; // 防止被压缩
    margin-bottom: 15px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .search-filters {
      display: flex;
      flex-wrap: wrap; // 自动换行
      gap: 15px 20px; // 行列间距
      align-items: flex-start; // 顶部对齐

      .el-form-item {
        margin-bottom: 0; // 移除表单项默认下边距
      }
    }
    /* 筛选控件宽度 */
    .search-tree-select {
      width: 240px;
    }
    .search-input {
      width: 220px;
    }
    .search-select {
      width: 220px;
    }
    .search-datepicker {
      width: 280px;
    }
    .search-buttons {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  /* --- 布局 2: 内容区域 --- */
  /* .layout-content 样式由子组件 ContentArea.vue 控制 */

  /* --- 布局 3: 分析功能区域 --- */
  .layout-analysis {
    flex-shrink: 0; // 防止被压缩

    .analysis-card {
      background-color: #fff;
      border-radius: 4px;
      border: 1px solid #ebeef5;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    /* 分析文本域样式 (使其看起来像普通文本) */
    :deep(.el-textarea__inner) {
      border: none;
      box-shadow: none;
      background-color: transparent;
      padding: 5px 0;
      font-size: inherit;
      color: #606266;
      cursor: default;
      resize: none;
    }
  }
}
</style>
