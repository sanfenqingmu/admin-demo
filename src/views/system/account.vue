<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索账号/姓名"
          style="width: 240px"
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
      <a-button type="primary" @click="openCreate" v-permission="'system:account:create'">
        <PlusOutlined /> 新增账号
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-switch
            :checked="record.status === 1"
            @change="(checked: boolean) => handleStatusChange(record, checked)"
          />
        </template>
        <template v-else-if="column.key === 'roles'">
          <a-tag v-for="role in record.roles" :key="role" color="blue">{{ role }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)" v-permission="'system:account:edit'">编辑</a-button>
            <a-popconfirm title="确定删除？" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger v-permission="'system:account:delete'">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" :title="isEdit ? '编辑账号' : '新增账号'" @ok="handleSubmit(onSubmit)" @cancel="close()" width="600px">
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="账号" name="username" :rules="[{ required: true }]">
              <a-input v-model:value="formData.username" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="姓名" name="nickname" :rules="[{ required: true }]">
              <a-input v-model:value="formData.nickname" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item v-if="!isEdit" label="密码" name="password" :rules="[{ required: true }]">
              <a-input-password v-model:value="formData.password" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色" name="roleIds" :rules="[{ required: true }]">
              <a-select v-model:value="formData.roleIds" mode="multiple" placeholder="请选择角色">
                <a-select-option v-for="role in roleList" :key="role.id" :value="role.id">{{ role.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="邮箱">
              <a-input v-model:value="formData.email" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="手机">
              <a-input v-model:value="formData.phone" />
            </a-form-item>
          </a-col>
        </a-row>
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
import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getAccountList, createAccount, updateAccount, deleteAccount, getRoleList } from '@/api/system'
import { useTable, useFormModal, usePermission } from '@/hooks'
import type { ListParams } from '@/types'

interface AccountRecord {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  roles: string[]
  createTime: string
}

interface AccountFormData {
  id?: number
  username: string
  nickname: string
  password?: string
  roleIds: number[]
  email: string
  phone: string
  status: number
}

const { hasPermission } = usePermission()

const searchKeyword = ref('')

const { loading, tableData, pagination, handleTableChange, handleSearch, loadData } = useTable<AccountRecord>({
  fetchData: async (params: ListParams) => {
    const res = await getAccountList({
      page: params.page,
      pageSize: params.pageSize,
      keyword: searchKeyword.value
    })
    return { data: res.data }
  }
})

const roleList = ref<any[]>([])

const defaultForm: AccountFormData = {
  id: undefined, username: '', nickname: '', password: '', roleIds: [], email: '', phone: '', status: 1
}

const { visible, isEdit, formRef, formData, openCreate, openEdit, close, handleSubmit } = useFormModal<AccountFormData>(defaultForm)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '账号', dataIndex: 'username' },
  { title: '姓名', dataIndex: 'nickname' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '手机', dataIndex: 'phone' },
  { title: '角色', key: 'roles', width: 150 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' as const }
]

function handleReset() {
  searchKeyword.value = ''
  handleSearch()
}

async function onSubmit(data: AccountFormData, id: number | null) {
  const submitData = { ...data, status: data.status ? 1 : 0 }
  if (id) {
    await updateAccount(id, submitData)
  } else {
    await createAccount(submitData)
  }
  loadData()
}

async function handleDelete(record: AccountRecord) {
  await deleteAccount(record.id)
  message.success('删除成功')
  loadData()
}

async function handleStatusChange(record: AccountRecord, checked: boolean) {
  await updateAccount(record.id, { status: checked ? 1 : 0 })
  message.success('状态更新成功')
}

async function loadRoles() {
  const res = await getRoleList()
  roleList.value = res.data
}

onMounted(() => {
  loadRoles()
})
</script>

<style lang="scss" scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>