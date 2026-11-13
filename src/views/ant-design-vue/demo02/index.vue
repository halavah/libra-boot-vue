<template>
  <!-- 整体加载状态指示器 -->
  <a-spin :spinning="loading" tip="加载中...">
    <!-- 页面根容器 -->
    <div class="root-container">
      <!-- 布局块 1: 顶部筛选区域 -->
      <div class="layout-search">
        <!-- Ant Design Vue 全局配置 (设置中文语言) -->
        <a-config-provider :locale="locale">
          <!-- 筛选表单 -->
          <a-form
            ref="searchFormRef"
            :model="searchForm"
            :rules="rules"
            layout="inline"
            class="search-form-inline"
          >
            <!--
              表单引用: searchFormRef
              表单数据模型: searchForm
              表单校验规则: rules
              行内表单布局: layout="inline"
              自定义样式类: class="search-form-inline"
            -->
            <!-- 筛选条件 Flex 容器 -->
            <div class="search-filters-flex">
              <!-- 商品分类选择 (TreeSelect) -->
              <!-- a-form-item-rest 用于包裹非受控组件或自定义组件 -->
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
                  <!--
                    绑定商品分类数据: v-model:value="searchForm.plNos"
                    固定宽度: style="width: 180px"
                    树数据源: :tree-data="treeData"
                    显示复选框: tree-checkable
                    允许清除: allow-clear
                    占位提示: placeholder="默认全部商品分类"
                    字段名映射: :field-names="treeProps"
                    默认展开节点: :treeDefaultExpandedKeys="expandedKeys"
                    自定义样式类: class="search-tree-select"
                  -->
                </a-form-item>
              </a-form-item-rest>

              <!-- 商品编号输入 (Input) -->
              <a-form-item label="商品编号" name="equipmentNo">
                <a-input
                  v-model:value="searchForm.equipmentNo"
                  placeholder="请输入商品编号"
                  allow-clear
                  class="search-input"
                />
                <!--
                  绑定商品编号数据: v-model:value="searchForm.equipmentNo"
                  占位提示: placeholder="请输入商品编号"
                  允许清除: allow-clear
                  自定义样式类: class="search-input"
                -->
              </a-form-item>
              <!-- 商品售后模式选择 (Select) -->
              <a-form-item label="商品售后模式" name="stopReasonName">
                <a-select
                  v-model:value="searchForm.stopReasonName"
                  mode="multiple"
                  placeholder="请选择退货原因"
                  :options="attrCnts.faultModeOptions"
                  allow-clear
                  class="search-select"
                />
                <!--
                  绑定退货原因数据: v-model:value="searchForm.stopReasonName"
                  多选模式: mode="multiple"
                  占位提示: placeholder="请选择退货原因"
                  下拉选项: :options="attrCnts.faultModeOptions"
                  允许清除: allow-clear
                  自定义样式类: class="search-select"
                -->
              </a-form-item>
              <!-- 日期范围选择 (RangePicker) -->
              <a-form-item label="日期范围" name="vDay">
                <a-range-picker
                  v-model:value="searchForm.vDay"
                  :placeholder="['开始日期', '结束日期']"
                  format="YYYY/MM/DD"
                  valueFormat="YYYY/MM/DD"
                  class="search-datepicker"
                />
                <!--
                  绑定日期范围数据: v-model:value="searchForm.vDay"
                  占位提示: :placeholder="['开始日期', '结束日期']"
                  显示格式: format="YYYY/MM/DD"
                  值格式: valueFormat="YYYY/MM/DD"
                  自定义样式类: class="search-datepicker"
                -->
              </a-form-item>
              <!-- 查询与重置按钮 -->
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

      <!-- 布局块 2: 中间内容区域 (包含列表和图表) -->
      <!-- 使用 ContentArea 子组件，并传递列表数据 -->
      <content-area :data-list="dataList"></content-area>

      <!-- 布局块 3: 底部分析功能区域 -->
      <div class="layout-analysis">
        <!-- 分析卡片 -->
        <a-card :bordered="false" class="analysis-card" size="small">
          <template #title>
            <span>分析功能</span>
          </template>
          <!-- 分析文本域 (只读) -->
          <div>
            <a-textarea
              v-model:value="analysisText"
              :rows="2"
              readonly
              :autoSize="false"
              class="analysis-textarea"
            />
            <!--
              绑定分析文本数据: v-model:value="analysisText"
              固定行数: :rows="2"
              只读: readonly
              禁用自动大小调整: :autoSize="false"
              自定义样式类: class="analysis-textarea"
            -->
          </div>
        </a-card>
      </div>
    </div>
  </a-spin>
</template>

<!-- 导入 JavaScript 逻辑 -->
<script src="./js/index.js" type="module"></script>
<!-- 导入 Scoped CSS 样式 -->
<style scoped src="./css/index.css"></style>
