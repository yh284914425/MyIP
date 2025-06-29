<template>
  <NavBar ref="navBarRef" />
  <div id="mainpart" class="container mt-5 jn-container">
    <div class="rounded-2" tabindex="0">
      <!-- Home Page Content -->
      <DNSLeaks v-if="$route.path === '/'" ref="dnsLeaksRef" />
      
      <!-- Router View for Other Pages -->
      <router-view v-else />
    </div>
  </div>
  <Footer ref="footerRef" />
</template>

<script setup>
// Components
import NavBar from './components/Nav.vue';
import DNSLeaks from './components/DnsLeaksTest.vue';
import Footer from './components/Footer.vue';

// Vue
import { ref, onMounted } from 'vue';
import { useMainStore } from '@/store';

// Store
const store = useMainStore();

// Template refs
const navBarRef = ref(null);
const dnsLeaksRef = ref(null);
const footerRef = ref(null);

onMounted(() => {
  // Auto-start DNS leak test
  setTimeout(() => {
    if (dnsLeaksRef.value) {
      dnsLeaksRef.value.checkAllDNSLeakTest(false);
    }
  }, 1000);
});
</script>

<style>
@import url('./style/style.css');
</style>