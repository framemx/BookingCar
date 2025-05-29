<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout min-h-screen flex flex-col bg-gray-50">
    <nav class="bg-white shadow-md flex items-center justify-between px-8 py-4">
      <div class="flex space-x-8">
        <NuxtLink
          to="/admin/dashboard"
          class="nav-link"
          :class="{ 'active': isActive('/admin/dashboard') }"
          >Dashboard</NuxtLink
        >
        <NuxtLink
          to="/admin/service"
          class="nav-link"
          :class="{ 'active': isActive('/admin/service') }"
          >Service</NuxtLink
        >
        <NuxtLink
          to="/admin/slotManagement"
          class="nav-link"
          :class="{ 'active': isActive('/admin/slotManagement') }"
          >Slot Management</NuxtLink
        >
      </div>

      <button
        @click="logout"
        class="btn-logout px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition"
      >
        Logout
      </button>
    </nav>

    <main class="flex-grow p-8 max-w-7xl mx-auto w-full">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

function logout() {
  localStorage.removeItem('token')
  router.push('/')
}

// เช็คว่าลิงก์ไหน active
function isActive(path: string) {
  return route.path === path
}
</script>

<style scoped>
.admin-layout {
  font-family: "Sarabun", sans-serif;
  color: #1e293b;
}

nav {
  /* เงาและพื้นหลัง */
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgb(0 0 0 / 0.1);
}

/* ลิงก์เมนู */
.nav-link {
  font-weight: 600;
  font-size: 1.1rem;
  color: #475569;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.nav-link:hover {
  background-color: #e0e7ff; /* สีฟ้าจางๆเวลาชี้ */
  color: #3b82f6;
}

.nav-link.active {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

/* ปุ่ม Logout */
.btn-logout {
  font-size: 1rem;
  user-select: none;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-logout:focus {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
</style>
