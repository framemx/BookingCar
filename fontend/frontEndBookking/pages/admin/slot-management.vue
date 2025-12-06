<template>
  <div class="container">
    <h2 class="page-title">🛠️ จัดการ Slot ร้าน</h2>

    <!-- ส่วนกำหนดจำนวน Slot -->
    <div class="input-bar">
      <label>จำนวน Slot ที่ต้องการ:</label>

      <div class="input-control-wrapper">
        <button class="counter-btn b1" @click="decreaseSlot">
          <i class="lucide lucide-minus">-</i>
        </button>

        <input type="text" :value="slotCount" readonly class="counter-input" />

        <button class="counter-btn b2" @click="increaseSlot">
          <i class="lucide lucide-plus">+</i>
        </button>
      </div>

      <button @click="generateSlots" class="btn-add">➕ สร้าง Slot</button>
    </div>

    <!-- รายการ slot ที่สร้าง -->
    <div v-for="(slot, index) in slots" :key="index" class="slot-group">
      <div class="slot-inputs">
        <div class="form-control">
          <label :for="'date-' + index">วันที่</label>
          <input
            type="date"
            :id="'date-' + index"
            v-model="slot.date"
            class="form-input"
            required
          />
        </div>

        <div class="form-control">
          <label :for="'start-' + index">เวลาเริ่มต้น</label>
          <input
            type="time"
            :id="'start-' + index"
            v-model="slot.startTime"
            class="form-input"
            required
          />
        </div>

        <div class="form-control">
          <label :for="'end-' + index">เวลาสิ้นสุด</label>
          <input
            type="time"
            :id="'end-' + index"
            v-model="slot.endTime"
            class="form-input"
            required
          />
        </div>

        <div class="form-control">
          <label :for="'name-' + index">ชื่อ Slot</label>
          <input
            type="text"
            :id="'name-' + index"
            v-model="slot.slotName"
            class="form-input"
            required
          />
        </div>

        <div class="form-control">
          <label :for="'status-' + index">สถานะ</label>
          <select
            :id="'status-' + index"
            v-model="slot.status"
            class="form-input"
            required
          >
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
          </select>
        </div>
      </div>

      <button class="btn-remove" @click="removeSlot(index)">
        ลบ
      </button>
    </div>

    <button class="btn-save" @click="saveSlots">💾 บันทึก Slot</button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })

import { ref, onMounted } from "vue"
import { useCookie, navigateTo } from "#app"

/* ------------------ TYPE ------------------ */
interface SlotItem {
  date: string
  startTime: string
  endTime: string
  slotName: string
  status: "AVAILABLE" | "BOOKED"
}

/* ------------------ AUTH ------------------ */
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

/* ------------------ STATE ------------------ */
const slotCount = ref<number>(1)
const slots = ref<SlotItem[]>([])

/* ------------------ HELPERS ------------------ */
function getTodayDateString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

/* ------------------ GENERATE ------------------ */
function generateSlots() {
  const today = getTodayDateString()
  slots.value = Array.from({ length: slotCount.value }, (_, i) => ({
    date: today,
    startTime: "09:00",
    endTime: "16:00",
    slotName: `Slot ${i + 1}`,
    status: "AVAILABLE"
  }))
}

/* ------------------ SLOT COUNTER ------------------ */
function increaseSlot() {
  slotCount.value++
}

function decreaseSlot() {
  if (slotCount.value > 1) slotCount.value--
}

/* ------------------ REMOVE ------------------ */
function removeSlot(index: number) {
  slots.value.splice(index, 1)
}

/* ------------------ SAVE ------------------ */
async function saveSlots() {
  if (slots.value.length === 0) {
    return alert("กรุณาสร้าง Slot ก่อนบันทึก")
  }

  for (const slot of slots.value) {
    if (!slot.date || !slot.startTime || !slot.endTime || !slot.slotName) {
      alert(`ข้อมูลไม่ครบถ้วนใน Slot "${slot.slotName}"`)
      return
    }

    if (slot.startTime >= slot.endTime) {
      alert(`Slot "${slot.slotName}" เวลาเริ่มต้องน้อยกว่าสิ้นสุด`)
      return
    }

    const res = await fetch("http://localhost:3000/slots", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(slot)
    })

    if (res.status === 401) return handleUnauthorized()

    const data = await res.json()
    if (!res.ok) {
      alert(data.error || "เกิดข้อผิดพลาดในการบันทึก Slot")
      return
    }
  }

  alert("บันทึก Slot ทั้งหมดเรียบร้อยแล้ว 🎉")
}

/* ------------------ MOUNT ------------------ */
onMounted(() => {
  if (!token.value) return navigateTo("/")
})
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;700&display=swap");

.container {
  max-width: 960px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
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

.input-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: space-between;
}

.input-control-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.counter-input {
  width: 64px;
  text-align: center;
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  border: 2px solid #d1d5db;
  background-color: #f9fafb;
  font-weight: 700;
  font-size: 1.05rem;
  color: #1e293b;
  transition: border-color 0.2s ease;
}

.counter-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  font-size: 1.3rem;
  font-weight: 700;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.counter-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.counter-btn.b1:hover {
  background-color: #ff0037;
  transform: scale(1.1);
}

.counter-btn.b2:hover {
  background-color: #2ef72e;
  transform: scale(1.1);
}

.counter-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.counter-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.slot-group {
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.slot-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
}

.form-control {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.4rem;
}

.form-input {
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background-color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.btn-remove {
  margin-top: 1rem;
  background-color: #ef4444;
  color: white;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
}

.btn-remove:hover {
  background-color: #dc2626;
}

.btn-add {
  background-color: #1e3a8a;
  color: white;
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
}

.btn-add:hover {
  background-color: #698cff;
  color: white;
  transform: scale(1.05);
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-save {
  display: block;
  width: 100%;
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  background-color: #22c55e;
  color: white;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin-top: 2rem;
}

.btn-save:hover {
  background-color: #16a34a;
}
</style>
