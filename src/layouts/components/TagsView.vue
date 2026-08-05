<template>
  <div class="tags-view">
    <div class="tags-container">
      <div
        v-for="tag in visitedViews"
        :key="tag.path"
        class="tag-item"
        :class="{ active: isActive(tag) }"
        @click="goTo(tag)"
      >
        <span>{{ tag.title }}</span>
        <CloseOutlined
          v-if="tag.path !== '/dashboard'"
          class="close-icon"
          @click.stop="removeTag(tag)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface TagView {
  path: string
  title: string
}

const route = useRoute()
const router = useRouter()

const visitedViews = ref<TagView[]>([])

function isActive(tag: TagView) {
  return tag.path === route.path
}

function goTo(tag: TagView) {
  if (!isActive(tag)) {
    router.push(tag.path)
  }
}

function addTag() {
  const { path, meta } = route
  if (meta?.title && !visitedViews.value.some((v) => v.path === path)) {
    visitedViews.value.push({
      path,
      title: meta.title as string
    })
  }
}

function removeTag(tag: TagView) {
  const index = visitedViews.value.findIndex((v) => v.path === tag.path)
  if (index > -1) {
    visitedViews.value.splice(index, 1)
    if (isActive(tag)) {
      const nextTag = visitedViews.value[index] || visitedViews.value[index - 1]
      if (nextTag) {
        router.push(nextTag.path)
      } else {
        router.push('/dashboard')
      }
    }
  }
}

watch(
  () => route.path,
  () => {
    addTag()
  }
)

onMounted(() => {
  addTag()
})
</script>

<style lang="scss" scoped>
.tags-view {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 6px 16px;
  min-height: $tags-view-height;
}

.tags-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;

  &:hover {
    background: #e8e8e8;
  }

  &.active {
    background: #e6f4ff;
    color: $primary-color;
    border: 1px solid $primary-color;
  }

  .close-icon {
    font-size: 10px;
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
