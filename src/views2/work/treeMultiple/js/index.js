// 树形选择组件逻辑 - 展示多种通讯方式
// 1. Props（父传子）：接收父组件传递的数据和配置
// 2. Emit（子传父）：向父组件发送事件通知
// 3. Ref + defineExpose：暴露方法供父组件直接调用
// 4. 插槽：允许父组件传入自定义内容
// 5. 事件回调：处理内部组件事件并转发

import { ref, computed, watch, nextTick } from 'vue'
import { mockApi } from './mockData.js'

// 调试日志开关 - true: 开启日志, false: 关闭日志
const DEV_LOG_ENABLED = true

/**
 * 调试日志输出函数
 * 只有在 DEV_LOG_ENABLED 为 true 时才输出日志
 * @param {...any} args - 要输出的参数
 */
const devLog = (...args) => {
  if (DEV_LOG_ENABLED) {
    console.log('[TreeMultiple]', ...args)
  }
}

/**
 * 调试错误日志输出函数
 * 只有在 DEV_LOG_ENABLED 为 true 时才输出错误日志
 * @param {...any} args - 要输出的参数
 */
const devError = (...args) => {
  if (DEV_LOG_ENABLED) {
    console.error('[TreeMultiple]', ...args)
  }
}

/**
 * 调试警告日志输出函数
 * 只有在 DEV_LOG_ENABLED 为 true 时才输出警告日志
 * @param {...any} args - 要输出的参数
 */
const devWarn = (...args) => {
  if (DEV_LOG_ENABLED) {
    console.warn('[TreeMultiple]', ...args)
  }
}

// 工具函数：在树中查找指定节点
const findNode = (tree, targetId) => {
  devLog('findNode: 查找节点', { targetId })

  for (const node of tree) {
    if (node.id === targetId) return node;
    if (node.children) {
      const found = findNode(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

// 工具函数：获取所有子节点ID
const getAllChildrenIds = (node) => {
  devLog('getAllChildrenIds: 获取所有子节点ID', { nodeId: node.id })

  const ids = [node.id];
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      ids.push(...getAllChildrenIds(child));
    });
  }
  return ids;
}

// 工具函数：将树形结构展平
const setChild = (list) => {
  devLog('setChild: 展平树形结构', { listLength: list.length })

  return list.reduce((ls, item) => {
    let { children, ...res } = item;
    if (children && children.length) {
      return ls.concat(res, setChild(children));
    } else {
      return ls.concat(res);
    }
  }, []);
}

// 导出组件配置对象
export default {
  name: 'TreeMultiple', // 组件名称

  // ************************************************ 区域：Props（父传子）*****************************************************
  // 1. Props（父传子）：接收父组件传递的数据和配置
  props: {
    dataSource: [Array, String], // 数据源，可以是数组或字符串
    activeNameList: { // 激活的标签页列表
      type: Array,
      default: () => ['administrative'],
    },
    selectType: { // 选择类型：单选或多选
      type: String,
      required: false,
      default: "single", // single/multiple
    },
    disabled: { // 是否禁用
      type: Boolean,
      default: false,
    },
    toggleEmpty: { // 切换时清空选中项
      type: Boolean,
      default: false,
    },
    collapseTags: { // 多选是否折叠
      type: Boolean,
      default: true,
    },
    selectable: { // 禁用勾选的数据
      type: Array,
      default: () => [],
    },
    filterChild: { // 筛选对应的子数据
      type: Array,
      default: () => [],
    }
  },

  // ************************************************ 区域：Emit（子传父）*****************************************************
  // 2. Emit（子传父）：向父组件发送事件通知
  emits: ["submitPopover", "update:dataSource", "change"],

  // ************************************************ 区域：响应式数据 *****************************************************
  setup() {
    devLog('setup: 初始化响应式数据')

    // 响应式数据
    const popoverVisible = ref(false); // 控制弹出框显示隐藏
    const organizeInput = ref(""); // 筛选组织
    const selectList = ref([]); // 复选框选中数据
    const selectObj = ref(null); // 单选框选中数据
    const treeRef = ref(null); // 树实例
    const defaultSelList = ref([]); // 第一次打开时默认数据
    const isAutomatic = ref(false); // 是否自动选中子组织
    const activeName = ref('administrative'); // 当前激活的标签页
    const administrativeData = ref([]); // 行政组织数据
    const prfOrgPartyData = ref([]); // 虚拟组织数据

    // 计算属性：默认展开的节点
    const expandedKeys = computed(() => {
      devLog('expandedKeys: 计算默认展开的节点', {
        selectObj: selectObj.value,
        defaultSelList: defaultSelList.value
      })

      if (selectObj.value?.value) return [selectObj.value.value]
      if (defaultSelList.value.length) return defaultSelList.value.map(v => v.id)
      if (administrativeArr.value?.[0]?.id) return [administrativeArr.value[0].id];
      return [];
    });

    // 计算属性：处理后的行政组织数据
    const administrativeArr = computed(() => {
      devLog('administrativeArr: 计算处理后的行政组织数据', {
        dataLength: administrativeData.value.length
      })

      let list = []
      // 这里可以根据 props 进行数据过滤和处理
      // 为了简化，直接返回原始数据
      list = administrativeData.value
      return list
    });

    // 计算属性：当前显示的树数据
    const treeData = computed(() => {
      devLog('treeData: 计算当前显示的树数据', {
        activeName: activeName.value
      })

      if (activeName.value === 'administrative') {
        return administrativeArr.value
      } else if (activeName.value === 'dummy') {
        return prfOrgPartyData.value
      } else {
        return administrativeArr.value
      }
    });

    // 获取行政组织数据
    const getAdministrative = async () => {
      devLog('getAdministrative: 获取行政组织数据')

      try {
        const res = await mockApi.getAdministrative();
        if (res.code === 2000) {
          administrativeData.value = res.data;
          devLog('getAdministrative: 行政组织数据获取成功', {
            dataLength: res.data.length
          })
        }
      } catch (error) {
        devError('获取行政组织数据失败:', error);
      }
    };

    // 获取虚拟组织数据
    const getPrfOrgPartyList = async () => {
      devLog('getPrfOrgPartyList: 获取虚拟组织数据')

      try {
        const res = await mockApi.getPrfOrgPartyList();
        if (res.code === 2000) {
          prfOrgPartyData.value = res.data.map(v => {
            return {
              ...v,
              deptName: v.name,
              orgType: 2,
              children: []
            }
          });
          devLog('getPrfOrgPartyList: 虚拟组织数据获取成功', {
            dataLength: res.data.length
          })
        }
      } catch (error) {
        devError('获取虚拟组织数据失败:', error);
      }
    };

    // 初始化数据
    const initData = () => {
      devLog('initData: 初始化数据')
      getAdministrative();
      getPrfOrgPartyList();
    };

    // 返回需要在模板中使用的数据和方法
    return {
      popoverVisible,
      organizeInput,
      selectList,
      selectObj,
      treeRef,
      defaultSelList,
      isAutomatic,
      activeName,
      expandedKeys,
      treeData,
      administrativeData,
      getAdministrative,
      findNode,
      getAllChildrenIds,
      setChild,
      initData
    };
  },

  // ************************************************ 区域：业务数据 *****************************************************
  data() {
    devLog('data: 初始化业务数据')

    return {
      selectRef: null, // 复选框实例
      slotReference: false, // 判断是否有自定义reference插槽
      treeProps: {
        label: 'deptName',
        children: 'children',
        disabled: 'disabled'
      }
    }
  },

  // ************************************************ 区域：生命周期 *****************************************************
  mounted() {
    devLog('mounted: 组件挂载完成')

    // 判断是否有自定义reference插槽
    this.slotReference = !!this.$slots.reference;
    // 初始化数据
    this.initData();
  },

  // ************************************************ 区域：业务方法 *****************************************************
  methods: {
    // 筛选节点
    filterNode(value, data) {
      devLog('filterNode: 筛选节点', { value, dataId: data.id })
      return data.deptName.includes(value)
    },

    // 树节点点击事件 - 单选模式
    handleNodeClick(data, activeName) {
      devLog('handleNodeClick: 树节点点击事件', {
        nodeId: data.id,
        nodeName: data.deptName,
        activeName,
        selectType: this.selectType
      })

      if (this.selectType == "multiple") {
        return;
      }
      this.selectObj = {
        label: data.deptName,
        value: data.id,
      };
      this.submitPopover(false);
    },

    // 树节点选中事件 - 多选模式
    handleCheckChange(checkedNode, checkedStatus, activeName) {
      devLog('handleCheckChange: 树节点选中事件', {
        nodeId: checkedNode.id,
        isChecked: checkedStatus.checkedNodes.includes(checkedNode),
        isAutomatic: this.isAutomatic
      })

      if (this.selectType == "single") {
        return;
      }
      const isChecked = checkedStatus.checkedNodes.includes(checkedNode);

      if (isChecked) {
        let allList = [...checkedStatus.checkedNodes]

        // 如果开启自动选中下级
        if (
          this.isAutomatic &&
          checkedNode.children.length &&
          !this.selectList.find((v) => v.id === checkedNode.id)
        ) {
          const list = this.setChild(checkedNode.children)
          // 所有需要选中的数据
          allList = [...allList, ...list];
          // 数组去重
          allList = allList.filter(
            (v, i) => allList.findIndex((k) => k.id === v.id) === i
          );
          // 设置选中
          this.treeRef.setCheckedKeys(
            allList.map((v) => v.id),
            true
          );
          devLog('handleCheckChange: 自动选中下级', {
            parentNodeId: checkedNode.id,
            childrenCount: list.length
          })
        }

        // 同步选中标签
        this.selectList = allList.map((e) => {
          return {
            ...e,
            label: e.deptName,
          };
        });
        devLog('handleCheckChange: 选中节点同步', {
          selectedCount: this.selectList.length
        })
      } else {
        // 取消选中逻辑：移除当前节点及其所有子节点
        let currentAndChildrenIds = [];
        if (this.isAutomatic) {
          currentAndChildrenIds = this.getAllChildrenIds(checkedNode);
        } else {
          currentAndChildrenIds = [checkedNode.id]
        }

        // 获取当前所有选中的 keys
        const currentCheckedKeys = this.treeRef.getCheckedKeys();

        // 过滤掉当前节点及其子节点
        const newCheckedKeys = currentCheckedKeys.filter(
          key => !currentAndChildrenIds.includes(key)
        );

        // 更新选中状态
        this.treeRef.setCheckedKeys(newCheckedKeys);

        // 同步更新 selectList（移除取消的节点）
        this.selectList = this.selectList.filter(
          item => !currentAndChildrenIds.includes(item.id)
        );
        devLog('handleCheckChange: 取消选中节点', {
          removedIds: currentAndChildrenIds,
          remainingCount: this.selectList.length
        })
      }

      // 触发回调事件 - 子传父通讯方式
      this.submitPopover(false);
    },

    // 选中下一级按钮点击事件
    appendChild(node, data, activeName) {
      devLog('appendChild: 选中下一级按钮点击', {
        nodeId: data.id,
        nodeName: data.deptName,
        hasChildren: data.children ? data.children.length : 0
      })

      if (this.selectType == "single") {
        return;
      }

      if (!node.disabled) {
        this.defaultSelList.push(data.id)
      }

      let chilNodes = data.children || [];
      // 获取当前已选中的keys
      const checkedNodes = this.treeRef?.getCheckedNodes() || [];
      // 添加子节点keys到已选中列表
      const newCheckedKeys = Array.from(new Set([...checkedNodes, ...chilNodes]));

      // 设置选中
      this.treeRef.setCheckedKeys(
        newCheckedKeys.map((v) => v.id),
        false
      );

      // 同步选中标签
      this.selectList = newCheckedKeys.map((e) => {
        return {
          ...e,
          label: e.deptName,
        };
      });
      devLog('appendChild: 选中下一级完成', {
        selectedCount: this.selectList.length
      })

      this.submitPopover(false);
    },

    // 清空选中的组织
    delAll() {
      devLog('delAll: 清空选中的组织', {
        currentCount: this.selectList.length
      })

      this.selectList = []
      this.treeRef.setCheckedKeys([], false);
      this.submitPopover(false);
    },

    // 初始化树选择状态
    initTreeSelect() {
      devLog('initTreeSelect: 初始化树选择状态', {
        dataSource: this.dataSource,
        isArray: Array.isArray(this.dataSource)
      })

      // 先置空
      this.treeRef && this.treeRef.setCheckedKeys([], false);
      // 根据dataSource回显tree数据
      if (Array.isArray(this.dataSource)) {
        this.dataSource.map((v) => {
          const id = v?.id || v;
          this.treeRef.setChecked(id, true);
        });
      } else {
        this.treeRef.setChecked(this.dataSource, true);
      }
    },

    // 设置默认节点
    setDefaultNode() {
      devLog('setDefaultNode: 设置默认节点', {
        dataSource: this.dataSource,
        isArray: Array.isArray(this.dataSource)
      })

      if (Array.isArray(this.dataSource)) {
        // 多选的返显
        let arr = []
        for (let i = 0; i < this.dataSource.length; i++) {
          const element = this.dataSource[i];
          const id = element?.id || element;
          const node = this.findNode(this.treeData, id)
          if (node) {
            arr.push({
              ...node,
              label: node.deptName,
            })
          }
        }
        this.selectList = arr
        devLog('setDefaultNode: 多选返显完成', {
          selectedCount: arr.length
        })
      } else {
        // 单选的返显
        const node = this.findNode(this.treeData, this.dataSource)
        this.selectObj = {}
        if (!node) return
        this.selectObj = {
          label: node.deptName,
          value: node.id,
        };
        devLog('setDefaultNode: 单选返显完成', {
          selectedNode: { id: node.id, name: node.deptName }
        })
      }
    },

    // 移除标签
    removeTag({ id }) {
      devLog('removeTag: 移除标签', {
        removedId: id,
        currentCount: this.selectList.length
      })

      this.selectList = this.selectList.filter((v) => id !== v.id); // 排除当前节点
      this.treeRef.setChecked(id, false); // 取消选中当前id
      this.submitPopover(false);
    },

    // 输入框点击事件->打开弹框
    openPopover() {
      devLog('openPopover: 打开弹框', {
        activeNameList: this.activeNameList,
        currentSelectList: this.selectList
      })

      this.selectRef && this.selectRef.blur(); // 组织默认事件
      this.popoverVisible = true;
      this.activeName = this.activeNameList[0]
      this.defaultSelList = this.selectList
      nextTick(() => {
        this.initTreeSelect();
      })
      if (!this.administrativeData.length) {
        this.getAdministrative();
      }
    },

    // 数据回调 - 子传父通讯方式
    submitPopover(hide = true) {
      devLog('submitPopover: 数据回调', {
        hide,
        selectType: this.selectType,
        selectList: this.selectList,
        selectObj: this.selectObj
      })

      const list =
        (this.selectList && this.selectList.map((e) => e.id)) || [];
      if (this.selectType == "single") {
        // 2. Emit（子传父）：通过 emit 向父组件发送数据更新
        this.$emit("update:dataSource", this.selectObj?.value || '');
        devLog('submitPopover: 单选数据更新', {
          value: this.selectObj?.value || ''
        })
      } else {
        this.$emit("update:dataSource", list);
        devLog('submitPopover: 多选数据更新', {
          selectedIds: list
        })
      }
      this.$emit("change");
      if (hide) {
        this.$emit("submitPopover", this.selectList, list);
        this.popoverVisible = false;
        this.organizeInput = "";
        devLog('submitPopover: 弹框关闭并提交数据')
      }
    },

    // 手动调用submitPopover的回显触发 - 3. Ref + defineExpose 通讯方式
    submitPopoverRefManual() {
      devLog('submitPopoverRefManual: 手动调用提交方法', {
        selectList: this.selectList
      })

      this.$emit("submitPopover", this.selectList, this.selectList)
    }
  },

  // ************************************************ 区域：Ref + defineExpose（父直接访问子方法/状态）*****************************************************
  // 3. Ref + defineExpose：暴露方法供父组件直接调用
  // 在 Vue 3 的 Options API 中，通过组件实例的 $refs 可以直接访问子组件方法
  // 父组件可以通过 ref="componentRef" 获取子组件实例，然后调用子组件方法

  // ************************************************ 区域：监听器 *****************************************************
  watch: {
    // 监听搜索输入
    organizeInput(val) {
      devLog('organizeInput: 监听搜索输入', { value: val })

      let str = val
      if (val) str = str.toUpperCase()
      this.treeRef.filter(str);
    },

    // 监听激活标签页列表变化
    activeNameList: {
      handler(val) {
        devLog('activeNameList: 监听激活标签页列表变化', {
          value: val,
          currentActiveName: this.activeName
        })

        if (!val.includes(this.activeName)) this.activeName = val[0]
      },
      deep: true
    },

    // 监听激活标签页变化
    activeName(val) {
      devLog('activeName: 监听激活标签页变化', {
        value: val,
        toggleEmpty: this.toggleEmpty
      })

      nextTick(() => {
        if (this.toggleEmpty) this.delAll()
        this.treeRef.filter('');
        this.setDefaultNode();
      })
    },

    // 监听数据源变化
    dataSource: {
      handler(val) {
        devLog('dataSource: 监听数据源变化', {
          value: val,
          popoverVisible: this.popoverVisible,
          treeDataLength: this.treeData.length
        })

        if (this.popoverVisible === false && this.treeData.length) {
          this.setDefaultNode();
        }
      },
      immediate: true, // 页面加载立即执行
    }
  }
};
