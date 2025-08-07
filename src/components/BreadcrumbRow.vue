<script setup lang="ts">
import { type IBreadcrumbItem } from './breadcrumbs'

interface Props {
  links?: Array<IBreadcrumbItem>
}

withDefaults(defineProps<Props>(), {
  links: () => [],
})
</script>

<template>
  <nav
    aria-label="breadcrumb"
    class="mt-2"
  >
    <ol class="breadcrumb">
      <li
        v-for="(link, i) in links"
        :key="i"
        :class="['breadcrumb-item', link.isActive ? 'active' : '']"
        :aria-current="link.isActive ? 'page' : undefined"
      >
        <router-link
          v-if="link.url"
          :to="link.url"
        >
          {{ link.label }}
        </router-link>
        <span v-else>{{ link.label }}</span>
      </li>
    </ol>
  </nav>
</template>
