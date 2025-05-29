<template>
  <div class="container">
    <div class="register-box">
      <h1 class="title">สร้างบัญชี CarCare</h1>
      <form @submit.prevent="handleRegister" class="form">
        <div class="form-group">
          <label for="name">ชื่อ</label>
          <input
            v-model="name"
            id="name"
            type="text"
            placeholder="ชื่อของคุณ"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">อีเมล</label>
          <input
            v-model="email"
            id="email"
            type="email"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <input
            v-model="password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">เบอร์โทรศัพท์ (ถ้ามี)</label>
          <input
            v-model="phone"
            id="phone"
            type="tel"
            placeholder="08x-xxx-xxxx"
          />
        </div>

        <button type="submit" class="btn-register">สมัครสมาชิก</button>
        <button type="button" class="btn-login-link" @click="goToLogin">
          มีบัญชีแล้ว? เข้าสู่ระบบ
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
import { ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const phone = ref("");
const error = ref("");
const success = ref("");
const router = useRouter();

async function handleRegister() {
  try {
    // เรียก API สมัครสมาชิก
    const registerRes = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uName: name.value,
        email: email.value,
        password: password.value,
        ...(phone.value.trim() !== "" && { phone: phone.value }),
      }),
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok)
      throw new Error(registerData.message || "สมัครสมาชิกไม่สำเร็จ");

    // ถ้าสมัครสำเร็จ ให้ล็อกอินอัตโนมัติ
    const loginRes = await fetch("http://localhost:3000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok)
      throw new Error(loginData.message || "เข้าสู่ระบบอัตโนมัติไม่สำเร็จ");

    // เก็บ token และข้อมูล user ลง localStorage
    localStorage.setItem("token", loginData.data.token);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        name: loginData.data.name,
        email: loginData.data.email,
        role: loginData.data.role,
      })
    );

    // ไปหน้า booking
    router.push("/booking");
  } catch (err: any) {
    error.value = err.message;
    success.value = "";
  }
}

function goToLogin() {
  router.push("/");
}
</script>

