<template>
  <div class="page-container">
    <div class="content-wrapper">
      <h1 class="page-title">📅 หน้าจองคิว</h1>

      <section class="user-info">
        <p><strong>👤 ยินดีต้อนรับ:</strong> {{ userName }}</p>
        <p><strong>📧 อีเมล:</strong> {{ userEmail }}</p>
      </section>

      <div class="action-bar">
        <button class="booking-button" @click="goToBookingForm">+ จองเวลา</button>
      </div>

      <h2 class="section-title">เลือกวันที่</h2>
      <div class="date-picker-wrapper">
        <label class="date-input-label" for="datePicker">
          <svg xmlns="http://www.w3.org/2000/svg" class="calendar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            id="datePicker"
            type="date"
            :min="minDate"
            v-model="selectedDate"
            @change="onDateChange"
            class="date-input"
          />
        </label>
      </div>

      <h2 class="section-title">🧾 ตารางเวลาสำหรับวันที่ {{ formatDateDisplay(selectedDate) }}</h2>

      <table v-if="slotsOfSelectedDate.length > 0" class="slot-table">
        <thead>
          <tr>
            <th>ชื่อ Slot</th>
            <th>เวลาเริ่ม</th>
            <th>เวลาสิ้นสุด</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in slotsOfSelectedDate" :key="slot.id">
            <td>{{ slot.slotName }}</td>
            <td>{{ formatTime(slot.startTime) }}</td>
            <td>{{ formatTime(slot.endTime) }}</td>
            <td>
              <span :class="slot.status === 'AVAILABLE' ? 'available' : 'booked'">
                {{ slot.status === 'AVAILABLE' ? 'ว่าง' : 'จองแล้ว' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-bookings">ไม่มี Slot สำหรับวันที่เลือก</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

definePageMeta({
  layout: 'user',
})

const router = useRouter();

const userName = ref("");
const userEmail = ref("");
const slots = ref([]);

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const minDate = getLocalDateString(today);
const selectedDate = ref(minDate);

onMounted(async () => {
  const userData = localStorage.getItem("userData");
  if (userData) {
    const user = JSON.parse(userData);
    userName.value = user.name || "ผู้ใช้";
    userEmail.value = user.email || "-";
  }
  await fetchSlots();
});

async function fetchSlots() {
  try {
    const res = await fetch("http://localhost:3000/slots");
    if (!res.ok) throw new Error("Failed to fetch slots");
    const data = await res.json();
    slots.value = data.filter(slot => {
      if (!slot.date) return false;
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      const todayMidnight = new Date(today);
      todayMidnight.setHours(0, 0, 0, 0);
      return slotDate >= todayMidnight;
    });
    slots.value.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  } catch (error) {
    console.error(error);
  }
}

function goToBookingForm() {
  router.push("/user/bookingForm");
}

function formatDateDisplay(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateTimeString) {
  if (!dateTimeString) return "-";
  const d = new Date(dateTimeString);
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const slotsOfSelectedDate = computed(() => {
  return slots.value.filter(slot => {
    if (!slot.date) return false;
    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate.value);
    selected.setHours(0, 0, 0, 0);
    return slotDate.getTime() === selected.getTime();
  });
});

function onDateChange(e) {
  // อาจเพิ่มฟังก์ชันถ้าต้องการอะไรพิเศษตอนเปลี่ยนวันที่
}
</script>

<style scoped>
.page-container {
  background-color: #ffffff;
  min-height: 100vh;
  padding: 2rem 1rem;
  font-family: "Sarabun", sans-serif;
  color: #2c3e50;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fafafa;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
}

.page-title {
  font-size: 2rem;
  color: #34495e;
  margin-bottom: 2rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.02em;
}

.user-info {
  background-color: #e9f1f7;
  padding: 1rem 1.3rem;
  border-radius: 10px;
  margin-bottom: 1.8rem;
  font-size: 1rem;
  color: #34495e;
  box-shadow: inset 0 0 5px rgba(52, 73, 94, 0.1);
}

.action-bar {
  text-align: right;
  margin-bottom: 1.8rem;
}

.booking-button {
  background-color: #3498db;
  color: white;
  padding: 0.55rem 1.4rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.booking-button:hover {
  background-color: #2980b9;
  box-shadow: 0 6px 14px rgba(41, 128, 185, 0.4);
}

.section-title {
  font-size: 1.3rem;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 1.5px solid #3498db;
  padding-bottom: 0.2rem;
}

.date-picker-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.8rem;
}

.date-input-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1.8px solid #3498db;
  border-radius: 10px;
  padding: 0.4rem 1rem 0.4rem 2.8rem;
  background-color: #ecf6fc;
  box-shadow: 0 3px 8px rgba(52, 152, 219, 0.15);
  cursor: pointer;
  max-width: 260px;
  width: 100%;
  transition: border-color 0.3s ease;
}

.date-input-label:hover {
  border-color: #2980b9;
}

.calendar-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: #3498db;
  pointer-events: none;
}

.date-input {
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  width: 100%;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: 0.25rem 0;
}

.date-input:focus {
  outline: none;
  box-shadow: 0 0 6px #3498db;
}

.slot-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #dce6ef;
  font-size: 1rem;
  margin-top: 0.8rem;
}

.slot-table th,
.slot-table td {
  padding: 0.7rem 1rem;
  border: 1px solid #dce6ef;
  text-align: center;
  vertical-align: middle;
  color: #34495e;
}

.slot-table thead {
  background-color: #d6e9fc;
  color: #2c3e50;
  font-weight: 600;
}

.available {
  color: #27ae60;
  font-weight: 600;
}

.booked {
  color: #c0392b;
  font-weight: 600;
}

.no-bookings {
  margin-top: 1rem;
  font-style: italic;
  text-align: center;
  color: #7f8c8d;
  font-weight: 500;
}
</style>
