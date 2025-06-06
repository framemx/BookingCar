<template>
  <div class="container">
    <h2 class="title">📋 รายการจองทั้งหมด</h2>

    <div class="filter-section">
      <label for="filter-date" class="filter-label">เลือกวันที่:</label>
      <div class="date-picker-wrapper">
        <input type="date" id="filter-date" v-model="selectedDate" @change="filterBookings" class="filter-input" />
        <span class="calendar-icon">📅</span>
      </div>
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
          <tr v-for="booking in filteredBookings" :key="booking.id" class="table-row" @click="openDetailModal(booking)">
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
              <div class="status-wrapper">
                <div class="status-badge" :class="statusColor(booking.editingStatus)" @click.stop="toggleDropdown(booking.id)">
                  {{ displayStatus(booking.editingStatus) }}
                </div>
                <ul v-if="openDropdown === booking.id" class="dropdown-menu">
                  <li @click.stop="selectStatus(booking, 'pending')" class="dropdown-item">🕓 รออนุมัติ</li>
                  <li @click.stop="selectStatus(booking, 'confirmed')" class="dropdown-item">✅ ยืนยันแล้ว</li>
                </ul>
              </div>
              <button class="delete-btn" @click.stop="deleteBooking(booking.id)">🗑️</button>
            </td>
          </tr>
          <tr v-if="filteredBookings.length === 0">
            <td colspan="10" class="no-data">ไม่มีรายการจองในวันที่เลือก</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Popup for Success Notification -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup-content">
        <span class="popup-icon">✅</span>
        <p class="popup-message">อัปเดตสถานะสำเร็จแล้ว</p>
        <button class="popup-close-btn" @click="showPopup = false">ปิด</button>
      </div>
    </div>

    <!-- Modal for Booking Details -->
    <teleport to="body">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-content">
          <h3 class="modal-title">📋 รายละเอียดการจอง</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">รหัส:</span>
              <span class="detail-value">{{ selectedBooking?.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ชื่อลูกค้า:</span>
              <span class="detail-value">{{ selectedBooking?.customerName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">วันที่จอง:</span>
              <span class="detail-value">{{ selectedBooking?.date ? new Date(selectedBooking.date).toLocaleDateString("th-TH") : '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ช่องบริการ:</span>
              <span class="detail-value">{{ selectedBooking?.slotName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">เวลาเริ่ม:</span>
              <span class="detail-value">{{ selectedBooking?.startTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">เวลาสิ้นสุด:</span>
              <span class="detail-value">{{ selectedBooking?.endTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ระยะเวลา:</span>
              <span class="detail-value">{{ selectedBooking?.duration }} นาที</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ราคารวม:</span>
              <span class="detail-value">{{ selectedBooking?.totalPrice }} ฿</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">จำนวนบริการ:</span>
              <span class="detail-value">{{ selectedBooking?.serviceCount }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">สถานะ:</span>
              <span class="detail-value">{{ displayStatus(selectedBooking?.editingStatus) }}</span>
            </div>
          </div>
          <div class="services-section">
            <h4 class="services-title">รายการบริการ:</h4>
            <ul class="services-list">
              <li v-for="service in selectedBooking?.services" :key="service.id" class="service-item">
                <span class="service-name">{{ service.sName }}</span>
                <span class="service-details">
                  ({{ service.durationMinutes }} นาที, {{ service.price }} ฿)
                </span>
              </li>
              <li v-if="!selectedBooking?.services?.length" class="no-services">ไม่มีบริการ</li>
            </ul>
          </div>
          <button class="modal-close-btn" @click="closeDetailModal">ปิด</button>
        </div>
      </div>
    </teleport>
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

function toggleDropdown(id: number) {
  openDropdown.value = openDropdown.value === id ? null : id;
}

function displayStatus(status: string) {
  return status === "pending" ? "รออนุมัติ" : status === "confirmed" ? "ยืนยันแล้ว" : "รอยืนยัน";
}

function statusColor(status: string) {
  return status === "pending" ? "bg-yellow" : status === "confirmed" ? "bg-green" : "bg-gray";
}

async function deleteBooking(id: number) {
  if (!confirm("คุณแน่ใจว่าต้องลบการจองนี้หรือไม่?")) return;
  const res = await fetch(`http://localhost:3000/bookings/${id}`, { method: "DELETE" });
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
  const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
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
  const minStart = slots.length ? new Date(Math.min(...slots.map((s: any) => new Date(s.startTime).getTime()))) : null;
  const totalDuration = services.reduce((sum: number, bs: any) => sum + (bs.service?.durationMinutes || 0), 0);
  const totalPrice = services.reduce((sum: number, bs: any) => sum + (bs.service?.price || 0), 0);
  const calculatedEnd = minStart ? new Date(minStart.getTime() + totalDuration * 60000) : null;

  return {
    id: raw.id,
    customerName: raw.user?.uName || "ไม่ระบุชื่อ",
    date: raw.bookingDate,
    startTime: minStart?.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) || "-",
    endTime: calculatedEnd?.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) || "-",
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
  const res = await fetch("http://localhost:3000/bookings");
  const data = await res.json();
  bookings.value = data.map(mapBooking);
}

function filterBookings() {
  // triggered on input change, used only for reactivity
}

const filteredBookings = computed(() => {
  if (!selectedDate.value) return bookings.value;
  return bookings.value.filter((b) => b.date.startsWith(selectedDate.value));
});

onMounted(fetchBookings);
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-family: "Sarabun", sans-serif;
  position: relative;
}

.title {
  font-size: 2.25rem;
  color: #1e3a8a;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.filter-label {
  font-size: 1rem;
  color: #1e3a8a;
  font-weight: 500;
}

.date-picker-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-input {
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
  width: 200px;
}

.filter-input:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  background: #ffffff;
}

.filter-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.calendar-icon {
  position: absolute;
  right: 0.75rem;
  font-size: 1.25rem;
  color: #1e3a8a;
  pointer-events: none;
  transition: color 0.2s;
}

.filter-input:hover + .calendar-icon,
.filter-input:focus + .calendar-icon {
  color: #1d4ed8;
}

.table-wrapper {
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.booking-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.95rem;
}

.booking-table th {
  background: #eff6ff;
  color: #1e3a8a;
  padding: 1rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid #bfdbfe;
}

.booking-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
  vertical-align: middle;
}

.table-row {
  transition: background-color 0.2s;
  cursor: pointer;
}

.table-row:hover {
  background-color: #e0e7ff;
}

.booking-table td.center {
  text-align: center;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.status-wrapper {
  position: relative;
  display: inline-block;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 100px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bg-yellow {
  background-color: #facc15;
  color: #1f2937;
}

.bg-green {
  background-color: #10b981;
}

.bg-gray {
  background-color: #9ca3af;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #ffffff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  z-index: 1000;
  margin-top: 0.5rem;
  min-width: 160px;
  list-style: none;
  padding: 0.5rem 0;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #eff6ff;
  color: #1e3a8a;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #ef4444;
  transition: color 0.2s, transform 0.2s;
  margin-left: 0.5rem;
}

.delete-btn:hover {
  color: #b91c1c;
  transform: scale(1.1);
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.popup-content {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 350px;
  width: 100%;
  animation: popupFadeIn 0.3s ease-in-out;
}

.popup-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.popup-message {
  font-size: 1.1rem;
  color: #1e3a8a;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.popup-close-btn {
  background: #1e3a8a;
  color: #ffffff;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.popup-close-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

/* Modal for Booking Details */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: #ffffff;
  padding: 2rem 3rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  animation: popupFadeIn 0.3s ease-in-out;
}

.modal-title {
  font-size: 1.75rem;
  color: #1e3a8a;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

.detail-value {
  color: #334155;
  font-size: 1rem;
}

.services-section {
  margin-bottom: 2rem;
}

.services-title {
  font-size: 1.25rem;
  color: #1e3a8a;
  font-weight: 600;
  margin-bottom: 1rem;
}

.services-list {
  list-style: none;
  padding: 0;
}

.service-item {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-name {
  font-weight: 500;
  color: #1e293b;
}

.service-details {
  color: #6b7280;
  font-size: 0.875rem;
}

.no-services {
  color: #6b7280;
  font-style: italic;
  padding: 0.75rem;
  text-align: center;
}

.modal-close-btn {
  background: #1e3a8a;
  color: #ffffff;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  transition: background 0.2s, transform 0.2s;
}

.modal-close-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

@keyframes popupFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>