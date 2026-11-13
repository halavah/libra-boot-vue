<template>
  <div class="example-container">
    <div class="example-header">
      <h3>4. 插槽通讯方式</h3>
      <el-tag type="info">内容分发</el-tag>
    </div>

    <div class="example-description">
      <p>
        插槽是 Vue
        提供的内容分发机制，允许父组件向子组件的指定位置插入自定义内容。这种方式实现了父组件向子组件传递模板内容，增强了组件的灵活性和可复用性。
      </p>
    </div>

    <div class="example-demo">
      <div class="demo-area">
        <div class="slot-config-panel">
          <h4>插槽配置：</h4>
          <el-form :model="slotConfig" label-width="120px" size="small">
            <el-form-item label="插槽类型">
              <el-radio-group
                v-model="slotConfig.type"
                @change="handleSlotTypeChange"
              >
                <el-radio label="default">默认插槽</el-radio>
                <el-radio label="custom">自定义插槽</el-radio>
                <el-radio label="advanced">高级插槽</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="按钮类型" v-if="slotConfig.type !== 'default'">
              <el-select
                v-model="slotConfig.buttonType"
                @change="handleButtonChange"
              >
                <el-option label="主要按钮" value="primary" />
                <el-option label="成功按钮" value="success" />
                <el-option label="警告按钮" value="warning" />
                <el-option label="危险按钮" value="danger" />
                <el-option label="信息按钮" value="info" />
                <el-option label="文本按钮" value="text" />
              </el-select>
            </el-form-item>

            <el-form-item label="按钮图标" v-if="slotConfig.type !== 'default'">
              <el-select v-model="slotConfig.icon" @change="handleIconChange">
                <el-option label="搜索图标" value="Search" />
                <el-option label="用户图标" value="User" />
                <el-option label="设置图标" value="Setting" />
                <el-option label="文件夹图标" value="Folder" />
                <el-option label="标签图标" value="CollectionTag" />
                <el-option label="无图标" value="" />
              </el-select>
            </el-form-item>

            <el-form-item
              label="自定义文本"
              v-if="slotConfig.type === 'custom'"
            >
              <el-input
                v-model="slotConfig.text"
                placeholder="请输入自定义文本"
                @input="handleTextChange"
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="tree-component-area">
          <h4>组件演示：</h4>
          <!-- 默认插槽 -->
          <tree-multiple
            v-if="slotConfig.type === 'default'"
            v-model:data-source="selectedData"
            :select-type="'multiple'"
            :active-name-list="['administrative']"
          />

          <!-- 自定义插槽 -->
          <tree-multiple
            v-else-if="slotConfig.type === 'custom'"
            v-model:data-source="selectedData"
            :select-type="'multiple'"
            :active-name-list="['administrative']"
          >
            <template #reference>
              <el-button :type="slotConfig.buttonType">
                <el-icon v-if="slotConfig.icon">
                  <component :is="slotConfig.icon" />
                </el-icon>
                {{ slotConfig.text || "选择组织" }}
              </el-button>
            </template>
          </tree-multiple>

          <!-- 高级插槽 -->
          <tree-multiple
            v-else-if="slotConfig.type === 'advanced'"
            v-model:data-source="selectedData"
            :select-type="'multiple'"
            :active-name-list="['administrative']"
          >
            <template #reference>
              <div class="custom-trigger">
                <el-button :type="slotConfig.buttonType" size="small">
                  <el-icon v-if="slotConfig.icon">
                    <component :is="slotConfig.icon" />
                  </el-icon>
                  选择
                </el-button>
                <el-tag
                  v-if="selectedData.length > 0"
                  type="info"
                  size="small"
                  style="margin-left: 8px"
                >
                  已选 {{ selectedData.length }} 项
                </el-tag>
                <el-button
                  v-if="selectedData.length > 0"
                  type="text"
                  size="small"
                  @click="clearSelection"
                >
                  清空
                </el-button>
              </div>
            </template>
          </tree-multiple>
        </div>
      </div>

      <div class="result-area">
        <h4>插槽配置信息：</h4>
        <div class="result-content">{{ formatSlotConfig() }}</div>
      </div>
    </div>

    <div class="example-code">
      <el-collapse v-model="codeExpanded">
        <el-collapse-item title="查看代码" name="code">
          <pre><code>{{ codeExample }}</code></pre>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import TreeMultiple from "../../treeMultiple/index.vue";
import {
  Search,
  User,
  Setting,
  Folder,
  CollectionTag,
} from "@element-plus/icons-vue";

export default {
  name: "SlotExample",
  components: {
    TreeMultiple,
    Search,
    User,
    Setting,
    Folder,
    CollectionTag,
  },
  data() {
    return {
      // 选中的数据
      selectedData: [],
      // 插槽配置
      slotConfig: {
        type: "default",
        buttonType: "primary",
        icon: "Search",
        text: "选择组织",
      },
      // 代码展开状态
      codeExpanded: [],
    };
  },
  computed: {
    // 代码示例
    codeExample() {
      if (this.slotConfig.type === "default") {
        return `<!-- 默认插槽 - 使用组件内置的触发器 -->
<template>
  <tree-multiple
    v-model:data-source="selectedData"
    :select-type="'multiple'"
    :active-name-list="['administrative']"
  />
</template>`;
      } else if (this.slotConfig.type === "custom") {
        return `<!-- 自定义插槽 - 使用自定义按钮作为触发器 -->
<template>
  <tree-multiple
    v-model:data-source="selectedData"
    :select-type="'multiple'"
    :active-name-list="['administrative']"
  >
    <template #reference>
      <el-button type="${this.slotConfig.buttonType}">
        <el-icon>
          <${this.slotConfig.icon || "Search"} />
        </el-icon>
        ${this.slotConfig.text || "选择组织"}
      </el-button>
    </template>
  </tree-multiple>
</template>

<script>
import { ${this.slotConfig.icon || "Search"} } from '@element-plus/icons-vue';

export default {
  components: {
    ${this.slotConfig.icon || "Search"}
  }
}
<\/script>`;
      } else {
        return `<!-- 高级插槽 - 使用复杂的自定义触发器 -->
<template>
  <tree-multiple
    v-model:data-source="selectedData"
    :select-type="'multiple'"
    :active-name-list="['administrative']"
  >
    <template #reference>
      <div class="custom-trigger">
        <el-button type="${this.slotConfig.buttonType}" size="small">
          <el-icon>
            <${this.slotConfig.icon || "Search"} />
          </el-icon>
          选择
        </el-button>
        <el-tag
          v-if="selectedData.length > 0"
          type="info"
          size="small"
        >
          已选 {{ selectedData.length }} 项
        </el-tag>
        <el-button
          v-if="selectedData.length > 0"
          type="text"
          size="small"
          @click="clearSelection"
        >
          清空
        </el-button>
      </div>
    </template>
  </tree-multiple>
</template>

<script>
import { ${this.slotConfig.icon || "Search"} } from '@element-plus/icons-vue';

export default {
  components: {
    ${this.slotConfig.icon || "Search"}
  },
  methods: {
    clearSelection() {
      this.selectedData = [];
    }
  }
}
<\/script>

<style scoped>
.custom-trigger {
  display: flex;
  align-items: center;
}
</style>`;
      }
    },
  },
  methods: {
    // 处理插槽类型变化
    handleSlotTypeChange() {
      console.log("插槽类型变化:", this.slotConfig.type);
    },

    // 处理按钮类型变化
    handleButtonChange() {
      console.log("按钮类型变化:", this.slotConfig.buttonType);
    },

    // 处理图标变化
    handleIconChange() {
      console.log("图标变化:", this.slotConfig.icon);
    },

    // 处理文本变化
    handleTextChange() {
      console.log("文本变化:", this.slotConfig.text);
    },

    // 清空选择
    clearSelection() {
      this.selectedData = [];
    },

    // 格式化插槽配置
    formatSlotConfig() {
      return JSON.stringify(
        {
          type: this.slotConfig.type,
          buttonType: this.slotConfig.buttonType,
          icon: this.slotConfig.icon,
          text: this.slotConfig.text,
          selectedCount: this.selectedData.length,
        },
        null,
        2
      );
    },

    // 展开示例
    expandExample() {
      this.codeExpanded = ["code"];
    },

    // 收起示例
    collapseExample() {
      this.codeExpanded = [];
    },
  },
};
</script>

<style scoped>
.slot-config-panel {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.slot-config-panel h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.tree-component-area h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.custom-trigger {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
}

.custom-trigger:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}
</style>
