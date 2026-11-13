<template>
  <div v-loading.lock="loading" class="root-container">
    <!-- 布局 1: 筛选区域 -->
    <div class="layout-search">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :rules="searchFormRules"
        :inline="true"
      >
        <!-- 条件容器 -->
        <div class="search-filters">
          <el-form-item label="商品分类" prop="plNoKey">
            <el-tree-select
              v-model="searchForm.plNoKey"
              :props="treeProps"
              :data="treeData"
              check-strictly
              :render-after-expand="false"
              placeholder="默认全部商品分类"
              class="search-tree-select"
              value-key="key"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="1"
              @focus="onPlNoTreeFocus"
              :disabled="!!searchForm.equipmentNo"
            />
          </el-form-item>
          <el-form-item label="商品编号" prop="equipmentNo">
            <el-input
              v-model="searchForm.equipmentNo"
              placeholder="请输入商品编号"
              clearable
              class="search-input"
              maxlength="12"
              @input="onEquipmentNoInput"
            ></el-input>
          </el-form-item>
          <!-- 商品编号模糊查询表格 -->
          <el-table
            v-if="equipmentNoTableVisible"
            :data="
              equipmentNoTableData.slice(
                (equipmentNoTablePage - 1) * equipmentNoTablePageSize,
                equipmentNoTablePage * equipmentNoTablePageSize
              )
            "
            style="width: 100%; margin-top: 8px"
            @row-click="onEquipmentNoRowClick"
            highlight-current-row
            size="small"
          >
            <el-table-column prop="EQUIPMENTNO" label="商品编号" width="160" />
            <el-table-column prop="EQUIPMENTNAME" label="商品名称" />
          </el-table>
          <el-pagination
            v-if="equipmentNoTableVisible"
            :current-page="equipmentNoTablePage"
            :page-size="equipmentNoTablePageSize"
            :total="equipmentNoTableData.length"
            @current-change="(val) => (equipmentNoTablePage = val)"
            layout="prev, pager, next"
            small
            style="margin-top: 4px"
          />
          <el-form-item label="售后编号" prop="breakDownNo">
            <el-input
              v-model="searchForm.breakDownNo"
              placeholder="请输入售后编号"
              clearable
              maxlength="14"
            ></el-input>
          </el-form-item>
          <el-form-item label="订单暂停类型" prop="relegationNames">
            <el-select
              v-model="searchForm.relegationNames"
              placeholder="请选择订单暂停类型"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="1"
              class="search-select"
            >
              <el-option
                v-for="item in attrCnts.relegationNamesOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围" prop="vDay">
            <el-date-picker
              v-model="searchForm.vDay"
              type="daterange"
              start-placeholder="开始日期"
              range-separator="至"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="search-datepicker"
            >
            </el-date-picker>
          </el-form-item>
          <div class="search-buttons">
            <el-form-item>
              <el-button type="primary" @click="fun_search(searchFormRef)"
                >查询</el-button
              >
              <el-button @click="fun_reset(searchFormRef)">重置</el-button>
              <!--excel -->
              <el-button type="info" @click="exportExcelEasyGetRequest"
                >easyGet</el-button
              >
              <el-button type="info" @click="exportExcelEasyPostRequest"
                >easyPost</el-button
              >
              <el-button type="success" @click="exportExcelPoi">poi</el-button>
              <el-button type="success" @click="exportExcelPoiTemplate"
                >poiTemplate</el-button
              >
              <el-button type="success" @click="exportExcelAspose"
                >aspose</el-button
              >
              <el-button type="success" @click="exportExcelAsposeTemplate"
                >asposeTemplate</el-button
              >
              <el-button type="success" @click="exportExcelAsposeUtil"
                >asposeUtil</el-button
              >
              <!--word -->
              <el-button type="warning" @click="exportWordPoi">poi</el-button>
              <el-button type="warning" @click="exportWordPoiTemplate"
                >poiTemplate</el-button
              >
              <el-button type="warning" @click="exportWordAspose"
                >aspose</el-button
              >
              <el-button type="warning" @click="exportWordAsposeTemplate"
                >asposeTemplate</el-button
              >
              <!--pptx -->
              <el-button type="danger" @click="exportPptxPoi">poi</el-button>
              <el-button type="danger" @click="exportPptxPoiTemplate"
                >poiTemplate</el-button
              >
              <el-button type="danger" @click="exportPptxAspose"
                >aspose</el-button
              >
              <el-button type="danger" @click="exportPptxAsposeTemplate"
                >asposeTemplate</el-button
              >
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>
    <!-- 布局 2: 内容区域 -->
    <div class="layout-content">
      <div class="table-container">
        <el-table
          :data="
            dataList.slice((currentPage - 1) * pageSize, currentPage * pageSize)
          "
          border
          stripe
          highlight-current-row
        >
          <el-table-column
            prop="plName"
            label="商品分类名称"
            min-width="120"
            align="center"
          />
          <el-table-column
            prop="equipmentNo"
            label="商品编号"
            min-width="100"
            align="center"
          />
          <el-table-column
            prop="equipmentName"
            label="商品名称"
            min-width="300"
            align="center"
          />
          <el-table-column label="图片" min-width="80" align="center">
            <template #default="scope">
              <div
                class="table-image-container"
                @click="previewTableImage(scope.row)"
              >
                <img
                  v-if="scope.row.imageUrl"
                  :src="scope.row.imageUrl"
                  class="table-image"
                  alt="商品图片"
                />
                <div v-else class="no-image">无图片</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="breakDownNo"
            label="售后编号"
            min-width="120"
            align="center"
          />
          <el-table-column
            prop="breakDownName"
            label="售后问题"
            min-width="300"
            align="center"
          />
          <el-table-column
            prop="relegationName"
            label="订单暂停类型"
            min-width="60"
            align="center"
          />
          <el-table-column
            prop="informDate"
            label="售后处理时长"
            min-width="100"
            align="center"
          />
          <el-table-column
            label="操作"
            min-width="50"
            fixed="right"
            align="center"
          >
            <template #default="scope">
              <el-button type="text" @click="fun_detail(scope.row)"
                >详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="dataTotal"
          hide-on-single-page
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 新增/编辑/详情 -->
    <el-dialog
      width="60%"
      ref="elDialog"
      v-model="dataFormVisible"
      :title="dataFormTitle"
      :loading="dataFormLoading"
    >
      <el-form
        ref="dataFormRef"
        :model="dataForm"
        label-position="right"
        label-width="100px"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row>
              <el-col :span="12">
                <el-form-item label="商品分类编号" prop="plNo">
                  <el-input v-model="dataForm.plNo" autocomplete="off" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="售后单号" prop="breakDownNo">
                  <el-input v-model="dataForm.breakDownNo" autocomplete="off" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="发生时间" prop="informfullDate">
                  <el-input
                    v-model="dataForm.informfullDate"
                    autocomplete="off"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="响应时间" prop="arrivefullDate">
                  <el-input
                    v-model="dataForm.arrivefullDate"
                    autocomplete="off"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="总订单暂停时长" prop="totalBreakTime">
                  <el-input
                    v-model="dataForm.totalBreakTime"
                    autocomplete="off"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="售后等级" prop="breakDownGrade">
                  <el-input
                    v-model="dataForm.breakDownGrade"
                    autocomplete="off"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="商品规格" prop="bkPart">
                  <el-input v-model="dataForm.bkPart" autocomplete="off" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="售后问题" prop="breakDownName">
                  <el-input
                    v-model="dataForm.breakDownName"
                    autocomplete="off"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="订单暂停类型" prop="relegation">
                  <el-input v-model="dataForm.relegation" autocomplete="off" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="退货原因" prop="bkReason">
                  <el-input v-model="dataForm.bkReason" autocomplete="off" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="原因分析" prop="textArea2">
                  <el-input
                    v-model="dataForm.textArea2"
                    type="textarea"
                    :rows="4"
                    autocomplete="off"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="整改措施" prop="textArea3">
                  <el-input
                    v-model="dataForm.textArea3"
                    type="textarea"
                    :rows="4"
                    autocomplete="off"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="处理措施" prop="relegation">
                  <el-input v-model="dataForm.relegation" autocomplete="off" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="处理备注" prop="reportMemo">
                  <el-input v-model="dataForm.reportMemo" autocomplete="off" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="图片上传" name="upload">
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
                    <div
                      style="font-size: 28px; color: #8c939d; line-height: 32px"
                    >
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
          </el-tab-pane>

          <!-- 新增标签页：典型表单 -->
          <el-tab-pane label="典型表单" name="typical">
            <div class="typical-form-container typical-form-horizontal">
              <el-row :gutter="40">
                <!-- 左侧：基本信息表单 -->
                <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
                  <div class="typical-form-left">
                    <h3 class="typical-form-title">活动信息</h3>
                    <el-form
                      label-position="right"
                      label-width="100px"
                      class="typical-form"
                    >
                      <el-form-item label="活动名称" required>
                        <el-input
                          v-model="typicalForm.name"
                          placeholder="请输入活动名称"
                        />
                      </el-form-item>
                      <el-form-item label="活动区域" required>
                        <el-select
                          v-model="typicalForm.region"
                          placeholder="请选择活动区域"
                          style="width: 100%"
                        >
                          <el-option label="区域一" value="shanghai" />
                          <el-option label="区域二" value="beijing" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="活动时间" required>
                        <div class="time-range-container">
                          <el-date-picker
                            v-model="typicalForm.date"
                            type="date"
                            placeholder="选择日期"
                            style="width: 100%"
                          />
                          <el-time-picker
                            v-model="typicalForm.time"
                            placeholder="选择时间"
                            style="width: 100%; margin-top: 10px"
                          />
                        </div>
                      </el-form-item>
                      <el-form-item label="即时配送">
                        <el-switch v-model="typicalForm.delivery" />
                      </el-form-item>
                      <el-form-item label="活动性质">
                        <el-checkbox-group v-model="typicalForm.type">
                          <div class="checkbox-container">
                            <el-checkbox
                              label="美食/餐厅线上活动"
                              name="type"
                            />
                            <el-checkbox label="地推活动" name="type" />
                            <el-checkbox label="线下主题活动" name="type" />
                            <el-checkbox label="单纯品牌曝光" name="type" />
                          </div>
                        </el-checkbox-group>
                      </el-form-item>
                      <el-form-item label="特殊资源">
                        <el-radio-group v-model="typicalForm.resource">
                          <el-radio label="线上品牌商赞助" />
                          <el-radio label="线下场地免费" />
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="活动形式">
                        <el-input
                          v-model="typicalForm.desc"
                          type="textarea"
                          :rows="4"
                          placeholder="请输入活动形式描述"
                        />
                      </el-form-item>
                    </el-form>
                  </div>
                </el-col>
                <!-- 右侧：图片上传和附件上传 -->
                <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
                  <div class="typical-form-right">
                    <h3 class="typical-form-title">活动图片</h3>
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
                          <img
                            :src="typicalForm.coverUrl"
                            class="typical-cover-image"
                          />
                          <div class="typical-cover-actions">
                            <el-icon class="typical-cover-action-icon"
                              ><Edit
                            /></el-icon>
                            <span>更换图片</span>
                          </div>
                        </div>
                        <div v-else class="typical-cover-uploader cover-rect">
                          <div
                            style="
                              font-size: 28px;
                              color: #8c939d;
                              line-height: 32px;
                            "
                          >
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
                          <template
                            v-for="file in fileList"
                            :key="file.uid || file.url"
                          >
                            <div class="gallery-image-card">
                              <img :src="file.url" class="gallery-image" />
                              <div class="gallery-image-actions">
                                <el-button
                                  size="small"
                                  type="primary"
                                  icon="el-icon-zoom-in"
                                  @click.stop="
                                    handleTypicalGalleryPreview(file)
                                  "
                                  >预览</el-button
                                >
                                <el-button
                                  size="small"
                                  type="danger"
                                  icon="el-icon-delete"
                                  @click.stop="
                                    $refs.galleryUpload.handleRemove(file)
                                  "
                                  >删除</el-button
                                >
                              </div>
                            </div>
                          </template>
                          <div
                            style="
                              font-size: 28px;
                              color: #8c939d;
                              line-height: 32px;
                            "
                          >
                            +
                          </div>
                        </template>
                      </el-upload>
                    </div>
                    <!-- 附件上传 -->
                    <div class="typical-upload-section">
                      <div class="upload-section-header">
                        <span class="upload-section-title">活动附件</span>
                        <span class="upload-section-desc"
                          >支持PDF、Word、Excel等文件</span
                        >
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
                          <div class="el-upload__tip">
                            请上传与活动相关的附件文档
                          </div>
                        </template>
                      </el-upload>
                    </div>
                  </div>
                </el-col>
              </el-row>
              <!-- 表单按钮 -->
              <div class="typical-form-actions">
                <el-button type="primary" @click="submitTypicalForm"
                  >立即创建</el-button
                >
                <el-button @click="resetTypicalForm">重置</el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dataFormVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 其他: 全局图片预览组件 -->
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
<style scoped src="./css/index.css"></style>
