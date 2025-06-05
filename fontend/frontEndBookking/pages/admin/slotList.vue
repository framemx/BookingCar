<template>
  <div class="container">
    <h2>รายการ Slot ทั้งหมด</h2>

    <div class="action-bar">
      <button class="btn-manage-slot" @click="goToSlotManagement">
        จัดการ Slot
      </button>
    </div>

    <!-- ปฏิทินเลือกวันที่ -->
    <div class="filter-bar">
      <label for="filterDate">เลือกวันที่:</label>
      <input type="date" id="filterDate" v-model="selectedDate" />
      <button v-if="selectedDate" @click="clearDateFilter">ล้างตัวกรอง</button>
    </div>

    <div v-if="loading" class="loading">กำลังโหลดข้อมูล...</div>
    <div v-else-if="filteredSlots.length === 0" class="empty">ไม่มีข้อมูล Slot สำหรับวันที่เลือก</div>

    <div v-else class="slot-list">
      <div v-for="(slot, index) in filteredSlots" :key="slot.id" class="slot-item">
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

    <!-- Edit Slot Dialog -->
    <dialog ref="editDialog" class="edit-dialog">
      <form @submit.prevent="saveEdit">
        <h3>แก้ไขข้อมูล Slot</h3>

        <label>
          ชื่อ Slot:
          <input type="text" v-model="editSlotData.slotName" required />
        </label>

        <label>
          วันที่:
          <input type="date" v-model="editSlotData.date" required />
        </label>

        <label>
          เวลาเริ่ม:
          <input type="time" v-model="editSlotData.startTime" required />
        </label>

        <label>
          เวลาสิ้นสุด:
          <input type="time" v-model="editSlotData.endTime" required />
        </label>

        <label>
          สถานะ:
          <select v-model="editSlotData.status" required>
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

// ตัวแปรเก็บวันที่ที่เลือกเพื่อกรอง
const selectedDate = ref("");

// กรอง slot ตามวันที่เลือก (ถ้าไม่มีเลือก แสดงทั้งหมด)
const filteredSlots = computed(() => {
  if (!selectedDate.value) return slots.value;
  return slots.value.filter((slot) => slot.date === selectedDate.value);
});

function goToSlotManagement() {
  router.push("/admin/slotManagement");
}

function openEditDialog(slot) {
  editSlotData.value = {
    id: slot.id,
    slotName: slot.slotName || "",
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status || "AVAILABLE",
  };
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
    if (start >= end) {
      throw new Error("เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด");
    }

    const payload = {
      slotName: editSlotData.value.slotName,
      date: date,
      startTime: startTime,
      endTime: endTime,
      status: editSlotData.value.status,
    };

    const res = await fetch(
      `http://localhost:3000/slots/${editSlotData.value.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok)
      throw new Error((await res.json()).error || "แก้ไข Slot ไม่สำเร็จ");

    const updatedIndex = slots.value.findIndex(
      (s) => s.id === editSlotData.value.id
    );
    if (updatedIndex !== -1)
      slots.value[updatedIndex] = { id: editSlotData.value.id, ...payload };

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
    const res = await fetch("http://localhost:3000/slots");
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

  let normalizedTime = timeString;

  if (/^\d{4}$/.test(timeString)) {
    normalizedTime = timeString.slice(0, 2) + ":" + timeString.slice(2);
  }

  const fullTimeString =
    normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;

  try {
    const time = new Date(`1970-01-01T${fullTimeString}`);
    if (isNaN(time.getTime())) return "เวลาผิดพลาด";

    return time.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "เวลาผิดพลาด";
  }
}

// เคลียร์ตัวกรองวันที่
function clearDateFilter() {
  selectedDate.value = "";
}

onMounted(fetchSlots);
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-family: "Sarabun", sans-serif;
  color: #1e293b;
}

h2 {
  text-align: center;
  color: #2563eb;
  font-weight: 700;
  margin-bottom: 1.8rem;
}

.action-bar {
  text-align: right;
  margin-bottom: 1.5rem;
}

.btn-manage-slot {
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  padding: 0.7rem 1.8rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.filter-bar {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
}

.loading,
.empty {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #475569;
}

.slot-list {
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

.slot-item {
  padding: 1rem 1.4rem;
  border-radius: 12px;
  box-shadow: 0 0 10px #cbd5e1;
  font-size: 1.1rem;
}

.slot-item p {
  margin-bottom: 0.5rem;
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
  margin-top: 0.9rem;
}

.btn-edit,
.btn-delete {
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 0.45rem 1rem;
  border: none;
  cursor: pointer;
  margin-right: 0.6rem;
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
  z-index: 9999;
  width: 100%;
  max-width: 460px;
  padding: 2rem 2.5rem;
  border: none;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}


.edit-dialog::backdrop {
  background: rgba(0, 0, 0, 0.35);
}

.edit-dialog form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.edit-dialog label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: #1e293b;
}

.edit-dialog input[type="text"],
.edit-dialog input[type="date"],
.edit-dialog input[type="time"],
.edit-dialog select {
  margin-top: 0.3rem;
  padding: 0.45rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-save {
  background-color: #16a34a;
  color: white;
  font-weight: 700;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 10px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #6b7280;
  color: white;
  font-weight: 700;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 10px;
  cursor: pointer;
}
.filter-bar {
  margin-bottom: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: #334155; /* สีเข้มหน่อย */
  user-select: none;
}

.filter-bar label {
  white-space: nowrap;
}

.filter-bar input[type="date"] {
  padding: 0.5rem 0.8rem;
  border-radius: 12px;
  border: 2px solid #3b82f6; /* สีฟ้า */
  box-shadow: 0 2px 6px rgb(59 130 246 / 0.3);
  font-size: 1.05rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.filter-bar input[type="date"]:focus {
  outline: none;
  border-color: #2563eb; /* ฟ้าหน้าเข้มขึ้นเวลาตั้งค่า */
  box-shadow: 0 0 8px #2563eb;
}

.filter-bar button {
  background-color: #ef4444; /* สีแดงสด */
  border: none;
  border-radius: 12px;
  padding: 0.45rem 1.1rem;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 6px rgb(239 68 68 / 0.4);
  transition: background-color 0.25s ease;
  user-select: none;
}

.filter-bar button:hover {
  background-color: #dc2626;
}

.filter-bar button:active {
  box-shadow: none;
}
/* ปรับ popup แก้ไข slot */
.edit-dialog::backdrop {
  background: rgba(0, 0, 0, 0.35);
}

.edit-dialog {
  width: 100%;
  max-width: 460px;
  border: none;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  background-color: #ffffff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
}



.edit-dialog h3 {
  font-size: 1.4rem;
  color: #2563eb;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
}

.edit-dialog form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.edit-dialog label {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.edit-dialog input[type="text"],
.edit-dialog input[type="date"],
.edit-dialog input[type="time"],
.edit-dialog select {
  margin-top: 0.4rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background-color: #f9fafb;
  transition: border-color 0.3s ease;
  font-size: 1rem;
}

.edit-dialog input:focus,
.edit-dialog select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.dialog-buttons button {
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.btn-save {
  background-color: #22c55e;
  color: white;
}

.btn-save:hover {
  background-color: #16a34a;
}

.btn-cancel {
  background-color: #e2e8f0;
  color: #1e293b;
}

.btn-cancel:hover {
  background-color: #cbd5e1;
}

</style>
