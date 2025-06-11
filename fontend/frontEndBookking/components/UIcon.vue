<!-- components/UIcon.vue -->
<template>
  <i :class="name" />
</template>

<script setup lang="ts">
defineProps<{ name: string }>();
</script>
