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

<style scoped>
/* .container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(90deg, #3b82f6, #7c3aed, #4338ca);
  padding: 20px;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.register-box {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  padding: 40px 35px;
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
}

.title {
  color: #4338ca;
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 1px 1px 3px rgba(67,56,202,0.6);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #5b21b6;
  font-size: 1.1rem;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="tel"] {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #c4b5fd;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  outline: none;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
input[type="tel"]:focus {
  border-color: #4338ca;
  box-shadow: 0 0 8px rgba(67, 56, 202, 0.4);
}

.btn-register {
  background-color: #4338ca;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 15px 0;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(67,56,202,0.5);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-register:hover {
  background-color: #5b21b6;
  transform: scale(1.05);
}

.btn-register:active {
  background-color: #311b92;
  transform: scale(0.95);
}

.btn-login-link {
  background-color: transparent;
  color: #4338ca;
  font-weight: 600;
  font-size: 1rem;
  padding: 10px 0;
  border: 2px solid #4338ca;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-login-link:hover {
  background-color: #ede9fe;
  color: #5b21b6;
  border-color: #5b21b6;
}

.error-message {
  margin-top: 25px;
  text-align: center;
  color: #b91c1c;
  font-weight: 700;
  font-size: 1.1rem;
}

.success-message {
  margin-top: 25px;
  text-align: center;
  color: #15803d;
  font-weight: 700;
  font-size: 1.1rem;
} */
</style>
