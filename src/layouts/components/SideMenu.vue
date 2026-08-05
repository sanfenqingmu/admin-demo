<template>
  <a-menu
    theme="dark"
    mode="inline"
    :selected-keys="selectedKeys"
    :default-open-keys="defaultOpenKeys"
    @click="onMenuClick"
  >
    <template v-for="route in menuRoutes" :key="route.path">
      <template v-if="route.children && route.children.length > 0">
        <a-sub-menu :key="buildFullPath(route.path)">
          <template #title>
            <component :is="route.meta?.icon" v-if="route.meta?.icon" />
            <span>{{ route.meta?.title }}</span>
          </template>
          <template v-for="child in route.children" :key="buildFullPath(route.path, child.path)">
            <a-sub-menu v-if="child.children && child.children.length > 0" :key="buildFullPath(route.path, child.path)">
              <template #title>
                <component :is="child.meta?.icon" v-if="child.meta?.icon" />
                <span>{{ child.meta?.title }}</span>
              </template>
              <a-menu-item
                v-for="grandChild in child.children"
                :key="buildFullPath(route.path, child.path, grandChild.path)"
              >
                <component :is="grandChild.meta?.icon" v-if="grandChild.meta?.icon" />
                <span>{{ grandChild.meta?.title }}</span>
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="buildFullPath(route.path, child.path)">
              <component :is="child.meta?.icon" v-if="child.meta?.icon" />
              <span>{{ child.meta?.title }}</span>
            </a-menu-item>
          </template>
        </a-sub-menu>
      </template>
      <a-menu-item v-else :key="`/${route.path}`">
        <component :is="route.meta?.icon" v-if="route.meta?.icon" />
        <span>{{ route.meta?.title }}</span>
      </a-menu-item>
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuRoutes = computed(() => {
  const mainRoute = router.options.routes.find((r) => r.path === '/')
  if (!mainRoute?.children) return []
  return mainRoute.children.filter((r) => !r.meta?.hidden)
})

function buildFullPath(...parts: string[]): string {
  const joined = parts.join('/').replace(/\/+/g, '/')
  return joined.startsWith('/') ? joined : '/' + joined
}

const selectedKeys = computed(() => [route.path])

const defaultOpenKeys = computed<string[]>(() => {
  const path = route.path
  const keys: string[] = []

  const mainRoute = router.options.routes.find((r) => r.path === '/')
  if (!mainRoute?.children) return keys

  for (const routeItem of mainRoute.children) {
    if (routeItem.meta?.hidden) continue
    if (routeItem.children && routeItem.children.length > 0) {
      const parentKey = buildFullPath(routeItem.path)
      for (const child of routeItem.children) {
        if (child.children && child.children.length > 0) {
          const childKey = buildFullPath(routeItem.path, child.path)
          if (path.startsWith(childKey)) {
            keys.push(parentKey, childKey)
            break
          }
        } else {
          const fullPath = buildFullPath(routeItem.path, child.path)
          if (path.startsWith(fullPath)) {
            keys.push(parentKey)
            break
          }
        }
      }
    }
  }

  return keys
})

function onMenuClick({ key }: { key: string }) {
  if (key !== route.path) {
    router.push(key)
  }
}
</script>

<style lang="scss" scoped>
.ant-menu-dark {
  border-right: none;
}
</style>
