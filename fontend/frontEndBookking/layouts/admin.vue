<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-slate-100">
    <!-- Premium Admin Navbar -->
    <nav class="fixed top-0 left-0 w-full bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800 shadow-2xl z-50 border-b border-slate-600/30">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10"></div>
      <div class="relative flex items-center justify-between px-8 py-4 max-w-7xl mx-auto gap-6">
        
        <!-- Admin Logo Section -->
        <div class="flex items-center space-x-4 group min-w-fit">
          <div class="logo-container relative">
            <div class="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div class="relative h-12 w-12 rounded-full shadow-xl border-2 border-white/80 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl transition-all duration-300 group-hover:scale-110">
              ⚙️
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-white text-2xl font-bold tracking-wide drop-shadow-lg bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
              Admin Panel
            </span>
            <span class="text-orange-200 text-xs font-medium tracking-wider opacity-90">
              CarCare Pro Management
            </span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="hidden lg:flex flex-1 justify-center px-4">
          <div class="flex gap-1 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 max-w-fit">
            <NuxtLink
              to="/admin/dashboard"
              class="admin-nav-link compact"
              :class="{ 'active': isActive('/admin/dashboard') }"
            >
              <span class="nav-icon">📊</span>
              <span class="nav-text">Dashboard</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/service"
              class="admin-nav-link compact"
              :class="{ 'active': isActive('/admin/service') }"
            >
              <span class="nav-icon">🔧</span>
              <span class="nav-text">Service</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/slotList"
              class="admin-nav-link compact"
              :class="{ 'active': isActive('/admin/slotList') }"
            >
              <span class="nav-icon">📋</span>
              <span class="nav-text">Slots</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/slotManagement"
              class="admin-nav-link compact"
              :class="{ 'active': isActive('/admin/slotManagement') }"
            >
              <span class="nav-icon">⚡</span>
              <span class="nav-text">Manage</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/userManagement"
              class="admin-nav-link compact"
              :class="{ 'active': isActive('/admin/userManagement') }"
            >
              <span class="nav-icon">👥</span>
              <span class="nav-text">Users</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Admin Actions -->
        <div class="flex items-center space-x-6 min-w-fit">
          <div class="hidden md:flex flex-col text-right">
            <span class="text-white text-sm font-medium">Admin Dashboard</span>
            <span class="text-orange-200 text-xs">System Control</span>
          </div>
          <button @click="showLogoutModal = true" class="admin-logout-btn group">
            <span class="logout-icon">🚪</span>
            LOGOUT
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="toggleMobileMenu" class="lg:hidden text-white p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-4">
          <span class="text-xl">☰</span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="lg:hidden bg-slate-900/95 backdrop-blur-sm border-t border-white/10">
        <div class="px-6 py-4 space-y-3">
          <NuxtLink
            to="/admin/dashboard"
            class="mobile-admin-nav-link"
            :class="{ 'active': isActive('/admin/dashboard') }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">📊</span>
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/admin/service"
            class="mobile-admin-nav-link"
            :class="{ 'active': isActive('/admin/service') }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">🔧</span>
            Service
          </NuxtLink>
          <NuxtLink
            to="/admin/slotList"
            class="mobile-admin-nav-link"
            :class="{ 'active': isActive('/admin/slotList') }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">📋</span>
            Slot List
          </NuxtLink>
          <NuxtLink
            to="/admin/slotManagement"
            class="mobile-admin-nav-link"
            :class="{ 'active': isActive('/admin/slotManagement') }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">⚡</span>
            Slot Management
          </NuxtLink>
          <NuxtLink
            to="/admin/userManagement"
            class="mobile-admin-nav-link"
            :class="{ 'active': isActive('/admin/userManagement') }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">👥</span>
            User Management
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow pt-24 p-8 max-w-7xl mx-auto w-full">
      <slot />
    </main>

    <!-- Premium Admin Footer -->
    <footer class="relative bg-gradient-to-br from-slate-800 via-gray-900 to-slate-800 text-white overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-red-900/20"></div>
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%);"></div>
      
      <div class="relative max-w-7xl mx-auto px-8 py-8">
        <!-- Main Footer Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Admin Info -->
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <span class="text-white font-bold text-sm">⚙️</span>
              </div>
              <div>
                <h3 class="text-lg font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">Admin Panel</h3>
                <p class="text-orange-200 text-xs">Management System</p>
              </div>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed">
              ระบบจัดการแอดมินสำหรับ CarCare Pro พร้อมเครื่องมือครบครันในการดูแลระบบ
            </p>
          </div>

          <!-- System Stats -->
          <div class="space-y-3">
            <h4 class="text-md font-semibold text-white border-b border-orange-500/30 pb-2">
              📈 ระบบสถิติ
            </h4>
            <ul class="space-y-1 text-sm">
              <li class="text-gray-300">🏢 การจัดการบริการ</li>
              <li class="text-gray-300">📅 การจัดการช่วงเวลา</li>
              <li class="text-gray-300">👤 การจัดการผู้ใช้</li>
              <li class="text-gray-300">📊 รายงานและวิเคราะห์</li>
            </ul>
          </div>

          <!-- Quick Admin Actions -->
          <div class="space-y-3">
            <h4 class="text-md font-semibold text-white border-b border-orange-500/30 pb-2">
              ⚡ การจัดการด่วน
            </h4>
            <ul class="space-y-1 text-sm">
              <li><NuxtLink to="/admin/dashboard" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">📊 แดชบอร์ด</NuxtLink></li>
              <li><NuxtLink to="/admin/service" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">🔧 จัดการบริการ</NuxtLink></li>
              <li><NuxtLink to="/admin/slotManagement" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">⚡ จัดการช่วงเวลา</NuxtLink></li>
              <li><NuxtLink to="/admin/userManagement" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">👥 จัดการผู้ใช้</NuxtLink></li>
            </ul>
          </div>

          <!-- System Info -->
          <div class="space-y-3">
            <h4 class="text-md font-semibold text-white border-b border-orange-500/30 pb-2">
              ℹ️ ข้อมูลระบบ
            </h4>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center space-x-2 text-gray-300">
                <span class="text-green-400">🟢</span>
                <span>ระบบออนไลน์</span>
              </li>
              <li class="flex items-center space-x-2 text-gray-300">
                <span class="text-orange-400">⚡</span>
                <span>เซิร์ฟเวอร์ปกติ</span>
              </li>
              <li class="flex items-center space-x-2 text-gray-300">
                <span class="text-blue-400">🔄</span>
                <span>อัปเดตล่าสุด</span>
              </li>
              <li class="flex items-center space-x-2 text-gray-300">
                <span class="text-purple-400">🛡️</span>
                <span>ระบบปลอดภัย</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Footer -->
        <div class="border-t border-gray-700 pt-4 mt-6">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div class="text-center md:text-left">
              <p class="text-gray-400 text-sm">
                © {{ currentYear }} CarCare Pro Admin Panel. All rights reserved.
              </p>
              <p class="text-gray-500 text-xs mt-1">
                Secure Management System for Premium Auto Care
              </p>
            </div>
            
            <!-- System Status -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2 text-green-400 text-xs">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>System Online</span>
              </div>
              <div class="flex items-center space-x-2 text-blue-400 text-xs">
                <span>🔐</span>
                <span>Admin Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div class="bg-white rounded-2xl px-8 py-6 text-center shadow-2xl w-full max-w-sm">
        <div class="mb-4">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <span class="text-red-500 text-2xl">🚪</span>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">ออกจากระบบแอดมิน</h2>
          <p class="text-gray-600">คุณต้องการออกจากระบบจัดการหรือไม่?</p>
        </div>
        <div class="flex justify-center gap-4">
          <button 
            @click="showLogoutModal = false" 
            class="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button 
            @click="logout" 
            class="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const showLogoutModal = ref(false)
const showMobileMenu = ref(false)
const currentYear = new Date().getFullYear()

function logout() {
  localStorage.removeItem('token')
  router.push('/')
}

function isActive(path: string) {
  return route.path === path
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
  showMobileMenu.value = false
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&display=swap");

.admin-layout {
  font-family: 'Kanit', sans-serif;
}

/* Admin Navigation Links */
.admin-nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  color: rgba(229, 231, 235, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.admin-nav-link.compact {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  gap: 0.375rem;
}

.admin-nav-link.compact .nav-text {
  display: inline;
}

@media (max-width: 1280px) {
  .admin-nav-link.compact .nav-text {
    display: none;
  }
  .admin-nav-link.compact {
    padding: 0.5rem;
    min-width: 2.5rem;
    justify-content: center;
  }
}

.admin-nav-link:hover {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.8), rgba(239, 68, 68, 0.8));
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(251, 146, 60, 0.4);
  backdrop-filter: blur(10px);
}

.admin-nav-link.active {
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(251, 146, 60, 0.3);
}

.nav-icon {
  font-size: 1rem;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.admin-nav-link:hover .nav-icon {
  opacity: 1;
  transform: scale(1.1);
}

.admin-nav-link.active .nav-icon {
  opacity: 1;
}

/* Admin Logout Button */
.admin-logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  white-space: nowrap;
}

.admin-logout-btn:hover {
  background: linear-gradient(135deg, #f87171, #ef4444);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.5);
}

.logout-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.admin-logout-btn:hover .logout-icon {
  transform: translateX(2px);
}

/* Mobile Admin Navigation */
.mobile-admin-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  color: rgba(229, 231, 235, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.mobile-admin-nav-link:hover {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.7), rgba(239, 68, 68, 0.7));
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(251, 146, 60, 0.3);
}

.mobile-admin-nav-link.active {
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: #ffffff;
  font-weight: 600;
  border-color: rgba(255, 255, 255, 0.3);
}
</style>