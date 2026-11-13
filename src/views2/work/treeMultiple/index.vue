<template>
  <!-- 树形多选组件 - 展示多种通讯方式 -->
  <!-- 1. Props（父传子）：接收父组件传递的数据和配置 -->
  <!-- 2. Emit（子传父）：向父组件发送事件通知 -->
  <!-- 3. Ref + defineExpose：暴露方法供父组件直接调用 -->
  <!-- 4. 插槽：允许父组件传入自定义内容 -->
  <!-- 5. 事件回调：处理内部组件事件并转发 -->

  <el-popover
    :disabled="disabled"
    :visible="popoverVisible"
    trigger="click"
    @hide="submitPopover()"
    :width="selectType == 'single' ? '' : '628px'"
    ref="popoverRef"
    placement="bottom-start"
    :fallback-placements="['top-start', 'right', 'left']"
  >
    <!-- 4. 插槽：具名插槽 - 允许父组件传入自定义触发内容 -->
    <template #reference>
      <div class="" v-if="slotReference" @click="openPopover()">
        <slot name="reference"></slot>
      </div>
      <template v-else>
        <el-select
          :disabled="disabled"
          v-if="selectType === 'single'"
          ref="selectRef"
          v-model="selectObj"
          @click="openPopover()"
          placeholder="请选择"
          clearable
          @clear="
            selectList = [];
            submitPopover(false);
          "
        >
        </el-select>
        <el-select
          class="tree-multiple-Select"
          v-if="selectType === 'multiple'"
          ref="selectRef"
          v-model="selectList"
          @click="openPopover()"
          @remove-tag="removeTag"
          multiple
          :collapse-tags="collapseTags"
          collapse-tags-tooltip
          placeholder="请选择"
        >
        </el-select>
      </template>
    </template>

    <template #default>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: start;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        "
      >
        <div
          class=""
          :style="{
            borderRight:
              selectType == 'single' ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
          }"
        >
          <el-tabs class="performace-tabs" v-model="activeName">
            <el-tab-pane
              v-if="activeNameList.includes('administrative')"
              label="行政组织"
              name="administrative"
            >
            </el-tab-pane>
            <el-tab-pane
              v-if="activeNameList.includes('dummy')"
              label="虚拟组织"
              name="dummy"
            >
            </el-tab-pane>
            <div
              class="flex justify-end items-center"
              style=""
              v-if="selectType === 'multiple'"
            >
              是否自动选中下级
              <el-switch
                style="margin-left: 5px; margin-top: -1px"
                size="small"
                v-model="isAutomatic"
              />
            </div>
            <el-input
              size="small"
              v-model="organizeInput"
              style="width: 350px"
              placeholder="搜索"
            />
            <div
              style="
                width: 350px;
                height: 200px;
                overflow-y: auto;
                overflow-x: hidden;
              "
              v-loading="!treeRef"
            >
              <!-- 5. 事件回调：处理内部组件事件并转发 -->
              <el-tree-v2
                ref="treeRef"
                :default-expanded-keys="expandedKeys"
                check-strictly
                node-key="id"
                highlight-current
                :render-after-expand="false"
                style="max-width: 350px; min-height: 200px"
                :data="treeData"
                @check="
                  (checkedNode, checkedStatus) =>
                    handleCheckChange(checkedNode, checkedStatus, activeName)
                "
                @node-click="(data) => handleNodeClick(data, activeName)"
                :show-checkbox="selectType == 'multiple'"
                :filter-method="filterNode"
                :props="treeProps"
                :class="activeName == 'dummy' ? 'dummy-box' : ''"
              >
                <template #default="{ node, data }">
                  <div class="custom-tree-node">
                    <span class="custom-tree-label">{{ node.label }}</span>
                    <el-button
                      class="append-btn"
                      size="small"
                      v-if="selectType == 'multiple' && data.children?.length"
                      type="primary"
                      link
                      @click.stop="appendChild(node, data, activeName)"
                    >
                      选中下一级
                    </el-button>
                  </div>
                </template>
              </el-tree-v2>
            </div>
          </el-tabs>
        </div>
        <div class="" style="flex: 1" v-if="selectType === 'multiple'">
          <div
            class="flex justify-between"
            style="align-items: center; margin-bottom: 14px; height: 32px"
          >
            <div class="" style="padding: 0 0 0 8px">
              已选：{{ selectList.length }}
            </div>
            <el-button @click="delAll()" size="small">清空</el-button>
          </div>
          <div
            class="flex"
            style="padding: 0 0 0 8px; display: flex; align-items: center"
          >
            <div
              class=""
              style="
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background-color: #5378ff;
                display: flex;
                justify-content: center;
                align-items: center;
              "
            >
              <el-icon size="10" color="#fff">
                <User />
              </el-icon>
            </div>
            <div class="" style="margin-left: 4px">部门</div>
          </div>
          <div
            class=""
            style="
              margin-top: 4px;
              padding: 0 8px;
              height: 230px;
              overflow-y: auto;
              overflow-x: hidden;
            "
          >
            <el-tag
              :closable="!disabled"
              style="
                margin-bottom: 4px;
                margin-right: 4px;
                height: auto;
                padding: 5px;
                white-space: normal;
              "
              v-for="item in selectList"
              :key="item.id"
              @close="removeTag(item)"
              type="info"
              effect="light"
            >
              {{ item.label }}
            </el-tag>
          </div>
        </div>
      </div>
      <div class="flex justify-end" style="margin-top: 12px">
        <el-button size="small" @click="submitPopover()">取消</el-button>
        <el-button size="small" type="primary" @click="submitPopover()"
          >确定</el-button
        >
      </div>
    </template>
  </el-popover>
  <div ref="locationRef"></div>
</template>

<!-- 引入外部 JS 文件 - 三文件分离结构 -->
<script>
import { User } from "@element-plus/icons-vue";
import componentLogic from "./js/index.js";

export default {
  name: "TreeMultiple",
  components: {
    User,
  },
  ...componentLogic,
};
</script>

<!-- 引入外部 CSS 文件 - 三文件分离结构 -->
<style scoped src="./css/index.css"></style>
