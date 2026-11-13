<template>
  <div>
    <!-- 子组件：OnbApplicant（已包含权限控制） -->
    <OnbApplicant ref="applicantRef" :pageType="1">
      <!-- 自定义表格内容区域：在默认列基础上增加"分配操作/资源操作"两列 -->
      <template
        #data-table="{
          tableHelpers,
          dataMethods,
          tableData,
          currentPage,
          pageSize,
          pageSizes,
          dataTotal,
          selectedRows,
          tableConfig,
          tableActions,
        }"
      >
        <!-- 完整的表格内容区域 -->
        <div class="layout-content">
          <!-- 操作按钮区域 -->
          <div class="layout-actions">
            <div class="action-left">
              <!--              <el-button type="primary" :icon="Plus" @click="tableActions.handleCreate"-->
              <!--              >新增-->
              <!--              </el-button>-->
              <!--              <el-button-->
              <!--                type="danger"-->
              <!--                :icon="Delete"-->
              <!--                @click="fun_batchDelete()"-->
              <!--                :disabled="!selectedRows || selectedRows.length === 0"-->
              <!--              >-->
              <!--                删除-->
              <!--              </el-button>-->
              <el-button
                v-if="canPerform('allocate')"
                type="primary"
                :icon="SetUp"
                @click="fun_batchAllocate()"
                :disabled="!selectedRows || selectedRows.length === 0"
              >
                分配
              </el-button>
              <el-button
                v-if="canPerform('export')"
                :icon="Download"
                @click="dataMethods.exportData"
                >导出
              </el-button>
              <el-button
                v-if="canPerform('notify')"
                type="success"
                :icon="Bell"
                @click="fun_batchAudit()"
                :disabled="!selectedRows || selectedRows.length === 0"
              >
                通知
              </el-button>
              <el-button
                v-if="canPerform('withdrawNotify')"
                type="warning"
                :icon="Close"
                @click="fun_batchWithdrawAudit()"
                :disabled="!selectedRows || selectedRows.length === 0"
              >
                撤回通知
              </el-button>
              <!--              <el-button type="info" :icon="Refresh" @click="dataMethods.openRecycleBin"-->
              <!--              >回收站-->
              <!--              </el-button-->
              <!--              >-->
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
              <!--                  <span v-else>-</span>-->
              <!--                </template>-->
              <!--              </el-table-column>-->
              <el-table-column
                prop="idCardNo"
                label="身份证号"
                min-width="180"
                align="center"
                fixed="left"
              >
                <template #default="scope">
                  {{ scope.row.idCardNo }}
                </template>
              </el-table-column>
              <el-table-column
                prop="contactPhone"
                label="手机号"
                min-width="200"
                align="center"
                fixed="left"
              >
                <template #default="scope">
                  {{ scope.row.contactPhone ? scope.row.contactPhone : "-" }}
                </template>
              </el-table-column>
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
                        scope.row.auditStatus
                      )
                    "
                    size="small"
                  >
                    {{ tableHelpers.getEnumLabel(attrLists.auditStatusOptions, scope.row.auditStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="assignedUser"
                label="分配人"
                min-width="100"
                align="center"
              >
                <template #default="scope">
                  {{ scope.row.assignedUser || "-" }}
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
                label="可报道日期"
                min-width="120"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.formatDate(scope.row.availableDate) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="gender"
                label="性别"
                min-width="80"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.getEnumLabel(attrLists.genderOptions, scope.row.gender) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="birthDate"
                label="出生日期"
                min-width="120"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.formatDate(scope.row.birthDate) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="politicalStatus"
                label="政治面貌"
                min-width="200"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.getEnumLabel(attrLists.politicalStatusOptions, scope.row.politicalStatus) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="highestEducationLevel"
                label="最高学历"
                min-width="200"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.getEnumLabel(attrLists.educationLevelOptions, scope.row.highestEducationLevel) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="foreignLanguageLevel"
                label="外语等级"
                min-width="100"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.getEnumLabel(attrLists.foreignLanguageLevelOptions, scope.row.foreignLanguageLevel) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="assignedDate"
                label="分配日期"
                min-width="120"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.formatDate(scope.row.assignedDate) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="interviewerDate"
                label="面试日期"
                min-width="120"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.formatDate(scope.row.interviewerDate) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="offerDate"
                label="录用日期"
                min-width="120"
                align="center"
              >
                <template #default="scope">
                  {{ tableHelpers.formatDate(scope.row.offerDate) }}
                </template>
              </el-table-column>

              <!-- 数据操作 -->
              <el-table-column
                label="数据操作"
                min-width="100"
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
                    v-if="canPerform('allocate')"
                    type="primary"
                    link
                    size="small"
                    @click="fun_singleOperation(scope.row)"
                    >分配
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
                    v-if="canPerform('notify')"
                    type="primary"
                    link
                    size="small"
                    :disabled="!canAudit(scope.row.auditStatus)"
                    :style="{
                      color: canAudit(scope.row.auditStatus) ? '' : '#c0c4cc'
                    }"
                    @click="fun_audit(scope.row)"
                    >通知
                  </el-button>
                  <el-button
                    v-if="canPerform('withdrawNotify')"
                    type="primary"
                    link
                    size="small"
                    :disabled="!canWithdrawAudit(scope.row.auditStatus)"
                    :style="{
                      color: canWithdrawAudit(scope.row.auditStatus) ? '' : '#c0c4cc'
                    }"
                    class="withdraw-audit-btn"
                    @click="fun_withdrawAudit(scope.row)"
                    >撤回通知
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

    <!-- 单个分配弹框 -->
    <el-dialog
      width="700px"
      v-model="singleOperationDialogVisible"
      title="分配"
    >
      <div
        v-loading="singleOperationLoading"
        element-loading-text="加载中..."
        element-loading-background="rgba(255, 255, 255, 0.9)"
      >
        <el-form
          ref="singleOperationFormRef"
          :model="singleOperationForm"
          :rules="singleOperationFormRules"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="应聘者">
                <el-input
                  v-model="currentSingleOperationRow.applicantName"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="应聘岗位">
                <el-input
                  v-model="singleOperationForm.applyPosition"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分配部门" prop="assignedDept">
                <el-input
                  v-model="singleOperationForm.assignedDeptName"
                  placeholder="请选择分配部门"
                  maxlength="50"
                  readonly
                  :disabled="!isSingleFormEditable"
                  @click="openSingleDeptSelectDialog"
                >
                  <template #append>
                    <el-button
                      type="primary"
                      :disabled="!isSingleFormEditable"
                      @click="openSingleDeptSelectDialog"
                    >
                      选择
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分配人" prop="assignedUser">
                <el-input
                  v-model="singleOperationForm.assignedUser"
                  placeholder="请先选择分配部门"
                  maxlength="20"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分配日期" prop="assignedDate">
                <el-date-picker
                  v-model="singleOperationForm.assignedDate"
                  type="date"
                  placeholder="请选择分配日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  dus
                  :disabled="!isSingleFormEditable"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分配说明" prop="assignedReason">
                <el-input
                  v-model="singleOperationForm.assignedReason"
                  type="textarea"
                  :rows="1"
                  placeholder="请输入分配说明"
                  maxlength="200"
                  show-word-limit
                  :disabled="!isSingleFormEditable"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="singleOperationDialogVisible = false"
            >取消</el-button
          >
          <el-button
            type="primary"
            v-if="isSingleFormEditable"
            @click="fun_singleSaveOperation"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 批量分配弹框 -->
    <el-dialog width="700px" v-model="operationDialogVisible" title="批量分配">
      <div
        v-loading="operationLoading"
        element-loading-text="加载中..."
        element-loading-background="rgba(255, 255, 255, 0.9)"
      >
        <el-form
          ref="operationFormRef"
          :model="operationForm"
          :rules="operationFormRules"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分配部门" prop="assignedDept">
                <el-input
                  v-model="operationForm.assignedDeptName"
                  placeholder="请选择分配部门"
                  maxlength="50"
                  readonly
                  @click="openDeptSelectDialog"
                >
                  <template #append>
                    <el-button type="primary" @click="openDeptSelectDialog">
                      选择
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分配人" prop="assignedUser">
                <el-input
                  v-model="operationForm.assignedUser"
                  placeholder="请先选择分配部门"
                  maxlength="20"
                  disabled
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
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="选中应聘者">
                <div class="selected-applicants">
                  <el-tag
                    v-for="applicant in selectedApplicants"
                    :key="applicant.id"
                    closable
                    @close="removeApplicant(applicant.id)"
                    style="margin-right: 8px; margin-bottom: 8px"
                  >
                    {{ applicant.applicantName }}
                  </el-tag>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="operationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="fun_batchSaveOperation"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 部门选择弹窗 -->
    <el-dialog
      width="80%"
      v-model="deptSelectDialogVisible"
      title="选择部门"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div
        v-loading="deptSelectLoading"
        element-loading-text="加载中..."
        element-loading-background="rgba(255, 255, 255, 0.9)"
      >
        <!-- 筛选区域 -->
        <div class="layout-search">
          <el-form
            ref="deptSearchFormRef"
            :model="deptSearchForm"
            :inline="true"
          >
            <div class="search-top-layout">
              <div class="search-left">
                <div class="search-filters-grid">
                  <!-- 第1行：4个筛选字段 -->
                  <div class="filter-row">
                    <el-form-item label="部门名称">
                      <el-input
                        v-model="deptSearchForm.orgName"
                        placeholder="请输入部门名称"
                        clearable
                        class="search-input"
                        maxlength="50"
                        @keyup.enter="searchDeptList"
                      />
                    </el-form-item>
                    <el-form-item label="部门编码">
                      <el-input
                        v-model="deptSearchForm.orgNo"
                        placeholder="请输入部门编码"
                        clearable
                        class="search-input"
                        maxlength="20"
                        @keyup.enter="searchDeptList"
                      />
                    </el-form-item>
                    <el-form-item label="数据管家名称">
                      <el-input
                        v-model="deptSearchForm.dateSteward"
                        placeholder="请输入数据管家名称"
                        clearable
                        class="search-input"
                        maxlength="20"
                        @keyup.enter="searchDeptList"
                      />
                    </el-form-item>
                    <el-form-item label="数据管家工号">
                      <el-input
                        v-model="deptSearchForm.dateStewardNo"
                        placeholder="请输入数据管家工号"
                        clearable
                        class="search-input"
                        maxlength="20"
                        @keyup.enter="searchDeptList"
                      />
                    </el-form-item>
                  </div>
                </div>
              </div>
              <div class="search-right">
                <el-button
                  type="primary"
                  :icon="Search"
                  @click="searchDeptList"
                >
                  搜索
                </el-button>
                <el-button :icon="Refresh" @click="resetDeptSearch">
                  重置
                </el-button>
              </div>
            </div>
          </el-form>
        </div>

        <!-- 部门列表表格 -->
        <el-table
          :data="deptList"
          border
          stripe
          highlight-current-row
          height="400"
          @current-change="handleDeptRowChange"
        >
          <el-table-column
            prop="orgName"
            label="部门名称"
            min-width="180"
            align="center"
          />
          <el-table-column
            prop="orgNo"
            label="部门编码"
            min-width="130"
            align="center"
          />
          <el-table-column
            prop="dateSteward"
            label="数据管家"
            min-width="150"
            align="center"
          />
          <el-table-column
            prop="dateStewardNo"
            label="数据管家工号"
            min-width="150"
            align="center"
          />
        </el-table>
        <!-- 分页 -->
        <div style="margin-top: 20px; padding-bottom: 20px">
          <el-pagination
            :current-page="deptCurrentPage"
            :page-size="deptPageSize"
            :page-sizes="deptPageSizes"
            :total="deptTotal"
            @current-change="handleDeptCurrentChange"
            @size-change="handleDeptSizeChange"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deptSelectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDeptSelection"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
