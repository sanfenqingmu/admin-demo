<template>
  <div>
    <a-card>
      <div class="layout">
        <div class="folder-side">
          <h4>文件夹</h4>
          <div class="folder-list">
            <div class="folder-item" :class="{ active: selectedFolder === null }" @click="selectedFolder = null">
              <FolderOutlined /> 全部素材
            </div>
            <div v-for="folder in folderList" :key="folder.id" class="folder-item" :class="{ active: selectedFolder === folder.id }" @click="selectedFolder = folder.id">
              <FolderOutlined /> {{ folder.name }}
              <span class="count">{{ folder.count }}</span>
            </div>
          </div>
          <a-button v-permission="'product:material:folder:create'" type="dashed" block style="margin-top: 12px"><PlusOutlined /> 新建文件夹</a-button>
        </div>

        <div class="content-area">
          <div class="toolbar">
            <a-space>
              <a-input v-model:value="filters.keyword" placeholder="搜索素材名称" style="width: 200px" allow-clear @pressEnter="handleSearch">
                <template #prefix><SearchOutlined /></template>
              </a-input>
              <a-select v-model:value="filters.type" placeholder="类型筛选" allow-clear style="width: 120px">
                <a-select-option value="image">图片</a-select-option>
                <a-select-option value="video">视频</a-select-option>
                <a-select-option value="file">文件</a-select-option>
              </a-select>
            </a-space>
            <a-upload :show-upload-list="false" :before-upload="handleUpload" accept="image/*,video/*,.pdf,.doc,.xls">
              <a-button v-permission="'product:material:upload'" type="primary"><UploadOutlined /> 上传素材</a-button>
            </a-upload>
          </div>

          <div v-if="loading" style="text-align: center; padding: 40px"><a-spin /></div>
          <div v-else-if="tableData.length === 0" style="text-align: center; padding: 40px"><a-empty description="暂无素材" /></div>
          <div v-else class="material-grid">
            <div v-for="item in tableData" :key="item.id" class="material-item">
              <div class="thumb" :class="item.type" @click="previewItem(item)">
                <PictureOutlined v-if="item.type === 'image'" />
                <VideoCameraOutlined v-else-if="item.type === 'video'" />
                <FileOutlined v-else />
              </div>
              <div class="info">
                <div class="name" :title="item.name">{{ item.name }}</div>
                <div class="meta">
                  <span>{{ item.size }}</span>
                  <a-dropdown>
                    <MoreOutlined style="cursor: pointer" />
                    <template #overlay>
                      <a-menu>
                        <a-menu-item @click="previewItem(item)">预览</a-menu-item>
                        <a-menu-item v-permission="'product:material:move'" @click="handleMove(item)">移动</a-menu-item>
                        <a-menu-item v-permission="'product:material:delete'" danger @click="handleDelete(item)">删除</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-wrap" v-if="pagination.total > 0">
            <a-pagination
              v-model:current="pagination.current"
              v-model:pageSize="pagination.pageSize"
              :total="pagination.total"
              :show-size-changer="pagination.showSizeChanger"
              :show-total="pagination.showTotal"
              show-quick-jumper
              @change="(page: number, pageSize: number) => handleTableChange({ current: page, pageSize })"
            />
          </div>
        </div>
      </div>
    </a-card>

    <a-modal v-model:open="previewVisible" :title="previewItemData?.name" :footer="null" width="600px">
      <div class="preview-content">
        <div v-if="previewItemData?.type === 'image'" class="preview-image"><PictureOutlined /></div>
        <div v-else-if="previewItemData?.type === 'video'" class="preview-video"><VideoCameraOutlined /></div>
        <div v-else class="preview-file"><FileOutlined /></div>
      </div>
    </a-modal>

    <a-modal v-model:open="moveVisible" title="移动到文件夹" @ok="handleMoveSubmit" @cancel="moveVisible = false" width="400px">
      <a-form layout="vertical">
        <a-form-item label="选择目标文件夹">
          <a-tree-select v-model:value="moveTargetId" :tree-data="folderTreeData" placeholder="选择文件夹" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, UploadOutlined, PictureOutlined, VideoCameraOutlined, FileOutlined, MoreOutlined, FolderOutlined } from '@ant-design/icons-vue'
import { getMaterialList, uploadMaterial, deleteMaterial, moveMaterial, getMaterialFolders } from '@/api/product'
import { useTable, usePermission } from '@/hooks'
import type { ListParams, ListResult } from '@/types'

const { hasPermission } = usePermission()

interface MaterialRecord {
  id: number; name: string; type: string; size: string; url: string
}

interface FolderRecord {
  id: number; name: string; count: number
}

const folderList = ref<FolderRecord[]>([])
const selectedFolder = ref<number | null>(null)

const previewVisible = ref(false)
const previewItemData = ref<MaterialRecord | null>(null)
const moveVisible = ref(false)
const moveTargetId = ref<number | undefined>(undefined)
const moveItem = ref<MaterialRecord | null>(null)

const folderTreeData = computed(() => folderList.value.map((f) => ({ title: f.name, value: f.id })))

async function fetchMaterialList(params: ListParams) {
  const finalParams: ListParams = { ...params }
  if (selectedFolder.value) finalParams.folderId = selectedFolder.value
  const res = await getMaterialList(finalParams)
  return { data: res.data as ListResult<MaterialRecord> }
}

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, refresh } = useTable<MaterialRecord>({
  fetchData: fetchMaterialList,
  defaultParams: { keyword: '', type: undefined as string | undefined }
})

async function loadFolders() {
  const res = await getMaterialFolders()
  folderList.value = res.data as FolderRecord[]
}

async function handleUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  await uploadMaterial(formData)
  message.success('上传成功')
  refresh()
  return false
}

function previewItem(item: MaterialRecord) {
  previewItemData.value = item
  previewVisible.value = true
}

function handleMove(item: MaterialRecord) {
  moveItem.value = item
  moveTargetId.value = undefined
  moveVisible.value = true
}

async function handleMoveSubmit() {
  if (!moveTargetId.value || !moveItem.value) return
  await moveMaterial(moveItem.value.id, moveTargetId.value)
  message.success('移动成功')
  moveVisible.value = false
  refresh()
}

async function handleDelete(item: MaterialRecord) {
  await deleteMaterial(item.id)
  message.success('删除成功')
  refresh()
}

onMounted(() => { loadFolders() })

watch(selectedFolder, () => {
  pagination.current = 1
  refresh()
})
</script>

<style lang="scss" scoped>
.layout { display: flex; gap: 16px; }
.folder-side { width: 200px; border-right: 1px solid #f0f0f0; padding-right: 16px; }
.folder-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 4px; cursor: pointer; margin-bottom: 4px; }
.folder-item:hover { background: #f5f5f5; }
.folder-item.active { background: #e6f4ff; color: #1677ff; }
.folder-item .count { margin-left: auto; font-size: 12px; color: #999; }
.content-area { flex: 1; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 16px; }
.material-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
.material-item { border: 1px solid #f0f0f0; border-radius: 6px; overflow: hidden; transition: box-shadow 0.2s; }
.material-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.thumb { width: 100%; height: 140px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #bbb; }
.thumb.image { background: linear-gradient(135deg, #e6f4ff, #f0f5ff); }
.thumb.video { background: linear-gradient(135deg, #fff7e6, #fffbe6); }
.thumb.file { background: linear-gradient(135deg, #f6ffed, #fcffe6); }
.info { padding: 8px 12px; }
.name { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #999; }
.pagination-wrap { margin-top: 16px; text-align: center; }
.preview-content { display: flex; justify-content: center; align-items: center; min-height: 300px; background: #f5f5f5; border-radius: 8px; }
.preview-image, .preview-video, .preview-file { font-size: 80px; color: #1677ff; }
</style>