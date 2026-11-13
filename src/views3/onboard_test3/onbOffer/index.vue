<template>
  <div>
    <!-- 子组件：OnbApplicant -->
    <OnbApplicant ref="applicantRef" :pageType="3">
      <!-- 自定义表格内容区域：在默认列基础上增加"录用反馈操作"两列 -->
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
                type="primary"
                :icon="SetUp"
                @click="fun_batchOffer()"
                :disabled="!canBatchOffer"
              >
                录用
              </el-button>
              <el-button :icon="Download" @click="dataMethods.exportData"
                >导出
              </el-button>
              <el-button
                type="success"
                :icon="Bell"
                @click="fun_batchAudit()"
                :disabled="!canBatchAudit"
              >
                发起
              </el-button>
              <el-button
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
                      tableHelpers.getAuditStatusTagType(
                        scope.row.auditStatus.key
                      )
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
                  >{{ scope.row.gender ? scope.row.gender.value : "-" }}
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
                    scope.row.politicalStatus
                      ? scope.row.politicalStatus.value
                      : "-"
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
                    scope.row.highestEducationLevel
                      ? scope.row.highestEducationLevel.value
                      : "-"
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
                    scope.row.foreignLanguageLevel
                      ? scope.row.foreignLanguageLevel.value
                      : "-"
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
                min-width="150"
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
                    @click="fun_operation(scope.row)"
                    >录用
                  </el-button>
                </template>
              </el-table-column>

              <!-- 审批操作 -->
              <el-table-column
                label="审批操作"
                min-width="150"
                fixed="right"
                align="center"
              >
                <template #default="scope">
                  <el-button
                    type="text"
                    size="small"
                    v-if="canAudit(scope.row.auditStatus)"
                    @click="fun_audit(scope.row)"
                    >发起
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    v-if="!canAudit(scope.row.auditStatus)"
                    @click="fun_showApprovalTrail(scope.row)"
                    >查看
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    :disabled="!canWithdrawAudit(scope.row.auditStatus)"
                    class="withdraw-audit-btn"
                    @click="fun_withdrawAudit(scope.row)"
                    >撤回
                  </el-button>
                </template>
              </el-table-column>

              <!-- 重置操作 -->
              <el-table-column
                label="重置操作"
                min-width="200"
                fixed="right"
                align="center"
              >
                <template #default="scope">
                  <div class="btn-style">
                    <el-button
                      type="text"
                      size="small"
                      :disabled="!canReoffer(scope.row.auditStatus)"
                      @click="fun_reoffer(scope.row)"
                      class="blue-btn"
                      >重新录用
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      :disabled="!canReallocate(scope.row.auditStatus)"
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

    <!-- 录用弹框 -->
    <el-dialog width="40%" v-model="operationDialogVisible" title="录用">
      <el-form
        ref="operationFormRef"
        :model="operationForm"
        :rules="operationFormRules"
        label-width="140px"
        :disabled="!isFormEditable"
      >
        <!-- 基本信息显示（只读，不可更改） -->
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input
                v-model="currentOperationRow.applicantName"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-input
                v-model="currentOperationRow.genderText"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-input
                v-model="currentOperationRow.birthDateText"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input
                v-model="currentOperationRow.contactPhone"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input
                v-model="currentOperationRow.idCardNo"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应聘岗位">
              <el-input
                v-model="currentOperationRow.applyPosition"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 录用信息（可编辑） -->
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="录用状态" prop="hireStatus">
              <el-radio-group v-model="operationForm.hireStatus">
                <el-radio
                  v-for="item in attrLists.isHiredOptions"
                  :key="item.key"
                  :label="item.key"
                  >{{ item.value }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试用期工资" prop="probationSalary">
              <el-input-number
                v-model="operationForm.probationSalary"
                :min="0"
                :max="9999999"
                :precision="2"
                :step="1000"
                placeholder="请输入试用期工资"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="试用期时长" prop="probationDuration">
              <el-select
                v-model="operationForm.probationDuration"
                placeholder="请选择试用期时长"
              >
                <el-option
                  v-for="item in attrLists.probationDurationOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转正工资" prop="formalSalary">
              <el-input-number
                v-model="operationForm.formalSalary"
                :min="0"
                :max="9999999"
                :precision="2"
                :step="1000"
                placeholder="请输入转正工资"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
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
                <div class="info-label">录用日期</div>
                <div class="info-value">
                  {{ formatDate(currentDetailRow?.offerDate) || "-" }}
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <div class="info-label">是否录用</div>
                <div class="info-value">
                  {{
                    getEnumLabel(
                      attrLists.isHiredOptions,
                      currentDetailRow?.isHired
                    )
                  }}
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <div class="info-label">试用期时长</div>
                <div class="info-value">
                  {{
                    getEnumLabel(
                      attrLists.probationDurationOptions,
                      currentDetailRow?.probationDuration
                    )
                  }}
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <div class="info-label">试用期工资</div>
                <div class="info-value">
                  {{ currentDetailRow?.probationSalary || "-" }}
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <div class="info-label">转正工资</div>
                <div class="info-value">
                  {{ currentDetailRow?.formalSalary || "-" }}
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <div class="info-label">创建人</div>
                <div class="info-value">
                  {{ currentDetailRow?.createUser || "-" }}
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
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
                      <span class="detail-value">{{ item.activityName }}</span>
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

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalTrailDialogVisible = false"
            >关闭</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 批量录用弹框 -->
    <el-dialog
      width="700px"
      v-model="batchOperationDialogVisible"
      title="批量录用"
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

      <!-- 批量录用表单 -->
      <el-form
        ref="batchOperationFormRef"
        :model="batchOperationForm"
        :rules="batchOperationFormRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="录用状态" prop="hireStatus">
              <el-select
                v-model="batchOperationForm.hireStatus"
                placeholder="请选择录用状态"
                style="width: 100%"
              >
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试用期工资" prop="probationSalary">
              <el-input-number
                v-model="batchOperationForm.probationSalary"
                :min="0"
                :max="9999999"
                :precision="2"
                :step="1000"
                placeholder="请输入试用期工资"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="试用期时长" prop="probationDuration">
              <el-select
                v-model="batchOperationForm.probationDuration"
                placeholder="请选择试用期时长"
                style="width: 100%"
              >
                <el-option
                  v-for="item in attrLists.probationDurationOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转正工资" prop="formalSalary">
              <el-input-number
                v-model="batchOperationForm.formalSalary"
                :min="0"
                :max="9999999"
                :precision="2"
                :step="1000"
                placeholder="请输入转正工资"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchOperationDialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="fun_batchSaveOffer">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
