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
        <button class="refresh-button" @click="refreshBookings">
          🔄 รีเฟรช
        </button>
        <button class="history-button" @click="goToHistory">
          📜 ประวัติการจอง
        </button>
      </div>

      <h2 class="section-title">📋 ตารางการจองของคุณ (วันนี้)</h2>

      <table v-if="todayBookings.length > 0" class="slot-table">
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
          <tr v-for="booking in todayBookings" :key="booking.id" class="table-row">
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
                {{ booking.status.toUpperCase() === "CONFIRMED" ? "ยืนยันแล้ว" : "รออนุมัติ" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-bookings">ไม่มีการจองสำหรับวันนี้</p>

      <!-- Date Picker -->
      <div class="date-select-bar">
        <label class="date-label" for="datePicker">
          <span class="calendar-icon"></span> เลือกวันที่
        </label>
        <input
          id="datePicker"
          type="date"
          :min="minDate"
          v-model="selectedDate"
          class="date-input"
        />
      </div>

      <h2 class="section-title">
        📌 ตารางเวลาสำหรับวันที่ {{ formatDateDisplay(selectedDate) }}
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
                  {{ slot.status === "AVAILABLE" ? "ว่าง" : "จองแล้ว" }}
                </span>
              </td>
            </tr>
            <tr v-if="expandedSlotId === slot.id" class="expanded-row">
              <td colspan="4">
                <div v-for="sub in generateHourlySlotsWithOverlap(slot.startTime, slot.endTime, combinedBookings, slot.id)" :key="sub.label" class="sub-slot centered">
                  <div class="sub-slot-content">
                    <div class="time-label">🕒 {{ sub.label }}</div>
                    <span :class="sub.booked ? 'status-booked' : 'status-available'">
                      {{ sub.booked ? "จองแล้ว" : "ว่าง" }}
                    </span>
                  </div>
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
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const userName = ref("");
const userEmail = ref("");
const slots = ref([]);
const latestBooking = ref(null);
const confirmedBookings = ref([]);
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const minDate = selectedDate.value;
const expandedSlotId = ref(null);

definePageMeta({ layout: "user" });

function toggleSlotDetail(slotId) {
  expandedSlotId.value = expandedSlotId.value === slotId ? null : slotId;
}

function parseTimeRange(booking) {
  const startTimes = booking.bookingSlots.map((bs) => new Date(bs.startTime));
  const minStart = new Date(Math.min(...startTimes.map((d) => d.getTime())));
  const totalDuration =
    booking.bookingServices?.reduce(
      (sum, bs) => sum + (bs.service?.durationMinutes || 0),
      0
    ) || 0;
  const endTime = new Date(minStart.getTime() + totalDuration * 60000);

  return {
    start: minStart.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    end: endTime.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    duration: totalDuration,
  };
}

const combinedBookings = computed(() => {
  const enriched = [...confirmedBookings.value];
  if (
    latestBooking.value &&
    !enriched.find((b) => b.id === latestBooking.value.id)
  ) {
    enriched.push(latestBooking.value);
  }
  return enriched
    .map((b) => ({
      ...b,
      ...parseTimeRange(b),
    }))
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
});

const slotsOfSelectedDate = computed(() =>
  slots.value.filter((s) => s.date === selectedDate.value)
);

function generateHourlySlotsWithOverlap(slotStart, slotEnd, bookings, slotId) {
  const result = [];
  const start = new Date(slotStart);
  const end = new Date(slotEnd);

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

      const bookingStart = new Date(
        Math.min(
          ...booking.bookingSlots.map((bs) => new Date(bs.startTime).getTime())
        )
      );
      const totalDuration =
        booking.bookingServices?.reduce(
          (sum, bs) => sum + (bs.service?.durationMinutes || 0),
          0
        ) || 0;
      const bookingEnd = new Date(
        bookingStart.getTime() + totalDuration * 60000
      );

      return bookingStart < next && bookingEnd > start;
    });

    result.push({ label, booked: isBooked });
    start.setTime(next.getTime());
  }

  return result;
}

function goToBookingForm() {
  router.push("/user/bookingForm");
}

function formatTime(dateTime) {
  const d = new Date(dateTime);
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function fetchSlots() {
  const res = await fetch("http://localhost:3000/slots");
  const data = await res.json();
  slots.value = data.map((slot) => ({
    ...slot,
    date: getLocalDateString(new Date(slot.date)),
    startTime: new Date(`${slot.date}T${slot.startTime}:00`),
    endTime: new Date(`${slot.date}T${slot.endTime}:00`),
  }));
}

async function fetchAllBookings() {
  const res = await fetch("http://localhost:3000/bookings");
  const data = await res.json();
  confirmedBookings.value = data.filter((b) => b.status === "confirmed");
}

async function refreshBookings() {
  await fetchAllBookings();
  await fetchSlots();
}

onMounted(async () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  userName.value = userData.name || "ผู้ใช้";
  userEmail.value = userData.email || "-";

  await fetchSlots();
  await fetchAllBookings();

  const bookingId = route.query.bookingId;
  if (bookingId) {
    const res = await fetch(`http://localhost:3000/bookings/${bookingId}`);
    latestBooking.value = await res.json();
  }
});

watch(
  () => route.query,
  async () => {
    const bookingId = route.query.bookingId;
    if (bookingId) {
      const res = await fetch(`http://localhost:3000/bookings/${bookingId}`);
      latestBooking.value = await res.json();
      await fetchAllBookings(); // Refresh bookings when new booking is added
    }
  }
);

// เพิ่มใน <script setup>
const todayBookings = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  return combinedBookings.value.filter(
    (b) => b.bookingDate.slice(0, 10) === today
  );
});

function goToHistory() {
  router.push("/user/history");
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&display=swap");

.page-container {
  font-family: "Kanit", sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
  padding: 48px 16px;
}

.content-wrapper {
  max-width: 960px;
  margin: 0 auto;
  background: #ffffff;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 2.5rem 0 1.5rem;
  text-align: center;
}

.page-title {
  font-size: 1.4rem;
  color: #1e3a8a;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
}

.user-info {
  background: #eff6ff;
  padding: 0.8rem 1.2rem;
  border-radius: 16px;
  font-size: 0.95rem;
  color: #334155;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.1);
}

.action-bar {
  text-align: right;
  margin-bottom: 2rem;
}

.booking-button,
.refresh-button {
  font-family: "Kanit", sans-serif;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.booking-button {
  background: #2563eb;
  color: #ffffff;
}

.refresh-button {
  background: #64748b;
  color: #ffffff;
  margin-left: 0.75rem;
}

.booking-button:hover {
  background: #1d4ed8;
}

.refresh-button:hover {
  background: #475569;
}

.date-picker-wrapper {
  position: relative;
  width: 160px; /* ปรับให้แคบลง */
}

.date-label {
  font-size: 1 rem;
  font-weight: 500;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.date-label .calendar-icon {
  font-size: 1.1rem;
}

.date-input {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  border: 1.5px solid #2563eb;
  background-color: #fff;
  color: #1e293b;
  width: 160px;
  height: 34px;
  box-shadow: 0 0 0px 1px #bfdbfe;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.calendar-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  color: #1e3a8a;
  pointer-events: none;
}

.date-input {
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid #2563eb; /* เปลี่ยนจาก #cbd5e1 -> #2563eb เพื่อให้ชัดขึ้น */
  background-color: #ffffff;
  color: #1e293b;
  width: 260px;
  cursor: pointer;
  box-shadow: 0 0 0px 1px #bfdbfe; /* เพิ่มเงาฟ้าอ่อนรอบ input ให้เด่น */
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}


.date-input:focus {
  border-color: #1e40af;
  background-color: #eff6ff;
  box-shadow: 0 0 0 2px #93c5fd;
  outline: none;
}


input[type="date"]::-webkit-calendar-picker-indicator {
  filter: brightness(0) saturate(100%) invert(12%) sepia(70%) saturate(6883%) hue-rotate(209deg) brightness(90%) contrast(100%);
  cursor: pointer;
  height: 14px;
  width: 14px;
}

.no-bookings {
  text-align: center;
  font-style: italic;
  font-weight: 500;
  color: #94a3b8;
  padding: 1rem;
}

.slot-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.slot-table th,
.slot-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 500;
}

.slot-table th {
  background: #f1f5f9;
  color: #1e3a8a;
  font-weight: 600;
}

.slot-table td:nth-child(5) {
  text-align: left;
  vertical-align: top;
}

.service-list {
  padding: 0;
  margin: 0;
  list-style: none;
  text-align: left;
}

.service-list li {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.6;
}

.status-confirmed,
.status-pending,
.status-booked,
.status-available {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  display: inline-block;
  min-width: 64px;
  text-align: center;
}

.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-pending {
  background: #fef9c3;
  color: #92400e;
}

.status-booked {
  background: #fecaca;
  color: #b91c1c;
}

.status-available {
  background: #bbf7d0;
  color: #15803d;
}

.expanded-row td {
  padding: 0;
  background-color: #f8fafc;
  padding-top: 12px;
}

.sub-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: 100%;
  padding: 0.5rem 0;
}

.sub-slot-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 320px;
  padding: 0.8rem 1rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.sub-slot-content:hover {
  background: #e0f2fe;
}

.time-label {
  font-weight: 500;
  font-size: 0.85rem;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.date-select-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.6rem;
  flex-wrap: wrap;
  margin-top: 1.6rem;
}

/* ประวัติ */
/* เพิ่มใน .action-bar */
.history-button {
  font-family: "Kanit", sans-serif;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  background: #f59e0b;
  color: white;
  margin-left: 0.75rem;
}

.history-button:hover {
  background: #d97706;
}

</style>
