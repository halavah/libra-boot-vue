<template>
  <div class="layout-content" ref="contentRoot">
    <div class="content-area">
      <el-row :gutter="24">
        <!-- 左侧列表 -->
        <el-col :span="6">
          <el-card shadow="never" class="list-card">
            <template #header>
              <div>
                <span>故障模式列表</span>
              </div>
            </template>
            <el-table :data="dataList" stripe :height="innerContentHeight">
              <el-table-column
                prop="bkReasonName"
                label="故障模式"
                show-overflow-tooltip
              />
              <el-table-column
                prop="totalBreakTime"
                label="停机时间"
                width="100"
                align="right"
              />
            </el-table>
          </el-card>
        </el-col>
        <!-- 右侧图表 -->
        <el-col :span="18">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div>
                <span>故障模式分布图（%）</span>
              </div>
            </template>
            <div
              ref="chartRef"
              class="chart-container"
              :style="{ height: innerContentHeight + 'px' }"
            ></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" src="../ts/ContentArea.ts"></script>
<style scoped src="../css/ContentArea.css"></style>
