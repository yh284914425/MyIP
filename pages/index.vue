<template>
  <div>
    <!-- Use the functional DNS Leak Test component -->
    <DnsLeaksTest />

    <!-- How It Works Section -->
    <div class="how-it-works mt-5">
      <div class="row">
        <div class="col-md-4 text-center mb-4">
          <div class="feature-icon">🔍</div>
          <h5>1. Detect</h5>
          <p class="text-muted">We test your DNS queries against multiple servers</p>
        </div>
        <div class="col-md-4 text-center mb-4">
          <div class="feature-icon">🛡️</div>
          <h5>2. Analyze</h5>
          <p class="text-muted">Compare results to identify potential leaks</p>
        </div>
        <div class="col-md-4 text-center mb-4">
          <div class="feature-icon">✅</div>
          <h5>3. Secure</h5>
          <p class="text-muted">Get recommendations to fix any issues</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import the functional DNS Leak Test component
import DnsLeaksTest from '~/components/DnsLeaksTest.vue'

// SEO Meta配置
useSeoMeta({
  title: 'SecureDNSCheck - Free DNS Leak Test Tool',
  description: 'Test if your VPN is leaking DNS in 10 seconds. Professional DNS leak detection tool with detailed analysis and security recommendations.',
  ogTitle: 'SecureDNSCheck - DNS Leak Detection Tool',
  ogDescription: 'Free DNS leak test tool. Check if your VPN is protecting your privacy in 10 seconds.',
  ogType: 'website',
  keywords: 'DNS leak test, VPN test, DNS security, privacy protection, DNS leak detection'
})
</script>

<style scoped>
/* How It Works Section */
.how-it-works {
  padding: 3rem 0;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .how-it-works {
    padding: 2rem 0;
  }
}
</style>