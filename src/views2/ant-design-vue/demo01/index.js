const { createApp, reactive, ref, computed, watch, onMounted, nextTick } = Vue;
const { message } = window.antd;

const App = {
  setup() {
    const loading = ref(false);
    const modalLoading = ref(false);

    const searchFormRef = ref();
    const searchForm = reactive({
      searchKey: '',
      vDay: null,
    });

    const dataFormRef = ref();
    const dataFormTitle = ref('详情');
    const dataFormVisible = ref(false);
    const dataFormStatus = ref('');

    const antdAppLocale = window.antd.locales.zh_CN;

    const nextMockId = ref(16);

    watch(dataFormVisible, (newValue, oldValue) => {
      console.log(`[WATCHER] dataFormVisible changed from ${oldValue} to ${newValue}`);
      if (newValue === true) {
        console.log('[WATCHER] Modal should become visible now. Check DOM.');
        nextTick(() => {
          // Check if the modal element is in the DOM after Vue has updated
          // This is a basic check; actual modal might have complex structure
          const modalWrap = document.querySelector('.ant-modal-wrap');
          if (modalWrap) {
            console.log('[WATCHER] .ant-modal-wrap found in DOM. Visible computed style:', window.getComputedStyle(modalWrap).visibility, 'Display:', window.getComputedStyle(modalWrap).display);
          } else {
            console.warn('[WATCHER] .ant-modal-wrap NOT found in DOM after dataFormVisible became true and nextTick.');
          }
        });
      }
    });

    return {
      loading,
      modalLoading,
      searchFormRef,
      searchForm,
      dataFormRef,
      dataFormTitle,
      dataFormVisible,
      dataFormStatus,
      antdAppLocale,
      nextMockId,
    };
  },

  data() {
    return {
      wsUrl: 'http://localhost:9994/pisces-boot',
      dataForm: {
        obj_id: null,
        name: '',
        rq: null,
        address: '',
      },
      dataFormRules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        rq: [{ required: true, message: '请选择日期', trigger: 'change', type: 'object' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
      },
      tableColumns: [
        { title: '姓名', dataIndex: 'name', key: 'name', width: 180 },
        { title: '日期', dataIndex: 'rq', key: 'rq', width: 180 },
        { title: '地址', dataIndex: 'address', key: 'address' },
      ],
      mockData: [
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
      ],
      dataList: [],
      selectedRowKeys: [],
      selectedRows: [],
      tableScrollY: window.innerHeight - 260,
      pagination: {
        current: 1,
        pageSize: 15,
        pageSizeOptions: ['15', '25', '35', '50', '100'],
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      },
      currentRow: {},
    };
  },

  mounted() {
    this.list();
  },

  watch: {
    'searchForm.vDay': function () {
      this.fun_search();
    }
  },

  methods: {
    formatDate(dateString, format = 'YYYY-MM-DD') {
      if (!dateString) return '';
      const date = window.dayjs(dateString, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', window.dayjs.ISO_8601]);
      return date.isValid() ? date.format(format) : dateString;
    },

    async list() {
      this.loading = true;
      this.selectedRowKeys = [];
      this.selectedRows = [];
      const currentMockData = this.mockData;
      await new Promise(resolve => setTimeout(resolve, 300));
      const searchKeyLower = this.searchForm.searchKey ? this.searchForm.searchKey.toLowerCase() : '';
      const searchMonth = this.searchForm.vDay ? window.dayjs(this.searchForm.vDay).format('YYYY-MM') : null;
      const filteredData = currentMockData.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(searchKeyLower);
        const addressMatch = item.address.toLowerCase().includes(searchKeyLower);
        const monthMatch = searchMonth ? window.dayjs(item.rq).format('YYYY-MM') === searchMonth : true;
        return (nameMatch || addressMatch) && monthMatch;
      });
      const startIndex = (this.pagination.current - 1) * this.pagination.pageSize;
      const endIndex = startIndex + this.pagination.pageSize;
      this.dataList = filteredData.slice(startIndex, endIndex);
      this.pagination.total = filteredData.length;
      this.loading = false;
    },

    fun_search() {
      this.pagination.current = 1;
      this.list();
    },

    fun_create() {
      console.log('[DEBUG] fun_create called');
      console.log('[DEBUG] this.dataFormVisible before:', this.dataFormVisible);
      this.dataFormStatus = 'create';
      this.dataFormTitle = '新建';
      Object.assign(this.dataForm, { obj_id: null, name: '', rq: null, address: '' });
      this.dataFormVisible = true;
      console.log('[DEBUG] this.dataFormVisible after:', this.dataFormVisible);
      console.log('[DEBUG] dataFormVisible ref from setup directly (if accessible):', typeof dataFormVisible !== 'undefined' ? dataFormVisible.value : 'not directly accessible here');
      nextTick(() => {
        console.log('[DEBUG] nextTick: Clearing validation for dataFormRef');
        this.dataFormRef?.clearValidate();
      });
    },

    fun_delete() {
      if (!window.antd) { console.error("Ant Design Vue not loaded!"); return; }
      if (this.selectedRowKeys.length === 0) { message.warning('请选中一条数据进行删除'); return; }
      window.antd.Modal.confirm({
        title: '确认删除',
        content: '确定要删除选中的记录吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          this.loading = true;
          const deleteId = this.selectedRowKeys[0];
          console.log('模拟删除 ID:', deleteId);
          this.mockData = this.mockData.filter(item => item.obj_id !== deleteId);
          await new Promise(resolve => setTimeout(resolve, 100));
          message.success('删除成功');
          this.loading = false;
          this.selectedRowKeys = [];
          this.selectedRows = [];
          this.pagination.current = 1;
          this.list();
        },
        onCancel() { console.log('取消删除'); },
      });
    },

    handleRowEvents(record) {
      return {
        onDblclick: () => {
          this.dataFormStatus = 'update';
          this.dataFormTitle = '编辑';
          Object.assign(this.dataForm, { ...record, rq: record.rq ? window.dayjs(record.rq) : null });
          this.dataFormVisible = true;
          nextTick(() => { this.dataFormRef?.clearValidate(); });
        },
        onClick: () => {
          this.selectedRowKeys = [record.obj_id];
          this.selectedRows = [record];
        }
      };
    },

    onSelectChange(keys, rows) {
      this.selectedRowKeys = keys;
      this.selectedRows = rows;
    },

    handleTableChange(page, pageSize) {
      this.pagination.current = page;
      this.pagination.pageSize = pageSize;
      this.list();
    },

    async handleModalOk() {
      if (!window.antd) { console.error("Ant Design Vue not loaded!"); return; }
      try {
        await this.dataFormRef.validate();
        this.modalLoading = true;
        let submitData = { ...this.dataForm, rq: this.dataForm.rq ? window.dayjs(this.dataForm.rq).format('YYYY-MM-DD') : null, };
        const isCreate = this.dataFormStatus === 'create';

        if (isCreate) {
          submitData.obj_id = this.nextMockId;
          this.mockData.unshift(submitData);
          this.nextMockId++;
        } else {
          const index = this.mockData.findIndex(item => item.obj_id === submitData.obj_id);
          if (index !== -1) {
            this.mockData.splice(index, 1, submitData);
          }
        }

        console.log(`模拟 ${isCreate ? '创建' : '更新'} 数据:`, submitData);
        await new Promise(resolve => setTimeout(resolve, 100));
        message.success(isCreate ? '创建成功' : '更新成功');
        this.modalLoading = false;
        this.dataFormVisible = false;
        this.list();
      } catch (errorInfo) {
        console.log('表单验证失败:', errorInfo);
        message.warning('请检查表单输入');
        this.modalLoading = false;
      }
    },

    handleModalCancel() {
      this.dataFormVisible = false;
    }
  }
};
createApp(App).use(window.antd).mount("#app");
