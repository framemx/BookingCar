<template>
  <div class="dashboard-container">
    <h1>ข้อมูลผู้ใช้งานทั้งหมด</h1>

    <!-- ฟอร์มสร้างหรือแก้ไข user -->
    <form @submit.prevent="handleSubmit" class="user-form">
      <h2>{{ isEditing ? "แก้ไขผู้ใช้" : "สร้างผู้ใช้ใหม่" }}</h2>

      <input v-model="form.uName" type="text" placeholder="ชื่อผู้ใช้" required />
      <input v-model="form.email" type="email" placeholder="อีเมล" required />
      <input
        v-model="form.password"
        type="password"
        placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
        :required="!isEditing"
      />
      <input v-model="form.phone" type="tel" placeholder="เบอร์โทรศัพท์ (ถ้ามี)" />
      <select v-model="form.role">
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>

      <button type="submit">{{ isEditing ? "อัปเดตข้อมูล" : "สร้างผู้ใช้" }}</button>
      <button v-if="isEditing" type="button" @click="cancelEdit">ยกเลิก</button>
    </form>

    <!-- ตารางแสดงข้อมูลผู้ใช้ -->
    <table v-if="users.length" class="user-table">
      <thead>
        <tr>
          <th>ลำดับ</th>
          <th>ชื่อผู้ใช้</th>
          <th>อีเมล</th>
          <th>เบอร์โทรศัพท์</th>
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
          <td>
            <button @click="startEdit(user)">แก้ไข</button>
            <button @click="deleteUser(user.id)">ลบ</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>ไม่มีข้อมูลผู้ใช้</p>

    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="success" class="success-message">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

definePageMeta({
  layout: "admin",
});

interface User {
  id: number;
  uName: string;
  email: string;
  phone?: string;
  role: string;
}

const users = ref<User[]>([]);
const error = ref("");
const success = ref("");

const isEditing = ref(false);
const editUserId = ref<number | null>(null);

const form = reactive({
  uName: "",
  email: "",
  password: "",
  phone: "",
  role: "USER",
});

// ดึงข้อมูล user ทั้งหมด
async function fetchUsers() {
  try {
    const res = await fetch("http://localhost:3000/users");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "โหลดข้อมูลไม่สำเร็จ");
    users.value = data.data;
  } catch (err: any) {
    error.value = err.message;
  }
}

// สร้าง user ใหม่ หรือ อัปเดต user เดิม
async function handleSubmit() {
  error.value = "";
  success.value = "";

  // ตรวจสอบถ้าแก้ไข ให้เรียก API PATCH, ถ้าสร้างใหม่ให้ POST
  try {
    let res;
    if (isEditing.value && editUserId.value !== null) {
      // อัปเดต user
      const updateBody: any = {
        uName: form.uName,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
      };
      // ถ้ากรอกรหัสผ่านใหม่ ให้ส่งด้วย
      if (form.password.trim() !== "") {
        updateBody.password = form.password;
      }
      res = await fetch(`http://localhost:3000/users/${editUserId.value}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });
    } else {
      // สร้าง user ใหม่
      if (form.password.length < 6) {
        throw new Error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      }
      res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uName: form.uName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          role: form.role,
        }),
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");

    success.value = isEditing.value ? "อัปเดตข้อมูลสำเร็จ" : "สร้างผู้ใช้สำเร็จ";

    // โหลดข้อมูลใหม่ และรีเซ็ตฟอร์ม
    await fetchUsers();
    resetForm();
  } catch (err: any) {
    error.value = err.message;
  }
}

function startEdit(user: User) {
  isEditing.value = true;
  editUserId.value = user.id;
  form.uName = user.uName;
  form.email = user.email;
  form.password = "";
  form.phone = user.phone || "";
  form.role = user.role;
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  isEditing.value = false;
  editUserId.value = null;
  form.uName = "";
  form.email = "";
  form.password = "";
  form.phone = "";
  form.role = "USER";
}

// ลบ user
async function deleteUser(id: number) {
  if (!confirm("คุณต้องการลบผู้ใช้นี้หรือไม่?")) return;
  try {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "ลบไม่สำเร็จ");

    success.value = "ลบผู้ใช้สำเร็จ";
    await fetchUsers();
  } catch (err: any) {
    error.value = err.message;
  }
}

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.dashboard-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #4338ca;
  margin-bottom: 25px;
  text-align: center;
}

.user-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 30px;
  justify-content: center;
}

.user-form input,
.user-form select {
  padding: 8px 10px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  min-width: 180px;
}

.user-form button {
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  background-color: #4338ca;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.user-form button:hover {
  background-color: #5b21b6;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 0 8px rgba(67, 56, 202, 0.2);
}

.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 12px 15px;
  text-align: center;
}

.user-table thead {
  background-color: #4338ca;
  color: white;
}

.user-table tbody tr:nth-child(even) {
  background-color: #f3f4f6;
}

.error-message {
  margin-top: 20px;
  text-align: center;
  color: #b91c1c;
  font-weight: 700;
  font-size: 1.1rem;
}

.success-message {
  margin-top: 20px;
  text-align: center;
  color: #15803d;
  font-weight: 700;
  font-size: 1.1rem;
}
</style>
