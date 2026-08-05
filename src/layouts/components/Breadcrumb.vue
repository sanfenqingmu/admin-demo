<template>
  <a-breadcrumb class="app-breadcrumb">
    <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
      <span v-if="index === breadcrumbList.length - 1">{{ item.title }}</span>
      <a v-else @click.prevent="handleClick(item)">{{ item.title }}</a>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbList = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  return matched.map((item) => ({
    title: item.meta!.title as string,
    path: item.path
  }))
})

function handleClick(item: { path?: string }) {
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  font-size: 14px;
}
</style>
