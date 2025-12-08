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
            <th>เริ่ม</th>
            <th>สิ้นสุด</th>
            <th>ระยะเวลา</th>
            <th>บริการ</th>
            <th>สถานะ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="booking in todayBookings" :key="booking.id">
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
        <label class="date-label">เลือกวันที่</label>
        <input
          type="date"
          :min="minDate"
          v-model="selectedDate"
          class="date-input"
        />
      </div>

      <h2 class="section-title">
        📌 ตารางเวลาสำหรับวันที่ {{ formatDateDisplay(selectedDate) }} </h2>

      <table v-if="slotsOfSelectedDate.length > 0" class="slot-table">
        <thead>
          <tr>
            <th>ชื่อ Slot</th>
            <th>เริ่ม</th>
            <th>สิ้นสุด</th>
            <th>สถานะ</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="slot in slotsOfSelectedDate" :key="slot.id">
            <tr @click="toggleSlot(slot.id)" style="cursor: pointer">
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

                <span style="margin-left: 12px">
                  {{ expandedSlot === slot.id ? "▲" : "▼" }}
                </span>
              </td>
            </tr>

            <tr v-if="expandedSlot === slot.id" class="expanded-row">
              <td colspan="4">
                <div
                  v-for="time in slot.timeRanges"
                  :key="time.start"
                  class="sub-slot-content"
                >
                  <span class="time-label">
                    {{ time.start }} - {{ time.end }}
                  </span>
                  <span
                    :style="{
                      color: time.status === 'จองแล้ว' ? 'red' : 'green',
                    }"
                  >
                    {{ time.status }}
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

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";

/* ---------------- AUTH ---------------- */
definePageMeta({
  layout: "user",
  middleware: ["user"],
});

const router = useRouter();

const userId = useCookie("id").value;
const userEmail = ref(useCookie("email").value || "-");
const userName = ref(useCookie("name").value || "ผู้ใช้");

if (!userId) {
  alert("กรุณาเข้าสู่ระบบใหม่");
  router.push("/");
}

/* ---------------- STATE ---------------- */
const slots = ref<any[]>([]);
const userBookings = ref<any[]>([]);
const allBookings = ref<any[]>([]);
const selectedDate = ref("");
const minDate = ref("");
const expandedSlot = ref<number | null>(null);

/* ---------------- HELPERS ---------------- */

// แปลง ISO → เวลาไทย
function toThaiTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("th-TH", {
    // แสดงชั่วโมงเป็นตัวเลข 2 หลัก (เช่น 09, 15)
    hour: "2-digit", 
    // แสดงนาทีเป็นตัวเลข 2 หลัก (เช่น 05, 30)
    minute: "2-digit",
  });
}

// "ห่อ” ฟังก์ชัน toThaiTime อีกที
// เพื่อให้โค้ดอ่านง่ายขึ้นเวลาเรียกใช้
function formatTime(dt: string) {
  return toThaiTime(dt);
}

// แสดงวันที่เป็นไทย เช่น "วันอาทิตย์ที่ 6 ธันวาคม 2568"
function formatDateDisplay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ใช้ในหน้าเพื่อเช็คว่า "วันนี้คือวันอะไร"
// ใช้กำหนดค่า default ของ selectedDate (ใน onMounted)
const todayDate = new Date().toISOString().slice(0, 10);

// แปลง “จำนวนเวลาเป็นนาที” ให้เป็นข้อความอ่านง่าย
function formatDuration(min: number) {
  if (!min) return "0 นาที";

  if (min < 60) return `${min} นาที`;

  const h = Math.floor(min / 60);
  const m = min % 60;

  return m === 0 ? `${h} ชม.` : `${h} ชม. ${m} นาที`;
}

// ใช้เปิด–ปิดรายละเอียดของ slot
function toggleSlot(id: number) {
  expandedSlot.value = expandedSlot.value === id ? null : id;
}

// เวลาเรียก API ต้องมี Header
// ถ้ามี token → ใส่ Authorization: Bearer token ให้ backend ตรวจสิทธิ์ได้  Authorization: Bearer <JWT token>
function getHeaders(): HeadersInit {
  const token = useCookie("token").value;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

/* ---------------- SLOT RANGE GENERATION ---------------- */
// เวลา slot มีช่วงเวลา เช่น 10:00–13:00 → ต้องแยกเป็นช่วงชั่วโมง คือ 10:00–11:00 , 11:00–12:00 , 12:00–13:00
function generateTimeRanges(slot: any) {
  const ranges = [];
  let start = new Date(slot.startTime);
  let end = new Date(slot.endTime);

  while (start < end) {
    const next = new Date(start.getTime() + 60 * 60000);

    ranges.push({
      start: toThaiTime(start.toISOString()),
      end: toThaiTime(next.toISOString()),
      startISO: start.toISOString(),
      endISO: next.toISOString(),
      status: "ว่าง",
    });

    start = next;
  }

  return ranges;
}

/* ---------------- FETCH ---------------- */
//  ดึง slot ทั้งหมด  สร้าง timeRanges ในแต่ละ slot ด้วย
async function fetchSlots() {
  const res = await fetch("http://localhost:3000/slots", {
    headers: getHeaders(),
  });
  const data = await res.json();

  slots.value = data.map((s: any) => {
    const startTime = `${s.date}T${s.startTime}:00`;
    const endTime = `${s.date}T${s.endTime}:00`;

    return {
      ...s,
      startTime,
      endTime,
      status: "AVAILABLE",
      // เวลา slot มีช่วงเวลา เช่น 10:00–13:00
      timeRanges: generateTimeRanges({ startTime, endTime }),
    };
  });
}

// ดึง booking ทั้งหมด (ใช้ mark ว่าสล็อตไหนถูกจองแล้ว)
async function fetchAllBookings() {
  const res = await fetch("http://localhost:3000/bookings", {
    headers: getHeaders(),
  });
  allBookings.value = await res.json();
}

// ดึง booking ของ user , คิดเวลาสิ้นสุดอัตโนมัติ
async function fetchUserBookings() {
  const email = useCookie("email").value;
  if (!email) return;

  const res = await fetch(`http://localhost:3000/bookings?userEmail=${email}`, {
    headers: getHeaders(),
  });
  const bookings = await res.json();

  userBookings.value = bookings.map((b: any) => {
    const startTimes = b.bookingSlots.map((bs: any) => new Date(bs.startTime));
    const minStart = new Date(Math.min(...startTimes));

    const duration =
      b.bookingServices.reduce(
        (sum: number, bs: any) => sum + (bs.service?.durationMinutes ?? 0),
        0
      ) ?? 0;

    const end = new Date(minStart.getTime() + duration * 60000);

    return {
      ...b,
      start: toThaiTime(minStart.toISOString()),
      end: toThaiTime(end.toISOString()),
      duration,
    };
  });
}

interface TimeRange {
  start: string;
  end: string;
  startISO: string;
  endISO: string;
  status: string;
}

/* ---------------- APPLY BOOKING STATUS TO SLOTS ---------------- */
// ถ้าช่วงเวลา booking หนึ่งซ้อนกับช่วงเวลา timeRange → ถือว่า “จองแล้ว”
function markSlotStatus() {
  slots.value.forEach((slot) => {
    const slotBookings = allBookings.value.filter(
      (b: any) =>
        b.bookingSlots[0]?.slotId === slot.id &&
        b.status.toLowerCase() === "confirmed"
    );

    if (slotBookings.length > 0) {
      slot.status = "BOOKED";
    }

    slot.timeRanges.forEach((range: TimeRange) => {
      const rStart = new Date(range.startISO).getTime();
      const rEnd = new Date(range.endISO).getTime();

      const foundOverlap = slotBookings.some((b: any) => {
        const bStart = new Date(b.bookingSlots[0].startTime).getTime();
        const bEnd = new Date(b.bookingSlots[0].endTime).getTime();
        return bStart < rEnd && bEnd > rStart;
      });

      range.status = foundOverlap ? "จองแล้ว" : "ว่าง";
    });
  });
}

/* ---------------- COMPUTED ---------------- */
// หา slot ของวันที่เลือก & คิวของวันนี้ -> ตามวันที่ผู้ใช้เลือก
const slotsOfSelectedDate = computed(() =>
  slots.value.filter((s) => s.date === selectedDate.value)
);

// หา slot ของวันที่เลือก & คิวของวันนี้ ตามวันที่ผู้ใช้เลือก -> คิวของวันนี้ 
const todayBookings = computed(() => {
  const todayStr = new Date().toLocaleDateString("en-CA");
  // en-CA = YYYY-MM-DD มาตรฐาน

  return userBookings.value.filter((b) => {
    const d = new Date(b.bookingDate).toLocaleDateString("en-CA");
    return d === todayStr;
  });
});

/* ---------------- PAGE ACTION ---------------- */

const goToBookingForm = () => router.push("/user/booking-form");
const goToHistory = () => router.push("/user/history");

async function refreshBookings() {
  await fetchSlots();
  await fetchAllBookings();
  await fetchUserBookings();
  markSlotStatus();
}

/* ---------------- INIT ---------------- */

onMounted(async () => {
  const token = useCookie("token").value;
  if (!token) {
    alert("กรุณาเข้าสู่ระบบใหม่");
    router.push("/");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
    selectedDate.value = today; // วันที่ปัจจุบัน
  minDate.value = today;

  await fetchSlots();
  await fetchAllBookings();
  await fetchUserBookings();
  markSlotStatus();
});
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
  filter: brightness(0) saturate(100%) invert(12%) sepia(70%) saturate(6883%)
    hue-rotate(209deg) brightness(90%) contrast(100%);
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