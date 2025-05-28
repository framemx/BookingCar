<script setup lang="ts">
const currentYear = new Date().getFullYear();

interface NavItem {
  title: string;
  to: string;
  isExternal?: boolean;
}

// เมนูสำหรับ admin
const navItems: NavItem[] = [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Service', to: '/service' }
];
</script>

<template>
  <nav>
    <ul>
      <li v-for="item in navItems" :key="item.title">
        <NuxtLink :to="item.to">{{ item.title }}</NuxtLink>
      </li>
    </ul>
  </nav>

  <main>
    <slot></slot>
  </main>

  <footer>
    <p>&copy; {{ currentYear }}</p>
  </footer>
</template>
