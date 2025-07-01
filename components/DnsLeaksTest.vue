<template>
  <div class="container">
    <header class="header">
      <div class="hero-icon mb-4">🛡️</div>
      <h1 class="hero-title mb-3">DNS 泄露检测工具</h1>
      <p class="hero-subtitle mb-4">全面检测您的IPv4 (A) 和 IPv6 (AAAA) DNS查询是否绕过了代理或VPN通道。</p>
    </header>

    <main class="main-content">
      <button @click="startTest" :disabled="isLoading" class="test-button"
        :class="{ 'success': isCompleted && !isLeaking, 'danger': isCompleted && isLeaking }">
        <span v-if="isLoading">正在测试中...</span>
        <span v-else-if="isCompleted && !isLeaking">✅ 无泄露</span>
        <span v-else-if="isCompleted && isLeaking">⚠️ 发现泄露</span>
        <span v-else>开始全面测试</span>
      </button>

      <div v-if="isLoading" class="loader"></div>

      <div v-if="results" class="results-container">
        <hr>
        <h2>测试结果</h2>
        <div class="result-card">
          <h3>您的网络IP (通过HTTP检测)</h3>
          <pre>{{ formatObject(results.httpIpInfo) }}</pre>
        </div>
        <div class="result-card">
          <h3>检测到的DNS服务器</h3>
          <div v-if="results.dnsIpsInfo.length > 0">
            <pre v-for="(server, index) in results.dnsIpsInfo" :key="index">{{ formatObject(server) }}</pre>
          </div>
          <p v-else>未检测到DNS查询。</p>
        </div>
        <div class="conclusion" :class="{ 
          'leak': results.isLeaking, 
          'safe': !results.isLeaking,
          'critical': results.leakAnalysis?.severity === 'critical',
          'moderate': results.leakAnalysis?.severity === 'moderate'
        }">
          <h2 v-if="results.isLeaking && results.leakAnalysis?.severity === 'critical'">🚨 严重警告：检测到严重DNS泄露！</h2>
          <h2 v-else-if="results.isLeaking">⚠️ 警告：检测到DNS泄露</h2>
          <h2 v-else>✅ 安全：未发现DNS泄露</h2>
          
          <p class="leak-reason">{{ results.leakReason }}</p>
          
          <div v-if="results.leakAnalysis" class="analysis-details mt-3">
            <h6>检测详情:</h6>
            <ul class="small">
              <li>检测到 {{ results.leakAnalysis.totalDnsServers }} 个DNS服务器</li>
              <li>涉及 {{ results.leakAnalysis.uniqueAsns.length }} 个不同网络 (ASN)</li>
              <li>涉及 {{ results.leakAnalysis.uniqueCountries.length }} 个不同国家/地区</li>
              <li v-if="results.leakAnalysis.leakType">泄露类型: {{ results.leakAnalysis.leakType === 'asn' ? '网络泄露' : '地理泄露' }}</li>
            </ul>
          </div>
          
          <small class="text-muted d-block mt-2">检测时间: {{ new Date(results.timestamp).toLocaleString() }}</small>
        </div>
      </div>
    </main>

    <!-- How it Works Section -->
    <div v-if="!isLoading && !results" class="how-it-works mt-5">
      <div class="row">
        <div class="col-md-4 text-center mb-4">
          <div class="feature-icon">🔍</div>
          <h5>1. 检测</h5>
          <p class="text-muted">我们测试您的DNS查询对多个服务器的响应</p>
        </div>
        <div class="col-md-4 text-center mb-4">
          <div class="feature-icon">🛡️</div>
          <h5>2. 分析</h5>
          <p class="text-muted">比较结果以识别潜在的泄露</p>
        </div>
        <div class="col-md-4 text-center mb-4">
          <div class="feature-icon">✅</div>
          <h5>3. 保护</h5>
          <p class="text-muted">获得修复任何问题的建议</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isLoading = ref(false);
const results = ref(null);
const isCompleted = computed(() => results.value !== null);
const isLeaking = computed(() => results.value?.isLeaking || false);

const startTest = async () => {
  isLoading.value = true;
  results.value = null;
  try {
    const testTask = await $fetch('/api/start-test');
    
    // 同时触发A和AAAA记录的查询
    const allSubdomains = [...testTask.aSubdomains, ...testTask.aaaaSubdomains];
    allSubdomains.forEach(domain => {
      const img = new Image();
      img.src = `https://${domain}/pixel.gif`;
    });

    setTimeout(async () => {
      try {
        const finalResults = await $fetch('/api/get-results', {
          params: { testId: testTask.testId, httpIp: testTask.httpIp },
        });
        results.value = finalResults;
      } catch (error) {
        console.error('获取结果失败:', error);
        alert('获取结果失败，请稍后重试。');
      } finally {
        isLoading.value = false;
      }
    }, 5000); // 增加等待时间以容纳更多查询
  } catch (error) {
    console.error('开始测试失败:', error);
    alert('开始测试失败，请检查网络连接。');
    isLoading.value = false;
  }
};

const formatObject = (obj) => JSON.stringify(obj, null, 2);
</script>

<style scoped>
body { 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
  background-color: #f4f7f6; 
  color: #333; 
}

.container { 
  max-width: 800px; 
  margin: 2rem auto; 
  padding: 2rem; 
  background: white; 
  border-radius: 8px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
}

.header { 
  text-align: center; 
  margin-bottom: 2rem; 
}

.hero-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.hero-title { 
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem; 
  color: #1d4ed8;
}

.hero-subtitle { 
  font-size: 1.1rem;
  color: #666; 
  margin-bottom: 2rem;
}

.main-content { 
  text-align: center; 
}

.test-button { 
  font-size: 1.2rem; 
  padding: 12px 24px; 
  cursor: pointer; 
  border-radius: 6px; 
  border: none; 
  background-color: #007bff; 
  color: white; 
  transition: background-color 0.3s; 
  min-width: 200px;
}

.test-button:disabled { 
  background-color: #a0cfff; 
  cursor: not-allowed; 
}

.test-button:hover:not(:disabled) { 
  background-color: #0056b3; 
}

.test-button.success {
  background-color: #28a745;
}

.test-button.danger {
  background-color: #dc3545;
}

.results-container { 
  margin-top: 2rem; 
  text-align: left; 
}

.result-card { 
  background: #fafafa; 
  border: 1px solid #eee; 
  border-radius: 5px; 
  padding: 15px; 
  margin-bottom: 1rem; 
}

pre { 
  white-space: pre-wrap; 
  word-wrap: break-word; 
  background-color: #e9ecef; 
  padding: 10px; 
  border-radius: 4px; 
  font-family: "Courier New", Courier, monospace; 
}

.conclusion { 
  padding: 20px; 
  border-radius: 5px; 
  text-align: center; 
  margin-top: 2rem; 
}

.conclusion.safe { 
  background-color: #e8f5e9; 
  color: #2e7d32; 
}

.conclusion.leak { 
  background-color: #ffebee; 
  color: #c62828; 
}

.conclusion.critical {
  background-color: #ffcdd2;
  color: #b71c1c;
  border-left: 5px solid #b71c1c;
}

.conclusion.moderate {
  background-color: #fff3e0;
  color: #ef6c00;
  border-left: 5px solid #ef6c00;
}

.leak-reason {
  font-weight: 500;
  margin-bottom: 1rem;
}

.analysis-details ul {
  text-align: left;
  margin: 0;
  padding-left: 1.5rem;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.how-it-works {
  padding: 3rem 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .container {
    padding: 1rem;
    margin: 1rem;
  }
}
</style>