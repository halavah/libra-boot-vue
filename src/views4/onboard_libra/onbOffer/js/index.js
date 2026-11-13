import { Search, Refresh, Plus, Delete, SetUp, Bell, Close, Download } from '@element-plus/icons-vue'
import OnbApplicant from '../../onbApplicant/index.vue'
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 环境变量调试
const baseUrl = 'http://127.0.0.1:9941/libra-onboard';
console.log('=== 环境变量调试 ===');
console.log('1. import.meta.env.MODE:', import.meta.env.MODE);
console.log('2. baseUrl 计算结果:', baseUrl);
console.log('3. 完整 import.meta.env:', import.meta.env);
console.log('==================');

// API路径
const API_PATHS = {
  offerDetailUrl: baseUrl + '/offer/detail',
  offerUpdateUrl: baseUrl + '/offer/update',
  offerAuditUrl: baseUrl + '/offer/audit',
  offerWithdrawAuditUrl: baseUrl + '/offer/withdraw-audit',
  offerBatchUpdateUrl: baseUrl + '/offer/batch-update',
  offerBatchAuditUrl: baseUrl + '/offer/batch-audit',
  offerBatchWithdrawAuditUrl: baseUrl + '/offer/batch-withdraw-audit',
  offerReofferUrl: baseUrl + '/offer/real-operate',
  offerReallocateUrl: baseUrl + '/allocate/real-operate',
  offerApplyGetFormInstIdUrl: baseUrl + '/offerApply/getFormInstId',
  offerApplyApprovalTrailUrl: baseUrl + '/offerApply/getApprovalTrail'
}

// 录用页面权限配置
const OFFER_PERMISSIONS = {
  FULL: {
    query: true,          // 查询（详情）
    offer: true,          // 录用
    batchOffer: true,     // 批量录用
    audit: true,          // 发起审核
    withdrawAudit: true,  // 撤回审批
    export: true,         // 导出
    reoffer: true,        // 重新录用
    reallocate: true,     // 重新分配
    viewApproval: true    // 查看审批
  },
  PARTIAL: {
    query: true,         // 查询（详情）
    offer: true,         // 录用
    batchOffer: true,    // 批量录用
    audit: true,         // 发起审核
    withdrawAudit: true, // 撤回审批
    export: true,        // 导出
    reoffer: false,      // 重新录用
    reallocate: false,   // 重新分配
    viewApproval: true   // 查看审批
  }
}

// 组件导出
export default {
  // 组件名称
  name: 'OnbOffer',

  // 子组件引入
  components: {
    OnbApplicant
  },

  // 业务逻辑组合
  setup() {
    // 权限检查方法：基于子组件的 permissionLevel 和当前页面的权限配置
    const canPerform = (action) => {
      const permissionLevel = applicantRef.value?.permissionLevel
      if (!permissionLevel) return false

      if (permissionLevel === 'FULL') {
        return OFFER_PERMISSIONS.FULL[action] ?? false
      } else if (permissionLevel === 'PARTIAL') {
        return OFFER_PERMISSIONS.PARTIAL[action] ?? false
      }
      return false
    }

    // 判断是否显示"重置操作"列
    const showResetColumn = computed(() => {
      return canPerform('reoffer') || canPerform('reallocate')
    })

    return {
      // 权限方法
      canPerform,
      showResetColumn,

      // 公共
      apiPaths: API_PATHS,
      attrLists: computed(() => applicantRef.value?.attrLists || {}),
      getEnumLabel,
      formatDate,
      formatTimestamp,

      // 区域：data存储
      applicantRef,
      selectedApplicants,
      currentOperationRow,
      currentDetailRow,

      // 区域：录用弹框
      operationDialogVisible,
      operationLoading,
      operationFormRef,
      operationForm,
      operationFormRules,
      isFormEditable,

      // 区域：批量录用弹框
      batchOperationDialogVisible,
      batchOperationFormRef,
      batchOperationForm,
      batchOperationFormRules,

      // 区域：审批流程
      approvalTrailDialogVisible,
      approvalTrailLoading,
      approvalTrailList,
      currentFormInstId,

      // 区域：录用操作
      fun_operation,
      fun_saveOperation,
      fun_audit,
      fun_withdrawAudit,

      // 区域：批量操作
      fun_batchOffer,
      fun_batchSaveOffer,
      fun_batchAudit,
      fun_batchWithdrawAudit,
      removeApplicant,
      selectionSelectable,
      canBatchOffer,
      canBatchAudit,
      canBatchWithdrawAudit,

      // 区域：重置操作
      fun_reoffer,
      fun_reallocate,

      // 区域：状态判断
      checkFormEditable,
      canAudit,
      canWithdrawAudit,
      canReoffer,
      canReallocate,
      canViewAudit,

      // 区域：审批流程操作
      fun_showApprovalTrail,
      getFormInstId,
      loadApprovalTrail,
      getStatusClass,
      getStatusText,

      // 图标
      Search,
      Refresh,
      Plus,
      Delete,
      SetUp,
      Bell,
      Close,
      Download
    }
  }
}

//************************************************ 区域：data存储 *****************************************************

// 子组件实例引用（用于调用其公开方法）
const applicantRef = ref(null)

// 选中的应聘者列表（用于批量操作弹框）
const selectedApplicants = ref([])

// 公共配置
const operationDialogVisible = ref(false)
const operationLoading = ref(false)
const operationFormRef = ref(null)
const currentOperationRow = ref({})

// 批量录用弹框相关
const batchOperationDialogVisible = ref(false)
const batchOperationFormRef = ref(null)

// 审批流程痕迹
const approvalTrailDialogVisible = ref(false)
const approvalTrailLoading = ref(false)
const approvalTrailList = ref([])
const currentFormInstId = ref('')
const currentDetailRow = ref(null)

// 表单是否可编辑 (仅面试通过状态可编辑)
const isFormEditable = ref(false)

// 录用表单
const operationForm = reactive({
  hireStatus: 1,           // 录用状态 - 默认：是(1)
  probationSalary: null,   // 试用期工资
  probationDuration: 1,    // 试用期时长 - 默认：一个月(1)
  formalSalary: null      // 转正工资
})

// 录用表单验证
const operationFormRules = reactive({
  hireStatus: [
    { required: true, message: '请选择录用状态', trigger: 'change' }
  ],
  probationDuration: [
    { required: true, message: '请选择试用期时长', trigger: 'change' }
  ],
  probationSalary: [
    { required: true, message: '请输入试用期工资', trigger: 'blur' }
  ],
  formalSalary: [
    { required: true, message: '请输入转正工资', trigger: 'blur' }
  ]
})

// 批量录用表单
const batchOperationForm = reactive({
  hireStatus: 1,           // 录用状态 - 默认：是(1)
  probationSalary: null,   // 试用期工资
  probationDuration: 1,    // 试用期时长 - 默认：一个月(1)
  formalSalary: null      // 转正工资
})

// 批量录用表单验证
const batchOperationFormRules = reactive({
  hireStatus: [
    { required: true, message: '请选择录用状态', trigger: 'change' }
  ],
  probationDuration: [
    { required: true, message: '请选择试用期时长', trigger: 'change' }
  ],
  probationSalary: [
    { required: true, message: '请输入试用期工资', trigger: 'blur' }
  ],
  formalSalary: [
    { required: true, message: '请输入转正工资', trigger: 'blur' }
  ]
})

//************************************************ 区域：录用操作 *****************************************************

// 录用
const fun_operation = async (row) => {
  currentOperationRow.value = {
    ...row,
    genderText: row.gender?.value || '-',
    birthDateText: formatDate(row.birthDate)
  }

  // 设置表单是否可编辑状态
  checkFormEditable(row.auditStatus)

  // 初始化录用表单
  Object.assign(operationForm, {
    hireStatus: 1,           // 录用状态 - 默认：是(1)
    probationSalary: null,   // 试用期工资
    probationDuration: 1,    // 试用期时长 - 默认：一个月(1)
    formalSalary: null      // 转正工资
  })

  // 先打开对话框
  operationDialogVisible.value = true

  // 显示对话框内的 loading
  operationLoading.value = true

  // 调用录用列表API获取相关数据
  try {
    const response = await axios({
      url: API_PATHS.offerDetailUrl,
      method: 'POST',
      data: { applicantId: row.id }
    })

    if (response.data.code === 2000) {
      // 预填充录用表单数据
      const responseData = response.data.data
      if (responseData) {
        // 预填充应聘者基本信息（只读）
        if (responseData.applicant) {
          currentOperationRow.value.applicantName = responseData.applicant.applicantName || row.applicantName
          currentOperationRow.value.genderText = responseData.applicant.gender?.value || row.gender?.value || '-'
          currentOperationRow.value.birthDateText = formatDate(responseData.applicant.birthDate || row.birthDate)
          currentOperationRow.value.contactPhone = responseData.applicant.contactPhone || row.contactPhone
          currentOperationRow.value.idCardNo = responseData.applicant.idCardNo || row.idCardNo
          currentOperationRow.value.applyPosition = responseData.applicant.applyPosition || row.applyPosition
        }

        // 如果有历史录用记录，预填充录用数据
        if (responseData.offer) {
          const offer = responseData.offer

          // 处理试用期工资
          operationForm.probationSalary = offer.probationSalary
          operationForm.formalSalary = offer.formalSalary

          // 处理试用期时长 - 提取枚举值的key字段
          if (offer.probationDuration?.key !== undefined) {
            operationForm.probationDuration = Number(offer.probationDuration.key)
          }

          // 处理录用状态 - 提取枚举值的key字段
          if (offer.isHired?.key !== undefined) {
            operationForm.hireStatus = Number(offer.isHired.key)
          }
        }

      }
    }
  } catch (error) {
    ElMessage.warning('获取录用数据失败')
  } finally {
    // 数据加载完成，关闭 loading
    operationLoading.value = false
  }
}

// 保存录用
const fun_saveOperation = async () => {
  try {
    const valid = await operationFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查录用信息')
      return
    }

    const response = await axios({
      url: API_PATHS.offerUpdateUrl,
      method: 'POST',
      data: {
        ...operationForm,
        applicantId: currentOperationRow.value.id
      }
    })

    if (response.data.code === 2000) {
      ElMessage.success('录用信息保存成功')
      operationDialogVisible.value = false
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '录用信息保存失败')
    }
  } catch (error) {
    ElMessage.error('录用信息保存失败')
  }
}

// 审核
const fun_audit = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确认审核通过该应聘者吗？',
      '审核确认',
      {
        type: 'warning',
        confirmButtonText: '确认审核',
        cancelButtonText: '取消'
      }
    )

    const response = await axios({
      url: API_PATHS.offerAuditUrl,
      method: 'POST',
      data: {
        applicantId: row.id,
        auditStatus: 7 // 录用通过
      }
    })

    if (response.data.code === 2000) {
      ElMessage.success('审核成功')
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '审核失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败')
    }
  }
}

// 撤回审核
const fun_withdrawAudit = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确认撤回该应聘者的审核状态吗？',
      '撤回确认',
      {
        type: 'warning',
        confirmButtonText: '确认撤回',
        cancelButtonText: '取消'
      }
    )

    const response = await axios({
      url: API_PATHS.offerWithdrawAuditUrl,
      method: 'POST',
      data: {
        applicantId: row.id
      }
    })

    if (response.data.code === 2000) {
      ElMessage.success('撤回审核成功')
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '撤回审核失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('撤回审核失败')
    }
  }
}

//************************************************ 区域：审批流程 *****************************************************

// 显示审批流程痕迹弹窗
const fun_showApprovalTrail = async (row) => {
  approvalTrailList.value = [] // 先清空
  currentFormInstId.value = '' // 重置审批ID
  currentDetailRow.value = {} // 重置详情数据

  // 先打开对话框
  approvalTrailDialogVisible.value = true

  // 显示对话框内的 loading
  approvalTrailLoading.value = true

  // 调用详情接口获取完整数据
  try {
    const response = await axios({
      url: API_PATHS.offerDetailUrl,
      method: 'POST',
      data: { applicantId: row.id }
    })

    if (response.data.code === 2000) {
      const responseData = response.data.data
      if (responseData) {
        // 组装完整的详情数据
        currentDetailRow.value = {
          // 基本信息（来自 applicant）
          applicantName: responseData.applicant?.applicantName || '-',
          idCardNo: responseData.applicant?.idCardNo || '-',
          contactPhone: responseData.applicant?.contactPhone || '-',
          assignedUser: responseData.applicant?.assignedUser || '-',
          applyPosition: responseData.applicant?.applyPosition || '-',
          createUser: responseData.applicant?.createUser || '-',
          createTime: responseData.applicant?.createTime || '-',

          // 录用信息（来自 offer）
          offerDate: responseData.offer?.offerDate || '-',
          isHired: responseData.offer?.isHired?.key,
          probationDuration: responseData.offer?.probationDuration?.key,
          probationSalary: responseData.offer?.probationSalary || '-',
          formalSalary: responseData.offer?.formalSalary || '-'
        }
      }
    } else {
      ElMessage.error(response.message || '获取详情数据失败')
      currentDetailRow.value = { ...row } // 使用行数据作为备用
    }
  } catch (error) {
    ElMessage.error('获取详情数据失败')
    currentDetailRow.value = { ...row } // 使用行数据作为备用
  }

  // 通过 applicantId 获取 formInstId
  try {
    const formInstId = await getFormInstId(row.id)
    if (formInstId) {
      currentFormInstId.value = formInstId // 保存审批ID
      await loadApprovalTrail(formInstId)
    }
  } catch (error) {
    console.error('加载审批流程失败:', error)
  } finally {
    // 数据加载完成，关闭 loading
    approvalTrailLoading.value = false
  }
}

// 通过 applicantId 获取 formInstId
const getFormInstId = async (applicantId) => {
  if (!applicantId) {
    ElMessage.warning('缺少应聘者ID')
    return null
  }
  try {
    const response = await axios({
      url: API_PATHS.offerApplyGetFormInstIdUrl,
      method: 'POST',
      data: applicantId,
      headers: { 'Content-Type': 'text/plain' }
    })

    if (response.data.code === 2000) {
      return response.data.data
    } else {
      ElMessage.error(response.data.message || '获取流程实例ID失败')
      return null
    }
  } catch (error) {
    ElMessage.error('获取流程实例ID失败')
    return null
  }
}

// 加载审批流程痕迹
const loadApprovalTrail = async (formInstId) => {
  if (!formInstId) {
    ElMessage.warning('缺少流程实例ID')
    return
  }
  try {
    const response = await axios({
      url: API_PATHS.offerApplyApprovalTrailUrl,
      method: 'POST',
      data: formInstId,
      headers: { 'Content-Type': 'text/plain' }
    })

    if (response.data.code === 2000) {
      approvalTrailList.value = response.data.data || []
    } else {
      ElMessage.error(response.data.message || '获取审批流程痕迹失败')
    }
  } catch (error) {
    ElMessage.error('获取审批流程痕迹失败')
  }
}

// 获取审批状态的CSS类名
const getStatusClass = (status) => {
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
}

// 获取审批状态的中文文本
const getStatusText = (status) => {
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
}

//************************************************ 区域：重置操作 *****************************************************

// 重新录用操作
const fun_reoffer = async (row) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要将应聘者"${row.applicantName}"重新录用吗？重新录用后状态将变为"等待录用"。`,
      '重新录用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      const response = await axios({
        url: API_PATHS.offerReofferUrl,
        method: 'POST',
        data: {
          applicantId: row.id
        }
      })

      if (response.data.code === 2000) {
        ElMessage.success('重新录用成功')
        await applicantRef.value?.handleSearch?.()
      } else {
        ElMessage.error(response.data.message || '重新录用失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新录用失败')
    }
  }
}

// 重新分配操作
const fun_reallocate = async (row) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要将应聘者"${row.applicantName}"重新分配吗？重新分配后状态将变为"待分配"。`,
      '重新分配确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      const response = await axios({
        url: API_PATHS.offerReallocateUrl,
        method: 'POST',
        data: {
          applicantId: row.id
        }
      })

      if (response.data.code === 2000) {
        ElMessage.success('重新分配成功')
        await applicantRef.value?.handleSearch?.()
      } else {
        ElMessage.error(response.data.message || '重新分配失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新分配失败')
    }
  }
}

//************************************************ 区域：批量操作 *****************************************************

// 批量录用
const fun_batchOffer = async () => {
  // 从子组件获取选中的数据
  const currentSelection = applicantRef.value?.getSelectedRows?.() || []

  if (!currentSelection || currentSelection.length === 0) {
    ElMessage.warning('请先选择需要录用的记录')
    return
  }

  // 过滤出可录用的记录（面试通过状态）
  const canOfferRows = currentSelection.filter(row =>
    canAudit(row.auditStatus)
  )

  if (canOfferRows.length === 0) {
    ElMessage.warning('选中的记录中没有可录用的状态（需要"面试通过"状态）')
    return
  }

  // 记录过滤的数量
  const filteredCount = currentSelection.length - canOfferRows.length

  // 如果有记录被过滤掉，更新表格选中状态
  if (filteredCount > 0) {
    // 更新表格的多选框状态，只选中符合条件的记录
    applicantRef.value?.setSelectedRows?.(canOfferRows)
  }

  // 设置选中的应聘者
  selectedApplicants.value = canOfferRows

  // 重置批量录用表单
  Object.assign(batchOperationForm, {
    hireStatus: 1,
    probationSalary: null,
    probationDuration: 1,
    formalSalary: null
  })

  // 打开弹框
  batchOperationDialogVisible.value = true

  // 弹框打开后，如果有过滤记录，给出提示
  if (filteredCount > 0) {
    setTimeout(() => {
      ElMessage.warning(`已过滤 ${filteredCount} 条不符合条件的记录，当前操作 ${canOfferRows.length} 条符合条件的记录`)
    }, 100)
  }
}

// 批量保存录用
const fun_batchSaveOffer = async () => {
  try {
    // 验证表单
    await batchOperationFormRef.value.validate()

    if (selectedApplicants.value.length === 0) {
      ElMessage.warning('没有选中的应聘者')
      return
    }

    const applicantIds = selectedApplicants.value.map(applicant => applicant.id)

    const response = await axios({
      url: API_PATHS.offerBatchUpdateUrl,
      method: 'POST',
      data: {
        applicantIds,
        ...batchOperationForm
      }
    })

    if (response.data.code === 2000) {
      ElMessage.success('批量录用成功')
      batchOperationDialogVisible.value = false
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '批量录用失败')
    }
  } catch (error) {
    // 如果是表单验证失败
    if (error && typeof error === 'object' && Object.keys(error).length > 0) {
      ElMessage.warning('请检查并填写完整的录用信息')
    } else {
      ElMessage.error('批量录用失败')
    }
  }
}

// 批量审核
const fun_batchAudit = async () => {
  // 从子组件获取选中的数据
  const currentSelection = applicantRef.value?.getSelectedRows?.() || []

  if (!currentSelection || currentSelection.length === 0) {
    ElMessage.warning('请先选择需要审核的记录')
    return
  }

  // 过滤出可审核的记录（面试通过状态）
  const canAuditRows = currentSelection.filter(row =>
    canAudit(row.auditStatus)
  )

  if (canAuditRows.length === 0) {
    ElMessage.warning('选中的记录中没有可发起审核的状态（需要"面试通过"状态）')
    return
  }

  // 记录过滤的数量
  const filteredCount = currentSelection.length - canAuditRows.length

  // 如果有记录被过滤掉，更新表格选中状态
  if (filteredCount > 0) {
    // 更新表格的多选框状态，只选中符合条件的记录
    applicantRef.value?.setSelectedRows?.(canAuditRows)
  }

  try {
    // 先显示过滤提示（如果有）
    if (filteredCount > 0) {
      ElMessage.warning(`已过滤 ${filteredCount} 条不符合条件的记录，将对 ${canAuditRows.length} 条符合条件的记录发起审核`)
      await new Promise(resolve => setTimeout(resolve, 500)) // 等待用户看到提示
    }

    const result = await ElMessageBox.confirm(
      `确定要批量发起审核吗？共选中 ${canAuditRows.length} 条记录`,
      '批量审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      const applicantIds = canAuditRows.map(row => row.id)
      const response = await axios({
        url: API_PATHS.offerBatchAuditUrl,
        method: 'POST',
        data: {
          applicantIds,
          auditStatus: 6 // 通知状态
        }
      })

      if (response.data.code === 2000) {
        ElMessage.success('批量审核成功')
        await applicantRef.value?.handleSearch?.()
      } else {
        ElMessage.error(response.data.message || '批量审核失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量审核失败')
    }
  }
}

// 批量撤回审核
const fun_batchWithdrawAudit = async () => {
  // 从子组件获取选中的数据
  const currentSelection = applicantRef.value?.getSelectedRows?.() || []

  if (!currentSelection || currentSelection.length === 0) {
    ElMessage.warning('请先选择需要撤回的记录')
    return
  }

  // 过滤出可撤回的记录（已通知状态）
  const canWithdrawRows = currentSelection.filter(row =>
    canWithdrawAudit(row.auditStatus)
  )

  if (canWithdrawRows.length === 0) {
    ElMessage.warning('选中的记录中没有可撤回的状态（需要"已通知"状态）')
    return
  }

  // 记录过滤的数量
  const filteredCount = currentSelection.length - canWithdrawRows.length

  // 如果有记录被过滤掉，更新表格选中状态
  if (filteredCount > 0) {
    // 更新表格的多选框状态，只选中符合条件的记录
    applicantRef.value?.setSelectedRows?.(canWithdrawRows)
  }

  try {
    // 先显示过滤提示（如果有）
    if (filteredCount > 0) {
      ElMessage.warning(`已过滤 ${filteredCount} 条不符合条件的记录，将对 ${canWithdrawRows.length} 条符合条件的记录撤回审核`)
      await new Promise(resolve => setTimeout(resolve, 500)) // 等待用户看到提示
    }

    const result = await ElMessageBox.confirm(
      `确定要批量撤回审核吗？共选中 ${canWithdrawRows.length} 条记录`,
      '批量撤回确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      const applicantIds = canWithdrawRows.map(row => row.id)
      const response = await axios({
        url: API_PATHS.offerBatchWithdrawAuditUrl,
        method: 'POST',
        data: {
          applicantIds
        }
      })

      if (response.data.code === 2000) {
        ElMessage.success('批量撤回审核成功')
        await applicantRef.value?.handleSearch?.()
      } else {
        ElMessage.error(response.data.message || '批量撤回审核失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量撤回审核失败')
    }
  }
}

// 移除应聘者
const removeApplicant = (applicantId) => {
  const index = selectedApplicants.value.findIndex(applicant => applicant.id === applicantId)
  if (index > -1) {
    selectedApplicants.value.splice(index, 1)
  }
}

// 选择行是否可选
const selectionSelectable = (row) => {
  // 可以根据业务需求设置选择条件
  return true
}

// 判断选中的数据是否可以进行批量录用（需要面试通过状态）
const canBatchOffer = computed(() => {
  const selection = applicantRef.value?.getSelectedRows?.() || []
  if (!selection || selection.length === 0) {
    return false
  }
  return selection.some(row => canAudit(row.auditStatus))
})

// 判断选中的数据是否可以进行批量审核（需要面试通过状态）
const canBatchAudit = computed(() => {
  const selection = applicantRef.value?.getSelectedRows?.() || []
  if (!selection || selection.length === 0) {
    return false
  }
  return selection.some(row => canAudit(row.auditStatus))
})

// 判断选中的数据是否可以进行批量撤回（需要已通知状态）
const canBatchWithdrawAudit = computed(() => {
  const selection = applicantRef.value?.getSelectedRows?.() || []
  if (!selection || selection.length === 0) {
    return false
  }
  return selection.some(row => canWithdrawAudit(row.auditStatus))
})

//************************************************ 区域：显隐操作 *****************************************************

// 发起审核（支持数字和字符串类型的状态值）
const canAudit = (auditStatus) => {
  if (!auditStatus || auditStatus.key === null || auditStatus.key === undefined) {
    return false
  }
  // 支持数字4和字符串'4'两种格式
  return auditStatus.key === 4 || auditStatus.key === '4'
}

// 撤回审核（支持数字和字符串类型的状态值）
const canWithdrawAudit = (auditStatus) => {
  if (!auditStatus || auditStatus.key === null || auditStatus.key === undefined) {
    return false
  }
  // 支持数字6和字符串'6'两种格式
  return auditStatus.key === 6 || auditStatus.key === '6'
}

// 重新录用
const canReoffer = (auditStatus) => {
  return auditStatus && (auditStatus.key === '7' || auditStatus.key === '8')
}

// 重新分配
const canReallocate = (auditStatus) => {
  return auditStatus && auditStatus.key === '8'
}

// 录用（支持数字和字符串类型的状态值）
const checkFormEditable = (auditStatus) => {
  // 判断表单是否可编辑 (仅面试通过状态可编辑)
  const editable = canAudit(auditStatus)
  // 更新响应式变量
  isFormEditable.value = editable
  return editable
}

// 查看审核
const canViewAudit = (auditStatus) => {
  return canWithdrawAudit(auditStatus) || canReoffer(auditStatus)
}

//************************************************ 区域：辅助操作 *****************************************************

// 格式化日期
const formatDate = (date) => {
  if (!date) {
    return '-'
  }
  return date
}

// 格式化时间戳
const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return '-'
  }
  return timestamp
}

// 获取枚举文本
const getEnumLabel = (options, key) => {
  // 安全检查：options 或 key 为空时返回 '-'
  if (!options || !Array.isArray(options) || key === null || key === undefined) {
    return '-';
  }
  // 先尝试严格匹配
  let item = options.find(x => x.key === key);
  // 如果没找到，尝试类型转换后匹配（数字与字符串互转）
  if (!item) {
    item = options.find(x => x.key == key || x.key.toString() === key.toString());
  }
  return item ? item.value : '-';
}
