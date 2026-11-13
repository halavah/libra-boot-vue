<template>
  <div class="example-container">
    <div class="example-header">
      <h3>3. Ref 通讯方式</h3>
      <el-tag type="warning">父调用子</el-tag>
    </div>

    <div class="example-description">
      <p>
        Ref 通讯方式允许父组件直接访问子组件的实例和方法，通过 ref
        获取子组件引用后，可以直接调用子组件的方法或访问其数据。这种方式适用于需要父组件主动控制子组件行为的场景。
      </p>
    </div>

    <div class="example-demo">
      <div class="demo-area">
        <div class="tree-component-area">
          <h4>组件演示：</h4>
          <tree-multiple
            ref="treeRef"
            v-model:data-source="selectedData"
            :select-type="'multiple'"
            :active-name-list="['administrative']"
          />
        </div>

        <div class="control-panel">
          <h4>控制面板：</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-button
                type="primary"
                @click="callSubmitPopoverRefManual"
                :disabled="!treeRef"
              >
                调用 submitPopoverRefManual
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button @click="getSelectedData" :disabled="!treeRef">
                获取选中数据
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button
                type="danger"
                @click="clearSelection"
                :disabled="!treeRef"
              >
                清空选择
              </el-button>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 16px">
            <el-col :span="12">
              <el-button
                type="success"
                @click="expandAllNodes"
                :disabled="!treeRef"
              >
                展开所有节点
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button
                type="info"
                @click="collapseAllNodes"
                :disabled="!treeRef"
              >
                折叠所有节点
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <div class="result-area">
        <h4>方法调用结果：</h4>
        <div class="result-content">{{ methodCallResult }}</div>
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
  name: "RefExample",
  components: {
    TreeMultiple,
  },
  data() {
    return {
      // 选中的数据
      selectedData: [],
      // TreeMultiple 组件引用
      treeRef: null,
      // 方法调用结果
      methodCallResult: "等待操作...",
      // 代码展开状态
      codeExpanded: [],
    };
  },
  computed: {
    // 代码示例
    codeExample() {
      return `<template>
  <div>
    <!-- 通过 ref 获取子组件引用 -->
    <tree-multiple
      ref="treeRef"
      v-model:data-source="selectedData"
      :select-type="'multiple'"
      :active-name-list="['administrative']"
    />

    <!-- 控制按钮 -->
    <el-button @click="callChildMethod">调用子组件方法</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedData: [],
      treeRef: null
    }
  },
  methods: {
    // 调用子组件方法
    callChildMethod() {
      if (this.treeRef) {
        // 直接调用子组件暴露的方法
        this.treeRef.submitPopoverRefManual();

        // 访问子组件数据
        console.log('子组件数据:', this.treeRef.selectList);

        // 调用子组件其他方法
        console.log('子组件方法:', this.treeRef.openPopover);
      }
    }
  }
}
<\/script>`;
    },
  },
  mounted() {
    // 组件挂载后，treeRef 将指向 TreeMultiple 组件实例
    this.$nextTick(() => {
      this.methodCallResult = "组件已挂载，可以调用方法";
    });
  },
  methods: {
    // 调用 submitPopoverRefManual 方法
    callSubmitPopoverRefManual() {
      if (
        this.treeRef &&
        typeof this.treeRef.submitPopoverRefManual === "function"
      ) {
        this.treeRef.submitPopoverRefManual();
        this.methodCallResult = `成功调用 submitPopoverRefManual 方法\\n时间: ${new Date().toLocaleTimeString()}`;
      } else {
        this.methodCallResult = "调用失败：方法不存在或组件未挂载";
      }
    },

    // 获取选中数据
    getSelectedData() {
      if (this.treeRef) {
        const data = this.treeRef.selectList || [];
        this.methodCallResult = `当前选中数据:\\n${JSON.stringify(
          data,
          null,
          2
        )}`;
      } else {
        this.methodCallResult = "获取失败：组件未挂载";
      }
    },

    // 清空选择
    clearSelection() {
      if (this.treeRef) {
        this.selectedData = [];
        this.methodCallResult = `已清空选择\\n时间: ${new Date().toLocaleTimeString()}`;
      } else {
        this.methodCallResult = "清空失败：组件未挂载";
      }
    },

    // 展开所有节点
    expandAllNodes() {
      if (this.treeRef && this.treeRef.treeRef) {
        // 通过 treeRef 访问 el-tree-v2 组件实例
        const treeInstance = this.treeRef.treeRef;
        if (
          treeInstance &&
          typeof treeInstance.setExpandedKeys === "function"
        ) {
          // 获取所有节点ID
          const allNodeIds = this.getAllNodeIds(this.treeRef.treeData);
          treeInstance.setExpandedKeys(allNodeIds);
          this.methodCallResult = `已展开所有节点\\n节点数量: ${
            allNodeIds.length
          }\\n时间: ${new Date().toLocaleTimeString()}`;
        } else {
          this.methodCallResult = "展开失败：树组件实例不存在或方法不可用";
        }
      } else {
        this.methodCallResult = "展开失败：组件未挂载";
      }
    },

    // 折叠所有节点
    collapseAllNodes() {
      if (this.treeRef && this.treeRef.treeRef) {
        const treeInstance = this.treeRef.treeRef;
        if (
          treeInstance &&
          typeof treeInstance.setExpandedKeys === "function"
        ) {
          treeInstance.setExpandedKeys([]);
          this.methodCallResult = `已折叠所有节点\\n时间: ${new Date().toLocaleTimeString()}`;
        } else {
          this.methodCallResult = "折叠失败：树组件实例不存在或方法不可用";
        }
      } else {
        this.methodCallResult = "折叠失败：组件未挂载";
      }
    },

    // 递归获取所有节点ID
    getAllNodeIds(nodes) {
      let ids = [];
      nodes.forEach((node) => {
        ids.push(node.id);
        if (node.children && node.children.length > 0) {
          ids = ids.concat(this.getAllNodeIds(node.children));
        }
      });
      return ids;
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
      newWindow.document.write(`
        <html>
          <head>
            <title>Ref Example Code</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                padding: 20px;
                background-color: #f5f7fa;
                color: #303133;
              }
              pre {
                background-color: #f9fafc;
                padding: 15px;
                border-radius: 4px;
                overflow-x: auto;
                font-size: 14px;
                color: #5e6d82;
                border: 1px solid #ebeef5;
              }
              code {
                font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace';
                font-size: 14px;
                color: #5e6d82;
                background-color: #f9fafc;
                padding: 2px 4px;
                border-radius: 3px;
                border: 1px solid #ebeef5;
              }
              .el-button {
                margin-bottom: 15px;
              }
            </style>
          </head>
          <body>
            <h2>Ref Example Code</h2>
            <div class="code-header">
              <el-button size="small" type="primary" @click="openCodeInNewWindow">
                新开窗口查看代码
              </el-button>
            </div>
            <el-collapse v-model="codeExpanded">
              <el-collapse-item title="查看代码" name="code">
                <pre><code>${codeContent}</code></pre>
              </el-collapse-item>
            </el-collapse>
          </body>
        </html>
      `);
      newWindow.document.close();
    },
  },
};
</script>

<style scoped>
.tree-component-area {
  margin-bottom: 20px;
}

.tree-component-area h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.control-panel h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.control-panel .el-button {
  width: 100%;
  margin-bottom: 8px;
}
</style>
