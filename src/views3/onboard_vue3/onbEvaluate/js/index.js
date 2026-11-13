import {ref, reactive, inject, computed} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import axios from 'axios'
import OnbApplicant from '../../onbApplicant/index.vue'

// API路径配置
const apiPaths = {
  // 请求路径：评估
  evaluateDetail: '/dev-api/onboard/evaluate/detail', // POST请求
  evaluateUpdate: '/dev-api/onboard/evaluate/update', // POST请求
  evaluateAudit: '/dev-api/onboard/evaluate/audit', // POST请求
  evaluateWithdrawAudit: '/dev-api/onboard/evaluate/withdraw-audit', // POST请求
  // 请求路径：重置操作
  evaluateRealOperate: '/dev-api/onboard/evaluate/real-operate', // POST请求
  evaluateReallocate: '/dev-api/onboard/allocate/real-operate', // POST请求
}

// 枚举值配置 - 将通过ref从onbApplicant组件获取
const attrLists = reactive({})

// 组件导出
export default {
  // 组件名称
  name: 'OnbEvaluate',

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
      operationAForm,
      operationBForm,

      // 区域：评估操作1
      fun_operation,
      fun_saveOperation,
      fun_audit,
      fun_withdrawAudit,

      // 区域：评估操作2
      calculateATotalScore,
      calculateBTotalScore,
      handleEvaluationTypeChange,
      resetOperationForms,

      // 区域：评估操作3
      canEvaluate,
      canAudit,
      canWithdrawAudit,
      canReinterview,
      canReallocate,

      // 区域：重置操作
      fun_reinterview,
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

// 评估表单
const operationForm = reactive({
  applicantId: '',       // 应聘者ID
  applicantName: '',     // 姓名
  genderText: '',        // 性别
  birthDateText: '',     // 出生日期
  contactPhone: '',      // 联系电话
  idCardNo: '',          // 身份证号
  applyPosition: '',     // 应聘岗位
  testMethod: 1,         // 测试方式 - 默认：笔试(1)
  employmentType: 1,     // 用工性质 - 默认：一般普工(1)
  interviewEvaluationType: 1,   // 评估类型 - 默认：A类型(1)
  interviewScore: '',    // 面试得分
  isHired: 1,            // 是否通过 - 默认：是(1)
  interviewSuggestion: '' // 面试意见
})

// 评估表单验证
const operationFormRules = reactive({
  testMethod: [
    {required: true, message: '请选择测试方式', trigger: 'change'}
  ],
  employmentType: [
    {required: true, message: '请选择用工性质', trigger: 'change'}
  ],
  interviewEvaluationType: [
    {required: true, message: '请选择评估类型', trigger: 'change'}
  ],
  isHired: [
    {required: true, message: '请选择面试结果', trigger: 'change'}
  ]
})

// 评估表单：A类型
const operationAForm = reactive({
  id: '',                // 主键ID
  interviewEvaluationId: '', // 面试评估ID
  educationScore: 0,        // 教育分数
  majorMatchScore: 0,       // 专业匹配分数
  theoryKnowledgeScore: 0, // 理论知识分数
  practicalExperienceScore: 0, // 实践经验分数
  industryExperienceScore: 0, // 行业经验分数
  targetManagementScore: 0,  // 目标管理分数
  planManagementScore: 0,    // 计划管理分数
  organizationManagementScore: 0, // 组织管理分数
  performanceManagementScore: 0, // 绩效管理分数
  personalityManagementScore: 0, // 性格管理分数
  totalScore: 0                // 总分数
})

// 评估表单：B类型
const operationBForm = reactive({
  id: '',                // 主键ID
  interviewEvaluationId: '', // 面试评估ID
  professionalKnowledgeScore: 0, // 专业知识分数
  practicalSkillScore: 0,       // 实践技能分数
  mentalStateScore: 0,         // 心理状态分数
  hardworkingScore: 0,         // 勤奋分数
  communicationScore: 0,       // 沟通分数
  experienceScore: 0,          // 经验分数
  totalScore: 0                // 总分数
})

//************************************************ 区域：评估操作1 *****************************************************

// 评估
const fun_operation = async (row) => {
  currentOperationRow.value = {...row}

  // 初始化评估表单
  Object.assign(operationForm, {
    applicantId: row.id,
    applicantName: row.applicantName,
    genderText: row.gender?.value || '-',
    birthDateText: formatDate(row.birthDate),
    contactPhone: row.contactPhone,
    idCardNo: row.idCardNo,
    applyPosition: row.applyPosition,
    testMethod: 1,         // 测试方式 - 默认：笔试(1)
    employmentType: 1,     // 用工性质 - 默认：一般普工(1)
    interviewEvaluationType: 1, // 评估类型 - 默认：A类型(1)
    interviewScore: '',    // 面试得分
    isHired: 1,            // 是否通过 - 默认：是(1)
    interviewSuggestion: '' // 面试意见
  })

  // 调用评估列表API获取相关数据
  try {
    const response = await axios.post(apiPaths.evaluateDetail, {applicantId: row.id})

    if (response.data.code === 2000) {
      // 预填充评估表单数据
      let responseData = response.data.data
      if (responseData) {
        // 先重置评估表单
        resetOperationForms()

        // 预填充基本信息（只读）
        operationForm.applicantName = responseData.applicant?.applicantName || row.applicantName
        operationForm.gender = responseData.applicant?.gender || row.gender
        operationForm.birthDate = responseData.applicant?.birthDate || row.birthDate
        operationForm.contactPhone = responseData.applicant?.contactPhone || row.contactPhone
        operationForm.idCardNo = responseData.applicant?.idCardNo || row.idCardNo
        operationForm.applyPosition = responseData.applicant?.applyPosition || row.applyPosition

        // 如果有历史评估记录，预填充评估数据
        if (responseData.evaluation) {
          const evaluation = responseData.evaluation

          // 提取枚举值（key字段）并确保转换为数字类型
          if (evaluation.testMethod?.key !== undefined) {
            operationForm.testMethod = Number(evaluation.testMethod.key)
          }
          if (evaluation.employmentType?.key !== undefined) {
            operationForm.employmentType = Number(evaluation.employmentType.key)
          }
          if (evaluation.interviewEvaluationType?.key !== undefined) {
            operationForm.interviewEvaluationType = Number(evaluation.interviewEvaluationType.key)
            handleEvaluationTypeChange() // 触发评估类型切换
          }
          if (evaluation.interviewScore) {
            operationForm.interviewScore = Number(evaluation.interviewScore)
          }
          if (evaluation.isHired?.key !== undefined) {
            operationForm.isHired = Number(evaluation.isHired.key)
          }
          if (evaluation.interviewSuggestion) {
            operationForm.interviewSuggestion = evaluation.interviewSuggestion
          }
        }

        // 预填充A类型评估数据
        if (responseData.evaluationA) {
          const operationA = responseData.evaluationA

          // 提取评分数据
          operationAForm.id = operationA.id || ''
          operationAForm.interviewEvaluationId = operationA.interviewEvaluationId || ''
          operationAForm.educationScore = operationA.educationScore || 0
          operationAForm.majorMatchScore = operationA.majorMatchScore || 0
          operationAForm.theoryKnowledgeScore = operationA.theoryKnowledgeScore || 0
          operationAForm.practicalExperienceScore = operationA.practicalExperienceScore || 0
          operationAForm.industryExperienceScore = operationA.industryExperienceScore || 0
          operationAForm.targetManagementScore = operationA.targetManagementScore || 0
          operationAForm.planManagementScore = operationA.planManagementScore || 0
          operationAForm.organizationManagementScore = operationA.organizationManagementScore || 0
          operationAForm.performanceManagementScore = operationA.performanceManagementScore || 0
          operationAForm.personalityManagementScore = operationA.personalityManagementScore || 0
          operationAForm.totalScore = operationA.totalScore || 0

          // 重新计算总分
          calculateATotalScore()
        }

        // 预填充B类型评估数据
        if (responseData.evaluationB) {
          const evaluationB = responseData.evaluationB

          // 提取评分数据
          operationBForm.id = evaluationB.id || ''
          operationBForm.interviewEvaluationId = evaluationB.interviewEvaluationId || ''
          operationBForm.professionalKnowledgeScore = evaluationB.professionalKnowledgeScore || 0
          operationBForm.practicalSkillScore = evaluationB.practicalSkillScore || 0
          operationBForm.mentalStateScore = evaluationB.mentalStateScore || 0
          operationBForm.hardworkingScore = evaluationB.hardworkingScore || 0
          operationBForm.communicationScore = evaluationB.communicationScore || 0
          operationBForm.experienceScore = evaluationB.experienceScore || 0
          operationBForm.totalScore = evaluationB.totalScore || 0

          // 重新计算总分
          calculateBTotalScore()
        }

        console.log('评估数据预填充完成:', responseData)
      } else {
        console.log('无历史评估数据，使用默认值')
      }
    }
  } catch (error) {
    console.error('获取评估数据失败:', error)
  }

  operationDialogVisible.value = true
}

// 保存评估
const fun_saveOperation = async () => {
  try {
    const valid = await operationFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查评估信息')
      return
    }

    // 确认提示：明确告诉用户保存的是哪种类型的评估
    const evaluationTypeText = operationForm.interviewEvaluationType === 1 ? 'A类型' : 'B类型'
    const applicantName = operationForm.applicantName

    try {
      await ElMessageBox.confirm(
        `确认保存【${applicantName}】的【${evaluationTypeText}】评估结果吗？\n\n注意：最终只会保存【${evaluationTypeText}】的评估数据。`,
        '保存确认',
        {
          type: 'warning',
          confirmButtonText: '确认保存',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true
        }
      )
    } catch (confirmError) {
      if (confirmError === 'cancel') {
        return // 用户取消，直接返回
      }
    }

    // 准备提交数据
    const evaluationData = {
      applicantId: operationForm.applicantId,
      testMethod: operationForm.testMethod,
      employmentType: operationForm.employmentType,
      interviewEvaluationType: operationForm.interviewEvaluationType,
      interviewScore: operationForm.interviewScore,
      isHired: operationForm.isHired,
      interviewSuggestion: operationForm.interviewSuggestion,
      // A类型评估数据
      aTypeData: operationForm.interviewEvaluationType === 1 ? {
        ...operationAForm
      } : null,
      // B类型评估数据
      bTypeData: operationForm.interviewEvaluationType === 2 ? {
        ...operationBForm
      } : null
    }

    const response = await axios.post(apiPaths.evaluateUpdate, evaluationData)

    if (response.data.code === 2000) {
      ElMessage.success(`${evaluationTypeText}评估保存成功`)
      operationDialogVisible.value = false
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '评估保存失败')
    }
  } catch (error) {
    ElMessage.error('评估保存失败')
    console.error('评估保存失败:', error)
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

    const response = await axios.post(apiPaths.evaluateAudit, {
      applicantId: row.id,
      auditStatus: 4 // 面试通过
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

    const response = await axios.post(apiPaths.evaluateWithdrawAudit, {
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

//************************************************ 区域：评估操作2 *****************************************************

// 计算A类型总分（带权重）
const calculateATotalScore = () => {
  const form = operationAForm
  // 权重规则：基础素质30%，专业深度25%，经验匹配20%，综合素质25%
  // 基础素质：学历水平(10分) + 专业匹配(10分) = 20分，权重30% = 6分
  const baseScore = (form.educationScore + form.majorMatchScore) * 0.3
  // 专业深度：理论知识(10分) + 实务经验(10分) = 20分，权重25% = 5分
  const professionalScore = (form.theoryKnowledgeScore + form.practicalExperienceScore) * 0.25
  // 经验匹配：行业经验(10分)，权重20% = 2分
  const experienceScore = form.industryExperienceScore * 0.2
  // 综合素质：5个评分项各10分 = 50分，权重25% = 12.5分
  const comprehensiveScore = (form.targetManagementScore + form.planManagementScore +
    form.organizationManagementScore + form.performanceManagementScore +
    form.personalityManagementScore) * 0.25

  // 总分 = 6 + 5 + 2 + 12.5 = 25.5分，需要乘以3.92来达到100分满分
  operationAForm.totalScore = Math.round((baseScore + professionalScore + experienceScore + comprehensiveScore) * 3.92 * 10) / 10

  // 如果当前是A类型，同步总分到面试得分
  if (operationForm.interviewEvaluationType === 1) {
    operationForm.interviewScore = operationAForm.totalScore
  }
}

// 计算B类型总分（带权重）
const calculateBTotalScore = () => {
  const form = operationBForm
  // 权重规则：专业技能40%，综合素质40%，用工类型20%
  // 专业技能：专业知识(10分) + 实操技能(10分) = 20分，权重40% = 8分
  const professionalScore = (form.professionalKnowledgeScore + form.practicalSkillScore) * 0.4
  // 综合素质：4个评分项各10分 = 40分，权重40% = 16分
  const comprehensiveScore = (form.mentalStateScore + form.hardworkingScore +
    form.communicationScore + form.experienceScore) * 0.4
  // 用工类型：固定10分，权重20% = 2分
  const employmentScore = 10 * 0.2

  // 总分 = 8 + 16 + 2 = 26分，需要乘以3.846来达到100分满分
  operationBForm.totalScore = Math.round((professionalScore + comprehensiveScore + employmentScore) * 3.846 * 10) / 10

  // 如果当前是B类型，同步总分到面试得分
  if (operationForm.interviewEvaluationType === 2) {
    operationForm.interviewScore = operationBForm.totalScore
  }
}

// 监听评估类型变化
const handleEvaluationTypeChange = () => {
  // 当评估类型改变时，重新计算对应类型的总分
  if (operationForm.interviewEvaluationType === 1) {
    calculateATotalScore()
    // 将A类型总分同步到面试得分
    operationForm.interviewScore = operationAForm.totalScore
  } else if (operationForm.interviewEvaluationType === 2) {
    calculateBTotalScore()
    // 将B类型总分同步到面试得分
    operationForm.interviewScore = operationBForm.totalScore
  }
}

// 重置评估表单
const resetOperationForms = () => {
  Object.assign(operationAForm, {
    id: '',                // 主键ID
    interviewEvaluationId: '', // 面试评估ID
    educationScore: 0,       // 学历水平
    majorMatchScore: 0,      // 专业匹配
    theoryKnowledgeScore: 0, // 理论知识
    practicalExperienceScore: 0, // 实务经验
    industryExperienceScore: 0, // 行业经验
    targetManagementScore: 0, // 目标管理
    planManagementScore: 0, // 计划管理
    organizationManagementScore: 0, // 组织管理
    performanceManagementScore: 0, // 绩效管理
    personalityManagementScore: 0, // 性格管理
    totalScore: 0                // 总分
  })

  Object.assign(operationBForm, {
    id: '',                // 主键ID
    interviewEvaluationId: '', // 面试评估ID
    professionalKnowledgeScore: 0, // 专业知识
    practicalSkillScore: 0,      // 实操技能
    mentalStateScore: 0,        // 心理状态
    hardworkingScore: 0,        // 勤奋
    communicationScore: 0,      // 沟通
    experienceScore: 0,         // 经验
    totalScore: 0                // 总分
  })
}

//************************************************ 区域：评估操作3 *****************************************************

// 评估按钮是否可用 (仅等待面试状态可评估)
const canEvaluate = (auditStatus) => {
  return auditStatus && auditStatus.key === 2
}

// 审核按钮是否可用 (仅等待面试状态可审核)
const canAudit = (auditStatus) => {
  return auditStatus && auditStatus.key === 2
}

// 撤回审核按钮是否可用 (面试审核中状态可撤回)
const canWithdrawAudit = (auditStatus) => {
  return auditStatus && auditStatus.key === 3
}

// 重新面试按钮是否可用 (面试通过或面试失败状态可重新面试)
const canReinterview = (auditStatus) => {
  return auditStatus && (auditStatus.key === 4 || auditStatus.key === 5)
}

// 重新分配按钮是否可用 (面试失败状态可重新分配)
const canReallocate = (auditStatus) => {
  return auditStatus && auditStatus.key === 5
}

//************************************************ 区域：重置操作 *****************************************************

// 重新面试操作
const fun_reinterview = async (row) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要将应聘者"${row.applicantName}"重新面试吗？重新面试后状态将变为"等待面试"。`,
      '重新面试确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      const response = await axios.post(apiPaths.evaluateRealOperate, {
        applicantId: row.id
      })

      if (response.data.code === 2000) {
        ElMessage.success('重新面试成功')
        await applicantRef.value?.handleSearch?.()
      } else {
        ElMessage.error(response.data.message || '重新面试失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新面试失败')
      console.error('重新面试失败:', error)
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
      const response = await axios.post(apiPaths.evaluateReallocate, {
        applicantId: row.id
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
      console.error('重新分配失败:', error)
    }
  }
}

//************************************************ 区域：辅助操作 *****************************************************

// 格式化日期
const formatDate = (date) => {
  if (!date) {
    return '-'
  }
  return date
}
