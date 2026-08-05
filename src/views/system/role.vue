<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索角色名称"
          style="width: 240px"
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
      <a-button type="primary" @click="handleCreate">
        <PlusOutlined /> 新增角色
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="tableData" :loading="loading" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="handleAssignPerm(record)">分配权限</a-button>
            <a-popconfirm title="确定删除？" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑角色' : '新增角色'" @ok="handleSubmit" @cancel="modalVisible = false" width="500px">
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-form-item label="角色名称" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="formData.name" placeholder="如：管理员" />
        </a-form-item>
        <a-form-item label="角色编码" name="code" :rules="[{ required: true }]">
          <a-input v-model:value="formData.code" placeholder="如：admin" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="formData.description" :rows="3" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="formData.status" :checked-children="'启用'" :un-checked-children="'禁用'" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="permVisible" title="分配权限" @ok="handleSavePerm" @cancel="permVisible = false" width="600px">
      <div class="perm-tips">
        <a-alert type="info" message="为角色勾选可用的菜单和按钮权限" show-icon />
      </div>
      <a-tree
        checkable
        :tree-data="permTree"
        v-model:checked-keys="checkedKeys"
        :default-expand-all="true"
      />
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getRoleList, createRole, updateRole, deleteRole, getMenuList, getPermissionList, getRolePermissions, assignRolePermissions } from '@/api/system'

interface RoleRecord {
  id: number
  name: string
  code: string
  description: string
  status: number | boolean
  createTime: string
}

const loading = ref(false)
const tableData = ref<RoleRecord[]>([])
const searchKeyword = ref('')
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const permVisible = ref(false)
const currentRole = ref<RoleRecord | null>(null)

const formData = reactive<Partial<RoleRecord>>({
  id: undefined, name: '', code: '', description: '', status: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '角色名称', dataIndex: 'name' },
  { title: '角色编码', dataIndex: 'code' },
  { title: '描述', dataIndex: 'description' },
  { title: '状态', dataIndex: 'status', width: 100, customRender: ({ record }: { record: RoleRecord }) =>
    h('a-tag', { color: record.status === 1 ? 'green' : 'red' }, { default: () => record.status === 1 ? '启用' : '禁用' })
  },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 240 }
]

import { h } from 'vue'

async function fetchData() {
  loading.value = true
  try {
    const res = await getRoleList()
    let list = res.data
    if (searchKeyword.value) {
      list = list.filter((item: RoleRecord) => item.name.includes(searchKeyword.value))
    }
    tableData.value = list
  } finally {
    loading.value = false
  }
}

async function loadPermTree() {
  const [menuRes, permRes] = await Promise.all([getMenuList(), getPermissionList()])
  const permList = permRes.data.list
  const tree: Array<{ key: string; title: string; children?: Array<{ key: string; title: string }> }> = []
  for (const menu of menuRes.data) {
    const children: Array<{ key: string; title: string }> = []
    const menuPerms = permList.filter((p: { menuId: number }) => p.menuId === menu.id)
    for (const perm of menuPerms) {
      children.push({
        key: `perm-${perm.id}`,
        title: `${perm.name} (${perm.code})`
      })
    }
    tree.push({
      key: `menu-${menu.id}`,
      title: menu.name,
      children
    })
    if (menu.children) {
      for (const sub of menu.children) {
        const subChildren: Array<{ key: string; title: string }> = []
        const subPerms = permList.filter((p: { menuId: number }) => p.menuId === sub.id)
        for (const perm of subPerms) {
          subChildren.push({
            key: `perm-${perm.id}`,
            title: `${perm.name} (${perm.code})`
          })
        }
        tree[tree.length - 1].children?.push({
          key: `menu-${sub.id}`,
          title: sub.name,
          children: subChildren
        })
      }
    }
  }
  permTree.value = tree
}

const permTree = ref<Array<{ key: string; title: string; children?: Array<{ key: string; title: string }> }>>([])
const checkedKeys = ref<string[]>([])

function handleSearch() {
  fetchData()
}

function handleReset() {
  searchKeyword.value = ''
  fetchData()
}

function handleCreate() {
  isEdit.value = false
  Object.assign(formData, { id: undefined, name: '', code: '', description: '', status: true })
  modalVisible.value = true
}

function handleEdit(record: RoleRecord) {
  isEdit.value = true
  Object.assign(formData, { ...record, status: record.status === 1 })
  modalVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    const data = { ...formData, status: formData.status ? 1 : 0 }
    if (isEdit.value) {
      await updateRole(formData.id!, data)
      message.success('更新成功')
    } else {
      await createRole(data)
      message.success('创建成功')
    }
    modalVisible.value = false
    fetchData()
  } catch {
    // validation error
  }
}

async function handleDelete(record: RoleRecord) {
  await deleteRole(record.id)
  message.success('删除成功')
  fetchData()
}

async function handleAssignPerm(record: RoleRecord) {
  currentRole.value = record
  checkedKeys.value = []
  permVisible.value = true
  await loadPermTree()
  try {
    const res = await getRolePermissions(record.id)
    checkedKeys.value = res.data as string[]
  } catch {
    // 新角色可能无权限数据
  }
}

async function handleSavePerm() {
  if (!currentRole.value) return
  await assignRolePermissions(currentRole.value.id, checkedKeys.value)
  message.success('权限分配成功')
  permVisible.value = false
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

.perm-tips {
  margin-bottom: 16px;
}
</style>
