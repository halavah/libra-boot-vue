import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'upload-file',
  setup() {
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

    // ===== 5.典型表单 =====
    // 典型表单数据
    const typicalForm = reactive({
      coverUrl: '',
      galleryList: [],
      attachmentList: []
    });

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

      // 5.典型表单
      typicalForm,
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
};
