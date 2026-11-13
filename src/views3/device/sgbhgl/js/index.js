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
    const loading = ref(true)
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
      _this.loading = true;
      // 取plNoKey
      const plNoKeyArr = Array.isArray(_this.searchForm.plNoKey) ? _this.searchForm.plNoKey : [];
      // 如果商品编号有值且商品编号表格只查到1条，自动赋值商品名称
      if (_this.searchForm.equipmentNo && _this.equipmentNoTableData.length === 1) {
        const onlyRow = _this.equipmentNoTableData[0];
        if (onlyRow.EQUIPMENTNO === _this.searchForm.equipmentNo) {
          _this.searchForm.equipmentName = onlyRow.EQUIPMENTNAME;
        }
      }
      let params = {
        plNos: plNoKeyArr.length > 0 ? plNoKeyArr.join(',') : null,
        equipmentNo: _this.searchForm.equipmentNo || null,
        breakDownNo: _this.searchForm.breakDownNo || null,
        relegationNames: Array.isArray(_this.searchForm.relegationNames) && _this.searchForm.relegationNames.length > 0 ? _this.searchForm.relegationNames.join(',') : null,
        startDate: _this.searchForm.vDay[0],
        endDate: _this.searchForm.vDay[1]
      };
      await axios({
        url: _this.wsUrl + '/sgbhgl/list',
        method: 'POST',
        data: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }).then(res => {
        if (res.data.success) {
          _this.dataList = res.data.result;
          _this.dataTotal = res.data.result.length;
        } else {
          ElMessage.error(res.data.message || '获取列表数据失败');
        }
        _this.loading = false;
      });
    },

    // 查询_树形列表
    async queryTree() {
      let _this = this;
      _this.loading = true;
      await axios({
        url: _this.wsUrl + '/public/plNoTree',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }).then(res => {
        if (res.data.success) {
          // 递归处理函数，为所有节点添加 key 和 isLeaf
          const processNode = (node) => {
            node.key = node.plno;
            node.isLeaf = !node.children || node.children.length === 0;
            if (node.children && node.children.length > 0) {
              node.children.forEach(processNode);
            }
          };
          const rootObject = res.data.result[0];
          if (rootObject && rootObject.children) {
            rootObject.children.forEach(processNode);
            _this.treeData = rootObject.children;
            // 保存原始treeData副本
            _this.originalTreeData = JSON.parse(JSON.stringify(_this.treeData));
          } else {
            _this.treeData = [];
            _this.originalTreeData = [];
          }
        } else {
          ElMessage.error(res.data.message || '获取树形列表失败');
          _this.treeData = [];
          _this.originalTreeData = [];
        }
        _this.loading = false;
      });
    },

    // 查询_下拉框_商品售后模式
    async queryRelegationNames() {
      let _this = this;
      _this.loading = true;
      await axios({
        url: this.wsUrl + '/public/relegationNameType',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      }).then(res => {
        if (res.data.success) {
          _this.attrCnts.relegationNamesOptions = res.data.result.map(item => ({
            value: item.relegationNameType,
            label: item.relegationNameType
          }));
        } else {
          ElMessage.error(res.data.message || '获取订单暂停类型失败');
        }
        _this.loading = false;
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
      _this.loading = true;
      await axios({
        url: this.wsUrl + '/public/equipmentNo',
        method: 'POST',
        data: JSON.stringify({ equipmentNo: val }),
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      }).then(res => {
        if (res.data.success) {
          _this.equipmentNoTableData = res.data.result || [];
          _this.equipmentNoTableVisible = _this.equipmentNoTableData.length > 0;
          _this.equipmentNoTablePage = 1;
        } else {
          _this.equipmentNoTableVisible = false;
          _this.equipmentNoTableData = [];
        }
        _this.loading = false;
      });
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
