<script setup lang="ts">

definePageMeta({ layout: 'admin' })
import { ref, onMounted } from "vue";

interface Service {
  id: number;
  name: string;
  duration: number;
}

interface Booking {
  id: number;
  customerName: string;
  date: string;
  timeSlot: string;
  status: string;
  services: Service[];
  editingStatus?: string;
}

const bookings = ref<Booking[]>([]);

function mapStatus(status: string): string {
  if (status === "confirmed") return "ยืนยันแล้ว";
  if (status === "pending") return "รออนุมัติ";
  if (status === "cancel") return "ยกเลิกแล้ว";
  return status;
}

function formatTimeSlot(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return `${start.getHours()}:${start.getMinutes().toString().padStart(2, "0")} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, "0")}`;
}

function mapBooking(rawBooking: any): Booking {
  return {
    id: rawBooking.id,
    customerName: rawBooking.user?.uName || "ไม่ระบุชื่อ",
    date: rawBooking.bookingDate,
    timeSlot:
      rawBooking.bookingSlots && rawBooking.bookingSlots.length > 0
        ? formatTimeSlot(rawBooking.bookingSlots[0].startTime, rawBooking.bookingSlots[0].endTime)
        : "-",
    status: mapStatus(rawBooking.status),
    editingStatus: rawBooking.status,
    services: Array.isArray(rawBooking.bookingServices)
      ? rawBooking.bookingServices.map((bs: any) => ({
          id: bs.service.id,
          name: bs.service.sName,
          duration: bs.service.durationMinutes,
        }))
      : [],
  };
}

async function fetchBookings() {
  try {
    const res = await fetch("http://localhost:3000/bookings");
    const data = await res.json();
    bookings.value = data.map(mapBooking);
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

async function updateBookingStatus(bookingId: number, newStatus: string) {
  try {
    const res = await fetch(`http://localhost:3000/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error("Failed to update status");

    const booking = bookings.value.find((b) => b.id === bookingId);
    if (booking) {
      booking.status = mapStatus(newStatus);
      booking.editingStatus = undefined;
    }

    alert("อัปเดตสถานะสำเร็จ");
  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
  }
}

onMounted(() => {
  fetchBookings();
});
</script>

<template>
  <div class="container">
    <h2>รายการจอง</h2>

    <table class="booking-table">
      <thead>
        <tr>
          <th>รหัสการจอง</th>
          <th>ชื่อลูกค้า</th>
          <th>วันที่</th>
          <th>เวลาที่จอง</th>
          <th>สถานะ</th>
          <th>บริการที่เลือก</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id">
          <td>{{ booking.id }}</td>
          <td>{{ booking.customerName }}</td>
          <td>{{ new Date(booking.date).toLocaleDateString() }}</td>
          <td>{{ booking.timeSlot }}</td>
          <td>
            <div class="status-control" v-if="booking.status === 'รออนุมัติ'">
              <select v-model="booking.editingStatus" class="status-select">
                <option value="pending">รออนุมัติ</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="cancel">ยกเลิกแล้ว</option>
              </select>
              <button
                class="confirm-btn"
                @click="updateBookingStatus(booking.id, booking.editingStatus || 'pending')"
              >
                Confirm
              </button>
            </div>
            <div v-else>
              {{ booking.status }}
            </div>
          </td>
          <td>
            <ul>
              <li v-for="service in booking.services" :key="service.id">
                {{ service.name }} ({{ service.duration }} นาที)
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #444;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 700;
  font-size: 1.8rem;
  color: #1f2937;
}

.booking-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  font-size: 0.95rem;
}

.booking-table thead tr {
  background-color: transparent;
  box-shadow: none;
}

.booking-table th {
  text-align: left;
  padding: 12px 15px;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.booking-table tbody tr {
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  transition: background-color 0.3s ease;
}

.booking-table tbody tr:hover {
  background-color: #e0f2fe;
}

.booking-table td {
  padding: 12px 15px;
  color: #4b5563;
  vertical-align: middle;
}

.booking-table ul {
  padding-left: 1.2rem;
  margin: 0;
  color: #6b7280;
}

.booking-table li {
  list-style-type: disc;
  margin-bottom: 4px;
}

.status-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  font-size: 0.9rem;
  color: #374151;
}

.confirm-btn {
  padding: 6px 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.confirm-btn:hover {
  background-color: #059669;
}

@media (max-width: 600px) {
  .booking-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
