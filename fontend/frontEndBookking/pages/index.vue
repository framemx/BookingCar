<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
      <h1 class="text-2xl font-semibold text-center text-gray-800">
        เข้าสู่ระบบ CarCare
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >อีเมล</label
          >
          <input
            v-model="email"
            id="email"
            type="email"
            placeholder="example@mail.com"
            required
            class="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"
            >รหัสผ่าน</label
          >
          <input
            v-model="password"
            id="password"
            type="password"
            placeholder="••••••••"
            required
            class="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          เข้าสู่ระบบ
        </button>

        <button
          type="button"
          @click="goToRegister"
          class="w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          สร้างบัญชี
        </button>
      </form>

      <p v-if="error" class="text-red-500 text-sm text-center mt-2">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// definePageMeta({
//   layout: 'user',
// })
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

async function handleLogin() {
  try {
    const res = await fetch("http://localhost:3000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("token", data.data.token);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        id: data.data.id, // ✅ เพิ่มตรงนี้! เก็บ ID ผู้ใช้
        uName: data.data.uName, // ใช้ uName แทน name
        email: data.data.email,
        role: data.data.role,
      })
    );

    const role = data.data.role;
    if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (role === "USER") {
      router.push("/user/bookingWelcome");
    } else {
      throw new Error("Unknown role");
    }
  } catch (err: any) {
    error.value = err.message;
  }
}

function goToRegister() {
  router.push("/register");
}
</script>
