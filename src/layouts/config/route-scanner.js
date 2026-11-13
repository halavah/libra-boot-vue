/**
 * 自动路由扫描器
 * 自动扫描 views、views2、views3 文件夹，生成路由和菜单配置
 */

import { getSystemConfigByViewFolder } from './system-config';

/**
 * 检测哪些视图文件夹实际存在
 * @returns {Array} 存在的视图文件夹名称数组
 */
function detectAvailableViewFolders() {
  const availableFolders = [];

  try {
    // 使用 import.meta.glob 一次性扫描所有可能的 views* 文件夹
    // 支持 views, views2, views3, ... viewsN（任意数字）
    const allModules = import.meta.glob('/src/views*/*/*/index.vue', { eager: false });

    // 从扫描到的路径中提取文件夹名称
    const folderSet = new Set();
    Object.keys(allModules).forEach((path) => {
      // 匹配路径格式: /src/views*/module/page/index.vue
      const match = path.match(/^\/src\/(views\d*)\/[^/]+\/[^/]+\/index\.vue$/);
      if (match) {
        folderSet.add(match[1]);
      }
    });

    // 按照 views, views2, views3... 的顺序排序
    const sortedFolders = Array.from(folderSet).sort((a, b) => {
      // views 排第一
      if (a === 'views') return -1;
      if (b === 'views') return 1;

      // 提取数字进行比较
      const numA = parseInt(a.replace('views', '') || '1');
      const numB = parseInt(b.replace('views', '') || '1');
      return numA - numB;
    });

    // 统计每个文件夹的页面数量
    sortedFolders.forEach((folder) => {
      const folderModules = Object.keys(allModules).filter(path =>
        path.startsWith(`/src/${folder}/`)
      );
      availableFolders.push(folder);
      console.log(`✅ 检测到视图文件夹: ${folder} (${folderModules.length} 个页面)`);
    });

  } catch (error) {
    console.error('❌ 检测视图文件夹时出错:', error);
  }

  return availableFolders;
}

/**
 * 扫描所有视图文件夹并生成路由配置
 * @returns {Object} { routes: [], systems: [] }
 */
export function scanViewFoldersAndGenerateRoutes() {
  // 动态检测存在的视图文件夹
  const viewFolders = detectAvailableViewFolders();

  if (viewFolders.length === 0) {
    console.warn('⚠️  未检测到任何视图文件夹');
    return { routes: [], systems: [] };
  }

  console.log(`🔍 开始扫描 ${viewFolders.length} 个视图文件夹:`, viewFolders);

  const allRoutes = [];
  const allSystems = {};

  viewFolders.forEach((viewFolder) => {
    const systemConfig = getSystemConfigByViewFolder(viewFolder);

    if (!systemConfig.enabled) {
      return;
    }

    // 扫描该视图文件夹下的所有组件
    const routes = scanViewFolder(viewFolder, systemConfig);

    // 只有当扫描到路由时才创建系统
    if (routes.length > 0) {
      allRoutes.push(...routes);

      // 构建系统配置
      if (!allSystems[systemConfig.systemId]) {
        allSystems[systemConfig.systemId] = {
          id: systemConfig.systemId,
          name: systemConfig.systemName,
          title: systemConfig.systemTitle,
          icon: systemConfig.systemIcon,
          description: systemConfig.description,
          orderNum: systemConfig.orderNum,
          enabled: systemConfig.enabled,
          menus: [],
          pages: {},
          routes: []
        };
      }

      allSystems[systemConfig.systemId].routes.push(...routes);
    }
  });

  return {
    routes: allRoutes,
    systems: Object.values(allSystems)
  };
}

/**
 * 扫描单个视图文件夹（两层目录结构）
 * @param {string} viewFolder - 视图文件夹名称
 * @param {Object} systemConfig - 系统配置
 * @returns {Array} 路由配置数组
 */
function scanViewFolder(viewFolder, systemConfig) {
  const routes = [];

  try {
    // 使用 import.meta.glob 动态扫描当前视图文件夹
    // 支持任意 views* 文件夹（views, views2, views3, ... viewsN）
    const pattern = `/src/${viewFolder}/*/*/index.vue`;
    const modules = import.meta.glob('/src/views*/*/*/index.vue', { eager: false });

    // 过滤出当前文件夹的模块
    const folderModules = Object.keys(modules)
      .filter(path => path.startsWith(`/src/${viewFolder}/`))
      .reduce((obj, key) => {
        obj[key] = modules[key];
        return obj;
      }, {});

    if (Object.keys(folderModules).length === 0) {
      console.warn(`未找到 ${viewFolder} 文件夹中的组件`);
      return routes;
    }

    // 遍历所有找到的组件
    Object.keys(folderModules).forEach((path) => {
      const route = parseRouteFromPath(path, viewFolder, systemConfig, folderModules[path]);
      if (route) {
        routes.push(route);
      }
    });

    console.log(`📂 ${viewFolder} 扫描到 ${routes.length} 个路由`);
  } catch (error) {
    console.error(`扫描 ${viewFolder} 时出错:`, error);
  }

  return routes;
}

/**
 * 从文件路径解析路由配置（两层结构）
 * @param {string} filePath - 文件路径
 * @param {string} viewFolder - 视图文件夹名称
 * @param {Object} systemConfig - 系统配置
 * @param {Function} component - 组件加载函数
 * @returns {Object|null} 路由配置对象
 */
function parseRouteFromPath(filePath, viewFolder, systemConfig, component) {
  try {
    // 跳过模板文件夹
    if (filePath.includes('/_template/')) {
      return null;
    }

    // 提取相对路径（两层结构）
    // 例如：/src/views/element/demo01/index.vue
    // 提取：element/demo01
    const regex = new RegExp(`/src/${viewFolder}/([^/]+)/([^/]+)/index\\.vue$`);
    const match = filePath.match(regex);

    if (!match) {
      return null;
    }

    const moduleName = match[1]; // element
    const pageName = match[2]; // demo01
    const relativePath = `${moduleName}/${pageName}`; // element/demo01

    // 生成路由名称：LayoutElementDemo01
    const routeName = 'Layout' +
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1) +
      pageName.charAt(0).toUpperCase() + pageName.slice(1);

    // 生成页面标题
    const pageTitle = pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      path: `/layout/${relativePath}`, // /layout/element/demo01
      name: routeName, // LayoutElementDemo01
      component: component,
      meta: {
        title: pageTitle, // Demo01
        module: moduleName, // element
        system: systemConfig.systemId, // entrance
        viewFolder: viewFolder, // views
        fullPath: `/${relativePath}` // /element/demo01
      }
    };
  } catch (error) {
    console.error(`解析路径 ${filePath} 时出错:`, error);
    return null;
  }
}

/**
 * 根据路由生成菜单配置（两层目录结构）
 * @param {Array} routes - 路由配置数组
 * @param {string} systemId - 系统 ID
 * @returns {Array} 菜单配置数组
 */
export function generateMenusFromRoutes(routes, systemId) {
  console.log(`\n📋 开始生成菜单 - 系统: ${systemId}`);
  console.log(`   路由总数: ${routes.length}`);

  const menuMap = {};

  // 只处理属于当前系统的路由
  const systemRoutes = routes.filter(route => route.meta?.system === systemId);
  console.log(`   当前系统路由数: ${systemRoutes.length}`);

  systemRoutes.forEach((route) => {
    const { meta } = route;
    if (!meta || !meta.fullPath) return;

    // 解析路径层级 - 两层结构
    // 例如：/element/demo01
    const pathSegments = meta.fullPath.split('/').filter(Boolean);

    // 必须是两层结构：[模块名]/[页面名]
    if (pathSegments.length !== 2) {
      console.log(`   ⚠️  跳过非两层路径: ${meta.fullPath}`);
      return;
    }

    const moduleKey = pathSegments[0]; // element
    const pageKey = pathSegments[1]; // demo01

    // 创建或获取模块菜单（一级菜单）
    if (!menuMap[moduleKey]) {
      menuMap[moduleKey] = {
        id: `${systemId}-${moduleKey}`,
        name: moduleKey,
        title: moduleKey, // 直接使用文件夹名：element, ant-design-vue 等
        icon: getDefaultIcon(moduleKey),
        type: 'M',
        orderNum: Object.keys(menuMap).length + 1,
        children: []
      };
      console.log(`   ✅ 创建一级菜单: ${moduleKey}`);
    }

    // 添加页面菜单项（二级菜单）
    menuMap[moduleKey].children.push({
      id: `${systemId}-${moduleKey}-${pageKey}`,
      name: formatRouteName(moduleKey, pageKey), // camelCase
      title: pageKey, // 直接使用文件夹名：demo01, cjsbgzms 等
      icon: getDefaultIcon(pageKey),
      type: 'C',
      pageId: `${systemId}-${moduleKey}-${pageKey}`,
      path: meta.fullPath, // /element/demo01
      orderNum: menuMap[moduleKey].children.length + 1
    });
    console.log(`      ➕ 添加页面: ${moduleKey}/${pageKey} (title: ${pageKey})`);
  });

  const menus = Object.values(menuMap);
  console.log(`\n✅ 菜单生成完成 - ${systemId}: ${menus.length} 个模块\n`);

  return menus;
}

/**
 * 格式化标题（将 kebab-case 转换为标题格式）
 * @param {string} str - 字符串
 * @returns {string} 格式化后的标题
 */
function formatTitle(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 格式化路由名称（将 kebab-case 转换为 camelCase）
 * @param {string} module - 模块名
 * @param {string} page - 页面名
 * @returns {string} camelCase 格式的名称
 */
function formatRouteName(module, page) {
  const combined = `${module}-${page}`;
  return combined
    .split('-')
    .map((word, index) => {
      if (index === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
}

/**
 * 获取默认图标
 * @param {string} name - 名称
 * @returns {string} 图标名称
 */
function getDefaultIcon(name) {
  const iconMap = {
    recruitment: 'UserFilled',
    approval: 'Checked',
    info: 'InfoFilled',
    register: 'Document',
    interview: 'Calendar',
    evaluation: 'Star',
    hiring: 'User',
    organization: 'OfficeBuilding',
    position: 'Briefcase',
    dictionary: 'Reading',
    config: 'Tools',
    permission: 'Lock',
    params: 'Setting',
    dict: 'Reading',
    role: 'User',
    menu: 'Menu',
    notice: 'Bell',
    document: 'Folder',
    list: 'List',
    detail: 'View',
    upload: 'Upload',
    publish: 'EditPen'
  };

  return iconMap[name] || 'Document';
}
