import { ref, reactive, computed, onMounted } from 'vue';
import countryLookup from 'country-code-lookup';
import getCountryName from '~/utils/country-name.js';
import { saveTestResult, getTestHistory, formatTestDate } from '~/utils/test-history.js';
// import { trackEvent } from '~/utils/use-analytics' // 暂时移除analytics;

export function useDnsLeakTest() {
  const store = useMainStore();
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
    { ...createDefaultCard(), id: "ipapi3", provider: "IP-API.com" },
    { ...createDefaultCard(), id: "sfshark1", provider: "SurfShark" },
    { ...createDefaultCard(), id: "sfshark2", provider: "SurfShark" },
    { ...createDefaultCard(), id: "sfshark3", provider: "SurfShark" },
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

  const isTestComplete = (test) => test.ip !== 'Testing...' && test.ip !== 'Error';

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

  const generate32DigitString = () => {
    // Generate exactly 32 alphanumeric characters (a-z, 0-9) for IP-API.com EDNS
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({length: 32}, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };

  const generate14DigitString = () => {
    const fixedString = "sdns";
    const randomString = Math.random().toString(36).substring(2, 11);
    return fixedString + randomString;
  };

  const fetchLeakTestIpApiCom = (index) => {
    return new Promise((resolve, reject) => {
      const urlString = generate32DigitString();
      const url = `http://${urlString}.edns.ip-api.com/json`;

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
          console.error("Error fetching IP-API leak test data:", error);
          leakTest[index].country = 'Error';
          leakTest[index].ip = 'Error';
          leakTest[index].org = 'Error';
          completedTests.value++;
          reject(error);
        });
    });
  };

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
          console.error("Error fetching SurfShark leak test data:", error);
          leakTest[index].ip = 'Error';
          leakTest[index].country = 'Error';
          leakTest[index].org = 'Error';
          completedTests.value++;
          reject(error);
        });
    });
  };

  const checkAllDNSLeakTest = async (isRefresh) => {
    isStarted.value = true;
    completedTests.value = 0;

    if (isRefresh) {
      // trackEvent('DNSTest', 'Start', 'SecureDNSCheck'); // 暂时移除analytics
      leakTest.forEach(server => Object.assign(server, createDefaultCard()));
    }

    const delayedFetch = (fetchFunction, index, key, delay) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          fetchFunction(index, key).then(resolve).catch(resolve);
        }, delay);
      });
    };

    const promises = [
      delayedFetch(fetchLeakTestIpApiCom, 0, null, 100),
      delayedFetch(fetchLeakTestIpApiCom, 1, null, 1200),
      delayedFetch(fetchLeakTestIpApiCom, 2, null, 2000),
      delayedFetch(fetchLeakTestSfSharkCom, 3, 0, 300),
      delayedFetch(fetchLeakTestSfSharkCom, 4, 0, 1500),
      delayedFetch(fetchLeakTestSfSharkCom, 5, 0, 2500)
    ];

    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 10000));
    await Promise.race([Promise.allSettled(promises), timeoutPromise]);

    if (allTestsComplete.value) {
      const testResult = {
        hasLeaks: hasLeaks.value,
        analysis: leakAnalysis.value,
        tests: leakTest.map(test => ({ ...test }))
      };
      saveTestResult(testResult);
      loadTestHistory();
    }
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
  
  const initializeDnsTest = () => {
      loadTestHistory();
  };

  return {
    leakTest,
    isStarted,
    completedTests,
    testHistory,
    showHistory,
    progressPercentage,
    allTestsComplete,
    hasLeaks,
    leakAnalysis,
    securityRecommendations,
    getButtonText,
    checkAllDNSLeakTest,
    isTestComplete,
    isTestLeaking,
    getTestStatus,
    toggleHistory,
    initializeDnsTest,
    formatTestDate
  };
}