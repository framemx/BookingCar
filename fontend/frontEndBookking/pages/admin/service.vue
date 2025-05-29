<template>
  <div class="container">
    <h1>จัดการบริการ</h1>

    <button @click="showAddModal = true" class="btn-add">เพิ่มบริการ</button>

    <table>
      <thead>
        <tr>
          <th>ชื่อบริการ</th>
          <th>รายละเอียด</th>
          <th>ราคา (บาท)</th>
          <th>ระยะเวลา (นาที)</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="service in services" :key="service.id">
          <td>{{ service.sName }}</td>
          <td>{{ service.description }}</td>
          <td>{{ service.price }}</td>
          <td>{{ service.durationMinutes }}</td>
          <td>
            <!-- ปุ่มแก้ไข (สามารถเพิ่มฟังก์ชันแก้ไขได้) -->
            <button class="btn-edit" @click="editService(service)">แก้ไข</button>

            <!-- ปุ่มลบ -->
            <button class="btn-delete" @click="confirmDelete(service)">ลบ</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Popup เพิ่มบริการ -->
    <teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2>เพิ่มบริการใหม่</h2>
          <form @submit.prevent="submitNewService">
            <div>
              <label for="sName">ชื่อบริการ</label>
              <input v-model="newService.sName" id="sName" required />
            </div>
            <div>
              <label for="description">รายละเอียด</label>
              <textarea v-model="newService.description" id="description" required></textarea>
            </div>
            <div>
              <label for="price">ราคา (บาท)</label>
              <input v-model.number="newService.price" id="price" type="number" min="0" required />
            </div>
            <div>
              <label for="durationMinutes">ระยะเวลา (นาที)</label>
              <input v-model.number="newService.durationMinutes" id="durationMinutes" type="number" min="1" required />
            </div>
            <button type="submit" class="btn-submit">บันทึก</button>
            <button type="button" @click="closeModal" class="btn-cancel">ยกเลิก</button>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Modal Popup ยืนยันลบแบบ Custom -->
    <teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal">
          <h3>ยืนยันการลบ</h3>
          <p>คุณต้องการลบบริการ "{{ serviceToDelete?.sName }}" หรือไม่?</p>
          <button class="btn-delete" @click="deleteService">ใช่</button>
          <button class="btn-cancel" @click="cancelDelete">ไม่</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

import { ref, reactive, onMounted } from "vue";

interface Service {
  id: number;
  sName: string;
  description: string;
  price: number;
  durationMinutes: number;
}

const services = ref<Service[]>([]);
const showAddModal = ref(false);

// สำหรับ popup ลบ
const showDeleteModal = ref(false);
const serviceToDelete = ref<Service | null>(null);

const newService = reactive({
  sName: "",
  description: "",
  price: 0,
  durationMinutes: 0,
});

async function fetchServices() {
  try {
    const res = await fetch("http://localhost:3000/services");
    if (!res.ok) throw new Error("โหลดข้อมูลบริการไม่สำเร็จ");
    const data = await res.json();
    // สมมุติ API ตอบแบบ { success, message, status, data }
    services.value = data.data || [];
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

async function submitNewService() {
  try {
    const res = await fetch("http://localhost:3000/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "เพิ่มบริการไม่สำเร็จ");
    }
    await fetchServices();
    closeModal();
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

function closeModal() {
  showAddModal.value = false;
  newService.sName = "";
  newService.description = "";
  newService.price = 0;
  newService.durationMinutes = 0;
}

function confirmDelete(service: Service) {
  serviceToDelete.value = service;
  showDeleteModal.value = true;
}

function cancelDelete() {
  serviceToDelete.value = null;
  showDeleteModal.value = false;
}

async function deleteService() {
  if (!serviceToDelete.value) return;
  try {
    const res = await fetch(`http://localhost:3000/services/${serviceToDelete.value.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "ลบบริการไม่สำเร็จ");
    }
    await fetchServices();
    cancelDelete();
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

// placeholder ฟังก์ชันแก้ไข
function editService(service: Service) {
  alert(`ฟังก์ชันแก้ไขยังไม่ถูกพัฒนาสำหรับบริการ: ${service.sName}`);
}

onMounted(() => {
  fetchServices();
});
</script>

<style scoped>
.container {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: "Sarabun", sans-serif;
  color: #1e293b;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #2563eb;
}

/* ปุ่มเพิ่มบริการ */
.btn-add {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 1.5rem;
  display: block;
  margin-left: auto;
}

.btn-add:hover {
  background-color: #1e40af;
}

/* ตาราง */
table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

thead {
  background-color: #2563eb;
  color: white;
  font-weight: 600;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

tbody tr:hover {
  background-color: #f1f5f9;
}

/* ปุ่มแก้ไข */
.btn-edit {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.35rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.btn-edit:hover {
  background-color: #2563eb;
}

/* ปุ่มลบ */
.btn-delete {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.35rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.btn-delete:hover {
  background-color: #b91c1c;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal container */
.modal {
  background-color: white;
  padding: 1.75rem 2rem;
  border-radius: 12px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);
  font-family: "Sarabun", sans-serif;
}

.modal h2, .modal h3 {
  margin-bottom: 1rem;
  color: #2563eb;
  font-weight: 700;
  font-size: 1.5rem;
}

.modal p {
  margin-bottom: 1.5rem;
  color: #334155;
  font-size: 1rem;
}

/* Form inside modal */
.modal form > div {
  margin-bottom: 1rem;
}

.modal label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #475569;
}

.modal input[type="text"],
.modal input[type="number"],
.modal textarea {
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  transition: border-color 0.3s ease;
  font-family: "Sarabun", sans-serif;
  resize: vertical;
}

.modal input[type="text"]:focus,
.modal input[type="number"]:focus,
.modal textarea:focus {
  outline: none;
  border-color: #2563eb;
}

/* Buttons inside modal */
.btn-submit,
.btn-cancel {
  padding: 0.5rem 1.3rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 0.8rem;
  transition: background-color 0.3s ease;
}

.btn-submit {
  background-color: #2563eb;
  color: white;
}

.btn-submit:hover {
  background-color: #1e40af;
}

.btn-cancel {
  background-color: #e2e8f0;
  color: #475569;
}

.btn-cancel:hover {
  background-color: #cbd5e1;
}
</style>
