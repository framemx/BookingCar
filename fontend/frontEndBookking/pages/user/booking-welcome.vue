<template>
  <div class="page-container">
    <div class="content-wrapper">
      <h1 class="page-title">📅 หน้าจองคิว</h1>

      <!-- USER INFO -->
      <section class="user-info">
        <p><strong>👤 ยินดีต้อนรับ:</strong> {{ userName }}</p>
        <p><strong>📧 อีเมล:</strong> {{ userEmail }}</p>
      </section>

      <!-- ACTION BUTTONS -->
      <div class="action-bar">
        <button class="booking-button" @click="goToBookingForm">+ จองเวลา</button>
        <button class="refresh-button" @click="refreshBookings">🔄 รีเฟรช</button>
        <button class="history-button" @click="goToHistory">📜 ประวัติการจอง</button>
      </div>

      <!-- TODAY BOOKINGS -->
      <h2 class="section-title">📋 ตารางการจองของคุณ (วันนี้)</h2>

      <table v-if="todayBookings.length > 0" class="slot-table">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>ช่องบริการ</th>
            <th>เวลาเริ่ม</th>
            <th>เวลาสิ้นสุด</th>
            <th>ระยะเวลา</th>
            <th>บริการ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in todayBookings" :key="booking.id" class="table-row">
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
                :class="booking.status.toUpperCase() === 'CONFIRMED'
                  ? 'status-confirmed'
                  : 'status-pending'"
              >
                {{
                  booking.status.toUpperCase() === 'CONFIRMED'
                    ? 'ยืนยันแล้ว'
                    : 'รออนุมัติ'
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-bookings">ไม่มีการจองสำหรับวันนี้</p>

      <!-- DATE PICKER -->
      <div class="date-select-bar">
        <label class="date-label" for="datePicker"> เลือกวันที่ </label>
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

      <!-- SLOTS LIST -->
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
                  v-for="sub in generateHourlySlotsWithOverlap(
                    slot.startTime,
                    slot.endTime,
                    allConfirmedBookings,
                    slot.id
                  )"
                  :key="sub.label"
                  class="sub-slot-content"
                >
                  <div class="time-label">🕒 {{ sub.label }}</div>
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

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from '#app'

definePageMeta({ layout: 'user' })

const router = useRouter()
const route = useRoute()

/* ---------------- STATE ---------------- */
const userName = ref('')
const userEmail = ref('')
const slots = ref<any[]>([])
const userBookings = ref<any[]>([])
const latestBooking = ref<any>(null)
const allConfirmedBookings = ref<any[]>([])
const selectedDate = ref('')
const minDate = ref('')
const expandedSlotId = ref<number | null>(null)

let dateUpdateInterval: any = null

/* ---------------- HELPERS ---------------- */

function getHeaders(): HeadersInit {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const token = userData.token || localStorage.getItem('authToken')

  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    : { 'Content-Type': 'application/json' }
}

function getCurrentDateString() {
  return new Date().toISOString().slice(0, 10)
}

function updateCurrentDate() {
  const now = getCurrentDateString()
  selectedDate.value = now
  minDate.value = now
}

function toggleSlotDetail(id: number) {
  expandedSlotId.value = expandedSlotId.value === id ? null : id
}

/* TIME FORMATTERS */
function formatTime(dt: string) {
  const d = new Date(dt)
  return d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDuration(min: number) {
  if (min < 60) return `${min} นาที`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} ชม.` : `${h} ชม. ${m} นาที`
}

/* ---------------- FETCH API ---------------- */

async function fetchSlots() {
  try {
    const res = await fetch('http://localhost:3000/slots', {
      headers: { ...getHeaders() }
    })

    const data = await res.json()

    slots.value = Array.isArray(data)
      ? data.map((slot: any) => ({
          ...slot,
          startTime: `${slot.date}T${slot.startTime}:00`,
          endTime: `${slot.date}T${slot.endTime}:00`
        }))
      : []
  } catch (err) {
    console.error('Fetch slots failed:', err)
  }
}

async function fetchUserBookings() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  if (!userData.email) return

  const res = await fetch(
    `http://localhost:3000/bookings?userEmail=${userData.email}`,
    { headers: { ...getHeaders() } }
  )

  const data = await res.json()

  userBookings.value = Array.isArray(data)
    ? data.filter((b: any) =>
        ['confirmed', 'pending'].includes(b.status?.toLowerCase())
      )
    : []
}

async function fetchConfirmedBookingsForSlots() {
  const res = await fetch('http://localhost:3000/bookings', {
    headers: { ...getHeaders() }
  })
  const data = await res.json()

  allConfirmedBookings.value = Array.isArray(data)
    ? data.filter((b: any) => b.status?.toLowerCase() === 'confirmed')
    : []
}

/* ---------------- BOOKING TIME CALC ---------------- */

function parseBookingTime(booking: any) {
  const startTimes = booking.bookingSlots.map((bs: any) =>
    new Date(bs.startTime)
  )
  const minStart = new Date(
    Math.min(...startTimes.map((d: Date) => d.getTime()))
  )
  const duration =
    booking.bookingServices?.reduce(
      (sum: number, bs: any) => sum + (bs.service?.durationMinutes || 0),
      0
    ) || 0

  const end = new Date(minStart.getTime() + duration * 60000)

  return {
    start: minStart.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    end: end.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    duration
  }
}

const combinedBookings = computed(() =>
  [...userBookings.value]
    .map((b) => ({ ...b, ...parseBookingTime(b) }))
    .sort(
      (a, b) =>
        new Date(a.bookingDate).getTime() -
        new Date(b.bookingDate).getTime()
    )
)

const todayBookings = computed(() => {
  const today = getCurrentDateString()
  return combinedBookings.value.filter(
    (b) => b.bookingDate.slice(0, 10) === today
  )
})

const slotsOfSelectedDate = computed(() =>
  slots.value.filter((s) => s.date === selectedDate.value)
)

/* ---------------- EXPAND HOURLY ---------------- */

function generateHourlySlotsWithOverlap(start: string, end: string, bookings: any[], slotId: number) {
  const result = []
  let s = new Date(start)
  const e = new Date(end)

  while (s < e) {
    const next = new Date(s.getTime() + 60 * 60000)

    const isBooked = bookings.some((b) => {
      if (b.status !== 'confirmed') return false
      if (!b.bookingSlots.some((bs: any) => bs.slotId === slotId)) return false

      const bStart = new Date(
        Math.min(
          ...b.bookingSlots.map((bs: any) =>
            new Date(bs.startTime).getTime()
          )
        )
      )
      const duration =
        b.bookingServices?.reduce(
          (sum: number, bs: any) => sum + (bs.service?.durationMinutes || 0),
          0
        ) || 0
      const bEnd = new Date(bStart.getTime() + duration * 60000)

      return bStart < next && bEnd > s
    })

    result.push({
      label: `${formatTime(s.toISOString())} - ${formatTime(next.toISOString())}`,
      booked: isBooked
    })

    s = next
  }

  return result
}

/* ---------------- PAGE NAVIGATION ---------------- */

const goToBookingForm = () => router.push('/user/booking-form')
const goToHistory = () => router.push('/user/history')

/* ---------------- REFRESH ---------------- */

async function refreshBookings() {
  updateCurrentDate()
  await fetchUserBookings()
  await fetchSlots()
  await fetchConfirmedBookingsForSlots()
}

/* ---------------- LIFECYCLE ---------------- */

onMounted(async () => {
  updateCurrentDate()

  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  userName.value = userData.name || 'ผู้ใช้'
  userEmail.value = userData.email || '-'

  await fetchSlots()
  await fetchUserBookings()
  await fetchConfirmedBookingsForSlots()

  if (route.query.bookingId) {
    const res = await fetch(
      `http://localhost:3000/bookings/${route.query.bookingId}`,
      { headers: { ...getHeaders() } }
    )
    latestBooking.value = await res.json()
  }

  dateUpdateInterval = setInterval(updateCurrentDate, 60000)
})

onUnmounted(() => {
  if (dateUpdateInterval) clearInterval(dateUpdateInterval)
})

watch(
  () => route.query.bookingId,
  async (id) => {
    if (!id) return

    const res = await fetch(`http://localhost:3000/bookings/${id}`, {
      headers: { ...getHeaders() }
    })
    latestBooking.value = await res.json()
    await fetchUserBookings()
  }
)
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
