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
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="1"
              @focus="onPlNoTreeFocus"
              :disabled="!!searchForm.equipmentNo"
            />
          </el-form-item>
          <el-form-item label="商品编号" prop="equipmentNo">
            <el-input
              v-model="searchForm.equipmentNo"
              placeholder="请输入商品编号"
              clearable
              class="search-input"
              maxlength="12"
              @input="onEquipmentNoInput"
            ></el-input>
          </el-form-item>
          <!-- 设备号模糊查询表格 -->
          <el-table
            v-if="equipmentNoTableVisible"
            :data="
              equipmentNoTableData.slice(
                (equipmentNoTablePage - 1) * equipmentNoTablePageSize,
                equipmentNoTablePage * equipmentNoTablePageSize
              )
            "
            style="width: 100%; margin-top: 8px"
            @row-click="onEquipmentNoRowClick"
            highlight-current-row
            size="small"
          >
            <el-table-column prop="EQUIPMENTNO" label="设备号" width="160" />
            <el-table-column prop="EQUIPMENTNAME" label="商品名称" />
          </el-table>
          <el-pagination
            v-if="equipmentNoTableVisible"
            :current-page="equipmentNoTablePage"
            :page-size="equipmentNoTablePageSize"
            :total="equipmentNoTableData.length"
            @current-change="(val) => (equipmentNoTablePage = val)"
            layout="prev, pager, next"
            small
            style="margin-top: 4px"
          />
          <el-form-item label="故障编号" prop="breakDownNo">
            <el-input
              v-model="searchForm.breakDownNo"
              placeholder="请输入故障编号"
              clearable
              maxlength="14"
            ></el-input>
          </el-form-item>
          <el-form-item label="停机类型" prop="relegationNames">
            <el-select
              v-model="searchForm.relegationNames"
              placeholder="请选择停机类型"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="1"
              class="search-select"
            >
              <el-option
                v-for="item in attrCnts.relegationNamesOptions"
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
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
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
    <!-- 布局 2: 内容区域 -->
    <div class="layout-content">
      <div class="table-container">
        <el-table
          :data="
            dataList.slice((currentPage - 1) * pageSize, currentPage * pageSize)
          "
          border
          stripe
          highlight-current-row
        >
          <el-table-column
            prop="plName"
            label="产线名称"
            min-width="120"
            align="center"
          />
          <el-table-column
            prop="equipmentNo"
            label="设备号"
            min-width="100"
            align="center"
          />
          <el-table-column
            prop="equipmentName"
            label="商品名称"
            min-width="300"
            align="center"
          />
          <el-table-column
            prop="breakDownNo"
            label="故障编号"
            min-width="120"
            align="center"
          />
          <el-table-column
            prop="breakDownName"
            label="故障名称"
            min-width="300"
            align="center"
          />
          <el-table-column
            prop="relegationName"
            label="停机类型"
            min-width="50"
            align="center"
          />
          <el-table-column
            prop="informDate"
            label="故障时间"
            min-width="100"
            align="center"
          />
          <el-table-column
            label="操作"
            min-width="50"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button type="text" @click="fun_detail(scope.row)"
                >详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="dataTotal"
          hide-on-single-page
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 新增/编辑/详情 -->
    <el-dialog
      width="50%"
      ref="elDialog"
      v-model="dataFormVisible"
      :title="dataFormTitle"
      :loading="dataFormLoading"
    >
      <el-form
        ref="dataFormRef"
        :model="dataForm"
        :rules="rules"
        label-position="right"
        label-width="100px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="产线编号" prop="plNo">
              <el-input v-model="dataForm.plNo" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="事故编号" prop="breakDownNo">
              <el-input v-model="dataForm.breakDownNo" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="发生时间" prop="informfullDate">
              <el-input v-model="dataForm.informfullDate" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="响应时间" prop="arrivefullDate">
              <el-input v-model="dataForm.arrivefullDate" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总订单暂停时长" prop="totalBreakTime">
              <el-input v-model="dataForm.totalBreakTime" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障等级" prop="breakDownGrade">
              <el-input v-model="dataForm.breakDownGrade" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备部位" prop="bkPart">
              <el-input v-model="dataForm.bkPart" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障名称" prop="breakDownName">
              <el-input v-model="dataForm.breakDownName" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="停机类型" prop="relegation">
              <el-input v-model="dataForm.relegation" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退货原因" prop="bkReason">
              <el-input v-model="dataForm.bkReason" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="原因分析" prop="textArea2">
              <el-input
                v-model="dataForm.textArea2"
                type="textarea"
                :rows="4"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="整改措施" prop="textArea3">
              <el-input
                v-model="dataForm.textArea3"
                type="textarea"
                :rows="4"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="处理措施" prop="relegation">
              <el-input v-model="dataForm.relegation" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="处理备注" prop="reportMemo">
              <el-input v-model="dataForm.reportMemo" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dataFormVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style scoped src="./css/index.css"></style>
