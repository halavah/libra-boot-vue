<template>
  <div>
    <!-- 直接使用 OnbApplicant 组件，pageType=1 表示应聘登记页面 -->
    <OnbApplicant :page-type="1" />

    <!-- 分配弹框 -->
    <el-dialog
      width="700px"
      v-model="operationDialogVisible"
      title="分配应聘者"
    >
      <el-form
        ref="operationFormRef"
        :model="operationForm"
        :rules="operationFormRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="应聘者">
              <el-input v-model="currentOperationRow.applicantName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应聘岗位">
              <el-input v-model="operationForm.applyPosition" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分配部门" prop="assignedDept">
              <el-input
                v-model="operationForm.assignedDept"
                placeholder="请输入分配部门"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分配人" prop="assignedUser">
              <el-input
                v-model="operationForm.assignedUser"
                placeholder="请输入分配人姓名"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分配日期">
              <el-date-picker
                v-model="operationForm.assignedDate"
                type="date"
                placeholder="选择分配日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="分配说明">
              <el-input
                v-model="operationForm.assignedReason"
                type="textarea"
                :rows="3"
                placeholder="请输入分配说明"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="operationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="fun_saveOperation">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import OnbApplicant from "../onbApplicant/index.vue";
import allocateJS from "./js/index.js";

export default {
  ...allocateJS,
  components: {
    OnbApplicant,
  },
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>