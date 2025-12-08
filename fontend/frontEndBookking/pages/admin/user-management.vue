<template>
  <div class="container">
    <h1 class="page-title">👤 ข้อมูลผู้ใช้งานทั้งหมด</h1>

    <!-- ฟอร์มสร้าง/แก้ไขผู้ใช้ -->
    <form @submit.prevent="handleSubmit" class="user-form">
      <h2>{{ isEditing ? "✏️ แก้ไขผู้ใช้" : "➕ สร้างผู้ใช้ใหม่" }}</h2>

      <div class="form-grid">
        <input v-model="form.uName" type="text" placeholder="ชื่อผู้ใช้" required />
        <input v-model="form.email" type="email" placeholder="อีเมล" required />
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="รหัสผ่าน" 
          :required="!isEditing" 
        />
        <input v-model="form.phone" type="tel" placeholder="เบอร์โทรศัพท์ (ถ้ามี)" />

        <select v-model="form.role">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit">
          {{ isEditing ? "อัปเดตข้อมูล" : "สร้างผู้ใช้" }}
        </button>
        <button v-if="isEditing" type="button" @click="cancelEdit">ยกเลิก</button>
      </div>
    </form>

    <!-- ตารางข้อมูลผู้ใช้ -->
    <div v-if="users.length" class="table-wrapper">
      <table class="user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ชื่อผู้ใช้</th>
            <th>อีเมล</th>
            <th>เบอร์โทร</th>
            <th>บทบาท</th>
            <th>จัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(user, index) in users" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.uName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || "-" }}</td>
            <td>{{ user.role }}</td>

            <td class="action-buttons">
              <button class="btn-edit" @click="editUser(user)">แก้ไข</button>
              <button class="btn-delete" @click="deleteUser(user.id)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="no-data">ไม่มีข้อมูลผู้ใช้</p>

    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="success" class="success-message">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })

import { ref, onMounted } from "vue"
import { useCookie, navigateTo } from "#app"

/* -------------------- STATE -------------------- */
const users = ref<any[]>([])

// ตัวแปรสถานะ
const isEditing = ref(false)

const error = ref("")
const success = ref("")

// ตัวแปรสำคัญของฟอร์ม
const form = ref({
  id: null,
  uName: "",
  email: "",
  phone: "",
  password: "",
  role: "USER",
})

/* -------------------- AUTH (Cookie) -------------------- */
const token = useCookie<string | null>("token")

function getHeaders() {
  return {
    "Content-Type": "application/json",
    ...(token.value && { Authorization: `Bearer ${token.value}` })
  }
}

function handleUnauthorized() {
  token.value = null
  alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่")
  navigateTo("/")
}

/* -------------------- FETCH USERS -------------------- */
async function fetchUsers() {
  try {
    const res = await fetch("http://localhost:3000/users", {
      headers: getHeaders(),
    })

    if (res.status === 401) return handleUnauthorized()

    const data = await res.json()
    users.value = data.data || data
  } catch (err) {
    error.value = "โหลดข้อมูลล้มเหลว"
    console.error(err)
  }
}

/* -------------------- RESET FORM -------------------- */
function resetForm() {
  Object.assign(form.value, {
    id: null,
    uName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  })
  isEditing.value = false
}

/* -------------------- EDIT USER -------------------- */
function editUser(u: any) {
  form.value = { ...u, password: "" }
  isEditing.value = true
}

/* -------------------- CANCEL EDIT -------------------- */
function cancelEdit() {
  resetForm()
}

/* -------------------- DELETE USER -------------------- */
async function deleteUser(id: number) {
  if (!confirm("ต้องการลบผู้ใช้นี้หรือไม่?")) return

  try {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    })

    if (res.status === 401) return handleUnauthorized()

    success.value = "ลบผู้ใช้สำเร็จ"
    fetchUsers()
  } catch (err) {
    error.value = "ไม่สามารถลบได้"
    console.error(err)
  }
}

/* -------------------- SUBMIT FORM -------------------- */
async function handleSubmit() {
  try {
    let url = "http://localhost:3000/users"
    let method = "POST"

    if (isEditing.value) {
      url = `http://localhost:3000/users/${form.value.id}`
      method = "PUT"
    }

    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(form.value),
    })

    // ถ้า server ส่ง 401 Unauthorized หมายถึง token หมดอายุหรือไม่ถูกต้อง
    if (res.status === 401) return handleUnauthorized()

    success.value = isEditing.value
      ? "อัปเดตข้อมูลสำเร็จ"
      : "สร้างผู้ใช้สำเร็จ"

    fetchUsers()
    resetForm()
  } catch (err) {
    error.value = "เกิดข้อผิดพลาด"
    console.error(err)
  }
}

/* -------------------- INIT -------------------- */
onMounted(() => {
  if (!token.value) return navigateTo("/")
  fetchUsers()
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700&display=swap');

.container {
  max-width: 960px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  font-family: 'Kanit', sans-serif;
  color: #1e293b;
}

.page-title {
  text-align: center;
  font-size: 1.9rem;
  color: #1e3a8a;
  font-weight: 700;
  margin-bottom: 2rem;
}

.user-form {
  background: #f1f5f9;
  padding: 1.8rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.user-form h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2563eb;
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

input,
select {
  padding: 0.55rem 1rem;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.95rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.5rem 1.3rem;
  border-radius: 9999px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

button[type="submit"] {
  background-color: #1e3a8a;
  color: white;
}

button[type="button"] {
  background-color: #64748b;
  color: white;
}

.table-wrapper {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.user-table th {
  background: #1e3a8a;
  color: white;
  padding: 0.75rem;
}

.user-table td {
  padding: 0.7rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.btn-edit {
  background: #f59e0b;
  color: white;
  padding: 0.4rem 1rem;
}

.btn-delete {
  background: #ef4444;
  color: white;
  padding: 0.4rem 1rem;
}

.no-data {
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

.error-message {
  text-align: center;
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
}

.success-message {
  text-align: center;
  background: #d1fae5;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 8px;
}
</style>
