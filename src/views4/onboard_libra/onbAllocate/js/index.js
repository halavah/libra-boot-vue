import { ArrowDown, Search, Refresh, Plus, Upload, Download, Delete, Setting, CirclePlus, CircleClose, Loading, SetUp, Bell, Close } from '@element-plus/icons-vue';
import OnbApplicant from '../../onbApplicant/index.vue'
import { ref, reactive, computed, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import dayjs from 'dayjs'

// 环境变量调试
const baseUrl = 'http://127.0.0.1:9941/libra-onboard';
console.log('=== 环境变量调试 ===');
console.log('1. import.meta.env.MODE:', import.meta.env.MODE);
console.log('2. baseUrl 计算结果:', baseUrl);
console.log('3. 完整 import.meta.env:', import.meta.env);
console.log('==================');

// API路径
const API_PATHS = {
  allocateDetailUrl: baseUrl + '/allocate/detail',
  allocateUpdateUrl: baseUrl + '/allocate/update',
  allocateAuditUrl: baseUrl + '/allocate/audit',
  allocateWithdrawAuditUrl: baseUrl + '/allocate/withdraw-audit',
  allocateBatchUpdateUrl: baseUrl + '/allocate/batch-update',
  allocateBatchAuditUrl: baseUrl + '/allocate/batch-audit',
  allocateBatchWithdrawAuditUrl: baseUrl + '/allocate/batch-withdraw-audit',
  deptListUrl: baseUrl + '/sys/personInfo/page' // 后端分页
}

// 分配页面按钮权限配置
const ALLOCATE_PERMISSIONS = {
  FULL: {
    query: true,         // 查询（详情）
    allocate: true,      // 分配
    export: true,        // 导出
    notify: true,        // 通知
    withdrawNotify: true // 撤回通知
  },
  PARTIAL: {
    query: true,         // 查询（详情）
    allocate: true,     // 分配
    export: true,       // 导出
    notify: true,       // 通知
    withdrawNotify: true // 撤回通知
  }
}

// 组件导出
export default {
  // 组件名称
  name: 'OnbAllocate',

  // 子组件引入
  components: {
    OnbApplicant
  },

  // 业务逻辑组合
  setup() {
    // 权限检查方法：基于子组件的 permissionLevel 和当前页面的权限配置
    const canPerform = (action) => {
      const permissionLevel = applicantRef.value?.permissionLevel
      if (!permissionLevel) {
        return false
      }

      if (permissionLevel === 'FULL') {
        return ALLOCATE_PERMISSIONS.FULL[action] ?? false
      } else if (permissionLevel === 'PARTIAL') {
        return ALLOCATE_PERMISSIONS.PARTIAL[action] ?? false
      }
      return false
    }

    return {
      // 公共
      apiPaths: API_PATHS,
      attrLists: computed(() => applicantRef.value?.attrLists || {}),
      getEnumLabel,

      // 区域：权限控制（基于子组件权限级别）
      canPerform,

      // 区域：data存储
      applicantRef,
      selectedApplicants,

      // 区域：批量分配弹框
      operationDialogVisible,
      operationLoading,
      operationFormRef,
      operationForm,
      operationFormRules,

      // 区域：单个分配弹框
      singleOperationDialogVisible,
      singleOperationLoading,
      singleOperationFormRef,
      singleOperationForm,
      singleOperationFormRules,
      currentSingleOperationRow,
      isSingleFormEditable,

      // 区域：部门选择
      deptSelectDialogVisible,
      deptSelectLoading,
      deptSearchFormRef,
      deptSearchForm,
      deptList,
      deptCurrentPage,
      deptPageSize,
      deptPageSizes,
      deptTotal,
      selectedDept,

      // 区域：分配批量
      fun_batchDelete,
      fun_batchAllocate,
      fun_batchSaveOperation,
      fun_batchAudit,
      fun_batchWithdrawAudit,

      // 区域：分配单个
      fun_singleOperation,
      fun_singleSaveOperation,
      fun_audit,
      fun_withdrawAudit,

      // 区域：分配状态
      canAllocate,
      canAudit,
      canWithdrawAudit,

      // 区域：部门选择操作
      openDeptSelectDialog,
      openSingleDeptSelectDialog,
      searchDeptList,
      resetDeptSearch,
      handleDeptRowChange,
      handleDeptCurrentChange,
      handleDeptSizeChange,
      confirmDeptSelection,
      confirmSingleDeptSelection,

      // 区域：应聘者选择
      removeApplicant,
      selectionSelectable,

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
const operationFormRef = ref('')
const currentOperationRow = ref({})

// 分配表单
const operationForm = reactive({
  assignedDept: '', // 保存：部门编码
  assignedDeptName: '', // 显示：部门名称
  assignedUser: '',
  assignedDate: '',
  assignedReason: ''
})
// 分配表单验证
const operationFormRules = reactive({
  assignedUser: [
    { required: true, message: '请先选择分配部门', trigger: 'blur' }
  ],
  assignedDept: [
    { required: true, message: '请选择分配部门', trigger: 'blur' }
  ],
  assignedDate: [
    { required: true, message: '请选择分配日期', trigger: 'change' }
  ]
})

// 单个分配弹框相关
const singleOperationDialogVisible = ref(false)
const singleOperationLoading = ref(false)
const singleOperationFormRef = ref('')
const currentSingleOperationRow = ref({})
const isSingleFormEditable = ref(false)
const singleOperationForm = reactive({
  applicantId: '',
  applyPosition: '',
  assignedDept: '', // 保存：部门编码
  assignedDeptName: '', // 显示：部门名称
  assignedUser: '',
  assignedDate: '',
  assignedReason: ''
})
const singleOperationFormRules = reactive({
  assignedUser: [
    { required: true, message: '请先选择分配部门', trigger: 'blur' }
  ],
  assignedDept: [
    { required: true, message: '请选择分配部门', trigger: 'blur' }
  ],
  assignedDate: [
    { required: true, message: '请选择分配日期', trigger: 'change' }
  ]
})

// 部门选择相关
const deptSelectDialogVisible = ref(false)
const deptSelectLoading = ref(false)
const deptSearchFormRef = ref('')
const deptSearchForm = reactive({
  orgName: '',
  orgNo: '',
  dateSteward: '',
  dateStewardNo: '',
  ignoreJobNo: false
})
const deptList = ref([])
const deptCurrentPage = ref(1)
const deptPageSize = ref(10)
const deptPageSizes = [10, 20, 50, 100]
const deptTotal = ref(0)
const selectedDept = ref(null)
const currentDeptSelectContext = ref('batch')

//************************************************ 区域：分配批量 *****************************************************

// 批量删除
const fun_batchDelete = async () => {
  const currentSelection = applicantRef.value?.getSelectedRows?.() || []

  if (!currentSelection || currentSelection.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }

  try {
    await applicantRef.value?.fun_batchDeleteWithData?.(currentSelection)
    await applicantRef.value?.handleSearch?.()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量分配
const fun_batchAllocate = async () => {
  // 从子组件获取选中的数据
  const currentSelection = applicantRef.value?.getSelectedRows?.() || []

  if (!currentSelection || currentSelection.length === 0) {
    ElMessage.warning('请先选择要分配的记录')
    return
  }

  // 过滤出可分配的记录（待分配状态）
  const canAllocateRows = currentSelection.filter(row =>
    canAllocate(row.auditStatus)
  )

  if (canAllocateRows.length === 0) {
    ElMessage.warning('选中的记录中没有可分配的状态（需要"待分配"状态）')
    return
  }

  // 记录过滤的数量
  const filteredCount = currentSelection.length - canAllocateRows.length

  // 如果有记录被过滤掉，更新表格选中状态
  if (filteredCount > 0) {
    // 更新表格的多选框状态，只选中符合条件的记录
    applicantRef.value?.setSelectedRows?.(canAllocateRows)
  }

  // 设置选中的应聘者
  selectedApplicants.value = canAllocateRows

  // 重置表单
  Object.assign(operationForm, {
    assignedDept: '',
    assignedDeptName: '',
    assignedUser: '',
    assignedDate: dayjs().format('YYYY-MM-DD'),
    assignedReason: ''
  })

  // 打开弹框
  operationDialogVisible.value = true

  // 弹框打开后，如果有过滤记录，给出提示
  if (filteredCount > 0) {
    setTimeout(() => {
      ElMessage.warning(`已过滤 ${filteredCount} 条不符合条件的记录，当前操作 ${canAllocateRows.length} 条符合条件的记录`)
    }, 100)
  }
}

// 批量保存分配
const fun_batchSaveOperation = async () => {
  try {
    const valid = await operationFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查分配信息')
      return
    }

    if (selectedApplicants.value.length === 0) {
      ElMessage.warning('没有选中的应聘者')
      return
    }

    const applicantIds = selectedApplicants.value.map(applicant => applicant.id)
    const response = await axios({
      url: API_PATHS.allocateBatchUpdateUrl,
      method: 'POST',
      data: {
        applicantIds,
        ...operationForm
      }
    })

    if (response.data.code === 2000) {
      ElMessage.success('批量分配成功')
      operationDialogVisible.value = false
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '批量分配失败')
    }
  } catch (error) {
    ElMessage.error('批量分配失败')
  }
}

// 批量通知
const fun_batchAudit = async () => {
  // 从子组件获取选中的数据
  const currentSelection = applicantRef.value?.getSelectedRows?.() || []

  if (!currentSelection || currentSelection.length === 0) {
    ElMessage.warning('请先选择要通知的记录')
    return
  }

  // 过滤出可通知的记录（待分配状态）
  const canAuditRows = currentSelection.filter(row =>
    canAudit(row.auditStatus)
  )

  if (canAuditRows.length === 0) {
    ElMessage.warning('选中的记录中没有可通知的状态（需要"待分配"状态）')
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
      ElMessage.warning(`已过滤 ${filteredCount} 条不符合条件的记录，将对 ${canAuditRows.length} 条符合条件的记录进行通知`)
      await new Promise(resolve => setTimeout(resolve, 500)) // 等待用户看到提示
    }

    await ElMessageBox.confirm(
      `确认对选中的 ${canAuditRows.length} 条记录进行通知吗？`,
      '批量通知确认',
      {
        type: 'warning',
        confirmButtonText: '确认通知',
        cancelButtonText: '取消'
      }
    )

    const applicantIds = canAuditRows.map(row => row.id)
    const response = await axios({
      url: API_PATHS.allocateBatchAuditUrl,
      method: 'POST',
      data: {
        applicantIds,
        auditStatus: 2 // 等待面试
      }
    })

    if (response.data.code === 2000) {
      ElMessage.success('批量通知成功')
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '批量通知失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量通知失败')
    }
  }
}

// 批量撤回通知
const fun_batchWithdrawAudit = async () => {
  // 从子组件获取选中的数据
  const currentSelection = applicantRef.value?.getSelectedRows?.() || []

  if (!currentSelection || currentSelection.length === 0) {
    ElMessage.warning('请先选择要撤回通知的记录')
    return
  }

  // 过滤出可撤回通知的记录（等待面试状态）
  const canWithdrawRows = currentSelection.filter(row =>
    canWithdrawAudit(row.auditStatus)
  )

  if (canWithdrawRows.length === 0) {
    ElMessage.warning('选中的记录中没有可撤回通知的状态（需要"等待面试"状态）')
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
      ElMessage.warning(`已过滤 ${filteredCount} 条不符合条件的记录，将对 ${canWithdrawRows.length} 条符合条件的记录撤回通知`)
      await new Promise(resolve => setTimeout(resolve, 500)) // 等待用户看到提示
    }

    await ElMessageBox.confirm(
      `确认撤回选中的 ${canWithdrawRows.length} 条记录的通知吗？`,
      '批量撤回通知确认',
      {
        type: 'warning',
        confirmButtonText: '确认撤回',
        cancelButtonText: '取消'
      }
    )

    const applicantIds = canWithdrawRows.map(row => row.id)
    const response = await axios({
      url: API_PATHS.allocateBatchWithdrawAuditUrl,
      method: 'POST',
      data: {
        applicantIds
      }
    })

    if (response.data.code === 2000) {
      ElMessage.success('批量撤回通知成功')
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '批量撤回通知失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量撤回通知失败')
    }
  }
}

//************************************************ 区域：分配单个 *****************************************************

// 单个分配
const fun_singleOperation = async (row) => {
  currentSingleOperationRow.value = row

  // 判断表单是否可编辑（仅待分配状态可编辑）
  isSingleFormEditable.value = canAllocate(row.auditStatus)

  // 重置表单
  Object.assign(singleOperationForm, {
    applicantId: row.id,
    applyPosition: row.applyPosition || '',
    assignedDept: '',
    assignedDeptName: '',
    assignedUser: '',
    assignedDate: dayjs().format('YYYY-MM-DD'),
    assignedReason: ''
  })

  // 先打开对话框
  singleOperationDialogVisible.value = true

  // 显示对话框内的 loading
  singleOperationLoading.value = true

  // 调用分配列表API获取相关数据
  try {
    const response = await axios({
      url: API_PATHS.allocateDetailUrl,
      method: 'POST',
      data: { applicantId: row.id }
    })

    if (response.data.code === 2000) {
      // 预填充分配表单数据
      const assignData = response.data.data
      if (assignData) {
        // 如果有历史分配记录，预填充相关字段
        if (assignData.assignedUser) {
          singleOperationForm.assignedUser = assignData.assignedUser
        }
        if (assignData.assignedDept) {
          singleOperationForm.assignedDept = assignData.assignedDept
          // 翻译已保存的部门编码为显示名称
          try {
            await resolveDeptName(assignData.assignedDept, 'single')
          } catch (e) {
            // 静默失败
          }
        }
        if (assignData.assignedReason) {
          singleOperationForm.assignedReason = assignData.assignedReason
        }
        if (assignData.assignedDate) {
          singleOperationForm.assignedDate = assignData.assignedDate
        } else {
          // 如果没有历史分配日期，使用当天日期
          singleOperationForm.assignedDate = dayjs().format('YYYY-MM-DD')
        }
      }
    }
  } catch (error) {
    ElMessage.warning('获取分配数据失败')
  } finally {
    // 数据加载完成，关闭 loading
    singleOperationLoading.value = false
  }
}

// 单个保存分配
const fun_singleSaveOperation = async () => {
  try {
    const valid = await singleOperationFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查分配信息')
      return
    }

    const response = await axios({
      url: API_PATHS.allocateUpdateUrl,
      method: 'POST',
      data: {
        applicantId: currentSingleOperationRow.value.id,
        assignedDept: singleOperationForm.assignedDept,
        assignedDeptName: '',
        assignedUser: singleOperationForm.assignedUser,
        assignedDate: singleOperationForm.assignedDate,
        assignedReason: singleOperationForm.assignedReason
      }
    })

    if (response.data.code === 2000) {
      ElMessage.success('分配成功')
      singleOperationDialogVisible.value = false
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '分配失败')
    }
  } catch (error) {
    ElMessage.error('分配失败')
  }
}

// 单个通知
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
      url: API_PATHS.allocateAuditUrl,
      method: 'POST',
      data: {
        applicantId: row.id,
        auditStatus: 2 // 等待面试
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

// 单个撤回通知
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
      url: API_PATHS.allocateWithdrawAuditUrl,
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

//************************************************ 区域：分配状态 *****************************************************

// 分配（支持数字和字符串类型的状态值）
const canAllocate = (auditStatus) => {
  if (!auditStatus || auditStatus.key === null || auditStatus.key === undefined) {
    return false
  }
  // 支持数字1和字符串'1'两种格式
  return auditStatus.key === 1 || auditStatus.key === '1'
}

// 发起审核（支持数字和字符串类型的状态值）
const canAudit = (auditStatus) => {
  if (!auditStatus || auditStatus.key === null || auditStatus.key === undefined) {
    return false
  }
  // 支持数字1和字符串'1'两种格式
  return auditStatus.key === 1 || auditStatus.key === '1'
}

// 撤回审核（支持数字和字符串类型的状态值）
const canWithdrawAudit = (auditStatus) => {
  if (!auditStatus || auditStatus.key === null || auditStatus.key === undefined) {
    return false
  }
  // 支持数字2和字符串'2'两种格式
  return auditStatus.key === 2 || auditStatus.key === '2'
}

//************************************************ 区域：部门选择 *****************************************************

// 打开部门选择弹框（批量分配）
const openDeptSelectDialog = () => {
  currentDeptSelectContext.value = 'batch'
  deptSelectDialogVisible.value = true
  searchDeptList()
}

// 打开部门选择弹框（单个分配）
const openSingleDeptSelectDialog = () => {
  currentDeptSelectContext.value = 'single'
  deptSelectDialogVisible.value = true
  searchDeptList()
}

// 搜索部门列表
const searchDeptList = async () => {
  try {
    // 显示加载状态
    deptSelectLoading.value = true

    const response = await axios({
      url: API_PATHS.deptListUrl + '?pageNum=' + deptCurrentPage.value + '&pageSize=' + deptPageSize.value,
      method: 'POST',
      data: deptSearchForm
    })

    if (response.data.code === 2000) {
      // 后端分页返回的Page对象
      deptList.value = response.data.data.records || []
      deptTotal.value = response.data.data.total || 0
    } else {
      ElMessage.error(response.data.message || '获取部门列表失败')
    }
  } catch (error) {
    ElMessage.error('获取部门列表失败')
  } finally {
    // 隐藏加载状态
    deptSelectLoading.value = false
  }
}

// 重置部门搜索表单
const resetDeptSearch = () => {
  Object.assign(deptSearchForm, {
    orgName: '',
    orgNo: '',
    dateSteward: '',
    dateStewardNo: ''
  })
  deptCurrentPage.value = 1
  searchDeptList()
}

// 部门行选择当前行变化
const handleDeptRowChange = (currentRow) => {
  selectedDept.value = currentRow
}

// 部门分页当前页变化
const handleDeptCurrentChange = (page) => {
  deptCurrentPage.value = page
  searchDeptList()
}

// 部门分页大小变化
const handleDeptSizeChange = (size) => {
  deptPageSize.value = size
  deptCurrentPage.value = 1
  searchDeptList()
}

// 确认部门选择（统一方法）
const confirmDeptSelection = () => {
  if (!selectedDept.value) {
    ElMessage.warning('请选择一个部门')
    return
  }

  if (currentDeptSelectContext.value === 'batch') {
    // 批量分配
    operationForm.assignedDept = selectedDept.value.orgNo || ''
    operationForm.assignedDeptName = selectedDept.value.orgName || ''
    operationForm.assignedUser = selectedDept.value.dateSteward || ''
  } else {
    // 单个分配
    singleOperationForm.assignedDept = selectedDept.value.orgNo || ''
    singleOperationForm.assignedDeptName = selectedDept.value.orgName || ''
    singleOperationForm.assignedUser = selectedDept.value.dateSteward || ''
  }

  deptSelectDialogVisible.value = false
  ElMessage.success('部门选择成功')
}

// 确认部门选择（单个分配）- 保持向后兼容
const confirmSingleDeptSelection = () => {
  confirmDeptSelection()
}

//************************************************ 区域：数据多选 *****************************************************

// 通过部门编码查询部门名称，用于显示
const resolveDeptName = async (orgNo, target = 'single') => {
  if (!orgNo) {
    return
  }
  try {
    // 精确查询时不需要分页，直接使用list接口
    const resp = await axios({
      url: API_PATHS.deptListUrl + '?pageNum=1&pageSize=10',
      method: 'POST',
      data: {
        orgName: '',
        orgNo: orgNo,
        dateSteward: '',
        dateStewardNo: ''
      }
    })

    if (resp?.data.code === 2000) {
      const data = Array.isArray(resp.data.data) ? resp.data.data : (resp.data.data?.records || [])
      const match = Array.isArray(data) ? data.find(it => it && it.orgNo === orgNo) : null
      const name = (match && match.orgName) ? match.orgName : ''
      if (target === 'batch') {
        operationForm.assignedDeptName = name || operationForm.assignedDeptName
      } else {
        singleOperationForm.assignedDeptName = name || singleOperationForm.assignedDeptName
      }
    }
  } catch (e) {
    // 静默失败
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
