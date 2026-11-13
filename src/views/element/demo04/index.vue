<template>
  <div v-loading.lock="loading" class="root-container">
    <!-- 布局 1: 筛选区域 -->
    <div class="layout-search">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :rules="searchFormRules"
        :inline="true"
      >
        <!-- 条件容器 -->
        <div class="search-filters">
          <el-form-item label="产线" prop="plNoKey">
            <el-tree-select
              v-model="searchForm.plNoKey"
              :props="treeProps"
              :data="treeData"
              check-strictly
              :render-after-expand="false"
              placeholder="默认全部产线"
              class="search-tree-select"
              value-key="key"
              multiple
              clearable
            />
          </el-form-item>
          <el-form-item label="设备号" prop="equipmentNo">
            <el-input
              v-model="searchForm.equipmentNo"
              placeholder="请输入设备号"
              clearable
              class="search-input"
            ></el-input>
          </el-form-item>
          <el-form-item label="商品售后模式" prop="stopReasonName">
            <el-select
              v-model="searchForm.stopReasonName"
              placeholder="请选择故障模式"
              multiple
              clearable
              class="search-select"
            >
              <el-option
                v-for="item in attrCnts.faultModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围" prop="vDay">
            <el-date-picker
              v-model="searchForm.vDay"
              type="daterange"
              start-placeholder="开始日期"
              range-separator="至"
              end-placeholder="结束日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              class="search-datepicker"
            >
            </el-date-picker>
          </el-form-item>
          <div class="search-buttons">
            <el-form-item>
              <el-button type="primary" @click="fun_search(searchFormRef)"
                >查询</el-button
              >
              <el-button @click="fun_reset(searchFormRef)">重置</el-button>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 布局 2: 内容区域 (使用子组件) -->
    <content-area :data-list="dataList"></content-area>

    <!-- 布局 3: 分析功能区域 -->
    <div class="layout-analysis">
      <el-card class="analysis-card">
        <template #header>
          <div>
            <span>分析功能</span>
          </div>
        </template>
        <div>
          <el-input
            type="textarea"
            v-model="analysisText"
            :rows="3"
            readonly
            resize="none"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" src="./ts/index.ts" type="module"></script>
<style scoped src="./css/index.css"></style>
