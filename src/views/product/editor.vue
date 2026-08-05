<template>
  <a-form ref="formRef" :model="formData" :label-col="{ span: 4 }" class="product-form">
    <a-card title="基础信息" :bordered="false">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="商品名称" name="name" :rules="[{ required: true, message: '请输入商品名称' }]">
            <a-input v-model:value="formData.name" placeholder="请输入商品名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="商品分类" name="categoryId" :rules="[{ required: true, message: '请选择分类' }]">
            <a-tree-select
              v-model:value="formData.categoryId"
              :tree-data="categoryTree"
              :field-names="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="请选择分类"
              tree-default-expand-all
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="商品品牌" name="brandId">
            <a-select v-model:value="formData.brandId" placeholder="请选择品牌" allow-clear>
              <a-select-option v-for="b in brandList" :key="b.id" :value="b.id">{{ b.name }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="商品状态">
            <a-radio-group v-model:value="formData.status">
              <a-radio :value="1">立即上架</a-radio>
              <a-radio :value="0">放入仓库</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <a-card title="商品图片" :bordered="false" class="section-card">
      <a-row :gutter="24">
        <a-col :span="12">
          <div class="image-upload">
            <div class="upload-label">商品主图 <span class="required">*</span></div>
            <a-upload list-type="picture-card" :max-count="1" :file-list="formData.mainImage ? [{ uid: '-1', url: formData.mainImage }] : []" @change="(e: { fileList: Array<{ url?: string }> }) => handleImageChange(e, 'mainImage')">
              <div><PlusOutlined /><span>上传主图</span></div>
            </a-upload>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="image-upload">
            <div class="upload-label">商品相册</div>
            <a-upload list-type="picture-card" :max-count="10" multiple :file-list="imageFileList" @change="handleGalleryChange">
              <div><PlusOutlined /><span>上传图片</span></div>
            </a-upload>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <a-card title="商品规格" :bordered="false" class="section-card">
      <div class="spec-toolbar">
        <span>启用规格：</span>
        <a-checkbox v-model:checked="enableSpec" @change="onSpecEnabledChange">多规格（不同颜色/尺码对应不同 SKU）</a-checkbox>
      </div>
      <div v-if="enableSpec">
        <a-table :columns="specColumns" :data-source="specTableData" :pagination="false" row-key="key" bordered size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" danger @click="removeSpecRow(record.key)">删除</a-button>
            </template>
          </template>
        </a-table>
        <a-button type="dashed" block style="margin-top: 12px" @click="addSpecRow"><PlusOutlined /> 添加规格行</a-button>
      </div>
      <div v-else>
        <a-form-item label="价格">
          <a-input-number v-model:value="formData.price" :min="0" :precision="2" style="width: 200px" />
        </a-form-item>
        <a-form-item label="库存">
          <a-input-number v-model:value="formData.stock" :min="0" style="width: 200px" />
        </a-form-item>
      </div>
    </a-card>

    <a-card title="商品详情" :bordered="false" class="section-card">
      <a-form-item label="商品描述">
        <a-textarea v-model:value="formData.description" :rows="4" placeholder="请输入商品描述" />
      </a-form-item>
    </a-card>

    <div class="form-footer">
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button v-permission="'product:save'" type="primary" @click="handleSubmit">保存商品</a-button>
      </a-space>
    </div>
  </a-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getCategoryTree, getBrandList, getSpecList, getProductDetail, createProduct, updateProduct } from '@/api/product'
import { usePermission } from '@/hooks'

const router = useRouter()
const route = useRoute()
const { hasPermission } = usePermission()

const formRef = ref()
const isEdit = computed(() => !!route.params.id)

const categoryTree = ref<any[]>([])
const brandList = ref<any[]>([])
const specListData = ref<any[]>([])

const enableSpec = ref(false)
const specTableData = ref<any[]>([])

const formData = reactive({
  name: '', categoryId: undefined as number | undefined, brandId: undefined as number | undefined,
  status: 1, mainImage: '', images: [] as string[], description: '',
  price: 0, stock: 0, specList: [] as any[]
})

const imageFileList = computed({
  get: () => formData.images.map((url, idx) => ({ uid: String(idx), url })),
  set: (_val: Array<{ uid: string; url: string }>) => { /* handled in handler */ }
})

const specColumns = [
  { title: '规格', dataIndex: 'specText', width: 200 },
  { title: '价格', dataIndex: 'price', width: 120 },
  { title: '库存', dataIndex: 'stock', width: 120 },
  { title: 'SKU编码', dataIndex: 'skuCode', width: 150 },
  { title: '操作', key: 'action', width: 80 }
]

let specRowKey = 0

function addSpecRow() {
  specRowKey++
  specTableData.value.push({
    key: specRowKey, specText: '', price: 0, stock: 0, skuCode: ''
  })
}

function removeSpecRow(key: number) {
  specTableData.value = specTableData.value.filter((r) => r.key !== key)
}

function onSpecEnabledChange(checked: boolean) {
  if (checked && specTableData.value.length === 0) addSpecRow()
}

function handleImageChange(e: { fileList: Array<{ url?: string }> }, field: string) {
  if (e.fileList.length > 0) {
    const file = e.fileList[e.fileList.length - 1]
    formData[field as 'mainImage'] = file.url || ''
  } else {
    formData[field as 'mainImage'] = ''
  }
}

function handleGalleryChange(e: { fileList: Array<{ url?: string }> }) {
  formData.images = e.fileList.map((f: { url?: string }) => f.url || '')
}

async function loadData() {
  const [catRes, brandRes, specRes] = await Promise.all([getCategoryTree(), getBrandList(), getSpecList()])
  categoryTree.value = catRes.data
  brandList.value = brandRes.data.list
  specListData.value = specRes.data

  if (isEdit.value) {
    const res = await getProductDetail(Number(route.params.id))
    if (res.data) {
      Object.assign(formData, {
        name: res.data.name,
        categoryId: res.data.categoryId,
        brandId: res.data.brandId,
        status: res.data.status,
        mainImage: res.data.mainImage,
        images: res.data.images || [],
        description: res.data.description,
        price: res.data.price,
        stock: res.data.stock
      })
      enableSpec.value = !!(res.data.skuList && res.data.skuList.length > 0)
      if (enableSpec.value) {
        specTableData.value = res.data.skuList.map((s: { specText: string; price: number; stock: number; skuCode: string }, idx: number) => ({
          key: idx + 1, specText: s.specText, price: s.price, stock: s.stock, skuCode: s.skuCode
        }))
      }
    }
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    const payload = { ...formData, specList: enableSpec.value ? specTableData.value : [] }
    if (isEdit.value) {
      await updateProduct(Number(route.params.id), payload)
      message.success('更新成功')
    } else {
      await createProduct(payload)
      message.success('创建成功')
    }
    router.push('/product/list')
  } catch { /* validation */ }
}

function handleCancel() { router.push('/product/list') }

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.product-form { max-width: 1200px; margin: 0 auto; }
.section-card { margin-top: 16px; }
.form-footer { text-align: center; padding: 24px; }
.image-upload { margin-bottom: 16px; }
.upload-label { margin-bottom: 8px; color: #333; font-weight: 500; }
.required { color: #ff4d4f; }
.spec-toolbar { margin-bottom: 16px; }
</style>