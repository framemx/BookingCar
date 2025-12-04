<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-slate-100">

    <!-- NAVBAR -->
    <nav class="fixed top-0 left-0 w-full bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800 shadow-2xl z-50 border-b border-slate-600/30">
      <div class="relative flex items-center justify-between px-8 py-4 max-w-7xl mx-auto gap-6">

        <!-- Logo -->
        <div class="flex items-center space-x-4 group min-w-fit">
          <div class="logo-container relative">
            <div class="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur opacity-40"></div>
            <div class="relative h-12 w-12 rounded-full shadow-xl border-2 border-white/80 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl">
              ⚙️
            </div>
          </div>

          <div class="flex flex-col">
            <span class="text-white text-2xl font-bold tracking-wide bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
              Admin Panel
            </span>
            <span class="text-orange-200 text-xs">CarCare Pro Management</span>
          </div>
        </div>

        <!-- Center Nav -->
        <div class="hidden lg:flex flex-1 justify-center px-4">
          <div class="flex gap-1 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 max-w-fit">

            <NuxtLink to="/admin/dashboard" class="admin-nav-link compact" :class="{ active: isActive('/admin/dashboard') }">
              📊 <span class="nav-text">Dashboard</span>
            </NuxtLink>

            <NuxtLink to="/admin/service" class="admin-nav-link compact" :class="{ active: isActive('/admin/service') }">
              🔧 <span class="nav-text">Service</span>
            </NuxtLink>

            <NuxtLink to="/admin/slot-list" class="admin-nav-link compact" :class="{ active: isActive('/admin/slot-list') }">
              📋 <span class="nav-text">Slots</span>
            </NuxtLink>

            <NuxtLink to="/admin/slot-management" class="admin-nav-link compact" :class="{ active: isActive('/admin/slot-management') }">
              ⚡ <span class="nav-text">Manage</span>
            </NuxtLink>

            <NuxtLink to="/admin/user-management" class="admin-nav-link compact" :class="{ active: isActive('/admin/user-management') }">
              👥 <span class="nav-text">Users</span>
            </NuxtLink>

          </div>
        </div>

        <!-- Logout -->
        <button @click="logout" class="admin-logout-btn">
          🚪 LOGOUT
        </button>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="lg:hidden text-white p-3 rounded-lg bg-white/10 hover:bg-white/20"
        >
          ☰
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="showMobileMenu"
        class="lg:hidden bg-slate-900/95 backdrop-blur-sm border-t border-white/10 px-6 py-4 space-y-3"
      >
        <NuxtLink
          to="/admin/dashboard"
          class="mobile-admin-nav-link"
          :class="{ active: isActive('/admin/dashboard') }"
          @click="closeMobileMenu"
        >
          📊 Dashboard
        </NuxtLink>

        <NuxtLink
          to="/admin/service"
          class="mobile-admin-nav-link"
          :class="{ active: isActive('/admin/service') }"
          @click="closeMobileMenu"
        >
          🔧 Service
        </NuxtLink>

        <NuxtLink
          to="/admin/slot-list"
          class="mobile-admin-nav-link"
          :class="{ active: isActive('/admin/slot-list') }"
          @click="closeMobileMenu"
        >
          📋 Slot List
        </NuxtLink>

        <NuxtLink
          to="/admin/slot-management"
          class="mobile-admin-nav-link"
          :class="{ active: isActive('/admin/slot-management') }"
          @click="closeMobileMenu"
        >
          ⚡ Slot Management
        </NuxtLink>

        <NuxtLink
          to="/admin/user-management"
          class="mobile-admin-nav-link"
          :class="{ active: isActive('/admin/user-management') }"
          @click="closeMobileMenu"
        >
          👥 User Management
        </NuxtLink>
      </div>
    </nav>

    <!-- MAIN CONTENT -->
    <main class="flex-grow pt-24 p-8 max-w-7xl mx-auto w-full">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const showMobileMenu = ref(false)

const route = useRoute()
const token = useCookie("token")

function logout() {
  token.value = null
  navigateTo("/")
}

function isActive(path: string) {
  return route.fullPath.startsWith(path)
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
  font-family: "Kanit", sans-serif;
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
  background: linear-gradient(
    135deg,
    rgba(251, 146, 60, 0.8),
    rgba(239, 68, 68, 0.8)
  );
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
  background: linear-gradient(
    135deg,
    rgba(251, 146, 60, 0.7),
    rgba(239, 68, 68, 0.7)
  );
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
