import {ref, reactive, computed} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import axios from 'axios'
import OnbApplicant from '../../onbApplicant/index.vue'
import {Search, Refresh, Plus, Delete, SetUp, Bell, Close, Download} from '@element-plus/icons-vue'

const BASE_URL = '/dev-api'

const API_PATHS = {
  evaluateDetailUrl: BASE_URL + '/onboard/evaluate/detail',
  evaluateUpdateUrl: BASE_URL + '/onboard/evaluate/update',
  evaluateAuditUrl: BASE_URL + '/onboard/evaluate/audit',
  evaluateWithdrawAuditUrl: BASE_URL + '/onboard/evaluate/withdraw-audit',
  evaluateBatchUpdateUrl: BASE_URL + '/onboard/evaluate/batch-update',
  evaluateBatchAuditUrl: BASE_URL + '/onboard/evaluate/batch-audit',
  evaluateBatchWithdrawAuditUrl: BASE_URL + '/onboard/evaluate/batch-withdraw-audit',
  evaluateRealOperateUrl: BASE_URL + '/onboard/evaluate/real-operate',
  evaluateReallocateUrl: BASE_URL + '/onboard/allocate/real-operate',
  evaluateApplyGetFormInstIdUrl: BASE_URL + '/onboard/evaluateApply/getFormInstId',
  evaluateApplyApprovalTrailUrl: BASE_URL + '/onboard/evaluateApply/getApprovalTrail'
}

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

      // 区域：评估弹框
      operationDialogVisible,
      operationFormRef,
      operationForm,
      operationFormRules,
      operationAForm,
      operationBForm,
      isFormEditable,

      // 区域：批量评估弹框
      batchOperationDialogVisible,
      batchOperationFormRef,
      batchOperationForm,
      batchOperationFormRules,
      batchOperationAForm,
      batchOperationBForm,

      // 区域：审批流程
      approvalTrailDialogVisible,
      approvalTrailList,
      currentFormInstId,

      // 区域：评估操作
      fun_operation,
      fun_saveOperation,
      fun_audit,
      fun_withdrawAudit,
      calculateATotalScore,
      calculateBTotalScore,
      handleEvaluationTypeChange,
      resetOperationForms,

      // 区域：批量操作
      fun_batchEvaluate,
      fun_batchSaveEvaluate,
      fun_batchAudit,
      fun_batchWithdrawAudit,
      removeApplicant,
      selectionSelectable,
      canBatchEvaluate,
      canBatchAudit,
      canBatchWithdrawAudit,
      calculateBatchATotalScore,
      calculateBatchBTotalScore,
      handleBatchEvaluationTypeChange,

      // 区域：重置操作
      fun_reinterview,
      fun_reallocate,

      // 区域：状态判断
      checkFormEditable,
      canAudit,
      canWithdrawAudit,
      canReinterview,
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
const operationFormRef = ref(null)
const currentOperationRow = ref({})

// 批量评估弹框相关
const batchOperationDialogVisible = ref(false)
const batchOperationFormRef = ref(null)

// 审批流程痕迹
const approvalTrailDialogVisible = ref(false)
const approvalTrailList = ref([])
const currentFormInstId = ref('')
const currentDetailRow = ref(null)

// 表单是否可编辑状态 (将在方法中动态设置)
const isFormEditable = ref(false)

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

// 批量评估表单
const batchOperationForm = reactive({
  testMethod: 1,              // 测试方式 - 默认：测试(1)
  employmentType: 1,          // 用工性质 - 默认：正式员工(1)
  interviewEvaluationType: 1, // 评估类型 - 默认：A类型(1)
  interviewScore: '',         // 评估得分
  isHired: 1,                // 是否通过 - 默认：是(1)
  interviewSuggestion: ''    // 面试意见
})

// 批量评估表单验证
const batchOperationFormRules = reactive({
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

// 批量评估表单：A类型
const batchOperationAForm = reactive({
  educationScore: 0,      // 学历水平
  majorMatchScore: 0,     // 专业匹配
  theoryKnowledgeScore: 0, // 理论知识
  practicalExperienceScore: 0, // 实践经验
  industryExperienceScore: 0, // 行业经验
  targetManagementScore: 0,  // 目标管理
  planManagementScore: 0,    // 计划管理
  organizationManagementScore: 0, // 组织管理
  performanceManagementScore: 0, // 绩效管理
  personalityManagementScore: 0, // 性格管理
  totalScore: 0                // 总分数
})

// 批量评估表单：B类型
const batchOperationBForm = reactive({
  professionalKnowledgeScore: 0, // 专业知识
  practicalSkillScore: 0,       // 实操技能
  mentalStateScore: 0,         // 精神状态
  hardworkingScore: 0,         // 吃苦耐劳
  communicationScore: 0,       // 沟通协调
  experienceScore: 0,          // 工作经验
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

  // 设置表单是否可编辑状态
  checkFormEditable(row.auditStatus)

  // 调用评估列表API获取相关数据
  try {
    const response = await axios.post(API_PATHS.evaluateDetailUrl, {applicantId: row.id})

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

      }
    }
  } catch (error) {
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

    const response = await axios.post(API_PATHS.evaluateUpdateUrl, evaluationData)

    if (response.data.code === 2000) {
      ElMessage.success(`${evaluationTypeText}评估保存成功`)
      operationDialogVisible.value = false
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '评估保存失败')
    }
  } catch (error) {
    ElMessage.error('评估保存失败')
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

    const response = await axios.post(API_PATHS.evaluateAuditUrl, {
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

    const response = await axios.post(API_PATHS.evaluateWithdrawAuditUrl, {
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

//************************************************ 区域：审批流程 *****************************************************

// 显示审批流程痕迹弹窗
const fun_showApprovalTrail = async (row) => {
  approvalTrailList.value = [] // 先清空
  currentFormInstId.value = '' // 重置审批ID
  currentDetailRow.value = {} // 重置详情数据

  // 调用详情接口获取完整数据
  try {
    const response = await axios.post(API_PATHS.evaluateDetailUrl, {applicantId: row.id})

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

          // 评估信息（来自 evaluation）
          interviewerDate: responseData.evaluation?.interviewerDate || '-',
          evaluationScore: responseData.evaluation?.interviewScore || '-',
          isPassed: responseData.evaluation?.isHired?.key,
          evaluationType: responseData.evaluation?.interviewEvaluationType?.key,
          testMethod: responseData.evaluation?.testMethod?.key,
          employmentType: responseData.evaluation?.employmentType?.key,
          evaluationComment: responseData.evaluation?.interviewSuggestion || '-'
        }
      }
    } else {
      ElMessage.error(response.data.message || '获取详情数据失败')
      currentDetailRow.value = {...row} // 使用行数据作为备用
    }
  } catch (error) {
    console.error('获取详情数据失败:', error)
    ElMessage.error('获取详情数据失败')
    currentDetailRow.value = {...row} // 使用行数据作为备用
  }

  // 通过 applicantId 获取 formInstId
  const formInstId = await getFormInstId(row.id)
  if (formInstId) {
    currentFormInstId.value = formInstId // 保存审批ID
    await loadApprovalTrail(formInstId)
  }

  // 显示弹框
  approvalTrailDialogVisible.value = true
}

// 通过 applicantId 获取 formInstId
const getFormInstId = async (applicantId) => {
  if (!applicantId) {
    ElMessage.warning('缺少应聘者ID')
    return null
  }
  try {
    const response = await axios.post(API_PATHS.evaluateApplyGetFormInstIdUrl, applicantId, {
      headers: {'Content-Type': 'text/plain'}
    })

    if (response.data.code === 2000) {
      return response.data.data
    } else {
      ElMessage.error(response.data.message || '获取流程实例ID失败')
      return null
    }
  } catch (error) {
    console.error('获取流程实例ID失败:', error)
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
    const response = await axios.post(API_PATHS.evaluateApplyApprovalTrailUrl, formInstId, {
      headers: {'Content-Type': 'text/plain'}
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

//************************************************ 区域：批量操作 *****************************************************

// 批量评估
const fun_batchEvaluate = async () => {
  // 从子组件获取选中的数据
  const currentSelection = applicantRef.value?.getSelectedRows?.() || []

  if (!currentSelection || currentSelection.length === 0) {
    ElMessage.warning('请先选择需要评估的记录')
    return
  }

  // 过滤出可评估的记录（等待面试状态）
  const canEvaluateRows = currentSelection.filter(row =>
    row.auditStatus && row.auditStatus.key === 2
  )

  if (canEvaluateRows.length === 0) {
    ElMessage.warning('选中的记录中没有可评估的状态（需要"等待面试"状态）')
    return
  }

  // 记录过滤的数量
  const filteredCount = currentSelection.length - canEvaluateRows.length

  // 如果有记录被过滤掉，更新表格选中状态
  if (filteredCount > 0) {
    // 更新表格的多选框状态，只选中符合条件的记录
    applicantRef.value?.setSelectedRows?.(canEvaluateRows)
  }

  // 设置选中的应聘者
  selectedApplicants.value = canEvaluateRows

  // 重置批量评估表单
  resetBatchOperationForms()

  // 打开弹框
  batchOperationDialogVisible.value = true

  // 弹框打开后，如果有过滤记录，给出提示
  if (filteredCount > 0) {
    setTimeout(() => {
      ElMessage.warning(`已过滤 ${filteredCount} 条不符合条件的记录，当前操作 ${canEvaluateRows.length} 条符合条件的记录`)
    }, 100)
  }
}

// 批量保存评估
const fun_batchSaveEvaluate = async () => {
  try {
    // 验证表单
    await batchOperationFormRef.value.validate()

    if (selectedApplicants.value.length === 0) {
      ElMessage.warning('没有选中的应聘者')
      return
    }

    const applicantIds = selectedApplicants.value.map(applicant => applicant.id)

    // 根据评估类型构建请求数据
    const requestData = {
      applicantIds,
      ...batchOperationForm,
      aTypeData: batchOperationForm.interviewEvaluationType === 1 ? batchOperationAForm : null,
      bTypeData: batchOperationForm.interviewEvaluationType === 2 ? batchOperationBForm : null
    }

    const response = await axios.post(API_PATHS.evaluateBatchUpdateUrl, requestData)

    if (response.data.code === 2000) {
      ElMessage.success('批量评估成功')
      batchOperationDialogVisible.value = false
      await applicantRef.value?.handleSearch?.()
    } else {
      ElMessage.error(response.data.message || '批量评估失败')
    }
  } catch (error) {
    // 如果是表单验证失败
    if (error && typeof error === 'object' && Object.keys(error).length > 0) {
      ElMessage.warning('请检查并填写完整的评估信息')
    } else {
      ElMessage.error('批量评估失败')
      console.error('批量评估失败:', error)
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

  // 过滤出可审核的记录（等待面试状态 key=2）
  const canAuditRows = currentSelection.filter(row =>
    row.auditStatus && row.auditStatus.key === 2
  )

  if (canAuditRows.length === 0) {
    ElMessage.warning('选中的记录中没有可发起审核的状态（需要"等待面试"状态）')
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
      const response = await axios.post(API_PATHS.evaluateBatchAuditUrl, {
        applicantIds,
        auditStatus: 3 // 通知状态
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
      console.error('批量审核失败:', error)
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

  // 过滤出可撤回的记录（已通知状态 key=3）
  const canWithdrawRows = currentSelection.filter(row =>
    row.auditStatus && row.auditStatus.key === 3
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
      const response = await axios.post(API_PATHS.evaluateBatchWithdrawAuditUrl, {
        applicantIds
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
      console.error('批量撤回审核失败:', error)
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

// 判断选中的数据是否可以进行批量评估（需要等待面试状态 key=2）
const canBatchEvaluate = computed(() => {
  const selection = applicantRef.value?.getSelectedRows?.() || []
  if (!selection || selection.length === 0) {
    return false
  }
  return selection.some(row => row.auditStatus && row.auditStatus.key === 2)
})

// 判断选中的数据是否可以进行批量审核（需要等待面试状态 key=2）
const canBatchAudit = computed(() => {
  const selection = applicantRef.value?.getSelectedRows?.() || []
  if (!selection || selection.length === 0) {
    return false
  }
  return selection.some(row => row.auditStatus && row.auditStatus.key === 2)
})

// 判断选中的数据是否可以进行批量撤回（需要已通知状态 key=3）
const canBatchWithdrawAudit = computed(() => {
  const selection = applicantRef.value?.getSelectedRows?.() || []
  if (!selection || selection.length === 0) {
    return false
  }
  return selection.some(row => row.auditStatus && row.auditStatus.key === 3)
})

// 计算批量A类型总分
const calculateBatchATotalScore = () => {
  const scores = [
    batchOperationAForm.educationScore,
    batchOperationAForm.majorMatchScore,
    batchOperationAForm.theoryKnowledgeScore,
    batchOperationAForm.practicalExperienceScore,
    batchOperationAForm.industryExperienceScore,
    batchOperationAForm.targetManagementScore,
    batchOperationAForm.planManagementScore,
    batchOperationAForm.organizationManagementScore,
    batchOperationAForm.performanceManagementScore,
    batchOperationAForm.personalityManagementScore
  ]
  batchOperationAForm.totalScore = scores.reduce((sum, score) => sum + (Number(score) || 0), 0)
  batchOperationForm.interviewScore = batchOperationAForm.totalScore
}

// 计算批量B类型总分
const calculateBatchBTotalScore = () => {
  const scores = [
    batchOperationBForm.professionalKnowledgeScore,
    batchOperationBForm.practicalSkillScore,
    batchOperationBForm.mentalStateScore,
    batchOperationBForm.hardworkingScore,
    batchOperationBForm.communicationScore,
    batchOperationBForm.experienceScore
  ]
  batchOperationBForm.totalScore = scores.reduce((sum, score) => sum + (Number(score) || 0), 0)
  batchOperationForm.interviewScore = batchOperationBForm.totalScore
}

// 处理批量评估类型切换
const handleBatchEvaluationTypeChange = () => {
  // 重置A/B类型表单
  Object.keys(batchOperationAForm).forEach(key => {
    if (key !== 'id' && key !== 'interviewEvaluationId') {
      batchOperationAForm[key] = 0
    }
  })
  Object.keys(batchOperationBForm).forEach(key => {
    if (key !== 'id' && key !== 'interviewEvaluationId') {
      batchOperationBForm[key] = 0
    }
  })
  batchOperationForm.interviewScore = 0
}

// 重置批量评估表单
const resetBatchOperationForms = () => {
  // 重置主表单
  Object.assign(batchOperationForm, {
    testMethod: 1,
    employmentType: 1,
    interviewEvaluationType: 1,
    interviewScore: '',
    isHired: 1,
    interviewSuggestion: ''
  })

  // 重置A类型表单
  Object.keys(batchOperationAForm).forEach(key => {
    if (key !== 'id' && key !== 'interviewEvaluationId') {
      batchOperationAForm[key] = 0
    }
  })

  // 重置B类型表单
  Object.keys(batchOperationBForm).forEach(key => {
    if (key !== 'id' && key !== 'interviewEvaluationId') {
      batchOperationBForm[key] = 0
    }
  })
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
      const response = await axios.post(API_PATHS.evaluateRealOperateUrl, {
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
      const response = await axios.post(API_PATHS.evaluateReallocateUrl, {
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

//************************************************ 区域：显隐操作 *****************************************************

// 评估
const checkFormEditable = (auditStatus) => {
  // 判断表单是否可编辑 (仅等待面试状态可编辑)
  const editable = auditStatus && auditStatus.key === 2
  // 更新响应式变量
  isFormEditable.value = editable
  return editable
}

// 查看审核
const canViewAudit = (auditStatus) => {
  return canWithdrawAudit(auditStatus) || canReinterview(auditStatus)
}

// 发起审核
const canAudit = (auditStatus) => {
  return auditStatus && auditStatus.key === 2
}

// 撤回审核
const canWithdrawAudit = (auditStatus) => {
  return auditStatus && auditStatus.key === 3
}

// 重新面试
const canReinterview = (auditStatus) => {
  return auditStatus && (auditStatus.key === 4 || auditStatus.key === 5)
}

// 重新分配
const canReallocate = (auditStatus) => {
  return auditStatus && auditStatus.key === 5
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

