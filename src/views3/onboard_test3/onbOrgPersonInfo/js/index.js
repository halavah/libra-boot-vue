import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Search, Refresh, Plus, Upload, Download, Delete, Setting, CirclePlus, CircleClose } from '@element-plus/icons-vue';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'OnbOrgPersonInfo',

  components: {
    ArrowDown
  },

  data() {

    const baseUrl = '/dev-api';

    return {
      // 加载状态
      loading: false,
      dataFormLoading: false,

      // 筛选表单
      searchExpanded: false,
      searchFormRef: null,
      searchFormRules: {},

      // 表格相关
      dataTableRef: null,
      selectionRows: [],
      currentRow: {},

      // 分页
      dataTableHeight: window.innerHeight - 176,
      pageSizes: [10, 15, 25, 35, 50, 100],
      pageSize: 10,
      currentPage: 1,
      dataTotal: 0,

      // 弹框表单
      dataFormRef: null,
      dataFormTitle: '详情',
      dataFormVisible: false,
      dataFormStatus: '',

      // 图标
      Search: Search,
      Refresh: Refresh,
      Plus: Plus,
      Upload: Upload,
      Download: Download,
      Delete: Delete,
      Setting: Setting,
      CirclePlus: CirclePlus,
      CircleClose: CircleClose,
      // 请求路径
      orgPersonInfoListUrl: baseUrl + '/onboard/orgPersonInfo/list', // 组织列表
      orgPersonInfoDetailUrl: baseUrl + '/onboard/orgPersonInfo/detail', // 组织详情
      orgPersonInfoInsertUrl: baseUrl + '/onboard/orgPersonInfo/insert', // 新增组织
      orgPersonInfoUpdateUrl: baseUrl + '/onboard/orgPersonInfo/update', // 更新组织
      orgPersonInfoDeleteUrl: baseUrl + '/onboard/orgPersonInfo/delete', // 删除组织
      orgPersonInfoExportUrl: baseUrl + '/onboard/orgPersonInfo/export', // 导出组织
      // 请求路径-批量
      orgPersonInfoDeleteBatchUrl: baseUrl + '/onboard/orgPersonInfo/deleteBatch', // 批量删除组织

      // 主表查询
      searchForm: {
        orgName: '',       // 部门名称
        orgNo: '',         // 部门编码
        dateSteward: '',   // 数据管家
        dateStewardNo: '', // 数据管家工号
        companyId: '',     // 公司编码
        orgLevel: ''      // 组织层级
      },

      // 主表数据
      dataList: [],

      // 主表表单
      dataForm: {
        id: '',            // 主键ID
        orgName: '',       // 部门名称
        orgNo: '',         // 部门编码
        dateSteward: '',   // 数据管家
        dateStewardNo: '', // 数据管家工号
        companyId: '',     // 公司编码
        orgLevel: '',      // 组织层级
        updateUser: '',    // 更新人
        updateTime: ''     // 更新日期
      },

      // 主表验证
      dataFormRules: {
        orgName: [
          { required: true, message: '请输入部门名称', trigger: 'blur' },
          { min: 2, max: 50, message: '部门名称长度在2-50个字符', trigger: 'blur' }
        ],
        orgNo: [
          { required: true, message: '请输入部门编码', trigger: 'blur' },
          { min: 2, max: 20, message: '部门编码长度在2-20个字符', trigger: 'blur' }
        ],
        dateSteward: [
          { required: true, message: '请输入数据管家', trigger: 'blur' },
          { min: 2, max: 20, message: '数据管家长度在2-20个字符', trigger: 'blur' }
        ],
        dateStewardNo: [
          { required: true, message: '请输入数据管家工号', trigger: 'blur' },
          { min: 2, max: 20, message: '数据管家工号长度在2-20个字符', trigger: 'blur' }
        ],
        companyId: [
          { required: true, message: '请输入公司编码', trigger: 'blur' },
          { min: 2, max: 20, message: '公司编码长度在2-20个字符', trigger: 'blur' }
        ],
        orgLevel: [
          { required: true, message: '请输入组织层级', trigger: 'blur' },
          { min: 1, max: 10, message: '组织层级长度在1-10个字符', trigger: 'blur' }
        ]
      }
    };
  },

  computed: {
    // 是否无勾选
    isSelectionEmpty() {
      try {
        return !Array.isArray(this.selectionRows) || this.selectionRows.length === 0;
      } catch (e) {
        return true;
      }
    },
    // 分页数据
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.dataList.slice(start, end);
    }
  },

  mounted() {
    this.query();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {

    //************************************************ 第1部分：筛选 ********************************************************

    // 切换筛选展开
    toggleSearchExpanded() {
      this.searchExpanded = !this.searchExpanded;
    },

    //************************************************ 第2部分：主表 ********************************************************

    // 查询数据方法调用
    async query() {
      this.loading = true;
      try {
        const response = await axios.post(this.orgPersonInfoListUrl, this.searchForm);
        if (response.data.code === 2000) {
          this.dataList = response.data.data || [];
          this.dataTotal = this.dataList.length;
        } else {
          ElMessage.error(response.data.message || '获取数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败');
        console.error('查询失败:', error);
      } finally {
        this.loading = false;
      }
    },

    // 查询按钮事件
    async fun_search(formEl) {
      if (!formEl) {
        return;
      }
      formEl.validate((valid) => {
        if (valid) {
          this.query();
        } else {
          ElMessage.warning('请检查相关参数');
        }
      });
    },

    // 重置按钮事件
    async fun_reset(formEl) {
      if (!formEl) {
        return;
      }
      formEl.resetFields();
      this.searchForm = {
        orgName: '',
        orgNo: '',
        dateSteward: '',
        dateStewardNo: '',
        companyId: '',
        orgLevel: ''
      };
      this.query();
    },

    // 导出操作
    async fun_export() {
      this.loading = true;
      try {
        const params = {
          orgName: this.searchForm.orgName,
          orgNo: this.searchForm.orgNo,
          dateSteward: this.searchForm.dateSteward,
          dateStewardNo: this.searchForm.dateStewardNo,
          companyId: this.searchForm.companyId,
          orgLevel: this.searchForm.orgLevel
        };
        const res = await axios.post(this.orgPersonInfoExportUrl, params, {
          responseType: 'blob'
        });
        if (res.data) {
          const blob = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = decodeURIComponent(res.headers['file-name'] || '导出.xlsx');
          link.click();
          window.URL.revokeObjectURL(link.href);
        } else {
          ElMessage.error('导出失败');
        }
      } catch (error) {
        ElMessage.error('导出失败');
        console.error('导出失败:', error);
      } finally {
        this.loading = false;
      }
    },

    //************************************************ 第2部分：主表 ********************************************************

    // 新增按钮事件
    fun_create() {
      this.dataFormStatus = 'create';
      this.dataFormTitle = '新增组织';
      this.dataFormVisible = true;
      // 重置表单数据
      this.dataForm = {
        id: '',
        orgName: '',
        orgNo: '',
        dateSteward: '',
        dateStewardNo: '',
        companyId: '',
        orgLevel: '',
        updateUser: '',
        updateTime: ''
      };
    },

    // 按钮_详情
    async fun_detail(row) {
      this.dataFormStatus = 'detail';
      this.dataFormTitle = '组织详情';
      this.dataFormVisible = true;
      await this.loadOrgDetail(row.id);
    },

    // 按钮_编辑
    async fun_edit(row) {
      this.dataFormStatus = 'update';
      this.dataFormTitle = '编辑组织';
      this.dataFormVisible = true;
      await this.loadOrgDetail(row.id);
    },

    // 按钮_删除
    async fun_delete(id) {
      try {
        await ElMessageBox.confirm(
          '确认删除该组织信息吗？此操作不可撤销！',
          '删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const response = await axios.post(this.orgPersonInfoDeleteUrl, { id });

        if (response.data.code === 2000) {
          ElMessage.success('删除成功');
          this.query();
        } else {
          ElMessage.error(response.data.message || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
          console.error('删除失败:', error);
        }
      } finally {
        this.loading = false;
      }
    },

    // 按钮_保存
    async fun_save() {
      try {
        const valid = await this.$refs.dataFormRef.validate();
        if (!valid) {
          ElMessage.warning('请检查表单参数');
          return;
        }
        this.dataFormLoading = true;

        if (this.dataFormStatus === 'update') {
          await this.handleUpdateSave();
        } else if (this.dataFormStatus === 'create') {
          await this.handleCreateSave();
        } else {
          ElMessage.error('未知的操作类型');
        }
      } catch (error) {
        ElMessage.error('保存失败，请重试');
        console.error('保存失败:', error);
      } finally {
        this.dataFormLoading = false;
      }
    },

    // 新增保存
    async handleCreateSave() {
      const payload = {
        orgName: this.dataForm.orgName,
        orgNo: this.dataForm.orgNo,
        dateSteward: this.dataForm.dateSteward,
        dateStewardNo: this.dataForm.dateStewardNo,
        companyId: this.dataForm.companyId,
        orgLevel: this.dataForm.orgLevel
      };

      const response = await axios.post(this.orgPersonInfoInsertUrl, payload);

      if (response.data.code === 2000) {
        ElMessage.success('新增成功');
        this.query();
        this.dataFormVisible = false;
      } else {
        ElMessage.error(response.data.message || '新增失败');
      }
    },

    // 编辑保存
    async handleUpdateSave() {
      const payload = {
        id: this.dataForm.id,
        orgName: this.dataForm.orgName,
        orgNo: this.dataForm.orgNo,
        dateSteward: this.dataForm.dateSteward,
        dateStewardNo: this.dataForm.dateStewardNo,
        companyId: this.dataForm.companyId,
        orgLevel: this.dataForm.orgLevel
      };

      const response = await axios.post(this.orgPersonInfoUpdateUrl, payload);

      if (response.data.code === 2000) {
        ElMessage.success('修改成功');
        this.query();
        this.dataFormVisible = false;
      } else {
        ElMessage.error(response.data.message || '修改失败');
      }
    },

    // 加载组织详情
    async loadOrgDetail(id) {
      try {
        const response = await axios.post(this.orgPersonInfoDetailUrl, { id });
        if (response.data.code === 2000) {
          const data = response.data.data;
          this.dataForm = {
            id: data.id || '',
            orgName: data.orgName || '',
            orgNo: data.orgNo || '',
            dateSteward: data.dateSteward || '',
            dateStewardNo: data.dateStewardNo || '',
            companyId: data.companyId || '',
            orgLevel: data.orgLevel || '',
            updateUser: data.updateUser || '',
            updateTime: data.updateTime || ''
          };
        } else {
          ElMessage.error(response.data.message || '获取详情失败');
        }
      } catch (error) {
        ElMessage.error('获取详情失败');
        console.error('获取详情失败:', error);
      }
    },

    //************************************************ 区域：批量操作 *****************************************************

    // 批量删除实现
    async fun_batchDelete() {
      if (this.isSelectionEmpty) {
        ElMessage.warning('请选择要删除的数据');
        return;
      }

      try {
        await ElMessageBox.confirm(
          `确认删除选中的 ${this.selectionRows.length} 条数据吗？此操作不可撤销！`,
          '删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const ids = this.selectionRows.map(item => item.id);

        const response = await axios.post(this.orgPersonInfoDeleteBatchUrl, { ids });

        if (response.data.code === 2000) {
          ElMessage.success('批量删除成功');
          this.query();
          this.selectionRows = [];
        } else {
          ElMessage.error(response.data.message || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
          console.error('批量删除失败:', error);
        }
      } finally {
        this.loading = false;
      }
    },

    //************************************************ 区域：辅助方法 *****************************************************

    // 表格_多选
    handleSelectionChange(selection) {
      this.selectionRows = selection;
    },

    // 页码变化
    handleCurrentChange(val) {
      this.currentPage = val;
    },

    // 每页大小变化
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },

    // 日期格式化
    formatDate(date) {
      if (!date) {
        return '-';
      }
      return dayjs(date).format('YYYY-MM-DD');
    },

    // 窗口大小监听
    handleResize() {
      this.dataTableHeight = window.innerHeight - 176;
    }
  }
};
