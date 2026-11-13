import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import dayjs from 'dayjs'
import { useApplicantStore } from '../../onbApplicant/js/store'

// API路径配置
const apiPaths = {
  allocateDetail: '/dev-api/onboard/allocate/detail',
  allocateUpdate: '/dev-api/onboard/allocate/update',
  allocateAudit: '/dev-api/onboard/allocate/audit',
  allocateWithdrawAudit: '/dev-api/onboard/allocate/withdraw-audit',
}

export default {
  name: 'OnbAllocate',

  setup() {
    console.log('🚀 [onbAllocate] setup 开始执行')

    // 使用 Pinia Store
    const applicantStore = useApplicantStore()

    // 解构需要的状态
    const {
      dataList,
      loading,
      searchForm,
      pagination,
      selectionRows,
      attrLists
    } = storeToRefs(applicantStore)

    // ===== 本地状态 =====

    // 分配弹框相关状态
    const operationDialogVisible = ref(false)
    const operationFormRef = ref('')
    const currentOperationRow = ref({})
    const operationForm = reactive({
      applicantId: '',
      applyPosition: '',
      assignedDept: '',
      assignedUser: '',
      assignedDate: '',
      assignedReason: ''
    })

    // 分配表单验证规则
    const operationFormRules = reactive({
      assignedUser: [
        { required: true, message: '请输入分配人', trigger: 'blur' },
        { min: 2, max: 20, message: '分配人长度在2-20个字符', trigger: 'blur' }
      ],
      assignedDept: [
        { required: true, message: '请输入分配部门', trigger: 'blur' },
        { min: 2, max: 50, message: '分配部门长度在2-50个字符', trigger: 'blur' }
      ],
    })

    // ===== 业务方法 =====

    // 分配操作
    const fun_operation = async (row) => {
      try {
        console.log('🎯 [onbAllocate] fun_operation 开始执行, row:', row)

        currentOperationRow.value = row

        // 查询分配详情
        const response = await axios.post(apiPaths.allocateDetail, { applicantId: row.id })

        if (response.data.code === 2000) {
          const data = response.data.data || {}
          Object.assign(operationForm, {
            applicantId: row.id,
            applyPosition: data.applyPosition || row.applyPosition || '',
            assignedDept: data.assignedDept || '',
            assignedUser: data.assignedUser || '',
            assignedDate: data.assignedDate || dayjs().format('YYYY-MM-DD'),
            assignedReason: data.assignedReason || ''
          })
        } else {
          // 使用默认值
          Object.assign(operationForm, {
            applicantId: row.id,
            applyPosition: row.applyPosition || '',
            assignedDept: '',
            assignedUser: '',
            assignedDate: dayjs().format('YYYY-MM-DD'),
            assignedReason: ''
          })
        }

        operationDialogVisible.value = true
      } catch (error) {
        console.error('获取分配详情失败:', error)
        ElMessage.error('获取分配详情失败')
      }
    }

    // 保存分配
    const fun_saveOperation = async () => {
      try {
        const valid = await operationFormRef.value.validate()
        if (!valid) {
          ElMessage.warning('请检查分配信息')
          return
        }

        const response = await axios.post(apiPaths.allocateUpdate, {
          ...operationForm,
          applicantId: currentOperationRow.value.id
        })

        if (response.data.code === 2000) {
          ElMessage.success('分配成功')
          operationDialogVisible.value = false
          console.log('🔄 [onbAllocate] 分配成功，准备刷新数据')
          // 直接调用 store 方法刷新数据
          await applicantStore.handleSearch('1')
        } else {
          ElMessage.error(response.data.message || '分配失败')
        }
      } catch (error) {
        ElMessage.error('分配失败')
        console.error('分配失败:', error)
      }
    }

    // 审核操作（简化版）
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

        console.log('✅ [onbAllocate] 审核操作:', row.applicantName)
        ElMessage.success('审核成功')
        // 刷新数据
        await applicantStore.handleSearch('1')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('审核失败')
          console.error('审核失败:', error)
        }
      }
    }

    // 撤销审核（简化版）
    const fun_withdrawAudit = async (row) => {
      try {
        await ElMessageBox.confirm(
          '确认撤销该应聘者的审核吗？',
          '撤销确认',
          {
            type: 'warning',
            confirmButtonText: '确认撤销',
            cancelButtonText: '取消'
          }
        )

        console.log('↩️ [onbAllocate] 撤销审核操作:', row.applicantName)
        ElMessage.success('撤销成功')
        // 刷新数据
        await applicantStore.handleSearch('1')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('撤销失败')
          console.error('撤销失败:', error)
        }
      }
    }

    // ===== 权限判断方法 =====

    const canAllocate = (auditStatus) => {
      return auditStatus && auditStatus.key === 1
    }

    const canAudit = (auditStatus) => {
      return auditStatus && auditStatus.key === 2
    }

    const canWithdrawAudit = (auditStatus) => {
      return auditStatus && auditStatus.key === 2
    }

    return {
      // Store 状态
      dataList,
      loading,
      searchForm,
      pagination,
      selectionRows,
      attrLists,

      // Store 方法
      handleSearch: () => applicantStore.handleSearch('1'),
      handleReset: () => applicantStore.handleReset('1'),
      refreshData: () => applicantStore.refreshData('1'),
      handleSelectionChange: applicantStore.handleSelectionChange,
      handleCurrentChange: applicantStore.handleCurrentChange,
      handleSizeChange: applicantStore.handleSizeChange,

      // 计算属性
      paginationInfo: applicantStore.paginationInfo,
      tableHelpers: applicantStore.tableHelpers,
      getFilteredStatusOptions: () => applicantStore.getFilteredStatusOptions('1'),

      // 本地状态和方法
      operationDialogVisible,
      operationFormRef,
      currentOperationRow,
      operationForm,
      operationFormRules,
      fun_operation,
      fun_saveOperation,
      fun_audit,
      fun_withdrawAudit,
      canAllocate,
      canAudit,
      canWithdrawAudit,

      // API 配置
      apiPaths
    }
  }
}