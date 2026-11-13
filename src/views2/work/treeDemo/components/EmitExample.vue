<template>
  <div class="example-container">
    <div class="example-header">
      <h3>2. Emit 通讯方式</h3>
      <el-tag type="success">子传父</el-tag>
    </div>

    <div class="example-description">
      <p>
        Emit
        是子组件向父组件传递信息的主要方式，子组件通过触发事件向父组件发送数据或通知。这种方式实现了子组件到父组件的通讯，是
        Vue 组件间通讯的重要模式。
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
            @submit-popover="handleSubmit"
            @update:dataSource="handleUpdate"
            @change="handleChange"
          />
        </div>

        <div class="event-log-area">
          <h4>事件日志：</h4>
          <div class="log-container">
            <div class="log-controls">
              <el-button size="small" @click="clearLog">清空日志</el-button>
              <el-button size="small" type="primary" @click="exportLog"
                >导出日志</el-button
              >
            </div>
            <div class="log-content">
              <div
                v-for="(log, index) in eventLogs"
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <span class="log-time">{{ log.time }}</span>
                <span class="log-event">{{ log.event }}</span>
                <span class="log-data">{{ log.data }}</span>
              </div>
              <div v-if="eventLogs.length === 0" class="log-empty">
                暂无事件日志
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="result-area">
        <h4>当前选中数据：</h4>
        <div class="result-content">{{ formatSelectedData() }}</div>
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
  name: "EmitExample",
  components: {
    TreeMultiple,
  },
  data() {
    return {
      // 选中的数据
      selectedData: [],
      // 事件日志
      eventLogs: [],
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
    :select-type="'multiple'"
    :active-name-list="['administrative']"
    @submit-popover="handleSubmit"
    @update:dataSource="handleUpdate"
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
    // 处理提交事件
    handleSubmit(selectList, list) {
      console.log('提交事件:', selectList, list);
      // selectList: 选中的完整对象数组
      // list: 选中的ID数组
    },

    // 处理数据更新事件
    handleUpdate(value) {
      console.log('数据更新:', value);
      // value: 更新后的数据值
    },

    // 处理变化事件
    handleChange() {
      console.log('数据变化');
      // 数据发生变化时触发
    }
  }
}
<\/script>`;
    },
  },
  methods: {
    // 处理提交事件
    handleSubmit(selectList, list) {
      this.addLog("submit-popover", `选中项: ${list.length}个`, "info");
      console.log("提交事件:", selectList, list);
    },

    // 处理数据更新事件
    handleUpdate(value) {
      this.addLog(
        "update:dataSource",
        `数据: ${JSON.stringify(value)}`,
        "warning"
      );
      console.log("数据更新:", value);
    },

    // 处理变化事件
    handleChange() {
      this.addLog("change", "数据发生变化", "success");
      console.log("数据变化");
    },

    // 添加日志
    addLog(event, data, type = "info") {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}`;

      this.eventLogs.unshift({
        time,
        event,
        data,
        type,
      });

      // 限制日志数量
      if (this.eventLogs.length > 50) {
        this.eventLogs = this.eventLogs.slice(0, 50);
      }
    },

    // 清空日志
    clearLog() {
      this.eventLogs = [];
    },

    // 导出日志
    exportLog() {
      const logText = this.eventLogs
        .map((log) => `[${log.time}] ${log.event}: ${log.data}`)
        .join("\n");
      const blob = new Blob([logText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event-log-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },

    // 格式化选中数据
    formatSelectedData() {
      return JSON.stringify(this.selectedData, null, 2);
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
              <title>代码示例</title>
              <style>
                body {
                  font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace';
                  font-size: 14px;
                  line-height: 1.6;
                  padding: 20px;
                  background-color: #f5f7fa;
                  color: #303133;
                }
                pre {
                  background-color: #fff;
                  padding: 15px;
                  border-radius: 8px;
                  overflow-x: auto;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                  border: 1px solid #dcdfe6;
                }
                code {
                  color: #409eff;
                }
              </style>
            </head>
            <body>
              <h2>代码示例</h2>
              <pre><code>${codeContent}</code></pre>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
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

.event-log-area h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.log-container {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.log-controls {
  padding: 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  gap: 8px;
}

.log-content {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background-color: #fff;
}

.log-item {
  display: flex;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
}

.log-item:last-child {
  margin-bottom: 0;
}

.log-item.info {
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
}

.log-item.success {
  background-color: #f0f9ff;
  border-left: 3px solid #67c23a;
}

.log-item.warning {
  background-color: #fdf6ec;
  border-left: 3px solid #e6a23c;
}

.log-time {
  flex-shrink: 0;
  width: 80px;
  color: #909399;
}

.log-event {
  flex-shrink: 0;
  width: 140px;
  font-weight: bold;
  color: #303133;
}

.log-data {
  flex: 1;
  color: #606266;
  word-break: break-all;
}

.log-empty {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}
</style>
