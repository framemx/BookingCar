<template>
  <div class="dashboard-container">
    <h1>ข้อมูลผู้ใช้งานทั้งหมด</h1>

    <!-- ฟอร์มสร้างหรือแก้ไขผู้ใช้ -->
    <form @submit.prevent="handleSubmit" class="user-form">
      <h2>{{ isEditing ? "แก้ไขผู้ใช้" : "สร้างผู้ใช้ใหม่" }}</h2>

      <input
        v-model="form.uName"
        type="text"
        placeholder="ชื่อผู้ใช้"
        required
      />

      <input
        v-model="form.email"
        type="email"
        placeholder="อีเมล"
        required
      />

      <input
        v-model="form.password"
        type="password"
        placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
        :required="!isEditing"
      />

      <input
        v-model="form.phone"
        type="tel"
        placeholder="เบอร์โทรศัพท์ (ถ้ามี)"
      />

      <select v-model="form.role">
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>

      <button type="submit">
        {{ isEditing ? "อัปเดตข้อมูล" : "สร้างผู้ใช้" }}
      </button>

      <button
        v-if="isEditing"
        type="button"
        @click="cancelEdit"
      >
        ยกเลิก
      </button>
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
definePageMeta({
  layout: 'admin',
});

import { ref, reactive, onMounted } from "vue";

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

// โหลดข้อมูลผู้ใช้จาก API
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

// สร้างหรือแก้ไขข้อมูลผู้ใช้
async function handleSubmit() {
  error.value = "";
  success.value = "";

  try {
    let res;

    if (isEditing.value && editUserId.value !== null) {
      // กรณีแก้ไข
      const updateBody: any = {
        uName: form.uName,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
      };

      if (form.password.trim() !== "") {
        updateBody.password = form.password;
      }

      res = await fetch(`http://localhost:3000/users/${editUserId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });
    } else {
      // กรณีสร้างใหม่
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

    await fetchUsers();
    resetForm();
  } catch (err: any) {
    error.value = err.message;
  }
}

// เริ่มแก้ไขข้อมูลผู้ใช้
function startEdit(user: User) {
  isEditing.value = true;
  editUserId.value = user.id;

  form.uName = user.uName;
  form.email = user.email;
  form.password = "";
  form.phone = user.phone || "";
  form.role = user.role;
}

// ยกเลิกการแก้ไข
function cancelEdit() {
  resetForm();
}

// รีเซ็ตฟอร์มกลับเป็นสถานะเริ่มต้น
function resetForm() {
  isEditing.value = false;
  editUserId.value = null;

  form.uName = "";
  form.email = "";
  form.password = "";
  form.phone = "";
  form.role = "USER";
}

// ลบผู้ใช้
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
  max-width: 960px;
  margin: 3rem auto; /* เพิ่มระยะบนล่าง */
  padding: 2rem;      /* เพิ่ม padding รอบกล่อง */
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: "Sarabun", sans-serif;
  color: #333333;
}

/* หัวข้อ */
.dashboard-container h1 {
  font-weight: 700;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem; /* เพิ่ม margin bottom */
  color: #1e293b;
}

/* ฟอร์ม */
.user-form {
  background-color: #f9fafb;
  padding: 2rem;        /* เพิ่ม padding */
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.1);
  margin-bottom: 3rem;  /* เพิ่ม margin bottom */
}

.user-form h2 {
  font-weight: 600;
  font-size: 1.5rem;    /* ขยายขนาดหัวข้อฟอร์ม */
  color: #334155;
  margin-bottom: 1.5rem; /* เพิ่ม margin */
}

/* อินพุตและเซเล็คต์ */
.user-form input,
.user-form select {
  width: 100%;
  padding: 0.75rem 1.25rem; /* เพิ่ม padding */
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1.1rem;       /* เพิ่มขนาดตัวอักษร */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 1.25rem;  /* เพิ่มระยะห่างระหว่าง input */
}

.user-form input:focus,
.user-form select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 5px 2px rgba(59, 130, 246, 0.4);
}

/* ปุ่ม */
.user-form button {
  padding: 0.75rem 2rem;  /* เพิ่มขนาดปุ่ม */
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
  user-select: none;
}

.user-form button[type="submit"] {
  background-color: #2563eb;
  color: white;
}

.user-form button[type="submit"]:hover {
  background-color: #1d4ed8;
}

.user-form button[type="button"] {
  background-color: #6b7280;
  color: white;
}

.user-form button[type="button"]:hover {
  background-color: #4b5563;
}

.user-form .mt-6.flex {
  gap: 1.5rem; /* เพิ่มระยะห่างระหว่างปุ่ม */
}

/* ตาราง */
.user-table {
  width: 100%;
  border-collapse: separate; /* เปลี่ยนเป็น separate เพื่อใช้ border-spacing */
  border-spacing: 0 0.75rem;  /* เว้นช่องว่างระหว่างแถวตาราง */
  font-size: 1rem;
  color: #475569;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.user-table thead {
  background-color: #2563eb;
  color: white;
  border-radius: 12px;
}

.user-table th,
.user-table td {
  padding: 1rem 1.5rem; /* เพิ่ม padding ช่องตาราง */
  background-color: white;
  text-align: left;
  vertical-align: middle;
  border-bottom: none;
}

.user-table tbody tr {
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: background-color 0.3s ease;
}

.user-table tbody tr:hover {
  background-color: #f1f5f9;
}

/* ปุ่มแก้ไข-ลบในตาราง */
.user-table button {
  padding: 0.4rem 1rem;  /* ขยายขนาดปุ่ม */
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.user-table button:nth-child(1) {
  background-color: #fbbf24; /* เหลือง */
  color: white;
}

.user-table button:nth-child(1):hover {
  background-color: #f59e0b;
}

.user-table button:nth-child(2) {
  background-color: #dc2626; /* แดง */
  color: white;
}

.user-table button:nth-child(2):hover {
  background-color: #b91c1c;
}

/* ข้อความแจ้งเตือน */
.error-message {
  margin-top: 1.5rem;
  text-align: center;
  color: #b91c1c;
  font-weight: 600;
}

.success-message {
  margin-top: 1.5rem;
  text-align: center;
  color: #16a34a;
  font-weight: 600;
}
</style>

