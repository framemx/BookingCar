<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold">หน้าจองคิว</h1>
    <p>ยินดีต้อนรับ คุณ {{ userName }}</p>
    <p>อีเมล: {{ userEmail }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'user',
})

const userName = ref('')
const userEmail = ref('')

// ดึงข้อมูล user จาก localStorage (สมมติว่าเก็บเป็น JSON string)
onMounted(() => {
  const userData = localStorage.getItem('userData')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userName.value = user.name || 'ผู้ใช้'
      userEmail.value = user.email || '-'
    } catch {
      userName.value = 'ผู้ใช้'
      userEmail.value = '-'
    }
  } else {
    userName.value = 'ผู้ใช้'
    userEmail.value = '-'
  }
})
</script>
