<template>
  <div v-loading.lock="loading" class="root-container">
    <!-- 作用域插槽：筛选区域 -->
    <slot
      name="search-filter"
      :search-form="searchForm"
      :search-expanded="searchExpanded"
      :search-form-ref="searchFormRef"
      :search-form-rules="searchFormRules"
      :search-methods="searchMethods"
      :attrLists="attrLists"
      :regions-data="regionsData"
      :page-type="pageType"
    >
      <!-- 默认筛选区域 -->
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
                  <el-form-item label="系统状态" prop="auditStatus">
                    <el-select
                      v-model="searchForm.auditStatus"
                      placeholder="请选择系统状态"
                      clearable
                      class="search-select"
                      @change="fun_search($refs.searchFormRef)"
                    >
                      <el-option
                        v-for="item in dynamicStatusOptions"
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
                      @keypress.enter="fun_search($refs.searchFormRef)"
                    />
                  </el-form-item>
                  <el-form-item label="身份证号" prop="idCardNo">
                    <el-input
                      v-model="searchForm.idCardNo"
                      placeholder="请输入身份证号"
                      clearable
                      class="search-input"
                      maxlength="18"
                      @keypress.enter="fun_search($refs.searchFormRef)"
                    />
                  </el-form-item>
                  <el-form-item label="手机号" prop="contactPhone">
                    <el-input
                      v-model="searchForm.contactPhone"
                      placeholder="请输入手机号"
                      clearable
                      class="search-input"
                      maxlength="11"
                      @keypress.enter="fun_search($refs.searchFormRef)"
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
                      @keypress.enter="fun_search($refs.searchFormRef)"
                    />
                  </el-form-item>
                  <el-form-item label="分配人" prop="assignedUser">
                    <el-input
                      v-model="searchForm.assignedUser"
                      placeholder="请输入分配人"
                      clearable
                      class="search-input"
                      maxlength="20"
                      @keypress.enter="fun_search($refs.searchFormRef)"
                    />
                  </el-form-item>
                  <el-form-item label="性别" prop="gender">
                    <el-select
                      v-model="searchForm.gender"
                      placeholder="请选择性别"
                      clearable
                      class="search-select"
                      @change="fun_search($refs.searchFormRef)"
                    >
                      <el-option
                        v-for="item in attrLists.genderOptions"
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
                      @change="fun_search($refs.searchFormRef)"
                    >
                      <el-option
                        v-for="item in attrLists.educationLevelOptions"
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
                      @change="fun_search($refs.searchFormRef)"
                    >
                      <el-option
                        v-for="item in attrLists.politicalStatusOptions"
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
                      @change="fun_search($refs.searchFormRef)"
                    >
                      <el-option
                        v-for="item in attrLists.foreignLanguageLevelOptions"
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
                @click="fun_search($refs.searchFormRef)"
              >
                搜索
              </el-button>
              <el-button
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
    </slot>

    <!-- 作用域插槽：表格内容区域（包含操作按钮 + 表格 + 分页） -->
    <slot
      name="data-table"
      :tableData="pagedData"
      :currentPage="currentPage"
      :pageSize="pageSize"
      :pageSizes="pageSizes"
      :dataTotal="dataTotal"
      :tableConfig="tableConfig"
      :tableHelpers="tableHelpers"
      :tableActions="tableActions"
      :attachmentMethods="attachmentMethods"
      :searchMethods="searchMethods"
      :selectedRows="selectionRows"
      :dataMethods="dataMethods"
    >
      <!-- 默认表格内容区域 -->
      <div class="layout-content">
        <!-- 操作按钮区域 -->
        <div class="layout-actions">
          <div class="action-left">
            <el-button type="primary" :icon="Plus" @click="fun_create()">
              新增
            </el-button>
            <el-button :icon="Download" @click="fun_export()"> 导出 </el-button>
            <el-button
              type="danger"
              :icon="Delete"
              @click="fun_batchDelete()"
              :disabled="!selectionRows || selectionRows.length === 0"
            >
              删除
            </el-button>
            <el-button type="info" :icon="Refresh" @click="fun_recycleBin()">
              回收站
            </el-button>
          </div>
          <div
            class="action-right"
            v-if="selectionRows && selectionRows.length > 0"
          >
            <span class="selection-info"
              >已选中 {{ selectionRows.length }} 项</span
            >
          </div>
        </div>

        <!-- 表格区域 -->
        <div class="table-container">
          <el-table
            :data="pagedData"
            ref="dataTableRef"
            border
            stripe
            highlight-current-row
            row-key="id"
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
            <!--            <el-table-column-->
            <!--              prop="photoUrl"-->
            <!--              label="照片"-->
            <!--              min-width="80"-->
            <!--              align="center"-->
            <!--              fixed="left"-->
            <!--            >-->
            <!--              <template #default="scope">-->
            <!--                <el-avatar-->
            <!--                  v-if="scope.row.photoUrl"-->
            <!--                  :src="scope.row.photoUrl"-->
            <!--                  size="small"-->
            <!--                  shape="square"-->
            <!--                  style="cursor: pointer"-->
            <!--                  @click="handleTablePhotoPreview(scope.row.photoUrl)"-->
            <!--                />-->
            <!--                <span v-else>-</span>-->
            <!--              </template>-->
            <!--            </el-table-column>-->
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
                    getAuditStatusTagType(
                      scope.row.auditStatus.key,
                      currentPageType
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
                {{ formatDate(scope.row.availableDate) }}
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
                {{ formatDate(scope.row.birthDate) }}
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
                {{ formatDate(scope.row.assignedDate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="interviewerDate"
              label="面试日期"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatDate(scope.row.interviewerDate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="offerDate"
              label="录用日期"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatDate(scope.row.offerDate) }}
              </template>
            </el-table-column>
            <el-table-column
              label="数据操作"
              min-width="200"
              fixed="right"
              align="center"
            >
              <template #default="scope">
                <!-- 作用域插槽：业务操作列 -->
                <slot
                  name="business-actions"
                  :row="scope.row"
                  :index="scope.$index"
                  :table-actions="tableActions"
                  :attachment-methods="attachmentMethods"
                >
                  <!-- 默认业务操作列 -->
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
                </slot>
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
            @current-change="tableConfig.handleCurrentChange"
            @size-change="tableConfig.handleSizeChange"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>
    </slot>

    <!-- 新增/编辑应聘者弹框 -->
    <el-dialog
      width="80%"
      ref="elDialog"
      v-model="dataFormVisible"
      :title="dataFormTitle"
      :loading="dataFormLoading"
      destroy-on-close
    >
      <el-tabs
        v-model="activeTabName"
        type="border-card"
        @tab-click="
          (pane) => {
            if (pane.props && pane.props.name === 'attachments') {
              $nextTick(() => loadApplicantAttachments());
            }
          }
        "
      >
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            :disabled="dataFormStatus === 'detail'"
            ref="dataFormRef"
            :model="dataForm"
            :rules="dataFormRules"
            label-position="right"
            label-width="120px"
          >
            <!-- 第一行：姓名 + 身份证号 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="applicantName">
                  <el-input
                    v-model="dataForm.applicantName"
                    maxlength="20"
                    @input="syncSignatureWithName"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="身份证号" prop="idCardNo">
                  <el-input
                    v-model="dataForm.idCardNo"
                    maxlength="18"
                    @input="parseIdCard(dataForm.idCardNo)"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 第二行：应聘岗位 + 联系电话 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="应聘岗位" prop="applyPosition">
                  <el-input
                    v-model="dataForm.applyPositionName"
                    maxlength="200"
                    readonly
                    placeholder="请选择岗位"
                    @click="
                      positionSelectDialogVisible = true;
                      $nextTick(() => searchPositionList());
                    "
                  >
                    <template #append>
                      <el-button
                        type="primary"
                        @click="
                          positionSelectDialogVisible = true;
                          $nextTick(() => searchPositionList());
                        "
                        >选择</el-button
                      >
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="contactPhone">
                  <el-input v-model="dataForm.contactPhone" maxlength="11" />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 第三行：照片 + 性别和出生日期 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="照片" style="height: 90px">
                  <div
                    style="
                      display: flex;
                      align-items: flex-start;
                      gap: 10px;
                      height: 100%;
                    "
                  >
                    <!-- 照片上传区域 -->
                    <div style="position: relative; display: inline-block">
                      <input
                        ref="photoInput"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handleImageInputChange"
                        :disabled="dataFormStatus === 'detail'"
                      />
                      <el-avatar
                        v-if="currentPhotoUrl"
                        :src="currentPhotoUrl"
                        :size="80"
                        shape="square"
                        :style="{
                          cursor:
                            dataFormStatus === 'detail' ? 'default' : 'pointer',
                          border: '2px dashed #d9d9d9',
                          opacity: dataFormStatus === 'detail' ? 0.6 : 1,
                        }"
                        @click="
                          dataFormStatus !== 'detail' &&
                            $refs.photoInput.click()
                        "
                      />
                      <div
                        v-else
                        :style="{
                          width: '80px',
                          height: '80px',
                          border: '2px dashed #d9d9d9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor:
                            dataFormStatus === 'detail' ? 'default' : 'pointer',
                          color: '#8c939d',
                          opacity: dataFormStatus === 'detail' ? 0.6 : 1,
                        }"
                        @click="
                          dataFormStatus !== 'detail' &&
                            $refs.photoInput.click()
                        "
                      >
                        <i class="el-icon-plus" style="font-size: 24px"></i>
                      </div>
                    </div>

                    <!-- 预览按钮 - 垂直排列在右侧 -->
                    <div
                      v-if="currentPhotoUrl"
                      style="
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        height: 80px;
                      "
                    >
                      <el-button
                        type="primary"
                        size="small"
                        @click="handlePhotoPreview"
                        style="
                          writing-mode: vertical-rl;
                          text-orientation: mixed;
                          width: 28px;
                          height: 50px;
                          font-size: 11px;
                        "
                      >
                        预览
                      </el-button>
                    </div>

                    <!-- 待上传提示 -->
                    <div
                      v-if="pendingImageFile && !dataForm.id"
                      style="
                        color: #e6a23c;
                        font-size: 12px;
                        margin-left: 10px;
                        align-self: center;
                      "
                    >
                      <i class="el-icon-warning"></i> 待保存后上传
                    </div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- 右侧：性别和出生日期 垂直排列 -->
                <div
                  style="
                    height: 90px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                  "
                >
                  <el-form-item
                    label="性别"
                    prop="gender"
                    style="margin-bottom: 10px"
                  >
                    <el-radio-group v-model="dataForm.gender" :disabled="true">
                      <el-radio
                        v-for="item in attrLists.genderOptions"
                        :key="item.key"
                        :label="item.key"
                        >{{ item.value }}
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item
                    label="出生日期"
                    prop="birthDate"
                    style="margin-bottom: 0"
                  >
                    <el-date-picker
                      v-model="dataForm.birthDate"
                      type="date"
                      placeholder="通过身份证号自动识别"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                      :disabled="true"
                    />
                  </el-form-item>
                </div>
              </el-col>
            </el-row>

            <!-- 第四行：国籍 + 民族 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="国籍" prop="country">
                  <el-select
                    v-model="dataForm.country"
                    placeholder="请选择国家"
                  >
                    <el-option
                      v-for="item in attrLists.countryOptions"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="民族" prop="nation">
                  <el-select v-model="dataForm.nation" placeholder="请选择">
                    <el-option
                      v-for="item in attrLists.nationOptions"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 第五行：户口关系 + 政治面貌 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="户口关系" prop="householdRelation">
                  <el-select
                    v-model="dataForm.householdRelation"
                    placeholder="请选择户口关系"
                  >
                    <el-option
                      v-for="item in attrLists.householdRelationOptions"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="政治面貌" prop="politicalStatus">
                  <el-select
                    v-model="dataForm.politicalStatus"
                    placeholder="请选择政治面貌"
                  >
                    <el-option
                      v-for="item in attrLists.politicalStatusOptions"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 第六行：婚否 + 血型 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="婚否" prop="maritalStatus">
                  <el-select
                    v-model="dataForm.maritalStatus"
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in attrLists.maritalStatusOptions"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="血型" prop="bloodType">
                  <el-select v-model="dataForm.bloodType" placeholder="请选择">
                    <el-option
                      v-for="item in attrLists.bloodTypeOptions"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 第七行：身高 + 体重 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="身高(厘米)" prop="height">
                  <el-input-number
                    v-model="dataForm.height"
                    :min="0"
                    :max="300"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="体重(公斤)" prop="weight">
                  <el-input-number
                    v-model="dataForm.weight"
                    :min="0"
                    :max="300"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 第八行：视力左 + 视力右 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="视力左" prop="visionLeft">
                  <el-input v-model="dataForm.visionLeft" maxlength="10" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="视力右" prop="visionRight">
                  <el-input v-model="dataForm.visionRight" maxlength="10" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 第九行：职称 + 外语等级 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="职称" prop="professionalTitle">
                  <el-input
                    v-model="dataForm.professionalTitle"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="外语等级" prop="foreignLanguageLevel">
                  <el-select
                    v-model="dataForm.foreignLanguageLevel"
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in attrLists.foreignLanguageLevelOptions"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 第十行：可报道时间 + 是否退伍军人 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="可报道时间" prop="availableDate">
                  <el-date-picker
                    v-model="dataForm.availableDate"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否退伍军人" prop="isVeteran">
                  <el-radio-group
                    v-model="dataForm.isVeteran"
                    @change="handleVeteranStatusChange"
                  >
                    <el-radio
                      v-for="item in attrLists.isVeteranOptions"
                      :key="item.key"
                      :label="item.key"
                      >{{ item.value }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 第十一行：退役时间 + 退役编号 (条件显示) -->
            <el-row :gutter="20" v-if="dataForm.isVeteran == 1">
              <el-col :span="12">
                <el-form-item label="退役时间" prop="dischargeDate">
                  <el-date-picker
                    v-model="dataForm.dischargeDate"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="退役编号" prop="dischargeCertNo">
                  <el-input v-model="dataForm.dischargeCertNo" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 第十二行：籍贯 -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="籍贯">
                  <div class="address-input-group" v-if="dataForm.nativePlace">
                    <!-- 省市县级联选择器 -->
                    <div class="address-cascader">
                      <el-cascader
                        v-model="dataForm.nativePlace.region"
                        :options="regionsData"
                        :props="cascaderProps"
                        :filter-method="filterRegionMethod"
                        filterable
                        clearable
                        placeholder="请选择省市县"
                        style="width: 300px"
                        @change="
                          (value) => handleRegionChange(value, 'nativePlace')
                        "
                      />
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 第十三行：户口所在地 -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="户口所在地">
                  <div
                    class="address-input-group"
                    v-if="dataForm.householdRegister"
                  >
                    <!-- 省市县级联选择器 -->
                    <div class="address-cascader">
                      <el-cascader
                        v-model="dataForm.householdRegister.region"
                        :options="regionsData"
                        :props="cascaderProps"
                        :filter-method="filterRegionMethod"
                        filterable
                        clearable
                        placeholder="请选择省市县"
                        style="width: 300px"
                        @change="
                          (value) =>
                            handleRegionChange(value, 'householdRegister')
                        "
                      />
                    </div>
                    <!-- 详细地址输入 -->
                    <div class="address-detail">
                      <el-input
                        v-model="dataForm.householdRegister.street"
                        placeholder="乡(街道)"
                        maxlength="30"
                        style="width: 150px; margin-left: 10px"
                      />
                      <el-input
                        v-model="dataForm.householdRegister.police"
                        placeholder="派出所"
                        maxlength="30"
                        style="width: 150px; margin-left: 10px"
                      />
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 第十四行：现家庭住址 -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="现家庭住址">
                  <div class="address-input-group" v-if="dataForm.homeAddress">
                    <!-- 省市县级联选择器 -->
                    <div class="address-cascader">
                      <el-cascader
                        v-model="dataForm.homeAddress.region"
                        :options="regionsData"
                        :props="cascaderProps"
                        :filter-method="filterRegionMethod"
                        filterable
                        clearable
                        placeholder="请选择省市县"
                        style="width: 300px"
                        @change="
                          (value) => handleRegionChange(value, 'homeAddress')
                        "
                      />
                    </div>
                    <!-- 详细地址输入 -->
                    <div class="address-detail">
                      <el-input
                        v-model="dataForm.homeAddress.street"
                        placeholder="乡(街道)"
                        maxlength="30"
                        style="width: 150px; margin-left: 10px"
                      />
                      <el-input
                        v-model="dataForm.homeAddress.village"
                        placeholder="村(路)"
                        maxlength="30"
                        style="width: 150px; margin-left: 10px"
                      />
                      <el-input
                        v-model="dataForm.homeAddress.number"
                        placeholder="号"
                        maxlength="20"
                        style="width: 100px; margin-left: 10px"
                      />
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 工作经历 -->
        <el-tab-pane label="工作经历" name="work">
          <div class="sub-table-toolbar">
            <el-button
              type="primary"
              size="small"
              @click="addWorkExperience"
              :disabled="dataFormStatus === 'detail'"
              >新增工作经历
            </el-button>
          </div>
          <el-table
            :data="workExperienceList"
            border
            :disabled="dataFormStatus === 'detail'"
          >
            <el-table-column
              prop="startDate"
              label="开始时间"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatMonth(scope.row.startDate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="endDate"
              label="结束时间"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatMonth(scope.row.endDate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="companyName"
              label="曾工作单位（全称）"
              min-width="200"
            />
            <el-table-column prop="position" label="职务" min-width="120" />
            <el-table-column
              prop="businessScope"
              label="负责业务范围"
              min-width="200"
            />
            <el-table-column
              prop="referencePerson"
              label="证明人"
              min-width="100"
            />
            <el-table-column
              prop="referenceContact"
              label="证明人的联系方式"
              min-width="150"
            />
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="editWorkExperience(scope.row, scope.$index)"
                  >编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="deleteWorkExperience(scope.$index)"
                  style="color: #f56c6c"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 培训经历 -->
        <el-tab-pane label="培训经历" name="training">
          <div class="sub-table-toolbar">
            <el-button
              type="primary"
              size="small"
              @click="addTraining"
              :disabled="dataFormStatus === 'detail'"
              >新增培训经历
            </el-button>
          </div>
          <el-table
            :data="trainingList"
            border
            :disabled="dataFormStatus === 'detail'"
          >
            <el-table-column
              prop="startDate"
              label="开始时间"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatMonth(scope.row.startDate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="endDate"
              label="结束时间"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatMonth(scope.row.endDate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="trainingName"
              label="受何培训（或培训名称）"
              min-width="200"
            />
            <el-table-column
              prop="qualification"
              label="获得何资格/技能等级"
              min-width="200"
            />
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="editTraining(scope.row, scope.$index)"
                  >编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="deleteTraining(scope.$index)"
                  style="color: #f56c6c"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 家庭情况 -->
        <el-tab-pane label="家庭情况" name="family">
          <div class="sub-table-toolbar">
            <el-button
              type="primary"
              size="small"
              @click="addFamily"
              :disabled="dataFormStatus === 'detail'"
              >新增家庭成员
            </el-button>
          </div>
          <el-table
            :data="familyList"
            border
            :disabled="dataFormStatus === 'detail'"
          >
            <el-table-column prop="name" label="姓名" min-width="120" />
            <el-table-column label="与本人关系" min-width="120" align="center">
              <template #default="scope">
                {{
                  scope.row.relationship
                    ? scope.row.relationship.value || scope.row.relationship
                    : "-"
                }}
              </template>
            </el-table-column>
            <el-table-column
              prop="age"
              label="年龄"
              min-width="80"
              align="center"
            />
            <el-table-column prop="workUnit" label="工作单位" min-width="200" />
            <el-table-column
              prop="contactPhone"
              label="联系电话"
              min-width="130"
            />
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="editFamily(scope.row, scope.$index)"
                  >编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="deleteFamily(scope.$index)"
                  style="color: #f56c6c"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 学习经历 -->
        <el-tab-pane label="学习经历" name="education">
          <div class="sub-table-toolbar">
            <el-button
              type="primary"
              size="small"
              @click="addEducation"
              :disabled="dataFormStatus === 'detail'"
              >新增学习经历
            </el-button>
          </div>
          <el-table
            :data="educationList"
            border
            :disabled="dataFormStatus === 'detail'"
          >
            <el-table-column
              prop="startDate"
              label="开始时间"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatMonth(scope.row.startDate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="endDate"
              label="结束时间"
              min-width="120"
              align="center"
            >
              <template #default="scope">
                {{ formatMonth(scope.row.endDate) }}
              </template>
            </el-table-column>
            <el-table-column label="学历" min-width="100" align="center">
              <template #default="scope">
                {{
                  scope.row.educationLevel
                    ? scope.row.educationLevel.value
                    : "-"
                }}
              </template>
            </el-table-column>
            <el-table-column
              prop="schoolName"
              label="学校名称"
              min-width="200"
            />
            <el-table-column prop="major" label="专业" min-width="150" />
            <el-table-column label="院校类别" min-width="150" align="center">
              <template #default="scope">
                {{
                  scope.row.schoolNature ? scope.row.schoolNature.value : "-"
                }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="editEducation(scope.row, scope.$index)"
                  >编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="deleteEducation(scope.$index)"
                  style="color: #f56c6c"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 病史类别 -->
        <el-tab-pane label="病史类别" name="medical">
          <el-form
            label-position="right"
            label-width="120px"
            :disabled="dataFormStatus === 'detail'"
          >
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="☆ 过去史：">
                  <div class="medical-history-options">
                    <el-checkbox
                      v-model="dataForm.pastHistory.infectious"
                      label="传染病"
                      >传染病
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.pastHistory.allergy"
                      label="过敏史"
                      >过敏史
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.pastHistory.surgery"
                      label="手术史"
                      >手术史
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.pastHistory.other"
                      label="其它"
                      >其 它
                    </el-checkbox>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="☆ 现在史：">
                  <div class="medical-history-options">
                    <el-checkbox
                      v-model="dataForm.currentHistory.disability"
                      label="残疾"
                      >残 疾
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.currentHistory.mental"
                      label="心理病"
                      >心理病
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.currentHistory.colorBlind"
                      label="色盲"
                      >色 盲
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.currentHistory.acrophobia"
                      label="恐高"
                      >恐 高
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.currentHistory.altitudeSick"
                      label="晕高"
                      >晕 高
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.currentHistory.epilepsy"
                      label="癫痫"
                      >癫 痫
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.currentHistory.other"
                      label="其它"
                      >其 它
                    </el-checkbox>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="☆ 家族史：">
                  <div class="medical-history-options">
                    <el-checkbox
                      v-model="dataForm.familyHistory.heart"
                      label="心脏病"
                      >心脏病
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.familyHistory.hypertension"
                      label="高血压"
                      >高血压
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.familyHistory.diabetes"
                      label="糖尿病"
                      >糖尿病
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.familyHistory.other"
                      label="其它"
                      >其 它
                    </el-checkbox>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="☆ 职业史：">
                  <div class="medical-history-options">
                    <el-checkbox
                      v-model="dataForm.occupationalHistory.ent"
                      label="耳鼻喉"
                      >耳鼻喉
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.occupationalHistory.organ"
                      label="肺肝腰"
                      >肺肝腰
                    </el-checkbox>
                    <el-checkbox
                      v-model="dataForm.occupationalHistory.other"
                      label="其它"
                      >其 它
                    </el-checkbox>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="☆ 其他史：">
                  <div class="medical-history-options">
                    <el-input
                      v-model="dataForm.otherHistory"
                      placeholder="若没有，请填写“无”"
                      class="other-history-input"
                      style="margin-bottom: 10px"
                    />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="☆ 无病史声明：">
                  <div class="medical-history-options">
                    <el-input
                      v-model="dataForm.noHistoryStatement"
                      placeholder="无病史需手写：本人无任何病史"
                      class="other-history-input"
                    />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 附件信息 -->
        <el-tab-pane label="附件信息" name="attachments">
          <el-form label-position="right" label-width="160px">
            <!-- 附件信息表格化 -->
            <div class="sub-table-toolbar" style="margin-bottom: 10px">
              <el-button
                type="success"
                size="small"
                @click="downloadBatchAttachments(dataForm.id)"
                :disabled="!dataForm.id"
                >一键下载
              </el-button>
            </div>
            <el-table :data="attachmentTableData" border>
              <el-table-column
                prop="typeLabel"
                label="附件类型"
                min-width="140"
              />
              <el-table-column label="状态" min-width="100" align="center">
                <template #default="scope">
                  <span
                    :class="getAttachmentStatusClass(scope.row.bizKey)"
                    class="attachment-status"
                  >
                    {{ getAttachmentStatusText(scope.row.bizKey) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="附件下载" min-width="100" align="center">
                <template #default="scope">
                  <el-button
                    type="success"
                    size="small"
                    @click="
                      downloadSingleAttachment(
                        scope.row.attachmentId,
                        scope.row.attachmentName || scope.row.downloadName
                      )
                    "
                    :disabled="!scope.row.hasAttachment"
                    >下载
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column label="附件上传" min-width="160" align="center">
                <template #default="scope">
                  <input
                    type="file"
                    :ref="scope.row.inputRef"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    style="display: none"
                    @change="(e) => handleCustomUpload(e, scope.row.bizKey)"
                    :disabled="dataFormStatus === 'detail'"
                  />
                  <el-button
                    :type="scope.row.hasAttachment ? 'warning' : 'primary'"
                    size="small"
                    @click="$refs[scope.row.inputRef].click()"
                    :disabled="dataFormStatus === 'detail'"
                  >
                    {{ scope.row.hasAttachment ? "替换" : "上传" }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column label="附件操作" min-width="120" align="center">
                <template #default="scope">
                  <el-button
                    type="danger"
                    size="small"
                    @click="deleteAttachmentRecord(scope.row.attachmentId)"
                    :disabled="
                      !scope.row.hasAttachment || dataFormStatus === 'detail'
                    "
                    >删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </el-tab-pane>

        <!-- 备注 -->
        <el-tab-pane label="备注" name="remarks">
          <el-form
            label-position="right"
            label-width="120px"
            :disabled="dataFormStatus === 'detail'"
          >
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="应聘途径">
                  <el-checkbox-group v-model="dataForm.applicationChannels">
                    <el-checkbox label="网站">网站</el-checkbox>
                    <el-checkbox label="微信">微信</el-checkbox>
                    <el-checkbox label="朋友推荐">朋友推荐</el-checkbox>
                    <el-checkbox label="社会招聘会">社会招聘会</el-checkbox>
                    <el-checkbox label="校园招聘会">校园招聘会</el-checkbox>
                    <el-checkbox label="其他">其他</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="是否同意轮班">
                  <el-radio-group v-model="dataForm.agreeShiftWork">
                    <el-radio
                      v-for="item in attrLists.agreeShiftWorkOptions"
                      :key="item.key"
                      :label="item.key"
                      >{{ item.value }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否需要住宿">
                  <el-radio-group v-model="dataForm.needAccommodation">
                    <el-radio
                      v-for="item in attrLists.needAccommodationOptions"
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
                <el-form-item label="住宿说明">
                  <div class="accommodation-note">
                    因宿舍房间有限，恕无法保证均能获得分配。
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 申明 -->
        <el-tab-pane label="申明" name="declaration">
          <el-form
            label-position="right"
            label-width="120px"
            :disabled="dataFormStatus === 'detail'"
          >
            <el-row>
              <el-col :span="24">
                <el-form-item label="声明内容">
                  <div class="declaration-content">
                    <p>
                      本人声明上述资料所填皆属真实、准确，且本人无吸毒、偷盗、赌博、扰乱公共秩序等行为，如有查证必要时，本人授权同意山西晋城钢铁控股集团有限公司依据个人信息保护法之规定，向相关单位、部门或公司查询本人之相关资料，如有不实，本人愿意接受（不雇佣）之处理。
                    </p>
                    <p>
                      若经贵公司录用，悉接受分发工作单位绝无异议，入职后同意缴纳社会保险，且于报到后若有发现体检表上所未记载而属不适应工作之疾病，愿即接受（不雇用）之处理。
                    </p>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="本人签字">
                  <el-input
                    v-model="dataForm.signature"
                    placeholder="自动填写，与姓名保持一致"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="填表时间">
                  <el-date-picker
                    v-model="dataForm.fillDate"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dataFormVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="fun_save()"
            v-if="dataFormStatus !== 'detail'"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 工作经历弹框 -->
    <el-dialog
      width="800px"
      v-model="workExperienceDialogVisible"
      :title="workExperienceDialogTitle"
    >
      <el-form
        ref="workExperienceFormRef"
        :model="workExperienceForm"
        :rules="workExperienceFormRules"
        label-width="180px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="workExperienceForm.startDate"
                type="month"
                placeholder="选择开始月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endDate">
              <el-date-picker
                v-model="workExperienceForm.endDate"
                type="month"
                placeholder="选择结束月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="曾工作单位（全称）" prop="companyName">
              <el-input
                v-model="workExperienceForm.companyName"
                placeholder="请输入曾工作单位（全称）"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="职务" prop="position">
              <el-input
                v-model="workExperienceForm.position"
                placeholder="请输入职务"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="负责业务范围" prop="businessScope">
              <el-input
                v-model="workExperienceForm.businessScope"
                type="textarea"
                :rows="3"
                placeholder="请输入负责业务范围"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="证明人" prop="referencePerson">
              <el-input
                v-model="workExperienceForm.referencePerson"
                placeholder="请输入证明人"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证明人的联系方式" prop="referenceContact">
              <el-input
                v-model="workExperienceForm.referenceContact"
                placeholder="请输入证明人的联系方式"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="workExperienceDialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="saveWorkExperience()"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 培训经历弹框 -->
    <el-dialog
      width="800px"
      v-model="trainingDialogVisible"
      :title="trainingDialogTitle"
    >
      <el-form
        ref="trainingFormRef"
        :model="trainingForm"
        :rules="trainingFormRules"
        label-width="180px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="trainingForm.startDate"
                type="month"
                placeholder="选择开始月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endDate">
              <el-date-picker
                v-model="trainingForm.endDate"
                type="month"
                placeholder="选择结束月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="受何培训（或培训名称）" prop="trainingName">
              <el-input
                v-model="trainingForm.trainingName"
                placeholder="请输入受何培训（或培训名称）"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="获得何资格/技能等级" prop="qualification">
              <el-input
                v-model="trainingForm.qualification"
                type="textarea"
                :rows="3"
                placeholder="请输入获得的资格或技能等级"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="trainingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTraining()">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 家庭情况弹框 -->
    <el-dialog
      width="800px"
      v-model="familyDialogVisible"
      :title="familyDialogTitle"
    >
      <el-form
        ref="familyFormRef"
        :model="familyForm"
        :rules="familyFormRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="familyForm.name"
                placeholder="请输入姓名"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="与本人关系" prop="relationship">
              <el-select
                v-model="familyForm.relationship"
                placeholder="请选择与本人关系"
              >
                <el-option
                  v-for="item in attrLists.relationshipOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number
                v-model="familyForm.age"
                :min="0"
                :max="150"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input
                v-model="familyForm.contactPhone"
                placeholder="请输入联系电话"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="工作单位" prop="workUnit">
              <el-input
                v-model="familyForm.workUnit"
                placeholder="请输入工作单位"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="familyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveFamily()">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 学习经历弹框 -->
    <el-dialog
      width="800px"
      v-model="educationDialogVisible"
      :title="educationDialogTitle"
    >
      <el-form
        ref="educationFormRef"
        :model="educationForm"
        :rules="educationFormRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="educationForm.startDate"
                type="month"
                placeholder="选择开始月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endDate">
              <el-date-picker
                v-model="educationForm.endDate"
                type="month"
                placeholder="选择结束月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="学历" prop="educationLevel">
              <el-select
                v-model="educationForm.educationLevel"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in attrLists.educationLevelOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="学校名称" prop="schoolName">
              <el-input
                v-model="educationForm.schoolName"
                placeholder="请输入学校名称"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="专业" prop="major">
              <el-input
                v-model="educationForm.major"
                placeholder="请输入专业"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="院校类别" prop="schoolNature">
              <el-select
                v-model="educationForm.schoolNature"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in attrLists.schoolNatureOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="educationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEducation()">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 回收站弹框 -->
    <el-dialog
      width="90%"
      v-model="recycleBinDialogVisible"
      title="回收站"
      destroy-on-close
      :close-on-click-modal="true"
      :before-close="handleDialogClose"
      append-to-body
    >
      <!-- 回收站筛选区域 -->
      <div class="recycle-search-area">
        <el-form
          ref="recycleSearchFormRef"
          :model="recycleSearchForm"
          :inline="true"
        >
          <el-form-item label="姓名" prop="applicantName">
            <el-input
              v-model="recycleSearchForm.applicantName"
              placeholder="请输入应聘者姓名"
              clearable
              class="search-input"
              maxlength="20"
            />
          </el-form-item>
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input
              v-model="recycleSearchForm.contactPhone"
              placeholder="请输入联系电话"
              clearable
              class="search-input"
              maxlength="11"
            />
          </el-form-item>
          <el-form-item label="身份证号" prop="idCardNo">
            <el-input
              v-model="recycleSearchForm.idCardNo"
              placeholder="请输入身份证号"
              clearable
              class="search-input"
              maxlength="18"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="Search"
              @click="fun_recycleSearch()"
              >搜索
            </el-button>
            <el-button :icon="Refresh" @click="fun_recycleReset()"
              >重置</el-button
            >
          </el-form-item>
        </el-form>
      </div>

      <!-- 回收站批量操作 -->
      <div class="recycle-actions">
        <el-button
          :icon="Refresh"
          type="info"
          @click="fun_recycleBatchRestore"
          :disabled="!recycleSelectedCount || recycleSelectedCount === 0"
          >还原</el-button
        >
        <el-button
          :icon="Delete"
          type="danger"
          @click="fun_recycleBatchTruncate"
          :disabled="!recycleSelectedCount || recycleSelectedCount === 0"
          >彻底删除</el-button
        >
      </div>

      <!-- 回收站表格 -->
      <div class="recycle-table-container">
        <el-table
          v-loading="recycleLoading"
          :data="recyclePagedData"
          border
          stripe
          highlight-current-row
          row-key="id"
          ref="recycleTableRef"
          @selection-change="handleRecycleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="recycleSelectionSelectable"
          />
          <el-table-column
            prop="applicantName"
            label="姓名"
            min-width="120"
            align="center"
            fixed="left"
          />
          <!--          <el-table-column
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
                @click="handleTablePhotoPreview(scope.row.photoUrl)"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>-->
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
              {{ formatDate(scope.row.birthDate) }}
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
            min-width="180"
            align="center"
          >
            <template #default="scope">
              {{ scope.row.idCardNo }}
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
            prop="applyPosition"
            label="应聘岗位"
            min-width="400"
            align="center"
          />
          <el-table-column
            label="操作"
            min-width="220"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                @click="fun_recycleDetail(scope.row)"
                >详情
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="fun_restore(scope.row.id)"
                style="color: #67c23a"
                >还原
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="fun_truncate(scope.row.id)"
                style="color: #f56d6c"
                >彻底删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 回收站分页 -->
      <div class="recycle-pagination-container">
        <el-pagination
          :current-page="recycleCurrentPage"
          :page-size="recyclePageSize"
          :page-sizes="recyclePageSizes"
          :total="recycleDataTotal"
          hide-on-single-page
          @current-change="handleRecycleCurrentChange"
          @size-change="handleRecycleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-dialog>

    <!-- 岗位选择弹窗 -->
    <el-dialog
      width="80%"
      v-model="positionSelectDialogVisible"
      title="选择岗位"
      destroy-on-close
    >
      <!-- 筛选区域 -->
      <el-form
        ref="positionSearchFormRef"
        :model="positionSearchForm"
        :inline="true"
      >
        <el-form-item label="部门名称">
          <el-input
            v-model="positionSearchForm.deptName"
            placeholder="请输入部门名称"
            clearable
            maxlength="50"
            @keyup.enter="searchPositionList"
          />
        </el-form-item>
        <el-form-item label="部门编码">
          <el-input
            v-model="positionSearchForm.deptNo"
            placeholder="请输入部门编码"
            clearable
            maxlength="20"
            @keyup.enter="searchPositionList"
          />
        </el-form-item>
        <el-form-item label="岗位名称">
          <el-input
            v-model="positionSearchForm.positionName"
            placeholder="请输入岗位名称"
            clearable
            maxlength="50"
            @keyup.enter="searchPositionList"
          />
        </el-form-item>
        <el-form-item label="岗位编码">
          <el-input
            v-model="positionSearchForm.positionNo"
            placeholder="请输入岗位编码"
            clearable
            maxlength="20"
            @keyup.enter="searchPositionList"
          />
        </el-form-item>
        <el-form-item label="是否开放">
          <el-radio-group
            v-model="positionSearchForm.openFlag"
            @change="searchPositionList"
          >
            <el-radio value="Y">是</el-radio>
            <el-radio value="N">否</el-radio>
            <el-radio value="">全部</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="searchPositionList"
            >搜索</el-button
          >
          <el-button :icon="Refresh" @click="resetPositionSearch"
            >重置</el-button
          >
        </el-form-item>
      </el-form>

      <!-- 部门列表表格 -->
      <el-table
        :data="
          positionList.slice(
            (positionCurrentPage - 1) * positionPageSize,
            positionCurrentPage * positionPageSize
          )
        "
        border
        stripe
        highlight-current-row
        @current-change="handlePositionRowChange"
      >
        <el-table-column
          prop="deptName"
          label="部门名称"
          min-width="180"
          align="center"
        />
        <el-table-column
          prop="deptNo"
          label="部门编码"
          min-width="130"
          align="center"
        />
        <el-table-column
          prop="positionName"
          label="岗位名称"
          min-width="300"
          align="center"
        />
        <el-table-column
          prop="positionNo"
          label="岗位编码"
          min-width="150"
          align="center"
        />
        <el-table-column
          prop="openFlag"
          label="是否开放"
          min-width="120"
          align="center"
        />
      </el-table>
      <!-- 分页 -->
      <el-pagination
        :current-page="positionCurrentPage"
        :page-size="positionPageSize"
        :page-sizes="positionPageSizes"
        :total="positionTotal"
        hide-on-single-page
        @current-change="handlePositionCurrentChange"
        @size-change="handlePositionSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
      />

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="positionSelectDialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="confirmPositionSelection"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 图片预览组件 -->
    <div
      v-if="dialogVisible"
      class="custom-image-preview"
      @click="closePhotoPreview"
    >
      <img :src="dialogImageUrl" alt="预览" @click.stop />
    </div>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
