<template>
  <div>
    <!-- 子组件：OnbApplicant -->
    <OnbApplicant ref="applicantRef" :page-type="1">
      <!-- 自定义表格：在默认列基础上增加“分配操作/资源操作”两列 -->
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
            <template #default="scope">{{
                scope.row.gender ? scope.row.gender.value : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="birthDate"
            label="出生年月"
            min-width="120"
            align="center"
          >
            <template #default="scope">{{
                tableHelpers.formatDate(scope.row.birthDate)
              }}
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
            <template #default="scope">{{
                tableHelpers.formatDate(scope.row.availableDate)
              }}
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
            <template #default="scope">{{
                scope.row.assignedUser || "-"
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="assignedDate"
            label="分配日期"
            min-width="120"
            align="center"
          >
            <template #default="scope">{{
                tableHelpers.formatDate(scope.row.assignedDate)
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="interviewerDate"
            label="面试日期"
            min-width="120"
            align="center"
          >
            <template #default="scope">{{
                tableHelpers.formatDate(scope.row.interviewerDate)
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="offerDate"
            label="录用日期"
            min-width="120"
            align="center"
          >
            <template #default="scope">{{
                tableHelpers.formatDate(scope.row.offerDate)
              }}
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
              </el-button
              >
              <el-button
                type="text"
                size="small"
                @click="tableActions.handleUpdate(scope.row)"
              >编辑
              </el-button
              >
              <el-button
                type="text"
                size="small"
                @click="tableActions.handleDelete(scope.row)"
                style="color: #f56c6c"
              >删除
              </el-button
              >
            </template>
          </el-table-column>

          <!-- 分配操作（分配/通知/撤回通知） -->
          <el-table-column
            label="分配操作"
            min-width="200"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                :disabled="!canAllocate(scope.row.auditStatus)"
                @click="fun_operation(scope.row)"
              >分配
              </el-button
              >
              <el-button
                type="text"
                size="small"
                :disabled="!canAudit(scope.row.auditStatus)"
                @click="fun_audit(scope.row)"
              >通知
              </el-button
              >
              <el-button
                type="text"
                size="small"
                :disabled="!canWithdrawAudit(scope.row.auditStatus)"
                class="withdraw-audit-btn"
                @click="fun_withdrawAudit(scope.row)"
              >撤回通知
              </el-button
              >
            </template>
          </el-table-column>

          <!-- 资源操作（打开附件/一键下载） -->
          <el-table-column
            label="资源操作"
            min-width="200"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                @click="tableActions.openAttachmentsTab(scope.row)"
              >打开附件
              </el-button
              >
              <el-button
                type="text"
                size="small"
                @click="tableActions.downloadBatchAttachments(scope.row)"
              >一键下载
              </el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
    </OnbApplicant>

    <!-- 分配弹框 -->
    <el-dialog width="700px" v-model="operationDialogVisible" title="分配">
      <el-form
        ref="operationFormRef"
        :model="operationForm"
        :rules="operationFormRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="应聘者">
              <el-input v-model="currentOperationRow.applicantName" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应聘岗位">
              <el-input v-model="operationForm.applyPosition"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分配部门" prop="assignedDept">
              <el-input
                v-model="operationForm.assignedDept"
                placeholder="请输入分配部门"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分配人" prop="assignedUser">
              <el-input
                v-model="operationForm.assignedUser"
                placeholder="请输入分配人姓名"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分配日期" prop="assignedDate">
              <el-date-picker
                v-model="operationForm.assignedDate"
                type="date"
                placeholder="请选择分配日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分配说明" prop="assignedReason">
              <el-input
                v-model="operationForm.assignedReason"
                type="textarea"
                :rows="1"
                placeholder="请输入分配说明"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="operationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="fun_saveOperation">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style scoped src="./css/index.css"></style>
