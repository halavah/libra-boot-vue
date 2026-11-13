<template>
  <!-- 布局 2: 内容区域 -->
  <div class="layout-content">
    <div class="content-area">
      <a-row :gutter="16">
        <!-- 左侧列表 -->
        <a-col :span="6">
          <a-card :bordered="false" class="list-card" size="small">
            <template #title>
              <span>退货原因列表</span>
            </template>
            <a-table
              :columns="tableColumns"
              :data-source="dataList"
              :pagination="false"
              :scroll="{ y: 475 }"
              size="small"
              row-key="bkReasonName"
            >
              <template #bodyCell="{ column, text }">
                <template v-if="column.key === 'bkReasonName'">
                  <a-tooltip :title="text">
                    <span class="table-cell-tooltip">{{ text }}</span>
                  </a-tooltip>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
        <!-- 右侧图表 -->
        <a-col :span="18">
          <a-card :bordered="false" class="chart-card" size="small">
            <template #title>
              <span>退货原因分布图（%）</span>
            </template>
            <div ref="chartRef" class="chart-container"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script src="../js/ContentArea.js"></script>
<style scoped src="../css/ContentArea.css"></style>
