<template>
  <div>
    <a-page-header @back="goBack" title="返回列表" :sub-title="`订单号：${orderDetail?.orderNo}`" style="background: #fff; margin-bottom: 16px" />

    <a-row :gutter="16">
      <a-col :span="16">
        <a-card :bordered="false">
          <template v-if="orderDetail">
            <a-descriptions title="订单信息" :column="2" bordered size="small">
              <a-descriptions-item label="订单号">{{ orderDetail.orderNo }}</a-descriptions-item>
              <a-descriptions-item label="订单状态">
                <a-tag :color="getStatusColor(orderDetail.status)">{{ orderDetail.statusText }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="支付方式">{{ orderDetail.payMethod }}</a-descriptions-item>
              <a-descriptions-item label="订单金额">¥{{ orderDetail.amount }}</a-descriptions-item>
              <a-descriptions-item label="下单时间">{{ orderDetail.createTime }}</a-descriptions-item>
              <a-descriptions-item label="支付时间">{{ orderDetail.payTime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="发货时间" :span="2">{{ orderDetail.shipTime || '-' }}</a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <a-descriptions title="收货信息" :column="1" bordered size="small">
              <a-descriptions-item label="收件人">{{ orderDetail.receiver }}</a-descriptions-item>
              <a-descriptions-item label="联系电话">{{ orderDetail.phone }}</a-descriptions-item>
              <a-descriptions-item label="收货地址">{{ orderDetail.address }}</a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <h4 style="margin-bottom: 16px">商品信息</h4>
            <div class="product-item">
              <div class="product-thumb"><ShoppingOutlined /></div>
              <div class="product-info">
                <div class="product-name">{{ orderDetail.productName }}</div>
                <div class="product-price">¥{{ orderDetail.price }} × {{ orderDetail.quantity }}</div>
              </div>
              <div class="product-total">合计：¥{{ orderDetail.amount }}</div>
            </div>
          </template>
          <a-spin v-else style="display: block; text-align: center; padding: 40px" />
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="操作" :bordered="false" style="margin-bottom: 16px">
          <a-space direction="vertical" style="width: 100%">
            <a-button v-if="orderDetail?.status === 0" v-permission="'order:close'" danger block @click="handleClose">关闭订单</a-button>
            <a-button v-if="orderDetail?.status === 1" v-permission="'order:ship'" type="primary" block @click="handleShip">手动发货</a-button>
            <a-button v-permission="'order:remark'" block @click="openRemark">添加/查看备注</a-button>
          </a-space>
        </a-card>

        <a-card title="订单备注" :bordered="false">
          <div v-if="orderDetail?.remark" class="remark-content">{{ orderDetail.remark }}</div>
          <div v-else class="empty-tip">暂无备注</div>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:open="shipVisible" title="手动发货" @ok="handleShipSubmit" @cancel="closeShip" width="500px" :confirm-loading="submitting">
      <a-form :model="shipForm" layout="vertical" ref="shipFormRef">
        <a-form-item label="物流公司" name="company" :rules="[{ required: true }]">
          <a-select v-model:value="shipForm.company" placeholder="选择物流公司">
            <a-select-option value="顺丰速运">顺丰速运</a-select-option>
            <a-select-option value="京东物流">京东物流</a-select-option>
            <a-select-option value="圆通快递">圆通快递</a-select-option>
            <a-select-option value="中通快递">中通快递</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="物流单号" name="trackingNo" :rules="[{ required: true }]">
          <a-input v-model:value="shipForm.trackingNo" placeholder="请输入物流单号" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="remarkVisible" title="订单备注" @ok="handleRemarkSubmit" @cancel="closeRemark" width="500px" :confirm-loading="remarkSubmitting">
      <a-textarea v-model:value="remarkForm.content" :rows="4" placeholder="请输入备注内容" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ShoppingOutlined } from '@ant-design/icons-vue'
import { getOrderDetail, shipOrder, closeOrder, addOrderRemark } from '@/api/order'
import { useFormModal, usePermission } from '@/hooks'
import type { OrderRecord } from '@/types'

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermission()
const orderDetail = ref<OrderRecord | null>(null)

const { visible: shipVisible, formRef: shipFormRef, formData: shipForm, close: closeShip, validate: validateShip, submitting } = useFormModal({ company: '', trackingNo: '' })

const { visible: remarkVisible, formData: remarkForm, close: closeRemark, submitting: remarkSubmitting } = useFormModal({ content: '' })

function getStatusColor(status: number): string {
  const colors: Record<number, string> = { 0: 'orange', 1: 'blue', 2: 'cyan', 3: 'green', 4: 'default' }
  return colors[status] || 'default'
}

function goBack() { router.push('/order/list') }

async function fetchData() {
  const id = Number(route.params.id)
  const res = await getOrderDetail(id)
  orderDetail.value = res.data
}

function handleShip() {
  shipForm.company = ''
  shipForm.trackingNo = ''
  shipVisible.value = true
}

async function handleShipSubmit() {
  if (!await validateShip()) return
  await shipOrder(orderDetail.value!.id, { ...shipForm })
  message.success('发货成功')
  closeShip()
  fetchData()
}

async function handleClose() {
  await closeOrder(orderDetail.value!.id)
  message.success('订单已关闭')
  fetchData()
}

function openRemark() {
  remarkForm.content = orderDetail.value?.remark || ''
  remarkVisible.value = true
}

async function handleRemarkSubmit() {
  await addOrderRemark(orderDetail.value!.id, remarkForm.content)
  message.success('备注已保存')
  closeRemark()
  fetchData()
}

onMounted(() => { fetchData() })
</script>

<style lang="scss" scoped>
.product-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #fafafa; border-radius: 8px; }
.product-thumb { width: 60px; height: 60px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 28px; }
.product-info { flex: 1; }
.product-name { font-weight: 500; margin-bottom: 4px; }
.product-price { color: #666; }
.product-total { color: #ff4d4f; font-weight: 600; font-size: 16px; }
.remark-content { white-space: pre-wrap; }
.empty-tip { color: #999; text-align: center; padding: 16px; }
</style>