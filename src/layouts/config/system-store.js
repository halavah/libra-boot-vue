import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  systemRegistry,
  getEnabledSystems,
  getSystemById,
  getSystemMenus
} from './system-config';

/**
 * 系统切换 Store
 */
export const useSystemSwitcherStore = defineStore('system-switcher', () => {
  // ========== 状态 ==========

  /**
   * 当前选中的系统ID
   * @type {import('vue').Ref<string>}
   */
  const currentSystemId = ref(systemRegistry.defaultSystemId);

  // ========== 计算属性 ==========

  /**
   * 获取所有可用的系统（已启用且未隐藏）
   * @type {import('vue').ComputedRef<import('@/config/systems/types').SystemConfig[]>}
   */
  const availableSystems = computed(() => getEnabledSystems());

  /**
   * 获取当前系统配置
   * @type {import('vue').ComputedRef<import('@/config/systems/types').SystemConfig|undefined>}
   */
  const currentSystem = computed(() => getSystemById(currentSystemId.value));

  /**
   * 获取当前系统的菜单
   * @type {import('vue').ComputedRef<import('@/config/systems/types').MenuConfig[]>}
   */
  const currentMenus = computed(() => {
    const menus = getSystemMenus(currentSystemId.value);
    console.log(`\n🎯 当前系统菜单 [${currentSystemId.value}]:`, menus.length, '个模块');
    menus.forEach(menu => {
      console.log(`   📁 ${menu.title} (${menu.name}) - ${menu.children?.length || 0} 个页面`);
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach(child => {
          console.log(`      📄 ${child.title} (path: ${child.path})`);
        });
      }
    });
    console.log('\n');
    return menus;
  });

  /**
   * 检查当前系统是否有效
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isCurrentSystemValid = computed(() => {
    return !!currentSystem.value && currentSystem.value.enabled !== false;
  });

  // ========== 方法 ==========

  /**
   * 切换系统
   * @param {string} systemId - 系统ID
   * @returns {boolean} 是否切换成功
   */
  function switchSystem(systemId) {
    const system = getSystemById(systemId);

    if (!system) {
      console.error(`[SystemSwitcher] 系统 ${systemId} 不存在`);
      return false;
    }

    if (system.enabled === false || system.hidden === true) {
      console.warn(`[SystemSwitcher] 系统 ${systemId} 未启用或已隐藏`);
      return false;
    }

    console.log(`[SystemSwitcher] 切换系统: ${currentSystemId.value} -> ${systemId}`);
    currentSystemId.value = systemId;

    // 保存到本地存储
    try {
      localStorage.setItem('wing:currentSystemId', systemId);
    } catch (e) {
      console.warn('[SystemSwitcher] 保存系统ID到localStorage失败:', e);
    }

    return true;
  }

  /**
   * 从本地存储恢复系统选择
   */
  function restoreFromStorage() {
    try {
      const savedSystemId = localStorage.getItem('wing:currentSystemId');
      if (savedSystemId) {
        console.log(`[SystemSwitcher] 从localStorage恢复系统: ${savedSystemId}`);
        switchSystem(savedSystemId);
      }
    } catch (e) {
      console.warn('[SystemSwitcher] 从localStorage恢复失败:', e);
    }
  }

  /**
   * 获取系统列表（用于UI显示）
   * @returns {Array<{id: string, title: string, icon?: string, description?: string}>}
   */
  function getSystemList() {
    return availableSystems.value.map(sys => ({
      id: sys.id,
      title: sys.title,
      icon: sys.icon,
      description: sys.description
    }));
  }

  /**
   * 重置到默认系统
   */
  function resetToDefault() {
    switchSystem(systemRegistry.defaultSystemId);
  }

  // ========== 返回 ==========

  return {
    // 状态
    currentSystemId,

    // 计算属性
    availableSystems,
    currentSystem,
    currentMenus,
    isCurrentSystemValid,

    // 方法
    switchSystem,
    restoreFromStorage,
    getSystemList,
    resetToDefault
  };
});
