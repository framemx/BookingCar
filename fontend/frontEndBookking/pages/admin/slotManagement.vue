<template>
  <div class="container">
    <h2>จัดการ Slot ร้าน</h2>

    <label>จำนวน Slot ที่ต้องการ:</label>
    <input type="number" v-model.number="slotCount" min="1" @change="generateSlots" />
    <button @click="generateSlots" class="btn-primary">สร้าง Slot</button>

    <div v-for="(slot, index) in slots" :key="index" class="slot-group">
      <div class="slot-inputs">
        <div class="form-control">
          <label :for="'date-' + index">วันที่</label>
          <input type="date" :id="'date-' + index" v-model="slots[index].date" required />
        </div>

        <div class="form-control">
          <label :for="'start-' + index">เวลาเริ่มต้น (24 ชม.)</label>
          <input type="time" :id="'start-' + index" v-model="slots[index].startTime" required />
        </div>

        <div class="form-control">
          <label :for="'end-' + index">เวลาสิ้นสุด (24 ชม.)</label>
          <input type="time" :id="'end-' + index" v-model="slots[index].endTime" required />
        </div>

        <div class="form-control">
          <label :for="'name-' + index">ชื่อ Slot</label>
          <input type="text" :id="'name-' + index" v-model="slots[index].slotName" required />
        </div>

        <div class="form-control">
          <label :for="'status-' + index">สถานะ</label>
          <select :id="'status-' + index" v-model="slots[index].status" required>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
          </select>
        </div>
      </div>

      <button class="btn-remove" @click="removeSlot(index)">ลบ</button>
    </div>

    <button class="save-button btn-primary" @click="saveSlots">บันทึก Slot</button>
  </div>
</template>

<script setup>

import { ref } from 'vue'
definePageMeta({ layout: 'admin' })
const slotCount = ref(1)
const slots = ref([])

function generateSlots() {
  slots.value = Array.from({ length: slotCount.value }, (_, index) => ({
    date: "2025-06-04",
    startTime: '09:00',
    endTime: '16:00',
    slotName: `Slot ${index + 1}`,
    status: 'AVAILABLE'
  }))
  console.log('Slots generated:', slots.value)
}

function removeSlot(index) {
  slots.value.splice(index, 1)
}

async function saveSlots() {
  console.log('Slots before saving:', slots.value)

  if (!slots.value.length) {
    alert('กรุณาสร้าง Slot ก่อนบันทึก')
    return
  }

  for (const slot of slots.value) {
    if (!slot.date || !slot.startTime || !slot.endTime || !slot.slotName || !slot.status) {
      alert(`กรุณากรอกข้อมูลให้ครบถ้วนสำหรับ Slot "${slot.slotName || 'Unnamed'}"`)
      return
    }

    const start = new Date(`${slot.date}T${slot.startTime}:00+07:00`)
    const end = new Date(`${slot.date}T${slot.endTime}:00+07:00`)
    if (start >= end) {
      alert(`Slot "${slot.slotName}": เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด`)
      return
    }

    const payload = {
      slotName: slot.slotName,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status
    }

    console.log('Payload to send:', payload)

    try {
      const res = await fetch('http://localhost:3000/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const responseData = await res.json()
      if (!res.ok) {
        console.error('API Response:', responseData)
        throw new Error(`ไม่สามารถบันทึก slot: ${responseData.error || 'ข้อมูลไม่ถูกต้อง'}`)
      }

      console.log('บันทึกสำเร็จ:', responseData)
    } catch (err) {
      console.error('Error saving slot:', err.message)
      alert(err.message)
      return
    }
  }

  alert('บันทึก Slot ทั้งหมดเรียบร้อยแล้ว')
}
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem 2.5rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-family: 'Sarabun', sans-serif;
  color: #1e293b;
  box-sizing: border-box;
}

h2 {
  text-align: center;
  color: #2563eb;
  font-size: 2rem;
  margin-bottom: 1.8rem;
  font-weight: 700;
}

label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 600;
  color: #475569;
  font-size: 1rem;
}

input[type='number'],
input[type='date'],
input[type='time'],
input[type='text'],
select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
  border: 1.8px solid #cbd5e1;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input[type='number']:focus,
input[type='date']:focus,
input[type='time']:focus,
input[type='text']:focus,
select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 5px #2563ebaa;
}

button {
  font-family: 'Sarabun', sans-serif;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #2563eb;
  color: #fff;
  padding: 0.7rem 1.6rem;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  display: inline-block;
}

.btn-primary:hover {
  background-color: #1e40af;
}

.slot-group {
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  padding: 1.2rem 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.6rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slot-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
}

.form-control {
  display: flex;
  flex-direction: column;
}

.btn-remove {
  align-self: flex-start;
  background-color: #ef4444;
  color: white;
  padding: 0.45rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 12px;
  margin-top: 0.5rem;
  transition: background-color 0.3s ease;
}

.btn-remove:hover {
  background-color: #b91c1c;
}

.save-button {
  width: 100%;
  margin-top: 1.8rem;
}
</style>