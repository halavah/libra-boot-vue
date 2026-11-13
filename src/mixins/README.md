# Mixins 使用说明

从源项目迁移的通用混入（Mixins），用于复用组件逻辑。

## 📁 文件列表

### 1. BaseMixins.js - 基础混入
提供基础功能，包括数据字典、用户信息等。

**使用方法：**
```vue
<script>
import BaseMixins from '@/mixins/BaseMixins';

export default {
  mixins: [BaseMixins],
  created() {
    // 可以使用混入提供的数据和方法
    this.resetForm('myForm');
  }
}
</script>
```

**提供的功能：**
- `resetForm(refName)` - 重置表单
- `fetchAllUserMap()` - 获取所有用户映射
- `initDictNew(dataName, strSn, callback)` - 初始化数据字典（新版）
- `getDictLabel(arrDict, value)` - 获取数据字典标签
- `initDict(dataName, strSn, callback, dataType)` - 初始化数据字典

---

### 2. ListMixins.js - 列表页面混入
提供列表页面的通用功能：分页、查询、增删改查等。

**使用方法：**
```vue
<script>
import ListMixins from '@/mixins/ListMixins';

export default {
  mixins: [ListMixins],
  data() {
    return {
      url: {
        list: '/api/users/list',
        remove: '/api/users/delete',
        exportUrl: '/api/users/export'
      }
    }
  },
  methods: {
    // 重写钩子
    beforeLoadData() {
      console.log('加载前');
    },
    afterLoadData(data) {
      console.log('加载后', data);
    }
  }
}
</script>
```

**提供的数据：**
- `dataSource` - 数据源数组
- `page` - 分页信息 (current, size, total)
- `queryParam` - 查询参数
- `loading` - 加载状态

**提供的方法：**
- `loadData(arg)` - 加载列表数据
- `searchQuery()` - 搜索查询
- `searchReset()` - 重置搜索
- `handleDelete(id, message)` - 删除数据
- `handleEdit(record)` - 编辑数据
- `handleAdd()` - 新增数据
- `handleExport()` - 导出数据
- `handleImport(data)` - 导入数据

---

### 3. Standard.js - 标准化混入
提供表格高度自适应、图片预览、行选中等标准功能。

**使用方法：**
```vue
<template>
  <el-table
    ref="multipleTableRef"
    :data="dataSource"
    :height="maxTableHeight"
    @row-click="handleRowClick"
  >
    <el-table-column label="图片">
      <template #default="{ row }">
        <img :src="row.image" @click="tableImgPreviewHandle" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import Standard from '@/mixins/Standard';

export default {
  mixins: [Standard],
  mounted() {
    // maxTableHeight 会自动计算
    console.log('表格高度:', this.maxTableHeight);
  }
}
</script>
```

**提供的数据：**
- `maxTableHeight` - 表格自动计算的最大高度
- `selectHandleForm` - 当前选中的行数据
- `queryFormFold` - 搜索表单折叠状态

**提供的方法：**
- `getMaxTableHeight()` - 计算表格最大高度
- `tableImgPreviewHandle(event)` - 表格内图片预览
- `handleRowClick(row)` - 行点击处理

---

## 💡 组合使用示例

```vue
<template>
  <div>
    <el-form ref="queryForm" :model="queryParam">
      <el-form-item label="姓名">
        <el-input v-model="queryParam.name" />
      </el-form-item>
      <el-button @click="searchQuery">搜索</el-button>
      <el-button @click="searchReset">重置</el-button>
    </el-form>

    <el-button @click="handleAdd">新增</el-button>
    <el-button @click="handleExport">导出</el-button>

    <el-table
      ref="multipleTableRef"
      :data="dataSource"
      :height="maxTableHeight"
      :loading="loading"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="姓名" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="handleEdit(row)">编辑</el-button>
          <el-button @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page.current"
      v-model:page-size="page.size"
      :total="page.total"
      @current-change="loadData"
      @size-change="loadData"
    />
  </div>
</template>

<script>
import BaseMixins from '@/mixins/BaseMixins';
import ListMixins from '@/mixins/ListMixins';
import Standard from '@/mixins/Standard';

export default {
  mixins: [BaseMixins, ListMixins, Standard],
  data() {
    return {
      url: {
        list: '/api/users/list',
        remove: '/api/users/delete',
        exportUrl: '/api/users/export'
      }
    }
  }
}
</script>
```

## ⚠️ 注意事项

1. **依赖问题**: 部分 API 在当前项目中不存在，调用时会显示警告信息
2. **学习参考**: 这些文件主要用于学习和参考，可根据实际项目需求修改
3. **图片预览**: `Standard.js` 的图片预览功能需要 `hevue-img-preview` 插件支持
