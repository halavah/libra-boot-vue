import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Search, Refresh, Plus, Upload, Download, Delete, Setting, CirclePlus, CircleClose, Loading, Lock, RefreshRight } from '@element-plus/icons-vue';
import { markRaw } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';

// 调试用户
const debugUser = 'demo-user';
//const debugUser = 'demo-user';

export default {
  name: 'SysDict',

  components: {
    ArrowDown: markRaw(ArrowDown),
    Loading: markRaw(Loading)
  },

  data() {
    // 字典管理页面权限配置
    const BUTTON_PERMISSIONS = {
      FULL: {
        query: true,          // 查询（详情）
        add: true,            // 新增
        edit: true,           // 编辑
        delete: true,         // 删除
        export: true,         // 导出
        sync: true,           // 从ERP同步
        batchDelete: true     // 批量删除
      },
      PARTIAL: {
        query: true,          // 查询（详情）
        add: false,           // 新增
        edit: false,          // 编辑
        delete: false,        // 删除
        export: false,        // 导出
        sync: false,          // 从ERP同步
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

      // 筛选表单（展开/引用/规则）
      searchExpanded: false,
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
      dictListUrl: baseUrl + '/onboard/sys/dict/page',           // 字典列表 - 后端分页
      dictDetailUrl: baseUrl + '/onboard/sys/dict/detail',       // 字典详情
      dictInsertUrl: baseUrl + '/onboard/sys/dict/insert',       // 新增字典
      dictUpdateUrl: baseUrl + '/onboard/sys/dict/update',       // 更新字典
      dictDeleteUrl: baseUrl + '/onboard/sys/dict/delete',       // 删除字典
      dictExportUrl: baseUrl + '/onboard/sys/dict/export',       // 导出字典
      // 请求路径-批量
      dictDeleteBatchUrl: baseUrl + '/onboard/sys/dict/deleteBatch',   // 批量删除字典
      // ERP同步相关
      dictSyncFromErpUrl: baseUrl + '/onboard/xxlJob/dict/sync', // 从ERP同步字典
      // 请求路径：权限检查
      checkPermission: baseUrl + '/onboard/sys/personInfo/checkPermission', // POST请求

      // 主表查询
      searchForm: {
        dictCode: '',      // 字典编码
        dictName: '',      // 字典名称
        itemId: '',        // 枚举项ID
        itemText: ''       // 枚举项名称
      },

      // 主表数据
      dataList: [],

      // 主表表单
      dataForm: {
        id: '',            // 主键ID（自增，新增时不传）
        dictCode: '',      // 字典编码
        dictName: '',      // 字典名称
        itemId: '',        // 枚举项ID
        itemText: '',      // 枚举项名称
        sortNo: 1,         // 排序号
        updateUser: '',    // 更新人
        updateTime: ''     // 更新日期
      },

      // 主表验证
      dataFormRules: {
        dictCode: [
          { required: true, message: '请输入字典编码', trigger: 'blur' },
          { min: 1, max: 20, message: '字典编码长度在1-20个字符', trigger: 'blur' },
          { pattern: /^[0-9A-Z_]+$/, message: '字典编码只能包含数字、大写字母和下划线', trigger: 'blur' }
        ],
        dictName: [
          { required: true, message: '请输入字典名称', trigger: 'blur' },
          { min: 2, max: 50, message: '字典名称长度在2-50个字符', trigger: 'blur' }
        ],
        itemId: [
          { required: true, message: '请输入枚举项ID', trigger: 'blur' },
          { min: 1, max: 20, message: '枚举项ID长度在1-20个字符', trigger: 'blur' }
        ],
        itemText: [
          { required: true, message: '请输入枚举项名称', trigger: 'blur' },
          { min: 1, max: 50, message: '枚举项名称长度在1-50个字符', trigger: 'blur' }
        ],
        sortNo: [
          { required: true, message: '请输入排序号', trigger: 'blur' },
          { type: 'number', min: 1, max: 9999, message: '排序号范围1-9999', trigger: 'blur' }
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
          sync: false,
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
        sync: false,
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
          url: this.dictListUrl + '?pageNum=' + this.currentPage + '&pageSize=' + this.pageSize,
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
        console.error('[sysDict] query failed:', error);
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
        dictCode: '',
        dictName: '',
        itemId: '',
        itemText: ''
      };
      this.currentPage = 1; // 重置时回到第一页
      this.query();
    },

    // 导出数据
    async fun_export() {
      try {
        this.loading = true;
        // 构建查询参数
        const params = {
          dictCode: this.searchForm.dictCode || '',
          dictName: this.searchForm.dictName || '',
          itemId: this.searchForm.itemId || '',
          itemText: this.searchForm.itemText || ''
        };
        const res = await axios.post(this.dictExportUrl, params, {
          responseType: 'blob'
        });
        if (res.data) {
          const blob = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = decodeURIComponent(res.headers['file-name'] || '字典数据导出.xlsx');
          link.click();
          window.URL.revokeObjectURL(link.href);
          ElMessage.success('导出成功');
        } else {
          ElMessage.error('导出失败');
        }
      } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error('导出失败: ' + (error.message || ''));
      } finally {
        this.loading = false;
      }
    },

    // 从ERP同步字典数据
    async fun_syncFromErp() {
      try {
        await ElMessageBox.confirm(
          '确认从ERP系统同步所有字典数据吗？此操作将更新现有字典数据！',
          '同步确认',
          {
            type: 'warning',
            confirmButtonText: '确认同步',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        ElMessage.info('正在从ERP同步字典数据，请稍候...');

        const response = await axios.get(this.dictSyncFromErpUrl);

        if (response.data.code === 2000) {
          const result = response.data.data;
          if (result.code === 2000) {
            ElMessage.success(`同步成功！字典类型数：${result.dictCount}，枚举项总数：${result.itemCount}`);
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

    //************************************************ 第3部分：表单操作 ********************************************************

    // 按钮_新增
    fun_create() {
      this.dataFormStatus = 'create';
      this.dataFormTitle = '新增字典项';
      // 重置表单，为新增做准备
      this.dataForm = {
        id: '',
        dictCode: '',
        dictName: '',
        itemId: '',
        itemText: '',
        sortNo: 1,
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
      this.dataFormTitle = '字典项详情';
      this.dataFormVisible = true;
      await this.loadDictDetail(row.id);
    },

    // 按钮_编辑
    async fun_edit(row) {
      this.dataFormStatus = 'update';
      this.dataFormTitle = '编辑字典项';
      this.dataFormVisible = true;
      await this.loadDictDetail(row.id);
    },

    // 按钮_删除
    async fun_delete(id) {
      try {
        await ElMessageBox.confirm(
          '确认删除该字典项吗？此操作不可撤销！',
          '删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const response = await axios({
          url: this.dictDeleteUrl,
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
          url: this.dictInsertUrl,
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
          dictCode: this.dataForm.dictCode,
          dictName: this.dataForm.dictName,
          itemId: this.dataForm.itemId,
          itemText: this.dataForm.itemText,
          sortNo: this.dataForm.sortNo
        };
        const response = await axios({
          url: this.dictUpdateUrl,
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

    // 加载字典详情
    async loadDictDetail(id) {
      try {
        const response = await axios({
          url: this.dictDetailUrl,
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
        ElMessage.warning('请勾选需要删除的字典项');
        return;
      }
      try {
        await ElMessageBox.confirm(
          `确认删除选中的 ${this.selectionRows.length} 个字典项吗？此操作不可撤销！`,
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
          url: this.dictDeleteBatchUrl,
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
