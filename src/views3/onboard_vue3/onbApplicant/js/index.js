import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import axios from 'axios'
import dayjs from 'dayjs'
import regionsData from './regions.json'

//************************************************ 第1部分：配置声明 ****************************************************

//************************** 11.常量配置 **************************

// API路径配置
const apiPaths = {
  // 请求路径：枚举
  sysAttrList: '/dev-api/onboard/attr/list', // GET请求
  // 请求路径：主表
  applicantList: '/dev-api/onboard/applicant/person/list', // POST请求
  applicantDetail: '/dev-api/onboard/applicant/person/detail', // POST请求
  applicantInsert: '/dev-api/onboard/applicant/person/insert', // POST请求
  applicantUpdate: '/dev-api/onboard/applicant/person/update', // POST请求
  applicantDelete: '/dev-api/onboard/applicant/person/delete', // POST请求
  applicantExport: '/dev-api/onboard/applicant/person/export', // POST请求
  // 请求路径：工作经历
  applicantWorkList: '/dev-api/onboard/applicant/work/list', // POST请求
  applicantWorkInsert: '/dev-api/onboard/applicant/work/insert', // POST请求
  applicantWorkUpdate: '/dev-api/onboard/applicant/work/update', // POST请求
  applicantWorkDelete: '/dev-api/onboard/applicant/work/delete', // POST请求
  // 请求路径：教育经历
  applicantEducationList: '/dev-api/onboard/applicant/education/list', // POST请求
  applicantEducationInsert: '/dev-api/onboard/applicant/education/insert', // POST请求
  applicantEducationUpdate: '/dev-api/onboard/applicant/education/update', // POST请求
  applicantEducationDelete: '/dev-api/onboard/applicant/education/delete', // POST请求
  // 请求路径：家庭情况
  applicantFamilyList: '/dev-api/onboard/applicant/family/list', // POST请求
  applicantFamilyInsert: '/dev-api/onboard/applicant/family/insert', // POST请求
  applicantFamilyUpdate: '/dev-api/onboard/applicant/family/update', // POST请求
  applicantFamilyDelete: '/dev-api/onboard/applicant/family/delete', // POST请求
  // 请求路径：培训经历
  applicantTrainingList: '/dev-api/onboard/applicant/training/list', // POST请求
  applicantTrainingInsert: '/dev-api/onboard/applicant/training/insert', // POST请求
  applicantTrainingUpdate: '/dev-api/onboard/applicant/training/update', // POST请求
  applicantTrainingDelete: '/dev-api/onboard/applicant/training/delete', // POST请求
  // 请求路径：图片
  sysHeaders: { 'X-Access-Token': '' }, // 上传头
  imageBizUrl: 'photo', // 存放子文件夹
  imageBaseUrl: '/opt/upload/onboard', // 存放根文件夹
  imageViewUrl: '/dev-api/onboard/applicant/image/view/', // GET请求
  imageUploadUrl: '/dev-api/onboard/applicant/image/upload', // POST请求
  // 请求路径：附件
  attachmentBizUrl: 'attachment', // 存放子文件夹
  attachmentBaseUrl: '/opt/upload/onboard', // 存放根文件夹
  attachmentViewUrl: '/dev-api/onboard/applicant/attachment/view/', // GET请求
  attachmentListUrl: '/dev-api/onboard/applicant/attachment/list', // POST请求
  attachmentUploadUrl: '/dev-api/onboard/applicant/attachment/upload', // POST请求
  attachmentDeleteUrl: '/dev-api/onboard/applicant/attachment/delete', // POST请求
  attachmentDownloadBatchUrl: '/dev-api/onboard/applicant/attachment/downloadBatch', // POST请求
}

// 枚举值配置 - 通过sysAttrList API填充
const attrLists = reactive({
  // 1. 个人信息相关枚举
  // 1.1 性别
  genderOptions: [],
  // 1.2 政治面貌
  politicalStatusOptions: [],
  // 1.3 婚姻状况
  maritalStatusOptions: [],
  // 1.4 血型
  bloodTypeOptions: [],
  // 1.5 外语水平
  foreignLanguageLevelOptions: [],
  // 1.6 是否退伍军人
  isVeteranOptions: [],
  // 1.7 是否删除
  deletedFlagOptions: [],
  // 1.8 学校性质
  schoolNatureOptions: [],
  // 1.9 附件类型
  attachmentTypeOptions: [],
  // 1.10 是否同意调休
  agreeShiftWorkOptions: [],
  // 1.11 是否需要住宿
  needAccommodationOptions: [],
  // 1.12 学历
  educationLevelOptions: [],
  // 1.13 民族
  nationOptions: [],
  // 2. 面试相关枚举
  // 2.1 面试状态
  allStatusOptions: [],
  // 2.2 面试评估类型
  interviewEvaluationTypeOptions: [],
  // 2.3 是否录用
  isHiredOptions: [],
  // 2.4 试用期时长
  probationDurationOptions: [],
  // 2.5 用工性质
  employmentTypeOptions: [],
  // 2.6 测试方法
  testMethodOptions: [],
  // 3. 审批流程相关枚举
  // 3.1 审批状态
  flowStatusOptions: [],
  // 3.2 审批开始
  toStartOptions: [],
  // 3.3 审批成功
  successOptions: []
})

//************************** 12.组件导出 **************************

// 组件导出
export default {
  // 组件名称
  name: 'onbApplicant',

  // 子组件引入
  components: {
    ArrowDown
  },

  // 接收页面上下文，默认按“应聘登记”，用于区分三个业务页面
  props: {
    pageType: {
      type: [String, Number],
      default: '1'
    }
  },

  // 业务逻辑组合
  setup(props, { expose }) {
    // 组件生命周期
    onMounted(() => {
      fetchAttrList()
      handleSearch(searchComposable, tableComposable, props, propsComposable)
    })

    // 组件卸载时的清理
    onUnmounted(() => {
      // 清理可能的异步操作
      console.log('组件正在卸载，清理资源...')
    })

    // 注册：表单数据
    const searchComposable = useSearch()
    const tableComposable = useTable()
    const formComposable = useForm()
    const fileComposable = useFile()
    const subTableComposable = useSubTable()
    const recycleBinComposable = useRecycleBin()

    // Props 管理
    const propsComposable = useProps(props)
    const {
      normalizedPageType,
      normalizePageType,
      getLastQueryPageType,
      setLastQueryPageType,
      getFilteredStatusOptions,
      getAuditStatusTagType
    } = propsComposable

    // 插槽：表格
    const tableSlotData = computed(() => ({
      // 表格数据
      tableData: tableComposable.paginatedData.value,
      allData: tableComposable.dataList.value,
      loading: tableComposable.loading.value,
      total: tableComposable.dataTotal.value,
      currentPage: tableComposable.currentPage.value,
      pageSize: tableComposable.pageSize.value,
      selectedRows: tableComposable.selectedRows.value,

      // 表格配置方法
      tableConfig: {
        handleSelectionChange: tableComposable.handleSelectionChange,
        handleCurrentChange: tableComposable.handleCurrentChange,
        handleSizeChange: tableComposable.handleSizeChange
      },

      // 工具函数
      tableHelpers: {
        formatDate,
        getPoliticalStatusTagType,
        getForeignLanguageTagType,
        getFilteredStatusOptions: (pageTypeArg) => getFilteredStatusOptions(pageTypeArg || getLastQueryPageType()),
        getAuditStatusTagType: (key) => getAuditStatusTagType(key, getLastQueryPageType()),
        validateDateRange,
        buildRegionArray,
        filterRegionMethod,
        handleRegionChange,
        handleTablePhotoPreview: (url) => fileComposable.handleTablePhotoPreview(url),
      },

      // 业务操作方法
      tableActions: {
        handleDetail: (row) => handleDetail(row, formComposable, subTableComposable, fileComposable),
        handleUpdate: (row) => handleUpdate(row, formComposable, subTableComposable, fileComposable),
        handleDelete: (row) => handleDelete(row, tableComposable, searchComposable, props, propsComposable),
        handleSearch: () => handleSearch(searchComposable, tableComposable, props, propsComposable),
        handleReset: () => handleReset(searchComposable, tableComposable, props, propsComposable),
        handleExport: () => handleExport(searchComposable, props, propsComposable),
        downloadBatchAttachments: (applicantData = null) => downloadBatchAttachments(formComposable, applicantData),
        openAttachmentsTab: (row) => openAttachmentsTabHandler(row, formComposable, fileComposable),
      }
    }))

    // 插槽：表单_主表
    const searchSlotData = computed(() => ({
      searchForm: searchComposable.searchForm,
      searchExpanded: searchComposable.searchExpanded,
      searchFormRef: searchComposable.searchFormRef,
      searchFormRules: searchComposable.searchFormRules,
      toggleSearchExpanded: searchComposable.toggleSearchExpanded,
      resetSearch: searchComposable.resetSearch,
      attrLists,
      regionsData,
      pageType: normalizedPageType.value
    }))

    // 插槽：表单_子表
    const formSlotData = computed(() => ({
      dataForm: formComposable.dataForm,
      dataFormVisible: formComposable.dataFormVisible,
      dataFormStatus: formComposable.dataFormStatus,
      dataFormTitle: formComposable.dataFormTitle,
      dataFormLoading: formComposable.dataFormLoading,
      dataFormRef: formComposable.dataFormRef,
      dataFormRules: formComposable.dataFormRules,
      activeTabName: formComposable.activeTabName,
      cascaderProps: formComposable.cascaderProps,
      currentPhotoUrl: computed(() => {
        const preview = fileComposable.pendingImagePreview?.value
        if (preview && preview.length > 0) {
          return preview
        }
        return formComposable.dataForm.photoUrl
      }),
      attrLists,
      regionsData,
      apiPaths
    }))

    // 插槽：业务操作
    const businessSlotData = computed(() => ({
      tableActions: {
        handleSearch: () => handleSearch(searchComposable, tableComposable, props, propsComposable),
        handleDetail: (row) => handleDetail(row, formComposable, subTableComposable, fileComposable),
        handleUpdate: (row) => handleUpdate(row, formComposable, subTableComposable, fileComposable),
        handleDelete: (row) => handleDelete(row, tableComposable, searchComposable, props, propsComposable),
        handleExport: () => handleExport(searchComposable, props, propsComposable),
        downloadBatchAttachments: (applicantData = null) => downloadBatchAttachments(formComposable, applicantData),
        openAttachmentsTab: (row) => openAttachmentsTabHandler(row, formComposable, fileComposable),
      }
    }))

    // 暴露：父组件通过 ref 可调用
    expose({
      // 暴露：请求路径
      apiPaths,
      // 暴露：枚举值
      attrLists,
      // 暴露：查询
      handleSearch: () => handleSearch(searchComposable, tableComposable, props, propsComposable),
      // 暴露：下载附件
      downloadBatchAttachments: (applicantData = null) => downloadBatchAttachments(formComposable, applicantData),
    })

    // 返回组件需要的数据和方法
    return {
      // 公共：请求路径
      apiPaths,
      // 公共：枚举值
      attrLists,
      // 公共：地区数据
      regionsData,
      // 公共：页面类型
      pageType: normalizedPageType,

      // 插槽：表格
      tableSlotData,
      // 插槽：表单_主表
      searchSlotData,
      // 插槽：表单_子表
      formSlotData,
      // 插槽：业务操作
      businessSlotData,

      // 组合：搜索
      ...searchComposable,
      // 组合：表格
      ...tableComposable,
      // 组合：表单
      ...formComposable,
      // 组合：文件
      ...fileComposable,
      // 组合：子表
      ...subTableComposable,
      // 组合：回收站
      ...recycleBinComposable,

      // ============================================ 第3部分：业务逻辑 ============================================

      // ******************** 第3.1部分：公共操作 ********************
      // 获取字典数据
      fetchAttrList: () => fetchAttrList(),

      // ******************** 第3.2部分：主表操作 ********************

      // ********** 主表按钮1 - 查询导出操作 **********
      // 查询表格数据
      queryData,
      // 按钮-查询
      handleSearch: () => handleSearch(searchComposable, tableComposable, props, propsComposable),
      // 按钮-重置
      handleReset: () => handleReset(searchComposable, tableComposable, props, propsComposable),
      // 按钮-导出
      handleExport: () => handleExport(searchComposable, props, propsComposable),
      // 导出数据通用函数
      exportData,

      // ********** 主表按钮2 - CRUD操作 **********
      // 按钮-新增
      handleCreate: () => handleCreate(formComposable, fileComposable, subTableComposable),
      // 按钮-详情
      handleDetail: (row) => handleDetail(row, formComposable, subTableComposable, fileComposable),
      // 按钮-编辑
      handleUpdate: (row) => handleUpdate(row, formComposable, subTableComposable, fileComposable),
      // 按钮-删除
      handleDelete: (row) => handleDelete(row, tableComposable, searchComposable, props, propsComposable),
      // 按钮-保存
      handleSave: () => handleSave(formComposable, fileComposable, subTableComposable, searchComposable, tableComposable, props, propsComposable),
      // 关闭所有弹框
      closeAllDialogs: () => closeAllDialogs(formComposable, subTableComposable, recycleBinComposable),

      // ********** 主表加载处理 **********
      // 初始化表单数据
      initFormData: () => initFormData(formComposable),
      // 加载应聘者详情（业务逻辑层包装函数）
      loadApplicantDetail: (id) => loadApplicantDetailWrapper(id, formComposable, subTableComposable, fileComposable),
      // 加载应聘者详情（核心函数）
      loadApplicantDetailCore: (id) => loadApplicantDetail(id, formComposable, subTableComposable, fileComposable),
      // 转换后端数据到表单格式
      convertBackendDataToForm: (backendData) => convertBackendDataToForm(formComposable, backendData),
      // 转换地址格式
      convertAddressFormat: (backendData) => convertAddressFormat(formComposable, backendData),
      // 处理特殊字段
      handleSpecialFields: (backendData) => handleSpecialFields(formComposable, backendData),
      // 加载子表数据
      loadSubTableData: (id) => loadSubTableData(subTableComposable, id),
      // 加载应聘者附件列表
      loadApplicantAttachments: (id) => loadApplicantAttachments(id, fileComposable),

      // ********** 主表保存处理 **********
      // 表单保存的通用函数
      handleFormSave: (refreshCallback) => handleFormSave(formComposable, fileComposable, subTableComposable, refreshCallback),
      // 处理新增保存
      handleCreateSave: () => handleCreateSave(formComposable, fileComposable, subTableComposable),
      // 保存所有子表数据
      saveAllSubTableData: (id) => saveAllSubTableData(id, subTableComposable),
      // 处理编辑保存
      handleUpdateSave: () => handleUpdateSave(formComposable),
      // 准备保存数据
      prepareDataForSave: (dataForm) => prepareDataForSave(dataForm),
      // 转换地址格式为后端格式
      convertAddressToBackend: (address) => convertAddressToBackend(address),

      // ******************** 第3.3部分：回收站操作 ********************

      // 查询回收站数据
      queryRecycleData: (searchParams) => queryRecycleData(searchParams),
      // 打开回收站
      handleRecycleBin: () => handleRecycleBin(recycleBinComposable),
      // 回收站搜索
      handleRecycleSearch: () => handleRecycleSearch(recycleBinComposable),
      // 回收站重置
      handleRecycleReset: () => handleRecycleReset(recycleBinComposable),
      // 回收站详情
      handleRecycleDetail: (row) => handleRecycleDetail(row, formComposable, subTableComposable, fileComposable),
      // 还原数据
      handleRestore: (id) => handleRestore(id, recycleBinComposable, searchComposable, tableComposable, props, propsComposable),
      // 彻底删除数据
      handleTruncate: (id) => handleTruncate(id, recycleBinComposable, searchComposable, tableComposable, props, propsComposable),
      // 回收站分页-页码改变
      handleRecyclePageChange: (val) => handleRecyclePageChange(val, recycleBinComposable),
      // 回收站分页-每页大小改变
      handleRecyclePageSizeChange: (val) => handleRecyclePageSizeChange(val, recycleBinComposable),

      // ******************** 第3.4部分：子表操作 ********************

      // ********** 工作经历子表 **********
      // 工作经历-新增
      handleAddWorkExperience: () => handleAddWorkExperience(subTableComposable),
      // 工作经历-编辑
      handleEditWorkExperience: (row, index) => handleEditWorkExperience(row, index, subTableComposable),
      // 工作经历-删除
      handleDeleteWorkExperience: (index) => handleDeleteWorkExperience(index, subTableComposable),
      // 工作经历-保存
      handleSaveWorkExperience: () => handleSaveWorkExperience(subTableComposable, formComposable, subTableComposable.workExperienceFormRef),
      // 工作经历-重置表单
      resetWorkExperienceForm: () => resetWorkExperienceForm(subTableComposable),

      // ********** 培训经历子表 **********
      // 培训经历-新增
      handleAddTraining: () => handleAddTraining(subTableComposable),
      // 培训经历-编辑
      handleEditTraining: (row, index) => handleEditTraining(row, index, subTableComposable),
      // 培训经历-删除
      handleDeleteTraining: (index) => handleDeleteTraining(index, subTableComposable),
      // 培训经历-保存
      handleSaveTraining: () => handleSaveTraining(subTableComposable, formComposable, subTableComposable.trainingFormRef),
      // 培训经历-重置表单
      resetTrainingForm: () => resetTrainingForm(subTableComposable),

      // ********** 家庭情况子表 **********
      // 家庭情况-新增
      handleAddFamily: () => handleAddFamily(subTableComposable),
      // 家庭情况-编辑
      handleEditFamily: (row, index) => handleEditFamily(row, index, subTableComposable),
      // 家庭情况-删除
      handleDeleteFamily: (index) => handleDeleteFamily(index, subTableComposable),
      // 家庭情况-保存
      handleSaveFamily: () => handleSaveFamily(subTableComposable, formComposable, subTableComposable.familyFormRef),
      // 家庭情况-重置表单
      resetFamilyForm: () => resetFamilyForm(subTableComposable),

      // ********** 学习经历子表 **********
      // 学习经历-新增
      handleAddEducation: () => handleAddEducation(subTableComposable),
      // 学习经历-编辑
      handleEditEducation: (row, index) => handleEditEducation(row, index, subTableComposable),
      // 学习经历-删除
      handleDeleteEducation: (index) => handleDeleteEducation(index, subTableComposable),
      // 学习经历-保存
      handleSaveEducation: () => handleSaveEducation(subTableComposable, formComposable, subTableComposable.educationFormRef),
      // 学习经历-重置表单
      resetEducationForm: () => resetEducationForm(subTableComposable),

      // ******************** 第3.5部分：文件处理 ********************

      // ********** 图片处理 **********
      // 照片上传事件处理
      handlePhotoUploadEvent: (event) => handlePhotoUploadEvent(event, formComposable, fileComposable),
      // 图片Base64校验
      beforeUploadImageBase64,
      // 图片Base64上传
      uploadImageBase64: (file) => uploadImageBase64(file, formComposable, fileComposable),
      // 图片预览
      handleImagePreview: (url) => handleImagePreview(url, fileComposable),
      // 照片预览
      handlePhotoPreview: (url) => fileComposable.handlePhotoPreview(url),
      // 表格照片预览
      handleTablePhotoPreview: (url) => fileComposable.handleTablePhotoPreview(url),
      // 关闭照片预览
      closePhotoPreview: () => fileComposable.closePhotoPreview(),
      // 延迟上传图片
      processPendingImageUpload: () => processPendingImageUpload(formComposable, fileComposable),
      // 当前照片URL（支持预览）
      currentPhotoUrl: computed(() => {
        const preview = fileComposable.pendingImagePreview?.value
        if (preview && preview.length > 0) {
          return preview
        }
        return formComposable.dataForm.photoUrl
      }),
      // 待上传的图片文件
      pendingImageFile: fileComposable.pendingImageFile,
      // 待上传的图片预览
      pendingImagePreview: fileComposable.pendingImagePreview,

      // ********** 附件处理 **********
      // 打开附件页签
      openAttachmentsTab: (row) => openAttachmentsTabHandler(row, formComposable, fileComposable),
      // 附件文件验证
      beforeUpload,
      // 新增模式：延迟上传处理
      handleDelayedAttachmentUpload: (file, type) => handleDelayedAttachmentUpload(file, type, fileComposable),
      // 更新表格显示为待上传状态
      updateAttachmentTableForPending: (type, file) => updateAttachmentTableForPending(type, file, fileComposable),
      // 确认替换文件
      confirmReplaceFile: (type) => confirmReplaceFile(type, fileComposable),
      // 批量下载附件
      downloadBatchAttachments: (applicantData = null) => downloadBatchAttachments(formComposable, applicantData),
      // 附件上传：Base64版本（编辑模式即时上传）
      uploadAttachmentBase64: (file, type) => uploadAttachmentBase64(file, type, formComposable, fileComposable),
      // 附件上传处理
      handleCustomUpload: (event, type) => handleCustomUpload(event, type, formComposable, fileComposable),
      // 下载单个附件
      downloadSingleAttachment: (attachmentId, fileName) => downloadSingleAttachment(attachmentId, fileName),
      // 附件删除
      deleteAttachmentRecord: (attachmentId) => deleteAttachmentRecord(attachmentId, fileComposable),
      // 处理所有待上传附件
      processPendingAttachments: () => processPendingAttachments(formComposable, fileComposable),
      // 上传单个待上传附件
      uploadPendingAttachment: (type, fileInfo) => uploadPendingAttachment(type, fileInfo, formComposable, fileComposable),
      // 获取待上传文件数量
      getPendingAttachmentsCount: () => getPendingAttachmentsCount(fileComposable),
      // 获取类型标签
      getTypeLabel: (type) => getTypeLabel(type, fileComposable),
      // 更新文件数组
      updateFileArray: (type) => updateFileArray(type),

      // ******************** 第3.6部分：辅助方法 ********************

      // ********** 页面方法 **********
      // 归一化 pageType
      normalizePageType,
      // 获取最近一次查询使用的 pageType
      getLastQueryPageType,
      // 设置最近一次查询使用的 pageType
      setLastQueryPageType,

      // ********** 标签颜色映射方法 **********
      // 枚举：政治面貌标签颜色
      getPoliticalStatusTagType,
      // 枚举：外语水平标签颜色
      getForeignLanguageTagType,
      // 枚举：根据 pageType 过滤审核状态选项
      getFilteredStatusOptions: (pageTypeArg) => getFilteredStatusOptions(pageTypeArg || getLastQueryPageType()),
      // 枚举：审核状态标签颜色（随 pageType 切换）
      getAuditStatusTagType: (key) => getAuditStatusTagType(key, getLastQueryPageType()),

      // ********** 地区处理方法 **********
      // 地区级联选择器过滤方法
      filterRegionMethod,
      // 处理地区选择变化
      handleRegionChange,

      // ********** 标签页处理方法 **********
      // 处理标签页切换
      handleTabClick: (pane) => handleTabClick(pane, formComposable, fileComposable),

      // ********** 附件状态处理方法 **********
      // 获取附件状态显示文本
      getAttachmentStatusText: (type) => getAttachmentStatusText(type, fileComposable, formComposable),
      // 获取附件状态样式类
      getAttachmentStatusClass: (type) => getAttachmentStatusClass(type, fileComposable, formComposable),

      // ********** 常见方法 **********
      // 验证日期范围
      validateDateRange: (startDate, endDate, fieldName = '时间') => validateDateRange(startDate, endDate, fieldName),
      // 格式化日期
      formatDate,
      // 构建地区数组
      buildRegionArray,
    };
  }
}

//************************************************ 第2部分：功能组合 ****************************************************

//************************** 21.搜索组合 **************************
function useSearch() {
  const searchExpanded = ref(false)
  const searchForm = reactive({
    applicantName: "",
    contactPhone: "",
    idCardNo: "",
    applyPosition: "",
    auditStatus: null,
    gender: null,
    birthDate: "",
    politicalStatus: null,
    foreignLanguageLevel: null,
    assignedUser: "",
    availableDateRange: [],
    assignedDateRange: [],
    interviewerDateRange: [],
    offerDateRange: [],
  })
  const searchFormRef = ref("")
  const searchFormRules = reactive({})

  const toggleSearchExpanded = () => {
    searchExpanded.value = !searchExpanded.value
  }

  const resetSearch = () => {
    Object.keys(searchForm).forEach(key => {
      if (Array.isArray(searchForm[key])) {
        searchForm[key] = []
      } else if (typeof searchForm[key] === 'string') {
        searchForm[key] = ""
      } else {
        searchForm[key] = null
      }
    })
  }

  return {
    searchExpanded,
    searchForm,
    searchFormRef,
    searchFormRules,
    toggleSearchExpanded,
    resetSearch
  }
}

//************************** 22.表格组合 **************************
function useTable() {
  const loading = ref(false)
  const dataList = ref([])
  const dataTotal = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const pageSizes = ref([10, 20, 50, 100])
  const selectedRows = ref([])
  const selectionRows = ref([])

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return dataList.value.slice(start, end)
  })

  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
    selectionRows.value = selection
  }

  const handleCurrentChange = (page) => {
    currentPage.value = page
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
  }

  return {
    loading,
    dataList,
    dataTotal,
    currentPage,
    pageSize,
    pageSizes,
    selectedRows,
    selectionRows, // 导出selectionRows
    paginatedData,
    handleSelectionChange,
    handleCurrentChange,
    handleSizeChange
  }
}

//************************** 23.表单组合 **************************
function useForm() {
  const dataFormVisible = ref(false)
  const dataFormStatus = ref("create")
  const dataFormTitle = ref("详情")
  const dataFormLoading = ref(false)
  const dataFormRef = ref("")
  const activeTabName = ref("basic")

  const dataForm = reactive({
    id: "",
    applicantName: "",
    applyPosition: "",
    photoUrl: "",
    gender: 1,
    birthDate: "",
    nation: 1,
    politicalStatus: 3,
    maritalStatus: 2,
    height: null,
    weight: null,
    visionLeft: "",
    visionRight: "",
    bloodType: 1,
    professionalTitle: "",
    foreignLanguageLevel: 1,
    foreignLanguageScore: null,
    contactPhone: "",
    idCardNo: "",
    availableDate: "",
    isVeteran: 0,
    dischargeDate: "",
    dischargeCertNo: "",
    homeAddress: {
      region: [],
      province: "",
      city: "",
      district: "",
      detail: "",
      street: "",
      postalCode: ""
    },
    currentAddress: {
      region: [],
      province: "",
      city: "",
      district: "",
      detail: "",
      street: "",
      postalCode: ""
    },
    householdRegister: {
      region: [],
      province: "",
      city: "",
      district: "",
      detail: ""
    },
    nativePlace: {
      region: [],
      province: "",
      city: "",
      district: "",
      detail: ""
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      address: ""
    },
    // 病史类别
    pastHistory: {
      infectious: false,      // 传染病
      allergy: false,         // 过敏史
      surgery: false,         // 手术史
      other: false            // 其它
    },
    currentHistory: {
      disability: false,      // 残疾
      mental: false,          // 心理病
      colorBlind: false,      // 色盲
      acrophobia: false,      // 恐高
      altitudeSick: false,    // 晕高
      epilepsy: false,        // 癫痫
      other: false            // 其它
    },
    familyHistory: {
      heart: false,           // 心脏病
      hypertension: false,    // 高血压
      diabetes: false,        // 糖尿病
      other: false            // 其它
    },
    occupationalHistory: {
      ent: false,             // 耳鼻喉
      organ: false,           // 肺肝腰
      other: false            // 其它
    },
    otherHistory: "",               // 其他史
    noHistoryStatement: "",         // 无病史声明
    applicationChannels: [],        // 应聘途径
    agreeShiftWork: 0,              // 是否同意轮班工作
    needAccommodation: 0,           // 是否需要住宿
    signature: "",
    fillDate: ""
  })

  const dataFormRules = reactive({
    applicantName: [
      { required: true, message: "请输入姓名", trigger: "blur" },
      { min: 2, max: 20, message: "姓名长度在2-20个字符", trigger: "blur" },
    ],
    idCardNo: [
      { required: true, message: "请输入身份证号", trigger: "blur" },
      {
        pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
        message: "身份证号格式不正确",
        trigger: "blur",
      },
    ],
    contactPhone: [
      { required: true, message: "请输入联系电话", trigger: "blur" },
      { pattern: /^1[3456789]\d{9}$/, message: "手机号格式不正确", trigger: "blur" },
    ],
    applyPosition: [{ required: true, message: "请输入应聘岗位", trigger: "blur" }],
  })

  const openForm = (status) => {
    dataFormStatus.value = status
    dataFormVisible.value = true
    activeTabName.value = "basic"

    switch (status) {
      case "create":
        dataFormTitle.value = "新增应聘者"
        break
      case "update":
        dataFormTitle.value = "编辑应聘者"
        break
      case "detail":
        dataFormTitle.value = "应聘者详情"
        break
    }
  }

  // 级联选择器配置
  const cascaderProps = {
    value: 'name',
    label: 'name',
    children: 'children',
    checkStrictly: false,                  // 必须选择到最后一级
    emitPath: true                         // 返回完整路径数组
  }

  return {
    dataFormVisible,
    dataFormStatus,
    dataFormTitle,
    dataFormLoading,
    dataFormRef,
    activeTabName,
    dataForm,
    dataFormRules,
    openForm,
    cascaderProps
  }
}

//************************** 24.文件组合 **************************
function useFile() {
  const dialogImageUrl = ref("")
  const dialogVisible = ref(false)
  const pendingImageFile = ref(null)
  const pendingImagePreview = ref("")
  const attachmentTableData = ref([
    { bizKey: 'idCard', typeLabel: '身份证', inputRef: 'idCardInput', attachmentId: null, downloadName: '身份证', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' },
    { bizKey: 'degree', typeLabel: '学位证', inputRef: 'degreeInput', attachmentId: null, downloadName: '学位证', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' },
    { bizKey: 'graduation', typeLabel: '毕业证', inputRef: 'graduationInput', attachmentId: null, downloadName: '毕业证', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' },
    { bizKey: 'eduReg', typeLabel: '学历证书备案表', inputRef: 'eduRegInput', attachmentId: null, downloadName: '学历证书备案表', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' },
    { bizKey: 'gradVerify', typeLabel: '毕业证在线验证报告', inputRef: 'gradVerifyInput', attachmentId: null, downloadName: '毕业证在线验证报告', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' }
  ])
  const pendingAttachments = ref({
    idCard: null,        // { file: File, type: string, timestamp: number }
    degree: null,
    graduation: null,
    eduReg: null,
    gradVerify: null
  })
  const attachmentUploadStatus = ref({
    idCard: 'none',      // none | pending | uploading | success | error
    degree: 'none',
    graduation: 'none',
    eduReg: 'none',
    gradVerify: 'none'
  })

  const attachmentTypeMap = {
    idCard: { code: 1, name: '身份证' },
    degree: { code: 2, name: '学位证' },
    graduation: { code: 3, name: '毕业证' },
    eduReg: { code: 4, name: '学历认证' },
    gradVerify: { code: 5, name: '学历验证' }
  }

  const handlePhotoPreview = (url) => {
    dialogImageUrl.value = url
    dialogVisible.value = true
  }

  const handleTablePhotoPreview = (url) => {
    dialogImageUrl.value = url
    dialogVisible.value = true
  }

  const closePhotoPreview = () => {
    dialogVisible.value = false
    dialogImageUrl.value = ""
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  return {
    dialogImageUrl,
    dialogVisible,
    pendingImageFile,
    pendingImagePreview,
    attachmentTableData,
    pendingAttachments,
    attachmentUploadStatus,
    attachmentTypeMap,
    handlePhotoPreview,
    handleTablePhotoPreview,
    closePhotoPreview,
    fileToBase64
  }
}

//************************** 25.子表组合 **************************
function useSubTable() {
  // 工作经历
  const workExperienceFormRef = ref(null)
  const workExperienceDialogVisible = ref(false)
  const workExperienceDialogTitle = ref("")
  const workExperienceForm = reactive({
    id: "",
    applicantId: "",
    startDate: "",
    endDate: "",
    companyName: "",
    position: "",
    businessScope: "",
    referencePerson: "",
    referenceContact: ""
  })
  const workList = ref([])
  const workExperienceList = ref([])
  const currentWorkExperienceIndex = ref(-1)
  const workExperienceFormRules = reactive({
    startDate: [
      { required: true, message: "请选择开始时间", trigger: "blur" }
    ],
    endDate: [
      { required: true, message: "请选择结束时间", trigger: "blur" }
    ],
    companyName: [
      { required: true, message: "请输入曾工作单位", trigger: "blur" },
      { min: 2, max: 100, message: "单位名称长度在2-100个字符", trigger: "blur" }
    ],
    position: [
      { required: true, message: "请输入职务", trigger: "blur" },
      { min: 1, max: 50, message: "职务长度在1-50个字符", trigger: "blur" }
    ],
    businessScope: [
      { required: true, message: "请输入业务范围", trigger: "blur" },
      { max: 500, message: "业务范围不能超过500个字符", trigger: "blur" }
    ],
    referencePerson: [
      { required: true, message: "请输入证明人", trigger: "blur" },
      { max: 20, message: "证明人姓名不能超过20个字符", trigger: "blur" }
    ],
    referenceContact: [
      { required: true, message: "请输入联系方式", trigger: "blur" },
      { max: 20, message: "联系方式不能超过20个字符", trigger: "blur" }
    ]
  })
  const workExperienceCloseAllDialogs = () => {
    workExperienceDialogVisible.value = false
  }

  // 培训经历
  const trainingFormRef = ref(null)
  const trainingDialogVisible = ref(false)
  const trainingDialogTitle = ref("")
  const trainingForm = reactive({
    id: "",
    applicantId: "",
    startDate: "",
    endDate: "",
    trainingName: "",
    qualification: ""
  })
  const trainingList = ref([])
  const currentTrainingIndex = ref(-1)
  const trainingFormRules = reactive({
    startDate: [
      { required: true, message: "请选择开始时间", trigger: "blur" }
    ],
    endDate: [
      { required: true, message: "请选择结束时间", trigger: "blur" }
    ],
    trainingName: [
      { required: true, message: "请输入培训名称", trigger: "blur" },
      { min: 2, max: 100, message: "培训名称长度在2-100个字符", trigger: "blur" }
    ],
    qualification: [
      { required: true, message: "请输入资格/技能等级", trigger: "blur" },
      { max: 200, message: "资格/技能等级不能超过200个字符", trigger: "blur" }
    ]
  })
  const trainingCloseAllDialogs = () => {
    trainingDialogVisible.value = false
  }

  // 家庭情况
  const familyFormRef = ref(null)
  const familyDialogVisible = ref(false)
  const familyDialogTitle = ref("")
  const familyForm = reactive({
    id: "",
    applicantId: "",
    name: "",
    relationship: "",
    age: null,
    workUnit: "",
    contactPhone: ""
  })
  const familyList = ref([])
  const currentFamilyIndex = ref(-1)
  const familyFormRules = reactive({
    name: [
      { required: true, message: "请输入姓名", trigger: "blur" },
      { min: 1, max: 20, message: "姓名长度在1-20个字符", trigger: "blur" }
    ],
    relationship: [
      { required: true, message: "请输入与本人关系", trigger: "blur" },
      { min: 1, max: 20, message: "关系长度在1-20个字符", trigger: "blur" }
    ],
    age: [
      { required: true, message: "请输入年龄", trigger: "blur" },
      { type: 'number', min: 0, max: 150, message: "年龄必须在0-150之间", trigger: "blur" }
    ],
    contactPhone: [
      { required: true, message: "请输入联系电话", trigger: "blur" },
      { max: 20, message: "联系电话不能超过20个字符", trigger: "blur" }
    ],
    workUnit: [
      { required: true, message: "请输入工作单位", trigger: "blur" },
      { max: 100, message: "工作单位不能超过100个字符", trigger: "blur" }
    ]
  })
  const familyCloseAllDialogs = () => {
    familyDialogVisible.value = false
  }

  // 教育经历
  const educationFormRef = ref(null)
  const educationDialogVisible = ref(false)
  const educationDialogTitle = ref("")
  const educationForm = reactive({
    id: "",
    applicantId: "",
    startDate: "",
    endDate: "",
    educationLevel: "",
    schoolName: "",
    major: "",
    schoolNature: ""
  })
  const educationList = ref([])
  const currentEducationIndex = ref(-1)
  const educationFormRules = reactive({
    startDate: [
      { required: true, message: "请选择开始时间", trigger: "blur" }
    ],
    endDate: [
      { required: true, message: "请选择结束时间", trigger: "blur" }
    ],
    educationLevel: [
      { required: true, message: "请选择学历", trigger: "change" }
    ],
    schoolName: [
      { required: true, message: "请输入学校名称", trigger: "blur" },
      { min: 2, max: 100, message: "学校名称长度在2-100个字符", trigger: "blur" }
    ],
    major: [
      { required: true, message: "请输入专业", trigger: "blur" },
      { min: 2, max: 50, message: "专业长度在2-50个字符", trigger: "blur" }
    ],
    schoolNature: [
      { required: true, message: "请选择学历类型", trigger: "change" }
    ]
  })
  const educationCloseAllDialogs = () => {
    educationDialogVisible.value = false
  }

  return {
    educationFormRef,
    educationDialogVisible,
    educationDialogTitle,
    educationForm,
    educationFormRules,
    educationList,
    currentEducationIndex,
    educationCloseAllDialogs,
    workExperienceFormRef,
    workExperienceDialogVisible,
    workExperienceDialogTitle,
    workExperienceForm,
    workExperienceFormRules,
    workList,
    workExperienceList,
    currentWorkExperienceIndex,
    workExperienceCloseAllDialogs,
    trainingFormRef,
    trainingDialogVisible,
    trainingDialogTitle,
    trainingForm,
    trainingFormRules,
    trainingList,
    currentTrainingIndex,
    trainingCloseAllDialogs,
    familyFormRef,
    familyDialogVisible,
    familyDialogTitle,
    familyForm,
    familyFormRules,
    familyList,
    currentFamilyIndex,
    familyCloseAllDialogs
  }
}

//************************** 26.回收站组合 **************************
function useRecycleBin() {
  const recycleBinVisible = ref(false)
  const recycleBinDialogVisible = ref(false)
  const recycleBinLoading = ref(false)
  const recycleBinList = ref([])
  const recycleBinTotal = ref(0)
  const recycleBinCurrentPage = ref(1)
  const recycleBinPageSize = ref(10)
  const recycleBinPageSizes = ref([10, 20, 50, 100])

  // 回收站搜索表单
  const recycleSearchForm = reactive({
    applicantName: '',
    contactPhone: '',
    idCardNo: ''
  })

  const openRecycleBin = () => {
    recycleBinVisible.value = true
    recycleBinDialogVisible.value = true
  }

  const closeRecycleBin = () => {
    recycleBinVisible.value = false
    recycleBinDialogVisible.value = false
  }

  const handleDialogClose = (done) => {
    // 确保弹框正确关闭并重置状态
    closeRecycleBin()
    if (done) {
      done()
    }
  }

  return {
    recycleBinVisible,
    recycleBinDialogVisible,
    recycleBinLoading,
    recycleBinList,
    recycleBinTotal,
    recycleBinCurrentPage,
    recycleBinPageSize,
    recycleBinPageSizes,
    recycleSearchForm,
    openRecycleBin,
    closeRecycleBin,
    handleDialogClose
  }
}

//************************************************ 第3部分：业务逻辑 ****************************************************

//************************************************ 第3.1部分：公共操作 *****************************************************

// 获取字典数据
const fetchAttrList = async () => {
  try {
    const response = await axios.get(apiPaths.sysAttrList)
    if (response.data.code === 2000) {
      // 将后端返回的数据填充到attrLists中
      const attrData = response.data.data
      Object.keys(attrData).forEach(key => {
        if (attrLists.hasOwnProperty(key)) {
          attrLists[key] = attrData[key]
        }
      })
      ElMessage.success('字典数据加载成功')
    } else {
      ElMessage.error('获取字典数据失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('获取字典数据失败:', error)
    ElMessage.error('网络请求失败，无法获取字典数据')
  }
}

// Props组合函数：完全封装所有 pageType 相关逻辑
const useProps = (props) => {
  // 归一化 pageType：
  // 新规范：1=应聘登记、2=面试评估、3=录用反馈
  // 兼容旧子页传参：2(登记)/3(评估)/4(录用) → 映射为 1/2/3
  const normalizePageType = (val) => {
    const raw = (val === 0 || val === '0') ? '1' : (val != null ? String(val) : '1')
    if (raw === '1' || raw === '2' || raw === '3') {
      return raw
    }
    const legacyMap = { '2': '1', '3': '2', '4': '3' }
    return legacyMap[raw] || '1'
  }

  // 记录最近一次查询使用的 pageType（用于标签色映射等 UI 场景）
  let lastQueryPageType = '1'
  const getLastQueryPageType = () => lastQueryPageType
  const setLastQueryPageType = (pt) => {
    lastQueryPageType = normalizePageType(pt)
  }

  // 计算归一化后的 pageType
  const normalizedPageType = computed(() => normalizePageType(props.pageType))

  // 初始化最近一次查询的 pageType（用于首屏标签色等）
  setLastQueryPageType(normalizedPageType.value)

  // 根据 pageType 过滤审核状态选项
  const getFilteredStatusOptions = (pageTypeArg = '1') => {
    const pt = normalizePageType(pageTypeArg)
    const allowedKeys1 = [1, 2] // 应聘登记
    const allowedKeys2 = [2, 3, 4, 5] // 面试评估
    const allowedKeys3 = [4, 6, 7, 8] // 录用反馈
    const allowedKeys = pt === '2' ? allowedKeys2 : pt === '3' ? allowedKeys3 : allowedKeys1

    return attrLists.allStatusOptions.filter(item => allowedKeys.includes(item.key))
  }

  // 审核状态标签颜色（随 pageType 切换）
  const getAuditStatusTagType = (key, pageTypeArg = '1') => {
    const pt = normalizePageType(pageTypeArg)
    const map1 = { 1: 'warning', 2: 'primary' }
    const map2 = { 2: 'primary', 3: 'warning', 4: 'success', 5: 'danger' }
    const map3 = { 4: 'primary', 6: 'warning', 7: 'success', 8: 'danger' }
    const map = pt === '2' ? map2 : pt === '3' ? map3 : map1
    return map[key] || 'info'
  }

  return {
    // 归一化后的 pageType
    normalizedPageType,
    // 工具方法
    normalizePageType,
    getLastQueryPageType,
    setLastQueryPageType,
    // 业务方法
    getFilteredStatusOptions,
    getAuditStatusTagType
  }
}

//************************************************ 第3.2部分：主表 ********************************************************

//************************** 21.主表按钮1 **************************

// 查询_表格
const queryData = async (searchParams, pageType = "1", propsMethods = null) => {
  const pageTypeStr = pageType != null ? String(pageType) : '1'
  const normalized = propsMethods ? propsMethods.normalizePageType(pageTypeStr) : pageTypeStr
  // 更新最近一次查询使用的 pageType（用于标签色等 UI）
  if (propsMethods) {
    propsMethods.setLastQueryPageType(normalized)
  }
  const params = {
    // 保留原有 page 字段以兼容旧后端，同时新增 pageType（新规范）
    page: pageTypeStr,
    pageType: normalized,
    deletedFlag: '0',
    // 文本输入框
    applicantName: searchParams.applicantName || null,
    contactPhone: searchParams.contactPhone || null,
    idCardNo: searchParams.idCardNo || null,
    applyPosition: searchParams.applyPosition || null,
    assignedUser: searchParams.assignedUser || null,
    // 下拉选择器
    gender: searchParams.gender,
    politicalStatus: searchParams.politicalStatus,
    foreignLanguageLevel: searchParams.foreignLanguageLevel,
    auditStatus: searchParams.auditStatus,
    // 日期选择器
    birthDate: searchParams.birthDate || null,
    // 日期范围参数
    availableStartDate: searchParams.availableDateRange?.[0] || null,
    availableEndDate: searchParams.availableDateRange?.[1] || null,
    assignedStartDate: searchParams.assignedDateRange?.[0] || null,
    assignedEndDate: searchParams.assignedDateRange?.[1] || null,
    interviewerStartDate: searchParams.interviewerDateRange?.[0] || null,
    interviewerEndDate: searchParams.interviewerDateRange?.[1] || null,
    offerStartDate: searchParams.offerDateRange?.[0] || null,
    offerEndDate: searchParams.offerDateRange?.[1] || null
  }

  const response = await axios.post(apiPaths.applicantList, params)
  if (response.data.code === 2000) {
    let dataList = response.data.data || []
    // 处理头像URL，添加图片访问前缀
    dataList.forEach(item => {
      if (item.photoUrl && item.photoUrl.trim() !== '') {
        if (!item.photoUrl.startsWith('http')) {
          item.photoUrl = apiPaths.imageViewUrl + item.photoUrl
        }
      }
    })
    return dataList
  } else {
    throw new Error(response.data.message || '获取数据失败')
  }
}

// 按钮_查询
const handleSearch = async (searchComposable, tableComposable, props, propsComposable) => {
  tableComposable.loading.value = true
  try {
    const data = await queryData(searchComposable.searchForm, props.pageType || "1", propsComposable)
    tableComposable.dataList.value = data
    tableComposable.dataTotal.value = data.length
    ElMessage.success(`查询成功，共找到 ${data.length} 条记录`)
  } catch (error) {
    console.error("查询失败:", error)
    ElMessage.error("查询失败，请稍后重试")
  } finally {
    tableComposable.loading.value = false
  }
}

// 按钮_重置
const handleReset = (searchComposable, tableComposable, props, propsComposable) => {
  searchComposable.resetSearch()
  ElMessage.success("搜索条件已重置")
  handleSearch(searchComposable, tableComposable, props, propsComposable)
}

// 导出数据
const handleExport = async (searchComposable, props, propsComposable) => {
  try {
    await exportData(searchComposable.searchForm, props.pageType || "1", propsComposable)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 导出数据_通用函数
const exportData = async (searchParams, pageType = "1", propsMethods = null) => {
  const pageTypeStr = pageType != null ? String(pageType) : '1'
  const normalized = propsMethods ? propsMethods.normalizePageType(pageTypeStr) : pageTypeStr
  // 导出也更新最近一次使用的 pageType，保持 UI 一致
  if (propsMethods) {
    propsMethods.setLastQueryPageType(normalized)
  }
  const params = {
    // 保留原有 page 字段以兼容旧后端，同时新增 pageType（新规范）
    page: pageTypeStr,
    pageType: normalized,
    deletedFlag: '0',
    applicantName: searchParams.applicantName,
    gender: searchParams.gender,
    birthDate: searchParams.birthDate,
    contactPhone: searchParams.contactPhone,
    idCardNo: searchParams.idCardNo,
    politicalStatus: searchParams.politicalStatus,
    foreignLanguageLevel: searchParams.foreignLanguageLevel,
    applyPosition: searchParams.applyPosition,
    auditStatus: searchParams.auditStatus,
    assignedUser: searchParams.assignedUser,
    // 日期范围处理
    availableStartDate: searchParams.availableDateRange?.[0] || null,
    availableEndDate: searchParams.availableDateRange?.[1] || null,
    assignedStartDate: searchParams.assignedDateRange?.[0] || null,
    assignedEndDate: searchParams.assignedDateRange?.[1] || null,
    interviewerStartDate: searchParams.interviewerDateRange?.[0] || null,
    interviewerEndDate: searchParams.interviewerDateRange?.[1] || null,
    offerStartDate: searchParams.offerDateRange?.[0] || null,
    offerEndDate: searchParams.offerDateRange?.[1] || null
  }

  const response = await axios({
    url: apiPaths.applicantExport,
    method: 'POST',
    data: params,
    responseType: 'blob'
  })

  if (response.data) {
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = decodeURIComponent(response.headers['file-name'])
    link.click()
    window.URL.revokeObjectURL(link.href)
  } else {
    throw new Error('导出失败')
  }
}

//************************** 21.主表按钮2 **************************

// 按钮_新增
const handleCreate = (formComposable, fileComposable, subTableComposable) => {
  closeAllDialogs(formComposable, subTableComposable)
  formComposable.openForm("create")
  initFormData(formComposable)

  // 清空文件相关数据
  fileComposable.pendingImageFile.value = null
  fileComposable.pendingImagePreview.value = ''

  // 清空所有子表数据
  subTableComposable.workList.value = []
  subTableComposable.workExperienceList.value = []
  subTableComposable.trainingList.value = []
  subTableComposable.familyList.value = []
  subTableComposable.educationList.value = []

  // 重置所有子表表单
  resetWorkExperienceForm(subTableComposable)
  resetTrainingForm(subTableComposable)
  resetFamilyForm(subTableComposable)
  resetEducationForm(subTableComposable)

  ElMessage.success("已打开新增表单")
}

// 按钮_详情
const handleDetail = (row, formComposable, subTableComposable, fileComposable) => {
  closeAllDialogs(formComposable, subTableComposable)
  formComposable.openForm("detail", row)
  loadApplicantDetailWrapper(row.id, formComposable, subTableComposable, fileComposable)
  ElMessage.success("已打开详情")
}

// 按钮_编辑
const handleUpdate = (row, formComposable, subTableComposable, fileComposable) => {
  closeAllDialogs(formComposable, subTableComposable)
  formComposable.openForm("update", row)
  loadApplicantDetailWrapper(row.id, formComposable, subTableComposable, fileComposable)
  ElMessage.success("已打开编辑表单")
}

// 按钮_删除
const handleDelete = async (row, tableComposable, searchComposable, props, propsComposable) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await axios.post(apiPaths.applicantDelete, { id: row.id, opera: "1" })
    if (response.data.code === 2000) {
      ElMessage.success('删除成功')
      handleSearch(searchComposable, tableComposable, props, propsComposable)
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 按钮_保存
const handleSave = async (formComposable, fileComposable, subTableComposable, searchComposable, tableComposable, props, propsComposable) => {
  try {
    // 对齐参考实现：保存前进行表单校验，并在保存过程中展示加载状态
    if (!formComposable.dataFormRef?.value) {
      ElMessage.error('表单引用不存在，无法保存')
      return
    }

    const valid = await formComposable.dataFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查表单参数')
      return
    }

    formComposable.dataFormLoading.value = true

    await handleFormSave(
      formComposable,
      fileComposable,
      subTableComposable,
      () => handleSearch(searchComposable, tableComposable, props, propsComposable)
    )
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请检查输入信息')
  } finally {
    formComposable.dataFormLoading.value = false
  }
}

// 关闭所有弹框
const closeAllDialogs = (formComposable, subTableComposable, recycleBinComposable = null) => {
  console.log('🚨 closeAllDialogs 被调用', {
    caller: new Error().stack.split('\n')[2]?.trim(),
    timestamp: new Date().toISOString()
  })
  formComposable.dataFormVisible.value = false
  subTableComposable.educationDialogVisible.value = false
  subTableComposable.workExperienceDialogVisible.value = false
  subTableComposable.trainingDialogVisible.value = false
  subTableComposable.familyDialogVisible.value = false
  if (recycleBinComposable) {
    recycleBinComposable.recycleBinVisible.value = false
  }
}

//************************** 22.主表加载处理 **************************

// 初始化表单数据
const initFormData = (formComposable) => {
  Object.keys(formComposable.dataForm).forEach(key => {
    if (key === 'homeAddress' || key === 'currentAddress') {
      formComposable.dataForm[key] = {
        region: [],
        province: "",
        city: "",
        district: "",
        detail: "",
        street: "",
        postalCode: ""
      }
    } else if (key === 'householdRegister' || key === 'nativePlace') {
      formComposable.dataForm[key] = {
        region: [],
        province: "",
        city: "",
        district: "",
        detail: ""
      }
    } else if (key === 'emergencyContact') {
      formComposable.dataForm[key] = {
        name: "",
        relationship: "",
        phone: "",
        address: ""
      }
    } else if (key === 'pastHistory') {
      formComposable.dataForm[key] = {
        infectious: false,
        allergy: false,
        surgery: false,
        other: false
      }
    } else if (key === 'currentHistory') {
      formComposable.dataForm[key] = {
        disability: false,
        mental: false,
        colorBlind: false,
        acrophobia: false,
        altitudeSick: false,
        epilepsy: false,
        other: false
      }
    } else if (key === 'familyHistory') {
      formComposable.dataForm[key] = {
        heart: false,
        hypertension: false,
        diabetes: false,
        other: false
      }
    } else if (key === 'occupationalHistory') {
      formComposable.dataForm[key] = {
        ent: false,
        organ: false,
        other: false
      }
    } else if (key === 'applicationChannels') {
      formComposable.dataForm[key] = []
    } else if (typeof formComposable.dataForm[key] === 'string') {
      formComposable.dataForm[key] = ""
    } else if (typeof formComposable.dataForm[key] === 'number') {
      formComposable.dataForm[key] = key === 'gender' ? 1 :
        key === 'nation' ? 1 :
          key === 'politicalStatus' ? 3 :
            key === 'maritalStatus' ? 2 :
              key === 'bloodType' ? 1 :
                key === 'foreignLanguageLevel' ? 1 : 0
    } else {
      formComposable.dataForm[key] = null
    }
  })
}

// 加载应聘者详情 - 业务逻辑层的包装函数
const loadApplicantDetailWrapper = async (id, formComposable, subTableComposable, fileComposable) => {
  try {
    formComposable.dataFormLoading.value = true
    await loadApplicantDetail(id, formComposable, subTableComposable, fileComposable)
  } catch (error) {
    console.error('加载详情失败:', error)
    ElMessage.error('加载详情失败，请重试')
  } finally {
    formComposable.dataFormLoading.value = false
  }
}

// 加载应聘者详情
const loadApplicantDetail = async (id, formComposable, subTableComposable, fileComposable) => {
  try {
    const response = await axios({
      url: apiPaths.applicantDetail,
      method: 'POST',
      data: { id: id }
    })

    if (response.data.code === 2000) {
      const backendData = response.data.data

      // 初始化表单数据
      initFormData(formComposable)

      // 处理后端数据格式转换
      convertBackendDataToForm(formComposable, backendData)

      // 加载子表数据
      await loadSubTableData(subTableComposable, id)

      // 加载附件列表
      await loadApplicantAttachments(id, fileComposable)
    } else {
      ElMessage.error(response.data.message || '获取详情失败')
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error('获取详情失败:', error)
  }
}

// 转换后端数据到表单格式
const convertBackendDataToForm = (formComposable, backendData) => {
  // 基本字段处理
  Object.keys(backendData).forEach(key => {
    if (formComposable.dataForm.hasOwnProperty(key)) {
      const value = backendData[key]
      // 如果值是一个包含 key 和 value 的对象 (后端枚举格式)，则只取 key
      if (value && typeof value === 'object' && value.hasOwnProperty('key')) {
        formComposable.dataForm[key] = value.key
      } else {
        // 否则直接赋值
        formComposable.dataForm[key] = value
      }
    }
  })

  // 处理地址格式转换（后端格式 -> 前端级联选择器格式）
  convertAddressFormat(formComposable, backendData)

  // 处理头像URL，添加图片访问前缀
  if (backendData.photoUrl && backendData.photoUrl.trim() !== '') {
    // 如果photoUrl不是以http开头，则添加图片访问前缀
    if (!backendData.photoUrl.startsWith('http')) {
      formComposable.dataForm.photoUrl = apiPaths.imageViewUrl + backendData.photoUrl
    } else {
      formComposable.dataForm.photoUrl = backendData.photoUrl
    }
  }

  // 处理特殊字段
  handleSpecialFields(formComposable, backendData)
}

// 转换地址格式
const convertAddressFormat = (formComposable, backendData) => {
  // 处理籍贯
  if (backendData.nativePlace) {
    formComposable.dataForm.nativePlace = {
      region: buildRegionArray(backendData.nativePlace),
      province: backendData.nativePlace.province || '',
      city: backendData.nativePlace.city || '',
      district: backendData.nativePlace.district || '',
      detail: backendData.nativePlace.detail || ''
    }
  }

  // 处理户口所在地
  if (backendData.householdRegister) {
    formComposable.dataForm.householdRegister = {
      region: buildRegionArray(backendData.householdRegister),
      province: backendData.householdRegister.province || '',
      city: backendData.householdRegister.city || '',
      district: backendData.householdRegister.district || '',
      detail: backendData.householdRegister.detail || '',
      street: backendData.householdRegister.street || '',
      police: backendData.householdRegister.police || ''
    }
  }

  // 处理现家庭住址
  if (backendData.homeAddress) {
    formComposable.dataForm.homeAddress = {
      region: buildRegionArray(backendData.homeAddress),
      province: backendData.homeAddress.province || '',
      city: backendData.homeAddress.city || '',
      district: backendData.homeAddress.district || '',
      detail: backendData.homeAddress.detail || '',
      street: backendData.homeAddress.street || '',
      village: backendData.homeAddress.village || '',
      number: backendData.homeAddress.number || '',
      postalCode: backendData.homeAddress.postalCode || ''
    }
  }

  // 处理现居住地址
  if (backendData.currentAddress) {
    formComposable.dataForm.currentAddress = {
      region: buildRegionArray(backendData.currentAddress),
      province: backendData.currentAddress.province || '',
      city: backendData.currentAddress.city || '',
      district: backendData.currentAddress.district || '',
      detail: backendData.currentAddress.detail || '',
      street: backendData.currentAddress.street || '',
      postalCode: backendData.currentAddress.postalCode || ''
    }
  }
}

// 处理特殊字段
const handleSpecialFields = (formComposable, backendData) => {
  // 处理体重字段
  if (backendData.weight && typeof backendData.weight === 'object') {
    formComposable.dataForm.weight = backendData.weight.parsedValue || backendData.weight.source
  }

  // 确保病史对象存在并合并后端数据
  if (backendData.pastHistory) {
    Object.assign(formComposable.dataForm.pastHistory, backendData.pastHistory)
  }
  if (backendData.currentHistory) {
    Object.assign(formComposable.dataForm.currentHistory, backendData.currentHistory)
  }
  if (backendData.familyHistory) {
    Object.assign(formComposable.dataForm.familyHistory, backendData.familyHistory)
  }
  if (backendData.occupationalHistory) {
    Object.assign(formComposable.dataForm.occupationalHistory, backendData.occupationalHistory)
  }

  // 处理紧急联系人
  if (backendData.emergencyContact) {
    Object.assign(formComposable.dataForm.emergencyContact, backendData.emergencyContact)
  }

  // 处理应聘途径数组
  if (backendData.applicationChannels) {
    formComposable.dataForm.applicationChannels = Array.isArray(backendData.applicationChannels)
      ? backendData.applicationChannels
      : []
  }
}

// 加载子表数据
const loadSubTableData = async (subTableComposable, applicantId) => {
  console.log('📊 开始加载子表数据', { applicantId, timestamp: new Date().toISOString() })
  try {
    // 加载工作经历
    const workResponse = await axios.post(apiPaths.applicantWorkList, { applicantId: applicantId })
    if (workResponse.data.code === 2000) {
      subTableComposable.workList.value = workResponse.data.data || []
      subTableComposable.workExperienceList.value = workResponse.data.data || []
      console.log('📊 工作经历数据加载完成', { count: workResponse.data.data?.length || 0 })
    }

    // 加载培训经历
    const trainingResponse = await axios.post(apiPaths.applicantTrainingList, { applicantId: applicantId })
    if (trainingResponse.data.code === 2000) {
      subTableComposable.trainingList.value = trainingResponse.data.data || []
    }

    // 加载家庭情况
    const familyResponse = await axios.post(apiPaths.applicantFamilyList, { applicantId: applicantId })
    if (familyResponse.data.code === 2000) {
      subTableComposable.familyList.value = familyResponse.data.data || []
    }

    // 加载学习经历
    const educationResponse = await axios.post(apiPaths.applicantEducationList, { applicantId: applicantId })
    if (educationResponse.data.code === 2000) {
      subTableComposable.educationList.value = educationResponse.data.data?.map(item => ({
        ...item,
        educationLevel: Number(
          item.educationLevel && item.educationLevel.key != null
            ? item.educationLevel.key
            : item.educationLevel
        ),
        schoolNature: Number(
          item.schoolNature && item.schoolNature.key != null
            ? item.schoolNature.key
            : item.schoolNature
        )
      })) || []
    }
  } catch (error) {
    console.error('加载子表数据失败:', error)
  }
}

// 加载应聘者附件列表
const loadApplicantAttachments = async (applicantId, fileComposable) => {
  if (!applicantId) {
    console.warn('应聘者ID为空，无法加载附件列表')
    return
  }

  if (!fileComposable) {
    console.error('fileComposable未定义，无法加载附件列表')
    return
  }

  try {
    const response = await axios.post(apiPaths.attachmentListUrl, { applicantId: applicantId })
    if (response.data.code === 2000) {
      const attachments = response.data.data || []
      console.log('附件列表加载成功，共', attachments.length, '个附件')
      // 按类型分组附件数据
      const attachmentsByType = {}
      attachments.forEach(item => {
        // 处理后端可能返回 {key, value} 格式的 attachmentType
        const typeKey = item.attachmentType && typeof item.attachmentType === 'object'
          ? item.attachmentType.key
          : item.attachmentType
        console.log('附件类型处理:', item.attachmentName, '原始类型:', item.attachmentType, '处理后类型:', typeKey)
        attachmentsByType[typeKey] = item
      })

      // 更新附件表格数据，设置附件ID和状态
      const typeKeyMap = {
        1: 'idCard',      // 身份证
        2: 'degree',      // 学位证
        3: 'graduation',  // 毕业证
        4: 'eduReg',      // 学历证书备案表
        5: 'gradVerify'   // 毕业证在线验证报告
      }

      fileComposable.attachmentTableData.value.forEach(row => {
        const typeKey = Object.keys(typeKeyMap).find(key => typeKeyMap[key] === row.bizKey)
        console.log('处理表格行:', row.bizKey, '对应类型键:', typeKey, '是否有附件:', !!attachmentsByType[typeKey])

        if (typeKey && attachmentsByType[typeKey]) {
          const attachment = attachmentsByType[typeKey]
          row.attachmentId = attachment.id
          row.hasAttachment = true
          row.attachmentName = attachment.attachmentName
          row.attachmentUrl = apiPaths.attachmentViewUrl + attachment.id
          row.isPending = false
          row.uploadStatus = 'none'
          console.log('更新表格行为已上传:', row.bizKey, 'ID:', attachment.id, '名称:', attachment.attachmentName)
        } else {
          // 重置为未上传状态
          row.attachmentId = null
          row.hasAttachment = false
          row.attachmentName = ''
          row.attachmentUrl = ''
          row.isPending = false
          row.uploadStatus = 'none'
          console.log('重置表格行为未上传:', row.bizKey)
        }
      })
    }
  } catch (error) {
    console.error('加载附件列表失败:', error)
  }
}

//************************** 22.主表保存处理 **************************

// 表单保存的通用函数
const handleFormSave = async (formComposable, fileComposable, subTableComposable, refreshCallback) => {
  console.log('💾 handleFormSave 开始执行', {
    status: formComposable.dataFormStatus.value,
    timestamp: new Date().toISOString()
  })

  const { dataFormStatus } = formComposable

  if (dataFormStatus.value === 'create') {
    await handleCreateSave(formComposable, fileComposable, subTableComposable)
  } else if (dataFormStatus.value === 'update') {
    await handleUpdateSave(formComposable)
  }

  refreshCallback()
  console.log('🚨 handleFormSave 即将关闭主弹框', {
    caller: 'handleFormSave',
    timestamp: new Date().toISOString()
  })
  formComposable.dataFormVisible.value = false
}

// 处理新增保存
const handleCreateSave = async (formComposable, fileComposable, subTableComposable) => {
  const { dataForm } = formComposable

  // 第一步：保存基本信息
  const payload = prepareDataForSave(dataForm)
  const response = await axios.post(apiPaths.applicantInsert, payload)

  if (response.data.code !== 2000) {
    throw new Error(response.data.message || '保存基本信息失败')
  }

  if (!response.data.data) {
    throw new Error('保存成功但未返回记录ID')
  }

  const newApplicantId = response.data.data
  dataForm.id = newApplicantId
  ElMessage.success('基本信息保存成功')

  // 第二步：保存子表数据
  try {
    await saveAllSubTableData(newApplicantId, subTableComposable)
    ElMessage.success('子表数据保存成功')
  } catch (error) {
    console.error('子表数据保存失败:', error)
    ElMessage.warning('基本信息已保存，但子表数据保存失败，请手动重新添加')
  }

  // 第三步：处理待上传的图片
  if (fileComposable.pendingImageFile.value) {
    try {
      ElMessage.info('正在上传图片...')
      await processPendingImageUpload(formComposable, fileComposable)
      ElMessage.success('图片上传成功')
    } catch (imageError) {
      console.error('图片上传失败:', imageError)
      ElMessage.warning('基本信息已保存，但图片上传失败，请手动重新上传')
    }
  }

  // 第四步：处理待上传的附件
  const pendingCount = getPendingAttachmentsCount(fileComposable)
  if (pendingCount > 0) {
    try {
      await processPendingAttachments(formComposable, fileComposable)
      const failedCount = Object.values(fileComposable.attachmentUploadStatus.value)
        .filter(status => status === 'error').length
      if (failedCount === 0) {
        ElMessage.success('所有附件上传成功')
      } else {
        ElMessage.warning(`基本信息已保存，但有 ${failedCount} 个附件上传失败，请手动重新上传`)
      }
    } catch (attachmentError) {
      console.error('附件上传失败:', attachmentError)
      ElMessage.warning('基本信息已保存，但附件上传失败，请手动重新上传')
    }
  }

  if (!fileComposable.pendingImageFile.value && pendingCount === 0) {
    ElMessage.success('应聘者信息创建完成')
  }
}

// 保存所有子表数据
const saveAllSubTableData = async (applicantId, subTableComposable) => {
  const {
    workExperienceList, // 使用待提交的工作经历列表，保持与参考实现一致
    trainingList,
    familyList,
    educationList
  } = subTableComposable

  const saveResults = {
    workExperience: { success: 0, failed: 0, errors: [] },
    training: { success: 0, failed: 0, errors: [] },
    family: { success: 0, failed: 0, errors: [] },
    education: { success: 0, failed: 0, errors: [] }
  }

  // 保存工作经历（优先保存创建流程中暂存的列表）
  if (workExperienceList.value.length > 0) {
    ElMessage.info('正在保存工作经历...')
    for (let i = 0; i < workExperienceList.value.length; i++) {
      const workExp = workExperienceList.value[i]
      try {
        workExp.applicantId = applicantId
        const response = await axios.post(apiPaths.applicantWorkInsert, workExp)
        if (response.data.code === 2000) {
          saveResults.workExperience.success++
          workExperienceList.value[i].id = response.data.data
        } else {
          saveResults.workExperience.failed++
          saveResults.workExperience.errors.push(`工作经历${i + 1}: ${response.data.message || '保存失败'}`)
        }
      } catch (error) {
        saveResults.workExperience.failed++
        saveResults.workExperience.errors.push(`工作经历${i + 1}: 网络错误`)
        console.error(`保存工作经历${i + 1}失败:`, error)
      }
    }
  }

  // 保存培训经历
  if (trainingList.value.length > 0) {
    ElMessage.info('正在保存培训经历...')
    for (let i = 0; i < trainingList.value.length; i++) {
      const training = trainingList.value[i]
      try {
        training.applicantId = applicantId
        const response = await axios.post(apiPaths.applicantTrainingInsert, training)
        if (response.data.code === 2000) {
          saveResults.training.success++
          trainingList.value[i].id = response.data.data
        } else {
          saveResults.training.failed++
          saveResults.training.errors.push(`培训经历${i + 1}: ${response.data.message || '保存失败'}`)
        }
      } catch (error) {
        saveResults.training.failed++
        saveResults.training.errors.push(`培训经历${i + 1}: 网络错误`)
        console.error(`保存培训经历${i + 1}失败:`, error)
      }
    }
  }

  // 保存家庭情况
  if (familyList.value.length > 0) {
    ElMessage.info('正在保存家庭情况...')
    for (let i = 0; i < familyList.value.length; i++) {
      const family = familyList.value[i]
      try {
        family.applicantId = applicantId
        const response = await axios.post(apiPaths.applicantFamilyInsert, family)
        if (response.data.code === 2000) {
          saveResults.family.success++
          familyList.value[i].id = response.data.data
        } else {
          saveResults.family.failed++
          saveResults.family.errors.push(`家庭情况${i + 1}: ${response.data.message || '保存失败'}`)
        }
      } catch (error) {
        saveResults.family.failed++
        saveResults.family.errors.push(`家庭情况${i + 1}: 网络错误`)
        console.error(`保存家庭情况${i + 1}失败:`, error)
      }
    }
  }

  // 保存学习经历
  if (educationList.value.length > 0) {
    ElMessage.info('正在保存学习经历...')
    for (let i = 0; i < educationList.value.length; i++) {
      const education = educationList.value[i]
      try {
        education.applicantId = applicantId
        const response = await axios.post(apiPaths.applicantEducationInsert, education)
        if (response.data.code === 2000) {
          saveResults.education.success++
          educationList.value[i].id = response.data.data
        } else {
          saveResults.education.failed++
          saveResults.education.errors.push(`学习经历${i + 1}: ${response.data.message || '保存失败'}`)
        }
      } catch (error) {
        saveResults.education.failed++
        saveResults.education.errors.push(`学习经历${i + 1}: 网络错误`)
        console.error(`保存学习经历${i + 1}失败:`, error)
      }
    }
  }

  // 如果有失败的记录，抛出错误
  const totalFailed = Object.values(saveResults).reduce((sum, result) => sum + result.failed, 0)
  if (totalFailed > 0) {
    throw new Error(`子表数据保存完成，但有 ${totalFailed} 条记录保存失败`)
  }
}

// 处理编辑保存
const handleUpdateSave = async (formComposable) => {
  const { dataForm } = formComposable
  const payload = prepareDataForSave(dataForm)
  const response = await axios.post(apiPaths.applicantUpdate, payload)

  if (response.data.code === 2000) {
    ElMessage.success('修改成功')
  } else {
    throw new Error(response.data.message || '修改失败')
  }
}

// 准备保存数据
const prepareDataForSave = (dataForm) => {
  const payload = JSON.parse(JSON.stringify(dataForm))

  // 处理上传图片url（与参考实现一致：始终去掉预览前缀）
  payload.photoUrl = (payload.photoUrl || '').replace(apiPaths.imageViewUrl, '')

  // 处理联系电话字段
  if (Array.isArray(payload.contactPhone)) {
    payload.contactPhone = payload.contactPhone.length > 0 ? payload.contactPhone[0] : ''
  }
  if (typeof payload.contactPhone !== 'string') {
    payload.contactPhone = String(payload.contactPhone || '')
  }

  // 处理身份证号字段
  if (Array.isArray(payload.idCardNo)) {
    payload.idCardNo = payload.idCardNo.length > 0 ? payload.idCardNo[0] : ''
  }
  if (typeof payload.idCardNo !== 'string') {
    payload.idCardNo = String(payload.idCardNo || '')
  }

  // 处理枚举字段：将 {key, value} 对象转换为 key 值
  Object.keys(payload).forEach(key => {
    const value = payload[key]
    if (value && typeof value === 'object' && 'key' in value && 'value' in value) {
      payload[key] = value.key
    }
  })

  // 处理地址格式
  payload.homeAddress = convertAddressToBackend(payload.homeAddress)
  payload.householdRegister = convertAddressToBackend(payload.householdRegister)
  payload.nativePlace = convertAddressToBackend(payload.nativePlace)

  // 处理病史对象
  payload.pastHistory = payload.pastHistory || {}
  payload.currentHistory = payload.currentHistory || {}
  payload.familyHistory = payload.familyHistory || {}
  payload.occupationalHistory = payload.occupationalHistory || {}

  // 处理应聘途径数组
  payload.applicationChannels = Array.isArray(payload.applicationChannels)
    ? payload.applicationChannels : []

  // 强制格式化日期字段
  const dateFields = ['birthDate', 'availableDate', 'dischargeDate', 'fillDate']
  dateFields.forEach(field => {
    if (payload[field]) {
      payload[field] = dayjs(payload[field]).format('YYYY-MM-DD')
    }
  })

  // 白名单字段
  const allowedFields = [
    'id', 'applicantName', 'applyPosition', 'photoUrl', 'gender', 'birthDate',
    'nation', 'politicalStatus', 'maritalStatus', 'height', 'weight',
    'visionLeft', 'visionRight', 'bloodType', 'professionalTitle',
    'foreignLanguageLevel', 'foreignLanguageScore', 'contactPhone', 'idCardNo',
    'availableDate', 'isVeteran', 'dischargeDate', 'dischargeCertNo',
    'homeAddress', 'householdRegister', 'nativePlace', 'pastHistory',
    'currentHistory', 'familyHistory', 'occupationalHistory',
    'applicationChannels', 'otherHistory', 'noHistoryStatement',
    'agreeShiftWork', 'needAccommodation', 'signature', 'fillDate'
  ]

  const cleanPayload = {}
  allowedFields.forEach(field => {
    if (payload.hasOwnProperty(field)) {
      cleanPayload[field] = payload[field]
    }
  })

  return cleanPayload
}

// 转换地址格式为后端格式
const convertAddressToBackend = (address) => {
  if (!address || !address.region || !Array.isArray(address.region)) {
    return {
      province: '',
      city: '',
      district: '',
      detail: address ? (address.detail || '') : ''
    }
  }

  return {
    province: address.region[0] || '',
    city: address.region[1] || '',
    district: address.region[2] || '',
    detail: address.detail || '',
    street: address.street || '',
    village: address.village || '',
    number: address.number || '',
    police: address.police || ''
  }
}

//************************************************ 第3.3部分：回收站 *****************************************************

//************************** 31.回收站操作 **************************

// 查询回收站数据
const queryRecycleData = async (searchParams) => {
  const params = {
    page: 'allocate',
    deletedFlag: 1,
    applicantName: searchParams.applicantName || null,
    contactPhone: searchParams.contactPhone || null,
    idCardNo: searchParams.idCardNo || null,
  }

  const response = await axios.post(apiPaths.applicantList, params)
  if (response.data.code === 2000) {
    let recycleDataList = response.data.data || []
    // 处理头像URL
    recycleDataList.forEach(item => {
      if (item.photoUrl && item.photoUrl.trim() !== '') {
        if (!item.photoUrl.startsWith('http')) {
          item.photoUrl = apiPaths.imageViewUrl + item.photoUrl
        }
      }
    })
    return recycleDataList
  } else {
    throw new Error(response.data.message || '获取回收站数据失败')
  }
}

// 打开回收站
const handleRecycleBin = (recycleBinComposable) => {
  recycleBinComposable.openRecycleBin()
  // 打开时重置搜索表单并加载数据
  nextTick(async () => {
    recycleBinComposable.recycleSearchForm.applicantName = ''
    recycleBinComposable.recycleSearchForm.contactPhone = ''
    recycleBinComposable.recycleSearchForm.idCardNo = ''
    recycleBinComposable.recycleBinCurrentPage.value = 1
    await handleRecycleSearch(recycleBinComposable)
  })
}

// 回收站搜索
const handleRecycleSearch = async (recycleBinComposable) => {
  recycleBinComposable.recycleBinLoading.value = true
  try {
    recycleBinComposable.recycleBinCurrentPage.value = 1
    const data = await queryRecycleData(recycleBinComposable.recycleSearchForm)
    recycleBinComposable.recycleBinList.value = data
    recycleBinComposable.recycleBinTotal.value = data.length
    ElMessage.success(`查询成功，共找到 ${data.length} 条记录`)
  } catch (error) {
    console.error('查询回收站数据失败:', error)
    ElMessage.error('查询失败，请稍后重试')
  } finally {
    recycleBinComposable.recycleBinLoading.value = false
  }
}

// 回收站重置
const handleRecycleReset = async (recycleBinComposable) => {
  recycleBinComposable.recycleSearchForm.applicantName = ''
  recycleBinComposable.recycleSearchForm.contactPhone = ''
  recycleBinComposable.recycleSearchForm.idCardNo = ''
  recycleBinComposable.recycleBinCurrentPage.value = 1
  await handleRecycleSearch(recycleBinComposable)
}

// 回收站详情
const handleRecycleDetail = (row, formComposable, subTableComposable, fileComposable) => {
  formComposable.dataFormStatus.value = 'detail'
  formComposable.dataFormTitle.value = '回收站应聘者详情'
  formComposable.dataFormVisible.value = true
  formComposable.activeTabName.value = 'basic'
  loadApplicantDetail(row.id, formComposable, subTableComposable, fileComposable)
}

// 还原数据
const handleRestore = async (id, recycleBinComposable, searchComposable, tableComposable, props, propsComposable) => {
  try {
    await ElMessageBox.confirm(
      '确认还原该应聘者吗？还原后将重新出现在主列表中！',
      '还原确认',
      {
        type: 'warning',
        confirmButtonText: '确认还原',
        cancelButtonText: '取消'
      }
    )

    recycleBinComposable.recycleBinLoading.value = true
    const response = await axios({
      url: apiPaths.applicantDelete,
      method: 'POST',
      data: { id: id, opera: "2" }
    })

    if (response.data.code === 2000) {
      ElMessage.success('还原成功')
      // 刷新回收站数据
      await handleRecycleSearch(recycleBinComposable)
      // 刷新主表数据
      await handleSearch(searchComposable, tableComposable, props, propsComposable)
    } else {
      ElMessage.error(response.data.message || '还原失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('还原失败')
      console.error('还原失败:', error)
    }
  } finally {
    recycleBinComposable.recycleBinLoading.value = false
  }
}

// 彻底删除数据
const handleTruncate = async (id, recycleBinComposable, searchComposable, tableComposable, props, propsComposable) => {
  try {
    await ElMessageBox.confirm(
      '确认彻底删除该应聘者吗？彻底删除后将不再出现在主列表中！',
      '彻底删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认彻底删除',
        cancelButtonText: '取消'
      }
    )

    recycleBinComposable.recycleBinLoading.value = true
    const response = await axios({
      url: apiPaths.applicantDelete,
      method: 'POST',
      data: { id: id, opera: "0" }
    })

    if (response.data.code === 2000) {
      ElMessage.success('彻底删除成功')
      // 刷新回收站数据
      await handleRecycleSearch(recycleBinComposable)
      // 刷新主表数据
      await handleSearch(searchComposable, tableComposable, props, propsComposable)
    } else {
      ElMessage.error(response.data.message || '彻底删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('彻底删除失败')
      console.error('彻底删除失败:', error)
    }
  } finally {
    recycleBinComposable.recycleBinLoading.value = false
  }
}

// 回收站分页-页码改变
const handleRecyclePageChange = (val, recycleBinComposable) => {
  recycleBinComposable.recycleCurrentPage.value = val
}

// 回收站分页-每页大小改变
const handleRecyclePageSizeChange = (val, recycleBinComposable) => {
  recycleBinComposable.recyclePageSize.value = val
  recycleBinComposable.recycleCurrentPage.value = 1
}

//************************************************ 第3.4部分：子表 ********************************************************

//************************** 41.工作经历子表 **************************

// 工作经历-新增
const handleAddWorkExperience = (subTableComposable) => {
  subTableComposable.workExperienceDialogTitle.value = '新增工作经历'
  subTableComposable.currentWorkExperienceIndex.value = -1
  resetWorkExperienceForm(subTableComposable)
  subTableComposable.workExperienceDialogVisible.value = true
}

// 工作经历-编辑
const handleEditWorkExperience = (row, index, subTableComposable) => {
  subTableComposable.workExperienceDialogTitle.value = '编辑工作经历'
  subTableComposable.currentWorkExperienceIndex.value = index
  Object.assign(subTableComposable.workExperienceForm, row)
  subTableComposable.workExperienceDialogVisible.value = true
}

// 工作经历-删除
const handleDeleteWorkExperience = async (index, subTableComposable) => {
  try {
    const row = subTableComposable.workList.value[index]
    if (row.id) {
      // 有ID，调用后端删除API
      await ElMessageBox.confirm(
        '确认删除该工作经历吗？此操作不可撤销！',
        '删除确认',
        {
          type: 'warning',
          confirmButtonText: '确认删除',
          cancelButtonText: '取消'
        }
      )

      const response = await axios({
        url: apiPaths.applicantWorkDelete,
        method: 'POST',
        data: { id: row.id }
      })

      if (response.data.code === 2000) {
        ElMessage.success('删除成功')
        subTableComposable.workList.value.splice(index, 1)
      } else {
        ElMessage.error(response.data.message || '删除失败')
      }
    } else {
      // 无ID，仅前端删除
      subTableComposable.workList.value.splice(index, 1)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除工作经历失败:', error)
    }
  }
}

// 工作经历-保存
const handleSaveWorkExperience = async (subTableComposable, formComposable, workExperienceFormRef) => {
  console.log('🏢 工作经历保存开始', {
    formData: JSON.stringify(subTableComposable.workExperienceForm, null, 2),
    mainDialogVisible: formComposable.dataFormVisible.value,
    workDialogVisible: subTableComposable.workExperienceDialogVisible.value,
    timestamp: new Date().toISOString()
  })

  try {
    const valid = await workExperienceFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查表单参数')
      return
    }

    // 额外的时间验证
    const dateValidation = validateDateRange(
      subTableComposable.workExperienceForm.startDate,
      subTableComposable.workExperienceForm.endDate,
      '时间'
    )
    if (dateValidation !== true) {
      ElMessage.error(dateValidation)
      return
    }

    subTableComposable.workExperienceForm.applicantId = formComposable.dataForm.id
    const isEdit = subTableComposable.currentWorkExperienceIndex.value !== -1

    console.log('🏢 工作经历保存模式', { isEdit, hasId: !!subTableComposable.workExperienceForm.id })

    if (isEdit && subTableComposable.workExperienceForm.id) {
      // 编辑模式，调用更新API
      const response = await axios({
        url: apiPaths.applicantWorkUpdate,
        method: 'POST',
        data: subTableComposable.workExperienceForm
      })

      if (response.data.code === 2000) {
        ElMessage.success('更新成功')
        subTableComposable.workExperienceList.value[subTableComposable.currentWorkExperienceIndex.value] = {
          ...subTableComposable.workExperienceForm
        }
      } else {
        ElMessage.error(response.data.message || '更新失败')
      }
    } else if (formComposable.dataForm.id) {
      // 新增模式，调用新增API
      const response = await axios({
        url: apiPaths.applicantWorkInsert,
        method: 'POST',
        data: subTableComposable.workExperienceForm
      })

      if (response.data.code === 2000) {
        ElMessage.success('新增成功')
        console.log('🏢 工作经历新增成功，开始重新加载子表数据')
        // 重新加载工作经历列表
        await loadSubTableData(subTableComposable, formComposable.dataForm.id)
        console.log('🏢 子表数据重新加载完成')
      } else {
        ElMessage.error(response.data.message || '新增失败')
      }
    } else {
      // 无应聘者ID，仅前端操作
      if (isEdit) {
        subTableComposable.workExperienceList.value[subTableComposable.currentWorkExperienceIndex.value] = {
          ...subTableComposable.workExperienceForm
        }
      } else {
        subTableComposable.workExperienceList.value.push({ ...subTableComposable.workExperienceForm })
      }
      ElMessage.success(isEdit ? '更新成功' : '新增成功')
    }

    console.log('🏢 工作经历保存完成，即将关闭工作经历弹框', {
      mainDialogVisible: formComposable.dataFormVisible.value,
      workDialogVisible: subTableComposable.workExperienceDialogVisible.value,
      timestamp: new Date().toISOString()
    })
    subTableComposable.workExperienceDialogVisible.value = false
    console.log('🏢 工作经历弹框已关闭', {
      mainDialogVisible: formComposable.dataFormVisible.value,
      workDialogVisible: subTableComposable.workExperienceDialogVisible.value,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('保存工作经历失败:', error)
  }
}

// 工作经历-重置表单
const resetWorkExperienceForm = (subTableComposable) => {
  // 重置workExperienceForm（主要表单对象）
  Object.assign(subTableComposable.workExperienceForm, {
    id: '',
    applicantId: '',
    startDate: '',
    endDate: '',
    companyName: '',
    position: '',
    businessScope: '',
    referencePerson: '',
    referenceContact: ''
  })
}

//************************** 42.培训经历子表 **************************

// 培训经历-新增
const handleAddTraining = (subTableComposable) => {
  subTableComposable.trainingDialogTitle.value = '新增培训经历'
  subTableComposable.currentTrainingIndex.value = -1
  resetTrainingForm(subTableComposable)
  subTableComposable.trainingDialogVisible.value = true
}

// 培训经历-编辑
const handleEditTraining = (row, index, subTableComposable) => {
  subTableComposable.trainingDialogTitle.value = '编辑培训经历'
  subTableComposable.currentTrainingIndex.value = index
  Object.assign(subTableComposable.trainingForm, row)
  subTableComposable.trainingDialogVisible.value = true
}

// 培训经历-删除
const handleDeleteTraining = async (index, subTableComposable) => {
  try {
    const row = subTableComposable.trainingList.value[index]
    if (row.id) {
      // 有ID，调用后端删除API
      await ElMessageBox.confirm(
        '确认删除该培训经历吗？此操作不可撤销！',
        '删除确认',
        {
          type: 'warning',
          confirmButtonText: '确认删除',
          cancelButtonText: '取消'
        }
      )

      const response = await axios({
        url: apiPaths.applicantTrainingDelete,
        method: 'POST',
        data: { id: row.id }
      })

      if (response.data.code === 2000) {
        ElMessage.success('删除成功')
        subTableComposable.trainingList.value.splice(index, 1)
      } else {
        ElMessage.error(response.data.message || '删除失败')
      }
    } else {
      // 无ID，仅前端删除
      subTableComposable.trainingList.value.splice(index, 1)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除培训经历失败:', error)
    }
  }
}

// 培训经历-保存
const handleSaveTraining = async (subTableComposable, formComposable, trainingFormRef) => {
  try {
    const valid = await trainingFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查表单参数')
      return
    }

    // 额外的时间验证
    const dateValidation = validateDateRange(
      subTableComposable.trainingForm.startDate,
      subTableComposable.trainingForm.endDate,
      '时间'
    )
    if (dateValidation !== true) {
      ElMessage.error(dateValidation)
      return
    }

    subTableComposable.trainingForm.applicantId = formComposable.dataForm.id
    const isEdit = subTableComposable.currentTrainingIndex.value !== -1

    if (isEdit && subTableComposable.trainingForm.id) {
      // 编辑模式，调用更新API
      const response = await axios({
        url: apiPaths.applicantTrainingUpdate,
        method: 'POST',
        data: subTableComposable.trainingForm
      })

      if (response.data.code === 2000) {
        ElMessage.success('更新成功')
        subTableComposable.trainingList.value[subTableComposable.currentTrainingIndex.value] = {
          ...subTableComposable.trainingForm
        }
      } else {
        ElMessage.error(response.data.message || '更新失败')
      }
    } else if (formComposable.dataForm.id) {
      // 新增模式，调用新增API
      const response = await axios({
        url: apiPaths.applicantTrainingInsert,
        method: 'POST',
        data: subTableComposable.trainingForm
      })

      if (response.data.code === 2000) {
        ElMessage.success('新增成功')
        // 重新加载培训经历列表
        await loadSubTableData(subTableComposable, formComposable.dataForm.id)
      } else {
        ElMessage.error(response.data.message || '新增失败')
      }
    } else {
      // 无应聘者ID，仅前端操作
      if (isEdit) {
        subTableComposable.trainingList.value[subTableComposable.currentTrainingIndex.value] = {
          ...subTableComposable.trainingForm
        }
      } else {
        subTableComposable.trainingList.value.push({ ...subTableComposable.trainingForm })
      }
      ElMessage.success(isEdit ? '更新成功' : '新增成功')
    }

    subTableComposable.trainingDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('保存培训经历失败:', error)
  }
}

// 培训经历-重置表单
const resetTrainingForm = (subTableComposable) => {
  // 使用Object.assign重置整个表单对象
  Object.assign(subTableComposable.trainingForm, {
    id: '',
    applicantId: '',
    startDate: '',
    endDate: '',
    trainingName: '',
    qualification: ''
  })
}

//************************** 43.家庭情况子表 **************************

// 家庭情况-新增
const handleAddFamily = (subTableComposable) => {
  subTableComposable.familyDialogTitle.value = '新增家庭成员'
  subTableComposable.currentFamilyIndex.value = -1
  resetFamilyForm(subTableComposable)
  subTableComposable.familyDialogVisible.value = true
}

// 家庭情况-编辑
const handleEditFamily = (row, index, subTableComposable) => {
  subTableComposable.familyDialogTitle.value = '编辑家庭成员'
  subTableComposable.currentFamilyIndex.value = index
  Object.assign(subTableComposable.familyForm, row)
  subTableComposable.familyDialogVisible.value = true
}

// 家庭情况-删除
const handleDeleteFamily = async (index, subTableComposable) => {
  try {
    const row = subTableComposable.familyList.value[index]
    if (row.id) {
      // 有ID，调用后端删除API
      await ElMessageBox.confirm(
        '确认删除该家庭成员吗？此操作不可撤销！',
        '删除确认',
        {
          type: 'warning',
          confirmButtonText: '确认删除',
          cancelButtonText: '取消'
        }
      )

      const response = await axios({
        url: apiPaths.applicantFamilyDelete,
        method: 'POST',
        data: { id: row.id }
      })

      if (response.data.code === 2000) {
        ElMessage.success('删除成功')
        subTableComposable.familyList.value.splice(index, 1)
      } else {
        ElMessage.error(response.data.message || '删除失败')
      }
    } else {
      // 无ID，仅前端删除
      subTableComposable.familyList.value.splice(index, 1)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除家庭情况失败:', error)
    }
  }
}

// 家庭情况-保存
const handleSaveFamily = async (subTableComposable, formComposable, familyFormRef) => {
  try {
    const valid = await familyFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查表单参数')
      return
    }

    subTableComposable.familyForm.applicantId = formComposable.dataForm.id
    const isEdit = subTableComposable.currentFamilyIndex.value !== -1

    if (isEdit && subTableComposable.familyForm.id) {
      // 编辑模式，调用更新API
      const response = await axios({
        url: apiPaths.applicantFamilyUpdate,
        method: 'POST',
        data: subTableComposable.familyForm
      })

      if (response.data.code === 2000) {
        ElMessage.success('更新成功')
        subTableComposable.familyList.value[subTableComposable.currentFamilyIndex.value] = {
          ...subTableComposable.familyForm
        }
      } else {
        ElMessage.error(response.data.message || '更新失败')
      }
    } else if (formComposable.dataForm.id) {
      // 新增模式，调用新增API
      const response = await axios({
        url: apiPaths.applicantFamilyInsert,
        method: 'POST',
        data: subTableComposable.familyForm
      })

      if (response.data.code === 2000) {
        ElMessage.success('新增成功')
        // 重新加载家庭情况列表
        await loadSubTableData(subTableComposable, formComposable.dataForm.id)
      } else {
        ElMessage.error(response.data.message || '新增失败')
      }
    } else {
      // 无应聘者ID，仅前端操作
      if (isEdit) {
        subTableComposable.familyList.value[subTableComposable.currentFamilyIndex.value] = {
          ...subTableComposable.familyForm
        }
      } else {
        subTableComposable.familyList.value.push({ ...subTableComposable.familyForm })
      }
      ElMessage.success(isEdit ? '更新成功' : '新增成功')
    }

    subTableComposable.familyDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('保存家庭情况失败:', error)
  }
}

// 家庭情况-重置表单
const resetFamilyForm = (subTableComposable) => {
  // 使用Object.assign重置整个表单对象
  Object.assign(subTableComposable.familyForm, {
    id: '',
    applicantId: '',
    name: '',
    relationship: '',
    age: null,
    workUnit: '',
    contactPhone: ''
  })
}

//************************** 44.学习经历子表 **************************

// 学习经历-新增
const handleAddEducation = (subTableComposable) => {
  subTableComposable.educationDialogTitle.value = '新增学习经历'
  subTableComposable.currentEducationIndex.value = -1
  resetEducationForm(subTableComposable)
  subTableComposable.educationDialogVisible.value = true
}

// 学习经历-编辑
const handleEditEducation = (row, index, subTableComposable) => {
  subTableComposable.educationDialogTitle.value = '编辑学习经历'
  subTableComposable.currentEducationIndex.value = index
  // 兼容后端返回 schoolNature 为 {key, value} 的情况，转为 key 以匹配 <el-select/>
  const cleanRow = {
    ...row,
    schoolNature: row.schoolNature && typeof row.schoolNature === 'object' && 'key' in row.schoolNature
      ? row.schoolNature.key
      : row.schoolNature,
  }
  Object.assign(subTableComposable.educationForm, cleanRow)
  subTableComposable.educationDialogVisible.value = true
}

// 学习经历-删除
const handleDeleteEducation = async (index, subTableComposable) => {
  try {
    const row = subTableComposable.educationList.value[index]
    if (row.id) {
      // 有ID，调用后端删除API
      await ElMessageBox.confirm(
        '确认删除该学习经历吗？此操作不可撤销！',
        '删除确认',
        {
          type: 'warning',
          confirmButtonText: '确认删除',
          cancelButtonText: '取消'
        }
      )

      const response = await axios({
        url: apiPaths.applicantEducationDelete,
        method: 'POST',
        data: { id: row.id }
      })

      if (response.data.code === 2000) {
        ElMessage.success('删除成功')
        subTableComposable.educationList.value.splice(index, 1)
      } else {
        ElMessage.error(response.data.message || '删除失败')
      }
    } else {
      // 无ID，仅前端删除
      subTableComposable.educationList.value.splice(index, 1)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除学习经历失败:', error)
    }
  }
}

// 学习经历-保存
const handleSaveEducation = async (subTableComposable, formComposable, educationFormRef) => {
  try {
    const valid = await educationFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请检查表单参数')
      return
    }

    // 额外的时间验证
    const dateValidation = validateDateRange(
      subTableComposable.educationForm.startDate,
      subTableComposable.educationForm.endDate,
      '时间'
    )
    if (dateValidation !== true) {
      ElMessage.error(dateValidation)
      return
    }

    subTableComposable.educationForm.applicantId = formComposable.dataForm.id
    const isEdit = subTableComposable.currentEducationIndex.value !== -1

    if (isEdit && subTableComposable.educationForm.id) {
      // 编辑模式，调用更新API
      const response = await axios({
        url: apiPaths.applicantEducationUpdate,
        method: 'POST',
        data: subTableComposable.educationForm
      })

      if (response.data.code === 2000) {
        ElMessage.success('更新成功')
        subTableComposable.educationList.value[subTableComposable.currentEducationIndex.value] = {
          ...subTableComposable.educationForm
        }
      } else {
        ElMessage.error(response.data.message || '更新失败')
      }
    } else if (formComposable.dataForm.id) {
      // 新增模式，调用新增API
      const response = await axios({
        url: apiPaths.applicantEducationInsert,
        method: 'POST',
        data: subTableComposable.educationForm
      })

      if (response.data.code === 2000) {
        ElMessage.success('新增成功')
        // 重新加载学习经历列表
        await loadSubTableData(subTableComposable, formComposable.dataForm.id)
      } else {
        ElMessage.error(response.data.message || '新增失败')
      }
    } else {
      // 无应聘者ID，仅前端操作
      if (isEdit) {
        subTableComposable.educationList.value[subTableComposable.currentEducationIndex.value] = {
          ...subTableComposable.educationForm
        }
      } else {
        subTableComposable.educationList.value.push({ ...subTableComposable.educationForm })
      }
      ElMessage.success(isEdit ? '更新成功' : '新增成功')
    }

    subTableComposable.educationDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('保存学习经历失败:', error)
  }
}

// 学习经历-重置表单
const resetEducationForm = (subTableComposable) => {
  // 使用Object.assign重置整个表单对象
  Object.assign(subTableComposable.educationForm, {
    id: '',
    applicantId: '',
    startDate: '',
    endDate: '',
    educationLevel: '',
    schoolName: '',
    major: '',
    schoolNature: ''
  })
}

//************************************************ 第3.5部分：文件处理 ****************************************************

//************************** 51.图片处理 **************************

// 照片上传事件处理
const handlePhotoUploadEvent = async (event, formComposable, fileComposable) => {
  // 从 FileList 中取第一个 File
  const file = event.target.files[0]
  if (!file) {
    return
  }

  // 调用校验单个文件
  if (!beforeUploadImageBase64(file)) {
    event.target.value = ''
    return
  }

  // 通过校验后再上传
  await uploadImageBase64(file, formComposable, fileComposable)
  event.target.value = ''
}

// 图片Base64校验
const beforeUploadImageBase64 = (file) => {
  const allowImageTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'
  ]

  console.log('上传文件MIME类型:', file.type)

  // MIME类型不存在时，根据文件扩展名推断简单图片类型
  let fileType = file.type
  if (!fileType && file.name) {
    const ext = file.name.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      fileType = `image/${ext}`
    }
  }

  const isValidType = allowImageTypes.includes(fileType)
  const isLt20M = file.size / 1024 / 1024 < 20

  if (!isValidType) {
    ElMessage.error('支持上传图片(JPG/PNG/GIF/BMP/WEBP/SVG)格式的文件!')
    return false
  }
  if (!isLt20M) {
    ElMessage.error('文件大小不能超过20MB!')
    return false
  }
  return true
}

// 图片Base64上传
const uploadImageBase64 = async (file, formComposable, fileComposable) => {
  if (!formComposable.dataForm.id) {
    // 如果没有ID，暂存图片文件，待保存后再上传
    fileComposable.pendingImageFile.value = file
    ElMessage.info('图片已选择，将在保存应聘者信息后自动上传')

    // 生成预览图片（不修改photoUrl，使用单独的预览字段）
    try {
      const base64Content = await fileComposable.fileToBase64(file)
      // 构造完整的DATA URL格式
      fileComposable.pendingImagePreview.value = `data:${file.type};base64,${base64Content}`
    } catch (error) {
      console.error('预览图片生成失败:', error)
    }
    return
  }

  try {
    const base64Content = await fileComposable.fileToBase64(file)

    // 生成自定义文件名: 姓名_电话_照片_时间戳
    const currentTime = dayjs().format('YYYYMMDD_HHmmss')
    const applicantName = formComposable.dataForm.applicantName || '未知'
    const contactPhone = formComposable.dataForm.contactPhone || '未知'
    const fileExtension = file.name.split('.').pop()
    const customFileName = `${applicantName}_${contactPhone}_照片_${currentTime}.${fileExtension}`

    const uploadData = {
      applicantId: formComposable.dataForm.id,
      fileName: customFileName,
      fileContent: base64Content,
      fileSize: file.size,
      mimeType: file.type,
      biz: apiPaths.imageBizUrl
    }

    // 将返回结果存到 response
    const response = await axios.post(apiPaths.imageUploadUrl, uploadData, {
      headers: apiPaths.sysHeaders
    })

    if (response.data.code === 2000) {
      // 后端返回的相对路径，如 "images/xxx.jpg"
      const relative = response.data.data
      // 直接拼接预览 URL
      formComposable.dataForm.photoUrl = apiPaths.imageViewUrl + relative
      // 清理预览数据（如果有的话）
      fileComposable.pendingImagePreview.value = ''
      ElMessage.success('照片上传成功')
    } else {
      ElMessage.error(response.data.message || '照片上传失败')
    }
  } catch (error) {
    console.error('照片上传失败:', error)
    ElMessage.error('照片上传失败，请重试')
  }
}

// 图片预览 (别名映射)
const handleImagePreview = (url, fileComposable) => {
  fileComposable.handlePhotoPreview(url)
}

// 延迟上传图片
const processPendingImageUpload = async (formComposable, fileComposable) => {
  const { dataForm } = formComposable
  const { pendingImageFile } = fileComposable

  if (!pendingImageFile.value || !dataForm.id) {
    return
  }

  try {
    ElMessage.info('正在上传图片...')

    const base64Content = await fileComposable.fileToBase64(pendingImageFile.value)

    // 生成自定义文件名
    const currentTime = dayjs().format('YYYYMMDD_HHmmss')
    const applicantName = dataForm.applicantName || '未知'
    const contactPhone = dataForm.contactPhone || '未知'
    const fileExtension = pendingImageFile.value.name.split('.').pop()
    const customFileName = `${applicantName}_${contactPhone}_照片_${currentTime}.${fileExtension}`

    const uploadData = {
      applicantId: dataForm.id,
      fileName: customFileName,
      fileContent: base64Content,
      fileSize: pendingImageFile.value.size,
      mimeType: pendingImageFile.value.type,
      biz: apiPaths.imageBizUrl
    }

    const response = await axios.post(apiPaths.imageUploadUrl, uploadData, {
      headers: apiPaths.sysHeaders
    })

    if (response.data.code === 2000) {
      const relative = response.data.data
      dataForm.photoUrl = apiPaths.imageViewUrl + relative
      ElMessage.success('照片上传成功')

      // 清空待上传的文件和预览
      pendingImageFile.value = null
      fileComposable.pendingImagePreview.value = ''
    } else {
      throw new Error(response.data.message || '照片上传失败')
    }
  } catch (error) {
    console.error('照片上传失败:', error)
    throw new Error('照片上传失败，请重试')
  }
}

//************************** 52.附件处理 **************************

// 打开附件页签（提供给父层通过插槽或 expose 使用）
const openAttachmentsTabHandler = (row, formComposable, fileComposable) => {
  try {
    formComposable.dataFormStatus.value = 'update'
    formComposable.dataFormTitle.value = '编辑应聘者'
    formComposable.dataFormVisible.value = true
    formComposable.activeTabName.value = 'basic'
    loadApplicantDetail(row.id, formComposable, fileComposable)
    if (fileComposable.pendingImageFile) {
      fileComposable.pendingImageFile.value = null
    }
    if (fileComposable.pendingImagePreview) {
      fileComposable.pendingImagePreview.value = ''
    }
    formComposable.activeTabName.value = 'attachments'
  } catch (e) {
    console.error('openAttachmentsTab error:', e)
  }
}

// 附件文件验证
const beforeUpload = (file) => {
  // 支持图片、Excel、Word、PDF等格式
  const allowTypes = [
    // 图片格式
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml',
    // PDF格式
    'application/pdf',
    // Excel格式 (新格式和旧格式)
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    // Word格式 (新格式和旧格式)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    // PowerPoint格式 (可选)
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
    // 文本格式
    'text/plain',
    // 压缩格式
    'application/zip',
    'application/x-rar-compressed'
  ]

  console.log('上传文件MIME类型:', file.type)

  // MIME类型不存在时，根据文件扩展名推断
  let fileType = file.type
  if (!fileType && file.name) {
    const ext = file.name.split('.').pop().toLowerCase()
    const typeMap = {
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
      'bmp': 'image/bmp', 'webp': 'image/webp', 'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel', 'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint', 'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain', 'zip': 'application/zip', 'rar': 'application/x-rar-compressed'
    }
    fileType = typeMap[ext] || ''
  }

  const isValidType = allowTypes.includes(fileType)
  const isLt20M = file.size / 1024 / 1024 < 20 // 20MB限制

  if (!isValidType) {
    ElMessage.error('支持上传图片(JPG/PNG/GIF/BMP/WEBP/SVG)、PDF、Excel(XLS/XLSX)、Word(DOC/DOCX)、PowerPoint(PPT/PPTX)、文本、压缩包格式的文件!')
    return false
  }
  if (!isLt20M) {
    ElMessage.error('文件大小不能超过20MB!')
    return false
  }
  return true
}

// 新增模式：延迟上传处理
const handleDelayedAttachmentUpload = async (file, type, fileComposable) => {
  try {
    // 检查是否已有同类型待上传文件
    if (fileComposable.pendingAttachments.value[type]) {
      const confirmed = await confirmReplaceFile(type, fileComposable)
      if (!confirmed) {
        return
      }
    }

    // 1. 暂存文件到队列
    fileComposable.pendingAttachments.value[type] = {
      file: file,
      type: type,
      timestamp: Date.now()
    }

    // 2. 更新状态
    fileComposable.attachmentUploadStatus.value[type] = 'pending'

    // 3. 更新表格显示
    updateAttachmentTableForPending(type, file, fileComposable)

    ElMessage.success(`${getTypeLabel(type, fileComposable)}已选择，将在保存后自动上传`)
  } catch (error) {
    console.error('延迟上传处理失败:', error)
    ElMessage.error('文件处理失败')
  }
}

// 更新表格显示为待上传状态
const updateAttachmentTableForPending = (type, file, fileComposable) => {
  const row = fileComposable.attachmentTableData.value.find(r => r.bizKey === type)
  if (row) {
    row.isPending = true
    row.uploadStatus = 'pending'
    row.attachmentName = file.name
    row.hasAttachment = false // 标记为待上传状态，还未真正上传
  }
}

// 确认替换文件
const confirmReplaceFile = async (type, fileComposable) => {
  const typeLabel = getTypeLabel(type, fileComposable)
  try {
    await ElMessageBox.confirm(
      `已选择了${typeLabel}文件，是否替换？`,
      '确认替换',
      {
        type: 'warning',
        confirmButtonText: '替换',
        cancelButtonText: '取消'
      }
    )
    return true
  } catch {
    return false
  }
}

// 批量下载附件
const downloadBatchAttachments = async (formComposable, applicantData = null) => {
  console.log('🔽 onbApplicant downloadBatchAttachments 开始执行')
  console.log('📥 接收到的参数 formComposable:', formComposable)
  console.log('📥 接收到的参数 applicantData:', applicantData)
  console.log('📥 formComposable.dataForm.id:', formComposable?.dataForm?.id)

  // 优先使用传入的applicantData，否则使用formComposable中的数据
  const applicantId = applicantData?.id || formComposable.dataForm.id
  console.log('📍 确定的 applicantId:', applicantId)

  if (!applicantId) {
    console.error('❌ 应聘者ID为空，无法下载')
    ElMessage.warning("请先选择应聘者")
    return
  }

  console.log('🚀 开始发送下载请求')
  console.log('📍 API路径:', apiPaths.attachmentDownloadBatchUrl)
  console.log('📍 请求参数:', { applicantId: applicantId })

  try {
    const response = await axios({
      url: apiPaths.attachmentDownloadBatchUrl,
      method: "POST",
      data: { applicantId: applicantId },
      responseType: "blob",
    })

    console.log('📦 下载响应收到:', response)
    console.log('📦 响应数据大小:', response.data?.size)
    console.log('📦 响应状态:', response.status)
    console.log('📦 响应头:', response.headers)

    if (response.data && response.data.size > 0) {
      console.log('✅ 下载数据有效，开始创建下载链接')
      const blob = new Blob([response.data], { type: "application/zip" })
      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      const currentTime = dayjs().format("YYYYMMDD_HHmmss")
      const applicantName = applicantData?.applicantName || formComposable.dataForm.applicantName || "未知"
      const contactPhone = applicantData?.contactPhone || formComposable.dataForm.contactPhone || "未知"
      const fileName = `${applicantName}_${contactPhone}_${currentTime}_附件打包.zip`
      link.download = fileName
      console.log('📁 下载文件名:', fileName)
      console.log('🔗 下载链接创建完成，开始触发下载')
      link.click()
      window.URL.revokeObjectURL(link.href)
      console.log('✅ 下载触发成功')
      ElMessage.success("附件打包下载成功")
    } else {
      console.warn('⚠️ 下载数据为空或无效')
      ElMessage.warning("该应聘者暂无附件可下载")
    }
  } catch (error) {
    console.error("❌ 打包下载失败，详细错误:", error)
    console.error("❌ 错误状态:", error.response?.status)
    console.error("❌ 错误信息:", error.response?.data)
    console.error("❌ 错误堆栈:", error.stack)
    ElMessage.error("打包下载失败，请重试")
  }
}

// 附件上传：Base64版本（编辑模式即时上传）
const uploadAttachmentBase64 = async (file, type, formComposable, fileComposable) => {
  if (!formComposable.dataForm.id) {
    ElMessage.error('请先保存应聘者信息')
    return
  }

  try {
    // 先检查是否已有同类型的附件，如果有则先删除
    const existingRow = fileComposable.attachmentTableData.value.find(r => r.bizKey === type)
    if (existingRow && existingRow.attachmentId) {
      try {
        await deleteAttachmentRecord(existingRow.attachmentId, fileComposable)
        ElMessage.info('已删除旧附件，正在上传新附件...')
      } catch (deleteError) {
        ElMessage.error('删除旧附件失败，无法上传新附件')
        return
      }
    }

    // 将文件转为Base64
    const base64Content = await fileComposable.fileToBase64(file)

    // 生成自定义文件名: 姓名_电话_附件类型_时间戳
    const currentTime = dayjs().format('YYYYMMDD_HHmmss')
    const applicantName = formComposable.dataForm.applicantName || '未知'
    const contactPhone = formComposable.dataForm.contactPhone || '未知'
    const attachmentTypeName = fileComposable.attachmentTypeMap[type]?.name || '未知'
    const fileExtension = file.name.split('.').pop()
    const customFileName = `${applicantName}_${contactPhone}_${attachmentTypeName}_${currentTime}.${fileExtension}`

    const uploadData = {
      applicantId: formComposable.dataForm.id,
      attachmentType: fileComposable.attachmentTypeMap[type]?.code || 1,
      fileName: customFileName,
      fileContent: base64Content,
      fileSize: file.size,
      mimeType: file.type,
      biz: apiPaths.attachmentBizUrl
    }

    const response = await axios.post(apiPaths.attachmentUploadUrl, uploadData)

    if (response.data.code === 2000) {
      const attachment = response.data.data
      ElMessage.success(`${attachmentTypeName}上传成功`)

      // 更新附件表格数据
      const newItem = {
        bizKey: type,
        attachmentType: attachment.attachmentType,
        attachmentTypeName: attachmentTypeName,
        attachmentName: attachment.attachmentName,
        attachmentUrl: attachment.attachmentUrl,
        attachmentId: attachment.id,
        fileSize: attachment.fileSize,
        hasAttachment: true,
        isPending: false,
        uploadStatus: 'success',
        createTime: attachment.createTime
      }

      const existingIndex = fileComposable.attachmentTableData.value.findIndex(item => item.bizKey === type)
      if (existingIndex >= 0) {
        fileComposable.attachmentTableData.value[existingIndex] = newItem
      } else {
        fileComposable.attachmentTableData.value.push(newItem)
      }

      // 更新文件数组
      const fileItem = {
        name: attachment.attachmentName,
        url: apiPaths.attachmentViewUrl + attachment.id,
        attachmentId: attachment.id,
        path: attachment.attachmentUrl
      }
      updateFileArray(type, [fileItem], fileComposable)

    } else {
      ElMessage.error(response.data.message || '附件上传失败')
    }
  } catch (error) {
    console.error('附件上传失败:', error)
    ElMessage.error('附件上传失败，请重试')
  }
}

// 附件上传处理
const handleCustomUpload = async (event, type, formComposable, fileComposable) => {
  const file = event.target.files[0]
  if (!file) {
    return
  }

  // 文件验证
  if (!beforeUpload(file)) {
    event.target.value = '' // 清空input
    return
  }

  // 判断模式：新增 vs 编辑
  if (!formComposable.dataForm.id) {
    // 新增模式：延迟上传
    await handleDelayedAttachmentUpload(file, type, fileComposable)
  } else {
    // 编辑模式：即时上传
    await uploadAttachmentBase64(file, type, formComposable, fileComposable)
  }

  event.target.value = '' // 清空input
}

// 下载单个附件
const downloadSingleAttachment = async (attachmentId, fileName) => {
  if (!attachmentId) {
    ElMessage.error('附件ID不能为空')
    return
  }

  try {
    // 使用view接口下载文件，通过创建下载链接的方式
    const downloadUrl = apiPaths.attachmentViewUrl + attachmentId
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName || '附件文件'
    link.target = '_blank'

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载文件失败:', error)
    ElMessage.error('下载文件失败，请重试')
  }
}

// 附件删除
const deleteAttachmentRecord = async (attachmentId, fileComposable) => {
  try {
    // 先找到要删除的附件信息
    const row = fileComposable.attachmentTableData.value.find(r => r.attachmentId === attachmentId)
    if (!row) {
      ElMessage.error('未找到要删除的附件')
      return
    }

    const resp = await axios.post(apiPaths.attachmentDeleteUrl, { id: attachmentId })
    if (resp.data && resp.data.code === 2000) {
      ElMessage.success('删除成功')

      // 更新当前行的状态
      row.attachmentId = null
      row.attachmentName = ''
      row.attachmentUrl = ''
      row.hasAttachment = false
      row.isPending = false
      row.uploadStatus = 'none'

      // 同时更新对应的文件数组
      updateFileArray(row.bizKey, [], fileComposable)

      // 不需要重新加载整个列表，只更新当前状态即可
    } else {
      ElMessage.error(resp.data.message || '删除失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('删除失败')
  }
}

// 处理所有待上传附件
const processPendingAttachments = async (formComposable, fileComposable) => {
  const pendingCount = getPendingAttachmentsCount(fileComposable)
  if (pendingCount === 0) {
    return
  }

  ElMessage.info(`正在上传 ${pendingCount} 个附件...`)

  for (const [type, fileInfo] of Object.entries(fileComposable.pendingAttachments.value)) {
    if (fileInfo) {
      try {
        await uploadPendingAttachment(type, fileInfo, formComposable, fileComposable)
      } catch (error) {
        console.error(`上传 ${type} 附件失败:`, error)
        fileComposable.attachmentUploadStatus.value[type] = 'error'
      }
    }
  }
}

// 上传单个待上传附件
const uploadPendingAttachment = async (type, fileInfo, formComposable, fileComposable) => {
  const { dataForm } = formComposable

  fileComposable.attachmentUploadStatus.value[type] = 'uploading'

  try {
    const base64Content = await fileComposable.fileToBase64(fileInfo.file)

    // 生成自定义文件名
    const currentTime = dayjs().format('YYYYMMDD_HHmmss')
    const applicantName = dataForm.applicantName || '未知'
    const contactPhone = dataForm.contactPhone || '未知'
    const attachmentTypeName = fileComposable.attachmentTypeMap[type]?.name || '未知'
    const fileExtension = fileInfo.file.name.split('.').pop()
    const customFileName = `${applicantName}_${contactPhone}_${attachmentTypeName}_${currentTime}.${fileExtension}`

    const uploadData = {
      applicantId: dataForm.id,
      attachmentType: fileComposable.attachmentTypeMap[type]?.code || 1,
      fileName: customFileName,
      fileContent: base64Content,
      fileSize: fileInfo.file.size,
      mimeType: fileInfo.file.type,
      biz: apiPaths.attachmentBizUrl
    }

    const response = await axios.post(apiPaths.attachmentUploadUrl, uploadData)

    if (response.data.code === 2000) {
      const attachment = response.data.data

      // 更新状态为成功
      fileComposable.attachmentUploadStatus.value[type] = 'success'

      // 更新文件数组
      const fileItem = {
        name: attachment.attachmentName,
        url: apiPaths.attachmentViewUrl + attachment.id,
        attachmentId: attachment.id,
        path: attachment.attachmentUrl
      }
      updateFileArray(type, [fileItem], fileComposable)

      // 清除待上传文件
      fileComposable.pendingAttachments.value[type] = null

      ElMessage.success(`${getTypeLabel(type, fileComposable)}上传成功`)
    } else {
      throw new Error(response.data.message || '上传失败')
    }
  } catch (error) {
    fileComposable.attachmentUploadStatus.value[type] = 'error'
    throw error
  }
}

// 获取待上传文件数量
const getPendingAttachmentsCount = (fileComposable) => {
  return Object.values(fileComposable.pendingAttachments.value)
    .filter(item => item !== null).length
}

// 获取类型标签
const getTypeLabel = (type, fileComposable) => {
  return fileComposable.attachmentTypeMap[type]?.name || '附件'
}

// 更新文件数组
const updateFileArray = (type) => {
  // 注意：在实际使用中，这些数组应该是响应式的
  // 这里需要根据具体的文件管理实现来调整
  switch (type) {
    case 'idCard':
      // 具体实现需要根据fileComposable的结构来调整
      break
    case 'degree':
      break
    case 'graduation':
      break
    case 'eduReg':
      break
    case 'gradVerify':
      break
  }
}

//************************************************ 第3.6部分：辅助方法 ****************************************************

//************************** 61.标签颜色映射方法 **************************

// 枚举：政治面貌标签颜色
const getPoliticalStatusTagType = (key) => {
  const typeMap = { 1: "danger", 2: "primary", 3: "info" }
  return typeMap[key] || "info"
}

// 枚举：外语水平标签颜色
const getForeignLanguageTagType = (key) => {
  const typeMap = { 1: "info", 2: "success", 3: "primary", 4: "warning", 5: "danger", 6: "danger", 7: "danger" }
  return typeMap[key] || "info"
}

//************************** 62.地区处理方法 **************************

// 地区级联选择器过滤方法
const filterRegionMethod = (node, keyword) => {
  if (keyword) {
    return node.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1
  }
  return true
}

// 处理地区选择变化
const handleRegionChange = (value, type) => {
  console.log(`${type} region changed:`, value)
  // 这里可以添加额外的处理逻辑
}

//************************** 63.标签页处理方法 **************************

// 处理标签页切换
const handleTabClick = (pane, formComposable, fileComposable) => {
  if (!pane || !pane.props || !pane.props.name) {
    console.warn('标签页信息不完整')
    return
  }

  console.log('标签页切换到:', pane.props.name)

  // 根据标签页名称执行特定逻辑
  if (pane.props.name === 'attachments') {
    // 只有在有应聘者ID时才加载附件
    if (formComposable.dataForm.id) {
      nextTick(() => {
        try {
          loadApplicantAttachments(formComposable.dataForm.id, fileComposable)
        } catch (error) {
          console.error('加载附件时出错:', error)
        }
      })
    }
  }

  // 可以在这里添加其他标签页的特定逻辑
}

//************************** 64.附件状态处理方法 **************************

// 获取附件状态显示文本
const getAttachmentStatusText = (type, fileComposable, formComposable) => {
  const status = fileComposable.attachmentUploadStatus.value[type]

  // 编辑模式下，如果有附件且状态为none，显示为已上传
  if (formComposable.dataForm.id && status === 'none') {
    const row = fileComposable.attachmentTableData.value.find(r => r.bizKey === type)
    if (row && row.hasAttachment) {
      return '已上传'
    } else {
      return '未上传'
    }
  }

  const statusMap = {
    'none': '未上传',
    'pending': '待上传',
    'uploading': '上传中...',
    'success': '已上传',
    'error': '上传失败'
  }
  return statusMap[status] || '未上传'
}

// 获取附件状态样式类
const getAttachmentStatusClass = (type, fileComposable, formComposable) => {
  const status = fileComposable.attachmentUploadStatus.value[type]

  // 编辑模式下，如果有附件且状态为none，显示为成功样式，否则显示未上传样式
  if (formComposable.dataForm.id && status === 'none') {
    const row = fileComposable.attachmentTableData.value.find(r => r.bizKey === type)
    if (row && row.hasAttachment) {
      return { 'status-success': true }
    } else {
      return { 'status-not-uploaded': true }
    }
  }

  return {
    'status-not-uploaded': status === 'none',
    'status-pending': status === 'pending',
    'status-uploading': status === 'uploading',
    'status-success': status === 'success',
    'status-error': status === 'error'
  }
}

//************************** 65.常见方法 **************************

// 验证日期范围
const validateDateRange = (startDate, endDate, fieldName = '时间') => {
  if (!startDate || !endDate) {
    return true // 如果其中一个为空，跳过验证
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) {
    return `开始${fieldName}不能大于结束${fieldName}`
  }

  return true
}

// 格式化日期
const formatDate = (date) => {
  if (!date) {
    return '-'
  }
  return dayjs(date).format('YYYY-MM-DD')
}

// 构建地区数组
const buildRegionArray = (addressObj) => {
  const regions = []
  if (addressObj.province) {
    regions.push(addressObj.province)
  }
  if (addressObj.city) {
    regions.push(addressObj.city)
  }
  if (addressObj.district) {
    regions.push(addressObj.district)
  }
  return regions
}
