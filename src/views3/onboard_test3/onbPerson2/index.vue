<template>
  <!-- 子组件：OnbApplicant -->
  <OnbApplicant ref="applicantRef" :page-type="1">
    <!-- 使用 search-filter 插槽：筛选区域 -->
    <template
      #search-filter="{
        searchForm,
        searchExpanded,
        searchFormRules,
        searchMethods,
        attrLists,
      }"
    >
      <!-- 筛选区域 -->
      <div class="layout-search">
        <el-form
          ref="searchFormRef"
          :model="searchForm"
          :rules="searchFormRules"
          :inline="true"
        >
          <!-- 顶部两块：左侧(所有筛选) + 右侧(操作区) -->
          <div class="search-top-layout">
            <div class="search-left">
              <div class="search-filters-grid">
                <!-- 第1行：始终显示的字段 -->
                <div class="filter-row">
                  <el-form-item label="审核状态" prop="auditStatus">
                    <el-select
                      v-model="searchForm.auditStatus"
                      placeholder="请选择审核状态"
                      clearable
                      class="search-select"
                    >
                      <el-option
                        v-for="item in attrLists.dynamicStatusOptions || []"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="姓名" prop="applicantName">
                    <el-input
                      v-model="searchForm.applicantName"
                      placeholder="请输入应聘者姓名"
                      clearable
                      class="search-input"
                      maxlength="20"
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
                  <el-form-item label="身份证号" prop="idCardNo">
                    <el-input
                      v-model="searchForm.idCardNo"
                      placeholder="请输入身份证号"
                      clearable
                      class="search-input"
                      maxlength="18"
                    />
                  </el-form-item>
                </div>

                <!-- 第2行：应聘岗位、分配人、性别、最高学历 -->
                <div class="filter-row" v-show="searchExpanded">
                  <el-form-item label="应聘岗位" prop="applyPosition">
                    <el-input
                      v-model="searchForm.applyPosition"
                      placeholder="请输入应聘岗位"
                      clearable
                      class="search-input"
                      maxlength="50"
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
                  <el-form-item label="性别" prop="gender">
                    <el-select
                      v-model="searchForm.gender"
                      placeholder="请选择性别"
                      clearable
                      class="search-select"
                    >
                      <el-option
                        v-for="item in attrLists.genderOptions || []"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="最高学历" prop="highestEducationLevel">
                    <el-select
                      v-model="searchForm.highestEducationLevel"
                      placeholder="请选择最高学历"
                      clearable
                      class="search-select"
                    >
                      <el-option
                        v-for="item in attrLists.educationLevelOptions || []"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key"
                      />
                    </el-select>
                  </el-form-item>
                </div>

                <!-- 第3行：政治面貌、外语等级、出生日期、报到日期 -->
                <div class="filter-row" v-show="searchExpanded">
                  <el-form-item label="政治面貌" prop="politicalStatus">
                    <el-select
                      v-model="searchForm.politicalStatus"
                      placeholder="请选择政治面貌"
                      clearable
                      class="search-select"
                    >
                      <el-option
                        v-for="item in attrLists.politicalStatusOptions || []"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="外语等级" prop="foreignLanguageLevel">
                    <el-select
                      v-model="searchForm.foreignLanguageLevel"
                      placeholder="请选择外语等级"
                      clearable
                      class="search-select"
                    >
                      <el-option
                        v-for="item in attrLists.foreignLanguageLevelOptions ||
                        []"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="出生日期" prop="birthDate">
                    <el-date-picker
                      v-model="searchForm.birthDate"
                      type="month"
                      placeholder="请选择出生日期"
                      format="YYYY-MM"
                      value-format="YYYY-MM-DD"
                      class="search-monthpicker"
                    />
                  </el-form-item>
                  <el-form-item label="报到日期" prop="availableDateRange">
                    <el-date-picker
                      v-model="searchForm.availableDateRange"
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

                <!-- 第4行：分配日期、面试日期（只有2个控件，右侧留空） -->
                <div class="filter-row" v-show="searchExpanded">
                  <el-form-item label="分配日期" prop="assignedDateRange">
                    <el-date-picker
                      v-model="searchForm.assignedDateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      class="search-datepicker"
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
                  <!-- 空位占位 -->
                  <div class="filter-placeholder"></div>
                  <div class="filter-placeholder"></div>
                </div>
              </div>
            </div>
            <div class="search-right">
              <el-button
                type="primary"
                :icon="Search"
                @click="searchMethods.handleSearch"
                >搜索
              </el-button>
              <el-button :icon="Refresh" @click="searchMethods.handleReset"
                >重置</el-button
              >
              <div
                class="search-toggle-button"
                @click="searchMethods.toggleSearchExpanded"
              >
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
    </template>

    <!-- 使用 data-table 插槽：表格内容区域 -->
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
        selectedRows,
      }"
    >
      <!-- 完整的表格内容区域 -->
      <div class="layout-content">
        <!-- 操作按钮区域 -->
        <div class="layout-actions">
          <div class="action-left">
            <el-button
              type="primary"
              :icon="Plus"
              @click="tableActions.handleCreate"
              >新增
            </el-button>
            <el-button :icon="Download" @click="fun_export()">导出</el-button>
            <el-button
              type="danger"
              :icon="Delete"
              @click="fun_batchDelete()"
              :disabled="!selectedRows || selectedRows.length === 0"
            >
              删除
            </el-button>

            <el-button type="info" :icon="Refresh" @click="fun_recycleBin()"
              >回收站</el-button
            >
          </div>
          <div
            class="action-right"
            v-if="selectedRows && selectedRows.length > 0"
          >
            <span class="selection-info"
              >已选中 {{ selectedRows.length }} 项</span
            >
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
                <span v-else>-</span>
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
                {{ scope.row.gender ? scope.row.gender.value : "-" }}
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

            <!-- 数据操作列：复用 onbApplicant 的操作方法 -->
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
                >
                  详情
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="tableActions.handleUpdate(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="tableActions.handleDelete(scope.row)"
                  style="color: #f56c6c"
                >
                  删除
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
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
