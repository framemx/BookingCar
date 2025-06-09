<template>
  <div class="user-layout min-h-screen flex flex-col font-kanit bg-gradient-to-br from-gray-50 to-white">
    <!-- Premium Navbar -->
    <header class="fixed top-0 left-0 w-full bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl z-50 border-b border-blue-500/20">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
      <nav class="relative flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <!-- Premium Logo Section -->
        <NuxtLink to="/user/home" class="flex items-center space-x-4 group">
          <div class="logo-container relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <img
              v-if="!imageError"
              :src="logoSrc"
              alt="logo"
              class="relative h-12 w-12 rounded-full shadow-xl border-2 border-white/80 transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-300"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <!-- Enhanced Fallback logo -->
            <div 
              v-else
              class="relative h-12 w-12 rounded-full shadow-xl border-2 border-white/80 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl transition-all duration-300 group-hover:scale-110"
            >
              🚗
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-white text-2xl font-bold tracking-wide drop-shadow-lg bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              CarCare Pro
            </span>
            <span class="text-blue-200 text-xs font-medium tracking-wider opacity-90">
              Premium Auto Service
            </span>
          </div>
        </NuxtLink>

        <!-- Enhanced Menu -->
        <div class="hidden md:flex flex-1 justify-center">
          <div class="flex gap-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 border border-white/10">
            <NuxtLink to="/user/home" class="nav-link-premium" :class="{ active: isActive('/user/home') }">
              <span class="nav-icon">🏠</span>
              HOME
            </NuxtLink>
            <NuxtLink to="/user/bookingWelcome" class="nav-link-premium" :class="{ active: isActive('/user/bookingWelcome') }">
              <span class="nav-icon">📋</span>
              RESERVATIONS
            </NuxtLink>
            <NuxtLink to="/user/bookingForm" class="nav-link-premium" :class="{ active: isActive('/user/bookingForm') }">
              <span class="nav-icon">📅</span>
              BOOKING
            </NuxtLink>
            <NuxtLink to="/user/history" class="nav-link-premium" :class="{ active: isActive('/user/history') }">
              <span class="nav-icon">📊</span>
              HISTORY
            </NuxtLink>
          </div>
        </div>

        <!-- Premium Logout Button -->
        <div class="flex items-center space-x-4">
          <div class="hidden lg:flex flex-col text-right">
            <span class="text-white text-sm font-medium">Welcome back!</span>
            <span class="text-blue-200 text-xs">Premium Member</span>
          </div>
          <button @click="showLogoutModal = true" class="logout-btn-premium group">
            <span class="logout-icon">🚪</span>
            LOGOUT
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="toggleMobileMenu" class="md:hidden text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <span class="text-xl">☰</span>
        </button>
      </nav>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden bg-slate-900/95 backdrop-blur-sm border-t border-white/10">
        <div class="px-6 py-4 space-y-2">
          <NuxtLink to="/user/home" class="mobile-nav-link" :class="{ active: isActive('/user/home') }" @click="closeMobileMenu">
            <span class="nav-icon">🏠</span>
            HOME
          </NuxtLink>
          <NuxtLink to="/user/bookingWelcome" class="mobile-nav-link" :class="{ active: isActive('/user/bookingWelcome') }" @click="closeMobileMenu">
            <span class="nav-icon">📋</span>
            RESERVATIONS
          </NuxtLink>
          <NuxtLink to="/user/bookingForm" class="mobile-nav-link" :class="{ active: isActive('/user/bookingForm') }" @click="closeMobileMenu">
            <span class="nav-icon">📅</span>
            BOOKING
          </NuxtLink>
          <NuxtLink to="/user/history" class="mobile-nav-link" :class="{ active: isActive('/user/history') }" @click="closeMobileMenu">
            <span class="nav-icon">📊</span>
            HISTORY
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow pt-24 px-6 max-w-7xl mx-auto w-full">
      <slot />
    </main>

    <!-- Premium Footer -->
    <footer class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);"></div>
      
      <div class="relative max-w-7xl mx-auto px-6 py-12">
        <!-- Main Footer Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <!-- Company Info -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <span class="text-white font-bold">🚗</span>
              </div>
              <div>
                <h3 class="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">CarCare Pro</h3>
                <p class="text-blue-200 text-sm">Premium Auto Service</p>
              </div>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed">
              บริการดูแลรถยนต์ระดับพรีเมียม ด้วยเทคโนโลยีสมัยใหม่ และทีมงานมืออาชีพ
            </p>
            <div class="flex space-x-3">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                <span class="text-white text-sm">f</span>
              </div>
              <div class="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors cursor-pointer">
                <span class="text-white text-sm">📷</span>
              </div>
              <div class="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-300 transition-colors cursor-pointer">
                <span class="text-white text-sm">🐦</span>
              </div>
            </div>
          </div>

          <!-- Services -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-white border-b border-blue-500/30 pb-2">
              🔧 บริการของเรา
            </h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">🚿 ล้างรถ & ดีเทลลิ่ง</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">🔧 ซ่อมบำรุง</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">🛞 เปลี่ยนยาง</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">🔋 ตรวจเช็คระบบ</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">✨ เคลือบสี</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-white border-b border-blue-500/30 pb-2">
              📞 ติดต่อเรา
            </h4>
            <ul class="space-y-3 text-sm">
              <li class="flex items-center space-x-3 text-gray-300">
                <span class="text-blue-400">📍</span>
                <span>123 ถนนสุขุมวิท กรุงเทพฯ 10110</span>
              </li>
              <li class="flex items-center space-x-3 text-gray-300">
                <span class="text-green-400">📱</span>
                <span>02-123-4567</span>
              </li>
              <li class="flex items-center space-x-3 text-gray-300">
                <span class="text-purple-400">✉️</span>
                <span>info@carcarepro.com</span>
              </li>
              <li class="flex items-center space-x-3 text-gray-300">
                <span class="text-orange-400">⏰</span>
                <span>จันทร์-อาทิตย์ 8:00-20:00</span>
              </li>
            </ul>
          </div>

          <!-- Quick Links -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-white border-b border-blue-500/30 pb-2">
              🔗 ลิงก์ด่วน
            </h4>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/user/home" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">🏠 หน้าแรก</NuxtLink></li>
              <li><NuxtLink to="/user/bookingForm" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">📅 จองคิว</NuxtLink></li>
              <li><NuxtLink to="/user/history" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">📊 ประวัติการใช้งาน</NuxtLink></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">🎁 โปรโมชั่น</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">❓ คำถามที่พบบ่อย</a></li>
            </ul>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-700 pt-6">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <!-- Copyright -->
            <div class="text-center md:text-left">
              <p class="text-gray-400 text-sm">
                © {{ currentYear }} CarCare Pro. สงวนลิขสิทธิ์ทุกประการ
              </p>
              <p class="text-gray-500 text-xs mt-1">
                Developed with ❤️ for Premium Auto Care Experience
              </p>
            </div>
            
            <!-- Trust Badges -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2 text-green-400 text-xs">
                <span>🔒</span>
                <span>SSL Secured</span>
              </div>
              <div class="flex items-center space-x-2 text-blue-400 text-xs">
                <span>✅</span>
                <span>Verified Service</span>
              </div>
              <div class="flex items-center space-x-2 text-yellow-400 text-xs">
                <span>⭐</span>
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div class="bg-white rounded-2xl px-8 py-6 text-center shadow-2xl w-full max-w-sm">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">ออกจากระบบ</h2>
        <p class="text-gray-600 mb-6">คุณต้องการออกจากระบบหรือไม่?</p>
        <div class="flex justify-center gap-4">
          <button @click="showLogoutModal = false" class="px-4 py-2 border border-gray-400 rounded-full text-gray-700 hover:bg-gray-100">ไม่</button>
          <button @click="logout" class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600">ใช่</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const showLogoutModal = ref(false)
const showMobileMenu = ref(false)
const currentYear = new Date().getFullYear()
const imageError = ref(false)

// ลองหลายเส้นทางที่เป็นไปได้
const possiblePaths = [
  '/images/logo.jpg',
  '~/assets/images/logo.jpg',
  '/assets/images/logo.jpg',
  '~/static/images/logo.jpg',
  '/static/images/logo.jpg',
  '/public/images/logo.jpg'
]
const logoSrc = ref(possiblePaths[0])

function logout() {
  localStorage.clear()
  router.push('/')
}

function isActive(path) {
  return route.path === path
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
  showMobileMenu.value = false
}

// เพิ่ม functions สำหรับจัดการ error และ load ของรูปภาพ
let currentPathIndex = 0

function handleImageError(event) {
  console.log('Image failed to load:', event.target.src)
  
  // ลองเส้นทางถัดไป
  currentPathIndex++
  if (currentPathIndex < possiblePaths.length) {
    logoSrc.value = possiblePaths[currentPathIndex]
    console.log('Trying next path:', logoSrc.value)
  } else {
    // ถ้าลองครบทุกเส้นทางแล้ว แสดง fallback
    imageError.value = true
    console.log('All paths failed, showing fallback')
  }
}

function handleImageLoad(event) {
  console.log('Image loaded successfully:', event.target.src)
  imageError.value = false
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&display=swap");

.user-layout {
  font-family: 'Kanit', sans-serif;
}

/* Logo Container */
.logo-container {
  display: flex;
  align-items: center;
}

/* Premium Navigation Links - ปรับให้สว่างขึ้นตอน hover */
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
}

.nav-link-premium:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.8));
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  backdrop-filter: blur(10px);
}

.nav-link-premium.active {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
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

/* Premium Logout Button */
.logout-btn-premium {
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

/* Mobile Navigation - ปรับให้สว่างขึ้นตอน hover */
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
}

.mobile-nav-link:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.7), rgba(6, 182, 212, 0.7));
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.mobile-nav-link.active {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: #ffffff;
  font-weight: 600;
  border-color: rgba(255, 255, 255, 0.3);
}
</style>