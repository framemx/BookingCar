<template>
  <div class="container">
    <h2>จัดการ Slot ร้าน</h2>

    <label>จำนวน Slot ที่ต้องการ:</label>
    <input type="number" v-model.number="slotCount" min="1" />
    <button @click="generateSlots">สร้าง Slot</button>

    <div v-for="(slot, index) in slots" :key="index" class="slot-group">
      <div class="slot-inputs">
        <div class="form-control">
          <label :for="'start-' + index">เวลาเริ่มต้น (24 ชม.)</label>
          <input type="time" :id="'start-' + index" v-model="slot.start" />
        </div>

        <div class="form-control">
          <label :for="'end-' + index">เวลาสิ้นสุด (24 ชม.)</label>
          <input type="time" :id="'end-' + index" v-model="slot.end" />
        </div>
      </div>
      <button class="btn-remove" @click="removeSlot(index)">ลบ</button>
    </div>

    <button class="save-button" @click="saveSlots">บันทึก Slot</button>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })
import { ref } from 'vue'

const slotCount = ref(1)
const slots = ref([])

function generateSlots() {
  slots.value = []
  for (let i = 0; i < slotCount.value; i++) {
    slots.value.push({ start: '09:00', end: '10:00' })
  }
}

function removeSlot(index) {
  slots.value.splice(index, 1)
}

function saveSlots() {
  localStorage.setItem('shopSlots', JSON.stringify(slots.value))
  alert('บันทึก Slot เรียบร้อย')
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Sarabun', sans-serif;
  color: #1e293b;
  box-sizing: border-box;
}

h2 {
  text-align: center;
  color: #2563eb;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #475569;
}

input[type='number'] {
  width: 100%;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  margin-bottom: 1rem;
}

button {
  background-color: #2563eb;
  color: white;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 0.5rem;
}

button:hover {
  background-color: #1e40af;
}

.slot-group {
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slot-inputs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-control {
  flex: 1;
  min-width: 120px;
}

input[type='time'] {
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  font-size: 1rem;
  box-sizing: border-box;
}

.btn-remove {
  background-color: #ef4444;
  align-self: flex-start;
}

.btn-remove:hover {
  background-color: #b91c1c;
}

.save-button {
  width: 100%;
  margin-top: 1.5rem;
}
</style>
