<template>
  <div class="container">
    <h2 class="page-title">📦 รายการ Slot ทั้งหมด</h2>

    <!-- ปุ่มจัดการ Slot -->
    <div class="action-bar">
      <button class="btn-add" @click="goToSlotManagement">
        ➕ จัดการ Slot
      </button>
    </div>

    <!-- ฟิลเตอร์วันที่ -->
    <div class="filter-bar">
      <label class="filter-label">
        <i class="i-lucide-calendar"></i>
        เลือกวันที่:
      </label>

      <div class="date-picker-wrapper">
        <i class="i-lucide-calendar"></i>
        <input
          type="date"
          v-model="selectedDate"
          class="custom-date-input"
        />
      </div>

      <button v-if="selectedDate" @click="clearDateFilter">
        ล้างตัวกรอง
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">กำลังโหลดข้อมูล...</div>

    <!-- ไม่มีข้อมูล -->
    <div v-else-if="filteredSlots.length === 0" class="empty">
      ไม่มีข้อมูล Slot สำหรับวันที่เลือก
    </div>

    <!-- รายการ Slot -->
    <div v-else class="slot-list">
      <div v-for="slot in filteredSlots" :key="slot.id" class="slot-item">
        <p><strong>ชื่อ Slot:</strong> {{ slot.slotName || "ไม่มีชื่อ" }}</p>
        <p><strong>วันที่:</strong> {{ slot.date }}</p>
        <p><strong>เวลาเริ่ม:</strong> {{ formatTime(slot.startTime) }}</p>
        <p><strong>เวลาสิ้นสุด:</strong> {{ formatTime(slot.endTime) }}</p>

        <p>
          <strong>สถานะ:</strong>
          <span :class="slot.status === 'AVAILABLE' ? 'available' : 'booked'">
            {{ slot.status }}
          </span>
        </p>

        <div class="btn-group">
          <button class="btn-edit" @click="openEditDialog(slot)">แก้ไข</button>
          <button class="btn-delete" @click="deleteSlot(slot.id)">ลบ</button>
        </div>
      </div>
    </div>

    <!-- Dialog แก้ไข -->
    <dialog ref="editDialog" class="edit-dialog">
      <form @submit.prevent="saveEdit">
        <h3>แก้ไขข้อมูล Slot</h3>

        <label>
          ชื่อ Slot:
          <input type="text" v-model="editSlotData.slotName" required class="form-input" />
        </label>

        <label>
          วันที่:
          <input type="date" v-model="editSlotData.date" required class="form-input" />
        </label>

        <label>
          เวลาเริ่ม:
          <input type="time" v-model="editSlotData.startTime" required class="form-input" />
        </label>

        <label>
          เวลาสิ้นสุด:
          <input type="time" v-model="editSlotData.endTime" required class="form-input" />
        </label>

        <label>
          สถานะ:
          <select v-model="editSlotData.status" class="form-input">
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="BOOKED">BOOKED</option>
          </select>
        </label>

        <div class="dialog-buttons">
          <button type="submit" class="btn-save">บันทึก</button>
          <button type="button" class="btn-cancel" @click="closeEditDialog">ยกเลิก</button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useCookie, navigateTo } from "#app"

definePageMeta({ layout: "admin" })

/* ---------- TYPE ---------- */
interface Slot {
  id: number
  slotName: string
  date: string
  startTime: string
  endTime: string
  status: "AVAILABLE" | "BOOKED"
}

/* ---------- AUTH ---------- */
const token = useCookie<string | null>("token")

function getAuthHeaders() {
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

/* ---------- STATE ---------- */
const slots = ref<Slot[]>([])
const loading = ref(false)
const selectedDate = ref("")

const editDialog = ref<HTMLDialogElement | null>(null)
const editSlotData = ref<Slot>({
  id: 0,
  slotName: "",
  date: "",
  startTime: "",
  endTime: "",
  status: "AVAILABLE",
})

/* ---------- FILTER ---------- */
const filteredSlots = computed(() => {
  if (!selectedDate.value) return slots.value
  return slots.value.filter((slot) => slot.date === selectedDate.value)
})

/* ---------- NAV ---------- */
function goToSlotManagement() {
  navigateTo("/admin/slot-management")
}

/* ---------- FORMAT TIME ---------- */
function formatTime(value: string) {
  if (!value) return "ไม่มีเวลา"
  if (value.length === 4) {
    value = value.slice(0, 2) + ":" + value.slice(2)
  }
  return value
}

function clearDateFilter() {
  selectedDate.value = ""
}

/* ---------- EDIT DIALOG ---------- */
function openEditDialog(slot: Slot) {
  editSlotData.value = { ...slot }
  editDialog.value?.showModal()
}

function closeEditDialog() {
  editDialog.value?.close()
}

/* ---------- SAVE EDIT ---------- */
async function saveEdit() {
  const payload = { ...editSlotData.value }

  const res = await fetch(`http://localhost:3000/slots/${payload.id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    if (res.status === 401) return handleUnauthorized()
    alert("แก้ไข Slot ไม่สำเร็จ")
    return
  }

  const index = slots.value.findIndex((s) => s.id === payload.id)
  if (index !== -1) slots.value[index] = payload

  alert("บันทึกสำเร็จ")
  closeEditDialog()
}

/* ---------- DELETE ---------- */
async function deleteSlot(id: number) {
  if (!confirm("ต้องการลบ Slot นี้หรือไม่?")) return

  const res = await fetch(`http://localhost:3000/slots/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    if (res.status === 401) return handleUnauthorized()
    alert("ลบ Slot ไม่สำเร็จ")
    return
  }

  slots.value = slots.value.filter((s) => s.id !== id)
  alert("ลบสำเร็จ")
}

/* ---------- FETCH ---------- */
async function fetchSlots() {
  loading.value = true

  const res = await fetch("http://localhost:3000/slots", {
    headers: getAuthHeaders(),
  })

  if (res.status === 401) return handleUnauthorized()

  const data = await res.json()
  slots.value = data.data || data

  loading.value = false
}

/* ---------- MOUNT ---------- */
onMounted(() => {
  if (!token.value) return navigateTo("/")
  fetchSlots()
})
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;700&display=swap");

.container {
  max-width: 960px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  font-family: "Kanit", sans-serif;
  color: #1e293b;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  color: #1e3a8a;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.btn-add {
  background: #1e3a8a;
  color: white;
  padding: 0.6rem 1.6rem;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: 0.2s;
}

.btn-add:hover {
  background: #3b82f6;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e40af;
}

.date-picker-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #1e40af;
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  gap: 0.75rem;
  background-color: #1e40af;
  transition: border-color 0.3s ease;
}

.date-picker-wrapper:focus-within {
  border-color: #ffffff;
}

.custom-date-input {
  border: none;
  outline: none;
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
  background-color: transparent;
  padding: 0.4rem 0;
  appearance: none;
  width: 140px;
  cursor: pointer;
}

/* เพิ่มลูกศร calendar สำหรับ Chrome */
.custom-date-input::-webkit-calendar-picker-indicator {
  filter: invert(20%) sepia(90%) saturate(300%) hue-rotate(190deg);
  height: 20px;
  width: 20px;
  cursor: pointer;
}

/* ปรับปุ่มล้างตัวกรอง */
.filter-bar button {
  background-color: #ff1a1a;
  color: white;
  padding: 0.45rem 1.2rem;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.filter-bar button:hover {
  background-color: #3b82f6;
}

/* Firefox & Edge */
.custom-date-input:focus {
  outline: none;
}

.i-lucide-calendar {
  color: #2563eb;
  font-size: 1.4rem;
}

.slot-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.slot-item {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.2s;
}

.slot-item:hover {
  transform: scale(1.01);
}

.available {
  color: #16a34a;
  font-weight: 700;
}

.booked {
  color: #dc2626;
  font-weight: 700;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-edit,
.btn-delete {
  padding: 0.4rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.edit-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 460px;
  border: none;
  border-radius: 16px;
  background-color: #ffffff;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  z-index: 999;
}

.edit-dialog::backdrop {
  background: rgba(0, 0, 0, 0.35);
}

.edit-dialog h3 {
  font-size: 1.4rem;
  color: #2563eb;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.edit-dialog form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.edit-dialog label {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-weight: 600;
}

.form-input {
  font-weight: 600;
  color: #1e293b;
  border: 1.5px solid #cbd5e1;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  background-color: #f9fafb;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  width: 100%;
}

.btn-save {
  background-color: #22c55e;
  color: white;
  font-weight: 700;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  width: 45%;
}

.btn-cancel {
  background-color: #e2e8f0;
  color: #1e293b;
  font-weight: 700;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  width: 45%;
}

.loading,
.empty {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #64748b;
  margin: 1.5rem 0;
}
</style>
