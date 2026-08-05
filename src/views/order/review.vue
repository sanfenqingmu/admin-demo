<template>
  <a-card>
    <div class="filter-bar">
      <a-row :gutter="16">
        <a-col :span="5">
          <a-input v-model:value="filters.keyword" placeholder="搜索评价内容/用户" allow-clear @pressEnter="handleSearch">
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="filters.hasReply" placeholder="回复状态" allow-clear>
            <a-select-option value="yes">已回复</a-select-option>
            <a-select-option value="no">未回复</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="7">
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
        <template v-if="column.key === 'rating'">
          <a-rate :value="record.rating" disabled style="font-size: 14px" />
        </template>
        <template v-else-if="column.key === 'reply'">
          <span v-if="record.reply" class="reply-text">{{ record.reply }}</span>
          <a-tag v-else color="orange">未回复</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-permission="'review:reply'" v-if="!record.reply" type="link" size="small" @click="handleReply(record)">回复</a-button>
            <a-button v-permission="'review:reply'" v-else type="link" size="small" @click="handleReply(record)">修改回复</a-button>
            <a-popconfirm :title="record.isHidden ? '确定显示该评价？' : '确定隐藏该评价？'" @confirm="handleToggleHidden(record)">
              <a-button v-permission="'review:toggle'" type="link" size="small">{{ record.isHidden ? '显示' : '隐藏' }}</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="replyVisible" title="回复评价" @ok="handleReplySubmit" @cancel="closeReply" width="500px" :confirm-loading="submitting">
      <div v-if="currentRecord" class="reply-preview">
        <a-rate :value="currentRecord.rating" disabled style="font-size: 14px" />
        <p class="review-content">{{ currentRecord.content }}</p>
        <p class="review-meta">— {{ currentRecord.userName }} · {{ currentRecord.createTime }}</p>
      </div>
      <a-divider />
      <a-textarea v-model:value="replyForm.content" :rows="4" placeholder="请输入商家回复内容" />
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getReviewList, replyReview, hideReview } from '@/api/order'
import { useTable, useFormModal, usePermission } from '@/hooks'
import type { ReviewRecord, ListParams } from '@/types'

const { hasPermission } = usePermission()
const currentRecord = ref<ReviewRecord | null>(null)

async function fetchReviewList(params: ListParams) {
  const { dateRange, ...rest } = params
  const finalParams: Record<string, unknown> = { ...rest }
  if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
    const dr = dateRange as Array<{ format?: (fmt: string) => string }>
    finalParams.startDate = dr[0]?.format?.('YYYY-MM-DD')
    finalParams.endDate = dr[1]?.format?.('YYYY-MM-DD')
  }
  return getReviewList(finalParams)
}

const { loading, tableData, pagination, filters, handleTableChange, handleSearch, handleReset, refresh } = useTable<ReviewRecord>({
  fetchData: fetchReviewList,
  defaultParams: { keyword: '', hasReply: undefined as string | undefined, dateRange: null as any }
})

const { visible: replyVisible, formData: replyForm, close: closeReply, submitting } = useFormModal({ content: '' })

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '用户', dataIndex: 'userName', width: 100 },
  { title: '商品', dataIndex: 'productName', width: 150 },
  { title: '评分', key: 'rating', width: 120 },
  { title: '评价内容', dataIndex: 'content' },
  { title: '商家回复', key: 'reply', width: 200 },
  { title: '评价时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const }
]

function handleReply(record: ReviewRecord) {
  currentRecord.value = record
  replyForm.content = record.reply || ''
  replyVisible.value = true
}

async function handleReplySubmit() {
  await replyReview(currentRecord.value!.id, replyForm.content)
  message.success('回复成功')
  closeReply()
  refresh()
}

async function handleToggleHidden(record: ReviewRecord) {
  await hideReview(record.id)
  message.success(record.isHidden ? '已显示' : '已隐藏')
  record.isHidden = !record.isHidden
}
</script>

<style lang="scss" scoped>
.filter-bar { margin-bottom: 16px; }
.reply-text { color: #1677ff; }
.reply-preview { background: #fafafa; padding: 12px; border-radius: 6px; }
.review-content { margin: 8px 0; color: #333; }
.review-meta { color: #999; font-size: 12px; margin: 0; }
</style>