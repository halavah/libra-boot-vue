# TreeMultiple 树形多选组件

## 组件概述

TreeMultiple 是一个基于 Vue 3 和 Element Plus 的树形多选组件，支持单选和多选模式，提供了丰富的配置选项和多种父子组件通讯方式。该组件采用三文件分离结构（Vue、JS、CSS），便于维护和扩展。

## 功能特性

- ✅ 支持单选和多选模式
- ✅ 支持行政组织和虚拟组织两种数据源
- ✅ 支持搜索过滤功能
- ✅ 支持自动选中下级功能
- ✅ 支持自定义插槽内容
- ✅ 提供多种父子组件通讯方式
- ✅ 响应式设计，适配不同屏幕尺寸

## 组件结构

```
treeMultiple/
├── index.vue      # 主组件文件
├── js/
│   ├── index.js   # 组件逻辑
│   └── mockData.js # 模拟数据
└── css/
    └── index.css  # 组件样式
```

## 通讯方式

### 1. Props（父传子）

父组件通过 props 向子组件传递数据和配置：

```vue
<template>
  <tree-multiple
    :data-source="selectedData"
    :active-name-list="['administrative', 'dummy']"
    :select-type="'multiple'"
    :disabled="false"
    :toggle-empty="true"
    :collapse-tags="true"
    :selectable="[]"
    :filter-child="[]"
  />
</template>
```

**主要 Props 参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| dataSource | Array/String | - | 数据源，可以是数组或字符串 |
| activeNameList | Array | ['administrative'] | 激活的标签页列表 |
| selectType | String | 'single' | 选择类型：single/multiple |
| disabled | Boolean | false | 是否禁用 |
| toggleEmpty | Boolean | false | 切换时清空选中项 |
| collapseTags | Boolean | true | 多选是否折叠 |
| selectable | Array | [] | 禁用勾选的数据 |
| filterChild | Array | [] | 筛选对应的子数据 |

### 2. Emit（子传父）

子组件通过 emit 向父组件发送事件通知：

```vue
<template>
  <tree-multiple
    @submit-popover="handleSubmit"
    @update:dataSource="handleUpdate"
    @change="handleChange"
  />
</template>
```

**主要事件：**

| 事件名 | 参数 | 说明 |
|--------|------|------|
| submitPopover | selectList, list | 提交数据事件 |
| update:dataSource | value | 更新数据源 |
| change | - | 数据变化事件 |

### 3. Ref + defineExpose（父直接访问子方法/状态）

父组件可以通过 ref 获取子组件实例，直接调用子组件方法：

```vue
<template>
  <tree-multiple ref="treeMultipleRef" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>

<script>
export default {
  methods: {
    callChildMethod() {
      this.$refs.treeMultipleRef.submitPopoverRefManual();
    }
  }
}
</script>
```

**可调用的方法：**

| 方法名 | 参数 | 说明 |
|--------|------|------|
| submitPopoverRefManual | - | 手动调用提交方法 |

### 4. 插槽

父组件可以通过插槽向子组件传入自定义内容：

```vue
<template>
  <tree-multiple>
    <template #reference>
      <el-button>自定义触发按钮</el-button>
    </template>
  </tree-multiple>
</template>
```

**可用插槽：**

| 插槽名 | 说明 |
|--------|------|
| reference | 自定义触发内容 |

### 5. 事件回调

子组件处理内部事件并转发给父组件：

```vue
<template>
  <tree-multiple
    @node-click="handleNodeClick"
    @check-change="handleCheckChange"
  />
</template>
```

**主要事件回调：**

| 事件名 | 参数 | 说明 |
|--------|------|------|
| node-click | data, activeName | 树节点点击事件 |
| check-change | checkedNode, checkedStatus, activeName | 树节点选中事件 |

## 数据结构

### 行政组织数据

```javascript
{
  id: '1',                    // 节点ID
  deptName: '演示团队046',         // 部门名称
  children: [                 // 子节点
    {
      id: '11',
      deptName: '演示团队047',
      children: []
    }
  ]
}
```

### 虚拟组织数据

```javascript
{
  id: 'v1',                  // 节点ID
  name: '演示团队048',           // 组织名称
  deptName: '演示团队048',        // 转换后的字段名
  orgType: 2,                // 组织类型
  children: []               // 子节点
}
```

## 使用示例

### 基本使用

```vue
<template>
  <div>
    <tree-multiple
      v-model:data-source="selectedData"
      :select-type="'multiple'"
      :active-name-list="['administrative']"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedData: []
    }
  }
}
</script>
```

### 高级使用

```vue
<template>
  <div>
    <tree-multiple
      ref="treeRef"
      v-model:data-source="selectedData"
      :select-type="'multiple'"
      :active-name-list="['administrative', 'dummy']"
      :toggle-empty="true"
      @submit-popover="handleSubmit"
      @change="handleChange"
    >
      <template #reference>
        <el-button type="primary">选择组织</el-button>
      </template>
    </tree-multiple>

    <el-button @click="clearSelection">清空选择</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedData: []
    }
  },
  methods: {
    handleSubmit(selectList, list) {
      console.log('提交数据:', selectList, list);
    },
    handleChange() {
      console.log('数据变化');
    },
    clearSelection() {
      this.selectedData = [];
    }
  }
}
</script>
```

## 注意事项

1. 组件依赖 Element Plus，使用前请确保已正确安装
2. 组件采用 Vue 3 的 Options API 语法
3. 数据源中的 id 字段必须是唯一值
4. 多选模式下，建议开启 collapse-tags 以避免选中项过多时占用过多空间
5. 如需自定义样式，请使用深度选择器或修改 CSS 变量

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的单选和多选功能
- 提供 5 种父子组件通讯方式
- 支持行政组织和虚拟组织两种数据源
