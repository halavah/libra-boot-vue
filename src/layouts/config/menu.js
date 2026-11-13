// 自动菜单配置生成器 - 根据目录结构动态生成菜单
// 使用 import.meta.glob 扫描 src/views/ 下的两级目录结构

// 统一使用树形图标
const TREE_ICON = '📁'

/**
 * 自动扫描 src/views/ 目录结构生成菜单配置
 * 目录结构规范：src/views/模块名/组件名/index.vue
 * @returns {Array} 菜单配置数组
 */
export const generateMenuConfig = () => {
  // 使用 import.meta.glob 扫描所有符合规范的组件
  const viewModules = import.meta.glob('/src/views/*/*/index.vue')

  // 按模块分组
  const moduleGroups = {}

  Object.keys(viewModules).forEach(path => {
    // 从路径中提取模块名和组件名
    // 例如：/src/views/onboard/onbApplicant/index.vue
    const pathMatch = path.match(/\/src\/views\/(.*?)\/(.*?)\/index\.vue$/)

    if (pathMatch) {
      const [, moduleName, componentName] = pathMatch

      // 如果模块组不存在，创建它
      if (!moduleGroups[moduleName]) {
        moduleGroups[moduleName] = {
          id: moduleName,
          name: moduleName, // 直接使用文件夹名
          icon: TREE_ICON,
          children: []
        }
      }

      // 添加组件到模块组
      moduleGroups[moduleName].children.push({
        id: `${moduleName}-${componentName}`,
        name: componentName, // 直接使用小写组件名
        path: `/${moduleName}/${componentName}`,
        icon: TREE_ICON
      })
    }
  })

  // 转换为数组并排序
  const menuConfig = Object.values(moduleGroups).sort((a, b) => {
    // 自定义排序：onboard, onboard_comp, 其他按字母顺序
    const order = ['onboard', 'onboard_comp']
    const aIndex = order.indexOf(a.id)
    const bIndex = order.indexOf(b.id)

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    } else if (aIndex !== -1) {
      return -1
    } else if (bIndex !== -1) {
      return 1
    } else {
      return a.id.localeCompare(b.id)
    }
  })

  // 对每个模块的子项进行排序
  menuConfig.forEach(module => {
    module.children.sort((a, b) => a.name.localeCompare(b.name))
  })

  return menuConfig
}

// 导出动态生成的菜单配置
export const menuConfig = generateMenuConfig()

// 辅助函数：获取扁平化的菜单项（用于路由匹配）
export const getFlatMenuItems = () => {
  const flatItems = []

  const traverse = (items) => {
    items.forEach(item => {
      if (item.path) {
        flatItems.push(item)
      }
      if (item.children) {
        traverse(item.children)
      }
    })
  }

  traverse(menuConfig)
  return flatItems
}

// 辅助函数：根据路径找到菜单项
export const findMenuItemByPath = (path) => {
  const flatItems = getFlatMenuItems()
  return flatItems.find(item => item.path === path)
}