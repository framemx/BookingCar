    <template>
    <div class="user-layout min-h-screen flex flex-col bg-gray-50">
        <main class="flex-grow pt-20 p-8 max-w-7xl mx-auto w-full">
        <!-- Hero Section with Background Image -->
        <section
            class="relative w-full h-[600px] bg-cover bg-center bg-no-repeat mb-10 rounded-lg shadow"
        
        >
            <div
            class="absolute inset-0 bg-white bg-opacity-50 z-0 rounded-lg " style="background-image: url('https://th.bing.com/th/id/OIP.XjRjwf4Pyg1UKSaEbXqifAHaEK?rs=1&pid=ImgDetMain')"
            ></div>
            <div
            class="relative z-10 h-full flex flex-col justify-center items-center text-center px-4"
            >
            <h1 class="text-4xl font-extrabold text-white mb-4">
                🚗 ค้นหาบริการดูแลรถที่ดีที่สุด
            </h1>
            <p class="text-lg text-gray-200 mb-8">
                จองบริการดูแลรถยนต์ได้อย่างสะดวกและรวดเร็ว
            </p>
            <NuxtLink
                to="/user/bookingForm"
                class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition"
            >
                เริ่มจองคิวตอนนี้
            </NuxtLink>
            </div>
        </section>

        <!-- Service Types -->
        <section class="mb-16">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">ประเภทบริการ</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div
                v-for="type in serviceTypes"
                :key="type.name"
                class="p-4 bg-white shadow rounded-lg text-center hover:bg-blue-50 transition"
            >
                <img :src="type.icon" alt="" class="w-10 h-10 mx-auto mb-2" />
                <p class="text-gray-700 font-medium">{{ type.name }}</p>
            </div>
            </div>
        </section>

        <!-- Why Choose Us -->
        <section class="bg-gray-100 py-16 px-6 rounded-lg shadow-sm">
            <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">
            ทำไมต้องจองกับเรา?
            </h2>
            <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center"
            >
            <div
                v-for="reason in reasons"
                :key="reason.title"
                class="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
                <div class="text-blue-600 text-4xl mb-4">
                <UIcon :name="reason.icon" class="w-10 h-10 mx-auto" />
                </div>
                <h3 class="text-xl font-semibold mb-2">{{ reason.title }}</h3>
                <p class="text-gray-600 text-sm">{{ reason.text }}</p>
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
    .user-layout {
    font-family: "Sarabun", sans-serif;
    color: #1e293b;
    }
    </style>
