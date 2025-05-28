<template>
  <div class="container">
    <h1>จัดการบริการ</h1>

    <button @click="showAddModal = true" class="btn-add">เพิ่มบริการ</button>

    <table>
      <thead>
        <tr>
          <th>ชื่อบริการ</th>
          <th>รายละเอียด</th>
          <th>ราคา (บาท)</th>
          <th>ระยะเวลา (นาที)</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="service in services" :key="service.id">
          <td>{{ service.sName }}</td>
          <td>{{ service.description }}</td>
          <td>{{ service.price }}</td>
          <td>{{ service.durationMinutes }}</td>
          <td>
            <!-- สามารถเพิ่มปุ่มแก้ไข ลบได้ที่นี่ -->
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Popup เพิ่มบริการ -->
    <teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2>เพิ่มบริการใหม่</h2>
          <form @submit.prevent="submitNewService">
            <div>
              <label for="sName">ชื่อบริการ</label>
              <input v-model="newService.sName" id="sName" required />
            </div>
            <div>
              <label for="description">รายละเอียด</label>
              <textarea v-model="newService.description" id="description" required></textarea>
            </div>
            <div>
              <label for="price">ราคา (บาท)</label>
              <input v-model.number="newService.price" id="price" type="number" min="0" required />
            </div>
            <div>
              <label for="durationMinutes">ระยะเวลา (นาที)</label>
              <input v-model.number="newService.durationMinutes" id="durationMinutes" type="number" min="1" required />
            </div>
            <button type="submit" class="btn-submit">บันทึก</button>
            <button type="button" @click="closeModal" class="btn-cancel">ยกเลิก</button>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

interface Service {
  id: number;
  sName: string;
  description: string;
  price: number;
  durationMinutes: number;
}

const services = ref<Service[]>([]);
const showAddModal = ref(false);

const newService = reactive({
  sName: "",
  description: "",
  price: 0,
  durationMinutes: 0,
});

async function fetchServices() {
  try {
    const res = await fetch("http://localhost:3000/services");
    if (!res.ok) throw new Error("โหลดข้อมูลบริการไม่สำเร็จ");
    services.value = await res.json();
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

async function submitNewService() {
  try {
    const res = await fetch("http://localhost:3000/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "เพิ่มบริการไม่สำเร็จ");
    }
    // โหลดข้อมูลใหม่
    await fetchServices();
    closeModal();
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
}

function closeModal() {
  showAddModal.value = false;
  // reset form
  newService.sName = "";
  newService.description = "";
  newService.price = 0;
  newService.durationMinutes = 0;
}

onMounted(() => {
  fetchServices();
});
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 1rem auto;
  padding: 0 1rem;
}

.btn-add {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4338ca;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ccc;
  padding: 0.75rem;
  text-align: left;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
}

.modal form div {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

textarea {
  resize: vertical;
}

.btn-submit {
  background-color: #4338ca;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 1rem;
}

.btn-cancel {
  background-color: #ccc;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
