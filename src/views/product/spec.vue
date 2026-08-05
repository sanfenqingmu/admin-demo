<template>
  <a-card>
    <a-row :gutter="16">
      <a-col :span="8">
        <div class="spec-side">
          <div class="side-header">
            <h3>规格项</h3>
            <a-button v-permission="'product:spec:create'" type="primary" size="small" @click="openSpecCreate"><PlusOutlined /> 新增</a-button>
          </div>
          <a-input v-model:value="specSearch" placeholder="搜索规格项" allow-clear style="margin-bottom: 12px" />
          <div class="spec-list">
            <div v-for="spec in filteredSpecList" :key="spec.id" class="spec-item" :class="{ active: selectedSpecId === spec.id }" @click="selectSpec(spec)">
              <div class="spec-name">{{ spec.name }}</div>
              <div class="spec-count">{{ spec.values?.length || 0 }} 个值</div>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="16">
        <div class="spec-main" v-if="selectedSpec">
          <div class="main-header">
            <h3>{{ selectedSpec.name }} - 规格值</h3>
            <a-button v-permission="'product:spec:value:create'" type="primary" @click="openValueCreate"><PlusOutlined /> 新增规格值</a-button>
          </div>
          <a-table :columns="valueColumns" :data-source="valueList" :pagination="false" row-key="id">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button v-permission="'product:spec:value:edit'" type="link" size="small" @click="openValueEdit(record)">编辑</a-button>
                  <a-popconfirm title="确定删除？" @confirm="handleDeleteValue(record)">
                    <a-button v-permission="'product:spec:value:delete'" type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
        <a-empty v-else description="请选择左侧规格项" />
      </a-col>
    </a-row>

    <a-modal v-model:open="specVisible" :title="isSpecEdit ? '编辑规格项' : '新增规格项'" @ok="onSubmitSpec" @cancel="specClose" width="400px">
      <a-form :model="specForm" layout="vertical" ref="specFormRef">
        <a-form-item label="规格名称" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="specForm.name" placeholder="如：颜色、尺码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="valueVisible" :title="isValueEdit ? '编辑规格值' : '新增规格值'" @ok="onSubmitValue" @cancel="valueClose" width="400px">
      <a-form :model="valueForm" layout="vertical" ref="valueFormRef">
        <a-form-item label="规格值" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="valueForm.name" placeholder="如：红色、M码" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getSpecList, createSpec, updateSpec, deleteSpec, createSpecValue, deleteSpecValue } from '@/api/product'
import { useFormModal, usePermission } from '@/hooks'
import type { SpecRecord } from '@/types'

const { hasPermission } = usePermission()

const specList = ref<SpecRecord[]>([])
const specSearch = ref('')
const selectedSpecId = ref<number | null>(null)
const selectedSpec = computed(() => specList.value.find((s) => s.id === selectedSpecId.value))
const valueList = computed(() => selectedSpec.value?.values || [])

const filteredSpecList = computed(() => {
  if (!specSearch.value) return specList.value
  return specList.value.filter((s) => s.name.includes(specSearch.value))
})

const valueColumns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '规格值', dataIndex: 'name' },
  { title: '操作', key: 'action', width: 160 }
]

const specDefaultForm = { id: undefined as number | undefined, name: '' }
const { visible: specVisible, isEdit: isSpecEdit, formRef: specFormRef, formData: specForm, currentId: specCurrentId, openCreate: openSpecCreate, openEdit: openSpecEdit, close: specClose } = useFormModal(specDefaultForm)

const valueDefaultForm = { id: undefined as number | undefined, name: '' }
const { visible: valueVisible, isEdit: isValueEdit, formRef: valueFormRef, formData: valueForm, currentId: valueCurrentId, openCreate: openValueCreate, openEdit: openValueEdit, close: valueClose } = useFormModal(valueDefaultForm)

async function fetchSpecs() {
  const res = await getSpecList()
  specList.value = res.data as SpecRecord[]
  if (!selectedSpecId.value && specList.value.length > 0) selectedSpecId.value = specList.value[0].id
}

function selectSpec(spec: SpecRecord) { selectedSpecId.value = spec.id }

async function onSubmitSpec() {
  try {
    await specFormRef.value?.validate()
    if (isSpecEdit.value) { await updateSpec(specCurrentId.value!, specForm); message.success('更新成功') }
    else { await createSpec(specForm); message.success('创建成功') }
    specClose()
    fetchSpecs()
  } catch { /* validation */ }
}

async function onSubmitValue() {
  try {
    await valueFormRef.value?.validate()
    if (!selectedSpecId.value) return
    if (isValueEdit.value && valueForm.id) {
      const spec = specList.value.find((s) => s.id === selectedSpecId.value)
      if (spec) {
        const idx = spec.values.findIndex((v) => v.id === valueForm.id)
        if (idx > -1) spec.values[idx] = { id: valueForm.id!, name: valueForm.name }
      }
      message.success('更新成功')
    } else {
      const res = await createSpecValue(selectedSpecId.value, { name: valueForm.name })
      if (res?.data?.id && selectedSpec.value) {
        selectedSpec.value.values.push({ id: res.data.id as number, name: valueForm.name })
      }
      message.success('创建成功')
    }
    valueClose()
  } catch { /* validation */ }
}

async function handleDeleteValue(record: { id: number }) {
  if (!selectedSpecId.value) return
  await deleteSpecValue(selectedSpecId.value, record.id)
  if (selectedSpec.value) {
    selectedSpec.value.values = selectedSpec.value.values.filter((v) => v.id !== record.id)
  }
  message.success('删除成功')
}

onMounted(() => { fetchSpecs() })
</script>

<style lang="scss" scoped>
.spec-side { border-right: 1px solid #f0f0f0; padding-right: 16px; }
.side-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.spec-item { padding: 10px 12px; border-radius: 4px; cursor: pointer; margin-bottom: 4px; transition: background 0.2s; }
.spec-item:hover { background: #f5f5f5; }
.spec-item.active { background: #e6f4ff; border-left: 3px solid #1677ff; }
.spec-name { font-weight: 500; }
.spec-count { font-size: 12px; color: #999; }
.main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
</style>