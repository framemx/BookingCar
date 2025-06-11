<template>
  <div class="content-wrapper">
    <h1 class="page-title">🛠️ จัดการบริการ</h1>

    <div class="action-bar">
      <button @click="showAddModal = true" class="btn-add">
        ➕ เพิ่มบริการ
      </button>
    </div>

    <div class="table-wrapper">
      <table class="booking-table">
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
            <td class="actions">
              <button class="btn-edit" @click="openEditModal(service)">
                แก้ไข
              </button>
              <button class="btn-delete" @click="confirmDelete(service)">
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal เพิ่มบริการ -->
    <teleport to="body">
      <div
        v-if="showAddModal"
        class="modal-overlay"
        @click.self="closeAddModal"
      >
        <div class="modal">
          <h2>เพิ่มบริการใหม่</h2>
          <form @submit.prevent="submitNewService">
            <div>
              <label for="sName">ชื่อบริการ</label>
              <input v-model="newService.sName" id="sName" required />
            </div>
            <div>
              <label for="description">รายละเอียด</label>
              <textarea
                v-model="newService.description"
                id="description"
                required
              ></textarea>
            </div>
            <div>
              <label for="price">ราคา (บาท)</label>
              <input
                v-model.number="newService.price"
                id="price"
                type="number"
                min="0"
                required
              />
            </div>
            <div>
              <label for="durationMinutes">ระยะเวลา (นาที)</label>
              <input
                v-model.number="newService.durationMinutes"
                id="durationMinutes"
                type="number"
                min="1"
                required
              />
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn-submit">บันทึก</button>
              <button type="button" @click="closeAddModal" class="btn-cancel">
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Modal แก้ไขบริการ -->
    <teleport to="body">
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal">
          <h2>แก้ไขบริการ</h2>
          <form @submit.prevent="submitEditService">
            <div>
              <label for="editSName">ชื่อบริการ</label>
              <input v-model="editServiceData.sName" id="editSName" required />
            </div>
            <div>
              <label for="editDescription">รายละเอียด</label>
              <textarea
                v-model="editServiceData.description"
                id="editDescription"
                required
              ></textarea>
            </div>
            <div>
              <label for="editPrice">ราคา (บาท)</label>
              <input
                v-model.number="editServiceData.price"
                id="editPrice"
                type="number"
                min="0"
                required
              />
            </div>
            <div>
              <label for="editDurationMinutes">ระยะเวลา (นาที)</label>
              <input
                v-model.number="editServiceData.durationMinutes"
                id="editDurationMinutes"
                type="number"
                min="1"
                required
              />
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn-submit">บันทึก</button>
              <button type="button" @click="closeEditModal" class="btn-cancel">
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Modal ยืนยันลบ -->
    <teleport to="body">
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="cancelDelete"
      >
        <div class="modal">
          <h3>ยืนยันการลบ</h3>
          <p>คุณต้องการลบบริการ "{{ serviceToDelete?.sName }}" หรือไม่?</p>
          <div class="modal-footer">
            <button class="btn-delete" @click="deleteService">ใช่</button>
            <button class="btn-cancel" @click="cancelDelete">ไม่</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" });
import { ref, reactive, onMounted } from "vue";

// ฟังก์ชันจัดการเมื่อ token หมดอายุ
function handleUnauthorized() {
  localStorage.removeItem("authToken");
  alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
  navigateTo("/login");
}

function getAuthHeaders() {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

interface Service {
  id: number;
  sName: string;
  description: string;
  price: number;
  durationMinutes: number;
}

const services = ref<Service[]>([]);

const showAddModal = ref(false);
const newService = reactive({
  sName: "",
  description: "",
  price: 0,
  durationMinutes: 0,
});

function closeAddModal() {
  showAddModal.value = false;
  Object.assign(newService, {
    sName: "",
    description: "",
    price: 0,
    durationMinutes: 0,
  });
}

async function submitNewService() {
  const res = await fetch("http://localhost:3000/services", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(newService),
  });

  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) return alert("เพิ่มบริการไม่สำเร็จ");

  await fetchServices();
  closeAddModal();
}

const showEditModal = ref(false);
const editServiceData = reactive<Service>({
  id: 0,
  sName: "",
  description: "",
  price: 0,
  durationMinutes: 0,
});

function openEditModal(service: Service) {
  Object.assign(editServiceData, service);
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
}

async function submitEditService() {
  const res = await fetch(
    `http://localhost:3000/services/${editServiceData.id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(editServiceData),
    }
  );

  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) return alert("แก้ไขบริการไม่สำเร็จ");

  await fetchServices();
  closeEditModal();
}

const showDeleteModal = ref(false);
const serviceToDelete = ref<Service | null>(null);

function confirmDelete(service: Service) {
  serviceToDelete.value = service;
  showDeleteModal.value = true;
}

function cancelDelete() {
  showDeleteModal.value = false;
  serviceToDelete.value = null;
}

async function deleteService() {
  if (!serviceToDelete.value) return;

  const res = await fetch(
    `http://localhost:3000/services/${serviceToDelete.value.id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (res.status === 401) return handleUnauthorized();
  if (!res.ok) return alert("ลบบริการไม่สำเร็จ");

  await fetchServices();
  cancelDelete();
}

async function fetchServices() {
  const res = await fetch("http://localhost:3000/services", {
    headers: getAuthHeaders(),
  });

  if (res.status === 401) return handleUnauthorized();

  const data = await res.json();
  services.value = data.data || [];
}

// ตรวจสอบ token ตอนเข้า
onMounted(() => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    navigateTo("/");
    return;
  }
  fetchServices();
});
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;700&display=swap");

.content-wrapper {
  max-width: 960px;
  margin: 0 auto;
  background: #ffffff;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  font-family: "Kanit", sans-serif;
  color: #1e293b;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  color: #1e3a8a;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.btn-add {
  background: #1e3a8a;
  color: white;
  padding: 0.4rem 1rem; /* ปรับขนาดปุ่มให้เล็กลง */
  font-weight: 600;
  border: none;
  border-radius: 9999px; /* โค้งเหมือนปุ่มอื่น */
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(30, 58, 138, 0.2);
  font-size: 0.95rem; /* เล็กลงเล็กน้อย */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #1d4ed8;
}

.table-wrapper {
  overflow-x: auto;
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.booking-table th {
  background: #eff6ff;
  color: #1e3a8a;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
}

.booking-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.booking-table td.actions {
  display: flex;
  flex-direction: row; /* เดิมคือ column */
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.btn-edit,
.btn-delete {
  padding: 0.4rem 0.9rem;
  font-size: 0.95rem;
  border-radius: 9999px; /* ทำให้โค้งเท่ากับปุ่มเพิ่มบริการ */
  font-weight: normal;
  cursor: pointer;
  min-width: unset; /* ยกเลิกบังคับความกว้าง */
  width: auto; /* ให้ขนาดตามเนื้อข้อความ */
  white-space: nowrap;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  font-family: "Kanit", sans-serif;
}

.modal h2,
.modal h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1e3a8a;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.modal input,
.modal textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-family: "Kanit", sans-serif;
  margin-bottom: 1.25rem;
  font-size: 1rem;
  color: #1e3a8a;
}
.modal input::placeholder,
.modal textarea::placeholder {
  color: #94a3b8; /* สี placeholder แบบอ่อน ดูเรียบร้อย */
  font-weight: 400;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-submit {
  background: #1e3a8a;
  color: white;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1rem;
}

.btn-cancel {
  background: #f1f5f9;
  color: #1e293b;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1rem;
}
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
</style>
