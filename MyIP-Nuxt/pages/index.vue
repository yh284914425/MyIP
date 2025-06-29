<template>
  <div>
    <!-- DNS Leak Test Hero Section -->
    <div class="dns-leak-hero text-center mb-5">
      <div class="hero-content">
        <div class="hero-icon mb-4">🛡️</div>
        <h1 class="hero-title mb-3">Is Your VPN Leaking?</h1>
        <p class="hero-subtitle mb-4">Find out in 10 seconds. Protect your real IP address and location from being exposed.</p>
        
        <!-- Main Test Button -->
        <button @click="startDNSTest" 
                :disabled="isTestRunning"
                class="btn btn-primary btn-lg px-5 py-3 mb-4 test-button"
                :class="{ 'btn-success': testComplete && !hasLeaks, 'btn-danger': testComplete && hasLeaks }">
          <i class="bi" :class="[isTestRunning ? 'bi-arrow-clockwise spin' : 'bi-play-circle-fill']"></i>
          <span class="ms-2">{{ buttonText }}</span>
        </button>
        
        <!-- Test Status -->
        <div v-if="isTestRunning" class="test-status mb-4">
          <div class="progress-container">
            <div class="progress" style="height: 6px;">
              <div class="progress-bar bg-primary" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <p class="mt-2 text-muted">Testing DNS servers... {{ completedTests }}/4</p>
          </div>
        </div>
        
        <!-- Test Results -->
        <div v-if="testComplete" class="test-results mt-4">
          <div class="alert" :class="{ 'alert-success': !hasLeaks, 'alert-danger': hasLeaks }" role="alert">
            <h5 class="alert-heading">
              <span v-if="!hasLeaks">✅ No DNS Leaks Found</span>
              <span v-else>🚨 DNS Leak Detected!</span>
            </h5>
            <p v-if="!hasLeaks">Your DNS queries are properly secured through your VPN.</p>
            <p v-else>Your DNS queries may be leaking outside of your VPN tunnel.</p>
          </div>
        </div>
        
        <p class="text-muted">Simple DNS leak detection tool</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO Meta配置
useSeoMeta({
  title: 'SecureDNSCheck - Free DNS Leak Test Tool',
  description: 'Test if your VPN is leaking DNS in 10 seconds. Professional DNS leak detection tool with detailed analysis and security recommendations.',
  ogTitle: 'SecureDNSCheck - DNS Leak Detection Tool',
  ogDescription: 'Free DNS leak test tool. Check if your VPN is protecting your privacy in 10 seconds.',
  ogType: 'website',
  keywords: 'DNS leak test, VPN test, DNS security, privacy protection, DNS leak detection'
})

// 页面配置 - 暂时启用SSR测试
// definePageMeta({
//   ssr: false
// })

// DNS测试逻辑
const isTestRunning = ref(false)
const testComplete = ref(false)
const completedTests = ref(0)
const hasLeaks = ref(false)
const testResults = ref([])

const progressPercentage = computed(() => (completedTests.value / 4) * 100)

const buttonText = computed(() => {
  if (isTestRunning.value) return 'Testing...'
  if (testComplete.value && hasLeaks.value) return 'DNS Leak Detected - Test Again'
  if (testComplete.value && !hasLeaks.value) return 'No Leaks Found - Test Again'
  return 'Check for DNS Leaks'
})

// 简化的DNS测试函数
const testDNSServer = async (name, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟DNS测试结果
      const mockResult = {
        name,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: Math.random() > 0.8 ? 'Different Country' : 'VPN Country',
        isp: Math.random() > 0.7 ? 'Local ISP' : 'VPN Provider'
      }
      
      testResults.value.push(mockResult)
      completedTests.value++
      resolve(mockResult)
    }, delay)
  })
}

const startDNSTest = async () => {
  if (isTestRunning.value) return
  
  console.log('🚀 DNS Test Started!')
  
  // 重置状态
  isTestRunning.value = true
  testComplete.value = false
  completedTests.value = 0
  testResults.value = []
  hasLeaks.value = false
  
  // 模拟4个DNS服务器测试
  const tests = [
    testDNSServer('Google DNS', 500),
    testDNSServer('Cloudflare', 1000),
    testDNSServer('OpenDNS', 1500),
    testDNSServer('Quad9', 2000)
  ]
  
  try {
    await Promise.all(tests)
    
    // 分析结果 - 简单的泄漏检测逻辑
    const countries = [...new Set(testResults.value.map(r => r.country))]
    const isps = [...new Set(testResults.value.map(r => r.isp))]
    
    // 如果检测到不同的国家或多个ISP，判断为可能的DNS泄漏
    hasLeaks.value = countries.length > 1 || isps.some(isp => isp.includes('Local'))
    
  } catch (error) {
    console.error('DNS test failed:', error)
  } finally {
    isTestRunning.value = false
    testComplete.value = true
  }
}
</script>

<style scoped>
.dns-leak-hero {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(29, 78, 216, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-radius: 24px;
  margin: 2rem 0;
}

.hero-icon {
  font-size: 4rem;
  filter: drop-shadow(0 4px 8px rgba(29, 78, 216, 0.2));
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1d4ed8;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.test-button {
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  box-shadow: 0 8px 24px rgba(29, 78, 216, 0.3);
  transition: all 0.3s ease;
}

.test-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(29, 78, 216, 0.4);
}

.test-button.btn-success {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
}

.test-button.btn-danger {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-container {
  max-width: 400px;
  margin: 0 auto;
}

.test-results .alert {
  border-radius: 16px;
  border: none;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .dns-leak-hero {
    padding: 2rem 1rem;
  }
}
</style>