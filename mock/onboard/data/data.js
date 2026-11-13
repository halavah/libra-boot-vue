// Mock数据聚合文件
import { onbApplicant } from './onb_applicant.js'
import { onbApplicantWork } from './onb_applicant_work.js'
import { onbApplicantEducation } from './onb_applicant_education.js'
import { onbApplicantFamily } from './onb_applicant_family.js'
import { onbApplicantTrain } from './onb_applicant_train.js'
import { onbApplicantAttachment } from './onb_applicant_attachment.js'
import { onbInterviewPosition } from './onb_interview_position.js'
import { onbInterviewEvaluation } from './onb_interview_evaluation.js'
import { onbInterviewEvaluationTypeA } from './onb_interview_evaluation_type_a.js'
import { onbInterviewEvaluationTypeB } from './onb_interview_evaluation_type_b.js'
import { onbInterviewEvaluationApply } from './onb_interview_evaluation_apply.js'
import { onbInterviewPositionOffer } from './onb_interview_position_offer.js'
import { onbInterviewPositionOfferApply } from './onb_interview_position_offer_apply.js'
import { approvalLog } from './approval_log.js'
import { approvalTemplateConfig } from './approval_template_config.js'

// 状态映射函数
const getAuditStatusText = (status) => {
  const statusMap = {
    1: '待分配',
    2: '等待面试',
    3: '面试审核中',
    4: '面试通过',
    5: '面试失败',
    6: '入职审核中',
    7: '入职通过',
    8: '入职失败'
  }
  return statusMap[status] || '未知状态'
}

// 为面试岗位数据添加状态文本
const interviewPositionsWithText = onbInterviewPosition.map(position => ({
  ...position,
  auditStatusText: getAuditStatusText(position.auditStatus)
}))

// 统一的Mock数据对象
export const mockData = {
  // 应聘者相关数据
  applicants: onbApplicant,
  workExperiences: onbApplicantWork,
  educations: onbApplicantEducation,
  families: onbApplicantFamily,
  trainings: onbApplicantTrain,
  attachments: onbApplicantAttachment,

  // 面试相关数据
  interviewPositions: interviewPositionsWithText,
  interviewEvaluations: onbInterviewEvaluation,
  evaluationAData: onbInterviewEvaluationTypeA,
  evaluationBData: onbInterviewEvaluationTypeB,
  evaluationApplies: onbInterviewEvaluationApply,

  // 录用相关数据
  interviewPositionOffers: onbInterviewPositionOffer,
  offerApplies: onbInterviewPositionOfferApply,

  // 审批相关数据
  approvalLogs: approvalLog,
  approvalTemplates: approvalTemplateConfig
}
