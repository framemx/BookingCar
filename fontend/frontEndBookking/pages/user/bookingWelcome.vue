  <template>
    <div class="page-container">
      <div class="content-wrapper">
        <h1 class="page-title">📅 หน้าจองคิว</h1>

        <div class="user-info">
          <p><strong>👤 ยินดีต้อนรับ:</strong> {{ userName }}</p>
          <p><strong>📧 อีเมล:</strong> {{ userEmail }}</p>
        </div>

        <div class="action-bar">
          <button class="booking-button" @click="goToBookingForm">+ จองเวลา</button>
        </div>

        <h2 class="section-title">📝 รายการจองของคุณ</h2>

        <div v-if="bookings.length === 0" class="no-bookings">
          <p>ยังไม่มีรายการจอง</p>
        </div>

        <div v-else class="booking-grid">
          <div v-for="(booking, index) in bookings" :key="index" class="booking-card">
            <div class="booking-header">
              <strong>📌 วันที่:</strong> {{ booking.date }}
            </div>
            <div class="booking-details">
              <p><strong>🕒 เวลา:</strong> {{ booking.slot?.start }} - {{ booking.slot?.end }}</p>
              <p><strong>🛠 บริการ:</strong>
                <span v-for="(service, i) in booking.services" :key="i">
                  {{ service.name }} ({{ service.duration }} นาที)<span v-if="i < booking.services.length - 1">, </span>
                </span>
              </p>
              <p><strong>⏱ รวมเวลา:</strong> {{ formatMinutes(booking.totalDuration) }}</p>
              <p><strong>📝 หมายเหตุ:</strong> {{ booking.note || '-' }}</p>
            </div>
            <div class="cancel-btn-wrapper">
              <button class="cancel-button" @click="cancelBooking(index)">
                ❌ ยกเลิกการจอง
              </button>
            </div>
          </div>
        </div>

        <h2 class="section-title">🧾 ตารางเวลาที่เปิดบริการ</h2>
        <table v-if="slots.length > 0" class="slot-table">
          <thead>
            <tr>
              <th>ช่วงเวลา</th>
              <th v-for="bay in bayCount" :key="bay">Bay {{ bay }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(slot, index) in slots" :key="index">
              <td>{{ slot.start }} - {{ slot.end }}</td>
              <td v-for="bay in bayCount" :key="bay">ว่าง</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-bookings">ยังไม่มี Slot ที่กำหนด</p>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  definePageMeta({ layout: 'user' })

  const router = useRouter()
  const userName = ref('')
  const userEmail = ref('')
  const bookings = ref([])
  const slots = ref([])
  const bayCount = 3

  onMounted(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const user = JSON.parse(userData)
      userName.value = user.name || 'ผู้ใช้'
      userEmail.value = user.email || '-'
    }

    const savedBookings = localStorage.getItem('bookings')
    bookings.value = savedBookings ? JSON.parse(savedBookings) : []

    const savedSlots = localStorage.getItem('shopSlots')
    slots.value = savedSlots ? JSON.parse(savedSlots) : []
  })

  function goToBookingForm() {
    router.push('/user/bookingForm')
  }

  function cancelBooking(index) {
    const confirmed = window.confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')
    if (confirmed) {
      bookings.value.splice(index, 1)
      localStorage.setItem('bookings', JSON.stringify(bookings.value))
    }
  }

  function formatMinutes(minutes) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h > 0 ? h + ' ชั่วโมง ' : ''}${m} นาที`
  }
  </script>

  <style scoped>
  .page-container {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 2rem 1rem;
    font-family: 'Sarabun', sans-serif;
    color: #1f2937;
  }

  .content-wrapper {
    max-width: 960px;
    margin: 0 auto;
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }

  .page-title {
    font-size: 2rem;
    color: #1e3a8a;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: bold;
  }

  .user-info {
    background-color: #e0f2fe;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.6;
  }

  .action-bar {
    text-align: right;
    margin-bottom: 1.5rem;
  }

  .booking-button {
    background-color: #2563eb;
    color: white;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .booking-button:hover {
    background-color: #1d4ed8;
  }

  .section-title {
    font-size: 1.3rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #0f172a;
    font-weight: bold;
  }

  .no-bookings {
    text-align: center;
    color: #64748b;
    margin-top: 1rem;
  }

  /* Booking Cards */
  .booking-grid {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  .booking-card {
    background-color: #f8fafc;
    border-left: 5px solid #2563eb;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  .booking-header {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .booking-details p {
    margin: 0.3rem 0;
    font-size: 0.95rem;
  }

  .cancel-btn-wrapper {
    text-align: right;
    margin-top: 0.6rem;
  }

  .cancel-button {
    background-color: #dc2626;
    color: white;
    padding: 0.4rem 0.9rem;
    font-size: 0.9rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .cancel-button:hover {
    background-color: #b91c1c;
  }

  /* Slot Table */
  .slot-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    border: 1px solid #cbd5e1;
    font-size: 0.95rem;
  }

  .slot-table th,
  .slot-table td {
    padding: 0.8rem;
    border: 1px solid #cbd5e1;
    text-align: center;
  }

  .slot-table th {
    background-color: #e2e8f0;
    color: #1e293b;
    font-weight: 600;
  }
  </style>
