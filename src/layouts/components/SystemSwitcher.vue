<template>
  <div class="system-switcher">
    <el-dropdown @command="handleSwitch" trigger="click" placement="bottom">
      <div class="system-title">
        <el-icon class="system-icon">
          <component :is="currentSystem?.icon || 'Grid'" />
        </el-icon>
        <span class="system-name">{{ currentSystem?.title || '系统' }}</span>
        <el-icon class="arrow-icon">
          <ArrowDown />
        </el-icon>
      </div>

      <template #dropdown>
        <el-dropdown-menu class="system-dropdown">
          <!-- 首页选项 -->
          <el-dropdown-item command="home" class="home-item">
            <div class="item-content">
              <span class="item-title">首页</span>
            </div>
          </el-dropdown-item>

          <!-- 系统列表 -->
          <el-dropdown-item
            v-for="system in availableSystems"
            :key="system.id"
            :command="system.id"
            :class="{ 'is-active': system.id === currentSystemId }"
            class="system-item"
          >
            <div class="item-content">
              <span class="item-title">{{ system.title }}</span>
              <el-icon v-if="system.id === currentSystemId" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowDown, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useSystemSwitcherStore } from '../config/system-store';

export default {
  name: 'SystemSwitcher',

  components: {
    ArrowDown,
    Check
  },

  setup() {
    const router = useRouter();
    const systemStore = useSystemSwitcherStore();

    // 计算属性
    const currentSystemId = computed(() => systemStore.currentSystemId);
    const currentSystem = computed(() => systemStore.currentSystem);
    const availableSystems = computed(() => systemStore.availableSystems);

    /**
     * 处理系统切换
     * @param {string} command - 'home' 或系统ID
     */
    function handleSwitch(command) {
      // 点击首页
      if (command === 'home') {
        router.push('/');
        return;
      }

      // 点击系统切换
      if (command === currentSystemId.value) {
        return;
      }

      const success = systemStore.switchSystem(command);

      if (success) {
        ElMessage.success({
          message: `已切换到 ${systemStore.currentSystem?.title}`,
          duration: 1500
        });

        // 不再刷新页面，通过响应式更新实现丝滑切换
        // Vue 的响应式系统会自动更新菜单
      } else {
        ElMessage.error('系统切换失败');
      }
    }

    return {
      currentSystemId,
      currentSystem,
      availableSystems,
      handleSwitch
    };
  }
}
</script>

<style scoped>
/* 系统切换器样式 */
.system-switcher {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 系统标题 */
.system-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  user-select: none;
  width: 100%;
}

.system-title:hover {
  background: rgba(255, 255, 255, 0.1);
}

.system-icon {
  font-size: 18px;
  color: #5aa7ff;
}

.system-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #f2f6fa;
}

.arrow-icon {
  font-size: 12px;
  color: #c0c4cc;
  transition: transform 0.3s ease;
}

/* 下拉菜单 */
.system-dropdown {
  min-width: 180px;
  max-height: 400px;
}

/* 首页菜单项 */
.home-item {
  padding: 0;
}

.home-item .item-content {
  padding: 10px 16px;
}

.home-item:hover {
  background: #f5f7fa;
}

/* 系统列表项 */
.system-item {
  padding: 0;
}

.system-item.is-active {
  background: #ecf5ff;
}

.system-item.is-active .item-title {
  color: #409eff;
  font-weight: 600;
}

.item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  width: 100%;
}

.item-title {
  flex: 1;
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
}

.check-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: #409eff;
  margin-left: 8px;
}

/* 鼠标悬停效果 */
.system-item:hover {
  background: #f5f7fa;
}

.system-item.is-active:hover {
  background: #e6f3ff;
}
</style>
