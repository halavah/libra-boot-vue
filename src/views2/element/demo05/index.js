const { createApp, reactive, ref } = Vue;
const { ElMessage, ElMessageBox } = ElementPlus;
let getDate = window.location.search.indexOf('?date=') > -1 && window.location.search.replaceAll('?date=', '');
const App = {
  setup() {
    // 加载中...
    const loading = ref(true)
    // 表单校验规则
    const rules = reactive({
      searchKey: [
        { required: false, message: '请输入检索关键字', trigger: 'blur' },
      ],
      vDay: [
        { type: 'array', required: true, message: '请选择开始及结束时间', trigger: 'change' },
      ],
    })
    const dataFormRules = reactive({
      code: [
        { required: true, message: '请输入变更后状态', trigger: 'blur' },
      ],
      vDay: [
        { type: 'array', required: true, message: '请选择开始及结束时间', trigger: 'change' },
      ],
    })
    // 页面高度
    const dataTableHeight = ref(window.innerHeight - 115)
    // 检索表单
    const searchFormRef = ref('')
    // 数据表单
    const dataFormRef = ref('')
    const dataFormTitle = ref('详情')
    const dataFormVisible = ref(false)
    const dataFormStatus = ref('');
    // 返回
    return {
      loading,
      rules,
      dataTableHeight,
      dataFormRules,
      searchFormRef,
      dataFormRef,
      dataFormTitle,
      dataFormVisible,
      dataFormStatus,
    };
  },
  data() {
    return {
      // 前置服务地址
      wsUrl: 'http://localhost:8080',
      // 用户基础信息
      dkyUser: {
        user_employeeId: null,
        user_id: null,
        user_name: null,
        fullname: null,
      },
      // 检索表单
      searchForm: {
        vDay: [
          '2024-01-01',
          '2024-01-31'
        ],
        mc: '',
        dq: '',
        state: ''
      },
      // 表格数据
      dataList: [],
      dateLength: [],
      //表格数据的日期展示
      dateArr: [{ date: dayjs().format('YYYY-MM-DD'), state: "" }],
      // 数据表单
      dataForm: {},
      // 属性含义
      attrCnts: {
        dq: ['大同', '朔州', '忻州', '阳泉', '太原', '吕梁', '晋中', '长治', '晋城', '临汾', '运城'],
        state: ['并网', '备用', '备用不可调', '临修', '紧停']
      },
    };
  },
  mounted() {
    // 查询
    this.list();
  },

  methods: {
    // 查询
    async fun_search(formEl) {
      let _this = this;
      if (!formEl) return
      await formEl.validate((valid, fields) => {
        if (valid) {
          _this.list();
        } else {
          ElMessage.warning('请检查相关参数！');
        }
      })
    },
    // 编辑
    fun_editor(row) {
      this.dataForm = {
        jzid: row.jzid,
        dcjz: row.dcjz,
        state: row.code,
        code: '',
      };
      this.dataFormTitle = '编辑'
      this.dataFormVisible = true;
      this.dataFormStatus = 'update';
    },
    // 取消
    cancle(formEl) {
      if (!formEl) return
      formEl.resetFields()
      this.dataFormVisible = false;
    },
    // 保存
    async fun_save(formEl) {
      if (!formEl) return
      let _this = this;
      await formEl.validate((valid, fields) => {
        if (valid) {
          let params = Object.assign({
            jzid: _this.dataForm.jzid,
            code: _this.dataForm.code,
            sDay: _this.dataForm.vDay[0].substring(0, 10),
            eDay: _this.dataForm.vDay[1].substring(0, 10),
          })
          axios({
            url: _this.wsUrl + '/dyll/plantGeneratorMxSave',
            method: 'POST',
            data: JSON.stringify(params),
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            }
          }).then(res => {
            ElMessage({
              message: res.data.message,
              type: res.data.successful ? 'success' : 'warning',
            });
            if (res.data.successful) {
              _this.dataFormVisible = false;
              _this.list();
            }
          });
        }
      });
    },

    /*------------------------------------------------------------------------------------------------------------*/

    // 查询
    async list() {
      let _this = this;
      _this.loading = true;
      // await axios({
      //     url: _this.wsUrl + '/dyll/plantGeneratorMxList',
      //     method: 'POST',
      //     data: JSON.stringify(
      //         Object.assign({
      //             mc: _this.searchForm.mc,
      //             dq: _this.searchForm.dq,
      //             bjzt: _this.searchForm.state,
      //             sDay: _this.searchForm.vDay[0],
      //             eDay: _this.searchForm.vDay[1],
      //         })
      //     ),
      //     headers: {
      //         'Content-Type': 'application/json;charset=UTF-8'
      //     }
      // }).then(res => {
      //     if (res.data.successful) {
      //         var resData = [{"dcjz": "恒北#2", "code": "并网", "jzid": "900000000000000001", "state": ["并网", "并网", "临修", "备用不可调", "备用", "紧停", "临修", "并网", "备用不可调", "并网", "紧停", "临修", "并网", "临修", "备用", "并网", "并网", "并网", "备用不可调", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网"], "dq": "大同"}];
      //         let sDate = dayjs(_this.searchForm.vDay[0]);
      //         let eDate = dayjs(_this.searchForm.vDay[1]);
      //         let diff = eDate.diff(sDate, 'day');
      //         resData.map(function (v,i){
      //             v.date = []
      //             for (let i = 0; i <= diff; i++) {
      //                 let vDay = sDate.add(i, 'day').format('MM-DD');
      //                 v.date.push(vDay)
      //             }
      //             return v;
      //         })
      //         _this.dateLength = resData[0].date;
      //         _this.dataList = resData
      //     }
      //     _this.loading = false;
      // });
      var resData = [{ "dcjz": "恒北#2", "code": "并网", "jzid": "900000000000000001", "state": ["并网", "并网", "临修", "备用不可调", "备用", "紧停", "临修", "并网", "备用不可调", "并网", "紧停", "临修", "并网", "临修", "备用", "并网", "并网", "并网", "备用不可调", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网", "并网"], "dq": "大同" }];
      let sDate = dayjs(_this.searchForm.vDay[0]);
      let eDate = dayjs(_this.searchForm.vDay[1]);
      let diff = eDate.diff(sDate, 'day');
      resData.map(function (v, i) {
        v.date = []
        for (let i = 0; i <= diff; i++) {
          let vDay = sDate.add(i, 'day').format('MM-DD');
          v.date.push(vDay)
        }
        return v;
      })
      _this.dateLength = resData[0].date;
      _this.dataList = resData;
      _this.loading = false;
    },
  },
};

createApp(App).use(ElementPlus, { locale: ElementPlusLocaleZhCn }).mount("#app");
