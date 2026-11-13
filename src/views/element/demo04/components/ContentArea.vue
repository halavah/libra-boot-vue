<template>
  <div class="layout-content" ref="contentRoot">
    <div class="content-area">
      <el-row :gutter="24">
        <!-- 左侧列表 -->
        <el-col :span="6">
          <el-card shadow="never" class="list-card">
            <template #header>
              <div>
                <span>退货原因列表</span>
              </div>
            </template>
            <el-table :data="dataList" stripe :height="innerContentHeight">
              <el-table-column
                prop="bkReasonName"
                label="退货原因"
                show-overflow-tooltip
              />
              <el-table-column
                prop="totalBreakTime"
                label="订单暂停时长"
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
                <span>退货原因分布图（%）</span>
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
