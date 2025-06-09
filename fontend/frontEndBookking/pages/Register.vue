<template>
  <div class="register-container" @mousemove="handleMouseMove">
    <!-- Left side -->
    <div class="register-left">
      <div class="overlay">
        <div class="brand-content">
          <h1><span>ยินดีต้อนรับสู่</span> <strong>CarCare</strong></h1>
          <p>สมัครสมาชิกง่าย รวดเร็ว พร้อมดูแลรถของคุณอย่างมืออาชีพ</p>
        </div>
      </div>
    </div>

    <!-- Right side -->
    <div class="register-right">
      <div class="mouse-glow" :style="glowStyle"></div>

      <div class="form-wrapper">
        <img :src="logoUrl" alt="logo" class="logo" />
        <h2>สมัครสมาชิก</h2>

        <form @submit.prevent="handleRegister">
          <label for="name">ชื่อ</label>
          <input v-model="name" id="name" type="text" placeholder="ชื่อของคุณ" required />

          <label for="email">อีเมล</label>
          <input v-model="email" id="email" type="email" placeholder="example@mail.com" required />

          <label for="password">รหัสผ่าน</label>
          <input v-model="password" id="password" type="password" placeholder="••••••••" required />

          <label for="phone">เบอร์โทรศัพท์ (ถ้ามี)</label>
          <input v-model="phone" id="phone" type="tel" placeholder="08x-xxx-xxxx" />

          <button type="submit" class="btn-register">สมัครสมาชิก</button>
          <button type="button" class="btn-secondary" @click="goToLogin">มีบัญชีแล้ว? เข้าสู่ระบบ</button>

          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="success" class="success-message">{{ success }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const logoUrl = ref('')
onMounted(() => {
  logoUrl.value = '/images/logo.jpg'
})

const name = ref('')
const email = ref('')
const password = ref('')
const phone = ref('')
const error = ref('')
const success = ref('')
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

async function handleRegister() {
  try {
    const registerRes = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uName: name.value,
        email: email.value,
        password: password.value,
        ...(phone.value.trim() !== '' && { phone: phone.value }),
      }),
    })
    const registerData = await registerRes.json()
    if (!registerRes.ok) throw new Error(registerData.message || 'สมัครสมาชิกไม่สำเร็จ')

    const loginRes = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    const loginData = await loginRes.json()
    if (!loginRes.ok) throw new Error(loginData.message || 'เข้าสู่ระบบอัตโนมัติไม่สำเร็จ')

    localStorage.setItem('token', loginData.data.token)
    localStorage.setItem('userData', JSON.stringify({
      name: loginData.data.name,
      email: loginData.data.email,
      role: loginData.data.role,
    }))

    router.push('/')
  } catch (err: any) {
    error.value = err.message
    success.value = ''
  }
}

function goToLogin() {
  router.push('/')
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&display=swap");

.register-container {
  display: flex;
  height: 100vh;
  font-family: 'Kanit', sans-serif;
  overflow: hidden;
}

.register-left {
  flex: 1;
  background: url('/images/sportcar2.jpg') center/cover no-repeat;
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
  padding: 24px;
  border-radius: 16px;
  max-width: 360px;
  backdrop-filter: blur(6px);
}
.form-wrapper:hover {
  transform: translateY(-4px);
}
.brand-content :hover {
  transform: translateY(-4px);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.brand-content h1 {
  font-size: 2rem;
  font-weight: 700;
}

.brand-content h1 span {
  font-weight: 400;
  opacity: 0.95;
}

.register-right {
  flex: 1;
  background: linear-gradient(to bottom right, #f1f5f9, rgba(211, 234, 255, 0.35));
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}

.mouse-glow {
  position: absolute;
  width: 100px;
  height: 100px;
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
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  max-width: 360px;
  width: 100%;
  z-index: 1;
  transition: transform 0.3s ease;
}

.form-wrapper:hover {
  transform: translateY(-3px);
}

.logo {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  border: 2px solid #000;
  object-fit: cover;
  margin: 0 auto 16px;
  display: block;
  background-color: white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

h2 {
  font-size: 1.4rem;
  color: #1e3a8a;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
}

label {
  display: block;
  margin-bottom: 4px;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px 14px;
  margin-bottom: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1e40af;
  transition: border 0.3s ease, box-shadow 0.3s ease;
}
input::placeholder {
  color: #64748b;
  opacity: 1;
}
input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  outline: none;
}

.btn-register,
.btn-secondary {
  width: 100%;
  padding: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-register {
  background-color: #2563eb;
  color: white;
  margin-bottom: 12px;
  border: none;
}
.btn-register:hover {
  background-color: #1e40af;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #d1d5db;
  color: #374151;
}
.btn-secondary:hover {
  background-color: #e2e8f0;
}

.error-message {
  color: #dc2626;
  text-align: center;
  margin-top: 10px;
  font-size: 0.9rem;
}

.success-message {
  color: #16a34a;
  text-align: center;
  margin-top: 10px;
  font-size: 0.9rem;
}

</style>
