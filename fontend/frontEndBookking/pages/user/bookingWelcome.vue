<template>
  <div class="page-container">
    <div class="content-wrapper">
      <h1 class="page-title">📅 หน้าจองคิว</h1>

      <section class="user-info">
        <p><strong>👤 ยินดีต้อนรับ:</strong> {{ userName }}</p>
        <p><strong>📧 อีเมล:</strong> {{ userEmail }}</p>
      </section>

      <div class="action-bar">
        <button class="booking-button" @click="goToBookingForm">
          + จองเวลา
        </button>
        <button class="refresh-button" @click="refreshBookings">🔄 รีเฟรช</button>
      </div>

      <h2 class="section-title">📋 ตารางการจองของคุณ</h2>

      <table v-if="combinedBookings.length > 0" class="slot-table">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>เวลาเริ่ม</th>
            <th>เวลาสิ้นสุด</th>
            <th>ระยะเวลา</th>
            <th>รายการบริการ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in combinedBookings" :key="booking.id" class="table-row">
            <td>{{ formatDateDisplay(booking.bookingDate) }}</td>
            <td>{{ booking.start }}</td>
            <td>{{ booking.end }}</td>
            <td>{{ booking.duration }} นาที</td>
            <td>
              <ul class="service-list">
                <li v-for="bs in booking.bookingServices" :key="bs.service.id">
                  {{ bs.service.sName }}
                </li>
              </ul>
            </td>
            <td>
              <span :class="booking.status.toUpperCase() === 'CONFIRMED' ? 'status-confirmed' : 'status-pending'">
                {{ booking.status.toUpperCase() === 'CONFIRMED' ? 'ยืนยันแล้ว' : 'รออนุมัติ' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-bookings">คุณยังไม่มีการจอง</p>

      <h2 class="section-title">เลือกวันที่</h2>
      <div class="date-picker-wrapper">
        <label class="date-input-label" for="datePicker">
          <input id="datePicker" type="date" :min="minDate" v-model="selectedDate" class="date-input" />
          <span class="calendar-icon">📅</span>
        </label>
      </div>

      <h2 class="section-title">
        📎 ตารางเวลาสำหรับวันที่ {{ formatDateDisplay(selectedDate) }}
      </h2>

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
          <template v-for="slot in slotsOfSelectedDate" :key="slot.id">
            <tr @click="toggleSlotDetail(slot.id)" class="table-row slot-row">
              <td>{{ slot.slotName }}</td>
              <td>{{ formatTime(slot.startTime) }}</td>
              <td>{{ formatTime(slot.endTime) }}</td>
              <td>
                <span :class="slot.status === 'AVAILABLE' ? 'status-available' : 'status-booked'">
                  {{ slot.status === 'AVAILABLE' ? 'ว่าง' : 'จองแล้ว' }}
                </span>
              </td>
            </tr>
            <tr v-if="expandedSlotId === slot.id" class="expanded-row">
              <td colspan="4">
                <div
                  v-for="sub in generateHourlySlotsWithOverlap(slot.startTime, slot.endTime, combinedBookings, slot.id)"
                  :key="sub.label"
                  class="sub-slot">
                  🕒 {{ sub.label }} -
                  <span :class="sub.booked ? 'status-booked' : 'status-available'">
                    {{ sub.booked ? 'จองแล้ว' : 'ว่าง' }}
                  </span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <p v-else class="no-bookings">ไม่มี Slot สำหรับวันที่เลือก</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const userName = ref('');
const userEmail = ref('');
const slots = ref([]);
const latestBooking = ref(null);
const userBookings = ref([]);
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const minDate = selectedDate.value;
const expandedSlotId = ref(null);

definePageMeta({ layout: 'user' });

function toggleSlotDetail(slotId) {
  expandedSlotId.value = expandedSlotId.value === slotId ? null : slotId;
}

function parseTimeRange(booking) {
  const startTimes = booking.bookingSlots.map(bs => new Date(bs.startTime));
  const minStart = new Date(Math.min(...startTimes.map(d => d.getTime())));
  const totalDuration = booking.bookingServices?.reduce((sum, bs) => sum + (bs.service?.durationMinutes || 0), 0) || 0;
  const endTime = new Date(minStart.getTime() + totalDuration * 60000);

  return {
    start: minStart.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    end: endTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    duration: totalDuration
  };
}

const combinedBookings = computed(() => {
  const enriched = [...userBookings.value];
  if (latestBooking.value && !enriched.find(b => b.id === latestBooking.value.id)) {
    enriched.push(latestBooking.value);
  }
  return enriched
    .map(b => ({
      ...b,
      ...parseTimeRange(b)
    }))
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
});

const slotsOfSelectedDate = computed(() =>
  slots.value.filter(s => s.date === selectedDate.value)
);

function generateHourlySlotsWithOverlap(startDate, endDate, bookings, slotId) {
  const result = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  while (start < end) {
    const next = new Date(start.getTime() + 60 * 60 * 1000);
    const label = `${start.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} - ${next.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;

    const isBooked = bookings.some((booking) => {
      if (
        booking.status !== "confirmed" ||
        !booking.bookingSlots?.some((bs) => bs.slotId === slotId)
      ) {
        return false;
      }

      const startTime = new Date(
        Math.min(...booking.bookingSlots.map((bs) => new Date(bs.startTime).getTime()))
      );
      const totalDuration =
        booking.bookingServices?.reduce(
          (sum, bs) => sum + (bs.service?.durationMinutes || 0),
          0
        ) || 0;
      const endTime = new Date(startTime.getTime() + totalDuration * 60000);

      return startTime < next && endTime > start;
    });

    result.push({ label, booked: isBooked });
    start.setTime(next.getTime());
  }

  return result;
}

function goToBookingForm() {
  router.push('/user/bookingForm');
}

function formatTime(dateTime) {
  const d = new Date(dateTime);
  return d.toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function fetchSlots() {
  const res = await fetch('http://localhost:3000/slots');
  const data = await res.json();
  slots.value = data.map(slot => ({
    ...slot,
    date: getLocalDateString(new Date(slot.date)),
    startTime: new Date(`${slot.date}T${slot.startTime}:00`),
    endTime: new Date(`${slot.date}T${slot.endTime}:00`)
  }));
}

async function fetchAllBookings() {
  const res = await fetch('http://localhost:3000/bookings');
  const data = await res.json();
  userBookings.value = data.filter(b => b.user?.email === userEmail.value);
}

async function refreshBookings() {
  await fetchAllBookings();
  await fetchSlots();
}

onMounted(async () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  userName.value = userData.name || 'ผู้ใช้';
  userEmail.value = userData.email || '-';

  await fetchSlots();
  await fetchAllBookings();

  const bookingId = route.query.bookingId;
  if (bookingId) {
    const res = await fetch(`http://localhost:3000/bookings/${bookingId}`);
    latestBooking.value = await res.json();
  }
});

watch(() => route.query, async () => {
  const bookingId = route.query.bookingId;
  if (bookingId) {
    const res = await fetch(`http://localhost:3000/bookings/${bookingId}`);
    latestBooking.value = await res.json();
    await fetchAllBookings(); // Refresh bookings when new booking is added
  }
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 2.5rem 1rem;
  font-family: "Sarabun", sans-serif;
  color: #2c3e50;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.1);
}

.page-title {
  font-size: 2.5rem;
  color: #1e3a8a;
  margin-bottom: 2.5rem;
  font-weight: 700;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  letter-spacing: 0.02em;
}

.user-info {
  background: #eff6ff;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #34495e;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.1);
  transition: transform 0.2s;
}

.user-info:hover {
  transform: translateY(-2px);
}

.user-info p {
  margin: 0.5rem 0;
}

.action-bar {
  text-align: right;
  margin-bottom: 2rem;
}

.booking-button {
  background: #1e3a8a;
  color: #ffffff;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s;
}

.refresh-button {
  background: #4b5563;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(75, 85, 99, 0.3);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s;
  margin-left: 1rem;
}

.booking-button:hover {
  background: #1d4ed8;
  box-shadow: 0 6px 16px rgba(29, 78, 216, 0.4);
  transform: translateY(-2px);
}

.refresh-button:hover {
  background: #374151;
  box-shadow: 0 6px 16px rgba(55, 65, 81, 0.4);
  transform: translateY(-2px);
}

.section-title {
  font-size: 1.5rem;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: #1e3a8a;
  font-weight: 600;
  border-bottom: 2px solid #bfdbfe;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-picker-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.date-input-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 2px solid #1e3a8a;
  border-radius: 10px;
  padding: 0.5rem 1rem 0.5rem 3rem;
  background: #f9fafb;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
  max-width: 280px;
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.date-input-label:hover {
  border-color: #1d4ed8;
  box-shadow: 0 4px 16px rgba(29, 78, 216, 0.2);
}

.calendar-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  color: #1e3a8a;
  pointer-events: none;
  transition: color 0.2s;
}

.date-input {
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  width: 100%;
  cursor: pointer;
  padding: 0.25rem 0;
}

.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.date-input:focus {
  outline: none;
}

.date-input:hover + .calendar-icon,
.date-input:focus + .calendar-icon {
  color: #1d4ed8;
}

.slot-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 1rem;
  margin-top: 1rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.slot-table th,
.slot-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  text-align: center;
  vertical-align: middle;
  color: #34495e;
}

.slot-table th {
  background: #eff6ff;
  color: #1e3a8a;
  font-weight: 600;
  border-bottom: 2px solid #bfdbfe;
}

.table-row {
  transition: background-color 0.2s;
}

.slot-row {
  cursor: pointer;
}

.table-row:hover {
  background: #f9fafb;
}

.expanded-row {
  background: #f9fafb;
}

.sub-slot {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  color: #34495e;
  border-top: 1px solid #e5e7eb;
}

.service-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.service-list li {
  padding: 0.25rem 0;
  font-size: 0.95rem;
}

.status-confirmed,
.status-available {
  color: #10b981;
  font-weight: 600;
  background: #ecfdf5;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  display: inline-block;
}

.status-pending,
.status-booked {
  color: #f59e0b;
  font-weight: 600;
  background: #fefce8;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  display: inline-block;
}

.no-bookings {
  text-align: center;
  padding: 1.5rem;
  color: #7f8c8d;
  font-style: italic;
  font-weight: 500;
}
</style>