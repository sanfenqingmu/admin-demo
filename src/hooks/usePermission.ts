import { computed } from 'vue'
import { useUserStore } from '@/store/user'

export function usePermission() {
  const userStore = useUserStore()

  const permissions = computed(() => userStore.permissions)
  const roles = computed(() => userStore.userInfo?.roles || [])

  function hasPermission(perm: string): boolean {
    return permissions.value.includes(perm)
  }

  function hasAnyPermission(perms: string[]): boolean {
    return perms.some((p) => permissions.value.includes(p))
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function hasAnyRole(rolesToCheck: string[]): boolean {
    return rolesToCheck.some((r) => roles.value.includes(r))
  }

  function hasAllPermissions(perms: string[]): boolean {
    return perms.every((p) => permissions.value.includes(p))
  }

  return {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions
  }
}
