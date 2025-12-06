<!-- layouts/user.vue -->
<template>
  <div class="user-layout min-h-screen flex flex-col font-kanit bg-gradient-to-br from-gray-50 to-white">

    <!-- NAVBAR -->
    <header class="fixed top-0 left-0 w-full bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl z-50 border-b border-blue-500/20">
      <nav class="relative flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">

        <!-- Logo -->
        <NuxtLink to="/user/home" class="flex items-center space-x-4 group">
          <div class="logo-container relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-40"></div>

            <img
              v-if="!imageError"
              :src="logoSrc"
              class="relative h-12 w-12 rounded-full shadow-xl border-2 border-white/80 transition-all group-hover:scale-110"
              @error="handleImageError"
            />

            <div
              v-else
              class="relative h-12 w-12 rounded-full shadow-xl border-2 border-white/80 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl"
            >
              🚗
            </div>
          </div>

          <div class="flex flex-col">
            <span class="text-white text-2xl font-bold tracking-wide bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              CarCare Pro
            </span>
            <span class="text-blue-200 text-xs">Premium Auto Service</span>
          </div>
        </NuxtLink>

        <!-- MAIN NAV -->
        <div class="hidden md:flex flex-1 justify-center">
          <div class="flex gap-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 border border-white/10">

            <NuxtLink to="/user/home" class="nav-link-premium" :class="{ active: isActive('/user/home') }">
              🏠 HOME
            </NuxtLink>

            <NuxtLink to="/user/booking-welcome" class="nav-link-premium" :class="{ active: isActive('/user/booking-welcome') }">
              📋 RESERVATIONS
            </NuxtLink>

            <NuxtLink to="/user/booking-form" class="nav-link-premium" :class="{ active: isActive('/user/booking-form') }">
              📅 BOOKING
            </NuxtLink>

            <NuxtLink to="/user/history" class="nav-link-premium" :class="{ active: isActive('/user/history') }">
              📊 HISTORY
            </NuxtLink>

          </div>
        </div>

        <!-- PROFILE + LOGOUT -->
        <div class="flex items-center space-x-4">
          <button @click="showProfileModal = true" class="profile-btn-premium">
            👤 PROFILE
          </button>
          <button @click="showLogoutModal = true" class="logout-btn-premium">
            🚪 LOGOUT
          </button>
        </div>

        <!-- Mobile menu -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden text-white p-2 rounded-lg bg-white/10 hover:bg-white/20"
        >
          ☰
        </button>
      </nav>

      <!-- MOBILE MENU -->
      <div v-if="showMobileMenu" class="md:hidden bg-slate-900/95 px-6 py-4 space-y-2">

        <NuxtLink to="/user/home" class="mobile-nav-link" :class="{ active: isActive('/user/home') }" @click="closeMobileMenu">
          🏠 HOME
        </NuxtLink>

        <NuxtLink to="/user/booking-welcome" class="mobile-nav-link" :class="{ active: isActive('/user/booking-welcome') }" @click="closeMobileMenu">
          📋 RESERVATIONS
        </NuxtLink>

        <NuxtLink to="/user/booking-form" class="mobile-nav-link" :class="{ active: isActive('/user/booking-form') }" @click="closeMobileMenu">
          📅 BOOKING
        </NuxtLink>

        <NuxtLink to="/user/history" class="mobile-nav-link" :class="{ active: isActive('/user/history') }" @click="closeMobileMenu">
          📊 HISTORY
        </NuxtLink>

      </div>
    </header>

    <!-- CONTENT -->
    <main class="flex-grow pt-24 px-6 max-w-7xl mx-auto w-full">
      <slot />
    </main>

    <!-- FOOTER (คงเดิมทั้งหมด) -->
    <!-- ... footer code ... -->

    <!-- LOGOUT MODAL -->
    <div v-if="showLogoutModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div class="bg-white rounded-2xl px-8 py-6 text-center shadow-2xl w-full max-w-sm">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">ออกจากระบบ</h2>
        <p class="text-gray-600 mb-6">คุณต้องการออกจากระบบหรือไม่?</p>

        <div class="flex justify-center gap-4">
          <button @click="showLogoutModal = false" class="px-4 py-2 border border-gray-400 rounded-full">ไม่</button>
          <button @click="logout" class="px-4 py-2 bg-red-500 text-white rounded-full">ใช่</button>
        </div>
      </div>
    </div>

    <!-- PROFILE MODAL -->
    <!-- ... modal code ... -->

  </div>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: ["user"]
})

const route = useRoute()

const showLogoutModal = ref(false)
const showProfileModal = ref(false)
const showAvatarSelector = ref(false)
const showMobileMenu = ref(false)

const imageError = ref(false)

const token = useCookie("token")

/* -----------------------
   TYPE ของ user ที่ได้จาก API
----------------------- */
type UserResponse = {
  data: {
    uName: string
    email: string
    phone: string
  }
}

const { data: user, error } = await useFetch<UserResponse>(
  "http://localhost:3000/users/me",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token.value}`
    }
  }
)

const userProfile = ref({
  name: user.value?.data.uName || "",
  email: user.value?.data.email || "",
  phone: user.value?.data.phone || "",
  profilePicture: "👤"
})


/* -----------------------
 LOGOUT
----------------------- */
function logout() {
  useCookie("token").value = null
  useCookie("role").value = null
  localStorage.removeItem("userData")
  navigateTo("/")
}


/* -----------------------
 ACTIVE PAGE
----------------------- */
function isActive(path: string) {
  return route.fullPath.startsWith(path)
}

/* -----------------------
 MOBILE MENU
----------------------- */
function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
  showMobileMenu.value = false
}

/* -----------------------
 LOGO FALLBACK
----------------------- */
const possiblePaths = [
  "/images/logo.jpg",
  "/assets/images/logo.jpg",
  "/public/images/logo.jpg",
]

const logoSrc = ref(possiblePaths[0])
let currentIndex = 0

function handleImageError() {
  currentIndex++
  if (currentIndex < possiblePaths.length) {
    logoSrc.value = possiblePaths[currentIndex]
  } else {
    imageError.value = true
  }
}
</script>




<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap");

.user-layout {
  font-family: "Kanit", sans-serif;
}

/* Logo Container */
.logo-container {
  display: flex;
  align-items: center;
}

/* Premium Navigation Links */
.nav-link-premium {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  color: rgba(219, 234, 254, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

.nav-link-premium:hover {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.8),
    rgba(6, 182, 212, 0.8)
  );
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  backdrop-filter: blur(10px);
}

.nav-link-premium.active {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.nav-icon {
  font-size: 1rem;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.nav-link-premium:hover .nav-icon {
  opacity: 1;
  transform: scale(1.1);
}

.nav-link-premium.active .nav-icon {
  opacity: 1;
}

/* Premium Profile Button */
.profile-btn-premium {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  color: white;
  padding: 0.55rem 1.1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  border: none;
  cursor: pointer;
}

.profile-btn-premium:hover {
  background: linear-gradient(135deg, #a855f7, #c084fc);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
}

.profile-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.profile-btn-premium:hover .profile-icon {
  transform: scale(1.1);
}

/* Premium Logout Button */
.logout-btn-premium {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 0.55rem 1.1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  border: none;
  cursor: pointer;
}

.logout-btn-premium:hover {
  background: linear-gradient(135deg, #f87171, #ef4444);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.5);
}

.logout-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.logout-btn-premium:hover .logout-icon {
  transform: translateX(2px);
}

/* Mobile Navigation */
.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  color: rgba(219, 234, 254, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  text-decoration: none;
}

.mobile-nav-link:hover {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.7),
    rgba(6, 182, 212, 0.7)
  );
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
}

.mobile-nav-link.active {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: #ffffff;
  font-weight: 600;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
}
.mobile-nav-link .nav-icon {
  font-size: 1.25rem;
  opacity: 0.8;
  transition: all 0.3s ease;
}
.profile-logout-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  color: rgba(59, 130, 246, 0.3);
}
</style>
