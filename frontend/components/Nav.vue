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

      <div class="d-flex align-items-center">
        <button class="btn btn-sm" 
                :class="isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'"
                @click="scrollToDNSTest">
          {{ t('nav.DNSLeakTest') }}
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';
import brandIcon from './svgicons/Brand.vue';

const { t } = useI18n();
const store = useMainStore();
const isDarkMode = computed(() => store.isDarkMode);

const handleLogoClick = () => {
  scrollToDNSTest();
};

const scrollToDNSTest = () => {
  const element = document.getElementById('DNSLeakTest');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>