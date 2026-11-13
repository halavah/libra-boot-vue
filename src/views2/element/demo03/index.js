const { createApp, reactive, ref } = Vue;
const { ElMessage, ElMessageBox } = ElementPlus;

const App = {
  setup() {
    // 加载中...
    const loading = ref(true);
    // 检索表单
    const searchFormRef = ref('');
    const searchFormRules = reactive({
      searchKey: [
        { required: false, message: '检索关键字: 标题、工作内容、售后单号', trigger: 'blur' },
      ],
      vDay: [
        { type: 'date', required: true, message: '请选择年月', trigger: 'change' },
      ]
    });
    // 数据表单
    const dataFormRef = ref('');
    const dataFormTitle = ref('详情');
    const dataFormVisible = ref(false);
    const dataFormStatus = ref('');
    const dataFormRules = reactive({
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
      ],
      rq: [
        { type: 'date', required: true, message: '请选择日期', trigger: 'change' },
      ],
      address: [
        { required: true, message: '请输入地址', trigger: 'blur' },
      ],
    });
    // 分页信息
    // const dataTableHeight = ref(window.innerHeight - 176);
    const pageSizes = ref([10, 20, 30, 50, 100]);
    const pageSize = ref(10);
    const currentPage = ref(1);
    const dataTotal = ref(0);
    // 表格
    const dataTableRef = ref('');
    const selectionRows = [];
    const currentRow = {};
    // 树节点
    const treeProps = {
      children: 'children',
      label: 'label',
    };
    const treeData = [
      { id: 'DB', label: '待办' },
      { id: 'JB', label: '经办' },
      { id: 'YGD', label: '已归档' },
    ];
    // 返回
    return {
      loading,
      //
      searchFormRef,
      searchFormRules,
      //
      dataFormRef,
      dataFormTitle,
      dataFormVisible,
      dataFormStatus,
      dataFormRules,
      //
      // dataTableHeight,
      pageSizes,
      pageSize,
      currentPage,
      dataTotal,
      //
      dataTableRef,
      selectionRows,
      currentRow,
      //
      treeProps,
      treeData,
    };
  },

  data() {
    return {
      // 前置服务地址 (保留，但实际请求会移除)
      wsUrl: 'http://localhost:8080',

      // 登录表单 (已移除)
      // 登录Token (已移除)

      // 检索表单
      searchForm: {
        searchkey: '',
        vState: 'DB',
        vDay: this.timeFormat(Date.now(), 'yyyy-MM-dd'),
      },

      // 数据表单
      dataForm: {
        obj_id: '',
        name: '',
        date: '',
        address: '',
      },

      // 数据列表
      dataList: [],

      // 属性含义
      attrCnts: {
        yesOrNo: ['是', '否'],
      },

      // 模拟数据列表 (提取到 data 中)
      mockDataList: [
        { obj_id: 1, name: "模拟用户1", rq: "2024-06-01", address: "模拟地址1", },
        { obj_id: 3, name: "模拟用户2", rq: "2024-06-01", address: "模拟地址2", },
        { obj_id: 4, name: "模拟用户3", rq: "2024-06-05", address: "模拟地址3", },
        { obj_id: 5, name: "模拟用户4", rq: "2024-06-10", address: "模拟地址4", }
      ]
    }
  },

  mounted() {
    this.list(); // 直接加载列表数据
  },

  methods: {
    // 查询 (改为使用模拟数据)
    async list() {
      let _this = this;
      _this.loading = true;

      // 方法一：split
      let rq1 = this.searchForm.vDay.split("-");
      console.log(rq1[0])
      console.log(rq1[1])
      console.log(rq1[2])

      // 方法二：subString
      let rq2 = this.searchForm.vDay;
      console.log(rq2.substring(0, 4));
      console.log(rq2.substring(5, 7));
      console.log(rq2.substring(8, 10));

      // 方法三：parsedDate.getMonth() + 1
      let rq3 = new Date((this.searchForm.vDay)).getMonth() + 1;
      $('#rqspan').html(rq3 + "月系统负荷预测上报表");

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      // 应用筛选条件 (使用 this.mockDataList)
      const searchKey = _this.searchForm.searchKey ? _this.searchForm.searchKey.toLowerCase() : '';
      const filteredData = _this.mockDataList.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(searchKey);
        const addressMatch = item.address.toLowerCase().includes(searchKey);
        // 可以添加日期筛选逻辑
        return (nameMatch || addressMatch);
      });

      _this.dataList = filteredData;
      _this.dataTotal = filteredData.length;
      ElMessage.success("模拟数据加载成功 (来自 data)"); // 更新提示信息

      _this.loading = false;
    },

    // 保存
    async fun_save(formEl) {
      let _this = this;
      if (!formEl) return
      await formEl.validate((valid) => {
        if (valid) {
          _this.loading = true;
          axios({
            url: _this.wsUrl + '/txjxp2/' + (_this.dataForm.obj_id == null ? 'create' : 'update'),
            method: 'POST',
            data: _this.dataForm,
            dataType: 'json',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              // Authorization 已移除
            }
          }).then(res => {
            if (res.data.code === 200) {
              _this.list();
              ElMessage.success(res.data.msg);
              this.dataFormVisible = false;
            } else {
              ElMessage.error(res.data.msg);
            }
            _this.loading = false;
          });
        } else {
          ElMessage.warning('请检查相关参数');
        }
      })
    },

    // 删除
    async fun_delete() {
      let _this = this;
      if (!_this.currentRow.hasOwnProperty("obj_id")) {
        ElMessage.warning('请选中一条数据进行删除');
      } else {
        _this.loading = true;
        let params = {
          obj_id: _this.currentRow.obj_id,
        }
        axios({
          url: _this.wsUrl + '/txjxp2/delete',
          method: 'POST',
          data: JSON.stringify(params),
          dataType: 'json',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            // Authorization 已移除
          }
        }).then(res => {
          if (res.data.code === 200) {
            _this.list();
            ElMessage.success(res.data.msg);
          } else {
            ElMessage.error(res.data.msg);
          }
          _this.loading = false;
        });
      }
    },

    /******************************************************************************************/

    // 查询
    async fun_search(formEl) {
      let _this = this;
      if (!formEl) return
      await formEl.validate((valid) => {
        if (valid) {
          _this.list();
        } else {
          ElMessage.warning('请检查相关参数');
        }
      })
    },

    // 新增
    fun_create() {
      this.dataForm = {};
      this.dataFormTitle = '新建';
      this.dataFormVisible = true;
      this.dataFormStatus = 'create';
    },

    // 详情
    fun_detail(row) {
      this.dataForm = row;
      this.dataFormTitle = '详情';
      this.dataFormVisible = true;
      this.dataFormStatus = 'update';
    },

    // 取消
    cancle(formEl) {
      if (!formEl) return
      formEl.resetFields();
      this.dataFormVisible = false;
    },

    /******************************************************************************************/

    // 单选行
    handleCurrentRowChange(currentRow) {
      this.currentRow = currentRow;
    },

    // 第N页
    handleCurrentPagerChange(val) {
      this.currentPage = val;
    },

    /******************************************************************************************/

    // 树节点选择
    handleNodeClick(node, attr) {
      if (attr.isLeaf) {
        this.searchForm = {}
        this.searchForm.vState = node.id;
        this.searchForm.vDay = this.timeFormat(Date.now(), 'yyyy-MM-01')
        this.list();
      }
    },

    // 时间格式化
    timeFormat(time, fmt) {
      const now = new Date(time);
      const o = {
        "M+": now.getMonth() + 1,
        "d+": now.getDate(),
        "h+": now.getHours(),
        "m+": now.getMinutes(),
        "s+": now.getSeconds(),
        "q+": Math.floor((now.getMonth() + 3) / 3),
        "S": now.getMilliseconds()
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (now.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    },
  },
};
createApp(App).use(ElementPlus, { locale: ElementPlusLocaleZhCn }).mount("#app");
