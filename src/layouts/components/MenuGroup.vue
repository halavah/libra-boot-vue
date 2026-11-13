<template>
  <div class="nav-group">
    <!-- 菜单项 -->
    <div v-if="menuItem.path" class="nav-item">
      <router-link
        :to="'/layout' + menuItem.path"
        class="nav-link"
        :class="{ active: currentPath.endsWith(menuItem.path) }"
      >
        <span class="nav-icon el-icon-s-unfold" aria-hidden="true">
          <svg
            viewBox="0 0 1024 1024"
            width="16"
            height="16"
            fill="currentColor"
          >
            <path
              d="M160 256h704a32 32 0 0 1 0 64H160a32 32 0 0 1 0-64zm0 224h704a32 32 0 0 1 0 64H160a32 32 0 0 1 0-64zm0 224h704a32 32 0 0 1 0 64H160a32 32 0 0 1 0-64z"
            />
          </svg>
        </span>
        {{ menuItem.title || menuItem.name }}
      </router-link>
    </div>

    <!-- 菜单组（有子菜单） -->
    <div v-else class="nav-item">
      <div
        class="nav-link nav-group-header"
        :class="{ expanded: isExpanded, active: isActive }"
        @click="toggleExpand"
      >
        <span class="nav-icon el-icon-reading" aria-hidden="true">
          <svg
            viewBox="0 0 1024 1024"
            width="16"
            height="16"
            fill="currentColor"
          >
            <path
              d="M832 128H544c-35.2 0-64 28.8-64 64v640c0-35.2 28.8-64 64-64h288c35.2 0 64 28.8 64 64V192c0-35.2-28.8-64-64-64zM480 192c0-35.2-28.8-64-64-64H128c-35.2 0-64 28.8-64 64v640c0-35.2 28.8-64 64-64h288c35.2 0 64 28.8 64 64V192z"
            />
          </svg>
        </span>
        {{ menuItem.title || menuItem.name }}
        <span v-if="hasChildren" class="expand-icon">
          {{ isExpanded ? "▼" : "▶" }}
        </span>
      </div>

      <!-- 子菜单 -->
      <div v-if="hasChildren && isExpanded" class="nav-submenu">
        <MenuGroup
          v-for="child in menuItem.children"
          :key="child.id"
          :menu-item="child"
          :current-path="currentPath"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";

export default {
  name: "MenuGroup",
  props: {
    menuItem: {
      type: Object,
      required: true,
    },
    currentPath: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const isExpanded = ref(false); // 默认收缩

    const hasChildren = computed(() => {
      return props.menuItem.children && props.menuItem.children.length > 0;
    });

    const isActive = computed(() => {
      if (props.menuItem.path) {
        const target = `/layout${props.menuItem.path}`;
        return (
          props.currentPath === target ||
          props.currentPath.endsWith(props.menuItem.path)
        );
      }
      // 对于父级菜单，检查是否有子菜单项处于活跃状态
      if (hasChildren.value) {
        return props.menuItem.children.some((child) =>
          props.currentPath.endsWith(child.path)
        );
      }
      return false;
    });

    const toggleExpand = () => {
      if (hasChildren.value) {
        isExpanded.value = !isExpanded.value;
      }
    };

    return {
      isExpanded,
      hasChildren,
      isActive,
      toggleExpand,
    };
  },
};
</script>

<style lang="scss" scoped>
/* 左侧导航菜单 */
.nav-group {
  margin-bottom: 6px;
}

/* 左侧导航菜单项 */
.nav-item {
  margin: 2px 0;
}

/* 左侧导航菜单链接 */
.nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 文本靠左 */
  padding: 10px 14px;
  color: #e6edf3;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
  cursor: pointer;
  font-size: 13px;
  border-radius: 8px;
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.06);
    color: #6cb6ff;
  }

  &.active {
    background-color: rgba(108, 182, 255, 0.12);
    color: #6cb6ff;
  }

  /* 菜单组头部样式 */
  &.nav-group-header {
    background-color: transparent;
    font-weight: 500;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    &.active {
      background-color: rgba(108, 182, 255, 0.12);
    }

    &.expanded {
      background-color: rgba(255, 255, 255, 0.04);
    }
  }
}

/* 左侧导航菜单图标 */
.nav-icon {
  margin-right: 10px;
  font-size: 14px;
  min-width: 18px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* 左侧导航菜单展开图标 */
.expand-icon {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.8;
  transition: transform 0.2s ease;
}

/* 子菜单样式：增加左缩进与上边距，和父级错开 */
.nav-submenu {
  background-color: transparent;
  margin-left: 0;
  padding-left: 16px;

  .nav-link {
    padding: 10px 14px;
    font-size: 12.5px;
    margin-top: 6px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #6cb6ff;
    }

    &.active {
      background-color: rgba(108, 182, 255, 0.12);
      color: #6cb6ff;
    }
  }

  .nav-icon {
    font-size: 13px;
    margin-right: 10px;
  }
}
</style>
