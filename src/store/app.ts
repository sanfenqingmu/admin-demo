import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem } from '@/types'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  const menuList = ref<MenuItem[]>([])
  const breadcrumbs = ref<{ title: string; path?: string }[]>([])

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  function setMenuList(list: MenuItem[]) {
    menuList.value = list
  }

  function setBreadcrumbs(items: { title: string; path?: string }[]) {
    breadcrumbs.value = items
  }

  return {
    collapsed,
    menuList,
    breadcrumbs,
    toggleCollapsed,
    setMenuList,
    setBreadcrumbs
  }
})
