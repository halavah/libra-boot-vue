import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Search, Refresh, Plus, Upload, Download, Delete, Setting, CirclePlus, CircleClose, Loading, Lock, RefreshRight } from '@element-plus/icons-vue';
import { markRaw } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';

// 调试用户
const debugUser = 'demo-user';
//const debugUser = 'demo-user';

export default {
  name: 'SysPersonInfo',

  components: {
    ArrowDown: markRaw(ArrowDown),
    Loading: markRaw(Loading)
  },

  data() {
    // 组织部门页面权限配置
    const BUTTON_PERMISSIONS = {
      FULL: {
        query: true,          // 查询（详情）
        add: true,            // 新增
        edit: true,           // 编辑
        delete: true,         // 删除
        export: true,         // 导出
        syncToErp: true,      // 同步到ERP
        setAdmin: true,       // 设为管理员
        cancelAdmin: true,    // 取消管理员
        batchDelete: true     // 批量删除
      },
      PARTIAL: {
        query: true,          // 查询（详情）
        add: false,           // 新增
        edit: false,          // 编辑
        delete: false,        // 删除
        export: false,        // 导出
        syncToErp: false,     // 同步到ERP
        setAdmin: false,      // 设为管理员
        cancelAdmin: false,   // 取消管理员
        batchDelete: false    // 批量删除
      }
    };

    // 环境变量调试
    const baseUrl = '/' + import.meta.env.MODE + '-api';
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

      // 筛选表单
      searchExpanded: true,
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
      orgPersonInfoListUrl: baseUrl + '/onboard/sys/personInfo/page', // 组织列表 - 后端分页
      orgPersonInfoDetailUrl: baseUrl + '/onboard/sys/personInfo/detail', // 组织详情
      orgPersonInfoInsertUrl: baseUrl + '/onboard/sys/personInfo/insert', // 新增组织
      orgPersonInfoUpdateUrl: baseUrl + '/onboard/sys/personInfo/update', // 更新组织
      orgPersonInfoDeleteUrl: baseUrl + '/onboard/sys/personInfo/delete', // 删除组织
      orgPersonInfoExportUrl: baseUrl + '/onboard/sys/personInfo/export', // 导出组织
      // 请求路径-批量
      orgPersonInfoOpenBatchUrl: baseUrl + '/onboard/sys/personInfo/openBatch', // 批量设为管理员
      orgPersonInfoCloseBatchUrl: baseUrl + '/onboard/sys/personInfo/closeBatch', // 批量取消管理员
      orgPersonInfoDeleteBatchUrl: baseUrl + '/onboard/sys/personInfo/deleteBatch', // 批量删除组织
      // ERP同步相关
      applicantSyncToErpUrl: baseUrl + '/onboard/xxlJob/applicant/sync', // 同步应聘者到ERP
      // 请求路径：权限检查
      checkPermission: baseUrl + '/onboard/sys/personInfo/checkPermission', // POST请求

      // 主表查询
      searchForm: {
        orgName: '',       // 部门名称
        orgNo: '',         // 部门编码
        dateSteward: '',   // 数据管家
        dateStewardNo: '', // 数据管家工号
        companyId: '',     // 公司编码
        orgLevel: '',      // 组织层级
        oepnFlag: '',      // 是否管理员，默认全部
        ignoreJobNo: false
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
        oepnFlag: 'N',     // 是否管理员，默认'N'
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
        ],
        oepnFlag: [
          { required: true, message: '请选择是否管理员', trigger: 'change' }
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
    // 已移除前端分页，使用后端分页
    // dataList 直接来自后端返回的当前页数据

    // 按钮可见性计算属性
    buttonVisibility() {
      if (!this.permissionLevel) {
        return {
          query: false,
          add: false,
          edit: false,
          delete: false,
          export: false,
          setAdmin: false,
          cancelAdmin: false,
          batchDelete: false
        };
      }

      if (this.permissionLevel === 'FULL') {
        return this.BUTTON_PERMISSIONS.FULL;
      } else if (this.permissionLevel === 'PARTIAL') {
        return this.BUTTON_PERMISSIONS.PARTIAL;
      }

      return {
        query: false,
        add: false,
        edit: false,
        delete: false,
        export: false,
        setAdmin: false,
        cancelAdmin: false,
        batchDelete: false
      };
    }
  },

  async mounted() {
    // 检查页面访问权限
    await this.checkPageAccess();

    // 只有在有权限的情况下才继续后续操作
    if (this.hasPageAccess) {
      this.query();
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

    // 查询数据方法调用
    async query() {
      this.loading = true;
      try {
        const response = await axios({
          url: this.orgPersonInfoListUrl + '?pageNum=' + this.currentPage + '&pageSize=' + this.pageSize,
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
          this.currentPage = 1; // 查询时重置到第一页
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
        orgLevel: '',
        oepnFlag: '',
        ignoreJobNo: false
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
          orgLevel: this.searchForm.orgLevel,
          ignoreJobNo: true
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

    // 同步应聘者数据到ERP
    async fun_syncToErp() {
      try {
        await ElMessageBox.confirm(
          '确认将录用审批已通过的应聘者数据同步到ERP系统吗？',
          '同步确认',
          {
            type: 'warning',
            confirmButtonText: '确认同步',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        ElMessage.info('正在同步应聘者数据到ERP，请稍候...');

        const response = await axios.get(this.applicantSyncToErpUrl + '?syncType=approved');

        if (response.data.code === 2000) {
          const result = response.data.data;
          if (result.code === 2000) {
            ElMessage.success(`同步成功！应聘者总数：${result.totalCount}，成功：${result.successCount}，失败：${result.failCount}`);
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

    // 新增按钮事件
    fun_create() {
      this.dataFormStatus = 'create';
      this.dataFormTitle = '新增组织';
      // 重置表单，为新增做准备
      this.dataForm = {
        id: '',
        orgName: '',
        orgNo: '',
        dateSteward: '',
        dateStewardNo: '',
        companyId: '',
        orgLevel: '',
        oepnFlag: 'N',
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
        const response = await axios({
          url: this.orgPersonInfoDeleteUrl,
          method: 'POST',
          data: { id }
        });

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
        if (this.dataFormStatus === 'create') {
          await this.handleCreateSave();
        } else if (this.dataFormStatus === 'update') {
          await this.handleUpdateSave();
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
        orgLevel: this.dataForm.orgLevel,
        oepnFlag: this.dataForm.oepnFlag
      };

      const response = await axios({
        url: this.orgPersonInfoInsertUrl,
        method: 'POST',
        data: payload
      });

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
        orgLevel: this.dataForm.orgLevel,
        oepnFlag: this.dataForm.oepnFlag
      };

      const response = await axios({
        url: this.orgPersonInfoUpdateUrl,
        method: 'POST',
        data: payload
      });

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
        const response = await axios({
          url: this.orgPersonInfoDetailUrl,
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

    // 批量设为管理员
    async fun_open() {
      if (this.isSelectionEmpty) {
        ElMessage.warning('请选择要设置的数据');
        return;
      }

      try {
        await ElMessageBox.confirm(
          `确认将选中的 ${this.selectionRows.length} 条数据设为管理员吗？`,
          '设置确认',
          {
            type: 'warning',
            confirmButtonText: '确认',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const ids = this.selectionRows.map(item => item.id);

        const response = await axios({
          url: this.orgPersonInfoOpenBatchUrl,
          method: 'POST',
          data: { ids }
        });

        if (response.data.code === 2000) {
          ElMessage.success('批量设置成功');
          this.query();
          this.selectionRows = [];
        } else {
          ElMessage.error(response.data.message || '设置失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('设置失败');
          console.error('批量设置失败:', error);
        }
      } finally {
        this.loading = false;
      }
    },

    // 批量取消管理员
    async fun_close() {
      if (this.isSelectionEmpty) {
        ElMessage.warning('请选择要取消的数据');
        return;
      }

      try {
        await ElMessageBox.confirm(
          `确认将选中的 ${this.selectionRows.length} 条数据取消管理员吗？`,
          '取消确认',
          {
            type: 'warning',
            confirmButtonText: '确认',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const ids = this.selectionRows.map(item => item.id);

        const response = await axios({
          url: this.orgPersonInfoCloseBatchUrl,
          method: 'POST',
          data: { ids }
        });

        if (response.data.code === 2000) {
          ElMessage.success('批量取消成功');
          this.query();
          this.selectionRows = [];
        } else {
          ElMessage.error(response.data.message || '取消失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('取消失败');
          console.error('批量取消失败:', error);
        }
      } finally {
        this.loading = false;
      }
    },

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

        const response = await axios({
          url: this.orgPersonInfoDeleteBatchUrl,
          method: 'POST',
          data: { ids }
        });

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

    // 页码变化 - 后端分页需要重新查询
    handleCurrentChange(val) {
      this.currentPage = val;
      this.query();
    },

    // 每页大小变化 - 后端分页需要重新查询
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.query();
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
