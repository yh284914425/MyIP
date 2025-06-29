<template>
  <!-- NavBar -->
  <Nav />
  
  <!-- Main Content -->
  <main id="mainpart" class="container mt-5 jn-container">
    <div class="rounded-2" tabindex="0">
      <slot />
    </div>
  </main>
  
  <!-- Footer -->
  <Footer />
</template>

<script setup>
// Nuxt will auto-import components, no need for manual imports
</script>

<style>
@import url('~/assets/css/main.css');
</style>