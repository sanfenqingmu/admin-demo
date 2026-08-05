import type { Directive } from 'vue'
import { useUserStore } from '@/store/user'

export const permission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const value = binding.value

    if (!value) return

    const requiredPerms = Array.isArray(value) ? value : [value]
    const hasAll = binding.modifiers.all

    const userPerms = userStore.permissions
    const hasWildcard = userPerms.includes('*')
    let hasPermission: boolean

    if (hasWildcard) {
      hasPermission = true
    } else if (hasAll) {
      hasPermission = requiredPerms.every((p) => userPerms.includes(p))
    } else {
      hasPermission = requiredPerms.some((p) => userPerms.includes(p))
    }

    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}

export const role: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const value = binding.value

    if (!value) return

    const requiredRoles = Array.isArray(value) ? value : [value]
    const hasAll = binding.modifiers.all

    const userRoles = userStore.userInfo?.roles || []
    let hasRole: boolean

    if (hasAll) {
      hasRole = requiredRoles.every((r) => userRoles.includes(r))
    } else {
      hasRole = requiredRoles.some((r) => userRoles.includes(r))
    }

    if (!hasRole) {
      el.parentNode?.removeChild(el)
    }
  }
}
