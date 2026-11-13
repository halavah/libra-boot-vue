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
    const dataTableHeight = ref(window.innerHeight - 176);
    const pageSizes = ref([15, 25, 35, 50, 100]);
    const pageSize = ref(15);
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
      dataTableHeight,
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

      // 检索表单
      searchForm: {
        searchkey: '',
        vState: 'DB',
        vDay: this.timeFormat(Date.now(), 'yyyy-MM-01'),
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
    }
  },

  mounted() {
    this.list();
  },

  watch: {
    'searchForm.vDay': function (val) {
      this.list();
    }
  },

  methods: {
    // 登录 (已移除)

    // 查询 (改为使用模拟数据)
    async list() {
      let _this = this;
      _this.loading = true;

      // 定义更丰富的模拟数据
      const mockData = [
        { obj_id: 1, name: "张三", rq: "2024-07-01", address: "演示地址003" },
        { obj_id: 2, name: "李四", rq: "2024-07-05", address: "演示地址004" },
        { obj_id: 3, name: "王五", rq: "2024-07-10", address: "演示地址005" },
        { obj_id: 4, name: "演示用户028", rq: "2024-07-15", address: "演示地址006" },
        { obj_id: 5, name: "孙七", rq: "2024-07-20", address: "演示地址007" },
        { obj_id: 6, name: "周八", rq: "2024-07-25", address: "演示地址008" },
        { obj_id: 7, name: "吴九", rq: "2024-08-01", address: "演示地址009" },
        { obj_id: 8, name: "郑十", rq: "2024-08-05", address: "演示地址010" },
        { obj_id: 9, name: "冯十一", rq: "2024-08-10", address: "演示地址011" },
        { obj_id: 10, name: "陈十二", rq: "2024-08-15", address: "演示地址012" },
        { obj_id: 11, name: "褚十三", rq: "2024-08-20", address: "演示地址013" },
        { obj_id: 12, name: "卫十四", rq: "2024-08-25", address: "演示地址014" },
        { obj_id: 13, name: "蒋十五", rq: "2024-09-01", address: "演示地址015" },
        { obj_id: 14, name: "沈十六", rq: "2024-09-05", address: "演示地址016" },
        { obj_id: 15, name: "韩十七", rq: "2024-09-10", address: "演示地址017" }
      ];

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300)); // 模拟 300ms 延迟

      // 应用筛选条件 (简单示例：按姓名或地址模糊匹配)
      const searchKey = _this.searchForm.searchKey ? _this.searchForm.searchKey.toLowerCase() : '';
      const filteredData = mockData.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(searchKey);
        const addressMatch = item.address.toLowerCase().includes(searchKey);
        return (nameMatch || addressMatch);
      });

      _this.dataList = filteredData;
      _this.dataTotal = filteredData.length;
      ElMessage.success('模拟数据加载成功');
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
            url: _this.wsUrl + '/txjxp/' + (_this.dataForm.obj_id == null ? 'create' : 'update'),
            method: 'POST',
            data: _this.dataForm,
            dataType: 'json',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
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
          url: _this.wsUrl + '/txjxp/delete',
          method: 'POST',
          data: JSON.stringify(params),
          dataType: 'json',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
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

    // 格式化日期
    formatDate(row, column) {
      let data = row[column.property];
      if (data == null) {
        return null;
      }
      let dt = new Date(data);
      let year = dt.getFullYear();
      let month = String(dt.getMonth() + 1).padStart(2, '0');
      let day = String(dt.getDate()).padStart(2, '0');
      let hours = String(dt.getHours()).padStart(2, '0');
      let minutes = String(dt.getMinutes()).padStart(2, '0');
      let seconds = String(dt.getSeconds()).padStart(2, '0');
      let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      return formattedDate;
    },
  },
};
createApp(App).use(ElementPlus, { locale: ElementPlusLocaleZhCn }).mount("#app");
