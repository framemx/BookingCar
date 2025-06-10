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
            <th>ช่องบริการ</th>
            <th>เวลาเริ่ม</th>
            <th>เวลาสิ้นสุด</th>
            <th>ระยะเวลา</th>
            <th>รายการบริการ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="booking in todayBookings"
            :key="booking.id"
            class="table-row"
          >
            <td>{{ formatDateDisplay(booking.bookingDate) }}</td>
            <td>{{ booking.bookingSlots[0].slot.slotName }}</td>
            <td>{{ booking.start }}</td>
            <td>{{ booking.end }}</td>
            <td>{{ formatDuration(booking.duration) }}</td>
            <td>
              <ul class="service-list">
                <li v-for="bs in booking.bookingServices" :key="bs.service.id">
                  {{ bs.service.sName }}
                </li>
              </ul>
            </td>
            <td>
              <span
                :class="
                  booking.status.toUpperCase() === 'CONFIRMED'
                    ? 'status-confirmed'
                    : 'status-pending'
                "
              >
                {{
                  booking.status.toUpperCase() === "CONFIRMED"
                    ? "ยืนยันแล้ว"
                    : "รออนุมัติ"
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-bookings">ไม่มีการจองสำหรับวันนี้</p>

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
                <span
                  :class="
                    slot.status === 'AVAILABLE'
                      ? 'status-available'
                      : 'status-booked'
                  "
                >
                  {{ slot.status === "AVAILABLE" ? "ว่าง" : "จองแล้ว" }}
                </span>
              </td>
            </tr>
            <tr v-if="expandedSlotId === slot.id" class="expanded-row">
              <td colspan="4">
                <div
                  v-for="sub in generateHourlySlotsWithOverlap(
                    slot.startTime,
                    slot.endTime,
                    allConfirmedBookings,
                    slot.id
                  )"
                  :key="sub.label"
                >
                  <div class="sub-slot-content">
                    <div class="time-label">🕒 {{ sub.label }}</div>
                    <span
                      :class="sub.booked ? 'status-booked' : 'status-available'"
                    >
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
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const userName = ref("");
const userEmail = ref("");
const slots = ref([]);
const latestBooking = ref(null);
const userBookings = ref([]);
const selectedDate = ref("");
const minDate = ref("");
const expandedSlotId = ref(null);
const allConfirmedBookings = ref([]);

let dateUpdateInterval = null;

definePageMeta({ layout: "user" });

function getCurrentDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateCurrentDate() {
  const currentDate = getCurrentDateString();
  selectedDate.value = currentDate;
  minDate.value = currentDate;
}

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
  const enriched = [...userBookings.value];
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
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const authToken = localStorage.getItem("authToken");
    const token = userData.token || authToken;
    if (!token) {
      router.push("/");
      return;
    }
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch("http://localhost:3000/bookings", { headers }); // เปลี่ยนจาก /slots เป็น /bookings
    if (!res.ok) {
      const errorData = await res.json();
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        router.push("/");
        return;
      }
      throw new Error(`ข้อผิดพลาด HTTP! สถานะ: ${res.status} - ${errorData.message || ''}`);
    }
    const data = await res.json();
    slots.value = Array.isArray(data) ? data.map((slot) => ({
      ...slot,
      date: getLocalDateString(new Date(slot.date)),
      startTime: new Date(`${slot.date}T${slot.startTime}:00`),
      endTime: new Date(`${slot.date}T${slot.endTime}:00`),
    })) : [];
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึง slots:", error);
    slots.value = [];
  }
}

async function fetchAllBookings() {
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const token = userData.token;
    if (!token) {
      router.push("/"); // เปลี่ยนไปหน้าโฮม (index.vue ซึ่งเป็นหน้า Login)
      return;
    }
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(
      `http://localhost:3000/bookings?userEmail=${userData.email}`,
      { headers }
    );
    if (!res.ok) throw new Error(`ข้อผิดพลาด HTTP! สถานะ: ${res.status}`);
    const data = await res.json();
    userBookings.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึง bookings:", error);
    userBookings.value = [];
  }
}

async function refreshBookings() {
  updateCurrentDate();
  await fetchAllBookings();
  await fetchSlots();
  await fetchConfirmedBookingsForSlots();
}

onMounted(async () => {
  updateCurrentDate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const token = userData.token || localStorage.getItem("authToken"); // ตรวจสอบทั้งสองตำแหน่ง
  if (!token) {
    router.push("/");
    return;
  }
  userName.value = userData.name || "ผู้ใช้";
  userEmail.value = userData.email || "-";

  await fetchSlots();
  await fetchAllBookings();
  await fetchConfirmedBookingsForSlots();

  const bookingId = route.query.bookingId;
  if (bookingId) {
    try {
      const res = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      latestBooking.value = await res.json();
    } catch (error) {
      console.error("ข้อผิดพลาดในการดึง booking ล่าสุด:", error);
      latestBooking.value = null;
    }
  }

  dateUpdateInterval = setInterval(updateCurrentDate, 60000);
});

onUnmounted(() => {
  if (dateUpdateInterval) {
    clearInterval(dateUpdateInterval);
  }
});

watch(
  () => route.query,
  async () => {
    const bookingId = route.query.bookingId;
    if (bookingId) {
      try {
        const res = await fetch(`http://localhost:3000/bookings/${bookingId}`);
        latestBooking.value = await res.json();
        await fetchAllBookings();
      } catch (error) {
        console.error("Error fetching booking by ID:", error);
        latestBooking.value = null;
      }
    }
  }
);

const todayBookings = computed(() => {
  const today = getCurrentDateString();
  return combinedBookings.value.filter(
    (b) => b.bookingDate.slice(0, 10) === today
  );
});

function goToHistory() {
  router.push("/user/history");
}

async function fetchConfirmedBookingsForSlots() {
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const token = userData.token;
    if (!token) {
      router.push("/"); // เปลี่ยนไปหน้าโฮม (index.vue ซึ่งเป็นหน้า Login)
      return;
    }
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch("http://localhost:3000/bookings", { headers });
    if (!res.ok) throw new Error(`ข้อผิดพลาด HTTP! สถานะ: ${res.status}`);
    const data = await res.json();
    allConfirmedBookings.value = Array.isArray(data) ? data.filter((b) => b.status === "confirmed") : [];
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึง confirmed bookings:", error);
    allConfirmedBookings.value = [];
  }
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} นาที`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ชม.`;
  } else {
    return `${hours} ชม. ${remainingMinutes} นาที`;
  }
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
.refresh-button,
.history-button {
  font-family: "Kanit", sans-serif;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  margin-left: 0.75rem;
}

.booking-button {
  background: #2563eb;
  color: #ffffff;
}

.refresh-button {
  background: #64748b;
  color: #ffffff;
}

.history-button {
  background: #f59e0b;
  color: #ffffff;
}

.booking-button:hover {
  background: #1d4ed8;
}

.refresh-button:hover {
  background: #475569;
}

.history-button:hover {
  background: #d97706;
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

.date-label {
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.date-input {
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.6rem 1rem;
  border-radius: 9999px;
  border: 1px solid #2563eb;
  background-color: #ffffff;
  color: #1e293b;
  width: 260px;
  cursor: pointer;
  box-shadow: 0 0 0px 1px #bfdbfe;
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
  vertical-align: middle;
}

.slot-table th {
  background: #f1f5f9;
  color: #1e3a8a;
  font-weight: 600;
}

.slot-table td:nth-child(6) {
  text-align: left;
  vertical-align: top;
  max-width: 200px;
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
  padding: 2px 0;
  border-left: 3px solid #3b82f6;
  padding-left: 8px;
  margin-bottom: 4px;
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
  padding: 1rem 0 0.5rem;
  background-color: #f8fafc;
}

.sub-slot-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.sub-slot-content:hover {
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.time-label {
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
}
</style>