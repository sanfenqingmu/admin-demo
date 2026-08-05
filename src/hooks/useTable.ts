import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import type { ListParams, ListResult, PaginationState } from '@/types'

interface UseTableOptions<T> {
  fetchData: (params: ListParams) => Promise<{ data: ListResult<T> }>
  autoLoad?: boolean
  immediate?: boolean
  defaultParams?: Record<string, unknown>
}

export function useTable<T = unknown>(options: UseTableOptions<T>) {
  const loading = ref(false)
  const tableData = ref<T[]>([])
  const selectedRowKeys = ref<Array<string | number>>([])
  const selectedRows = ref<T[]>([])

  const pagination = reactive<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`
  })

  const filters = reactive<Record<string, unknown>>({ ...(options.defaultParams || {}) })

  const selectedCount = computed(() => selectedRowKeys.value.length)

  async function loadData() {
    loading.value = true
    try {
      const params: ListParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters
      }
      const res = await options.fetchData(params)
      tableData.value = res.data.list
      pagination.total = res.data.total
    } finally {
      loading.value = false
    }
  }

  function handleTableChange(pag: { current: number; pageSize: number }) {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
    loadData()
  }

  function handleSearch() {
    pagination.current = 1
    loadData()
  }

  function handleReset() {
    Object.keys(filters).forEach((key) => { delete filters[key] })
    Object.assign(filters, options.defaultParams || {})
    pagination.current = 1
    loadData()
  }

  function setFilters(newFilters: Record<string, unknown>) {
    Object.assign(filters, newFilters)
  }

  function setSelectedKeys(keys: Array<string | number>) {
    selectedRowKeys.value = keys
    selectedRows.value = tableData.value.filter((item: any) => keys.includes(item.id))
  }

  function clearSelection() {
    selectedRowKeys.value = []
    selectedRows.value = []
  }

  function refresh() {
    loadData()
  }

  onMounted(() => {
    if (options.autoLoad !== false) {
      loadData()
    }
  })

  return {
    loading,
    tableData,
    pagination,
    filters,
    selectedRowKeys,
    selectedRows,
    selectedCount,
    loadData,
    handleTableChange,
    handleSearch,
    handleReset,
    setFilters,
    setSelectedKeys,
    clearSelection,
    refresh
  }
}
