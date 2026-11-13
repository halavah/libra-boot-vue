<template>
  <a-spin :spinning="loading" tip="加载中...">
    <div class="root-container">
      <!-- 布局 1: 筛选区域-->
      <div class="layout-search">
        <a-config-provider :locale="locale">
          <a-form
            ref="searchFormRef"
            :model="searchForm"
            :rules="rules"
            layout="inline"
            class="search-form-inline"
          >
            <!-- 条件容器 -->
            <div class="search-filters-flex">
              <a-form-item-rest>
                <a-form-item label="商品分类" name="plNos">
                  <a-tree-select
                    v-model:value="searchForm.plNos"
                    style="width: 180px"
                    :tree-data="treeData"
                    tree-checkable
                    allow-clear
                    placeholder="默认全部商品分类"
                    :field-names="treeProps"
                    :treeDefaultExpandedKeys="expandedKeys"
                    class="search-tree-select"
                  />
                </a-form-item>
              </a-form-item-rest>

              <a-form-item label="商品编号" name="equipmentNo">
                <a-input
                  v-model:value="searchForm.equipmentNo"
                  placeholder="请输入商品编号"
                  allow-clear
                  class="search-input"
                />
              </a-form-item>
              <a-form-item label="商品售后模式" name="stopReasonName">
                <a-select
                  v-model:value="searchForm.stopReasonName"
                  mode="multiple"
                  placeholder="请选择退货原因"
                  :options="attrCnts.faultModeOptions"
                  allow-clear
                  class="search-select"
                />
              </a-form-item>
              <a-form-item label="日期范围" name="vDay">
                <a-range-picker
                  v-model:value="searchForm.vDay"
                  :placeholder="['开始日期', '结束日期']"
                  format="YYYY/MM/DD"
                  valueFormat="YYYY/MM/DD"
                  class="search-datepicker"
                />
              </a-form-item>
              <div class="search-buttons">
                <a-form-item>
                  <a-button type="primary" @click="fun_search()">查询</a-button>
                  <a-button style="margin-left: 8px" @click="fun_reset()"
                    >重置</a-button
                  >
                </a-form-item>
              </div>
            </div>
          </a-form>
        </a-config-provider>
      </div>

      <!-- 布局 2: 内容区域-->
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

      <!-- 布局 3: 分析功能区域-->
      <div class="layout-analysis">
        <a-card :bordered="false" class="analysis-card" size="small">
          <template #title>
            <span>分析功能</span>
          </template>
          <div>
            <a-textarea
              v-model:value="analysisText"
              :rows="2"
              readonly
              :autoSize="false"
              class="analysis-textarea"
            />
          </div>
        </a-card>
      </div>
    </div>
  </a-spin>
</template>

<script src="./js/index.js" type="module"></script>
<style scoped src="./css/index.css"></style>
