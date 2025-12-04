<template>
  <div class="user-layout">
    <main class="container content-wrapper">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">🚗 ค้นหาบริการดูแลรถที่ดีที่สุด</h1>
          <p class="hero-subtitle">
            จองบริการดูแลรถยนต์ได้อย่างสะดวกและรวดเร็ว
          </p>

          <!-- ✅ Path ถูกต้องตาม Nuxt: booking-form -->
          <NuxtLink to="/user/booking-form" class="hero-button">
            เริ่มจองคิวตอนนี้
          </NuxtLink>
        </div>
      </section>

      <!-- Service Types -->
      <section class="section">
        <h2 class="section-title text-center">ประเภทบริการ</h2>

        <div class="service-grid">
          <div v-for="type in serviceTypes" :key="type.name" class="service-card">
            <img :src="type.icon" alt="" class="service-icon" />
            <p class="service-name">{{ type.name }}</p>
          </div>
        </div>
      </section>

      <!-- Article Section -->
      <section class="section article-section">
        <h2 class="article-title text-center">
          🚘 การดูแลรถไม่ใช่เรื่องยาก... แค่เริ่มจองกับเรา
        </h2>

        <p class="article-text">
          รถของคุณ ไม่ได้แค่พาไปถึงที่หมาย — แต่มันคือความปลอดภัย ความภูมิใจ
          และสไตล์ชีวิตของคุณ ไม่ว่าจะเป็นการเดินทางไปทำงาน ส่งลูกไปโรงเรียน
          หรือขับออกทริปสุดพิเศษในวันหยุด...
        </p>

        <p class="article-text t1">
          "ครบ จบ ทุกบริการ ในที่เดียว"
        </p>

        <p class="article-text">
          ตั้งแต่ล้างรถ ขัดเคลือบ ดูดฝุ่น พ่นฆ่าเชื้อ ไปจนถึงการดูแลเบาะและภายใน —
          ใช้ผลิตภัณฑ์คุณภาพสูง มาตรฐานระดับศูนย์บริการ...
        </p>
      </section>

      <!-- Gallery -->
      <section class="section section-gallery">
        <h2 class="section-title text-center">✨ ภาพบรรยากาศและบริการของเรา</h2>

        <p class="intro-subtext">
          เราใส่ใจทุกรายละเอียด เพื่อให้รถของคุณสะอาดและพร้อมลุยทุกเส้นทาง
        </p>

        <div class="gallery-custom">
          <div
            v-for="img in galleryImages"
            :key="img.src"
            class="gallery-item"
            @click="showImagePopup(img.src)"
          >
            <img :src="img.src" :alt="img.alt" />
          </div>
        </div>
      </section>

      <!-- Why Choose Us -->
      <section class="section">
        <h2 class="section-title text-center">ทำไมต้องจองกับเรา?</h2>

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

      <!-- Popup -->
      <div v-if="activeImage" class="image-modal" @click="closeImagePopup">
        <div class="modal-inner" @click.stop>
          <button class="close-button" @click="closeImagePopup">❌</button>
          <img :src="activeImage" class="modal-image" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "#app"   // ✅ แก้แล้ว: Nuxt router ต้องใช้ #app
import UIcon from "~/components/UIcon.vue"

definePageMeta({ layout: "user" })

const router = useRouter()
const activeImage = ref<string | null>(null)

/* ---------------- AUTH GUARD ---------------- */
onMounted(() => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  if (!token) router.push("/")
})

/* ---------------- MODAL ---------------- */
function showImagePopup(src: string) {
  activeImage.value = src
}
function closeImagePopup() {
  activeImage.value = null
}

/* ---------------- DATA ---------------- */
const serviceTypes = [
  { name: "ล้างรถ", icon: "/icon/car-wash.png" },
  { name: "ขัดสี", icon: "/icon/car.png" },
  { name: "ดูดฝุ่น", icon: "/icon/vacuum.png" },
  { name: "ซักเบาะ", icon: "/icon/car-seat.png" },
  { name: "พ่นฆ่าเชื้อ", icon: "/icon/disinfection.png" },
  { name: "อื่นๆ", icon: "/icon/power-wash.png" },
]

const galleryImages = [
  { src: "/images/service1.jpg", alt: "ล้างรถ" },
  { src: "/images/service2.jpg", alt: "ขัดสี" },
  { src: "/images/service3.jpg", alt: "ดูดฝุ่น" },
  { src: "/images/service4.jpg", alt: "ซักเบาะ" },
  { src: "/images/service5.jpg", alt: "พ่นฆ่าเชื้อ" },
  { src: "/images/service6.jpg", alt: "เปลี่ยนน้ำมันเครื่อง" },
]

const reasons = [
  { title: "บริการรวดเร็ว", text: "เลือกเวลาที่สะดวกได้ทันที", icon: "i-lucide-clock" },
  { title: "ช่างมืออาชีพ", text: "ทีมงานเชี่ยวชาญ", icon: "i-lucide-users" },
  { title: "ราคาชัดเจน", text: "ไม่มีค่าใช้จ่ายแอบแฝง", icon: "i-lucide-badge-dollar-sign" },
  { title: "จองง่ายผ่านมือถือ", text: "ใช้งานได้ทุกอุปกรณ์", icon: "i-lucide-smartphone" },
]
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700&display=swap");

.user-layout {
  font-family: "Kanit", sans-serif;
  background: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
  padding-top: 48px;
}

.container.content-wrapper {
  max-width: 960px;
  margin: 0 auto;
  background: #ffffff;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.section {
  padding: 32px 0;
}

.section-gallery {
  margin-top: 48px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 1rem 0 1.5rem;
  text-align: center;
}

.text-center {
  text-align: center;
}

.hero-section {
  background-image: url("/images/carwash.jpg");
  background-size: cover;
  background-position: center;
  border-radius: 24px;
  height: 320px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin-bottom: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 24px;
}
.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}
.hero-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
}
.hero-subtitle {
  color: #e2e8f0;
  margin-bottom: 1.2rem;
}
.hero-button {
  background-color: #2563eb;
  color: #fff;
  padding: 0.5rem 1.3rem;
  font-weight: 600;
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.3s ease;
}
.hero-button:hover {
  background-color: #1d4ed8;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  justify-items: center;
  gap: 16px;
}
.service-card {
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.service-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}
.service-name {
  font-weight: 500;
  color: #334155;
  text-align: center;
}

.gallery-custom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.gallery-item img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}
.gallery-item img:hover {
  transform: scale(1.03);
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}
.why-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  text-align: center;
}
.why-icon .icon {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 16px;
}
.why-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.why-text {
  color: #64748b;
  font-size: 0.9rem;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  width: 80vmin;
  height: 80vmin;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.modal-inner {
  position: relative;
  animation: fadeIn 0.3s ease forwards;
}

.section-intro {
  padding-bottom: 0;
}

.intro-heading {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.intro-subtext {
  color: #475569;
  font-size: 1rem;
  max-width: 720px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
  text-align: center;
}

.article-section {
  padding: 48px 32px;
  background-color: #ffffff; /* พื้นหลังขาว */
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08); /* เงานุ่ม */
  margin-top: 48px;
  border-left: 6px solid #3b82f6; /* เส้นไฮไลต์ซ้าย */
  transition: box-shadow 0.3s ease;
}

.article-section:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

.article-title {
  font-size: 1.7rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 1.8rem;
  text-align: center;
}

.article-text {
  color: #334155;
  font-size: 1.05rem;
  line-height: 1.9;
  max-width: 740px;
  margin: 0 auto 1.6rem;
  text-align: justify;
  text-indent: 1.5rem;
}

.article-section p.t1 {
  font-weight: 600;
  color: #3b82f6;
  margin-top: 1.5rem;
  font-size: 1.1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
@media (max-width: 640px) {
  .modal-image {
    width: 90vw;
    height: 90vw;
  }
}
@media (max-width: 768px) {
  .gallery-custom {
    grid-template-columns: 1fr;
  }
  .gallery-item img {
    height: 160px;
  }
}

.close-button {
  position: absolute;
  top: -40px;
  right: -10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
}
</style>
