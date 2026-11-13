import { mockData } from '../data/data.js'

// 应聘分配Mock API
export default [
  // 1. 查看分配信息
  {
    url: '/onboard/allocate/detail',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}

      const applicant = mockData.applicants.find(item => item.id === applicantId)
      const position = mockData.interviewPositions.find(item => item.applicantId === applicantId)

      if (!applicant) {
        return {
          code: 4004,
          message: '应聘者不存在',
          data: null
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
            auditStatus: 1,
            auditStatusText: '待分配'
          }
        }
      }
    }
  },

  // 2. 保存分配信息
  {
    url: '/onboard/allocate/update',
    method: 'post',
    response: (req) => {
      const { applicantId, interviewerUser, assignReason } = req.body || {}

      // 查找或创建岗位记录
      let positionIndex = mockData.interviewPositions.findIndex(item => item.applicantId === applicantId)

      if (positionIndex === -1) {
        // 创建新的岗位记录
        const applicant = mockData.applicants.find(item => item.id === applicantId)
        const newPosition = {
          id: `pos-uuid-${Date.now()}`,
          applicantId: applicantId,
          applyPosition: applicant?.professionalTitle || '软件工程师',
          assignedDept: '演示团队047',
          assignedUser: interviewerUser,
          assignedDate: new Date().toLocaleString('zh-CN'),
          auditStatus: 2,
          auditStatusText: '等待面试',
          flowInstId: null,
          formInstId: null,
          flowStatus: null,
          approvalTime: null,
          createTime: new Date().toLocaleString('zh-CN')
        }
        mockData.interviewPositions.push(newPosition)
        positionIndex = mockData.interviewPositions.length - 1
      } else {
        // 更新现有记录
        mockData.interviewPositions[positionIndex] = {
          ...mockData.interviewPositions[positionIndex],
          assignedUser: interviewerUser,
          assignedDate: new Date().toLocaleString('zh-CN'),
          auditStatus: 2,
          auditStatusText: '等待面试'
        }
      }

      return {
        code: 2000,
        message: '分配成功',
        data: true
      }
    }
  },

  // 3. 审核通过
  {
    url: '/onboard/allocate/audit',
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
    url: '/onboard/allocate/withdraw-audit',
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

      // 撤回到等待面试状态
      mockData.interviewPositions[positionIndex] = {
        ...mockData.interviewPositions[positionIndex],
        auditStatus: 2,
        auditStatusText: '等待面试',
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
