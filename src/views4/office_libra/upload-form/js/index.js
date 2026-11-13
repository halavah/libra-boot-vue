import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'upload-form',
  setup() {
    // 加载
    // 1.主页面
    // 2.弹框表单
    const loading = ref(false)
    const dataFormLoading = ref(false)

    // 筛选-树
    // 1.节点属性
    // 2.节点数据
    // 3.原始节点数据
    const treeProps = {
      label: 'plname',
      children: 'children',
    }
    const treeData = ref([])
    const originalTreeData = ref([])

    // 筛选-表单
    // 1.ref
    // 2.规则
    const searchFormRef = ref('')
    const searchFormRules = reactive({
      // equipmentNo: [
      //     {required: true, message: '请输入设备号', trigger: 'blur'},
      // ],
      vDay: [
        { type: 'array', required: true, message: '请选择日期范围', trigger: 'change' }
      ],
    })

    // 筛选-表格
    // 1.ref
    // 2.可选行数
    // 3.当前行
    const dataTableRef = ref('')
    const selectionRows = [];
    const currentRow = {};

    // 筛选-表格-分页
    // 1.数据列表高H = WindowH - (HeaderH_60 + SearchFormH_50 + MainPaddingTop_20) - PagerH_36 - 10
    // 2.分页大小：可选15, 25, 35, 50, 100
    // 3.分页大小，默认：15
    // 4.当前页：1
    // 5.总数：默认置0
    const dataTableHeight = ref(window.innerHeight - 176)
    const pageSizes = ref([10, 15, 25, 35, 50, 100])
    const pageSize = ref(10)
    const currentPage = ref(1)
    const dataTotal = ref(0)

    // 筛选-表格-弹框表单
    // 1.ref
    // 2.标题
    // 3.可见性
    // 4.状态：create、update、detail
    const dataFormRef = ref('')
    const dataFormTitle = ref('详情')
    const dataFormVisible = ref(false)
    const dataFormStatus = ref('');

    // 筛选-表格-弹框表单-标签页控制
    const activeTab = ref('basic')

    // ===== 文件上传 =====
    // 文件地址
    const fileUrl = "http://localhost:9932/libra-office/file/upload"
    // 图片地址
    const imageUrl = "http://localhost:9932/libra-office/file/static/"
    // 调用Token
    const uploadHeaders = {
      'X-Access-Token': ''
    }
    // 上传前处理函数
    const beforeUpload = (file) => {
      const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isJPGOrPNG) {
        ElMessage.error('只能上传JPG/PNG格式的图片!');
        return false;
      }
      if (!isLt10M) {
        ElMessage.error('图片大小不能超过10MB!');
        return false;
      }
      return true;
    }
    // 上传处理失败函数
    const handleUploadError = (error, uploadFile) => {
      console.error('上传失败：', error);
      ElMessage.error('上传失败');
    }

    // ===== 图片预览 =====
    // 弹框地址
    const dialogImageUrl = ref('');
    // 弹框显示
    const dialogVisible = ref(false);
    // 关闭预览
    const closePreview = () => {
      dialogVisible.value = false;
    };

    // ===== 1.图片列表 =====
    // 点击上传列表
    const fileListControl = ref([]);
    // 点击上传成功处理
    const handleUploadSuccess = (response, uploadFile) => {
      if (response.success) {
        uploadFile.url = imageUrl + response.message;
        uploadFile.path = response.message;
        ElMessage.success('上传成功');
        console.log('上传成功，文件路径：', response.message);
      } else {
        ElMessage.error(response.message || '上传失败');
      }
    }
    // 文件列表变化处理
    const handleFileListChange = (file, fileList) => {
      fileListControl.value = fileList;
    }
    // 文件列表控制上传的图片预览
    const handleFileListPreview = (file) => {
      dialogImageUrl.value = file.url || URL.createObjectURL(file.raw);
      dialogVisible.value = true;
    }

    // ===== 2.图片列表-缩略图 =====
    // 缩略图列表
    const thumbnailFileList = ref([]);
    // 缩略图列表上传成功处理
    const handleThumbnailSuccess = (response, uploadFile) => {
      if (response.success) {
        ElMessage.success('缩略图上传成功');
        uploadFile.url = imageUrl + response.message;
        uploadFile.path = response.message;
        uploadFile.name = uploadFile.name || '图片' + (thumbnailFileList.value.length + 1);
      } else {
        ElMessage.error(response.message || '缩略图上传失败');
      }
    }
    // 缩略图列表变化处理
    const handleThumbnailChange = (file, fileList) => {
      thumbnailFileList.value = fileList;
    }
    // 缩略图预览处理
    const handleThumbnailPreview = (file) => {
      dialogImageUrl.value = file.url || URL.createObjectURL(file.raw);
      dialogVisible.value = true;
    }
    // 缩略图删除处理
    const handleThumbnailRemove = (file, fileList) => {
      ElMessage.success('缩略图已删除');
      thumbnailFileList.value = fileList;
      // 后端删除接口
      const filePath = file.path
      axios.delete(`/api/delete-file?path=${filePath}`)
    }

    // ===== 3.头像上传 =====
    // 头像上传列表
    const fileList = ref([]);
    // 头像上传成功处理
    const handleAvatarSuccess = (response, file, fileList) => {
      if (response.success) {
        ElMessage.success('上传成功');
        file.url = imageUrl + response.message;
        file.path = response.message;
        console.log('上传成功，文件路径：', response.message);
      } else {
        ElMessage.error(response.message || '上传失败');
      }
    }
    // 头像上传预览
    const handlePictureCardPreview = (file) => {
      dialogImageUrl.value = file.url;
      dialogVisible.value = true;
    }
    // 头像删除处理
    const handleRemove = (file, fileList) => {
      ElMessage.success('图片已删除');
      // 后端删除接口
      const filePath = file.path
      axios.delete(`/api/delete-file?path=${filePath}`)
    }

    // ===== 4.拖拽上传 =====
    // 拖拽上传列表
    const dragFileList = ref([]);
    // 拖拽上传成功处理
    const handleDragUploadSuccess = (response, uploadFile) => {
      if (response.success) {
        ElMessage.success('拖拽上传成功');
        uploadFile.url = imageUrl + response.message;
        uploadFile.path = response.message;
      } else {
        ElMessage.error(response.message || '拖拽上传失败');
      }
    }
    // 拖拽上传的文件列表变化
    const handleDragFileChange = (file, fileList) => {
      dragFileList.value = fileList;
    }
    // 拖拽上传的图片预览
    const handleDragUploadPreview = (file) => {
      dialogImageUrl.value = file.url || URL.createObjectURL(file.raw);
      dialogVisible.value = true;
    }

    // ===== 5.典型表单1 =====
    // 典型表单数据
    const typicalForm = reactive({
      name: '',
      region: '',
      date: '',
      time: '',
      delivery: false,
      type: [],
      resource: '',
      desc: '',
      coverUrl: '',
      galleryList: [],
      attachmentList: []
    });
    // 重置表单
    const resetTypicalForm = () => {
      typicalForm.name = '';
      typicalForm.region = '';
      typicalForm.date = '';
      typicalForm.time = '';
      typicalForm.delivery = false;
      typicalForm.type = [];
      typicalForm.resource = '';
      typicalForm.desc = '';
      typicalForm.coverUrl = '';
      typicalForm.galleryList = [];
      typicalForm.attachmentList = [];
    };
    // 提交表单
    const submitTypicalForm = () => {
      if (!typicalForm.name || !typicalForm.region) {
        ElMessage.warning('请填写必填项');
        return;
      }
      ElMessage.success('提交成功！');
    };

    // ===== 5.典型表单2 =====
    // 1.封面图上传成功
    const handleTypicalCoverSuccess = (response, file) => {
      if (response.success) {
        typicalForm.coverUrl = imageUrl + response.message;
        file.path = response.message;
        ElMessage.success('封面图上传成功');
      } else {
        ElMessage.error(response.message || '封面图上传失败');
      }
    };
    // 2.图集上传成功
    const handleTypicalGallerySuccess = (response, file, fileList) => {
      if (response.success) {
        file.url = imageUrl + response.message;
        file.path = response.message;
        ElMessage.success('图片上传成功');
      } else {
        ElMessage.error(response.message || '图片上传失败');
      }
    };
    // 2.图集预览
    const handleTypicalGalleryPreview = (file) => {
      dialogImageUrl.value = file.url || URL.createObjectURL(file.raw);
      dialogVisible.value = true;
    };
    // 2.图集删除
    const handleTypicalGalleryRemove = (file, fileList) => {
      typicalForm.galleryList = fileList;
      ElMessage.success('图片已删除');
    };
    // 3.附件上传成功
    const handleTypicalAttachmentSuccess = (response, file, fileList) => {
      if (response.success) {
        file.url = imageUrl + response.message;
        file.path = response.message;
        ElMessage.success('附件上传成功');
      } else {
        ElMessage.error(response.message || '附件上传失败');
      }
    };
    // 3.附件预览
    const handleTypicalAttachmentPreview = (file) => {
      const fileExt = file.name.split('.').pop().toLowerCase();

      // PDF直接预览
      if (fileExt === 'pdf') {
        window.open(file.url, '_blank');
        return;
      }

      // 图片类型直接预览
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
        dialogImageUrl.value = file.url;
        dialogVisible.value = true;
        return;
      }

      // 其他类型默认下载
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    };
    // 3.附件删除
    const handleTypicalAttachmentRemove = (file, fileList) => {
      typicalForm.attachmentList = fileList;
      ElMessage.success('附件已删除');
    };

    // 返回
    return {
      // 加载
      loading,
      dataFormLoading,

      // 筛选-树
      treeProps,
      treeData,
      originalTreeData,

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

      // 筛选-表格-弹框表单-标签页控制
      activeTab,

      // 文件上传
      fileUrl,
      imageUrl,
      uploadHeaders,
      beforeUpload,
      handleUploadError,

      // 图片预览
      dialogImageUrl,
      dialogVisible,
      closePreview,

      // 1.图片列表
      fileListControl,
      handleUploadSuccess,
      handleFileListChange,
      handleFileListPreview,

      // 2.图片列表-缩略图
      thumbnailFileList,
      handleThumbnailSuccess,
      handleThumbnailChange,
      handleThumbnailPreview,
      handleThumbnailRemove,

      // 3.头像上传
      fileList,
      handleAvatarSuccess,
      handlePictureCardPreview,
      handleRemove,

      // 4.拖拽上传
      dragFileList,
      handleDragUploadSuccess,
      handleDragFileChange,
      handleDragUploadPreview,

      // 5.典型表单1
      typicalForm,
      resetTypicalForm,
      submitTypicalForm,

      // 5.典型表单2
      // 5.1.封面图
      handleTypicalCoverSuccess,
      // 5.2.图集
      handleTypicalGallerySuccess,
      handleTypicalGalleryPreview,
      handleTypicalGalleryRemove,
      // 5.3.附件
      handleTypicalAttachmentSuccess,
      handleTypicalAttachmentPreview,
      handleTypicalAttachmentRemove,
    };
  },
  data() {
    return {
      // 通用-地址
      wsUrl: 'http://localhost:9932/libra-office',
      // 通用-属性
      attrCnts: {
        yesOrNo: ['是', '否'],
        relegationNamesOptions: [],
      },
      // 筛选-表单
      searchForm: {
        plNoKey: [],
        equipmentNo: '',
        breakDownNo: '',
        relegationNames: '',
        vDay: [
          dayjs().startOf('year').format('YYYY-MM-DD'),
          dayjs().format('YYYY-MM-DD')
        ],
      },
      // 筛选-表格
      dataList: [],
      // 筛选-表格-弹框表单
      dataForm: {
        plNo: '', // 厂处编号
        plName: '', // 厂处中文名
        breakDownNo: '', // 事故编号
        informDate: '', // 停机起始日期
        informTime: '', // 停机起始时间
        informfullDate: '', // 停机起始完整日期
        arriveDate: '', // 停机结束日期
        arriveTime: '', // 停机结束时间
        arrivefullDate: '', // 停机结束完整日期
        totalBreakTime: '', // 停机总时间
        breakDownGrade: '', // 重要度
        bkPart: '', // 故障部位
        bkReason: '', // 不良原因
        breakDownName: '', // 维护履历名称
        relegation: '', // 事故归属
        textArea2: '', // 退货原因分析
        textArea3: '', // 改进防范措施
        textArea4: '', // 改进防范措施
        measureName: '', // 整改措施内容
        reportMemo: '', // 整改回报内容
      },

      // 设备号模糊查询
      equipmentNoTableVisible: false, // 设备号表格是否显示
      equipmentNoTableData: [],       // 设备号表格数据
      equipmentNoTablePage: 1,        // 当前页码
      equipmentNoTablePageSize: 5,    // 每页条数

      // mock数据
      listData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501042501-001",
            "breakDownName": "演示订单售后记录002",
            "plNo": "Y501",
            "equipmentName": "演示商品003",
            "relegationName": "机械",
            "equipmentNo": "Y501042501",
            "informDate": "2025-05-22",
            "imageUrl": "https://picsum.photos/200/200?random=1"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501041302-001",
            "breakDownName": "演示订单售后记录003",
            "plNo": "Y501",
            "equipmentName": "演示商品004",
            "relegationName": "机械",
            "equipmentNo": "Y501041302",
            "informDate": "2025-05-21",
            "imageUrl": "https://picsum.photos/200/200?random=2"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501041805-001",
            "breakDownName": "演示订单售后记录004",
            "plNo": "Y501",
            "equipmentName": "演示商品005",
            "relegationName": "机械",
            "equipmentNo": "Y501041805",
            "informDate": "2025-05-16",
            "imageUrl": "https://picsum.photos/200/200?random=3"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201020104-001",
            "breakDownName": "家电旗舰店一工场二商品分组1#编码器异常事故",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录005",
            "relegationName": "电气",
            "equipmentNo": "Y201020104",
            "informDate": "2025-05-13",
            "imageUrl": "https://picsum.photos/200/200?random=4"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201060303-001",
            "breakDownName": "家电旗舰店二商品分组PF链停",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录006",
            "relegationName": "机械",
            "equipmentNo": "Y201060303",
            "informDate": "2025-05-13",
            "imageUrl": "https://picsum.photos/200/200?random=5"
          },
          {
            "plName": "美妆旗舰店-商品分组01",
            "breakDownNo": "W901020701-001",
            "breakDownName": "一线密封风机电机烧",
            "plNo": "W901",
            "equipmentName": "演示商品006",
            "relegationName": "机械",
            "equipmentNo": "W901020701",
            "informDate": "2025-05-12",
            "imageUrl": "https://picsum.photos/200/200?random=6"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033616-001",
            "breakDownName": "演示订单售后记录007",
            "plNo": "Y801",
            "equipmentName": "演示商品007",
            "relegationName": "电气",
            "equipmentNo": "Y802033616",
            "informDate": "2025-05-12",
            "imageUrl": "https://picsum.photos/200/200?random=7"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501041706-001",
            "breakDownName": "演示订单售后记录008",
            "plNo": "Y501",
            "equipmentName": "演示商品005",
            "relegationName": "电气",
            "equipmentNo": "Y501041706",
            "informDate": "2025-05-05",
            "imageUrl": "https://picsum.photos/200/200?random=8"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401060511-001",
            "breakDownName": "演示订单售后记录009",
            "plNo": "Y401",
            "equipmentName": "演示商品008",
            "relegationName": "机械",
            "equipmentNo": "Y401060511",
            "informDate": "2025-04-30",
            "imageUrl": "https://picsum.photos/200/200?random=9"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201020706-001",
            "breakDownName": "演示订单售后记录010",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录011",
            "relegationName": "机械",
            "equipmentNo": "Y201020706",
            "informDate": "2025-04-24",
            "imageUrl": "https://picsum.photos/200/200?random=10"
          },
          {
            "plName": "美妆旗舰店-商品分组03",
            "breakDownNo": "W903050101-003",
            "breakDownName": "关于顺盛三线入库斗提机链条异响售后报告",
            "plNo": "W903",
            "equipmentName": "演示商品009",
            "relegationName": "机械",
            "equipmentNo": "W903050101",
            "informDate": "2025-04-23",
            "imageUrl": "https://picsum.photos/200/200?random=11"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033509-003",
            "breakDownName": "演示订单售后记录012",
            "plNo": "Y801",
            "equipmentName": "演示商品010",
            "relegationName": "电气",
            "equipmentNo": "Y802033509",
            "informDate": "2025-04-23",
            "imageUrl": "https://picsum.photos/200/200?random=12"
          },
          {
            "plName": "数码旗舰店-商品分组03",
            "breakDownNo": "W461171007-001",
            "breakDownName": "售后报告",
            "plNo": "W403",
            "equipmentName": "演示订单售后记录013",
            "relegationName": "电气",
            "equipmentNo": "W461171007",
            "informDate": "2025-04-21",
            "imageUrl": "https://picsum.photos/200/200?random=13"
          },
          {
            "plName": "服饰旗舰店-商品分组01",
            "breakDownNo": "Y201030504-001",
            "breakDownName": "演示订单售后记录014",
            "plNo": "Y201",
            "equipmentName": "演示订单售后记录015",
            "relegationName": "电气",
            "equipmentNo": "Y201030504",
            "informDate": "2025-04-21",
            "imageUrl": "https://picsum.photos/200/200?random=14"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501020508-001",
            "breakDownName": "演示订单售后记录016",
            "plNo": "Y501",
            "equipmentName": "演示商品011",
            "relegationName": "机械",
            "equipmentNo": "Y501020508",
            "informDate": "2025-04-20",
            "imageUrl": "https://picsum.photos/200/200?random=14"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802031207-001",
            "breakDownName": "演示订单售后记录017",
            "plNo": "Y801",
            "equipmentName": "演示商品012",
            "relegationName": "电气",
            "equipmentNo": "Y802031207",
            "informDate": "2025-04-20",
            "imageUrl": "https://picsum.photos/200/200?random=15"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802031701-002",
            "breakDownName": "演示订单售后记录018",
            "plNo": "Y801",
            "equipmentName": "演示商品013",
            "relegationName": "电气",
            "equipmentNo": "Y802031701",
            "informDate": "2025-04-20",
            "imageUrl": "https://picsum.photos/200/200?random=16"
          },
          {
            "plName": "美妆旗舰店-商品分组04",
            "breakDownNo": "W904020401-003",
            "breakDownName": "关于四线立磨主辊液压站故障售后报告",
            "plNo": "W904",
            "equipmentName": "演示订单售后记录019",
            "relegationName": "机械",
            "equipmentNo": "W904020401",
            "informDate": "2025-04-19",
            "imageUrl": "https://picsum.photos/200/200?random=17"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401060301-001",
            "breakDownName": "1号下夹送辊裂纹事故",
            "plNo": "Y401",
            "equipmentName": "演示商品014",
            "relegationName": "机械",
            "equipmentNo": "Y401060301",
            "informDate": "2025-04-18",
            "imageUrl": "https://picsum.photos/200/200?random=18"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802030812-001",
            "breakDownName": "演示订单售后记录020",
            "plNo": "Y801",
            "equipmentName": "演示订单售后记录021",
            "relegationName": "机械",
            "equipmentNo": "Y802030812",
            "informDate": "2025-04-18",
            "imageUrl": "https://picsum.photos/200/200?random=19"
          },
          {
            "plName": "图书旗舰店-商品分组01",
            "breakDownNo": "Y802033906-001",
            "breakDownName": "演示订单售后记录022",
            "plNo": "Y801",
            "equipmentName": "演示订单售后记录023",
            "relegationName": "机械",
            "equipmentNo": "Y802033906",
            "informDate": "2025-04-17",
            "imageUrl": "https://picsum.photos/200/200?random=20"
          },
          {
            "plName": "美妆旗舰店-商品分组04",
            "breakDownNo": "W904020401-002",
            "breakDownName": "关于四线立磨主辊液压站故障售后报告",
            "plNo": "W904",
            "equipmentName": "演示订单售后记录019",
            "relegationName": "机械",
            "equipmentNo": "W904020401",
            "informDate": "2025-04-15",
            "imageUrl": "https://picsum.photos/200/200?random=21"
          },
          {
            "plName": "食品旗舰店",
            "breakDownNo": "Y501020101-001",
            "breakDownName": "演示订单售后记录024",
            "plNo": "Y501",
            "equipmentName": "演示商品015",
            "relegationName": "机械",
            "equipmentNo": "Y501020101",
            "informDate": "2025-04-14",
            "imageUrl": "https://picsum.photos/200/200?random=22"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812012007-001",
            "breakDownName": "酸平线氩弧焊机剪切油缸缸头断裂处理的售后报告",
            "plNo": "Y807",
            "equipmentName": "演示商品016",
            "relegationName": "机械",
            "equipmentNo": "Y812012007",
            "informDate": "2025-04-12",
            "imageUrl": "https://picsum.photos/200/200?random=23"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812021916-001",
            "breakDownName": "酸平线平整机下支承辊接轴异响处理",
            "plNo": "Y807",
            "equipmentName": "演示商品017",
            "relegationName": "机械",
            "equipmentNo": "Y812021916",
            "informDate": "2025-04-06",
            "imageUrl": "https://picsum.photos/200/200?random=24"
          },
          {
            "plName": "母婴旗舰店",
            "breakDownNo": "Y401113402-002",
            "breakDownName": "测厚仪射源无法启动故障",
            "plNo": "Y401",
            "equipmentName": "演示订单售后记录025",
            "relegationName": "电气",
            "equipmentNo": "Y401113402",
            "informDate": "2025-04-04",
            "imageUrl": "https://picsum.photos/200/200?random=25"
          },
          {
            "plName": "服饰旗舰店-商品分组02",
            "breakDownNo": "Y202040903-001",
            "breakDownName": "家电旗舰店一工场三商品分组预穿水阀门事故",
            "plNo": "Y202",
            "equipmentName": "演示订单售后记录026",
            "relegationName": "机械",
            "equipmentNo": "Y202040903",
            "informDate": "2025-04-03",
            "imageUrl": "https://picsum.photos/200/200?random=26"
          },
          {
            "plName": "图书旗舰店-商品分组07",
            "breakDownNo": "Y812012010-001",
            "breakDownName": "近期酸平板面压坑缺陷处理",
            "plNo": "Y807",
            "equipmentName": "演示商品018",
            "relegationName": "机械",
            "equipmentNo": "Y812012010",
            "informDate": "2025-04-03",
            "imageUrl": "https://picsum.photos/200/200?random=27"
          },
        ],
        "timestamp": 1748142625543
      },
      plNoTreeData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "parent_plno": null,
            "plname": "根节点",
            "children": [
              {
                "parent_plno": "A1",
                "plname": "电商物流中心",
                "children": [
                  {
                    "parent_plno": "W1",
                    "plname": "电商物流中心-商品分组01",
                    "plno": "W101"
                  }
                ],
                "plno": "W1"
              },
              {
                "parent_plno": "A1",
                "plname": "商品运营中心",
                "children": [
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组01",
                    "plno": "W201"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组02",
                    "plno": "W202"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组03",
                    "plno": "W203"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组04",
                    "plno": "W204"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组05",
                    "plno": "W205"
                  },
                  {
                    "parent_plno": "W2",
                    "plname": "商品运营中心-商品分组06",
                    "plno": "W206"
                  }
                ],
                "plno": "W2"
              },
              {
                "parent_plno": "A1",
                "plname": "自营店铺",
                "children": [
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组01",
                    "plno": "W301"
                  },
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组02",
                    "plno": "W302"
                  },
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组03",
                    "plno": "W303"
                  },
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组04",
                    "plno": "W304"
                  },
                  {
                    "parent_plno": "W3",
                    "plname": "自营店铺-商品分组05",
                    "plno": "W305"
                  }
                ],
                "plno": "W3"
              },
              {
                "parent_plno": "A1",
                "plname": "数码旗舰店",
                "children": [
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组01",
                    "plno": "W401"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组02",
                    "plno": "W402"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组03",
                    "plno": "W403"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组04",
                    "plno": "W404"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组05",
                    "plno": "W405"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组06",
                    "plno": "W406"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组07",
                    "plno": "W407"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组08",
                    "plno": "W408"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组09",
                    "plno": "W409"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组10",
                    "plno": "W410"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组11",
                    "plno": "W411"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组12",
                    "plno": "W412"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组13",
                    "plno": "W413"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组14",
                    "plno": "W414"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组15",
                    "plno": "W415"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组16",
                    "plno": "W416"
                  },
                  {
                    "parent_plno": "W4",
                    "plname": "数码旗舰店-商品分组17",
                    "plno": "W417"
                  }
                ],
                "plno": "W4"
              },
              {
                "parent_plno": "A1",
                "plname": "客户服务中心",
                "children": [
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组01",
                    "plno": "W503"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组02",
                    "plno": "W504"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组03",
                    "plno": "W505"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组04",
                    "plno": "W506"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组05",
                    "plno": "W507"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组06",
                    "plno": "W508"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组07",
                    "plno": "W509"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组08",
                    "plno": "W510"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组09",
                    "plno": "W511"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组10",
                    "plno": "W512"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组11",
                    "plno": "W513"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组12",
                    "plno": "W514"
                  },
                  {
                    "parent_plno": "W5",
                    "plname": "客户服务中心-商品分组13",
                    "plno": "W515"
                  }
                ],
                "plno": "W5"
              },
              {
                "parent_plno": "A1",
                "plname": "家居旗舰店",
                "children": [
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组01",
                    "plno": "W801"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组02",
                    "plno": "W802"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组03",
                    "plno": "W803"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组04",
                    "plno": "W804"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组05",
                    "plno": "W805"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组06",
                    "plno": "W806"
                  },
                  {
                    "parent_plno": "W8",
                    "plname": "家居旗舰店-商品分组07",
                    "plno": "W807"
                  }
                ],
                "plno": "W8"
              },
              {
                "parent_plno": "A1",
                "plname": "美妆旗舰店",
                "children": [
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组01",
                    "plno": "W901"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组02",
                    "plno": "W902"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组03",
                    "plno": "W903"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组04",
                    "plno": "W904"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组05",
                    "plno": "W905"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组06",
                    "plno": "W906"
                  },
                  {
                    "parent_plno": "W9",
                    "plname": "美妆旗舰店-商品分组07",
                    "plno": "W907"
                  }
                ],
                "plno": "W9"
              },
              {
                "parent_plno": "A1",
                "plname": "户外旗舰店",
                "children": [
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组01",
                    "plno": "WA01"
                  },
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组02",
                    "plno": "WA02"
                  },
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组03",
                    "plno": "WA03"
                  },
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组04",
                    "plno": "WA04"
                  },
                  {
                    "parent_plno": "WA",
                    "plname": "户外旗舰店-商品分组05",
                    "plno": "WA05"
                  }
                ],
                "plno": "WA"
              },
              {
                "parent_plno": "A1",
                "plname": "服饰旗舰店",
                "children": [
                  {
                    "parent_plno": "Y2",
                    "plname": "服饰旗舰店-商品分组01",
                    "plno": "Y201"
                  },
                  {
                    "parent_plno": "Y2",
                    "plname": "服饰旗舰店-商品分组02",
                    "plno": "Y202"
                  },
                  {
                    "parent_plno": "Y2",
                    "plname": "服饰旗舰店-商品分组03",
                    "plno": "Y203"
                  }
                ],
                "plno": "Y2"
              },
              {
                "parent_plno": "A1",
                "plname": "运动旗舰店",
                "children": [
                  {
                    "parent_plno": "Y3",
                    "plname": "运动旗舰店-商品分组01",
                    "plno": "Y301"
                  },
                  {
                    "parent_plno": "Y3",
                    "plname": "运动旗舰店-商品分组02",
                    "plno": "Y302"
                  },
                  {
                    "parent_plno": "Y3",
                    "plname": "运动旗舰店-商品分组03",
                    "plno": "Y303"
                  }
                ],
                "plno": "Y3"
              },
              {
                "parent_plno": "A1",
                "plname": "母婴旗舰店",
                "children": null,
                "plno": "Y4"
              },
              {
                "parent_plno": "A1",
                "plname": "食品旗舰店",
                "children": null,
                "plno": "Y5"
              },
              {
                "parent_plno": "A1",
                "plname": "图书旗舰店",
                "children": [
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组01",
                    "plno": "Y801"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组02",
                    "plno": "Y802"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组03",
                    "plno": "Y803"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组04",
                    "plno": "Y804"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组05",
                    "plno": "Y805"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组06",
                    "plno": "Y806"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组07",
                    "plno": "Y807"
                  },
                  {
                    "parent_plno": "Y8",
                    "plname": "图书旗舰店-商品分组08",
                    "plno": "Y808"
                  }
                ],
                "plno": "Y8"
              }
            ],
            "plno": "A1"
          }
        ],
        "timestamp": 1745118762288
      },
      relegationNameTypeData: {
        "success": true,
        "message": "",
        "code": 200,
        "result": [
          {
            "relegationNameType": "电气"
          },
          {
            "relegationNameType": "机械"
          },
          {
            "relegationNameType": "原料、生产操作、工艺质量类"
          }
        ],
        "timestamp": 1748142663474
      }
    };
  },
  mounted() {
    // 1.查询
    this.query();
    // 2.查询树形列表
    this.queryTree();
    // 3.查询故障模式列表
    this.queryRelegationNames();
  },
  methods: {
    // 查询_表格
    async query() {
      let _this = this;
      _this.dataList = _this.listData.result;
      _this.dataTotal = _this.listData.result.length;
    },

    // 查询_树形列表
    async queryTree() {
      let _this = this;
      _this.treeData = _this.plNoTreeData.result;
      // 递归处理函数，为所有节点添加 key 和 isLeaf
      const processNode = (node) => {
        node.key = node.plno;
        node.isLeaf = !node.children || node.children.length === 0;
        if (node.children && node.children.length > 0) {
          node.children.forEach(processNode);
        }
      };
      const rootObject = _this.plNoTreeData.result[0];
      if (rootObject && rootObject.children) {
        rootObject.children.forEach(processNode);
        _this.treeData = rootObject.children;
        // 保存原始treeData副本
        _this.originalTreeData = JSON.parse(JSON.stringify(_this.treeData));
      } else {
        _this.treeData = [];
        _this.originalTreeData = [];
      }
    },

    // 查询_下拉框_商品售后模式
    async queryRelegationNames() {
      let _this = this;
      _this.attrCnts.relegationNamesOptions = _this.relegationNameTypeData.result.map(item => ({
        value: item.relegationNameType,
        label: item.relegationNameType
      }));
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
          // 重置时隐藏设备号模糊查询表格
          this.equipmentNoTableVisible = false;
        } else {
          ElMessage.warning('请检查相关参数');
        }
      })
    },

    // 按钮_重置
    async fun_reset(formEl) {
      let _this = this;
      if (!formEl) {
        return;
      }
      formEl.resetFields();
      _this.query();
      // 重置时隐藏设备号模糊查询表格
      this.equipmentNoTableVisible = false;
      this.equipmentNoTableData = [];
      this.equipmentNoTablePage = 1;
    },

    /*******************************************************调用：设备号输入*******************************************************/

    // 设备号输入监听
    onEquipmentNoInput(val) {
      let _this = this;
      // 限制长度
      if (val.length > 12) {
        _this.searchForm.equipmentNo = val.slice(0, 12);
        return;
      }
      // 自动产线匹配
      if (val.length >= 2) {
        const plNo = val.slice(0, 4);
        const found = _this.findPlNamesByPlNos([plNo], _this.treeData);
        if (found.length > 0) {
          _this.searchForm.plNoKey = [plNo];
        } else {
          // 检查treeData中是否已存在该节点
          if (!_this.treeData.some(node => node.plno === plNo)) {
            _this.treeData.push({
              plno: plNo,
              plname: plNo,
              key: plNo,
              isLeaf: true,
              children: []
            });
          }
          _this.searchForm.plNoKey = [plNo];
        }
      } else {
        _this.searchForm.plNoKey = [];
      }
      // 自动设备号模糊查询
      if (val.length >= 4) {
        _this.queryEquipmentNoList(val);
        // 自动赋值商品名称
        const match = _this.equipmentNoTableData.find(item => item.EQUIPMENTNO === val);
        _this.searchForm.equipmentName = match ? match.EQUIPMENTNAME : '';
      } else {
        _this.equipmentNoTableVisible = false;
        _this.equipmentNoTableData = [];
        _this.searchForm.equipmentName = '';
      }
    },
    // 设备号模糊查询
    async queryEquipmentNoList(val) {
      let _this = this;
      _this.equipmentNoTableData = _this.equipmentNoListData.result;
      _this.equipmentNoTableVisible = _this.equipmentNoTableData.length > 0;
      _this.equipmentNoTablePage = 1;
    },
    // 单击表格行填充设备号
    onEquipmentNoRowClick(row) {
      let _this = this;
      _this.searchForm.equipmentNo = row.EQUIPMENTNO;
      _this.searchForm.equipmentName = row.EQUIPMENTNAME;
      _this.equipmentNoTableVisible = false;
      // 自动产线匹配
      if (row.EQUIPMENTNO && row.EQUIPMENTNO.length >= 4) {
        const plNo = row.EQUIPMENTNO.slice(0, 4);
        _this.searchForm.plNoKey = [plNo];
      }
    },
    // 产线输入框focus时重置treeData为原始数据
    onPlNoTreeFocus() {
      let _this = this;
      if (_this.originalTreeData && _this.originalTreeData.length > 0) {
        _this.treeData = JSON.parse(JSON.stringify(_this.originalTreeData));
      }
    },
    // 递归查找所有plno对应的plname
    findPlNamesByPlNos(plNos, treeNodes) {
      let result = [];
      if (!Array.isArray(treeNodes)) return result;
      for (const node of treeNodes) {
        if (plNos.includes(node.plno)) {
          result.push(node.plname);
        }
        if (node.children && node.children.length > 0) {
          result = result.concat(this.findPlNamesByPlNos(plNos, node.children));
        }
      }
      return result;
    },

    /*******************************************************调用：表格*******************************************************/

    // 第N页
    handleCurrentChange(val) {
      this.currentPage = val
    },
    // 单选行
    handleCurrentRowChange(currentRow, oldCurrentRow) {
      this.currentRow = currentRow;
    },

    /*******************************************************调用：弹框*******************************************************/

    // 详情
    fun_detail(row, column, event) {
      let _this = this;
      _this.dataFormLoading = true;
      axios({
        url: this.wsUrl + '/sgbhgl/detail',
        method: 'POST',
        data: JSON.stringify({ breakDownNo: row.breakDownNo }),
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      }).then(res => {
        if (res.data.success) {
          _this.dataForm = res.data.result || [];
        } else {
          ElMessage.error(res.data.message || '获取数据详情失败');
        }
        _this.dataFormLoading = false;
      });
      _this.dataFormTitle = '详情'
      _this.dataFormVisible = true;
      _this.dataFormStatus = 'detail';
    },
  },
};
