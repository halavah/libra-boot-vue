import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Search, Refresh, Plus, Upload, Download, Delete, Setting, CirclePlus, CircleClose } from '@element-plus/icons-vue';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'OnbEvaluateApply',

  components: {
    ArrowDown
  },

  data() {

    const baseUrl = '/dev-api';

    return {
      // 加载
      loading: false,

      // 筛选-表单
      searchFormRef: null,
      searchFormRules: {},

      // 筛选-表格
      selectionRows: [],

      // 筛选-表格-分页
      pageSizes: [10, 15, 25, 35, 50, 100],
      pageSize: 10,
      currentPage: 1,
      dataTotal: 0,

      // 详情弹框
      detailDialogVisible: false,
      approvalTrailList: [],

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

      //************************************************** 第1部分：路径 **************************************************

      // 请求路径：枚举
      sysAttrListUrl: baseUrl + '/onboard/attr/list', // GET请求
      // 请求路径：日志表
      evaluateApplyListUrl: baseUrl + '/onboard/evaluateApply/list', // POST请求
      evaluateApplyDeleteUrl: baseUrl + '/onboard/evaluateApply/delete', // POST请求
      // 请求路径：撤回
      evaluateWithdrawAuditUrl: baseUrl + '/onboard/evaluate/withdraw-audit', // POST请求
      // 请求路径：流程痕迹
      evaluateApplyApprovalTrailUrl: baseUrl + '/onboard/evaluateApply/getApprovalTrail', // POST请求

      //************************************************** 第1部分：属性 **************************************************

      // 通用-属性
      attrLists: {
        // 2.2 面试评估类型
        interviewEvaluationTypeOptions: [],
        // 2.3 是否录用
        isHiredOptions: [],
        // 2.5 用工性质
        employmentTypeOptions: [],
        // 2.6 测试方法
        testMethodOptions: [],
        // 3.1 审批状态
        flowStatusOptions: [],
      },

      //************************************************** 第2部分：主表 **************************************************

      // 筛选框展开/收起状态
      searchExpanded: false,
      // 主表查询
      searchForm: {
        flowStatus: null,      // 审批状态
        flowTitle: '',         // 审批标题
        applicantName: '',     // 姓名
        contactPhone: '',      // 联系电话
        idCardNo: '',          // 身份证号
        applyPosition: '',     // 应聘岗位
        assignedUser: '',      // 分配人名
        interviewerDateRange: [] // 面试日期范围 [开始日期, 结束日期]
      },
      // 主表数据
      dataList: [],
      // 审批流程痕迹-当前表单实例ID
      currentFormInstId: '',
      // 详情数据
      detailData: {},
    };
  },

  computed: {
    // 是否无勾选（当前页面未使用禁用，但保留统一接口）
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
    // 拉取枚举
    this.fetchAttrList();
    // 查询数据
    this.query();
  },

  methods: {

    //************************************************ 第1部分：公共操作 *****************************************************

    // 拉取枚举
    async fetchAttrList() {
      try {
        const response = await axios.get(this.sysAttrListUrl);
        if (response.data.code === 2000) {
          this.attrLists = { ...this.attrLists, ...response.data.data };
        } else {
          ElMessage.error('获取字典数据失败: ' + response.data.message);
        }
      } catch (error) {
        console.error('获取字典数据失败:', error);
        ElMessage.error('网络请求失败，无法获取字典数据');
      }
    },

    //************************************************ 第2部分：主表 ********************************************************

    // 查询_表格
    async query() {
      this.loading = true;

      const params = {
        flowStatus: this.searchForm.flowStatus === '' ? null : this.searchForm.flowStatus,
        flowTitle: this.searchForm.flowTitle || null,
        applicantName: this.searchForm.applicantName || null,
        contactPhone: this.searchForm.contactPhone || null,
        idCardNo: this.searchForm.idCardNo || null,
        applyPosition: this.searchForm.applyPosition || null,
        assignedUser: this.searchForm.assignedUser || null,
        interviewerStartDate: this.searchForm.interviewerDateRange && this.searchForm.interviewerDateRange[0] ? this.searchForm.interviewerDateRange[0] : null,
        interviewerEndDate: this.searchForm.interviewerDateRange && this.searchForm.interviewerDateRange[1] ? this.searchForm.interviewerDateRange[1] : null
      };

      try {
        const response = await axios.post(this.evaluateApplyListUrl, params);

        if (response.data.code === 2000) {
          this.dataList = response.data.data || [];
          this.dataTotal = this.dataList.length;
        } else {
          ElMessage.error(response.data.message || '获取数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败');
        console.error('查询失败:', error);
      }

      this.loading = false;
    },

    // 按钮_查询
    async fun_search(formEl) {
      if (!formEl) {
        return;
      }
      this.currentPage = 1; // 查询时重置页码
      this.query();
    },

    // 按钮_重置
    async fun_reset(formEl) {
      if (!formEl) {
        return;
      }
      formEl.resetFields();
      this.currentPage = 1; // 重置时重置页码
      this.query();
    },

    //************************************************ 第2部分：主表 ********************************************************

    // 按钮_详情
    async fun_detail(row) {
      this.detailData = { ...row };
      this.approvalTrailList = [];
      this.detailDialogVisible = true;
      // 加载审批流程痕迹
      if (row.formInstId) {
        await this.loadApprovalTrail(row.formInstId);
      }
    },

    // 按钮_撤回
    async fun_withdraw(row) {
      try {
        await ElMessageBox.confirm(
          '确认撤回该申请吗？撤回后将无法恢复！',
          '撤回确认',
          {
            type: 'warning',
            confirmButtonText: '确认撤回',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const response = await axios.post(this.evaluateWithdrawAuditUrl, {
          applicantId: row.applicantId,
        });

        if (response.data.code === 2000) {
          ElMessage.success('撤回成功');
          this.query();
        } else {
          ElMessage.error(response.data.message || '撤回失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('撤回操作失败');
          console.error('撤回失败:', error);
        }
      } finally {
        this.loading = false;
      }
    },

    // 按钮_删除
    async fun_delete(id) {
      try {
        await ElMessageBox.confirm(
          '确认删除该审批记录吗？此操作不可撤销！',
          '删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const response = await axios.post(this.evaluateApplyDeleteUrl, id, {
          headers: { 'Content-Type': 'text/plain' }
        });

        if (response.data.code === 2000) {
          ElMessage.success('删除成功');
          this.query();
        } else {
          ElMessage.error(response.data.message || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除操作失败');
          console.error('删除失败:', error);
        }
      } finally {
        this.loading = false;
      }
    },

    //************************************************ 第3部分：流程痕迹 *************************************************

    // 加载审批流程痕迹
    async loadApprovalTrail(formInstId) {
      if (!formInstId) {
        ElMessage.warning('缺少流程实例ID');
        return;
      }
      try {
        const response = await axios.post(this.evaluateApplyApprovalTrailUrl, formInstId, {
          headers: { 'Content-Type': 'text/plain' }
        });

        if (response.data.code === 2000) {
          this.approvalTrailList = response.data.data || [];
        } else {
          ElMessage.error(response.data.message || '获取审批流程痕迹失败');
        }
      } catch (error) {
        console.error('获取审批流程痕迹失败:', error);
        ElMessage.error('获取审批流程痕迹失败');
      }
    },

    // 获取审批状态的CSS类名
    getStatusClass(status) {
      if (!status || status.trim() === '') {
        return 'status-done';
      }
      const statusMap = {
        'DONE': 'status-done',
        'DOING': 'status-doing',
        'RETURNED': 'status-returned',
        'SMART_RETURNED': 'status-returned',
        'CANCEL': 'status-cancel',
        'AGREE_CANCEL': 'status-cancel',
        'ABANDON': 'status-cancel',
        'DISAGREE': 'status-disagree',
        'DISAGREE_CANCLE': 'status-disagree',
        'WITHDRAW': 'status-withdraw',
        'OT_DONE': 'status-done'
      };
      return statusMap[status] || 'status-done';
    },

    // 获取审批状态的中文文本
    getStatusText(status) {
      if (!status || status.trim() === '') {
        return '已完成';
      }
      const statusTextMap = {
        'DONE': '发起审批',
        'DOING': '审批中',
        'RETURNED': '已退回',
        'SMART_RETURNED': '已退回',
        'CANCEL': '已取消',
        'AGREE_CANCEL': '同意取消',
        'ABANDON': '已废弃',
        'DISAGREE': '不同意',
        'DISAGREE_CANCLE': '不同意取消',
        'WITHDRAW': '已撤回',
        'OT_DONE': '完成审批'
      };
      return statusTextMap[status] || '已完成';
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

    // 切换筛选框展开/收起状态
    toggleSearchExpanded() {
      this.searchExpanded = !this.searchExpanded;
    },

    // 格式化日期
    formatDate(date) {
      if (!date) {
        return '-';
      }
      return dayjs(date).format('YYYY-MM-DD');
    },

    // 格式化时间戳
    formatTimestamp(timestamp) {
      if (!timestamp) return '-';
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
    },

    // 获取枚举文本
    getEnumLabel(options, key) {
      if (key === null || key === undefined) return '-';
      // 先尝试严格匹配
      let item = options.find(x => x.key === key);
      // 如果没找到，尝试类型转换后匹配（数字与字符串互转）
      if (!item) {
        item = options.find(x => x.key == key || x.key.toString() === key.toString());
      }
      return item ? item.value : '-';
    },

    // 判断是否可以撤回审核（面试评估：只有审批中状态1可撤回）
    canWithdrawAudit(row) {
      return row.flowStatus !== null && row.flowStatus !== undefined && row.flowStatus === 1;
    },

  }
};
