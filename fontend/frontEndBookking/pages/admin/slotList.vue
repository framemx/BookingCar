<template>
  <div class="container">
    <h2 class="page-title">📦 รายการ Slot ทั้งหมด</h2>

    <div class="action-bar">
      <button class="btn-add" @click="goToSlotManagement">
        ➕ จัดการ Slot
      </button>
    </div>

    <div class="filter-bar">
      <label for="filterDate" class="filter-label">
        <i class="i-lucide-calendar"></i>
        เลือกวันที่:
      </label>
      <div class="date-picker-wrapper">
        <i class="i-lucide-calendar"></i>
        <input
          type="date"
          id="filterDate"
          v-model="selectedDate"
          class="custom-date-input"
        />
      </div>
      <button v-if="selectedDate" @click="clearDateFilter">ล้างตัวกรอง</button>
    </div>

    <div v-if="loading" class="loading">กำลังโหลดข้อมูล...</div>
    <div v-else-if="filteredSlots.length === 0" class="empty">
      ไม่มีข้อมูล Slot สำหรับวันที่เลือก
    </div>

    <div v-else class="slot-list">
      <div
        v-for="(slot, index) in filteredSlots"
        :key="slot.id"
        class="slot-item"
      >
        <p><strong>ชื่อ Slot:</strong> {{ slot.slotName || "ไม่มีชื่อ" }}</p>
        <p><strong>วันที่:</strong> {{ slot.date || "ไม่มีวันที่" }}</p>
        <p><strong>เวลาเริ่ม:</strong> {{ formatTime(slot.startTime) }}</p>
        <p><strong>เวลาสิ้นสุด:</strong> {{ formatTime(slot.endTime) }}</p>

        <p>
          <strong>สถานะ:</strong>
          <span :class="slot.status === 'AVAILABLE' ? 'available' : 'booked'">
            {{ slot.status || "ไม่ระบุสถานะ" }}
          </span>
        </p>

        <div class="btn-group">
          <button class="btn-edit" @click="openEditDialog(slot)">แก้ไข</button>
          <button class="btn-delete" @click="deleteSlot(slot.id)">ลบ</button>
        </div>
      </div>
    </div>

    <dialog ref="editDialog" class="edit-dialog">
      <form @submit.prevent="saveEdit">
        <h3>แก้ไขข้อมูล Slot</h3>

        <label
          >ชื่อ Slot:<input
            type="text"
            v-model="editSlotData.slotName"
            required
            class="form-input"
        /></label>
        <label
          >วันที่:<input
            type="date"
            v-model="editSlotData.date"
            required
            class="form-input"
        /></label>
        <label
          >เวลาเริ่ม:<input
            type="time"
            v-model="editSlotData.startTime"
            required
            class="form-input"
        /></label>
        <label
          >เวลาสิ้นสุด:<input
            type="time"
            v-model="editSlotData.endTime"
            required
            class="form-input"
        /></label>
        <label>
          สถานะ:
          <select v-model="editSlotData.status" required class="form-input">
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="BOOKED">BOOKED</option>
          </select>
        </label>

        <div class="dialog-buttons">
          <button type="submit" class="btn-save">บันทึก</button>
          <button type="button" class="btn-cancel" @click="closeEditDialog">
            ยกเลิก
          </button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

definePageMeta({ layout: "admin" });

const slots = ref([]);
const loading = ref(false);
const router = useRouter();

const editDialog = ref(null);
const editSlotData = ref({
  id: null,
  slotName: "",
  date: "",
  startTime: "",
  endTime: "",
  status: "AVAILABLE",
});

function getAuthHeaders() {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

const selectedDate = ref("");
const filteredSlots = computed(() => {
  if (!selectedDate.value) return slots.value;
  return slots.value.filter((slot) => slot.date === selectedDate.value);
});

function goToSlotManagement() {
  router.push("/admin/slotManagement");
}

function openEditDialog(slot) {
  editSlotData.value = { ...slot };
  editDialog.value.showModal();
}

function closeEditDialog() {
  editDialog.value.close();
}

async function saveEdit() {
  try {
    const { date, startTime, endTime } = editSlotData.value;
    if (!date || !startTime || !endTime)
      throw new Error("กรุณากรอกวันที่และเวลาให้ครบ");

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    if (start >= end) throw new Error("เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด");

    const payload = { ...editSlotData.value };

    const res = await fetch(
      `http://localhost:3000/slots/${editSlotData.value.id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(), // ✅
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok)
      throw new Error((await res.json()).error || "แก้ไข Slot ไม่สำเร็จ");

    const index = slots.value.findIndex((s) => s.id === payload.id);
    if (index !== -1) slots.value[index] = payload;

    alert("แก้ไข Slot เรียบร้อยแล้ว");
    closeEditDialog();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteSlot(id) {
  if (!confirm("คุณแน่ใจว่าต้องการลบ Slot นี้?")) return;
  try {
    const res = await fetch(`http://localhost:3000/slots/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(), // ✅
    });

    if (!res.ok)
      throw new Error((await res.json()).error || "ลบ Slot ไม่สำเร็จ");
    slots.value = slots.value.filter((s) => s.id !== id);
    alert("ลบ Slot เรียบร้อยแล้ว");
  } catch (err) {
    alert(err.message);
  }
}

async function fetchSlots() {
  loading.value = true;
  try {
    const res = await fetch("http://localhost:3000/slots", {
      headers: getAuthHeaders(),
    });
    if (!res.ok)
      throw new Error((await res.json()).error || "โหลดข้อมูลไม่สำเร็จ");
    slots.value = await res.json();
  } catch (err) {
    alert(err.message);
  } finally {
    loading.value = false;
  }
}

function formatTime(timeString) {
  if (!timeString) return "ไม่มีเวลา";
  if (/^\d{4}$/.test(timeString))
    timeString = timeString.slice(0, 2) + ":" + timeString.slice(2);
  return new Date(
    `1970-01-01T${timeString.length === 5 ? timeString : timeString + ":00"}`
  ).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function clearDateFilter() {
  selectedDate.value = "";
}

onMounted(fetchSlots);
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
  padding: 0.55rem 1.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-size: 1rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e3a8a;
}

.date-picker-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #3b82f6;
  border-radius: 9999px;
  padding: 0.3rem 1rem;
  gap: 0.5rem;
  background-color: white;
}

.custom-date-input {
  border: none;
  outline: none;
  font-weight: 600;
  font-size: 1rem;
  color: #1e293b;
  background: transparent;
}

.i-lucide-calendar {
  color: #1e3a8a;
  font-size: 1.2rem;
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
  transition: transform 0.2s;
}

.slot-item:hover {
  transform: scale(1.01);
}

.available {
  color: #16a34a;
  font-weight: 600;
}

.booked {
  color: #dc2626;
  font-weight: 600;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-edit,
.btn-delete {
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
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
