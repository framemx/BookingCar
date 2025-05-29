<!-- layouts/user.vue -->
<template>
  <div>
    <nav>
      <!-- User Navbar -->
      <NuxtLink to="/user/bookingWelcome">หน้าหลัก</NuxtLink>
      <NuxtLink to="/user/bookingForm">จองคิว</NuxtLink>
      <button @click="logout">Logout</button>
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// ✅ ไม่ต้อง import useRouter หากใช้ Nuxt 3
const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  router.push('/')
}
</script>

