<template>
  <div class="example-container">
    <div class="example-header">
      <h3>5. 事件回调通讯方式</h3>
      <el-tag type="danger">事件处理</el-tag>
    </div>

    <div class="example-description">
      <p>
        事件回调是子组件处理内部事件并转发给父组件的通讯方式。子组件监听内部组件的事件，经过处理后触发自定义事件，将相关信息传递给父组件。这种方式实现了子组件内部状态变化向父组件的通知。
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
            @node-click="handleNodeClick"
            @check-change="handleCheckChange"
            @submit-popover="handleSubmit"
            @change="handleChange"
          />
        </div>

        <div class="event-monitor-panel">
          <h4>事件监控面板：</h4>
          <el-tabs v-model="activeTab" type="card">
            <el-tab-pane label="节点点击事件" name="nodeClick">
              <div class="event-list">
                <div
                  v-for="(event, index) in nodeClickEvents"
                  :key="index"
                  class="event-item"
                >
                  <div class="event-header">
                    <span class="event-time">{{ event.time }}</span>
                    <el-tag size="small" :type="event.type">{{
                      event.type
                    }}</el-tag>
                  </div>
                  <div class="event-content">
                    <div class="event-detail">
                      <span class="event-label">节点ID:</span>
                      <span class="event-value">{{ event.data.id }}</span>
                    </div>
                    <div class="event-detail">
                      <span class="event-label">节点名称:</span>
                      <span class="event-value">{{ event.data.deptName }}</span>
                    </div>
                    <div class="event-detail">
                      <span class="event-label">激活标签:</span>
                      <span class="event-value">{{ event.activeName }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="nodeClickEvents.length === 0" class="event-empty">
                  暂无事件记录
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="节点选中事件" name="checkChange">
              <div class="event-list">
                <div
                  v-for="(event, index) in checkChangeEvents"
                  :key="index"
                  class="event-item"
                >
                  <div class="event-header">
                    <span class="event-time">{{ event.time }}</span>
                    <el-tag
                      size="small"
                      :type="event.checked ? 'success' : 'info'"
                    >
                      {{ event.checked ? "选中" : "取消选中" }}
                    </el-tag>
                  </div>
                  <div class="event-content">
                    <div class="event-detail">
                      <span class="event-label">节点ID:</span>
                      <span class="event-value">{{ event.data.id }}</span>
                    </div>
                    <div class="event-detail">
                      <span class="event-label">节点名称:</span>
                      <span class="event-value">{{ event.data.deptName }}</span>
                    </div>
                    <div class="event-detail">
                      <span class="event-label">自动选中下级:</span>
                      <span class="event-value">{{
                        event.isAutomatic ? "是" : "否"
                      }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="checkChangeEvents.length === 0" class="event-empty">
                  暂无事件记录
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="其他事件" name="other">
              <div class="event-list">
                <div
                  v-for="(event, index) in otherEvents"
                  :key="index"
                  class="event-item"
                >
                  <div class="event-header">
                    <span class="event-time">{{ event.time }}</span>
                    <el-tag size="small" :type="event.type">{{
                      event.event
                    }}</el-tag>
                  </div>
                  <div class="event-content">
                    <div class="event-detail">
                      <span class="event-label">事件描述:</span>
                      <span class="event-value">{{ event.description }}</span>
                    </div>
                    <div class="event-detail" v-if="event.data">
                      <span class="event-label">事件数据:</span>
                      <span class="event-value">{{
                        JSON.stringify(event.data)
                      }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="otherEvents.length === 0" class="event-empty">
                  暂无事件记录
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>

          <div class="event-controls">
            <el-button size="small" @click="clearAllEvents"
              >清空所有事件</el-button
            >
            <el-button size="small" type="primary" @click="exportEvents"
              >导出事件记录</el-button
            >
          </div>
        </div>
      </div>

      <div class="result-area">
        <h4>事件统计：</h4>
        <div class="result-content">{{ formatEventStats() }}</div>
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
  name: "EventExample",
  components: {
    TreeMultiple,
  },
  data() {
    return {
      // 选中的数据
      selectedData: [],
      // 当前激活的标签页
      activeTab: "nodeClick",
      // 节点点击事件记录
      nodeClickEvents: [],
      // 节点选中事件记录
      checkChangeEvents: [],
      // 其他事件记录
      otherEvents: [],
      // 代码展开状态
      codeExpanded: [],
    };
  },
  computed: {
    // 代码示例
    codeExample() {
      return `<template>
  <tree-multiple
    ref="treeRef"
    v-model:data-source="selectedData"
    :select-type="'multiple'"
    :active-name-list="['administrative']"
    @node-click="handleNodeClick"
    @check-change="handleCheckChange"
    @submit-popover="handleSubmit"
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
    // 处理节点点击事件
    handleNodeClick(data, activeName) {
      console.log('节点点击:', data, activeName);
      // data: 点击的节点数据
      // activeName: 当前激活的标签页
    },

    // 处理节点选中事件
    handleCheckChange(checkedNode, checkedStatus, activeName) {
      console.log('节点选中:', checkedNode, checkedStatus, activeName);
      // checkedNode: 选中的节点数据
      // checkedStatus: 选中状态对象，包含所有选中的节点
      // activeName: 当前激活的标签页
    },

    // 处理提交事件
    handleSubmit(selectList, list) {
      console.log('提交事件:', selectList, list);
      // selectList: 选中的完整对象数组
      // list: 选中的ID数组
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
    // 处理节点点击事件
    handleNodeClick(data, activeName) {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}`;

      this.nodeClickEvents.unshift({
        time,
        data: { id: data.id, deptName: data.deptName },
        activeName,
        type: "click",
      });

      // 限制事件记录数量
      if (this.nodeClickEvents.length > 20) {
        this.nodeClickEvents = this.nodeClickEvents.slice(0, 20);
      }

      console.log("节点点击:", data, activeName);
    },

    // 处理节点选中事件
    handleCheckChange(checkedNode, checkedStatus, activeName) {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}`;

      const isChecked = checkedStatus.checkedNodes.includes(checkedNode);

      this.checkChangeEvents.unshift({
        time,
        data: { id: checkedNode.id, deptName: checkedNode.deptName },
        checked: isChecked,
        isAutomatic: false, // 这里暂时设为 false，因为 EventExample 中没有这个状态
        type: isChecked ? "success" : "info",
      });

      // 限制事件记录数量
      if (this.checkChangeEvents.length > 20) {
        this.checkChangeEvents = this.checkChangeEvents.slice(0, 20);
      }

      console.log("节点选中:", checkedNode, checkedStatus, activeName);
    },

    // 处理提交事件
    handleSubmit(selectList, list) {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}`;

      this.otherEvents.unshift({
        time,
        event: "submit-popover",
        description: `提交了 ${list.length} 个选中项`,
        data: { count: list.length, items: list },
        type: "primary",
      });

      // 限制事件记录数量
      if (this.otherEvents.length > 20) {
        this.otherEvents = this.otherEvents.slice(0, 20);
      }

      console.log("提交事件:", selectList, list);
    },

    // 处理变化事件
    handleChange() {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, "0")}`;

      this.otherEvents.unshift({
        time,
        event: "change",
        description: "数据发生变化",
        type: "warning",
      });

      // 限制事件记录数量
      if (this.otherEvents.length > 20) {
        this.otherEvents = this.otherEvents.slice(0, 20);
      }

      console.log("数据变化");
    },

    // 清空所有事件
    clearAllEvents() {
      this.nodeClickEvents = [];
      this.checkChangeEvents = [];
      this.otherEvents = [];
    },

    // 导出事件记录
    exportEvents() {
      const allEvents = [
        ...this.nodeClickEvents.map((e) => ({
          ...e,
          category: "节点点击事件",
        })),
        ...this.checkChangeEvents.map((e) => ({
          ...e,
          category: "节点选中事件",
        })),
        ...this.otherEvents.map((e) => ({ ...e, category: "其他事件" })),
      ];

      const eventText = allEvents
        .map(
          (event) =>
            `[${event.time}] ${event.category}: ${
              event.description || JSON.stringify(event.data)
            }`
        )
        .join("\n");

      const blob = new Blob([eventText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event-log-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },

    // 格式化事件统计
    formatEventStats() {
      return JSON.stringify(
        {
          nodeClickEvents: this.nodeClickEvents.length,
          checkChangeEvents: this.checkChangeEvents.length,
          otherEvents: this.otherEvents.length,
          totalEvents:
            this.nodeClickEvents.length +
            this.checkChangeEvents.length +
            this.otherEvents.length,
          selectedDataCount: this.selectedData.length,
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
      const codeWindow = window.open("", "_blank");
      codeWindow.document.write(
        `<html><head><title>代码示例</title></head><body><pre><code>${this.codeExample}</code></pre></body></html>`
      );
      codeWindow.document.close();
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

.event-monitor-panel h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.event-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.event-item {
  border-bottom: 1px solid #ebeef5;
  padding: 12px;
}

.event-item:last-child {
  border-bottom: none;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-time {
  font-size: 12px;
  color: #909399;
  font-family: "Courier New", monospace;
}

.event-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-detail {
  display: flex;
  font-size: 13px;
}

.event-label {
  flex-shrink: 0;
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.event-value {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

.event-empty {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.event-controls {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
