<template>
  <div>
    <h1>เข้าสู่ระบบ CarCare</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">อีเมล</label>
        <input
          v-model="email"
          id="email"
          type="email"
          placeholder="example@mail.com"
          required
        />
      </div>

      <div>
        <label for="password">รหัสผ่าน</label>
        <input
          v-model="password"
          id="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit">เข้าสู่ระบบ</button>
      <button type="button" @click="goToRegister">สร้างบัญชี</button>
    </form>

    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function handleLogin() {
  try {
    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')

    localStorage.setItem('token', data.data.token)
    localStorage.setItem('userData', JSON.stringify({
      name: data.data.name,
      email: data.data.email,
      role: data.data.role
    }))

    const role = data.data.role
    if (role === 'ADMIN') {
      router.push('/dashboard')
    } else if (role === 'USER') {
      router.push('/booking')
    } else {
      throw new Error('Unknown role')
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
/* ไม่มีการตกแต่ง */
</style>
