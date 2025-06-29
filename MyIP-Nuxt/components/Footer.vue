<template>
  <footer class="mt-5 py-4 border-top">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-8">
          <p class="mb-0 text-muted">
            {{ t('footer.Copyright') }} | {{ t('footer.Built') }}
          </p>
        </div>
        <div class="col-md-4 text-md-end">
          <div class="footer-links">
            <a href="#" class="text-muted text-decoration-none me-3" @click.prevent="openAbout">
              {{ t('footer.About') }}
            </a>
            <a href="#" class="text-muted text-decoration-none me-3" @click.prevent="openPrivacy">
              {{ t('footer.Privacy') }}
            </a>
            <a href="#" class="text-muted text-decoration-none" @click.prevent="openContact">
              {{ t('footer.Contact') }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- About Modal -->
    <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true"
         :data-bs-theme="isDarkMode ? 'dark' : 'light'">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="aboutModalLabel">About SecureDNSCheck</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <h6>What is SecureDNSCheck?</h6>
            <p>SecureDNSCheck is a free tool that helps you detect DNS leaks when using VPN services. DNS leaks can expose your real IP address and location, compromising your online privacy.</p>
            
            <h6>How does it work?</h6>
            <p>We test your DNS queries against multiple servers and compare the results. If we detect that your DNS requests are going to different locations than your VPN tunnel, we'll alert you to the potential leak.</p>
            
            <h6>Why is this important?</h6>
            <p>Even when using a VPN, your DNS queries might still be handled by your ISP's servers, revealing your browsing activity and real location. Our tool helps ensure your VPN is properly configured.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Privacy Modal -->
    <div class="modal fade" id="privacyModal" tabindex="-1" aria-labelledby="privacyModalLabel" aria-hidden="true"
         :data-bs-theme="isDarkMode ? 'dark' : 'light'">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="privacyModalLabel">Privacy Policy</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <h6>Data Collection</h6>
            <p>We do not store any personal information or test results. All DNS leak tests are performed client-side in your browser.</p>
            
            <h6>Analytics</h6>
            <p>We use Google Analytics to understand how users interact with our tool. This helps us improve the service. No personally identifiable information is collected.</p>
            
            <h6>Third-party Services</h6>
            <p>Our DNS leak tests use external services (ip-api.com and surfsharkdns.com) to detect leaks. Please refer to their privacy policies for more information.</p>
            
            <h6>Cookies</h6>
            <p>We use minimal cookies for analytics purposes only. No tracking cookies are used.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <div class="modal fade" id="contactModal" tabindex="-1" aria-labelledby="contactModalLabel" aria-hidden="true"
         :data-bs-theme="isDarkMode ? 'dark' : 'light'">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="contactModalLabel">Contact Us</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Have questions or feedback about SecureDNSCheck?</p>
            <p><strong>Email:</strong> contact@securednscheck.com</p>
            <p><strong>Support:</strong> support@securednscheck.com</p>
            <p>We typically respond within 24 hours.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

// 使用Nuxt composables
const store = useMainStore();

// 简单的翻译函数
const t = (key) => {
  const translations = {
    'footer.Copyright': '© 2024 SecureDNSCheck',
    'footer.Built': 'Built with Vue & Nuxt',
    'footer.About': 'About',
    'footer.Privacy': 'Privacy',
    'footer.Contact': 'Contact'
  };
  return translations[key] || key;
};
const isDarkMode = computed(() => store.isDarkMode);

const openAbout = () => {
  if (process.client && window.bootstrap) {
    const modal = new window.bootstrap.Modal(document.getElementById('aboutModal'));
    modal.show();
  }
};

const openPrivacy = () => {
  if (process.client && window.bootstrap) {
    const modal = new window.bootstrap.Modal(document.getElementById('privacyModal'));
    modal.show();
  }
};

const openContact = () => {
  if (process.client && window.bootstrap) {
    const modal = new window.bootstrap.Modal(document.getElementById('contactModal'));
    modal.show();
  }
};
</script>

<style scoped>
footer {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-color);
}

[data-bs-theme="dark"] footer {
  background: rgba(31, 41, 55, 0.8);
}

.footer-links a:hover {
  color: var(--primary-blue) !important;
}
</style>