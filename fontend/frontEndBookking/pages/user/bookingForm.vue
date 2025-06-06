<template>
       <div class="container">
         <h1 class="heading">📅 จองคิวบริการ</h1>

         <form @submit.prevent="submitBooking" class="form">
           <!-- เลือกวันที่ -->
           <div class="form-group">
             <label for="date">เลือกวันที่</label>
             <input type="date" id="date" v-model="date" :min="minDate" required />
           </div>

           <!-- เลือก slot + เวลา -->
           <div class="form-group">
             <label for="slot">เลือกเวลาที่ต้องการ</label>
             <select id="slot" v-model="selectedSlot" required>
               <option value="" disabled>-- กรุณาเลือกเวลา --</option>
               <option
                 v-for="slot in availableSlots"
                 :key="slot.slotId + slot.start"
                 :value="slot"
                 :disabled="slot.booked"
                 :class="{ 'available': !slot.booked, 'booked': slot.booked }"
               >
                 Slot {{ slot.slotName }} : เวลา {{ slot.start }} - {{ slot.end }} ({{ slot.booked ? 'จองแล้ว' : 'ว่าง' }})
               </option>
             </select>
             <p v-if="availableSlots.length === 0" class="error-message">ไม่มีเวลาให้เลือกสำหรับวันที่นี้</p>
           </div>

           <!-- บริการ -->
           <div class="form-group">
             <label>เลือกบริการ</label>
             <div class="services-grid">
               <label
                 v-for="service in services"
                 :key="service.id"
                 class="service-card"
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
             <p v-if="services.length === 0" class="no-service">ไม่มีบริการให้เลือก</p>
           </div>

           <!-- รวมและราคา -->
           <div class="summary" v-if="selectedServices.length > 0">
             <p>⏰ เวลารวม: <strong>{{ totalDuration }}</strong> นาที</p>
             <p>💰 ราคาทั้งหมด: <strong>{{ totalPrice }}</strong> บาท</p>
           </div>

           <button class="btn-submit" :disabled="!canSubmit" type="submit">ยืนยันการจอง</button>
         </form>
       </div>
     </template>

     <script setup lang="ts">
     import { ref, computed, onMounted, watch } from "vue";
     import { useRouter } from "vue-router";

     definePageMeta({ layout: "user" });

     const router = useRouter();
     const date = ref("");
     const selectedSlot = ref(null);
     const selectedServices = ref<number[]>([]);
     const services = ref([]);
     const slots = ref([]);
     const userBookings = ref([]);
     const minDate = new Date().toISOString().slice(0, 10);

     const timeToMinutes = (t: string) =>
       t.split(":").map(Number).reduce((h, m) => h * 60 + m);
     const minutesToTime = (m: number) =>
       `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

     const generateHourlySlots = (start: string, end: string) => {
       const out = [], s = timeToMinutes(start), e = timeToMinutes(end);
       for (let i = s; i < e; i += 60)
         out.push({
           start: minutesToTime(i),
           end: minutesToTime(Math.min(i + 60, e)),
         });
       return out;
     };

     const availableSlots = computed(() => {
       if (!date.value) return [];
       return slots.value
         .filter((s) => s.date === date.value)
         .flatMap((slot) => {
           const hourlySlots = generateHourlySlots(slot.startTime, slot.endTime).map((s) => ({
             ...s,
             slotId: slot.id,
             slotName: slot.slotName,
           }));
           return hourlySlots.map((hourlySlot) => {
             const startTime = new Date(`${date.value}T${hourlySlot.start}:00`);
             const endTime = new Date(`${date.value}T${hourlySlot.end}:00`);
             const isBooked = userBookings.value.some((booking) => {
               if (booking.status !== "confirmed" || !booking.bookingSlots?.some((bs) => bs.slotId === slot.id)) {
                 return false;
               }
               const bookingStart = new Date(
                 Math.min(...booking.bookingSlots.map((bs) => new Date(bs.startTime).getTime()))
               );
               const totalDuration = booking.bookingServices?.reduce(
                 (sum, bs) => sum + (bs.service?.durationMinutes || 0),
                 0
               ) || 0;
               const bookingEnd = new Date(bookingStart.getTime() + totalDuration * 60000);
               return bookingStart < endTime && bookingEnd > startTime;
             });
             return { ...hourlySlot, booked: isBooked };
           });
         });
     });

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
       () => date.value && selectedSlot.value && selectedServices.value.length > 0 && !selectedSlot.value.booked
     );

     const fetchSlots = async () => {
       const res = await fetch("http://localhost:3000/slots");
       if (!res.ok) return alert("โหลด slot ไม่สำเร็จ");
       slots.value = await res.json();
     };

     const fetchServices = async () => {
       const res = await fetch("http://localhost:3000/services");
       const data = await res.json();
       services.value = data.data || [];
     };

     const fetchUserBookings = async () => {
       const userData = JSON.parse(localStorage.getItem("userData") || "{}");
       const userEmail = userData.email || "-";
       const res = await fetch("http://localhost:3000/bookings");
       const data = await res.json();
       userBookings.value = data.filter((b) => b.user?.email === userEmail);
     };

     const submitBooking = async () => {
       const userData = JSON.parse(localStorage.getItem("userData") || "{}");
       if (!userData?.id) return alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ");

       const payload = {
         userId: userData.id,
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
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
       });

       const booking = await res.json();
       if (!res.ok) return alert(booking.error || "จองไม่สำเร็จ");

       router.push({ path: "/user/bookingWelcome", query: { bookingId: booking.id } });
     };

     onMounted(async () => {
       await fetchSlots();
       await fetchServices();
       await fetchUserBookings();
     });

     watch(date, () => {
       selectedSlot.value = null;
     });
     </script>

     <style scoped>
     @import url("https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap");

     .container {
       max-width: 900px;
       margin: 2.5rem auto;
       padding: 2.5rem 3rem;
       background: #f9fcff;
       border-radius: 15px;
       box-shadow: 0 10px 25px rgba(0, 123, 255, 0.22);
       font-family: "Sarabun", sans-serif;
       color: #102a43;
       user-select: none;
     }

     .heading {
       text-align: center;
       color: #1e40af;
       font-weight: 700;
       font-size: 2rem;
       margin-bottom: 1.8rem;
       letter-spacing: 1.1px;
     }

     .form {
       display: flex;
       flex-direction: column;
       gap: 1.4rem;
     }

     .form-group {
       display: flex;
       flex-direction: column;
     }

     .form-group label {
       font-weight: 600;
       margin-bottom: 6px;
       color: #334e68;
       font-size: 1.1rem;
       user-select: none;
     }

     input[type="date"],
     select {
       padding: 0.6rem 1rem;
       font-size: 1rem;
       border-radius: 10px;
       border: 1.8px solid #bfd7ff;
       background-color: #f0f8ff;
       color: #102a43;
       transition: all 0.3s ease;
       outline-offset: 3px;
     }

     input[type="date"]:focus,
     select:focus {
       border-color: #3b82f6;
       background-color: #dbeafe;
       box-shadow: 0 0 8px #3b82f6aa;
       outline: none;
     }

     select option.available {
       color: #10b981;
       background-color: #ecfdf5;
     }

     select option.booked {
       color: #dc2626;
       background-color: #fee2e2;
       opacity: 0.6;
     }

     .services-grid {
       display: grid;
       grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
       gap: 28px;
       max-height: none !important;
       overflow-y: visible !important;
       user-select: none;
     }

     .service-card {
       position: relative;
       background: white;
       border: 2px solid transparent;
       border-radius: 16px;
       box-shadow: 0 6px 14px rgb(37 99 235 / 0.18);
       padding: 28px 32px 34px;
       cursor: pointer;
       display: flex;
       flex-direction: column;
       transition: all 0.3s ease;
       outline-offset: 3px;
     }

     .service-card:hover {
       box-shadow: 0 6px 18px rgb(37 99 235 / 0.35);
       transform: translateY(-4px);
       border-color: #3b82f6;
     }

     .service-card.selected {
       border-color: #2563eb;
       box-shadow: 0 0 15px 3px #3b82f6cc;
       background: #e0ebff;
       font-weight: 600;
     }

     .service-checkbox {
       position: absolute;
       top: 14px;
       right: 14px;
       width: 22px;
       height: 22px;
       cursor: pointer;
       appearance: none;
       border: 2.5px solid #3b82f6;
       border-radius: 6px;
       transition: background-color 0.3s ease, border-color 0.3s ease;
       background-color: white;
     }

     .service-checkbox:checked {
       background-color: #3b82f6;
       border-color: #2563eb;
       box-shadow: 0 0 8px #3b82f6cc;
     }

     .service-checkbox:checked::after {
       content: "✔";
       display: block;
       color: white;
       font-weight: 700;
       font-size: 1.3rem;
       line-height: 18px;
       text-align: center;
     }

     .service-checkbox:hover {
       border-color: #1d4ed8;
     }

     .service-content h3 {
       margin: 0 0 10px;
       color: #1e40af;
       font-size: 1.45rem;
     }

     .service-content p {
       margin: 0 0 10px;
       font-size: 1.1rem;
       color: #334e68;
       user-select: text;
     }

     .price-duration {
       font-weight: 700;
       font-size: 1.1rem;
       color: #2563eb;
       display: flex;
       justify-content: space-between;
       user-select: none;
     }

     .no-service {
       font-style: italic;
       color: #94a3b8;
       padding: 6px 0;
     }

     .error-message {
       color: #dc2626;
       font-size: 0.9rem;
       margin-top: 0.5rem;
     }

     .summary {
       background: #dbeafe;
       padding: 14px 20px;
       border-radius: 14px;
       color: #1e40af;
       font-weight: 600;
       font-size: 1.1rem;
       display: flex;
       justify-content: space-between;
       user-select: none;
       box-shadow: inset 0 0 8px #3b82f6aa;
     }

     .btn-submit {
       background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
       color: white;
       font-weight: 700;
       font-size: 1.2rem;
       border: none;
       border-radius: 14px;
       padding: 14px;
       cursor: pointer;
       user-select: none;
       transition: all 0.3s ease;
       box-shadow: 0 8px 20px #3b82f6cc;
     }

     .btn-submit:disabled {
       background: #94a3b8;
       box-shadow: none;
       cursor: not-allowed;
     }

     .btn-submit:not(:disabled):hover {
       background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
       box-shadow: 0 10px 30px #2563ebdd;
     }
     </style>