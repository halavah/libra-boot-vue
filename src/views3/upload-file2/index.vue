<template>
  <div class="root-container">
    <!-- 1. 普通文件上传（默认文件夹） -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>普通文件上传（默认文件夹）</span>
          </div>
        </template>
        <div class="upload-container">
          <el-upload
            class="file-list-upload"
            :auto-upload="false"
            :on-change="(file, fileList) => handleDefaultUploadSuccess(file)"
            :before-upload="beforeUpload"
            :on-preview="handleFilePreview"
            :on-remove="
              (file, fileList) =>
                handleFileRemove(file, fileList, defaultFileList)
            "
            :file-list="defaultFileList"
            multiple
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持多种文件格式，上传到默认文件夹（default）
              </div>
            </template>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 2. 普通文件上传（自定义文件夹） -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>普通文件上传（自定义文件夹）</span>
          </div>
        </template>
        <div class="upload-container">
          <div style="margin-bottom: 15px">
            <el-form :inline="true">
              <el-form-item label="文件夹名称:">
                <el-input
                  v-model="customBizPath"
                  placeholder="输入文件夹名称"
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="自定义文件名:">
                <el-input
                  v-model="customFilename"
                  placeholder="可选，不含扩展名"
                  style="width: 200px"
                />
              </el-form-item>
            </el-form>
          </div>
          <el-upload
            class="file-list-upload"
            :auto-upload="false"
            :on-change="(file, fileList) => handleCustomUploadSuccess(file)"
            :before-upload="beforeUpload"
            :on-preview="handleFilePreview"
            :on-remove="
              (file, fileList) =>
                handleFileRemove(file, fileList, customFileList)
            "
            :file-list="customFileList"
            multiple
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">可以指定文件夹和自定义文件名</div>
            </template>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 3. Base64文件上传 -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>Base64文件上传</span>
          </div>
        </template>
        <div class="upload-container">
          <el-upload
            class="file-list-upload"
            :auto-upload="false"
            :on-change="(file, fileList) => handleBase64Upload(file)"
            :before-upload="beforeUpload"
            :on-preview="handleFilePreview"
            :on-remove="
              (file, fileList) =>
                handleFileRemove(file, fileList, base64FileList)
            "
            :file-list="base64FileList"
            multiple
          >
            <el-button type="success">Base64上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                文件将转换为Base64格式上传到base64-folder文件夹
              </div>
            </template>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 4. 拖拽上传演示 -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>拖拽上传演示</span>
          </div>
        </template>
        <div class="upload-container">
          <el-upload
            class="drag-upload"
            drag
            :auto-upload="false"
            :on-change="(file, fileList) => handleDefaultUploadSuccess(file)"
            :before-upload="beforeUpload"
            :on-preview="handleFilePreview"
            multiple
          >
            <div class="drag-upload-content">
              <div class="upload-icon">↑</div>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
            </div>
            <template #tip>
              <div class="el-upload__tip">支持拖拽上传，使用默认文件夹</div>
            </template>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 图片预览组件 -->
    <div
      v-if="dialogVisible"
      class="custom-image-preview"
      @click="closePreview"
    >
      <img :src="dialogImageUrl" alt="预览" @click.stop />
    </div>
  </div>
</template>

<script src="./js/index.js" type="module"></script>
<style src="./css/index.css"></style>
