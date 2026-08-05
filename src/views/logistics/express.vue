<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-input v-model:value="searchKeyword" placeholder="搜索公司名称/编码" style="width: 220px" allow-clear @pressEnter="loadData">
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="loadData">搜索</a-button>
      </a-space>
      <a-button type="primary" @click="openCreate" v-permission="'logistics:express:create'"><PlusOutlined /> 新增快递公司</a-button>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="false" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'logo'">
          <div class="logo-placeholder"><CarOutlined /></div>
        </template>
        <template v-else-if="column.key === 'code'">
          <a-tag color="blue">{{ record.code }}</a-tag>
        </template>
        <template v-else-if="column.key === 'phone'">
          <a href="tel:{{ record.phone }}">{{ record.phone }}</a>
        </template>
        <template v-else-if="column.key === 'website'">
          <a :href="record.website" target="_blank" class="link">访问官网</a>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-switch v-model:checked="record.status" @change="(v: boolean) => handleToggleStatus(record, v)" />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)" v-permission="'logistics:express:edit'">编辑</a-button>
            <a-popconfirm title="确定删除？" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger v-permission="'logistics:express:delete'">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" :title="isEdit ? '编辑快递公司' : '新增快递公司'" @ok="handleSubmit(onSubmit)" @cancel="close()" width="500px">
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="公司名称" name="name" :rules="[{ required: true }]">
              <a-input v-model:value="formData.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="公司编码" name="code" :rules="[{ required: true }]">
              <a-input v-model:value="formData.code" placeholder="如：SF" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="客服电话">
              <a-input v-model:value="formData.phone" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="官网地址">
          <a-input v-model:value="formData.website" placeholder="https://" />
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
import { SearchOutlined, PlusOutlined, CarOutlined } from '@ant-design/icons-vue'
import { getExpressList, createExpress, updateExpress, deleteExpress } from '@/api/logistics'
import { useTable, useFormModal, usePermission } from '@/hooks'

interface ExpressFormData {
  id?: number
  name: string
  code: string
  logo: string
  phone: string
  website: string
  sort: number
  status: number
  createTime: string
}

const { hasPermission } = usePermission()

const searchKeyword = ref('')

const { loading, tableData, loadData } = useTable<ExpressFormData>({
  fetchData: async () => {
    const res = await getExpressList({ keyword: searchKeyword.value })
    return { data: res.data }
  }
})

const defaultForm: ExpressFormData = { id: undefined, name: '', code: '', logo: '', phone: '', website: '', sort: 0, status: 1, createTime: '' }

const { visible, isEdit, formRef, formData, openCreate, openEdit, close, handleSubmit } = useFormModal<ExpressFormData>(defaultForm)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: 'Logo', key: 'logo', width: 80 },
  { title: '公司名称', dataIndex: 'name', width: 150 },
  { title: '编码', key: 'code', width: 80 },
  { title: '客服电话', key: 'phone', width: 130 },
  { title: '官网', key: 'website', width: 100 },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 140 }
]

async function onSubmit(data: ExpressFormData, id: number | null) {
  const submitData = { ...data, status: data.status ? 1 : 0 }
  if (id) {
    await updateExpress(id, submitData)
  } else {
    await createExpress(submitData)
  }
  loadData()
}

async function handleDelete(record: ExpressFormData) {
  await deleteExpress(record.id)
  message.success('删除成功')
  loadData()
}

async function handleToggleStatus(record: ExpressFormData, checked: boolean) {
  await updateExpress(record.id, { status: checked ? 1 : 0 })
  message.success(checked ? '已启用' : '已禁用')
  record.status = checked ? 1 : 0
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.header-bar { display: flex; justify-content: space-between; margin-bottom: 16px; }
.logo-placeholder { width: 40px; height: 40px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 20px; }
.link { color: #1677ff; }
</style>