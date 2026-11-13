<template>
  <div>
    <!-- 子组件：OnbApplicant（已包含权限控制） -->
    <OnbApplicant ref="applicantRef" :pageType="2">
      <!-- 自定义表格内容区域：在默认列基础上增加"面试评估操作"两列 -->
      <template
        #data-table="{
          tableData,
          currentPage,
          pageSize,
          pageSizes,
          dataTotal,
          tableActions,
          tableConfig,
          tableHelpers,
          dataMethods,
        }"
      >
        <!-- 完整的表格内容区域 -->
        <div class="layout-content">
          <!-- 操作按钮区域 -->
          <div class="layout-actions">
            <div class="action-left">
              <el-button
                v-if="canPerform('batchEvaluate')"
                type="primary"
                :icon="SetUp"
                @click="fun_batchEvaluate()"
                :disabled="!canBatchEvaluate"
              >
                评估
              </el-button>
              <el-button
                v-if="canPerform('export')"
                :icon="Download"
                @click="dataMethods.exportData"
                >导出
              </el-button>
              <el-button
                v-if="canPerform('audit')"
                type="success"
                :icon="Bell"
                @click="fun_batchAudit()"
                :disabled="!canBatchAudit"
              >
                发起
              </el-button>
              <el-button
                v-if="canPerform('withdrawAudit')"
                type="warning"
                :icon="Close"
                @click="fun_batchWithdrawAudit()"
                :disabled="!canBatchWithdrawAudit"
              >
                撤回审批
              </el-button>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-container">
            <el-table
              :data="tableData"
              border
              stripe
              highlight-current-row
              row-key="id"
              :reserve-selection="true"
              @selection-change="tableConfig.handleSelectionChange"
            >
              <el-table-column
                type="selection"
                width="55"
                :selectable="selectionSelectable"
              />
              <!--                width="55"-->
              <!--              />-->
              <!-- 参考父组件默认列（保持一致） -->
              <el-table-column
                prop="applicantName"
                label="姓名"
                min-width="120"
                align="center"
                fixed="left"
              />
              <!--              <el-table-column-->
              <!--                prop="photoUrl"-->
              <!--                label="照片"-->
              <!--                min-width="80"-->
              <!--                align="center"-->
              <!--                fixed="left"-->
              <!--              >-->
              <!--                <template #default="scope">-->
              <!--                  <el-avatar-->
              <!--                    v-if="scope.row.photoUrl"-->
              <!--                    :src="scope.row.photoUrl"-->
              <!--                    size="small"-->
              <!--                    shape="square"-->
              <!--                    style="cursor: pointer"-->
              <!--                    @click="-->
              <!--                      tableHelpers.handleTablePhotoPreview(scope.row.photoUrl)-->
              <!--                    "-->
              <!--                  />-->
              <!--                  <div-->
              <!--                    v-else-->
              <!--                    class="avatar-placeholder"-->
              <!--                    style="-->
              <!--                      width: 32px;-->
              <!--                      height: 32px;-->
              <!--                      background-color: #f5f7fa;-->
              <!--                      border: 1px solid #e4e7ed;-->
              <!--                      border-radius: 4px;-->
              <!--                      display: flex;-->
              <!--                      align-items: center;-->
              <!--                      justify-content: center;-->
              <!--                      color: #c0c4cc;-->
              <!--                      font-size: 12px;-->
              <!--                      margin: 0 auto;-->
              <!--                    "-->
              <!--                  >-->
              <!--                    <i class="el-icon-plus"></i>-->
              <!--                  </div>-->
              <!--                </template>-->
              <!--              </el-table-column>-->
              <el-table-column
                prop="idCardNo"
                label="身份证号"
                min-width="180"
                align="center"
                fixed="left"
              />
              <el-table-column
                prop="contactPhone"
                label="手机号"
                min-width="130"
                align="center"
                fixed="left"
              />
              <el-table-column
                prop="auditStatus"
                label="状态"
                min-width="100"
                align="center"
                fixed="left"
              >
                <template #default="scope">
                  <el-tag
                    v-if="scope.row.auditStatus"
                    :type="
                      tableHelpers.getAuditStatusTagType(scope.row.auditStatus)
                    "
                    size="small"
                  >
                    {{
                      tableHelpers.getEnumLabel(
                        attrLists.auditStatusOptions,
                        scope.row.auditStatus
                      )
                    }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="assignedUser"
                label="分配人"
                min-width="100"
                align="center"
                fixed="left"
              >
                <template #default="scope"
                  >{{ scope.row.assignedUser || "-" }}
                </template>
              </el-table-column>
              <el-table-column
                prop="applyPosition"
                label="应聘岗位"
                min-width="400"
                align="center"
              />
              <el-table-column
                prop="availableDate"
                label="可报到日期"
                min-width="120"
                align="center"
              >
                <template #default="scope"
                  >{{ tableHelpers.formatDate(scope.row.availableDate) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="gender"
                label="性别"
                min-width="80"
                align="center"
              >
                <template #default="scope"
                  >{{
                    tableHelpers.getEnumLabel(
                      attrLists.genderOptions,
                      scope.row.gender
                    )
                  }}
                </template>
              </el-table-column>
              <el-table-column
                prop="birthDate"
                label="出生日期"
                min-width="120"
                align="center"
              >
                <template #default="scope"
                  >{{ tableHelpers.formatDate(scope.row.birthDate) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="politicalStatus"
                label="政治面貌"
                min-width="200"
                align="center"
              >
                <template #default="scope">
                  {{
                    tableHelpers.getEnumLabel(
                      attrLists.politicalStatusOptions,
                      scope.row.politicalStatus
                    )
                  }}
                </template>
              </el-table-column>
              <el-table-column
                prop="highestEducationLevel"
                label="最高学历"
                min-width="200"
                align="center"
              >
                <template #default="scope">
                  {{
                    tableHelpers.getEnumLabel(
                      attrLists.educationLevelOptions,
                      scope.row.highestEducationLevel
                    )
                  }}
                </template>
              </el-table-column>
              <el-table-column
                prop="foreignLanguageLevel"
                label="外语等级"
                min-width="100"
                align="center"
              >
                <template #default="scope">
                  {{
                    tableHelpers.getEnumLabel(
                      attrLists.foreignLanguageLevelOptions,
                      scope.row.foreignLanguageLevel
                    )
                  }}
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

              <!-- 数据操作 -->
              <el-table-column
                label="数据操作"
                min-width="120"
                fixed="right"
                align="center"
              >
                <template #default="scope">
                  <el-button
                    v-if="canPerform('query')"
                    type="primary"
                    link
                    size="small"
                    @click="tableActions.handleDetail(scope.row)"
                    >详情
                  </el-button>
                  <el-button
                    v-if="canPerform('evaluate')"
                    type="primary"
                    link
                    size="small"
                    @click="fun_operation(scope.row)"
                    >评估
                  </el-button>
                </template>
              </el-table-column>

              <!-- 审批操作 -->
              <el-table-column
                label="审批操作"
                min-width="120"
                fixed="right"
                align="center"
              >
                <template #default="scope">
                  <el-button
                    v-if="
                      canPerform('audit') && canAudit(scope.row.auditStatus)
                    "
                    type="primary"
                    link
                    size="small"
                    @click="fun_audit(scope.row)"
                    >发起
                  </el-button>
                  <el-button
                    v-if="
                      canPerform('viewApproval') &&
                      !canAudit(scope.row.auditStatus)
                    "
                    type="primary"
                    link
                    size="small"
                    @click="fun_showApprovalTrail(scope.row)"
                    >查看
                  </el-button>
                  <el-button
                    v-if="canPerform('withdrawAudit')"
                    type="primary"
                    link
                    size="small"
                    :disabled="!canWithdrawAudit(scope.row.auditStatus)"
                    :style="{
                      color: canWithdrawAudit(scope.row.auditStatus)
                        ? ''
                        : '#c0c4cc',
                    }"
                    class="withdraw-audit-btn"
                    @click="fun_withdrawAudit(scope.row)"
                    >撤回
                  </el-button>
                </template>
              </el-table-column>

              <!-- 重置操作 -->
              <el-table-column
                v-if="showResetColumn"
                label="重置操作"
                min-width="150"
                fixed="right"
                align="center"
              >
                <template #default="scope">
                  <div class="btn-style">
                    <el-button
                      v-if="canPerform('reinterview')"
                      type="primary"
                      link
                      size="small"
                      :disabled="!canReinterview(scope.row.auditStatus)"
                      :style="{
                        color: canReinterview(scope.row.auditStatus)
                          ? ''
                          : '#c0c4cc',
                      }"
                      @click="fun_reinterview(scope.row)"
                      class="blue-btn"
                      >重新面试
                    </el-button>
                    <el-button
                      v-if="canPerform('reallocate')"
                      type="primary"
                      link
                      size="small"
                      :disabled="!canReallocate(scope.row.auditStatus)"
                      :style="{
                        color: canReallocate(scope.row.auditStatus)
                          ? ''
                          : '#c0c4cc',
                      }"
                      @click="fun_reallocate(scope.row)"
                      class="red-btn"
                      >重新分配
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页区域 -->
          <div class="pagination-container">
            <el-pagination
              :current-page="currentPage"
              :page-size="pageSize"
              :page-sizes="pageSizes"
              :total="dataTotal"
              hide-on-single-page
              @current-change="tableConfig.handleCurrentChange"
              @size-change="tableConfig.handleSizeChange"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </div>
      </template>
    </OnbApplicant>

    <!-- 评估弹框 -->
    <el-dialog
      width="60%"
      v-model="operationDialogVisible"
      title="评估"
      destroy-on-close
    >
      <div
        v-loading="operationLoading"
        element-loading-text="加载中..."
        element-loading-background="rgba(255, 255, 255, 0.9)"
        style="
          min-height: 400px;
          max-height: 70vh;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        "
      >
        <el-form
          ref="operationFormRef"
          :model="operationForm"
          :rules="operationFormRules"
          label-width="120px"
          :disabled="!isFormEditable"
        >
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
                    :value="String(item.key)"
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
                    :value="String(item.key)"
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
                    :label="Number(item.key)"
                    >{{ item.value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <div v-if="operationForm.interviewEvaluationType === 1">
            <el-divider content-position="left"
              >用人单位结构面试评估（A类型）
            </el-divider>

            <el-divider content-position="left">基础素质评估</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学历水平">
                  <div>
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
                    <div>高中1分，中专3分，专科5分，本科7分，硕士10分</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="专业匹配">
                  <div>
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
                    <div>专业匹配度评估</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">专业深度评估</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="理论知识">
                  <div>
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
                    <div>专业理论掌握程度</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实务经验">
                  <div>
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
                    <div>实际工作经验</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">经验匹配评估</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="行业经验">
                  <div>
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
                    <div>0-2年1分，3年3分，4年5分，5年7分，6年以上10分</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">综合素质评估</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="目标管理">
                  <div>
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
                    <div>目标设定和执行能力</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="计划管理">
                  <div>
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
                    <div>计划制定和管理能力</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="组织管理">
                  <div>
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
                    <div>组织协调能力</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="绩效管理">
                  <div>
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
                    <div>绩效管理能力</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="性格管理">
                  <div>
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
                    <div>性格适应性</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div v-if="operationForm.interviewEvaluationType === 2">
            <el-divider content-position="left"
              >用人单位结构面试评估（B类型）
            </el-divider>

            <el-divider content-position="left">专业技能评估</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="专业知识">
                  <div>
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
                    <div>专业知识掌握程度</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实操技能">
                  <div>
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
                    <div>实际操作技能</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">综合素质评估</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="精神状态">
                  <div>
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
                    <div>精神面貌和状态</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="吃苦耐劳">
                  <div>
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
                    <div>工作态度和耐力</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="沟通协调">
                  <div>
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
                    <div>沟通协调能力</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工作经验">
                  <div>
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
                    <div>相关工作经验</div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

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
                    :label="Number(item.key)"
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
      </div>
      <template #footer>
        <span>
          <el-button @click="operationDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            v-if="isFormEditable"
            @click="fun_saveOperation()"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 审批查看弹框 -->
    <el-dialog
      width="60%"
      v-model="approvalTrailDialogVisible"
      title="审批查看"
      destroy-on-close
      :close-on-click-modal="true"
      append-to-body
      class="approval-dialog"
    >
      <div
        v-loading="approvalTrailLoading"
        element-loading-text="加载中..."
        element-loading-background="rgba(255, 255, 255, 0.9)"
        style="
          min-height: 400px;
          max-height: 70vh;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        "
      >
        <div class="merged-detail-container">
          <!-- 左侧：详情信息 -->
          <div class="detail-left">
            <h3 class="detail-title detail-title-left">基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">姓名</div>
                  <div class="info-value">
                    {{ currentDetailRow?.applicantName || "-" }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">身份证号</div>
                  <div class="info-value">
                    {{ currentDetailRow?.idCardNo || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">手机号</div>
                  <div class="info-value">
                    {{ currentDetailRow?.contactPhone || "-" }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">分配人</div>
                  <div class="info-value">
                    {{ currentDetailRow?.assignedUser || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <div class="info-item">
                  <div class="info-label">应聘岗位</div>
                  <div class="info-value">
                    {{ currentDetailRow?.applyPosition || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">面试日期</div>
                  <div class="info-value">
                    {{ formatDate(currentDetailRow?.interviewerDate) || "-" }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">面试得分</div>
                  <div class="info-value">
                    {{ currentDetailRow?.evaluationScore || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">是否通过</div>
                  <div class="info-value">
                    {{
                      getEnumLabel(
                        attrLists.isHiredOptions,
                        currentDetailRow?.isPassed
                      )
                    }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">评估类型</div>
                  <div class="info-value">
                    {{
                      getEnumLabel(
                        attrLists.interviewEvaluationTypeOptions,
                        currentDetailRow?.evaluationType
                      )
                    }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">测试方式</div>
                  <div class="info-value">
                    {{
                      getEnumLabel(
                        attrLists.testMethodOptions,
                        currentDetailRow?.testMethod
                      )
                    }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">用工性质</div>
                  <div class="info-value">
                    {{
                      getEnumLabel(
                        attrLists.employmentTypeOptions,
                        currentDetailRow?.employmentType
                      )
                    }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <div class="info-item">
                  <div class="info-label">面试意见</div>
                  <div class="info-value">
                    {{ currentDetailRow?.evaluationComment || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">创建人</div>
                  <div class="info-value">
                    {{ currentDetailRow?.createUser || "-" }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">创建时间</div>
                  <div class="info-value">
                    {{ formatTimestamp(currentDetailRow?.createTime) || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 右侧：审批流程卡片 -->
          <div class="detail-right">
            <h3 class="detail-title detail-title-right">流程信息</h3>
            <div class="approval-trail-content">
              <div v-if="approvalTrailList.length === 0" class="no-data">
                暂无审批流程痕迹
              </div>
              <div v-else class="approval-trail-timeline">
                <div
                  v-for="(item, index) in approvalTrailList"
                  :key="index"
                  class="approval-trail-item"
                >
                  <div
                    class="timeline-line"
                    v-if="index < approvalTrailList.length - 1"
                  ></div>
                  <div class="approver-header">
                    <span class="approver-name">{{ item.name || "系统" }}</span>
                    <span
                      class="approval-status"
                      :class="getStatusClass(item.status)"
                      >{{ getStatusText(item.status) }}</span
                    >
                  </div>
                  <div class="approval-content">
                    <div class="approval-details">
                      <div class="approval-detail-item">
                        <span class="detail-label">审批节点：</span>
                        <span class="detail-value">{{
                          item.activityName
                        }}</span>
                      </div>
                      <div v-if="item.handleTime" class="approval-detail-item">
                        <span class="detail-label">处理时间：</span>
                        <span class="detail-value">{{ item.handleTime }}</span>
                      </div>
                      <div v-if="item.opinion" class="approval-detail-item">
                        <span class="detail-label">审批意见：</span>
                        <span class="detail-value">{{ item.opinion }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalTrailDialogVisible = false"
            >关闭</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 批量评估弹框 -->
    <el-dialog
      width="900px"
      v-model="batchOperationDialogVisible"
      title="批量评估"
    >
      <!-- 选中的应聘者列表 -->
      <div class="batch-applicants-section">
        <div class="section-title">
          已选择 {{ selectedApplicants.length }} 位应聘者
        </div>
        <div class="applicants-list">
          <el-tag
            v-for="applicant in selectedApplicants"
            :key="applicant.id"
            closable
            @close="removeApplicant(applicant.id)"
            type="info"
            size="large"
            style="margin: 5px"
          >
            {{ applicant.applicantName }} - {{ applicant.applyPosition }}
          </el-tag>
        </div>
      </div>

      <el-divider></el-divider>

      <!-- 批量评估表单 -->
      <el-form
        ref="batchOperationFormRef"
        :model="batchOperationForm"
        :rules="batchOperationFormRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测试方式" prop="testMethod">
              <el-select
                v-model="batchOperationForm.testMethod"
                placeholder="请选择测试方式"
                style="width: 100%"
              >
                <el-option
                  v-for="item in attrLists.testMethodOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="String(item.key)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用工性质" prop="employmentType">
              <el-select
                v-model="batchOperationForm.employmentType"
                placeholder="请选择用工性质"
                style="width: 100%"
              >
                <el-option
                  v-for="item in attrLists.employmentTypeOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="String(item.key)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="评估类型" prop="interviewEvaluationType">
              <el-select
                v-model="batchOperationForm.interviewEvaluationType"
                placeholder="请选择评估类型"
                style="width: 100%"
                @change="handleBatchEvaluationTypeChange"
              >
                <el-option label="A类型" :value="1" />
                <el-option label="B类型" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否通过" prop="isHired">
              <el-select
                v-model="batchOperationForm.isHired"
                placeholder="请选择是否通过"
                style="width: 100%"
              >
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="面试意见" prop="interviewSuggestion">
          <el-input
            v-model="batchOperationForm.interviewSuggestion"
            type="textarea"
            :rows="3"
            placeholder="请输入面试意见"
          />
        </el-form-item>

        <el-divider v-if="batchOperationForm.interviewEvaluationType === 1"
          >A类型评分</el-divider
        >
        <el-divider v-if="batchOperationForm.interviewEvaluationType === 2"
          >B类型评分</el-divider
        >

        <!-- A类型评分 -->
        <div v-if="batchOperationForm.interviewEvaluationType === 1">
          <el-divider content-position="left">教育背景评估</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="教育背景">
                <el-select
                  v-model="batchOperationAForm.educationScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分 - 高中/中专"></el-option>
                  <el-option :value="3" label="3分 - 大专"></el-option>
                  <el-option :value="5" label="5分 - 本科"></el-option>
                  <el-option :value="7" label="7分 - 硕士"></el-option>
                  <el-option :value="10" label="10分 - 博士"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="专业匹配">
                <el-select
                  v-model="batchOperationAForm.majorMatchScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分 - 不匹配"></el-option>
                  <el-option :value="3" label="3分 - 较差"></el-option>
                  <el-option :value="5" label="5分 - 一般"></el-option>
                  <el-option :value="7" label="7分 - 较好"></el-option>
                  <el-option :value="10" label="10分 - 完全匹配"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">专业深度评估</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="理论知识">
                <el-select
                  v-model="batchOperationAForm.theoryKnowledgeScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分 - 较差"></el-option>
                  <el-option :value="3" label="3分 - 一般"></el-option>
                  <el-option :value="5" label="5分 - 良好"></el-option>
                  <el-option :value="7" label="7分 - 优秀"></el-option>
                  <el-option :value="10" label="10分 - 精通"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="实践经验">
                <el-select
                  v-model="batchOperationAForm.practicalExperienceScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分 - 无经验"></el-option>
                  <el-option :value="3" label="3分 - 1年以下"></el-option>
                  <el-option :value="5" label="5分 - 1-2年"></el-option>
                  <el-option :value="7" label="7分 - 3-5年"></el-option>
                  <el-option :value="10" label="10分 - 5年以上"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">经验匹配评估</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="行业经验">
                <el-select
                  v-model="batchOperationAForm.industryExperienceScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分 - 0-2年"></el-option>
                  <el-option :value="3" label="3分 - 3年"></el-option>
                  <el-option :value="5" label="5分 - 4年"></el-option>
                  <el-option :value="7" label="7分 - 5年"></el-option>
                  <el-option :value="10" label="10分 - 6年以上"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">综合素质评估</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="目标管理">
                <el-select
                  v-model="batchOperationAForm.targetManagementScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划管理">
                <el-select
                  v-model="batchOperationAForm.planManagementScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="组织管理">
                <el-select
                  v-model="batchOperationAForm.organizationManagementScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="绩效管理">
                <el-select
                  v-model="batchOperationAForm.performanceManagementScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="性格管理">
                <el-select
                  v-model="batchOperationAForm.personalityManagementScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchATotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="总分">
                <el-input
                  v-model="batchOperationAForm.totalScore"
                  disabled
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- B类型评分 -->
        <div v-if="batchOperationForm.interviewEvaluationType === 2">
          <el-divider content-position="left">专业技能评估</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="专业知识">
                <el-select
                  v-model="batchOperationBForm.professionalKnowledgeScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchBTotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="实操技能">
                <el-select
                  v-model="batchOperationBForm.practicalSkillScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchBTotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">综合素质评估</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="精神状态">
                <el-select
                  v-model="batchOperationBForm.mentalStateScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchBTotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="吃苦耐劳">
                <el-select
                  v-model="batchOperationBForm.hardworkingScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchBTotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="沟通协调">
                <el-select
                  v-model="batchOperationBForm.communicationScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchBTotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工作经验">
                <el-select
                  v-model="batchOperationBForm.experienceScore"
                  placeholder="请选择分数"
                  style="width: 100%"
                  @change="calculateBatchBTotalScore"
                >
                  <el-option :value="1" label="1分"></el-option>
                  <el-option :value="3" label="3分"></el-option>
                  <el-option :value="5" label="5分"></el-option>
                  <el-option :value="7" label="7分"></el-option>
                  <el-option :value="10" label="10分"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="总分">
                <el-input
                  v-model="batchOperationBForm.totalScore"
                  disabled
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchOperationDialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="fun_batchSaveEvaluate"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
