<template>
  <div class="container">
    <h2 class="page-title">🛠️ จัดการ Slot ร้าน</h2>

    <div class="input-bar">
      <label for="slotCount">จำนวน Slot ที่ต้องการ:</label>
      <div class="input-control-wrapper">
        <button class="counter-btn b1" @click="decreaseSlot">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="lucide lucide-minus"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 12h14" />
          </svg>
        </button>

        <input type="text" :value="slotCount" readonly class="counter-input" />

        <button class="counter-btn b2" @click="increaseSlot">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="lucide lucide-plus"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      <button @click="generateSlots" class="btn-add">➕ สร้าง Slot</button>
    </div>

    <div v-for="(slot, index) in slots" :key="index" class="slot-group">
      <div class="slot-inputs">
        <div class="form-control">
          <label :for="'date-' + index">วันที่</label>
          <input
            type="date"
            :id="'date-' + index"
            v-model="slots[index].date"
            required
            class="form-input"
          />
        </div>

        <div class="form-control">
          <label :for="'start-' + index">เวลาเริ่มต้น</label>
          <input
            type="time"
            :id="'start-' + index"
            v-model="slots[index].startTime"
            required
            class="form-input"
          />
        </div>

        <div class="form-control">
          <label :for="'end-' + index">เวลาสิ้นสุด</label>
          <input
            type="time"
            :id="'end-' + index"
            v-model="slots[index].endTime"
            required
            class="form-input"
          />
        </div>

        <div class="form-control">
          <label :for="'name-' + index">ชื่อ Slot</label>
          <input
            type="text"
            :id="'name-' + index"
            v-model="slots[index].slotName"
            required
            class="form-input"
          />
        </div>

        <div class="form-control">
          <label :for="'status-' + index">สถานะ</label>
          <select
            :id="'status-' + index"
            v-model="slots[index].status"
            required
            class="form-input"
          >
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
          </select>
        </div>
      </div>

      <button class="btn-remove" @click="removeSlot(index)">ลบ</button>
    </div>

    <button class="btn-save" @click="saveSlots">💾 บันทึก Slot</button>
  </div>
</template>

<script setup>
import { ref } from "vue";

definePageMeta({ layout: "admin" });

const slotCount = ref(1);
const slots = ref([]);

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateSlots() {
  const todayStr = getTodayDateString();
  slots.value = Array.from({ length: slotCount.value }, (_, index) => ({
    date: todayStr,
    startTime: "09:00",
    endTime: "16:00",
    slotName: `Slot ${index + 1}`,
    status: "AVAILABLE",
  }));
}

function increaseSlot() {
  slotCount.value++;
}

function decreaseSlot() {
  if (slotCount.value > 1) slotCount.value--;
}

function removeSlot(index) {
  slots.value.splice(index, 1);
}

async function saveSlots() {
  if (!slots.value.length) {
    alert("กรุณาสร้าง Slot ก่อนบันทึก");
    return;
  }

  for (const slot of slots.value) {
    if (
      !slot.date ||
      !slot.startTime ||
      !slot.endTime ||
      !slot.slotName ||
      !slot.status
    ) {
      alert(
        `กรุณากรอกข้อมูลให้ครบถ้วนสำหรับ Slot "${slot.slotName || "Unnamed"}"`
      );
      return;
    }

    const start = new Date(`${slot.date}T${slot.startTime}:00+08:00`);
    const end = new Date(`${slot.date}T${slot.endTime}:00+08:00`);
    if (start >= end) {
      alert(`Slot "${slot.slotName}": เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด`);
      return;
    }

    const payload = {
      slotName: slot.slotName,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
    };

    try {
      const res = await fetch("http://localhost:3000/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          `ไม่สามารถบันทึก slot: ${responseData.error || "ข้อมูลไม่ถูกต้อง"}`
        );
      }
    } catch (err) {
      alert(err.message);
      return;
    }
  }

  alert("บันทึก Slot ทั้งหมดเรียบร้อยแล้ว");
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;700&display=swap");

.container {
  max-width: 960px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  font-family: "Kanit", sans-serif;
  color: #1e293b;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  color: #1e3a8a;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: space-between
}

.input-control-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.counter-input {
  width: 64px;
  text-align: center;
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  border: 2px solid #d1d5db;
  background-color: #f9fafb;
  font-weight: 700;
  font-size: 1.05rem;
  color: #1e293b;
  transition: border-color 0.2s ease;
}

.counter-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  font-size: 1.3rem;
  font-weight: 700;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.counter-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.counter-btn.b1:hover {
  background-color: #ff0037;
  transform: scale(1.1);
}

.counter-btn.b2:hover {
  background-color: #2ef72e;
  transform: scale(1.1);
}


.counter-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.counter-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}


.slot-group {
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.slot-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
}

.form-control {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.4rem;
}

.form-input {
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background-color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.btn-remove {
  margin-top: 1rem;
  background-color: #ef4444;
  color: white;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
}

.btn-remove:hover {
  background-color: #dc2626;
}

.btn-add {
  background-color: #1e3a8a;
  color: white;
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  
}

.btn-add:hover {
  background-color: #698cff;
  color: white;
  transform: scale(1.05);
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-save {
  display: block;
  width: 100%;
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  background-color: #22c55e;
  color: white;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin-top: 2rem;
}

.btn-save:hover {
  background-color: #16a34a;
}
</style>
