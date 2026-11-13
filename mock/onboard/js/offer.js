import { mockData } from '../data/data.js'

// 录用反馈Mock API
export default [
  // 1. 查看录用信息
  {
    url: '/onboard/offer/detail',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}

      const applicant = mockData.applicants.find(item => item.id === applicantId)
      const position = mockData.interviewPositions.find(item => item.applicantId === applicantId)
      const offer = mockData.interviewPositionOffers.find(item => item.applicantId === applicantId)

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
            auditStatus: 4,
            auditStatusText: '面试通过'
          },
          offerInfo: offer || {
            id: null,
            applicantId: applicantId,
            applicantPositionId: position?.id || null,
            isHired: null,
            hireStatus: '',
            probationSalary: null,
            probationDuration: '',
            probationDurationNum: null,
            formalSalary: null,
            regularSalary: null,
            flowInstId: null,
            formInstId: null,
            flowStatus: 0,
            flowStatusText: '草稿',
            approvalTime: null
          }
        }
      }
    }
  },

  // 2. 保存录用信息
  {
    url: '/onboard/offer/update',
    method: 'post',
    response: (req) => {
      const {
        applicantId,
        hireStatus,
        probationSalary,
        probationDuration,
        regularSalary
      } = req.body || {}

      // 查找或创建录用记录
      let offerIndex = mockData.interviewPositionOffers.findIndex(item => item.applicantId === applicantId)
      let offerId = ''

      // 解析试用期时长
      let probationDurationNum = 1
      if (probationDuration) {
        if (probationDuration.includes('1个月')) probationDurationNum = 1
        else if (probationDuration.includes('2个月')) probationDurationNum = 2
        else if (probationDuration.includes('3个月')) probationDurationNum = 3
        else if (probationDuration.includes('6个月')) probationDurationNum = 6
      }

      if (offerIndex === -1) {
        // 创建新的录用记录
        offerId = `offer-uuid-${Date.now()}`
        const newOffer = {
          id: offerId,
          applicantId: applicantId,
          applicantPositionId: mockData.interviewPositions.find(p => p.applicantId === applicantId)?.id || `pos-uuid-${Date.now()}`,
          isHired: hireStatus === '录用' ? 1 : 0,
          hireStatus: hireStatus,
          probationSalary: parseFloat(probationSalary) || 0,
          probationDuration: probationDuration,
          probationDurationNum: probationDurationNum,
          formalSalary: parseFloat(regularSalary) || 0,
          regularSalary: parseFloat(regularSalary) || 0,
          flowInstId: `flow-offer-uuid-${Date.now()}`,
          formInstId: `form-offer-uuid-${Date.now()}`,
          flowStatus: 0,
          flowStatusText: '草稿',
          approvalTime: null,
          createTime: new Date().toLocaleString('zh-CN'),
          createUser: '演示用户019'
        }
        mockData.interviewPositionOffers.push(newOffer)
        offerIndex = mockData.interviewPositionOffers.length - 1
      } else {
        // 更新现有记录
        offerId = mockData.interviewPositionOffers[offerIndex].id
        mockData.interviewPositionOffers[offerIndex] = {
          ...mockData.interviewPositionOffers[offerIndex],
          isHired: hireStatus === '录用' ? 1 : 0,
          hireStatus: hireStatus,
          probationSalary: parseFloat(probationSalary) || 0,
          probationDuration: probationDuration,
          probationDurationNum: probationDurationNum,
          formalSalary: parseFloat(regularSalary) || 0,
          regularSalary: parseFloat(regularSalary) || 0,
          updateTime: new Date().toLocaleString('zh-CN'),
          updateUser: '演示用户019'
        }
      }

      // 添加试用期时长文本
      const durationTextMap = {
        1: '一个月',
        2: '二个月',
        3: '三个月',
        6: '六个月'
      }

      return {
        code: 2000,
        message: '录用信息保存成功',
        data: true
      }
    }
  },

  // 3. 审核通过
  {
    url: '/onboard/offer/audit',
    method: 'post',
    response: (req) => {
      const { applicantId, auditStatus } = req.body || {}

      const positionIndex = mockData.interviewPositions.findIndex(item => item.applicantId === applicantId)
      const offerIndex = mockData.interviewPositionOffers.findIndex(item => item.applicantId === applicantId)

      if (positionIndex === -1) {
        return {
          code: 4004,
          message: '未找到该应聘者的岗位信息',
          data: false
        }
      }

      // 更新岗位审核状态
      const statusMap = {
        7: '入职通过',
        8: '入职失败'
      }

      mockData.interviewPositions[positionIndex] = {
        ...mockData.interviewPositions[positionIndex],
        auditStatus: auditStatus,
        auditStatusText: statusMap[auditStatus] || '未知状态',
        approvalTime: new Date().toLocaleString('zh-CN')
      }

      // 更新录用信息的流程状态
      if (offerIndex !== -1) {
        mockData.interviewPositionOffers[offerIndex] = {
          ...mockData.interviewPositionOffers[offerIndex],
          flowStatus: auditStatus === 7 ? 2 : 3, // 2-已通过, 3-已拒绝
          flowStatusText: auditStatus === 7 ? '已通过' : '已拒绝',
          approvalTime: new Date().toLocaleString('zh-CN')
        }
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
    url: '/onboard/offer/withdraw-audit',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}

      const positionIndex = mockData.interviewPositions.findIndex(item => item.applicantId === applicantId)
      const offerIndex = mockData.interviewPositionOffers.findIndex(item => item.applicantId === applicantId)

      if (positionIndex === -1) {
        return {
          code: 4004,
          message: '未找到该应聘者的岗位信息',
          data: false
        }
      }

      // 撤回到入职审核中状态
      mockData.interviewPositions[positionIndex] = {
        ...mockData.interviewPositions[positionIndex],
        auditStatus: 6,
        auditStatusText: '入职审核中',
        approvalTime: null
      }

      // 撤回录用信息的流程状态
      if (offerIndex !== -1) {
        mockData.interviewPositionOffers[offerIndex] = {
          ...mockData.interviewPositionOffers[offerIndex],
          flowStatus: 1, // 1-审批中
          flowStatusText: '审批中',
          approvalTime: null
        }
      }

      return {
        code: 2000,
        message: '撤回审核成功',
        data: true
      }
    }
  }
]
