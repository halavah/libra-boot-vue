<template>
  <div class="example-container">
    <div class="example-header">
      <h3>1. Props 通讯方式</h3>
      <el-tag type="primary">父传子</el-tag>
    </div>

    <div class="example-description">
      <p>
        Props 是 Vue
        组件间最基本的数据传递方式，父组件通过属性向子组件传递数据和配置。这种方式是单向数据流，子组件不能直接修改
        props 传递的数据。
      </p>
    </div>

    <div class="example-demo">
      <div class="demo-area">
        <div class="config-panel">
          <h4>配置面板：</h4>
          <el-form :model="config" label-width="120px" size="small">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="选择类型">
                  <el-select
                    v-model="config.selectType"
                    @change="handleConfigChange"
                  >
                    <el-option label="单选" value="single" />
                    <el-option label="多选" value="multiple" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="激活标签页">
                  <el-select
                    v-model="config.activeNameList"
                    multiple
                    @change="handleConfigChange"
                  >
                    <el-option label="行政组织" value="administrative" />
                    <el-option label="虚拟组织" value="dummy" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="是否禁用">
                  <el-switch
                    v-model="config.disabled"
                    @change="handleConfigChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="切换清空">
                  <el-switch
                    v-model="config.toggleEmpty"
                    @change="handleConfigChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="折叠标签">
                  <el-switch
                    v-model="config.collapseTags"
                    @change="handleConfigChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="自动选中下级">
                  <el-switch
                    v-model="config.isAutomatic"
                    @change="handleConfigChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <div class="tree-component-area">
          <h4>组件演示：</h4>
          <tree-multiple
            ref="treeRef"
            v-model:data-source="selectedData"
            :select-type="config.selectType"
            :active-name-list="config.activeNameList"
            :disabled="config.disabled"
            :toggle-empty="config.toggleEmpty"
            :collapse-tags="config.collapseTags"
            :selectable="config.selectable"
            :filter-child="config.filterChild"
            @change="handleChange"
          />
        </div>
      </div>

      <div class="result-area">
        <h4>Props 传递的数据：</h4>
        <div class="result-content">{{ formatPropsData() }}</div>
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

export default {
  name: "PropsExample",
  components: {
    TreeMultiple,
  },
  data() {
    return {
      // 配置数据
      config: {
        selectType: "multiple",
        activeNameList: ["administrative"],
        disabled: false,
        toggleEmpty: false,
        collapseTags: true,
        selectable: [],
        filterChild: [],
      },
      // 选中的数据
      selectedData: [],
      // 代码展开状态
      codeExpanded: [],
    };
  },
  computed: {
    // 代码示例
    codeExample() {
      return `<template>
  <tree-multiple
    v-model:data-source="selectedData"
    :select-type="${this.config.selectType}"
    :active-name-list="${JSON.stringify(this.config.activeNameList)}"
    :disabled="${this.config.disabled}"
    :toggle-empty="${this.config.toggleEmpty}"
    :collapse-tags="${this.config.collapseTags}"
    :selectable="${JSON.stringify(this.config.selectable)}"
    :filter-child="${JSON.stringify(this.config.filterChild)}"
    @change="handleChange"
  />
</template>

<script>
export default {
  data() {
    return {
      selectedData: []
    }
  },
  methods: {
    handleChange() {
      console.log('数据变化:', this.selectedData);
    }
  }
}
<\/script>`;
    },
  },
  methods: {
    // 处理配置变化
    handleConfigChange() {
      console.log("配置变化:", this.config);
    },

    // 处理数据变化
    handleChange() {
      console.log("数据变化:", this.selectedData);
    },

    // 格式化 Props 数据
    formatPropsData() {
      return JSON.stringify(
        {
          dataSource: this.selectedData,
          ...this.config,
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

    // 新开窗口查看代码
    openCodeInNewWindow() {
      const codeContent = this.codeExample;
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Props Example Code</title>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f5f7fa;
                  padding: 20px;
                }
                pre {
                  background-color: #f9f9f9;
                  padding: 15px;
                  border-radius: 5px;
                  overflow-x: auto;
                  font-size: 14px;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
                code {
                  font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace';
                  font-size: 14px;
                  color: #333;
                  background-color: #f9f9f9;
                  padding: 2px 4px;
                  border-radius: 3px;
                  display: inline-block;
                }
                .code-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 15px;
                }
                .code-header button {
                  margin-left: 10px;
                  padding: 5px 10px;
                  background-color: #409eff;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                }
                .code-header button:hover {
                  background-color: #66b1ff;
                }
              </style>
            </head>
            <body>
              <div class="code-header">
                <h3>Props Example Code</h3>
                <button onclick="window.close()">关闭</button>
              </div>
              <pre><code>${codeContent}</code></pre>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    },

    // 复制代码到剪贴板
    copyCodeToClipboard() {
      const codeElement = document.querySelector(".example-code pre code");
      if (codeElement) {
        const code = codeElement.textContent;
        navigator.clipboard
          .writeText(code)
          .then(() => {
            this.$message({
              message: "代码已复制到剪贴板",
              type: "success",
              duration: 2000,
            });
          })
          .catch((err) => {
            console.error("复制失败:", err);
            this.$message({
              message: "复制失败，请手动复制",
              type: "error",
              duration: 2000,
            });
          });
      }
    },
  },
};
</script>

<style scoped>
.config-panel {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.config-panel h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.tree-component-area h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}
</style>
