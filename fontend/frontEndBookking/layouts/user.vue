<template>
  <div class="user-layout min-h-screen flex flex-col bg-gray-50 font-kanit">
    <!-- Navbar -->
    <header class="fixed top-0 left-0 w-full bg-white shadow z-50">
      <nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <!-- Logo -->
        <div class="text-2xl font-bold text-blue-600">RW</div>

        <!-- Menu -->
        <div class="flex-1 flex justify-center gap-12">
          <NuxtLink to="/user/home" class="nav-link" :class="{ active: isActive('/user/home') }">HOME</NuxtLink>
          <NuxtLink to="/user/bookingWelcome" class="nav-link" :class="{ active: isActive('/user/bookingWelcome') }">RESERVATIONS</NuxtLink>
          <NuxtLink to="/user/bookingForm" class="nav-link" :class="{ active: isActive('/user/bookingForm') }">BOOKING</NuxtLink>
        </div>

        <!-- Logout Button -->
        <button @click="showLogoutModal = true" class="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-semibold">
          LOGOUT
        </button>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-grow pt-20 px-6 max-w-7xl mx-auto w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-6">
      <div class="max-w-7xl mx-auto px-6 text-center text-sm text-gray-400">
        © {{ currentYear }} BookingCarCare. สงวนลิขสิทธิ์.
      </div>
    </footer>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div class="bg-white rounded-2xl px-8 py-6 text-center shadow-xl w-full max-w-sm">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">ออกจากระบบ</h2>
        <p class="text-gray-600 mb-6">คุณต้องการออกจากระบบหรือไม่?</p>
        <div class="flex justify-center gap-4">
          <button @click="showLogoutModal = false" class="px-4 py-2 border border-gray-400 rounded-full text-gray-700 hover:bg-gray-100">
            ไม่
          </button>
          <button @click="logout" class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600">
            ใช่
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const showLogoutModal = ref(false)
const currentYear = new Date().getFullYear()
const router = useRouter()
const route = useRoute()

function logout() {
  localStorage.clear()
  router.push('/')
}

function isActive(path) {
  return route.path === path
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&display=swap');

.user-layout {
  font-family: 'Kanit', sans-serif;
}

.nav-link {
  font-weight: 500;
  font-size: 1.05rem;
  color: #334155;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #e0e7ff;
  color: #2563eb;
}

.nav-link.active {
  background-color: #2563eb;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}
</style>
