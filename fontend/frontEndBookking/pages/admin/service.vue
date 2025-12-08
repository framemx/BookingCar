<template>
  <div class="content-wrapper">
    <h1 class="page-title">🛠️ จัดการบริการ</h1>

    <!-- ปุ่มเพิ่มบริการ -->
    <div class="action-bar">
      <button @click="showAddModal = true" class="btn-add">➕ เพิ่มบริการ</button>
    </div>

    <!-- ตารางบริการ -->
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
              <button class="btn-edit" @click="openEditModal(service)">แก้ไข</button>
              <button class="btn-delete" @click="confirmDelete(service)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal เพิ่มบริการ -->
    <teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal">
          <h2>เพิ่มบริการใหม่</h2>

          <form @submit.prevent="submitNewService">
            <div>
              <label>ชื่อบริการ</label>
              <input v-model="newService.sName" required />
            </div>

            <div>
              <label>รายละเอียด</label>
              <textarea v-model="newService.description" required></textarea>
            </div>

            <div>
              <label>ราคา (บาท)</label>
              <input type="number" min="0" v-model.number="newService.price" required />
            </div>

            <div>
              <label>ระยะเวลา (นาที)</label>
              <input
                type="number"
                min="1"
                v-model.number="newService.durationMinutes"
                required
              />
            </div>

            <div class="modal-footer">
              <button class="btn-submit" type="submit">บันทึก</button>
              <button class="btn-cancel" type="button" @click="closeAddModal">ยกเลิก</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Modal แก้ไข -->
    <teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal">
          <h2>แก้ไขบริการ</h2>

          <form @submit.prevent="submitEditService">
            <div>
              <label>ชื่อบริการ</label>
              <input v-model="editServiceData.sName" required />
            </div>

            <div>
              <label>รายละเอียด</label>
              <textarea v-model="editServiceData.description" required></textarea>
            </div>

            <div>
              <label>ราคา (บาท)</label>
              <input type="number" min="0" v-model.number="editServiceData.price" required />
            </div>

            <div>
              <label>ระยะเวลา (นาที)</label>
              <input
                type="number"
                min="1"
                v-model.number="editServiceData.durationMinutes"
                required
              />
            </div>

            <div class="modal-footer">
              <button class="btn-submit" type="submit">บันทึก</button>
              <button class="btn-cancel" type="button" @click="closeEditModal">ยกเลิก</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Modal ลบ -->
    <teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal">
          <h3>ยืนยันการลบ</h3>

          <p>คุณต้องการลบบริการ "{{ serviceToDelete?.sName }}" ใช่หรือไม่?</p>

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
definePageMeta({ layout: "admin" })

import { ref, reactive, onMounted } from "vue"
import { useCookie, navigateTo } from "#app"

/* ---------------- TYPE ---------------- */
// กำหนดว่าบริการ 1 ตัวต้องมีข้อมูลอะไรบ้าง
interface Service {
  id: number
  sName: string
  description: string
  price: number
  durationMinutes: number
}

/* ---------------- AUTH ---------------- */
// อ่าน token จาก cookie
const token = useCookie<string | null>("token")

// header สำหรับส่งไป backend
function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    ...(token.value && { Authorization: `Bearer ${token.value}` })
  }
}

// กรณี token หมดอายุ
function handleUnauthorized() {
  token.value = null
  alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่")
  navigateTo("/")
}

/* ---------------- STATE ---------------- */
const services = ref<Service[]>([])

// เก็บ list บริการทั้งหมด
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// ควบคุม modal ต่าง ๆ
const serviceToDelete = ref<Service | null>(null)

// เก็บ service ที่เลือกจะลบ
const newService = reactive<Omit<Service, "id">>({
  sName: "",
  description: "",
  price: 0,
  durationMinutes: 1
})

// ข้อมูลของบริการที่เพิ่มใหม่
const editServiceData = reactive<Service>({
  id: 0,
  sName: "",
  description: "",
  price: 0,
  durationMinutes: 1
})

/* ---------------- FETCH ---------------- */
// FETCH — โหลดบริการทั้งหมด
async function fetchServices() {
  const res = await fetch("http://localhost:3000/services", {
    headers: getAuthHeaders()
  })

  if (res.status === 401) return handleUnauthorized()

  const data = await res.json()
  services.value = data.data || []
}

/* ---------------- CREATE ---------------- */
// ส่งข้อมูลบริการใหม่ไป backend
// ถ้าสำเร็จ → ปิด modal และรีโหลดรายการบริการ
async function submitNewService() {
  const res = await fetch("http://localhost:3000/services", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(newService)
  })

  if (!res.ok) return alert("เพิ่มบริการไม่สำเร็จ")

  closeAddModal()
  fetchServices()
}

// ปุ่มปิด Modal + รีเซ็ตฟอร์ม
function closeAddModal() {
  showAddModal.value = false
  Object.assign(newService, {
    sName: "",
    description: "",
    price: 0,
    durationMinutes: 1
  })
}

/* ---------------- UPDATE ---------------- */
// เปิด modal พร้อมโหลดข้อมูลเดิม
function openEditModal(service: Service) {
  Object.assign(editServiceData, service)
  showEditModal.value = true
}

// ปุ่มปิด Modal + รีเซ็ตฟอร์ม
function closeEditModal() {
  showEditModal.value = false;
}

// ส่งข้อมูลแก้ไขไป backend
async function submitEditService() {
  const res = await fetch(
    `http://localhost:3000/services/${editServiceData.id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(editServiceData)
    }
  )

  if (!res.ok) return alert("แก้ไขบริการไม่สำเร็จ")

  showEditModal.value = false
  fetchServices()
}

/* ---------------- DELETE ---------------- */
function confirmDelete(service: Service) {
  serviceToDelete.value = service
  showDeleteModal.value = true
}

function cancelDelete() {
  serviceToDelete.value = null
  showDeleteModal.value = false
}

async function deleteService() {
  if (!serviceToDelete.value) return

  const res = await fetch(
    `http://localhost:3000/services/${serviceToDelete.value.id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders()
    }
  )

  if (!res.ok) return alert("ลบบริการไม่สำเร็จ")

  cancelDelete()
  fetchServices()
}

/* ---------------- MOUNT ---------------- */
// โหลดข้อมูลทันทีเมื่อเข้าเพจ
// ถ้าไม่มี token → เด้งไปหน้า login
// ถ้ามี → โหลดรายการบริการทั้งหมด
onMounted(() => {
  if (!token.value) return navigateTo("/")
  fetchServices()
})
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
