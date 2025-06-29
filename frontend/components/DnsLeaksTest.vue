<template>
  <!-- DNS Leak Detection Hero Section -->
  <div class="dns-leak-hero text-center mb-5">
    <div class="hero-content">
      <div class="hero-icon mb-4">
        🛡️
      </div>
      <h1 class="hero-title mb-3">Is Your VPN Leaking?</h1>
      <p class="hero-subtitle mb-4">Find out in 10 seconds. Protect your real IP address and location from being exposed.</p>
      
      <!-- Main Test Button -->
      <button 
        @click="checkAllDNSLeakTest(true)"
        :disabled="isStarted"
        class="btn btn-primary btn-lg px-5 py-3 mb-4 test-button"
        :class="{ 'btn-success': allTestsComplete && !hasLeaks, 'btn-danger': allTestsComplete && hasLeaks }">
        <i class="bi" :class="[isStarted ? 'bi-arrow-clockwise spin' : 'bi-play-circle-fill']"></i>
        <span class="ms-2">
          {{ getButtonText }}
        </span>
      </button>

      <!-- Test Status -->
      <div v-if="isStarted" class="test-status mb-4">
        <div class="progress-container">
          <div class="progress" style="height: 6px;">
            <div class="progress-bar bg-primary" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p class="mt-2 text-muted">Testing DNS servers... {{ completedTests }}/6</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Test Results -->
  <div v-if="isStarted" class="dns-test-results">
    <!-- Results Summary -->
    <div v-if="allTestsComplete" class="results-summary mb-5">
      <div class="alert" :class="{
        'alert-success': !hasLeaks,
        'alert-danger': hasLeaks && leakAnalysis?.severity === 'critical',
        'alert-warning': hasLeaks && leakAnalysis?.severity === 'moderate'
      }" role="alert">
        <div class="d-flex align-items-start">
          <i class="bi fs-3 me-3 mt-1" :class="{
            'bi-shield-check': !hasLeaks,
            'bi-shield-exclamation': hasLeaks && leakAnalysis?.severity === 'moderate',
            'bi-shield-x': hasLeaks && leakAnalysis?.severity === 'critical'
          }"></i>
          <div class="flex-grow-1">
            <h4 class="alert-heading mb-3">
              <span v-if="!hasLeaks">✅ No DNS Leaks Found</span>
              <span v-else-if="leakAnalysis?.severity === 'critical'">🚨 Critical DNS Leak Detected!</span>
              <span v-else>⚠️ DNS Leak Detected</span>
            </h4>
            
            <!-- Analysis Details -->
            <div v-if="leakAnalysis" class="analysis-details mb-3">
              <div v-if="!hasLeaks" class="text-success-emphasis">
                <p class="mb-2"><strong>Your privacy is protected:</strong></p>
                <ul class="mb-0">
                  <li>All DNS queries routing through: {{ leakAnalysis.countries[0] ? getCountryName(leakAnalysis.countries[0], 'en') : 'VPN Server' }}</li>
                  <li>Consistent ISP detection across all tests</li>
                  <li>No location or provider leaks detected</li>
                </ul>
              </div>
              
              <div v-else class="text-danger-emphasis">
                <p class="mb-2"><strong>Security Issues Detected:</strong></p>
                <ul class="mb-3">
                  <li v-if="leakAnalysis.leakType === 'location'">
                    DNS queries detected from {{ leakAnalysis.countries.length }} different countries
                  </li>
                  <li>{{ leakAnalysis.isps.length }} different ISPs handling your DNS requests</li>
                  <li>Risk Level: <span class="badge" :class="{
                    'bg-warning': leakAnalysis.riskLevel === 'medium',
                    'bg-danger': leakAnalysis.riskLevel === 'high'
                  }">{{ leakAnalysis.riskLevel.toUpperCase() }}</span></li>
                </ul>
              </div>
            </div>

            <!-- Security Recommendations -->
            <div v-if="securityRecommendations.length" class="recommendations">
              <h6 class="fw-semibold mb-2">
                {{ hasLeaks ? '🔧 Recommended Actions:' : '🛡️ Security Tips:' }}
              </h6>
              <ul class="mb-0 small">
                <li v-for="(rec, index) in securityRecommendations" :key="index" class="mb-1">
                  {{ rec }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Results -->
    <div class="row">
      <div v-for="(test, index) in leakTest" :key="test.id" class="col-lg-4 col-md-6 col-12 mb-4">
        <div class="card dns-result-card h-100"
          :class="{ 
            'border-success': isTestComplete(test) && !isTestLeaking(test),
            'border-danger': isTestComplete(test) && isTestLeaking(test),
            'border-primary': !isTestComplete(test)
          }">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="card-title mb-0">
                <i class="bi bi-dns me-2"></i>
                {{ test.provider || `DNS Server ${index + 1}` }}
              </h5>
              <span class="badge" :class="{
                'bg-success': isTestComplete(test) && !isTestLeaking(test),
                'bg-danger': isTestComplete(test) && isTestLeaking(test),
                'bg-secondary': !isTestComplete(test)
              }">
                {{ getTestStatus(test) }}
              </span>
            </div>
            
            <div class="test-details">
              <div class="mb-2">
                <small class="text-muted">IP Address:</small>
                <div class="fw-bold" :class="{
                  'text-success': isTestComplete(test),
                  'text-muted': !isTestComplete(test)
                }">
                  {{ test.ip }}
                </div>
              </div>
              
              <div class="mb-2">
                <small class="text-muted">ISP:</small>
                <div class="fw-bold" :class="{
                  'text-success': isTestComplete(test),
                  'text-muted': !isTestComplete(test)
                }">
                  {{ test.org }}
                </div>
              </div>
              
              <div class="d-flex align-items-center">
                <small class="text-muted me-2">Location:</small>
                <span v-show="test.country_code" :class="'fi fi-' + test.country_code.toLowerCase() + ' me-2'"></span>
                <span class="fw-bold" :class="{
                  'text-success': isTestComplete(test),
                  'text-muted': !isTestComplete(test)
                }">
                  {{ test.country }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- How it Works Section -->
  <div v-if="!isStarted" class="how-it-works mt-5">
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
    
    <!-- Learn More Section -->
    <div class="learn-more-section text-center mt-5 pt-4 border-top">
      <h4 class="mb-3">Want to Learn More?</h4>
      <p class="text-muted mb-4">
        Master DNS security with our comprehensive guides and tutorials
      </p>
      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <router-link to="/learn" class="btn btn-outline-primary btn-lg">
          📚 Explore Learning Center
        </router-link>
        
        <button 
          v-if="testHistory.length > 0"
          @click="toggleHistory" 
          class="btn btn-outline-secondary btn-lg">
          📊 {{ showHistory ? 'Hide' : 'View' }} Test History ({{ testHistory.length }})
        </button>
      </div>
    </div>
    
    <!-- Test History Section -->
    <div v-if="showHistory && testHistory.length > 0" class="test-history mt-5 pt-4 border-top">
      <h4 class="mb-4">Recent Test History</h4>
      <div class="row">
        <div v-for="result in testHistory.slice(0, 5)" :key="result.id" class="col-md-6 col-lg-4 mb-3">
          <div class="history-card">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge" :class="{
                'bg-success': !result.hasLeaks,
                'bg-danger': result.hasLeaks && result.analysis?.severity === 'critical',
                'bg-warning': result.hasLeaks && result.analysis?.severity === 'moderate'
              }">
                {{ result.hasLeaks ? 'Leak Detected' : 'Secure' }}
              </span>
              <small class="text-muted">{{ formatTestDate(result.timestamp) }}</small>
            </div>
            
            <div class="history-details">
              <p class="mb-1 small">
                <strong>Countries:</strong> 
                {{ result.analysis?.countries?.length || 0 }}
              </p>
              <p class="mb-1 small">
                <strong>ISPs:</strong> 
                {{ result.analysis?.isps?.length || 0 }}
              </p>
              <p class="mb-0 small">
                <strong>Risk Level:</strong> 
                <span :class="{
                  'text-success': result.analysis?.riskLevel === 'low',
                  'text-warning': result.analysis?.riskLevel === 'medium',
                  'text-danger': result.analysis?.riskLevel === 'high'
                }">
                  {{ result.analysis?.riskLevel?.toUpperCase() || 'N/A' }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { trackEvent } from '@/utils/use-analytics';
import countryLookup from 'country-code-lookup';
import getCountryName from '@/utils/country-name.js';
import { saveTestResult, getTestHistory, formatTestDate } from '@/utils/test-history.js';

const { t } = useI18n();

const store = useMainStore();
const isDarkMode = computed(() => store.isDarkMode);
const isMobile = computed(() => store.isMobile);
const lang = computed(() => store.lang);

const createDefaultCard = () => ({
  name: 'DNS Test',
  country_code: '',
  country: 'Testing...',
  ip: 'Testing...',
  org: 'Testing...',
});

const leakTest = reactive([
  { ...createDefaultCard(), id: "ipapi1", provider: "IP-API.com" },
  { ...createDefaultCard(), id: "ipapi2", provider: "IP-API.com" },
  { ...createDefaultCard(), id: "sfshark1", provider: "SurfShark" },
  { ...createDefaultCard(), id: "sfshark2", provider: "SurfShark" },
  { ...createDefaultCard(), id: "cloudflare1", provider: "Cloudflare" },
  { ...createDefaultCard(), id: "quad9", provider: "Quad9" },
]);

const isStarted = ref(false);
const completedTests = ref(0);
const testHistory = ref([]);
const showHistory = ref(false);

const progressPercentage = computed(() => (completedTests.value / 6) * 100);

const allTestsComplete = computed(() => completedTests.value === 6);

const hasLeaks = computed(() => {
  if (!allTestsComplete.value) return false;
  const validTests = leakTest.filter(test => isTestComplete(test) && test.country_code);
  if (validTests.length < 2) return false;
  
  const uniqueCountries = new Set(validTests.map(test => test.country_code));
  const uniqueISPs = new Set(validTests.map(test => test.org));
  
  // DNS leak detected if we have different countries or significantly different ISPs
  return uniqueCountries.size > 1 || (uniqueISPs.size > 2 && uniqueCountries.size > 0);
});

const leakAnalysis = computed(() => {
  if (!allTestsComplete.value) return null;
  
  const validTests = leakTest.filter(test => isTestComplete(test));
  const countries = validTests.map(test => test.country_code).filter(code => code);
  const isps = validTests.map(test => test.org).filter(org => org && org !== 'Error');
  
  const uniqueCountries = [...new Set(countries)];
  const uniqueISPs = [...new Set(isps)];
  
  if (hasLeaks.value) {
    return {
      severity: uniqueCountries.length > 2 ? 'critical' : 'moderate',
      countries: uniqueCountries,
      isps: uniqueISPs,
      leakType: uniqueCountries.length > 1 ? 'location' : 'provider',
      riskLevel: uniqueCountries.length > 2 ? 'high' : 'medium'
    };
  }
  
  return {
    severity: 'none',
    countries: uniqueCountries,
    isps: uniqueISPs,
    leakType: 'none',
    riskLevel: 'low'
  };
});

const securityRecommendations = computed(() => {
  if (!leakAnalysis.value) return [];
  
  const analysis = leakAnalysis.value;
  const recommendations = [];
  
  if (analysis.severity === 'none') {
    return [
      'Your DNS queries are properly secured',
      'Continue using your current VPN configuration',
      'Consider periodic testing to ensure ongoing protection'
    ];
  }
  
  if (analysis.leakType === 'location') {
    recommendations.push(
      'Your DNS queries are exposing your real location',
      'Enable DNS leak protection in your VPN settings',
      'Consider using a VPN with built-in DNS servers'
    );
  }
  
  if (analysis.severity === 'critical') {
    recommendations.push(
      'Multiple DNS servers detected - high risk',
      'Immediately check your VPN kill switch settings',
      'Consider switching to a more secure VPN provider'
    );
  }
  
  recommendations.push(
    'Flush your DNS cache after making changes',
    'Test again after applying fixes to verify resolution'
  );
  
  return recommendations;
});

const getButtonText = computed(() => {
  if (isStarted.value && !allTestsComplete.value) return 'Testing...';
  if (allTestsComplete.value && hasLeaks.value) return 'DNS Leak Detected - Test Again';
  if (allTestsComplete.value && !hasLeaks.value) return 'No Leaks Found - Test Again';
  return 'Check for DNS Leaks';
});

const isTestComplete = (test) => {
  return test.ip !== 'Testing...' && test.ip !== 'Error';
};

const isTestLeaking = (test) => {
  if (!allTestsComplete.value) return false;
  const mainCountry = leakTest.find(t => isTestComplete(t))?.country_code;
  return test.country_code !== mainCountry;
};

const getTestStatus = (test) => {
  if (!isTestComplete(test)) return 'Testing';
  if (test.ip === 'Error') return 'Error';
  if (allTestsComplete.value && isTestLeaking(test)) return 'Leak';
  return 'Secure';
};

// 生成 32 位随机字符串
const generate32DigitString = () => {
  const unixTime = Date.now().toString();
  const fixedString = "securedns";
  const randomString = Math.random().toString(36).substring(2, 11);
  return unixTime + fixedString + randomString;
};

// 生成 14 位随机字符串
const generate14DigitString = () => {
  const fixedString = "sdns";
  const randomString = Math.random().toString(36).substring(2, 11);
  return fixedString + randomString;
};

// DNS 泄露测试 1
const fetchLeakTestIpApiCom = (index) => {
  return new Promise((resolve, reject) => {
    const urlString = generate32DigitString();
    const url = `https://${urlString}.edns.ip-api.com/json`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.dns && "geo" in data.dns && "ip" in data.dns) {
          const geoSplit = data.dns.geo.split(" - ");
          const countryData = countryLookup.byCountry(geoSplit[0]);
          if (countryData) {
            leakTest[index].country_code = countryData.iso2;
            leakTest[index].country = getCountryName(leakTest[index].country_code, lang.value);
          } else {
            leakTest[index].country = geoSplit[0];
          }
          leakTest[index].org = geoSplit[1] || '';
          leakTest[index].ip = data.dns.ip;
          completedTests.value++;
          resolve();
        } else {
          throw new Error("Unexpected data structure");
        }
      })
      .catch((error) => {
        console.error("Error fetching leak test data:", error);
        leakTest[index].country = 'Error';
        leakTest[index].ip = 'Error';
        leakTest[index].org = 'Error';
        completedTests.value++;
        reject(error);
      });
  });
};

// DNS 泄露测试 2
const fetchLeakTestSfSharkCom = (index, key) => {
  return new Promise((resolve, reject) => {
    const urlString = generate14DigitString();
    const url = `https://${urlString}.ipv4.surfsharkdns.com`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const getKey = Object.keys(data)[key];
        const keyEntry = data[getKey];

        if (keyEntry && keyEntry.CountryCode && keyEntry.IP) {
          leakTest[index].country_code = keyEntry.CountryCode;
          leakTest[index].country = getCountryName(keyEntry.CountryCode, lang.value);
          leakTest[index].org = keyEntry.ISP || '';
          leakTest[index].ip = keyEntry.IP;
          completedTests.value++;
          resolve();
        } else {
          throw new Error("Unexpected data structure");
        }
      })
      .catch((error) => {
        console.error("Error fetching leak test data:", error);
        leakTest[index].ip = 'Error';
        leakTest[index].country = 'Error';
        leakTest[index].org = 'Error';
        completedTests.value++;
        reject(error);
      });
  });
};

// DNS 泄露测试 3 - Cloudflare
const fetchLeakTestCloudflare = (index) => {
  return new Promise((resolve, reject) => {
    // Use Cloudflare's trace endpoint for IP detection
    const url = `https://1.1.1.1/cdn-cgi/trace`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        const lines = data.split('\n');
        const ipLine = lines.find(line => line.startsWith('ip='));
        const locLine = lines.find(line => line.startsWith('loc='));
        
        if (ipLine && locLine) {
          const ip = ipLine.split('=')[1];
          const countryCode = locLine.split('=')[1];
          
          leakTest[index].country_code = countryCode;
          leakTest[index].country = getCountryName(countryCode, lang.value);
          leakTest[index].org = 'Cloudflare, Inc.';
          leakTest[index].ip = ip;
          completedTests.value++;
          resolve();
        } else {
          throw new Error("Unexpected data structure");
        }
      })
      .catch((error) => {
        console.error("Error fetching Cloudflare leak test data:", error);
        leakTest[index].country = 'Error';
        leakTest[index].ip = 'Error';
        leakTest[index].org = 'Error';
        completedTests.value++;
        reject(error);
      });
  });
};

// DNS 泄露测试 4 - HTTPBin (通用测试)
const fetchLeakTestHTTPBin = (index) => {
  return new Promise((resolve, reject) => {
    const url = `https://httpbin.org/ip`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.origin) {
          leakTest[index].ip = data.origin;
          leakTest[index].org = 'Generic DNS Service';
          leakTest[index].country_code = 'US'; // Default assumption
          leakTest[index].country = getCountryName('US', lang.value);
          
          completedTests.value++;
          resolve();
        } else {
          throw new Error("Unexpected data structure");
        }
      })
      .catch((error) => {
        console.error("Error fetching HTTPBin leak test data:", error);
        leakTest[index].country = 'Error';
        leakTest[index].ip = 'Error';
        leakTest[index].org = 'Error';
        completedTests.value++;
        reject(error);
      });
  });
};

// 检查所有 DNS 泄露测试
const checkAllDNSLeakTest = async (isRefresh) => {
  isStarted.value = true;
  completedTests.value = 0;
  
  if (isRefresh) {
    trackEvent('DNSTest', 'Start', 'SecureDNSCheck');
    leakTest.forEach((server) => {
      server.country = 'Testing...';
      server.ip = 'Testing...';
      server.country_code = '';
      server.org = 'Testing...';
    });
  }

  // 设置延迟请求函数
  const delayedFetch = (fetchFunction, index, key, delay) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        fetchFunction(index, key).then(resolve).catch(resolve);
      }, delay);
    });
  };

  // 批量请求
  const promises = [
    delayedFetch(fetchLeakTestIpApiCom, 0, null, 100),
    delayedFetch(fetchLeakTestIpApiCom, 1, null, 1200),
    delayedFetch(fetchLeakTestSfSharkCom, 2, 0, 300),
    delayedFetch(fetchLeakTestSfSharkCom, 3, 0, 1500),
    delayedFetch(fetchLeakTestCloudflare, 4, null, 600),
    delayedFetch(fetchLeakTestHTTPBin, 5, null, 900)
  ];

  // 最长等待 10 秒
  const allSettledPromise = Promise.allSettled(promises);
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 10000));

  return Promise.race([allSettledPromise, timeoutPromise]).then(() => {
    // Save test result to history
    if (allTestsComplete.value) {
      const testResult = {
        hasLeaks: hasLeaks.value,
        analysis: leakAnalysis.value,
        tests: leakTest.map(test => ({
          provider: test.provider,
          country: test.country,
          country_code: test.country_code,
          ip: test.ip,
          org: test.org
        }))
      };
      
      saveTestResult(testResult);
      loadTestHistory();
    }
  });
};

const loadTestHistory = () => {
  testHistory.value = getTestHistory();
};

const toggleHistory = () => {
  showHistory.value = !showHistory.value;
  if (showHistory.value) {
    loadTestHistory();
  }
};

onMounted(() => {
  store.setMountingStatus('dnsleaktest', true);
  loadTestHistory();
});

defineExpose({
  checkAllDNSLeakTest,
  leakTest
});
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
  color: var(--primary-blue);
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.test-button {
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
  box-shadow: 0 8px 24px rgba(29, 78, 216, 0.3);
  transition: all 0.3s ease;
}

.test-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(29, 78, 216, 0.4);
}

.test-button.btn-success {
  background: linear-gradient(135deg, var(--success-green) 0%, #10b981 100%);
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
}

.test-button.btn-danger {
  background: linear-gradient(135deg, var(--warning-red) 0%, #ef4444 100%);
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

.results-summary .alert {
  border-radius: 16px;
  border: none;
  padding: 2rem;
}

.dns-result-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  border-width: 2px;
}

.dns-result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.how-it-works {
  padding: 3rem 0;
}

.history-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease-in-out;
}

.history-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.history-details p {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.test-history {
  background: var(--muted);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
}

[data-bs-theme="dark"] .test-history {
  background: oklch(from var(--background) calc(l - 0.02) c h);
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