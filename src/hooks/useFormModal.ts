import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'

export function useFormModal<T extends object>(defaultForm: T) {
  const visible = ref(false)
  const isEdit = ref(false)
  const formRef = ref<FormInstance>()
  const formData = reactive<T>({ ...defaultForm }) as T
  const currentId = ref<number | null>(null)
  const submitting = ref(false)

  function openCreate() {
    isEdit.value = false
    currentId.value = null
    resetForm()
    visible.value = true
  }

  function openEdit(record: Partial<T> & { id: number }) {
    isEdit.value = true
    currentId.value = record.id
    Object.assign(formData, JSON.parse(JSON.stringify(record)))
    visible.value = true
  }

  function close() {
    visible.value = false
    submitting.value = false
  }

  function resetForm() {
    Object.keys(formData).forEach((key) => {
      delete (formData as Record<string, unknown>)[key]
    })
    Object.assign(formData, JSON.parse(JSON.stringify(defaultForm)))
    formRef.value?.clearValidate()
  }

  async function validate(): Promise<boolean> {
    try {
      await formRef.value?.validate()
      return true
    } catch {
      return false
    }
  }

  async function handleSubmit(callback: (data: T, id: number | null) => Promise<void>) {
    if (!await validate()) return
    submitting.value = true
    try {
      await callback({ ...formData }, currentId.value)
      message.success(isEdit.value ? '更新成功' : '创建成功')
      close()
    } catch (e) {
      console.error('Submit failed:', e)
    } finally {
      submitting.value = false
    }
  }

  return {
    visible,
    isEdit,
    formRef,
    formData,
    currentId,
    submitting,
    openCreate,
    openEdit,
    close,
    resetForm,
    validate,
    handleSubmit
  }
}
