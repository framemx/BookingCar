<template>
  <div class="login-container" @mousemove="handleMouseMove">
    <!-- Left side -->
    <div class="login-left">
      <div class="overlay">
        <div class="brand-content">
          <h1><span>BOOKING</span> <strong>CAR</strong></h1>
          <p>ยินดีต้อนรับสู่บริการดูแลรถของคุณแบบมืออาชีพ<br />
            จองง่าย สะดวก และพร้อมดูแลรถของคุณเสมอ
          </p>
          <p class="price">เริ่มต้นเพียง ฿150</p>
        </div>
      </div>
    </div>

    <!-- Right side -->
    <div class="login-right">
      <div class="mouse-glow" :style="glowStyle"></div>

      <div class="form-wrapper">
        <img :src="logoUrl" alt="logo" class="logo" />
        <h2>BOOKING CAR</h2>

        <form @submit.prevent="handleLogin">
          <label for="email">อีเมล</label>
          <input type="email" id="email" v-model="email" placeholder="you@example.com" required />

          <label for="password">รหัสผ่าน</label>
          <input type="password" id="password" v-model="password" placeholder="••••••••" required />

          <button type="submit" class="btn-login">เข้าสู่ระบบ</button>
          <button type="button" class="btn-secondary" @click="goToRegister">สร้างบัญชี</button>

          <p v-if="error" class="error-msg">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const logoUrl = '/images/logo.jpg'

const email = ref('')
const password = ref('')
const error = ref('')
const glowX = ref(0)
const glowY = ref(0)
const router = useRouter()

function handleMouseMove(e: MouseEvent) {
  glowX.value = e.clientX
  glowY.value = e.clientY
}

const glowStyle = computed(() => ({
  left: `${glowX.value - 150}px`,
  top: `${glowY.value - 150}px`,
}))

async function handleLogin() {
  try {
    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')

    localStorage.setItem('token', data.data.token)
    localStorage.setItem('userData', JSON.stringify({
      id: data.data.id,
      uName: data.data.uName,
      email: data.data.email,
      role: data.data.role,
    }))

    if (data.data.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else {
      router.push('/user/home')
    }

  } catch (err: any) {
    error.value = err.message
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700&display=swap");

.login-container {
  display: flex;
  height: 100vh;
  font-family: 'Kanit', sans-serif;
  overflow: hidden;
}
.login-left {
  flex: 1;
  background: url('/images/carsport.jpg') center/cover no-repeat;
  position: relative;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: start;
  padding: 60px;
}
.brand-content {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 32px;
  border-radius: 16px;
  max-width: 400px;
  backdrop-filter: blur(6px);
}
.brand-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
}
.brand-content h1 span {
  font-weight: 400;
  opacity: 0.95;
}
.brand-content .price {
  margin-top: 1rem;
  font-weight: 600;
  color: #1e3a8a;
  font-size: 1.25rem;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  width: fit-content;
}




.brand-content:hover {
  transform: translateY(-4px);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-right {
  flex: 1;
  background: linear-gradient(to bottom right, #f1f5f9, rgba(211, 234, 255, 0.35));
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.mouse-glow {
  position: absolute;
  width: 120px;
  height: 120px;
  background: rgba(147, 197, 253, 0.15);
  border: 2px solid rgba(37, 99, 235, 0.35);
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3), 0 0 60px rgba(147, 197, 253, 0.25);
  filter: blur(2px);
  transition: top 0.15s ease, left 0.15s ease;
  mix-blend-mode: screen;
  z-index: 0;
}
.form-wrapper {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}
.form-wrapper:hover {
  transform: translateY(-4px);
}
.logo {
  height: 100px;
  width: 100px;
  border-radius: 50%;
  border: 3px solid #000;
  object-fit: cover;
  margin: 0 auto 20px;
  display: block;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
h2 {
  font-size: 1.8rem;
  color: #1e3a8a;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 600;
}
label {
  display: block;
  margin-bottom: 6px;
  color: #334155;
  font-size: 0.95rem;
}
input {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 1.2rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  color: #111827;  /* ✅ เพิ่มสีข้อความที่กรอก */
  transition: border 0.3s ease, box-shadow 0.3s ease;
}
input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
  outline: none;
}
.btn-login {
  width: 100%;
  padding: 12px;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  margin-bottom: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.btn-login:hover {
  background-color: #1e40af;
}

input::placeholder {
  color: #9ca3af; /* หรือปรับเป็น #1e40af หากต้องการ */
  opacity: 1;
}
.btn-secondary {
  width: 100%;
  padding: 12px;
  background: #f1f5f9;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s ease;
}
.btn-secondary:hover {
  background-color: #e2e8f0;
}
.error-msg {
  color: #dc2626;
  text-align: center;
  margin-top: 12px;
}
</style>
