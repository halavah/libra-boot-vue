<template>
  <div>
    <!-- 子组件：OnbApplicant -->
    <OnbApplicant ref="applicantRef" :page-type="3">
      <!-- 自定义表格内容区域：在默认列基础上增加"录用反馈操作"两列 -->
      <template
        #data-table="{
          tableData,
          currentPage,
          pageSize,
          pageSizes,
          dataTotal,
          tableConfig,
          tableHelpers,
          tableActions,
          searchMethods,
          dataMethods,
        }"
      >
        <!-- 完整的表格内容区域 -->
        <div class="layout-content">
          <!-- 操作按钮区域 -->
          <div class="layout-actions">
            <div class="search-buttons">
              <el-button type="primary" @click="searchMethods.handleSearch"
                >查询
              </el-button>
              <el-button @click="searchMethods.handleReset">重置</el-button>
              <el-button type="success" @click="tableActions.handleCreate"
                >新增</el-button
              >
              <el-button type="warning" @click="dataMethods.exportData"
                >导出</el-button
              >
              <el-button type="info" @click="dataMethods.openRecycleBin"
                >回收站</el-button
              >
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-container">
            <el-table
              :data="
                tableData.slice(
                  (currentPage - 1) * pageSize,
                  currentPage * pageSize
                )
              "
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
                    @click="
                      tableHelpers.handleTablePhotoPreview(scope.row.photoUrl)
                    "
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

              <!-- 录用操作（录用/审核/撤回审核） -->
              <el-table-column
                label="录用操作"
                min-width="200"
                fixed="right"
                align="center"
              >
                <template #default="scope">
                  <el-button
                    type="text"
                    size="small"
                    :disabled="!canOffer(scope.row.auditStatus)"
                    @click="fun_operation(scope.row)"
                    >录用
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

              <!-- 重置操作（重新录用/重新分配） -->
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
                    :disabled="!canReoffer(scope.row.auditStatus)"
                    @click="fun_reoffer(scope.row)"
                    >重新录用
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
    <el-dialog width="800px" v-model="operationDialogVisible" title="录用">
      <el-form
        ref="operationFormRef"
        :model="operationForm"
        :rules="operationFormRules"
        label-width="140px"
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
                placeholder="请输入"
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
                placeholder="请输入"
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
