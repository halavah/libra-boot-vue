import { ref, reactive, inject, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import OnbApplicant from '../../onbApplicant/index.vue'

// API路径配置
const apiPaths = {
  // 请求路径：录用
  offerDetail: '/dev-api/onboard/offer/detail', // POST请求
  offerUpdate: '/dev-api/onboard/offer/update', // POST请求
  offerAudit: '/dev-api/onboard/offer/audit', // POST请求
  offerWithdrawAudit: '/dev-api/onboard/offer/withdraw-audit', // POST请求
  // 请求路径：重置操作
  offerReoffer: '/dev-api/onboard/offer/real-operate', // POST请求
  offerReallocate: '/dev-api/onboard/allocate/real-operate', // POST请求
}

// 枚举值配置
const attrLists = reactive({

})

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

      // 区域：录用操作1
      fun_operation,
      fun_saveOperation,
      fun_audit,
      fun_withdrawAudit,

      // 区域：录用操作2
      canOffer,
      canAudit,
      canWithdrawAudit,
      canReoffer,
      canReallocate,

      // 区域：重置操作
      fun_reoffer,
      fun_reallocate,

      // 区域：辅助操作
      formatDate,
    }
  }
}

//************************************************ 区域：data存储 *****************************************************

// 子组件实例引用（用于调用其公开方法）
const applicantRef = ref(null)

// 公共配置
const operationDialogVisible = ref(false)
const operationFormRef = ref(null)
const currentOperationRow = ref({})

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
  ]
})

//************************************************ 区域：录用操作1 *****************************************************

// 录用
const fun_operation = async (row) => {
  currentOperationRow.value = {
    ...row,
    genderText: row.gender?.value || '-',
    birthDateText: formatDate(row.birthDate)
  }

  // 初始化录用表单
  Object.assign(operationForm, {
    hireStatus: 1,           // 录用状态 - 默认：是(1)
    probationSalary: null,   // 试用期工资
    probationDuration: 1,    // 试用期时长 - 默认：一个月(1)
    formalSalary: null      // 转正工资
  })

  // 调用录用列表API获取相关数据
  try {
    const response = await axios.post(apiPaths.offerDetail, { applicantId: row.id })

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
            operationForm.probationDuration = offer.probationDuration.key
          }

          // 处理录用状态 - 提取枚举值的key字段
          if (offer.isHired?.key !== undefined) {
            operationForm.hireStatus = offer.isHired.key
          }
        }

        console.log('录用数据预填充完成:', responseData)
      } else {
        console.log('无历史录用数据，使用默认值')
      }
    }
  } catch (error) {
    console.error('获取录用数据失败:', error)
  }

  operationDialogVisible.value = true
}

// 保存录用
const fun_saveOperation = async () => {
  try {
    const valid = await operationFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查录用信息')
      return
    }

    const response = await axios.post(apiPaths.offerUpdate, {
      ...operationForm,
      applicantId: currentOperationRow.value.id
    })

    if (response.data.code === 2000) {
      ElMessage.success('录用信息保存成功')
      operationDialogVisible.value = false
      console.log('🔄 [onbOffer] 录用信息保存成功，准备调用 handleSearch')
      console.log('🔄 [onbOffer] applicantRef.value:', applicantRef.value)
      console.log('🔄 [onbOffer] handleSearch方法:', applicantRef.value?.handleSearch)
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '录用信息保存失败')
    }
  } catch (error) {
    ElMessage.error('录用信息保存失败')
    console.error('录用信息保存失败:', error)
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

    const response = await axios.post(apiPaths.offerAudit, {
      applicantId: row.id,
      auditStatus: 7 // 录用通过
    })

    if (response.data.code === 2000) {
      ElMessage.success('审核成功')
      console.log('🔄 [onbOffer] 审核成功，准备调用 handleSearch')
      console.log('🔄 [onbOffer] applicantRef.value:', applicantRef.value)
      console.log('🔄 [onbOffer] handleSearch方法:', applicantRef.value?.handleSearch)
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

    const response = await axios.post(apiPaths.offerWithdrawAudit, {
      applicantId: row.id
    })

    if (response.data.code === 2000) {
      ElMessage.success('撤回审核成功')
      console.log('🔄 [onbOffer] 撤回审核成功，准备调用 handleSearch')
      console.log('🔄 [onbOffer] applicantRef.value:', applicantRef.value)
      console.log('🔄 [onbOffer] handleSearch方法:', applicantRef.value?.handleSearch)
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

//************************************************ 区域：录用操作2 *****************************************************

// 录用按钮是否可用 (仅面试通过状态可录用)
const canOffer = (auditStatus) => {
  return auditStatus && auditStatus.key === 4
}

// 审核按钮是否可用 (仅面试通过状态可审核)
const canAudit = (auditStatus) => {
  return auditStatus && auditStatus.key === 4
}

// 撤回审核按钮是否可用 (录用审核中状态可撤回)
const canWithdrawAudit = (auditStatus) => {
  return auditStatus && auditStatus.key === 6
}

// 重新录用按钮是否可用 (录用通过或录用失败状态可重新录用)
const canReoffer = (auditStatus) => {
  return auditStatus && (auditStatus.key === 7 || auditStatus.key === 8)
}

// 重新分配按钮是否可用 (录用失败状态可重新分配)
const canReallocate = (auditStatus) => {
  return auditStatus && auditStatus.key === 8
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
      const response = await axios.post(apiPaths.offerReoffer, {
        applicantId: row.id
      })

      if (response.data.code === 2000) {
        ElMessage.success('重新录用成功')
        console.log('🔄 [onbOffer] 重新录用成功，准备调用 handleSearch')
        console.log('🔄 [onbOffer] applicantRef.value:', applicantRef.value)
        console.log('🔄 [onbOffer] handleSearch方法:', applicantRef.value?.handleSearch)
        await applicantRef.value?.handleSearch?.()
      } else {
        ElMessage.error(response.data.message || '重新录用失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新录用失败')
      console.error('重新录用失败:', error)
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
      const response = await axios.post(apiPaths.offerReallocate, {
        applicantId: row.id
      })

      if (response.data.code === 2000) {
        ElMessage.success('重新分配成功')
        console.log('🔄 [onbOffer] 重新分配成功，准备调用 handleSearch')
        console.log('🔄 [onbOffer] applicantRef.value:', applicantRef.value)
        console.log('🔄 [onbOffer] handleSearch方法:', applicantRef.value?.handleSearch)
        await applicantRef.value?.handleSearch?.()
      } else {
        ElMessage.error(response.data.message || '重新分配失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新分配失败')
      console.error('重新分配失败:', error)
    }
  }
}

//************************************************ 区域：辅助操作 *****************************************************

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return date
}
