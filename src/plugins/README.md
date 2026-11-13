# Plugins 使用说明

Vue 全局插件，提供缓存、弹窗等通用功能。

## 📁 文件列表

### 1. cache.js - 缓存工具
封装 localStorage 和 sessionStorage 的操作。

**功能：**
- `session.set(key, value)` - 设置会话缓存
- `session.get(key)` - 获取会话缓存
- `session.setJSON(key, jsonValue)` - 设置 JSON 会话缓存
- `session.getJSON(key)` - 获取 JSON 会话缓存
- `session.remove(key)` - 删除会话缓存
- `local.set(key, value)` - 设置本地缓存
- `local.get(key)` - 获取本地缓存
- `local.setJSON(key, jsonValue)` - 设置 JSON 本地缓存
- `local.getJSON(key)` - 获取 JSON 本地缓存
- `local.remove(key)` - 删除本地缓存

**使用示例：**
```vue
<script>
export default {
  mounted() {
    // 会话缓存
    this.$cache.session.set('token', 'abc123');
    const token = this.$cache.session.get('token');

    // 本地缓存
    this.$cache.local.setJSON('user', { name: 'John', age: 30 });
    const user = this.$cache.local.getJSON('user');
    console.log(user.name); // 'John'

    // 删除缓存
    this.$cache.session.remove('token');
    this.$cache.local.remove('user');
  }
}
</script>
```

---

### 2. modal.js - 弹窗工具
封装 Element Plus 的消息提示、弹窗、通知等功能。

**消息提示：**
- `msg(content)` - 普通消息
- `msgSuccess(content)` - 成功消息
- `msgError(content)` - 错误消息
- `msgWarning(content)` - 警告消息

**弹窗提示：**
- `alert(content)` - 普通弹窗
- `alertSuccess(content, config)` - 成功弹窗
- `alertError(content, config)` - 错误弹窗
- `alertWarning(content)` - 警告弹窗
- `confirm(content)` - 确认弹窗
- `prompt(content)` - 输入弹窗

**通知：**
- `notify(content)` - 普通通知
- `notifySuccess(content)` - 成功通知
- `notifyError(content)` - 错误通知
- `notifyWarning(content)` - 警告通知

**加载遮罩：**
- `loading(content)` - 打开加载遮罩
- `closeLoading()` - 关闭加载遮罩
- `closeAllLoading()` - 强制关闭所有遮罩

**使用示例：**
```vue
<script>
export default {
  methods: {
    async handleSubmit() {
      // 消息提示
      this.$modal.msgSuccess('保存成功');

      // 确认弹窗
      this.$modal.confirm('确认删除吗？').then(() => {
        // 用户点击确认
        this.deleteItem();
      }).catch(() => {
        // 用户点击取消
      });

      // 加载遮罩
      const loading = this.$modal.loading('加载中...');
      try {
        await this.fetchData();
      } finally {
        this.$modal.closeLoading();
      }

      // 通知
      this.$modal.notifySuccess('操作完成');
    }
  }
}
</script>
```

**快捷方法（全局属性）：**
```vue
<script>
export default {
  methods: {
    save() {
      // 直接使用快捷方法
      this.msgSuccess('保存成功');
      this.msgError('保存失败');
      this.msgWarning('请注意');
    }
  }
}
</script>
```

---

### 3. index.js - 插件入口
统一注册所有插件到 Vue 应用。

**安装方法：**

在 `main.js` 中引入并使用：
```javascript
import { createApp } from 'vue';
import App from './App.vue';
import installPlugins from '@/plugins';

const app = createApp(App);

// 安装插件
installPlugins(app);

app.mount('#app');
```

**提供的全局属性：**
- `$cache` - 缓存工具
- `$modal` - 弹窗工具
- `msgSuccess` - 成功消息（快捷方法）
- `msgWarning` - 警告消息（快捷方法）
- `msgError` - 错误消息（快捷方法）

---

## 💡 完整使用示例

### 示例 1：用户登录

```vue
<template>
  <el-form @submit.prevent="handleLogin">
    <el-form-item label="用户名">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
    <el-button type="primary" native-type="submit">登录</el-button>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  mounted() {
    // 读取缓存的用户名
    const savedUsername = this.$cache.local.get('username');
    if (savedUsername) {
      this.form.username = savedUsername;
    }
  },
  methods: {
    async handleLogin() {
      const loading = this.$modal.loading('登录中...');

      try {
        // 模拟 API 调用
        const res = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(this.form)
        });

        if (res.ok) {
          const data = await res.json();

          // 保存 token
          this.$cache.session.set('token', data.token);

          // 保存用户信息
          this.$cache.local.setJSON('user', data.user);

          // 记住用户名
          this.$cache.local.set('username', this.form.username);

          this.msgSuccess('登录成功');
          this.$router.push('/dashboard');
        } else {
          this.msgError('用户名或密码错误');
        }
      } catch (error) {
        this.msgError('登录失败，请重试');
      } finally {
        this.$modal.closeLoading();
      }
    }
  }
}
</script>
```

### 示例 2：数据删除确认

```vue
<template>
  <el-button @click="handleDelete">删除</el-button>
</template>

<script>
export default {
  methods: {
    handleDelete() {
      this.$modal.confirm('确认删除这条数据吗？').then(async () => {
        const loading = this.$modal.loading('删除中...');

        try {
          await fetch('/api/delete', { method: 'DELETE' });
          this.msgSuccess('删除成功');
          this.refreshList();
        } catch (error) {
          this.msgError('删除失败');
        } finally {
          this.$modal.closeLoading();
        }
      }).catch(() => {
        // 用户取消删除
      });
    }
  }
}
</script>
```

### 示例 3：表单验证提示

```vue
<script>
export default {
  methods: {
    validateForm() {
      if (!this.form.name) {
        this.msgWarning('请输入姓名');
        return false;
      }

      if (!this.form.email) {
        this.$modal.alertWarning('请输入邮箱地址');
        return false;
      }

      return true;
    },

    async handleSubmit() {
      if (!this.validateForm()) return;

      const loading = this.$modal.loading('提交中...');
      try {
        await this.submitData();
        this.$modal.notifySuccess('提交成功');
      } catch (error) {
        this.$modal.notifyError('提交失败');
      } finally {
        this.$modal.closeLoading();
      }
    }
  }
}
</script>
```

---

## ⚠️ 注意事项

1. **缓存大小限制**：localStorage 和 sessionStorage 通常有 5-10MB 的大小限制
2. **JSON 序列化**：使用 `setJSON` 时，确保数据可以被 JSON.stringify 序列化
3. **加载遮罩**：记得在操作完成后调用 `closeLoading()` 关闭遮罩
4. **错误处理**：所有 Promise 方法（如 confirm）都应该处理 catch 情况
