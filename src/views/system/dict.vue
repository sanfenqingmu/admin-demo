<template>
  <a-card>
    <a-row :gutter="16">
      <a-col :span="6">
        <div class="dict-side">
          <div class="side-header">
            <h3>字典类型</h3>
            <a-button type="primary" size="small" @click="handleCreateType">
              <PlusOutlined /> 新增
            </a-button>
          </div>
          <div class="side-search">
            <a-input v-model:value="typeSearch" placeholder="搜索类型名称" allow-clear />
          </div>
          <div class="side-list">
            <div
              v-for="item in filteredTypeList"
              :key="item.id"
              class="type-item"
              :class="{ active: selectedTypeId === item.id }"
              @click="selectType(item)"
            >
              <div class="type-name">{{ item.name }}</div>
              <div class="type-code">{{ item.code }}</div>
            </div>
            <a-empty v-if="filteredTypeList.length === 0" description="暂无数据" />
          </div>
        </div>
      </a-col>
      <a-col :span="18">
        <div class="dict-main">
          <div class="main-header">
            <h3>{{ currentType?.name || '字典项' }}</h3>
            <a-space>
              <a-button v-if="currentType" type="primary" size="small" @click="handleCreateItem">
                <PlusOutlined /> 新增字典项
              </a-button>
            </a-space>
          </div>
          <a-table
            v-if="currentType"
            :columns="itemColumns"
            :data-source="itemList"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="handleEditItem(record)">编辑</a-button>
                  <a-popconfirm title="确定删除？" @confirm="handleDeleteItem(record)">
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
          <a-empty v-else description="请选择左侧字典类型" />
        </div>
      </a-col>
    </a-row>

    <a-modal v-model:open="typeModalVisible" :title="isEditType ? '编辑字典类型' : '新增字典类型'" @ok="handleSubmitType" @cancel="typeModalVisible = false" width="500px">
      <a-form :model="typeForm" layout="vertical" ref="typeFormRef">
        <a-form-item label="类型名称" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="typeForm.name" placeholder="如：订单状态" />
        </a-form-item>
        <a-form-item label="类型编码" name="code" :rules="[{ required: true }]">
          <a-input v-model:value="typeForm.code" placeholder="如：order_status" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="typeForm.description" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="itemModalVisible" :title="isEditItem ? '编辑字典项' : '新增字典项'" @ok="handleSubmitItem" @cancel="itemModalVisible = false" width="500px">
      <a-form :model="itemForm" layout="vertical" ref="itemFormRef">
        <a-form-item label="标签" name="label" :rules="[{ required: true }]">
          <a-input v-model:value="itemForm.label" placeholder="如：待支付" />
        </a-form-item>
        <a-form-item label="键值" name="value" :rules="[{ required: true }]">
          <a-input v-model:value="itemForm.value" placeholder="如：0" />
        </a-form-item>
        <a-form-item label="标签颜色">
          <a-select v-model:value="itemForm.color" placeholder="请选择颜色（可选）">
            <a-select-option value="">默认</a-select-option>
            <a-select-option value="red">红色</a-select-option>
            <a-select-option value="green">绿色</a-select-option>
            <a-select-option value="blue">蓝色</a-select-option>
            <a-select-option value="orange">橙色</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="itemForm.sort" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getDictTypeList, getDictItemList, createDictType, updateDictType, deleteDictType, createDictItem, updateDictItem, deleteDictItem } from '@/api/system'

interface DictType {
  id: number
  name: string
  code: string
  description: string
}

interface DictItem {
  id: number
  typeId: number
  label: string
  value: string
  color: string
  sort: number
}

const typeList = ref<DictType[]>([])
const typeSearch = ref('')
const selectedTypeId = ref<number | null>(null)
const currentType = computed(() => typeList.value.find((t) => t.id === selectedTypeId.value))

const filteredTypeList = computed(() => {
  if (!typeSearch.value) return typeList.value
  return typeList.value.filter((t) => t.name.includes(typeSearch.value) || t.code.includes(typeSearch.value))
})

const itemList = ref<DictItem[]>([])
const typeModalVisible = ref(false)
const itemModalVisible = ref(false)
const isEditType = ref(false)
const isEditItem = ref(false)
const typeFormRef = ref()
const itemFormRef = ref()

const typeForm = reactive<Partial<DictType>>({ id: undefined, name: '', code: '', description: '' })
const itemForm = reactive<Partial<DictItem>>({ id: undefined, typeId: undefined, label: '', value: '', color: '', sort: 0 })

const itemColumns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '标签', dataIndex: 'label' },
  { title: '键值', dataIndex: 'value' },
  { title: '颜色', dataIndex: 'color', width: 100, customRender: ({ record }: { record: DictItem }) =>
    record.color ? `<span style="color:${record.color}">●</span> ${record.color}` : '-'
  },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '操作', key: 'action', width: 160 }
]

async function fetchTypes() {
  const res = await getDictTypeList()
  typeList.value = res.data
}

async function fetchItems() {
  if (!selectedTypeId.value) return
  const res = await getDictItemList({ typeId: selectedTypeId.value })
  itemList.value = res.data.list
}

function selectType(item: DictType) {
  selectedTypeId.value = item.id
  fetchItems()
}

function handleCreateType() {
  isEditType.value = false
  Object.assign(typeForm, { id: undefined, name: '', code: '', description: '' })
  typeModalVisible.value = true
}

function handleEditType(item: DictType) {
  isEditType.value = true
  Object.assign(typeForm, item)
  typeModalVisible.value = true
}

async function handleSubmitType() {
  try {
    await typeFormRef.value?.validate()
    if (isEditType.value) {
      await updateDictType(typeForm.id!, typeForm)
      message.success('更新成功')
    } else {
      await createDictType(typeForm)
      message.success('创建成功')
    }
    typeModalVisible.value = false
    fetchTypes()
  } catch {
    // validation error
  }
}

async function handleDeleteType(item: DictType) {
  await deleteDictType(item.id)
  message.success('删除成功')
  if (selectedTypeId.value === item.id) {
    selectedTypeId.value = null
    itemList.value = []
  }
  fetchTypes()
}

function handleCreateItem() {
  if (!selectedTypeId.value) {
    message.warning('请先选择字典类型')
    return
  }
  isEditItem.value = false
  Object.assign(itemForm, { id: undefined, typeId: selectedTypeId.value, label: '', value: '', color: '', sort: 0 })
  itemModalVisible.value = true
}

function handleEditItem(record: DictItem) {
  isEditItem.value = true
  Object.assign(itemForm, record)
  itemModalVisible.value = true
}

async function handleSubmitItem() {
  try {
    await itemFormRef.value?.validate()
    if (isEditItem.value) {
      await updateDictItem(itemForm.id!, itemForm)
      message.success('更新成功')
    } else {
      await createDictItem(itemForm)
      message.success('创建成功')
    }
    itemModalVisible.value = false
    fetchItems()
  } catch {
    // validation error
  }
}

async function handleDeleteItem(record: DictItem) {
  await deleteDictItem(record.id)
  message.success('删除成功')
  fetchItems()
}

onMounted(() => {
  fetchTypes()
})
</script>

<style lang="scss" scoped>
.dict-side {
  border-right: 1px solid #f0f0f0;
  padding-right: 16px;

  .side-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h3 {
      margin: 0;
    }
  }

  .side-search {
    margin-bottom: 12px;
  }

  .side-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .type-item {
    padding: 10px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 4px;

    &:hover {
      background: #f5f5f5;
    }

    &.active {
      background: #e6f4ff;
      border-left: 3px solid #1677ff;
    }

    .type-name {
      font-weight: 500;
      margin-bottom: 2px;
    }

    .type-code {
      font-size: 12px;
      color: #999;
    }
  }
}

.dict-main {
  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
    }
  }
}
</style>
