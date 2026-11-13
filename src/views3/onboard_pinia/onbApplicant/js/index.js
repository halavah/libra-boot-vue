import { computed, onMounted, onBeforeUnmount, ref, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowDown } from '@element-plus/icons-vue'
import { useApplicantStore } from './store'
import regionsData from './regions.json'

export default {
  name: 'onbApplicant',

  props: {
    pageType: {
      type: [String, Number],
      default: 1,
      validator: (value) => [1, 2, 3, '1', '2', '3'].includes(value)
    }
  },

  components: {
    ArrowDown
  },

  setup(props) {
    console.log('🚀 [onbApplicant] setup 开始执行, pageType:', props.pageType)

    // 使用 Pinia Store
    const applicantStore = useApplicantStore()

    // 使用 storeToRefs 解构响应式状态
    const {
      dataList,
      dataTotal,
      loading,
      searchForm,
      pagination,
      selectionRows,
      attrLists,
      imagePreview
    } = storeToRefs(applicantStore)

    // 调试：监听数据变化
    watch(dataList, (newVal) => {
      console.log('👀 [Component] dataList 数据变化:', newVal.length, '条记录')
      console.log('📝 [Component] dataList 内容 (前2条):', newVal.slice(0, 2))
    }, { immediate: true })

    watch(dataTotal, (newVal) => {
      console.log('👀 [Component] dataTotal 变化:', newVal)
    }, { immediate: true })

    // 本地组件状态
    const searchFormRef = ref('')
    const searchFormRules = reactive({})
    const dataTableRef = ref('')
    const dataTableHeight = ref(window.innerHeight - 176)
    const searchExpanded = ref(false)

    // 表单验证规则
    const dataFormRules = reactive({
      applicantName: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' }
      ],
      idCardNo: [
        { required: true, message: '请输入身份证号', trigger: 'blur' },
        { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '身份证号格式不正确', trigger: 'blur' }
      ],
      contactPhone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
      ],
      applyPosition: [
        { required: true, message: '请输入应聘岗位', trigger: 'blur' }
      ]
    })

    // 级联选择器配置
    const cascaderProps = {
      value: 'name',
      label: 'name',
      children: 'children',
      checkStrictly: false,
      emitPath: true
    }

    // ================================ 计算属性 ================================

    // pageType 标准化处理
    const normalizePageType = (val) => {
      const pageTypeMap = { 1: '1', 2: '2', 3: '3' }
      return pageTypeMap[val] || '1'
    }

    // 获取当前规范化的 pageType
    const currentPageType = computed(() => normalizePageType(props.pageType))

    // 动态计算状态选项 (根据 pageType)
    const dynamicStatusOptions = computed(() => {
      return applicantStore.getFilteredStatusOptions(currentPageType.value)
    })

    // ================================ 业务方法封装 ================================

    // 搜索相关方法
    const searchMethods = {
      handleSearch: () => {
        console.log('🔍 [onbApplicant] searchMethods.handleSearch 被调用')
        return applicantStore.handleSearch(currentPageType.value)
      },
      handleReset: () => {
        console.log('🔄 [onbApplicant] searchMethods.handleReset 被调用')
        return applicantStore.handleReset(currentPageType.value)
      },
      toggleSearchExpanded: () => {
        searchExpanded.value = !searchExpanded.value
        console.log('🔽 [onbApplicant] 切换搜索展开状态:', searchExpanded.value)
      }
    }

    // 表格配置方法
    const tableConfig = {
      handleSelectionChange: applicantStore.handleSelectionChange,
      handleCurrentChange: applicantStore.handleCurrentChange,
      handleSizeChange: applicantStore.handleSizeChange
    }

    // 表格操作方法（简化版）
    const tableActions = {
      handleCreate: () => {
        console.log('➕ [onbApplicant] 新增操作')
        // 简化实现
      },
      handleDetail: (row) => {
        console.log('👁️ [onbApplicant] 查看详情:', row.applicantName)
        // 简化实现
      },
      handleUpdate: (row) => {
        console.log('✏️ [onbApplicant] 编辑操作:', row.applicantName)
        // 简化实现
      },
      handleDelete: (row) => {
        console.log('🗑️ [onbApplicant] 删除操作:', row.applicantName)
        // 简化实现
      }
    }

    // 数据管理方法
    const dataMethods = {
      exportData: () => {
        console.log('📤 [onbApplicant] 导出数据')
        // 简化实现
      },
      openRecycleBin: () => {
        console.log('🗑️ [onbApplicant] 打开回收站')
        // 简化实现
      },
      refreshData: () => {
        console.log('🔄 [onbApplicant] 刷新数据')
        return applicantStore.refreshData(currentPageType.value)
      }
    }

    // 附件相关方法（简化版）
    const attachmentMethods = {
      downloadBatchAttachments: (applicantId) => {
        console.log('📎 [onbApplicant] 批量下载附件:', applicantId)
        // 简化实现
      },
      handleTableAttachmentPreview: (row) => {
        console.log('📎 [onbApplicant] 预览附件:', row.applicantName)
        // 简化实现
      }
    }

    // ================================ 生命周期钩子 ================================

    onMounted(async () => {
      console.log('🔄 [onbApplicant] onMounted 开始')
      console.log('🎯 [onbApplicant] 当前 props.pageType:', props.pageType)
      console.log('🎯 [onbApplicant] 当前 currentPageType:', currentPageType.value)

      // 初始化枚举数据
      await applicantStore.fetchAttrList()
      console.log('📚 [onbApplicant] 枚举数据加载完成')

      // 查询数据
      console.log('🚀 [onbApplicant] 开始执行查询，pageType:', currentPageType.value)
      await applicantStore.query(currentPageType.value)

      // 监听窗口变化
      handleResize()

      console.log('✅ [onbApplicant] onMounted 完成')
      console.log('📊 [onbApplicant] 最终状态 - dataList.length:', dataList.value.length)
      console.log('📊 [onbApplicant] 最终状态 - dataTotal:', dataTotal.value)
      console.log('📊 [onbApplicant] 最终状态 - loading:', loading.value)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })

    // ================================ 工具方法 ================================

    // 地区变化处理
    const handleRegionChange = (value, field) => {
      console.log('🌏 [onbApplicant] 地区变化:', field, value)
      // 这里可以添加地区变化的逻辑处理
    }

    // 附件状态样式
    const getAttachmentStatusClass = (bizKey) => {
      // 根据业务键返回样式类名
      return 'attachment-status-default'
    }

    // 附件状态文本
    const getAttachmentStatusText = (bizKey) => {
      // 根据业务键返回状态文本
      return '待上传'
    }

    // 自定义上传处理
    const handleCustomUpload = (event, bizKey) => {
      console.log('📎 [onbApplicant] 自定义上传:', bizKey, event)
      // 这里可以添加文件上传逻辑
    }

    // 窗口大小监听
    const handleResize = () => {
      dataTableHeight.value = window.innerHeight - 176
      window.addEventListener('resize', handleResize)
    }

    // 切换筛选展开状态
    const toggleSearchExpanded = () => {
      searchExpanded.value = !searchExpanded.value
    }

    // 暴露给父组件的方法（用于向后兼容）
    const handleSearch = () => {
      console.log('🔍 [onbApplicant] 暴露方法 handleSearch 被调用')
      return applicantStore.handleSearch(currentPageType.value)
    }

    const refreshData = () => {
      console.log('🔄 [onbApplicant] 暴露方法 refreshData 被调用')
      return applicantStore.refreshData(currentPageType.value)
    }

    const getSelectedRows = () => {
      console.log('📋 [onbApplicant] 暴露方法 getSelectedRows 被调用')
      return applicantStore.getSelectedRows()
    }

    const getPaginationInfo = () => {
      console.log('📄 [onbApplicant] 暴露方法 getPaginationInfo 被调用')
      return applicantStore.getPaginationInfo()
    }

    return {
      // ===== Store 响应式状态 =====
      dataList,
      dataTotal,
      loading,
      searchForm,
      pagination,
      selectionRows,
      attrLists,
      imagePreview,

      // ===== 本地组件状态 =====
      searchFormRef,
      searchFormRules,
      dataTableRef,
      dataTableHeight,
      searchExpanded,
      dataFormRules,
      cascaderProps,

      // ===== 计算属性 =====
      currentPageType,
      dynamicStatusOptions,

      // ===== Store 计算属性和辅助方法 =====
      paginationInfo: applicantStore.paginationInfo,
      tableHelpers: applicantStore.tableHelpers,
      getFilteredStatusOptions: applicantStore.getFilteredStatusOptions,

      // ===== 业务方法组合 =====
      searchMethods,
      tableConfig,
      tableActions,
      dataMethods,
      attachmentMethods,

      // ===== 暴露给父组件的方法 =====
      handleSearch,
      refreshData,
      getSelectedRows,
      getPaginationInfo,

      // ===== 工具方法 =====
      toggleSearchExpanded,
      handleRegionChange,
      getAttachmentStatusClass,
      getAttachmentStatusText,
      handleCustomUpload,

      // ===== 其他数据 =====
      pageType: props.pageType,
      regionsData
    }
  }
}