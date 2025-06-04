<template>
  <div class="container">
    <h1 class="heading">📅 จองคิวบริการ</h1>

    <form @submit.prevent="submitBooking" class="form">
      <!-- วันที่ -->
      <div class="form-group">
        <label for="date">เลือกวันที่</label>
        <input
          type="date"
          id="date"
          v-model="date"
          :min="minDate"
          required
        />
      </div>

      <!-- Slot เวลา -->
      <div class="form-group">
        <label for="slot">เลือกเวลาที่ต้องการ</label>
        <select id="slot" v-model="selectedSlot" required>
          <option value="" disabled>-- กรุณาเลือกเวลา --</option>
          <option v-for="(slot, idx) in availableSlots" :key="idx" :value="slot">
            {{ slot.start }} - {{ slot.end }}
          </option>
        </select>
        <p v-if="availableSlots.length === 0" class="error-message">ไม่มีเวลาให้เลือกสำหรับวันที่นี้</p>
      </div>

      <!-- รายการบริการ (ไม่มี scroll bar) -->
      <div class="form-group">
        <label>เลือกบริการ (เลือกได้หลายรายการ)</label>
        <div class="services-grid" v-if="services.length > 0" :style="{ maxHeight: 'none', overflowY: 'visible' }">
          <label
            v-for="service in services"
            :key="service.id"
            class="service-card"
            :class="{ selected: selectedServices.includes(service.id) }"
            tabindex="0"
          >
            <input
              type="checkbox"
              :value="service.id"
              v-model="selectedServices"
              class="service-checkbox"
            />
            <div class="service-content">
              <h3>{{ service.sName }}</h3>
              <p>{{ service.description }}</p>
              <p class="price-duration">
                <span>💰 {{ service.price }} บาท</span>
                <span>⏰ {{ service.durationMinutes }} นาที</span>
              </p>
            </div>
          </label>
        </div>
        <p v-else class="no-service">ไม่มีบริการให้เลือก</p>
      </div>

      <!-- สรุป -->
      <div class="summary" v-if="selectedServices.length > 0">
        <p>⏰ เวลารวม: <strong>{{ totalDuration }}</strong> นาที</p>
        <p>💰 ราคาทั้งหมด: <strong>{{ totalPrice }}</strong> บาท</p>
      </div>

      <!-- ปุ่มยืนยัน -->
      <button
        class="btn-submit"
        :disabled="!canSubmit"
        type="submit"
      >
        ยืนยันการจอง
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
definePageMeta({ layout: "user" });
interface Service {
  id: number
  sName: string
  description: string
  price: number
  durationMinutes: number
}

interface Slot {
  start: string
  end: string
}

const date = ref('')
const selectedSlot = ref('')
const selectedServices = ref<number[]>([])
const services = ref<Service[]>([])
const slots = ref<any[]>([])
const minDate = new Date().toISOString().slice(0, 10)

async function fetchSlots() {
  try {
    const res = await fetch('http://localhost:3000/slots')
    if (!res.ok) throw new Error('โหลดข้อมูล slot ไม่สำเร็จ')
    const data = await res.json()
    slots.value = data
    console.log('Fetched slots:', slots.value)
  } catch (error) {
    alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    console.error('Error fetching slots:', error)
  }
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m: number): string {
  const hh = Math.floor(m / 60)
  const mm = m % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function generateHourlySlots(startTime: string, endTime: string): Slot[] {
  const startMins = timeToMinutes(startTime)
  const endMins = timeToMinutes(endTime)
  const slotArr = []
  for (let start = startMins; start < endMins; start += 60) {
    const end = start + 60 <= endMins ? start + 60 : endMins
    slotArr.push({ start: minutesToTime(start), end: minutesToTime(end) })
  }
  return slotArr
}

const availableSlots = computed(() => {
  if (!date.value || !slots.value.length) {
    console.log('No date or slots available:', { date: date.value, slotsLength: slots.value.length })
    return []
  }
  const selectedDate = date.value
  console.log('Selected date:', selectedDate)
  console.log('All slots:', slots.value)
  const available = slots.value
    .filter(slot => {
      const slotDate = slot.date
      console.log(`Comparing: selected=${selectedDate}, slot=${slotDate}, status=${slot.status}`)
      return slotDate === selectedDate && slot.status === 'AVAILABLE'
    })
    .map(slot => {
      const start = slot.startTime
      const end = slot.endTime
      console.log(`Mapping slot: ${start} - ${end}, Date: ${slot.date}`)
      if (!start || !end) {
        console.warn(`Invalid slot times for date ${slot.date}: start=${start}, end=${end}`)
        return null
      }
      return generateHourlySlots(start, end)
    })
    .flat()
  console.log('Final available slots:', available)
  return available
})

async function fetchServices() {
  try {
    const res = await fetch('http://localhost:3000/services')
    if (!res.ok) throw new Error('โหลดข้อมูลบริการไม่สำเร็จ')
    const data = await res.json()
    services.value = data.data || []
  } catch (error) {
    alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
  }
}

const totalDuration = computed(() => {
  return selectedServices.value.reduce((sum, id) => {
    const svc = services.value.find(s => s.id === id)
    return svc ? sum + svc.durationMinutes : sum
  }, 0)
})

const totalPrice = computed(() => {
  return selectedServices.value.reduce((sum, id) => {
    const svc = services.value.find(s => s.id === id)
    return svc ? sum + svc.price : sum
  }, 0)
})

const canSubmit = computed(() => {
  return date.value !== '' && selectedSlot.value !== '' && selectedServices.value.length > 0
})

async function submitBooking() {
  try {
    const bookingData = {
      date: date.value,
      slot: selectedSlot.value,
      services: selectedServices.value,
      totalDuration: totalDuration.value,
      totalPrice: totalPrice.value,
    }
    const res = await fetch('http://localhost:3000/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.message || 'จองคิวไม่สำเร็จ')
    }
    alert('จองคิวสำเร็จ 🎉')
    date.value = ''
    selectedSlot.value = ''
    selectedServices.value = []
  } catch (err) {
    alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
  }
}

onMounted(() => {
  fetchSlots()
  fetchServices()
})

watch(date, () => {
  selectedSlot.value = ''
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');

.container {
  max-width: 720px;
  margin: 2.5rem auto;
  padding: 2.5rem 3rem;
  background: #f9fcff;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 123, 255, 0.22);
  font-family: 'Sarabun', sans-serif;
  color: #102a43;
  user-select: none;
}

.heading {
  text-align: center;
  color: #1e40af;
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 1.8rem;
  letter-spacing: 1.1px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #334e68;
  font-size: 1.1rem;
  user-select: none;
}

input[type='date'],
select {
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border-radius: 10px;
  border: 1.8px solid #bfd7ff;
  background-color: #f0f8ff;
  color: #102a43;
  transition: all 0.3s ease;
  outline-offset: 3px;
}

input[type='date']:focus,
select:focus {
  border-color: #3b82f6;
  background-color: #dbeafe;
  box-shadow: 0 0 8px #3b82f6aa;
  outline: none;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 28px;
  max-height: none !important;
  overflow-y: visible !important;
  user-select: none;
}

.service-card {
  position: relative;
  background: white;
  border: 2px solid transparent;
  border-radius: 16px;
  box-shadow: 0 6px 14px rgb(37 99 235 / 0.18);
  padding: 28px 32px 34px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  outline-offset: 3px;
}

.service-card:hover {
  box-shadow: 0 6px 18px rgb(37 99 235 / 0.35);
  transform: translateY(-4px);
  border-color: #3b82f6;
}

.service-card.selected {
  border-color: #2563eb;
  box-shadow: 0 0 15px 3px #3b82f6cc;
  background: #e0ebff;
  font-weight: 600;
}

.service-checkbox {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  cursor: pointer;
  appearance: none;
  border: 2.5px solid #3b82f6;
  border-radius: 6px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  background-color: white;
}

.service-checkbox:checked {
  background-color: #3b82f6;
  border-color: #2563eb;
  box-shadow: 0 0 8px #3b82f6cc;
}

.service-checkbox:checked::after {
  content: '✔';
  display: block;
  color: white;
  font-weight: 700;
  font-size: 1.3rem;
  line-height: 18px;
  text-align: center;
}

.service-checkbox:hover {
  border-color: #1d4ed8;
}

.service-content h3 {
  margin: 0 0 10px;
  color: #1e40af;
  font-size: 1.45rem;
}

.service-content p {
  margin: 0 0 10px;
  font-size: 1.1rem;
  color: #334e68;
  user-select: text;
}

.price-duration {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2563eb;
  display: flex;
  justify-content: space-between;
  user-select: none;
}

.no-service {
  font-style: italic;
  color: #94a3b8;
  padding: 6px 0;
}

.error-message {
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.summary {
  background: #dbeafe;
  padding: 14px 20px;
  border-radius: 14px;
  color: #1e40af;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  justify-content: space-between;
  user-select: none;
  box-shadow: inset 0 0 8px #3b82f6aa;
}

.btn-submit {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  border: none;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px #3b82f6cc;
}

.btn-submit:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):hover {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  box-shadow: 0 10px 30px #2563ebdd;
}
</style>  