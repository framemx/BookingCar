<template>
  <div class="user-layout">
    <main class="main-wrapper">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-background"></div>
        <div class="hero-content">
          <h1 class="hero-title">🚗 ค้นหาบริการดูแลรถที่ดีที่สุด</h1>
          <p class="hero-subtitle">
            จองบริการดูแลรถยนต์ได้อย่างสะดวกและรวดเร็ว
          </p>
          <NuxtLink to="/user/bookingForm" class="hero-button">
            เริ่มจองคิวตอนนี้
          </NuxtLink>
        </div>
      </section>

      <!-- Service Types -->
      <section class="section">
        <h2 class="section-title">ประเภทบริการ</h2>
        <div class="service-grid">
          <div v-for="type in serviceTypes" :key="type.name" class="service-card">
            <img :src="type.icon" alt="" class="service-icon" />
            <p class="service-name">{{ type.name }}</p>
          </div>
        </div>
      </section>

      <!-- Why Choose Us -->
      <section class="why-section">
        <h2 class="section-title">ทำไมต้องจองกับเรา?</h2>
        <div class="why-grid">
          <div v-for="reason in reasons" :key="reason.title" class="why-card">
            <div class="why-icon">
              <UIcon :name="reason.icon" class="icon" />
            </div>
            <h3 class="why-title">{{ reason.title }}</h3>
            <p class="why-text">{{ reason.text }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "user" });

const serviceTypes = [
  { name: "ล้างรถ", icon: "/icon/car-wash.png" },
  { name: "เคลือบสี", icon: "/icon/polish.png" },
  { name: "ดูดฝุ่น", icon: "/icon/vacuum.png" },
  { name: "ล้างภายใน", icon: "/icon/interior.png" },
  { name: "พ่นฆ่าเชื้อ", icon: "/icon/disinfect.png" },
  { name: "อื่นๆ", icon: "/icon/more.png" },
];

const reasons = [
  {
    title: "บริการรวดเร็ว",
    text: "เลือกเวลาที่คุณสะดวกได้ทันที",
    icon: "i-lucide-clock",
  },
  {
    title: "ช่างมืออาชีพ",
    text: "ทีมงานมีประสบการณ์และเชี่ยวชาญ",
    icon: "i-lucide-users",
  },
  {
    title: "ราคาชัดเจน",
    text: "ไม่มีค่าใช้จ่ายแอบแฝง",
    icon: "i-lucide-badge-dollar-sign",
  },
  {
    title: "จองง่ายผ่านมือถือ",
    text: "ใช้งานง่ายทั้งมือถือและคอมพิวเตอร์",
    icon: "i-lucide-smartphone",
  },
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap');

.user-layout {
  font-family: 'Kanit', 'Poppins', sans-serif;
  color: #1e293b;
  background-color: #f8fafc;
  min-height: 100vh;
}

.main-wrapper {
  padding: 48px 24px 32px;
  max-width: 960px;  /* เดิม 1280px */
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 320px; /* ย่อเล็กนิดเพื่อบาลานซ์ */
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.hero-background {
  background-image: url('/images/carwash.jpg');
  background-size: cover;
  background-position: center;
  filter: brightness(0.5);
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 24px;
}

.hero-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 0.95rem;
  color: #e2e8f0;
  margin-bottom: 1.2rem;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.hero-button {
  background-color: #2563eb;
  color: white;
  font-size: 0.85rem;
  padding: 0.5rem 1.3rem;
  border-radius: 9999px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.3s ease;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

.hero-button:hover {
  background-color: #1d4ed8;
}

/* Service Section */
.section {
  margin-bottom: 64px;
}

.section-title {
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
  color: #1e293b;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.service-card {
  background: white;
  border-radius: 16px;
  text-align: center;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: background 0.3s;
}

.service-card:hover {
  background: #eff6ff;
}

.service-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.service-name {
  font-weight: 500;
  color: #334155;
  margin-top: 4px;
}

/* Why Choose Us */
.why-section {
  background: #f1f5f9;
  border-radius: 24px;
  padding: 64px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  text-align: center;
}

.why-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  min-height: 220px;
}



.why-icon .icon {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 16px;
}

.why-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  min-height: 3rem; /* 👈 ทำให้ข้อความ title อยู่บรรทัดเดียวหรือสอง แต่สูงเท่ากันทุกการ์ด */
}

.why-text {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
  min-height: 3rem; /* 👈 ให้ข้อความรองรับได้ 2 บรรทัดสม่ำเสมอ */
}
@media (max-width: 1024px) {
  .why-grid {
    grid-template-columns: repeat(2, 1fr); /* จอแท็บเล็ต */
  }
}

@media (max-width: 640px) {
  .why-grid {
    grid-template-columns: 1fr; /* จอมือถือ */
  }
}
</style>
