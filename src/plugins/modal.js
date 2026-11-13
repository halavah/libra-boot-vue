import {ElLoading, ElMessage, ElMessageBox, ElNotification} from "element-plus";

let loadingInstance = null;

export class VueInstanceModal {
  // 消息提示
  msg(content) {
    ElMessage.info(content)
  }
  // 错误消息
  msgError(content) {
    ElMessage.error(content)
  }
  // 成功消息
  msgSuccess(content) {
    ElMessage.success(content)
  }
  // 警告消息
  msgWarning(content) {
    ElMessage.warning(content)
  }
  // 弹出提示
  alert(content) {
    ElMessageBox.alert(content, "系统提示")
  }
  // 错误提示
  alertError(content, _config) {
    const config = { type: 'error', customClass: 'mzindex', ..._config };
    ElMessageBox.alert(content, "系统提示", config)
  }
  // 成功提示
  alertSuccess(content, _config) {
    const config = { type: 'success', customClass: 'mzindex', ..._config };
    ElMessageBox.alert(content, "系统提示", config)
  }
  // 警告提示
  alertWarning(content) {
    ElMessageBox.alert(content, "系统提示", { type: 'warning', customClass: 'mzindex', })
  }
  // 通知提示
  notify(content) {
    ElNotification.info(content)
  }
  // 错误通知
  notifyError(content) {
    ElNotification.error(content);
  }
  // 成功通知
  notifySuccess(content) {
    ElNotification.success(content)
  }
  // 警告通知
  notifyWarning(content) {
    ElNotification.warning(content)
  }
  // 确认窗体
  confirm(content) {
    return ElMessageBox.confirm(content, "系统提示", {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: "warning",
    })
  }
  // 提交内容
  prompt(content) {
    return ElMessageBox.prompt(content, "系统提示", {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: "warning",
    })
  }
  // 打开遮罩层
  loading(content) {
    // Ensure only one global fullscreen loading exists at a time
    if (loadingInstance) {
      try {
        // Element Plus loading instance supports setText in v2
        loadingInstance.setText && loadingInstance.setText(content);
      } catch (e) {}
      return loadingInstance;
    }
    loadingInstance = ElLoading.service({
      lock: true,
      text: content,
      background: "rgba(0, 0, 0, 0.7)",
    })
    return loadingInstance;
  }
  // 关闭遮罩层
  closeLoading() {
    if (loadingInstance) {
      try {
        loadingInstance.close();
      } finally {
        loadingInstance = null;
      }
    }
  }
  // 强制关闭所有可能残留的全屏遮罩
  closeAllLoading() {
    try {
      this.closeLoading();
      const masks = document.querySelectorAll('.el-loading-mask.is-fullscreen');
      masks.forEach((el) => el?.parentNode?.removeChild?.(el));
    } catch (e) {}
  }
}
