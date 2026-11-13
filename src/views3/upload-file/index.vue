<template>
  <div class="root-container">
    <!-- 布局1 - 图片列表 -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>图片列表</span>
          </div>
        </template>
        <div class="upload-container">
          <el-upload
            class="file-list-upload"
            :action="fileUrl"
            :headers="uploadHeaders"
            :data="{ biz: 'temp' }"
            :on-change="handleFileListChange"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :file-list="fileListControl"
            :on-preview="handleFileListPreview"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </template>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 布局2 - 图片列表-缩略图 -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>图片列表-缩略图</span>
          </div>
        </template>
        <div class="upload-container">
          <el-upload
            class="thumbnail-upload"
            :action="fileUrl"
            :headers="uploadHeaders"
            :data="{ biz: 'temp' }"
            :on-success="handleThumbnailSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :on-change="handleThumbnailChange"
            :on-preview="handleThumbnailPreview"
            :on-remove="handleThumbnailRemove"
            :file-list="thumbnailFileList"
            list-type="picture"
            multiple
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </template>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 布局3 - 头像上传 -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>头像上传</span>
          </div>
        </template>
        <div class="upload-container">
          <el-upload
            class="avatar-uploader"
            :action="fileUrl"
            :headers="uploadHeaders"
            :data="{ biz: 'temp' }"
            :show-file-list="true"
            :on-success="handleAvatarSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :on-remove="handleRemove"
            :on-preview="handlePictureCardPreview"
            list-type="picture-card"
            :limit="5"
            multiple
          >
            <div style="font-size: 28px; color: #8c939d; line-height: 32px">
              +
            </div>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 布局4 - 拖拽上传 -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>拖拽上传</span>
          </div>
        </template>
        <div class="upload-container">
          <el-upload
            class="drag-upload"
            drag
            :action="fileUrl"
            :headers="uploadHeaders"
            :data="{ biz: 'temp' }"
            :on-success="handleDragUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :on-change="handleDragFileChange"
            multiple
            :on-preview="handleDragUploadPreview"
            :file-list="dragFileList"
          >
            <div class="drag-upload-content">
              <div class="upload-icon">↑</div>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </template>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 布局5 - 典型表单 -->
    <div class="layout-upload">
      <el-card class="upload-card">
        <template #header>
          <div>
            <span>典型表单</span>
          </div>
        </template>
        <!-- 封面图上传 -->
        <div class="typical-upload-section">
          <div class="upload-section-header">
            <span class="upload-section-title">封面图</span>
            <span class="upload-section-desc"
              >建议尺寸：800x600px，不超过2MB</span
            >
          </div>
          <el-upload
            class="typical-cover-upload"
            :action="fileUrl"
            :headers="uploadHeaders"
            :data="{ biz: 'typical-cover' }"
            :show-file-list="false"
            :on-success="handleTypicalCoverSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
          >
            <div
              v-if="typicalForm.coverUrl"
              class="typical-cover-preview cover-rect"
            >
              <img :src="typicalForm.coverUrl" class="typical-cover-image" />
              <div class="typical-cover-actions">
                <el-icon class="typical-cover-action-icon"><Edit /></el-icon>
                <span>更换图片</span>
              </div>
            </div>
            <div v-else class="typical-cover-uploader cover-rect">
              <div style="font-size: 28px; color: #8c939d; line-height: 32px">
                +
              </div>
            </div>
          </el-upload>
        </div>
        <!-- 活动图集上传 -->
        <div class="typical-upload-section">
          <div class="upload-section-header">
            <span class="upload-section-title">活动图集</span>
            <span class="upload-section-desc">最多上传9张图片</span>
          </div>
          <el-upload
            class="typical-gallery-upload"
            :action="fileUrl"
            :headers="uploadHeaders"
            :data="{ biz: 'typical-gallery' }"
            list-type="picture-card"
            :on-success="handleTypicalGallerySuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :on-preview="handleTypicalGalleryPreview"
            :on-remove="handleTypicalGalleryRemove"
            :file-list="typicalForm.galleryList"
            multiple
            :limit="9"
          >
            <template #default="{ fileList }">
              <template v-for="file in fileList" :key="file.uid || file.url">
                <div class="gallery-image-card">
                  <img :src="file.url" class="gallery-image" />
                  <div class="gallery-image-actions">
                    <el-button
                      size="small"
                      type="primary"
                      icon="el-icon-zoom-in"
                      @click.stop="handleTypicalGalleryPreview(file)"
                      >预览</el-button
                    >
                    <el-button
                      size="small"
                      type="danger"
                      icon="el-icon-delete"
                      @click.stop="$refs.galleryUpload.handleRemove(file)"
                      >删除</el-button
                    >
                  </div>
                </div>
              </template>
              <div style="font-size: 28px; color: #8c939d; line-height: 32px">
                +
              </div>
            </template>
          </el-upload>
        </div>
        <!-- 附件上传 -->
        <div class="typical-upload-section">
          <div class="upload-section-header">
            <span class="upload-section-title">活动附件</span>
            <span class="upload-section-desc">支持PDF、Word、Excel等文件</span>
          </div>
          <el-upload
            class="typical-attachment-upload"
            :action="fileUrl"
            :headers="uploadHeaders"
            :data="{ biz: 'typical-attachment' }"
            :on-success="handleTypicalAttachmentSuccess"
            :on-error="handleUploadError"
            :on-remove="handleTypicalAttachmentRemove"
            :on-preview="handleTypicalAttachmentPreview"
            :file-list="typicalForm.attachmentList"
            multiple
          >
            <el-button type="primary">上传附件</el-button>
            <template #tip>
              <div class="el-upload__tip">请上传与活动相关的附件文档</div>
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
