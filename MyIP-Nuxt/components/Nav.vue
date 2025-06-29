<template>
  <!-- Nav -->
  <header class="navbar navbar-expand-lg bg-body-tertiary mb-3 jn-navbar-top"
    :class="{ 'dark-mode-nav navbar-dark bg-dark': isDarkMode }">
    <nav class="container-xxl">
      <div class="jn-logo">
        <a class="navbar-brand d-flex align-items-center align-content-center" 
           :class="{ 'text-white': isDarkMode }" href="#" @click="handleLogoClick">
          <brandIcon />
          <span class="fw-bold">SecureDNS</span>
          <span class="fw-lighter">Check</span>
        </a>
      </div>

      <div class="d-flex align-items-center gap-3">
        <NuxtLink 
          to="/learn" 
          class="nav-link"
          :class="{ 'active': route.path === '/learn' }">
          📚 Learn
        </NuxtLink>
        
        <button class="btn btn-sm btn-primary" 
                v-if="route.path !== '/'"
                @click="goHome">
          🛡️ Test Now
        </button>
        
        <button class="btn btn-sm" 
                v-else
                :class="isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'"
                @click="scrollToDNSTest">
          {{ t('nav.DNSLeakTest') }}
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, nextTick } from 'vue';
import brandIcon from './svgicons/Brand.vue';

// 使用Nuxt composables
const store = useMainStore();
const router = useRouter();
const route = useRoute();

// 简单的翻译函数
const t = (key) => {
  const translations = {
    'nav.DNSLeakTest': 'DNS Leak Test'
  };
  return translations[key] || key;
};
const isDarkMode = computed(() => store.isDarkMode);

const handleLogoClick = () => {
  if (router.currentRoute.value.path === '/') {
    scrollToDNSTest();
  } else {
    router.push('/');
  }
};

const goHome = () => {
  router.push('/');
};

const scrollToDNSTest = () => {
  nextTick(() => {
    const element = document.getElementById('DNSLeakTest');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
};
</script>

<style scoped>
.nav-link {
  color: var(--muted-foreground);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.nav-link:hover {
  color: var(--foreground);
  background: var(--muted);
}

.nav-link.active {
  color: var(--primary);
  background: oklch(from var(--primary) calc(l + 0.4) calc(c * 0.3) h);
}

[data-bs-theme="dark"] .nav-link.active {
  background: oklch(from var(--primary) calc(l * 0.3) calc(c * 0.5) h);
}
</style>