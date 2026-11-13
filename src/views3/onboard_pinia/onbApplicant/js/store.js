import { defineStore } from 'pinia'
import { ref, reactive, computed, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import dayjs from 'dayjs'

/**
 * @description 应聘者模块的状态管理 Store
 * @summary 负责管理应聘者列表的数据、搜索、分页、加载状态以及相关的业务逻辑。
 */
export const useApplicantStore = defineStore('applicant', () => {
  // =================================================================
  // ===== 核心状态 (State) =====
  // =================================================================

  /**
   * @description 数据列表
   * @type {import('vue').ShallowRef<Array<any>>}
   * @summary 使用 shallowRef 优化性能，因为它只使 .value 的赋值操作具有响应性，适合存储大型列表。
   */
  const dataList = shallowRef([])

  /**
   * @description 数据总条数
   * @type {import('vue').Ref<number>}
   */
  const dataTotal = ref(0)

  /**
   * @description 加载状态
   * @type {import('vue').Ref<boolean>}
   * @summary 用于控制表格或页面的加载动画，防止用户在数据请求期间进行重复操作。
   */
  const loading = ref(false)

  /**
   * @description 搜索表单的数据模型
   * @type {object}
   * @summary 存储所有搜索条件，与UI上的搜索表单双向绑定。
   */
  const searchForm = reactive({
    applicantName: '',
    contactPhone: '',
    idCardNo: '',
    applyPosition: '',
    auditStatus: null,
    gender: null,
    politicalStatus: null,
    foreignLanguageLevel: null,
    birthDate: '',
    assignedUser: '',
    availableDateRange: [], // 可到岗日期范围
    assignedDateRange: [],  // 分配日期范围
    interviewerDateRange: [],// 面试日期范围
    offerDateRange: []      // Offer日期范围
  })

  /**
   * @description 分页配置
   * @type {object}
   */
  const pagination = reactive({
    currentPage: 1, // 当前页码
    pageSize: 10,   // 每页显示条数
    pageSizes: [10, 15, 25, 35, 50, 100] // 可选的每页显示条数
  })

  /**
   * @description 表格中被选中的行数据
   * @type {import('vue').Ref<Array<any>>}
   */
  const selectionRows = ref([])

  /**
   * @description 枚举数据/字典数据
   * @type {object}
   * @summary 存储从后端获取的、用于下拉选择框等场景的固定选项。
   */
  const attrLists = reactive({
    genderOptions: [],
    politicalStatusOptions: [],
    foreignLanguageLevelOptions: [],
    allStatusOptions: []
  })

  /**
   * @description API 路径配置
   * @type {object}
   */
  const apiPaths = {
    sysAttrList: '/dev-api/onboard/attr/list', // 获取枚举/字典数据
    applicantList: '/dev-api/onboard/applicant/person/list', // 获取应聘者列表
    imageViewUrl: '/dev-api/onboard/applicant/image/view/' // 图片预览基础路径
  }

  // =================================================================
  // ===== 计算属性 (Getters) =====
  // =================================================================

  /**
   * @description 根据页面类型 (pageType) 动态获取对应的审核状态选项
   * @param {string} [pageType='1'] - 页面类型: '1'分配, '2'面试, '3'录用
   * @returns {Array<{key: number, value: string}>} 过滤后的状态选项数组
   */
  const getFilteredStatusOptions = (pageType = '1') => {
    // 定义不同页面类型对应的状态选项
    const statusOptionsMap = {
      '1': [
        { key: 1, value: '待分配' },
        { key: 2, value: '等待面试' }
      ],
      '2': [
        { key: 2, value: '等待面试' },
        { key: 3, value: '面试审核中' },
        { key: 4, value: '面试通过' },
        { key: 5, value: '面试失败' }
      ],
      '3': [
        { key: 4, value: '面试通过' },
        { key: 6, value: '录用审核中' },
        { key: 7, value: '录用通过' },
        { key: 8, value: '录用失败' }
      ]
    }
    // 返回对应页面类型的状态选项，如果未匹配到则返回默认值
    return statusOptionsMap[pageType] || statusOptionsMap['1']
  }

  /**
   * @description 图片预览弹框的状态
   * @type {object}
   */
  const imagePreview = reactive({
    dialogImageUrl: '',
    dialogVisible: false
  })

  /**
   * @description 表格辅助方法集合
   * @type {import('vue').ComputedRef<object>}
   * @summary 将常用的格式化函数和逻辑判断封装在一起，方便在模板中直接调用，保持模板整洁。
   */
  const tableHelpers = computed(() => ({
    /** 格式化日期 */
    formatDate: (date) => {
      if (!date) return '-'
      return dayjs(date).format('YYYY-MM-DD')
    },
    /** 根据审核状态 key 和页面类型获取 Element Plus Tag 的 type 属性 */
    getAuditStatusTagType: (key, pageType = '1') => {
      const typeMap = {
        '1': { 1: 'warning', 2: 'primary' },
        '2': { 2: 'primary', 3: 'warning', 4: 'success', 5: 'danger' },
        '3': { 4: 'primary', 6: 'warning', 7: 'success', 8: 'danger' }
      }
      return typeMap[pageType]?.[key] || 'info'
    },
    /** 根据政治面貌 key 获取 Tag 的 type */
    getPoliticalStatusTagType: (key) => {
      const typeMap = { 1: 'danger', 2: 'primary', 3: 'info' }
      return typeMap[key] || 'info'
    },
    /** 根据外语水平 key 获取 Tag 的 type */
    getForeignLanguageTagType: (key) => {
      const typeMap = { 1: 'info', 2: 'success', 3: 'primary', 4: 'warning', 5: 'danger', 6: 'danger', 7: 'danger' }
      return typeMap[key] || 'info'
    },
    /** 处理表格内照片的预览事件 */
    handleTablePhotoPreview: (photoUrl) => {
      if (photoUrl) {
        imagePreview.dialogImageUrl = photoUrl
        imagePreview.dialogVisible = true
        console.log('🖼️ [Store] 打开图片预览:', photoUrl)
      }
    }
  }))

  /**
   * @description 聚合分页信息
   * @type {import('vue').ComputedRef<object>}
   * @summary 方便地将分页信息传递给分页组件。
   */
  const paginationInfo = computed(() => ({
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    total: dataTotal.value
  }))

  // =================================================================
  // ===== 核心方法 (Actions) =====
  // =================================================================

  /**
   * @description 初始化获取枚举/字典数据
   * @returns {Promise<void>}
   */
  const fetchAttrList = async () => {
    try {
      const response = await axios.get(apiPaths.sysAttrList)
      if (response.data.code === 2000) {
        Object.assign(attrLists, response.data.data) // 将获取的数据合并到 attrLists 状态中
        console.log('✅ [Store] 枚举数据加载成功')
      } else {
        ElMessage.error('获取字典数据失败: ' + response.data.message)
      }
    } catch (error) {
      console.error('获取字典数据失败:', error)
      ElMessage.error('网络请求失败，无法获取字典数据')
    }
  }

  /**
   * @description 构建查询 API 所需的参数
   * @param {string} [pageType='1'] - 页面类型
   * @returns {object} 构建好的请求参数对象
   */
  const buildQueryParams = (pageType = '1') => {
    // 基础参数，包含搜索表单中的各个字段
    const baseParams = {
      pageType: pageType,
      page: pageType, // 注意: 这里可能存在冗余字段，取决于后端API设计
      deletedFlag: '0', // 逻辑删除标记
      applicantName: searchForm.applicantName || null,
      contactPhone: searchForm.contactPhone || null,
      idCardNo: searchForm.idCardNo || null,
      applyPosition: searchForm.applyPosition || null,
      assignedUser: searchForm.assignedUser || null,
      gender: searchForm.gender,
      politicalStatus: searchForm.politicalStatus,
      foreignLanguageLevel: searchForm.foreignLanguageLevel,
      auditStatus: searchForm.auditStatus,
      birthDate: searchForm.birthDate || null
    }

    // 根据不同的 pageType，添加特定的日期范围查询条件
    if (pageType === '1') {
      baseParams.availableStartDate = searchForm.availableDateRange?.[0] || null
      baseParams.availableEndDate = searchForm.availableDateRange?.[1] || null
      baseParams.assignedStartDate = searchForm.assignedDateRange?.[0] || null
      baseParams.assignedEndDate = searchForm.assignedDateRange?.[1] || null
    } else if (pageType === '2') {
      baseParams.interviewerStartDate = searchForm.interviewerDateRange?.[0] || null
      baseParams.interviewerEndDate = searchForm.interviewerDateRange?.[1] || null
    } else if (pageType === '3') {
      baseParams.offerStartDate = searchForm.offerDateRange?.[0] || null
      baseParams.offerEndDate = searchForm.offerDateRange?.[1] || null
    }

    return baseParams
  }

  /**
   * @description 核心查询方法，用于从后端获取应聘者列表数据
   * @param {string} [pageType='1'] - 页面类型
   * @returns {Promise<void>}
   */
  const query = async (pageType = '1') => {
    console.log('📊 [Store] query() 开始执行, pageType:', pageType)
    loading.value = true // 开始查询，设置加载状态为 true

    try {
      const params = buildQueryParams(pageType)
      console.log('📊 [Store] 查询参数:', params)

      // 发送 POST 请求
      const response = await axios({
        url: apiPaths.applicantList,
        method: 'POST',
        data: params
      })

      if (response.data.code === 2000) {
        let dataListResult = response.data.data || []

        // 对返回的数据进行预处理：拼接完整的头像URL
        dataListResult.forEach(item => {
          if (item.photoUrl && item.photoUrl.trim() !== '') {
            if (!item.photoUrl.startsWith('http')) {
              item.photoUrl = apiPaths.imageViewUrl + item.photoUrl
            }
          }
        })

        // 更新状态
        dataList.value = dataListResult
        dataTotal.value = dataListResult.length // 注意：这里总数直接用了返回列表的长度，如果后端支持分页，应取后端返回的总数字段
        console.log('✅ [Store] 查询成功，数据条数:', dataTotal.value)
      } else {
        ElMessage.error(response.data.message || '获取数据失败')
        console.error('❌ [Store] 查询失败:', response.data.message)
      }
    } catch (error) {
      ElMessage.error('网络请求失败')
      console.error('❌ [Store] 网络请求失败:', error)
    } finally {
      // 无论成功或失败，最后都将加载状态设为 false
      loading.value = false
    }
  }

  /**
   * @description 执行搜索操作
   * @param {string} [pageType='1'] - 页面类型
   */
  const handleSearch = async (pageType = '1') => {
    console.log('🔍 [Store] handleSearch 被调用, pageType:', pageType)
    await query(pageType)
  }

  /**
   * @description 重置搜索表单并重新查询
   * @param {string} [pageType='1'] - 页面类型
   */
  const handleReset = async (pageType = '1') => {
    console.log('🔄 [Store] handleReset 被调用, pageType:', pageType)
    // 将 searchForm 对象重置为初始状态
    Object.assign(searchForm, {
      applicantName: '',
      contactPhone: '',
      idCardNo: '',
      applyPosition: '',
      auditStatus: null,
      gender: null,
      politicalStatus: null,
      foreignLanguageLevel: null,
      birthDate: '',
      assignedUser: '',
      availableDateRange: [],
      assignedDateRange: [],
      interviewerDateRange: [],
      offerDateRange: []
    })
    // 重新查询第一页数据
    await query(pageType)
  }

  /**
   * @description 刷新当前数据
   * @param {string} [pageType='1'] - 页面类型
   */
  const refreshData = async (pageType = '1') => {
    console.log('🔄 [Store] refreshData 被调用, pageType:', pageType)
    await query(pageType)
  }

  /**
   * @description 处理表格行选中状态变化
   * @param {Array<any>} selection - 当前选中的行数据数组
   */
  const handleSelectionChange = (selection) => {
    selectionRows.value = selection
    console.log('📋 [Store] 选择变化:', selection.length, '条')
  }

  /**
   * @description 处理分页：当前页码变化
   * @param {number} val - 新的页码
   */
  const handleCurrentChange = (val) => {
    pagination.currentPage = val
    console.log('📄 [Store] 页码变化:', val)
    // 注意：这里仅更新了页码，通常需要在此之后调用 query() 来获取新一页的数据。
    // 实际项目中，这部分逻辑可能放在组件端，也可能直接在这里调用 query()。
  }

  /**
   * @description 处理分页：每页显示条数变化
   * @param {number} val - 新的每页显示条数
   */
  const handleSizeChange = (val) => {
    pagination.pageSize = val
    pagination.currentPage = 1 // 改变每页条数时，通常重置到第一页
    console.log('📄 [Store] 页大小变化:', val)
  }

  /**
   * @description 获取当前选中的行
   * @returns {Array<any>}
   */
  const getSelectedRows = () => {
    console.log('📋 [Store] getSelectedRows 被调用')
    return selectionRows.value || []
  }

  /**
   * @description 获取当前的分页信息
   * @returns {object}
   */
  const getPaginationInfo = () => {
    console.log('📄 [Store] getPaginationInfo 被调用')
    return paginationInfo.value
  }

  // =================================================================
  // ===== 暴露给组件的接口 (Return) =====
  // =================================================================
  return {
    // State (状态)
    dataList,
    dataTotal,
    loading,
    searchForm,
    pagination,
    selectionRows,
    attrLists,
    imagePreview,

    // Getters (计算属性)
    paginationInfo,
    tableHelpers,
    getFilteredStatusOptions,

    // Actions (方法)
    fetchAttrList,
    query,
    handleSearch,
    handleReset,
    refreshData,
    handleSelectionChange,
    handleCurrentChange,
    handleSizeChange,
    getSelectedRows,
    getPaginationInfo,

    // Utils (内部工具方法，也可以选择不暴露)
    buildQueryParams
  }
})