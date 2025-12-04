<template>
  <div class="page-container">
    <div class="content-wrapper">
      <h1 class="page-title">📜 ประวัติการจอง</h1>

      <!-- DATE FILTER -->
      <div class="date-filter-bar">
        <label class="date-label" for="datePicker">
          <span class="calendar-icon">📅</span> เลือกวันที่:
        </label>
        <input
          id="datePicker"
          type="date"
          v-model="selectedDate"
          class="date-input"
        />
        <button class="back-button" @click="goBack">⬅ กลับไปหน้าการจอง</button>
      </div>

      <!-- BOOKING TABLE -->
      <table v-if="displayedBookings.length > 0" class="slot-table">
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
          <tr v-for="booking in displayedBookings" :key="booking.id">
            <td>{{ formatDateDisplay(booking.bookingDate) }}</td>
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
                  booking.status.toUpperCase() === 'CONFIRMED'
                    ? 'ยืนยันแล้ว'
                    : 'รออนุมัติ'
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-bookings">ไม่มีประวัติการจอง</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter } from "#app"

definePageMeta({ layout: "user" })

const router = useRouter()

const selectedDate = ref("")
const allBookings = ref<any[]>([])

/* ------------------- HELPERS ------------------- */

function getHeaders(): HeadersInit {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}")
  const token = userData.token || localStorage.getItem("authToken")

  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    : { "Content-Type": "application/json" }
}

function goBack() {
  router.push("/user/booking-welcome")
}

function formatDuration(min: number) {
  if (min < 60) return `${min} นาที`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} ชม.` : `${h} ชม. ${m} นาที`
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

/* ------------------- TIME PARSING ------------------- */

function parseTimeRange(booking: any) {
  const startTimes = booking.bookingSlots.map((bs: any) => new Date(bs.startTime))
  const minStart = new Date(Math.min(...startTimes.map((d: Date) => d.getTime())))

  const totalDuration =
    booking.bookingServices?.reduce(
      (sum: number, bs: any) => sum + (bs.service?.durationMinutes || 0),
      0
    ) || 0

  const endTime = new Date(minStart.getTime() + totalDuration * 60000)

  return {
    start: minStart.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    end: endTime.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    duration: totalDuration
  }
}

/* ------------------- COMPUTED ------------------- */

const displayedBookings = computed(() => {
  const enriched = allBookings.value.map((b) => ({
    ...b,
    ...parseTimeRange(b)
  }))

  if (!selectedDate.value) return enriched

  return enriched.filter(
    (b) => b.bookingDate.slice(0, 10) === selectedDate.value
  )
})

/* ------------------- FETCH BOOKINGS ------------------- */

onMounted(async () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}")
  const userEmail = userData.email

  if (!userEmail) {
    router.push("/")
    return
  }

  const res = await fetch(
    `http://localhost:3000/bookings?userEmail=${userEmail}`,
    { headers: getHeaders() }
  )

  const data = await res.json()
  allBookings.value = Array.isArray(data) ? data : []
})
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&display=swap");

.page-container {
  font-family: 'Kanit', sans-serif;
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

.page-title {
  font-size: 1.4rem;
  color: #1e3a8a;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
}

.date-filter-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.6rem;
}

.date-label {
  font-weight: 600;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  white-space: nowrap;
}

.date-input {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  border: 1.5px solid #2563eb;
  background-color: #fff;
  color: #1e293b;
  width: 180px;
  box-shadow: 0 0 0px 1px #bfdbfe;
  transition: 0.2s ease;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: brightness(0) saturate(100%) invert(12%) sepia(70%) saturate(6883%) hue-rotate(209deg) brightness(90%) contrast(100%);
  cursor: pointer;
  height: 14px;
  width: 14px;
  color: #1e3a8a;
}

.back-button {
  background-color: #64748b;
  color: #ffffff;
  padding: 0.4rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.back-button:hover {
  background-color: #475569;
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
.status-pending {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.3rem 1.2rem;
  border-radius: 9999px;
  display: inline-block;
  min-width: 100px; /* ✅ ปรับให้กว้างพอสำหรับทุกข้อความ */
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

.no-bookings {
  text-align: center;
  font-style: italic;
  font-weight: 500;
  color: #94a3b8;
  padding: 1rem;
}
</style>