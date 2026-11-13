import { ElMessage } from "element-plus";

export default {
  data () {
    return {
      dictList:[],
      requestType: "get",
      downloadMethod: 'get',
      showSearch: true,
      autoLoadList: true,
      autoLoadDict: true,
      queryParamKey: "queryParam",
      queryParam: {},
      dict: {},
      dataSource: [],
      page: {
        current: 1,
        size: 10,
        pageSizeOptions: ["10", "20", "30", "50"],
        total: 0,
      },
      filters: {},
      loading: false,
      selectedRowKeys: [],
      selectionRows: [],
      toggleSearchStatus: false,
      superQueryFlag: false,
      superQueryParams: "",
      superQueryMatchType: "and",
      pageLoading: false,
    };
  },
  created () {
    this.$nextTick(() => {
      if (!this.$refs.modalForm) {
      }
    });
    if (this.autoLoadList && this.url && !this.isFangKeCar) {
      this.loadData();
    }
    if (this.autoLoadDict) {
      this.initDictConfig();
    }
  },
  methods: {
    async getDictListData (strSn) {
      if (strSn) {
        let strSnArr = strSn && strSn.map(e => { return 'strSn=' + e }) || [];
        await this.getAction(
          "/system/dictDtl/getMapListDtlByDicSn?" + strSnArr.join("&")
        ).then((res) => {
          this.dictList = res && res.data || {};
        });
      } else {
        this.dictList ={}
      }
    },
    async loadData (arg) {
      console.warn('loadData: API 依赖不存在，请根据实际项目实现');
    },
    beforeLoadData () {
    },
    afterLoadData () {
    },
    initDictConfig () {
    },
    getQueryParams () {
      let sqp = {};
      if (this.superQueryParams) {
        sqp["superQueryParams"] = encodeURI(this.superQueryParams);
        sqp["superQueryMatchType"] = this.superQueryMatchType;
      }
      let param = Object.assign(sqp, this.queryParam, this.filters);
      param.current = this.page.current;
      param.size = this.page.size;
      return param;
    },
    onSelectChange (selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectionRows = selectionRows;
    },
    onClearSelected () {
      this.selectedRowKeys = [];
      this.selectionRows = [];
    },
    searchQuery () {
      this.loadData(1);
    },
    searchReset () {
      for (let k in this.queryParam) {
        if (Array.isArray(this.queryParam[k])) {
          this.queryParam[k] = [];
        } else {
          this.queryParam[k] = undefined;
        }
      }
      this.loadData(1);
    },
    handleDelete: function (id, message = "是否确认删除此数据项?") {
      console.warn('handleDelete: 请设置url.remove属性');
    },
    handleEdit: function (record) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = "编辑";
      this.$refs.modalForm.disableSubmit = false;
    },
    handleAdd: function () {
      this.$refs.modalForm.add();
      this.$refs.modalForm.disableSubmit = false;
    },
    handleToggleSearch () {
      this.toggleSearchStatus = !this.toggleSearchStatus;
    },
    modalFormOk () {
      this.loadData();
    },
    handleDetail: function (record) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = "详情";
      this.$refs.modalForm.disableSubmit = true;
    },
    table_index (index) {
      return (this.page.current - 1) * this.page.size + index + 1;
    },
    handleView: function (record) {
      this.$refs.modalDetail.view(record);
    },
    handleVerify () {
      console.warn('handleVerify: 请先设置url.verifyUrl属性');
    },
    identityFilter (val) {
      if (val) {
        return val.replace(/^(.{6})(?:\w+)(.{4})$/, "$1********$2");
      } else {
        return "";
      }
    },
    handleImport (data) {
      console.warn('handleImport: 请先设置url.importUrl属性');
    },
    handleExport () {
      console.warn('handleExport: 请先设置url.exportUrl属性');
    },
    handleTemplateDownload () {
      console.warn('handleTemplateDownload: 请先设置url.templateUrl属性');
    },
    handlePagination (data) {
      this.page.current = data.current;
      this.page.size = data.size;
      this.loadData();
    },
     setDatap(data){
      let list = data.map(res => {
        return res.cardNo
      })
    },
    setDatac(data){
      let list = data.map(res => {
        return res.carNo
      })
    },
  },
};
