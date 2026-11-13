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
    const pageSizes = ref([10, 15, 25, 35, 50, 100])
    const pageSize = ref(10)
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
        relegationNamesOptions: [],
      },
      // 筛选-表单
      searchForm: {
        plNoKey: [],
        equipmentNo: '',
        breakDownNo: '',
        relegationNames: '',
        vDay: [
          dayjs().startOf('year').format('YYYY-MM-DD'),
          dayjs().format('YYYY-MM-DD')
        ],
      },
      // 筛选-表格
      dataList: [],
      // 筛选-表格-弹框表单
      dataForm: {
        plNo: '', // 店铺编号
        plName: '', // 店铺中文名
        breakDownNo: '', // 售后单号
        informDate: '', // 订单暂停起始日期
        informTime: '', // 订单暂停起始时间
        informfullDate: '', // 订单暂停起始完整日期
        arriveDate: '', // 订单暂停结束日期
        arriveTime: '', // 订单暂停结束时间
        arrivefullDate: '', // 订单暂停结束完整日期
        totalBreakTime: '', // 订单暂停总时间
        breakDownGrade: '', // 重要度
        bkPart: '', // 售后异常部位
        bkReason: '', // 不良原因
        breakDownName: '', // 维护履历名称
        relegation: '', // 售后事件归属
        textArea2: '', // 退货原因分析
        textArea3: '', // 改进防范措施
        textArea4: '', // 改进防范措施
        measureName: '', // 整改措施内容
        reportMemo: '', // 整改回报内容
      },

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
        "result": [
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501042501-001",
            "breakDownName": "演示订单售后记录002",
            "plNo": "Y501",
            "equipmentName": "演示商品003",
            "relegationName": "机械",
            "equipmentNo": "Y501042501",
            "informDate": "2025-05-22"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501041302-001",
            "breakDownName": "演示订单售后记录003",
            "plNo": "Y501",
            "equipmentName": "演示商品004",
            "relegationName": "机械",
            "equipmentNo": "Y501041302",
            "informDate": "2025-05-21"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501041805-001",
            "breakDownName": "演示订单售后记录004",
            "plNo": "Y501",
            "equipmentName": "演示商品005",
            "relegationName": "机械",
            "equipmentNo": "Y501041805",
            "informDate": "2025-05-16"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201020104-001",
            "breakDownName": "演示售后单001：订单商品漏发需补寄",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录005",
            "relegationName": "电气",
            "equipmentNo": "Y201020104",
            "informDate": "2025-05-13"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201060303-001",
            "breakDownName": "家电旗舰店二商品分组PF链停",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录006",
            "relegationName": "机械",
            "equipmentNo": "Y201060303",
            "informDate": "2025-05-13"
          },
          {
            "plName": "美妆旗舰店-商品分组01",
            "breakDownNo": "W901020701-001",
            "breakDownName": "演示售后单101：商品规格与描述不符",
            "plNo": "W901",
            "equipmentName": "演示商品006",
            "relegationName": "机械",
            "equipmentNo": "W901020701",
            "informDate": "2025-05-12"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033616-001",
            "breakDownName": "演示订单售后记录007",
            "plNo": "Y801",
            "equipmentName": "演示商品007",
            "relegationName": "电气",
            "equipmentNo": "Y802033616",
            "informDate": "2025-05-12"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501041706-001",
            "breakDownName": "演示订单售后记录008",
            "plNo": "Y501",
            "equipmentName": "演示商品005",
            "relegationName": "电气",
            "equipmentNo": "Y501041706",
            "informDate": "2025-05-05"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401060511-001",
            "breakDownName": "演示订单售后记录009",
            "plNo": "Y401",
            "equipmentName": "演示商品008",
            "relegationName": "机械",
            "equipmentNo": "Y401060511",
            "informDate": "2025-04-30"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201020706-001",
            "breakDownName": "演示订单售后记录010",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录011",
            "relegationName": "机械",
            "equipmentNo": "Y201020706",
            "informDate": "2025-04-24"
          },
          {
            "plName": "美妆旗舰店-商品分组03",
            "breakDownNo": "W903050101-003",
            "breakDownName": "演示售后单002：商品规格与下单选择不符",
            "plNo": "W903",
            "equipmentName": "演示商品009",
            "relegationName": "机械",
            "equipmentNo": "W903050101",
            "informDate": "2025-04-23"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033509-003",
            "breakDownName": "演示订单售后记录012",
            "plNo": "Y801",
            "equipmentName": "演示商品010",
            "relegationName": "电气",
            "equipmentNo": "Y802033509",
            "informDate": "2025-04-23"
          },
          {
            "plName": "数码旗舰店-商品分组03",
            "breakDownNo": "W461171007-001",
            "breakDownName": "售后报告",
            "plNo": "W403",
            "equipmentName": "演示订单售后记录013",
            "relegationName": "电气",
            "equipmentNo": "W461171007",
            "informDate": "2025-04-21"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201030504-001",
            "breakDownName": "演示订单售后记录014",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录015",
            "relegationName": "电气",
            "equipmentNo": "Y201030504",
            "informDate": "2025-04-21"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501020508-001",
            "breakDownName": "演示订单售后记录016",
            "plNo": "Y501",
            "equipmentName": "演示商品011",
            "relegationName": "机械",
            "equipmentNo": "Y501020508",
            "informDate": "2025-04-20"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802031207-001",
            "breakDownName": "演示订单售后记录017",
            "plNo": "Y801",
            "equipmentName": "演示商品012",
            "relegationName": "电气",
            "equipmentNo": "Y802031207",
            "informDate": "2025-04-20"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802031701-002",
            "breakDownName": "演示订单售后记录018",
            "plNo": "Y801",
            "equipmentName": "演示商品013",
            "relegationName": "电气",
            "equipmentNo": "Y802031701",
            "informDate": "2025-04-20"
          },
          {
            "plName": "美妆旗舰店-商品分组04",
            "breakDownNo": "W904020401-003",
            "breakDownName": "演示售后单003：物流包裹破损申请换货",
            "plNo": "W904",
            "equipmentName": "演示订单售后记录019",
            "relegationName": "机械",
            "equipmentNo": "W904020401",
            "informDate": "2025-04-19"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401060301-001",
            "breakDownName": "演示售后单102：商品颜色与描述不符",
            "plNo": "Y401",
            "equipmentName": "演示商品014",
            "relegationName": "机械",
            "equipmentNo": "Y401060301",
            "informDate": "2025-04-18"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802030812-001",
            "breakDownName": "演示订单售后记录020",
            "plNo": "Y801",
            "equipmentName": "演示订单售后记录021",
            "relegationName": "机械",
            "equipmentNo": "Y802030812",
            "informDate": "2025-04-18"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033906-001",
            "breakDownName": "演示订单售后记录022",
            "plNo": "Y801",
            "equipmentName": "演示订单售后记录023",
            "relegationName": "机械",
            "equipmentNo": "Y802033906",
            "informDate": "2025-04-17"
          },
          {
            "plName": "美妆旗舰店-商品分组04",
            "breakDownNo": "W904020401-002",
            "breakDownName": "演示售后单003：物流包裹破损申请换货",
            "plNo": "W904",
            "equipmentName": "演示订单售后记录019",
            "relegationName": "机械",
            "equipmentNo": "W904020401",
            "informDate": "2025-04-15"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501020101-001",
            "breakDownName": "演示订单售后记录024",
            "plNo": "Y501",
            "equipmentName": "演示商品015",
            "relegationName": "机械",
            "equipmentNo": "Y501020101",
            "informDate": "2025-04-14"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812012007-001",
            "breakDownName": "演示售后单004：订单重复扣款申请退款",
            "plNo": "Y807",
            "equipmentName": "演示商品016",
            "relegationName": "机械",
            "equipmentNo": "Y812012007",
            "informDate": "2025-04-12"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812021916-001",
            "breakDownName": "演示售后单005：预售订单延期发货",
            "plNo": "Y807",
            "equipmentName": "演示商品017",
            "relegationName": "机械",
            "equipmentNo": "Y812021916",
            "informDate": "2025-04-06"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401113402-002",
            "breakDownName": "演示售后单103：商品尺寸不合适",
            "plNo": "Y401",
            "equipmentName": "演示订单售后记录025",
            "relegationName": "电气",
            "equipmentNo": "Y401113402",
            "informDate": "2025-04-04"
          },
          {
            "plName": "服饰旗舰店-商品分组02",
            "breakDownNo": "Y202040903-001",
            "breakDownName": "演示售后单006：商品配件缺失申请补发",
            "plNo": "Y202",
            "equipmentName": "演示订单售后记录026",
            "relegationName": "机械",
            "equipmentNo": "Y202040903",
            "informDate": "2025-04-03"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812012010-001",
            "breakDownName": "演示售后单104：商品质量问题",
            "plNo": "Y807",
            "equipmentName": "演示商品018",
            "relegationName": "机械",
            "equipmentNo": "Y812012010",
            "informDate": "2025-04-03"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802031701-001",
            "breakDownName": "演示订单售后记录027",
            "plNo": "Y801",
            "equipmentName": "演示商品013",
            "relegationName": "电气",
            "equipmentNo": "Y802031701",
            "informDate": "2025-04-01"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033608-001",
            "breakDownName": "演示订单售后记录028",
            "plNo": "Y801",
            "equipmentName": "演示商品019",
            "relegationName": "机械",
            "equipmentNo": "Y802033608",
            "informDate": "2025-03-28"
          },
          {
            "plName": "美妆旗舰店-商品分组04",
            "breakDownNo": "W904020401-001",
            "breakDownName": "演示售后单007：商品外观划痕申请退货",
            "plNo": "W904",
            "equipmentName": "演示订单售后记录019",
            "relegationName": "机械",
            "equipmentNo": "W904020401",
            "informDate": "2025-03-27"
          },
          {
            "plName": "美妆旗舰店-商品分组03",
            "breakDownNo": "W903050101-002",
            "breakDownName": "演示售后单008：优惠券未抵扣需核对差额",
            "plNo": "W903",
            "equipmentName": "演示商品009",
            "relegationName": "机械",
            "equipmentNo": "W903050101",
            "informDate": "2025-03-26"
          },
          {
            "plName": "服饰旗舰店-商品分组02",
            "breakDownNo": "Y202050103-001",
            "breakDownName": "演示订单售后记录029",
            "plNo": "Y202",
            "equipmentName": "演示订单售后记录030",
            "relegationName": "机械",
            "equipmentNo": "Y202050103",
            "informDate": "2025-03-26"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812012702-001",
            "breakDownName": "演示售后单009：退货已签收待退款",
            "plNo": "Y807",
            "equipmentName": "演示商品020",
            "relegationName": "机械",
            "equipmentNo": "Y812012702",
            "informDate": "2025-03-26"
          },
          {
            "plName": "服饰旗舰店-商品分组02",
            "breakDownNo": "Y202040208-001",
            "breakDownName": "演示售后单010：错发商品申请换货",
            "plNo": "Y202",
            "equipmentName": "演示订单售后记录031",
            "relegationName": "电气",
            "equipmentNo": "Y202040208",
            "informDate": "2025-03-25"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y805040903-002",
            "breakDownName": "演示售后单105：商品数量不足",
            "plNo": "Y807",
            "equipmentName": "演示商品021",
            "relegationName": "机械",
            "equipmentNo": "Y805040903",
            "informDate": "2025-03-24"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401110401-002",
            "breakDownName": "演示售后单106：商品配件缺失",
            "plNo": "Y401",
            "equipmentName": "演示商品022",
            "relegationName": "电气",
            "equipmentNo": "Y401110401",
            "informDate": "2025-03-22"
          },
          {
            "plName": "电商物流中心-商品分组01",
            "breakDownNo": "W106051109-001",
            "breakDownName": "演示售后单011：订单地址变更需拦截",
            "plNo": "W101",
            "equipmentName": "演示商品023",
            "relegationName": "电气",
            "equipmentNo": "W106051109",
            "informDate": "2025-03-18"
          },
          {
            "plName": "美妆旗舰店-商品分组02",
            "breakDownNo": "W902020601-001",
            "breakDownName": "关于顺盛二线选粉机叶片脱落订单暂停售后报告",
            "plNo": "W902",
            "equipmentName": "演示商品024",
            "relegationName": "机械",
            "equipmentNo": "W902020601",
            "informDate": "2025-03-16"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y802021501-001",
            "breakDownName": "演示售后单012：组合商品缺货需拆单",
            "plNo": "Y807",
            "equipmentName": "演示商品025",
            "relegationName": "机械",
            "equipmentNo": "Y802021501",
            "informDate": "2025-03-15"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201020100-001",
            "breakDownName": "演示订单售后记录032",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录033",
            "relegationName": "电气",
            "equipmentNo": "Y201020100",
            "informDate": "2025-03-14"
          },
          {
            "plName": "数码旗舰店-商品分组03",
            "breakDownNo": "W461190214-002",
            "breakDownName": "演示订单售后记录034",
            "plNo": "W403",
            "equipmentName": "演示订单售后记录035",
            "relegationName": "电气",
            "equipmentNo": "W461190214",
            "informDate": "2025-03-13"
          },
          {
            "plName": "数码旗舰店-商品分组15",
            "breakDownNo": "W815154506-001",
            "breakDownName": "25.03.13 出坯跨滑线跳闸的售后报告",
            "plNo": "W415",
            "equipmentName": "演示商品026",
            "relegationName": "电气",
            "equipmentNo": "W815154506",
            "informDate": "2025-03-13"
          },
          {
            "plName": "服饰旗舰店-商品分组02",
            "breakDownNo": "Y202050102-001",
            "breakDownName": "演示售后单107：商品外观破损",
            "plNo": "Y202",
            "equipmentName": "演示订单售后记录036",
            "relegationName": "电气",
            "equipmentNo": "Y202050102",
            "informDate": "2025-03-13"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y805040903-001",
            "breakDownName": "演示售后单105：商品数量不足",
            "plNo": "Y807",
            "equipmentName": "演示商品021",
            "relegationName": "机械",
            "equipmentNo": "Y805040903",
            "informDate": "2025-03-09"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501030704-007",
            "breakDownName": "演示订单售后记录037",
            "plNo": "Y501",
            "equipmentName": "演示商品027",
            "relegationName": "机械",
            "equipmentNo": "Y501030704",
            "informDate": "2025-03-05"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501030801-001",
            "breakDownName": "关于F6入口导卫中间梁掉的售后报告",
            "plNo": "Y501",
            "equipmentName": "演示商品028",
            "relegationName": "机械",
            "equipmentNo": "Y501030801",
            "informDate": "2025-03-05"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501020401-001",
            "breakDownName": "演示订单售后记录038",
            "plNo": "Y501",
            "equipmentName": "演示商品029",
            "relegationName": "机械",
            "equipmentNo": "Y501020401",
            "informDate": "2025-03-04"
          },
          {
            "plName": "数码旗舰店-商品分组03",
            "breakDownNo": "W461190214-001",
            "breakDownName": "演示订单售后记录039",
            "plNo": "W403",
            "equipmentName": "演示订单售后记录035",
            "relegationName": "电气",
            "equipmentNo": "W461190214",
            "informDate": "2025-03-02"
          },
          {
            "plName": "数码旗舰店-商品分组03",
            "breakDownNo": "W455040301-001",
            "breakDownName": "演示订单售后记录040",
            "plNo": "W403",
            "equipmentName": "演示订单售后记录041",
            "relegationName": "电气",
            "equipmentNo": "W455040301",
            "informDate": "2025-02-28"
          },
          {
            "plName": "数码旗舰店-商品分组04",
            "breakDownNo": "W461200304-001",
            "breakDownName": "演示订单售后记录042",
            "plNo": "W404",
            "equipmentName": "演示订单售后记录043",
            "relegationName": "电气",
            "equipmentNo": "W461200304",
            "informDate": "2025-02-28"
          },
          {
            "plName": "美妆旗舰店-商品分组02",
            "breakDownNo": "W909010701-001",
            "breakDownName": "二线三通分料阀抽屉柜短路售后异常售后报告",
            "plNo": "W902",
            "equipmentName": "演示商品030",
            "relegationName": "电气",
            "equipmentNo": "W909010701",
            "informDate": "2025-02-24"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812031302-001",
            "breakDownName": "演示售后单108：商品包装破损",
            "plNo": "Y807",
            "equipmentName": "演示商品031",
            "relegationName": "机械",
            "equipmentNo": "Y812031302",
            "informDate": "2025-02-24"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401110401-001",
            "breakDownName": "演示售后单106：商品配件缺失",
            "plNo": "Y401",
            "equipmentName": "演示商品022",
            "relegationName": "电气",
            "equipmentNo": "Y401110401",
            "informDate": "2025-02-21"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812021701-001",
            "breakDownName": "演示售后单109：错发商品",
            "plNo": "Y807",
            "equipmentName": "演示商品032",
            "relegationName": "机械",
            "equipmentNo": "Y812021701",
            "informDate": "2025-02-19"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802012549-001",
            "breakDownName": "演示订单售后记录044",
            "plNo": "Y801",
            "equipmentName": "演示商品033",
            "relegationName": "电气",
            "equipmentNo": "Y802012549",
            "informDate": "2025-02-17"
          },
          {
            "plName": "美妆旗舰店-商品分组01",
            "breakDownNo": "W901040201-005",
            "breakDownName": "演示售后单013：订单商品漏发需补寄",
            "plNo": "W901",
            "equipmentName": "演示商品034",
            "relegationName": "电气",
            "equipmentNo": "W901040201",
            "informDate": "2025-02-15"
          },
          {
            "plName": "美妆旗舰店-商品分组05",
            "breakDownNo": "W905020103-001",
            "breakDownName": "演示订单售后记录045",
            "plNo": "W905",
            "equipmentName": "演示商品035",
            "relegationName": "电气",
            "equipmentNo": "W905020103",
            "informDate": "2025-02-13"
          },
          {
            "plName": "美妆旗舰店-商品分组02",
            "breakDownNo": "W902040201-005",
            "breakDownName": "演示售后单014：商品规格与下单选择不符",
            "plNo": "W902",
            "equipmentName": "演示商品034",
            "relegationName": "电气",
            "equipmentNo": "W902040201",
            "informDate": "2025-02-12"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033307-001",
            "breakDownName": "演示订单售后记录046",
            "plNo": "Y801",
            "equipmentName": "演示商品036",
            "relegationName": "电气",
            "equipmentNo": "Y802033307",
            "informDate": "2025-02-11"
          },
          {
            "plName": "自营店铺-商品分组05",
            "breakDownNo": "W305080101-003",
            "breakDownName": "演示订单售后记录047",
            "plNo": "W305",
            "equipmentName": "演示订单售后记录048",
            "relegationName": "机械",
            "equipmentNo": "W305080101",
            "informDate": "2025-02-09"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812031804-001",
            "breakDownName": "演示售后单015：物流包裹破损申请换货",
            "plNo": "Y807",
            "equipmentName": "演示商品037",
            "relegationName": "机械",
            "equipmentNo": "Y812031804",
            "informDate": "2025-02-09"
          },
          {
            "plName": "自营店铺-商品分组04",
            "breakDownNo": "W304081001-001",
            "breakDownName": "演示订单售后记录049",
            "plNo": "W304",
            "equipmentName": "演示商品038",
            "relegationName": "电气",
            "equipmentNo": "W304081001",
            "informDate": "2025-02-08"
          },
          {
            "plName": "服饰旗舰店-商品分组02",
            "breakDownNo": "Y202030208-001",
            "breakDownName": "演示售后单110：重复购买",
            "plNo": "Y202",
            "equipmentName": "演示订单售后记录050",
            "relegationName": "电气",
            "equipmentNo": "Y202030208",
            "informDate": "2025-02-05"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033603-002",
            "breakDownName": "演示订单售后记录051",
            "plNo": "Y801",
            "equipmentName": "演示商品039",
            "relegationName": "机械",
            "equipmentNo": "Y802033603",
            "informDate": "2025-02-04"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501033112-001",
            "breakDownName": "演示订单售后记录052",
            "plNo": "Y501",
            "equipmentName": "演示订单售后记录053",
            "relegationName": "电气",
            "equipmentNo": "Y501033112",
            "informDate": "2025-02-02"
          },
          {
            "plName": "美妆旗舰店-商品分组01",
            "breakDownNo": "W908010711-001",
            "breakDownName": "演示订单售后记录054",
            "plNo": "W901",
            "equipmentName": "演示订单售后记录055",
            "relegationName": "原料、生产操作、工艺质量类",
            "equipmentNo": "W908010711",
            "informDate": "2025-01-20"
          },
          {
            "plName": "商品运营中心-商品分组01",
            "breakDownNo": "W202060117-001",
            "breakDownName": "1#10kV 转接柜出线电缆接头外绝缘局部击穿售后事件",
            "plNo": "W201",
            "equipmentName": "演示商品040",
            "relegationName": "电气",
            "equipmentNo": "W202060117",
            "informDate": "2025-01-12"
          },
          {
            "plName": "美妆旗舰店-商品分组04",
            "breakDownNo": "W908020213-001",
            "breakDownName": "渣二皮带跳闸订单暂停售后事件",
            "plNo": "W904",
            "equipmentName": "演示订单售后记录056",
            "relegationName": "电气",
            "equipmentNo": "W908020213",
            "informDate": "2025-01-10"
          },
          {
            "plName": "服饰旗舰店-商品分组02",
            "breakDownNo": "Y202080312-001",
            "breakDownName": "演示售后单016：订单重复扣款申请退款",
            "plNo": "Y202",
            "equipmentName": "演示订单售后记录057",
            "relegationName": "电气",
            "equipmentNo": "Y202080312",
            "informDate": "2025-01-10"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802012806-002",
            "breakDownName": "演示订单售后记录058",
            "plNo": "Y801",
            "equipmentName": "演示商品041",
            "relegationName": "机械",
            "equipmentNo": "Y802012806",
            "informDate": "2025-01-10"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401060303-001",
            "breakDownName": "演示售后单017：预售订单延期发货",
            "plNo": "Y401",
            "equipmentName": "演示商品042",
            "relegationName": "机械",
            "equipmentNo": "Y401060303",
            "informDate": "2025-01-08"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802012806-003",
            "breakDownName": "演示订单售后记录059",
            "plNo": "Y801",
            "equipmentName": "演示商品041",
            "relegationName": "机械",
            "equipmentNo": "Y802012806",
            "informDate": "2025-01-04"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401060201-001",
            "breakDownName": "演示售后单018：商品配件缺失申请补发",
            "plNo": "Y401",
            "equipmentName": "演示商品043",
            "relegationName": "机械",
            "equipmentNo": "Y401060201",
            "informDate": "2025-01-02"
          },
          {
            "plName": "商品运营中心-商品分组04",
            "breakDownNo": "W204060119-001",
            "breakDownName": "演示售后单019：商品外观划痕申请退货",
            "plNo": "W204",
            "equipmentName": "演示商品044",
            "relegationName": "电气",
            "equipmentNo": "W204060119",
            "informDate": "2025-01-01"
          },
          {
            "plName": "数码旗舰店-商品分组10",
            "breakDownNo": "W461010001-001",
            "breakDownName": "演示订单售后记录060",
            "plNo": "W410",
            "equipmentName": "演示订单售后记录061",
            "relegationName": "电气",
            "equipmentNo": "W461010001",
            "informDate": "2025-01-01"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802013353-001",
            "breakDownName": "演示订单售后记录062",
            "plNo": "Y801",
            "equipmentName": "演示商品045",
            "relegationName": "电气",
            "equipmentNo": "Y802013353",
            "informDate": "2025-01-01"
          }
        ],
        "timestamp": 1748142625543
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
      relegationNameTypeData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "relegationNameType": "电气"
          },
          {
            "relegationNameType": "机械"
          },
          {
            "relegationNameType": "原料、生产操作、工艺质量类"
          }
        ],
        "timestamp": 1748142663474
      }
    };
  },
  mounted() {
    // 1.查询
    this.query();
    // 2.查询树形列表
    this.queryTree();
    // 3.查询退货原因列表
    this.queryRelegationNames();
  },
  methods: {
    // 查询_表格
    async query() {
      let _this = this;
      _this.dataList = _this.listData.result;
      _this.dataTotal = _this.listData.result.length;
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
    async queryRelegationNames() {
      let _this = this;
      _this.attrCnts.relegationNamesOptions = _this.relegationNameTypeData.result.map(item => ({
        value: item.relegationNameType,
        label: item.relegationNameType
      }));
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
      _this.equipmentNoTableData = _this.equipmentNoListData.result;
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

    /*******************************************************调用：表格*******************************************************/

    // 第N页
    handleCurrentChange(val) {
      this.currentPage = val
    },
    // 单选行
    handleCurrentRowChange(currentRow, oldCurrentRow) {
      this.currentRow = currentRow;
    },

    /*******************************************************调用：弹框*******************************************************/

    // 详情
    fun_detail(row, column, event) {
      let _this = this;
      _this.dataFormLoading = true;
      axios({
        url: this.wsUrl + '/sgbhgl/detail',
        method: 'POST',
        data: JSON.stringify({ breakDownNo: row.breakDownNo }),
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      }).then(res => {
        if (res.data.success) {
          _this.dataForm = res.data.result || [];
        } else {
          ElMessage.error(res.data.message || '获取数据详情失败');
        }
        _this.dataFormLoading = false;
      });
      _this.dataFormTitle = '详情'
      _this.dataFormVisible = true;
      _this.dataFormStatus = 'detail';
    },
  },
};
