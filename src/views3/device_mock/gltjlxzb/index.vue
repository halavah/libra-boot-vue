<template>
  <div v-loading.lock="loading" class="root-container">
    <!-- 布局 1: 筛选区域 -->
    <div class="layout-search">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :rules="searchFormRules"
        :inline="true"
        class="vertical-center-form"
      >
        <el-form-item label="店铺" prop="plNames">
          <el-select
            v-model="searchForm.plNames"
            multiple
            clearable
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            placeholder="请选择店铺"
            style="width: 240px"
          >
            <el-option
              v-for="item in attrCnts.plNamesOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="退货原因" prop="reasonNames">
          <el-select
            v-model="searchForm.reasonNames"
            multiple
            clearable
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            placeholder="请选择退货原因"
            style="width: 240px"
          >
            <el-option
              v-for="item in attrCnts.reasonNamesOptions"
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
            format="YYYY"
            value-format="YYYY"
            placeholder="请选择年份"
          />
        </el-form-item>

        <el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fun_search(searchFormRef)"
              >查询</el-button
            >
            <el-button @click="fun_reset(searchFormRef)">重置</el-button>
          </el-form-item>
        </el-form-item>
      </el-form>
    </div>

    <!-- 布局 2: 内容区域 -->
    <div class="layout-content">
      <div class="content-area">
        <el-row :gutter="24" class="table-row" style="margin-bottom: 20px">
          <!-- 表格1 -->
          <el-col :span="16">
            <el-card shadow="never" class="list-card">
              <template #header>订单暂停次数统计</template>
              <div style="overflow-x: auto" ref="tableARef">
                <el-table
                  :data="countList"
                  border
                  fit
                  size="small"
                  height="350"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="Type"
                    label="类型"
                    align="center"
                    min-width="84px"
                  />
                  <el-table-column
                    prop="January"
                    label="1月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="February"
                    label="2月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="March"
                    label="3月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="April"
                    label="4月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="May"
                    label="5月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="June"
                    label="6月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="July"
                    label="7月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="August"
                    label="8月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="September"
                    label="9月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="October"
                    label="10月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="November"
                    label="11月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="December"
                    label="12月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="YearlyTotal"
                    label="年累计"
                    align="center"
                    min-width="60px"
                  />
                  <el-table-column
                    prop="Proportion"
                    label="占比"
                    align="center"
                    min-width="60px"
                  />
                </el-table>
              </div>
            </el-card>
          </el-col>

          <!-- 图表1 -->
          <el-col :span="8">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span>订单暂停次数统计图</span>
              </template>
              <div class="charts-wrapper">
                <div ref="countBarChart" class="chart-container" />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="24" class="table-row">
          <!-- 表格2 -->
          <el-col :span="16">
            <el-card shadow="never" class="list-card">
              <template #header>订单暂停时长统计</template>
              <div style="overflow-x: auto" ref="tableBRef">
                <el-table
                  :data="timeList"
                  border
                  fit
                  size="small"
                  height="350"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="Type"
                    label="类型"
                    align="center"
                    min-width="84px"
                  />
                  <el-table-column
                    prop="January"
                    label="1月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="February"
                    label="2月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="March"
                    label="3月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="April"
                    label="4月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="May"
                    label="5月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="June"
                    label="6月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="July"
                    label="7月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="August"
                    label="8月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="September"
                    label="9月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="October"
                    label="10月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="November"
                    label="11月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="December"
                    label="12月"
                    align="center"
                    min-width="48px"
                  />
                  <el-table-column
                    prop="YearlyTotal"
                    label="年累计"
                    align="center"
                    min-width="60px"
                  />
                  <el-table-column
                    prop="Proportion"
                    label="占比"
                    align="center"
                    min-width="60px"
                  />
                </el-table>
              </div>
            </el-card>
          </el-col>

          <!-- 图表2 -->
          <el-col :span="8">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span>订单暂停时长统计图</span>
              </template>
              <div class="charts-wrapper">
                <div ref="timeBarChart" class="chart-container" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

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
