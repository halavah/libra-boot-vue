<template>
  <div v-loading.lock="loading" class="root-container">
    <!-- 筛选区 -->
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
                <el-form-item label="部门名称" prop="deptName">
                  <el-input
                    v-model="searchForm.deptName"
                    placeholder="请输入部门名称"
                    clearable
                    class="search-input"
                    maxlength="50"
                    @keyup.enter="fun_search($refs.searchFormRef)"
                  />
                </el-form-item>
                <el-form-item label="部门编码" prop="deptNo">
                  <el-input
                    v-model="searchForm.deptNo"
                    placeholder="请输入部门编码"
                    clearable
                    class="search-input"
                    maxlength="20"
                    @keyup.enter="fun_search($refs.searchFormRef)"
                  />
                </el-form-item>
                <el-form-item label="岗位名称" prop="positionName">
                  <el-input
                    v-model="searchForm.positionName"
                    placeholder="请输入岗位名称"
                    clearable
                    class="search-input"
                    maxlength="20"
                    @keyup.enter="fun_search($refs.searchFormRef)"
                  />
                </el-form-item>
                <el-form-item label="岗位编码" prop="positionNo">
                  <el-input
                    v-model="searchForm.positionNo"
                    placeholder="请输入岗位编码"
                    clearable
                    class="search-input"
                    maxlength="20"
                    @keyup.enter="fun_search($refs.searchFormRef)"
                  />
                </el-form-item>
              </div>
              <div
                class="filter-row expanded-filter-rows"
                v-show="searchExpanded"
              >
                <el-form-item label="是否开放" prop="openFlag">
                  <el-radio-group
                    v-model="searchForm.openFlag"
                    @change="fun_search($refs.searchFormRef)"
                  >
                    <el-radio label="">全部</el-radio>
                    <el-radio label="Y">是</el-radio>
                    <el-radio label="N">否</el-radio>
                  </el-radio-group>
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

    <!-- 表格及操作区 -->
    <div class="layout-content">
      <div class="search-buttons">
        <el-button type="primary" :icon="Plus" @click="fun_create()"
          >新增</el-button
        >
        <el-button plain :icon="Download" @click="fun_export()">导出</el-button>
        <el-button
          type="success"
          :icon="CirclePlus"
          @click="fun_open()"
          :disabled="isSelectionEmpty"
          >启用</el-button
        >
        <el-button
          type="warning"
          :icon="CircleClose"
          @click="fun_close()"
          :disabled="isSelectionEmpty"
          >禁用</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          @click="fun_batchDelete()"
          :disabled="isSelectionEmpty"
          >删除</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          ref="dataTableRef"
          :data="paginatedData"
          border
          stripe
          highlight-current-row
          row-key="id"
          :reserve-selection="true"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            prop="deptName"
            label="部门名称"
            min-width="120"
            align="center"
          />
          <el-table-column
            prop="deptNo"
            label="部门编码"
            min-width="120"
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
            min-width="120"
            align="center"
          />
          <el-table-column
            prop="openFlag"
            label="是否开放"
            min-width="120"
            align="center"
          />
          <el-table-column
            prop="updateUser"
            label="更新人"
            min-width="120"
            align="center"
          >
            <template #default="scope">
              {{ scope.row.updateUser || "-" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="updateTime"
            label="更新日期"
            min-width="120"
            align="center"
          >
            <template #default="scope">
              {{ formatDate(scope.row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            min-width="200"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                @click="fun_detail(scope.row)"
              >
                详情
              </el-button>
              <el-button type="text" size="small" @click="fun_edit(scope.row)">
                编辑
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="fun_delete(scope.row.id)"
                style="color: #f56c6c"
              >
                删除
              </el-button>
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

    <!-- 新增/编辑/详情岗位弹框 -->
    <el-dialog
      width="40%"
      ref="elDialog"
      v-model="dataFormVisible"
      :title="dataFormTitle"
      :loading="dataFormLoading"
      destroy-on-close
    >
      <el-form
        :disabled="dataFormStatus === 'detail'"
        ref="dataFormRef"
        :model="dataForm"
        :rules="dataFormRules"
        label-position="right"
        label-width="130px"
        :style="{ 'margin-top': '20px' }"
      >
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="dataForm.deptName" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="部门编码" prop="deptNo">
              <el-input v-model="dataForm.deptNo" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="岗位名称" prop="positionName">
              <el-input v-model="dataForm.positionName" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="岗位编码" prop="positionNo">
              <el-input v-model="dataForm.positionNo" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="是否开放" prop="openFlag">
              <el-radio-group v-model="dataForm.openFlag">
                <el-radio label="Y">是</el-radio>
                <el-radio label="N">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
