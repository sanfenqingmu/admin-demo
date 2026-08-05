<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-input v-model:value="searchKeyword" placeholder="搜索分类名称" style="width: 200px" allow-clear />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </a-space>
      <a-button v-permission="'product:category:create'" type="primary" @click="handleCreate(null)">
        <PlusOutlined /> 新增分类
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="false" row-key="id" :expandedRowKeys="expandedKeys" @expand="onExpand">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'icon'">
          <FolderOutlined />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-permission="'product:category:create'" type="link" size="small" @click="handleCreate(record.id)">添加子分类</a-button>
            <a-button v-permission="'product:category:edit'" type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除？删除子分类会一并删除" @confirm="handleDelete(record)">
              <a-button v-permission="'product:category:delete'" type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" :title="isEdit ? '编辑分类' : '新增分类'" @ok="onSubmit" @cancel="close" width="500px">
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-form-item label="分类名称" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="formData.name" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="formData.status" :checked-children="'启用'" :un-checked-children="'禁用'" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, FolderOutlined } from '@ant-design/icons-vue'
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '@/api/product'
import { useFormModal, usePermission } from '@/hooks'
import type { CategoryRecord } from '@/types'

const { hasPermission } = usePermission()

const loading = ref(false)
const tableData = ref<CategoryRecord[]>([])
const searchKeyword = ref('')
const expandedKeys = ref<number[]>([])

const defaultForm = { id: undefined as number | undefined, parentId: 0 as number, name: '', sort: 0 as number, status: true }
const { visible, isEdit, formRef, formData, currentId, submitting, openCreate, openEdit, close } = useFormModal(defaultForm)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '分类图标', key: 'icon', width: 100 },
  { title: '分类名称', dataIndex: 'name' },
  { title: '排序', dataIndex: 'sort', width: 100 },
  { title: '状态', dataIndex: 'status', width: 100, customRender: ({ record }: { record: CategoryRecord }) => record.status === 1 ? '启用' : '禁用' },
  { title: '操作', key: 'action', width: 280 }
]

async function fetchData() {
  loading.value = true
  try {
    const res = await getCategoryTree()
    let list = res.data as CategoryRecord[]
    if (searchKeyword.value) list = filterTree(list, searchKeyword.value)
    tableData.value = list
    expandedKeys.value = getAllIds(list)
  } finally {
    loading.value = false
  }
}

function filterTree(list: CategoryRecord[], keyword: string): CategoryRecord[] {
  return list
    .map((item) => {
      if (item.children && item.children.length > 0) {
        const filtered = filterTree(item.children, keyword)
        if (filtered.length > 0 || item.name.includes(keyword)) return { ...item, children: filtered }
      }
      return item.name.includes(keyword) ? item : null
    })
    .filter(Boolean) as CategoryRecord[]
}

function getAllIds(list: CategoryRecord[]): number[] {
  const ids: number[] = []
  for (const item of list) {
    ids.push(item.id)
    if (item.children) ids.push(...getAllIds(item.children))
  }
  return ids
}

function onExpand(expanded: boolean, record: CategoryRecord) {
  if (expanded) expandedKeys.value.push(record.id)
  else expandedKeys.value = expandedKeys.value.filter((k) => k !== record.id)
}

function handleSearch() { fetchData() }

function handleCreate(parentId: number | null) {
  openCreate()
  formData.parentId = parentId || 0
  formData.status = true
}

function handleEdit(record: CategoryRecord) {
  openEdit({ ...record, status: record.status === 1 })
}

async function onSubmit() {
  try {
    await formRef.value?.validate()
    const data = { ...formData, status: formData.status ? 1 : 0 }
    if (isEdit.value) { await updateCategory(currentId.value!, data); message.success('更新成功') }
    else { await createCategory(data); message.success('创建成功') }
    close()
    fetchData()
  } catch { /* validation */ }
}

async function handleDelete(record: CategoryRecord) {
  await deleteCategory(record.id)
  message.success('删除成功')
  fetchData()
}

onMounted(() => { fetchData() })
</script>

<style lang="scss" scoped>
.header-bar { display: flex; justify-content: space-between; margin-bottom: 16px; }
</style>