<template>
  <div class="register-container">
    <div class="register-box">
      <h1 class="title">สร้างบัญชี CarCare</h1>
      <form @submit.prevent="handleRegister" class="form">
        <div class="form-group">
          <label for="name">ชื่อ</label>
          <input v-model="name" id="name" type="text" placeholder="ชื่อของคุณ" required />
        </div>

        <div class="form-group">
          <label for="email">อีเมล</label>
          <input v-model="email" id="email" type="email" placeholder="example@mail.com" required />
        </div>

        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <input v-model="password" id="password" type="password" placeholder="••••••••" required />
        </div>

        <div class="form-group">
          <label for="phone">เบอร์โทรศัพท์ (ถ้ามี)</label>
          <input v-model="phone" id="phone" type="tel" placeholder="08x-xxx-xxxx" />
        </div>

        <button type="submit" class="btn-register">สมัครสมาชิก</button>
        <button type="button" class="btn-login-link" @click="goToLogin">
          มีบัญชีแล้ว? เข้าสู่ระบบ
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');
const error = ref('');
const success = ref('');
const router = useRouter();

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
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) throw new Error(registerData.message || 'สมัครสมาชิกไม่สำเร็จ');

    const loginRes = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message || 'เข้าสู่ระบบอัตโนมัติไม่สำเร็จ');

    localStorage.setItem('token', loginData.data.token);
    localStorage.setItem(
      'userData',
      JSON.stringify({
        name: loginData.data.name,
        email: loginData.data.email,
        role: loginData.data.role,
      })
    );

    router.push('/');

  } catch (err: any) {
    error.value = err.message;
    success.value = '';
  }
}

function goToLogin() {
  router.push('/');
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  background-color: #ffffff;
  min-height: 100vh;
}

.register-box {
  background: #f9f9f9;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.title {
  text-align: center;
  font-size: 26px;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

input {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.btn-register {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.btn-register:hover {
  background-color: #0056b3;
}

.btn-login-link {
  margin-top: 15px;
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-align: center;
  width: 100%;
  font-size: 14px;
}

.error-message {
  color: #d93025;
  margin-top: 15px;
  font-size: 14px;
  text-align: center;
}

.success-message {
  color: #0f9d58;
  margin-top: 15px;
  font-size: 14px;
  text-align: center;
}
</style>
