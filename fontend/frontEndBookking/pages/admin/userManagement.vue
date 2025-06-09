<template>
  <div class="container">
    <h1 class="page-title">👤 ข้อมูลผู้ใช้งานทั้งหมด</h1>

    <form @submit.prevent="handleSubmit" class="user-form">
      <h2>{{ isEditing ? "✏️ แก้ไขผู้ใช้" : "➕ สร้างผู้ใช้ใหม่" }}</h2>
      <div class="form-grid">
        <input v-model="form.uName" type="text" placeholder="ชื่อผู้ใช้" required />
        <input v-model="form.email" type="email" placeholder="อีเมล" required />
        <input v-model="form.password" type="password" placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)" :required="!isEditing" />
        <input v-model="form.phone" type="tel" placeholder="เบอร์โทรศัพท์ (ถ้ามี)" />
        <select v-model="form.role">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit">{{ isEditing ? "อัปเดตข้อมูล" : "สร้างผู้ใช้" }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit">ยกเลิก</button>
      </div>
    </form>

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
            <td>{{ user.phone || '-' }}</td>
            <td>{{ user.role }}</td>
            <td class="action-buttons">
              <button class="btn-edit" @click="startEdit(user)">แก้ไข</button>
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
definePageMeta({ layout: 'admin' });
import { ref, reactive, onMounted } from 'vue';

interface User {
  id: number;
  uName: string;
  email: string;
  phone?: string;
  role: string;
}

const users = ref<User[]>([]);
const error = ref('');
const success = ref('');
const isEditing = ref(false);
const editUserId = ref<number | null>(null);
const form = reactive({
  uName: '',
  email: '',
  password: '',
  phone: '',
  role: 'USER',
});

async function fetchUsers() {
  try {
    const res = await fetch('http://localhost:3000/users');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'โหลดข้อมูลไม่สำเร็จ');
    users.value = data.data;
  } catch (err: any) {
    error.value = err.message;
  }
}

async function handleSubmit() {
  error.value = '';
  success.value = '';
  try {
    let res;
    if (isEditing.value && editUserId.value !== null) {
      const updateBody: any = {
        uName: form.uName,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
      };
      if (form.password.trim() !== '') updateBody.password = form.password;
      res = await fetch(`http://localhost:3000/users/${editUserId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      });
    } else {
      if (form.password.length < 6) throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
    success.value = isEditing.value ? 'อัปเดตข้อมูลสำเร็จ' : 'สร้างผู้ใช้สำเร็จ';
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
  form.password = '';
  form.phone = user.phone || '';
  form.role = user.role;
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  isEditing.value = false;
  editUserId.value = null;
  form.uName = '';
  form.email = '';
  form.password = '';
  form.phone = '';
  form.role = 'USER';
}

async function deleteUser(id: number) {
  if (!confirm('คุณต้องการลบผู้ใช้นี้หรือไม่?')) return;
  try {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'ลบไม่สำเร็จ');
    success.value = 'ลบผู้ใช้สำเร็จ';
    await fetchUsers();
  } catch (err: any) {
    error.value = err.message;
  }
}

onMounted(fetchUsers);
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

input:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  outline: none;
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

button[type="submit"]:hover {
  background-color: #3b82f6;
}

button[type="button"] {
  background-color: #64748b;
  color: white;
}

button[type="button"]:hover {
  background-color: #475569;
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
  text-align: center;
  padding: 0.75rem;
  font-weight: 600;
}

.user-table td {
  background: #ffffff;
  padding: 0.7rem;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
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
  font-size: 0.85rem;
  border-radius: 9999px;
}

.btn-edit:hover {
  background: #d97706;
}

.btn-delete {
  background: #ef4444;
  color: white;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  border-radius: 9999px;
}

.btn-delete:hover {
  background: #dc2626;
}

.no-data {
  text-align: center;
  font-size: 1rem;
  color: #6b7280;
}

.error-message,
.success-message {
  text-align: center;
  font-weight: 600;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
}

.success-message {
  background: #d1fae5;
  color: #16a34a;
}
</style>
