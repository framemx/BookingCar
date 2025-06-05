<template>
  <div class="container">
    <h2>📋 รายการจอง</h2>

    <table class="booking-table">
      <thead>
        <tr>
          <th>รหัส</th>
          <th>ชื่อลูกค้า</th>
          <th>วันที่</th>
          <th>เวลา</th>
          <th>สถานะ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id">
          <td>{{ booking.id }}</td>
          <td>{{ booking.customerName }}</td>
          <td>{{ new Date(booking.date).toLocaleDateString("th-TH") }}</td>
          <td>{{ booking.timeSlot }}</td>
          <td>
            <div class="status-wrapper">
              <div
                class="status-badge"
                :class="statusColor(booking.editingStatus)"
                @click="toggleDropdown(booking.id)"
              >
                {{ displayStatus(booking.editingStatus) }}
              </div>

              <ul v-if="openDropdown === booking.id" class="dropdown-menu">
                <li @click="selectStatus(booking, 'pending')">🕓 รออนุมัติ</li>
                <li @click="selectStatus(booking, 'confirmed')">✅ ยืนยันแล้ว</li>
              </ul>
            </div>

            <button class="delete-btn" @click="deleteBooking(booking.id)">
              🗑️
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
definePageMeta({ layout: "admin" });

interface Booking {
  id: number;
  customerName: string;
  date: string;
  timeSlot: string;
  status: string;
  editingStatus: string;
}

const bookings = ref<Booking[]>([]);
const openDropdown = ref<number | null>(null);

function toggleDropdown(id: number) {
  openDropdown.value = openDropdown.value === id ? null : id;
}

function displayStatus(status: string) {
  if (status === "pending") return "รออนุมัติ";
  if (status === "confirmed") return "ยืนยันแล้ว";
  return "รอยืนยัน";
}

function statusColor(status: string) {
  if (status === "pending") return "bg-yellow";
  if (status === "confirmed") return "bg-green";
  return "bg-gray";
}

async function deleteBooking(id: number) {
  if (!confirm("คุณแน่ใจว่าต้องการลบการจองนี้หรือไม่?")) return;

  try {
    const res = await fetch(`http://localhost:3000/bookings/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("ลบไม่สำเร็จ");

    bookings.value = bookings.value.filter((b) => b.id !== id);
    alert("ลบการจองเรียบร้อยแล้ว");
  } catch (err) {
    console.error("Error deleting booking:", err);
    alert("เกิดข้อผิดพลาดในการลบ");
  }
}

function selectStatus(booking: Booking, status: string) {
  booking.editingStatus = status;
  booking.status = status;
  openDropdown.value = null;
  updateBookingStatus(booking.id, status);
}

async function updateBookingStatus(id: number, status: string) {
  try {
    const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update");
    alert("อัปเดตสถานะสำเร็จ");
  } catch (e) {
    console.error(e);
    alert("เกิดข้อผิดพลาด");
  }
}

function formatTimeSlot(startTime: string): string {
  const start = new Date(startTime);
  return `${start.getHours()}:${start
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function mapBooking(raw: any): Booking {
  return {
    id: raw.id,
    customerName: raw.user?.uName || "ไม่ระบุชื่อ",
    date: raw.bookingDate,
    timeSlot:
      raw.bookingSlots?.length > 0
        ? formatTimeSlot(raw.bookingSlots[0].startTime)
        : "-",
    status: raw.status,
    editingStatus: raw.status ?? "",
  };
}

async function fetchBookings() {
  const res = await fetch("http://localhost:3000/bookings");
  const data = await res.json();
  bookings.value = data.map(mapBooking);
}

onMounted(fetchBookings);
</script>

<style scoped>
.container {
  max-width: 920px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  font-family: "Sarabun", sans-serif;
}

h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.booking-table th,
.booking-table td {
  padding: 14px 16px;
  text-align: left;
}

.booking-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.booking-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.booking-table tbody tr:hover {
  background-color: #f0f9ff;
}

.status-wrapper {
  position: relative;
  display: inline-block;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 9999px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
  min-width: 110px;
  text-align: center;
  transition: background-color 0.3s;
}

.bg-yellow {
  background-color: #facc15;
  color: #000;
}

.bg-green {
  background-color: #10b981;
}

.bg-gray {
  background-color: #9ca3af;
}

.dropdown-menu {
  position: absolute;
  top: 110%;
  left: 0;
  background-color: #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  overflow: hidden;
  min-width: 160px;
  z-index: 100;
  margin-top: 6px;
  padding: 0;
  list-style: none;
}

.dropdown-menu li {
  padding: 12px 18px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-menu li:hover {
  background-color: #f3f4f6;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #dc2626;
  margin-left: 6px;
}

.delete-btn:hover {
  color: #b91c1c;
}
</style>
