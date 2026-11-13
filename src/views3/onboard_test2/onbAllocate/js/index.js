import { reactive, ref, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import axios from 'axios';
import dayjs from 'dayjs';
import regionsData from './regions.json';

export default {
  name: 'OnbAllocate',

  components: {
    ArrowDown
  },

  setup() {
    // 加载
    const loading = ref(false)
    const dataFormLoading = ref(false)

    // 筛选-表单
    const searchFormRef = ref('')
    const searchFormRules = reactive({})

    // 筛选-表格
    const dataTableRef = ref('')
    const selectionRows = ref([])
    const currentRow = {}

    // 筛选-表格-分页
    const dataTableHeight = ref(window.innerHeight - 176)
    const pageSizes = ref([10, 15, 25, 35, 50, 100])
    const pageSize = ref(10)
    const currentPage = ref(1)
    const dataTotal = ref(0)

    // 筛选-表格-弹框表单
    const dataFormRef = ref('')
    const dataFormTitle = ref('详情')
    const dataFormVisible = ref(false)
    const dataFormStatus = ref('')

    // 标签页
    const activeTabName = ref('basic')

    // 分配弹框
    const operationDialogVisible = ref(false)
    const assignFormRef = ref('')
    const currentOperationRow = ref({})

    // 回收站弹框
    const recycleBinDialogVisible = ref(false)
    const recycleSearchFormRef = ref('')
    const recycleLoading = ref(false)
    // 添加弹框关闭处理方法
    const handleDialogClose = (done) => {
      // 确保弹框正确关闭并重置状态
      resetDialogStates();
      done();
    };
    // 声明 resetDialogStates 变量
    const resetDialogStates = () => {
      // 重置状态的逻辑
    };

    // 子表弹框
    const workExperienceDialogVisible = ref(false)
    const workExperienceDialogTitle = ref('新增工作经历')
    const workExperienceFormRef = ref('')
    const currentWorkExperienceIndex = ref(-1)

    const trainingDialogVisible = ref(false)
    const trainingDialogTitle = ref('新增培训经历')
    const trainingFormRef = ref('')
    const currentTrainingIndex = ref(-1)

    const familyDialogVisible = ref(false)
    const familyDialogTitle = ref('新增家庭情况')
    const familyFormRef = ref('')
    const currentFamilyIndex = ref(-1)

    const educationDialogVisible = ref(false)
    const educationDialogTitle = ref('新增学习经历')
    const educationFormRef = ref('')
    const currentEducationIndex = ref(-1)

    return {
      // 加载
      loading,
      dataFormLoading,

      // 筛选-表单
      searchFormRules,
      searchFormRef,

      // 筛选-表格
      dataTableRef,
      selectionRows,
      currentRow,

      // 筛选-表格-分页
      dataTableHeight,
      pageSizes,
      pageSize,
      currentPage,
      dataTotal,

      // 筛选-表格-弹框表单
      dataFormRef,
      dataFormTitle,
      dataFormVisible,
      dataFormStatus,

      // 标签页
      activeTabName,

      // 分配弹框
      operationDialogVisible,
      assignFormRef,
      currentOperationRow,

      // 回收站弹框
      recycleBinDialogVisible,
      recycleSearchFormRef,
      recycleLoading,
      handleDialogClose,

      // 子表弹框
      workExperienceDialogVisible,
      workExperienceDialogTitle,
      workExperienceFormRef,
      currentWorkExperienceIndex,

      trainingDialogVisible,
      trainingDialogTitle,
      trainingFormRef,
      currentTrainingIndex,

      familyDialogVisible,
      familyDialogTitle,
      familyFormRef,
      currentFamilyIndex,

      educationDialogVisible,
      educationDialogTitle,
      educationFormRef,
      currentEducationIndex,
    };
  },

  data() {
    return {

      //************************************************** 第1部分：路径 **************************************************

      // 请求路径：枚举
      sysAttrList: '/dev-api/onboard/attr/list', // GET请求
      // 请求路径：主表
      applicantList: '/dev-api/onboard/applicant/person/list', // POST请求
      applicantDetail: '/dev-api/onboard/applicant/person/detail', // POST请求
      applicantInsert: '/dev-api/onboard/applicant/person/insert', // POST请求
      applicantUpdate: '/dev-api/onboard/applicant/person/update', // POST请求
      applicantDelete: '/dev-api/onboard/applicant/person/delete', // POST请求
      applicantExport: '/dev-api/onboard/applicant/person/export', // POST请求
      // 请求路径：子表
      applicantWorkList: '/dev-api/onboard/applicant/work/list', // POST请求
      applicantWorkInsert: '/dev-api/onboard/applicant/work/insert', // POST请求
      applicantWorkUpdate: '/dev-api/onboard/applicant/work/update', // POST请求
      applicantWorkDelete: '/dev-api/onboard/applicant/work/delete', // POST请求
      applicantEducationList: '/dev-api/onboard/applicant/education/list', // POST请求
      applicantEducationInsert: '/dev-api/onboard/applicant/education/insert', // POST请求
      applicantEducationUpdate: '/dev-api/onboard/applicant/education/update', // POST请求
      applicantEducationDelete: '/dev-api/onboard/applicant/education/delete', // POST请求
      applicantFamilyList: '/dev-api/onboard/applicant/family/list', // POST请求
      applicantFamilyInsert: '/dev-api/onboard/applicant/family/insert', // POST请求
      applicantFamilyUpdate: '/dev-api/onboard/applicant/family/update', // POST请求
      applicantFamilyDelete: '/dev-api/onboard/applicant/family/delete', // POST请求
      applicantTrainingList: '/dev-api/onboard/applicant/training/list', // POST请求
      applicantTrainingInsert: '/dev-api/onboard/applicant/training/insert', // POST请求
      applicantTrainingUpdate: '/dev-api/onboard/applicant/training/update', // POST请求
      applicantTrainingDelete: '/dev-api/onboard/applicant/training/delete', // POST请求
      // 请求路径：图片
      sysHeaders: { 'X-Access-Token': '' }, // 上传头
      imageBizUrl: 'photo', // 存放子文件夹，Biz代表业务，比如照片、附件等
      imageBaseUrl: '/opt/upload/onboard', // 存放根文件夹，前端仅仅声明不使用，由后端application.yml中的配置文件指定
      imageViewUrl: '/dev-api/onboard/applicant/image/view/', // GET请求
      imageUploadUrl: '/dev-api/onboard/applicant/image/upload', // POST请求
      // 请求路径：附件
      attachmentBizUrl: 'attachment', // 存放子文件夹，Biz代表业务，比如照片、附件等
      attachmentBaseUrl: '/opt/upload/onboard', // 存放根文件夹，前端仅仅声明不使用，由后端application.yml中的配置文件指定
      attachmentViewUrl: '/dev-api/onboard/applicant/attachment/view/', // GET请求 - 用于查看/下载单个附件
      attachmentListUrl: '/dev-api/onboard/applicant/attachment/list', // POST请求
      attachmentUploadUrl: '/dev-api/onboard/applicant/attachment/upload', // POST请求
      attachmentDeleteUrl: '/dev-api/onboard/applicant/attachment/delete', // POST请求
      attachmentDownloadBatchUrl: '/dev-api/onboard/applicant/attachment/downloadBatch', // POST请求
      // 请求路径：分配
      allocateDetail: '/dev-api/onboard/allocate/detail', // POST请求
      allocateUpdate: '/dev-api/onboard/allocate/update', // POST请求
      allocateAudit: '/dev-api/onboard/allocate/audit', // POST请求
      allocateWithdrawAudit: '/dev-api/onboard/allocate/withdraw-audit', // POST请求

      //************************************************** 第1部分：属性 **************************************************

      // 通用-属性
      attrCnts: {
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
        allocateStatusOptions: [],
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
      },

      //************************************************** 第2部分：主表 **************************************************

      // 筛选框展开/收起状态
      searchExpanded: false,
      // 主表查询
      searchForm: {
        applicantName: '',     // 姓名
        gender: null,          // 性别
        birthDate: '',         // 出生年月
        contactPhone: '',      // 联系电话
        idCardNo: '',          // 身份证号
        politicalStatus: null, // 政治面貌
        foreignLanguageLevel: null, // 外语等级
        applyPosition: '',     // 应聘岗位
        auditStatus: null,     // 审核状态
        assignedUser: '',      // 分配人
        availableDateRange: [],     // 可报到日期范围 [开始日期, 结束日期]
        assignedDateRange: [],      // 分配日期范围 [开始日期, 结束日期]
        interviewerDateRange: [],   // 面试日期范围 [开始日期, 结束日期]
        offerDateRange: []          // 录用日期范围 [开始日期, 结束日期]
      },
      // 主表数据
      dataList: [],
      // 主表表单
      dataForm: {
        // 基本信息
        id: '',                // 主键ID
        applicantName: '',     // 姓名
        applyPosition: '',     // 应聘岗位
        photoUrl: '',          // 照片URL
        gender: 1,             // 性别 - 默认：男(1)
        birthDate: '',         // 出生年月
        nation: 1,             // 民族 - 默认：汉族
        politicalStatus: 3,    // 政治面貌 - 默认：群众(3)
        maritalStatus: 2,      // 婚姻状况 - 默认：未婚(2)
        height: null,          // 身高
        weight: null,          // 体重
        visionLeft: '',        // 左眼视力
        visionRight: '',       // 右眼视力
        bloodType: 1,          // 血型 - 默认：A型(1)
        professionalTitle: '', // 职称
        foreignLanguageLevel: 1, // 外语等级 - 默认：一般(1)
        foreignLanguageScore: null, // 外语分数
        contactPhone: '',      // 联系电话
        idCardNo: '',          // 身份证号
        availableDate: '',     // 可报到日期
        isVeteran: 0,          // 是否为退伍军人 - 默认：否(0)
        dischargeDate: '',     // 退伍日期
        dischargeCertNo: '',   // 退役证编号
        // 地址JSON格式存储
        homeAddress: {
          region: [],           // 省市县三级联动 [省, 市, 县]
          street: '',           // 乡(街道)
          village: '',          // 村(路)
          number: ''            // 号
        },
        householdRegister: {
          region: [],           // 省市县三级联动 [省, 市, 县]
          street: '',           // 乡(街道)
          police: ''            // 派出所
        },
        nativePlace: {
          region: []            // 省市县三级联动 [省, 市, 县]
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
        otherHistory: '',               // 其他史
        noHistoryStatement: '',         // 无病史声明
        // 备注
        applicationChannels: [],   // 应聘途径
        agreeShiftWork: 0,         // 是否同意轮班工作 - 默认：否(0)
        needAccommodation: 0,      // 是否需要住宿 - 默认：否(0)
        // 申明
        signature: '',             // 本人签字
        fillDate: '',              // 填表时间
      },
      // 主表验证
      dataFormRules: {
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
      },
      // 地区数据
      regionsData: regionsData,
      // 级联选择器配置
      cascaderProps: {
        value: 'name',
        label: 'name',
        children: 'children',
        checkStrictly: false,                  // 必须选择到最后一级
        emitPath: true                         // 返回完整路径数组
      },

      //************************************************** 第2部分：回收站 ***********************************************

      // 回收站查询表单
      recycleSearchForm: {
        applicantName: '',     // 姓名
        contactPhone: '',      // 联系电话
        idCardNo: '',          // 身份证号
      },
      // 回收站数据
      recycleDataList: [],
      // 回收站分页
      recyclePageSizes: [5, 10, 15],
      // 回收站分页大小
      recyclePageSize: 5,
      // 回收站分页当前页
      recycleCurrentPage: 1,
      // 回收站数据总数
      recycleDataTotal: 0,

      //************************************************** 第3部分：子表，工作经历 ******************************************

      // 子表数据：工作经历
      workExperienceList: [],
      // 子表表单：工作经历
      workExperienceForm: {
        id: '',                // 主键ID
        applicantId: '',       // 应聘者ID
        startDate: '',         // 开始时间
        endDate: '',           // 结束时间
        companyName: '',       // 工作单位全称
        position: '',          // 职务
        businessScope: '',     // 负责业务范围
        referencePerson: '',   // 证明人
        referenceContact: ''   // 证明人的联系方式
      },
      // 子表验证：工作经历
      workExperienceFormRules: {
        companyName: [
          { required: true, message: '请输入工作单位全称', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ]
      },

      //************************************************** 第3部分：子表，培训经历 ******************************************

      // 子表数据：培训经历
      trainingList: [],
      // 子表表单：培训经历
      trainingForm: {
        id: '',                // 主键ID
        applicantId: '',       // 应聘者ID
        startDate: '',         // 开始时间
        endDate: '',           // 结束时间
        trainingName: '',      // 培训名称
        qualification: ''      // 获得何资格/技能等级
      },
      // 子表验证：培训经历
      trainingFormRules: {
        trainingName: [
          { required: true, message: '请输入培训名称', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ]
      },

      //************************************************** 第3部分：子表，家庭情况 ******************************************

      // 子表数据：家庭情况
      familyList: [],
      // 子表表单：家庭情况
      familyForm: {
        id: '',                // 主键ID
        applicantId: '',       // 应聘者ID
        name: '',              // 姓名
        relationship: '',      // 与本人关系
        age: null,             // 年龄
        workUnit: '',          // 工作单位
        contactPhone: ''       // 联系电话
      },
      // 子表验证：家庭情况
      familyFormRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        relationship: [
          { required: true, message: '请输入与本人关系', trigger: 'blur' }
        ]
      },

      //************************************************** 第3部分：子表，学习经历 ******************************************

      // 子表数据：学习经历
      educationList: [],
      // 子表表单：学习经历
      educationForm: {
        id: '',                // 主键ID
        applicantId: '',       // 应聘者ID
        startDate: '',         // 开始时间
        endDate: '',           // 结束时间
        educationLevel: '',    // 学历
        schoolName: '',        // 学校名称
        major: '',             // 专业
        schoolNature: ''       // 学历类型
      },
      // 子表验证：学习经历
      educationFormRules: {
        educationLevel: [
          { required: true, message: '请选择学历', trigger: 'change' }
        ],
        schoolName: [
          { required: true, message: '请输入学校名称', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ]
      },

      //************************************************** 第4部分：图片数据 ***********************************************

      // 图片预览
      dialogImageUrl: '',                      // 预览图片URL
      dialogVisible: false,                    // 预览弹框显示状态
      pendingImageFile: null,                  // 待上传的图片文件（延迟上传策略）
      pendingImagePreview: '',                 // 待上传图片的预览BASE64

      //************************************************** 第4部分：附件数据 ***********************************************

      // 附件表格数据源
      attachmentTableData: [
        { bizKey: 'idCard', typeLabel: '身份证', inputRef: 'idCardInput', attachmentId: null, downloadName: '身份证', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' },
        { bizKey: 'degree', typeLabel: '学位证', inputRef: 'degreeInput', attachmentId: null, downloadName: '学位证', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' },
        { bizKey: 'graduation', typeLabel: '毕业证', inputRef: 'graduationInput', attachmentId: null, downloadName: '毕业证', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' },
        { bizKey: 'eduReg', typeLabel: '学历证书备案表', inputRef: 'eduRegInput', attachmentId: null, downloadName: '学历证书备案表', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' },
        { bizKey: 'gradVerify', typeLabel: '毕业证在线验证报告', inputRef: 'gradVerifyInput', attachmentId: null, downloadName: '毕业证在线验证报告', hasAttachment: false, attachmentName: '', attachmentUrl: '', isPending: false, uploadStatus: 'none' }
      ],
      // 附件数据
      idCardFiles: [],                         // 身份证文件
      degreeCertFiles: [],                     // 学位证书文件
      graduationCertFiles: [],                 // 毕业证书文件
      educationRegFiles: [],                   // 教育注册文件
      graduationVerifyFiles: [],               // 毕业证明文件

      // ============ 附件延迟上传相关数据 ============

      // 延迟上传队列：存储待上传的附件文件
      pendingAttachments: {
        idCard: null,        // { file: File, type: string, timestamp: number }
        degree: null,
        graduation: null,
        eduReg: null,
        gradVerify: null
      },

      // 附件上传状态
      attachmentUploadStatus: {
        idCard: 'none',      // none | pending | uploading | success | error
        degree: 'none',
        graduation: 'none',
        eduReg: 'none',
        gradVerify: 'none'
      },

      // 附件类型映射
      attachmentTypeMap: {
        'idCard': { code: 1, name: '身份证' },
        'degree': { code: 2, name: '学位证' },
        'graduation': { code: 3, name: '毕业证' },
        'eduReg': { code: 4, name: '学历证书备案表' },
        'gradVerify': { code: 5, name: '毕业证在线验证报告' }
      },

      //************************************************** 第5部分：分配操作 ***********************************************

      // 分配表单
      operationForm: {
        applicantId: '',        // 应聘者ID
        applyPosition: '',      // 应聘岗位
        assignedDept: '',       // 分配部门
        assignedUser: '',       // 分配人
        assignedDate: '',       // 分配日期
        assignedReason: ''      // 分配说明
      },
      // 分配表单验证
      assignFormRules: {
        assignedUser: [
          { required: true, message: '请输入分配人', trigger: 'blur' },
          { min: 2, max: 20, message: '分配人长度在2-20个字符', trigger: 'blur' }
        ],
        assignedDept: [
          { required: true, message: '请输入分配部门', trigger: 'blur' },
          { min: 2, max: 50, message: '分配部门长度在2-50个字符', trigger: 'blur' }
        ],
      },

    };
  },

  computed: {
    // 获取当前应该显示的图片URL
    currentPhotoUrl() {
      // 如果有待上传的预览图片，优先显示预览
      if (this.pendingImagePreview) {
        return this.pendingImagePreview;
      }
      // 否则显示正常的图片URL
      return this.dataForm.photoUrl;
    }
  },

  mounted() {
    // 拉取枚举
    this.fetchAttrList();
    // 查询数据
    this.query();
    // 监听窗口变化
    this.handleResize();
    // 初始化上传配置
    this.initUploadConfig();
    // 绑定表单验证器
    this.bindFormValidators();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {

    //************************************************ 第1部分：公共操作 *****************************************************

    // 拉取枚举
    async fetchAttrList() {
      try {
        const _this = this;
        const response = await axios.get(_this.sysAttrList);
        if (response.data.code === 2000) {
          this.attrCnts = { ...this.attrCnts, ...response.data.data };
        } else {
          ElMessage.error('获取字典数据失败: ' + response.data.message);
        }
      } catch (error) {
        console.error('获取字典数据失败:', error);
        ElMessage.error('网络请求失败，无法获取字典数据');
      }
    },

    //************************************************ 第2部分：主表 ********************************************************

    // 查询_表格
    async query() {
      const _this = this;
      _this.loading = true;

      let params = {
        // 页面类型参数（用于后端状态过滤）
        page: '1',
        deletedFlag: '0',
        // 文本输入框
        applicantName: _this.searchForm.applicantName || null,
        contactPhone: _this.searchForm.contactPhone || null,
        idCardNo: _this.searchForm.idCardNo || null,
        applyPosition: _this.searchForm.applyPosition || null,
        assignedUser: _this.searchForm.assignedUser || null,
        // 下拉选择器
        gender: _this.searchForm.gender,
        politicalStatus: _this.searchForm.politicalStatus,
        foreignLanguageLevel: _this.searchForm.foreignLanguageLevel,
        auditStatus: _this.searchForm.auditStatus,
        // 日期选择器
        birthDate: _this.searchForm.birthDate || null,
        // 日期范围参数
        availableStartDate: _this.searchForm.availableDateRange && _this.searchForm.availableDateRange[0] ? _this.searchForm.availableDateRange[0] : null,
        availableEndDate: _this.searchForm.availableDateRange && _this.searchForm.availableDateRange[1] ? _this.searchForm.availableDateRange[1] : null,
        assignedStartDate: _this.searchForm.assignedDateRange && _this.searchForm.assignedDateRange[0] ? _this.searchForm.assignedDateRange[0] : null,
        assignedEndDate: _this.searchForm.assignedDateRange && _this.searchForm.assignedDateRange[1] ? _this.searchForm.assignedDateRange[1] : null,
        interviewerStartDate: _this.searchForm.interviewerDateRange && _this.searchForm.interviewerDateRange[0] ? _this.searchForm.interviewerDateRange[0] : null,
        interviewerEndDate: _this.searchForm.interviewerDateRange && _this.searchForm.interviewerDateRange[1] ? _this.searchForm.interviewerDateRange[1] : null,
        offerStartDate: _this.searchForm.offerDateRange && _this.searchForm.offerDateRange[0] ? _this.searchForm.offerDateRange[0] : null,
        offerEndDate: _this.searchForm.offerDateRange && _this.searchForm.offerDateRange[1] ? _this.searchForm.offerDateRange[1] : null
      };

      try {
        const response = await axios({
          url: _this.applicantList,
          method: 'POST',
          data: params
        });

        if (response.data.code === 2000) {
          let dataList = response.data.data || [];
          // 处理头像URL，添加图片访问前缀
          dataList.forEach(item => {
            if (item.photoUrl && item.photoUrl.trim() !== '') {
              // 如果photoUrl不是以http开头，则添加图片访问前缀
              if (!item.photoUrl.startsWith('http')) {
                item.photoUrl = _this.imageViewUrl + item.photoUrl;
              }
            }
          });
          // 后端已经进行了状态过滤和排序，直接使用返回的数据
          _this.dataList = dataList;
          _this.dataTotal = dataList.length;
        } else {
          ElMessage.error(response.data.message || '获取数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败');
        console.error('查询失败:', error);
      }

      _this.loading = false;
    },

    // 按钮_查询
    async fun_search(formEl) {
      let _this = this;
      if (!formEl) {
        return;
      }

      await formEl.validate((valid) => {
        if (valid) {
          _this.query();
        } else {
          ElMessage.warning('请检查相关参数');
        }
      });
    },

    // 按钮_重置
    async fun_reset(formEl) {
      let _this = this;
      if (!formEl) {
        return;
      }

      formEl.resetFields();
      _this.searchForm = {
        applicantName: '',
        gender: null,
        birthDate: '',
        contactPhone: '',
        idCardNo: '',
        politicalStatus: null,
        foreignLanguageLevel: null,
        applyPosition: '',
        auditStatus: null,
        assignedUser: '',
        availableDateRange: [],
        assignedDateRange: [],
        interviewerDateRange: [],
        offerDateRange: []
      };
      _this.query();
    },

    // 导出数据
    async fun_export() {
      try {
        this.loading = true;

        // 准备查询参数（与查询功能保持一致）
        const params = {
          page: '1', // 页面类型参数
          deletedFlag: '0',
          applicantName: this.searchForm.applicantName,
          gender: this.searchForm.gender,
          birthDate: this.searchForm.birthDate,
          contactPhone: this.searchForm.contactPhone,
          idCardNo: this.searchForm.idCardNo,
          politicalStatus: this.searchForm.politicalStatus,
          foreignLanguageLevel: this.searchForm.foreignLanguageLevel,
          applyPosition: this.searchForm.applyPosition,
          auditStatus: this.searchForm.auditStatus,
          assignedUser: this.searchForm.assignedUser,
          // 日期范围处理
          availableStartDate: this.searchForm.availableDateRange && this.searchForm.availableDateRange[0] ? this.searchForm.availableDateRange[0] : null,
          availableEndDate: this.searchForm.availableDateRange && this.searchForm.availableDateRange[1] ? this.searchForm.availableDateRange[1] : null,
          assignedStartDate: this.searchForm.assignedDateRange && this.searchForm.assignedDateRange[0] ? this.searchForm.assignedDateRange[0] : null,
          assignedEndDate: this.searchForm.assignedDateRange && this.searchForm.assignedDateRange[1] ? this.searchForm.assignedDateRange[1] : null,
          interviewerStartDate: this.searchForm.interviewerDateRange && this.searchForm.interviewerDateRange[0] ? this.searchForm.interviewerDateRange[0] : null,
          interviewerEndDate: this.searchForm.interviewerDateRange && this.searchForm.interviewerDateRange[1] ? this.searchForm.interviewerDateRange[1] : null,
          offerStartDate: this.searchForm.offerDateRange && this.searchForm.offerDateRange[0] ? this.searchForm.offerDateRange[0] : null,
          offerEndDate: this.searchForm.offerDateRange && this.searchForm.offerDateRange[1] ? this.searchForm.offerDateRange[1] : null
        };

        let _this = this;
        _this.loading = true;
        await axios({
          url: _this.applicantExport,
          method: 'POST',
          data: params,
          responseType: 'blob'
        }).then(res => {
          if (res.data) {
            const blob = new Blob([res.data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = decodeURIComponent(res.headers['file-name']);
            link.click();
            window.URL.revokeObjectURL(link.href);
          } else {
            ElMessage.error('导出失败');
          }
          _this.loading = false;
        });
      } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error('导出失败');
        this.loading = false;
      }
    },

    // 表格_多选
    handleSelectionChange(selection) {
      this.selectionRows = selection;
    },

    // 第N页
    handleCurrentChange(val) {
      this.currentPage = val
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    // 切换筛选框展开/收起状态
    toggleSearchExpanded() {
      this.searchExpanded = !this.searchExpanded;
    },

    //************************************************ 第2部分：主表 ********************************************************

    // 按钮_新增
    fun_create() {
      this.dataFormStatus = 'create';
      this.dataFormTitle = '新增应聘者';
      this.dataFormVisible = true;
      this.activeTabName = 'basic';
      this.initFormData();
      // 清理待上传的图片数据
      this.pendingImageFile = null;
      this.pendingImagePreview = '';
    },

    // 按钮_详情
    fun_detail(row) {
      this.dataFormStatus = 'detail';
      this.dataFormTitle = '应聘者详情';
      this.dataFormVisible = true;
      this.activeTabName = 'basic';
      this.loadApplicantDetail(row.id);
    },

    // 按钮_编辑
    fun_update(row) {
      this.dataFormStatus = 'update';
      this.dataFormTitle = '编辑应聘者';
      this.dataFormVisible = true;
      this.activeTabName = 'basic';
      this.loadApplicantDetail(row.id);
      // 清理待上传的图片数据（编辑时图片上传应该是即时的）
      this.pendingImageFile = null;
      this.pendingImagePreview = '';
    },

    // 按钮_删除
    async fun_delete(id) {
      try {
        await ElMessageBox.confirm(
          '确认删除该应聘者吗？此操作不可撤销！',
          '删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const response = await axios({
          url: this.applicantDelete,
          method: 'POST',
          data: { id: id, opera: "1" }
        });

        if (response.data.code === 2000) {
          ElMessage.success('删除成功');
          this.query();
        } else {
          ElMessage.error(response.data.message || '删除失败');
        }
        this.loading = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
          console.error('删除失败:', error);
        }
        this.loading = false;
      }
    },

    // 按钮_保存
    async fun_save() {
      try {
        const valid = await this.$refs.dataFormRef.validate();
        if (!valid) {
          ElMessage.warning('请检查表单参数');
          return;
        }
        this.dataFormLoading = true;

        // 使用switch分别处理新增和编辑逻辑
        switch (this.dataFormStatus) {
          case 'create':
            await this.handleCreateSave();
            break;
          case 'update':
            await this.handleUpdateSave();
            break;
          default:
            ElMessage.error('未知的操作类型');
            return;
        }

      } catch (error) {
        // 处理表单验证错误
        if (error && typeof error === 'object' && !error.message) {
          // 如果是表单验证错误对象，提取第一个错误信息
          const firstFieldError = Object.values(error)[0];
          if (firstFieldError && Array.isArray(firstFieldError) && firstFieldError.length > 0) {
            ElMessage.warning(`表单验证失败：${firstFieldError[0].message || '请检查表单输入'}`);
          } else {
            ElMessage.warning('请检查表单输入是否正确');
          }
        } else if (error && error.message) {
          // 如果是普通错误对象
          ElMessage.error(`保存失败：${error.message}`);
        } else if (typeof error === 'string') {
          // 如果是字符串错误
          ElMessage.error(`保存失败：${error}`);
        } else {
          // 默认错误处理
          ElMessage.error('保存失败，请重试');
        }
        console.error('保存失败:', error);
      } finally {
        this.dataFormLoading = false;
      }
    },

    // 处理新增保存（两步操作：先保存基本信息，再上传图片）
    async handleCreateSave() {
      // 第一步：保存基本信息
      const payload = this.prepareDataForSave();
      const response = await axios.post(this.applicantInsert, payload);

      if (response.data.code !== 2000) {
        ElMessage.error(response.data.message || '保存基本信息失败');
        return;
      }

      // 获取新增记录的ID
      if (!response.data.data) {
        ElMessage.error('保存成功但未返回记录ID');
        return;
      }

      const newApplicantId = response.data.data;
      this.dataForm.id = newApplicantId;
      ElMessage.success('基本信息保存成功');

      // 第二步：保存子表数据
      try {
        await this.saveAllSubTableData(newApplicantId);
        ElMessage.success('子表数据保存成功');
      } catch (error) {
        console.error('子表数据保存失败:', error);
        ElMessage.warning('基本信息已保存，但子表数据保存失败，请手动重新添加');
      }

      // 第三步：处理待上传的图片（如果有）
      if (this.pendingImageFile) {
        try {
          ElMessage.info('正在上传图片...');
          await this.processPendingImageUpload();
          ElMessage.success('图片上传成功');
        } catch (imageError) {
          console.error('图片上传失败:', imageError);
          ElMessage.warning('基本信息已保存，但图片上传失败，请手动重新上传');
        }
      }

      // 第四步：处理待上传的附件（如果有）
      if (this.getPendingAttachmentsCount() > 0) {
        try {
          await this.processPendingAttachments();
          const failedCount = Object.values(this.attachmentUploadStatus).filter(status => status === 'error').length;
          if (failedCount === 0) {
            ElMessage.success('所有附件上传成功');
          } else {
            ElMessage.warning(`基本信息已保存，但有 ${failedCount} 个附件上传失败，请手动重新上传`);
          }
        } catch (attachmentError) {
          console.error('附件上传失败:', attachmentError);
          ElMessage.warning('基本信息已保存，但附件上传失败，请手动重新上传');
        }
      }

      if (!this.pendingImageFile && this.getPendingAttachmentsCount() === 0) {
        ElMessage.success('应聘者信息创建完成');
      }

      // 刷新列表并关闭对话框
      this.query();
      this.dataFormVisible = false;
    },

    // 新增方法：保存所有子表数据
    async saveAllSubTableData(applicantId) {
      const saveResults = {
        workExperience: { success: 0, failed: 0, errors: [] },
        training: { success: 0, failed: 0, errors: [] },
        family: { success: 0, failed: 0, errors: [] },
        education: { success: 0, failed: 0, errors: [] }
      };

      // 1. 保存工作经历
      if (this.workExperienceList.length > 0) {
        ElMessage.info('正在保存工作经历...');
        for (let i = 0; i < this.workExperienceList.length; i++) {
          const workExp = this.workExperienceList[i];
          try {
            workExp.applicantId = applicantId;
            const response = await axios.post(this.applicantWorkInsert, workExp);
            if (response.data.code === 2000) {
              saveResults.workExperience.success++;
              // 更新本地数据的ID
              this.workExperienceList[i].id = response.data.data;
            } else {
              saveResults.workExperience.failed++;
              saveResults.workExperience.errors.push(`工作经历${i + 1}: ${response.data.message || '保存失败'}`);
            }
          } catch (error) {
            saveResults.workExperience.failed++;
            saveResults.workExperience.errors.push(`工作经历${i + 1}: 网络错误`);
            console.error(`保存工作经历${i + 1}失败:`, error);
          }
        }
      }

      // 2. 保存培训经历
      if (this.trainingList.length > 0) {
        ElMessage.info('正在保存培训经历...');
        for (let i = 0; i < this.trainingList.length; i++) {
          const training = this.trainingList[i];
          try {
            training.applicantId = applicantId;
            const response = await axios.post(this.applicantTrainingInsert, training);
            if (response.data.code === 2000) {
              saveResults.training.success++;
              // 更新本地数据的ID
              this.trainingList[i].id = response.data.data;
            } else {
              saveResults.training.failed++;
              saveResults.training.errors.push(`培训经历${i + 1}: ${response.data.message || '保存失败'}`);
            }
          } catch (error) {
            saveResults.training.failed++;
            saveResults.training.errors.push(`培训经历${i + 1}: 网络错误`);
            console.error(`保存培训经历${i + 1}失败:`, error);
          }
        }
      }

      // 3. 保存家庭情况
      if (this.familyList.length > 0) {
        ElMessage.info('正在保存家庭情况...');
        for (let i = 0; i < this.familyList.length; i++) {
          const family = this.familyList[i];
          try {
            family.applicantId = applicantId;
            const response = await axios.post(this.applicantFamilyInsert, family);
            if (response.data.code === 2000) {
              saveResults.family.success++;
              // 更新本地数据的ID
              this.familyList[i].id = response.data.data;
            } else {
              saveResults.family.failed++;
              saveResults.family.errors.push(`家庭情况${i + 1}: ${response.data.message || '保存失败'}`);
            }
          } catch (error) {
            saveResults.family.failed++;
            saveResults.family.errors.push(`家庭情况${i + 1}: 网络错误`);
            console.error(`保存家庭情况${i + 1}失败:`, error);
          }
        }
      }

      // 4. 保存学习经历
      if (this.educationList.length > 0) {
        ElMessage.info('正在保存学习经历...');
        for (let i = 0; i < this.educationList.length; i++) {
          const education = this.educationList[i];
          try {
            education.applicantId = applicantId;
            const response = await axios.post(this.applicantEducationInsert, education);
            if (response.data.code === 2000) {
              saveResults.education.success++;
              // 更新本地数据的ID
              this.educationList[i].id = response.data.data;
            } else {
              saveResults.education.failed++;
              saveResults.education.errors.push(`学习经历${i + 1}: ${response.data.message || '保存失败'}`);
            }
          } catch (error) {
            saveResults.education.failed++;
            saveResults.education.errors.push(`学习经历${i + 1}: 网络错误`);
            console.error(`保存学习经历${i + 1}失败:`, error);
          }
        }
      }

      // 如果有失败的记录，抛出错误
      const totalFailed = Object.values(saveResults).reduce((sum, result) => sum + result.failed, 0);
      if (totalFailed > 0) {
        throw new Error(`子表数据保存完成，但有 ${totalFailed} 条记录保存失败`);
      }
    },

    // 处理编辑保存（一步操作：只保存基本信息）
    async handleUpdateSave() {
      const payload = this.prepareDataForSave();
      const response = await axios.post(this.applicantUpdate, payload);

      if (response.data.code === 2000) {
        ElMessage.success('修改成功');
        this.query();
        this.dataFormVisible = false;
      } else {
        ElMessage.error(response.data.message || '修改失败');
      }
    },

    // 准备保存数据
    prepareDataForSave() {
      // 使用深拷贝创建payload，确保数据源正确
      const payload = JSON.parse(JSON.stringify(this.dataForm));

      // 处理上传图片url
      payload.photoUrl = payload.photoUrl.replace(this.imageViewUrl, '');

      // 处理联系电话字段 - 如果是数组则取第一个元素，确保为字符串格式
      if (Array.isArray(payload.contactPhone)) {
        payload.contactPhone = payload.contactPhone.length > 0 ? payload.contactPhone[0] : '';
      }
      // 确保联系电话是字符串格式
      if (typeof payload.contactPhone !== 'string') {
        payload.contactPhone = String(payload.contactPhone || '');
      }
      // 处理身份证号字段 - 如果是数组则取第一个元素，确保为字符串格式
      if (Array.isArray(payload.idCardNo)) {
        payload.idCardNo = payload.idCardNo.length > 0 ? payload.idCardNo[0] : '';
      }
      // 确保身份证号是字符串格式
      if (typeof payload.idCardNo !== 'string') {
        payload.idCardNo = String(payload.idCardNo || '');
      }

      // 处理枚举字段：将 {key, value} 对象转换为 key 值
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (value && typeof value === 'object' && 'key' in value && 'value' in value) {
          payload[key] = value.key;
        }
      });

      // 处理地址格式：将前端级联选择器格式转换为后端格式
      payload.homeAddress = this.convertAddressToBackend(payload.homeAddress);
      payload.householdRegister = this.convertAddressToBackend(payload.householdRegister);
      payload.nativePlace = this.convertAddressToBackend(payload.nativePlace);

      // 处理病史对象：确保对象结构正确
      payload.pastHistory = payload.pastHistory || {};
      payload.currentHistory = payload.currentHistory || {};
      payload.familyHistory = payload.familyHistory || {};
      payload.occupationalHistory = payload.occupationalHistory || {};

      // 处理应聘途径数组：确保是数组格式
      payload.applicationChannels = Array.isArray(payload.applicationChannels)
        ? payload.applicationChannels
        : [];

      // 强制格式化日期字段为 'YYYY-MM-DD'
      const dateFields = ['birthDate', 'availableDate', 'dischargeDate', 'fillDate'];
      dateFields.forEach(field => {
        if (payload[field]) {
          payload[field] = dayjs(payload[field]).format('YYYY-MM-DD');
        }
      });

      // allowedFields 白名单，确保提交给后端的数据只包含这些字段
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
      ];
      // 创建一个干净的 payload 对象，只包含白名单中的字段
      const cleanPayload = {};
      allowedFields.forEach(field => {
        if (payload.hasOwnProperty(field)) {
          cleanPayload[field] = payload[field];
        }
      });

      return cleanPayload;
    },

    // 转换地址格式为后端格式
    convertAddressToBackend(address) {
      if (!address || !address.region || !Array.isArray(address.region)) {
        return {
          province: '',
          city: '',
          district: '',
          detail: address ? (address.detail || '') : ''
        };
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
      };
    },

    // 加载应聘者详情
    async loadApplicantDetail(id) {
      try {
        const response = await axios({
          url: this.applicantDetail,
          method: 'POST',
          data: { id: id }
        });

        if (response.data.code === 2000) {
          const backendData = response.data.data;

          // 创建一个净化后的数据副本
          const cleanData = { ...backendData };
          // 遍历所有可能的枚举字段和特殊字段
          Object.keys(this.attrCnts).forEach(optionKey => {
            // 从 'genderOptions' 中提取 'gender'
            const fieldName = optionKey.replace('Options', '');
            if (cleanData[fieldName] && typeof cleanData[fieldName] === 'object' && cleanData[fieldName].hasOwnProperty('key')) {
              // 如果是 {key, value} 对象，只取 key
              cleanData[fieldName] = cleanData[fieldName].key;
            }
          });
          // 特殊处理 weight 字段
          if (cleanData.weight && typeof cleanData.weight === 'object') {
            cleanData.weight = cleanData.weight.parsedValue || cleanData.weight.source;
          }

          // 初始化表单数据
          this.initFormData();

          // 处理后端数据格式转换
          this.convertBackendDataToForm(backendData);

          // 加载子表数据
          this.loadSubTableData(id);

          // 加载附件列表，驱动附件页签按钮显隐
          this.loadApplicantAttachments();
        } else {
          ElMessage.error(response.data.message || '获取详情失败');
        }
      } catch (error) {
        ElMessage.error('获取详情失败');
        console.error('获取详情失败:', error);
      }
    },

    // 初始化表单数据
    initFormData() {
      this.dataForm = {
        // 基本信息
        id: '',                // 主键ID
        applicantName: '',     // 姓名
        applyPosition: '',     // 应聘岗位
        photoUrl: '',          // 照片URL
        gender: 1,             // 性别 - 默认：男(1)
        birthDate: '',         // 出生年月
        nation: 1,             // 民族 - 默认：汉族
        politicalStatus: 3,    // 政治面貌 - 默认：群众(3)
        maritalStatus: 2,      // 婚姻状况 - 默认：未婚(2)
        height: null,          // 身高
        weight: null,          // 体重 - 后端返回 {source: "88.00", parsedValue: 88}
        visionLeft: '',        // 左眼视力
        visionRight: '',       // 右眼视力
        bloodType: 1,          // 血型 - 默认：A型(1)
        professionalTitle: '', // 职称
        foreignLanguageLevel: 1, // 外语等级 - 默认：一般(1)
        foreignLanguageScore: null, // 外语分数
        contactPhone: '',      // 联系电话
        idCardNo: '',          // 身份证号
        availableDate: '',     // 可报到日期
        isVeteran: 0,          // 是否为退伍军人 - 默认：否(0)
        dischargeDate: '',     // 退伍日期
        dischargeCertNo: '',   // 退役证编号
        // 地址 - 使用后端格式
        homeAddress: {
          province: '',        // 省
          city: '',            // 市
          district: '',        // 区
          detail: ''           // 详细地址
        },
        householdRegister: {
          province: '',        // 省
          city: '',            // 市
          district: '',        // 区
          detail: ''           // 详细地址
        },
        nativePlace: {
          province: '',        // 省
          city: '',            // 市
          district: '',        // 区
          detail: ''           // 详细地址
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
        otherHistory: '',               // 其他史
        noHistoryStatement: '',         // 无病史声明
        // 备注
        applicationChannels: [],   // 应聘途径
        agreeShiftWork: 0,         // 是否同意轮班工作 - 默认：否(0)
        needAccommodation: 0,      // 是否需要住宿 - 默认：否(0)
        // 申明
        signature: '',             // 本人签字
        fillDate: dayjs().format('YYYY-MM-DD'), // 填表时间 - 默认：当前日期
      };

      // 初始化子表数据
      this.workExperienceList = [];        // 工作经历
      this.educationList = [];   // 教育经历
      this.familyList = [];      // 家庭成员
      this.trainingList = [];       // 培训经历

      // 初始化附件数据
      this.idCardFiles = [];       // 身份证文件
      this.degreeCertFiles = [];   // 学位证书文件
      this.graduationCertFiles = []; // 毕业证书文件
      this.educationRegFiles = [];  // 教育注册文件
      this.graduationVerifyFiles = []; // 毕业证明文件

      // 初始化待上传的图片数据
      this.pendingImageFile = null;  // 待上传的图片文件对象
      this.pendingImagePreview = ''; // 待上传图片的预览BASE64

      // 初始化待上传的附件数据
      this.clearPendingAttachments();

      // 重置附件表格数据
      this.resetAttachmentTableData();
    },

    // 加载子表数据
    async loadSubTableData(applicantId) {
      try {
        // 加载工作经历
        const workResponse = await axios.post(this.applicantWorkList, { applicantId: applicantId });
        if (workResponse.data.code === 2000) {
          this.workExperienceList = workResponse.data.data || [];
        }

        // 加载培训经历
        const trainingResponse = await axios.post(this.applicantTrainingList, { applicantId: applicantId });
        if (trainingResponse.data.code === 2000) {
          this.trainingList = trainingResponse.data.data || [];
        }

        // 加载家庭情况
        const familyResponse = await axios.post(this.applicantFamilyList, { applicantId: applicantId });
        if (familyResponse.data.code === 2000) {
          this.familyList = familyResponse.data.data || [];
        }

        // 加载学习经历
        const educationResponse = await axios.post(this.applicantEducationList, { applicantId: applicantId });
        if (educationResponse.data.code === 2000) {
          // 转换 educationLevel 与 schoolNature 为数字
          this.educationList = educationResponse.data.data.map(item => ({
            ...item,
            educationLevel: Number(
              // 兼容后端可能返回 {key, value} 格式
              item.educationLevel && item.educationLevel.key != null
                ? item.educationLevel.key
                : item.educationLevel
            ),
            schoolNature: Number(
              // 兼容后端可能返回 {key, value} 格式
              item.schoolNature && item.schoolNature.key != null
                ? item.schoolNature.key
                : item.schoolNature
            )
          }));
        }
      } catch (error) {
        console.error('加载子表数据失败:', error);
      }
    },

    // 处理后端数据格式转换
    convertBackendDataToForm(backendData) {
      // 基本字段直接赋值
      Object.keys(backendData).forEach(key => {
        if (this.dataForm.hasOwnProperty(key)) {
          const value = backendData[key];
          // 如果值是一个包含 key 和 value 的对象 (后端枚举格式)，则只取 key
          if (value && typeof value === 'object' && value.hasOwnProperty('key')) {
            this.dataForm[key] = value.key;
          } else {
            // 否则直接赋值
            this.dataForm[key] = value;
          }
        }
      });

      // 处理地址格式转换（后端格式 -> 前端级联选择器格式）
      this.convertAddressFormat(backendData);

      // 处理头像URL，添加图片访问前缀
      if (backendData.photoUrl && backendData.photoUrl.trim() !== '') {
        // 如果photoUrl不是以http开头，则添加图片访问前缀
        if (!backendData.photoUrl.startsWith('http')) {
          this.dataForm.photoUrl = this.imageViewUrl + backendData.photoUrl;
        } else {
          this.dataForm.photoUrl = backendData.photoUrl;
        }
      }

      // 处理特殊字段
      this.handleSpecialFields(backendData);
    },

    // 转换地址格式
    convertAddressFormat(backendData) {
      // 处理籍贯
      if (backendData.nativePlace) {
        this.dataForm.nativePlace = {
          region: this.buildRegionArray(backendData.nativePlace)
        };
      }

      // 处理户口所在地
      if (backendData.householdRegister) {
        this.dataForm.householdRegister = {
          region: this.buildRegionArray(backendData.householdRegister),
          street: backendData.householdRegister.street || '',
          police: backendData.householdRegister.police || ''
        };
      }

      // 处理现家庭住址
      if (backendData.homeAddress) {
        this.dataForm.homeAddress = {
          region: this.buildRegionArray(backendData.homeAddress),
          street: backendData.homeAddress.street || '',
          village: backendData.homeAddress.village || '',
          number: backendData.homeAddress.number || ''
        };
      }
    },

    // 构建地区数组
    buildRegionArray(addressObj) {
      const regions = [];
      if (addressObj.province) {
        regions.push(addressObj.province);
      }
      if (addressObj.city) {
        regions.push(addressObj.city);
      }
      if (addressObj.district) {
        regions.push(addressObj.district);
      }
      return regions;
    },

    // 处理特殊字段
    handleSpecialFields(backendData) {
      // 处理体重字段
      if (backendData.weight && typeof backendData.weight === 'object') {
        this.dataForm.weight = backendData.weight.parsedValue || backendData.weight.source;
      }

      // 确保病史对象存在
      if (!this.dataForm.pastHistory) {
        this.dataForm.pastHistory = {};
      }
      if (!this.dataForm.currentHistory) {
        this.dataForm.currentHistory = {};
      }
      if (!this.dataForm.familyHistory) {
        this.dataForm.familyHistory = {};
      }
      if (!this.dataForm.occupationalHistory) {
        this.dataForm.occupationalHistory = {};
      }

      // 确保地址对象存在
      this.ensureAddressObjects();
    },

    // 确保地址对象存在
    ensureAddressObjects() {
      if (!this.dataForm.homeAddress || typeof this.dataForm.homeAddress !== 'object') {
        this.dataForm.homeAddress = {
          region: [],           // 省市县三级联动 [省, 市, 县]
          street: '',           // 乡(街道)
          village: '',          // 村(路)
          number: ''            // 号
        };
      }
      if (!this.dataForm.householdRegister || typeof this.dataForm.householdRegister !== 'object') {
        this.dataForm.householdRegister = {
          region: [],           // 省市县三级联动 [省, 市, 县]
          street: '',           // 乡(街道)
          police: ''            // 派出所
        };
      }
      if (!this.dataForm.nativePlace || typeof this.dataForm.nativePlace !== 'object') {
        this.dataForm.nativePlace = {
          region: []            // 省市县三级联动 [省, 市, 县]
        };
      }
    },

    // 地区级联选择器过滤方法
    filterRegionMethod(node, keyword) {
      if (keyword) {
        return node.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
      }
      return true;
    },

    // 处理地区选择变化
    handleRegionChange(value, type) {
      console.log(`${type} region changed:`, value);
      // 这里可以添加额外的处理逻辑
    },

    //************************************************ 第2部分：回收站 *****************************************************

    // 打开回收站弹框
    fun_recycleBin() {
      // 1. 防止因快速点击导致的重复执行
      if (this.recycleBinDialogVisible) {
        return;
      }

      this.recycleBinDialogVisible = true;

      // 2. 确保弹窗DOM渲染完成后再执行内部逻辑
      this.$nextTick(() => {
        this.recycleSearchForm = {
          applicantName: '',
          contactPhone: '',
          idCardNo: '',
        };
        this.recycleCurrentPage = 1;
        this.queryRecycleData();
      });
    },

    // 查询回收站数据
    async queryRecycleData() {
      const _this = this;
      _this.recycleLoading = true;

      let params = {
        // 页面类型参数（用于后端状态过滤）
        page: 'allocate',
        // 设置查询已删除的数据
        deletedFlag: 1,
        // 文本输入框
        applicantName: _this.recycleSearchForm.applicantName || null,
        contactPhone: _this.recycleSearchForm.contactPhone || null,
        idCardNo: _this.recycleSearchForm.idCardNo || null,
      };

      try {
        const response = await axios({
          url: _this.applicantList,
          method: 'POST',
          data: params
        });

        if (response.data.code === 2000) {
          let recycleDataList = response.data.data || [];
          // 处理头像URL，添加图片访问前缀
          recycleDataList.forEach(item => {
            if (item.photoUrl && item.photoUrl.trim() !== '') {
              // 如果photoUrl不是以http开头，则添加图片访问前缀
              if (!item.photoUrl.startsWith('http')) {
                item.photoUrl = _this.imageViewUrl + item.photoUrl;
              }
            }
          });
          _this.recycleDataList = recycleDataList;
          _this.recycleDataTotal = recycleDataList.length;
        } else {
          ElMessage.error(response.data.message || '获取回收站数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败');
        console.error('查询回收站数据失败:', error);
      }

      _this.recycleLoading = false;
    },

    // 回收站查询
    fun_recycleSearch() {
      this.recycleCurrentPage = 1;
      this.queryRecycleData();
    },

    // 回收站重置
    fun_recycleReset() {
      this.recycleSearchForm = {
        applicantName: '',
        contactPhone: '',
        idCardNo: '',
      };
      this.recycleCurrentPage = 1;
      this.queryRecycleData();
    },

    // 回收站详情
    fun_recycleDetail(row) {
      this.dataFormStatus = 'detail';
      this.dataFormTitle = '回收站应聘者详情';
      this.dataFormVisible = true;
      this.activeTabName = 'basic';
      this.loadApplicantDetail(row.id);
    },

    // 还原数据
    async fun_restore(id) {
      try {
        await ElMessageBox.confirm(
          '确认还原该应聘者吗？还原后将重新出现在主列表中！',
          '还原确认',
          {
            type: 'warning',
            confirmButtonText: '确认还原',
            cancelButtonText: '取消'
          }
        );

        this.recycleLoading = true;
        const response = await axios({
          url: this.applicantDelete,
          method: 'POST',
          data: { id: id, opera: "2" }
        });

        if (response.data.code === 2000) {
          ElMessage.success('还原成功');
          this.queryRecycleData(); // 刷新回收站数据
          this.query(); // 刷新主表数据
        } else {
          ElMessage.error(response.data.message || '还原失败');
        }
        this.recycleLoading = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('还原失败');
          console.error('还原失败:', error);
        }
        this.recycleLoading = false;
      }
    },

    // 彻底删除数据
    async fun_truncate(id) {
      try {
        await ElMessageBox.confirm(
          '确认彻底删除该应聘者吗？彻底删除后将不再出现在主列表中！',
          '彻底删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认彻底删除',
            cancelButtonText: '取消'
          }
        );

        this.recycleLoading = true;
        const response = await axios({
          url: this.applicantDelete,
          method: 'POST',
          data: { id: id, opera: "0" }
        });

        if (response.data.code === 2000) {
          ElMessage.success('彻底删除成功');
          this.queryRecycleData(); // 刷新回收站数据
          this.query(); // 刷新主表数据
        } else {
          ElMessage.error(response.data.message || '彻底删除失败');
        }
        this.recycleLoading = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('彻底删除失败');
          console.error('彻底删除失败:', error);
        }
        this.recycleLoading = false;
      }
    },

    // 回收站分页-页码改变
    handleRecycleCurrentChange(val) {
      this.recycleCurrentPage = val;
    },

    // 回收站分页-每页大小改变
    handleRecycleSizeChange(val) {
      this.recyclePageSize = val;
      this.recycleCurrentPage = 1;
    },

    //************************************************ 第3部分：子表，工作经历 ************************************************

    // 工作经历-新增
    addWorkExperience() {
      this.workExperienceDialogTitle = '新增工作经历';
      this.currentWorkExperienceIndex = -1;
      this.resetWorkExperienceForm();
      this.workExperienceDialogVisible = true;
    },

    // 工作经历-编辑
    editWorkExperience(row, index) {
      this.workExperienceDialogTitle = '编辑工作经历';
      this.currentWorkExperienceIndex = index;
      this.workExperienceForm = { ...row };
      this.workExperienceDialogVisible = true;
    },

    // 工作经历-删除
    async deleteWorkExperience(index) {
      try {
        const row = this.workExperienceList[index];
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
          );

          const response = await axios({
            url: this.applicantWorkDelete,
            method: 'POST',
            data: { id: row.id }
          });

          if (response.data.code === 2000) {
            ElMessage.success('删除成功');
            this.workExperienceList.splice(index, 1);
          } else {
            ElMessage.error(response.data.message || '删除失败');
          }
        } else {
          // 无ID，仅前端删除
          this.workExperienceList.splice(index, 1);
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
          console.error('删除工作经历失败:', error);
        }
      }
    },

    // 工作经历-保存
    async saveWorkExperience() {
      try {
        const valid = await this.$refs.workExperienceFormRef.validate();
        if (!valid) {
          ElMessage.warning('请检查表单参数');
          return;
        }

        // 额外的时间验证
        const dateValidation = this.validateDateRange(
          this.workExperienceForm.startDate,
          this.workExperienceForm.endDate,
          '时间'
        );
        if (dateValidation !== true) {
          ElMessage.error(dateValidation);
          return;
        }

        this.workExperienceForm.applicantId = this.dataForm.id;
        const isEdit = this.currentWorkExperienceIndex !== -1;

        if (isEdit && this.workExperienceForm.id) {
          // 编辑模式，调用更新API
          const response = await axios({
            url: this.applicantWorkUpdate,
            method: 'POST',
            data: this.workExperienceForm
          });

          if (response.data.code === 2000) {
            ElMessage.success('更新成功');
            this.workExperienceList[this.currentWorkExperienceIndex] = { ...this.workExperienceForm };
          } else {
            ElMessage.error(response.data.message || '更新失败');
          }
        } else if (this.dataForm.id) {
          // 新增模式，调用新增API
          const response = await axios({
            url: this.applicantWorkInsert,
            method: 'POST',
            data: this.workExperienceForm
          });

          if (response.data.code === 2000) {
            ElMessage.success('新增成功');
            // 重新加载工作经历列表
            await this.loadSubTableData(this.dataForm.id);
          } else {
            ElMessage.error(response.data.message || '新增失败');
          }
        } else {
          // 无应聘者ID，仅前端操作
          if (isEdit) {
            this.workExperienceList[this.currentWorkExperienceIndex] = { ...this.workExperienceForm };
          } else {
            this.workExperienceList.push({ ...this.workExperienceForm });
          }
          ElMessage.success(isEdit ? '更新成功' : '新增成功');
        }

        this.workExperienceDialogVisible = false;
      } catch (error) {
        ElMessage.error('保存失败');
        console.error('保存工作经历失败:', error);
      }
    },

    // 工作经历-重置
    resetWorkExperienceForm() {
      this.workExperienceForm = {
        id: '',                // 主键ID
        applicantId: '',       // 应聘者ID
        startDate: '',         // 开始时间
        endDate: '',           // 结束时间
        companyName: '',       // 工作单位全称
        position: '',          // 职务
        businessScope: '',     // 负责业务范围
        referencePerson: '',   // 证明人
        referenceContact: ''   // 证明人的联系方式
      };
    },

    //************************************************ 第3部分：子表，培训经历 ************************************************

    // 培训经历-新增
    addTraining() {
      this.trainingDialogTitle = '新增培训经历';
      this.currentTrainingIndex = -1;
      this.resetTrainingForm();
      this.trainingDialogVisible = true;
    },

    // 培训经历-编辑
    editTraining(row, index) {
      this.trainingDialogTitle = '编辑培训经历';
      this.currentTrainingIndex = index;
      this.trainingForm = { ...row };
      this.trainingDialogVisible = true;
    },

    // 培训经历-删除
    async deleteTraining(index) {
      try {
        const row = this.trainingList[index];
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
          );

          const response = await axios({
            url: this.applicantTrainingDelete,
            method: 'POST',
            data: { id: row.id }
          });

          if (response.data.code === 2000) {
            ElMessage.success('删除成功');
            this.trainingList.splice(index, 1);
          } else {
            ElMessage.error(response.data.message || '删除失败');
          }
        } else {
          // 无ID，仅前端删除
          this.trainingList.splice(index, 1);
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
          console.error('删除培训经历失败:', error);
        }
      }
    },

    // 培训经历-保存
    async saveTraining() {
      try {
        const valid = await this.$refs.trainingFormRef.validate();
        if (!valid) {
          ElMessage.warning('请检查表单参数');
          return;
        }

        // 额外的时间验证
        const dateValidation = this.validateDateRange(
          this.trainingForm.startDate,
          this.trainingForm.endDate,
          '时间'
        );
        if (dateValidation !== true) {
          ElMessage.error(dateValidation);
          return;
        }

        this.trainingForm.applicantId = this.dataForm.id;
        const isEdit = this.currentTrainingIndex !== -1;

        if (isEdit && this.trainingForm.id) {
          // 编辑模式，调用更新API
          const response = await axios({
            url: this.applicantTrainingUpdate,
            method: 'POST',
            data: this.trainingForm
          });

          if (response.data.code === 2000) {
            ElMessage.success('更新成功');
            this.trainingList[this.currentTrainingIndex] = { ...this.trainingForm };
          } else {
            ElMessage.error(response.data.message || '更新失败');
          }
        } else if (this.dataForm.id) {
          // 新增模式，调用新增API
          const response = await axios({
            url: this.applicantTrainingInsert,
            method: 'POST',
            data: this.trainingForm
          });

          if (response.data.code === 2000) {
            ElMessage.success('新增成功');
            // 重新加载培训经历列表
            await this.loadSubTableData(this.dataForm.id);
          } else {
            ElMessage.error(response.data.message || '新增失败');
          }
        } else {
          // 无应聘者ID，仅前端操作
          if (isEdit) {
            this.trainingList[this.currentTrainingIndex] = { ...this.trainingForm };
          } else {
            this.trainingList.push({ ...this.trainingForm });
          }
          ElMessage.success(isEdit ? '更新成功' : '新增成功');
        }

        this.trainingDialogVisible = false;
      } catch (error) {
        ElMessage.error('保存失败');
        console.error('保存培训经历失败:', error);
      }
    },

    // 培训经历-重置
    resetTrainingForm() {
      this.trainingForm = {
        id: '',                // 主键ID
        applicantId: '',       // 应聘者ID
        startDate: '',         // 开始时间
        endDate: '',           // 结束时间
        trainingName: '',      // 培训名称
        qualification: ''      // 资格证书
      };
    },

    //************************************************ 第3部分：子表，家庭经历 ************************************************

    // 家庭情况-新增
    addFamily() {
      this.familyDialogTitle = '新增家庭成员';
      this.currentFamilyIndex = -1;
      this.resetFamilyForm();
      this.familyDialogVisible = true;
    },

    // 家庭情况-编辑
    editFamily(row, index) {
      this.familyDialogTitle = '编辑家庭成员';
      this.currentFamilyIndex = index;
      this.familyForm = { ...row };
      this.familyDialogVisible = true;
    },

    // 家庭情况-删除
    async deleteFamily(index) {
      try {
        const row = this.familyList[index];
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
          );

          const response = await axios({
            url: this.applicantFamilyDelete,
            method: 'POST',
            data: { id: row.id }
          });

          if (response.data.code === 2000) {
            ElMessage.success('删除成功');
            this.familyList.splice(index, 1);
          } else {
            ElMessage.error(response.data.message || '删除失败');
          }
        } else {
          // 无ID，仅前端删除
          this.familyList.splice(index, 1);
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
          console.error('删除家庭情况失败:', error);
        }
      }
    },

    // 家庭情况-保存
    async saveFamily() {
      try {
        const valid = await this.$refs.familyFormRef.validate();
        if (!valid) {
          ElMessage.warning('请检查表单参数');
          return;
        }

        this.familyForm.applicantId = this.dataForm.id;
        const isEdit = this.currentFamilyIndex !== -1;

        if (isEdit && this.familyForm.id) {
          // 编辑模式，调用更新API
          const response = await axios({
            url: this.applicantFamilyUpdate,
            method: 'POST',
            data: this.familyForm
          });

          if (response.data.code === 2000) {
            ElMessage.success('更新成功');
            this.familyList[this.currentFamilyIndex] = { ...this.familyForm };
          } else {
            ElMessage.error(response.data.message || '更新失败');
          }
        } else if (this.dataForm.id) {
          // 新增模式，调用新增API
          const response = await axios({
            url: this.applicantFamilyInsert,
            method: 'POST',
            data: this.familyForm
          });

          if (response.data.code === 2000) {
            ElMessage.success('新增成功');
            // 重新加载家庭情况列表
            await this.loadSubTableData(this.dataForm.id);
          } else {
            ElMessage.error(response.data.message || '新增失败');
          }
        } else {
          // 无应聘者ID，仅前端操作
          if (isEdit) {
            this.familyList[this.currentFamilyIndex] = { ...this.familyForm };
          } else {
            this.familyList.push({ ...this.familyForm });
          }
          ElMessage.success(isEdit ? '更新成功' : '新增成功');
        }

        this.familyDialogVisible = false;
      } catch (error) {
        ElMessage.error('保存失败');
        console.error('保存家庭情况失败:', error);
      }
    },

    // 家庭情况-重置
    resetFamilyForm() {
      this.familyForm = {
        id: '',                // 主键ID
        applicantId: '',       // 应聘者ID
        name: '',              // 姓名
        relationship: '',      // 与本人关系
        age: null,             // 年龄
        workUnit: '',          // 工作单位
        contactPhone: ''       // 联系电话
      };
    },

    //************************************************ 第3部分：子表，学习经历 ************************************************

    // 学习经历-新增
    addEducation() {
      this.educationDialogTitle = '新增学习经历';
      this.currentEducationIndex = -1;
      this.resetEducationForm();
      this.educationDialogVisible = true;
    },

    // 学习经历-编辑
    editEducation(row, index) {
      this.educationDialogTitle = '编辑学习经历';
      this.currentEducationIndex = index;
      // 兼容后端返回 schoolNature 为 {key, value} 的情况，转为 key 以匹配 <el-select/>
      this.educationForm = {
        ...row,
        schoolNature: row.schoolNature && typeof row.schoolNature === 'object' && 'key' in row.schoolNature ? row.schoolNature.key : row.schoolNature,
      };
      this.educationDialogVisible = true;
    },

    // 学习经历-删除
    async deleteEducation(index) {
      try {
        const row = this.educationList[index];
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
          );

          const response = await axios({
            url: this.applicantEducationDelete,
            method: 'POST',
            data: { id: row.id }
          });

          if (response.data.code === 2000) {
            ElMessage.success('删除成功');
            this.educationList.splice(index, 1);
          } else {
            ElMessage.error(response.data.message || '删除失败');
          }
        } else {
          // 无ID，仅前端删除
          this.educationList.splice(index, 1);
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
          console.error('删除学习经历失败:', error);
        }
      }
    },

    // 学习经历-保存
    async saveEducation() {
      try {
        const valid = await this.$refs.educationFormRef.validate();
        if (!valid) {
          ElMessage.warning('请检查表单参数');
          return;
        }

        // 额外的时间验证
        const dateValidation = this.validateDateRange(
          this.educationForm.startDate,
          this.educationForm.endDate,
          '时间'
        );
        if (dateValidation !== true) {
          ElMessage.error(dateValidation);
          return;
        }

        this.educationForm.applicantId = this.dataForm.id;
        const isEdit = this.currentEducationIndex !== -1;

        if (isEdit && this.educationForm.id) {
          // 编辑模式，调用更新API
          const response = await axios({
            url: this.applicantEducationUpdate,
            method: 'POST',
            data: this.educationForm
          });

          if (response.data.code === 2000) {
            ElMessage.success('更新成功');
            this.educationList[this.currentEducationIndex] = { ...this.educationForm };
          } else {
            ElMessage.error(response.data.message || '更新失败');
          }
        } else if (this.dataForm.id) {
          // 新增模式，调用新增API
          const response = await axios({
            url: this.applicantEducationInsert,
            method: 'POST',
            data: this.educationForm
          });

          if (response.data.code === 2000) {
            ElMessage.success('新增成功');
            // 重新加载学习经历列表
            await this.loadSubTableData(this.dataForm.id);
          } else {
            ElMessage.error(response.data.message || '新增失败');
          }
        } else {
          // 无应聘者ID，仅前端操作
          if (isEdit) {
            this.educationList[this.currentEducationIndex] = { ...this.educationForm };
          } else {
            this.educationList.push({ ...this.educationForm });
          }
          ElMessage.success(isEdit ? '更新成功' : '新增成功');
        }

        this.educationDialogVisible = false;
      } catch (error) {
        ElMessage.error('保存失败');
        console.error('保存学习经历失败:', error);
      }
    },

    // 学习经历-重置
    resetEducationForm() {
      this.educationForm = {
        id: '',                // 主键ID
        applicantId: '',       // 应聘者ID
        startDate: '',         // 开始时间
        endDate: '',           // 结束时间
        educationLevel: '',    // 学历
        schoolName: '',        // 学校名称
        major: '',             // 专业
        schoolNature: ''       // 学历类型
      };
    },

    //************************************************ 第4部分：图片数据 *****************************************************

    // 图片输入文件改变事件
    handleImageInputChange(event) {
      // 从 FileList 中取第一个 File
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      // 调用校验单个文件
      if (!this.beforeUploadImageBase64(file)) {
        event.target.value = '';
        return;
      }

      // 通过校验后再上传
      this.uploadImageBase64(file);
      event.target.value = '';
    },

    // 图片Base64校验
    beforeUploadImageBase64(file) {
      const allowImageTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'
      ];

      console.log('上传文件MIME类型:', file.type);

      // MIME类型不存在时，根据文件扩展名推断简单图片类型
      let fileType = file.type;
      if (!fileType && file.name) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
          fileType = `image/${ext}`;
        }
      }

      const isValidType = allowImageTypes.includes(fileType);
      const isLt20M = file.size / 1024 / 1024 < 20;

      if (!isValidType) {
        ElMessage.error('支持上传图片(JPG/PNG/GIF/BMP/WEBP/SVG)格式的文件!');
        return false;
      }
      if (!isLt20M) {
        ElMessage.error('文件大小不能超过20MB!');
        return false;
      }
      return true;
    },

    // 图片Base64上传
    async uploadImageBase64(file) {
      if (!this.dataForm.id) {
        // 如果没有ID，暂存图片文件，待保存后再上传
        this.pendingImageFile = file;
        ElMessage.info('图片已选择，将在保存应聘者信息后自动上传');

        // 生成预览图片（不修改photoUrl，使用单独的预览字段）
        try {
          const base64Content = await this.fileToBase64(file);
          // 构造完整的DATA URL格式
          this.pendingImagePreview = `data:${file.type};base64,${base64Content}`;
        } catch (error) {
          console.error('预览图片生成失败:', error);
        }
        return;
      }

      try {
        const base64Content = await this.fileToBase64(file);

        // 生成自定义文件名: 姓名_电话_照片_时间戳
        const currentTime = dayjs().format('YYYYMMDD_HHmmss');
        const applicantName = this.dataForm.applicantName || '未知';
        const contactPhone = this.dataForm.contactPhone || '未知';
        const fileExtension = file.name.split('.').pop();
        const customFileName = `${applicantName}_${contactPhone}_照片_${currentTime}.${fileExtension}`;

        const uploadData = {
          applicantId: this.dataForm.id,
          fileName: customFileName,
          fileContent: base64Content,
          fileSize: file.size,
          mimeType: file.type,
          biz: this.imageBizUrl
        };

        // 将返回结果存到 response
        const response = await axios.post(this.imageUploadUrl, uploadData, {
          headers: this.sysHeaders
        });

        if (response.data.code === 2000) {
          // 后端返回的相对路径，如 "images/xxx.jpg"
          const relative = response.data.data;
          // 直接拼接预览 URL
          this.dataForm.photoUrl = this.imageViewUrl + relative;
          // 清理预览数据（如果有的话）
          this.pendingImagePreview = '';
          ElMessage.success('照片上传成功');
        } else {
          ElMessage.error(response.data.message || '照片上传失败');
        }
      } catch (error) {
        console.error('照片上传失败:', error);
        ElMessage.error('照片上传失败，请重试');
      }
    },

    // 延迟上传图片（在获得ID后执行）
    async processPendingImageUpload() {
      if (!this.pendingImageFile || !this.dataForm.id) {
        return;
      }

      try {
        ElMessage.info('正在上传图片...');

        const base64Content = await this.fileToBase64(this.pendingImageFile);

        // 生成自定义文件名: 姓名_电话_照片_时间戳
        const currentTime = dayjs().format('YYYYMMDD_HHmmss');
        const applicantName = this.dataForm.applicantName || '未知';
        const contactPhone = this.dataForm.contactPhone || '未知';
        const fileExtension = this.pendingImageFile.name.split('.').pop();
        const customFileName = `${applicantName}_${contactPhone}_照片_${currentTime}.${fileExtension}`;

        const uploadData = {
          applicantId: this.dataForm.id,
          fileName: customFileName,
          fileContent: base64Content,
          fileSize: this.pendingImageFile.size,
          mimeType: this.pendingImageFile.type,
          biz: this.imageBizUrl
        };

        const response = await axios.post(this.imageUploadUrl, uploadData, {
          headers: this.sysHeaders
        });

        if (response.data.code === 2000) {
          // 后端返回的相对路径，如 "images/xxx.jpg"
          const relative = response.data.data;
          // 直接拼接预览 URL
          this.dataForm.photoUrl = this.imageViewUrl + relative;
          ElMessage.success('照片上传成功');

          // 清空待上传的文件和预览
          this.pendingImageFile = null;
          this.pendingImagePreview = '';
        } else {
          ElMessage.error(response.data.message || '照片上传失败');
        }
      } catch (error) {
        console.error('照片上传失败:', error);
        ElMessage.error('照片上传失败，请重试');
      }
    },

    // 照片预览
    handlePhotoPreview() {
      if (this.currentPhotoUrl) {
        this.dialogImageUrl = this.currentPhotoUrl;
        this.dialogVisible = true;
      }
    },

    // 关闭预览
    closePhotoPreview() {
      this.dialogVisible = false;
    },

    // 表格照片预览
    handleTablePhotoPreview(photoUrl) {
      if (photoUrl) {
        this.dialogImageUrl = photoUrl;
        this.dialogVisible = true;
      }
    },

    //************************************************ 第4部分：附件数据 *****************************************************

    // 初始化
    initUploadConfig() {
      // 参考 office/upload-file：设置头为 X-Access-Token
      const token = localStorage.getItem('X-Access-Token') || localStorage.getItem('token') || '';
      this.sysHeaders = { 'X-Access-Token': token };
    },

    // 上传前处理函数
    beforeUpload(file) {
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
        'application/vnd.ms-powerpoint' // .ppt
      ];
      console.log('上传文件MIME类型:', file.type);
      const isValidType = allowTypes.includes(file.type);
      const isLt20M = file.size / 1024 / 1024 < 20; // 增大到20MB

      if (!isValidType) {
        ElMessage.error('支持上传图片(JPG/PNG/GIF/BMP/WEBP/SVG)、PDF、Excel(XLS/XLSX)、Word(DOC/DOCX)、PowerPoint(PPT/PPTX)格式的文件!');
        return false;
      }
      if (!isLt20M) {
        ElMessage.error('文件大小不能超过20MB!');
        return false;
      }
      return true;
    },

    // 附件加载
    async loadApplicantAttachments() {
      try {
        if (!this.dataForm.id) {
          return;
        }

        const resp = await axios.post(this.attachmentListUrl, { applicantId: this.dataForm.id });
        if (resp.data && resp.data.code === 2000 && Array.isArray(resp.data.data)) {
          // 将后端数据按类型分组
          const attachmentsByType = {};
          resp.data.data.forEach(attachment => {
            const typeKey = attachment.attachmentType.key;
            attachmentsByType[typeKey] = attachment;
          });

          // 更新附件表格数据，设置附件ID和状态
          const typeKeyMap = {
            1: 'idCard',      // 身份证
            2: 'degree',      // 学位证
            3: 'graduation',  // 毕业证
            4: 'eduReg',      // 学历证书备案表
            5: 'gradVerify'   // 毕业证在线验证报告
          };

          this.attachmentTableData.forEach(row => {
            const typeKey = Object.keys(typeKeyMap).find(key => typeKeyMap[key] === row.bizKey);
            if (typeKey && attachmentsByType[typeKey]) {
              const attachment = attachmentsByType[typeKey];
              row.attachmentId = attachment.id;
              row.attachmentName = attachment.attachmentName;
              row.attachmentUrl = attachment.attachmentUrl;
              row.hasAttachment = true; // 标记有附件
            } else {
              row.attachmentId = null;
              row.attachmentName = '';
              row.attachmentUrl = '';
              row.hasAttachment = false; // 标记无附件
            }
          });

          // 同步五类文件数组，便于预览/下载按钮立即可用
          this.idCardFiles = this.buildFileItem(attachmentsByType[1]);
          this.degreeCertFiles = this.buildFileItem(attachmentsByType[2]);
          this.graduationCertFiles = this.buildFileItem(attachmentsByType[3]);
          this.educationRegFiles = this.buildFileItem(attachmentsByType[4]);
          this.graduationVerifyFiles = this.buildFileItem(attachmentsByType[5]);
        }
      } catch (e) {
        console.warn('loadApplicantAttachments error', e);
      }
    },

    // 构建文件项
    buildFileItem(attachment) {
      if (!attachment) {
        return [];
      }
      return [{
        name: attachment.attachmentName || '附件文件',
        url: this.attachmentViewUrl + attachment.id,
        attachmentId: attachment.id,
        path: attachment.attachmentUrl
      }];
    },

    // 打开附件
    handleTableAttachmentPreview(row) {
      // 应聘者详情页，打开附件信息，跳转到附件详情页
      this.dataFormStatus = 'update';
      this.dataFormTitle = '编辑应聘者';
      this.dataFormVisible = true;
      this.activeTabName = 'basic';
      this.loadApplicantDetail(row.id);
      // 清理待上传的图片数据（编辑时图片上传应该是即时的）
      this.pendingImageFile = null;
      this.pendingImagePreview = '';
      // 切换到 el-tab-pane label="附件信息" name="attachments"
      this.activeTabName = 'attachments';
    },

    // 一键打包下载
    async downloadBatchAttachments(applicantId) {
      // 如果传了applicantId，则设置为当前应聘者ID
      if (applicantId) {
        this.dataForm.id = applicantId;
      } else {
        // 如果没传，则使用当前应聘者ID
        this.dataForm.id = this.dataForm.id;
      }
      if (!this.dataForm.id) {
        ElMessage.error('请先保存应聘者信息');
        return;
      }

      try {
        const response = await axios({
          url: this.attachmentDownloadBatchUrl,
          method: 'POST',
          data: { applicantId: this.dataForm.id },
          responseType: 'blob'
        });

        if (response.data && response.data.size > 0) {
          // 创建下载链接
          const blob = new Blob([response.data], { type: 'application/zip' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);

          // 生成文件名: 姓名_电话_附件打包_时间戳.zip
          const applicantName = this.dataForm.applicantName || '未知';
          const contactPhone = this.dataForm.contactPhone || '未知';
          const currentTime = dayjs().format('YYYYMMDD_HHmmss');
          link.download = `${applicantName}_${contactPhone}_${currentTime}_附件打包.zip`;

          link.click();
          window.URL.revokeObjectURL(link.href);
          ElMessage.success('附件打包下载成功');
        } else {
          ElMessage.warning('该应聘者暂无附件可下载');
        }
      } catch (error) {
        console.error('打包下载失败:', error);
        ElMessage.error('打包下载失败，请重试');
      }
    },

    // 下载单个附件
    async downloadSingleAttachment(attachmentId, fileName) {
      if (!attachmentId) {
        ElMessage.error('附件ID不能为空');
        return;
      }

      try {
        // 使用view接口下载文件，通过创建下载链接的方式
        const downloadUrl = this.attachmentViewUrl + attachmentId;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || '附件文件';
        link.target = '_blank';

        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        ElMessage.success('文件下载成功');
      } catch (error) {
        console.error('下载文件失败:', error);
        ElMessage.error('下载文件失败，请重试');
      }
    },

    // 附件上传
    async handleCustomUpload(event, type) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      // 文件验证
      if (!this.beforeUpload(file)) {
        event.target.value = ''; // 清空input
        return;
      }

      // 判断模式：新增 vs 编辑
      if (!this.dataForm.id) {
        // 新增模式：延迟上传
        await this.handleDelayedAttachmentUpload(file, type);
      } else {
        // 编辑模式：即时上传
        await this.uploadAttachmentBase64(file, type);
      }

      event.target.value = ''; // 清空input
    },

    // 附件上传：纯POST（Base64版本）
    async uploadAttachmentBase64(file, type) {
      if (!this.dataForm.id) {
        ElMessage.error('请先保存应聘者信息');
        return;
      }

      try {
        // 先检查是否已有同类型的附件，如果有则先删除
        const existingRow = this.attachmentTableData.find(r => r.bizKey === type);
        if (existingRow && existingRow.attachmentId) {
          try {
            await this.deleteAttachmentRecord(existingRow.attachmentId);
            ElMessage.info('已删除旧附件，正在上传新附件...');
          } catch (deleteError) {
            ElMessage.error('删除旧附件失败，无法上传新附件');
            return;
          }
        }

        // 将文件转为Base64
        const base64Content = await this.fileToBase64(file);

        // 获取附件类型枚举值和中文名称
        const attachmentTypeMap = {
          'idCard': { code: 1, name: '身份证' },
          'degree': { code: 2, name: '学位证' },
          'graduation': { code: 3, name: '毕业证' },
          'eduReg': { code: 4, name: '学历证书备案表' },
          'gradVerify': { code: 5, name: '毕业证在线验证报告' }
        };

        // 生成自定义文件名: 姓名_电话_附件类型_时间戳
        const currentTime = dayjs().format('YYYYMMDD_HHmmss');
        const applicantName = this.dataForm.applicantName || '未知';
        const contactPhone = this.dataForm.contactPhone || '未知';
        const attachmentTypeName = attachmentTypeMap[type]?.name || '未知';
        const fileExtension = file.name.split('.').pop();
        const customFileName = `${applicantName}_${contactPhone}_${attachmentTypeName}_${currentTime}.${fileExtension}`;

        const uploadData = {
          applicantId: this.dataForm.id,
          attachmentType: attachmentTypeMap[type]?.code || 1,
          fileName: customFileName,
          fileContent: base64Content,
          fileSize: file.size,
          mimeType: file.type,
          biz: this.attachmentBizUrl
        };

        const response = await axios.post(this.attachmentUploadUrl, uploadData);

        if (response.data.code === 2000) {
          const attachment = response.data.data;
          const fileItem = {
            name: attachment.attachmentName,
            url: this.attachmentViewUrl + attachment.id,
            attachmentId: attachment.id,
            path: attachment.attachmentUrl
          };

          // 更新对应的附件列表
          switch (type) {
            case 'idCard':
              this.idCardFiles = [fileItem];
              break;
            case 'degree':
              this.degreeCertFiles = [fileItem];
              break;
            case 'graduation':
              this.graduationCertFiles = [fileItem];
              break;
            case 'eduReg':
              this.educationRegFiles = [fileItem];
              break;
            case 'gradVerify':
              this.graduationVerifyFiles = [fileItem];
              break;
          }

          ElMessage.success('上传成功');
          // 同步表格行的附件ID，使下载/删除按钮生效，上传按钮文案变为"替换"
          const row = this.attachmentTableData.find(r => r.bizKey === type);
          if (row) {
            row.attachmentId = attachment.id;
            row.attachmentName = attachment.attachmentName;
            row.attachmentUrl = attachment.attachmentUrl;
            row.hasAttachment = true;
          }
        } else {
          ElMessage.error(response.data.message || '上传失败');
        }
      } catch (error) {
        console.error('上传附件失败:', error);
        ElMessage.error('上传失败，请重试');
      }
    },

    // 附件上传：文件转Base64
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // 移除data:image/jpeg;base64,前缀，只保留base64内容
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    // 附件删除
    async deleteAttachmentRecord(attachmentId) {
      try {
        // 先找到要删除的附件信息
        const row = this.attachmentTableData.find(r => r.attachmentId === attachmentId);
        if (!row) {
          ElMessage.error('未找到要删除的附件');
          return;
        }

        const resp = await axios.post(this.attachmentDeleteUrl, { id: attachmentId });
        if (resp.data && resp.data.code === 2000) {
          ElMessage.success('删除成功');

          // 更新当前行的状态
          row.attachmentId = null;
          row.attachmentName = '';
          row.attachmentUrl = '';
          row.hasAttachment = false;

          // 同时更新对应的文件数组
          this.updateFileArray(row.bizKey, []);

          // 不需要重新加载整个列表，只更新当前状态即可
        } else {
          ElMessage.error(resp.data.message || '删除失败');
        }
      } catch (e) {
        console.error(e);
        ElMessage.error('删除失败');
      }
    },

    // 更新文件数组
    updateFileArray(type, files) {
      switch (type) {
        case 'idCard':
          this.idCardFiles = files;
          break;
        case 'degree':
          this.degreeCertFiles = files;
          break;
        case 'graduation':
          this.graduationCertFiles = files;
          break;
        case 'eduReg':
          this.educationRegFiles = files;
          break;
        case 'gradVerify':
          this.graduationVerifyFiles = files;
          break;
      }
    },

    //************************************************ 第4部分：附件数据 **************************************************

    // 新增模式：延迟上传处理
    async handleDelayedAttachmentUpload(file, type) {
      try {
        // 检查是否已有同类型待上传文件
        if (this.pendingAttachments[type]) {
          const confirmed = await this.confirmReplaceFile(type);
          if (!confirmed) {
            return;
          }
        }

        // 1. 暂存文件到队列
        this.pendingAttachments[type] = {
          file: file,
          type: type,
          timestamp: Date.now()
        };

        // 2. 更新状态
        this.attachmentUploadStatus[type] = 'pending';

        // 3. 更新表格显示
        this.updateAttachmentTableForPending(type, file);

        ElMessage.success(`${this.getTypeLabel(type)}已选择，将在保存后自动上传`);
      } catch (error) {
        console.error('延迟上传处理失败:', error);
        ElMessage.error('文件处理失败');
      }
    },

    // 更新表格显示为待上传状态
    updateAttachmentTableForPending(type, file) {
      const row = this.attachmentTableData.find(r => r.bizKey === type);
      if (row) {
        row.isPending = true;
        row.uploadStatus = 'pending';
        row.attachmentName = file.name;
        row.hasAttachment = false; // 还未真正上传，不能下载
      }
    },

    // 确认替换文件
    async confirmReplaceFile(type) {
      const typeLabel = this.getTypeLabel(type);
      try {
        await ElMessageBox.confirm(
          `已选择了${typeLabel}文件，是否替换？`,
          '确认替换',
          {
            type: 'warning',
            confirmButtonText: '替换',
            cancelButtonText: '取消'
          }
        );
        return true;
      } catch {
        return false;
      }
    },

    // 获取类型标签
    getTypeLabel(type) {
      return this.attachmentTypeMap[type]?.name || '附件';
    },

    // 获取待上传文件数量
    getPendingAttachmentsCount() {
      return Object.values(this.pendingAttachments).filter(item => item !== null).length;
    },

    // 清空待上传队列
    clearPendingAttachments() {
      this.pendingAttachments = {
        idCard: null,
        degree: null,
        graduation: null,
        eduReg: null,
        gradVerify: null
      };

      // 重置状态
      Object.keys(this.attachmentUploadStatus).forEach(key => {
        this.attachmentUploadStatus[key] = 'none';
      });

      // 更新表格状态
      this.attachmentTableData.forEach(row => {
        row.isPending = false;
        row.uploadStatus = 'none';
      });
    },

    // 重置附件表格数据
    resetAttachmentTableData() {
      this.attachmentTableData.forEach(row => {
        row.attachmentId = null;
        row.hasAttachment = false;
        row.attachmentName = '';
        row.attachmentUrl = '';
        row.isPending = false;
        row.uploadStatus = 'none';
      });
    },

    // 处理所有待上传附件
    async processPendingAttachments() {
      const pendingCount = this.getPendingAttachmentsCount();
      if (pendingCount === 0) {
        return;
      }

      ElMessage.info(`正在上传 ${pendingCount} 个附件...`);

      for (const [type, fileInfo] of Object.entries(this.pendingAttachments)) {
        if (fileInfo) {
          try {
            await this.uploadPendingAttachment(type, fileInfo);
          } catch (error) {
            console.error(`上传 ${type} 附件失败:`, error);
            this.attachmentUploadStatus[type] = 'error';
          }
        }
      }
    },

    // 上传单个待上传附件
    async uploadPendingAttachment(type, fileInfo) {
      this.attachmentUploadStatus[type] = 'uploading';

      // 更新表格状态
      const row = this.attachmentTableData.find(r => r.bizKey === type);
      if (row) {
        row.uploadStatus = 'uploading';
      }

      try {
        const base64Content = await this.fileToBase64(fileInfo.file);

        // 生成自定义文件名: 姓名_电话_附件类型_时间戳
        const currentTime = dayjs().format('YYYYMMDD_HHmmss');
        const applicantName = this.dataForm.applicantName || '未知';
        const contactPhone = this.dataForm.contactPhone || '未知';
        const attachmentTypeName = this.attachmentTypeMap[type]?.name || '未知';
        const fileExtension = fileInfo.file.name.split('.').pop();
        const customFileName = `${applicantName}_${contactPhone}_${attachmentTypeName}_${currentTime}.${fileExtension}`;

        const uploadData = {
          applicantId: this.dataForm.id,
          attachmentType: this.attachmentTypeMap[type]?.code || 1,
          fileName: customFileName,
          fileContent: base64Content,
          fileSize: fileInfo.file.size,
          mimeType: fileInfo.file.type,
          biz: this.attachmentBizUrl
        };

        const response = await axios.post(this.attachmentUploadUrl, uploadData);

        if (response.data.code === 2000) {
          const attachment = response.data.data;

          // 更新状态为成功
          this.attachmentUploadStatus[type] = 'success';

          // 更新表格数据
          if (row) {
            row.attachmentId = attachment.id;
            row.attachmentName = attachment.attachmentName;
            row.attachmentUrl = attachment.attachmentUrl;
            row.hasAttachment = true;
            row.isPending = false;
            row.uploadStatus = 'success';
          }

          // 更新文件数组
          const fileItem = {
            name: attachment.attachmentName,
            url: this.attachmentViewUrl + attachment.id,
            attachmentId: attachment.id,
            path: attachment.attachmentUrl
          };
          this.updateFileArray(type, [fileItem]);

          // 清除待上传文件
          this.pendingAttachments[type] = null;

          ElMessage.success(`${this.getTypeLabel(type)}上传成功`);
        } else {
          throw new Error(response.data.message || '上传失败');
        }
      } catch (error) {
        this.attachmentUploadStatus[type] = 'error';
        if (row) {
          row.uploadStatus = 'error';
        }
        throw error;
      }
    },

    // 获取附件状态显示文本
    getAttachmentStatusText(type) {
      const status = this.attachmentUploadStatus[type];

      // 编辑模式下，如果有附件且状态为none，显示为已上传
      if (this.dataForm.id && status === 'none') {
        const row = this.attachmentTableData.find(r => r.bizKey === type);
        if (row && row.hasAttachment) {
          return '已上传';
        } else {
          return '未上传';
        }
      }

      const statusMap = {
        'none': '未上传',
        'pending': '待上传',
        'uploading': '上传中...',
        'success': '已上传',
        'error': '上传失败'
      };
      return statusMap[status] || '未上传';
    },

    // 获取状态样式类
    getAttachmentStatusClass(type) {
      const status = this.attachmentUploadStatus[type];

      // 编辑模式下，如果有附件且状态为none，显示为成功样式，否则显示未上传样式
      if (this.dataForm.id && status === 'none') {
        const row = this.attachmentTableData.find(r => r.bizKey === type);
        if (row && row.hasAttachment) {
          return { 'status-success': true };
        } else {
          return { 'status-not-uploaded': true };
        }
      }

      return {
        'status-not-uploaded': status === 'none',
        'status-pending': status === 'pending',
        'status-uploading': status === 'uploading',
        'status-success': status === 'success',
        'status-error': status === 'error'
      };
    },

    //************************************************ 第5部分：分配操作 **************************************************

    // 分配按钮是否可用 (仅待分配状态可分配)
    canAllocate(auditStatus) {
      return auditStatus && auditStatus.key === 1;
    },

    // 审核按钮是否可用 (待分配状态可审核)
    canAudit(auditStatus) {
      return auditStatus && auditStatus.key === 1;
    },

    // 撤回审核按钮是否可用 (等待面试状态可撤回审核)
    canWithdrawAudit(auditStatus) {
      return auditStatus && auditStatus.key === 2;
    },

    // 分配
    async fun_operation(row) {
      this.currentOperationRow = { ...row };
      this.operationForm = {
        applicantId: row.id,        // 应聘者ID
        applyPosition: row.applyPosition || '', // 应聘岗位
        assignedDept: '',           // 分配部门
        assignedUser: '',           // 分配人
        assignedDate: '',           // 分配日期
        assignedReason: ''          // 分配说明
      };

      // 调用分配列表API获取相关数据
      try {
        const response = await axios({
          url: this.allocateDetail,
          method: 'POST',
          data: { applicantId: row.id }
        });

        if (response.data.code === 2000) {
          // 预填充分配表单数据
          const assignData = response.data.data;
          if (assignData) {
            // 如果有历史分配记录，预填充相关字段
            if (assignData.assignedUser) {
              this.operationForm.assignedUser = assignData.assignedUser;
            }
            if (assignData.assignedDept) {
              this.operationForm.assignedDept = assignData.assignedDept;
            }
            if (assignData.assignedReason) {
              this.operationForm.assignedReason = assignData.assignedReason;
            }
            if (assignData.assignedDate) {
              this.operationForm.assignedDate = assignData.assignedDate;
            }
            // 可以根据业务需求添加更多预填充逻辑
            console.log('分配数据预填充完成:', assignData);
          } else {
            console.log('无历史分配数据，使用默认值');
          }
        }
      } catch (error) {
        console.error('获取分配数据失败:', error);
      }

      this.operationDialogVisible = true;
    },

    // 保存分配
    async fun_saveOperation() {
      try {
        const valid = await this.$refs.assignFormRef.validate();
        if (!valid) {
          ElMessage.warning('请检查分配信息');
          return;
        }

        this.loading = true;
        const response = await axios({
          url: this.allocateUpdate,
          method: 'POST',
          data: { ...this.operationForm, applicantId: this.currentOperationRow.id }
        });

        if (response.data.code === 2000) {
          ElMessage.success('分配成功');
          this.operationDialogVisible = false;
          this.query();
        } else {
          ElMessage.error(response.data.message || '分配失败');
        }
        this.loading = false;
      } catch (error) {
        ElMessage.error('分配失败');
        console.error('分配失败:', error);
        this.loading = false;
      }
    },

    // 审核
    async fun_audit(row) {
      try {
        await ElMessageBox.confirm(
          '确认审核通过该应聘者吗？',
          '审核确认',
          {
            type: 'warning',
            confirmButtonText: '确认审核',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const response = await axios({
          url: this.allocateAudit,
          method: 'POST',
          data: { applicantId: row.id, auditStatus: 2 } // 等待面试
        });

        if (response.data.code === 2000) {
          ElMessage.success('审核成功');
          this.query();
        } else {
          ElMessage.error(response.data.message || '审核失败');
        }
        this.loading = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('审核失败');
          console.error('审核失败:', error);
        }
        this.loading = false;
      }
    },

    // 撤回审核
    async fun_withdrawAudit(row) {
      try {
        await ElMessageBox.confirm(
          '确认撤回该应聘者的审核状态吗？',
          '撤回确认',
          {
            type: 'warning',
            confirmButtonText: '确认撤回',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const response = await axios({
          url: this.allocateWithdrawAudit,
          method: 'POST',
          data: { applicantId: row.id }
        });

        if (response.data.code === 2000) {
          ElMessage.success('撤回审核成功');
          this.query();
        } else {
          ElMessage.error(response.data.message || '撤回审核失败');
        }
        this.loading = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('撤回审核失败');
          console.error('撤回审核失败:', error);
        }
        this.loading = false;
      }
    },

    //************************************************ 区域：辅助方法 *****************************************************

    // 枚举：政治面貌
    getPoliticalStatusTagType(key) {
      const typeMap = { 1: 'danger', 2: 'primary', 3: 'info' };
      return typeMap[key] || 'info';
    },

    // 枚举：外语水平
    getForeignLanguageTagType(key) {
      const typeMap = { 1: 'info', 2: 'success', 3: 'primary', 4: 'warning', 5: 'danger', 6: 'danger', 7: 'danger' };
      return typeMap[key] || 'info';
    },

    // 枚举：审核状态
    getAuditStatusTagType(key) {
      const typeMap = {
        1: 'warning',   // 待分配 - 橙色
        2: 'primary',   // 等待面试 - 蓝色
      };
      return typeMap[key] || 'info';
    },

    // 绑定表单验证器
    bindFormValidators() {
      // 绑定工作经历验证器
      this.workExperienceFormRules.startDate.push({
        validator: this.validateWorkExperienceDate,
        trigger: 'change'
      });
      this.workExperienceFormRules.endDate.push({
        validator: this.validateWorkExperienceDate,
        trigger: 'change'
      });

      // 绑定培训经历验证器
      this.trainingFormRules.startDate.push({
        validator: this.validateTrainingDate,
        trigger: 'change'
      });
      this.trainingFormRules.endDate.push({
        validator: this.validateTrainingDate,
        trigger: 'change'
      });

      // 绑定学习经历验证器
      this.educationFormRules.startDate.push({
        validator: this.validateEducationDate,
        trigger: 'change'
      });
      this.educationFormRules.endDate.push({
        validator: this.validateEducationDate,
        trigger: 'change'
      });
    },

    // 验证开始时间不能大于结束时间
    validateDateRange(startDate, endDate, fieldName = '时间') {
      if (!startDate || !endDate) {
        return true; // 如果其中一个为空，跳过验证（由required规则处理）
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return `开始${fieldName}不能大于结束${fieldName}`;
      }

      return true;
    },

    // 工作经历时间验证器
    validateWorkExperienceDate(rule, value, callback) {
      const startDate = this.workExperienceForm.startDate;
      const endDate = this.workExperienceForm.endDate;

      const result = this.validateDateRange(startDate, endDate, '时间');
      if (result === true) {
        callback();
      } else {
        callback(new Error(result));
      }
    },

    // 培训经历时间验证器
    validateTrainingDate(rule, value, callback) {
      const startDate = this.trainingForm.startDate;
      const endDate = this.trainingForm.endDate;

      const result = this.validateDateRange(startDate, endDate, '时间');
      if (result === true) {
        callback();
      } else {
        callback(new Error(result));
      }
    },

    // 学习经历时间验证器
    validateEducationDate(rule, value, callback) {
      const startDate = this.educationForm.startDate;
      const endDate = this.educationForm.endDate;

      const result = this.validateDateRange(startDate, endDate, '时间');
      if (result === true) {
        callback();
      } else {
        callback(new Error(result));
      }
    },

    // 格式化日期
    formatDate(date) {
      if (!date) {
        return '-';
      }
      return dayjs(date).format('YYYY-MM-DD');
    },

    // 窗口大小监听
    handleResize() {
      this.dataTableHeight = window.innerHeight - 176;
      window.addEventListener('resize', this.handleResize);
    },
  }
};