<template>
  <a-card>
    <div class="header-bar">
      <a-space>
        <a-input v-model:value="searchKeyword" placeholder="搜索模板名称" style="width: 200px" allow-clear @pressEnter="loadData">
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" @click="loadData">搜索</a-button>
      </a-space>
      <a-button type="primary" @click="openCreate" v-permission="'logistics:freight:create'"><PlusOutlined /> 新增模板</a-button>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="false" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <a-tag :color="getTypeColor(record.type)">{{ getTypeText(record.type) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'regions'">
          <div v-for="(r, idx) in record.regions" :key="idx" class="region-item">
            <span class="region-name">{{ r.region }}</span>
            <span class="region-fee">首{{ r.firstWeight }}kg ¥{{ r.firstFee }}，续{{ r.continueWeight }}kg ¥{{ r.continueFee }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'isDefault'">
          <a-tag v-if="record.isDefault" color="green">默认</a-tag>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-switch v-model:checked="record.status" @change="(v: boolean) => handleToggleStatus(record, v)" />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)" v-permission="'logistics:freight:edit'">编辑</a-button>
            <a-popconfirm title="确定删除？" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger v-permission="'logistics:freight:delete'">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" :title="isEdit ? '编辑运费模板' : '新增运费模板'" @ok="handleSubmit(onSubmit)" @cancel="close()" width="700px">
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="模板名称" name="name" :rules="[{ required: true }]">
              <a-input v-model:value="formData.name" placeholder="如：全国包邮模板" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="计价方式" name="type" :rules="[{ required: true }]">
              <a-select v-model:value="formData.type">
                <a-select-option :value="1">按重量</a-select-option>
                <a-select-option :value="2">按件数</a-select-option>
                <a-select-option :value="3">按体积</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="设为默认">
              <a-switch v-model:checked="formData.isDefault" />
            </a-form-item>
          </a-col>
        </a-row>

        <div class="region-header">
          <span>运费区域设置</span>
          <a-button type="dashed" size="small" @click="addRegion"><PlusOutlined /> 添加区域</a-button>
        </div>

        <div v-for="(region, idx) in formData.regions" :key="idx" class="region-form">
          <a-row :gutter="8" align="middle">
            <a-col :span="6">
              <a-input v-model:value="region.region" placeholder="区域（如：全国）" />
            </a-col>
            <a-col :span="4">
              <a-input-number v-model:value="region.firstWeight" :min="0.1" :step="0.5" addon-after="kg" style="width: 100%" />
            </a-col>
            <a-col :span="4">
              <a-input-number v-model:value="region.firstFee" :min="0" addon-before="¥" style="width: 100%" />
            </a-col>
            <a-col :span="4">
              <a-input-number v-model:value="region.continueWeight" :min="0.1" :step="0.5" addon-after="kg" style="width: 100%" />
            </a-col>
            <a-col :span="4">
              <a-input-number v-model:value="region.continueFee" :min="0" addon-before="¥" style="width: 100%" />
            </a-col>
            <a-col :span="2">
              <a-button type="link" danger size="small" @click="removeRegion(idx)" v-if="formData.regions.length > 1">删除</a-button>
            </a-col>
          </a-row>
          <div class="region-labels">
            <span style="margin-left: 0">区域</span>
            <span>首重</span>
            <span>首费</span>
            <span>续重</span>
            <span>续费</span>
          </div>
        </div>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getFreightList, createFreight, updateFreight, deleteFreight } from '@/api/logistics'
import { useTable, useFormModal, usePermission } from '@/hooks'

interface FreightRegion {
  region: string
  firstWeight: number
  firstFee: number
  continueWeight: number
  continueFee: number
}

interface FreightFormData {
  id?: number
  name: string
  type: number
  isDefault: boolean
  status: number
  regions: FreightRegion[]
  createTime: string
}

const { hasPermission } = usePermission()

const searchKeyword = ref('')

const { loading, tableData, loadData } = useTable<FreightFormData>({
  fetchData: async () => {
    const res = await getFreightList({ keyword: searchKeyword.value })
    return { data: res.data }
  }
})

const defaultForm: FreightFormData = {
  id: undefined, name: '', type: 1, isDefault: false, status: 1,
  regions: [{ region: '全国', firstWeight: 1, firstFee: 0, continueWeight: 1, continueFee: 0 }],
  createTime: ''
}

const { visible, isEdit, formRef, formData, openCreate, openEdit, close, handleSubmit } = useFormModal<FreightFormData>(defaultForm)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '模板名称', dataIndex: 'name', width: 160 },
  { title: '计价方式', key: 'type', width: 100 },
  { title: '区域运费', key: 'regions' },
  { title: '默认模板', key: 'isDefault', width: 90 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 140 }
]

function getTypeText(type: number): string {
  return { 1: '按重量', 2: '按件数', 3: '按体积' }[type] || ''
}
function getTypeColor(type: number): string {
  return { 1: 'blue', 2: 'green', 3: 'orange' }[type] || 'default'
}

async function onSubmit(data: FreightFormData, id: number | null) {
  const submitData = JSON.parse(JSON.stringify(data))
  if (id) {
    await updateFreight(id, submitData)
  } else {
    await createFreight(submitData)
  }
  loadData()
}

async function handleDelete(record: FreightFormData) {
  await deleteFreight(record.id)
  message.success('删除成功')
  loadData()
}

async function handleToggleStatus(record: FreightFormData, checked: boolean) {
  await updateFreight(record.id, { status: checked ? 1 : 0 })
  message.success(checked ? '已启用' : '已禁用')
  record.status = checked ? 1 : 0
}

function addRegion() {
  formData.regions!.push({ region: '', firstWeight: 1, firstFee: 0, continueWeight: 1, continueFee: 0 })
}
function removeRegion(idx: number) {
  formData.regions!.splice(idx, 1)
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.header-bar { display: flex; justify-content: space-between; margin-bottom: 16px; }
.region-item { display: flex; gap: 8px; margin-bottom: 4px; font-size: 13px; }
.region-name { color: #1677ff; min-width: 120px; }
.region-fee { color: #666; }
.region-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 12px; font-weight: 500; }
.region-form { background: #fafafa; padding: 12px; border-radius: 6px; margin-bottom: 12px; }
.region-labels { display: flex; gap: 8px; margin-top: 4px; font-size: 12px; color: #999; }
.region-labels span { flex: 1; text-align: center; }
.region-labels span:first-child { text-align: left; }
</style>