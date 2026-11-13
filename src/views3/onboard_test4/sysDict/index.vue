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
                  <el-form-item label="字典编码" prop="dictCode">
                    <el-input
                      v-model="searchForm.dictCode"
                      placeholder="请输入字典编码"
                      clearable
                      class="search-input"
                      maxlength="20"
                      @keyup.enter="fun_search($refs.searchFormRef)"
                    />
                  </el-form-item>
                  <el-form-item label="字典名称" prop="dictName">
                    <el-input
                      v-model="searchForm.dictName"
                      placeholder="请输入字典名称"
                      clearable
                      class="search-input"
                      maxlength="50"
                      @keyup.enter="fun_search($refs.searchFormRef)"
                    />
                  </el-form-item>
                  <el-form-item label="枚举项ID" prop="itemId">
                    <el-input
                      v-model="searchForm.itemId"
                      placeholder="请输入枚举项ID"
                      clearable
                      class="search-input"
                      maxlength="20"
                      @keyup.enter="fun_search($refs.searchFormRef)"
                    />
                  </el-form-item>
                  <el-form-item label="枚举项名称" prop="itemText">
                    <el-input
                      v-model="searchForm.itemText"
                      placeholder="请输入枚举项名称"
                      clearable
                      class="search-input"
                      maxlength="50"
                      @keyup.enter="fun_search($refs.searchFormRef)"
                    />
                  </el-form-item>
                </div>
                <div
                  class="filter-row expanded-filter-rows"
                  v-show="searchExpanded"
                ></div>
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
          <el-button
            v-if="canPerform('add')"
            type="primary"
            :icon="Plus"
            @click="fun_create()"
            >新增
          </el-button>
          <el-button
            v-if="canPerform('export')"
            plain
            :icon="Download"
            @click="fun_export()"
            >导出</el-button
          >
          <el-button
            v-if="canPerform('batchDelete')"
            type="danger"
            :icon="Delete"
            @click="fun_batchDelete()"
            :disabled="isSelectionEmpty"
            >删除
          </el-button>
          <el-button
            v-if="canPerform('sync')"
            type="success"
            :icon="RefreshRight"
            @click="fun_syncFromErp()"
            >同步
          </el-button>
        </div>
        <div class="table-container">
          <el-table
            ref="dataTableRef"
            :data="dataList"
            border
            stripe
            highlight-current-row
            row-key="id"
            :reserve-selection="true"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              prop="dictCode"
              label="字典编码"
              min-width="120"
              align="center"
            />
            <el-table-column
              prop="dictName"
              label="字典名称"
              min-width="150"
              align="center"
            />
            <el-table-column
              prop="itemId"
              label="枚举项ID"
              min-width="120"
              align="center"
            />
            <el-table-column
              prop="itemText"
              label="枚举项名称"
              min-width="150"
              align="center"
            />
            <el-table-column
              prop="sortNo"
              label="排序号"
              min-width="100"
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
                  v-if="canPerform('query')"
                  type="primary"
                  link
                  size="small"
                  @click="fun_detail(scope.row)"
                >
                  详情
                </el-button>
                <el-button
                  v-if="canPerform('edit')"
                  type="primary"
                  link
                  size="small"
                  @click="fun_edit(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="canPerform('delete')"
                  type="primary"
                  link
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

      <!-- 新增/编辑/详情字典项弹框 -->
      <el-dialog
        width="40%"
        ref="elDialog"
        v-model="dataFormVisible"
        :title="dataFormTitle"
        destroy-on-close
      >
        <div
          v-loading="dataFormLoading"
          element-loading-text="加载中..."
          element-loading-background="rgba(255, 255, 255, 0.9)"
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
                <el-form-item label="字典编码" prop="dictCode">
                  <el-input
                    v-model="dataForm.dictCode"
                    maxlength="20"
                    :disabled="dataFormStatus === 'update'"
                    placeholder="如:0008"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="20">
                <el-form-item label="字典名称" prop="dictName">
                  <el-input
                    v-model="dataForm.dictName"
                    maxlength="50"
                    placeholder="如:性别"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="20">
                <el-form-item label="枚举项ID" prop="itemId">
                  <el-input
                    v-model="dataForm.itemId"
                    maxlength="20"
                    :disabled="dataFormStatus === 'update'"
                    placeholder="如:M"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="20">
                <el-form-item label="枚举项名称" prop="itemText">
                  <el-input
                    v-model="dataForm.itemText"
                    maxlength="50"
                    placeholder="如:男"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="20">
                <el-form-item label="排序号" prop="sortNo">
                  <el-input-number
                    v-model="dataForm.sortNo"
                    :min="1"
                    :max="9999"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
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
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
