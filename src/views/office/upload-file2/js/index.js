import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

export default {
  name: 'upload-file2',
  setup() {
    // ===== 基础配置 =====
    const baseUrl = "http://localhost:9994/pisces-boot";
    // 普通上传接口（自定义文件名）
    const multipartUploadUrl = `${baseUrl}/file2/upload/multipart/custom`;
    // Base64上传接口
    const base64UploadUrl = `${baseUrl}/file2/upload/base64`;
    // 文件查看/下载接口
    const fileViewUrl = `${baseUrl}/file2/view`;
    // 文件删除接口
    const fileDeleteUrl = `${baseUrl}/file2/deleteByUrl`;
    // 调用Token
    const uploadHeaders = {
      'X-Access-Token': ''
    }

    // ===== 通用上传函数 =====
    // 上传前处理函数
    const beforeUpload = (file) => {
      const isValidType = file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'application/pdf' ||
        file.type.startsWith('image/') ||
        file.type.includes('document') ||
        file.type.includes('text');
      const isLt100M = file.size / 1024 / 1024 < 100;

      if (!isValidType) {
        ElMessage.error('文件格式不支持!');
        return false;
      }
      if (!isLt100M) {
        ElMessage.error('文件大小不能超过100MB!');
        return false;
      }
      return true;
    }
    // 普通文件上传（使用multipart/form-data）
    const uploadMultipartFile = async (file, bizPath = 'default', customFilename = '') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('biz', bizPath);
      // filename参数是必需的，如果没有自定义文件名，就使用原文件名（不包含扩展名）
      const finalFilename = customFilename || file.name.replace(/\.[^/.]+$/, "");
      formData.append('filename', finalFilename);

      try {
        const response = await axios.post(multipartUploadUrl, formData, {
          headers: {
            ...uploadHeaders,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          ElMessage.success('文件上传成功');
          return response.data.result; // 返回完整相对路径
        } else {
          ElMessage.error(response.data.message || '上传失败');
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('上传失败：', error);
        ElMessage.error('上传失败: ' + (error.response?.data?.message || error.message));
        throw error;
      }
    }
    // Base64文件上传
    const uploadBase64File = async (file, applicantId = 'test-user', attachmentType = 'document', bizPath = 'default') => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64String = e.target.result.split(',')[1]; // 移除data:image/jpeg;base64,前缀

            const uploadData = {
              applicantId: applicantId,
              attachmentType: attachmentType,
              fileName: file.name,
              fileContent: base64String,
              fileSize: file.size,
              mimeType: file.type,
              biz: bizPath
            };

            const response = await axios.post(base64UploadUrl, uploadData, {
              headers: {
                ...uploadHeaders,
                'Content-Type': 'application/json'
              }
            });

            if (response.data.success) {
              ElMessage.success('Base64文件上传成功');
              resolve(response.data.result); // 返回完整相对路径
            } else {
              ElMessage.error(response.data.message || 'Base64上传失败');
              reject(new Error(response.data.message));
            }
          } catch (error) {
            console.error('Base64上传失败：', error);
            ElMessage.error('Base64上传失败: ' + (error.response?.data?.message || error.message));
            reject(error);
          }
        };
        reader.onerror = () => {
          ElMessage.error('文件读取失败');
          reject(new Error('文件读取失败'));
        };
        reader.readAsDataURL(file);
      });
    }
    // 文件删除功能
    const deleteFileByUrl = async (attachmentUrl) => {
      try {
        const response = await axios.post(fileDeleteUrl, null, {
          params: { attachmentUrl },
          headers: uploadHeaders
        });

        if (response.data.success) {
          ElMessage.success('文件删除成功');
          return true;
        } else {
          ElMessage.error(response.data.message || '文件删除失败');
          return false;
        }
      } catch (error) {
        console.error('文件删除失败：', error);
        ElMessage.error('文件删除失败: ' + (error.response?.data?.message || error.message));
        return false;
      }
    }
    // 生成文件查看URL
    const getFileViewUrl = (bizPath, filename) => {
      return `${fileViewUrl}/${bizPath}/${filename}`;
    }
    // 上传处理失败函数
    const handleUploadError = (error, uploadFile) => {
      console.error('上传失败：', error);
      ElMessage.error('上传失败');
    }

    // ===== 区域1：普通文件上传（默认文件夹） =====
    const defaultFileList = ref([]);

    // 默认文件夹上传成功处理
    const handleDefaultUploadSuccess = async (file) => {
      try {
        // 尝试使用更简单的路径，避免目录创建问题
        const filePath = await uploadMultipartFile(file.raw, 'temp');
        const [bizPath, filename] = filePath.split('/');
        file.url = getFileViewUrl(bizPath, filename);
        file.path = filePath;
        file.status = 'success';
        console.log('默认文件夹上传成功，文件路径：', filePath);
      } catch (error) {
        console.error('默认文件夹上传失败：', error);
        file.status = 'fail';
      }
    }

    // ===== 区域2：普通文件上传（自定义文件夹） =====
    const customFileList = ref([]);
    const customBizPath = ref('custom-folder');
    const customFilename = ref('');

    // 自定义文件夹上传成功处理
    const handleCustomUploadSuccess = async (file) => {
      try {
        const filePath = await uploadMultipartFile(
          file.raw,
          customBizPath.value || 'custom',
          customFilename.value
        );
        const [bizPath, filename] = filePath.split('/');
        file.url = getFileViewUrl(bizPath, filename);
        file.path = filePath;
        file.status = 'success';
        console.log('自定义文件夹上传成功，文件路径：', filePath);
      } catch (error) {
        file.status = 'fail';
      }
    }

    // ===== 区域3：Base64文件上传 =====
    const base64FileList = ref([]);

    // Base64上传处理
    const handleBase64Upload = async (file) => {
      try {
        const filePath = await uploadBase64File(file.raw, 'test-user', 'document', 'base64-folder');
        const [bizPath, filename] = filePath.split('/');
        file.url = getFileViewUrl(bizPath, filename);
        file.path = filePath;
        file.status = 'success';
        base64FileList.value.push(file);
        console.log('Base64上传成功，文件路径：', filePath);
      } catch (error) {
        file.status = 'fail';
      }
    }

    // ===== 区域4：拖拽上传演示（复用区域1的上传处理） =====
    // 说明：拖拽上传直接复用 handleDefaultUploadSuccess，无独立状态。

    // ===== 通用：图片预览 / 文件预览 与 删除 =====
    // 弹框地址
    const dialogImageUrl = ref('');
    // 弹框显示
    const dialogVisible = ref(false);
    // 关闭预览
    const closePreview = () => {
      dialogVisible.value = false;
    };

    // 文件预览处理
    const handleFilePreview = (file) => {
      if (file.url) {
        // 如果是图片，显示预览
        if (file.raw && file.raw.type.startsWith('image/')) {
          dialogImageUrl.value = file.url;
          dialogVisible.value = true;
        } else {
          // 其他文件类型，在新窗口打开
          window.open(file.url, '_blank');
        }
      }
    }
    // 文件删除处理
    const handleFileRemove = async (file, fileList, listRef) => {
      if (file.path) {
        const success = await deleteFileByUrl(file.path);
        if (success) {
          // 从列表中移除
          const index = fileList.findIndex(item => item.uid === file.uid);
          if (index > -1) {
            fileList.splice(index, 1);
          }
          listRef.value = fileList;
        }
      }
    }

    // 返回
    return {
      // 基础配置
      baseUrl,
      multipartUploadUrl,
      base64UploadUrl,
      fileViewUrl,
      fileDeleteUrl,
      uploadHeaders,
      beforeUpload,
      handleUploadError,

      // 核心功能函数
      uploadMultipartFile,
      uploadBase64File,
      deleteFileByUrl,
      getFileViewUrl,

      // 区域1：普通文件上传（默认文件夹）
      defaultFileList,
      handleDefaultUploadSuccess,

      // 区域2：普通文件上传（自定义文件夹）
      customFileList,
      customBizPath,
      customFilename,
      handleCustomUploadSuccess,

      // 区域3：Base64文件上传
      base64FileList,
      handleBase64Upload,

      // 区域4：拖拽上传演示（复用区域1处理）

      // 通用处理函数（预览与删除）
      dialogImageUrl,
      dialogVisible,
      closePreview,
      handleFilePreview,
      handleFileRemove,
    };
  },
};
