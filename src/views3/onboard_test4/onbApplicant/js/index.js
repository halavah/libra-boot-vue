import { ArrowDown, Search, Refresh, Plus, Upload, Download, Delete, Setting, CirclePlus, CircleClose, Loading } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import regionsData from './regions.json';
import { markRaw } from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';

// 调试用户
const debugUser = 'demo-user';
//const debugUser = 'demo-user';

export default {
  name: 'onbApplicant',

  props: {
    // 页面类型
    // 0: 全部状态
    // 1: onbAllocate，分配页面
    // 2: onbEvaluate，评估页面
    // 3: onbOffer，录用页面
    pageType: {
      type: [String, Number],
      default: 0,
      validator: (value) => [0, 1, 2, 3, '0', '1', '2', '3'].includes(value)
    }
  },

  components: {
    ArrowDown: markRaw(ArrowDown),
    Search: markRaw(Search),
    Refresh: markRaw(Refresh),
    Plus: markRaw(Plus),
    Upload: markRaw(Upload),
    Download: markRaw(Download),
    Delete: markRaw(Delete),
    Setting: markRaw(Setting),
    CirclePlus: markRaw(CirclePlus),
    CircleClose: markRaw(CircleClose),
    Loading: markRaw(Loading)
  },

  data() {

    // 环境变量调试
    const baseUrl = '/' + import.meta.env.MODE + '-api';
    console.log('=== 环境变量调试 ===');
    console.log('1. import.meta.env.MODE:', import.meta.env.MODE);
    console.log('2. baseUrl 计算结果:', baseUrl);
    console.log('3. 完整 import.meta.env:', import.meta.env);
    console.log('==================');

    return {

      //************************************************** 第0部分：权限控制 **************************************************

      // 权限相关数据
      hasPageAccess: false,      // 页面访问权限
      permissionLevel: 'NONE',   // 权限级别: FULL, PARTIAL, NONE
      permissionLoading: true,   // 权限加载状态
      permissionCache: null,     // 权限缓存

      // 按钮权限配置
      BUTTON_PERMISSIONS: {
        FULL: {
          query: true,      // 查询
          add: true,        // 新增应聘者
          edit: true,       // 编辑应聘者
          delete: true,     // 删除应聘者
          export: true,     // 导出应聘者列表
          import: true,     // 导入应聘者
          allocate: true,   // 分配应聘者
          recycleBin: true  // 回收站
        },
        PARTIAL: {
          query: true,      // 查询
          add: false,       // 新增
          edit: false,      // 编辑
          delete: false,    // 删除
          export: true,     // 导出
          import: false,    // 导入
          allocate: false,  // 分配
          recycleBin: false // 回收站
        }
      },

      //************************************************** 第1部分：路径 **************************************************

      // 请求路径：枚举
      sysAttrListUrl: baseUrl + '/onboard/sys/attr/list', // GET请求
      // 请求路径：主表
      applicantListUrl: baseUrl + '/onboard/applicant/person/page', // POST请求 - 后端分页
      applicantDetailUrl: baseUrl + '/onboard/applicant/person/detail', // POST请求
      applicantInsertUrl: baseUrl + '/onboard/applicant/person/insert', // POST请求
      applicantUpdateUrl: baseUrl + '/onboard/applicant/person/update', // POST请求
      applicantDeleteUrl: baseUrl + '/onboard/applicant/person/delete', // POST请求
      applicantDeleteBatchUrl: baseUrl + '/onboard/applicant/person/deleteBatch', // POST请求 批量删除/恢复
      applicantExportUrl: baseUrl + '/onboard/applicant/person/export', // POST请求
      // 请求路径：子表
      applicantWorkListUrl: baseUrl + '/onboard/applicant/work/list', // POST请求
      applicantWorkInsertUrl: baseUrl + '/onboard/applicant/work/insert', // POST请求
      applicantWorkUpdateUrl: baseUrl + '/onboard/applicant/work/update', // POST请求
      applicantWorkDeleteUrl: baseUrl + '/onboard/applicant/work/delete', // POST请求
      applicantEducationListUrl: baseUrl + '/onboard/applicant/education/list', // POST请求
      applicantEducationInsertUrl: baseUrl + '/onboard/applicant/education/insert', // POST请求
      applicantEducationUpdateUrl: baseUrl + '/onboard/applicant/education/update', // POST请求
      applicantEducationDeleteUrl: baseUrl + '/onboard/applicant/education/delete', // POST请求
      applicantFamilyListUrl: baseUrl + '/onboard/applicant/family/list', // POST请求
      applicantFamilyInsertUrl: baseUrl + '/onboard/applicant/family/insert', // POST请求
      applicantFamilyUpdateUrl: baseUrl + '/onboard/applicant/family/update', // POST请求
      applicantFamilyDeleteUrl: baseUrl + '/onboard/applicant/family/delete', // POST请求
      applicantTrainingListUrl: baseUrl + '/onboard/applicant/training/list', // POST请求
      applicantTrainingInsertUrl: baseUrl + '/onboard/applicant/training/insert', // POST请求
      applicantTrainingUpdateUrl: baseUrl + '/onboard/applicant/training/update', // POST请求
      applicantTrainingDeleteUrl: baseUrl + '/onboard/applicant/training/delete', // POST请求
      // 请求路径：图片
      imageBizUrl: 'photo', // 存放子文件夹，Biz代表业务，比如照片、附件等
      imageViewUrl: baseUrl + '/onboard/applicant/image/view/', // GET请求
      imageUploadUrl: baseUrl + '/onboard/applicant/image/upload', // POST请求
      // 请求路径：附件
      attachmentBizUrl: 'attachment', // 存放子文件夹，Biz代表业务，比如照片、附件等
      attachmentViewUrl: baseUrl + '/onboard/applicant/attachment/view/', // GET请求 - 用于查看/下载单个附件
      attachmentListUrl: baseUrl + '/onboard/applicant/attachment/list', // POST请求
      attachmentUploadUrl: baseUrl + '/onboard/applicant/attachment/upload', // POST请求
      attachmentDeleteUrl: baseUrl + '/onboard/applicant/attachment/delete', // POST请求
      attachmentDownloadBatchUrl: baseUrl + '/onboard/applicant/attachment/downloadBatch', // POST请求
      // 请求路径：岗位
      positionJobUrl: baseUrl + '/onboard/sys/positionJob/page', // POST请求 - 后端分页
      // 请求路径：权限检查
      checkPermission: baseUrl + '/onboard/sys/personInfo/checkPermission', // POST请求

      //************************************************** 第1部分：属性 **************************************************

      // 通用-属性
      attrLists: {
        // 1. 个人信息相关枚举
        // 1.1 性别
        genderOptions: [],
        // 1.2 政治面貌
        politicalStatusOptions: [],
        // 1.3 婚否
        maritalStatusOptions: [],
        // 1.4 血型
        bloodTypeOptions: [],
        // 1.5 外语水平
        foreignLanguageLevelOptions: [],
        // 1.6 是否退伍军人
        isVeteranOptions: [],
        // 1.7 院校类别
        schoolNatureOptions: [],
        // 1.8 是否同意调休
        agreeShiftWorkOptions: [],
        // 1.9 是否需要住宿
        needAccommodationOptions: [],
        // 1.10 学历
        educationLevelOptions: [],
        // 1.11 民族
        nationOptions: [],
        // 1.12 国家
        countryOptions: [],
        // 1.13 户口关系
        householdRelationOptions: [],
        // 1.14 与本人关系
        relationshipOptions: [],
        // 2. 面试相关枚举
        // 2.1 面试状态 (动态根据 pageType 计算)
        allStatusOptions: []
      },

      //************************************************** 第2部分：主表 **************************************************

      // 加载状态
      loading: false,
      dataFormLoading: false,

      // 筛选-表单
      searchFormRules: {},

      // 筛选-表格
      selectionRows: [],
      currentRow: {},

      // 筛选-表格-分页
      dataTableHeight: window.innerHeight - 176,
      pageSizes: [10, 15, 25, 35, 50, 100],
      pageSize: 10,
      currentPage: 1,
      dataTotal: 0,

      // 筛选-表格-弹框表单
      dataFormTitle: '详情',
      dataFormVisible: false,
      dataFormStatus: '',

      // 标签页
      activeTabName: 'basic',
      // 标签页加载状态跟踪（延迟加载）
      tabsLoadedState: {
        basic: false,       // 基本信息
        work: false,        // 工作经历
        training: false,    // 培训经历
        family: false,      // 家庭情况
        education: false,   // 学习经历
        medical: false,     // 病史类别
        attachments: false  // 附件信息
      },

      // 分配弹框
      operationDialogVisible: false,
      currentOperationRow: {},

      // 回收站弹框
      recycleBinDialogVisible: false,
      recycleLoading: false,
      recycleSelectionRows: [],
      // 回收站跨页勾选数量（用于按钮禁用判断）
      recycleSelectedCount: 0,
      // 持久化选择ID集合
      recycleSelectionIds: new Set(),

      // 子表弹框
      workExperienceDialogVisible: false,
      workExperienceDialogTitle: '新增工作经历',
      currentWorkExperienceIndex: -1,

      trainingDialogVisible: false,
      trainingDialogTitle: '新增培训经历',
      currentTrainingIndex: -1,

      familyDialogVisible: false,
      familyDialogTitle: '新增家庭情况',
      currentFamilyIndex: -1,

      educationDialogVisible: false,
      educationDialogTitle: '新增学习经历',
      currentEducationIndex: -1,

      // PageType 相关 - 在 created() 钩子中初始化
      currentPageType: '0',

      // 作用域插槽方法组合对象 - 在 created() 中初始化
      searchMethods: null,
      tableConfig: null,
      tableHelpers: null,
      tableActions: null,
      dataMethods: null,
      attachmentMethods: null,

      // 图标组件 - Vue2 需要在 data 中声明
      ArrowDown: ArrowDown,
      Search: Search,
      Refresh: Refresh,
      Plus: Plus,
      Upload: Upload,
      Download: Download,
      Delete: Delete,
      Setting: Setting,
      CirclePlus: CirclePlus,
      CircleClose: CircleClose,

      // 筛选框展开/收起状态
      searchExpanded: false,
      // 搜索表单 ref
      searchFormRef: null,
      // 主表查询
      searchForm: {
        applicantName: '',     // 姓名
        gender: null,          // 性别
        birthDate: '',         // 出生日期
        contactPhone: '',      // 联系电话
        idCardNo: '',          // 身份证号
        politicalStatus: null, // 政治面貌
        highestEducationLevel: null, // 最高学历
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
        applyPosition: '',     // 应聘岗位（保存：岗位编码）
        applyPositionName: '', // 应聘岗位显示名（显示：岗位名称）
        photoUrl: '',          // 照片URL
        gender: "M",           // 性别 - 默认：男
        birthDate: '',         // 出生日期
        nation: "01",          // 民族 - 默认：汉族
        politicalStatus: "12", // 政治面貌 - 默认：群众
        maritalStatus: "02",   // 婚否 - 默认：未婚
        height: null,          // 身高
        weight: null,          // 体重
        visionLeft: '',        // 视力左
        visionRight: '',       // 视力又
        bloodType: "A",        // 血型 - 默认：A型
        professionalTitle: '', // 职称
        foreignLanguageLevel: "01", // 外语等级 - 默认：一般
        foreignLanguageScore: null, // 外语分数
        contactPhone: '',      // 联系电话
        idCardNo: '',          // 身份证号
        availableDate: '',     // 可报到日期
        country: "001",        // 国家 - 默认：中国
        householdRelation: "01", // 户口关系 - 默认：农村户口
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
        otherHistory: '无',             // 其他史 - 默认：无
        noHistoryStatement: '本人无任何病史', // 无病史声明 - 默认：本人无任何病史
        // 备注
        applicationChannels: [],   // 应聘途径
        agreeShiftWork: "0",       // 是否同意轮班工作 - 默认：否
        needAccommodation: "0",    // 是否需要住宿 - 默认：否
        // 申明
        signature: '',             // 本人签字
        fillDate: '',              // 填表时间
      },
      // 主表验证
      dataFormRules: {
        // 红色必填字段
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
        ],
        country: [
          { required: true, message: '请选择国籍', trigger: 'change' }
        ],
        nation: [
          { required: true, message: '请选择民族', trigger: 'change' }
        ],
        availableDate: [
          { required: true, message: '请选择可报道时间', trigger: 'change' }
        ],
        isVeteran: [
          { required: true, message: '请选择是否退役军人', trigger: 'change' }
        ],
        // 红色必填的身高和体重
        height: [
          { required: true, message: '请输入身高', trigger: 'blur' },
          { type: 'number', min: 100, max: 250, message: '身高应在100-250cm之间', trigger: 'blur' }
        ],
        weight: [
          { required: true, message: '请输入体重', trigger: 'blur' },
          { type: 'number', min: 30, max: 200, message: '体重应在30-200kg之间', trigger: 'blur' }
        ],
        visionLeft: [
          { required: true, message: '请输入视力左', trigger: 'blur' },
          { pattern: /^(?:[0-9]|[0-9]\.[0-9])$/, message: '视力格式不正确，如：5 或 5.0', trigger: 'blur' }
        ],
        visionRight: [
          { required: true, message: '请输入视力右', trigger: 'blur' },
          { pattern: /^(?:[0-9]|[0-9]\.[0-9])$/, message: '视力格式不正确，如：5 或 5.0', trigger: 'blur' }
        ],
        // 退役军人条件验证
        dischargeDate: [
          {
            validator: (rule, value, callback) => {
              if (this.dataForm.isVeteran == 1) {
                if (!value) {
                  callback(new Error('退役军人必须填写退役时间'));
                } else {
                  callback();
                }
              } else {
                callback();
              }
            },
            trigger: 'change'
          }
        ],
        dischargeCertNo: [
          {
            validator: (rule, value, callback) => {
              if (this.dataForm.isVeteran == 1) {
                if (!value || value.trim() === '') {
                  callback(new Error('退役军人必须填写退役编号'));
                } else {
                  // 验证退役证编号格式
                  // 格式要求：6-30位，允许字母、数字、汉字、连字符
                  const certPattern = /^[0-9A-Za-z\u4e00-\u9fa5-]{6,30}$/;
                  if (!certPattern.test(value.trim())) {
                    callback(new Error('退役编号格式不正确(6-30位字母/数字/汉字)'));
                  } else {
                    callback();
                  }
                }
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
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
        ],
        referenceContact: [
          { validator: this.validatePhoneNumber, trigger: 'blur' }
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
        ],
        contactPhone: [
          { validator: this.validatePhoneNumber, trigger: 'blur' }
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

      //************************************************** 第6部分：岗位选择弹窗 *******************************************

      // 岗位选择弹窗显隐
      positionSelectDialogVisible: false,
      positionSelectLoading: false,
      // 岗位搜索表单
      positionSearchForm: {
        deptName: '',
        deptNo: '',
        positionName: '',
        positionNo: '',
        openFlag: 'Y'  // 默认选择"是"
      },
      // 岗位列表与分页
      positionList: [],
      positionPageSizes: [10, 15, 25, 35, 50, 100],
      positionPageSize: 10,
      positionCurrentPage: 1,
      positionTotal: 0,
      // 当前选中的岗位行
      positionSelectedRow: null,

    };
  },

  computed: {
    // ==================== 权限相关计算属性 ====================

    /**
     * 计算属性：按钮可见性映射
     */
    buttonVisibility() {
      if (this.permissionLevel === 'FULL') {
        return this.BUTTON_PERMISSIONS.FULL;
      } else if (this.permissionLevel === 'PARTIAL') {
        return this.BUTTON_PERMISSIONS.PARTIAL;
      } else {
        // 无权限时，所有按钮不可见
        const allButtons = this.BUTTON_PERMISSIONS.FULL;
        const noPermissions = {};
        Object.keys(allButtons).forEach(key => {
          noPermissions[key] = false;
        });
        return noPermissions;
      }
    },

    // ==================== 原有计算属性 ====================

    // 已移除前端分页逻辑，使用后端分页
    // dataList 直接来自后端返回的当前页数据
    // 获取当前应该显示的图片URL
    currentPhotoUrl() {
      // 如果有待上传的预览图片，优先显示预览
      if (this.pendingImagePreview) {
        return this.pendingImagePreview;
      }
      // 否则显示正常的图片URL
      return this.dataForm.photoUrl;
    },
    // 动态计算状态选项 (根据 pageType)
    dynamicStatusOptions() {
      return this.getFilteredStatusOptions(this.currentPageType);
    }
    // 已移除 recyclePagedData，改用后端分页
  },

  created() {
    // 初始化 pageType
    this.currentPageType = this.normalizePageType(this.pageType);

    // 初始化作用域插槽方法组合 - 只创建一次，避免无限递归
    this.searchMethods = {
      handleSearch: this.handleSearch,
      handleReset: this.fun_reset,
      toggleSearchExpanded: this.toggleSearchExpanded
    };

    this.tableConfig = {
      handleSelectionChange: this.handleSelectionChange,
      handleCurrentChange: this.handleCurrentChange,
      handleSizeChange: this.handleSizeChange
    };

    this.tableHelpers = {
      formatDate: this.formatDate,
      getAuditStatusTagType: this.getAuditStatusTagType,
      handleTablePhotoPreview: this.handleTablePhotoPreview,
      getEnumLabel: this.getEnumLabel
    };

    this.tableActions = {
      handleCreate: this.fun_create,
      handleDetail: this.fun_detail,
      handleUpdate: this.fun_update,
      handleDelete: (row) => this.fun_delete(row.id),  // 修复：传递 row.id 而不是整个 row
      handleSave: this.fun_save,
      openAttachmentsTab: this.openAttachmentTab,
      downloadBatchAttachments: this.downloadBatchAttachments
    };

    this.dataMethods = {
      exportData: this.fun_export,
      openRecycleBin: this.fun_recycleBin,
      refreshData: this.query
    };

    this.attachmentMethods = {
      downloadBatchAttachments: this.downloadBatchAttachmentsInternal,
      handleTableAttachmentPreview: this.handleTableAttachmentPreview
    };
  },

  async mounted() {
    // ==================== 权限检查（最优先）====================
    await this.checkPageAccess();

    // 如果没有页面访问权限，不执行后续初始化逻辑
    if (!this.hasPageAccess) {
      return;
    }

    // ==================== 原有初始化逻辑 ====================
    // 初始化 pageType 相关状态选项
    this.attrLists.allStatusOptions = this.getFilteredStatusOptions(this.currentPageType);

    // 初始化搜索表单 ref（在下一个 tick 后才能访问到 ref）
    this.$nextTick(() => {
      this.searchFormRef = this.$refs.searchFormRef;
    });

    // 拉取枚举（先执行，等待完成）
    await this.fetchAttrList();
    // 查询数据（等枚举加载完成后再查询）
    this.query();
    // 监听窗口变化
    this.handleResize();
    // 绑定表单验证器
    this.bindFormValidators();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {

    //************************************************ 第0部分：权限控制方法 *****************************************************

    // 页面访问权限检查
    async checkPageAccess() {
      // 1. 检查缓存
      if (this.permissionCache) {
        this.hasPageAccess = this.permissionCache.hasAccess;
        this.permissionLevel = this.permissionCache.level;
        this.permissionLoading = false;
        return;
      }

      try {
        this.permissionLoading = true;

        // 固定当前用户为 admin
        const currentUser = debugUser;

        // admin 用户直接赋予完全权限
        this.hasPageAccess = true;
        this.permissionLevel = 'FULL';
        // 缓存结果
        this.permissionCache = { hasAccess: true, level: 'FULL' };

        // 3. 调用后端 API 检查权限
        const response = await axios({
          url: this.checkPermission,
          method: 'POST',
          data: { userNo: currentUser }
        });

        if (response && response.data.code === 2000 && response.data.data) {
          const data = response.data.data;

          if (data.hasAccess) {
            this.hasPageAccess = true;

            // 4. 根据 oepn_flag 确定权限级别
            if (data.oepnFlag === 'Y') {
              this.permissionLevel = 'FULL';
            } else if (data.oepnFlag === 'N') {
              this.permissionLevel = 'PARTIAL';
            } else {
              // oepn_flag 值异常
              this.hasPageAccess = false;
              this.permissionLevel = 'NONE';
              ElMessage.error('权限数据异常，请联系管理员');
            }

            // 缓存结果
            this.permissionCache = {
              hasAccess: this.hasPageAccess,
              level: this.permissionLevel
            };
          } else {
            // 用户不在 OnbOrgPersonInfo 表中
            this.hasPageAccess = false;
            this.permissionLevel = 'NONE';
            ElMessage.error('您没有访问此页面的权限');
          }
        } else {
          // API 返回失败
          this.hasPageAccess = false;
          this.permissionLevel = 'NONE';
          ElMessage.error('权限验证失败，请稍后重试');
        }
      } catch (error) {
        console.error('权限检查失败:', error);
        this.hasPageAccess = false;
        this.permissionLevel = 'NONE';
        ElMessage.error('权限验证失败，请稍后重试');
      } finally {
        this.permissionLoading = false;
      }
    },

    // 单个按钮权限检查方法
    canPerform(action) {
      return this.buttonVisibility[action] === true;
    },

    //************************************************ 第1部分：PageType 处理工具 *****************************************************

    // pageType 标准化处理
    normalizePageType(val) {
      const pageTypeMap = {
        0: '0', 1: '1', 2: '2', 3: '3',
      };
      return pageTypeMap[val] || '0';
    },

    // 根据 pageType 获取筛选状态选项
    getFilteredStatusOptions(pageType) {
      pageType = pageType || this.currentPageType;
      const statusOptionsMap = {
        '0': [
          { key: 1, value: '待分配' },
          { key: 2, value: '等待面试' },
          { key: 3, value: '面试审核中' },
          { key: 4, value: '面试通过' },
          { key: 5, value: '面试失败' },
          { key: 6, value: '录用审核中' },
          { key: 7, value: '录用通过' },
          { key: 8, value: '录用失败' }
        ],
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
      };
      return statusOptionsMap[pageType] || statusOptionsMap['0'];
    },

    // 根据 pageType 获取审核状态标签类型
    getAuditStatusTagType(key, pageType) {
      // 如果 key 是对象，提取其 key 属性
      const actualKey = (typeof key === 'object' && key !== null) ? key.key : key;

      // 确保 pageType 有值
      const currentPage = pageType || this.currentPageType;

      const typeMap = {
        '0': { // 全部状态
          '1': 'warning',    // 待分配 - 橙色
          '2': 'primary',    // 等待面试 - 蓝色
          '3': 'warning',    // 面试审核中 - 橙色
          '4': 'success',    // 面试通过 - 绿色
          '5': 'danger',     // 面试不通过 - 红色
          '6': 'warning',    // 入职审核中 - 橙色
          '7': 'success',    // 入职通过 - 绿色
          '8': 'danger'      // 入职不通过 - 红色
        },
        '1': { // 应聘登记
          '1': 'warning',    // 待分配 - 橙色
          '2': 'primary'     // 等待面试 - 蓝色
        },
        '2': { // 面试评估
          '2': 'primary',    // 等待面试 - 蓝色
          '3': 'warning',    // 面试审核中 - 橙色
          '4': 'success',    // 面试通过 - 绿色
          '5': 'danger'      // 面试不通过 - 红色
        },
        '3': { // 录用反馈
          '4': 'primary',    // 面试通过 - 蓝色
          '6': 'warning',    // 入职审核中 - 橙色
          '7': 'success',    // 入职通过 - 绿色
          '8': 'danger'      // 入职不通过 - 红色
        }
      };

      const pageMap = typeMap[currentPage];
      if (pageMap && typeof pageMap[actualKey] !== 'undefined') {
        return pageMap[actualKey];
      }

      // 默认返回 'primary' (蓝色)
      return 'primary';
    },

    // 构建 API 查询参数（根据 pageType 添加相应日期字段）
    buildQueryParams(searchForm, pageType) {
      pageType = pageType || this.currentPageType;
      const baseParams = {
        pageType: pageType,
        page: pageType, // 兼容旧实现
        deletedFlag: '0',
        // 基础筛选字段
        applicantName: searchForm.applicantName || null,
        contactPhone: searchForm.contactPhone || null,
        idCardNo: searchForm.idCardNo || null,
        applyPosition: searchForm.applyPosition || null,
        assignedUser: searchForm.assignedUser || null,
        gender: searchForm.gender,
        politicalStatus: searchForm.politicalStatus,
        foreignLanguageLevel: searchForm.foreignLanguageLevel,
        highestEducationLevel: searchForm.highestEducationLevel,
        auditStatus: searchForm.auditStatus,
        birthDate: searchForm.birthDate || null
      };

      // 根据 pageType 添加特定日期字段
      if (pageType === '0') {
        // 全部状态：包含所有日期字段
        baseParams.availableStartDate = searchForm.availableDateRange?.[0] || null;
        baseParams.availableEndDate = searchForm.availableDateRange?.[1] || null;
        baseParams.assignedStartDate = searchForm.assignedDateRange?.[0] || null;
        baseParams.assignedEndDate = searchForm.assignedDateRange?.[1] || null;
        baseParams.interviewerStartDate = searchForm.interviewerDateRange?.[0] || null;
        baseParams.interviewerEndDate = searchForm.interviewerDateRange?.[1] || null;
        baseParams.offerStartDate = searchForm.offerDateRange?.[0] || null;
        baseParams.offerEndDate = searchForm.offerDateRange?.[1] || null;
      } else if (pageType === '1') {
        // 应聘登记：可报到日期、分配日期
        baseParams.availableStartDate = searchForm.availableDateRange?.[0] || null;
        baseParams.availableEndDate = searchForm.availableDateRange?.[1] || null;
        baseParams.assignedStartDate = searchForm.assignedDateRange?.[0] || null;
        baseParams.assignedEndDate = searchForm.assignedDateRange?.[1] || null;
      } else if (pageType === '2') {
        // 面试评估：面试日期
        baseParams.interviewerStartDate = searchForm.interviewerDateRange?.[0] || null;
        baseParams.interviewerEndDate = searchForm.interviewerDateRange?.[1] || null;
      } else if (pageType === '3') {
        // 录用反馈：录用日期
        baseParams.offerStartDate = searchForm.offerDateRange?.[0] || null;
        baseParams.offerEndDate = searchForm.offerDateRange?.[1] || null;
      }

      return baseParams;
    },

    //************************************************ 第0部分：暴露方法 *****************************************************

    // 暴露给父组件的核心数据查询方法
    async handleSearch() {
      if (!this.$refs.searchFormRef) {
        return await this.query()
      }
      return await this.fun_search(this.$refs.searchFormRef)
    },

    // 暴露给父组件的数据刷新方法
    async refreshData() {
      return await this.query()
    },

    // 批量下载附件（暴露给父组件）
    downloadBatchAttachments(applicantId) {
      const targetId = applicantId || (this.dataForm && this.dataForm.id)
      if (targetId) {
        return this.downloadBatchAttachmentsInternal(targetId)
      }
    },

    // 打开附件页签
    openAttachmentTab(applicantId) {
      if (applicantId) {
        this.fun_update({ id: applicantId })
        this.$nextTick(() => {
          this.activeTabName = 'attachments'
        })
      }
    },

    // 获取当前选中行
    getSelectedRows() {
      return this.selectionRows || []
    },

    // 清空选择状态（暴露给父组件手动调用）
    clearSelectionState() {
      if (this.$refs.dataTableRef) {
        this.$refs.dataTableRef.clearSelection();
      }
      this.selectionRows = [];
    },

    // 设置选中行（用于批量操作后更新选中状态）
    setSelectedRows(rows) {
      if (!this.$refs.dataTableRef) {
        console.warn('setSelectedRows: dataTableRef not found');
        return;
      }

      // 1. 清空当前选中状态
      this.$refs.dataTableRef.clearSelection();

      // 2. 强制触发 Vue 响应式更新
      this.$forceUpdate();

      // 3. 使用 setTimeout 确保清空操作和强制更新都完全生效
      //    使用 50ms 延迟以确保 Element 表格内部状态完全稳定
      setTimeout(() => {
        if (!this.$refs.dataTableRef || !rows || rows.length === 0) {
          this.selectionRows = [];
          return;
        }

        // 4. 后端分页不需要跨页保持选中，直接更新选中状态
        this.selectionRows = rows;
        console.log(`setSelectedRows: 已设置选中 ${rows.length} 条记录`);
      }, 50);
    },

    // 获取分页信息
    getPaginationInfo() {
      return {
        currentPage: this.currentPage || 1,
        pageSize: this.pageSize || 10,
        total: this.dataTotal || 0
      }
    },

    // 获取数据列表
    getDataList() {
      return this.dataList || []
    },

    //************************************************ 第1部分：公共操作 *****************************************************

    // 拉取枚举
    async fetchAttrList() {
      try {
        const _this = this;
        const response = await axios.get(_this.sysAttrListUrl);
        if (response.data.code === 2000) {
          this.attrLists = { ...this.attrLists, ...response.data.data };
        } else {
          ElMessage.error('获取字典数据失败: ' + response.data.message);
        }
      } catch (error) {
        ElMessage.error('网络请求失败，无法获取字典数据');
      }
    },

    //************************************************ 第2部分：主表 ********************************************************

    // 查询_表格
    async query() {
      const _this = this;
      _this.loading = true;

      // 使用新的 buildQueryParams 函数构建查询参数
      let params = _this.buildQueryParams(_this.searchForm, _this.currentPageType);

      try {
        const response = await axios({
          url: _this.applicantListUrl + '?pageNum=' + _this.currentPage + '&pageSize=' + _this.pageSize,
          method: 'POST',
          data: params
        });

        if (response.data.code === 2000) {
          // 后端分页返回的数据结构：{ records: [], total: 100, size: 10, current: 1, pages: 10 }
          let records = response.data.data.records || [];

          // ===== 枚举映射：将字符串状态码转换为对象 =====

          records.forEach((item, index) => {
            // 处理图片URL
            if (item.photoUrl && item.photoUrl.trim() !== '') {
              if (!item.photoUrl.startsWith('http')) {
                item.photoUrl = _this.buildSafeImageUrl(item.photoUrl);
              }
            }

            // 映射 auditStatus：字符串 → 对象
            if (item.auditStatus && typeof item.auditStatus === 'string') {
              const statusOption = _this.attrLists.allStatusOptions?.find(
                opt => opt.key === item.auditStatus
              );
              if (statusOption) {
                item.auditStatus = { ...statusOption };
              }
            }

            // 映射其他枚举字段（如果需要）
            // 性别
            if (item.gender && typeof item.gender === 'string') {
              const genderOption = _this.attrLists.genderOptions?.find(
                opt => opt.key === item.gender
              );
              if (genderOption) {
                item.gender = { ...genderOption };
              }
            }
            // 政治面貌
            if (item.politicalStatus && typeof item.politicalStatus === 'string') {
              const politicalOption = _this.attrLists.politicalStatusOptions?.find(
                opt => opt.key === item.politicalStatus
              );
              if (politicalOption) {
                item.politicalStatus = { ...politicalOption };
              }
            }
            // 学历
            if (item.highestEducationLevel && typeof item.highestEducationLevel === 'string') {
              const eduOption = _this.attrLists.educationLevelOptions?.find(
                opt => opt.key === item.highestEducationLevel
              );
              if (eduOption) {
                item.highestEducationLevel = { ...eduOption };
              }
            }
            // 外语水平
            if (item.foreignLanguageLevel && typeof item.foreignLanguageLevel === 'string') {
              const langOption = _this.attrLists.foreignLanguageLevelOptions?.find(
                opt => opt.key === item.foreignLanguageLevel
              );
              if (langOption) {
                item.foreignLanguageLevel = { ...langOption };
              }
            }
          });
          _this.dataList = records;
          _this.dataTotal = response.data.data.total || 0;
        } else {
          ElMessage.error(response.data.message || '获取数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败');
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
        highestEducationLevel: null,
        foreignLanguageLevel: null,
        applyPosition: '',
        auditStatus: null,
        assignedUser: '',
        availableDateRange: [],
        assignedDateRange: [],
        interviewerDateRange: [],
        offerDateRange: []
      };
      // 重置分页参数
      _this.currentPage = 1;
      _this.query();
    },

    // 导出数据
    async fun_export() {
      try {
        this.loading = true;

        // 构建查询参数
        const params = this.buildQueryParams(this.searchForm, this.currentPageType);

        let _this = this;
        _this.loading = true;
        await axios({
          url: _this.applicantExportUrl,
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
        ElMessage.error(error.message || '导出失败');
        this.loading = false;
      }
    },

    // 表格_多选
    handleSelectionChange(selection) {
      // 当分页/数据重渲染导致 selection 变空时，尝试从表格组件读取当前selection，避免误判
      try {
        if ((!selection || selection.length === 0) && this.$refs && this.$refs.dataTableRef) {
          const tableSel = this.$refs.dataTableRef.getSelectionRows?.() || [];
          if (tableSel.length > 0) {
            selection = tableSel;
          }
        }
      } catch (e) {
        // 静默处理
      }

      this.selectionRows = selection;
    },

    // 移除了 selectionSelectable，后端分页不需要复杂的选中逻辑

    // 第N页 - 后端分页需要重新查询
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fun_search(this.$refs.searchFormRef);
    },

    // 分页大小改变 - 后端分页需要重新查询
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fun_search(this.$refs.searchFormRef);
    },

    // 弹框关闭处理方法
    handleDialogClose(done) {
      // 确保弹框正确关闭并重置状态
      this.resetDialogStates();
      done();
    },

    // 重置弹框状态
    resetDialogStates() {
      // 重置状态的逻辑
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
      // 重置标签页加载状态，实现延迟加载
      this.resetTabsLoadedState();
      // 显示全屏 loading
      this.dataFormLoading = true;
      this.loadApplicantDetail(row.id);
    },

    // 按钮_编辑
    fun_update(row) {
      this.dataFormStatus = 'update';
      this.dataFormTitle = '编辑应聘者';
      this.dataFormVisible = true;
      this.activeTabName = 'basic';
      // 重置标签页加载状态，实现延迟加载
      this.resetTabsLoadedState();
      // 显示全屏 loading
      this.dataFormLoading = true;
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
          url: this.applicantDeleteUrl,
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
        }
        this.loading = false;
      }
    },

    // 批量删除（逻辑删除）
    async fun_batchDelete() {
      try {
        if (!this.selectionRows || this.selectionRows.length === 0) {
          ElMessage.warning('请先选择要删除的数据');
          return;
        }

        await ElMessageBox.confirm(
          `确认删除选中的 ${this.selectionRows.length} 条记录吗？此操作不可撤销！`,
          '批量删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const ids = this.selectionRows.map(item => item.id);
        const response = await axios({
          url: this.applicantDeleteBatchUrl,
          method: 'POST',
          data: { ids, opera: '1' }
        });

        if (response && response.data.code === 2000) {
          ElMessage.success('批量删除成功');
          this.selectionRows = [];
          this.query();
        } else {
          ElMessage.error((response && response.data.message) || '批量删除失败');
        }
        this.loading = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败');
        }
        this.loading = false;
      }
    },

    // 批量删除（接收外部传入的选中数据，逻辑删除）
    async fun_batchDeleteWithData(externalSelectionRows) {
      try {
        if (!externalSelectionRows || externalSelectionRows.length === 0) {
          ElMessage.warning('请先选择要删除的数据');
          return;
        }

        await ElMessageBox.confirm(
          `确认删除选中的 ${externalSelectionRows.length} 条记录吗？此操作不可撤销！`,
          '批量删除确认',
          {
            type: 'warning',
            confirmButtonText: '确认删除',
            cancelButtonText: '取消'
          }
        );

        this.loading = true;
        const ids = externalSelectionRows.map(item => item.id);
        const response = await axios({
          url: this.applicantDeleteBatchUrl,
          method: 'POST',
          data: { ids, opera: '1' }
        });

        if (response && response.data.code === 2000) {
          ElMessage.success('批量删除成功');
          this.selectionRows = [];
          this.query();
        } else {
          ElMessage.error((response && response.data.message) || '批量删除失败');
        }
        this.loading = false;
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败');
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
      } finally {
        this.dataFormLoading = false;
      }
    },

    // 处理新增保存（两步操作：先保存基本信息，再上传图片）
    async handleCreateSave() {
      // 第一步：保存基本信息
      const payload = this.prepareDataForSave();
      const response = await axios({
        url: this.applicantInsertUrl,
        method: 'POST',
        data: payload
      });

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
        ElMessage.warning('基本信息已保存，但子表数据保存失败，请手动重新添加');
      }

      // 第三步：处理待上传的图片（如果有）
      if (this.pendingImageFile) {
        try {
          ElMessage.info('正在上传图片...');
          await this.processPendingImageUpload();
          ElMessage.success('图片上传成功');
        } catch (imageError) {
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
            // 处理日期字段，确保发送给后端的格式正确
            const workExpToSave = {
              ...workExp,
              applicantId: applicantId,
              startDate: workExp.startDate ? this.convertMonthToFullDate(workExp.startDate) : '',
              endDate: workExp.endDate ? this.convertMonthToFullDate(workExp.endDate) : ''
            };
            const response = await axios({
              url: this.applicantWorkInsertUrl,
              method: 'POST',
              data: workExpToSave
            });
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
          }
        }
      }

      // 2. 保存培训经历
      if (this.trainingList.length > 0) {
        ElMessage.info('正在保存培训经历...');
        for (let i = 0; i < this.trainingList.length; i++) {
          const training = this.trainingList[i];
          try {
            // 处理日期字段，确保发送给后端的格式正确
            const trainingToSave = {
              ...training,
              applicantId: applicantId,
              startDate: training.startDate ? this.convertMonthToFullDate(training.startDate) : '',
              endDate: training.endDate ? this.convertMonthToFullDate(training.endDate) : ''
            };
            const response = await axios({
              url: this.applicantTrainingInsertUrl,
              method: 'POST',
              data: trainingToSave
            });
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
          }
        }
      }

      // 3. 保存家庭情况
      if (this.familyList.length > 0) {
        ElMessage.info('正在保存家庭情况...');
        for (let i = 0; i < this.familyList.length; i++) {
          const family = this.familyList[i];
          try {
            // 处理枚举字段，确保发送给后端的是key值而不是对象
            const familyToSave = {
              ...family,
              applicantId: applicantId,
              relationship: typeof family.relationship === 'object' && family.relationship
                ? family.relationship.key
                : family.relationship
            };
            const response = await axios({
              url: this.applicantFamilyInsertUrl,
              method: 'POST',
              data: familyToSave
            });
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
          }
        }
      }

      // 4. 保存学习经历
      if (this.educationList.length > 0) {
        ElMessage.info('正在保存学习经历...');
        for (let i = 0; i < this.educationList.length; i++) {
          const education = this.educationList[i];
          try {
            // 处理枚举字段和日期字段，确保发送给后端的格式正确
            const educationToSave = {
              ...education,
              applicantId: applicantId,
              educationLevel: typeof education.educationLevel === 'object' && education.educationLevel
                ? education.educationLevel.key
                : education.educationLevel,
              schoolNature: typeof education.schoolNature === 'object' && education.schoolNature
                ? education.schoolNature.key
                : education.schoolNature,
              startDate: education.startDate ? this.convertMonthToFullDate(education.startDate) : '',
              endDate: education.endDate ? this.convertMonthToFullDate(education.endDate) : ''
            };
            const response = await axios({
              url: this.applicantEducationInsertUrl,
              method: 'POST',
              data: educationToSave
            });
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
      const response = await axios({
        url: this.applicantUpdateUrl,
        method: 'POST',
        data: payload
      });

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

      // 强制格式化日期字段
      const dateFields = ['birthDate', 'availableDate', 'dischargeDate', 'fillDate'];
      dateFields.forEach(field => {
        if (payload[field]) {
          payload[field] = dayjs(payload[field]).format('YYYY-MM-DD');
        }
      });

      // 格式化工作经历、培训经历、学习经历的月份字段为 'YYYY-MM'
      const monthFields = [];
      // 这些字段在子表中处理，此处暂不处理
      monthFields.forEach(field => {
        if (payload[field]) {
          payload[field] = dayjs(payload[field]).format('YYYY-MM');
        }
      });

      // allowedFields 白名单，确保提交给后端的数据只包含这些字段
      const allowedFields = [
        'id', 'applicantName', 'applyPosition', 'photoUrl', 'gender', 'birthDate',
        'nation', 'politicalStatus', 'maritalStatus', 'height', 'weight',
        'visionLeft', 'visionRight', 'bloodType', 'professionalTitle',
        'foreignLanguageLevel', 'foreignLanguageScore', 'contactPhone', 'idCardNo',
        'availableDate', 'country', 'householdRelation', 'isVeteran', 'dischargeDate', 'dischargeCertNo',
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
        // 已经在调用处设置了 dataFormLoading = true
        const response = await axios({
          url: this.applicantDetailUrl,
          method: 'POST',
          data: { id: id }
        });

        if (response.data.code === 2000) {
          const backendData = response.data.data;

          // 创建一个净化后的数据副本
          const cleanData = { ...backendData };
          // 遍历所有可能的枚举字段和特殊字段
          Object.keys(this.attrLists).forEach(optionKey => {
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

          // 使用精准查询：当存在岗位编码时，调用岗位列表接口翻译为岗位名称
          try {
            if (this.dataForm && this.dataForm.applyPosition) {
              await this.resolveApplyPositionName(this.dataForm.applyPosition);
            }
          } catch (e) {
            // 忽略翻译失败，仅保留已有显示
          }

          // 标记基本信息已加载
          this.tabsLoadedState.basic = true;

          // 不自动加载子表数据，等待用户点击对应标签页时再加载
          // this.loadSubTableData(id);
          // this.loadApplicantAttachments();
        } else {
          ElMessage.error(response.data.message || '获取详情失败');
        }
      } catch (error) {
        ElMessage.error('获取详情失败');
      } finally {
        // 关闭全屏 loading
        this.dataFormLoading = false;
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
        gender: "M",           // 性别 - 默认：男
        birthDate: '',         // 出生日期
        nation: "01",          // 民族 - 默认：汉族
        politicalStatus: "12", // 政治面貌 - 默认：群众
        maritalStatus: "02",   // 婚否 - 默认：未婚
        height: null,          // 身高
        weight: null,          // 体重 - 后端返回 {source: "88.00", parsedValue: 88}
        visionLeft: '',        // 视力左
        visionRight: '',       // 视力又
        bloodType: "A",        // 血型 - 默认：A型
        professionalTitle: '', // 职称
        foreignLanguageLevel: "01", // 外语等级 - 默认：一般
        foreignLanguageScore: null, // 外语分数
        contactPhone: '',      // 联系电话
        idCardNo: '',          // 身份证号
        availableDate: '',     // 可报到日期
        country: "001",        // 国家 - 默认：中国
        householdRelation: "01", // 户口关系 - 默认：农村户口
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
        otherHistory: '无',             // 其他史 - 默认：无
        noHistoryStatement: '本人无任何病史', // 无病史声明 - 默认：本人无任何病史
        // 备注
        applicationChannels: [],   // 应聘途径
        agreeShiftWork: "0",       // 是否同意轮班工作 - 默认：否
        needAccommodation: "0",    // 是否需要住宿 - 默认：否
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

    // 标签页切换事件处理（延迟加载）
    async handleTabClick(tab) {
      const tabName = tab.props.name;

      // 如果该标签页已经加载过，直接返回
      if (this.tabsLoadedState[tabName]) {
        return;
      }

      // 根据标签页名称加载对应数据
      const applicantId = this.dataForm.id;
      if (!applicantId) {
        return;
      }

      // 显示全屏 loading
      this.dataFormLoading = true;

      try {
        switch (tabName) {
          case 'work':
            await this.loadWorkExperience(applicantId);
            break;
          case 'training':
            await this.loadTrainingExperience(applicantId);
            break;
          case 'family':
            await this.loadFamilyInfo(applicantId);
            break;
          case 'education':
            await this.loadEducationInfo(applicantId);
            break;
          case 'medical':
            // 病史类别已在基本信息中加载
            this.tabsLoadedState.medical = true;
            break;
          case 'attachments':
            await this.loadApplicantAttachments();
            break;
        }
      } finally {
        // 关闭全屏 loading
        this.dataFormLoading = false;
      }
    },

    // 加载工作经历
    async loadWorkExperience(applicantId) {
      try {
        const response = await axios({
          url: this.applicantWorkListUrl,
          method: 'POST',
          data: { applicantId: applicantId }
        });
        console.log('工作经历响应:', response);

        if (response.data.code === 2000) {
          this.workExperienceList = (response.data.data || []).map(item => ({
            ...item,
            startDate: item.startDate ? dayjs(item.startDate).format('YYYY-MM') : '',
            endDate: item.endDate ? dayjs(item.endDate).format('YYYY-MM') : ''
          }));
          this.tabsLoadedState.work = true;
        } else {
          ElMessage.error(response.data.message || '加载工作经历失败');
        }
      } catch (error) {
        console.error('加载工作经历失败:', error);
        ElMessage.error('加载工作经历失败');
      }
    },

    // 加载培训经历
    async loadTrainingExperience(applicantId) {
      try {
        const response = await axios({
          url: this.applicantTrainingListUrl,
          method: 'POST',
          data: { applicantId: applicantId }
        });
        console.log('培训经历响应:', response);

        if (response.data.code === 2000) {
          this.trainingList = (response.data.data || []).map(item => ({
            ...item,
            startDate: item.startDate ? dayjs(item.startDate).format('YYYY-MM') : '',
            endDate: item.endDate ? dayjs(item.endDate).format('YYYY-MM') : ''
          }));
          console.log('培训经历列表:', this.trainingList);
          this.tabsLoadedState.training = true;
        } else {
          console.error('加载培训经历失败:', response.data.message);
          ElMessage.error(response.data.message || '加载培训经历失败');
        }
      } catch (error) {
        console.error('加载培训经历异常:', error);
        ElMessage.error('加载培训经历失败');
      }
    },

    // 加载家庭情况
    async loadFamilyInfo(applicantId) {
      try {
        const response = await axios({
          url: this.applicantFamilyListUrl,
          method: 'POST',
          data: { applicantId: applicantId }
        });
        console.log('家庭情况响应:', response);

        if (response.data.code === 2000) {
          // 处理 relationship 字段，确保正确显示枚举值
          this.familyList = (response.data.data || []).map(item => ({
            ...item,
            relationship: item.relationship && item.relationship.key != null
              ? item.relationship
              : (item.relationship ? { key: item.relationship, value: this.getRelationshipLabel(item.relationship) } : null)
          }));
          this.tabsLoadedState.family = true;
        } else {
          ElMessage.error(response.data.message || '加载家庭情况失败');
        }
      } catch (error) {
        console.error('加载家庭情况失败:', error);
        ElMessage.error('加载家庭情况失败');
      }
    },

    // 加载学习经历
    async loadEducationInfo(applicantId) {
      try {
        const response = await axios({
          url: this.applicantEducationListUrl,
          method: 'POST',
          data: { applicantId: applicantId }
        });
        console.log('学习经历响应:', response);

        if (response.data.code === 2000) {
          this.educationList = (response.data.data || []).map(item => ({
            ...item,
            startDate: item.startDate ? dayjs(item.startDate).format('YYYY-MM') : '',
            endDate: item.endDate ? dayjs(item.endDate).format('YYYY-MM') : '',
            educationLevel: item.educationLevel && item.educationLevel.key != null
              ? item.educationLevel
              : (item.educationLevel ? { key: item.educationLevel, value: this.getEducationLevelLabel(item.educationLevel) } : null),
            schoolNature: item.schoolNature && item.schoolNature.key != null
              ? item.schoolNature
              : (item.schoolNature ? { key: item.schoolNature, value: this.getSchoolNatureLabel(item.schoolNature) } : null)
          }));
          this.tabsLoadedState.education = true;
        } else {
          ElMessage.error(response.data.message || '加载学习经历失败');
        }
      } catch (error) {
        console.error('加载学习经历失败:', error);
        ElMessage.error('加载学习经历失败');
      }
    },

    // 重置标签页加载状态
    resetTabsLoadedState() {
      this.tabsLoadedState = {
        basic: false,
        work: false,
        training: false,
        family: false,
        education: false,
        medical: false,
        attachments: false
      };
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

      // 处理头像URL，添加图片访问前缀（带URL编码）
      if (backendData.photoUrl && backendData.photoUrl.trim() !== '') {
        // 如果photoUrl不是以http开头，则添加图片访问前缀
        if (!backendData.photoUrl.startsWith('http')) {
          this.dataForm.photoUrl = this.buildSafeImageUrl(backendData.photoUrl);
        } else {
          this.dataForm.photoUrl = backendData.photoUrl;
        }
      } else {
        this.dataForm.photoUrl = '';
      }

      this.handleSpecialFields(backendData);

      // 应聘岗位显示处理：后端字段 applyPosition 保存为岗位编码，这里需要显示岗位名称
      // 若后端已返回 positionName 字段则直接用；否则尝试从枚举/列表中匹配（此处仅兜底为编码）
      try {
        if (backendData && backendData.applyPosition) {
          // 若后端返回了岗位名称字段（如 positionName 或 applyPositionName），优先显示
          const nameCandidate = backendData.positionName || backendData.applyPositionName;
          this.dataForm.applyPositionName = nameCandidate || backendData.applyPosition;
        } else {
          this.dataForm.applyPositionName = '';
        }
      } catch (e) {
        this.dataForm.applyPositionName = backendData.applyPosition || '';
      }

      // 同步本人签字：始终与姓名保持一致
      this.syncSignatureWithName();
    },

    // 精准翻译岗位编码为名称：调用岗位列表接口
    async resolveApplyPositionName(positionNo) {
      if (!positionNo) {
        return;
      }
      try {
        const payload = {
          deptName: '',
          deptNo: '',
          positionName: '',
          positionNo: positionNo,
          openFlag: 'Y'
        };
        const resp = await axios({
          url: this.positionJobUrl + '?pageNum=1&pageSize=10',
          method: 'POST',
          data: payload
        });
        console.log('解析岗位名称响应:', resp);

        if (resp?.data.code === 2000 && resp.data.data && Array.isArray(resp.data.data.records)) {
          // 精准匹配 positionNo，取第一条
          const match = resp.data.data.records.find(item => item && item.positionNo === positionNo) || resp.data.data.records[0];
          if (match && match.positionName) {
            this.dataForm.applyPositionName = match.positionName;
          }
        }
      } catch (e) {
        // 静默失败
      }
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
        // 打开回收站时清空旧的选择
        try {
          this.recycleSelectionIds.clear();
          this.recycleSelectedCount = 0;
          const table = this.$refs && this.$refs.recycleTableRef;
          table && table.clearSelection && table.clearSelection();
        } catch (_) {
        }
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
          url: _this.applicantListUrl + '?pageNum=' + _this.recycleCurrentPage + '&pageSize=' + _this.recyclePageSize,
          method: 'POST',
          data: params
        });

        if (response.data.code === 2000) {
          let recycleDataList = response.data.data.records || [];
          recycleDataList.forEach(item => {
            if (item.photoUrl && item.photoUrl.trim() !== '') {
              // 如果photoUrl不是以http开头，则添加图片访问前缀
              if (!item.photoUrl.startsWith('http')) {
                item.photoUrl = _this.buildSafeImageUrl(item.photoUrl);
              }
            }
          });
          _this.recycleDataList = recycleDataList;
          _this.recycleDataTotal = response.data.data.total || 0;
          // 清理无效的选择ID，并恢复当前页选择
          const validIds = new Set(recycleDataList.map(i => i.id));
          for (const id of Array.from(_this.recycleSelectionIds)) {
            if (!validIds.has(id)) {
              _this.recycleSelectionIds.delete(id);
            }
          }
          _this.recycleSelectedCount = _this.recycleSelectionIds.size;
          _this.$nextTick(() => {
            _this.reselectRecycleRows();
          });
        } else {
          ElMessage.error(response.data.message || '获取回收站数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败');
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

    // 回收站-选择列可选控制
    recycleSelectionSelectable(row) {
      return !!(row && row.id);
    },

    // 回收站-多选（跨页持久化）
    handleRecycleSelectionChange(selection) {
      try {
        this.recycleSelectionRows = selection || [];
        const pageIds = new Set((this.recycleDataList || []).map(r => r.id));
        // 移除当前页所有id
        for (const id of Array.from(this.recycleSelectionIds)) {
          if (pageIds.has(id)) {
            this.recycleSelectionIds.delete(id);
          }
        }
        // 加入当前选择id
        (selection || []).forEach(row => {
          if (row && row.id) {
            this.recycleSelectionIds.add(row.id);
          }
        });
        this.recycleSelectedCount = this.recycleSelectionIds.size;
      } catch (_) {
      }
    },

    // 回收站-恢复当前页的勾选状态
    reselectRecycleRows() {
      try {
        const table = this.$refs && this.$refs.recycleTableRef;
        if (!table) {
          return;
        }
        table.clearSelection && table.clearSelection();
        (this.recycleDataList || []).forEach(row => {
          if (row && row.id && this.recycleSelectionIds.has(row.id)) {
            table.toggleRowSelection && table.toggleRowSelection(row, true);
          }
        });
      } catch (_) {
      }
    },

    // 回收站-一键还原（批量逻辑恢复）
    async fun_recycleBatchRestore() {
      try {
        if (!this.recycleSelectedCount || this.recycleSelectedCount === 0) {
          ElMessage.warning('请先选择要还原的数据');
          return;
        }
        await ElMessageBox.confirm(
          `确认还原选中的 ${this.recycleSelectedCount} 条数据吗？`,
          '批量还原确认',
          { type: 'warning', confirmButtonText: '确认还原', cancelButtonText: '取消' }
        );
        this.recycleLoading = true;
        const ids = Array.from(this.recycleSelectionIds);
        const response = await axios({
          url: this.applicantDeleteBatchUrl,
          method: 'POST',
          data: { ids, opera: '2' }
        });
        if (response && response.data.code === 2000) {
          ElMessage.success('批量还原成功');
          this.recycleSelectionRows = [];
          this.recycleSelectionIds.clear();
          this.recycleSelectedCount = 0;
          const table = this.$refs && this.$refs.recycleTableRef;
          table && table.clearSelection && table.clearSelection();
          await this.queryRecycleData();
          await this.query();
        } else {
          ElMessage.error((response && response.data.message) || '批量还原失败');
        }
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error('批量还原失败');
        }
      } finally {
        this.recycleLoading = false;
      }
    },

    // 回收站-一键清空（批量彻底删除）
    async fun_recycleBatchTruncate() {
      try {
        if (!this.recycleSelectedCount || this.recycleSelectedCount === 0) {
          ElMessage.warning('请先选择要删除的数据');
          return;
        }
        await ElMessageBox.confirm(
          `确认彻底删除选中的 ${this.recycleSelectedCount} 条数据吗？此操作不可撤销！`,
          '批量彻底删除确认',
          { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
        );
        this.recycleLoading = true;
        const ids = Array.from(this.recycleSelectionIds);
        const response = await axios({
          url: this.applicantDeleteBatchUrl,
          method: 'POST',
          data: { ids, opera: '0' }
        });
        if (response && response.data.code === 2000) {
          ElMessage.success('批量彻底删除成功');
          this.recycleSelectionRows = [];
          this.recycleSelectionIds.clear();
          this.recycleSelectedCount = 0;
          const table = this.$refs && this.$refs.recycleTableRef;
          table && table.clearSelection && table.clearSelection();
          await this.queryRecycleData();
          await this.query();
        } else {
          ElMessage.error((response && response.data.message) || '批量彻底删除失败');
        }
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error('批量彻底删除失败');
        }
      } finally {
        this.recycleLoading = false;
      }
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
          url: this.applicantDeleteUrl,
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
          url: this.applicantDeleteUrl,
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
        }
        this.recycleLoading = false;
      }
    },

    // 回收站分页-页码改变 - 后端分页需要重新查询
    handleRecycleCurrentChange(val) {
      this.recycleCurrentPage = val;
      this.queryRecycleData();
    },

    // 回收站分页-每页大小改变 - 后端分页需要重新查询
    handleRecycleSizeChange(val) {
      this.recyclePageSize = val;
      this.recycleCurrentPage = 1;
      this.queryRecycleData();
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
            url: this.applicantWorkDeleteUrl,
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

        // 格式化日期为 'YYYY-MM-DD' 格式（后端Date类型需要完整日期）
        const formDataToSave = {
          ...this.workExperienceForm,
          startDate: this.workExperienceForm.startDate ? this.convertMonthToFullDate(this.workExperienceForm.startDate) : '',
          endDate: this.workExperienceForm.endDate ? this.convertMonthToFullDate(this.workExperienceForm.endDate) : ''
        };
        formDataToSave.applicantId = this.dataForm.id;
        const isEdit = this.currentWorkExperienceIndex !== -1;

        if (isEdit && formDataToSave.id) {
          // 编辑模式，调用更新API
          const response = await axios({
            url: this.applicantWorkUpdateUrl,
            method: 'POST',
            data: formDataToSave
          });

          if (response.data.code === 2000) {
            ElMessage.success('更新成功');
            this.workExperienceList[this.currentWorkExperienceIndex] = { ...formDataToSave };
          } else {
            ElMessage.error(response.data.message || '更新失败');
          }
        } else if (this.dataForm.id) {
          // 新增模式，调用新增API
          const response = await axios({
            url: this.applicantWorkInsertUrl,
            method: 'POST',
            data: formDataToSave
          });

          if (response.data.code === 2000) {
            ElMessage.success('新增成功');
            // 重新加载工作经历列表
            await this.loadWorkExperience(this.dataForm.id);
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
            url: this.applicantTrainingDeleteUrl,
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

        // 格式化日期为 'YYYY-MM-DD' 格式（后端Date类型需要完整日期）
        const formDataToSave = {
          ...this.trainingForm,
          startDate: this.trainingForm.startDate ? this.convertMonthToFullDate(this.trainingForm.startDate) : '',
          endDate: this.trainingForm.endDate ? this.convertMonthToFullDate(this.trainingForm.endDate) : ''
        };
        formDataToSave.applicantId = this.dataForm.id;
        const isEdit = this.currentTrainingIndex !== -1;

        if (isEdit && formDataToSave.id) {
          // 编辑模式，调用更新API
          const response = await axios({
            url: this.applicantTrainingUpdateUrl,
            method: 'POST',
            data: formDataToSave
          });

          if (response.data.code === 2000) {
            ElMessage.success('更新成功');
            this.trainingList[this.currentTrainingIndex] = { ...formDataToSave };
          } else {
            ElMessage.error(response.data.message || '更新失败');
          }
        } else if (this.dataForm.id) {
          // 新增模式，调用新增API
          const response = await axios({
            url: this.applicantTrainingInsertUrl,
            method: 'POST',
            data: formDataToSave
          });

          if (response.data.code === 2000) {
            ElMessage.success('新增成功');
            // 重新加载培训经历列表
            await this.loadTrainingExperience(this.dataForm.id);
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
      // 处理枚举字段，确保只保存key值而不是完整对象
      this.familyForm = {
        ...row,
        relationship: row.relationship && typeof row.relationship === 'object'
          ? row.relationship.key
          : row.relationship
      };
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
            url: this.applicantFamilyDeleteUrl,
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

        // 处理枚举字段，确保发送给后端的是key值而不是对象
        const formDataToSave = {
          ...this.familyForm,
          applicantId: this.dataForm.id,
          relationship: typeof this.familyForm.relationship === 'object' && this.familyForm.relationship
            ? this.familyForm.relationship.key
            : this.familyForm.relationship
        };

        const isEdit = this.currentFamilyIndex !== -1;

        if (isEdit && formDataToSave.id) {
          // 编辑模式，调用更新API
          const response = await axios({
            url: this.applicantFamilyUpdateUrl,
            method: 'POST',
            data: formDataToSave
          });

          if (response.data.code === 2000) {
            ElMessage.success('更新成功');
            // 处理 relationship 字段
            const displayData = {
              ...formDataToSave,
              relationship: formDataToSave.relationship
                ? { key: formDataToSave.relationship, value: this.getRelationshipLabel(formDataToSave.relationship) }
                : null
            };
            this.familyList[this.currentFamilyIndex] = displayData;
          } else {
            ElMessage.error(response.data.message || '更新失败');
          }
        } else if (this.dataForm.id) {
          // 新增模式，调用新增API
          const response = await axios({
            url: this.applicantFamilyInsertUrl,
            method: 'POST',
            data: formDataToSave
          });

          if (response.data.code === 2000) {
            ElMessage.success('新增成功');
            // 重新加载家庭情况列表
            await this.loadFamilyInfo(this.dataForm.id);
          } else {
            ElMessage.error(response.data.message || '新增失败');
          }
        } else {
          // 无应聘者ID，仅前端操作
          // 处理 relationship 字段
          const displayData = {
            ...formDataToSave,
            relationship: formDataToSave.relationship
              ? { key: formDataToSave.relationship, value: this.getRelationshipLabel(formDataToSave.relationship) }
              : null
          };

          if (isEdit) {
            this.familyList[this.currentFamilyIndex] = displayData;
          } else {
            this.familyList.push(displayData);
          }
          ElMessage.success(isEdit ? '更新成功' : '新增成功');
        }

        this.familyDialogVisible = false;
      } catch (error) {
        ElMessage.error('保存失败');
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
      // 处理枚举字段，确保只保存key值而不是完整对象
      this.educationForm = {
        ...row,
        educationLevel: row.educationLevel && typeof row.educationLevel === 'object'
          ? row.educationLevel.key
          : row.educationLevel,
        schoolNature: row.schoolNature && typeof row.schoolNature === 'object'
          ? row.schoolNature.key
          : row.schoolNature,
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
            url: this.applicantEducationDeleteUrl,
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

        // 格式化日期为 'YYYY-MM-DD' 格式（后端Date类型需要完整日期）
        const formDataToSave = {
          ...this.educationForm,
          startDate: this.educationForm.startDate ? this.convertMonthToFullDate(this.educationForm.startDate) : '',
          endDate: this.educationForm.endDate ? this.convertMonthToFullDate(this.educationForm.endDate) : ''
        };
        formDataToSave.applicantId = this.dataForm.id;
        const isEdit = this.currentEducationIndex !== -1;

        if (isEdit && formDataToSave.id) {
          // 编辑模式，调用更新API
          const response = await axios({
            url: this.applicantEducationUpdateUrl,
            method: 'POST',
            data: formDataToSave
          });

          if (response.data.code === 2000) {
            ElMessage.success('更新成功');
            this.educationList[this.currentEducationIndex] = { ...formDataToSave };
          } else {
            ElMessage.error(response.data.message || '更新失败');
          }
        } else if (this.dataForm.id) {
          // 新增模式，调用新增API
          const response = await axios({
            url: this.applicantEducationInsertUrl,
            method: 'POST',
            data: formDataToSave
          });

          if (response.data.code === 2000) {
            // 重新加载学习经历列表
            await this.loadEducationInfo(this.dataForm.id);
            ElMessage.success('新增成功');
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
          ElMessage.warning('预览图片生成失败');
        }
        return;
      }

      try {
        const base64Content = await this.fileToBase64(file);

        // 生成自定义文件名: photo_身份证号_时间戳 (避免中文，符合URL规范)
        const currentTime = dayjs().format('YYYYMMDD_HHmmss');
        const idCardNo = this.dataForm.idCardNo || 'unknown';
        const fileExtension = file.name.split('.').pop();
        const customFileName = `photo_${idCardNo}_${currentTime}.${fileExtension}`;

        const uploadData = {
          applicantId: this.dataForm.id,
          fileName: customFileName,
          fileContent: base64Content,
          fileSize: file.size,
          mimeType: file.type,
          biz: this.imageBizUrl
        };

        // 将返回结果存到 response - 直接使用 axios 上传 JSON 数据
        const response = await axios({
          url: this.imageUploadUrl,
          method: 'POST',
          data: uploadData
        });

        if (response.data.code === 2000) {
          // 后端返回的相对路径，如 "images/xxx.jpg"
          const relative = response.data.data;
          // 使用安全的URL构建函数
          this.dataForm.photoUrl = this.buildSafeImageUrl(relative);
          // 清理预览数据（如果有的话）
          this.pendingImagePreview = '';
          ElMessage.success('照片上传成功');
        } else {
          ElMessage.error(response.data.message || '照片上传失败');
        }
      } catch (error) {
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

        // 生成自定义文件名: photo_身份证号_时间戳 (避免中文，符合URL规范)
        const currentTime = dayjs().format('YYYYMMDD_HHmmss');
        const idCardNo = this.dataForm.idCardNo || 'unknown';
        const fileExtension = this.pendingImageFile.name.split('.').pop();
        const customFileName = `photo_${idCardNo}_${currentTime}.${fileExtension}`;

        const uploadData = {
          applicantId: this.dataForm.id,
          fileName: customFileName,
          fileContent: base64Content,
          fileSize: this.pendingImageFile.size,
          mimeType: this.pendingImageFile.type,
          biz: this.imageBizUrl
        };

        const response = await axios({
          url: this.imageUploadUrl,
          method: 'POST',
          data: uploadData
        });

        if (response.data.code === 2000) {
          // 后端返回的相对路径，如 "images/xxx.jpg"
          const relative = response.data.data;
          // 使用安全的URL构建函数
          this.dataForm.photoUrl = this.buildSafeImageUrl(relative);
          ElMessage.success('照片上传成功');

          // 清空待上传的文件和预览
          this.pendingImageFile = null;
          this.pendingImagePreview = '';
        } else {
          ElMessage.error(response.data.message || '照片上传失败');
        }
      } catch (error) {
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

    // URL编码处理工具函数 - 处理文件名（简化版，文件名现已使用ASCII字符）
    encodeImageUrl(fileName) {
      if (!fileName) return '';

      // 如果是完整URL（包含baseUrl），先分离路径和文件名
      if (fileName.includes(this.imageViewUrl)) {
        fileName = fileName.replace(this.imageViewUrl, '');
      }

      // 文件名已使用ASCII字符，无需特殊编码，直接返回
      // 格式如：photo/photo_18687654321_20251015_152151.jpg
      return fileName;
    },

    // 构建安全的图片访问URL
    buildSafeImageUrl(fileName) {
      if (!fileName) return '';

      // 如果已经是完整URL，直接返回
      if (fileName.startsWith('http')) {
        return fileName;
      }

      // 编码文件名并构建URL
      const encodedFileName = this.encodeImageUrl(fileName);
      return this.imageViewUrl + encodedFileName;
    },

    //************************************************ 第4部分：附件数据 *****************************************************

    // 初始化

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

        const response = await axios({
          url: this.attachmentListUrl,
          method: 'POST',
          data: {
            applicantId: this.dataForm.id
          }
        });

        if (response.data.code === 2000 && Array.isArray(response.data.data)) {
          // 标记附件已加载
          this.tabsLoadedState.attachments = true;
          // 将后端数据按类型分组
          const attachmentsByType = {};
          response.data.data.forEach(attachment => {
            // 兼容处理：attachmentType 可能是对象 {key, value} 或直接是字符串
            const typeKey = typeof attachment.attachmentType === 'object' && attachment.attachmentType !== null
              ? attachment.attachmentType.key
              : attachment.attachmentType;
            attachmentsByType[typeKey] = attachment;
          });

          // 更新附件表格数据，设置附件ID和状态
          const typeKeyMap = {
            '1': 'idCard',      // 身份证
            '2': 'degree',      // 学位证
            '3': 'graduation',  // 毕业证
            '4': 'eduReg',      // 学历证书备案表
            '5': 'gradVerify'   // 毕业证在线验证报告
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

          // 同步五类文件数组,便于预览/下载按钮立即可用
          this.idCardFiles = this.buildFileItem(attachmentsByType['1']);
          this.degreeCertFiles = this.buildFileItem(attachmentsByType['2']);
          this.graduationCertFiles = this.buildFileItem(attachmentsByType['3']);
          this.educationRegFiles = this.buildFileItem(attachmentsByType['4']);
          this.graduationVerifyFiles = this.buildFileItem(attachmentsByType['5']);
        }
      } catch (e) {
        ElMessage.warning('加载附件列表失败');
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

    // 一键打包下载（内部实现）
    async downloadBatchAttachmentsInternal(applicantId) {
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
          method: 'post',
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

        // 生成自定义文件名: attachment_身份证号_附件类型code_时间戳 (避免中文，符合URL规范)
        const currentTime = dayjs().format('YYYYMMDD_HHmmss');
        const idCardNo = this.dataForm.idCardNo || 'unknown';
        const attachmentTypeCode = attachmentTypeMap[type]?.code || 0;
        const fileExtension = file.name.split('.').pop();
        const customFileName = `attachment_${idCardNo}_${attachmentTypeCode}_${currentTime}.${fileExtension}`;

        const uploadData = {
          applicantId: this.dataForm.id,
          attachmentType: attachmentTypeMap[type]?.code || 1,
          fileName: customFileName,
          fileContent: base64Content,
          fileSize: file.size,
          mimeType: file.type,
          biz: this.attachmentBizUrl
        };

        const response = await axios({
          url: this.attachmentUploadUrl,
          method: 'POST',
          data: uploadData
        });

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

        const resp = await axios({
          url: this.attachmentDeleteUrl,
          method: 'POST',
          data: { id: attachmentId }
        });
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
          ElMessage.error(resp.message || '删除失败');
        }
      } catch (e) {
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

        // 生成自定义文件名: attachment_身份证号_附件类型code_时间戳 (避免中文，符合URL规范)
        const currentTime = dayjs().format('YYYYMMDD_HHmmss');
        const idCardNo = this.dataForm.idCardNo || 'unknown';
        const attachmentTypeCode = this.attachmentTypeMap[type]?.code || 0;
        const fileExtension = fileInfo.file.name.split('.').pop();
        const customFileName = `attachment_${idCardNo}_${attachmentTypeCode}_${currentTime}.${fileExtension}`;

        const uploadData = {
          applicantId: this.dataForm.id,
          attachmentType: this.attachmentTypeMap[type]?.code || 1,
          fileName: customFileName,
          fileContent: base64Content,
          fileSize: fileInfo.file.size,
          mimeType: fileInfo.file.type,
          biz: this.attachmentBizUrl
        };

        const response = await axios({
          url: this.attachmentUploadUrl,
          method: 'POST',
          data: uploadData
        });

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
          throw new Error(response.message || '上传失败');
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

    //********************************************** 第5部分：岗位选择弹窗 *************************************************

    // 岗位查询
    async searchPositionList() {
      try {
        // 显示加载状态
        this.positionSelectLoading = true;

        const payload = {
          deptName: this.positionSearchForm.deptName || '',
          deptNo: this.positionSearchForm.deptNo || '',
          positionName: this.positionSearchForm.positionName || '',
          positionNo: this.positionSearchForm.positionNo || '',
          openFlag: this.positionSearchForm.openFlag || ''
        };
        const resp = await axios({
          url: this.positionJobUrl + '?pageNum=' + this.positionCurrentPage + '&pageSize=' + this.positionPageSize,
          method: 'POST',
          data: payload
        });
        console.log('岗位查询响应:', resp);

        if (resp?.data.code === 2000) {
          this.positionList = resp.data.data.records || [];
          this.positionTotal = resp.data.data.total || 0;
        } else {
          ElMessage.error(resp?.data.message || '获取岗位数据失败');
        }
      } catch (e) {
        console.error('岗位查询异常:', e);
        ElMessage.error('网络请求失败');
      } finally {
        // 隐藏加载状态
        this.positionSelectLoading = false;
      }
    },

    // 岗位搜索重置
    resetPositionSearch() {
      this.positionSearchForm = {
        deptName: '',
        deptNo: '',
        positionName: '',
        positionNo: '',
        openFlag: 'Y'  // 默认选择"是"
      };
      this.positionCurrentPage = 1;
      this.searchPositionList();
    },

    // 岗位表格行变更
    handlePositionRowChange(row) {
      this.positionSelectedRow = row || null;
    },

    // 岗位分页-页码 - 后端分页需要重新查询
    handlePositionCurrentChange(val) {
      this.positionCurrentPage = val;
      this.searchPositionList();
    },

    // 岗位分页-大小 - 后端分页需要重新查询
    handlePositionSizeChange(val) {
      this.positionPageSize = val;
      this.positionCurrentPage = 1;
      this.searchPositionList();
    },

    // 确认选择岗位
    confirmPositionSelection() {
      if (!this.positionSelectedRow) {
        ElMessage.warning('请先选择一个岗位');
        return;
      }
      // 将选中的岗位编码回填至 applyPosition，用于保存
      this.dataForm.applyPosition = this.positionSelectedRow.positionNo || '';
      // 显示名称单独存放
      this.dataForm.applyPositionName = this.positionSelectedRow.positionName || '';
      this.positionSelectDialogVisible = false;
    },

    //************************************************ 区域：辅助方法 *****************************************************

    // 姓名与本人签字同步
    syncSignatureWithName() {
      // 将姓名自动填充到本人签字
      this.dataForm.signature = this.dataForm.applicantName || '';
    },

    // 电话号码验证器（支持手机号和座机号）
    validatePhoneNumber(rule, value, callback) {
      if (!value) {
        callback();
        return;
      }

      // 去除空格和连字符，只保留数字
      const cleanValue = value.replace(/[\s-]/g, '');

      // 手机号：1[3-9]开头的11位数字
      const mobilePattern = /^1[3-9]\d{9}$/;

      // 座机号：支持以下格式
      // 1. 3位区号 + 7-8位号码：010-12345678、010-1234567、01012345678
      // 2. 4位区号 + 7-8位号码：0571-87654321、0571-8765432、057187654321
      // 3. 纯号码（无区号）：12345678、1234567
      const landlinePattern = /^(0\d{2,3})?\d{7,8}$/;

      if (mobilePattern.test(cleanValue) || landlinePattern.test(cleanValue)) {
        callback();
      } else {
        callback(new Error('请输入正确的手机号(11位)或座机号(如:010-12345678)'));
      }
    },

    // 获取学历标签
    getEducationLevelLabel(key) {
      if (!this.attrLists.educationLevelOptions || this.attrLists.educationLevelOptions.length === 0) {
        return key; // 如果枚举数据未加载，返回原始key
      }
      const option = this.attrLists.educationLevelOptions.find(item => item.key === key);
      return option ? option.value : key;
    },

    // 获取院校类别标签
    getSchoolNatureLabel(key) {
      if (!this.attrLists.schoolNatureOptions || this.attrLists.schoolNatureOptions.length === 0) {
        return key; // 如果枚举数据未加载，返回原始key
      }
      const option = this.attrLists.schoolNatureOptions.find(item => item.key === key);
      return option ? option.value : key;
    },

    // 获取关系标签
    getRelationshipLabel(key) {
      if (!this.attrLists.relationshipOptions || this.attrLists.relationshipOptions.length === 0) {
        return key; // 如果枚举数据未加载，返回原始key
      }
      const option = this.attrLists.relationshipOptions.find(item => item.key === key);
      return option ? option.value : key;
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

    // 格式化月份（用于工作经历、培训经历、学习经历）
    formatMonth(date) {
      if (!date) {
        return '-';
      }
      return dayjs(date).format('YYYY-MM');
    },

    // 将月份格式转换为完整日期格式（用于后端保存）
    convertMonthToFullDate(monthValue) {
      if (!monthValue) {
        return '';
      }

      // 如果是YYYY-MM格式，添加-01
      if (typeof monthValue === 'string' && monthValue.match(/^\d{4}-\d{2}$/)) {
        return monthValue + '-01';
      }

      // 如果已经是Date对象或其他格式，转换为YYYY-MM-01格式
      const datePart = dayjs(monthValue).format('YYYY-MM');
      return datePart + '-01';
    },

    // 解析身份证号，自动填充性别和出生日期
    parseIdCard(idCardNo) {
      if (!idCardNo || idCardNo.length !== 18) {
        return;
      }

      try {
        // 提取出生日期（第7-14位）
        const year = idCardNo.substring(6, 10);
        const month = idCardNo.substring(10, 12);
        const day = idCardNo.substring(12, 14);
        const birthDate = `${year}-${month}-${day}`;

        // 验证日期是否有效
        if (dayjs(birthDate).isValid()) {
          this.dataForm.birthDate = birthDate;
        }

        // 提取性别（第17位，奇数为男，偶数为女）
        const genderDigit = parseInt(idCardNo.substring(16, 17));
        if (!isNaN(genderDigit)) {
          this.dataForm.gender = genderDigit % 2 === 1 ? "M" : "F";
        }
      } catch (error) {
        // 身份证号解析失败，静默处理
      }
    },

    // 处理退役军人状态变化
    handleVeteranStatusChange() {
      // 当退役军人状态改变时，重新验证退役时间和退役编号字段
      this.$nextTick(() => {
        if (this.$refs.dataFormRef) {
          this.$refs.dataFormRef.validateField('dischargeDate');
          this.$refs.dataFormRef.validateField('dischargeCertNo');
        }
      });
    },

    // 窗口大小监听
    handleResize() {
      this.dataTableHeight = window.innerHeight - 176;
      window.addEventListener('resize', this.handleResize);
    },

    // 获取枚举文本
    getEnumLabel(options, key) {
      // 安全检查：key 为空时返回 '-'
      if (key === null || key === undefined) {
        return '-';
      }

      // 如果 key 已经是对象（包含 value 属性），直接返回 value
      if (typeof key === 'object' && key.value !== undefined) {
        return key.value || '-';
      }

      // 否则，从 options 中查找
      if (!options || !Array.isArray(options)) {
        return '-';
      }

      // 先尝试严格匹配
      let item = options.find(x => x.key === key);
      // 如果没找到，尝试类型转换后匹配（数字与字符串互转）
      if (!item) {
        item = options.find(x => x.key == key || x.key.toString() === key.toString());
      }
      return item ? item.value : '-';
    },
  }
};
