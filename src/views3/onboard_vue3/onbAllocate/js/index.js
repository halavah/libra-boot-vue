import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import OnbApplicant from '../../onbApplicant/index.vue'

// API路径配置
const apiPaths = {
  // 请求路径：分配
  allocateDetail: '/dev-api/onboard/allocate/detail', // POST请求
  allocateUpdate: '/dev-api/onboard/allocate/update', // POST请求
  allocateAudit: '/dev-api/onboard/allocate/audit', // POST请求
  allocateWithdrawAudit: '/dev-api/onboard/allocate/withdraw-audit', // POST请求
}

// 枚举值配置
const attrLists = reactive({

})

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
    return {
      // 公共
      apiPaths,
      attrLists: computed(() => {
        return applicantRef.value?.attrLists || attrLists
      }),

      // 区域：data存储
      applicantRef,
      operationDialogVisible,
      operationFormRef,
      currentOperationRow,
      operationForm,
      operationFormRules,

      // 区域：分配操作1
      fun_operation,
      fun_saveOperation,
      fun_audit,
      fun_withdrawAudit,

      // 区域：分配操作2
      canAllocate,
      canAudit,
      canWithdrawAudit,

      // 区域：资源操作
      downloadBatchAttachments,
    }
  }
}

//************************************************ 区域：data存储 *****************************************************

// 子组件实例引用（用于调用其公开方法）
const applicantRef = ref(null)

// 公共配置
const operationDialogVisible = ref(false)
const operationFormRef = ref('')
const currentOperationRow = ref({})

// 分配表单
const operationForm = reactive({
  applicantId: '',
  applyPosition: '',
  assignedDept: '',
  assignedUser: '',
  assignedDate: '',
  assignedReason: ''
})

// 分配表单验证
const operationFormRules = reactive({
  assignedUser: [
    { required: true, message: '请输入分配人', trigger: 'blur' },
    { min: 2, max: 20, message: '分配人长度在2-20个字符', trigger: 'blur' }
  ],
  assignedDept: [
    { required: true, message: '请输入分配部门', trigger: 'blur' },
    { min: 2, max: 50, message: '分配部门长度在2-50个字符', trigger: 'blur' }
  ]
})

//************************************************ 区域：分配操作1 *****************************************************

// 分配
const fun_operation = async (row) => {
  currentOperationRow.value = row
  Object.assign(operationForm, {
    applicantId: row.id,
    applyPosition: row.applyPosition || '',
    assignedDept: '',
    assignedUser: '',
    assignedDate: '',
    assignedReason: ''
  })

  // 调用分配列表API获取相关数据
  try {
    const response = await axios.post(apiPaths.allocateDetail, { applicantId: row.id })

    if (response.data.code === 2000) {
      // 预填充分配表单数据
      const assignData = response.data.data
      if (assignData) {
        // 如果有历史分配记录，预填充相关字段
        if (assignData.assignedUser) {
          operationForm.assignedUser = assignData.assignedUser
        }
        if (assignData.assignedDept) {
          operationForm.assignedDept = assignData.assignedDept
        }
        if (assignData.assignedReason) {
          operationForm.assignedReason = assignData.assignedReason
        }
        if (assignData.assignedDate) {
          operationForm.assignedDate = assignData.assignedDate
        }
        console.log('分配数据预填充完成:', assignData)
      } else {
        console.log('无历史分配数据，使用默认值')
      }
    }
  } catch (error) {
    console.error('获取分配数据失败:', error)
  }

  operationDialogVisible.value = true
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
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '分配失败')
    }
  } catch (error) {
    ElMessage.error('分配失败')
    console.error('分配失败:', error)
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

    const response = await axios.post(apiPaths.allocateAudit, {
      applicantId: row.id,
      auditStatus: 2 // 等待面试
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
      console.error('审核失败:', error)
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

    const response = await axios.post(apiPaths.allocateWithdrawAudit, {
      applicantId: row.id
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
      console.error('撤回审核失败:', error)
    }
  }
}

//************************************************ 区域：分配操作2 *****************************************************

// 分配按钮是否可用 (仅待分配状态可分配)
const canAllocate = (auditStatus) => {
  return auditStatus && auditStatus.key === 1
}

// 审核按钮是否可用 (待分配状态可审核)
const canAudit = (auditStatus) => {
  return auditStatus && auditStatus.key === 1
}

// 撤回审核按钮是否可用 (等待面试状态可撤回审核)
const canWithdrawAudit = (auditStatus) => {
  return auditStatus && auditStatus.key === 2
}

//************************************************ 区域：资源操作 *****************************************************

// 一键下载附件，废弃，已调用【tableActions.downloadBatchAttachments(scope.row)】
const downloadBatchAttachments = async (applicantRow) => {
  console.log('🔽 onbAllocate downloadBatchAttachments 开始执行')
  console.log('📥 接收到的参数 applicantRow:', applicantRow)
  console.log('📥 applicantRow.id:', applicantRow?.id)
  console.log('📥 applicantRow.applicantName:', applicantRow?.applicantName)

  if (!applicantRow || !applicantRow.id) {
    console.error('❌ 应聘者信息验证失败:', { applicantRow })
    ElMessage.warning('应聘者信息不能为空')
    return
  }

  console.log('✅ 应聘者信息验证通过，准备调用父组件方法')
  console.log('📍 applicantRef.value:', applicantRef.value)
  console.log('📍 applicantRef.value?.downloadBatchAttachments:', applicantRef.value?.downloadBatchAttachments)

  try {
    console.log('🚀 开始调用父组件的 downloadBatchAttachments 方法')
    // 直接调用父组件的下载方法，传递完整的应聘者信息
    const result = await applicantRef.value?.downloadBatchAttachments?.(applicantRow)
    console.log('✅ 父组件方法调用完成，返回结果:', result)
  } catch (error) {
    console.error('❌ 一键下载失败，详细错误信息:', error)
    console.error('❌ 错误堆栈:', error.stack)
    ElMessage.error('下载失败，请重试')
  }
}
