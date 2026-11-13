import { mockData } from '../data/data.js'

// 面试评估Mock API
export default [
  // 1. 查看评估信息
  {
    url: '/onboard/evaluate/detail',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}

      const applicant = mockData.applicants.find(item => item.id === applicantId)
      const position = mockData.interviewPositions.find(item => item.applicantId === applicantId)
      const evaluation = mockData.interviewEvaluations.find(item => item.applicantId === applicantId)

      if (!applicant) {
        return {
          code: 4004,
          message: '应聘者不存在',
          data: null
        }
      }

      let evaluationAData = null
      let evaluationBData = null

      if (evaluation) {
        if (evaluation.interviewEvaluationType === 1) {
          evaluationAData = mockData.evaluationAData.find(item => item.applicantId === applicantId)
        } else if (evaluation.interviewEvaluationType === 2) {
          evaluationBData = mockData.evaluationBData.find(item => item.applicantId === applicantId)
        }
      }

      return {
        code: 2000,
        message: '查询成功',
        data: {
          applicantInfo: {
            ...applicant,
            applyPosition: position?.applyPosition || '软件工程师'
          },
          positionInfo: position || {
            id: null,
            applicantId: applicantId,
            applyPosition: '软件工程师',
            assignedDept: null,
            assignedUser: null,
            assignedDate: null,
            auditStatus: 2,
            auditStatusText: '等待面试'
          },
          evaluationInfo: evaluation,
          evaluationAData: evaluationAData,
          evaluationBData: evaluationBData
        }
      }
    }
  },

  // 2. 保存评估信息
  {
    url: '/onboard/evaluate/update',
    method: 'post',
    response: (req) => {
      const {
        applicantId,
        interviewEvaluationType,
        isHired,
        interviewSuggestion,
        interviewer,
        interviewTime,
        aTypeData,
        bTypeData
      } = req.body || {}

      // 查找或创建评估记录
      let evaluationIndex = mockData.interviewEvaluations.findIndex(item => item.applicantId === applicantId)
      let evaluationId = ''

      if (evaluationIndex === -1) {
        // 创建新的评估记录
        evaluationId = `eval-uuid-${Date.now()}`
        const newEvaluation = {
          id: evaluationId,
          applicantId: applicantId,
          applicantPositionId: mockData.interviewPositions.find(p => p.applicantId === applicantId)?.id || `pos-uuid-${Date.now()}`,
          interviewEvaluationType: interviewEvaluationType,
          isHired: isHired,
          interviewSuggestion: interviewSuggestion,
          interviewer: interviewer,
          interviewTime: interviewTime,
          createTime: new Date().toLocaleString('zh-CN')
        }
        mockData.interviewEvaluations.push(newEvaluation)
        evaluationIndex = mockData.interviewEvaluations.length - 1
      } else {
        // 更新现有记录
        evaluationId = mockData.interviewEvaluations[evaluationIndex].id
        mockData.interviewEvaluations[evaluationIndex] = {
          ...mockData.interviewEvaluations[evaluationIndex],
          interviewEvaluationType: interviewEvaluationType,
          isHired: isHired,
          interviewSuggestion: interviewSuggestion,
          interviewer: interviewer,
          interviewTime: interviewTime,
          updateTime: new Date().toLocaleString('zh-CN')
        }
      }

      // 处理A类型评估数据
      if (interviewEvaluationType === 1 && aTypeData) {
        let aDataIndex = mockData.evaluationAData.findIndex(item => item.applicantId === applicantId)

        if (aDataIndex === -1) {
          // 创建新的A类型数据
          const newAData = {
            id: `eva-uuid-${Date.now()}`,
            applicantId: applicantId,
            applicantPositionId: mockData.interviewPositions.find(p => p.applicantId === applicantId)?.id || `pos-uuid-${Date.now()}`,
            interviewEvaluationId: evaluationId,
            ...aTypeData,
            createTime: new Date().toLocaleString('zh-CN')
          }
          mockData.evaluationAData.push(newAData)
        } else {
          // 更新现有A类型数据
          mockData.evaluationAData[aDataIndex] = {
            ...mockData.evaluationAData[aDataIndex],
            ...aTypeData,
            updateTime: new Date().toLocaleString('zh-CN')
          }
        }
      }

      // 处理B类型评估数据
      if (interviewEvaluationType === 2 && bTypeData) {
        let bDataIndex = mockData.evaluationBData.findIndex(item => item.applicantId === applicantId)

        if (bDataIndex === -1) {
          // 创建新的B类型数据
          const newBData = {
            id: `evb-uuid-${Date.now()}`,
            applicantId: applicantId,
            applicantPositionId: mockData.interviewPositions.find(p => p.applicantId === applicantId)?.id || `pos-uuid-${Date.now()}`,
            interviewEvaluationId: evaluationId,
            ...bTypeData,
            createTime: new Date().toLocaleString('zh-CN')
          }
          // 添加用工性质文本
          if (newBData.employmentType) {
            const typeMap = { 1: '一般普工', 2: '一般技工', 3: '熟练技工' }
            newBData.employmentTypeText = typeMap[newBData.employmentType]
          }
          mockData.evaluationBData.push(newBData)
        } else {
          // 更新现有B类型数据
          mockData.evaluationBData[bDataIndex] = {
            ...mockData.evaluationBData[bDataIndex],
            ...bTypeData,
            updateTime: new Date().toLocaleString('zh-CN')
          }
          // 更新用工性质文本
          if (mockData.evaluationBData[bDataIndex].employmentType) {
            const typeMap = { 1: '一般普工', 2: '一般技工', 3: '熟练技工' }
            mockData.evaluationBData[bDataIndex].employmentTypeText = typeMap[mockData.evaluationBData[bDataIndex].employmentType]
          }
        }
      }

      // 更新岗位状态为面试审核中
      const positionIndex = mockData.interviewPositions.findIndex(item => item.applicantId === applicantId)
      if (positionIndex !== -1) {
        mockData.interviewPositions[positionIndex] = {
          ...mockData.interviewPositions[positionIndex],
          auditStatus: 3,
          auditStatusText: '面试审核中'
        }
      }

      return {
        code: 2000,
        message: '评估保存成功',
        data: true
      }
    }
  },

  // 3. 审核通过
  {
    url: '/onboard/evaluate/audit',
    method: 'post',
    response: (req) => {
      const { applicantId, auditStatus } = req.body || {}

      const positionIndex = mockData.interviewPositions.findIndex(item => item.applicantId === applicantId)

      if (positionIndex === -1) {
        return {
          code: 4004,
          message: '未找到该应聘者的岗位信息',
          data: false
        }
      }

      // 更新审核状态
      const statusMap = {
        4: '面试通过',
        5: '面试失败'
      }

      mockData.interviewPositions[positionIndex] = {
        ...mockData.interviewPositions[positionIndex],
        auditStatus: auditStatus,
        auditStatusText: statusMap[auditStatus] || '未知状态',
        approvalTime: new Date().toLocaleString('zh-CN')
      }

      return {
        code: 2000,
        message: '审核成功',
        data: true
      }
    }
  },

  // 4. 撤回审核
  {
    url: '/onboard/evaluate/withdraw-audit',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}

      const positionIndex = mockData.interviewPositions.findIndex(item => item.applicantId === applicantId)

      if (positionIndex === -1) {
        return {
          code: 4004,
          message: '未找到该应聘者的岗位信息',
          data: false
        }
      }

      // 撤回到面试审核中状态
      mockData.interviewPositions[positionIndex] = {
        ...mockData.interviewPositions[positionIndex],
        auditStatus: 3,
        auditStatusText: '面试审核中',
        approvalTime: null
      }

      return {
        code: 2000,
        message: '撤回审核成功',
        data: true
      }
    }
  }
]
