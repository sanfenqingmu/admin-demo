<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-select
          v-model:value="searchMenuId"
          placeholder="所属菜单"
          style="width: 180px"
          allow-clear
        >
          <a-select-option v-for="menu in menuOptions" :key="menu.id" :value="menu.id">{{ menu.name }}</a-select-option>
        </a-select>
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索权限名称"
          style="width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
      <a-button type="primary" @click="handleCreate">
        <PlusOutlined /> 新增权限
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="tableData" :loading="loading" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'menuName'">
          <a-tag color="blue">{{ record.menuName }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除？" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑权限' : '新增权限'" @ok="handleSubmit" @cancel="modalVisible = false" width="500px">
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-form-item label="所属菜单" name="menuId" :rules="[{ required: true }]">
          <a-select v-model:value="formData.menuId" placeholder="请选择所属菜单">
            <a-select-option v-for="menu in menuOptions" :key="menu.id" :value="menu.id">{{ menu.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="权限名称" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="formData.name" placeholder="如：查看用户" />
        </a-form-item>
        <a-form-item label="权限编码" name="code" :rules="[{ required: true }]">
          <a-input v-model:value="formData.code" placeholder="如：user:view" />
        </a-form-item>
        <a-form-item label="按钮标识">
          <a-input v-model:value="formData.identifier" placeholder="如：btn-view-user" />
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
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getPermissionList, createPermission, updatePermission, deletePermission, getMenuList } from '@/api/system'

interface PermissionRecord {
  id: number
  menuId: number
  menuName: string
  name: string
  code: string
  identifier: string
  sort: number
  status: number | boolean
}

const loading = ref(false)
const tableData = ref<PermissionRecord[]>([])
const searchMenuId = ref<number | undefined>(undefined)
const searchKeyword = ref('')
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const menuOptions = ref<Array<{ id: number; name: string }>>([])

const formData = reactive<Partial<PermissionRecord>>({
  id: undefined, menuId: undefined, name: '', code: '', identifier: '', sort: 0, status: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '所属菜单', key: 'menuName', width: 140 },
  { title: '权限名称', dataIndex: 'name' },
  { title: '权限编码', dataIndex: 'code' },
  { title: '按钮标识', dataIndex: 'identifier' },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '状态', dataIndex: 'status', width: 80, customRender: ({ record }: { record: PermissionRecord }) => record.status === 1 ? '启用' : '禁用' },
  { title: '操作', key: 'action', width: 160 }
]

async function fetchData() {
  loading.value = true
  try {
    const res = await getPermissionList({
      menuId: searchMenuId.value,
      keyword: searchKeyword.value
    })
    tableData.value = res.data.list
  } finally {
    loading.value = false
  }
}

async function loadMenuOptions() {
  const res = await getMenuList()
  const flatMenus = flattenMenuTree(res.data)
  menuOptions.value = flatMenus
}

function flattenMenuTree(menus: Array<{ id: number; name: string; children?: Array<{ id: number; name: string }> }>, parentName = ''): Array<{ id: number; name: string }> {
  const result: Array<{ id: number; name: string }> = []
  for (const menu of menus) {
    result.push({ id: menu.id, name: parentName ? `${parentName} / ${menu.name}` : menu.name })
    if (menu.children) {
      result.push(...flattenMenuTree(menu.children, parentName ? `${parentName} / ${menu.name}` : menu.name))
    }
  }
  return result
}

function handleSearch() {
  fetchData()
}

function handleReset() {
  searchMenuId.value = undefined
  searchKeyword.value = ''
  fetchData()
}

function handleCreate() {
  isEdit.value = false
  Object.assign(formData, { id: undefined, menuId: undefined, name: '', code: '', identifier: '', sort: 0, status: true })
  modalVisible.value = true
}

function handleEdit(record: PermissionRecord) {
  isEdit.value = true
  Object.assign(formData, { ...record, status: record.status === 1 })
  modalVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    const data = { ...formData, status: formData.status ? 1 : 0 }
    if (isEdit.value) {
      await updatePermission(formData.id!, data)
      message.success('更新成功')
    } else {
      await createPermission(data)
      message.success('创建成功')
    }
    modalVisible.value = false
    fetchData()
  } catch {
    // validation error
  }
}

async function handleDelete(record: PermissionRecord) {
  await deletePermission(record.id)
  message.success('删除成功')
  fetchData()
}

onMounted(() => {
  fetchData()
  loadMenuOptions()
})
</script>

<style lang="scss" scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
