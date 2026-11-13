<template>
  <div class="root-container">
    <!-- 权限加载状态 -->
    <div v-if="permissionLoading" class="permission-loading-container">
      <el-icon class="is-loading" :size="40">
        <Loading />
      </el-icon>
      <p>正在验证权限...</p>
    </div>

    <!-- 无权限提示 -->
    <div v-else-if="!hasPageAccess" class="no-access-container">
      <el-result
        icon="error"
        title="无访问权限"
        sub-title="您没有权限访问此页面，请联系管理员"
      />
    </div>

    <!-- 页面内容 -->
    <div v-else v-loading.lock="loading" class="page-content">
      <div class="layout-search">
        <el-form
          ref="searchFormRef"
          :model="searchForm"
          :rules="searchFormRules"
          :inline="true"
        >
          <div class="search-top-layout">
            <div class="search-left">
              <div class="search-filters-grid">
                <div class="filter-row">
                  <el-form-item label="审批状态" prop="flowStatus">
                    <el-select
                      v-model="searchForm.flowStatus"
                      placeholder="请选择审批状态"
                      clearable
                      class="search-select"
                    >
                      <el-option
                        v-for="item in attrLists.flowStatusOptions"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="姓名" prop="applicantName">
                    <el-input
                      v-model="searchForm.applicantName"
                      placeholder="请输入姓名"
                      clearable
                      class="search-input"
                      maxlength="20"
                    />
                  </el-form-item>
                  <el-form-item label="身份证号" prop="idCardNo">
                    <el-input
                      v-model="searchForm.idCardNo"
                      placeholder="请输入身份证号"
                      clearable
                      class="search-input"
                      maxlength="18"
                    />
                  </el-form-item>
                  <el-form-item label="手机号" prop="contactPhone">
                    <el-input
                      v-model="searchForm.contactPhone"
                      placeholder="请输入手机号"
                      clearable
                      class="search-input"
                      maxlength="11"
                    />
                  </el-form-item>
                </div>

                <div
                  class="filter-row expanded-filter-rows"
                  v-show="searchExpanded"
                >
                  <el-form-item label="应聘岗位" prop="applyPosition">
                    <el-input
                      v-model="searchForm.applyPosition"
                      placeholder="请输入应聘岗位"
                      clearable
                      class="search-input"
                      maxlength="20"
                    />
                  </el-form-item>
                  <el-form-item label="分配人" prop="assignedUser">
                    <el-input
                      v-model="searchForm.assignedUser"
                      placeholder="请输入分配人"
                      clearable
                      class="search-input"
                      maxlength="20"
                    />
                  </el-form-item>
                  <el-form-item label="面试日期" prop="interviewerDateRange">
                    <el-date-picker
                      v-model="searchForm.interviewerDateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      class="search-datepicker"
                    />
                  </el-form-item>
                </div>
              </div>
            </div>
            <div class="search-right">
              <el-button
                type="primary"
                :icon="Search"
                @click="fun_search($refs.searchFormRef)"
              >
                搜索
              </el-button>
              <el-button
                plain
                :icon="Refresh"
                @click="fun_reset($refs.searchFormRef)"
              >
                重置
              </el-button>
              <div class="search-toggle-button" @click="toggleSearchExpanded">
                <span>{{ searchExpanded ? "收起" : "展开" }}</span>
                <el-icon
                  class="search-toggle-icon"
                  :class="{ expanded: searchExpanded }"
                >
                  <ArrowDown />
                </el-icon>
              </div>
            </div>
          </div>
        </el-form>
      </div>

      <div class="layout-content">
        <div class="search-buttons">
          <!--        <el-button plain :icon="Download" @click="fun_export()">导出</el-button>-->
        </div>

        <div class="table-container">
          <el-table
            :data="dataList"
            border
            stripe
            highlight-current-row
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              prop="flowStatus"
              label="审批状态"
              min-width="100"
              align="center"
              fixed="left"
            >
              <template #default="scope">
                <el-tag
                  v-if="
                    scope.row.flowStatus !== undefined &&
                    scope.row.flowStatus !== null
                  "
                  :type="
                    0 == scope.row.flowStatus
                      ? 'info'
                      : 1 == scope.row.flowStatus
                      ? 'success'
                      : 2 == scope.row.flowStatus
                      ? ''
                      : 3 == scope.row.flowStatus
                      ? 'warning'
                      : 4 == scope.row.flowStatus
                      ? 'danger'
                      : 5 == scope.row.flowStatus
                      ? 'danger'
                      : 'info'
                  "
                  size="small"
                >
                  {{
                    getEnumLabel(
                      attrLists.flowStatusOptions,
                      scope.row.flowStatus
                    )
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="flowTitle"
              label="审批标题"
              min-width="180"
              align="center"
              fixed="left"
            >
              <template #default="scope">
                <el-button
                  v-if="canPerform('query')"
                  type="primary"
                  link
                  @click="fun_detail(scope.row)"
                >
                  {{ scope.row.flowTitle || "-" }}
                </el-button>
                <span v-else>{{ scope.row.flowTitle || "-" }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="applicantName"
              label="姓名"
              min-width="130"
              align="center"
              fixed="left"
            >
              <template #default="scope">
                {{ scope.row.applicantName || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="idCardNo"
              label="身份证号"
              min-width="180"
              align="center"
              fixed="left"
            >
              <template #default="scope">
                {{ scope.row.idCardNo || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="contactPhone"
              label="手机号"
              min-width="130"
              align="center"
              fixed="left"
            >
              <template #default="scope">
                {{ scope.row.contactPhone || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="assignedUser"
              label="分配人"
              min-width="100"
              align="center"
              fixed="left"
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
            >
              <template #default="scope">
                {{ scope.row.applyPosition || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="interviewerDate"
              label="面试日期"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatDate(scope.row.interviewerDate) || "-" }}
              </template>
            </el-table-column>
            <!-- <el-table-column
              prop="interviewScore"
              label="面试得分"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ scope.row.interviewScore || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="isHired"
              label="是否通过"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ getEnumLabel(attrLists.isHiredOptions, scope.row.isHired) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="interviewEvaluationType"
              label="评估类型"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{
                  getEnumLabel(
                    attrLists.interviewEvaluationTypeOptions,
                    scope.row.interviewEvaluationType
                  )
                }}
              </template>
            </el-table-column>
            <el-table-column
              prop="testMethod"
              label="测试方式"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ getEnumLabel(attrLists.testMethodOptions, scope.row.testMethod) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="employmentType"
              label="用工性质"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{
                  getEnumLabel(attrLists.employmentTypeOptions, scope.row.employmentType)
                }}
              </template>
            </el-table-column>
            <el-table-column
              prop="interviewSuggestion"
              label="面试意见"
              min-width="150"
              align="center"
            >
              <template #default="scope">
                {{ scope.row.interviewSuggestion || "-" }}
              </template>
            </el-table-column> -->
            <el-table-column
              prop="createUser"
              label="创建人"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ scope.row.createUser || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              min-width="140"
              align="center"
            >
              <template #default="scope">
                {{ formatDate(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column
              label="审批操作"
              min-width="120"
              fixed="right"
              align="center"
            >
              <template #default="scope">
                <div class="btn-style">
                  <el-button
                    v-if="canPerform('query')"
                    type="primary"
                    link
                    size="small"
                    @click="fun_detail(scope.row)"
                    >查看
                  </el-button>
                  <el-button
                    v-if="canPerform('withdraw')"
                    type="primary"
                    link
                    size="small"
                    @click="fun_withdraw(scope.row)"
                    :disabled="!canWithdrawAudit(scope.row)"
                    :style="{
                      color: canWithdrawAudit(scope.row)
                        ? '#f56c6c'
                        : '#c0c4cc',
                    }"
                    >撤回
                  </el-button>
                  <!--                  <el-button-->
                  <!--                    type="primary"-->
                  <!--                    link-->
                  <!--                    size="small"-->
                  <!--                    @click="fun_delete(scope.row.id)"-->
                  <!--                    style="color: #f56c6c"-->
                  <!--                  >删除-->
                  <!--                  </el-button>-->
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-container">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="pageSizes"
            :total="dataTotal"
            hide-on-single-page
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>

      <el-dialog
        width="60%"
        v-model="detailDialogVisible"
        title="审批查看"
        destroy-on-close
        :close-on-click-modal="true"
        append-to-body
        class="approval-dialog"
      >
        <div
          v-loading="detailLoading"
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
                    {{ detailData.applicantName || "-" }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">身份证号</div>
                  <div class="info-value">{{ detailData.idCardNo || "-" }}</div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">手机号</div>
                  <div class="info-value">
                    {{ detailData.contactPhone || "-" }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">分配人</div>
                  <div class="info-value">
                    {{ detailData.assignedUser || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <div class="info-item">
                  <div class="info-label">应聘岗位</div>
                  <div class="info-value">
                    {{ detailData.applyPosition || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">面试日期</div>
                  <div class="info-value">
                    {{ formatDate(detailData.interviewerDate) || "-" }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">面试得分</div>
                  <div class="info-value">
                    {{ detailData.interviewScore || "-" }}
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
                      getEnumLabel(attrLists.isHiredOptions, detailData.isHired)
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
                        detailData.interviewEvaluationType
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
                        detailData.testMethod
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
                        detailData.employmentType
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
                    {{ detailData.interviewSuggestion || "-" }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">创建人</div>
                  <div class="info-value">
                    {{ detailData.createUser || "-" }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <div class="info-label">创建时间</div>
                  <div class="info-value">
                    {{ formatDate(detailData.createTime) || "-" }}
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
            <el-button @click="detailDialogVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
