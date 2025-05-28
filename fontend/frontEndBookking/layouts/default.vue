<script setup lang="ts">
const currentYear = new Date().getFullYear();

interface NavItem {
  title: string;
  to: string;
  isExternal?: boolean;
}

const navItems: NavItem[] = [
  { title: 'Home', to: '/' },
  { title: 'Nuxt Homepage', to: 'https://nuxt.com', isExternal: true },
  { title: 'YouTube', to: 'https://www.youtube.com', isExternal: true }
];
</script>

<template>
  <div class="layout">
    <nav class="navbar">
      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.title" class="nav-item">
          <NuxtLink
            v-if="!item.isExternal"
            :to="item.to"
            class="nav-link"
            active-class="active-link"
          >
            {{ item.title }}
          </NuxtLink>
          <a
            v-else
            :href="item.to"
            target="_blank"
            rel="noopener noreferrer"
            class="nav-link"
          >
            {{ item.title }}
          </a>
        </li>
      </ul>
    </nav>

    <main class="main-content">
      <slot></slot>
    </main>

    <footer class="footer">
      <p>&copy; {{ currentYear }} CarCare System</p>
    </footer>
  </div>
</template>

<style scoped>
/* Layout container */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f0f4ff;
  color: #333;
}

/* Navbar styling */
.navbar {
  background-color: #4338ca;
  padding: 15px 30px;
  box-shadow: 0 3px 6px rgba(67, 56, 202, 0.3);
}

.nav-list {
  list-style: none;
  display: flex;
  gap: 25px;
  margin: 0;
  padding: 0;
}

.nav-item {
}

.nav-link {
  color: #dcdcfb;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.nav-link:hover {
  background-color: #6d57db;
  color: white;
}

.active-link {
  background-color: #6d57db;
  color: white;
  box-shadow: 0 0 8px rgba(109, 87, 219, 0.7);
}

/* Main content grows to fill vertical space */
.main-content {
  flex-grow: 1;
  padding: 40px 20px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Footer styling */
.footer {
  background-color: #4338ca;
  color: #dcdcfb;
  text-align: center;
  padding: 15px 20px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 -3px 6px rgba(67, 56, 202, 0.3);
  user-select: none;
}
</style>
