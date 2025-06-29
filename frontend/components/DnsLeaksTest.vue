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
          <p class="mt-2 text-muted">Testing DNS servers... {{ completedTests }}/4</p>
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
        'alert-danger': hasLeaks
      }" role="alert">
        <div class="d-flex align-items-center">
          <i class="bi fs-3 me-3" :class="hasLeaks ? 'bi-shield-exclamation' : 'bi-shield-check'"></i>
          <div>
            <h4 class="alert-heading mb-2">
              {{ hasLeaks ? '⚠️ DNS Leak Detected!' : '✅ No DNS Leaks Found' }}
            </h4>
            <p class="mb-0">
              {{ hasLeaks ? 
                'Your DNS queries are being exposed. Your real IP and location may be visible. We recommend using a trusted VPN service.' :
                'Congratulations! Your DNS queries are properly secured. No leaks detected.' 
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Results -->
    <div class="row">
      <div v-for="(test, index) in leakTest" :key="test.id" class="col-lg-6 col-md-6 col-12 mb-4">
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
                DNS Server {{ index + 1 }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useMainStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { trackEvent } from '@/utils/use-analytics';
import countryLookup from 'country-code-lookup';
import getCountryName from '@/utils/country-name.js';

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
  { ...createDefaultCard(), id: "ipapi1" },
  { ...createDefaultCard(), id: "ipapi2" },
  { ...createDefaultCard(), id: "sfshark1" },
  { ...createDefaultCard(), id: "sfshark2" },
]);

const isStarted = ref(false);
const completedTests = ref(0);

const progressPercentage = computed(() => (completedTests.value / 4) * 100);

const allTestsComplete = computed(() => completedTests.value === 4);

const hasLeaks = computed(() => {
  if (!allTestsComplete.value) return false;
  const uniqueCountries = new Set(leakTest.map(test => test.country_code).filter(code => code));
  return uniqueCountries.size > 1;
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
          leakTest[index].country_code = countryLookup.byCountry(geoSplit[0]).iso2;
          leakTest[index].country = getCountryName(leakTest[index].country_code, lang.value);
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
    delayedFetch(fetchLeakTestIpApiCom, 1, null, 1000),
    delayedFetch(fetchLeakTestSfSharkCom, 2, 0, 100),
    delayedFetch(fetchLeakTestSfSharkCom, 3, 0, 1000)
  ];

  // 最长等待 10 秒
  const allSettledPromise = Promise.allSettled(promises);
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 10000));

  return Promise.race([allSettledPromise, timeoutPromise]);
};

onMounted(() => {
  store.setMountingStatus('dnsleaktest', true);
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