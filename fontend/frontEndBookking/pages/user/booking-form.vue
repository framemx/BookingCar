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

const date = ref("");
const selectedSlot = ref<any>(null);
const selectedServices = ref<number[]>([]);
const services = ref<any[]>([]);
const slots = ref<any[]>([]);
const confirmedBookings = ref<any[]>([]);
const dropdownOpen = ref(false);

/* ---------------- AUTH: ใช้ Cookie แทน localStorage ---------------- */

function getAuthHeaders() {
  const token = useCookie("token").value;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/* ----------------- Dropdown ----------------- */

const toggleDropdown = () => (dropdownOpen.value = !dropdownOpen.value);

const selectSlot = (slot: any) => {
  if (slot.booked) return;
  selectedSlot.value = slot;
  dropdownOpen.value = false;
};

const selectedSlotLabel = computed(() =>
  selectedSlot.value
    ? `${selectedSlot.value.start} - ${selectedSlot.value.end}`
    : ""
);

/* ----------------- Date ----------------- */

const minDate = new Date().toISOString().slice(0, 10);

/* ----------------- Time Helpers ----------------- */

const timeToMinutes = (t: string) =>
  t.split(":").map(Number).reduce((h, m) => h * 60 + m);

const minutesToTime = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
    2,
    "0"
  )}`;

const generateHourlySlots = (start: string, end: string) => {
  const out = [];
  let s = timeToMinutes(start);
  let e = timeToMinutes(end);
  for (let i = s; i < e; i += 60) {
    out.push({
      start: minutesToTime(i),
      end: minutesToTime(Math.min(i + 60, e)),
    });
  }
  return out;
};

/* ----------------- Available Slots ----------------- */

const availableSlots = computed(() => {
  if (!date.value) return [];

  return slots.value
    .filter((s) => s.date === date.value)
    .flatMap((slot) => {
      const hourly = generateHourlySlots(slot.startTime, slot.endTime).map(
        (h) => ({
          ...h,
          slotId: slot.id,
          slotName: slot.slotName,
        })
      );

      return hourly.map((hour) => {
        const start = new Date(`${date.value}T${hour.start}:00`);
        const end = new Date(`${date.value}T${hour.end}:00`);

        const isBooked = confirmedBookings.value.some((b: any) => {
          if (
            b.status !== "confirmed" ||
            !b.bookingSlots?.some((bs: any) => bs.slotId === slot.id)
          ) {
            return false;
          }

          const bookingStart = new Date(
            Math.min(
              ...b.bookingSlots.map((bs: any) =>
                new Date(bs.startTime).getTime()
              )
            )
          );

          const totalDuration =
            b.bookingServices?.reduce(
              (sum: number, bs: any) =>
                sum + (bs.service?.durationMinutes || 0),
              0
            ) || 0;

          const bookingEnd = new Date(
            bookingStart.getTime() + totalDuration * 60000
          );

          return bookingStart < end && bookingEnd > start;
        });

        return { ...hour, booked: isBooked };
      });
    });
});

/* ----------------- Group Slots (แก้ error ตัวแดง) ----------------- */

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

const totalDuration = computed(() =>
  selectedServices.value.reduce((sum, id) => {
    const svc = services.value.find((s) => s.id === id);
    return svc ? sum + svc.durationMinutes : sum;
  }, 0)
);

const totalPrice = computed(() =>
  selectedServices.value.reduce((sum, id) => {
    const svc = services.value.find((s) => s.id === id);
    return svc ? sum + svc.price : sum;
  }, 0)
);

const canSubmit = computed(
  () =>
    date.value &&
    selectedSlot.value &&
    selectedServices.value.length > 0 &&
    !selectedSlot.value.booked
);

/* ----------------- Fetch APIs ----------------- */

const fetchSlots = async () => {
  const res = await fetch("http://localhost:3000/slots", {
    headers: getAuthHeaders(),
  });
  slots.value = await res.json();
};

const fetchServices = async () => {
  const res = await fetch("http://localhost:3000/services", {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  services.value = data.data || [];
};

const fetchConfirmedBookings = async () => {
  const res = await fetch("http://localhost:3000/bookings", {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  confirmedBookings.value = data.filter((b: any) => b.status === "confirmed");
};

/* ----------------- Submit Booking ----------------- */

const submitBooking = async () => {
  const userId = useCookie("id").value;
  if (!userId) return alert("กรุณาเข้าสู่ระบบใหม่");

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

  const res = await fetch("http://localhost:3000/bookings", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const booking = await res.json();

  if (!res.ok) return alert(booking.error || "จองไม่สำเร็จ");

  router.push({
    path: "/user/booking-welcome",
    query: { bookingId: booking.id },
  });
};

/* ----------------- Init ----------------- */

onMounted(async () => {
  await fetchSlots();
  await fetchServices();
  await fetchConfirmedBookings();
});

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
