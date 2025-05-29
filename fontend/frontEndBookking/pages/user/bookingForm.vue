<template>
  <div class="booking-container">
    <h2 class="title">จองคิวบริการ</h2>

    <label>เลือกวันที่:</label>
    <input type="date" v-model="date" />

    <label>เลือก Slot เวลา:</label>
    <select v-model="selectedSlot">
      <option v-for="(slot, index) in slots" :key="index" :value="slot">
        {{ slot.start }} - {{ slot.end }}
      </option>
    </select>

    <label>เลือกบริการ:</label>
    <div v-for="(service, index) in services" :key="index">
      <input type="checkbox" :id="'s-' + index" v-model="service.selected" />
      <label :for="'s-' + index">{{ service.name }} ({{ service.duration }} นาที)</label>
    </div>

    <label>หมายเหตุ (ถ้ามี):</label>
    <textarea v-model="note" rows="3"></textarea>

    <button @click="submitBooking">ยืนยันการจอง</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const date = ref('')
const selectedSlot = ref(null)
const note = ref('')
const slots = ref([])
const services = ref([
  { name: 'ล้างรถ', duration: 30, selected: false },
  { name: 'ขัดเคลือบ', duration: 60, selected: false },
  { name: 'ดูดฝุ่น', duration: 20, selected: false }
])

onMounted(() => {
  const savedSlots = localStorage.getItem('shopSlots')
  slots.value = savedSlots ? JSON.parse(savedSlots) : []
})

function submitBooking() {
  const selectedServices = services.value.filter(s => s.selected)
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)

  const newBooking = {
    date: date.value,
    slot: selectedSlot.value,
    services: selectedServices,
    note: note.value,
    totalDuration
  }

  const existing = JSON.parse(localStorage.getItem('bookings') || '[]')
  existing.push(newBooking)
  localStorage.setItem('bookings', JSON.stringify(existing))

  alert('จองคิวสำเร็จ')
  router.push('/user/bookingWelcome')
}
</script>

<style scoped>
* {
  color: #393939;
}
.booking-container {
  max-width: 600px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Sarabun', sans-serif;
}
.title {
  font-size: 1.8rem;
  color: #1e3a8a;
  margin-bottom: 1rem;
  text-align: center;
}
label {
  display: block;
  margin: 1rem 0 0.5rem;
}
input[type='date'],
select,
textarea {
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  box-sizing: border-box;
}
button {
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1.5rem;
  width: 100%;
}
button:hover {
  background-color: #1e40af;
}
</style>
