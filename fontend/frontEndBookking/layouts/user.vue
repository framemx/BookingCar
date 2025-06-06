<template>
  <div class="user-layout min-h-screen flex flex-col bg-gray-50">
    <!-- Header with Fixed Navbar -->
    <header class="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <!-- Logo -->
        <div class="flex items-center space-x-4">
          <span class="text-2xl font-bold text-blue-600 bg-gray-200 px-3 py-1 rounded-full">RW</span>
        </div>

        <!-- Navigation Links --> 
        <div class="flex space-x-10">
          <NuxtLink
            to="/user/home"
            class="nav-link"
            :class="{ active: isActive('/user/home') }"
          >
            HOME
          </NuxtLink>
          <NuxtLink
            to="/user/bookingWelcome"
            class="nav-link"
            :class="{ active: isActive('/user/bookingWelcome') }"
          >
            RESERVATIONS
          </NuxtLink>
          <NuxtLink
            to="/user/bookingForm"
            class="nav-link"
            :class="{ active: isActive('/user/bookingForm') }"
          >
            BOOKING   
          </NuxtLink>
        </div>


        <!-- Search Bar -->
        <div class="relative">
          <input
            type="text"
            placeholder="Search..."
            class="border border-gray-300 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </nav>
    </header>

    <!-- Main Content with Padding for Fixed Navbar -->
    <main class="flex-grow pt-20 p-8 max-w-7xl mx-auto w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8">
      <div class="max-w-7xl mx-auto px-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- About Section -->
          <div>
            <h3 class="text-xl font-semibold mb-4">เกี่ยวกับเรา</h3>
            <p class="text-gray-400">
              BookingCarCare - ระบบจองคิวดูแลรถยนต์ที่สะดวกและรวดเร็ว
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-xl font-semibold mb-4">ลิงก์ด่วน</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/" class="footer-link">หน้าหลัก</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/booking" class="footer-link">จองคิว</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="text-xl font-semibold mb-4">ติดต่อเรา</h3>
            <p class="text-gray-400">อีเมล: support@bookingcarcare.com</p>
            <p class="text-gray-400">โทร: 123-456-7890</p>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-gray-700 mt-8 pt-6 text-center">
          <p class="text-gray-500 text-sm">
            © {{ currentYear }} BookingCarCare. สงวนลิขสิทธิ์.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

// Current Year for Footer
const currentYear = new Date().getFullYear()

// Function to check active route (for styling)
function isActive(path: string) {
  return route.path === path
}
</script>

<style scoped>
.user-layout {
  font-family: "Sarabun", sans-serif;
  color: #1e293b;
}

/* Navbar Styles */
.nav-link {
  font-weight: 600;
  font-size: 1.1rem;
  color: #475569;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #e0e7ff;
  color: #2563eb;
}

.nav-link.router-link-exact-active {
  background-color: #2563eb;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

/* Footer Styles */
footer {
  background-color: #1e293b;
}

.footer-link {
  color: #a3bffa;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #ffffff;
  text-decoration: underline;
}
</style>