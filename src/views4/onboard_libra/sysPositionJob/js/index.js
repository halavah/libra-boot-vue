import { ArrowDown, Search, Refresh, Plus, Upload, Download, Delete, Setting, CirclePlus, CircleClose, Loading, RefreshRight } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { markRaw } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';

// 调试用户
const debugUser = 'demo-user';
//const debugUser = 'demo-user';

export default {
  name: 'SysPositionJob',

  components: {
    ArrowDown: markRaw(ArrowDown),
    Loading: markRaw(Loading),
    RefreshRight: markRaw(RefreshRight)
  },

  data() {
    // 岗位管理页面权限配置
    const BUTTON_PERMISSIONS = {
      FULL: {
        query: true,          // 查询（详情）
        add: true,            // 新增
        edit: true,           // 编辑
        delete: true,         // 删除
        export: true,         // 导出
        syncFromErp: true,    // 从ERP同步
        open: true,           // 开放岗位
        close: true,          // 关闭岗位
        batchDelete: true     // 批量删除
      },
      PARTIAL: {
        query: true,          // 查询（详情）
        add: false,           // 新增
        edit: false,          // 编辑
        delete: false,        // 删除
        export: false,        // 导出
        syncFromErp: false,   // 从ERP同步
        open: false,          // 开放岗位
        close: false,         // 关闭岗位
        batchDelete: false    // 批量删除
      }
    };

    // 环境变量调试
    const baseUrl = 'http://127.0.0.1:9941/libra-onboard';
    console.log('=== 环境变量调试 ===');
    console.log('1. import.meta.env.MODE:', import.meta.env.MODE);
    console.log('2. baseUrl 计算结果:', baseUrl);
    console.log('3. 完整 import.meta.env:', import.meta.env);
    console.log('==================');

    return {
      // 权限相关
      hasPageAccess: false,        // 是否有页面访问权限
      permissionLevel: null,       // 权限级别: 'FULL' | 'PARTIAL' | null
      permissionLoading: true,     // 权限检查加载状态
      BUTTON_PERMISSIONS,          // 按钮权限配置

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
      Search: markRaw(Search),
      Refresh: markRaw(Refresh),
      Plus: markRaw(Plus),
      Upload: markRaw(Upload),
      Download: markRaw(Download),
      Delete: markRaw(Delete),
      Setting: markRaw(Setting),
      CirclePlus: markRaw(CirclePlus),
      CircleClose: markRaw(CircleClose),
      Loading: markRaw(Loading),
      Lock: markRaw(Lock),
      RefreshRight: markRaw(RefreshRight),

      // 请求路径
      positionJobListUrl: baseUrl + '/sys/positionJob/page', // 招聘岗位列表 - 后端分页
      positionJobDetailUrl: baseUrl + '/sys/positionJob/detail', // 招聘岗位详情
      positionJobInsertUrl: baseUrl + '/sys/positionJob/insert', // 新增岗位
      positionJobUpdateUrl: baseUrl + '/sys/positionJob/update', // 更新岗位
      positionJobDeleteUrl: baseUrl + '/sys/positionJob/delete', // 删除岗位
      positionJobExportUrl: baseUrl + '/sys/positionJob/export', // 导出岗位
      // 请求路径-批量
      positionJobOpenBatchUrl: baseUrl + '/sys/positionJob/openBatch', // 批量启用岗位
      positionJobCloseBatchUrl: baseUrl + '/sys/positionJob/closeBatch', // 批量禁用岗位
      positionJobDeleteBatchUrl: baseUrl + '/sys/positionJob/deleteBatch', // 批量删除岗位
      // ERP同步相关
      positionSyncFromErpUrl: baseUrl + '/sys/xxlJob/position/sync', // 从ERP同步岗位
      // 请求路径：权限检查
      checkPermission: baseUrl + '/sys/personInfo/checkPermission', // POST请求

      // 主表查询
      searchForm: {
        deptName: '',      // 部门中文
        deptNo: '',        // 部门编码
        positionName: '',  // 岗位中文
        positionNo: '',    // 岗位编码
        openFlag: 'Y'      // 是否开放，默认为空（全部）
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
    // 已移除前端分页，使用后端分页
    // dataList 直接来自后端返回的当前页数据

    // 按钮可见性计算属性
    buttonVisibility() {
      if (!this.permissionLevel) {
        // 权限未加载完成，所有按钮都不可见
        return {
          query: false,
          add: false,
          edit: false,
          delete: false,
          export: false,
          open: false,
          close: false,
          batchDelete: false
        };
      }

      if (this.permissionLevel === 'FULL') {
        return this.BUTTON_PERMISSIONS.FULL;
      } else if (this.permissionLevel === 'PARTIAL') {
        return this.BUTTON_PERMISSIONS.PARTIAL;
      }

      // 默认所有按钮都不可见
      return {
        query: false,
        add: false,
        edit: false,
        delete: false,
        export: false,
        open: false,
        close: false,
        batchDelete: false
      };
    }
  },

  async mounted() {
    // 检查页面访问权限
    await this.checkPageAccess();

    // 只有在有权限的情况下才继续后续操作
    if (this.hasPageAccess) {
      // 查询数据
      this.query();
      // 监听窗口变化
      this.handleResize();
      window.addEventListener('resize', this.handleResize);
    }
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {

    //************************************************ 第0部分：权限控制 *****************************************************

    // 页面访问权限检查
    async checkPageAccess() {
      // 1. 检查缓存
      if (this.permissionCache) {
        this.hasPageAccess = this.permissionCache.hasAccess;
        this.permissionLevel = this.permissionCache.level;
        this.permissionLoading = false;
        return;
      }

      try {
        this.permissionLoading = true;

        // 固定当前用户为 admin
        const currentUser = debugUser;

        // admin 用户直接赋予完全权限
        this.hasPageAccess = true;
        this.permissionLevel = 'FULL';
        // 缓存结果
        this.permissionCache = { hasAccess: true, level: 'FULL' };

        // 3. 调用后端 API 检查权限
        const response = await axios({
          url: this.checkPermission,
          method: 'POST',
          data: { userNo: currentUser }
        });

        if (response && response.data.code === 2000 && response.data.data) {
          const data = response.data.data;

          if (data.hasAccess) {
            this.hasPageAccess = true;

            // 4. 根据 oepn_flag 确定权限级别
            if (data.oepnFlag === 'Y') {
              this.permissionLevel = 'FULL';
            } else if (data.oepnFlag === 'N') {
              this.permissionLevel = 'PARTIAL';
            } else {
              // oepn_flag 值异常
              this.hasPageAccess = false;
              this.permissionLevel = 'NONE';
              ElMessage.error('权限数据异常，请联系管理员');
            }

            // 缓存结果
            this.permissionCache = {
              hasAccess: this.hasPageAccess,
              level: this.permissionLevel
            };
          } else {
            // 用户不在 OnbOrgPersonInfo 表中
            this.hasPageAccess = false;
            this.permissionLevel = 'NONE';
            ElMessage.error('您没有访问此页面的权限');
          }
        } else {
          // API 返回失败
          this.hasPageAccess = false;
          this.permissionLevel = 'NONE';
          ElMessage.error('权限验证失败，请稍后重试');
        }
      } catch (error) {
        console.error('权限检查失败:', error);
        this.hasPageAccess = false;
        this.permissionLevel = 'NONE';
        ElMessage.error('权限验证失败，请稍后重试');
      } finally {
        this.permissionLoading = false;
      }
    },

    // 单个按钮权限检查方法
    canPerform(action) {
      return this.buttonVisibility[action] === true;
    },

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
          url: this.positionJobListUrl + '?pageNum=' + this.currentPage + '&pageSize=' + this.pageSize,
          method: 'POST',
          data: this.searchForm
        });
        if (response.data.code === 2000) {
          this.dataList = response.data.data.records || [];
          this.dataTotal = response.data.data.total || 0;
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
        openFlag: 'Y'
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

    // 从ERP同步岗位数据
    async fun_syncFromErp() {
      try {
        await ElMessageBox.confirm(
          '确认从ERP系统同步所有招聘岗位数据吗？此操作将更新现有岗位数据！',
          '同步确认',
          {
            type: 'warning',
            confirmButtonText: '确认同步',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        ElMessage.info('正在从ERP同步岗位数据，请稍候...');

        const response = await axios.get(this.positionSyncFromErpUrl);

        if (response.data.code === 2000) {
          const result = response.data.data;
          if (result.code === 2000) {
            ElMessage.success(`同步成功！同步岗位数：${result.totalCount}，成功：${result.successCount}，失败：${result.failCount}`);
            this.query(); // 刷新列表
          } else {
            ElMessage.error(result.message || '同步失败');
          }
        } else {
          ElMessage.error(response.data.message || '同步失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('同步失败');
          console.error('ERP同步失败:', error);
        }
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
        const response = await axios({
          url: this.positionJobInsertUrl,
          method: 'POST',
          data: this.dataForm
        });
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
        const response = await axios({
          url: this.positionJobUpdateUrl,
          method: 'POST',
          data: payload
        });
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
        const response = await axios({
          url: this.positionJobDetailUrl,
          method: 'POST',
          data: { id }
        });
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
        const response = await axios({
          url: this.positionJobDeleteBatchUrl,
          method: 'POST',
          data: { ids }
        });
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
        const resp = await axios({
          url: this.positionJobOpenBatchUrl,
          method: 'POST',
          data: { ids }
        });
        if (resp?.data.code === 2000) {
          ElMessage.success('批量启用成功');
          this.query();
        } else {
          ElMessage.error(resp?.data.message || '批量启用失败');
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
        const resp = await axios({
          url: this.positionJobCloseBatchUrl,
          method: 'POST',
          data: { ids }
        });
        if (resp?.data.code === 2000) {
          ElMessage.success('批量禁用成功');
          this.query();
        } else {
          ElMessage.error(resp?.data.message || '批量禁用失败');
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

    // 第N页 - 后端分页需要重新查询
    handleCurrentChange(val) {
      this.currentPage = val;
      this.query();
    },

    // 分页大小改变 - 后端分页需要重新查询
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.query();
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
