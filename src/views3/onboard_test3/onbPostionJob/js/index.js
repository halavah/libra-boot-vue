import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Search, Refresh, Plus, Upload, Download, Delete, Setting, CirclePlus, CircleClose } from '@element-plus/icons-vue';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'onbPostionJob',

  components: {
    ArrowDown
  },

  data() {

    const baseUrl = '/dev-api';

    return {
      // 加载状态
      loading: false,
      dataFormLoading: false,

      // 筛选表单（展开/引用/规则）
      searchExpanded: true,
      searchFormRef: null,
      searchFormRules: {},

      // 表格与选择
      dataTableRef: null,
      selectionRows: [],
      currentRow: {},

      // 分页
      dataTableHeight: window.innerHeight - 176,
      pageSizes: [10, 15, 25, 35, 50, 100],
      pageSize: 10,
      currentPage: 1,
      dataTotal: 0,

      // 弹框表单（引用/标题/显隐/状态）
      dataFormRef: null,
      dataFormTitle: '详情',
      dataFormVisible: false,
      dataFormStatus: '',

      // 图标组件（用于 :icon 绑定）
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
      positionJobListUrl: baseUrl + '/onboard/positionJob/list', // 招聘岗位列表
      positionJobDetailUrl: baseUrl + '/onboard/positionJob/detail', // 招聘岗位详情
      positionJobInsertUrl: baseUrl + '/onboard/positionJob/insert', // 新增岗位
      positionJobUpdateUrl: baseUrl + '/onboard/positionJob/update', // 更新岗位
      positionJobDeleteUrl: baseUrl + '/onboard/positionJob/delete', // 删除岗位
      positionJobExportUrl: baseUrl + '/onboard/positionJob/export', // 导出岗位
      // 请求路径-批量
      positionJobOpenBatchUrl: baseUrl + '/onboard/positionJob/openBatch', // 批量启用岗位
      positionJobCloseBatchUrl: baseUrl + '/onboard/positionJob/closeBatch', // 批量禁用岗位
      positionJobDeleteBatchUrl: baseUrl + '/onboard/positionJob/deleteBatch', // 批量删除岗位

      // 主表查询
      searchForm: {
        deptName: '',      // 部门中文
        deptNo: '',        // 部门编码
        positionName: '',  // 岗位中文
        positionNo: '',    // 岗位编码
        openFlag: 'Y'       // 是否开放，默认显示全部
      },

      // 主表数据
      dataList: [],

      // 主表表单
      dataForm: {
        id: '',            // 主键ID
        deptName: '',      // 部门中文
        deptNo: '',        // 部门编码
        positionName: '',  // 岗位中文
        positionNo: '',    // 岗位编码
        openFlag: 'Y',     // 是否开放, 默认'Y'
        updateUser: '',    // 更新人
        updateTime: ''     // 更新日期
      },

      // 主表验证
      dataFormRules: {
        deptName: [
          { required: true, message: '请输入部门名称', trigger: 'blur' },
          { min: 2, max: 50, message: '部门名称长度在2-50个字符', trigger: 'blur' }
        ],
        deptNo: [
          { required: true, message: '请输入部门编码', trigger: 'blur' },
          { min: 1, max: 50, message: '部门编码长度在1-50个字符', trigger: 'blur' }
        ],
        positionName: [
          { required: true, message: '请输入岗位名称', trigger: 'blur' },
          { min: 1, max: 50, message: '岗位名称长度在1-50个字符', trigger: 'blur' }
        ],
        positionNo: [
          { required: true, message: '请输入岗位编码', trigger: 'blur' },
          { min: 1, max: 50, message: '岗位编码长度在1-50个字符', trigger: 'blur' }
        ],
        openFlag: [
          { required: true, message: '请选择是否开放', trigger: 'change' }
        ]
      }
    };
  },

  computed: {
    // 是否无勾选（用于禁用顶部按钮）
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
    // 查询数据
    this.query();
    // 监听窗口变化
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

    // 查询_表格
    async query() {
      this.loading = true;
      try {
        const response = await axios({
          url: this.positionJobListUrl,
          method: 'POST',
          data: this.searchForm
        });
        if (response.data.code === 2000) {
          this.dataList = response.data.data || [];
          this.dataTotal = this.dataList.length;
        } else {
          ElMessage.error(response.data.message || '获取数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败');
        console.error('[onbPostionJob] query failed:', error);
      }
      this.loading = false;
    },

    // 按钮_查询
    async fun_search(formEl) {
      if (!formEl) {
        return;
      }
      await formEl.validate((valid) => {
        if (valid) {
          this.currentPage = 1; // 查询时重置到第一页
          this.query();
        } else {
          ElMessage.warning('请检查相关参数');
        }
      });
    },

    // 按钮_重置
    async fun_reset(formEl) {
      if (!formEl) {
        return;
      }
      formEl.resetFields();
      this.searchForm = {
        deptName: '',
        deptNo: '',
        positionName: '',
        positionNo: '',
        openFlag: ''
      };
      this.currentPage = 1; // 重置时回到第一页
      this.query();
    },

    // 导出数据
    async fun_export() {
      try {
        this.loading = true;
        const res = await axios({
          url: this.positionJobExportUrl,
          method: 'POST',
          data: this.searchForm,
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
        console.error('导出失败:', error);
        ElMessage.error('导出失败');
      } finally {
        this.loading = false;
      }
    },

    //************************************************ 第2部分：主表 ********************************************************

    // 按钮_新增
    fun_create() {
      this.dataFormStatus = 'create';
      this.dataFormTitle = '新增岗位';
      // 重置表单，为新增做准备
      this.dataForm = {
        id: '',
        deptName: '',
        deptNo: '',
        positionName: '',
        positionNo: '',
        openFlag: 'Y', // 新增时默认为开放
        updateUser: '',
        updateTime: ''
      };
      this.dataFormVisible = true;
      this.$nextTick(() => {
        this.$refs.dataFormRef.clearValidate();
      });
    },

    // 按钮_详情
    async fun_detail(row) {
      this.dataFormStatus = 'detail';
      this.dataFormTitle = '岗位详情';
      this.dataFormVisible = true;
      await this.loadOrgDetail(row.id);
    },

    // 按钮_编辑
    async fun_edit(row) {
      this.dataFormStatus = 'update';
      this.dataFormTitle = '编辑岗位';
      this.dataFormVisible = true;
      await this.loadOrgDetail(row.id);
    },

    // 按钮_删除
    async fun_delete(id) {
      try {
        await ElMessageBox.confirm(
          '确认删除该招聘岗位吗？此操作不可撤销！',
          '删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const response = await axios({
          url: this.positionJobDeleteUrl,
          method: 'POST',
          data: { id: id }
        });

        if (response.data.code === 2000) {
          ElMessage.success('删除成功');
          this.query();
        } else {
          ElMessage.error(response.data.message || '删除失败');
        }
        this.loading = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
        }
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
        if (this.dataFormStatus === 'create') {
          await this.handleCreateSave();
        } else if (this.dataFormStatus === 'update') {
          await this.handleUpdateSave();
        } else {
          ElMessage.error('未知的操作类型');
        }
      } catch (error) {
        // 错误消息在各自的处理函数中提示
        console.error('保存失败:', error);
      } finally {
        this.dataFormLoading = false;
      }
    },

    // 处理新增保存
    async handleCreateSave() {
      try {
        const response = await axios.post(this.positionJobInsertUrl, this.dataForm);
        if (response.data.code === 2000) {
          ElMessage.success('新增成功');
          this.query();
          this.dataFormVisible = false;
        } else {
          ElMessage.error(response.data.message || '新增失败');
        }
      } catch (error) {
        ElMessage.error('请求失败，新增操作未完成');
      }
    },

    // 处理编辑保存
    async handleUpdateSave() {
      try {
        const payload = {
          id: this.dataForm.id,
          deptName: this.dataForm.deptName,
          deptNo: this.dataForm.deptNo,
          positionName: this.dataForm.positionName,
          positionNo: this.dataForm.positionNo,
          openFlag: this.dataForm.openFlag,
        };
        const response = await axios.post(this.positionJobUpdateUrl, payload);
        if (response.data.code === 2000) {
          ElMessage.success('修改成功');
          this.query(); // 关键：刷新列表以同步状态
          this.dataFormVisible = false;
        } else {
          ElMessage.error(response.data.message || '修改失败');
        }
      } catch (error) {
        ElMessage.error('请求失败，修改操作未完成');
      }
    },

    // 加载招聘岗位详情
    async loadOrgDetail(id) {
      try {
        const response = await axios.post(this.positionJobDetailUrl, { id });
        if (response.data.code === 2000) {
          this.dataForm = response.data.data || {};
        } else {
          ElMessage.error(response.data.message || '获取详情失败');
        }
      } catch (error) {
        ElMessage.error('获取详情失败');
        console.error('获取详情失败:', error);
      }
    },

    //************************************************ 区域：批量操作 *****************************************************

    // 按钮_批量删除
    async fun_batchDelete() {
      if (this.isSelectionEmpty) {
        ElMessage.warning('请勾选需要删除的岗位');
        return;
      }
      try {
        await ElMessageBox.confirm(
          `确认删除选中的 ${this.selectionRows.length} 个岗位吗？此操作不可撤销！`,
          '批量删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );
        this.loading = true;
        const ids = this.selectionRows.map(item => item.id);
        const response = await axios.post(this.positionJobDeleteBatchUrl, { ids });
        if (response.data.code === 2000) {
          ElMessage.success('删除成功');
          this.query();
        } else {
          ElMessage.error(response.data.message || '批量删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除操作失败');
        }
      } finally {
        this.loading = false;
      }
    },

    // 按钮_开放
    async fun_open() {
      if (this.isSelectionEmpty) {
        ElMessage.warning('请先勾选需要开放的岗位');
        return;
      }
      const toOpenRows = this.selectionRows.filter(item => item.openFlag === 'N');
      if (toOpenRows.length === 0) {
        ElMessage.info('您勾选的岗位均已是开放状态');
        return;
      }
      try {
        await ElMessageBox.confirm(
          `在您勾选的岗位中，有 ${toOpenRows.length} 个可被设为开放，确认操作吗？`,
          '批量启用确认',
          {
            type: 'warning',
            confirmButtonText: '确认',
            cancelButtonText: '取消'
          }
        );
        this.loading = true;
        const ids = toOpenRows.map(item => item.id);
        const resp = await axios.post(this.positionJobOpenBatchUrl, { ids });
        if (resp?.data?.code === 2000) {
          ElMessage.success('批量启用成功');
          this.query();
        } else {
          ElMessage.error(resp?.data?.message || '批量启用失败');
        }
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error('批量启用操作失败');
        }
      } finally {
        this.loading = false;
      }
    },

    // 按钮_关闭
    async fun_close() {
      if (this.isSelectionEmpty) {
        ElMessage.warning('请先勾选需要关闭的岗位');
        return;
      }
      const toCloseRows = this.selectionRows.filter(item => item.openFlag === 'Y');
      if (toCloseRows.length === 0) {
        ElMessage.info('您勾选的岗位均已是关闭状态');
        return;
      }
      try {
        await ElMessageBox.confirm(
          `在您勾选的岗位中，有 ${toCloseRows.length} 个可被设为关闭，确认操作吗？`,
          '批量禁用确认',
          {
            type: 'warning',
            confirmButtonText: '确认',
            cancelButtonText: '取消'
          }
        );
        this.loading = true;
        const ids = toCloseRows.map(item => item.id);
        const resp = await axios.post(this.positionJobCloseBatchUrl, { ids });
        if (resp?.data?.code === 2000) {
          ElMessage.success('批量禁用成功');
          this.query();
        } else {
          ElMessage.error(resp?.data?.message || '批量禁用失败');
        }
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error('批量禁用操作失败');
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

    // 第N页
    handleCurrentChange(val) {
      this.currentPage = val
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    // 格式化日期
    formatDate(date) {
      if (!date) {
        return '-';
      }
      return dayjs(date).format('YYYY-MM-DD');
    },

    // 窗口大小监听
    handleResize() {
      this.dataTableHeight = window.innerHeight - 176;
    },
  }
};
