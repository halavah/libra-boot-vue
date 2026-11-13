<template>
  <div v-loading.lock="loading" class="root-container">
    <div class="layout-search">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :rules="searchFormRules"
        :inline="true"
      >
        <div class="search-filters">
          <el-form-item label="月份" prop="vMonth">
            <el-date-picker
              v-model="searchForm.vMonth"
              type="month"
              placeholder="选择月份"
              value-format="YYYY-MM"
              class="search-datepicker"
            />
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
    <div class="layout-content">
      <div class="content-area">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-card shadow="never" class="list-card">
              <template #header>
                <span>周指标监控列表</span>
              </template>
              <el-table :data="dataList" stripe style="width: 100%" border fit>
                <el-table-column
                  prop="zbgkglbm"
                  label="指标归口管理部门"
                  fixed
                  width="200"
                  align="center"
                />
                <el-table-column
                  prop="mbmc"
                  width="120"
                  label="目标名称"
                  align="center"
                />
                <el-table-column
                  v-for="(weekRange, index) in dataList.length > 0 &&
                  dataList[0].mzrqfw
                    ? dataList[0].mzrqfw.split(',')
                    : []"
                  :key="index"
                  :label="weekRange.trim()"
                  align="center"
                >
                  <template #default="scope">
                    <span>{{
                      scope.row.mzgzsj
                        ? scope.row.mzgzsj.split(",")[index] || "0"
                        : "0"
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="jxz" label="极限值" align="center" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 14px">
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <div class="charts-wrapper">
                <div ref="barChartRef" class="chart-container"></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <div class="charts-wrapper">
                <div ref="lineChartRef" class="chart-container"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script src="./js/index.js" type="module"></script>
<style scoped src="./css/index.css"></style>
