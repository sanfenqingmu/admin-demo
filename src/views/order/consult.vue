<template>
  <a-card>
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input v-model:value="filters.keyword" placeholder="搜索咨询内容/用户" allow-clear @pressEnter="handleSearch">
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.status" placeholder="回复状态" allow-clear>
            <a-select-option :value="1">已回复</a-select-option>
            <a-select-option :value="0">未回复</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-range-picker v-model:value="filters.dateRange" show-time format="YYYY-MM-DD" />
        </a-col>
        <a-col :span="8">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'orange'">{{ record.status === 1 ? '已回复' : '未回复' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'reply'">
          <span v-if="record.reply" class="reply-text">{{ record.reply }}</span>
          <span v-else class="empty-reply">暂无回复</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-permission="'consult:reply'" v-if="!record.reply" type="link" size="small" @click="handleReply(record)">回复</a-button>
            <a-button v-permission="'consult:reply'" v-else type="link" size="small" @click="handleReply(record)">修改</a-button>
            <a-popconfirm title="确定删除该咨询？" @confirm="handleDelete(record)">
              <a-button v-permission="'consult:delete'" type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="replyVisible" title="回复咨询" @ok="handleReplySubmit" @cancel="closeReply" width="500px" :confirm-loading="submitting">
      <div v-if="currentRecord" class="question-preview">
        <div class="question-label">咨询内容：</div>
        <div class="question-text">{{ currentRecord.question }}</div>
        <div class="question-meta">用户：{{ currentRecord.userName }} · 商品：{{ currentRecord.productName }}</div>
      </div>
      <a-divider />
      <a-textarea v-model:value="replyForm.content" :rows="4" placeholder="请输入回复内容" />
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getConsultList, replyConsult, deleteConsult } from '@/api/order'
import { useTable, useFormModal, usePermission } from '@/hooks'
import type { ConsultRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()
const currentRecord = ref<ConsultRecord | null>(null)

async function fetchConsultList(params: ListParams) {
  const { dateRange, ...rest } = params
  const finalParams: Record<string, unknown> = { ...rest }
  if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
    const dr = dateRange as Array<{ format?: (fmt: string) => string }>
    finalParams.startDate = dr[0]?.format?.('YYYY-MM-DD')
    finalParams.endDate = dr[1]?.format?.('YYYY-MM-DD')
  }
  return getConsultList(finalParams)
}

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, refresh } = useTable<ConsultRecord>({
  fetchData: fetchConsultList,
  defaultParams: { keyword: '', status: undefined as number | undefined, dateRange: null as any }
})

const { visible: replyVisible, formData: replyForm, close: closeReply, submitting } = useFormModal({ content: '' })

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '用户', dataIndex: 'userName', width: 100 },
  { title: '商品', dataIndex: 'productName', width: 150 },
  { title: '咨询内容', dataIndex: 'question' },
  { title: '商家回复', key: 'reply', width: 200 },
  { title: '回复状态', key: 'status', width: 90 },
  { title: '咨询时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const }
]

function handleReply(record: ConsultRecord) {
  currentRecord.value = record
  replyForm.content = record.reply || ''
  replyVisible.value = true
}

async function handleReplySubmit() {
  await replyConsult(currentRecord.value!.id, replyForm.content)
  message.success('回复成功')
  closeReply()
  refresh()
}

async function handleDelete(record: ConsultRecord) {
  await deleteConsult(record.id)
  message.success('删除成功')
  refresh()
}
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.reply-text { color: #1677ff; }
.empty-reply { color: #999; }
.question-preview { background: #fafafa; padding: 12px; border-radius: 6px; }
.question-label { font-weight: 500; color: #333; margin-bottom: 4px; }
.question-text { color: #666; margin-bottom: 8px; }
.question-meta { color: #999; font-size: 12px; }
</style>