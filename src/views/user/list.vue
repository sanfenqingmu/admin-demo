<template>
  <div class="user-list-container">
    <a-card>
      <div class="header-bar">
        <a-space>
          <a-input
            v-model:value="searchKeyword"
            placeholder="搜索用户名/邮箱"
            style="width: 240px"
            allow-clear
            @pressEnter="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
        <a-button type="primary" @click="handleCreate">
          <PlusOutlined /> 新增用户
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
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除此用户？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
    >
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-form-item label="用户名" name="username" :rules="[{ required: true }]">
          <a-input v-model:value="formData.username" />
        </a-form-item>
        <a-form-item label="昵称" name="nickname" :rules="[{ required: true }]">
          <a-input v-model:value="formData.nickname" />
        </a-form-item>
        <a-form-item label="邮箱" name="email" :rules="[{ required: true, type: 'email' }]">
          <a-input v-model:value="formData.email" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="formData.status" :checked-children="'启用'" :un-checked-children="'禁用'" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'

interface UserRecord {
  id: number
  username: string
  nickname: string
  email: string
  status: number | boolean
  createTime: string
}

const loading = ref(false)
const tableData = ref<UserRecord[]>([])
const searchKeyword = ref('')
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const formData = reactive<Partial<UserRecord>>({
  id: undefined,
  username: '',
  nickname: '',
  email: '',
  status: true
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username' },
  { title: '昵称', dataIndex: 'nickname' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' as const }
]

async function fetchData() {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

function handleTableChange(pag: { current: number; pageSize: number }) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

function handleSearch() {
  pagination.current = 1
  fetchData()
}

function handleReset() {
  searchKeyword.value = ''
  handleSearch()
}

function handleCreate() {
  isEdit.value = false
  Object.assign(formData, { id: undefined, username: '', nickname: '', email: '', status: true })
  modalVisible.value = true
}

function handleEdit(record: UserRecord) {
  isEdit.value = true
  Object.assign(formData, { ...record, status: record.status === 1 })
  modalVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    if (isEdit.value) {
      await updateUser(formData.id!, { ...formData, status: formData.status ? 1 : 0 })
      message.success('更新成功')
    } else {
      await createUser({ ...formData, status: formData.status ? 1 : 0 })
      message.success('创建成功')
    }
    modalVisible.value = false
    fetchData()
  } catch {
    // form validation error
  }
}

async function handleDelete(record: UserRecord) {
  await deleteUser(record.id)
  message.success('删除成功')
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
