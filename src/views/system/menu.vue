<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索菜单名称"
          style="width: 240px"
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
      <a-button type="primary" @click="handleCreate(null)">
        <PlusOutlined /> 新增菜单
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="false"
      row-key="id"
      :expandedRowKeys="expandedKeys"
      @expand="onExpand"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <a-tag :color="record.type === 'menu' ? 'blue' : 'green'">
            {{ record.type === 'menu' ? '菜单' : '按钮' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'icon'">
          <component :is="record.icon" v-if="record.icon" />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleCreate(record.id)">添加子菜单</a-button>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确定删除？删除子菜单会一并删除" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
      width="600px"
    >
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="菜单名称" name="name" :rules="[{ required: true }]">
              <a-input v-model:value="formData.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="菜单类型" name="type" :rules="[{ required: true }]">
              <a-select v-model:value="formData.type">
                <a-select-option value="menu">菜单</a-select-option>
                <a-select-option value="button">按钮</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="路由路径">
              <a-input v-model:value="formData.path" placeholder="如：/user/list" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="组件路径">
              <a-input v-model:value="formData.component" placeholder="如：views/user/list" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="图标">
              <a-input v-model:value="formData.icon" placeholder="如：UserOutlined" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="是否显示">
              <a-switch v-model:checked="formData.visible" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-switch v-model:checked="formData.status" :checked-children="'启用'" :un-checked-children="'禁用'" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getMenuList, createMenu, updateMenu, deleteMenu } from '@/api/system'

interface MenuRecord {
  id: number
  parentId: number
  name: string
  type: string
  path: string
  component: string
  icon: string
  sort: number
  visible: boolean
  status: number | boolean
  children?: MenuRecord[]
}

const loading = ref(false)
const tableData = ref<MenuRecord[]>([])
const searchKeyword = ref('')
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const expandedKeys = ref<number[]>([])

const formData = reactive<Partial<MenuRecord>>({
  id: undefined,
  parentId: 0,
  name: '',
  type: 'menu',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  visible: true,
  status: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '菜单名称', dataIndex: 'name', width: 150 },
  { title: '类型', key: 'type', width: 100 },
  { title: '图标', key: 'icon', width: 80 },
  { title: '路由路径', dataIndex: 'path' },
  { title: '组件路径', dataIndex: 'component' },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '显示', dataIndex: 'visible', width: 80, customRender: ({ record }: { record: MenuRecord }) => record.visible ? '是' : '否' },
  { title: '状态', dataIndex: 'status', width: 80, customRender: ({ record }: { record: MenuRecord }) => record.status === 1 ? '启用' : '禁用' },
  { title: '操作', key: 'action', width: 240 }
]

async function fetchData() {
  loading.value = true
  try {
    const res = await getMenuList()
    let list = res.data
    if (searchKeyword.value) {
      list = filterTree(list, searchKeyword.value)
    }
    tableData.value = list
    expandedKeys.value = list.map((item: MenuRecord) => item.id)
  } finally {
    loading.value = false
  }
}

function filterTree(list: MenuRecord[], keyword: string): MenuRecord[] {
  return list
    .map((item) => {
      if (item.children && item.children.length > 0) {
        const filtered = filterTree(item.children, keyword)
        if (filtered.length > 0 || item.name.includes(keyword)) {
          return { ...item, children: filtered }
        }
      }
      return item.name.includes(keyword) ? item : null
    })
    .filter(Boolean) as MenuRecord[]
}

function onExpand(expanded: boolean, record: MenuRecord) {
  if (expanded) {
    expandedKeys.value.push(record.id)
  } else {
    expandedKeys.value = expandedKeys.value.filter((k) => k !== record.id)
  }
}

function handleSearch() {
  fetchData()
}

function handleReset() {
  searchKeyword.value = ''
  fetchData()
}

function handleCreate(parentId: number | null) {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    parentId: parentId || 0,
    name: '',
    type: 'menu',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    visible: true,
    status: true
  })
  modalVisible.value = true
}

function handleEdit(record: MenuRecord) {
  isEdit.value = true
  Object.assign(formData, { ...record, status: record.status === 1 })
  modalVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    const data = { ...formData, status: formData.status ? 1 : 0 }
    if (isEdit.value) {
      await updateMenu(formData.id!, data)
      message.success('更新成功')
    } else {
      await createMenu(data)
      message.success('创建成功')
    }
    modalVisible.value = false
    fetchData()
  } catch {
    // validation error
  }
}

async function handleDelete(record: MenuRecord) {
  await deleteMenu(record.id)
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
