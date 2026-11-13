import { mockData } from '../data/data.js'

// 应聘者管理Mock API
export default [
  // 1. 应聘者列表查询
  {
    url: '/onboard/applicant/list',
    method: 'post',
    response: (req) => {
      const { applicantName, contactPhone, applyPosition, auditStatus, interviewerUser } = req.body || {}

      let result = mockData.applicants.map(applicant => {
        const position = mockData.interviewPositions.find(p => p.applicantId === applicant.id)
        return {
          ...applicant,
          applyPosition: position?.applyPosition || '软件工程师',
          auditStatus: position?.auditStatus || 1,
          auditStatusText: position?.auditStatusText || '待分配',
          assignedUser: position?.assignedUser || ''
        }
      })

      // 筛选逻辑
      if (applicantName) {
        result = result.filter(item => item.applicantName.includes(applicantName))
      }
      if (contactPhone) {
        result = result.filter(item => item.contactPhone.includes(contactPhone))
      }
      if (applyPosition) {
        result = result.filter(item => item.applyPosition.includes(applyPosition))
      }
      if (auditStatus) {
        result = result.filter(item => item.auditStatus === auditStatus)
      }
      if (interviewerUser) {
        result = result.filter(item => item.assignedUser && item.assignedUser.includes(interviewerUser))
      }

      return {
        code: 2000,
        message: '查询成功',
        data: result
      }
    }
  },

  // 2. 应聘者详情查询
  {
    url: '/onboard/applicant/detail',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const applicant = mockData.applicants.find(item => item.id === id)

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
        data: applicant
      }
    }
  },

  // 3. 新增应聘者
  {
    url: '/onboard/applicant/create',
    method: 'post',
    response: (req) => {
      const newApplicant = {
        id: `app-uuid-${Date.now()}`,
        ...req.body,
        createTime: new Date().toLocaleString('zh-CN'),
        createTimeText: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '年').replace(/ /, '日 '),
        updateTime: new Date().toLocaleString('zh-CN'),
        deletedFlag: 0
      }

      // 添加枚举文本
      if (newApplicant.gender) {
        newApplicant.genderText = newApplicant.gender === 1 ? '男' : '女'
      }
      if (newApplicant.politicalStatus) {
        const statusMap = { 1: '党员', 2: '团员', 3: '群众' }
        newApplicant.politicalStatusText = statusMap[newApplicant.politicalStatus]
      }

      mockData.applicants.push(newApplicant)

      return {
        code: 2000,
        message: '新增成功',
        data: true
      }
    }
  },

  // 4. 修改应聘者
  {
    url: '/onboard/applicant/update',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.applicants.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '应聘者不存在',
          data: false
        }
      }

      // 更新数据
      const updatedApplicant = {
        ...mockData.applicants[index],
        ...req.body,
        updateTime: new Date().toLocaleString('zh-CN')
      }

      // 更新枚举文本
      if (updatedApplicant.gender) {
        updatedApplicant.genderText = updatedApplicant.gender === 1 ? '男' : '女'
      }
      if (updatedApplicant.politicalStatus) {
        const statusMap = { 1: '党员', 2: '团员', 3: '群众' }
        updatedApplicant.politicalStatusText = statusMap[updatedApplicant.politicalStatus]
      }

      mockData.applicants[index] = updatedApplicant

      return {
        code: 2000,
        message: '修改成功',
        data: true
      }
    }
  },

  // 5. 删除应聘者
  {
    url: '/onboard/applicant/delete',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.applicants.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '应聘者不存在',
          data: false
        }
      }

      // 软删除：设置删除标志
      mockData.applicants[index].deletedFlag = 1

      return {
        code: 2000,
        message: '删除成功',
        data: true
      }
    }
  },

  // 6. 工作经历列表
  {
    url: '/onboard/applicant/work/list',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}
      const workList = mockData.workExperiences.filter(item => item.applicantId === applicantId)

      return {
        code: 2000,
        message: '查询成功',
        data: workList
      }
    }
  },

  // 7. 新增工作经历
  {
    url: '/onboard/applicant/work/create',
    method: 'post',
    response: (req) => {
      const newWork = {
        id: `work-uuid-${Date.now()}`,
        ...req.body,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
        deletedFlag: 0
      }

      mockData.workExperiences.push(newWork)

      return {
        code: 2000,
        message: '新增成功',
        data: true
      }
    }
  },

  // 8. 修改工作经历
  {
    url: '/onboard/applicant/work/update',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.workExperiences.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '工作经历不存在',
          data: false
        }
      }

      mockData.workExperiences[index] = {
        ...mockData.workExperiences[index],
        ...req.body,
        updateTime: new Date().toLocaleString('zh-CN')
      }

      return {
        code: 2000,
        message: '更新成功',
        data: true
      }
    }
  },

  // 9. 删除工作经历
  {
    url: '/onboard/applicant/work/delete',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.workExperiences.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '工作经历不存在',
          data: false
        }
      }

      mockData.workExperiences.splice(index, 1)

      return {
        code: 2000,
        message: '删除成功',
        data: true
      }
    }
  },

  // 10. 学习经历相关API (类似工作经历)
  {
    url: '/onboard/applicant/education/list',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}
      const eduList = mockData.educations.filter(item => item.applicantId === applicantId)

      return {
        code: 2000,
        message: '查询成功',
        data: eduList
      }
    }
  },

  {
    url: '/onboard/applicant/education/create',
    method: 'post',
    response: (req) => {
      const newEdu = {
        id: `edu-uuid-${Date.now()}`,
        ...req.body,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
        deletedFlag: 0
      }

      mockData.educations.push(newEdu)

      return {
        code: 2000,
        message: '新增成功',
        data: true
      }
    }
  },

  {
    url: '/onboard/applicant/education/update',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.educations.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '学习经历不存在',
          data: false
        }
      }

      mockData.educations[index] = {
        ...mockData.educations[index],
        ...req.body,
        updateTime: new Date().toLocaleString('zh-CN')
      }

      return {
        code: 2000,
        message: '更新成功',
        data: true
      }
    }
  },

  {
    url: '/onboard/applicant/education/delete',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.educations.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '学习经历不存在',
          data: false
        }
      }

      mockData.educations.splice(index, 1)

      return {
        code: 2000,
        message: '删除成功',
        data: true
      }
    }
  },

  // 11. 家庭情况相关API
  {
    url: '/onboard/applicant/family/list',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}
      const familyList = mockData.families.filter(item => item.applicantId === applicantId)

      return {
        code: 2000,
        message: '查询成功',
        data: familyList
      }
    }
  },

  {
    url: '/onboard/applicant/family/create',
    method: 'post',
    response: (req) => {
      const newFamily = {
        id: `fam-uuid-${Date.now()}`,
        ...req.body,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
        deletedFlag: 0
      }

      mockData.families.push(newFamily)

      return {
        code: 2000,
        message: '新增成功',
        data: true
      }
    }
  },

  {
    url: '/onboard/applicant/family/update',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.families.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '家庭成员不存在',
          data: false
        }
      }

      mockData.families[index] = {
        ...mockData.families[index],
        ...req.body,
        updateTime: new Date().toLocaleString('zh-CN')
      }

      return {
        code: 2000,
        message: '更新成功',
        data: true
      }
    }
  },

  {
    url: '/onboard/applicant/family/delete',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.families.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '家庭成员不存在',
          data: false
        }
      }

      mockData.families.splice(index, 1)

      return {
        code: 2000,
        message: '删除成功',
        data: true
      }
    }
  },

  // 12. 培训经历相关API
  {
    url: '/onboard/applicant/training/list',
    method: 'post',
    response: (req) => {
      const { applicantId } = req.body || {}
      const trainingList = mockData.trainings.filter(item => item.applicantId === applicantId)

      return {
        code: 2000,
        message: '查询成功',
        data: trainingList
      }
    }
  },

  {
    url: '/onboard/applicant/training/create',
    method: 'post',
    response: (req) => {
      const newTraining = {
        id: `train-uuid-${Date.now()}`,
        ...req.body,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
        deletedFlag: 0
      }

      mockData.trainings.push(newTraining)

      return {
        code: 2000,
        message: '新增成功',
        data: true
      }
    }
  },

  {
    url: '/onboard/applicant/training/update',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.trainings.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '培训经历不存在',
          data: false
        }
      }

      mockData.trainings[index] = {
        ...mockData.trainings[index],
        ...req.body,
        updateTime: new Date().toLocaleString('zh-CN')
      }

      return {
        code: 2000,
        message: '更新成功',
        data: true
      }
    }
  },

  {
    url: '/onboard/applicant/training/delete',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.trainings.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '培训经历不存在',
          data: false
        }
      }

      mockData.trainings.splice(index, 1)

      return {
        code: 2000,
        message: '删除成功',
        data: true
      }
    }
  },

  // 13. 回收站数据列表查询
  {
    url: '/onboard/applicant/recycle/list',
    method: 'post',
    response: (req) => {
      const { applicantName, contactPhone, idCardNo } = req.body || {}

      // 筛选已删除的数据 (deletedFlag = 1)
      let result = mockData.applicants.filter(applicant => applicant.deletedFlag === 1)

      // 为回收站数据添加面试相关信息
      result = result.map(applicant => {
        const position = mockData.interviewPositions.find(p => p.applicantId === applicant.id)
        return {
          ...applicant,
          applyPosition: position?.applyPosition || applicant.applyPosition || '未指定',
          auditStatus: position?.auditStatus || 1,
          auditStatusText: position?.auditStatusText || '待分配',
          assignedUser: position?.assignedUser || '',
          assignedDate: position?.assignedDate || '',
          interviewerDate: position?.interviewerDate || applicant.interviewerDate || '',
          offerDate: position?.offerDate || applicant.offerDate || ''
        }
      })

      // 筛选逻辑
      if (applicantName) {
        result = result.filter(item => item.applicantName.includes(applicantName))
      }
      if (contactPhone) {
        result = result.filter(item => item.contactPhone.includes(contactPhone))
      }
      if (idCardNo) {
        result = result.filter(item => item.idCardNo.includes(idCardNo))
      }

      return {
        code: 2000,
        message: '查询回收站数据成功',
        data: result
      }
    }
  },

  // 14. 还原应聘者数据
  {
    url: '/onboard/applicant/restore',
    method: 'post',
    response: (req) => {
      const { id } = req.body || {}
      const index = mockData.applicants.findIndex(item => item.id === id)

      if (index === -1) {
        return {
          code: 4004,
          message: '应聘者不存在',
          data: false
        }
      }

      const applicant = mockData.applicants[index]

      // 检查是否已经是删除状态
      if (applicant.deletedFlag !== 1) {
        return {
          code: 4000,
          message: '该应聘者未在回收站中',
          data: false
        }
      }

      // 还原数据：设置删除标志为0
      mockData.applicants[index] = {
        ...applicant,
        deletedFlag: 0,
        updateTime: new Date().toLocaleString('zh-CN'),
        updateUser: 'system'
      }

      return {
        code: 2000,
        message: '还原成功',
        data: true
      }
    }
  }
]
