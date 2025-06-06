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
            <button class="btn-edit" @click="openEditModal(service)">แก้ไข</button>
            <button class="btn-delete" @click="confirmDelete(service)">ลบ</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal เพิ่มบริการ -->
    <teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
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
            <button type="button" @click="closeAddModal" class="btn-cancel">ยกเลิก</button>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Modal แก้ไขบริการ -->
    <teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal">
          <h2>แก้ไขบริการ</h2>
          <form @submit.prevent="submitEditService">
            <div>
              <label for="editSName">ชื่อบริการ</label>
              <input v-model="editServiceData.sName" id="editSName" required />
            </div>
            <div>
              <label for="editDescription">รายละเอียด</label>
              <textarea v-model="editServiceData.description" id="editDescription" required></textarea>
            </div>
            <div>
              <label for="editPrice">ราคา (บาท)</label>
              <input v-model.number="editServiceData.price" id="editPrice" type="number" min="0" required />
            </div>
            <div>
              <label for="editDurationMinutes">ระยะเวลา (นาที)</label>
              <input v-model.number="editServiceData.durationMinutes" id="editDurationMinutes" type="number" min="1" required />
            </div>
            <button type="submit" class="btn-submit">บันทึก</button>
            <button type="button" @click="closeEditModal" class="btn-cancel">ยกเลิก</button>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Modal ยืนยันลบ -->
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
definePageMeta({ layout: 'admin' })

import { ref, reactive, onMounted } from "vue";

interface Service {
  id: number;
  sName: string;
  description: string;
  price: number;
  durationMinutes: number;
}

const services = ref<Service[]>([]);

// Modal เพิ่มบริการ
const showAddModal = ref(false);
const newService = reactive({
  sName: "",
  description: "",
  price: 0,
  durationMinutes: 0,
});
function closeAddModal() {
  showAddModal.value = false;
  newService.sName = "";
  newService.description = "";
  newService.price = 0;
  newService.durationMinutes = 0;
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
    closeAddModal();
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

// Modal แก้ไขบริการ
const showEditModal = ref(false);
const editServiceData = reactive<Service>({
  id: 0,
  sName: "",
  description: "",
  price: 0,
  durationMinutes: 0,
});
function openEditModal(service: Service) {
  editServiceData.id = service.id;
  editServiceData.sName = service.sName;
  editServiceData.description = service.description;
  editServiceData.price = service.price;
  editServiceData.durationMinutes = service.durationMinutes;
  showEditModal.value = true;
}
function closeEditModal() {
  showEditModal.value = false;
}

// ส่งข้อมูลแก้ไขไป API
async function submitEditService() {
  try {
    const res = await fetch(`http://localhost:3000/services/${editServiceData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sName: editServiceData.sName,
        description: editServiceData.description,
        price: editServiceData.price,
        durationMinutes: editServiceData.durationMinutes,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "แก้ไขบริการไม่สำเร็จ");
    }
    await fetchServices();
    closeEditModal();
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

// Modal ลบ
const showDeleteModal = ref(false);
const serviceToDelete = ref<Service | null>(null);
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

// ดึงข้อมูลบริการจาก API
async function fetchServices() {
  try {
    const res = await fetch("http://localhost:3000/services");
    if (!res.ok) throw new Error("โหลดข้อมูลบริการไม่สำเร็จ");
    const data = await res.json();
    services.value = data.data || [];
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

onMounted(() => {
  fetchServices();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 2rem;
  font-family: "Sarabun", sans-serif;
  color: #1e293b;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  text-align: center;
  color: #1e40af;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}
.btn-add {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s;
  margin-bottom: 2rem;
  display: block;
  margin-left: auto;
  box-shadow: 0 5px 15px rgba(30, 64, 175, 0.3);
}
.btn-add:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
}
table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background-color: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
}
thead {
  background-color: #1e40af;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}
th, td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-size: 1rem;
}
tbody tr:hover {
  background-color: #e0e7ff;
  transition: background-color 0.3s ease;
}
.btn-edit {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 1rem;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.btn-edit:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}
.btn-delete {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
.btn-delete:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  font-family: "Sarabun", sans-serif;
  animation: fadeIn 0.3s ease-in-out;
}
.modal h2, .modal h3 {
  margin-bottom: 1.5rem;
  color: #1e40af;
  font-weight: 800;
  font-size: 1.8rem;
  text-align: center;
}
.modal p {
  margin-bottom: 2rem;
  color: #334155;
  font-size: 1.1rem;
  text-align: center;
}
.modal form div {
  margin-bottom: 1.5rem;
}
.modal label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.6rem;
  font-size: 1.1rem;
  color: #1e293b;
}
.modal input,
.modal textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1.1rem;
  font-family: "Sarabun", sans-serif;
  background-color: #f9fafb;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.modal input:focus,
.modal textarea:focus {
  border-color: #1e40af;
  box-shadow: 0 0 10px rgba(30, 64, 175, 0.2);
  outline: none;
}
.modal textarea {
  resize: vertical;
  min-height: 80px;
}
.btn-submit {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.1rem;
  margin-right: 1.5rem;
  box-shadow: 0 5px 15px rgba(30, 64, 175, 0.3);
  transition: background-color 0.3s ease, transform 0.2s;
}
.btn-submit:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
}
.btn-cancel {
  background-color: #e2e8f0;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.1rem;
  color: #334155;
  transition: background-color 0.3s ease, transform 0.2s;
}
.btn-cancel:hover {
  background-color: #cbd5e1;
  transform: translateY(-2px);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>