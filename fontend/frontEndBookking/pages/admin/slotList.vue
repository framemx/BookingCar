<template>
  <div class="container">
    <h2>รายการ Slot ทั้งหมด</h2>

    <div class="action-bar">
      <button class="btn-manage-slot" @click="goToSlotManagement">จัดการ Slot</button>
    </div>

    <div v-if="loading" class="loading">กำลังโหลดข้อมูล...</div>
    <div v-else-if="slots.length === 0" class="empty">ไม่มีข้อมูล Slot</div>

    <div v-else class="slot-list">
      <div
        v-for="(slot, index) in slots"
        :key="slot.id"
        class="slot-item"
      >
        <p><strong>ชื่อ Slot:</strong> {{ slot.slotName || "ไม่มีชื่อ" }}</p>
        <p><strong>วันที่:</strong> {{ slot.date ? formatDate(slot.date) : "ไม่มีวันที่" }}</p>
        <p><strong>เวลาเริ่ม:</strong> {{ slot.startTime ? formatTime(slot.startTime) : "ไม่มีเวลาเริ่ม" }}</p>
        <p><strong>เวลาสิ้นสุด:</strong> {{ slot.endTime ? formatTime(slot.endTime) : "ไม่มีเวลาสิ้นสุด" }}</p>
        <p>
          <strong>สถานะ:</strong>
          <span :class="slot.status === 'AVAILABLE' ? 'available' : 'booked'">
            {{ slot.status || "ไม่ระบุสถานะ" }}
          </span>
        </p>

        <div class="btn-group">
          <button class="btn-edit" @click="editSlot(slot.id)">แก้ไข</button>
          <button class="btn-delete" @click="deleteSlot(slot.id)">ลบ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

definePageMeta({ layout: "admin" });

const slots = ref([]);
const loading = ref(false);

const router = useRouter();

function goToSlotManagement() {
  router.push("/admin/slotManagement");
}

function editSlot(slotId) {
  // ไปหน้าแก้ไข slot โดยส่ง slotId ไป
  router.push(`/admin/slotManagement/${slotId}`);
}

async function deleteSlot(slotId) {
  if (!confirm("คุณแน่ใจว่าต้องการลบ Slot นี้?")) return;

  try {
    const res = await fetch(`http://localhost:3000/slots/${slotId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("ลบ Slot ไม่สำเร็จ");

    // ลบออกจาก list ทันที (ไม่ต้อง reload ทั้งหน้า)
    slots.value = slots.value.filter((slot) => slot.id !== slotId);
    alert("ลบ Slot เรียบร้อยแล้ว");
  } catch (error) {
    alert(error.message);
  }
}

async function fetchSlots() {
  loading.value = true;
  try {
    const res = await fetch("http://localhost:3000/slots");
    if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
    const data = await res.json();
    slots.value = data;
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(time) {
  return new Date(time).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  user-select: none;
}

.btn-manage-slot:hover {
  background: linear-gradient(135deg, #4338ca, #2563eb);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.6);
  transform: translateY(-2px);
}

.btn-manage-slot:active {
  background: linear-gradient(135deg, #3730a3, #1e40af);
  box-shadow: 0 4px 8px rgba(30, 64, 175, 0.7);
  transform: translateY(1px);
}

.loading,
.empty {
  text-align: center;
  font-size: 1.1rem;
  color: #64748b;
  margin-top: 2rem;
}

.slot-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.slot-item {
  background: #f9fafb;
  padding: 1.4rem 1.6rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

.slot-item p {
  margin: 0.25rem 0;
  font-size: 1rem;
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
  margin-top: 1rem;
  display: flex;
  gap: 0.8rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background-color: #2563eb;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  background-color: #dc2626;
}
</style>
