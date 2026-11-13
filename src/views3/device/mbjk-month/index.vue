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
          <el-form-item label="厂处" prop="plNoKey">
            <el-select
              v-model="searchForm.plNoKey"
              placeholder="默认全部厂处"
              class="search-select"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="1"
            >
              <el-option
                v-for="item in attrCnts.plNamesOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="年份" prop="vYear">
            <el-date-picker
              v-model="searchForm.vYear"
              type="year"
              placeholder="选择年份"
              value-format="YYYY"
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
          <el-col :span="16">
            <el-card shadow="never" class="list-card">
              <template #header>
                <span>月指标监控列表</span>
              </template>
              <el-table
                :data="dataList"
                stripe
                style="width: 100%"
                height="583"
                border
                fit
              >
                <el-table-column
                  prop="plName"
                  label="指标归口管理部门"
                  fixed
                  width="100"
                  align="center"
                />
                <el-table-column
                  prop="mbmc"
                  width="100"
                  label="目标名称"
                  align="center"
                />
                <el-table-column
                  v-for="monthIndex in 12"
                  :key="monthIndex"
                  :label="`${monthIndex}月`"
                  align="center"
                >
                  <template #default="scope">
                    <span>{{
                      scope.row.totalBreakTimes
                        ? scope.row.totalBreakTimes.split(",")[
                            monthIndex - 1
                          ] || "0"
                        : "0"
                    }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="chart-card">
              <div class="charts-wrapper">
                <div ref="barChartRef" class="chart-container"></div>
              </div>
            </el-card>
            <el-card shadow="never" class="chart-card">
              <div class="charts-wrapper">
                <div ref="lineChartRef" class="chart-container"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="layout-analysis">
      <el-card class="analysis-card">
        <template #header>
          <span>分析功能</span>
        </template>
        <div>
          <el-input
            type="textarea"
            v-model="analyse"
            :rows="6"
            readonly
            autosize
            resize="none"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>
<script src="./js/index.js" type="module"></script>
<style scoped src="./css/index.css"></style>
