<template>
  <a-card>
    <div class="header-bar">
      <h3>会员等级配置</h3>
      <a-button type="primary" @click="openCreate" v-permission="'memberLevel:create'"><PlusOutlined /> 新增等级</a-button>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="false" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'icon'">
          <a-tag :color="getLevelColor(record.level)" size="large"><CrownOutlined /> Lv.{{ record.level }}</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-switch v-model:checked="record.status" @change="(v: boolean) => handleToggleStatus(record, v)" />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)" v-permission="'memberLevel:edit'">编辑</a-button>
            <a-popconfirm title="确定删除？等级关联会员将受影响" @confirm="handleDelete(record)">
              <a-button type="link" size="small" danger v-permission="'memberLevel:delete'">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" :title="isEdit ? '编辑等级' : '新增等级'" @ok="handleSubmit(onSubmit)" @cancel="close()" width="550px">
      <a-form :model="formData" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="等级名称" name="name" :rules="[{ required: true }]">
              <a-input v-model:value="formData.name" placeholder="如：黄金会员" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="等级值" name="level" :rules="[{ required: true }]">
              <a-input-number v-model:value="formData.level" :min="1" :max="10" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所需积分">
              <a-input-number v-model:value="formData.minPoints" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="最高积分">
              <a-input-number v-model:value="formData.maxPoints" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="折扣" name="discount" :rules="[{ required: true }]">
              <a-input-number v-model:value="formData.discount" :min="0.1" :max="1" :step="0.05" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-switch v-model:checked="formData.status" :checked-children="'启用'" :un-checked-children="'禁用'" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="等级权益">
          <a-textarea v-model:value="formData.benefits" :rows="3" placeholder="描述该等级享有的权益" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, CrownOutlined } from '@ant-design/icons-vue'
import { getLevelList, createLevel, updateLevel, deleteLevel } from '@/api/member'
import { useTable, useFormModal, usePermission } from '@/hooks'
import type { MemberLevel } from '@/types'

interface LevelFormData {
  id?: number
  name: string
  level: number
  minPoints: number
  maxPoints: number
  discount: number
  status: boolean
  icon: string
  benefits: string
}

const { hasPermission } = usePermission()

const { loading, tableData, loadData } = useTable<MemberLevel>({
  fetchData: async () => {
    const res = await getLevelList()
    return { data: res.data }
  }
})

const defaultForm: LevelFormData = {
  id: undefined, name: '', level: 1, minPoints: 0, maxPoints: 99999,
  discount: 1, status: true, icon: '', benefits: ''
}

const { visible, isEdit, formRef, formData, openCreate, openEdit, close, handleSubmit } = useFormModal<LevelFormData>(defaultForm)

const columns = [
  { title: '等级', key: 'icon', width: 120 },
  { title: '等级名称', dataIndex: 'name', width: 150 },
  { title: '所需积分', dataIndex: 'minPoints', width: 120 },
  { title: '最高积分', dataIndex: 'maxPoints', width: 120 },
  { title: '折扣', dataIndex: 'discount', width: 100, customRender: ({ record }: { record: MemberLevel }) => `${(record.discount * 10).toFixed(1)}折` },
  { title: '等级权益', dataIndex: 'benefits' },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 160 }
]

function getLevelColor(level: number): string {
  const colors: Record<number, string> = { 1: 'default', 2: 'blue', 3: 'orange', 4: 'red' }
  return colors[level] || 'purple'
}

async function onSubmit(data: LevelFormData, id: number | null) {
  const submitData = { ...data, status: data.status ? 1 : 0 }
  if (id) {
    await updateLevel(id, submitData)
  } else {
    await createLevel(submitData)
  }
  loadData()
}

async function handleDelete(record: MemberLevel) {
  await deleteLevel(record.id)
  message.success('删除成功')
  loadData()
}

async function handleToggleStatus(record: MemberLevel, checked: boolean) {
  await updateLevel(record.id, { status: checked ? 1 : 0 })
  message.success(checked ? '已启用' : '已禁用')
  record.status = checked ? 1 : 0
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
</style>