<template>
  <div>
    <!-- 子组件：OnbApplicant -->
    <OnbApplicant ref="applicantRef" :page-type="2">
      <!-- 自定义表格：在默认列基础上增加“评估操作/重置操作”两列 -->
      <template
        #data-table="{ tableData, tableConfig, tableHelpers, tableActions }"
      >
        <el-table
          :data="tableData"
          border
          stripe
          highlight-current-row
          @selection-change="tableConfig.handleSelectionChange"
        >
          <!-- 参考父组件默认列（保持一致） -->
          <el-table-column
            prop="applicantName"
            label="姓名"
            min-width="120"
            align="center"
            fixed="left"
          />
          <el-table-column
            prop="photoUrl"
            label="照片"
            min-width="80"
            align="center"
            fixed="left"
          >
            <template #default="scope">
              <el-avatar
                v-if="scope.row.photoUrl"
                :src="scope.row.photoUrl"
                size="small"
                shape="square"
                style="cursor: pointer"
                @click="tableHelpers.handleTablePhotoPreview(scope.row.photoUrl)"
              />
              <div
                v-else
                class="avatar-placeholder"
                style="
                  width: 32px;
                  height: 32px;
                  background-color: #f5f7fa;
                  border: 1px solid #e4e7ed;
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #c0c4cc;
                  font-size: 12px;
                  margin: 0 auto;
                "
              >
                <i class="el-icon-plus"></i>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="gender"
            label="性别"
            min-width="80"
            align="center"
          >
            <template #default="scope"
              >{{ scope.row.gender ? scope.row.gender.value : "-" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="birthDate"
            label="出生年月"
            min-width="120"
            align="center"
          >
            <template #default="scope"
              >{{ tableHelpers.formatDate(scope.row.birthDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="contactPhone"
            label="联系电话"
            min-width="130"
            align="center"
          />
          <el-table-column
            prop="idCardNo"
            label="身份证号"
            min-width="170"
            align="center"
          />
          <el-table-column
            prop="politicalStatus"
            label="政治面貌"
            min-width="100"
            align="center"
          >
            <template #default="scope">
              <el-tag
                v-if="scope.row.politicalStatus"
                :type="
                  tableHelpers.getPoliticalStatusTagType(
                    scope.row.politicalStatus.key
                  )
                "
                size="small"
              >
                {{ scope.row.politicalStatus.value }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="foreignLanguageLevel"
            label="外语等级"
            min-width="100"
            align="center"
          >
            <template #default="scope">
              <el-tag
                v-if="scope.row.foreignLanguageLevel"
                :type="
                  tableHelpers.getForeignLanguageTagType(
                    scope.row.foreignLanguageLevel.key
                  )
                "
                size="small"
              >
                {{ scope.row.foreignLanguageLevel.value }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="applyPosition"
            label="应聘岗位"
            min-width="150"
            align="center"
          />
          <el-table-column
            prop="availableDate"
            label="报到时间"
            min-width="120"
            align="center"
          >
            <template #default="scope"
              >{{ tableHelpers.formatDate(scope.row.availableDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="auditStatus"
            label="审核状态"
            min-width="100"
            align="center"
          >
            <template #default="scope">
              <el-tag
                v-if="scope.row.auditStatus"
                :type="
                  tableHelpers.getAuditStatusTagType(scope.row.auditStatus.key)
                "
                size="small"
              >
                {{ scope.row.auditStatus.value }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="assignedUser"
            label="分配人"
            min-width="100"
            align="center"
          >
            <template #default="scope"
              >{{ scope.row.assignedUser || "-" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="assignedDate"
            label="分配日期"
            min-width="120"
            align="center"
          >
            <template #default="scope"
              >{{ tableHelpers.formatDate(scope.row.assignedDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="interviewerDate"
            label="面试日期"
            min-width="120"
            align="center"
          >
            <template #default="scope"
              >{{ tableHelpers.formatDate(scope.row.interviewerDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="offerDate"
            label="录用日期"
            min-width="120"
            align="center"
          >
            <template #default="scope"
              >{{ tableHelpers.formatDate(scope.row.offerDate) }}
            </template>
          </el-table-column>

          <!-- 数据操作（沿用父组件默认） -->
          <el-table-column
            label="数据操作"
            min-width="200"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                @click="tableActions.handleDetail(scope.row)"
                >详情
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="tableActions.handleUpdate(scope.row)"
                >编辑
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="tableActions.handleDelete(scope.row)"
                style="color: #f56c6c"
                >删除
              </el-button>
            </template>
          </el-table-column>

          <!-- 评估操作（评估/审核/撤回审核） -->
          <el-table-column
            label="评估操作"
            min-width="200"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                :disabled="!canEvaluate(scope.row.auditStatus)"
                @click="fun_operation(scope.row)"
                >评估
              </el-button>
              <el-button
                type="text"
                size="small"
                :disabled="!canAudit(scope.row.auditStatus)"
                @click="fun_audit(scope.row)"
                >审核
              </el-button>
              <el-button
                type="text"
                size="small"
                :disabled="!canWithdrawAudit(scope.row.auditStatus)"
                class="withdraw-audit-btn"
                @click="fun_withdrawAudit(scope.row)"
                >撤回审核
              </el-button>
            </template>
          </el-table-column>

          <!-- 重置操作（重新面试/重新分配） -->
          <el-table-column
            label="重置操作"
            min-width="200"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                :disabled="!canReinterview(scope.row.auditStatus)"
                @click="fun_reinterview(scope.row)"
                >重新面试
              </el-button>
              <el-button
                type="text"
                size="small"
                :disabled="!canReallocate(scope.row.auditStatus)"
                @click="fun_reallocate(scope.row)"
                >重新分配
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </OnbApplicant>

    <!-- 评估弹框 -->
    <el-dialog
      width="90%"
      v-model="operationDialogVisible"
      title="评估"
      destroy-on-close
    >
      <el-form
        ref="operationFormRef"
        :model="operationForm"
        :rules="operationFormRules"
        label-width="120px"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="姓名">
              <el-input
                v-model="operationForm.applicantName"
                readonly
                disabled
                class="readonly-field"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别">
              <el-input
                v-model="operationForm.genderText"
                readonly
                disabled
                class="readonly-field"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出生日期">
              <el-input
                v-model="operationForm.birthDateText"
                readonly
                disabled
                class="readonly-field"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input
                v-model="operationForm.contactPhone"
                readonly
                disabled
                class="readonly-field"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="身份证号">
              <el-input
                v-model="operationForm.idCardNo"
                readonly
                disabled
                class="readonly-field"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="应聘岗位">
              <el-input
                v-model="operationForm.applyPosition"
                readonly
                disabled
                class="readonly-field"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 评估类型选择 -->
        <el-divider content-position="left">评估设置</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="测试方式" prop="testMethod">
              <el-select
                v-model="operationForm.testMethod"
                placeholder="请选择测试方式"
                style="width: 100%"
              >
                <el-option
                  v-for="item in attrLists.testMethodOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用工性质" prop="employmentType">
              <el-select
                v-model="operationForm.employmentType"
                placeholder="请选择用工性质"
                style="width: 100%"
              >
                <el-option
                  v-for="item in attrLists.employmentTypeOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="评估类型" prop="interviewEvaluationType">
              <el-radio-group
                v-model="operationForm.interviewEvaluationType"
                @change="handleEvaluationTypeChange"
              >
                <el-radio
                  v-for="item in attrLists.interviewEvaluationTypeOptions"
                  :key="item.key"
                  :label="item.key"
                  >{{ item.value }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- A类型评估 -->
        <div v-if="operationForm.interviewEvaluationType === 1">
          <el-divider content-position="left"
            >用人单位结构面试评估（A类型）
          </el-divider>

          <!-- 基础素质评估 -->
          <h4>基础素质评估</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学历水平">
                <el-radio-group
                  v-model="operationAForm.educationScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">
                  高中1分，中专3分，专科5分，本科7分，硕士10分
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="专业匹配">
                <el-radio-group
                  v-model="operationAForm.majorMatchScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">专业匹配度评估</div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 专业深度评估 -->
          <h4>专业深度评估</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="理论知识">
                <el-radio-group
                  v-model="operationAForm.theoryKnowledgeScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">专业理论掌握程度</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="实务经验">
                <el-radio-group
                  v-model="operationAForm.practicalExperienceScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">实际工作经验</div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 经验匹配评估 -->
          <h4>经验匹配评估</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="行业经验">
                <el-radio-group
                  v-model="operationAForm.industryExperienceScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">
                  0-2年1分，3年3分，4年5分，5年7分，6年以上10分
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 综合素质评估 -->
          <h4>综合素质评估</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="目标管理">
                <el-radio-group
                  v-model="operationAForm.targetManagementScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">目标设定和执行能力</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划管理">
                <el-radio-group
                  v-model="operationAForm.planManagementScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">计划制定和管理能力</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="组织管理">
                <el-radio-group
                  v-model="operationAForm.organizationManagementScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">组织协调能力</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="绩效管理">
                <el-radio-group
                  v-model="operationAForm.performanceManagementScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">绩效管理能力</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="性格管理">
                <el-radio-group
                  v-model="operationAForm.personalityManagementScore"
                  @change="calculateATotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">性格适应性</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- B类型评估 -->
        <div v-if="operationForm.interviewEvaluationType === 2">
          <el-divider content-position="left"
            >用人单位结构面试评估（B类型）
          </el-divider>

          <!-- 专业技能评估 -->
          <h4>专业技能评估</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="专业知识">
                <el-radio-group
                  v-model="operationBForm.professionalKnowledgeScore"
                  @change="calculateBTotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">专业知识掌握程度</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="实操技能">
                <el-radio-group
                  v-model="operationBForm.practicalSkillScore"
                  @change="calculateBTotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">实际操作技能</div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 综合素质评估 -->
          <h4>综合素质评估</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="精神状态">
                <el-radio-group
                  v-model="operationBForm.mentalStateScore"
                  @change="calculateBTotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">精神面貌和状态</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="吃苦耐劳">
                <el-radio-group
                  v-model="operationBForm.hardworkingScore"
                  @change="calculateBTotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">工作态度和耐力</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="沟通协调">
                <el-radio-group
                  v-model="operationBForm.communicationScore"
                  @change="calculateBTotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">沟通协调能力</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工作经验">
                <el-radio-group
                  v-model="operationBForm.experienceScore"
                  @change="calculateBTotalScore"
                >
                  <el-radio-button :label="1">1分</el-radio-button>
                  <el-radio-button :label="3">3分</el-radio-button>
                  <el-radio-button :label="5">5分</el-radio-button>
                  <el-radio-button :label="7">7分</el-radio-button>
                  <el-radio-button :label="10">10分</el-radio-button>
                </el-radio-group>
                <div class="score-description">相关工作经验</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 面试结果 -->
        <el-divider content-position="left">面试结果</el-divider>
        <el-row>
          <el-col :span="5">
            <el-form-item label="面试得分">
              <el-input
                v-model="operationForm.interviewScore"
                readonly
                disabled
                class="readonly-field"
              >
                <template #suffix>分</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
            <el-form-item label="面试结果" prop="isHired">
              <el-radio-group v-model="operationForm.isHired">
                <el-radio
                  v-for="item in attrLists.isHiredOptions"
                  :key="item.key"
                  :label="item.key"
                  >{{ item.value }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="面试意见" prop="interviewSuggestion">
              <el-input
                v-model="operationForm.interviewSuggestion"
                type="textarea"
                :rows="3"
                placeholder="请输入面试意见"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="operationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="fun_saveOperation()"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style scoped src="./css/index.css"></style>
