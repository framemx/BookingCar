<template>
  <!-- template เดิมใช้ได้เลย ไม่มีอะไรต้องแก้ -->
  <div class="page-container">
    <div class="content-wrapper">
      <h1 class="page-title animate-pop">📅 จองคิวบริการ</h1>

      <form @submit.prevent="submitBooking" class="form">
        <!-- เลือกวันที่ -->
        <div class="form-group">
          <label for="date">📅 เลือกวันที่</label>
          <input
            type="date"
            v-model="date"
            :min="minDate"
            required
            class="date-input"
          />
        </div>

        <!-- เลือกเวลา -->
        <div class="form-group time-select-group">
          <label>⏰ เลือกเวลาที่ต้องการ</label>
          <div class="custom-dropdown">
            <div class="dropdown-selected" @click="toggleDropdown">
              {{ selectedSlotLabel || "⏰ กรุณาเลือกเวลา" }}
            </div>
            <div v-if="dropdownOpen" class="dropdown-options animate-fade-in">
              <template v-for="(group, index) in groupedSlots" :key="index">
                <div class="dropdown-group-title">
                  ช่องบริการ {{ group.slotName }}
                </div>
                <div
                  v-for="slot in group.slots"
                  :key="slot.slotId + slot.start"
                  class="dropdown-option"
                  :class="{ booked: slot.booked }"
                  @click="selectSlot(slot)"
                >
                  ⏰ {{ slot.start }} - {{ slot.end }} ({{
                    slot.booked ? "จองแล้ว" : "ว่าง"
                  }})
                </div>
              </template>
            </div>
          </div>

          <p v-if="selectedSlot" class="status-text">
            สถานะ:
            <span
              :class="
                selectedSlot.booked ? 'status-booked' : 'status-available'
              "
            >
              {{ selectedSlot.booked ? "❌ จองแล้ว" : "✅ ว่าง" }}
            </span>
          </p>
        </div>

        <!-- เลือกบริการ -->
        <div class="form-group">
          <label>เลือกบริการ</label>
          <div class="services-grid">
            <label
              v-for="service in services"
              :key="service.id"
              class="service-card animate-hover"
              :class="{ selected: selectedServices.includes(service.id) }"
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
        </div>

        <!-- สรุป -->
        <div class="summary" v-if="selectedServices.length > 0">
          <p>
            ⏰ เวลารวม: <strong>{{ totalDuration }}</strong> นาที
          </p>
          <p>
            💰 ราคาทั้งหมด: <strong>{{ totalPrice }}</strong> บาท
          </p>
        </div>

        <button class="btn-submit" :disabled="!canSubmit" type="submit">
          <span>🚀 ยืนยันการจอง</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "#app";

definePageMeta({
  layout: "user",
});

const router = useRouter();

// State ตัวแปรหลักที่ใช้ในหน้านี้
const date = ref("");
const selectedSlot = ref<any>(null);
const selectedServices = ref<number[]>([]);
const services = ref<any[]>([]);
const slots = ref<any[]>([]);
const confirmedBookings = ref<any[]>([]);


const dropdownOpen = ref(false);

/* ---------------- AUTH: ใช้ Cookie แทน localStorage ---------------- */

//  (ถ้ามี Token) จะมีการใส่ Header Authorization: Bearer ... เข้าไปโดยอัตโนมัติ
function getAuthHeaders() {
  const token = useCookie("token").value;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/* ----------------- Dropdown ----------------- */
// เป็นฟังก์ชันที่ใช้สลับสถานะ เปิด/ปิด dropdown
const toggleDropdown = () => (dropdownOpen.value = !dropdownOpen.value);

const selectSlot = (slot: any) => {
  if (slot.booked) return; // เช็คก่อนว่า slot นี้จองแล้วหรือยัง  ถ้า slot.booked == true → ห้ามเลือก และให้หยุดทำงานทันที
  selectedSlot.value = slot;  // ถ้าเลือกได้ ให้เก็บช่วงเวลาที่เลือก
  dropdownOpen.value = false;  // ปิด dropdown อัตโนมัติ
};

// ใช้แสดงข้อความเวลาที่ผู้ใช้เลือกใน dropdow   "09:00 - 10:00"
const selectedSlotLabel = computed(() =>
  selectedSlot.value
    ? `${selectedSlot.value.start} - ${selectedSlot.value.end}`
    : ""
);

/* ----------------- Date ----------------- */

const minDate = new Date().toISOString().slice(0, 10);

/* ----------------- Time Helpers ----------------- */

// แปลงเวลาแบบ "HH:MM" ให้กลายเป็น นาทีทั้งหมด "09:30" → 570 นาที
const timeToMinutes = (t: string) =>
  t.split(":").map(Number).reduce((h, m) => h * 60 + m);

// แปลง “จำนวนนาที” → เป็นเวลา "HH:MM"
const minutesToTime = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
    2,
    "0"
  )}`;

// ฟังก์ชันนี้ใช้เพื่อ สร้างช่วงเวลา (slot) แบบรายชั่วโมง
const generateHourlySlots = (start: string, end: string) => {
  const out = [];
  // แปลงเวลาเริ่มต้นและเวลาสิ้นสุดเป็น "นาทีทั้งหมด"
  let s = timeToMinutes(start);
  let e = timeToMinutes(end);
  for (let i = s; i < e; i += 60) { // loop เพิ่มละ 2 นาที
    out.push({    // สร้าง slot และ push ใส่ array
      start: minutesToTime(i),      // แปลง i (นาที) → เวลา "HH:MM"
      end: minutesToTime(Math.min(i + 60, e)),    // ถ้าเวลา end คือ "12:00 ลูปสุดท้าย i = 660 → i + 60 = 720 → ไม่เกิน → ใช้ได้
    });
  }
  return out;   // ตืนค่า
};

/* ----------------- Available Slots ----------------- */

const availableSlots = computed(() => {   // เมื่อค่า date, slots, confirmedBookings เปลี่ยน → คำนวณใหม่ทันที
  if (!date.value) return [];     // ถ้ายังไม่ได้เลือกวันที่ → ไม่ต้องโชว์ slot

  return slots.value
    .filter((s) => s.date === date.value)   // เลือกเฉพาะ slot ที่เป็นของวันที่ที่ผู้ใช้เลือก
    .flatMap((slot) => {
      const hourly = generateHourlySlots(slot.startTime, slot.endTime).map(   // สำหรับแต่ละ slot แบบ 09:00–15:00 → แตกเป็นจำนวนชั่วโมง ได้ 09:00–10:00 , 10:00–11:00  , 11:00–12:00
        (h) => ({
          ...h,
          slotId: slot.id,
          slotName: slot.slotName,
        })
      );

      return hourly.map((hour) => {   // เช็คแต่ละชั่วโมงว่า "ถูกจองแล้วหรือยัง?"
        
        // แปลงเวลาชั่วโมงให้เป็น Date object เพื่อคำนวณทับซ้อนเวลา
        const start = new Date(`${date.value}T${hour.start}:00`);     
        const end = new Date(`${date.value}T${hour.end}:00`);

        // ตรวจสอบว่า slot นี้ชนกับการจองจริงไหม
        const isBooked = confirmedBookings.value.some((b: any) => {

          // เงื่อนไข: ต้องมีสถานะ “confirmed” เท่านั้น
          if (
            b.status !== "confirmed" ||
            !b.bookingSlots?.some((bs: any) => bs.slotId === slot.id)
          ) {
            return false;
          }

          // หา “เวลาเริ่มต้นจริง” ของการจองนั้น ถ้าจองหลายบริการ (multi service slot) → ใช้ "เวลาที่เริ่มต้นเร็วที่สุด"
          const bookingStart = new Date(
            Math.min(
              ...b.bookingSlots.map((bs: any) =>
                new Date(bs.startTime).getTime()
              )
            )
          );

          // คำนวณ ระยะเวลารวม ของบริการที่ลูกค้าเลือก
          const totalDuration =
            b.bookingServices?.reduce(
              (sum: number, bs: any) =>
                sum + (bs.service?.durationMinutes || 0),
              0
            ) || 0;

          // คำนวณเวลา “จบจริง” ของการจอง
          const bookingEnd = new Date(
            bookingStart.getTime() + totalDuration * 60000
          );

          // ตรวจว่ามีการ “ทับซ้อนเวลา” กับช่วงที่กำลังสร้างไหม?
          return bookingStart < end && bookingEnd > start;
        });

        // ส่งกลับข้อมูลของชั่วโมงนั้น พร้อมบอกว่า booked ไหม
        return { ...hour, booked: isBooked };
      });
    });
});


// จัดกลุ่มตามชื่อช่องบริการ
// ช่องบริการ A
//   09:00 - 10:00
//   10:00 - 11:00

// ช่องบริการ B
//   09:00 - 10:00
const groupedSlots = computed(() => {
  const groups: Record<string, any[]> = {};

  for (const slot of availableSlots.value) {
    if (!groups[slot.slotName]) groups[slot.slotName] = [];
    groups[slot.slotName].push(slot);
  }

  return Object.entries(groups).map(([slotName, slots]) => ({
    slotName,
    slots,
  }));
});

/* ----------------- Summary ----------------- */
// คำนวนราคา
const totalDuration = computed(() =>
  selectedServices.value.reduce((sum, id) => {
    const svc = services.value.find((s) => s.id === id);
    return svc ? sum + svc.durationMinutes : sum;
  }, 0)
);

// คำนวนเวลา
const totalPrice = computed(() =>
  selectedServices.value.reduce((sum, id) => {
    const svc = services.value.find((s) => s.id === id);
    return svc ? sum + svc.price : sum;
  }, 0)
);

// ตัวอนุญาตให้กดปุ่มจอง” ถ้าอย่างใดอย่างหนึ่งไม่ครบ
const canSubmit = computed(
  () =>
    date.value &&
    selectedSlot.value &&
    selectedServices.value.length > 0 &&
    !selectedSlot.value.booked
);

/* ----------------- Fetch APIs ----------------- */
// ดึงข้อมูล ช่วงเวลาทำงานของร้าน ใช้สร้าง availableSlots → ให้ผู้ใช้เลือกเวลาจอง เก็บใน slots.value
const fetchSlots = async () => {
  const res = await fetch("http://localhost:3000/slots", {
    headers: getAuthHeaders(),
  });
  slots.value = await res.json();
};

// โหลด "รายการบริการ" เช่น ล้างรถ เคลือบสี ดูดฝุ่น ฯลฯ เก็บลง services.value เพื่อให้ผู้ใช้กดเลือกบริการ
const fetchServices = async () => {
  const res = await fetch("http://localhost:3000/services", {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  services.value = data.data || [];
};

// โหลดข้อมูลการจองทั้งหมดจาก backend กรองเฉพาะรายการที่ สถานะ = confirmed (คือการจองที่ได้รับการอนุมัติแล้ว) เอาไปเช็คเวลาทับซ้อนใน availableSlots
const fetchConfirmedBookings = async () => {
  const res = await fetch("http://localhost:3000/bookings", {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  confirmedBookings.value = data.filter((b: any) => b.status === "confirmed");
};

/* ----------------- Submit Booking ----------------- */

const submitBooking = async () => {
  const userId = useCookie("id").value;   // ดึง userId จาก cookie
  if (!userId) return alert("กรุณาเข้าสู่ระบบใหม่");   // ถ้าไม่มี userId → ให้ล็อกอินใหม่

  // สร้าง payload สำหรับส่งไป backend
  const payload = {
    userId,
    bookingDate: date.value,
    status: "PENDING",
    description: "",
    services: selectedServices.value,
    slots: [
      {
        slotId: selectedSlot.value.slotId,
        startTime: `${date.value}T${selectedSlot.value.start}:00`,
        endTime: `${date.value}T${selectedSlot.value.end}:00`,
      },
    ],
  };

  // ส่งข้อมูลจองไป backend
  const res = await fetch("http://localhost:3000/bookings", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const booking = await res.json();

  // ถ้าจองไม่สำเร็จ
  if (!res.ok) return alert(booking.error || "จองไม่สำเร็จ");

  // ไปหน้า success
  router.push({
    path: "/user/booking-welcome",
    query: { bookingId: booking.id },
  });
};

/* ----------------- Init ----------------- */

// โหลดข้อมูลตอนเปิดหน้า
onMounted(async () => {
  await fetchSlots();
  await fetchServices();
  await fetchConfirmedBookings();
});

// เมื่อผู้ใช้เปลี่ยนวัน
watch(date, () => {
  selectedSlot.value = null;
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

.page-title {
  font-size: 1.4rem;
  color: #1e3a8a;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 1.5rem; /* เพิ่มระยะห่างล่างของทุก group */
  color: #334155;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  border-radius: 9999px;
  border: 2px solid #cbd5e1;
  background-color: #f8fafc;
  width: 260px; /* ลดความกว้างลง */
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: brightness(0) saturate(100%) invert(12%) sepia(70%) saturate(6883%)
    hue-rotate(209deg) brightness(90%) contrast(100%);
  cursor: pointer;
}

select {
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  border-radius: 9999px;
  border: 2px solid #cbd5e1;
  background-color: #f8fafc;
  height: 44px; /* ทำให้สูงเท่ากับ date-input */
  line-height: 1.2;
  width: 260px; /* เปลี่ยนจาก 100% เป็นขนาดพอดี */
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg fill='%231e3a8a' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
  scrollbar-color: #1e3a8a #f8fafc;
  scrollbar-width: thin;
}

select:focus,
.date-input:focus {
  border-color: #2563eb;
  background-color: #eff6ff;
  box-shadow: 0 0 6px #2563eb80;
  outline: none;
}

.status-text {
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-booked {
  color: #b91c1c;
}

.status-available {
  color: #15803d;
}

.time-select-group {
  margin-bottom: 2rem; /* เพิ่มห่างมากขึ้นเฉพาะอันนี้ */
}

.no-service {
  font-style: italic;
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.service-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.service-card.selected {
  border-color: #2563eb;
  background: #e0f2fe;
  font-weight: 600;
}

.service-content h3 {
  color: #1e3a8a;
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}

.service-content p {
  font-size: 0.9rem;
  color: #334155;
  margin-bottom: 0.4rem;
}

.price-duration {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2563eb;
}

.btn-submit {
  background: linear-gradient(to right, #2563eb, #3b82f6);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 9999px;
  padding: 0.7rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.3);
}

.btn-submit:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(to right, #1e3a8a, #2563eb);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.5);
}
.custom-dropdown {
  position: relative;
  width: 260px;
  font-size: 0.95rem;
}
.dropdown-selected {
  padding: 0.6rem 1rem;
  border-radius: 9999px;
  border: 2px solid #cbd5e1;
  background-color: #f8fafc;
  cursor: pointer;
}
.dropdown-options {
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
}
.dropdown-group-title {
  padding: 0.5rem 1rem;
  font-weight: 600;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-option {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-option:hover {
  background-color: #eff6ff;
}

.dropdown-option.booked {
  color: #b91c1c;
  text-decoration: line-through;
  cursor: not-allowed;
}
/* Animation classes */
@keyframes pop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-pop {
  animation: pop 0.4s ease-out;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}
.animate-hover:hover {
  transform: translateY(-4px);
  transition: all 0.3s ease;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
}

/* เพิ่มเงาเมื่อเลือก dropdown */
.dropdown-selected {
  transition: box-shadow 0.2s ease;
}
.dropdown-selected:focus,
.dropdown-selected:hover {
  box-shadow: 0 0 6px #2563eb80;
}

/* เพิ่มลูกเล่นตอน hover ปุ่ม */
.btn-submit span {
  display: inline-block;
  transition: transform 0.2s ease;
}
.btn-submit:hover span {
  transform: scale(1.05);
}
</style>
