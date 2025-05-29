<template>
  <div>
    <h2>จัดการ Slot</h2>
    <form @submit.prevent="addOrUpdateSlot">
      <input v-model="slotName" placeholder="ชื่อ Slot เช่น Slot 1" required />
      <input type="time" v-model="slotStartTime" required />
      <input type="time" v-model="slotEndTime" required />
      <button type="submit">{{ editingId ? 'อัปเดต' : 'เพิ่ม' }}</button>
      <button v-if="editingId" @click="cancelEdit">ยกเลิก</button>
    </form>

    <table>
      <thead><tr><th>ชื่อ Slot</th><th>เวลาเริ่ม</th><th>เวลาสิ้นสุด</th><th>จัดการ</th></tr></thead>
      <tbody>
        <tr v-for="slot in slots" :key="slot.id">
          <td>{{ slot.name }}</td>
          <td>{{ slot.startTime }}</td>
          <td>{{ slot.endTime }}</td>
          <td>
            <button @click="editSlot(slot)">แก้ไข</button>
            <button @click="deleteSlot(slot.id)">ลบ</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
})
import { ref, onMounted } from 'vue'

const slots = ref([])

const slotName = ref('')
const slotStartTime = ref('')
const slotEndTime = ref('')
const editingId = ref(null)

async function fetchSlots() {
  // fetch slots จาก backend
  // slots.value = await ...
}

async function addOrUpdateSlot() {
  if (editingId.value) {
    // เรียก API update slot
  } else {
    // เรียก API เพิ่ม slot
  }
  await fetchSlots()
  resetForm()
}

function editSlot(slot) {
  editingId.value = slot.id
  slotName.value = slot.name
  slotStartTime.value = slot.startTime
  slotEndTime.value = slot.endTime
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  editingId.value = null
  slotName.value = ''
  slotStartTime.value = ''
  slotEndTime.value = ''
}

async function deleteSlot(id) {
  if (confirm('ต้องการลบ Slot นี้?')) {
    // เรียก API ลบ slot
    await fetchSlots()
  }
}

onMounted(() => {
  fetchSlots()
})
</script>
