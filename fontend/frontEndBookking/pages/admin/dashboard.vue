<template>
  <div class="page-container">
    <div class="content-wrapper">
      <h1 class="page-title">📋 รายการจองทั้งหมด</h1>

      <div class="date-filter-bar">
        <label class="date-label" for="filter-date">
          <span class="calendar-icon">📅</span> เลือกวันที่:
        </label>
        <input
          type="date"
          id="filter-date"
          v-model="selectedDate"
          @change="filterBookings"
          class="date-input"
        />
      </div>

      <div class="table-wrapper">
        <table class="booking-table">
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อลูกค้า</th>
              <th>วันที่จอง</th>
              <th>ช่องบริการ</th>
              <th>เริ่ม</th>
              <th>สิ้นสุด</th>
              <th>ระยะเวลา</th>
              <th>ราคา</th>
              <th>จำนวนบริการ</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="table-row"
              @click="openDetailModal(booking)"
            >
              <td>{{ booking.id }}</td>
              <td>{{ booking.customerName }}</td>
              <td>{{ new Date(booking.date).toLocaleDateString("th-TH") }}</td>
              <td class="center">{{ booking.slotName }}</td>
              <td>{{ booking.startTime }}</td>
              <td>{{ booking.endTime }}</td>
              <td class="center">{{ booking.duration }} นาที</td>
              <td class="center">{{ booking.totalPrice }} ฿</td>
              <td class="center">{{ booking.serviceCount }}</td>
              <td>
                <div class="status-action-wrapper">
                  <div
                    class="status-badge"
                    :class="statusColor(booking.editingStatus)"
                    @click.stop="toggleDropdown(booking.id)"
                  >
                    {{ displayStatus(booking.editingStatus) }}
                  </div>
                  <button
                    class="delete-btn"
                    @click.stop="deleteBooking(booking.id)"
                  >
                    🗑️
                  </button>
                  <ul v-if="openDropdown === booking.id" class="dropdown-menu">
                    <li
                      @click.stop="selectStatus(booking, 'pending')"
                      class="dropdown-item"
                    >
                      🕓 รออนุมัติ
                    </li>
                    <li
                      @click.stop="selectStatus(booking, 'confirmed')"
                      class="dropdown-item"
                    >
                      ✅ ยืนยันแล้ว
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="filteredBookings.length === 0">
              <td colspan="10" class="no-bookings">
                ไม่มีรายการจองในวันที่เลือก
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="showPopup" class="popup-overlay">
        <div class="popup-content">
          <span class="popup-icon">✅</span>
          <p class="popup-message">อัปเดตสถานะสำเร็จแล้ว</p>
          <button class="popup-close-btn" @click="showPopup = false">
            ปิด
          </button>
        </div>
      </div>

      <teleport to="body">
        <div
          v-if="showDetailModal"
          class="modal-overlay"
          @click.self="closeDetailModal"
        >
          <div class="modal-content">
            <h3 class="modal-title">📋 รายละเอียดการจอง</h3>
            <div class="detail-grid">
              <div
                class="detail-item"
                v-for="(value, label) in bookingDetailMap"
                :key="label"
              >
                <span class="detail-line">
                  <span class="detail-label">📌 {{ label }}:</span>
                  <span class="detail-value">{{ value }}</span>
                </span>
              </div>
            </div>
            <div class="services-section">
              <h4 class="services-title">🛠️ รายการบริการ:</h4>
              <ul class="services-list">
                <li
                  v-for="service in selectedBooking?.services"
                  :key="service.id"
                  class="service-item"
                >
                  <span class="service-name">🔧 {{ service.sName }}</span>
                  <span class="service-details"
                    >({{ service.durationMinutes }} นาที,
                    {{ service.price }} ฿)</span
                  >
                </li>
                <li
                  v-if="!selectedBooking?.services?.length"
                  class="no-services"
                >
                  ไม่มีบริการ
                </li>
              </ul>
            </div>
            <div class="modal-footer">
              <button class="modal-close-btn" @click="closeDetailModal">
                ปิด
              </button>
            </div>
          </div>
        </div>
      </teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
definePageMeta({ layout: "admin" });

interface Service {
  id: number;
  sName: string;
  description: string;
  price: number;
  durationMinutes: number;
}

interface Booking {
  id: number;
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  serviceCount: number;
  slotName: string;
  status: string;
  editingStatus: string;
  services: Service[];
}

const bookings = ref<Booking[]>([]);
const selectedDate = ref<string>("");
const openDropdown = ref<number | null>(null);
const showPopup = ref<boolean>(false);
const showDetailModal = ref<boolean>(false);
const selectedBooking = ref<Booking | null>(null);

const bookingDetailMap = computed(() => {
  if (!selectedBooking.value) return {};
  return {
    รหัส: selectedBooking.value.id,
    ชื่อลูกค้า: selectedBooking.value.customerName,
    วันที่จอง: new Date(selectedBooking.value.date).toLocaleDateString("th-TH"),
    ช่องบริการ: selectedBooking.value.slotName,
    เวลาเริ่ม: selectedBooking.value.startTime,
    เวลาสิ้นสุด: selectedBooking.value.endTime,
    ระยะเวลา: `${selectedBooking.value.duration} นาที`,
    ราคารวม: `${selectedBooking.value.totalPrice} ฿`,
    จำนวนบริการ: selectedBooking.value.serviceCount,
    สถานะ: displayStatus(selectedBooking.value.editingStatus),
  };
});

function toggleDropdown(id: number) {
  openDropdown.value = openDropdown.value === id ? null : id;
}

function displayStatus(status: string) {
  return status === "pending"
    ? "รออนุมัติ"
    : status === "confirmed"
    ? "ยืนยันแล้ว"
    : "รอยืนยัน";
}

function statusColor(status: string) {
  return status === "pending"
    ? "status-pending"
    : status === "confirmed"
    ? "status-confirmed"
    : "status-pending";
}

async function deleteBooking(id: number) {
  if (!confirm("คุณแน่ใจว่าต้องลบการจองนี้หรือไม่?")) return;
  const token = localStorage.getItem("authToken");
  const res = await fetch(`http://localhost:3000/bookings/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) return alert("ลบไม่สำเร็จ");
  bookings.value = bookings.value.filter((b) => b.id !== id);
  alert("ลบการจองแล้ว");
}

function selectStatus(booking: Booking, status: string) {
  booking.editingStatus = status;
  booking.status = status;
  openDropdown.value = null;
  updateBookingStatus(booking.id, status);
}

async function updateBookingStatus(id: number, status: string) {
  const token = localStorage.getItem("authToken");

  // ✅ เพิ่มบรรทัดนี้เพื่อเช็กว่า token มีหรือเปล่า
  console.log("TOKEN:", token);

  const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ต้องไม่เป็น null
    },
    body: JSON.stringify({ status }),
  });

  if (res.ok) {
    showPopup.value = true;
    setTimeout(() => {
      showPopup.value = false;
    }, 3000);
    await fetchBookings();
  }
}

function openDetailModal(booking: Booking) {
  selectedBooking.value = booking;
  showDetailModal.value = true;
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedBooking.value = null;
}

function mapBooking(raw: any): Booking {
  const slots = raw.bookingSlots || [];
  const services = raw.bookingServices || [];
  const minStart = slots.length
    ? new Date(
        Math.min(...slots.map((s: any) => new Date(s.startTime).getTime()))
      )
    : null;
  const totalDuration = services.reduce(
    (sum: number, bs: any) => sum + (bs.service?.durationMinutes || 0),
    0
  );
  const totalPrice = services.reduce(
    (sum: number, bs: any) => sum + (bs.service?.price || 0),
    0
  );
  const calculatedEnd = minStart
    ? new Date(minStart.getTime() + totalDuration * 60000)
    : null;

  return {
    id: raw.id,
    customerName: raw.user?.uName || "ไม่ระบุชื่อ",
    date: raw.bookingDate,
    startTime:
      minStart?.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }) || "-",
    endTime:
      calculatedEnd?.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }) || "-",
    duration: totalDuration,
    totalPrice,
    serviceCount: services.length,
    slotName: slots[0]?.slot?.slotName || "-",
    status: raw.status,
    editingStatus: raw.status ?? "",
    services: services.map((bs: any) => bs.service || {}),
  };
}

async function fetchBookings() {
  const res = await fetch("http://localhost:3000/bookings", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });
  const data = await res.json();
  const bookingList = Array.isArray(data) ? data : data.data; // ใช้ .data ถ้ามี

  if (!Array.isArray(bookingList)) {
    throw new Error("ข้อมูล booking ไม่ถูกต้อง");
  }

  bookings.value = bookingList.map(mapBooking); // ❗ แก้ตรงนี้

  console.log("Booking response:", data);
}

function filterBookings() {}

const filteredBookings = computed(() => {
  if (!selectedDate.value) return bookings.value;
  return bookings.value.filter((b) => b.date.startsWith(selectedDate.value));
});

onMounted(fetchBookings);
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
  font-size: 1.8rem;
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
  filter: brightness(0) saturate(100%) invert(12%) sepia(70%) saturate(6883%)
    hue-rotate(209deg) brightness(90%) contrast(100%);
  cursor: pointer;
  height: 14px;
  width: 14px;
  color: #1e3a8a;
}

.table-wrapper {
  overflow-x: auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.booking-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
}

.booking-table th {
  background: #f1f5f9;
  color: #1e3a8a;
  padding: 0.75rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.booking-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  color: #334155;
  font-weight: 500;
}

.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-pending {
  background: #fef9c3;
  color: #92400e;
}

.status-badge {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  display: inline-block;
  min-width: 64px;
  text-align: center;
}

.no-bookings {
  text-align: center;
  font-style: italic;
  font-weight: 500;
  color: #94a3b8;
  padding: 1rem;
}

.modal-close-btn,
.popup-close-btn {
  background: #1e3a8a;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
}

.status-action-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  z-index: 10;
  min-width: 120px;
}
.dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #1e3a8a;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 1.75rem;
  max-width: 650px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.3s ease;
  color: #1e293b;
  font-family: "Kanit", sans-serif;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e3a8a;
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 2rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 1.25rem;
}

.detail-label {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

.detail-value {
  color: #334155;
  font-size: 0.95rem;
  padding-left: 0.25rem;
}

.services-section {
  margin-bottom: 2rem;
}

.services-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.services-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-item {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  background: #f8fafc;
  font-size: 0.95rem;
  color: #334155;
  transition: background 0.2s;
}

.service-item:hover {
  background: #e0f2fe;
}

.modal-footer {
  text-align: center;
  margin-top: 2rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
