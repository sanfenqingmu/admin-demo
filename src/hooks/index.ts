import { ref, onMounted, onUnmounted } from 'vue'
import { permission, role } from '../directives/permission'

export function useLoading(initial = false) {
  const loading = ref(initial)
  function start() { loading.value = true }
  function stop() { loading.value = false }
  return { loading, start, stop }
}

export function useTimer(callback: () => void, interval: number) {
  let timer: ReturnType<typeof setInterval> | null = null
  onMounted(() => { timer = setInterval(callback, interval) })
  onUnmounted(() => { if (timer) clearInterval(timer) })
}

export { useTable } from './useTable'
export { usePermission } from './usePermission'
export { useFormModal } from './useFormModal'
export { permission, role }
