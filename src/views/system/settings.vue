<template>
  <a-row :gutter="16">
    <a-col :span="12">
      <a-card title="网站设置">
        <a-form :model="formState" layout="vertical" ref="basicFormRef">
          <a-form-item label="网站名称" name="siteName" :rules="[{ required: true }]">
            <a-input v-model:value="formState.siteName" placeholder="请输入网站名称" />
          </a-form-item>
          <a-form-item label="网站 Logo">
            <a-input v-model:value="formState.logo" placeholder="Logo URL" />
          </a-form-item>
          <a-form-item label="网站 Favicon">
            <a-input v-model:value="formState.favicon" placeholder="Favicon URL" />
          </a-form-item>
          <a-form-item label="备案号">
            <a-input v-model:value="formState.icp" placeholder="如：京ICP备00000000号" />
          </a-form-item>
          <a-form-item label="版权信息">
            <a-input v-model:value="formState.copyright" placeholder="如：© 2024 Admin System" />
          </a-form-item>
          <a-form-item label="客服电话">
            <a-input v-model:value="formState.customerService" placeholder="如：400-888-8888" />
          </a-form-item>
          <a-form-item label="客服邮箱">
            <a-input v-model:value="formState.customerEmail" placeholder="如：service@example.com" />
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
    <a-col :span="12">
      <a-card title="上传配置">
        <a-form :model="formState" layout="vertical">
          <a-form-item label="上传方式">
            <a-select v-model:value="formState.uploadDriver">
              <a-select-option value="local">本地存储</a-select-option>
              <a-select-option value="oss">阿里云 OSS</a-select-option>
              <a-select-option value="cos">腾讯云 COS</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="允许上传格式">
            <a-select v-model:value="formState.uploadExts" mode="multiple" placeholder="选择允许的文件格式">
              <a-select-option value="jpg">JPG</a-select-option>
              <a-select-option value="png">PNG</a-select-option>
              <a-select-option value="gif">GIF</a-select-option>
              <a-select-option value="pdf">PDF</a-select-option>
              <a-select-option value="doc">DOC</a-select-option>
              <a-select-option value="xls">XLS</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="单文件大小限制(MB)">
            <a-input-number v-model:value="formState.uploadMaxSize" :min="1" :max="500" style="width: 100%" />
          </a-form-item>
          <a-form-item label="存储路径前缀">
            <a-input v-model:value="formState.uploadPath" placeholder="如：/uploads" />
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>

  <a-card title="系统设置" style="margin-top: 16px">
    <a-form :model="formState" layout="vertical" ref="systemFormRef">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="时区">
            <a-select v-model:value="formState.timezone">
              <a-select-option value="Asia/Shanghai">(GMT+8) 北京/上海</a-select-option>
              <a-select-option value="UTC">(GMT+0) 协调世界时</a-select-option>
              <a-select-option value="America/New_York">(GMT-5) 纽约</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="语言">
            <a-select v-model:value="formState.language">
              <a-select-option value="zh-CN">简体中文</a-select-option>
              <a-select-option value="en-US">English</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="日期格式">
            <a-select v-model:value="formState.dateFormat">
              <a-select-option value="YYYY-MM-DD">2024-01-01</a-select-option>
              <a-select-option value="DD/MM/YYYY">01/01/2024</a-select-option>
              <a-select-option value="MM/DD/YYYY">01/01/2024</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="是否开启日志">
            <a-switch v-model:checked="formState.logEnabled" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="日志保留天数">
            <a-input-number v-model:value="formState.logDays" :min="1" :max="365" style="width: 100%" :disabled="!formState.logEnabled" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="会话超时时间(分钟)">
            <a-input-number v-model:value="formState.sessionTimeout" :min="5" :max="1440" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item>
        <a-button type="primary" @click="handleSave">保存设置</a-button>
        <a-button style="margin-left: 8px" @click="loadSettings">重置</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getSettings, updateSettings } from '@/api/system'

const basicFormRef = ref()
const systemFormRef = ref()

const formState = reactive({
  siteName: '',
  logo: '',
  favicon: '',
  icp: '',
  copyright: '',
  customerService: '',
  customerEmail: '',
  uploadDriver: 'local',
  uploadExts: ['jpg', 'png'],
  uploadMaxSize: 10,
  uploadPath: '/uploads',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  dateFormat: 'YYYY-MM-DD',
  logEnabled: true,
  logDays: 30,
  sessionTimeout: 30
})

async function loadSettings() {
  const res = await getSettings()
  Object.assign(formState, res.data)
}

async function handleSave() {
  await updateSettings(formState)
  message.success('保存成功')
}

onMounted(() => {
  loadSettings()
})
</script>
