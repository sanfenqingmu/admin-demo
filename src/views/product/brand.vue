<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-input v-model:value="filters.keyword" placeholder="搜索品牌名称" style="width: 200px" allow-clear @pressEnter="handleSearch">
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
      <a-button v-permission="'product:brand:create'" type="primary" @click="openCreate"><PlusOutlined /> 新增品牌</a-button>
    </div>
    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'logo'">
          <div class="logo-placeholder"><ShopOutlined /></div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-permission="'product:brand:edit'" type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除？" @confirm="handleDelete(record)">
              <a-button v-permission="'product:brand:delete'" type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" :title="isEdit ? '编辑品牌' : '新增品牌'" @ok="onSubmit" @cancel="close" width="500px">
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-form-item label="品牌名称" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="formData.name" />
        </a-form-item>
        <a-form-item label="品牌 Logo">
          <a-upload list-type="picture-card" :max-count="1">
            <div><PlusOutlined /><span>上传</span></div>
          </a-upload>
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="formData.description" :rows="3" />
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
import { onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, PlusOutlined, ShopOutlined } from '@ant-design/icons-vue'
import { getBrandList, createBrand, updateBrand, deleteBrand } from '@/api/product'
import { useTable, useFormModal, usePermission } from '@/hooks'
import type { BrandRecord, ListParams, ListResult } from '@/types'

const { hasPermission } = usePermission()

async function fetchBrandList(params: ListParams) {
  const res = await getBrandList(params)
  return { data: res.data as ListResult<BrandRecord> }
}

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, refresh } = useTable<BrandRecord>({
  fetchData: fetchBrandList,
  defaultParams: { keyword: '' }
})

const defaultForm = { id: undefined as number | undefined, name: '', logo: '', description: '', sort: 0 as number, status: true }
const { visible, isEdit, formRef, formData, currentId, submitting, openCreate, openEdit, close } = useFormModal(defaultForm)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: 'Logo', key: 'logo', width: 100 },
  { title: '品牌名称', dataIndex: 'name' },
  { title: '描述', dataIndex: 'description' },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '状态', dataIndex: 'status', width: 100, customRender: ({ record }: { record: BrandRecord }) => record.status === 1 ? '启用' : '禁用' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 160 }
]

async function onSubmit() {
  try {
    await formRef.value?.validate()
    const data = { ...formData, status: formData.status ? 1 : 0 }
    if (isEdit.value) { await updateBrand(currentId.value!, data); message.success('更新成功') }
    else { await createBrand(data); message.success('创建成功') }
    close()
    refresh()
  } catch { /* validation */ }
}

async function handleDelete(record: BrandRecord) {
  await deleteBrand(record.id); message.success('删除成功'); refresh()
}
</script>

<style lang="scss" scoped>
.header-bar { display: flex; justify-content: space-between; margin-bottom: 16px; }
.logo-placeholder { width: 48px; height: 48px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #999; }
</style>