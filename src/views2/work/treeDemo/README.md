# TreeDemo 树形组件通讯方式示例

## 项目概述

TreeDemo 是一个展示 TreeMultiple 组件五种父子组件通讯方式的示例项目。该项目采用三段式布局，通过五个独立的示例组件，清晰展示了 Vue 组件间常见的通讯模式。

## 项目结构

```
treeDemo/
├── README.md          # 项目说明文档
├── index.vue          # 主页面，三段式布局
├── 项目进度报告.md      # 项目进度报告
└── components/        # 示例组件目录
    ├── PropsExample.vue      # Props 通讯示例
    ├── EmitExample.vue       # Emit 通讯示例
    ├── RefExample.vue        # Ref 通讯示例
    ├── SlotExample.vue       # 插槽通讯示例
    └── EventExample.vue      # 事件回调通讯示例
```

## 布局设计

项目采用三段式布局结构：

```
┌─────────────────────────────────────┐
│          顶部标题区域                │  (固定高度)
├─────────────────────────────────────┤
│                                     │
│          中间表单区域                │  (自适应高度)
│    ┌───────────────────────────┐  │
│    │  示例1: Props通讯方式      │  │
│    │  示例2: Emit通讯方式       │  │
│    │  示例3: Ref通讯方式        │  │
│    │  示例4: 插槽通讯方式       │  │
│    │  示例5: 事件回调通讯方式    │  │
│    └───────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│          底部操作区域                │  (固定高度)
└─────────────────────────────────────┘
```

## 示例说明

### 1. Props 通讯示例 (PropsExample.vue)

展示父组件如何通过 Props 向子组件传递数据和配置。

**功能特点：**
- 演示基本数据传递
- 演示配置参数的使用
- 实时显示传递的数据变化
- 提供新开窗口查看代码功能
- 支持一键复制代码

**核心代码：**
```vue
<tree-multiple
  v-model:data-source="selectedData"
  :select-type="'multiple'"
  :active-name-list="['administrative']"
  :disabled="false"
/>
```

### 2. Emit 通讯示例 (EmitExample.vue)

展示子组件如何通过 Emit 向父组件发送事件通知。

**功能特点：**
- 演示事件触发和监听
- 演示事件参数传递
- 实时显示事件触发日志
- 提供新开窗口查看代码功能
- 支持一键复制代码

**核心代码：**
```vue
<tree-multiple
  @submit-popover="handleSubmit"
  @update:dataSource="handleUpdate"
  @change="handleChange"
/>
```

### 3. Ref 通讯示例 (RefExample.vue)

展示父组件如何通过 Ref 直接调用子组件方法。

**功能特点：**
- 演示获取子组件实例
- 演示直接调用子组件方法
- 实时显示方法调用结果
- 提供新开窗口查看代码功能
- 支持一键复制代码

**核心代码：**
```vue
<tree-multiple ref="treeRef" />
<button @click="callChildMethod">调用子组件方法</button>
```

### 4. 插槽通讯示例 (SlotExample.vue)

展示父组件如何通过插槽向子组件传入自定义内容。

**功能特点：**
- 演示具名插槽的使用
- 演示自定义触发内容
- 对比默认和自定义插槽效果
- 提供新开窗口查看代码功能
- 支持一键复制代码

**核心代码：**
```vue
<tree-multiple>
  <template #reference>
    <el-button type="primary">自定义选择按钮</el-button>
  </template>
</tree-multiple>
```

### 5. 事件回调通讯示例 (EventExample.vue)

展示子组件如何处理内部事件并转发给父组件。

**功能特点：**
- 演示内部事件处理
- 演示事件参数传递
- 实时显示事件处理日志
- 提供新开窗口查看代码功能
- 支持一键复制代码

**核心代码：**
```vue
<tree-multiple
  @node-click="handleNodeClick"
  @check-change="handleCheckChange"
/>
```

## 技术实现

### 三段式布局实现

```css
.root-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header-section {
  flex-shrink: 0;
  height: 60px;
}

.content-section {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.footer-section {
  flex-shrink: 0;
  height: 50px;
}
```

### 组件通用结构

每个示例组件采用统一的结构：

```vue
<template>
  <div class="example-container">
    <div class="example-header">
      <h3>{{ title }}</h3>
      <el-tag :type="tagType">{{ tagText }}</el-tag>
    </div>

    <div class="example-description">
      <p>{{ description }}</p>
    </div>

    <div class="example-demo">
      <div class="demo-area">
        <!-- TreeMultiple 组件演示区域 -->
      </div>

      <div class="result-area">
        <h4>结果展示：</h4>
        <div class="result-content">
          <!-- 结果展示区域 -->
        </div>
      </div>
    </div>

    <div class="example-code">
      <div class="code-header">
        <el-button size="small" type="primary" @click="openCodeInNewWindow">
          新开窗口查看代码
        </el-button>
        <el-button size="small" @click="copyCodeToClipboard">
          复制代码
        </el-button>
        <el-collapse v-model="codeExpanded">
          <el-collapse-item title="查看代码" name="code">
            <pre><code>{{ codeExample }}</code></pre>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>
```

## 使用说明

1. **启动项目**
   ```bash
   npm run dev
   ```

2. **访问示例**
   ```
   http://localhost:3000/#/work/treeDemo
   ```

3. **查看示例**
   - 滚动中间区域查看所有示例
   - 点击每个示例进行交互操作
   - 查看代码示例了解实现细节
   - 使用"新开窗口"功能在新窗口中查看代码
   - 使用"复制代码"功能快速复制代码示例

## 扩展指南

### 添加新示例

1. 在 `components` 目录下创建新组件
2. 在 `index.vue` 中引入并注册组件
3. 在模板中添加新示例组件
4. 更新 README.md 文档

### 自定义样式

1. 修改 `index.vue` 中的全局样式
2. 在组件中使用 `scoped` 样式
3. 使用深度选择器修改 TreeMultiple 组件样式

## 注意事项

1. 示例项目依赖 Element Plus，使用前请确保已正确安装
2. 示例采用 Vue 3 的 Options API 语法
3. 所有示例共享相同的模拟数据源
4. 为避免示例间相互影响，每个示例维护独立的状态
5. 代码示例展示功能使用了 Clipboard API，需要 HTTPS 环境或 localhost 环境才能正常工作

## 相关文档

- [TreeMultiple 组件文档](../treeMultiple/README.md)
- [Vue 3 官方文档](https://v3.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [三段式布局指南](../../../docs/02.frame/12.三段式布局：上下固定+中适应.md)

## 更新日志

### v1.1.0
- 合并 CSS 和 JS 文件到主 index.vue 文件
- 为所有示例组件添加新开窗口功能
- 为所有示例组件添加代码复制功能
- 修复 SlotExample 组件代码示例中的条件判断语法错误
- 修复 EventExample 组件中的 isAutomatic 变量引用问题

### v1.0.0
- 初始版本发布
- 实现 5 种通讯方式示例
- 采用三段式布局设计
- 添加代码示例和说明文档
